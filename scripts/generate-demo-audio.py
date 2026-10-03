"""Generate local English narration using Piper's public-domain LJSpeech voice.
Install piper-tts in a local build environment. Set PIPER_MODEL to the ONNX file.
Only MP4 output is deployed; model weights and WAV intermediates remain local.
"""
import json, os, wave
from pathlib import Path
from piper import PiperVoice, SynthesisConfig
ROOT=Path(__file__).resolve().parent.parent
OUT=Path(os.environ.get('DEMO_AUDIO_DIR',str(ROOT/'test-artifacts/demo-audio')))
OUT.mkdir(parents=True,exist_ok=True)
voice=PiperVoice.load(os.environ['PIPER_MODEL'])
DATA=json.loads((ROOT/'scripts/demo-content.json').read_text())
SLOT=112/15
for key,(_,scenes) in DATA.items():
 pieces=[];rate=None
 for i,(_,line) in enumerate(scenes):
  text=line.replace('40 free','Forty free').replace('100 KB','one hundred kilobytes').replace('JPG','J P G').replace('800 pixels','eight hundred pixels')
  path=OUT/f'{key}-{i+1}.wav'
  with wave.open(str(path),'wb') as wav:voice.synthesize_wav(text,wav,syn_config=SynthesisConfig(length_scale=1.0))
  with wave.open(str(path),'rb') as wav:
   assert wav.getsampwidth()==2 and wav.getnchannels()==1
   rate=wav.getframerate();duration=wav.getnframes()/rate
   if duration>SLOT-.7:raise ValueError(f'{key} scene {i+1}: narration too long ({duration:.2f}s)')
   pieces.append(wav.readframes(wav.getnframes()))
  print(f'{key} scene {i+1}: {duration:.2f}s',flush=True)
 frames_per_slot=round(SLOT*rate);audio=bytearray(frames_per_slot*len(scenes)*2)
 for i,piece in enumerate(pieces):
  start=(i*frames_per_slot+round(.35*rate))*2;audio[start:start+len(piece)]=piece
 with wave.open(str(OUT/f'{key}.wav'),'wb') as wav:
  wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(rate);wav.writeframes(audio)
