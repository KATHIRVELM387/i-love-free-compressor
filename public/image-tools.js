import { applyEffects } from './effects.js?v=1';

export const MAX_PIXELS = 16_000_000;
export const MAX_EDGE = 4096;

export function fitDimensions(width, height) {
  const scale = Math.min(1, MAX_EDGE / width, MAX_EDGE / height, Math.sqrt(MAX_PIXELS / (width * height)));
  return { width: Math.max(1, Math.floor(width * scale)), height: Math.max(1, Math.floor(height * scale)) };
}

export function formatBytes(bytes) {
  return bytes < 1_000_000 ? `${(bytes / 1000).toFixed(1)} KB` : `${(bytes / 1_000_000).toFixed(2)} MB`;
}

function encode(canvas, type, quality) {
  if (typeof canvas.convertToBlob === 'function') return canvas.convertToBlob({ type, quality }).then(blob => {
    if (blob.type !== type) throw new Error('Your browser cannot save this format. Please choose JPG or PNG.');
    return blob;
  });
  return new Promise((resolve, reject) => canvas.toBlob(blob => {
    if (!blob) reject(new Error('This browser could not create the image. Try smaller dimensions.'));
    else if (blob.type !== type) reject(new Error('Your browser cannot save this format. Please choose JPG or PNG.'));
    else resolve(blob);
  }, type, quality));
}

// JPEG T.81 B.1.1.2 permits FF fill bytes before markers. COM segments
// hold non-image data; inserting them before EOI leaves encoded pixels intact.
// Reference: https://www.w3.org/Graphics/JPEG/itu-t81.pdf
export async function padJpegToSize(blob, target) {
  if (blob.type !== 'image/jpeg' || !Number.isInteger(target) || target < blob.size || target > 25_000_000) {
    throw new Error('Exact file size needs a JPG and a target no smaller than the encoded image.');
  }
  if (target === blob.size) return blob;
  const start = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
  const end = new Uint8Array(await blob.slice(-2).arrayBuffer());
  if (start[0] !== 0xff || start[1] !== 0xd8 || end[0] !== 0xff || end[1] !== 0xd9) {
    throw new Error('The encoded JPG could not be prepared at an exact size.');
  }
  const padding = new Uint8Array(target - blob.size).fill(0x20);
  let offset = 0;
  while (padding.length - offset >= 4) {
    const length = Math.min(65_537, padding.length - offset);
    padding[offset] = 0xff;
    padding[offset + 1] = 0xfe;
    padding[offset + 2] = (length - 2) >> 8;
    padding[offset + 3] = (length - 2) & 0xff;
    offset += length;
  }
  padding.fill(0xff, offset);
  return new Blob([blob.slice(0, -2), padding, blob.slice(-2)], { type: 'image/jpeg' });
}

export function getCropRect(source, { rotation = 0, cropRatio = 0, cropZoom = 1, cropX = .5, cropY = .5 } = {}) {
  if (![0, 90, 180, 270].includes(rotation)) throw new Error('Choose a rotation in 90-degree steps.');
  if (!Number.isFinite(cropRatio) || cropRatio < 0 || cropRatio > 20 ||
      !Number.isFinite(cropZoom) || cropZoom < 1 || cropZoom > 3 ||
      !Number.isFinite(cropX) || cropX < 0 || cropX > 1 ||
      !Number.isFinite(cropY) || cropY < 0 || cropY > 1) throw new Error('Choose a valid crop and framing position.');
  const sw = source.naturalWidth || source.width;
  const sh = source.naturalHeight || source.height;
  const fullWidth = rotation % 180 ? sh : sw;
  const fullHeight = rotation % 180 ? sw : sh;
  const ratio = cropRatio || fullWidth / fullHeight;
  const width = Math.min(fullWidth, fullHeight * ratio) / cropZoom;
  const height = width / ratio;
  return { x: (fullWidth - width) * cropX, y: (fullHeight - height) * cropY, width, height, fullWidth, fullHeight };
}

// Crop coordinates and flips use the displayed axes after rotation.
export function drawTransformed(ctx, source, width, height, edits = {}) {
  const { rotation = 0, flipX = false, flipY = false, brightness = 0, contrast = 0, grayscale = false } = edits;
  if (![brightness, contrast].every(value => Number.isFinite(value) && value >= -100 && value <= 100)) throw new Error('Use brightness and contrast between -100 and 100.');
  const crop = getCropRect(source, edits);
  const sw = source.naturalWidth || source.width;
  const sh = source.naturalHeight || source.height;
  ctx.save();
  ctx.scale(width / crop.width, height / crop.height);
  ctx.translate(crop.fullWidth / 2 - crop.x, crop.fullHeight / 2 - crop.y);
  ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
  ctx.rotate(rotation * Math.PI / 180);
  ctx.drawImage(source, -sw / 2, -sh / 2, sw, sh);
  ctx.restore();
  // Pixel adjustments also work in browsers without canvas filter support.
  if (brightness || contrast || grayscale) {
    const pixels = ctx.getImageData(0, 0, width, height);
    const data = pixels.data;
    const gain = 1 + contrast / 100;
    const lift = brightness * 2.55;
    for (let i = 0; i < data.length; i += 4) {
      for (let channel = 0; channel < 3; channel++) data[i + channel] = (data[i + channel] - 128) * gain + 128 + lift;
      if (grayscale) {
        const gray = Math.round(data[i] * .2126 + data[i + 1] * .7152 + data[i + 2] * .0722);
        data[i] = data[i + 1] = data[i + 2] = gray;
      }
    }
    ctx.putImageData(pixels, 0, 0);
  }
}

