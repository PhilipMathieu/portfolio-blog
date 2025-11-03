import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import remarkRehype from 'remark-rehype';
import { generateSlug } from './glossaryParser';

/**
 * Render markdown content to HTML with math support and glossary link transformations
 */
export async function render(content: string, allTerms: Array<{ id: string; title: string }> = []): Promise<string> {
	// Transform glossary internal links (e.g., [[#term]] or [[term]])
	let transformedContent = content.replace(/\[\[#([^\]]+)\]\]/g, (match, termText) => {
		// Try to find the term by matching text
		const matchedTerm = allTerms.find(t => 
			t.title.toLowerCase() === termText.toLowerCase() ||
			t.id === generateSlug(termText)
		);
		
		if (matchedTerm) {
			return `[${termText}](#${matchedTerm.id})`;
		}
		
		// If no exact match, generate slug and link to it
		const slug = generateSlug(termText);
		return `[${termText}](#${slug})`;
	});
	
	// Transform simple links like [transformer](#transformer) to use the correct term ID
	transformedContent = transformedContent.replace(/\[([^\]]+)\]\(#([^)]+)\)/g, (match, linkText, hash) => {
		const matchedTerm = allTerms.find(t => 
			t.id === hash ||
			generateSlug(t.title) === hash ||
			t.title.toLowerCase() === linkText.toLowerCase()
		);
		
		if (matchedTerm) {
			return `[${linkText}](#${matchedTerm.id})`;
		}
		
		return match; // Keep original if no match
	});
	
	// Transform reference citations like [[@Author_Year]] - format them nicely
	// Keep them as-is for now, but they'll be rendered as links
	// We can enhance this later if needed for actual bibliography
	transformedContent = transformedContent.replace(/\[\[@([^\]]+)\]\]/g, '[**@$1**]');
	
	// Process markdown with unified
	const processor = unified()
		.use(remarkParse)
		.use(remarkGfm) // GitHub Flavored Markdown support
		.use(remarkMath) // Math support
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeKatex) // KaTeX for math rendering
		.use(rehypeStringify, { allowDangerousHtml: true });
	
	const result = await processor.process(transformedContent);
	
	return String(result);
}

