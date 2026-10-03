import { fitDimensions, formatBytes, prepareImage, renderImage, getCropRect, downloadName } from './image-tools.js?v=5';
import { startNavigation, TOOLS } from './navigation.js?v=6';

const $ = id => document.getElementById(id);
const fileInput = $('file-input');
let source = null;
let originalFile = null;
let originalURL = null;
let resultURL = null;
let generation = 0;
let busy = false;
let currentTool = null;
const defaultEdits = () => ({ rotation: 0, flipX: false, flipY: false, cropRatio: 0, cropZoom: 1, cropX: .5, cropY: .5, brightness: 0, contrast: 0, grayscale: false, background: null, watermarkText: '', watermarkColor: '#ffffff', watermarkPosition: 'bottom-right', watermarkSize: 6, watermarkOpacity: .65 });
let edits = defaultEdits();

function orientedSize() {
  return getCropRect(source, edits);
}

function showEdits() {
  const active = edits.rotation !== 0 || edits.flipX || edits.flipY || edits.cropRatio !== 0 || edits.cropZoom !== 1 || edits.brightness !== 0 || edits.contrast !== 0 || edits.grayscale || edits.background !== null || edits.watermarkText.trim() !== '' || $('format').value === 'image/jpeg';
  $('original-image').hidden = active;
  $('edit-preview').hidden = !active;
  $('preview-label').textContent = active ? 'Edited preview' : 'Original';
  $('flip-horizontal').setAttribute('aria-pressed', String(edits.flipX));
  $('flip-vertical').setAttribute('aria-pressed', String(edits.flipY));
  $('crop-ratio').value = Array.from($('crop-ratio').options).find(option => Math.abs(Number(option.value) - edits.cropRatio) < .000001)?.value || '0';
  for (const [id, value] of [['crop-zoom', edits.cropZoom * 100], ['crop-x', edits.cropX * 100], ['crop-y', edits.cropY * 100], ['brightness', edits.brightness], ['contrast', edits.contrast]]) {
    $(id).value = Math.round(value);
    $(id + '-value').textContent = id.startsWith('crop-') ? `${Math.round(value)}%` : String(Math.round(value));
  }
  $('grayscale').checked = edits.grayscale;
  $('watermark-text').value = edits.watermarkText;
  $('watermark-color').value = edits.watermarkColor;
  $('watermark-position').value = edits.watermarkPosition;
  $('watermark-size').value = edits.watermarkSize;
  $('watermark-size-value').textContent = `${edits.watermarkSize}%`;
  $('watermark-opacity').value = Math.round(edits.watermarkOpacity * 100);
  $('watermark-opacity-value').textContent = `${Math.round(edits.watermarkOpacity * 100)}%`;
  $('background-enabled').checked = edits.background !== null;
  $('background-color').disabled = edits.background === null;
  if (edits.background !== null) $('background-color').value = edits.background;
  if (active) {
    const requested = { width: Number($('width').value), height: Number($('height').value) };
    const size = requested.width >= 1 && requested.width <= 4096 && requested.height >= 1 && requested.height <= 4096 ? requested : orientedSize();
    const scale = Math.min(1, 600 / Math.max(size.width, size.height));
    const canvas = $('edit-preview');
    canvas.width = Math.max(1, Math.round(size.width * scale));
    canvas.height = Math.max(1, Math.round(size.height * scale));
    renderImage(canvas.getContext('2d'), source, canvas.width, canvas.height, { ...edits, type: $('format').value });
  }
}

function rotate(degrees) {
  if (!source || busy) return;
  edits.rotation = (edits.rotation + degrees + 360) % 360;
  [edits.flipX, edits.flipY] = [edits.flipY, edits.flipX];
  if (edits.cropRatio) edits.cropRatio = 1 / edits.cropRatio;
  [edits.cropX, edits.cropY] = degrees > 0 ? [1 - edits.cropY, edits.cropX] : [edits.cropY, 1 - edits.cropX];
  $('dimension-preset').value = '';
  const width = $('width').value;
  $('width').value = $('height').value;
  $('height').value = width;
  showEdits(); clearResult();
  setStatus('Photo rotated. Prepare your photo to save these edits.');
}
$('rotate-left').addEventListener('click', () => rotate(-90));
$('rotate-right').addEventListener('click', () => rotate(90));
for (const [id, key] of [['flip-horizontal', 'flipX'], ['flip-vertical', 'flipY']]) {
  $(id).addEventListener('click', () => {
    if (!source || busy) return;
    edits[key] = !edits[key];
    if (key === 'flipX') edits.cropX = 1 - edits.cropX;
    else edits.cropY = 1 - edits.cropY;
    showEdits(); clearResult();
    setStatus('Photo flipped. Prepare your photo to save these edits.');
  });
}
$('reset-edits').addEventListener('click', () => {
  if (!source || busy) return;
  edits = defaultEdits();
  $('dimension-preset').value = '';
  const size = orientedSize();
  const fitted = fitDimensions(size.width, size.height);
  $('width').value = fitted.width; $('height').value = fitted.height;
  showEdits(); clearResult();
  updateSizeControls();
  setStatus('Photo edits, watermark, background, and dimensions reset. File-size and format settings kept.');
});

