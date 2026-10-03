import { registerResult, forgetToolResults } from './account-bridge.js?v=1';
import { openPhoto, drawContained, extractPalette, splitLayout, hasTransparency, canvasBlob } from './analysis-tools.js?v=1';
import { formatBytes } from './image-tools.js?v=6';
import { makeZip } from './zip.js?v=3';

const types = { 'image/jpeg': 'JPG', 'image/png': 'PNG', 'image/webp': 'WebP' };
function viewer(name, ready) {
  const $ = suffix => document.getElementById(`${name}-${suffix}`);
  const state = { file: null, generation: 0, busy: false, urls: [], $, width: 0, height: 0 };
  state.clearOutput = () => {
    forgetToolResults(name);
    state.urls.forEach(url => URL.revokeObjectURL(url)); state.urls = [];
    $('output').hidden = true;
    for (const link of $('output').querySelectorAll('a')) link.removeAttribute('href');
  };
  state.link = (id, blob) => { const url = URL.createObjectURL(blob); state.urls.push(url); $(id).href = url; registerResult(name + '-' + id, blob, name); };
  state.setBusy = value => { state.busy = value; $('options').disabled = value; if ($('run')) $('run').disabled = value || !state.file || !!state.invalid; };
  state.load = async file => {
    if (!file) return;
    const token = ++state.generation;
    state.setBusy(true); $('status').textContent = 'Opening your photo…';
    let photo;
    try {
      photo = await openPhoto(file);
      if (token !== state.generation) return;
      state.clearOutput(); state.file = file; state.width = photo.width; state.height = photo.height;
      drawContained($('preview'), photo.image); $('preview').hidden = false; $('empty').hidden = true;
      $('file').textContent = `${file.name} · ${photo.width.toLocaleString()} × ${photo.height.toLocaleString()} px · ${formatBytes(file.size)}`;
      await ready(state, photo, token);
    } catch (error) { if (token === state.generation) $('status').textContent = error.message; }
    finally { photo?.close(); if (token === state.generation) state.setBusy(false); }
  };
  $('choose').addEventListener('click', () => $('input').click());
  $('input').addEventListener('change', () => { const file = $('input').files[0]; $('input').value = ''; state.load(file); });
  $('clear').addEventListener('click', () => {
    state.generation++; state.file = null; state.setBusy(false); state.clearOutput();
    $('preview').width = $('preview').height = 1; $('preview').hidden = true; $('empty').hidden = false;
    $('file').textContent = 'JPG, PNG or WebP · up to 25 MB · 40 million pixels';
    $('status').textContent = 'Choose a photo to get started.';
    state.onClear?.();
  });
  window.addEventListener('toolchange', event => {
    if (event.detail.name !== name && state.busy) {
      state.generation++; state.setBusy(false); state.clearOutput();
      $('status').textContent = 'Stopped when you changed tools. Choose your photo again to restart.';
    }
  });
  return state;
}

const split = viewer('split', (state, photo) => {
  state.base = document.createElement('canvas'); drawContained(state.base, photo.image);
  drawGrid();
});
function drawGrid() {
  if (!split.file || !split.base) return;
  split.clearOutput();
  const $ = split.$, canvas = $('preview');
  canvas.width = split.base.width; canvas.height = split.base.height;
  const ctx = canvas.getContext('2d'); ctx.drawImage(split.base,0,0);
  try {
    const layout = splitLayout(split.width, split.height, Number($('rows').value), Number($('columns').value));
    for (const tile of layout.tiles) {
      const x = tile.x / layout.width * canvas.width, y = tile.y / layout.height * canvas.height;
      const w = tile.width / layout.width * canvas.width, h = tile.height / layout.height * canvas.height;
      ctx.strokeStyle = '#292344'; ctx.lineWidth = 3; ctx.strokeRect(x,y,w,h);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(x,y,w,h);
    }
    $('status').textContent = `${layout.tiles.length} tiles · working image ${layout.width} × ${layout.height} px${layout.width !== split.width || layout.height !== split.height ? ' · resized to fit browser limits' : ''}. Create the ZIP when ready.`;
    split.invalid = false; $('run').disabled = split.busy;
  } catch (error) { $('status').textContent = error.message; split.invalid = true; $('run').disabled = true; }
}
split.onClear = () => { if (split.base) split.base.width = split.base.height = 1; split.base = null; };
split.$('options').addEventListener('input', drawGrid);
split.$('run').addEventListener('click', async () => {
  if (!split.file || split.busy) return;
  const $ = split.$, token = ++split.generation;
  let photo, canvas;
  split.clearOutput(); split.setBusy(true);
  try {
    const layout = splitLayout(split.width, split.height, Number($('rows').value), Number($('columns').value));
    photo = await openPhoto(split.file);
    if (token !== split.generation) return;
    canvas = document.createElement('canvas'); const output = []; let bytes = 0;
    for (const tile of layout.tiles) {
      if (token !== split.generation) return;
      $('status').textContent = `Creating tile ${output.length + 1} of ${layout.tiles.length}…`;
      canvas.width = tile.width; canvas.height = tile.height;
      canvas.getContext('2d').drawImage(photo.image, tile.x / layout.width * photo.width, tile.y / layout.height * photo.height,
        tile.width / layout.width * photo.width, tile.height / layout.height * photo.height, 0,0,tile.width,tile.height);
      const blob = await canvasBlob(canvas); bytes += blob.size;
      if (bytes > 100_000_000) throw new Error('The tiles exceed 100 MB. Please use a smaller photo.');
      output.push({ name: `row-${String(tile.row + 1).padStart(2,'0')}-col-${String(tile.column + 1).padStart(2,'0')}.png`, blob });
      await new Promise(resolve => setTimeout(resolve,0));
    }
    if (token !== split.generation) return;
    const zip = await makeZip(output);
    if (token !== split.generation) return;
    split.link('download',zip);
    $('summary').textContent = `${output.length} PNG tiles · ${layout.width} × ${layout.height} px combined · ${formatBytes(zip.size)}`;
    $('output').hidden = false; $('status').textContent = 'Ready! Tile names show their row and column, starting at the top left.';
  } catch (error) { if (token === split.generation) $('status').textContent = error.message; }
  finally { photo?.close(); if (canvas) canvas.width = canvas.height = 1; if (token === split.generation) split.setBusy(false); }
});

