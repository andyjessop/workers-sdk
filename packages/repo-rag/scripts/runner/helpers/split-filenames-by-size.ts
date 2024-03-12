import fs from "node:fs/promises";

const MAX_ARRAY_SIZE = 10 * 1024 * 1024; // 10MB

async function getFileSize(filePath: string) {
	const stats = await fs.stat(filePath);
	return stats.size;
}

export async function splitFilenamesBySize(filenames: string[]) {
	const splitArrays = [] as string[][];
	let currentArray = [] as string[];
	let currentArraySize = 0;

	for (const filename of filenames) {
		const fileSize = await getFileSize(filename);

		if (currentArraySize + fileSize <= MAX_ARRAY_SIZE) {
			currentArray.push(filename);
			currentArraySize += fileSize;
		} else {
			splitArrays.push(currentArray);
			currentArray = [filename];
			currentArraySize = fileSize;
		}
	}

	if (currentArray.length > 0) {
		splitArrays.push(currentArray);
	}

	return splitArrays;
}