for (const [id, key, convert] of [['watermark-text', 'watermarkText', value => value], ['watermark-color', 'watermarkColor', value => value], ['watermark-position', 'watermarkPosition', value => value], ['watermark-size', 'watermarkSize', Number], ['watermark-opacity', 'watermarkOpacity', value => Number(value) / 100]]) {
  $(id).addEventListener('input', () => {
    if (!source || busy) return;
    edits[key] = convert($(id).value);
    showEdits(); clearResult();
    setStatus('Watermark updated. Prepare your photo to include it in the download.');
  });
}
$('remove-watermark').addEventListener('click', () => {
  if (!source || busy) return;
  edits.watermarkText = '';
  showEdits(); clearResult();
  setStatus('Watermark removed. Prepare your photo to update the download.');
});
for (const id of ['background-enabled', 'background-color']) {
  $(id).addEventListener('input', () => {
    if (!source || busy) return;
    edits.background = $('background-enabled').checked ? $('background-color').value : null;
    showEdits(); clearResult(); updateSizeControls();
    setStatus('Background updated. Only transparent areas are filled.');
  });
}

function updateDownloadName() {
  if (!originalFile) return;
  const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[$('format').value];
  const name = downloadName($('output-name').value, `${originalFile.name.replace(/\.[^.]+$/, '') || 'photo'}-ready`, extension);
  $('download').download = name;
  $('download-name-preview').textContent = `Saves as: ${name}`;
}

function fitCropDimensions() {
  const size = orientedSize();
  const fitted = fitDimensions(Math.max(1, Math.round(size.width)), Math.max(1, Math.round(size.height)));
  $('width').value = fitted.width; $('height').value = fitted.height;
}
$('crop-ratio').addEventListener('change', () => {
  if (!source || busy) return;
  edits.cropRatio = Number($('crop-ratio').value);
  edits.cropX = edits.cropY = .5;
  edits.cropZoom = 1;
  $('dimension-preset').value = '';
  $('lock').checked = true;
  fitCropDimensions(); showEdits(); clearResult();
  setStatus('Crop shape changed. Adjust the framing, then prepare your photo.');
});
for (const [id, key, divisor] of [['crop-zoom', 'cropZoom', 100], ['crop-x', 'cropX', 100], ['crop-y', 'cropY', 100], ['brightness', 'brightness', 1], ['contrast', 'contrast', 1]]) {
  $(id).addEventListener('input', () => {
    if (!source || busy) return;
    edits[key] = Number($(id).value) / divisor;
    showEdits(); clearResult();
    setStatus('Preview updated. Prepare your photo to save these edits.');
  });
}
$('grayscale').addEventListener('change', () => {
  if (!source || busy) return;
  edits.grayscale = $('grayscale').checked;
  showEdits(); clearResult();
  setStatus('Color effect updated. Prepare your photo to save it.');
});
$('reset-adjustments').addEventListener('click', () => {
  if (!source || busy) return;
  edits.brightness = edits.contrast = 0; edits.grayscale = false;
  showEdits(); clearResult();
  setStatus('Brightness, contrast, and black & white reset.');
});
$('dimension-preset').addEventListener('change', () => {
  if (!source || busy || !$('dimension-preset').value) return;
  const [width, height] = $('dimension-preset').value.split('x').map(Number);
  edits.cropRatio = width / height;
  edits.cropZoom = 1; edits.cropX = edits.cropY = .5;
  $('width').value = width; $('height').value = height;
  $('lock').checked = true;
  $('auto-resize').checked = false;
  showEdits(); clearResult();
  setStatus('Size preset applied. Check the crop preview and adjust its framing if needed.');
});
document.querySelectorAll('[data-scale]').forEach(button => button.addEventListener('click', () => {
  if (!source || busy) return;
  const size = orientedSize();
  const width = Math.max(1, Math.round(size.width * Number(button.dataset.scale)));
  const height = Math.max(1, Math.round(size.height * Number(button.dataset.scale)));
  const fitted = fitDimensions(width, height);
  $('width').value = fitted.width; $('height').value = fitted.height;
  $('dimension-preset').value = '';
  showEdits();
  clearResult();
  setStatus(fitted.width !== width || fitted.height !== height ? 'Dimensions limited to fit browser processing limits.' : 'Dimensions updated. Prepare your photo to see the result.');
}));

