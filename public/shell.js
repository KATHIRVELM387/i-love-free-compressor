import { EXTRA_TOOLS } from './studio-catalog.js';
import { TOOLS, PAGES } from './navigation.js?v=11';

const $ = id => document.getElementById(id);
const groups = [
  ['Size & format', ['compress', 'exact', 'resize', 'convert']],
  ['Edit & style', ['crop', 'rotate', 'adjust', 'filters', 'frame', 'rounded', 'pixelate', 'watermark', 'background']],
  ['Multiple photos', ['batch', 'collage', 'pdf', 'split']],
  ['Explore & inspect', ['palette', 'compare', 'details']]
];
for (const label of ['PDF tools','Create & draw','Web utilities']) groups.push([label,Object.keys(EXTRA_TOOLS).filter(k=>EXTRA_TOOLS[k].group===label)]);
const aliases = {
  compress: 'reduce shrink kb', exact: 'increase enlarge kb', resize: 'dimensions width height pixels',
  convert: 'jpg jpeg png webp', crop: 'square instagram story presets', rotate: 'mirror flip',
  adjust: 'brightness contrast grayscale black white', filters: 'sepia vintage warm cool negative invert',
  frame: 'border color', rounded: 'round corners transparent', pixelate: 'pixel mosaic blocks',
  watermark: 'text name brand', background: 'transparent fill color', batch: 'multiple zip',
  collage: 'grid combine photos', pdf: 'document combine photos', split: 'divide tiles grid pieces zip', palette: 'colors hex swatches extract', compare: 'before after slider comparison', details: 'information dimensions format size aspect ratio transparency'
};
function matches(name, query) {
  const text = `${TOOLS[name].title} ${TOOLS[name].description || ''} ${aliases[name]}`.toLowerCase();
  return query.trim().toLowerCase().split(/\s+/).every(word => text.includes(word));
}

const home = document.createElement('a');
home.href = '#/'; home.textContent = '⌂  All tools'; home.dataset.route = 'home';
$('side-links').append(home);
const workflowLink=document.createElement('a');workflowLink.href='#/workflow';workflowLink.textContent='Saved workflows';$('side-links').append(workflowLink);
for (const [label, names] of groups) {
  const section = document.createElement('div'); section.className = 'nav-group';
  const heading = document.createElement('h2'); heading.textContent = label; section.append(heading);
  for (const name of names) {
    const link = document.createElement('a'); link.href = '#/' + name;
    link.textContent = TOOLS[name].title; link.dataset.route = name;
    section.append(link);
  }
  $('side-links').append(section);
}
function filterNavigation() {
  let count = 0;
  for (const link of $('side-links').querySelectorAll('[data-route]:not([data-route=home])')) {
    link.hidden = !matches(link.dataset.route, $('nav-search').value);
    if (!link.hidden) count++;
  }
  for (const group of $('side-links').querySelectorAll('.nav-group')) group.hidden = !group.querySelector('a:not([hidden])');
  $('nav-empty').hidden = count > 0;
  $('nav-clear').hidden = !$('nav-search').value;
}
$('nav-search').addEventListener('input', filterNavigation);
$('nav-clear').addEventListener('click', () => { $('nav-search').value = ''; filterNavigation(); $('nav-search').focus(); });
function filterCards() {
  let count = 0;
  for (const card of document.querySelectorAll('.tool-card')) {
    card.hidden = !matches(card.getAttribute('href').slice(2), $('tool-search').value);
    if (!card.hidden) count++;
  }
  $('tool-search-clear').hidden = !$('tool-search').value;
  $('tool-search-status').hidden = !$('tool-search').value;
  $('tool-search-status').textContent = count ? `${count} tool${count === 1 ? '' : 's'} found.` : 'No matching tools. Try “compress”, “border”, or “PDF”.';
}
$('tool-search').addEventListener('input', filterCards);
$('tool-search-clear').addEventListener('click', () => { $('tool-search').value = ''; filterCards(); $('tool-search').focus(); });

const mobile = matchMedia('(max-width: 1000px)');
let menuOpen = false;
function closeMenu(restoreFocus = false) {
  menuOpen = false;
  $('sidebar').hidden = mobile.matches;
  $('sidebar').removeAttribute('role'); $('sidebar').removeAttribute('aria-modal');
  $('app-shell').inert = false;
  $('menu-backdrop').hidden = true;
  $('menu-toggle').setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-is-open');
  if (restoreFocus && mobile.matches) $('menu-toggle').focus();
}
function openMenu() {
  if (!mobile.matches) return;
  menuOpen = true;
  $('sidebar').hidden = false;
  $('sidebar').setAttribute('role', 'dialog'); $('sidebar').setAttribute('aria-modal', 'true');
  $('app-shell').inert = true;
  $('menu-backdrop').hidden = false;
  $('menu-toggle').setAttribute('aria-expanded', 'true');
  document.body.classList.add('menu-is-open');
  $('nav-search').focus();
}
$('menu-toggle').addEventListener('click', openMenu);
$('menu-close').addEventListener('click', () => closeMenu(true));
$('menu-backdrop').addEventListener('click', () => closeMenu(true));
$('sidebar').addEventListener('keydown', event => {
  if (!menuOpen) return;
  if (event.key === 'Escape') { event.preventDefault(); closeMenu(true); }
  if (event.key === 'Tab') {
    const items = [...$('sidebar').querySelectorAll('a, button, input')].filter(el => !el.disabled && el.getClientRects().length);
    const index = items.indexOf(document.activeElement);
    if (event.shiftKey && index <= 0) { event.preventDefault(); items.at(-1).focus(); }
    else if (!event.shiftKey && index === items.length - 1) { event.preventDefault(); items[0].focus(); }
  }
});
$('sidebar').addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link) return;
  closeMenu();
  // Choosing the current route does not dispatch hashchange.
  if (link.hash === location.hash || (link.hash === '#/' && !location.hash)) {
    const name = document.documentElement.dataset.activeTool;
    const heading = $(name === 'home' ? 'menu-heading' : PAGES[name]?.view ? name + '-heading' : 'tool-title');
    heading?.focus({ preventScroll: true });
  }
});
function updateCurrent() {
  const wasOpen = menuOpen;
  closeMenu();
  const name = document.documentElement.dataset.activeTool || 'home';
  if (wasOpen) $(name === 'home' ? 'menu-heading' : PAGES[name]?.view ? name + '-heading' : 'tool-title')?.focus({ preventScroll: true });
  for (const link of $('side-links').querySelectorAll('[data-route]')) {
    if (link.dataset.route === name) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  const current = $('side-links').querySelector('[aria-current=page]');
  if (!mobile.matches && current && current.getClientRects().length) {
    const area = $('side-links').getBoundingClientRect(), item = current.getBoundingClientRect();
    if (item.top < area.top) $('side-links').scrollTop -= area.top - item.top;
    else if (item.bottom > area.bottom) $('side-links').scrollTop += item.bottom - area.bottom;
  }
  // Returning home always offers the complete tool menu for the next step.
  if (name === 'home') { $('tool-search').value = ''; filterCards(); }
}
mobile.addEventListener('change', () => {
  const wasInside = $('sidebar').contains(document.activeElement);
  closeMenu(wasInside);
});
window.addEventListener('toolchange', updateCurrent);
document.querySelector('.skip-link').addEventListener('click', event => {
  event.preventDefault();
  $('main-content').focus();
});
updateCurrent();
