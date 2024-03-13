import { FilePaths } from "../../utils/fetch-repo-files";

export function createRepoPrompt(filePaths: FilePaths): string {
	const stringified = JSON.stringify(filePaths);

	return `
Between the <list> and </list> markers are a list of files in this repo. However, in order to make them shorter, they have been compressed in the following way:
- any file path token that is not the actual file name has been added to a map, linking it to a shortened version
- the shortened version is inserted into the file path instead of the original token

For example:

this/is/the/file/path/for/test.ts
this/is/another/path/for/another.ts

Might become:

a/b/c/d/e/f/test.ts
a/b/g/e/f/another.ts

The Typescript code that was used to produce this compression is:

export interface FilePaths {
	map: Record<string, string>;
	paths: string[];
}

function compressFilePaths(paths: string[]): FilePaths {
	let counter = 0;
	const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const map = {} as Record<string, string>;
	const shortPaths = [] as string[];

	for (const path of paths) {
		const newPath = [] as string[];
		const tokens = path.split("/");

		for (let i = 0; i < tokens.length; i++) {
			const token = tokens[i];

			if (i === tokens.length - 1) {
				newPath.push(token);
				break;
			}

			if (!map[token]) {
				const base52String = convertToBase52(counter, alphabet);
				map[token] = base52String;
				counter++;
			}

			newPath.push(map[token]);
		}

		shortPaths.push(newPath.join("/"));
	}

	return {
		map,
		paths: shortPaths,
	};
}

function convertToBase52(num: number, alphabet: string) {
	let base52String = "";
	const base = alphabet.length;

	while (num >= base) {
		const remainder = num % base;
		base52String = alphabet[remainder] + base52String;
		num = Math.floor(num / base);
	}

	base52String = alphabet[num] + base52String;
	return base52String;
}

<list>
${stringified}
</list>
`;
}