export function downloadName(name, fallback, extension) {
  let stem = String(name).trim() || fallback;
  stem = Array.from(stem.replace(/\.(jpe?g|png|webp)$/i, '').replace(/[\\/<>:"|?*\u0000-\u001f\u007f]/g, '_')).slice(0, 100).join('').replace(/^[. ]+|[. ]+$/g, '');
  if (!stem) stem = 'photo';
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(stem)) stem = `photo-${stem}`;
  return `${stem}.${extension}`;
}

// Decorations are rendered in output coordinates after photo edits, so text
// stays upright and backgrounds are not affected by brightness or grayscale.
export function renderImage(ctx, source, width, height, { type = 'image/png', background = null, watermarkText = '', watermarkColor = '#ffffff', watermarkPosition = 'bottom-right', watermarkSize = 6, watermarkOpacity = .65, ...edits } = {}) {
  if (background !== null && !/^#[0-9a-f]{6}$/i.test(background)) throw new Error('Choose a valid background color.');
  if (typeof watermarkText !== 'string' || watermarkText.length > 80 || !/^#[0-9a-f]{6}$/i.test(watermarkColor) ||
      !['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'].includes(watermarkPosition) ||
      !Number.isFinite(watermarkSize) || watermarkSize < 2 || watermarkSize > 15 ||
      !Number.isFinite(watermarkOpacity) || watermarkOpacity < 0 || watermarkOpacity > 1) throw new Error('Choose valid watermark text, color, size, opacity, and position.');
  drawTransformed(ctx, source, width, height, edits);
  applyEffects(ctx, width, height, edits);
  const fill = background || (type === 'image/jpeg' ? '#ffffff' : null);
  if (fill) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = fill; ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
  const text = watermarkText.replace(/\s+/g, ' ').trim();
  if (!text || !watermarkOpacity) return;
  ctx.save();
  const margin = Math.min(width, height) * .05;
  let fontSize = Math.min(width, height) * watermarkSize / 100;
  ctx.font = `600 ${fontSize}px sans-serif`;
  const measured = ctx.measureText(text).width;
  if (measured > width - margin * 2) fontSize *= (width - margin * 2) / measured;
  ctx.font = `600 ${fontSize}px sans-serif`;
  ctx.globalAlpha = watermarkOpacity;
  ctx.fillStyle = watermarkColor;
  ctx.textBaseline = 'middle';
  ctx.direction = 'ltr';
  ctx.textAlign = watermarkPosition === 'center' ? 'center' : watermarkPosition.endsWith('right') ? 'right' : 'left';
  const x = watermarkPosition === 'center' ? width / 2 : watermarkPosition.endsWith('right') ? width - margin : margin;
  const y = watermarkPosition === 'center' ? height / 2 : watermarkPosition.startsWith('top') ? margin + fontSize / 2 : height - margin - fontSize / 2;
  ctx.fillText(text, x, y);
  ctx.restore();
}

export async function prepareImage(source, { width, height, type, target, allowResize, sizeMode = 'maximum', check = () => {}, ...edits }) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > MAX_EDGE || height > MAX_EDGE || width * height > MAX_PIXELS) {
    throw new Error('Use dimensions from 1 to 4,096 pixels, with at most 16 million pixels in total.');
  }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(type)) throw new Error('Choose JPG, PNG, or WebP.');
  if (target !== null && (!Number.isInteger(target) || target < 1000 || target > 25_000_000)) throw new Error('Enter a whole-number size from 1 to 25,000 KB, or leave it blank.');
  if (!['maximum', 'exact'].includes(sizeMode)) throw new Error('Choose a valid file-size mode.');
  if (sizeMode === 'exact' && (type !== 'image/jpeg' || target === null)) throw new Error('Exact size requires a target in KB and JPG output.');
  check();
  const canvas = typeof document === 'undefined' ? new OffscreenCanvas(width, height) : document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser does not support image processing.');
  let blob;
  try {
    for (let attempt = 0; attempt < 24; attempt++) {
      check();
      canvas.width = width;
      canvas.height = height;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      renderImage(ctx, source, width, height, { ...edits, type });
      const maxQuality = sizeMode === 'exact' ? 1 : .94;
      blob = await encode(canvas, type, maxQuality);
      check();
      if (!target || blob.size <= target) break;
      if (type !== 'image/png') {
        const smallest = await encode(canvas, type, .08);
        if (smallest.size <= target) {
          blob = smallest;
          let low = .08;
          let high = maxQuality;
          for (let step = 0; step < 9; step++) {
            check();
            const quality = (low + high) / 2;
            const candidate = await encode(canvas, type, quality);
            if (candidate.size <= target) { blob = candidate; low = quality; }
            else high = quality;
          }
          break;
        }
        blob = smallest;
      }
      if (!allowResize || (width === 1 && height === 1) || attempt === 23) break;
      const factor = Math.min(.85, Math.max(.25, Math.sqrt(target / blob.size) * .9));
      width = Math.max(1, Math.floor(width * factor));
      height = Math.max(1, Math.floor(height * factor));
    }
    let paddedBytes = 0;
    check();
    if (sizeMode === 'exact' && blob.size < target) {
      paddedBytes = target - blob.size;
      blob = await padJpegToSize(blob, target);
    }
    return { blob, width, height, paddedBytes, meetsTarget: sizeMode === 'exact' ? blob.size === target : !target || blob.size <= target };
  } finally {
    canvas.width = canvas.height = 1;
  }
}
