---
title: "Sidenote Annotations: A Prototype"
description: "A prototype of thinkingmachines-style margin annotations using footnote syntax."
pubDate: 2026-05-14
draft: true
tags: [design, prototype]
aiUsage: "co-authored"
---

This post is a prototype for [issue #26](https://github.com/PhilipMathieu/portfolio-blog/issues/26) — adopting margin annotations in the style of [thinkingmachines.ai/blog](https://thinkingmachines.ai/blog/). On a wide screen you should see the footnotes float into the right margin as sidenotes.[^1]

## How it works

Standard Markdown footnotes[^2] are authored inline using the `[^label]` syntax. At build time, Astro's remark-gfm plugin converts them to HTML superscript references with a footnotes section at the bottom of the page. The `ShowboatInit.astro` component[^3] then runs client-side to lift those footnote items out of the bottom section and place them as `<aside class="sidenote">` elements in the margin.

On screens narrower than 1280 px the sidenotes are hidden via CSS and the standard footnotes section at the bottom remains visible and accessible.[^4]

## Positioning approach

The sidenotes use `float: right` with a negative `margin-right` to push the element past the prose's right edge into the gutter.[^5] This avoids the need for JavaScript-calculated `top` values and lets the browser handle vertical stacking through `clear: right`.

The prose container is `max-w-[720px]` inside a `max-w-[1020px]` outer wrapper, leaving ~150 px of gutter on each side within the outer wrapper. At a 1280 px viewport there is ~130 px of additional margin outside the outer wrapper, so a 220 px sidenote fits with a small buffer.

## Adapting to the real showboat library

This prototype mirrors the pattern that [simonw/showboat](https://github.com/simonw/showboat) uses. Swapping in the actual library would mean:

1. Install showboat (e.g., `npm install simonw/showboat`)
2. Replace the inline script in `ShowboatInit.astro` with an `import` of showboat's entry point
3. Call showboat's initializer instead of the custom `initShowboat()` function

The CSS (sidenote width, colors, border) can stay in `global.css` regardless of which JS drives the positioning.

[^1]: Resize the browser window below 1280 px to see them collapse back to footnotes at the bottom of the page.
[^2]: GFM (GitHub Flavored Markdown) footnote syntax: `[^label]` in the text, `[^label]: content` as the definition anywhere in the file. The label can be a number or a word.
[^3]: `ShowboatInit.astro` lives in `src/components/` alongside `MermaidInit.astro` and `CopyButtonInit.astro`. It is included unconditionally in `BlogPost.astro`; posts without footnotes are unaffected.
[^4]: Footnote accessibility: screen readers see the original `<section data-footnotes>` because we only set `display: none` on wide screens, not on narrow ones. The back-reference links (↩) remain in the footnotes section.
[^5]: The exact CSS: `float: right; clear: right; margin-right: -250px; width: 220px`. At 1280 px viewport, the sidenote's right edge lands ~30 px from the viewport edge — enough for a comfortable visual buffer.
