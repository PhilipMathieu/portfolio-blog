# Showboat for agents

[Showboat](https://github.com/simonw/showboat) builds re-runnable demo documents that mix commentary, executed code blocks, and captured screenshots. Use it when an agent needs to **prove** something visual or behavioural in a PR — the resulting markdown serves as both narrative and reproducible evidence.

This document is the working knowledge needed to use showboat productively in this repo's two common agent environments: **(A) Claude Code with sandbox mode enabled** on a local macOS workstation, and **(B) a remote codespace or CI runner** where nothing is preinstalled.

---

## When to reach for showboat

Reach for it when:

- A PR adds a visual feature (sidenote layout, new component, design change) and the reviewer needs to **see** the result, not just read the diff.
- An agent's reasoning is multi-step and worth recording (build → inspect HTML → screenshot → verify).
- You want the demo to be **re-runnable**: `showboat verify <file>` re-executes every code block and diffs the recorded output, so the doc keeps proving itself over time.

Don't reach for it for:

- Throwaway one-off shell sessions. The init/note/exec/image dance has overhead.
- Documents that the human will edit. Showboat assumes the file is append-only between agent runs; manual edits break `verify`.

## Where the output goes

**It does not go in the tree.** PR review artifacts belong in the PR conversation, not as committed `.md` files that future readers stumble across. Build the showboat doc in `$TMPDIR` (or anywhere outside the working tree), then post the rendered markdown as a PR comment with `gh pr comment <pr> --body-file <doc>`. The doc and the captured outputs all live in the conversation thread.

Screenshots are a partial exception — they need to be hosted somewhere `raw.githubusercontent.com` can serve them. The path of least resistance is committing them to a `screenshots/<pr-number>/` directory at the **repo root** (not inside `astro-site/`, so Astro doesn't try to publish them). Reference them by raw URL in the PR comment. Offer to remove the screenshot commit later if reviewers prefer not to carry them in branch history.

`gh gist create` does not accept binary uploads, so gists are not a viable image host as of `gh` ~2.62.

---

## Installation

```bash
# Persistent install (preferred when you'll use showboat repeatedly)
uv tool install showboat

# One-off (no install footprint)
uvx showboat --help
```

`uv` is available in Claude Code's sandbox by default. If installing fails with sandbox-write errors, point `uv` at `$TMPDIR`:

```bash
UV_TOOL_DIR="$TMPDIR/uv-tools" uv tool install showboat
```

In a fresh codespace, install `uv` first (`pipx install uv` or `curl -LsSf https://astral.sh/uv/install.sh | sh`).

## The basic workflow

```bash
DOC="$TMPDIR/sidenotes-demo.md"  # not in the tree

showboat init "$DOC" "Title of the Demo"
showboat note "$DOC" "Some Markdown commentary."
showboat exec "$DOC" bash "ls -1 src/components/MyThing.astro"
showboat image "$DOC" "![Alt text](/path/to/screenshot.png)"
showboat verify "$DOC"     # re-runs all exec blocks, diffs against recorded output. Exit 0 = doc still reproduces.
```

A few habits:

- **Use stable commands.** Anything that prints timestamps, random IDs, or unfiltered build noise will fail `verify` next time. Pipe through `grep`, `head`, or just `echo OK` when only the success is meaningful.
- **Use `showboat pop`** to remove the most recent entry if a command fails or produces ugly output. Re-run with a fix.
- **Use stdin for multi-line scripts.** `cat /tmp/script.sh | showboat exec "$DOC" bash` is cleaner than escaping everything inline.

---

## Screenshot capture — environment A (local sandbox)

Claude Code's macOS sandbox blocks the Mach port rendezvous service that Chromium's helper processes use to register with the broker. Out of the box, this kills every browser launcher: `playwright.chromium.launch()`, `playwright.webkit.launch()`, `chrome-headless-shell` direct, and `qlmanage` all fail at startup.

**The escape hatch is `--single-process`**, which collapses Chromium's zygote/renderer/GPU helpers into the parent process so no child has to register with the broker. Combine with `--no-zygote` and `--no-sandbox`:

```js
import { chromium } from 'playwright';

const browser = await chromium.launch({
  chromiumSandbox: false,
  args: ['--single-process', '--no-zygote', '--no-sandbox', '--hide-scrollbars'],
});
```

Two caveats:

1. **One context per launch.** Single-process mode tears the browser down when the first context closes. If you need multiple viewports, launch a fresh browser per viewport.
2. **`file://` won't resolve absolute asset paths.** Astro builds emit `<link href="/_astro/foo.css">` style paths, which under `file://` resolve to the filesystem root and 404. Use Playwright `page.route()` interception to serve the built `dist/` from disk over a fake host — see `screenshot-static-html.cjs` in this directory for a working reference implementation.

Why not just `npm run dev`? **The sandbox blocks `listen()` on 127.0.0.1**, so any localhost HTTP server (Astro dev, `npm run preview`, `python -m http.server`) errors with `EPERM` before serving a byte. Route interception is the only path that works fully in-sandbox.

### Drafts and the production build

The blog's content collection excludes posts with `draft: true` from production builds (`astro-site/src/pages/blog/[...slug].astro`). To screenshot a draft post:

```bash
POST=astro-site/src/content/blog/your-post.md
sed -i.bak 's/^draft: true$/draft: false/' "$POST"
trap 'mv "$POST.bak" "$POST"' EXIT
( cd astro-site && npm run build > /dev/null )
# ... capture screenshots from astro-site/dist/blog/your-post/index.html ...
```

The trap restores the flag whether the build succeeds or fails. **Do not** ship the post as non-draft just to get it into `dist/`.

## Screenshot capture — environment B (remote codespace / CI)

In a fresh codespace there's no sandbox to dodge but also no preinstalled browser. Install playwright + a browser binary first:

```bash
cd astro-site
npm install
npx playwright install chromium    # ~150 MB download
```

Then either of the two approaches works:

- **Dev server + URL.** No port restrictions in a codespace, so `npm run dev` is the friendlier path. Run it in the background, screenshot the localhost URL, kill the server.
- **Static build + route interception.** Same `screenshot-static-html.cjs` pattern as environment A. Useful when the codespace lifecycle is short and you don't want a long-running dev server.

Drop the `--single-process` and `--no-sandbox` flags in codespaces — they cause subtle rendering issues outside the sandbox (worker scripts misbehave, some CSS doesn't apply correctly). Use a normal `chromium.launch()`.

## Hosting screenshots for a PR comment

```bash
mkdir -p screenshots/pr-<number>
cp /tmp/sidenotes-*.png screenshots/pr-<number>/
git add screenshots/pr-<number>/
git commit -m "demo: PR #<number> review screenshots"
git push origin HEAD
```

In the comment, reference each image as:

```markdown
![Description](https://raw.githubusercontent.com/<owner>/<repo>/<branch>/screenshots/pr-<number>/<file>.png)
```

The branch name works as a Git ref in `raw.githubusercontent.com` URLs (including names with slashes). If you'd rather pin to a commit so the image survives a force-push, substitute the full SHA.

## Posting the final doc

After `showboat init/note/exec/image` and a passing `showboat verify`, read the doc back, rewrite any local image paths in `![](...)` references to the raw URLs from the previous step, and post:

```bash
gh pr comment <pr> --body-file "$DOC"
# or to revise instead of stack:
gh pr comment <pr> --edit-last --body-file "$DOC"
```

Mention in the comment that the doc was built with showboat and `showboat verify` passes — reviewers might want to reproduce locally.

---

## Common pitfalls

- **The Astro build cache.** Astro caches content collection state in `.astro/`. If a rehype plugin change doesn't seem to take effect, `rm -rf astro-site/.astro/data-store.mjs astro-site/node_modules/.astro` before rebuilding.
- **`grep -c` returns 1 on zero matches.** `set -e` will fail your script. Use `$(grep -cE '...' || true)`. Don't append `|| echo 0` — that emits a stray `0` on the success path.
- **Showboat exec captures CRLF as actual `\r\n`** in the output block (open issue [simonw/showboat#29](https://github.com/simonw/showboat/issues/29)). Avoid commands that emit Windows line endings, or normalise with `tr -d '\r'`.
- **`showboat verify` ignores image blocks.** It does not re-capture screenshots. If the underlying page changes, you need to re-screenshot manually and re-run the `showboat image` step. See [simonw/showboat#14](https://github.com/simonw/showboat/issues/14).

## Reference

- Showboat source: https://github.com/simonw/showboat
- Companion script: [`screenshot-static-html.cjs`](./screenshot-static-html.cjs) — Playwright route-interception screenshot helper, works in both environments
- Worked example: PR #29 on this repo (sidenotes prototype)