function setStatus(message, error = false) {
  $('status').textContent = message;
  $('status').classList.toggle('error', error);
  $('status').hidden = !message;
}

function clearResult() {
  $('result').hidden = true;
  $('download').removeAttribute('href');
  $('result-image').removeAttribute('src');
  if (resultURL) URL.revokeObjectURL(resultURL);
  resultURL = null;
}

function updatePresets() {
  document.querySelectorAll('[data-size]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.size === $('target').value)));
}

function updateSizeControls() {
  const exact = $('size-mode').value === 'exact';
  $('target').required = exact;
  $('target').placeholder = exact ? 'Enter size in KB' : 'No limit';
  $('target-label').textContent = exact ? 'Target file size' : 'Maximum file size';
  $('target-optional').hidden = exact;
  $('format').disabled = exact;
  if (exact) $('format').value = 'image/jpeg';
  $('size-help').textContent = exact
    ? 'Increase or decrease file size to the KB you choose. Saves as JPG. A bigger file does not improve image quality. 1 KB = 1,000 bytes.'
    : '50 KB means at most 50 KB. A smaller photo can stay smaller.';
  $('format-help').textContent = edits.background !== null
    ? `Transparent areas use your chosen background color${exact ? '. Exact size saves as JPG.' : '.'}`
    : exact
    ? 'Exact-size output uses JPG; transparent areas become white.'
    : $('format').value === 'image/jpeg' ? 'Transparent areas become white in JPG.' : $('format').value === 'image/png' ? (['compress', 'exact'].includes(currentTool) ? 'PNG is lossless. Smaller dimensions may be needed to meet your limit.' : 'PNG is lossless and keeps transparency.') : 'WebP supports transparency and compact image files.';
}

async function decodeImage(file) {
  if ('createImageBitmap' in window) return createImageBitmap(file);
  const url = URL.createObjectURL(file);
  const img = new Image();
  try { img.src = url; await img.decode(); return img; }
  finally { URL.revokeObjectURL(url); }
}

async function loadFile(file) {
  if (!file || busy) return;
  const current = ++generation;
  setStatus('Opening your photo…');
  let decoded;
  try {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Please choose a JPG, PNG, or WebP image.');
    if (file.size > 25_000_000) throw new Error('This photo is larger than 25 MB. Please choose a smaller file.');
    decoded = await decodeImage(file);
    if (current !== generation) { decoded.close?.(); return; }
    const width = decoded.naturalWidth || decoded.width;
    const height = decoded.naturalHeight || decoded.height;
    if (!width || !height || width * height > 40_000_000) throw new Error('Please choose a photo with no more than 40 million pixels.');
    clearResult();
    source?.close?.();
    source = decoded;
    edits = defaultEdits();
    $('dimension-preset').value = '';
    $('edit-controls').disabled = false;
    originalFile = file;
    if (!['compress', 'exact'].includes(currentTool)) $('format').value = file.type;
    $('output-name').value = '';
    if (originalURL) URL.revokeObjectURL(originalURL);
    originalURL = URL.createObjectURL(file);
    $('original-image').src = originalURL;
    $('original-name').textContent = file.name;
    $('original-details').textContent = `${width.toLocaleString()} × ${height.toLocaleString()} px · ${formatBytes(file.size)}`;
    const fitted = fitDimensions(width, height);
    $('width').value = fitted.width;
    $('height').value = fitted.height;
    showEdits(); updateSizeControls(); updateDownloadName();
    $('dropzone').hidden = true;
    $('original-card').hidden = false;
    $('replace').hidden = false;
    $('demo-line').hidden = true;
    $('settings').disabled = false;
    document.querySelector('.settings-footnote').textContent = 'Your original photo stays unchanged.';
    setStatus(fitted.width !== width || fitted.height !== height ? 'Large photo detected. Output dimensions were reduced to fit browser processing limits.' : 'Photo loaded. Set your requirements, then prepare your photo.');
  } catch (error) {
    if (decoded && decoded !== source) decoded.close?.();
    if (current === generation) setStatus(error.message.includes('decode') || error.name === 'InvalidStateError' ? 'This file could not be opened. Please choose a valid JPG, PNG, or WebP image.' : error.message, true);
  } finally { fileInput.value = ''; }
}

$('browse').addEventListener('click', () => fileInput.click());
$('replace').addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => loadFile(fileInput.files[0]));
const photoPanel = document.querySelector('.photo-panel');
photoPanel.addEventListener('dragover', event => { event.preventDefault(); $('dropzone').classList.add('drag-over'); });
photoPanel.addEventListener('dragleave', event => { if (!photoPanel.contains(event.relatedTarget)) $('dropzone').classList.remove('drag-over'); });
photoPanel.addEventListener('drop', event => {
  event.preventDefault();
  $('dropzone').classList.remove('drag-over');
  if (event.dataTransfer.files.length !== 1) { setStatus('Please choose one photo at a time.', true); return; }
  loadFile(event.dataTransfer.files[0]);
});
window.addEventListener('dragover', event => event.preventDefault());
window.addEventListener('drop', event => event.preventDefault());

