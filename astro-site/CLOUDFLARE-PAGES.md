# Cloudflare Pages Deployment Quick Reference

## Build Settings for Cloudflare Pages Dashboard

When setting up your project in Cloudflare Pages (via Git integration), use these settings:

### Framework Preset
**Astro** (or leave blank)

### Build Command
```
npm run build
```

### Build Output Directory
```
dist
```

### Root Directory (Advanced)
```
astro-site
```

> **Important:** Since your Astro site is in a subdirectory (`astro-site/`), you **must** set the root directory to `astro-site` so Cloudflare Pages knows where to find your `package.json` and build files.

## Environment Variables

Add any required environment variables in the Cloudflare Pages dashboard under **Settings** > **Environment variables**.

| Variable | Purpose |
| --- | --- |
| `PUBLIC_UMAMI_WEBSITE_ID` | Website ID from [Umami Cloud](https://cloud.umami.is) (Settings > Websites > Edit). Enables the analytics script; when unset, no analytics are loaded. |

Analytics notes:

- The Umami script only renders in production builds, and `data-domains` limits tracking to the production hostname, so `.pages.dev` preview deployments and local dev are never counted.
- Umami records `utm_*` query parameters automatically — see the **UTM** report in the Umami dashboard for referral campaign tracking. The site's share button tags copied/shared links with `utm_source=share_button` so those visits are attributable.

## After Setup

Once configured, Cloudflare Pages will:
- ✅ Automatically build and deploy on every push to your production branch
- ✅ Create preview deployments for pull requests
- ✅ Provide a `.pages.dev` URL for your site

## Reference

- [Cloudflare Pages Git Integration Guide](https://developers.cloudflare.com/pages/get-started/git-integration/)
- [Astro Cloudflare Deployment Guide](https://docs.astro.build/en/guides/deploy/cloudflare/)

