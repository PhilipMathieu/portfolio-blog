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

## After Setup

Once configured, Cloudflare Pages will:
- ✅ Automatically build and deploy on every push to your production branch
- ✅ Create preview deployments for pull requests
- ✅ Provide a `.pages.dev` URL for your site

## Reference

- [Cloudflare Pages Git Integration Guide](https://developers.cloudflare.com/pages/get-started/git-integration/)
- [Astro Cloudflare Deployment Guide](https://docs.astro.build/en/guides/deploy/cloudflare/)