document.querySelectorAll('[data-size]').forEach(button => button.addEventListener('click', () => {
  $('target').value = button.dataset.size;
  $('target').dispatchEvent(new Event('input', { bubbles: true }));
}));

function syncDimension(changed) {
  $('dimension-preset').value = '';
  if (!$('lock').checked || !source) return;
  const size = orientedSize();
  const ratio = size.width / size.height;
  const value = Number($(changed).value);
  if (!value || value < 1) return;
  $(changed === 'width' ? 'height' : 'width').value = Math.max(1, Math.round(changed === 'width' ? value / ratio : value * ratio));
}
$('width').addEventListener('input', () => syncDimension('width'));
$('height').addEventListener('input', () => syncDimension('height'));
$('lock').addEventListener('change', () => { syncDimension('width'); if (source) showEdits(); clearResult(); });
$('settings-form').addEventListener('input', event => {
  if (event.target.closest('#edit-controls')) return;
  if (event.target.id === 'output-name') { updateDownloadName(); return; }
  clearResult();
  updatePresets();
  updateSizeControls();
  if (source) showEdits();
  updateDownloadName();
  setStatus('Settings changed. Prepare your photo to see the updated result.');
});

$('settings-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (!source || busy || !currentTool || currentTool === 'batch') return;
  busy = true;
  const current = ++generation;
  const requestedWidth = Number($('width').value);
  const requestedHeight = Number($('height').value);
  const target = $('target').value === '' ? null : Number($('target').value) * 1000;
  const type = $('format').value;
  const sizeMode = $('size-mode').value;
  clearResult();
  $('settings').disabled = true;
  $('replace').disabled = true;
  $('edit-controls').disabled = true;
  $('process').textContent = 'Preparing your photo…';
  $('settings-form').setAttribute('aria-busy', 'true');
  setStatus('Preparing your photo on your device…');
  try {
    const result = await prepareImage(source, { width: requestedWidth, height: requestedHeight, target, type, sizeMode, allowResize: $('auto-resize').checked, ...edits });
    if (current !== generation) return;
    resultURL = URL.createObjectURL(result.blob);
    $('result-image').src = resultURL;
    $('download').href = resultURL;
    const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[type];
    updateDownloadName();
    const savings = Math.round((1 - result.blob.size / originalFile.size) * 100);
    $('result-heading').textContent = result.meetsTarget ? 'Ready for the next step.' : 'This needs a little more room.';
    $('result-summary').textContent = `${formatBytes(originalFile.size)} → ${formatBytes(result.blob.size)} · ${result.width.toLocaleString()} × ${result.height.toLocaleString()} px · ${extension.toUpperCase()}${savings > 0 ? ` · ${savings}% smaller` : savings < 0 ? ` · ${-savings}% larger` : ''}`;
    const checks = $('result-checks');
    checks.replaceChildren();
    const sizeCheck = document.createElement('span');
    sizeCheck.textContent = !target ? '✓ No file-size limit set' : result.meetsTarget ? sizeMode === 'exact' ? `✓ Exactly ${target / 1000} KB` : `✓ Within ${target / 1000} KB` : `Above ${target / 1000} KB limit`;
    sizeCheck.classList.toggle('warning', !result.meetsTarget);
    const dimensionCheck = document.createElement('span');
    const changed = result.width !== requestedWidth || result.height !== requestedHeight;
    dimensionCheck.textContent = changed ? 'Dimensions reduced to fit' : '✓ Dimensions match';
    dimensionCheck.classList.toggle('warning', changed);
    checks.append(sizeCheck, dimensionCheck);
    $('result-warning').hidden = result.meetsTarget && !changed;
    $('result-warning').textContent = !result.meetsTarget ? sizeMode === 'exact' ? 'The JPG could not fit this target. Allow smaller dimensions or choose a larger target size.' : 'The result exceeds your limit. Try JPG or WebP, allow smaller dimensions, or increase the file-size limit.' : 'The dimensions were reduced with your permission. Confirm that the new dimensions meet your form’s requirements.';
    $('size-note').hidden = !result.paddedBytes;
    $('size-note').textContent = result.paddedBytes ? 'Extra non-image data was added to reach the exact file size. This does not add detail or improve the photo’s quality.' : '';
    $('download').firstChild.textContent = result.meetsTarget ? 'Download photo ' : 'Download anyway ';
    $('result').hidden = false;
    setStatus(result.meetsTarget ? 'Your photo is ready. Review the preview and download it below.' : 'Photo prepared, but the file-size limit could not be met.', !result.meetsTarget);
  } catch (error) { if (current === generation) setStatus(error.message || 'Something went wrong. Try a smaller image.', true); }
  finally {
    busy = false;
    $('settings').disabled = !source;
    $('replace').disabled = false;
    $('edit-controls').disabled = !source;
    $('process').textContent = TOOLS[currentTool]?.action || 'Prepare photo →';
    $('settings-form').removeAttribute('aria-busy');
  }
});

