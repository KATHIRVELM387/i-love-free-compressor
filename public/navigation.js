export const TOOLS = {
  compress: { title: 'Compress images', description: 'Choose a photo and set the maximum file size you need.', action: 'Compress photo →' },
  exact: { title: 'Exact file size', description: 'Make a JPG smaller or bigger to reach your chosen size in KB.', action: 'Set exact file size →' },
  resize: { title: 'Resize images', description: 'Change width and height, or choose a percentage of the original size.', action: 'Resize photo →' },
  crop: { title: 'Crop & size presets', description: 'Choose a shape, adjust the framing, and set the output dimensions.', action: 'Crop photo →' },
  rotate: { title: 'Rotate & flip', description: 'Rotate your photo or mirror it horizontally or vertically.', action: 'Save rotated photo →' },
  convert: { title: 'Convert format', description: 'Choose JPG, PNG, or WebP and save your photo in that format.', action: 'Convert photo →' },
  adjust: { title: 'Light & color', description: 'Adjust brightness and contrast, or create a black-and-white photo.', action: 'Save adjustments →' },
  watermark: { title: 'Text watermark', description: 'Add your own text and choose its position, color, size, and opacity.', action: 'Add watermark →' },
  background: { title: 'Transparency background', description: 'Fill transparent pixels with a color. Existing photo backgrounds stay in place.', action: 'Save background →' },
  filters: { title: 'Photo filters', description: 'Try a warm, cool, sepia, or negative look and adjust its strength.', action: 'Save filtered photo →' },
  frame: { title: 'Photo frames', description: 'Add a colored border inside the edges of your photo.', action: 'Save framed photo →' },
  rounded: { title: 'Rounded corners', description: 'Soften your photo’s corners. Save as PNG or WebP to keep them transparent.', action: 'Save rounded photo →' },
  pixelate: { title: 'Pixel art', description: 'Turn your whole photo into a blocky mosaic with adjustable pixel size.', action: 'Save pixel art →' },
  batch: { title: 'Batch compressor', view: 'batch' },
  collage: { title: 'Photo collage', view: 'collage' },
  pdf: { title: 'Images to PDF', view: 'pdf' },
  split: { title: 'Image splitter', view: 'split' },
  palette: { title: 'Color palette', view: 'palette' },
  compare: { title: 'Compare images', view: 'compare' },
  details: { title: 'Image details', view: 'details' }
};

export const ACCOUNT_PAGES = Object.fromEntries(['account','dashboard','files','history','profile','admin'].map(name => [name, { title: ({account:'Sign in',dashboard:'My dashboard',files:'My files',history:'Activity history',profile:'Profile & settings',admin:'Administration'})[name], view:name }]));
export const PAGES = { ...TOOLS, ...ACCOUNT_PAGES };

export function startNavigation(onSelect) {
  const $ = id => document.getElementById(id);
  function render() {
    const legacy = { '#tool': 'compress', '#batch-tool': 'batch' };
    const requested = legacy[location.hash] || location.hash.slice(2);
    const name = Object.hasOwn(PAGES, requested) ? requested : null;
    const config = name ? PAGES[name] : null;
    $('home-view').hidden = !!name;
    $('workspace-nav').hidden = !name || !!ACCOUNT_PAGES[name];
    $('tool').hidden = !name || !!config.view;
    for (const view of Object.values(PAGES).filter(tool => tool.view).map(tool => tool.view)) $(view + '-tool').hidden = name !== view;
    document.documentElement.dataset.activeTool = name || 'home';
    for (const group of document.querySelectorAll('[data-tools]')) {
      const active = !!name && group.dataset.tools.split(' ').includes(name);
      group.hidden = !active;
      if (group.tagName === 'FIELDSET') group.disabled = !active;
    }
    $('edit-controls').hidden = !['crop', 'rotate', 'adjust', 'watermark', 'background', 'filters', 'frame', 'rounded', 'pixelate'].includes(name);
    if (config && !config.view) {
      $('tool-title').textContent = config.title;
      $('tool-description').textContent = config.description;
    }
    document.title = config ? `${config.title} — I Love Free Compressor` : 'I Love Free Compressor — Free Image Tools';
    onSelect(name, config);
    const heading = $(config?.view ? config.view + '-heading' : name ? 'tool-title' : 'menu-heading');
    heading.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'auto' });
    window.dispatchEvent(new CustomEvent('toolchange', { detail: { name } }));
  }
  window.addEventListener('hashchange', render);
  render();
}
