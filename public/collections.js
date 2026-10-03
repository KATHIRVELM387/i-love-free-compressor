import { prepareImage, formatBytes } from './image-tools.js?v=6';
import { imagesToPdf } from './pdf.js?v=1';

const types = ['image/jpeg', 'image/png', 'image/webp'];
async function openPhoto(file) {
  let source, url;
  try {
    if ('createImageBitmap' in window) source = await createImageBitmap(file);
    else { url = URL.createObjectURL(file); source = new Image(); source.src = url; await source.decode(); }
    const width = source.naturalWidth || source.width;
    const height = source.naturalHeight || source.height;
    if (!width || !height || width * height > 40_000_000) throw new Error('Photo exceeds 40 million pixels.');
    return { source, width, height, close() { source.close?.(); if (url) URL.revokeObjectURL(url); } };
  } catch (error) {
    source?.close?.(); if (url) URL.revokeObjectURL(url);
    throw new Error(`${file.name}: ${error.message.includes('40 million') ? error.message : 'This photo could not be opened. Remove it and try again.'}`);
  }
}
function encode(canvas, type) {
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not save the collage. Try a smaller canvas.')), type, .94));
}

function setup(kind) {
  const $ = suffix => document.getElementById(`${kind}-${suffix}`);
  const max = kind === 'collage' ? 9 : 20;
  const minimum = kind === 'collage' ? 2 : 1;
  let files = [], busy = false, cancelled = false, resultURL;
  function clearResult() {
    if (resultURL) URL.revokeObjectURL(resultURL);
    resultURL = null;
    $('result').hidden = true;
    $('download').removeAttribute('href');
    if (kind === 'collage') $('preview').removeAttribute('src');
  }
  function changed() {
    clearResult();
    $('status').textContent = files.length < minimum ? `Choose at least ${minimum} photo${minimum > 1 ? 's' : ''} to get started.` : 'Ready. Arrange your photos, choose your options, and create your download.';
    $('process').disabled = files.length < minimum;
  }
  function renderList(focusIndex, focusAction) {
    $('list').replaceChildren();
    files.forEach((file, index) => {
      const row = document.createElement('li');
      const name = document.createElement('span');
      name.textContent = `${index + 1}. ${file.name} · ${formatBytes(file.size)}`;
      row.append(name);
      const actions = document.createElement('div'); actions.className = 'photo-actions';
      for (const [action, label] of [['up', '↑'], ['down', '↓'], ['remove', 'Remove']]) {
        const button = document.createElement('button');
        button.type = 'button'; button.textContent = label; button.className = 'photo-action';
        button.dataset.action = action;
        button.setAttribute('aria-label', `${action === 'remove' ? 'Remove' : 'Move ' + action} ${file.name}`);
        button.disabled = (action === 'up' && index === 0) || (action === 'down' && index === files.length - 1);
        button.addEventListener('click', () => {
          if (busy) return;
          const destination = action === 'up' ? index - 1 : action === 'down' ? index + 1 : Math.min(index, files.length - 2);
          if (action === 'remove') files.splice(index, 1);
          else [files[index], files[destination]] = [files[destination], files[index]];
          changed(); renderList(destination, action);
        });
        actions.append(button);
      }
      row.append(actions); $('list').append(row);
    });
    $('selection').textContent = `${files.length} / ${max} photos · ${formatBytes(files.reduce((sum, file) => sum + file.size, 0))}`;
    if (focusIndex !== undefined) {
      const row = $('list').children[focusIndex];
      const preferred = row?.querySelector(`[data-action="${focusAction}"]`);
      (preferred && !preferred.disabled ? preferred : row?.querySelector('button:not(:disabled)') || $('browse')).focus();
    }
  }
  $('browse').addEventListener('click', () => $('input').click());
  $('input').addEventListener('change', () => {
    const added = Array.from($('input').files); $('input').value = '';
    if (busy || !added.length) return;
    const next = [...files, ...added];
    if (next.length > max || next.reduce((sum, file) => sum + file.size, 0) > 100_000_000) {
      $('status').textContent = `Choose up to ${max} photos, with at most 100 MB in total. Remove some photos before adding more.`; return;
    }
    const invalid = added.find(file => !types.includes(file.type) || file.size > 25_000_000);
    if (invalid) { $('status').textContent = `${invalid.name}: choose JPG, PNG, or WebP, up to 25 MB per photo.`; return; }
    files = next; changed(); renderList();
  });
  $('clear').addEventListener('click', () => { if (!busy) { files = []; changed(); renderList(); } });
  $('options').addEventListener('input', changed);
  $('cancel').addEventListener('click', () => {
    cancelled = true; $('cancel').disabled = true; $('status').textContent = 'Stopping after the current photo…';
  });
  window.addEventListener('toolchange', event => { if (event.detail.name !== kind && busy) cancelled = true; });
  $('form').addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || files.length < minimum || document.documentElement.dataset.activeTool !== kind || !$('form').reportValidity()) return;
    busy = true; cancelled = false; clearResult();
    const canvas = document.createElement('canvas');
    const pages = [];
    const options = kind === 'collage' ? {
      size: $('size').value.split('x').map(Number), columns: Number($('columns').value),
      gap: Number($('gap').value), color: $('color').value, fit: $('fit').value, type: $('format').value
    } : { paper: $('paper').value, landscape: $('orientation').value === 'landscape' };
    $('settings').disabled = true;
    $('cancel').hidden = false; $('cancel').disabled = false;
    $('form').setAttribute('aria-busy', 'true');
    $('progress').hidden = false; $('progress').max = files.length; $('progress').value = 0;
    let totalBytes = 0;
    try {
      let ctx, columns, rows, cellWidth, cellHeight;
      if (kind === 'collage') {
        if (!['1080x1080', '1600x1200', '1200x1600'].includes($('size').value) || ![1, 2, 3].includes(options.columns) || !Number.isInteger(options.gap) || options.gap < 0 || options.gap > 80 || !types.includes(options.type) || !['contain', 'cover'].includes(options.fit) || !/^#[0-9a-f]{6}$/i.test(options.color)) throw new Error('Please check your collage settings.');
        [canvas.width, canvas.height] = options.size;
        ctx = canvas.getContext('2d'); ctx.fillStyle = options.color; ctx.fillRect(0, 0, canvas.width, canvas.height);
        columns = Math.min(files.length, options.columns); rows = Math.ceil(files.length / columns);
        cellWidth = (canvas.width - options.gap * (columns + 1)) / columns;
        cellHeight = (canvas.height - options.gap * (rows + 1)) / rows;
        if (cellWidth <= 0 || cellHeight <= 0) throw new Error('Reduce the spacing or choose more columns to leave room for your photos.');
      }
      for (const [index, file] of files.entries()) {
        if (cancelled) break;
        $('status').textContent = `Preparing ${index + 1} of ${files.length}: ${file.name}`;
        const photo = await openPhoto(file);
        try {
          if (cancelled) break;
          if (kind === 'collage') {
            const x = options.gap + index % columns * (cellWidth + options.gap);
            const y = options.gap + Math.floor(index / columns) * (cellHeight + options.gap);
            const scale = Math[options.fit === 'cover' ? 'max' : 'min'](cellWidth / photo.width, cellHeight / photo.height);
            const w = photo.width * scale, h = photo.height * scale;
            ctx.save(); ctx.beginPath(); ctx.rect(x, y, cellWidth, cellHeight); ctx.clip();
            ctx.drawImage(photo.source, x + (cellWidth - w) / 2, y + (cellHeight - h) / 2, w, h); ctx.restore();
          } else {
            const scale = Math.min(1, 2048 / Math.max(photo.width, photo.height));
            const page = await prepareImage(photo.source, { width: Math.max(1, Math.round(photo.width * scale)), height: Math.max(1, Math.round(photo.height * scale)), type: 'image/jpeg', target: null, allowResize: false });
            totalBytes += page.blob.size;
            if (totalBytes > 100_000_000) throw new Error('The PDF is too large. Try fewer photos.');
            pages.push(page);
          }
        } finally { photo.close(); }
        $('progress').value = index + 1;
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      if (cancelled) { $('status').textContent = 'Stopped. Your selection is kept; create again when ready.'; return; }
      const blob = kind === 'collage' ? await encode(canvas, options.type) : imagesToPdf(pages, options);
      if (cancelled) { $('status').textContent = 'Stopped. Your selection is kept; create again when ready.'; return; }
      if (kind === 'collage' && blob.type !== options.type) throw new Error('Your browser cannot save that format. Choose PNG or JPG.');
      if (blob.size > 100_000_000) throw new Error('The output is too large. Try fewer photos.');
      resultURL = URL.createObjectURL(blob);
      $('download').href = resultURL;
      $('download').download = kind === 'pdf' ? 'my-photos.pdf' : `my-collage.${{ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[blob.type]}`;
      if (kind === 'collage') $('preview').src = resultURL;
      $('summary').textContent = `${kind === 'pdf' ? files.length + (files.length === 1 ? ' page · ' : ' pages · ') + options.paper.toUpperCase() + ' · ' + (options.landscape ? 'Landscape' : 'Portrait') : canvas.width + ' × ' + canvas.height + ' px'} · ${formatBytes(blob.size)}`;
      $('result').hidden = false; $('status').textContent = 'Ready! Download your file below.';
    } catch (error) { $('status').textContent = error.message; }
    finally {
      canvas.width = canvas.height = 1;
      busy = false; $('settings').disabled = false; $('cancel').hidden = true;
      $('progress').hidden = true; $('form').removeAttribute('aria-busy');
    }
  });
}
setup('collage');
setup('pdf');
