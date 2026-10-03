"""Check that every rendered MP4 has audible, unclipped audio in all four scenes."""
from pathlib import Path
from array import array
import os, subprocess, math, sys
ROOT=Path(__file__).resolve().parent.parent
FFMPEG=os.environ.get('FFMPEG_BIN','ffmpeg')
RATE=16000
SLOT=112/15
for name in ['tour','compress','resize']:
 result=subprocess.run([FFMPEG,'-hide_banner','-loglevel','error','-i',str(ROOT/f'public/videos/{name}-narrated.mp4'),'-map','0:a:0','-ac','1','-ar',str(RATE),'-f','f32le','-'],capture_output=True,check=True)
 samples=array('f',result.stdout)
 if sys.byteorder!='little':samples.byteswap()
 assert abs(len(samples)/RATE-4*SLOT)<.15,f'{name}: unexpected audio duration'
 for scene in range(4):
  part=samples[round((scene*SLOT+.35)*RATE):round(((scene+1)*SLOT-.35)*RATE)]
  assert all(math.isfinite(x) for x in part),f'{name}: invalid audio'
  rms=math.sqrt(sum(x*x for x in part)/len(part));peak=max(abs(x) for x in part)
  assert .005<rms<.6,f'{name}, scene {scene+1}: silent or excessively loud audio'
  assert peak<.95,f'{name}, scene {scene+1}: clipping risk'
 print(f'PASS {name}: audible narration in all four scenes, no clipping, synchronized duration')
