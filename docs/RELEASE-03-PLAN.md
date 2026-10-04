# Release 03 — architecture review and implementation roadmap

Status: incremental release. Phase A is implemented and tested; the user has authorized production promotion from `release/04-10-2026-workflow-builder-navigation-search_release-03-phase-a`. Phases B–H remain planned and are not included in this feature release.

## 1. Architecture review

Reviewed the complete Project Overview and current source at b9a75f3. The application is static HTML/CSS/ES modules with hash routes, not a framework app. public/navigation.js assembles the 50-tool registry from original image tools, studio-catalog.js and presentation-core.js; app.js mounts the original image editor. studio.js mounts document/creative/utility views; help-pages.js generates guides. shell.js builds the sidebar and filters cards; productivity.js adds favorites, recent links and account navigation; help-navigation.js adds information links. These independently appended links explain incomplete sidebar search coverage. Shared CSS already supports hidden states, so visibility must be fixed in navigation logic, not overridden with new global CSS.

Images use image-tools.js (dimensions, transforms, effects, watermark, target encoder). studio-core.js supplies validation/decoding, PDF.js loading/page rendering, pdf-lib operations and creative processors; utility-core.js supplies metadata/DPI/text/JSON/SHA-256. zip.js owns ZIP export. Batch, collections, analysis and presentation modules are separate UI controllers. presentation-core.js owns validated decks, rendering, native editable PPTX/PDF export and IndexedDB drafts.

account-bridge.js registers completed blobs and preferences. accounts.js owns Google PKCE, scoped sessions, explicit saves, profile/history/admin operations; workspace-accounts.js owns My Files/folders/previews. Supabase RLS and private Storage enforce owner access. Defaults: 5 MB/cloud file, 20 MB/member, 100 files, 800 MB/site; pending uploads reserve 5 MB. Profile preferences have an 8,000-byte database ceiling. Current workflows are ten fixed resize/watermark/compress settings objects, kept in localStorage for guests or preferences.workflows for members. Presentation drafts are separately local, five decks/40 MB.

Builds bundle dependencies locally; hosting serves public/ with no build/install. Vercel CLI uses a published-release guard; Pages accepts only the selected release branch. main stays development. No framework replacement, analytics or automatic file uploads are proposed.

## 2. Existing inventory

- Images: Image privacy cleaner, Image DPI editor, Compress images, Exact file size, Resize images, Crop & size presets, Rotate & flip, Convert format, Light & color, Text watermark, Transparency background, Photo filters, Photo frames, Rounded corners, Pixel art, Batch compressor, Image splitter, Compare images, Image details.
- PDF: PDF properties editor, Images to PDF, Merge PDFs, Split PDF, PDF to images, Organize PDF, PDF watermark, PDF page numbers, Extract PDF text, Text to PDF.
- Creative: Photo collage, Color palette, Image redaction, Signature creator, Logo watermark, Image annotations, Contact sheet, Stitch images, Expand canvas, Gradient generator.
- Web: Text cleanup, JSON formatter, File checksum, QR code generator, QR code reader, Image ↔ Base64, Favicon generator.
- Presentations: Presentation maker, Presentation templates, Outline to slides, Presentation drafts.

Also preserve workflows, Google login/signup, dashboard, My Files/folders, history/CSV, settings/deletion, admin/quotas/audits/announcements, 57 guides, four narrated demos, task search, favorites, recents, keyboard shortcuts and the mobile focus-trapped drawer.

## 3. Reuse map

