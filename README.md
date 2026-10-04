# I Love Free Compressor

Live website: https://ilovefreecompressor.vercel.app/

GitHub Pages mirror: https://kathirvelm387.github.io/i-love-free-compressor/

Source code: https://github.com/KATHIRVELM387/i-love-free-compressor

A free, mobile-friendly photo resizing and compression tool. All photo processing happens in the browser. Guest tools require no account or backend and do not upload photos. Optional Google accounts add private cloud saves, preferences, activity history, and admin access through a separately configured Supabase Free project. There are no analytics or external fonts.

## Choose a tool

The homepage shows fifty tool cards. Selecting a card opens a dedicated view with only the controls needed for that task: compression, exact KB, resizing, cropping/presets, rotation/flipping, format conversion, light/color, watermarks, transparency backgrounds, batches, collages, images to PDF, filters, frames, rounded corners, pixel art, splitting, palettes, comparison, or image details.

Use **All tools** to return to the menu. Browser Back/Forward and direct links such as `https://ilovefreecompressor.vercel.app/#/crop` work on Vercel and GitHub Pages without server rewrites. Unknown tool links return to the menu. These are views within the static app, not separately indexed pages.

Switching tools retains the original uploaded photo and starts fresh settings, so hidden adjustments and size limits cannot affect another tool. Choose **Continue editing this photo** beneath a completed result to use it as the starting photo for another single-photo tool. This replaces the working original with the result; download a copy first if you want to keep that intermediate file. Reloading the page clears photos from memory. Leaving a running batch stops it after the current photo.

## Navigation and creative tools

The desktop layout has a persistent vertical menu on the left, grouped by task, with search and a highlighted current tool. On screens up to 1,000 px, **Tools** opens a mobile drawer. Escape, the close button, or the backdrop closes it; keyboard focus stays inside the open drawer and returns to the button when closed. The homepage also has a searchable tool grid with clear-search and no-results states.

- **Photo filters**: sepia, warm, cool, and negative colors with adjustable strength. Alpha is preserved.
- **Photo frames**: adjustable color and thickness. The border is drawn inside the photo, covering its edges without increasing dimensions.
- **Rounded corners**: adjustable radius; PNG is the default to retain transparency. JPG fills the corners white.
- **Pixel art**: a whole-image mosaic with adjustable block size. Zero restores the original appearance.

Measurements use percentages of the shorter side so previews and exports scale consistently. Each tool keeps its own relevant controls visible. Switching tools starts fresh settings; use **Continue editing this photo** to intentionally carry a finished edit forward. All four tools use local canvas processing and support JPG, PNG, and WebP downloads.

## Split, explore, and compare

- **Image splitter** (`#/split`): choose 1–6 rows and columns and download up to 36 PNG tiles in a ZIP. Names identify each tile’s row and column. The complete image is preserved; remainder pixels are distributed among tiles. Large photos are fitted within 4,096 px per side and 16 million pixels before splitting. Combined tile output is limited to 100 MB.
- **Color palette** (`#/palette`): find up to 4, 6, or 8 distinct frequent colors, copy individual HEX codes, and download a text list or PNG swatch strip. Colors are approximate, extracted from a thumbnail; mostly transparent pixels are ignored. Simple or fully transparent photos can produce fewer colors or no palette. If clipboard access is unavailable, the code is selected for manual copying.
- **Compare images** (`#/compare`): a keyboard-accessible before/after slider, swap controls, and independent file selection. Both photos fit a common preview area without stretching. Different aspect ratios can leave empty space. This is a visual comparison, not a pixel-difference score.
- **Image details** (`#/details`): detected format, decoded dimensions, file size, aspect ratio, orientation, megapixels, and exact decoded-pixel transparency detection, with a downloadable text report. Transparency is scanned in small strips; camera/GPS metadata is not read.

These four tools have separate selections. Source files are limited to 25 MB and 40 million decoded pixels. Decoded source images are released after processing; only files and small previews are retained. Clearing a photo or leaving during processing cancels pending output. Corrupt files show an error and preserve an earlier valid selection. As with the other image tools, animations are processed as a still image.

