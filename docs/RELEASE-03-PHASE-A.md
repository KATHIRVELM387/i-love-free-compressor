# Release 03 — Phase A implementation report

Date: 4 October 2026. Development branch: `main`. Baseline: `b9a75f34a6aa01f960ab824b23f8424a9ba3deeb` (Release 02).

## Delivery status

Phase A and the reported left-navigation search defect are implemented and tested locally. This is an incremental development snapshot, not a claim that all of Release 03 is complete. No hosted database migration, new dependency, framework replacement, or change to archived release branches is required. Following local validation, the user authorized publishing Phase A to production from `release/04-10-2026-workflow-builder-navigation-search_release-03-phase-a`. Deployment completion must be confirmed by the hosting run and live smoke checks.

The complete project overview was read before implementation. [RELEASE-03-PLAN.md](RELEASE-03-PLAN.md) contains the architecture summary, complete 50-tool inventory, reuse map, limitations, proposed architecture, priorities, schema and dependency proposals, security/performance strategy, testing strategy, and ten-point implementation plans for phases A–H.

## What changed

### Sidebar search

Search now filters the full sidebar, including dynamically added favorites, account links, help links and the workflow page. It recognizes tool titles and aliases, hides empty groups, restores results when cleared, and allows Enter to select a visible match. It does not reveal administrator-only links. Normal sidebar scrolling is retained, and a queued mobile breakpoint event no longer immediately closes a newly opened drawer.

### Workflow builder

The existing `#/workflow` route now contains an ordered, visual step builder with labelled controls and keyboard-accessible move/remove buttons. Users can create, configure, reorder, validate, preview, run, save, rename, duplicate and delete recipes. JSON backup import/export provides portable settings without embedding files.

Eight adapters are available: resize, centered crop, rotate/flip, original image metadata cleanup, JPG/PNG/WebP conversion, text watermark, transparent-background fill and maximum-size compression. ZIP is a final export option. This is an image pipeline implementation; PDF/text/presentation adapters will be added with their owning phases. Background fill does not remove a photographed background.

Batch runs process files sequentially with step/file progress, per-file failures and recovery, cancellation, individual downloads, and ZIP export. Completed results remain downloadable after cancellation. Navigating away during a run cancels pending processing and discards stale output. Preview processes only the first photo and does not register an account result/activity. Actual outputs use the existing explicit My Files save controls.

Legacy fixed workflow presets remain readable and are converted in memory. Guest settings stay in the existing localStorage key; member settings use the existing owner-scoped profile preferences. The existing account settings limit is checked before saving, and failed saves preserve previous preferences. Account identity changes clear stale workflow results and loaded settings.

### Architecture and privacy

Versioned settings → validated adapter registry → cancellable job runner → temporary image artifact → next adapter → existing download/account bridge.

The engine calls existing `prepareImage`, metadata processing, bitmap validation, filename generation and ZIP functions. Shared canvas allocation and encoding now also support OffscreenCanvas. Capable browsers execute image and ZIP jobs in a local module worker; the fallback uses the same engine and checks cancellation between operations. Worker completion/cancellation terminates the worker; bitmaps and object URLs are released. The fallback can still pause during synchronous canvas work, which is disclosed in the UI.

No analytics, external processing API, model download or automatic file upload was added. Existing CSP, private storage, RLS, quotas, login behavior and explicit cloud-save actions remain in use. All processing assets are served from the application origin.

## Files

### New application files

- `public/workflow-core.js`: versioned schemas, step definitions, legacy conversion, recipe/selection/preference validation.
- `public/workflow-engine.js`: image adapters and sequential execution with step reports.
- `public/workflow-runner.js`: worker selection, lifecycle, cancellation and fallback.
- `public/workflow-worker.js`: local processing and ZIP worker entry point.
- `public/workflow.css`: responsive step builder, controls and results using the existing visual identity.

### Modified application files

- `public/workflow.js`: builder UI, recipe persistence, preview/run/cancel/download state and account isolation.
- `public/image-tools.js`, `public/studio-core.js`, `public/zip.js`: worker-compatible canvas/encoding and cancellation hooks; original public calls remain compatible.
- `public/shell.js`, `public/professional.css`: complete sidebar filtering and mobile drawer fix.
- `public/accounts.js`: include the owner identifier in existing workspace identity events.
- `public/navigation.js`, `public/guide-data.js`, `public/help-pages.js`: workflow title, description and guide updates.
- `public/index.html`: load workflow styles and update cache versions.
- `public/analysis-tools.js`, `public/app.js`, `public/batch.js`, `public/collections.js`, `public/explore.js`, `public/help-navigation.js`, `public/productivity.js`: consistent versioned imports of the changed shared modules.
- `package.json`: add `test:workflows`; no dependency or lockfile change.
- `README.md`: document Phase A, limits, compatibility, tests and development status.