| Existing module | Reuse in Release 03 |
| --- | --- |
| image-tools.js / effects.js | Pipeline image processors; no second resize/compression/watermark implementation |
| studio-core.js | Validated bitmap/canvas, PDF pages, rendering and PDF/creative exports |
| utility-core.js | Metadata cleanup, DPI, text/JSON/checksum adapters |
| zip.js | Batch/workflow/archive downloads |
| account-bridge.js | Explicit save buttons, output registry and preferences |
| accounts.js / workspace-accounts.js | Auth, session scoping, quota reservation and My Files integration |
| presentation-core.js / presentations.js | Imported/generated outlines pass through existing deck validation/editor/export |
| guide-data.js / help-pages.js | Individual guides and feature discovery |
| navigation.js / shell.js / productivity.js | Native routes, search, categories, recents, favorites and drawer |
| professional.css / design.css | White/navy/blue/orange visual identity and shared controls |
| Existing test suites | Extend real Chrome, PGlite/RLS and deployed-asset checks |

## 4. Limitations and architectural gaps

No OCR, subject segmentation, animated output, HEIC decoder, true general PDF text replacement, PPTX import, cloud decks, collaboration, AI model layer, projects, sharing or service worker exists. PDF text extraction is selectable text only. Metadata removal is not full PDF sanitization. Image backgrounds fill transparency rather than detect subjects. Image expansion adds canvas, not generated content. Hash routes are not independent indexable HTML pages. Different host origins have separate local storage.

Processors mix DOM canvas allocation with otherwise reusable logic. Cancellation currently checks between some operations; expensive transforms/ZIP checksums can block the UI. Workflow persistence cannot grow indefinitely in the 8 KB preferences column. Current original-image tests also contain stale hardcoded tool counts (40 versus the current 50), so regression assertions must follow the real registry rather than skip tests.

## 5. Proposed architecture

UI controller → validated versioned recipe → typed processor registry → cancellable job runner → artifact → next step → existing result/save bridge.

An artifact carries a Blob, MIME/type, dimensions/pages where relevant, warnings and step reports; bytes are temporary, never stored in a recipe. Each adapter declares accepted/emitted types, options and bounded limits. A sequential job owns one decoded source/intermediate at a time. Worker-compatible image operations run in a module worker using OffscreenCanvas; a cooperative fallback is explicit and preserves limits. Cancellation terminates worker jobs and rejects stale output. Later OCR/segmentation workers remain isolated and lazy loaded.

The registry is capability-based: only actual supported adapters appear. Phase A supports image pipelines; PDFs, multi-input fan-in, text and presentation adapters are introduced with their owning phases. Unsupported graph combinations fail before execution. A general dependency graph, arbitrary scripts and network-fetch workflow steps are excluded from the initial release.

## 6. Priority matrix

| Priority | Slice | Dependency / delivery gate |
| --- | --- | --- |
| P0 | Sidebar search correction, recipe validation/migration and cancellable workflows | First; no new dependency or hosted migration |
| P1 | Local OCR and additive PDF editor | Worker/language assets, Unicode searchable-text proof and redaction security tests |
| P1 | Batch studio, presets and file health | Reuse Phase A engine; existing limits stay unchanged |
| P1 | Tool chaining and scanner upload/perspective correction | Typed artifacts and OCR/PDF stages |
| P2 | Background removal and HEIC conversion | Model/codec licence review, memory/mobile feasibility and self-hosted size budgets |
| P2 | PWA offline local tools | Cache/privacy/update/rollback proof on both host base paths |
| P2 | Projects and bounded cloud presentation revisions | RLS and quota-preserving reference schema |
| P3 | Explicit sharing | Token/expiry/revocation/rate-limit/security gate; no public bucket |
| P3 | Local AI assistance / model generation | Capability/device checks, honest output, explicit model download; external providers off by default |
| Research | General PPTX import, animated GIF/WebP/video and collaboration | Fidelity/codec/licence/scale evidence before promising support |

## 7. Data model and migrations

Phase A: version-2 recipe {version, id, name, steps:[{type, options}], export}. Preserve legacy fixed presets through read-time conversion; no destructive bulk migration. Up to ten saved recipes and bounded step count. Retain guest/member storage abstractions and enforce a conservative serialized preferences budget before account saves. Full definitions can be backed up locally. No schema migration is required for this first slice.

