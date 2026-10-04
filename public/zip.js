// ZIP "store" entries: images are already compressed, so no extra codec is needed.
const crcTable = Uint32Array.from({ length: 256 }, (_, value) => {
  for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0);
  return value >>> 0;
});

export async function makeZip(files, { check = () => {}, progress = () => {} } = {}) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  let centralSize = 0;
  for (const file of files) {
    check();
    progress(file.name);
    const name = new TextEncoder().encode(file.name);
    const data = new Uint8Array(await file.blob.arrayBuffer());
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++) {
      crc = crcTable[(crc ^ data[i]) & 255] ^ (crc >>> 8);
      if (i && i % 1048576 === 0) { check(); await new Promise(resolve => setTimeout(resolve, 0)); }
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    const header = new Uint8Array(30 + name.length);
    const h = new DataView(header.buffer);
    h.setUint32(0, 0x04034b50, true);
    h.setUint16(4, 20, true);
    h.setUint16(6, 0x0800, true); // UTF-8 names.
    h.setUint16(12, 33, true); // 1980-01-01; no source metadata.
    h.setUint32(14, crc, true);
    h.setUint32(18, data.length, true);
    h.setUint32(22, data.length, true);
    h.setUint16(26, name.length, true);
    header.set(name, 30);
    localParts.push(header, file.blob);

    const central = new Uint8Array(46 + name.length);
    const c = new DataView(central.buffer);
    c.setUint32(0, 0x02014b50, true);
    c.setUint16(4, 20, true);
    central.set(header.subarray(4, 30), 6);
    c.setUint32(42, offset, true);
    central.set(name, 46);
    centralParts.push(central);
    offset += header.length + data.length;
    centralSize += central.length;
  }
  const end = new Uint8Array(22);
  const e = new DataView(end.buffer);
  e.setUint32(0, 0x06054b50, true);
  e.setUint16(8, files.length, true);
  e.setUint16(10, files.length, true);
  e.setUint32(12, centralSize, true);
  e.setUint32(16, offset, true);
  check();
  return new Blob([...localParts, ...centralParts, end], { type: 'application/zip' });
}