## Collages and PDF documents

**Photo collage** (`#/collage`) combines 2–9 photos into a 1–3 column grid, with square, portrait, or landscape canvases; spacing, background color, whole-photo or fill-cell framing; and JPG/PNG/WebP export. Empty cells retain the background color.

**Images to PDF** (`#/pdf`) combines 1–20 photos into a downloadable PDF with one photo per A4 or US Letter page, in portrait or landscape. Pages fit each photo without cropping and use 24-point margins. Images are converted to JPG with white transparency and a maximum 2,048-pixel longest side; the PDF is image-only (no OCR or selectable text).

Both tools support adding more photos, moving them up/down, removing individual photos, and clearing the selection. They keep their own selections, decode one photo at a time, allow stopping after the current photo, and cancel unfinished output when leaving the tool. Limits: 25 MB per photo, 40 million decoded pixels per photo, 100 MB combined input/output. Changing a selection or option discards the previous result. Corrupt photos produce an error; remove them and retry. PDF output is written locally using JPEG image streams and byte-counted PDF objects/cross-reference tables, with no external library or service.

## Run locally

From this folder, run:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory public
```

Open http://localhost:4173. Python 3 is needed only for the local server. Alternatively, use any static HTTP server. Opening the HTML directly with `file://` is not supported because the JavaScript uses modules.

## Included

- JPG, PNG and WebP input, with file picker and drag and drop.
- Target-size presets and custom limits; 1 KB = 1,000 bytes.
- Two file-size modes: stay under a maximum, or make a JPG exactly the requested KB (smaller or larger). Exact mode converts PNG/WebP inputs to JPG and fills transparent areas white.
- Width and height controls, with optional aspect-ratio lock.
- Rotate left/right in 90-degree steps, flip horizontally/vertically, and reset edits. The preview and downloaded pixels use the same transformations.
- Crop to square, 4:3, 3:4, 16:9, 9:16, 4:5, or 5:4. Zoom from 100–300% and adjust horizontal/vertical framing with keyboard-accessible sliders. Rotation and flipping preserve the selected content.
- Quick size presets: square 1080×1080, portrait 1080×1350, story 1080×1920, and video thumbnail 1280×720. Presets crop to fit, preserve the image ratio, and disable automatic dimension reduction; small inputs may be enlarged.
- Brightness, contrast, and black-and-white adjustments with a live preview and a separate color reset. PNG and WebP retain transparency; JPG composites the adjusted image on white.
- Optional text watermarks (up to 80 characters), with five positions, color, relative size, and opacity controls. Text is drawn after photo edits, stays upright, and shrinks to fit when needed. No watermark is added unless you enter text.
- Optional background color for existing transparent pixels. Turning it off restores transparency for PNG/WebP; JPG defaults to white. This does not remove an existing photo background.
- Custom download filenames with an automatic format extension. Renaming a prepared result does not reprocess the image. Names are normalized to remove path characters; a new photo clears the custom name.
- Resize to 50%, 100%, or 200% of the current crop's original pixels, keeping its ratio and browser dimension limits. Enlargement does not restore missing detail.
- Batch resize, compression, and format conversion for up to 20 photos (25 MB each, 100 MB total). Each photo preserves its ratio and is never enlarged; single-photo tool settings do not apply to a batch.
- Individual batch downloads and a ZIP download with unique Unicode filenames. Corrupt files are skipped with an explanation; outputs above the requested size are visibly marked and included in the ZIP. Stop processing after the current photo and keep completed results.
- JPG, PNG and WebP export; PNG and WebP preserve transparency unless a background color is enabled, and JPG uses white by default behind transparent pixels.
- Quality search for JPG/WebP. Optional dimension reduction when quality alone cannot meet a limit.
- Original and processed previews, actual output dimensions, target checks, and downloads.
- A generated sample illustration, keyboard controls, accessible status messages, responsive layout.
- A Content Security Policy limits connections to this site and the configured Supabase project on GitHub Pages and other static hosts. Cloudflare also applies the additional headers in `public/_headers`.

