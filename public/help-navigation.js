import { TOOLS, HELP_PAGES } from './navigation.js?v=14';
import { categoryFor } from './guide-data.js';
const $ = id => document.getElementById(id);
const el = (tag, text) => { const n = document.createElement(tag); if (text !== undefined) n.textContent = text; return n; };

const helpLink = el('a', 'Help for this tool'); helpLink.id = 'current-tool-guide'; helpLink.className = 'text-button';
$('workspace-nav').append(helpLink);
function current() {
  const route = document.documentElement.dataset.activeTool || 'home';
  helpLink.hidden = !TOOLS[route] && route !== 'workflow';
  helpLink.href = '#/guide/' + route;
  for (const a of document.querySelectorAll('[data-header-page]')) {
    const selected = a.dataset.headerPage === route || (a.dataset.headerPage === 'features' && route.startsWith('guide/')) || (a.dataset.headerPage === 'home' && (!!TOOLS[route] || route === 'workflow'));
    if (selected) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  }
}
window.addEventListener('toolchange', current); current();

const resources = el('div'); resources.className = 'nav-group'; resources.append(el('h2', 'Learn & help'));
for (const [name, title] of [['videos','Video demos'],['features','Feature guides'],['how-to-use','How to use'],['about','About'],['faq','Help & FAQ'],['privacy','Files & privacy']]) {
  const a = el('a', title); a.href = '#/' + name; resources.append(a);
}
$('side-links').append(resources);
const footerNav = el('nav'); footerNav.className = 'footer-links'; footerNav.setAttribute('aria-label', 'Information');
for (const [name, title] of [['about','About'],['videos','Video demos'],['how-to-use','How to use'],['features','Features'],['privacy','Files & privacy'],['faq','Help']]) { const a = el('a', title); a.href = '#/' + name; footerNav.append(a); }
document.querySelector('footer').append(footerNav);

const categories = el('div'); categories.className = 'category-filters'; categories.id = 'tool-categories'; categories.setAttribute('aria-label', 'Tool categories');
for (const label of ['All','Images','PDF','Creative','Web']) {
  const b = el('button', label); b.type = 'button'; b.dataset.category = label; b.setAttribute('aria-pressed', String(label === 'All'));
  b.addEventListener('click', () => window.dispatchEvent(new CustomEvent('tool-category-change', { detail: label })));
  categories.append(b);
}
$('tool-menu').querySelector('.catalog-heading').after(categories);
window.addEventListener('tool-category-state', e => { for (const b of categories.querySelectorAll('button')) b.setAttribute('aria-pressed', String(b.dataset.category === e.detail)); });
// Discoverability: one guide shortcut per focused tool, rather than duplicating controls.
for (const [key, config] of Object.entries(TOOLS)) {
  if (!HELP_PAGES['guide/' + key]) continue;
  const card = [...document.querySelectorAll('.tool-card')].find(a => a.hash === '#/' + key);
  if (card) card.dataset.category = categoryFor(key);
}