Later migration proposals (not yet applied):
- account_workflows: UUID, owner_id, version, name, validated recipe JSON, revision/timestamps; owner-only RLS, active-account checks, byte/count limits and compare-and-swap updates. Migrate preferences only after read/round-trip tests and explicit save; retain rollback compatibility.
- account_projects: UUID, owner_id, title, timestamps. project_items: project_id, owner_id, kind, existing file/workflow/deck reference and role (original/processed). Composite ownership constraints prevent cross-owner references. Store references rather than duplicate file bytes.
- presentation_projects / presentation_versions: owner/project identity, revision metadata and references to quota-charged private account_files objects. Do not raise the 5 MB object cap silently; larger decks stay local until a quota-compatible design is tested. Bounded retention and atomic revision pointer updates.
- account_shares: owner/file, hashed random token, expiry, revoked_at, allowed action, optional salted password hash and access controls. No direct anonymous table or bucket grants. A server function validates all conditions before a short-lived download response. Revocation limitations for already-issued URLs must be documented; view-only cannot stop copying/download of delivered bytes.
- Collaboration is a separate design gate: memberships, conflict resolution and invitation/revocation checks are not implied by share links.

All migrations are additive and versioned, tested with two owners, suspended users, forged owners and admins before any hosted application. No service-role credential reaches a browser. Account deletion must include new rows/references without orphaning charged objects.

## 8. Dependencies and evidence

Phase A: no npm dependency. Use native workers and existing processing/export code.
OCR candidate: self-hosted pinned Tesseract.js/WASM and selected language packs. It recognizes images, not PDF inputs directly: existing PDF.js renders one page at a time. Searchable PDF generation needs word boxes, coordinate transforms and Unicode fonts/shaping validation, not simply drawing Latin text over a scan. Begin with English and a tested additional language (Tamil if font/recognition fixtures pass). Language packs are opt-in downloads with size and offline status.
Background candidate: evaluate segmentation runtime AND model redistribution terms separately. IMG.LY background-removal documentation currently identifies AGPL licensing; do not silently introduce it into this project without resolving licence implications. Prefer a demonstrably compatible self-hosted model/runtime or explicitly defer.
HEIC: evaluate libheif-js/WASM and its underlying codec licences. Add dedicated import with dimensions/frame limits; do not expand every legacy accept list before reliable normalization. Native AVIF/BMP support must be capability-tested. SVG must be sanitized and rasterized with external resources blocked. GIF animation needs a bounded decoder/encoder timeline; GIF-to-MP4 remains conditional, not an assumed FFmpeg dependency.
AI: provider-neutral local adapter; no external API key or paid service assumed. ONNX/Transformers/WebGPU candidates require model licences, download budgets and measured fallback before adoption. PWA uses native service worker APIs, not a new frontend framework.
Sources checked for planning: https://github.com/naptha/tesseract.js ; https://github.com/imgly/background-removal-js ; https://github.com/catdad-experiments/libheif-js ; https://developer.mozilla.org/en-US/docs/Web/API/ImageDecoder ; https://pdf-lib.js.org/ . These are candidates; versions will be pinned only after phase-specific proof.

## 9. Security and privacy

Never upload source documents for local processing. Explicit cloud-save controls remain the only upload path. Recipes allowlisted by schema contain no JS, remote URLs or embedded source bytes; text is inserted with textContent. ZIP filenames are sanitized and unique. Preserve CSP, private buckets, RLS, owner-scoped sessions and authentication callback behavior. Do not cache credentials or cloud responses in the PWA. OCR/AI treat document text as untrusted data, not instructions; they cannot execute tools or make network requests. Redaction export must remove original covered content, not place a removable rectangle over it; whiteout must be labelled visual-only unless rasterized/sanitized. PPTX imports must reject macros/external relationships, zip bombs and oversized expanded assets. Camera access is opt-in, stopped on navigation, and requires a deliberate Permissions-Policy change in Phase E.

