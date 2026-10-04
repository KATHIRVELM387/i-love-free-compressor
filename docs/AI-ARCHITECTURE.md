# Release 03 — optional local AI studio

Implementation date: 4 October 2026. This document describes the Phase F development increment on top of the released Phase A workflow/search implementation. It does not imply completion of Phases B–E or G–H. Production promotion must use the existing published `release/*` branch process.

## Delivered surface and limits

| Route | Actions | Limits and qualifications |
| --- | --- | --- |
| `#/ai-document` | Summaries, questions, key points, name recognition, action items, presentation outline, date matching, table-row extraction | 12,000 text characters; TXT/MD/CSV up to 1 MB; selectable PDFs up to 25 MB/200 document pages, at most 20 selected pages. Scanned PDFs require the future dedicated OCR tool. Date patterns and delimiter-separated rows are explicitly labelled deterministic helpers, not generated AI or table-layout reconstruction. |
| `#/ai-image` | Description, alt-text draft, visible-text OCR, filename suggestion | JPG/PNG/WebP up to 10 MB and 40 MP, fitted to a 1,024-pixel edge on white. No object identification guarantee. OCR may omit or misread text; multilingual/handwriting quality is not certified. Filename suggestions do not rename or convert the original. |
| `#/ai-presentation` | Topic/audience to 2–10 editable slides, optional source, speaker notes, layout choices, image ideas, optional user-data chart | Source at most 6,000 characters. Plans require the exact count and distinct bounded titles. Slide points, speaker notes and image ideas are generated as separate plain-text requests; application code builds and validates the structure. Native layouts are chosen from the point count, with title/closing layouts at the ends. Images are ideas in notes, not generated pictures or remote image URLs. The optional chart occupies the second slide in the requested count and uses only supplied numbers. Invalid drafts are rejected before editor handoff. |

All tools remain available to guests. The existing 50 tools, workflows and account functions remain; the catalog now contains 53 tools and 60 feature guides. AI tools use the same navigation, search, favorites, recent tools, mobile drawer and visual identity.

These small models produce **experimental drafts**, not verified conclusions. They can omit facts, misunderstand instructions, invent assertions or fail on complex prompts. English is the primary tested language. Quoted entity values must occur in the source; generated document numbers are checked against source numbers. Neither check establishes semantic truth or defeats all prompt injection. Source excerpts display the text supplied to the model and are explicitly not verified citations. Long documents are processed in bounded sections; Q&A selects up to four sections by keyword overlap and can miss relevant material elsewhere.

## Architecture and reuse

`ai.js` mounts three native ES-module views. It calls `ai-input.js`, then `ai-jobs.js`, then the `LocalAIProvider` interface. The provider owns one worker/model kind at a time; text, names and vision share cancellation/error handling but have separate model packs. `ai-worker.js` lazily loads the bundled Transformers.js/ONNX runtime and performs inference with WASM. There is no remote-provider implementation, server inference endpoint, API-key field or tool-execution capability.

Existing modules are reused:

- `studio-core.js`: file validation, bitmap/canvas normalization and PDF.js access.
- `presentation-core.js`: deck/slide validation, outline conversion, layouts, chart validation, drafts and exports.
- `presentations.js`: generated-deck entry point delegates to the existing replacement flow, including unsaved-change confirmation.
- `account-bridge.js`: completed TXT output registration; a user must click the existing save control to upload to My Files. No source text or generated file is uploaded merely because generation finishes. For signed-in members with activity history enabled, existing account logic records the tool name and result byte size.
- Navigation, shell, guides and shared styles: native routes, search/category and per-tool guides. Only small AI-specific layout CSS was added.

No framework, database migration, role change, storage-bucket change or quota increase is required. No transcript database is introduced. Generated decks are saved explicitly using the existing local presentation drafts/backups; cloud presentation sync remains outside this increment.

## Models and dependency change