$('demo').addEventListener('click', async () => {
  $('demo').disabled = true;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1600; canvas.height = 1100;
    const ctx = canvas.getContext('2d');
    const sky = ctx.createLinearGradient(0, 0, 0, 1100);
    sky.addColorStop(0, '#c9ded6'); sky.addColorStop(1, '#f8e9cd');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, 1600, 1100);
    ctx.fillStyle = '#f7d78d'; ctx.beginPath(); ctx.arc(1160, 280, 115, 0, Math.PI * 2); ctx.fill();
    for (const [color, points] of [['#8fa999', [0,650,420,230,930,790,1290,470,1600,730]], ['#537e6e', [0,850,650,430,1200,910,1600,630]], ['#285947', [0,890,470,720,1010,1040,1600,810]]]) {
      ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(points[0], points[1]);
      for (let i = 2; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1]);
      ctx.lineTo(1600, 1100); ctx.lineTo(0, 1100); ctx.closePath(); ctx.fill();
    }
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('Unable to create a sample. Please choose a photo.');
    await loadFile(new File([blob], 'a-little-escape.png', { type: 'image/png' }));
  } catch (error) { setStatus(error.message, true); }
  finally { $('demo').disabled = false; }
});

startNavigation((name, config) => {
  currentTool = name;
  generation++;
  clearResult();
  setStatus('');
  if (!name || name === 'batch') return;
  edits = defaultEdits();
  $('dimension-preset').value = '';
  $('size-mode').value = name === 'exact' ? 'exact' : 'maximum';
  $('target').value = ['compress', 'exact'].includes(name) ? '100' : '';
  $('auto-resize').checked = false;
  $('lock').checked = true;
  $('output-name').value = '';
  $('format').value = name === 'exact' || name === 'compress' ? 'image/jpeg' : originalFile?.type || 'image/png';
  $('process').textContent = busy ? 'Finishing the previous photo…' : config.action;
  $('settings').disabled = busy || !source;
  $('edit-controls').disabled = busy || !source;
  if (source) {
    fitCropDimensions();
    showEdits();
    setStatus('Original photo ready. Choose your settings for this tool.');
  }
  updateSizeControls(); updatePresets(); updateDownloadName();
});