The app never claims success for an output above the target. Exact dimensions take priority unless the user enables dimension reduction. PNG is lossless, so encoding-quality adjustments do not reduce PNG file size. No guarantee of official form acceptance. Background removal and OCR are not included. PDF-to-image conversion is available as a separate local tool.

To make a 25 KB file 50 KB, select **Exact file size** from the menu, enter **50**, and prepare the photo. To make a larger file smaller, use the same mode with a smaller target or use the maximum-size mode. If the encoded image still exceeds the target at minimum quality, the result is explicitly marked as not meeting the target; optional dimension reduction can help.

Exact JPG output uses the highest quality found within the target, then adds valid JPEG comment segments and marker fill bytes before the end-of-image marker when needed. Padding preserves the encoded pixels and does not improve quality. The UI discloses when non-image data is added. Some receiving sites re-encode images or strip metadata, so the size can change after uploading elsewhere. Format reference: https://www.w3.org/Graphics/JPEG/itu-t81.pdf (marker fill bytes and COM segments).

Input is limited to 25 MB and 40 million decoded pixels; output is limited to 4,096 pixels per side and 16 million pixels. Very large inputs may still exceed memory on older devices. Animated inputs become a still image. Refreshing discards work. The hosting provider receives ordinary website requests. Photo data is sent to private Supabase storage only when a signed-in member explicitly chooses Save to My Files.

Batch processing decodes one photo at a time and caps the combined output at 100 MB. ZIP files use uncompressed entries with CRC-32 checksums, so the image bytes are preserved without extra runtime dependencies. Changing settings or choosing another batch discards old download links.

## Deploy free on Vercel

The root `vercel.json` deploys only `public/`, skips dependency installation and builds, and applies the same privacy headers as Cloudflare. Guest processing needs no server functions or database. Optional accounts use Supabase Auth, private Storage, a database, and an account-deletion Edge Function; configure these separately. Use Vercel's **Hobby** plan for this personal, non-commercial project.

The deployed project is `ilovefreecompressor` in the `kathir-project` Hobby account, with production address `https://ilovefreecompressor.vercel.app/`. It currently uses CLI deployments, without an automatic Git connection. Sign in with the Vercel CLI and use `npm run deploy:production` from a published release branch. This command rejects `main`, detached HEADs, uncommitted changes, and commits that do not match the remote release branch. It records the release branch and commit in deployment metadata. Install the Vercel CLI on your PATH, or set `ILFC_VERCEL_CLI` to its JavaScript entry point. `.vercel/` account/project link settings are excluded from Git.

### Release workflow

`main` is the local development branch and remains backed up on GitHub. Pushing it does not publish the website. Production releases use dated `release/*` branches. The second release is `release/04-10-2026-i-love-free-compressor_second_release`. The original `release/04-10-2024-i-love-free-compressor_first_release` remains an unchanged archive.

1. Develop and run the relevant checks on `main`, then commit and push the reviewed changes.
2. Create a new dated release branch from that tested commit, for example `git switch -c release/DD-MM-YYYY-i-love-free-compressor_third_release`.
3. In GitHub **Settings → Environments → github-pages → Deployment branches and tags**, allow the new release branch and remove the previous branch from the allowlist. Keep the environment restricted to selected branches; do not allow `main`. This selects the active Pages release without modifying archived branches.
4. Publish the branch with `git push -u origin HEAD`. GitHub Pages deploys it through Actions. Manual workflow runs must also select the release branch; runs on `main` skip deployment.
5. Run `npm run deploy:production -- --check`, then `npm run deploy:production` for Vercel. Verify both live sites and the deployed commit.
6. Return to development with `git switch main`. Keep completed release branches as snapshots; prepare later changes on `main` and cut a new release.

Do not use a direct `vercel --prod` command from `main`: direct CLI commands bypass the repository guard. If Vercel Git integration is added later, explicitly select the active release as its production branch before enabling automatic deployments. Development previews must not replace production.

