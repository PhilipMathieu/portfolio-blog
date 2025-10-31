# Cloudflare Pages Deployment Guide

This guide explains how to deploy this Astro site to Cloudflare Pages using Git integration.

## Prerequisites

1. Your repository must be pushed to GitHub or GitLab
2. You must have a Cloudflare account
3. Your Cloudflare account must have access to your Git repository

## Deployment Steps

### 1. Connect Repository to Cloudflare Pages

1. In the Cloudflare dashboard, go to **Workers & Pages**
2. Select **Create application** > **Pages** > **Connect to Git**
3. Authorize Cloudflare to access your GitHub/GitLab account
4. Select your repository (`portfolio-blog`)

### 2. Configure Build Settings

Since this Astro site is in a monorepo subdirectory, configure the following settings:

**Framework preset:** Astro (or leave blank)

**Build command:**
```bash
npm run build
```

**Build output directory:**
```
dist
```

**Root directory (advanced):**
```
astro-site
```

This tells Cloudflare Pages to:
- Work from the `astro-site` directory (root directory)
- Run `npm run build` to build the site
- Deploy the contents of the `dist` folder

### 3. Environment Variables

If your site requires environment variables, add them in the Cloudflare Pages dashboard under **Settings** > **Environment variables**.

### 4. Deploy

Click **Save and Deploy** to start the first deployment.

## Automatic Deployments

After the initial setup, Cloudflare Pages will automatically:
- Build and deploy your site on every push to the production branch (default: `main` or `master`)
- Create preview deployments for pull requests

## Manual Deployment

You can also manually trigger deployments from the Cloudflare Pages dashboard.

## Custom Domain

To add a custom domain:
1. Go to **Settings** > **Custom domains**
2. Add your domain
3. Update DNS records as instructed

## Notes

- The `@astrojs/cloudflare` adapter is installed but optional for static sites
- For static sites, the adapter can be removed if not using SSR or Cloudflare-specific features
- Builds run from the `astro-site` directory as specified in the root directory setting

