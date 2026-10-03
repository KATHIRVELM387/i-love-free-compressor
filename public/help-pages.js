import { mountVideoPages } from './video-pages.js?v=2';
import { GUIDES, CATEGORIES, categoryFor, inputLimit } from './guide-data.js';

const el = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
};
function link(text, href, className = 'button secondary') {
  const a = el('a', text, className); a.href = href; return a;
}
function page(key, title, description) {
  const section = el('section', undefined, 'wrap info-page');
  section.id = key + '-tool'; section.hidden = true;
  const header = el('header', undefined, 'info-heading');
  header.append(el('p', 'I LOVE FREE COMPRESSOR', 'tiny-label'));
  const heading = el('h1', title); heading.id = key + '-heading'; heading.tabIndex = -1;
  header.append(heading, el('p', description));
  section.append(header); document.getElementById('main-content').append(section);
  return section;
}
function block(title, text) {
  const section = el('section', undefined, 'info-block');
  section.append(el('h2', title), el('p', text)); return section;
}
function list(items, numbered = false) {
  const node = el(numbered ? 'ol' : 'ul');
  for (const text of items) node.append(el('li', text));
  return node;
}

export function mountHelpPages(tools, accountPages) {
  const names = { ...tools, ...accountPages, workflow: { title: 'Saved workflows' } };
  const routes = {};
  const register = (key, title, description) => {
    routes[key] = { title, view: key, informational: true };
    return page(key, title, description);
  };
  const about = register('about', 'Useful tools. Less file fuss.', 'A free workspace for everyday images, PDFs, and small creative tasks.');
  const cards = el('div', undefined, 'info-card-grid');
  cards.append(block('40 tools, one workspace', 'Compress photos, prepare PDFs, annotate images, create QR codes, and more. Every tool opens a focused workspace with only the controls needed for that task.'), block('Start without an account', 'Choose a tool and work in your browser. Login is optional. Use it when you want private cloud saves, saved preferences, and activity history.'), block('Keep control of your files', 'Processing happens on your device. Download results locally. A result uploads only when you explicitly choose Save to My Files.'));
  about.append(cards, block('Built for practical tasks', 'This project is for people preparing website images, application uploads, notes, screenshots, and creative materials. It combines open-source browser tools with optional account features.'));
  const open = block('Open-source and evolving', 'You can inspect the source, report a reproducible problem, or suggest an improvement on GitHub.');
  const repo = link('View source on GitHub', 'https://github.com/KATHIRVELM387/i-love-free-compressor'); repo.target = '_blank'; repo.rel = 'noopener noreferrer'; open.append(repo);
  about.append(open, block('Free to use, with practical limits', 'There are no paid tool tiers in this app. Browser memory, file-size limits, and configured cloud quotas still apply. Cloud storage is optional and is not unlimited.'), link('Explore all features', '#/features', 'button primary'), link('Learn how to use the site', '#/how-to-use'));

  const how = register('how-to-use', 'From file to finished.', 'Start with the basics, then open a dedicated guide for the feature you need.');
  const start = block('Your first result', 'Most tools follow these steps:');
  start.append(list(['Choose a tool from All tools, use search, or select a task in the tool finder.','Choose a supported file from your device, drag it into a supported workspace, or use an available sample.','Set the options and inspect the preview. Tool pages show their size and format limits.','Create the result and check its dimensions, file size, and any warnings.','Download the result. Sign in and choose Save to My Files only if you want a private cloud copy.'], true));
  how.append(link('Watch step-by-step video demos', '#/videos', 'button primary'), start);
  const journeys = el('div', undefined, 'info-card-grid');
  for (const [title, text, route] of [
    ['Fit an upload requirement', 'Use Compress for a maximum KB limit, Exact file size for a specific JPG size, or Resize for pixel dimensions.', 'exact'],
    ['Prepare a document', 'Combine existing PDFs with Merge PDFs, or turn photos into a document with Images to PDF.', 'merge-pdf'],
    ['Repeat the same edits', 'Save a resize, watermark, and compression workflow, then run it on new photos.', 'workflow']
  ]) { const item = block(title, text); item.append(link('Read the guide', '#/guide/' + route)); journeys.append(item); }
  how.append(journeys);
  const account = block('Login and sign-up', 'Both use Continue with Google. On your first successful sign-in, the site creates a Member account. Returning users open their existing account. Admin access is assigned separately; public users do not become admins by registering.');
  account.append(link('Create an account', '#/signup', 'button primary'), link('Login', '#/account'));
  how.append(account, block('Save progress intentionally', 'Download results you want to keep. Refreshing or Google sign-in can clear files held in browser memory. Switching image editors starts fresh settings; use Continue editing this photo when available to carry a prepared result forward. Saved workflows contain settings, not source files.'));
  const shortcuts = block('Keyboard and touch', 'Controls have labels and visible keyboard focus. Mobile users can open the Tools drawer for the full navigation.');
  shortcuts.append(list(['Alt + /: focus tool search.','Ctrl/Cmd + V: paste an image into a supported photo tool.','Ctrl/Cmd + Z and Ctrl/Cmd + Shift + Z: undo and redo supported edits.','Escape: close a dialog or the mobile tool drawer.']));
  how.append(shortcuts, link('Browse individual feature guides', '#/features', 'button primary'), link('Troubleshooting & FAQ', '#/faq'));

  const privacy = register('privacy', 'Your files and storage.', 'A plain-language explanation of what stays in your browser and what an optional account saves.');
  for (const [title, text] of [
    ['Local editing', 'Tool processing happens in your browser. Source files and prepared results are held in browser memory until you leave, reload, or clear them. Downloaded copies are saved wherever your browser places downloads.'],
    ['Optional accounts', 'Google sign-in creates or opens your account. The app stores your account profile, role, preferences, and optional activity metadata. Activity records contain tool names and result-size details, not source photos.'],
    ['Private cloud files', 'Save to My Files explicitly uploads a prepared result to private account storage. Files are associated with your account. Admin tools manage roles and quotas; they do not provide access to another member’s saved files.'],
    ['Storage limits', 'Cloud files can be up to 5 MB each, with a maximum of 100 saved files within your quota. Keep 5 MB free to start an upload. Unfinished uploads reserve space until completed or deleted. Your dashboard shows your assigned quota and remaining space.'],
    ['Device preferences', 'Guest workflows, recent-tool shortcuts, favorites, and dismissed-announcement state can be stored in this browser. A signed-in session is stored so you can return without signing in every time. Sign out on a shared device when finished.'],
    ['Removing data', 'Delete individual files in My Files or clear activity in History. Turn off future activity recording in Settings. Account deletion removes cloud files, preferences, history, and the sign-in account. Administrative audit records are retained without your email or display name; local downloads remain on your device.'],
    ['Website requests', 'Hosting services receive normal website requests, and account features contact the configured Supabase project. This app includes no advertising trackers or analytics scripts.']
  ]) privacy.append(block(title, text));
  privacy.append(link('Manage My Files', '#/files'), link('Open account settings', '#/profile'));

  const faq = register('faq', 'A little help when you need it.', 'Search common questions about files, accounts, and downloads.');
  const faqLabel = el('label', 'Search questions'); faqLabel.htmlFor = 'faq-search';
  const faqSearch = el('input'); faqSearch.type = 'search'; faqSearch.id = 'faq-search'; faqSearch.placeholder = 'Try size, login, PDF, or storage…';
  faq.append(faqLabel, faqSearch);
  const faqItems = [
    ['Why did my file stay below the size I entered?', 'Compress uses a maximum size. A file already below that limit can remain smaller. Use Exact file size when you specifically need a JPG at a chosen KB size.', 'exact'],
    ['Does making a small image bigger improve quality?', 'Increasing pixel dimensions stretches existing information. Increasing a JPG’s byte size with padding does not add visual detail.', 'resize'],
    ['Why is my PNG still too large?', 'PNG is lossless, so a quality slider does not reduce it like JPG. Try smaller dimensions or JPG/WebP if their transparency and quality tradeoffs fit your needs.', 'compress'],
    ['Why did transparent areas turn white?', 'JPG does not support transparency. Choose PNG or WebP to preserve it, or explicitly choose a fill color.', 'convert'],
    ['Do I need to sign up?', 'No. All editing tools work without an account. Sign in only for private cloud saves, account preferences, and activity history.', 'account'],
    ['Why can’t I save a file to my account?', 'Sign in with an active account, keep the result at or below 5 MB, and leave at least 5 MB of quota available to begin the upload. Remove unfinished uploads if they are using space.', 'files'],
    ['Can another user see my files?', 'Saved files are private to your account. Admin access manages accounts and quotas, not other members’ file contents.', 'files'],
    ['Why is PDF text extraction empty?', 'Some PDFs contain only scanned images. Extract PDF text reads existing selectable text and does not perform OCR.', 'pdf-text'],
    ['Why won’t my PDF open?', 'Password-protected or damaged PDFs are not supported. Check the file-size and page-count limits, and try an unencrypted copy you are authorized to use.', 'split-pdf'],
    ['Where did the download go?', 'Check your browser’s Downloads list or the download folder configured on your device. Preparing a result alone does not save a local copy; click Download.', 'dashboard'],
    ['Will a file be accepted by my application form?', 'Follow the receiving site’s own format, dimensions, and file-size rules. This app does not validate official photo requirements or guarantee acceptance.', 'details'],
    ['How can I tell whether I am an admin?', 'The account badge shows Member or Admin. An active admin can open Administration. Registering with Google creates a Member account.', 'admin']
  ];
  const faqRows = [];
  for (const [question, answer, key] of faqItems) { const d = el('details', undefined, 'help-question'); d.append(el('summary', question), el('p', answer), link('Related guide', '#/guide/' + key, 'text-button')); faq.append(d); faqRows.push([d, (question + ' ' + answer).toLowerCase()]); }
  const faqEmpty = el('p', 'No matching questions. Try a shorter search.', 'help-empty'); faqEmpty.hidden = true; faq.append(faqEmpty);
  faqSearch.addEventListener('input', () => { let count = 0; for (const [row, text] of faqRows) { row.hidden = !text.includes(faqSearch.value.trim().toLowerCase()); if (!row.hidden) count++; } faqEmpty.hidden = count > 0; });
  const issue = link('Report an issue on GitHub', 'https://github.com/KATHIRVELM387/i-love-free-compressor/issues'); issue.target = '_blank'; issue.rel = 'noopener noreferrer'; faq.append(issue);

  const features = register('features', 'Find a feature. Learn it in minutes.', 'Browse all 40 tools, plus workflows and account features. Each guide explains one feature separately.');
  const searchLabel = el('label', 'Search feature guides'); searchLabel.htmlFor = 'guide-search';
  const search = el('input'); search.id = 'guide-search'; search.type = 'search'; search.placeholder = 'Try resize, watermark, pages, or account…';
  const filters = el('div', undefined, 'category-filters'); filters.setAttribute('aria-label', 'Guide categories');
  let selectedCategory = 'All'; const categoryButtons = [];
  const grid = el('div', undefined, 'guide-directory'), guideCards = [];
  const count = el('p', '', 'field-help'); count.id = 'guide-count'; count.setAttribute('role', 'status');
  const noResults = el('p', 'No matching features. Try another search or category.', 'help-empty'); noResults.hidden = true;
  const clear = el('button', 'Clear filters', 'text-button'); clear.type = 'button';
  function filter() {
    let visible = 0;
    for (const [key, card, text] of guideCards) { card.hidden = (selectedCategory !== 'All' && categoryFor(key) !== selectedCategory) || !search.value.trim().toLowerCase().split(/\s+/).every(word => text.includes(word)); if (!card.hidden) visible++; }
    for (const [category, b] of categoryButtons) b.setAttribute('aria-pressed', String(category === selectedCategory));
    count.textContent = `${visible} feature guide${visible === 1 ? '' : 's'}`; noResults.hidden = visible !== 0;
  }
  for (const category of CATEGORIES) { const b = el('button', category); b.type = 'button'; b.addEventListener('click', () => { selectedCategory = category; filter(); }); categoryButtons.push([category, b]); filters.append(b); }
  clear.addEventListener('click', () => { search.value = ''; selectedCategory = 'All'; filter(); search.focus(); });
  search.addEventListener('input', filter);
  features.append(searchLabel, search, filters, clear, count, grid, noResults);

  for (const [key, guide] of Object.entries(GUIDES)) {
    const title = names[key]?.title || key;
    const guideKey = 'guide/' + key;
    const section = register(guideKey, title + ' — guide', guide.purpose);
    const breadcrumb = el('nav', undefined, 'guide-breadcrumb'); breadcrumb.setAttribute('aria-label', 'Breadcrumb'); breadcrumb.append(link('All feature guides', '#/features', 'text-button'), el('span', ' / ' + title)); section.prepend(breadcrumb);
    const actions = el('div', undefined, 'guide-actions');
    actions.append(link('Open ' + title, '#/' + key, 'button primary'));
    const copy = el('button', 'Copy guide link', 'button secondary'); copy.type = 'button';
    const feedback = el('p', '', 'field-help'); feedback.setAttribute('role', 'status');
    copy.addEventListener('click', async () => {
      const url = new URL('./', location.href); url.hash = '/' + guideKey;
      try { await navigator.clipboard.writeText(url.href); feedback.textContent = 'Guide link copied.'; }
      catch { feedback.replaceChildren(el('span', 'Copy this link: ')); const input = el('input'); input.readOnly = true; input.value = url.href; input.setAttribute('aria-label', 'Guide link'); feedback.append(input); input.focus(); input.select(); }
    });
    const print = el('button', 'Print guide', 'button secondary'); print.type = 'button'; print.addEventListener('click', () => window.print());
    actions.append(copy, print); section.append(actions, feedback);
    const steps = block('How to use it', ''); steps.append(list(guide.steps, true));
    section.append(steps, block('Try this example', guide.example), block('Good to know', guide.note));
    const limits = inputLimit(key); if (limits && !guide.note.includes(limits)) section.append(block('File limits', limits));
    const related = block('Related features', 'Continue with another tool or learn a related task.');
    const relatedLinks = el('div', undefined, 'quick-links'); for (const name of guide.related) if (GUIDES[name]) relatedLinks.append(link(names[name]?.title || name, '#/guide/' + name, 'guide-related-link'));
    related.append(relatedLinks); section.append(related, link('Back to all guides', '#/features', 'text-button'));
    const card = el('article', undefined, 'guide-card'); card.dataset.guide = key;
    card.append(el('span', guide.category, 'guide-category'), el('h2', title), el('p', guide.purpose));
    const cardActions = el('div', undefined, 'guide-card-actions'); cardActions.append(link('Read guide →', '#/' + guideKey, 'text-button'), link('Open feature', '#/' + key, 'text-button')); card.append(cardActions); grid.append(card);
    guideCards.push([key, card, `${title} ${guide.purpose} ${guide.example}`.toLowerCase()]);
  }
  filter();
  mountVideoPages(register, link);
  return routes;
}