## 10. Performance

Keep 25 MB/image, 40 MP decode, 4096 px/16 MP export, 20 files and 100 MB batch ceilings. Decode one image/page at a time; transfer/clone Blobs rather than base64 copies, release bitmaps/canvases/object URLs, and retain no intermediate thumbnail pile. Cap recipes/steps, models, OCR pages and document raster sizes independently. Worker cancellation kills current computation; fallback checks yield between encodes/steps. Show operation/file progress and per-step/per-file failures. Preview runs only one selected file, without cloud saving/history. Benchmark typical and worst-supported cases on desktop and constrained devices before increasing limits.

## 11. Test strategy

Unit: schema/type/order validation, legacy migration, serialization budgets, step failure attribution, cancellation, filenames and recipe CRUD. Browser: actual pixel dimensions/formats, target statuses, ZIP contents, preview vs full batch, corrupt/oversized input, reordering, persistence, keyboard/mobile/focus, object URL cleanup and recovery. Search: title/alias/multiword, workflows/help/accounts/favorites, no results, clear, Enter and mobile drawer; never reveal hidden admin links. Regression: original image suite, studio, utilities, presentations, account UI/database, guides and videos. Security: RLS cross-owner/admin denial, quota concurrency/reservations, owner switching, new share/password/token/expiry/revoke cases when those features exist. Do not invent OCR/model mocks as proof of actual recognition; use real scanned fixtures and check text and searchable PDF output. Build/package smoke check after meaningful changes; production acceptance repeats relevant tests against both host URLs.

## 12. Detailed phase roadmap

### Phase A — core architecture and visual workflow builder
1. Modify: workflow.js, image-tools.js, studio-core.js (worker-compatible canvas only), zip.js, shell.js, productivity.js/help-navigation.js as necessary, guide-data.js, index.html, package.json, README and existing tests.
2. New: workflow-core.js (schemas/legacy conversion), workflow-engine.js (typed adapters), workflow-worker.js, workflow-runner.js, workflow.css, unit/browser tests and this roadmap.
3. Components: accessible ordered step cards, add/remove/move/configure, validation/preview, run/cancel/progress, per-file/step results, save/rename/duplicate/delete and recipe backups.
4. Data: version-2 bounded image recipe and temporary artifacts; preserve original fixed presets.
5. Supabase: none initially; existing preferences and explicit save bridge retained with a byte-budget check.
6. Dependencies: none.
7. Security: no dynamic code/URLs; validate before run/save/import, isolate identity transitions; no preview upload.
8. Performance: sequential files, bounded outputs, worker processing, cooperative fallback and cancellable ZIP.
9. Tests: schema/migration, actual pipeline pixels/format/target, batch errors/recovery, cancel, CRUD, account save failure, search and regressions.
10. Deployment: develop on main; no Release 02 changes. Promote a dated Release 03 branch only after acceptance. Feature guide explains image-only scope.

### Phase B — OCR and PDF editor
1. Modify: navigation/tool catalog, studio-core, utility integration, guides, account result bridge usage, build scripts/CSP only where required.
2. New: ocr-core/worker/UI, searchable-pdf exporter, pdf-editor model/UI/style, build-ocr and fixtures/tests.
3. Components: #/ocr language/page selection/progress/text review/export; #/pdf-editor preview/annotation overlay, text/image/signature/shapes/draw/highlight/underline/strike-through, page insert/rotate/delete/reorder.
4. Data: transient OCR boxes/pages/confidence and validated annotation scene; bounded local edit project if needed.
5. Supabase: none for local tools; existing explicit PDF/TXT saves.
6. Dependencies: approved Tesseract runtime/packs; fontkit/font assets only if needed for validated multilingual PDF text.
7. Security: untrusted PDFs/fonts, no external resources, true flattened redaction mode; ordinary whiteout labelled non-secure; preserve source.
8. Performance: one bounded rendered page and OCR worker; destroy workers/render tasks on cancel.
9. Tests: real image/scanned/mixed PDF OCR, selected pages, multilingual search layer, rotations/transforms, annotations and unrecoverable redaction; existing text extraction unchanged.
10. Deployment: opt-in assets loaded from own origin; licence/asset budgets and mobile capability gate before route launch.

