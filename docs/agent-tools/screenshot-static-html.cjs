/**
 * Screenshot a built static site at multiple viewports using Playwright,
 * serving the local `dist/` directory via request interception so that
 * absolute asset paths (e.g. `/_astro/foo.css`) resolve correctly under
 * what would otherwise be a `file://` URL.
 *
 * Why this exists:
 *   - Astro emits absolute asset paths in production builds. Loading the
 *     HTML directly via `file://` won't find `/_astro/...`.
 *   - In Claude Code's macOS sandbox, you can't bind a localhost port
 *     (Astro dev / `python -m http.server` / etc.), so a real HTTP server
 *     isn't an option.
 *   - Route interception serves files directly from disk in response to
 *     fake-host HTTP requests, which works inside the sandbox.
 *
 * Sandbox flags:
 *   When run inside Claude Code's sandbox on macOS, Chromium needs
 *   `--single-process --no-zygote --no-sandbox` to bypass the Mach port
 *   broker block. In a codespace or normal terminal, drop these flags
 *   (set SHOWBOAT_RUN_OUTSIDE_SANDBOX=1).
 *
 * Multi-viewport: under --single-process, closing the first context tears
 * the browser down, so we launch a fresh browser per viewport.
 *
 * Usage:
 *   NODE_PATH=$(npm root -g) node screenshot-static-html.cjs \
 *     <dist-root> <out-dir> [viewport ...]
 *
 *   viewport syntax: "<name>:<width>:<height>"
 *
 *   Example:
 *     NODE_PATH=$(npm root -g) node screenshot-static-html.cjs \
 *       ./astro-site/dist /tmp/shots \
 *       wide:1440:1200 narrow:480:900
 *
 * Configure the page path with TARGET_PATH (default
 * /blog/sidenotes-prototype/), and additional Chromium flags via
 * CHROMIUM_ARGS (comma-separated).
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const distRoot = path.resolve(process.argv[2] || './dist');
const outDir = process.argv[3] || process.env.TMPDIR || '/tmp';
const viewportArgs = process.argv.slice(4);

const TARGET_PATH = process.env.TARGET_PATH || '/blog/sidenotes-prototype/';

const inSandbox = !process.env.SHOWBOAT_RUN_OUTSIDE_SANDBOX;
const baseArgs = inSandbox
	? ['--single-process', '--no-zygote', '--no-sandbox', '--hide-scrollbars']
	: ['--hide-scrollbars'];
const extraArgs = (process.env.CHROMIUM_ARGS || '').split(',').filter(Boolean);
const launchArgs = [...baseArgs, ...extraArgs];

const contentTypes = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.js': 'application/javascript; charset=utf-8',
	'.mjs': 'application/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.svg': 'image/svg+xml',
	'.webp': 'image/webp',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.ttf': 'font/ttf',
	'.ico': 'image/x-icon',
	'.xml': 'application/xml',
};

async function capture({ name, width, height }) {
	const browser = await chromium.launch({
		chromiumSandbox: false,
		args: launchArgs,
	});
	try {
		const context = await browser.newContext({
			viewport: { width, height },
			deviceScaleFactor: 2,
		});
		const page = await context.newPage();

		await page.route('**/*', async (route) => {
			const url = new URL(route.request().url());
			if (url.hostname !== 'local.test') {
				return route.abort();
			}
			let pathname = url.pathname;
			if (pathname.endsWith('/')) pathname += 'index.html';
			const filePath = path.join(distRoot, pathname);
			try {
				const body = fs.readFileSync(filePath);
				const contentType = contentTypes[path.extname(filePath)] || 'application/octet-stream';
				await route.fulfill({ status: 200, contentType, body });
			} catch {
				await route.fulfill({ status: 404, contentType: 'text/plain', body: 'not found' });
			}
		});

		await page.goto(`http://local.test${TARGET_PATH}`, {
			waitUntil: 'networkidle',
			timeout: 15000,
		});
		await page.waitForTimeout(500); // give web fonts a moment to fail-fast

		const out = path.join(outDir, `${name}.png`);
		await page.screenshot({ path: out, fullPage: true });
		console.log('wrote', out);
	} finally {
		await browser.close();
	}
}

(async () => {
	const viewports = (viewportArgs.length
		? viewportArgs
		: ['wide:1440:1200', 'narrow:480:900']
	).map((spec) => {
		const [name, w, h] = spec.split(':');
		return { name, width: Number(w), height: Number(h) };
	});

	for (const v of viewports) {
		await capture(v);
	}
})().catch((e) => {
	console.error(e);
	process.exit(1);
});
