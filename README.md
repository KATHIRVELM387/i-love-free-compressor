# I Love Free Compressor

Live website: https://ilovefreecompressor.vercel.app/

GitHub Pages mirror: https://kathirvelm387.github.io/i-love-free-compressor/

Source code: https://github.com/KATHIRVELM387/i-love-free-compressor

A free, mobile-friendly photo resizing and compression tool. All photo processing happens in the browser. Guest tools require no account or backend and do not upload photos. Optional Google accounts add private cloud saves, preferences, activity history, and admin access through a separately configured Supabase Free project. There are no analytics or external fonts.

## Choose a tool

The homepage shows twenty tool cards. Selecting a card opens a dedicated view with only the controls needed for that task: compression, exact KB, resizing, cropping/presets, rotation/flipping, format conversion, light/color, watermarks, transparency backgrounds, batches, collages, images to PDF, filters, frames, rounded corners, pixel art, splitting, palettes, comparison, or image details.

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
- A Content Security Policy in the HTML blocks outbound connections from page scripts on GitHub Pages and other static hosts. Cloudflare also applies the additional headers in `public/_headers`.

The app never claims success for an output above the target. Exact dimensions take priority unless the user enables dimension reduction. PNG is lossless, so encoding-quality adjustments do not reduce PNG file size. No guarantee of official form acceptance. Background removal and PDF-to-image conversion are not included.

To make a 25 KB file 50 KB, select **Exact file size** from the menu, enter **50**, and prepare the photo. To make a larger file smaller, use the same mode with a smaller target or use the maximum-size mode. If the encoded image still exceeds the target at minimum quality, the result is explicitly marked as not meeting the target; optional dimension reduction can help.

Exact JPG output uses the highest quality found within the target, then adds valid JPEG comment segments and marker fill bytes before the end-of-image marker when needed. Padding preserves the encoded pixels and does not improve quality. The UI discloses when non-image data is added. Some receiving sites re-encode images or strip metadata, so the size can change after uploading elsewhere. Format reference: https://www.w3.org/Graphics/JPEG/itu-t81.pdf (marker fill bytes and COM segments).

Input is limited to 25 MB and 40 million decoded pixels; output is limited to 4,096 pixels per side and 16 million pixels. Very large inputs may still exceed memory on older devices. Animated inputs become a still image. Refreshing discards work. The hosting provider receives ordinary website requests but the app sends no photo data.

Batch processing decodes one photo at a time and caps the combined output at 100 MB. ZIP files use uncompressed entries with CRC-32 checksums, so the image bytes are preserved without extra runtime dependencies. Changing settings or choosing another batch discards old download links.

## Deploy free on Vercel

The root `vercel.json` deploys only `public/`, skips dependency installation and builds, and applies the same privacy headers as Cloudflare. Guest processing needs no server functions or database. Optional accounts use Supabase Auth, private Storage, a database, and an account-deletion Edge Function; configure these separately. Use Vercel's **Hobby** plan for this personal, non-commercial project.

Import this repository into Vercel, use **Other** as the framework, and keep the output directory as `public`. Alternatively, sign in with the Vercel CLI and deploy this repository with `vercel --prod`. The deployed project is `ilovefreecompressor` in the `kathir-project` Hobby account, with production address `https://ilovefreecompressor.vercel.app/`. For this linked checkout, publish updates with `vercel deploy --prod --scope kathir-project`. `.vercel/` account/project link settings are excluded from Git.

When changing the primary website address, update the canonical URL, Open Graph URL, sitemap, and Google Search Console URL-prefix property to match the assigned address.

Official instructions: https://vercel.com/docs/deployments/overview and https://vercel.com/docs/plans/hobby

## Deploy free on GitHub Pages

The repository includes `.github/workflows/pages.yml`. It publishes only `public/` on each push to `main`, using the official GitHub Pages actions. No build step, dependency installation, custom domain, or paid service is required. Use a public repository to stay on GitHub Free.

1. Push this project to a public GitHub repository.
2. Under **Settings → Pages → Build and deployment**, choose **GitHub Actions** as the source.
3. Run **Deploy to GitHub Pages** from the **Actions** tab, or push a change to `main`.
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

Follow [supabase/SETUP.md](supabase/SETUP.md) to create the free backend, enable Google OAuth, deploy account deletion, configure public credentials/CSP, and establish the first admin. Secret/server keys never belong in the public directory.

Validation:

```sh
npm ci
npm run test:accounts   # PostgreSQL RLS/quotas + deletion handler
npm run test:account-ui # Real Chrome + SDK, intercepted test API
npm test               # All existing image-tool browser checks
```

Backend tests exercise the actual migration with PostgreSQL roles and policies. Browser account tests use controlled responses; the live OAuth/Storage acceptance checks in SETUP.md remain required after connecting a real project.
