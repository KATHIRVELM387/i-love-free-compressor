// Small self-hosted walkthroughs. Media is requested only after a visitor chooses a demo.
export const DEMOS = [
  { key:'tour', title:'Meet your everyday toolkit', label:'Website tour', duration:'30 sec', route:'', description:'Find a tool, open a focused workspace, and get help when you need it.', steps:[['Your everyday toolkit','Start on All tools. Every tool works without an account.'],['Find your tool','Search for a task or choose Images, PDF, Creative, or Web, then open a tool card.'],['Open a workspace','Choose Compress images to see its upload area and settings. Try a sample photo to practise.'],['Learn as you go','Open Help for this tool for instructions, examples, and limits.']] },
  { key:'compress', title:'Make an image lighter', label:'Compression demo', duration:'30 sec', route:'compress', description:'Follow a sample image from the upload area to a smaller, downloadable result.', steps:[['Choose Compress images','Open the tool from the homepage. Use Try a sample photo to practise without uploading your own file.'],['Set your limit','Enter 100 in Maximum file size and choose JPG. A maximum is an upper limit, not an exact output size.'],['Create the result','Select Compress photo. The tool processes the sample locally and shows its size and preview.'],['Download your image','Use Download photo to save the result. Actual sizes depend on your image and settings.']] },
  { key:'resize', title:'Get the dimensions just right', label:'Resize demo', duration:'30 sec', route:'resize', description:'Change an image’s width while keeping its proportions, then download the result.', steps:[['Open Resize images','Choose Resize images, then load a photo or select Try a sample photo.'],['Choose the dimensions','Keep the aspect-ratio lock enabled and enter 800 in Width. Height updates to preserve proportions.'],['Check your result','Select Resize photo. Check the output dimensions and preview before saving.'],['Download and use it','Download photo saves your resized image. Larger dimensions do not recover missing detail.']] }
];
const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
export function mountVideoPages(register,link){
 const page=register('videos','A quick watch. A confident start.','Short walkthroughs of the actual website, with on-screen instructions. Choose a demo and follow along at your own pace.');
 const layout=node('div',undefined,'video-layout');
 const playlist=node('div',undefined,'video-playlist');playlist.setAttribute('aria-label','Choose a video demo');
 const player=node('section',undefined,'video-player');
 const title=node('h2');title.id='demo-title';
 const video=node('video');video.id='demo-video';video.controls=false;video.playsInline=true;video.preload='none';video.setAttribute('aria-labelledby','demo-title');video.width=1280;video.height=900;
 const frame=node('div',undefined,'demo-video-frame');const play=node('button','▶', 'demo-play-button');play.type='button';play.id='demo-play';play.setAttribute('aria-label','Play selected demo');frame.append(video,play);
 const fallback=node('p');fallback.append(link('Download this video','videos/tour.mp4','text-button'));video.append(fallback);
 const description=node('p',undefined,'video-description');
 const status=node('p','', 'field-help');status.id='video-status';status.setAttribute('role','status');
 const actions=node('div',undefined,'video-actions');const open=link('Try it yourself','#/','button primary');const download=link('Download video','videos/tour.mp4','button secondary');download.download='website-tour.mp4';actions.append(open,download);
 const transcript=node('details',undefined,'video-transcript');transcript.open=true;const summary=node('summary','Written walkthrough');const steps=node('ol');transcript.append(summary,steps);
 player.append(title,frame,description,status,actions,transcript);layout.append(playlist,player);page.append(layout);
 const note=node('p','Videos have on-screen text and optional English captions, with no audio. Playback starts only when you press Play. You can also download a clip or follow its written walkthrough.','video-note');page.append(note);
 let selected;
 function choose(demo,updateURL=true){
  selected=demo;video.pause();status.textContent='';title.textContent=demo.title;description.textContent=demo.description;
  video.poster=`videos/${demo.key}.jpg`;video.dataset.source=`videos/${demo.key}.mp4`;video.removeAttribute('src');video.controls=false;play.hidden=false;play.setAttribute('aria-label','Play '+demo.label);
  video.querySelectorAll('track').forEach(t=>t.remove());const track=node('track');track.kind='captions';track.label='English';track.srclang='en';track.src=`videos/${demo.key}.vtt`;video.append(track);video.load();
  fallback.firstChild.href=download.href=`videos/${demo.key}.mp4`;download.download=`${demo.key}-demo.mp4`;open.href='#/'+demo.route;open.textContent=demo.route?'Try '+(demo.key==='resize'?'Resize images':'Compress images'):'Explore all tools';
  steps.replaceChildren();for(const [heading,text]of demo.steps){const li=node('li');li.append(node('strong',heading),node('p',text));steps.append(li);}
  for(const b of playlist.children)b.setAttribute('aria-pressed',String(b.dataset.demo===demo.key));
  if(updateURL){const url=new URL(location.href);url.hash='/videos/'+demo.key;history.replaceState(null,'',url);}
 }
 for(const [i,demo]of DEMOS.entries()){
  const button=node('button',undefined,'demo-choice');button.type='button';button.dataset.demo=demo.key;
  const img=node('img');img.src=`videos/${demo.key}.jpg`;img.alt='';img.width=320;img.height=200;img.loading='lazy';
  const info=node('span');info.append(node('small',`${String(i+1).padStart(2,'0')} / ${demo.duration}`),node('strong',demo.label),node('span',demo.description));button.append(img,info);button.onclick=()=>choose(demo);playlist.append(button);
 }
 play.addEventListener('click',async()=>{video.src=video.dataset.source;video.controls=true;play.hidden=true;try{await video.play();}catch(error){if(error.name!=='AbortError')status.textContent='Playback could not start. Use the video controls or follow the written walkthrough below.';}});
 video.addEventListener('error',()=>{status.textContent='This video could not load. Try the download link, or follow the written walkthrough below.';});
 // Each clip is directly linkable while sharing one accessible player.
 const activate=()=>{const route=document.documentElement.dataset.activeTool;if(route==='videos'){const key=location.hash.split('/')[2];const demo=DEMOS.find(d=>d.key===key)||DEMOS[0];if(selected!==demo)choose(demo,false);}else video.pause();};
 window.addEventListener('toolchange',activate);
 // Link from the matching written guides and workspaces.
 for(const demo of DEMOS.filter(d=>d.route)){const guide=document.getElementById('guide/'+demo.route+'-tool');guide?.querySelector('.guide-actions')?.append(link('Watch video demo','#/videos/'+demo.key,'button secondary'));}
 const context=link('Watch video demo','#/videos','text-button');context.id='current-tool-video';context.hidden=true;document.getElementById('workspace-nav').append(context);
 window.addEventListener('toolchange',()=>{const key=document.documentElement.dataset.activeTool;context.hidden=!['compress','resize'].includes(key);context.href='#/videos/'+key;});
 return page;
}
