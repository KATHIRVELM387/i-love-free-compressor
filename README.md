# I Love Free Compressor

Live website: https://kathirvelm387.github.io/i-love-free-compressor/

Source code: https://github.com/KATHIRVELM387/i-love-free-compressor

A free, mobile-friendly photo resizing and compression tool. All photo processing happens in the browser. No paid APIs, backend, database, accounts, uploads, analytics, external fonts, or runtime packages.

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
- JPG, PNG and WebP export; PNG preserves transparency, JPG uses white behind transparent pixels.
- Quality search for JPG/WebP. Optional dimension reduction when quality alone cannot meet a limit.
- Original and processed previews, actual output dimensions, target checks, and downloads.
- A generated sample illustration, keyboard controls, accessible status messages, responsive layout.
- A Content Security Policy in the HTML blocks outbound connections from page scripts on GitHub Pages and other static hosts. Cloudflare also applies the additional headers in `public/_headers`.

The app never claims success for an output above the target. Exact dimensions take priority unless the user enables dimension reduction. PNG is lossless, so quality adjustments do not reduce PNG file size. No guarantee of official form acceptance. PDF conversion and cropping are not included in this first version.

To make a 25 KB file 50 KB, select **Make smaller or bigger — exact KB (JPG)**, enter **50**, and prepare the photo. To make a larger file smaller, use the same mode with a smaller target or use the maximum-size mode. If the encoded image still exceeds the target at minimum quality, the result is explicitly marked as not meeting the target; optional dimension reduction can help.

Exact JPG output uses the highest quality found within the target, then adds valid JPEG comment segments and marker fill bytes before the end-of-image marker when needed. Padding preserves the encoded pixels and does not improve quality. The UI discloses when non-image data is added. Some receiving sites re-encode images or strip metadata, so the size can change after uploading elsewhere. Format reference: https://www.w3.org/Graphics/JPEG/itu-t81.pdf (marker fill bytes and COM segments).

Input is limited to 25 MB and 40 million decoded pixels; output is limited to 4,096 pixels per side and 16 million pixels. Very large inputs may still exceed memory on older devices. Animated inputs become a still image. Refreshing discards work. The hosting provider receives ordinary website requests but the app sends no photo data.

## Deploy free on Vercel

The root `vercel.json` deploys only `public/`, skips dependency installation and builds, and applies the same privacy headers as Cloudflare. No server functions, database, or paid APIs are used. Use Vercel's **Hobby** plan for this personal, non-commercial project.

Import this repository into Vercel, use **Other** as the framework, and keep the output directory as `public`. Alternatively, sign in with the Vercel CLI and deploy this repository with `vercel --prod`. The requested project name is `ilovefreecompressor`; Vercel must confirm availability of the corresponding `vercel.app` address. `.vercel/` account/project link settings are excluded from Git.

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

1. In https://search.google.com/search-console, add a **URL-prefix** property for `https://kathirvelm387.github.io/i-love-free-compressor/`.
2. Choose **HTML tag** verification. Add the exact `google-site-verification` meta tag supplied by Google to the head of `public/index.html`, deploy, and click **Verify** in Search Console.
3. Submit `https://kathirvelm387.github.io/i-love-free-compressor/sitemap.xml` under **Sitemaps**.
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

The browser integration suite uses installed Google Chrome and Node.js 18+, without npm packages. Set `CHROME_BIN` if Chrome is not at `/usr/bin/google-chrome`. It starts its own localhost server and isolated temporary browser profile, exercises the actual browser encoder and UI, and saves desktop/mobile screenshots in `test-artifacts/`.
