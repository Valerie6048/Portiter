# Portiter indexing notes

- Canonical host: `https://www.akhmdnzr.fun`. The bare host currently redirects to `www`.
- `public/sitemap.xml` lists the home page and every project ID in `src/data/projectDetails.js`. The build script regenerates the production sitemap from those IDs, so new projects appear automatically.
- `scripts/generate-static-pages.mjs` creates an HTML shell for each project. Each shell has its own title, description, canonical, social metadata, and readable fallback content before React renders.
- `vercel.json` routes each `/project/:projectId` URL to its corresponding generated HTML. The React app continues to handle client navigation.
- Blog pages at `/blog/:slug` and `/id/blog/:slug` are generated from public Supabase translations during the Vercel build. The same generator updates the sitemap and creates language-specific RSS feeds at `/blog/feed.xml` and `/id/blog/feed.xml`.
- Admin paths are rewritten to the SPA and carry `X-Robots-Tag: noindex, nofollow, noarchive`. Blog paths without a generated published article are not rewritten to the SPA, so Vercel can return a real 404.
- Priority and change frequency are omitted because Google ignores them. Last modification dates are omitted until the project has reliable per-page content timestamps.

After deployment, confirm that `/sitemap.xml` is valid XML, each listed URL returns 200, each project's raw HTML contains its own canonical and title, and the bare host still redirects to `www`. Submit `https://www.akhmdnzr.fun/sitemap.xml` in Google Search Console for the verified site property, then use URL Inspection on a project page. A sitemap helps discovery but does not guarantee indexing.
