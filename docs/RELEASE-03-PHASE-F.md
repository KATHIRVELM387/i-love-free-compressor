# Release 03 Phase F — local AI studio

Date: 4 October 2026
Release branch: `release/04-10-2026-local-ai-studio_release-03-phase-f`

This increment adds an optional local AI studio on top of the released Phase A workflow builder and sidebar search. It preserves all existing tools and account/storage behaviour. The catalog contains 53 tools and 60 feature guides.

## Features

- **AI document assistant:** summaries, source-based questions, key points, recognized names, action-item drafts and presentation outlines. Read text files and selected pages of selectable-text PDFs. Source excerpts are available for review. Date patterns and delimiter-separated table rows use explicitly labelled local text matching.
- **AI image assistant:** descriptions, alt-text drafts, visible-text OCR and filename suggestions for JPG/PNG/WebP.
- **AI presentation generator:** topic/audience and optional source text to 2–10 slides, speaker notes and image ideas. Validated outlines guide separate plain-text generations; application code constructs native slide layouts. Optional charts use user-entered values and occupy the second slide. Open the result in the existing editor or download an editable project backup.
- Explicit model installation/removal, SHA-256 checks, progress, cancellation, worker cleanup, account identity isolation, low-memory checks, individual guides and existing navigation/search integration.

Model packs are approximately 627 MB for text, 110 MB for names and 278 MB for vision. They are downloaded only after a user clicks Download. Inference uses local cached models and local WASM; documents, prompts and images are not sent to an external inference API. Signed-in users with activity history enabled retain existing tool-name/result-size logging. Actual file content uploads only through an explicit cloud save.

## Architecture and decisions

Static HTML/CSS/ES modules remain. No framework or database migration was added. Existing PDF reading, image normalization, account result registration, presentation validation/editor/drafts/export and navigation components are reused. The new local provider isolates inference in a cancellable worker. Small model JSON was unreliable for full slides, so only bounded outline formats are accepted; slide points, notes and image ideas are requested separately as text and structured by application code.

Fixed model revisions, exact hashes, licensing notices and a pinned Transformers.js 4.3.0 runtime support reproducible builds. Models stay outside the deployed archive. See [complete architecture, file inventory and limits](AI-ARCHITECTURE.md).

## Validation evidence

Passed during this implementation:

- Eight AI unit tests covering bounds, source verification, numeric rejection, plan/slide/deck validation, chart integrity, entity reconstruction, generation failure/recovery and cancellation.
- AI browser checks for routes/search, 320/390/768/1440 layouts, no automatic download, PDF selectable-text/scanned rejection, image normalization, existing-editor replacement protection, cache integrity failures, explicit removal, low-memory refusal and account-change clearing.
- Real Florence vision inference in a browser worker for all four image actions, including OCR of HELLO WORLD.
- Real Qwen document checks for summary, questions, key points, action items and outline; real BERT name recognition. Deterministic date/table checks preserve literal source values.
- Real Qwen ten-slide generation, existing-editor handoff with speaker notes, live inference cancellation and navigation cleanup. The final `--text --presentation-only` check exited successfully. Real-model browser checks used verified pinned fixtures and observed no external inference requests.
- Actual Hugging Face configuration plus 39 MB ONNX download through browser CSP/CORS, followed by SHA-256 verification, cache installation and removal.
- Existing image, workflow/search, studio, utilities, presentations, help, videos, account UI and account/database security regression suites passed. No database migration was applied.
- AI runtime build, changed-module syntax checks and static packaging. The archive includes local runtime/WASM and excludes model weights, node_modules and environment files. Dependency audit reported zero vulnerabilities.

Early presentation experiments failed acceptance and were corrected before release preparation; they are not counted as passing tests. Model smoke tests are not broad quality certification. Review output, especially facts, names, numbers, handwriting and non-English content. A current desktop with sufficient memory is recommended; mobile compatibility is not certified.

## Remaining roadmap

This is Phase F assistance, not completion of all Release 03 phases. Scanned-PDF OCR/searchable PDFs, general PDF editor, background removal, expanded formats, scanner, advanced batch/presets/health, projects/sharing, PWA, PPTX import and cloud/collaborative presentations remain separate roadmap work. AI table extraction does not reconstruct visual table layouts. Image suggestions are not generated pictures. No paid/cloud AI provider is installed.

## Deployment

Promote only the named published `release/*` branch. Keep `main` for development; preserve older release branches. Use the existing `deploy:production` clean/published-commit guard for Vercel and the GitHub Pages release-branch environment policy. Production verification should confirm AI routes, navigation counts, runtime assets and CSP on both hosts. Full model inference is validated locally under the same CSP; hosted asset checks alone must not be described as full hosted inference tests.
