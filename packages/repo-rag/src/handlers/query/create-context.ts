export function createContext(matches: { score: number; content: string }[]) {
	return matches
		.map(
			(entry) => `
Similarity: ${entry.score}
Content:\n${entry.content}
  `
		)
		.join("\n\n");
}
