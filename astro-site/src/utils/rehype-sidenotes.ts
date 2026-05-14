import type { Element, ElementContent, Root, Text } from 'hast';

const FOOTNOTE_REF_ATTR = 'dataFootnoteRef';
const FOOTNOTE_BACKREF_ATTR = 'dataFootnoteBackref';
const FOOTNOTES_SECTION_ATTR = 'dataFootnotes';

function findFootnoteRefs(node: ElementContent): Element[] {
	const refs: Element[] = [];
	const walk = (n: ElementContent): void => {
		if (n.type !== 'element') return;
		if (n.tagName === 'a' && n.properties && FOOTNOTE_REF_ATTR in n.properties) {
			refs.push(n);
		}
		for (const child of n.children) walk(child as ElementContent);
	};
	walk(node);
	return refs;
}

function textOf(node: ElementContent): string {
	if (node.type === 'text') return (node as Text).value;
	if (node.type === 'element') {
		return (node.children as ElementContent[]).map(textOf).join('');
	}
	return '';
}

function stripBackrefs(node: ElementContent): void {
	if (node.type !== 'element') return;
	node.children = (node.children as ElementContent[]).filter((c) => {
		if (c.type === 'element' && c.properties && FOOTNOTE_BACKREF_ATTR in c.properties) {
			return false;
		}
		return true;
	});
	for (const child of node.children) stripBackrefs(child as ElementContent);
}

function cloneElement(node: Element): Element {
	return structuredClone(node);
}

function isFootnotesSection(node: ElementContent): node is Element {
	return (
		node.type === 'element' &&
		node.tagName === 'section' &&
		!!node.properties &&
		FOOTNOTES_SECTION_ATTR in node.properties
	);
}

function collectFootnoteItems(section: Element): Map<string, Element> {
	const items = new Map<string, Element>();
	const walk = (n: ElementContent): void => {
		if (n.type !== 'element') return;
		if (n.tagName === 'li' && typeof n.properties?.id === 'string') {
			items.set(n.properties.id as string, n);
		}
		for (const child of n.children) walk(child as ElementContent);
	};
	walk(section);
	return items;
}

function buildSidenote(ref: Element, item: Element, sidenoteId: string): Element {
	const clone = cloneElement(item);
	stripBackrefs(clone);

	const refId = (ref.properties?.id as string) ?? '';
	const label = textOf(ref).trim() || '*';

	const numberMark: ElementContent[] = [
		{
			type: 'element',
			tagName: 'sup',
			properties: { className: ['sidenote-number'] },
			children: [{ type: 'text', value: label }],
		} as Element,
		{ type: 'text', value: ' ' } as Text,
	];

	const children = (clone.children as ElementContent[]) ?? [];
	const firstP = children.find(
		(c): c is Element => c.type === 'element' && c.tagName === 'p',
	);
	if (firstP) {
		firstP.children = [...numberMark, ...(firstP.children as ElementContent[])];
	}
	const asideChildren = firstP ? children : [...numberMark, ...children];

	return {
		type: 'element',
		tagName: 'aside',
		properties: {
			className: ['sidenote'],
			role: 'note',
			'aria-label': `Sidenote ${label}`,
			'data-sidenote-for': refId,
			id: sidenoteId,
		},
		children: asideChildren,
	};
}

/**
 * Build-time transform: lift GFM footnote definitions into sidenotes placed
 * next to the paragraph that references them. Each top-level block containing
 * one or more footnote references is wrapped in `<div class="sidenote-row">`,
 * followed by `<div class="sidenote-stack">` holding `<aside class="sidenote">`
 * elements. The original `<section data-footnotes>` is removed.
 */
export function rehypeSidenotes() {
	return (tree: Root): void => {
		let sectionIndex = -1;
		let items: Map<string, Element> = new Map();

		for (let i = 0; i < tree.children.length; i++) {
			const child = tree.children[i] as ElementContent;
			if (isFootnotesSection(child)) {
				sectionIndex = i;
				items = collectFootnoteItems(child);
				break;
			}
		}

		if (items.size === 0) return;

		const consumed = new Set<string>();
		const newChildren: ElementContent[] = [];
		for (let i = 0; i < tree.children.length; i++) {
			if (i === sectionIndex) continue;

			const child = tree.children[i] as ElementContent;
			if (child.type !== 'element') {
				newChildren.push(child);
				continue;
			}

			const refs = findFootnoteRefs(child);
			if (refs.length === 0) {
				newChildren.push(child);
				continue;
			}

			const sidenotes = refs
				.map((ref) => {
					const href = (ref.properties?.href as string | undefined) ?? '';
					if (!href.startsWith('#')) return null;
					const targetId = href.slice(1);
					const item = items.get(targetId);
					if (!item) return null;
					consumed.add(targetId);

					// Each ref gets a unique sidenote id derived from the ref's own id
					// (GFM disambiguates repeated refs with suffixes like `-1-2`), and
					// we rewrite the ref's href to point at the new aside so the
					// superscript link still jumps somewhere.
					const refId = (ref.properties?.id as string) ?? '';
					const sidenoteId = refId ? `sidenote-${refId}` : `sidenote-${targetId}`;
					ref.properties = { ...ref.properties, href: `#${sidenoteId}` };

					return buildSidenote(ref, item, sidenoteId);
				})
				.filter((s): s is Element => s !== null);

			if (sidenotes.length === 0) {
				newChildren.push(child);
				continue;
			}

			const wrapper: Element = {
				type: 'element',
				tagName: 'div',
				properties: { className: ['sidenote-row'] },
				children: [
					child,
					{
						type: 'element',
						tagName: 'div',
						properties: { className: ['sidenote-stack'] },
						children: sidenotes,
					} as Element,
				],
			};
			newChildren.push(wrapper);
		}

		// If every footnote definition got lifted into a sidenote we can drop the
		// original `<section data-footnotes>`. Otherwise keep it so any unreferenced
		// definitions still appear on the page rather than silently disappearing.
		if (sectionIndex >= 0 && consumed.size < items.size) {
			newChildren.push(tree.children[sectionIndex]);
		}

		tree.children = newChildren;
	};
}
