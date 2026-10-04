import assert from 'node:assert/strict';
import { browserTest } from './browser-harness.mjs';
const b=await browserTest();
const visible=()=>b.evaluate("[...document.querySelectorAll('#side-links a')].filter(a=>a.getClientRects().length).map(a=>a.hash)");
try {
  await b.set('nav-search','workflow');
  assert.deepEqual(await visible(),['#/','#/workflow'],'Search must include the workflow and hide unrelated account/help links');
  await b.set('nav-search','video');assert.deepEqual(await visible(),['#/','#/videos']);
  await b.set('nav-search','BORDER');assert.deepEqual(await visible(),['#/','#/frame']);
  await b.set('nav-search','sha 256');assert.deepEqual(await visible(),['#/','#/checksum']);
  await b.set('nav-search','no-such-tool');assert.deepEqual(await visible(),['#/']);
  assert.equal(await b.evaluate("!document.getElementById('nav-empty').hidden"),true);
  await b.set('nav-search','admin');assert.deepEqual(await visible(),['#/'],'Search must not reveal admin links to guests');
  await b.evaluate("document.getElementById('nav-clear').click()");
  assert.equal((await visible()).includes('#/about'),true);
  await b.evaluate("localStorage.setItem('ilfc-guest-favorites',JSON.stringify(['resize']));window.dispatchEvent(new Event('preferences-changed'))");
  await b.set('nav-search','border');assert.deepEqual(await visible(),['#/','#/frame'],'Favorites participate in search');
  for(const width of [390,768]) {
    await b.cdp('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});
    await b.evaluate("document.getElementById('menu-toggle').click()");
    await b.set('nav-search','image resize');
    assert.equal((await visible()).includes('#/resize'),true);
    await b.evaluate("document.getElementById('nav-search').focus()");
    await b.cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
    await b.until("document.documentElement.dataset.activeTool==='resize'&&!document.getElementById('app-shell').inert");
    await b.go('');
  }
  assert.deepEqual(b.errors,[]);
  console.log('PASS Sidebar search across tools/workflows/help/favorites/accounts, aliases, no results, clear, keyboard and mobile');
} finally {await b.close();}