const palette = viewer('palette', async (state, photo, token) => {
  const $ = state.$, colors = extractPalette(photo.image, Number($('count').value));
  $('swatches').replaceChildren();
  if (!colors.length) { $('status').textContent = 'No visible colors found. Try a photo with less transparency.'; return; }
  const strip = document.createElement('canvas'); strip.width = colors.length * 160; strip.height = 180;
  const ctx = strip.getContext('2d');
  for (const [index, color] of colors.entries()) {
    const card = document.createElement('div'); card.className = 'palette-card';
    const chip = document.createElement('canvas'); chip.width = 160; chip.height = 90; chip.setAttribute('aria-hidden','true');
    chip.getContext('2d').fillStyle = color.hex; chip.getContext('2d').fillRect(0,0,160,90);
    const code = document.createElement('input'); code.value = color.hex; code.readOnly = true; code.setAttribute('aria-label', `Color ${index + 1} HEX code`);
    const copy = document.createElement('button'); copy.type = 'button'; copy.className = 'text-button'; copy.textContent = 'Copy HEX'; copy.setAttribute('aria-label', `Copy ${color.hex}`);
    copy.addEventListener('click', async () => {
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(color.hex);
        if (token === state.generation) $('status').textContent = `${color.hex} copied.`;
      } catch {
        if (token === state.generation) { code.focus(); code.select(); $('status').textContent = 'Copy is unavailable here. The HEX code is selected; use your device’s Copy command.'; }
      }
    });
    card.append(chip,code,copy); $('swatches').append(card);
    ctx.fillStyle = color.hex; ctx.fillRect(index * 160,0,160,130);
    ctx.fillStyle = '#fff'; ctx.fillRect(index * 160,130,160,50);
    ctx.fillStyle = '#292344'; ctx.font = '18px monospace'; ctx.textAlign = 'center'; ctx.fillText(color.hex,index * 160 + 80,162);
  }
  try {
    const png = await canvasBlob(strip);
    if (token !== state.generation) return;
    state.link('image',png); state.link('text', new Blob([colors.map(c => c.hex).join('\n') + '\n'], { type: 'text/plain' }));
    $('output').hidden = false; $('status').textContent = `${colors.length} distinct color${colors.length === 1 ? '' : 's'} found. Copy a HEX code or download your palette.`;
  } finally { strip.width = strip.height = 1; }
});
palette.$('count').addEventListener('input', () => { if (palette.file) palette.load(palette.file); });

