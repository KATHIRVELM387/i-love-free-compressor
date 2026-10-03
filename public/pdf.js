// A small image-only PDF writer: uncompressed page commands and JPEG image streams.
// Objects, cross-reference offsets, and stream lengths are measured in bytes.
export function imagesToPdf(images, { paper = 'a4', landscape = false } = {}) {
  const sizes = { a4: [595.28, 841.89], letter: [612, 792] };
  if (!sizes[paper] || !images.length || images.length > 20) throw new Error('Choose 1–20 photos and A4 or Letter paper.');
  const [pageWidth, pageHeight] = landscape ? [...sizes[paper]].reverse() : sizes[paper];
  const parts = [];
  const offsets = [0];
  let length = 0;
  function append(value) {
    const part = value instanceof Blob ? value : new Blob([value]);
    parts.push(part); length += part.size;
  }
  function object(id, content) {
    offsets[id] = length;
    append(`${id} 0 obj\n`);
    for (const part of content) append(part);
    append('\nendobj\n');
  }
  append('%PDF-1.4\n');
  append(new Uint8Array([37, 226, 227, 207, 211, 10]));
  object(1, ['<< /Type /Catalog /Pages 2 0 R >>']);
  object(2, [`<< /Type /Pages /Count ${images.length} /Kids [${images.map((_, i) => `${3 + i * 3} 0 R`).join(' ')}] >>`]);
  for (const [index, { blob, width, height }] of images.entries()) {
    if (!(blob instanceof Blob) || blob.type !== 'image/jpeg' || !Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > 4096 || height > 4096) throw new Error('PDF pages require valid JPG images.');
    const id = 3 + index * 3;
    const scale = Math.min((pageWidth - 48) / width, (pageHeight - 48) / height);
    const w = width * scale, h = height * scale;
    const n = number => number.toFixed(3);
    const commands = `q\n${n(w)} 0 0 ${n(h)} ${n((pageWidth - w) / 2)} ${n((pageHeight - h) / 2)} cm\n/Photo Do\nQ\n`;
    object(id, [`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Photo ${id + 1} 0 R >> >> /Contents ${id + 2} 0 R >>`]);
    object(id + 1, [`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${blob.size} >>\nstream\n`, blob, '\nendstream']);
    object(id + 2, [`<< /Length ${new Blob([commands]).size} >>\nstream\n${commands}endstream`]);
  }
  const start = length;
  append(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);
  for (const offset of offsets.slice(1)) append(`${String(offset).padStart(10, '0')} 00000 n \n`);
  append(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`);
  return new Blob(parts, { type: 'application/pdf' });
}
