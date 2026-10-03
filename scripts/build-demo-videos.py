"""Build captioned MP4 walkthroughs from capture-demos.mjs screenshots.
Requires Pillow and FFmpeg. Set FFMPEG_BIN when ffmpeg is not on PATH.
Only generated demo media is published; build tools stay local.
"""
from pathlib import Path
import os, subprocess
from PIL import Image, ImageDraw, ImageFont
ROOT=Path(__file__).resolve().parent.parent
FRAMES=ROOT/'test-artifacts/demo-frames'
OUT=ROOT/'public/videos'
OUT.mkdir(exist_ok=True)
FFMPEG=os.environ.get('FFMPEG_BIN','ffmpeg')
FONT=os.environ.get('DEMO_FONT_DIR','/usr/share/fonts/truetype/dejavu')
regular=lambda size:ImageFont.truetype(str(Path(FONT)/'DejaVuSans.ttf'),size)
bold=lambda size:ImageFont.truetype(str(Path(FONT)/'DejaVuSans-Bold.ttf'),size)
DATA={
 'tour':('Meet your everyday toolkit',[
  ('01 / YOUR TOOLKIT','40 free tools. Start without signing up.'),
  ('02 / FIND A TOOL','Search a task, then choose its tool card.'),
  ('03 / YOUR WORKSPACE','Upload a photo or use the built-in sample.'),
  ('04 / GET SOME GUIDANCE','Open Help for this tool for steps, examples, and limits.')]),
 'compress':('Make an image lighter',[
  ('01 / CHOOSE YOUR IMAGE','Open Compress images. Try a sample photo to practise.'),
  ('02 / SET YOUR LIMIT','Enter 100 KB and choose JPG as the output format.'),
  ('03 / CREATE YOUR RESULT','Select Compress photo. Check the preview and file size.'),
  ('04 / READY TO DOWNLOAD','Choose Download photo. Your result stays on your device.')]),
 'resize':('Get the dimensions just right',[
  ('01 / START WITH A PHOTO','Open Resize images with a photo or the built-in sample.'),
  ('02 / CHOOSE A WIDTH','Keep the aspect ratio locked. Set Width to 800 pixels.'),
  ('03 / CHECK YOUR RESULT','Select Resize photo and check the output dimensions.'),
  ('04 / SAVE YOUR IMAGE','Choose Download photo to keep your resized image.')])}
FPS=15
FRAMES_PER_SCENE=112 # 7.467 seconds per scene, about 30 seconds total.
def timestamp(seconds):
 ms=round(seconds*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02}.{ms%1000:03}'
for key,(title,scenes) in DATA.items():
 bases=[]
 for i,(label,instruction) in enumerate(scenes):
  frame=Image.new('RGB',(1280,900),'#faf9f6');d=ImageDraw.Draw(frame)
  d.rounded_rectangle((25,18,64,56),radius=11,fill='#5145cd');d.text((36,22),'♥',font=regular(25),fill='white')
  d.text((78,26),'I LOVE FREE COMPRESSOR',font=bold(15),fill='#51415f')
  d.text((650,24),title,font=regular(19),fill='#766382')
  shot=Image.open(FRAMES/f'{key}-{i+1}.png').convert('RGB').resize((1168,730),Image.Resampling.LANCZOS)
  frame.paste(shot,(56,77));d.rounded_rectangle((54,75,1225,808),radius=4,outline='#e1d8eb',width=2)
  d.rectangle((0,824,1280,900),fill='#eee9f7')
  d.text((36,838),label,font=bold(12),fill='#5145cd');d.text((36,859),instruction,font=regular(20),fill='#51415f')
  bases.append(frame)
 poster=bases[0].copy();poster.thumbnail((960,675));poster.save(OUT/f'{key}.jpg',quality=88,optimize=True)
 captions=['WEBVTT','']
 for i,(_,line) in enumerate(scenes):captions += [f'{timestamp(i*FRAMES_PER_SCENE/FPS)} --> {timestamp((i+1)*FRAMES_PER_SCENE/FPS)}',line,'']
 (OUT/f'{key}.vtt').write_text('\n'.join(captions))
 proc=subprocess.Popen([FFMPEG,'-hide_banner','-loglevel','error','-y','-f','rawvideo','-vcodec','rawvideo','-pix_fmt','rgb24','-s','1280x900','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','veryfast','-crf','25','-pix_fmt','yuv420p','-movflags','+faststart',str(OUT/f'{key}.mp4')],stdin=subprocess.PIPE)
 try:
  for i,base in enumerate(bases):
   for tick in range(FRAMES_PER_SCENE):
    frame=Image.blend(bases[i-1],base,tick/6) if i and tick<6 else base.copy()
    d=ImageDraw.Draw(frame)
    for step in range(4):
     x=36+step*305;d.rounded_rectangle((x,894,x+292,898),radius=2,fill='#dbd2eb')
     progress=1 if step<i else min(1,tick/(FRAMES_PER_SCENE-1)) if step==i else 0
     if progress:d.rectangle((x,894,x+max(2,292*progress),898),fill='#7964b7')
    proc.stdin.write(frame.tobytes())
 finally:proc.stdin.close()
 if proc.wait()!=0:raise RuntimeError(f'Video encoding failed: {key}')
 print(f'{key}: {(OUT/f"{key}.mp4").stat().st_size/1024:.0f} KB',flush=True)
