/**
 * Generate a deterministic hash from a string
 */
function hashString(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return Math.abs(hash);
}

/**
 * Generate a pseudo-random number between 0 and 1 based on a seed
 */
function seededRandom(seed: number): number {
	const x = Math.sin(seed) * 10000;
	return x - Math.floor(x);
}

/**
 * Generate a color based on a seed value
 * Returns pleasant, saturated colors suitable for gradients
 */
function generateColor(seed: number): string {
	const hue = Math.floor(seededRandom(seed) * 360);
	// Use moderate saturation (60-80%) and lightness (50-70%) for pleasant colors
	const saturation = 60 + Math.floor(seededRandom(seed + 1) * 20);
	const lightness = 50 + Math.floor(seededRandom(seed + 2) * 20);
	return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Generate a gradient for a blog post based on its title
 * Returns an object with CSS gradient properties
 */
export function generateGradient(title: string) {
	const seed = hashString(title);
	
	// Generate two colors with different seeds
	const color1 = generateColor(seed);
	const color2 = generateColor(seed + 1000);
	
	// Generate a random angle between -45 and 135 degrees for variety
	const angle = -45 + seededRandom(seed + 2000) * 180;
	
	return {
		background: `linear-gradient(${angle}deg, ${color1}, ${color2})`,
	};
}

