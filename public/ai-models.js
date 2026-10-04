// Fixed model revisions and SHA-256 checks. Explicit download only.
export const AI_MODELS = {
  "text": {
    "id": "onnx-community/Qwen3-0.6B-ONNX",
    "revision": "da1453100cf3ff33ef56d17983fc7a8648706db6",
    "label": "Text assistant",
    "license": "Apache-2.0",
    "files": [
      {
        "path": "config.json",
        "bytes": 912,
        "sha256": "8a04114ba59cc42b47d804d35d1d5c61d746ae4634f41f796768c6e302d39b9e"
      },
      {
        "path": "generation_config.json",
        "bytes": 219,
        "sha256": "9e9e031ae8bca36eefcdcdd0b35d83c61baa01e31d68d5f5a961c9ca1a4b95bf"
      },
      {
        "path": "tokenizer.json",
        "bytes": 9117040,
        "sha256": "e7a95fce95bf5b0946d0ddb3f9d7caa030b7e850bbe92b0edb26bcf563e9f3d5"
      },
      {
        "path": "tokenizer_config.json",
        "bytes": 9705,
        "sha256": "b0a8115cf05a7002cbe2575058c0139c1dee3f06f221c05717c3444947d78b9f"
      },
      {
        "path": "onnx/model_quantized.onnx",
        "bytes": 617687575,
        "sha256": "ccf8734e59fdf7475b2dc0c117005e267a3a08342c1d951e0a79f0bce57bf62a"
      }
    ],
    "bytes": 626815451
  },
  "entities": {
    "id": "Xenova/bert-base-NER",
    "revision": "8e892123e8b7c2c0c2bd1dcb598b7d244c4e53aa",
    "label": "Name recognition",
    "license": "MIT",
    "files": [
      {
        "path": "config.json",
        "bytes": 999,
        "sha256": "a73a2eccc921bbdea95a94b49a157d3694b5c2abbae7a6f3000e14404a9c31a8"
      },
      {
        "path": "tokenizer.json",
        "bytes": 668923,
        "sha256": "343989712a36cd8b253efeaf8baf6a08b9d2583f78e395e83832e8ee9f8d8ee1"
      },
      {
        "path": "tokenizer_config.json",
        "bytes": 385,
        "sha256": "5be1a180e9badb4811a6c31502d70fb35a085af5457982937419c42d7530bae6"
      },
      {
        "path": "onnx/model_quantized.onnx",
        "bytes": 108952255,
        "sha256": "caaee70a5518ec7f9e46e5308fcc9263a8c227703a9ce46cf61c69a552349648"
      }
    ],
    "bytes": 109622562
  },
  "vision": {
    "id": "onnx-community/Florence-2-base-ft",
    "revision": "e88a44eaf3791a35eae0c5a47b3dbcd36e67eb6f",
    "label": "Image assistant",
    "license": "MIT",
    "files": [
      {
        "path": "config.json",
        "bytes": 5432,
        "sha256": "d90c22ed72eb55291f183fcd9b98ebd3bd3d92bfcffb6c7f6e1606085e793525"
      },
      {
        "path": "generation_config.json",
        "bytes": 292,
        "sha256": "7b8eb17bbd6cf8a07f619ad83ae03881eff05b6b9237bab89005b40e77783c29"
      },
      {
        "path": "preprocessor_config.json",
        "bytes": 2673,
        "sha256": "c892857e34a7082284983a7717717d39c9bf7e574f1f41d80d4c918c97502efa"
      },
      {
        "path": "tokenizer.json",
        "bytes": 2297961,
        "sha256": "d69dcdb2323e124ac4f800cb9863ddccea0d7bb11e16125e8df3bd60f2f8aeac"
      },
      {
        "path": "tokenizer_config.json",
        "bytes": 197658,
        "sha256": "d8e64607233cb53b619fb46664f6cad08176c26e0e8735b2d30d888364f19600"
      },
      {
        "path": "onnx/embed_tokens_quantized.onnx",
        "bytes": 39390433,
        "sha256": "6b2258db1c8ee9b160576ccde3cd3814d83a2edaed0dd1c6ca9ff3c38fa62214"
      },
      {
        "path": "onnx/vision_encoder_quantized.onnx",
        "bytes": 93746540,
        "sha256": "3b79d54f23f666f731549db23cb070c35a979ce19cbd9720e90e67a78dc9768c"
      },
      {
        "path": "onnx/encoder_model_quantized.onnx",
        "bytes": 43651493,
        "sha256": "f4ad7a68f1fb875d3bcf735ea14a7021b7ba7e83baf7cf10289881b4ed6d9b85"
      },
      {
        "path": "onnx/decoder_model_merged_quantized.onnx",
        "bytes": 98177697,
        "sha256": "f22f52f980c33df0efa15932c2f3db6d9d3595ce6387eca938b8cfe23dc4c641"
      }
    ],
    "bytes": 277470179
  }
};
export const AI_CACHE="ilfc-ai-models-v1";
export const modelURL=(model,file)=>`https://huggingface.co/${model.id}/resolve/${model.revision}/${file.path}`;
