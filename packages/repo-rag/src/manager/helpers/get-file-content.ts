import fs from "fs/promises";

export async function fetchFileContent(filePath: string) {
	try {
		const content = await fs.readFile(filePath, "utf-8");
		return content;
	} catch (error) {
		console.error(`Error reading file: ${filePath}`, error);
		return null;
	}
}