When changing the primary website address, update the canonical URL, Open Graph URL, sitemap, and Google Search Console URL-prefix property to match the assigned address.

Official instructions: https://vercel.com/docs/deployments/overview and https://vercel.com/docs/plans/hobby

## Deploy free on GitHub Pages

The repository includes `.github/workflows/pages.yml`. It publishes only `public/` on pushes to `release/*`, using the official GitHub Pages actions. The `github-pages` environment permits only the selected production release branch. No build step, dependency installation, custom domain, or paid service is required. Use a public repository to stay on GitHub Free.

1. Push this project to a public GitHub repository.
2. Under **Settings → Pages → Build and deployment**, choose **GitHub Actions** as the source.
3. Allow the active release branch in the `github-pages` environment. Run **Deploy to GitHub Pages** from the **Actions** tab with that branch selected, or push the release branch.
4. The deployment reports the live URL, normally `https://USERNAME.github.io/i-love-free-compressor/`.

All asset URLs are relative, so the site works under a repository subpath. GitHub Pages ignores the Cloudflare `_headers` file; the HTML Content Security Policy still applies.

Official instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## Google Search indexing

The page includes a descriptive title, description, canonical URL, indexable HTML, and social sharing metadata. `public/sitemap.xml` lists the production homepage. These features help discovery and interpretation; they do not guarantee indexing or a particular ranking.

1. In https://search.google.com/search-console, add a **URL-prefix** property for `https://ilovefreecompressor.vercel.app/`.
2. Choose **HTML tag** verification. Add the exact `google-site-verification` meta tag supplied by Google to the head of `public/index.html`, deploy, and click **Verify** in Search Console.
3. Submit `https://ilovefreecompressor.vercel.app/sitemap.xml` under **Sitemaps**.
4. Inspect the homepage URL and select **Request indexing**. Monitor the result in Search Console; crawling may take days or weeks and is not guaranteed.

The sitemap must be submitted directly: a `robots.txt` inside a GitHub project subpath does not control the host's crawler policy. If the production address changes, update the canonical URL, Open Graph URL, and sitemap together.

Official guidance: https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl

## Alternative: deploy free on Cloudflare Pages

No build step is needed: `public/` is the complete site.

1. Create or sign into your free Cloudflare account.
2. Open **Workers & Pages**, create an application, and choose **Pages / Drag and drop your files** (dashboard labels may vary).
3. Name the project, for example `i-love-free-compressor`.
4. Upload the `public` folder, or generate an archive with `python3 scripts/package.py` and upload `i-love-free-compressor.zip`.
5. Select **Deploy site**. Cloudflare provides a `pages.dev` URL. Use the free plan and supplied subdomain; no custom domain or paid service is required.

Upload only `public/` or the generated archive, not the whole repository. A Direct Upload project cannot later be switched to Git integration; automatic Git deployments need a new project. If using Git integration from the start, set the output directory to `public`, with no build command or framework.

Official instructions: https://developers.cloudflare.com/pages/get-started/direct-upload/
Current pricing and limits: https://developers.cloudflare.com/pages/functions/pricing/ and https://developers.cloudflare.com/pages/platform/limits/

Hosting is subject to the provider's current free-plan terms. This project itself requires no paid dependencies or services.

## Test

```sh
npm test
```

The image-tool browser integration suite uses installed Google Chrome. Use Node.js 22+ and `npm ci` for the account SDK build and PostgreSQL account tests. Set `CHROME_BIN` if Chrome is not at `/usr/bin/google-chrome`. It starts its own localhost server and isolated temporary browser profile, exercises the actual browser encoder and UI, and saves desktop/mobile screenshots in `test-artifacts/`.

## Optional accounts and role-based access

Six dedicated views are available from **Sign in / My account**: sign-in, dashboard, private files, activity history, profile/settings, and administration. Guest image tools remain available without login. Google sign-in is enabled only after backend setup; until then the account pages clearly explain that setup is pending.

