import { filesView, meter, csv, download, setWorkspaceOwner } from './workspace-accounts.js';
import { accountConfig } from './account-config.js';
import { results, setPreferences } from './account-bridge.js?v=1';
import { TOOLS, ACCOUNT_PAGES } from './navigation.js?v=11';

const $ = id => document.getElementById(id);
const authReturnURL = new URL('./', import.meta.url).href;
const configured = /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(accountConfig.url) && !!accountConfig.publishableKey;
let client, createClient, session, profile, revision = 0, loading = configured;
let googleEnabled, providerRequest;
async function checkGoogleProvider() {
  if (!providerRequest) providerRequest = fetch(accountConfig.url + '/auth/v1/settings', { headers: { apikey: accountConfig.publishableKey } })
    .then(async response => { if (!response.ok) throw new Error('Sign-in unavailable'); return (await response.json()).external?.google === true; })
    .catch(() => 'unavailable').finally(() => { providerRequest = null; });
  return providerRequest;
}
let oauthPending = new URL(location.href).searchParams.has('code');
const active = () => !!profile && profile.status === 'active';
const mb = bytes => `${(Number(bytes || 0) / 1000000).toFixed(2)} MB`;
const charge = file => file.state === 'pending' ? 5000000 : Number(file.size_bytes);
function el(tag, text, className) { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node; }
function link(text, href) { const node = el('a', text, 'button secondary'); node.href = href; return node; }
function checked(response) { if (response.error) throw new Error(response.error.message || 'Account service unavailable. Try again.'); return response.data; }
let noticeTimer;
function notice(message) { clearTimeout(noticeTimer); $('account-notice').textContent = message; noticeTimer = setTimeout(() => { $('account-notice').textContent = ''; }, 12000); }
function button(text, action, className = 'button secondary') {
  const node = el('button', text, className); node.type = 'button';
  node.addEventListener('click', async () => {
    node.disabled = true;
    try { await action(node); } catch (error) { notice(error.message || 'Could not complete this action. Try again.'); }
    finally { if (node.isConnected) node.disabled = false; }
  }); return node;
}
// Snapshot credentials for each operation: changing account in another tab must
// never redirect an in-flight save/delete to the newly signed-in account.
function scoped() {
  if (!session || !profile) throw new Error('Please sign in first.');
  return createClient(accountConfig.url, accountConfig.publishableKey, {
    global: { headers: { Authorization: 'Bearer ' + session.access_token } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });
}
function empty(container, message) { container.append(el('p', message, 'account-empty')); }
function guard(container, admin = false) {
  if (loading) { empty(container, 'Checking your account…'); return false; }
  if (!configured) {
    empty(container, 'Account sign-in is being set up. All image tools are ready to use without an account.');
    container.append(link('Continue as guest →', '#/')); return false;
  }
  if (!client) { empty(container, 'Account sign-in could not load. Refresh this page to retry, or continue using guest tools.'); container.append(link('Continue as guest', '#/')); return false; }
  if (!profile) {
    if (googleEnabled !== true) {
      empty(container, googleEnabled === false ? 'Google sign-in is being set up. All image tools remain available without an account.' : 'Sign-in is temporarily unavailable. Please try again, or continue as a guest.');
      container.append(button('Check again', async () => { googleEnabled = undefined; await render(); }), link('Continue as guest', '#/'));
      return false;
    }
    empty(container, 'Sign in to keep your files, preferences, and activity together. Using the image tools never requires an account.');
    container.append(button('Continue with Google', async () => {
      checked(await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: authReturnURL } }));
    }, 'button primary'), link('Continue as guest', '#/'));
    container.append(el('p', 'Google creates your account on first sign-in. Sign-in reloads the page, so download any result you want to keep first. Activity metadata is saved by default; turn it off in Settings. Photos upload only when you choose Save to My Files.', 'field-help'));
    return false;
  }
  if (profile.status !== 'active') {
    empty(container, profile.status === 'deleting' ? 'Account deletion is pending. Retry deletion in Settings to finish cleanup.' : 'Your account is suspended. Guest tools still work. You can sign out or delete your account in Settings.');
    if (document.documentElement.dataset.activeTool !== 'profile') container.append(link('Open Settings', '#/profile'));
    return false;
  }
  if (admin && profile.role !== 'admin') { empty(container, 'Administrator access is required for this page.'); return false; }
  return true;
}
async function render() {
  const route = document.documentElement.dataset.activeTool;
  for (const node of document.querySelectorAll('[data-admin-only]')) node.hidden = !active() || profile.role !== 'admin';
  for (const node of document.querySelectorAll('[data-signout]')) node.hidden = !session;
  $('account-nav').textContent = profile ? '♡ My account' : '♡ Sign in / My account';
  document.getElementById('account-role')?.remove();
  if(profile){ const badge=el('span',profile.role==='admin'?'Admin':'Member','role-badge');badge.id='account-role';$('account-nav').append(badge); }
  $('account-nav').href = profile ? '#/dashboard' : '#/account';
  if (ACCOUNT_PAGES[route]) $('account-nav').setAttribute('aria-current', 'page'); else $('account-nav').removeAttribute('aria-current');
  for (const a of document.querySelectorAll('.account-tabs a')) {
    if (a.hash === location.hash) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  }
  if (!ACCOUNT_PAGES[route]) return;
  const container = $(route + '-content'), token = revision;
  container.replaceChildren();
  if (configured && client && !loading && !profile && googleEnabled === undefined) {
    empty(container, 'Checking sign-in availability…');
    googleEnabled = await checkGoogleProvider();
    if (token === revision && document.documentElement.dataset.activeTool === route) await render();
    return;
  }
  const allowed = guard(container, route === 'admin');
  if (!allowed && !(route === 'profile' && profile && !loading)) return;
  const current = () => token === revision && document.documentElement.dataset.activeTool === route;
  try {
    if (route === 'account') {
      container.append(el('p', `You are signed in as ${profile.display_name || session.user.email || 'a member'}.`), link('Open my dashboard →', '#/dashboard')); return;
    }
    if (route === 'profile') { settings(container); return; }
    const api = scoped();
    if (route === 'dashboard' || route === 'files') {
      const files = checked(await api.from('account_files').select('*').order('created_at', { ascending: false }));
      if (!current()) return;
      const used = files.reduce((sum, f) => sum + charge(f), 0);
      container.append(el('p', `${files.length} saved files · ${mb(used)} of ${mb(profile.quota_bytes)} used`, 'account-summary'));
      meter(container,used,profile.quota_bytes);
      container.append(el('p', 'Save up to 5 MB per file. Keep 5 MB free to begin an upload. Uploads reserve 5 MB until complete; unfinished uploads can be removed below. Download files to keep your own backup.', 'field-help'));
      if (route === 'dashboard') {
        container.prepend(el('h2', `Welcome, ${profile.display_name || 'image maker'}`));
        container.append(link('Manage my files', '#/files'), link('View activity', '#/history'), el('h2', 'Favorite tools'));
        const favorites = Array.isArray(profile.preferences.favorites) ? profile.preferences.favorites.filter(name => typeof name === 'string' && Object.hasOwn(TOOLS, name)) : [];
        if (!favorites.length) empty(container, 'Choose your favorite tools in Settings for quick access here.');
        const grid = el('div', undefined, 'account-grid');
        for (const name of favorites) grid.append(link(TOOLS[name].title, '#/' + name));
        container.append(grid, link('Choose favorites & defaults', '#/profile'),link('Saved workflows', '#/workflow'));
        const recent=checked(await api.from('account_history').select('*').order('created_at',{ascending:false}).limit(5));
        if(!current())return;container.append(el('h2','Recent activity'));
        for(const item of recent)container.append(el('p',`${TOOLS[item.tool]?.title||item.tool} · ${new Date(item.created_at).toLocaleString()}`));
        return;
      }
      await filesView(container,files,{api,current,profile,button,field,select,render,notice,savePreferences});
    }
    if (route === 'history') {
      const entries = checked(await api.from('account_history').select('*').order('created_at', { ascending: false }).limit(100));
      if (!current()) return;
      container.append(el('p', 'Your latest 100 results. History contains tool names and result sizes, not photos. You can turn recording off in Settings.'));
      container.append(button('Export history CSV',()=>download(new Blob([csv([['Date','Tool','Details'],...entries.map(e=>[e.created_at,TOOLS[e.tool]?.title||e.tool,e.details])])],{type:'text/csv'}),'activity-history.csv')));
      if (!entries.length) empty(container, 'No activity recorded yet.');
      else container.append(button('Clear history', async () => {
        if (!confirm('Delete all your activity history?')) return;
        checked(await api.from('account_history').delete().eq('user_id', profile.id));
        if (current()) await render();
      }));
      for (const entry of entries) {
        const row = el('article', undefined, 'account-row');
        row.append(el('strong', TOOLS[entry.tool]?.title || entry.tool), el('span', entry.details), el('time', new Date(entry.created_at).toLocaleString())); container.append(row);
      }
    }
    if (route === 'admin') await admin(container, api, current);
  } catch (error) { if (current()) empty(container, 'Could not load this page: ' + error.message); }
}
function field(form, label, type, value, options = {}) {
  const wrap = el('label', label), input = document.createElement('input'); input.type = type;
  if (type === 'checkbox') input.checked = !!value; else input.value = value ?? '';
  Object.assign(input, options); wrap.append(input); form.append(wrap); return input;
}
function select(form, label, values, value) {
  const wrap = el('label', label), input = document.createElement('select');
  for (const [key, text] of values) { const option = el('option', text); option.value = key; input.append(option); }
  input.value = value; wrap.append(input); form.append(wrap); return input;
}
function settings(container) {
  const api = scoped(), owner = profile.id;
  container.append(el('p', `Signed in as ${session.user.email || 'Google member'} · ${profile.role}`));
  if (active()) {
    const prefs = profile.preferences || {}, form = el('form', undefined, 'account-form');
    const name = field(form, 'Display name', 'text', profile.display_name, { maxLength: 80 });
    const format = select(form, 'Preferred compression format', [['image/jpeg','JPG'],['image/png','PNG'],['image/webp','WebP']], prefs.format || 'image/jpeg');
    const target = field(form, 'Default target (KB)', 'number', prefs.targetKB || 50, { min: 1, max: 10000, required: true });
    const resize = field(form, 'Allow smaller dimensions when needed', 'checkbox', prefs.allowResize !== false);
    const history = field(form, 'Save activity history (tool and result size)', 'checkbox', prefs.history !== false);
    form.append(el('p', 'Defaults apply when you open your next photo in Compress or Exact size. Exact size always uses JPG.', 'field-help'));
    const favorites = el('fieldset', undefined, 'favorite-options'); favorites.append(el('legend', 'Favorite tools'));
    const boxes = Object.entries(TOOLS).map(([key, tool]) => [key, field(favorites, tool.title, 'checkbox', Array.isArray(prefs.favorites) && prefs.favorites.includes(key))]); form.append(favorites);
    const save = el('button', 'Save settings', 'button primary'); save.type = 'submit'; form.append(save);
    form.addEventListener('submit', async event => {
      event.preventDefault(); if (!form.reportValidity()) return; save.disabled = true;
      const preferences = { ...profile.preferences, format: format.value, targetKB: Number(target.value), allowResize: resize.checked, history: history.checked, favorites: boxes.filter(([, box]) => box.checked).map(([key]) => key) };
      try {
        const updated = checked(await api.from('account_profiles').update({ display_name: name.value.trim(), preferences }).eq('id', owner).select().single());
        if (profile?.id === owner) { profile = updated; setPreferences(preferences); notice('Settings saved.'); }
      } catch (error) { notice(error.message); } finally { save.disabled = false; }
    }); container.append(form);
  }
  const danger = el('section', undefined, 'account-danger'); danger.append(el('h2', 'Delete my account'), el('p', 'Permanently delete your saved files, history, preferences, and sign-in account. Local downloads remain on your device. Administrative audit records are retained without your email or display name.'));
  const confirmation = field(danger, 'Type DELETE to confirm', 'text', '', { autocomplete: 'off', placeholder: 'DELETE' });
  danger.append(button('Delete my account permanently', async () => {
    if (confirmation.value !== 'DELETE') throw new Error('Type DELETE exactly to confirm account deletion.');
    const result = await api.functions.invoke('delete-account', { body: { confirmation: 'DELETE' } });
    if (result.error) {
      let reason = 'Deletion could not finish. Check your connection and retry. If you are the only administrator, assign another active administrator first.';
      try { reason = (await result.error.context.json()).error || reason; } catch {}
      throw new Error(reason);
    }
    if (profile?.id === owner) { await client.auth.signOut({ scope: 'local' }); await refresh(); location.hash = '#/account'; notice('Your account and saved files have been deleted.'); }
  })); container.append(danger);
}
async function admin(container, api, current) {
  const [users, usage, audit,stats,announcement] = await Promise.all([
    api.rpc('admin_account_list').then(checked), api.rpc('admin_storage_usage').then(checked),
    api.from('account_audit').select('*').order('created_at', { ascending: false }).limit(100).then(checked),api.rpc('admin_workspace_stats').then(checked),api.rpc('site_announcement').then(checked)
  ]);
  if (!current()) return;
  const cards=el('div',undefined,'stats-grid');for(const [key,label] of [['total','Users'],['active','Active'],['suspended','Suspended'],['admins','Admins'],['files','Saved files']]){const card=el('div',undefined,'stat-card');card.append(el('strong',String(stats[key])),el('span',label));cards.append(card);}container.append(cards);
  const announcementForm=el('div',undefined,'account-form');const message=field(announcementForm,'Site announcement (blank removes it)','text',announcement.body,{maxLength:500});announcementForm.append(button('Publish announcement',async()=>{checked(await api.rpc('admin_set_announcement',{p_body:message.value}));if(current()){notice('Announcement updated.');window.dispatchEvent(new Event('announcement-updated'));}}));container.append(announcementForm);
  container.append(el('p', `${mb(usage.used_bytes)} reserved or stored across the site. Administrators manage access and quotas; other members’ files remain private.`));
  const limits = el('div', undefined, 'account-form');
  const max = field(limits, 'Site storage limit (MB, maximum 800)', 'number', usage.limit_bytes / 1000000, { min: 0, max: 800, step: 1 });
  limits.append(button('Update site limit', async () => {
    if (!max.reportValidity() || !max.value) return;
    if (!confirm(`Set the site storage limit to ${max.value} MB? Existing files will remain.`)) return;
    checked(await api.rpc('admin_storage_limit', { p_bytes: Number(max.value) * 1000000 })); if (current()) { notice('Storage limit updated.'); await render(); }
  })); container.append(limits, el('h2', `Members (${users.length}${users.length === 500 ? ', latest 500 shown' : ''})`));
  const search = field(container, 'Find a member by name or email', 'search', '', { placeholder: 'Search members' });
  const roleFilter=select(container,'Filter role',[['','All roles'],['member','Members'],['admin','Admins']],'');const statusFilter=select(container,'Filter status',[['','All statuses'],['active','Active'],['suspended','Suspended'],['deleting','Deleting']],'');
  const rows = [];
  for (const user of users) {
    const row = el('article', undefined, 'account-row admin-row');
    row.append(el('strong', user.display_name || 'Member'), el('span', user.email), el('span', `${mb(user.used_bytes)} used · ${user.id}`));
    if (user.id === profile.id || user.status === 'deleting') row.append(el('p', user.id === profile.id ? 'Your account — another administrator must change your access.' : 'Deletion in progress.'));
    else {
      const role = select(row, 'Role', [['member','Member'],['admin','Administrator']], user.role);
      const status = select(row, 'Access', [['active','Active'],['suspended','Suspended']], user.status);
      const quota = field(row, 'Quota (MB, maximum 20)', 'number', user.quota_bytes / 1000000, { min: 0, max: 20, step: 1 });
      row.append(button('Save access changes', async () => {
        if (!quota.reportValidity() || !quota.value) return;
        if (!confirm(`Update ${user.email} to ${role.value}, ${status.value}, with ${quota.value} MB storage?`)) return;
        checked(await api.rpc('admin_update_account', { p_id: user.id, p_role: role.value, p_status: status.value, p_quota: Number(quota.value) * 1000000 }));
        if (current()) { notice('Member access updated.'); await render(); }
      }));
    }
    rows.push([row, `${user.email} ${user.display_name}`.toLowerCase(),user]); container.append(row);
  }
  const filter=()=>{for(const [row,text,u]of rows)row.hidden=!(text.includes(search.value.trim().toLowerCase())&&(!roleFilter.value||u.role===roleFilter.value)&&(!statusFilter.value||u.status===statusFilter.value));};for(const input of [search,roleFilter,statusFilter])input.addEventListener('input',filter);
  container.append(el('h2', 'Recent admin actions'));
  if (!audit.length) empty(container, 'No administrative changes yet.');
  const auditControls=el('div',undefined,'account-toolbar');container.append(auditControls);const actionFilter=field(auditControls,'Filter action','search',''),after=field(auditControls,'From date','date',''),before=field(auditControls,'Through date','date','');
  const log=el('div');container.append(log);const filterAudit=()=>{log.replaceChildren();for(const event of audit){const day=event.created_at.slice(0,10);if(event.action.includes(actionFilter.value)&&(!after.value||day>=after.value)&&(!before.value||day<=before.value))log.append(el('p',`${new Date(event.created_at).toLocaleString()} · ${event.action} · actor ${event.actor_id||'system'} · target ${event.target_id||'site'} · ${JSON.stringify(event.details)}`,'audit-entry'));}};for(const input of [actionFilter,after,before])input.addEventListener('input',filterAudit);filterAudit();
}
function saveButtons() {
  for (const [id, result] of results) {
    if ($(id + '-save')) continue;
    const anchor = $(id); if (!anchor) continue;
    const save = button(result.blob.size > 5000000 ? 'Cloud limit: 5 MB' : 'Save to My Files', async node => {
      if (!active()) {
        notice(configured ? 'Download this result first, then open My account to sign in. Sign-in reloads the page.' : 'Cloud saving is being set up. Use Download to keep this result on your device.');
        return;
      }
      const api = scoped(), owner = profile.id, token = revision;
      node.textContent = 'Saving…'; let file;
      try {
        file = checked(await api.rpc('reserve_account_file', { p_name: (anchor.download || 'result').slice(0, 120), p_mime: result.blob.type || 'application/zip', p_size: result.blob.size, p_tool: result.tool }).single());
        const path = `${owner}/${file.id}`;
        checked(await api.storage.from('account-files').upload(path, result.blob, { contentType: file.mime, upsert: false }));
        checked(await api.rpc('complete_account_file', { p_id: file.id }));
        if (token === revision) { node.textContent = 'Saved ✓'; notice('Saved privately to My Files.'); }
      } catch (error) {
        // Keep a charged reservation after an interrupted upload: My Files can
        // safely remove both object and reservation, even after a late response.
        node.textContent = 'Save to My Files';
        throw new Error(error.message + (file ? ' Check My Files for an unfinished upload before retrying.' : ''));
      }
    });
    save.id = id + '-save'; save.classList.add('cloud-save');
    if (result.blob.size > 5000000) { save.disabled = true; save.title = 'Cloud saves support files up to 5 MB. Your local download is still available.'; }
    anchor.after(save);
  }
}
async function refresh() {
  const token = ++revision;
  profile = null; session = null; setWorkspaceOwner(null); setPreferences(); window.dispatchEvent(new CustomEvent('workspace-identity',{detail:{signedIn:false}}));
  // Clear every private page, including currently hidden pages, on auth change.
  for (const name of Object.keys(ACCOUNT_PAGES)) $(name + '-content').replaceChildren();
  loading = true; render();
  try {
    const response = checked(await client.auth.getSession());
    if (token !== revision) return;
    if (response.session) {
      checked(await client.auth.getUser());
      const data = checked(await client.from('account_profiles').select('*').eq('id', response.session.user.id).single());
      if (token !== revision) return;
      session = response.session; profile = data; setWorkspaceOwner(profile.id);
      if (active()) setPreferences(profile.preferences);
      window.dispatchEvent(new CustomEvent('workspace-identity',{detail:{signedIn:active()}}));
    }
  } catch { if (token === revision) notice('Account service could not be reached. Guest tools still work. Try signing in again.'); }
  finally { if (token === revision) { loading = false;
      if (oauthPending && profile) { oauthPending = false; history.replaceState(null, '', location.pathname + '#/dashboard'); window.dispatchEvent(new HashChangeEvent('hashchange')); }
      render(); } }
}
const live = el('div', '', 'account-notice'); live.id = 'account-notice'; live.setAttribute('role', 'status'); live.setAttribute('aria-live', 'polite'); $('app-shell').append(live);
live.addEventListener('click', () => { live.textContent = ''; });
window.addEventListener('toolchange', render);
window.addEventListener('account-result', async event => {
  saveButtons();
  if (!active() || profile.preferences.history === false) return;
  try { const api = scoped(); checked(await api.rpc('record_account_activity', { p_tool: event.detail.tool, p_details: `${event.detail.bytes.toLocaleString()} bytes prepared` })); }
  catch { notice('Your result is ready. Activity history could not be saved.'); }
});
for (const node of document.querySelectorAll('[data-signout]')) node.addEventListener('click', async () => {
  node.disabled = true;
  try { checked(await client.auth.signOut({ scope: 'local' })); await refresh(); notice('Signed out on this device.'); location.hash = '#/account'; }
  catch (error) { notice(error.message); } finally { node.disabled = false; }
});
saveButtons(); render();
if (configured) {
  try {
    ({ createClient } = await import('./vendor/supabase.js'));
    client = createClient(accountConfig.url, accountConfig.publishableKey, { auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true } });
    client.auth.onAuthStateChange(event => { if (event !== 'INITIAL_SESSION') setTimeout(refresh, 0); });
    await refresh();

  } catch { loading = false; notice('Account sign-in is temporarily unavailable. All guest tools still work.'); render(); }
}

