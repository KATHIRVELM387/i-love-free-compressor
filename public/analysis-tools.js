import { fitDimensions } from './image-tools.js?v=6';

export async function openPhoto(file) {
  if (!file || file.size > 25_000_000) throw new Error('Choose a photo up to 25 MB.');
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const type = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff ? 'image/jpeg'
    : [137,80,78,71,13,10,26,10].every((v,i) => bytes[i] === v) ? 'image/png'
    : new TextDecoder().decode(bytes.slice(0,4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8,12)) === 'WEBP' ? 'image/webp' : null;
  if (!type) throw new Error('Choose a valid JPG, PNG, or WebP photo.');
  let image, url;
  try {
    if ('createImageBitmap' in window) image = await createImageBitmap(file);
    else { url = URL.createObjectURL(file); image = new Image(); image.src = url; await image.decode(); }
    const width = image.naturalWidth || image.width, height = image.naturalHeight || image.height;
    if (!width || !height || width * height > 40_000_000) throw new Error('Choose a photo with no more than 40 million pixels.');
    return { image, width, height, type, close() { image.close?.(); if (url) URL.revokeObjectURL(url); } };
  } catch (error) {
    image?.close?.(); if (url) URL.revokeObjectURL(url);
    throw new Error(error.message.includes('40 million') ? error.message : 'This photo could not be opened. Try another image.');
  }
}

export function drawContained(canvas, image, width = 720, height = 480, fixed = false) {
  const w = image.naturalWidth || image.width, h = image.naturalHeight || image.height;
  const scale = Math.min(1, width / w, height / h);
  canvas.width = fixed ? width : Math.max(1, Math.round(w * scale));
  canvas.height = fixed ? height : Math.max(1, Math.round(h * scale));
  const ctx = canvas.getContext('2d');
  const fit = fixed ? Math.min(width / w, height / h) : scale;
  ctx.drawImage(image, (canvas.width - w * fit) / 2, (canvas.height - h * fit) / 2, w * fit, h * fit);
}

export function extractPalette(source, count = 6) {
  if (![4,6,8].includes(count)) throw new Error('Choose 4, 6, or 8 colors.');
  const canvas = document.createElement('canvas');
  drawContained(canvas, source, 128, 128);
  const data = canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
  const buckets = new Map();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const key = (data[i] >> 5) * 64 + (data[i + 1] >> 5) * 8 + (data[i + 2] >> 5);
    const bucket = buckets.get(key) || { total: 0, rgb: [0,0,0] };
    bucket.total++;
    for (let c = 0; c < 3; c++) bucket.rgb[c] += data[i + c];
    buckets.set(key, bucket);
  }
  canvas.width = canvas.height = 1;
  const candidates = [...buckets.values()].sort((a,b) => b.total - a.total).map(b => b.rgb.map(v => Math.round(v / b.total)));
  const selected = [];
  for (const rgb of candidates) {
    if (selected.every(other => rgb.reduce((sum,v,i) => sum + (v - other[i]) ** 2, 0) >= 1600)) selected.push(rgb);
    if (selected.length === count) break;
  }
  return selected.map(rgb => ({ rgb, hex: '#' + rgb.map(v => v.toString(16).padStart(2,'0')).join('').toUpperCase() }));
}

export function splitLayout(width, height, rows, columns) {
  if (![width,height].every(v => Number.isInteger(v) && v > 0) || ![rows,columns].every(v => Number.isInteger(v) && v >= 1 && v <= 6)) throw new Error('Choose between 1 and 6 rows and columns.');
  const size = fitDimensions(width,height);
  if (rows > size.height || columns > size.width) throw new Error('This photo is too small for that grid. Choose fewer rows or columns.');
  const tiles = [];
  for (let row = 0; row < rows; row++) for (let column = 0; column < columns; column++) {
    const x = Math.floor(column * size.width / columns), y = Math.floor(row * size.height / rows);
    tiles.push({ row, column, x, y, width: Math.floor((column + 1) * size.width / columns) - x, height: Math.floor((row + 1) * size.height / rows) - y });
  }
  return { ...size, tiles };
}

export async function hasTransparency(photo, cancelled = () => false) {
  // Scan every original pixel in small strips, without allocating a full-size canvas.
  const canvas = document.createElement('canvas');
  try {
    for (let y = 0; y < photo.height; y += 128) {
      if (cancelled()) return null;
      for (let x = 0; x < photo.width; x += 2048) {
        canvas.width = Math.min(2048, photo.width - x); canvas.height = Math.min(128, photo.height - y);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(photo.image, x,y,canvas.width,canvas.height,0,0,canvas.width,canvas.height);
        const pixels = ctx.getImageData(0,0,canvas.width,canvas.height).data;
        for (let i = 3; i < pixels.length; i += 4) if (pixels[i] < 255) return true;
      }
      await new Promise(resolve => setTimeout(resolve,0));
    }
    return false;
  } finally { canvas.width = canvas.height = 1; }
}

export function canvasBlob(canvas) {
  return new Promise((resolve,reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not create the image. Please try again.')), 'image/png'));
}