### Phase C — background removal and formats
1. Modify: decoder adapters, studio catalog/navigation, guides/build vendor notices.
2. New: segmentation worker/UI, format import adapters, bounded animation model/UI and format capability tests.
3. Components: #/remove-background subject mask preview, transparent/solid/gradient/custom image composition; HEIC normalization; staged animation tooling.
4. Data: ephemeral masks and bounded frame timeline, no cloud defaults.
5. Supabase: no new raw-format MIME allowlist; save normalized supported output through existing bridge.
6. Dependencies: only proven/licence-approved model/runtime and codecs; no unconditional FFmpeg download.
7. Security: SVG resource isolation, decompression bounds, model integrity/source notices.
8. Performance: optional model download, downsampled inference with clear quality limits, one frame at a time and hard duration/pixel bounds.
9. Tests: varied subjects/transparency, HEIC orientation/colour, AVIF/BMP/TIFF capability, GIF frame duration/loop/trim and supported export; corrupt/huge input.
10. Deployment: publish only supported capabilities; GIF→WebP animation/MP4 conditional on encoder support and host budgets.

### Phase D — batch studio, smart presets and health
1. Modify: batch.js/UI, workflow engine/registry, analysis-tools, guides and discovery.
2. New: preset catalog/editor, health analyzers/report UI, batch-studio controller/tests.
3. Components: batch resize/convert/compress/watermark/privacy/rename through recipes; Passport/Website/Social/Document/custom presets; image/PDF health with relevant tool links.
4. Data: preset version/requirements/source/caveats; temporary file analysis. No invented universal government acceptance rules.
5. Supabase: bounded preset/workflow table only if preferences no longer fit; additive migration with legacy compatibility.
6. Dependencies: prefer existing PDF.js metadata/operator inspection and density parsers; no speculative optimization service.
7. Security: no auto-executed recommendations, no automatic upload; distinguish visible image count/estimated opportunities from exhaustive PDF audit.
8. Performance: sequential batch and sampled analysis, current limits retained.
9. Tests: name collisions, error recovery, preset equality, DPI/alpha, mixed scanned/searchable pages, PDF image count and bounded inspection.
10. Deployment: compatible with existing #/batch and legacy presets; avoid duplicate processors.

### Phase E — scanner and next actions
1. Modify: result registrations, navigation, OCR/PDF adapters, headers for opt-in camera and guides.
2. New: scanner page/geometry/enhancement helpers, transient artifact handoff and next-action component.
3. Components: #/scanner upload/camera, suggested quadrilateral with keyboard/manual correction, perspective/crop/enhance, ordered pages, OCR/PDF/searchable PDF; small relevant next-action list.
4. Data: temporary page list/handoff tokens, original/processed association; do not put file bytes in URLs.
5. Supabase: existing explicit PDF save; no camera uploads by default.
6. Dependencies: small geometry code first; OpenCV only if a measured detection need justifies size/licence.
7. Security: camera only after click/permission, stop tracks on leave, same-origin policy; never advertise a missing PDF compressor or automatic PDF→presentation conversion.
8. Performance: bounded capture resolution/page count; release prior frames.
9. Tests: perspective geometry, keyboard corners, denied/no camera, multi-page export, cancel, URL cleanup, explicit cloud action.
10. Deployment: upload flow works on both hosts; camera headers reviewed separately; next actions expose only implemented destinations.