### Tests and documentation

New: `tests/browser-harness.mjs`, `tests/workflow-core.mjs`, `tests/workflows-browser.mjs`, `tests/navigation-browser.mjs`, `docs/RELEASE-03-PLAN.md`, and this report.

Modified: `tests/accounts-browser.mjs` adds member recipe persistence and failed-save recovery; `tests/browser.mjs` corrects stale tool/category counts to the existing 50-tool Release 02 registry and uses the updated image module. Existing encoder/pixel assertions remain intact.

## Validation results

All commands below completed successfully in this task using Node 22 and installed Google Chrome:

| Command | Evidence |
| --- | --- |
| `npm run test:workflows` | Five schema/limits/migration unit groups; actual worker processing; CRUD and JSON downloads/import; ordered steps; corrupt/unsupported per-file failure and recovery; ZIP contents; worker/fallback dimensions; cancellation and retained results; crop/background/watermark; unmet final target warning; legacy persistence; settings budget; sidebar search; layouts 320–1440 px; no unexpected remote processing or browser errors. |
| `npm test` | Existing image encoders, exact JPG sizes, pixel transforms, crops, watermarks, backgrounds, format conversion, batches/ZIP, collages, image PDF export, creative effects, splitter, palette, comparison/details, all tool layouts and mobile navigation. |
| `npm run test:studio` | Existing PDF, creative and QR operations, workflow compatibility and editing/navigation regressions. |
| `npm run test:utilities` | JSON/Unicode text, SHA-256, PDF metadata, image metadata/DPI, cancellation and layouts. |
| `npm run test:presentations` | Editable PPTX with charts/tables/images/notes, PDF export, outlines, IndexedDB drafts, backup import, quotas and responsive views. |
| `npm run test:accounts` | PostgreSQL RLS/ownership, quotas, suspension, admin protections, account deletion and configuration. |
| `npm run test:account-ui` | Real SDK with intercepted OAuth/API responses; member workflow save/failure/retry; explicit uploads, library/history/preferences, admin rejection and sign-out cleanup. |
| `npm run test:help` | All 57 individual guides, contextual help, top navigation, search, signup and responsive layouts. |
| `npm run test:videos` | Four narrated MP4s with audio/captions, lazy playback and navigation cleanup; shared styling across 121 routes. |
| `npm run package` | Static deployment ZIP generated successfully; all six workflow assets included among 264 assets; archive integrity checked; no repository, node_modules, environment files or backend source included. |
| JavaScript syntax / `git diff --check` | 26 changed/new JavaScript modules passed syntax checks; patch passed whitespace validation. |

The workflow desktop screenshot was visually reviewed: `test-artifacts/release03-workflow-desktop.png`. Tests use isolated browser profiles and controlled test files. Account browser tests do not constitute a live Google/Supabase end-to-end acceptance test. Firefox, Safari and physical low-memory mobile devices were not tested in this task.

## Limits and remaining work

- Up to 12 steps, 10 saved recipes, 20 input files, 25 MB per input/intermediate, and 100 MB combined input/output. Existing 40 MP decode / 4096 px edge / 16 MP output safeguards remain. Large inputs require Resize before steps that would exceed output bounds.
- Maximum-size compression is best effort; unmet targets are shown. Conversion and other steps after compression can increase final size; the final output is checked again.
- Each step currently re-encodes an intermediate. Repeated lossy JPEG/WebP operations can reduce quality; previews should be inspected. A future lossless internal artifact optimization requires its own memory/performance validation.
- Metadata cleanup produces PNG; place conversion/compression later when another final format is needed. Crop is centered, and resize does not enlarge.
- Member preferences retain their existing 8,000-byte database ceiling. Ten complex recipes may not fit alongside other settings; a clear error and local backup are available. Dedicated workflow tables are a later additive migration proposal.
- Worker cancellation is immediate; fallback cancellation is cooperative and cannot interrupt a synchronous browser canvas operation. No limits were increased, and this task does not establish a worst-case low-memory-device benchmark.
- No new OCR, PDF editor, subject removal, HEIC/animation decoder, scanner, AI, projects, sharing or PWA feature is claimed. Their dependencies, migrations, security gates and tests are specified in the roadmap.

## Next phase and deployment

Next: Phase B, starting with a self-hosted local OCR proof using real scanned fixtures, PDF.js page rendering, bounded language assets and cancellation. Validate the searchable PDF text layer before presenting it as a reliable export. Add the additive PDF editor separately, with a strict distinction between annotations, visual whiteout and secure flattened redaction.

Continue development on `main`. The approved production scope is Phase A. Publish the tested feature release branch, select it in the GitHub Pages environment, and use the existing guarded production deployment command. Verify both live hosts and return to main. Do not modify frozen release branches or describe later roadmap phases as implemented.
