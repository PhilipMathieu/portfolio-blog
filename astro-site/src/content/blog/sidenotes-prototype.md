---
title: "Sidenotes in the Margin: A Prototype"
description: "Prototype of thinkingmachines-style margin annotations using GFM footnote syntax, lifted into the right gutter at build time."
pubDate: 2026-05-14
draft: true
tags: [design, prototype, typography]
aiUsage: "co-authored"
---

This post is a prototype for [issue #26](https://github.com/PhilipMathieu/portfolio-blog/issues/26). The goal: adopt the margin-annotation pattern used on [thinkingmachines.ai/blog](https://thinkingmachines.ai/blog/) so that asides, sources, and tangents can sit alongside the main text instead of disrupting it.[^why]

## How you write a sidenote

You write a sidenote the same way you write a footnote — using the GitHub Flavored Markdown footnote syntax.[^syntax] The build pipeline does the rest: a rehype plugin walks each post's HTML after Markdown has been converted, finds every footnote reference, and lifts the matching definition into an `<aside>` placed adjacent to the paragraph that referenced it.[^build]

```markdown
This paragraph has a sidenote.[^my-note]

[^my-note]: This is what appears in the margin.
```

The original footnotes section at the bottom of the page is removed, since every footnote now lives next to the text that mentions it.

## Responsive behavior

On viewports of at least 1280 pixels, the article container widens and sidenotes float into the right gutter via absolute positioning.[^breakpoint] Below that breakpoint they flow inline beneath the paragraph as a styled aside group, so a phone reader sees a tidy indented annotation rather than overflowing margin notes.

Multiple sidenotes within one paragraph stack vertically next to that paragraph.[^stacking] If you scroll quickly through the post you'll notice the sidenotes track the prose: each one is anchored to the paragraph that summoned it.[^anchoring]

## Why a rehype plugin

The previous attempt at this feature used a client-side script that walked the DOM after page load and moved footnote items around. That works, but it produces a flash of unstyled content on slow networks, breaks without JavaScript, and complicates accessibility. Doing the transformation at build time produces real HTML that ships statically: no JavaScript required for the visual layout to be correct, no FOUC, and screen readers see the sidenote in the natural reading order.

[^why]: thinkingmachines.ai uses this pattern heavily for citations and methodology asides. Putting commentary in the margin keeps the main column readable while making the supporting material immediately visible to anyone who wants it.
[^syntax]: GitHub Flavored Markdown footnote syntax: `[^label]` in the text, `[^label]: content` as the definition. The label is opaque — it can be a number, a word, or a phrase like `my-note`. The rendered superscript number is assigned in order of appearance.
[^build]: The plugin lives at `src/utils/rehype-sidenotes.ts` and is registered in `astro.config.mjs`. It runs after `rehype-katex` and `rehype-pretty-code` in the rehype phase.
[^breakpoint]: The article container is normally 1020 pixels wide; at the `xl` Tailwind breakpoint (1280 pixels) it expands to 1320 pixels, giving the sidenote gutter enough room.
[^stacking]: This paragraph has two sidenotes. They stack with a small gap. The CSS uses `flex-direction: column` on the `.sidenote-stack` container.
[^anchoring]: Anchoring is done through `position: absolute` inside a relatively-positioned `.sidenote-row` wrapper. Vertical alignment is the top of the paragraph that contains the reference.
