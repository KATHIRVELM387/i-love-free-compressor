import { fitDimensions, formatBytes, prepareImage } from './image-tools.js?v=5';
import { makeZip } from './zip.js?v=3';

const $ = id => document.getElementById(id);
let files = [];
let running = false;
let cancelled = false;
let urls = [];
window.addEventListener('toolchange', event => {
  if (event.detail.name !== 'batch' && running) cancelled = true;
});

function clearResults() {
  urls.forEach(url => URL.revokeObjectURL(url));
  urls = [];
  $('batch-results').replaceChildren();
  $('batch-summary').textContent = '';
  $('batch-progress').hidden = true;
  $('batch-zip').hidden = true;
  $('batch-zip').removeAttribute('href');
}

function selectFiles(selection) {
  if (running) return;
  const next = Array.from(selection);
  if (!next.length) return;
  if (next.length > 20 || next.reduce((sum, file) => sum + file.size, 0) > 100_000_000) {
    $('batch-status').textContent = 'Choose up to 20 photos, with at most 100 MB in total.';
    return;
  }
  clearResults();
  files = next;
  $('batch-selection').textContent = `${files.length} photos selected · ${formatBytes(files.reduce((sum, file) => sum + file.size, 0))}`;
  $('batch-process').disabled = false;
  $('batch-status').textContent = 'Ready. Each photo keeps its aspect ratio. Set a limit, then compress the batch.';
}

$('batch-browse').addEventListener('click', () => $('batch-input').click());
$('batch-input').addEventListener('change', () => {
  selectFiles($('batch-input').files);
  $('batch-input').value = '';
});
$('batch-settings').addEventListener('input', () => {
  clearResults();
  $('batch-status').textContent = files.length ? 'Settings changed. Compress the batch again to apply them.' : 'Choose photos to get started.';
});
$('batch-cancel').addEventListener('click', () => {
  cancelled = true;
  $('batch-cancel').disabled = true;
  $('batch-status').textContent = 'Stopping after the current photo…';
});

$('batch-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (running || !files.length) return;
  running = true;
  cancelled = false;
  clearResults();
  const type = $('batch-format').value;
  const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[type];
  const target = $('batch-target').value === '' ? null : Number($('batch-target').value) * 1000;
  const maxEdge = $('batch-edge').value === '' ? 4096 : Number($('batch-edge').value);
  const allowResize = $('batch-resize').checked;
  $('batch-settings').disabled = true;
  $('batch-browse').disabled = true;
  $('batch-cancel').hidden = false;
  $('batch-cancel').disabled = false;
  $('batch-form').setAttribute('aria-busy', 'true');
  $('batch-progress').hidden = false;
  $('batch-progress').max = files.length;
  $('batch-progress').value = 0;
  const output = [];
  let totalBytes = 0;
  let failed = 0;
  let aboveLimit = 0;
  try {
    for (const [index, file] of files.entries()) {
      if (cancelled) break;
      $('batch-status').textContent = `Processing ${index + 1} of ${files.length}: ${file.name}`;
      const row = document.createElement('li');
      const label = document.createElement('span');
      row.append(label);
      $('batch-results').append(row);
      let source;
      let sourceURL;
      try {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choose JPG, PNG, or WebP.');
        if (file.size > 25_000_000) throw new Error('Exceeds 25 MB per photo.');
        if ('createImageBitmap' in window) source = await createImageBitmap(file);
        else {
          sourceURL = URL.createObjectURL(file);
          source = new Image(); source.src = sourceURL; await source.decode();
        }
        const w = source.naturalWidth || source.width;
        const h = source.naturalHeight || source.height;
        if (!w || !h || w * h > 40_000_000) throw new Error('Exceeds 40 million pixels.');
        const scale = Math.min(1, maxEdge / Math.max(w, h));
        const size = fitDimensions(Math.max(1, Math.floor(w * scale)), Math.max(1, Math.floor(h * scale)));
        const result = await prepareImage(source, { ...size, type, target, allowResize });
        if (totalBytes + result.blob.size > 100_000_000) throw new Error('Batch output exceeds 100 MB. Use smaller dimensions or fewer photos.');
        totalBytes += result.blob.size;
        // A numeric prefix prevents collisions; strip path characters from ZIP names.
        const stem = (file.name.replace(/\.[^.]+$/, '').replace(/[\\/<>:"|?*\u0000-\u001f\u007f]/g, '_').replace(/^\.+/, '').slice(0, 100) || 'photo');
        const name = `${index + 1}-${stem}-ready.${extension}`;
        output.push({ name, blob: result.blob });
        const url = URL.createObjectURL(result.blob);
        urls.push(url);
        const link = document.createElement('a');
        link.href = url; link.download = name; link.textContent = result.meetsTarget ? 'Download' : 'Download anyway';
        link.className = 'text-button';
        link.setAttribute('aria-label', `Download ${file.name}${result.meetsTarget ? '' : ' (above size limit)'}`);
        label.textContent = `${file.name} · ${formatBytes(file.size)} → ${formatBytes(result.blob.size)} · ${result.width} × ${result.height} px${result.meetsTarget ? '' : ' · Above size limit'}`;
        if (!result.meetsTarget) { aboveLimit++; row.classList.add('batch-warning'); }
        row.append(link);
      } catch (error) {
        failed++;
        row.classList.add('batch-warning');
        label.textContent = `${file.name} · ${error.name === 'InvalidStateError' || error.message.includes('decode') ? 'This image could not be opened.' : error.message}`;
      } finally {
        source?.close?.();
        if (sourceURL) URL.revokeObjectURL(sourceURL);
      }
      $('batch-progress').value = index + 1;
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    if (output.length) {
      $('batch-status').textContent = 'Creating your ZIP download…';
      const zip = await makeZip(output);
      const url = URL.createObjectURL(zip);
      urls.push(url);
      $('batch-zip').href = url;
      $('batch-zip').hidden = false;
    }
    $('batch-summary').textContent = `${output.length} prepared · ${formatBytes(totalBytes)} total${failed ? ` · ${failed} failed` : ''}${aboveLimit ? ` · ${aboveLimit} above the size limit (included in ZIP)` : ''}`;
    $('batch-status').textContent = cancelled ? 'Batch stopped. Completed photos are available below.' : 'Batch finished. Review each result before downloading.';
  } catch (error) {
    $('batch-status').textContent = `Could not finish the batch: ${error.message}. Completed photos can still be downloaded individually.`;
  } finally {
    running = false;
    $('batch-settings').disabled = false;
    $('batch-browse').disabled = false;
    $('batch-cancel').hidden = true;
    $('batch-form').removeAttribute('aria-busy');
  }
});