The runtime dependency is pinned to `@huggingface/transformers@4.3.0`. `scripts/build-ai.mjs` bundles browser code and local ONNX WASM, preserving runtime notices. No Node-only inference runtime is shipped in the static site.

| Pack | Pinned repository revision | Download | Licence |
| --- | --- | --- | --- |
| Text: `onnx-community/Qwen3-0.6B-ONNX` | `da1453100cf3ff33ef56d17983fc7a8648706db6` | 626,815,451 bytes (~627 MB) | Apache-2.0 |
| Names: `Xenova/bert-base-NER` | `8e892123e8b7c2c0c2bd1dcb598b7d244c4e53aa` | 109,622,562 bytes (~110 MB) | MIT |
| Vision: `onnx-community/Florence-2-base-ft` | `e88a44eaf3791a35eae0c5a47b3dbcd36e67eb6f` | 277,470,179 bytes (~278 MB) | MIT |

The allowlisted filenames, exact sizes and SHA-256 digests live in `public/ai-models.js`. The repository contains the runtime/WASM and notices, **not the ~1.014 GB model packs**. Upstream model notices are retained in `public/vendor/ai/MODEL-LICENSES.txt`; runtime notices are in `LICENSES.txt`.

Primary model information: [Qwen ONNX](https://huggingface.co/onnx-community/Qwen3-0.6B-ONNX), [Qwen upstream](https://huggingface.co/Qwen/Qwen3-0.6B), [BERT ONNX](https://huggingface.co/Xenova/bert-base-NER), [BERT upstream and limitations](https://huggingface.co/dslim/bert-base-NER), [Florence ONNX](https://huggingface.co/onnx-community/Florence-2-base-ft), [Florence upstream](https://huggingface.co/microsoft/Florence-2-base-ft).

## Privacy and security

Download is a separate, deliberate user action. Hugging Face/CDNs receive normal model-download requests and the user's IP address; credentials are omitted and referrer policy is `no-referrer`. Source files, images, questions and prompts are never part of those requests. The UI discloses this before download. Model downloads may consume substantial bandwidth; no paid inference service is required.

Each downloaded file must match its fixed size and SHA-256 before entering the dedicated `ilfc-ai-models-v1` Cache Storage cache. Cancelled/incomplete/corrupt files are not installed. Verified complete files can be reused on retry. Remove-model deletes only that pack's known cache entries. Pack readiness uses recorded verification metadata; it does not re-hash every large file on every operation. As with other same-origin browser data, a compromised same-origin script could tamper with cache contents; this is not a defence against XSS.

Inference is cache-only. Exact runtime lookup aliases (including the runtime's default-revision metadata lookup) map to the fixed verified manifest, never a floating model download. The worker's fetch wrapper permits only the same-origin WASM resource and returns a local 404 for other fetches. There are no remote inference requests. CSP adds `wasm-unsafe-eval` and narrowly named model download hosts; it does not add general `unsafe-eval`, remote scripts or analytics. CSP is kept aligned in HTML, `_headers` and Vercel configuration.

Untrusted text is displayed with `textContent`/textarea values. Model output cannot execute JavaScript, fetch suggested image URLs or invoke tools. Generated decks pass the existing schema. Existing Supabase RLS, private buckets, owner scoping and explicit cloud-save controls are unchanged. Account identity changes clear AI inputs/results and terminate work. Navigation cancels active work; clear-input and model-removal controls release their respective data. Inputs/results otherwise remain in page memory until cleared or the page closes.

## Performance and accessibility

- Inference runs off the main thread in a module worker with single-thread WASM. Worker termination cancels an expensive generation; requests have a five-minute ceiling each. A complete deck consists of several requests and can take longer.
- Only one model kind stays active. Switching kinds disposes the previous worker. Switching away from AI tools releases the worker; model cache remains until explicitly removed/browser-evicted.
- Source/image/page/token/output ceilings are enforced. No existing image/batch/cloud quota was increased. Model download checks estimated storage headroom. SHA verification temporarily needs memory for the complete largest model file; use a desktop with at least 4 GB available memory. Where the browser reports less than 4 GB of device memory, AI download/inference is refused early. Browsers that do not expose this estimate can still fail from memory pressure.
- No model download or large runtime import occurs on initial page load. Cached-model inference works without external inference traffic; this is **not a PWA or a guarantee that the entire site starts offline**.
- Labelled controls, focus styles, native fieldsets, live status, accessible progress, Escape/cancel and narrow-screen layouts reuse established patterns. Text export object URLs are revoked when outputs are replaced or cleared.

## Files

New application files: `ai.js`, `ai.css`, `ai-core.js`, `ai-input.js`, `ai-jobs.js`, `ai-provider.js`, `ai-worker.js`, `ai-entities.js`, `ai-cache.js`, `ai-models.js`, and `vendor/ai/*` under `public/`.

New support files: `scripts/build-ai.mjs`, `scripts/prepare-ai-model-tests.mjs`, `tests/ai-core.mjs`, `tests/ai-browser.mjs`, `tests/ai-models-browser.mjs`, `tests/ai-download-browser.mjs`, and this document.

Modified integration: `public/navigation.js`, `shell.js`, `help-navigation.js`, `help-pages.js`, `guide-data.js`, `index.html`, `presentations.js`, `_headers`, `vercel.json`, `package.json`, `package-lock.json`, README and Release 03 roadmap. `accounts.js`, `app.js` and `productivity.js` update shared navigation import versions. Existing browser/help tests update registry expectations; the workflow browser test waits for actual image decoding before reading dimensions. The browser harness optionally streams local model fixtures and captures diagnostic console output.

## Reproducible validation

Use Node 22+ and Chrome. Routine checks do not download models:

```sh
npm ci
npm run build:ai
npm run test:ai
npm run package
```

Opt-in real-model fixtures (up to 1.02 GB; keep outside `public/`):

```sh
node scripts/prepare-ai-model-tests.mjs /tmp/ilfc-ai-models all
AI_MODELS_DIR=/tmp/ilfc-ai-models node tests/ai-models-browser.mjs --vision
AI_MODELS_DIR=/tmp/ilfc-ai-models node tests/ai-models-browser.mjs --text
# Optional network/CSP test, downloads a pinned 39 MB ONNX file:
node tests/ai-download-browser.mjs
```

The preparer streams downloads to temporary files, checks size/SHA-256 and only then renames them. Existing files are re-hashed. Browser tests load these verified local fixtures into the same model cache and run real WASM inference, recording unexpected external requests. Small synthetic download-fault fixtures test abort, size/hash rejection, successful install/removal and omitted credentials separately. These are not presented as recognition-quality evidence.

The real vision fixture contains HELLO WORLD and checks OCR, description, alt text and filename output. The document fixture contains a named owner, launch date, budget and required task; assertions check owner/date/action preservation. Presentation acceptance requires ten real generated slides, existing-editor handoff and speaker notes. Cancellation and leaving the AI route must stop work and withhold stale output. Broader multilingual, mobile memory and model-quality benchmarks are not certified by these smoke tests.

Regression coverage uses the existing image, workflow/search, studio, utility, presentation, help, video, account UI and database/security suites. It includes real downloads/exports, layouts, existing schema/permissions and the presentation replacement confirmation. Deployed-site checks must be repeated when a release is promoted.

## Explicitly outside this increment

Scanned-PDF OCR/searchable PDFs, general PDF editing, background segmentation, HEIC/animated formats, scanner, full table reconstruction, projects, share links, PWA installation, PPTX import and collaborative/cloud presentation editing remain their respective roadmap phases. This AI implementation does not silently mark them complete. It also does not promise generated images, perfect factual grounding, arbitrary-length documents or reliable inference on every mobile device.
