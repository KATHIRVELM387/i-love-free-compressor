// Effects use output-relative measurements so previews and exports agree.
export function applyEffects(ctx, width, height, {
  filter = 'none', filterStrength = 100, frameSize = 0, frameColor = '#ffffff',
  cornerRadius = 0, pixelSize = 0
} = {}) {
  if (!['none', 'sepia', 'warm', 'cool', 'invert'].includes(filter) ||
      !Number.isFinite(filterStrength) || filterStrength < 0 || filterStrength > 100 ||
      !Number.isFinite(frameSize) || frameSize < 0 || frameSize > 20 ||
      !Number.isFinite(cornerRadius) || cornerRadius < 0 || cornerRadius > 50 ||
      !Number.isFinite(pixelSize) || pixelSize < 0 || pixelSize > 20 ||
      !/^#[0-9a-f]{6}$/i.test(frameColor)) throw new Error('Choose valid effect settings.');
  if (filter !== 'none' && filterStrength) {
    const pixels = ctx.getImageData(0, 0, width, height);
    const data = pixels.data, mix = filterStrength / 100;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const next = filter === 'sepia' ? [r * .393 + g * .769 + b * .189, r * .349 + g * .686 + b * .168, r * .272 + g * .534 + b * .131]
        : filter === 'warm' ? [r + 30, g + 8, b - 20]
        : filter === 'cool' ? [r - 20, g + 8, b + 30] : [255 - r, 255 - g, 255 - b];
      for (let channel = 0; channel < 3; channel++) data[i + channel] += (Math.max(0, Math.min(255, next[channel])) - data[i + channel]) * mix;
    }
    ctx.putImageData(pixels, 0, 0);
  }
  if (pixelSize) {
    const small = document.createElement('canvas');
    const block = Math.max(1, Math.min(width, height) * pixelSize / 100);
    small.width = Math.max(1, Math.round(width / block));
    small.height = Math.max(1, Math.round(height / block));
    small.getContext('2d').drawImage(ctx.canvas, 0, 0, small.width, small.height);
    ctx.save(); ctx.clearRect(0, 0, width, height); ctx.imageSmoothingEnabled = false;
    ctx.drawImage(small, 0, 0, width, height); ctx.restore();
    small.width = small.height = 1;
  }
  if (frameSize) {
    const size = Math.min(width, height) * frameSize / 100;
    ctx.save(); ctx.fillStyle = frameColor;
    ctx.fillRect(0, 0, width, size); ctx.fillRect(0, height - size, width, size);
    ctx.fillRect(0, size, size, height - size * 2); ctx.fillRect(width - size, size, size, height - size * 2);
    ctx.restore();
  }
  if (cornerRadius) {
    const r = Math.min(width, height) * cornerRadius / 100;
    ctx.save(); ctx.globalCompositeOperation = 'destination-in'; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.moveTo(r, 0); ctx.lineTo(width - r, 0);
    ctx.quadraticCurveTo(width, 0, width, r); ctx.lineTo(width, height - r);
    ctx.quadraticCurveTo(width, height, width - r, height); ctx.lineTo(r, height);
    ctx.quadraticCurveTo(0, height, 0, height - r); ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0); ctx.closePath(); ctx.fill(); ctx.restore();
  }
}