### Phase F — isolated AI and presentation assistance
1. Modify: presentation outline import boundary, guides and supported artifact extraction adapters.
2. New: ai-provider interface, optional local provider/worker, assistant UI, prompt/output schema/tests, document-to-outline mapping.
3. Components: explicit text selection → summarize/questions/key points/dates/names/action items/outline; image OCR/alt-text candidates; topic→validated deck with layouts/notes and clearly labelled suggested assets.
4. Data: temporary extracted text/chunks and citations, validated structured outputs; no hidden retention.
5. Supabase: none for local inference; external providers remain disabled unless explicitly configured later with a secure server proxy and consent.
6. Dependencies: evaluate local runtime/model after benchmark/licence; no fake AI based on templates labelled as generation.
7. Security: source text cannot trigger tools/network; generated answers clearly uncertain and traceable; no API secrets in static JS.
8. Performance: device capability check, explicit model size/download, cancel, context limits; graceful unavailable state on unsupported hardware.
9. Tests: schema rejection, citation alignment, fabricated chart-data prevention, prompt injection boundary, cancellation and existing deck validation/export.
10. Deployment: capability flag independent of core tools; all non-AI tools remain available without model download.

### Phase G — projects, presentation persistence and sharing
1. Modify: accounts/workspace UI, My Files metadata operations, presentation draft adapters, deletion cleanup, RLS tests.
2. New: #/projects UI/repository, project/workflow/deck revision migrations, optional share API/UI and permission tests.
3. Components: owner projects referencing original/processed files, workflows/decks/activity; explicit bounded cloud deck revisions; restricted share links. PPTX import proof runs separately: parse only supported text/image/chart/table layouts, display losses, never claim arbitrary fidelity.
4. Data: owner-scoped project/items/decks/revisions and token-hash share records described above; no duplicate blob storage.
5. Supabase: additive tables/RPCs, owner-composite foreign keys, active-owner RLS, quota-checked objects, deletion cascade/revocation, secured share Edge Function.
6. Dependencies: existing ZIP/PPTX-related libraries where possible; archive reader only after zip-bomb/external-resource proof. Password hashing server-side if enabled.
7. Security: unpredictable cryptographic tokens, hashed token/password, expiry/revoke and rate limits, no public bucket; view-only never claimed to prevent copying. Collaboration requires a separate permission/conflict design.
8. Performance: indexed/paginated metadata, bounded revision retention, one copy per file; share bandwidth monitored.
9. Tests: two-user/admin/suspended/forged references, concurrent quotas, account deletion, token brute force/rate limiting, expiry/revoke/password failures, safe PPTX import and compatibility fixtures.
10. Deployment: database first with backward-compatible code, staging acceptance, then UI. No hosted schema changes during Phase A.

### Phase H — PWA and offline
1. Modify: index, bootstrap, update/offline UI, package/build asset inventory, guides.
2. New: manifest, service worker, offline asset manifest, cache controls and browser offline/update tests.
3. Components: install guidance, explicit offline packs, availability indicators and safe update/reload action.
4. Data: versioned own-origin static caches; local drafts unchanged.
5. Supabase: none; never cache Auth or private cloud responses.
6. Dependencies: native APIs first.
7. Security: allowlisted static assets, no uploads/requests replayed silently, cache-clear controls and account isolation.
8. Performance: small core shell plus optional codec/model packs; quota-aware eviction; never precache all models/videos.
9. Tests: offline resize/convert/crop/rotate/watermark/JSON/text/QR/checksum/PDF, first-load failure, update rollback, active draft protection and GitHub project subpath.
10. Deployment: base-path-safe worker scope on both origins; version/rollback strategy tested before enabling installation.

## First implementation recommendation

Fix sidebar search, then deliver Phase A’s versioned visual image workflow builder. It unlocks batch/presets/chaining without adding codecs or hosted tables, and exercises the shared artifact/cancellation contracts before expensive OCR/AI work. Subsequent phases remain visible roadmap items, not implemented features.
