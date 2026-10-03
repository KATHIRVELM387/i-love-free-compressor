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

export async function prepareImage(source, { width, height, type, target, allowResize, sizeMode = 'maximum' }) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > MAX_EDGE || height > MAX_EDGE || width * height > MAX_PIXELS) {
    throw new Error('Use dimensions from 1 to 4,096 pixels, with at most 16 million pixels in total.');
  }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(type)) throw new Error('Choose JPG, PNG, or WebP.');
  if (target !== null && (!Number.isInteger(target) || target < 1000 || target > 25_000_000)) throw new Error('Enter a whole-number size from 1 to 25,000 KB, or leave it blank.');
  if (!['maximum', 'exact'].includes(sizeMode)) throw new Error('Choose a valid file-size mode.');
  if (sizeMode === 'exact' && (type !== 'image/jpeg' || target === null)) throw new Error('Exact size requires a target in KB and JPG output.');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser does not support image processing.');
  let blob;
  try {
    for (let attempt = 0; attempt < 24; attempt++) {
      canvas.width = width;
      canvas.height = height;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      if (type === 'image/jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, width, height); }
      ctx.drawImage(source, 0, 0, width, height);
      const maxQuality = sizeMode === 'exact' ? 1 : .94;
      blob = await encode(canvas, type, maxQuality);
      if (!target || blob.size <= target) break;
      if (type !== 'image/png') {
        const smallest = await encode(canvas, type, .08);
        if (smallest.size <= target) {
          blob = smallest;
          let low = .08;
          let high = maxQuality;
          for (let step = 0; step < 9; step++) {
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
    if (sizeMode === 'exact' && blob.size < target) {
      paddedBytes = target - blob.size;
      blob = await padJpegToSize(blob, target);
    }
    return { blob, width, height, paddedBytes, meetsTarget: sizeMode === 'exact' ? blob.size === target : !target || blob.size <= target };
  } finally {
    canvas.width = canvas.height = 1;
  }
}
