import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

export async function browserTest() {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const profile = await mkdtemp(join(tmpdir(), 'ilfc-release03-'));
  const downloads = join(profile, 'downloads');
  await mkdir(downloads);
  const csp = (await readFile(join(root, 'public/_headers'), 'utf8')).split('\n').find(s => s.includes('Content-Security-Policy:')).split('Content-Security-Policy: ')[1];
  const server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const file = resolve(root, 'public', '.' + (pathname === '/' ? '/index.html' : pathname));
      if (!file.startsWith(join(root, 'public') + '/')) { res.writeHead(403).end(); return; }
      const data = pathname === '/account-config.js' ? Buffer.from("export const accountConfig={url:'',publishableKey:''};") : await readFile(file);
      res.writeHead(200, { 'Content-Type': ({ '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.mjs':'text/javascript', '.svg':'image/svg+xml' })[extname(file)] || 'application/octet-stream', 'Content-Security-Policy':csp });
      res.end(data);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}/`;
  const chrome = spawn(process.env.CHROME_BIN || '/usr/bin/google-chrome', ['--headless=new','--disable-gpu','--disable-dev-shm-usage','--no-first-run','--no-default-browser-check','--remote-debugging-pipe',`--user-data-dir=${profile}`,'about:blank'], { stdio:['ignore','ignore','pipe','pipe','pipe'] });
  let seq=0, buffer='', session, log='';
  const pending=new Map(), errors=[], external=[];
  chrome.stderr.on('data', d => log+=d);
  function cdp(method, params={}, target=session) {
    return new Promise((resolve,reject) => {
      const id=++seq, timer=setTimeout(()=>{pending.delete(id);reject(Error('Timeout: '+method+' '+log.slice(-500)));},60000);
      pending.set(id,{resolve,reject,timer});
      chrome.stdio[3].write(JSON.stringify({id,method,params,...(target?{sessionId:target}:{})})+'\0');
    });
  }
  chrome.stdio[4].on('data', d => {
    buffer+=d.toString(); let end;
    while ((end=buffer.indexOf('\0'))>=0) {
      const m=JSON.parse(buffer.slice(0,end)); buffer=buffer.slice(end+1);
      if (pending.has(m.id)) { const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result); }
      if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);
      if(m.method==='Log.entryAdded'&&m.params.entry.level==='error'&&/Content Security Policy|CORS/.test(m.params.entry.text))errors.push(m.params.entry.text);
      if(m.method==='Network.requestWillBeSent'&&!m.params.request.url.startsWith(base)&&!m.params.request.url.startsWith('blob:')&&!m.params.request.url.startsWith('data:'))external.push(m.params.request.url);
      if(m.method==='Page.javascriptDialogOpening')cdp('Page.handleJavaScriptDialog',{accept:true}).catch(()=>{});
    }
  });
  const evaluate=async expression=>{const r=await cdp('Runtime.evaluate',{expression,awaitPromise:true,replMode:true,returnByValue:true,userGesture:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  const until=async expression=>{for(let i=0;i<600;i++){if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,50));}throw Error('Condition not met: '+expression);};
  const set=async(id,value)=>evaluate(`{const n=document.getElementById(${JSON.stringify(id)});n.value=${JSON.stringify(value)};n.dispatchEvent(new Event('input',{bubbles:true}));n.dispatchEvent(new Event('change',{bubbles:true}));}`);
  const go=async name=>{await evaluate(`location.hash=${JSON.stringify('#/'+name)}`);await until(`document.documentElement?.dataset.activeTool===${JSON.stringify(name||'home')}`);};
  const close=async()=>{
    await new Promise(resolve=>{if(chrome.exitCode!==null||chrome.signalCode!==null)return resolve();chrome.once('exit',resolve);chrome.kill('SIGKILL');});
    server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
    for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error('Browser closed'));}
    await rm(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100});
  };
  try {
    const {targetId}=await cdp('Target.createTarget',{url:'about:blank'});
    ({sessionId:session}=await cdp('Target.attachToTarget',{targetId,flatten:true}));
    for(const domain of ['Page','Runtime','Network','Log'])await cdp(domain+'.enable');
    await cdp('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloads});
    await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
    await cdp('Page.navigate',{url:base});await until("document.documentElement?.dataset.activeTool==='home' && !!document.querySelector('.footer-links')");
    return {root,base,cdp,evaluate,until,set,go,errors,external,downloads,close,screenshot:async name=>{await mkdir(join(root,'test-artifacts'),{recursive:true});const r=await cdp('Page.captureScreenshot',{format:'png'});await writeFile(join(root,'test-artifacts',name),Buffer.from(r.data,'base64'));}};
  } catch(e) { await close();throw e; }
}