async function savePreferences(key,value){if(!active())throw Error('Sign in to save account settings.');const api=scoped(),owner=profile.id;const preferences={...profile.preferences,[key]:value};const updated=checked(await api.from('account_profiles').update({preferences}).eq('id',owner).select().single());if(profile?.id===owner){profile=updated;setPreferences(preferences);}return updated;}
window.addEventListener('save-workspace-preferences',event=>{if(!active()){event.detail.reject(Error('Sign in to save to your account.'));return;}savePreferences(event.detail.key,event.detail.value).then(event.detail.resolve,event.detail.reject);});
window.addEventListener('request-workspace-identity',()=>window.dispatchEvent(new CustomEvent('workspace-identity',{detail:{signedIn:active()}})));

// Announcements contain only public, administrator-authored plain text.
async function announcement(){
 if(!configured)return;
 try {const response=await fetch(accountConfig.url+'/rest/v1/rpc/site_announcement',{method:'POST',headers:{apikey:accountConfig.publishableKey,'Content-Type':'application/json'},body:'{}'});if(!response.ok)return;const data=await response.json();document.getElementById('site-announcement')?.remove();if(!data.body)return;let dismissed;try{dismissed=localStorage.getItem('ilfc-announcement-dismissed');}catch{}if(dismissed===String(data.revision))return;const box=el('div',undefined,'announcement wrap');box.id='site-announcement';box.append(el('p',data.body),button('Dismiss',()=>{try{localStorage.setItem('ilfc-announcement-dismissed',String(data.revision));}catch{}box.remove();}));document.querySelector('.site-header').after(box);}catch{}
}
announcement();window.addEventListener('announcement-updated',announcement);