Follow [supabase/SETUP.md](supabase/SETUP.md) to create the free backend, enable Google OAuth, deploy account deletion, configure public credentials/CSP, and preapprove the first admin for activation after verified sign-in. Secret/server keys never belong in the public directory.

Validation:

```sh
npm ci
npm run test:accounts   # PostgreSQL RLS/quotas + deletion handler
npm run test:account-ui # Real Chrome + SDK, intercepted test API
npm test               # All existing image-tool browser checks
```

Backend tests exercise the actual migration with PostgreSQL roles and policies. Browser account tests use controlled responses; the live OAuth/Storage acceptance checks in SETUP.md remain required after connecting a real project.


## Professional workspace release

The shared light theme uses white surfaces, blue/teal accents, responsive controls, and a grouped collapsible sidebar. Each tool has a separate hash route. The task finder, recent tools, favorites, keyboard help, clipboard image input, and undo/redo for supported photo/drawing edits reduce repeated steps. Undownloaded edits trigger a page-leave reminder. Browser memory is temporary; saved workflow settings never include source files.

### Twenty additional tools

- PDFs: merge, split/extract pages, PDF-to-image ZIP, visual page organization with reorder/rotate/delete, text watermarks, page numbers, selectable-text extraction, and text-to-PDF.
- Creative: solid image redaction, transparent signatures, logo watermarks, annotations, contact sheets, image stitching, canvas expansion, and gradient backgrounds.
- Web utilities: QR generation/reading, image/Base64 conversion, and favicon packages (PNG sizes plus ICO).

Libraries are pinned, bundled on this site, and loaded on demand. PDF operations use pdf-lib and PDF.js; QR operations use qrcode and jsQR. Run `npm run build:tools` after changing these dependencies. Redistribution notices are in `public/vendor/TOOLS-LICENSES.txt`.

PDF limits: 25 MB per document, 100 MB combined, 20 input documents, 200 pages combined. Encrypted PDFs are not supported. PDF text extraction reads existing selectable text, not scans. Text-to-PDF and PDF watermarks use a standard Latin font. Page thumbnails render one at a time. PDF-to-images limits output to 100 MB; reduce page selection or resolution if necessary. Rewriting a PDF can invalidate existing digital signatures.

New image tools accept JPG/PNG/WebP up to 25 MB/40 million input pixels; exports are bounded to 4096 px per edge and 16 million pixels. Stitching asks for a smaller shared edge if the combined result exceeds those dimensions. Base64 decoding accepts only supported image data URLs and re-encodes pixels. QR reader displays plain text and never follows links. Redaction exports flattened opaque blocks; inspect the downloaded result before sharing. Signature creator is a drawing tool, not a certificate-based digital signing service.

`#/workflow` saves up to ten resize → text watermark → compression presets. Guests store settings on this device; members save them in their existing private profile preferences. Files are still explicitly chosen for every run. Batch filenames support `{n}`, `{name}`, `{width}`, and `{height}`.

### Account workspace improvements

My Files adds folders, search/type/folder filters, sorting, rename/move, image/PDF/text previews, image reopening, multi-selection, ZIP downloads, and deletion. Folder labels are metadata only; storage object paths always remain owner UUID/file UUID. Account storage meters include charged pending uploads. Activity history exports as CSV with spreadsheet formula escaping.

The admin dashboard adds exact user/status counts, stored/reserved file usage, role/status filters, audit action/date filters (latest 100 records), and a dismissible plain-text site announcement. The dashboard reports app file storage, not total Supabase database disk usage. Public registration still creates members; existing server-side admin and last-admin protections remain in force.

Apply `supabase/migrations/202610040003_workspace.sql` once to an existing configured project before deploying this release. It adds only metadata and tightly scoped RPCs; no user roles, files, or quotas are rewritten. Public announcement retrieval reveals only the announcement text and revision. Only an active admin can publish it. The Supabase project continues to enforce configured per-user and site storage limits.

### Release verification

