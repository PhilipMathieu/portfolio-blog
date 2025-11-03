export interface GlossaryTerm {
	id: string;
	title: string;
	content: string;
}

/**
 * Parse the NLP Glossary markdown file and extract terms
 */
export function parseGlossary(content: string): GlossaryTerm[] {
	const terms: GlossaryTerm[] = [];
	
	// Split by H2 headings (##)
	const sections = content.split(/^## /gm);
	
	// Skip the first section (the TOC/links list)
	for (let i = 1; i < sections.length; i++) {
		const section = sections[i].trim();
		if (!section) continue;
		
		// Extract term title (first line) and content (rest)
		const lines = section.split('\n');
		const title = lines[0].trim();
		const termContent = lines.slice(1).join('\n').trim();
		
		// Generate ID from title (lowercase, replace spaces/special chars with hyphens)
		const id = title
			.toLowerCase()
			.replace(/[^\w\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim();
		
		terms.push({
			id,
			title,
			content: termContent,
		});
	}
	
	return terms;
}

/**
 * Generate a slug/anchor from a term title or markdown link text
 */
export function generateSlug(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.trim();
}

