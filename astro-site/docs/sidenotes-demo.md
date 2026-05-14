# ThinkingMachines-Style Sidenotes Prototype

*2026-05-14T15:08:52Z by Showboat 0.6.1*
<!-- showboat-id: 2c29057a-c90a-43e9-95d4-a8382f62ba9b -->

Prototype for [issue #26](https://github.com/PhilipMathieu/portfolio-blog/issues/26): adopt the margin-annotation pattern from [thinkingmachines.ai/blog](https://thinkingmachines.ai/blog/). Standard GFM footnotes ([^label] syntax) are lifted into the right margin at build time by a custom rehype plugin — no client-side JavaScript needed.

## Files added

```bash
ls -1 src/utils/rehype-sidenotes.ts src/content/blog/sidenotes-prototype.md
```

```output
src/content/blog/sidenotes-prototype.md
src/utils/rehype-sidenotes.ts
```

## Files modified

```bash
git diff --stat origin/main -- astro.config.mjs src/layouts/BlogPost.astro src/styles/global.css
```

```output
 astro-site/astro.config.mjs           |  2 ++
 astro-site/src/layouts/BlogPost.astro |  2 +-
 astro-site/src/styles/global.css      | 60 +++++++++++++++++++++++++++++++++++
 3 files changed, 63 insertions(+), 1 deletion(-)
```

## How the plugin is registered

```bash
grep -E 'rehypeSidenotes|sidenote' astro.config.mjs
```

```output
import { rehypeSidenotes } from './src/utils/rehype-sidenotes';
      rehypeSidenotes,
```

## The transformation, in one signature

```bash
grep -B 6 '^export function rehypeSidenotes' src/utils/rehype-sidenotes.ts
```

```output
 * Build-time transform: lift GFM footnote definitions into sidenotes placed
 * next to the paragraph that references them. Each top-level block containing
 * one or more footnote references is wrapped in `<div class="sidenote-row">`,
 * followed by `<div class="sidenote-stack">` holding `<aside class="sidenote">`
 * elements. The original `<section data-footnotes>` is removed.
 */
export function rehypeSidenotes() {
```

## Verification: the generated HTML

The prototype post is marked `draft: true` so it's excluded from production builds. To verify the rendered HTML in a one-shot fashion, the verification step temporarily flips the draft flag, builds the site, inspects the output, and restores the flag — atomically, via a shell trap. This keeps the production blog index unchanged while still proving the plugin produces the expected structure.

```bash
set -e
POST=src/content/blog/sidenotes-prototype.md
sed -i.bak 's/^draft: true$/draft: false/' "$POST"
trap 'mv "$POST.bak" "$POST"' EXIT
npm run build > /dev/null 2>&1
echo "Build: OK"
echo
echo "Sidenote element counts:"
grep -oE 'class="sidenote[^"]*"' dist/blog/sidenotes-prototype/index.html | sort | uniq -c | sed 's/^ *//'
echo
LEFTOVER=$(grep -cE 'data-footnotes($|[^-])' dist/blog/sidenotes-prototype/index.html || true)
echo "Leftover <section data-footnotes>: $LEFTOVER"

```

```output
Build: OK

Sidenote element counts:
6 class="sidenote-number"
4 class="sidenote-row"
4 class="sidenote-stack"
6 class="sidenote"

Leftover <section data-footnotes>: 0
```