```sh
npm run test:accounts
npm run test:account-ui
npm run test:studio
npm test
```

The studio tests exercise all twenty new tools in real Chrome, inspect PDF page counts, decoded redaction pixels, QR round trips, ZIP signatures, saved workflows, and responsive layouts. The original suite continues validating image encoders and every existing tool. Account tests cover metadata ownership, admin authorization, folders/previews, Google PKCE callback handling, private data cleanup, and existing quota/deletion protections.


## Navigation and feature guides

The header keeps All tools, Features, How to use, About, Video demos, Login, and Sign up accessible on desktop and mobile. Signed-in users see My dashboard and Settings instead of registration links. `#/signup` explains free Member registration and uses the existing verified Google sign-in flow; it does not introduce a separate password system or new roles.

Public information pages: `#/about`, `#/how-to-use`, `#/features`, `#/faq`, and `#/privacy`. The feature directory has text search and category filters. Every tool, the saved-workflow feature, and each account module has its own `#/guide/<feature>` route with individual steps, an example, limitations, related guides, and an Open feature action. Guides support link copying with a manual-copy fallback and a focused print layout. These are client-side routes, not separately generated indexable HTML pages.

All tools now supports combined search/category filtering. Each tool workspace links to its matching guide. Recent-tool shortcuts can be cleared on the current device. Neither clearing recent tools nor browsing help deletes saved files or activity history.


## Visual design and video walkthroughs

The reference-inspired design uses a white identity header, navy navigation, a blue network-pattern hero, orange accents, and white account and tool panels. Homepage summaries describe real features, and the account panel switches to dashboard links after sign-in. The same navy network-pattern heading, white panels, blue controls, and orange accents apply to all 101 tool, account, information, workflow, and guide routes. The existing vertical tool navigation remains available. CSS lives in `public/design.css`; the original decorative network pattern is in `public/assets/network.svg`.

`#/videos` offers four approximately 30-second captioned walkthroughs: the website tour, compression, resizing, and presentation creation. Direct links are `#/videos/tour`, `#/videos/compress`, `#/videos/resize`, and `#/videos/presentations`. Each video is an MP4 made from the actual redesigned website and built-in sample image, with synchronized computer-generated English narration, on-screen instructions, four caption cues, and a complete written walkthrough. The native player starts with sound only after pressing Play and includes an explicit Mute narration button plus standard volume controls. Narration remains in downloaded MP4s. There is no third-party player. The four narrated MP4s together are approximately 2 MB; media is loaded only after pressing Play. Playback stops when leaving the page. Native controls provide seeking, volume, fullscreen, and captions after playback starts. Download links and written steps remain available if playback fails.

Generated videos, posters, and WebVTT captions live in `public/videos/`. To refresh recordings after a UI change:

```sh
npm run capture:demos
# In a local Python environment with piper-tts==1.8.0 and Pillow installed:
PIPER_MODEL=/path/to/en_US-ljspeech-medium.onnx python3 scripts/generate-demo-audio.py
FFMPEG_BIN=/path/to/ffmpeg python3 scripts/build-demo-videos.py
FFMPEG_BIN=/path/to/ffmpeg python3 scripts/check-demo-audio.py
```

The original narration script is shared in `scripts/demo-content.json`. Speech is synthesized locally using Piper and the LJSpeech medium voice; source credits are in `public/videos/NOTICE.txt`. Download the ONNX model and matching JSON configuration from the [voice repository](https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/ljspeech/medium). The build also requires FFmpeg with H.264/AAC encoding and DejaVu Sans fonts (override `DEMO_FONT_DIR` if necessary). WAV intermediates stay in ignored `test-artifacts/demo-audio/`. No speech engine, voice model, or video-generation dependencies are installed in the deployed website.

The MP4s use `*-narrated.mp4` filenames so browsers cannot reuse the old silent assets. Audio starts 0.35 seconds into each matching scene and is normalized to -18 LUFS with a -2 dB true-peak limit. The audio checker decodes the final MP4 track and verifies audible content in every scene, unclipped peaks, and matching duration.