viewer('details', async (state, photo, token) => {
  const $ = state.$;
  const gcd = (a,b) => b ? gcd(b,a % b) : a;
  const divisor = gcd(photo.width,photo.height);
  const fields = [ ['Filename',state.file.name], ['Format',types[photo.type]], ['File size',`${state.file.size.toLocaleString()} bytes (${formatBytes(state.file.size)})`],
    ['Dimensions',`${photo.width.toLocaleString()} × ${photo.height.toLocaleString()} px`], ['Aspect ratio',`${photo.width / divisor}:${photo.height / divisor}`],
    ['Orientation',photo.width === photo.height ? 'Square' : photo.width > photo.height ? 'Landscape' : 'Portrait'], ['Megapixels',`${(photo.width * photo.height / 1_000_000).toFixed(2)} MP`], ['Transparency','Checking every pixel…'] ];
  $('list').replaceChildren();
  for (const [label,value] of fields) { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = label; dd.textContent = value; $('list').append(dt,dd); }
  // Keep partial results out of the output until the exact transparency check finishes.
  $('status').textContent = 'Checking photo details and transparency…';
  const transparent = await hasTransparency(photo, () => token !== state.generation);
  if (token !== state.generation || transparent === null) return;
  const value = transparent ? 'Yes — transparent or semi-transparent pixels' : 'No — every decoded pixel is opaque';
  fields.at(-1)[1] = value; $('list').lastElementChild.textContent = value;
  state.link('download',new Blob([fields.map(([label,value]) => `${label}: ${value}`).join('\n') + '\n'], { type: 'text/plain' }));
  $('output').hidden = false; $('status').textContent = 'Details ready. Your photo has not been changed.';
});

function setupCompare() {
  const $ = suffix => document.getElementById(`compare-${suffix}`);
  const photos = { before: null, after: null }, tokens = { before: 0, after: 0 }, loading = { before: false, after: false };
  function render() {
    const ready = !!photos.before && !!photos.after;
    $('output').hidden = !ready; $('swap').disabled = !ready || loading.before || loading.after;
    if (!ready) return;
    const canvas = $('preview'), ctx = canvas.getContext('2d'), position = Number($('position').value);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(photos.after.canvas,0,0);
    ctx.save(); ctx.beginPath(); ctx.rect(0,0,canvas.width * position / 100,canvas.height); ctx.clip();
    ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(photos.before.canvas,0,0); ctx.restore();
    if (position > 0 && position < 100) { ctx.fillStyle = '#fff'; ctx.fillRect(canvas.width * position / 100 - 2,0,4,canvas.height); }
    $('value').textContent = `${position}%`;
    $('preview').setAttribute('aria-label', `Before photo on the left (${position}%), after photo on the right (${100 - position}%)`);
  }
  function updateNames() {
    for (const side of ['before','after']) $(''+side+'-name').textContent = photos[side] ? `${photos[side].name} · ${photos[side].width} × ${photos[side].height} px` : 'No photo selected.';
  }
  function readyMessage() {
    if (!photos.before || !photos.after) return 'Choose both photos to compare them.';
    return photos.before.width * photos.after.height === photos.after.width * photos.before.height ? 'Move the slider to compare. Photos are fitted to the preview without stretching.' : 'The aspect ratios differ. Each photo fits the same area without stretching, so empty space may appear.';
  }
  for (const side of ['before','after']) {
    $(side + '-choose').addEventListener('click', () => $(side + '-input').click());
    $(side + '-input').addEventListener('change', async () => {
      const file = $(side + '-input').files[0]; $(side + '-input').value = ''; if (!file) return;
      const token = ++tokens[side]; loading[side] = true; $('swap').disabled = true;
      $('status').textContent = `Opening the ${side} photo…`;
      let photo;
      try {
        photo = await openPhoto(file); if (token !== tokens[side]) return;
        const canvas = document.createElement('canvas'); drawContained(canvas,photo.image,1200,800,true);
        if (photos[side]) photos[side].canvas.width = photos[side].canvas.height = 1;
        photos[side] = { canvas, name: file.name, width: photo.width, height: photo.height };
        updateNames(); render(); $('status').textContent = readyMessage();
      } catch (error) { if (token === tokens[side]) $('status').textContent = error.message; }
      finally { photo?.close(); if (token === tokens[side]) { loading[side] = false; render(); } }
    });
  }
  $('position').addEventListener('input',render);
  $('swap').addEventListener('click', () => {
    if (loading.before || loading.after || !photos.before || !photos.after) return;
    [photos.before,photos.after] = [photos.after,photos.before]; updateNames(); render(); $('status').textContent = 'Photos swapped. ' + readyMessage();
  });
  $('clear').addEventListener('click', () => {
    for (const side of ['before','after']) { tokens[side]++; loading[side] = false; if (photos[side]) photos[side].canvas.width = photos[side].canvas.height = 1; photos[side] = null; }
    $('preview').getContext('2d').clearRect(0,0,1200,800); $('position').value = 50;
    updateNames(); render(); $('status').textContent = readyMessage();
  });
  window.addEventListener('toolchange', event => {
    if (event.detail.name === 'compare') return;
    for (const side of ['before','after']) if (loading[side]) { tokens[side]++; loading[side] = false; $('status').textContent = 'Opening stopped when you changed tools. Choose the photo again to retry.'; }
    render();
  });
}
setupCompare();
