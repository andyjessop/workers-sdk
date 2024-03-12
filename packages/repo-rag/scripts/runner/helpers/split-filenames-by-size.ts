import fs from "node:fs/promises";

const MAX_ARRAY_SIZE = 1024 * 1024; // 1MB

interface FileInfo {
	filename: string;
	size: number;
}

async function getFileSize(filePath: string) {
	try {
		const stats = await fs.stat(filePath);
		return stats.size;
	} catch (e) {
		return 0;
	}
}

export async function splitFilenamesBySize(filenames: string[]) {
	const splitArrays = [] as FileInfo[][];
	let currentArray = [] as FileInfo[];
	let currentArraySize = 0;
	let totalSize = 0;

	for (const filename of filenames) {
		const fileSize = await getFileSize(filename);
		totalSize += fileSize;

		if (currentArraySize + fileSize <= MAX_ARRAY_SIZE) {
			currentArray.push({ filename, size: fileSize });
			currentArraySize += fileSize;
		} else {
			splitArrays.push(currentArray);
			currentArray = [{ filename, size: fileSize }];
			currentArraySize = fileSize;
		}
	}

	if (currentArray.length > 0) {
		splitArrays.push(currentArray);
	}

	return {
		splitArrays,
		totalSize,
	};
}