Run `npm run test:videos` for real Chrome audio decoding, mute/volume recovery, playback, seeking, caption parsing, explicit loading, route cleanup, failure recovery, desktop/mobile layout checks, and shared banner colours on all 121 routes. `ILFC_LIVE_URL=https://your-site/ npm run test:videos` checks the hosted assets too.


### Six additional utilities

The catalog now has 50 tools and 57 guides. Each utility has a separate route and runs locally without signing in:

- `#/image-privacy`: fresh PNG pixels, excluding original camera/GPS metadata; visible content remains.
- `#/image-dpi`: re-save JPG/PNG at 1–1,200 DPI with unchanged pixel dimensions. JPG uses high-quality re-encoding. Both image tools accept up to 25 MB and export up to 4,096 pixels per edge / 16 million pixels total.
- `#/pdf-properties`: read/edit document title, author, subject and keywords, or clear all Info properties. Both modes remove document-level XMP. Content, annotations and attachments remain. Up to 25 MB / 200 pages, unencrypted PDFs only.
- `#/text-cleanup`: whitespace cleanup, case conversion, exact duplicate-line removal, and live Unicode code-point / whitespace-word counts.
- `#/json-format`: validation, indentation or minification, preserving original number tokens and duplicate keys. Up to 1 million input characters / 8 million formatted characters. Account saves use the existing plain-text storage type while retaining the `.json` filename.
- `#/checksum`: local SHA-256 with optional expected-hash comparison; any file up to 100 MB. This is a content comparison, not a malware scan.

Run `npm run test:utilities` for browser processing, known checksum vectors, metadata removal, PDF page preservation, PNG CRC/density, JPEG density, exact JSON numbers, input validation, cancellation, and mobile routes/guides.


## Presentations

A separate **Presentations** header link and sidebar group open four focused pages:

- `#/presentations`: slide editor with up to 30 slides, eight layouts (title, bullets, columns, image, quote, chart, table, closing), six themes, 16:9 / 4:3 sizes, live preview, notes, move/duplicate/delete, and 20-step undo/redo.
- `#/presentation-templates`: five editable starter decks for project updates, lessons, pitches, portfolios, and meetings. Chart values are labelled examples, not business claims.
- `#/outline-presentation`: headings (`# Title`) become slides and following lines become content. Create a deck or append; no AI service or API key is used.
- `#/presentation-drafts`: explicitly save up to five decks in IndexedDB (40 MB combined), reopen, delete, or import/export project backups (`.ilfc.json`, up to 18 MB). Drafts are device/browser-local and separate from account storage.

Images are normalized to PNG on the device, with a maximum 1,600-pixel edge, 10 MB source / 40 million source pixels, 2.5 MB embedded data URL per image, and 12 MB of embedded images per deck. Notes are included in project backups and PPTX; audience view hides them by default. The presentation player supports arrow keys, Home/End, previous/next, optional notes, and full screen. Leaving the route closes it.

PowerPoint export uses the self-hosted MIT-licensed PptxGenJS bundle loaded only on export. Text, tables, and charts remain editable; uploaded images are embedded. PDF export rasterizes slides without speaker notes. Fonts/line breaks may differ between preview and PowerPoint. Existing .pptx import, cloud presentation saves, animations, and collaboration are not implemented. Use project backups to move editable decks between devices. Replacing an unsaved deck and deleting a draft require an in-app confirmation.

Run `npm run build:presentations` to rebuild the export bundle and license file. The unused Node image-size dependency is pinned to patched 2.0.4 through an npm override; it is excluded from the browser bundle. `npm run test:presentations` checks actual downloads, OOXML slides/chart/table/notes, Unicode, images, PDF pages, both aspect ratios, editing/history, persisted drafts, backup import, validation, and mobile layouts. Set `ILFC_LIVE_URL` to repeat against a deployment. Exported widescreen and standard PPTX samples were also opened and rendered as eight-page PDFs by LibreOffice.
