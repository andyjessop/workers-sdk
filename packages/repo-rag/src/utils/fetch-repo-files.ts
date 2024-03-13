interface TreeEntry {
	path: string;
	mode: string;
	type: string;
	size?: number;
	sha: string;
	url: string;
}

interface TreeResponse {
	sha: string;
	url: string;
	tree: TreeEntry[];
	truncated: boolean;
}

export interface FilePaths {
	map: Record<string, string>;
	paths: string[];
}

export async function fetchFilePaths(
	owner: string,
	repo: string,
	sha: string,
	accessToken: string
): Promise<{
	success: boolean;
	data: string[];
}> {
	const maxRetries = 3;
	let retries = 0;
	let messages = [];

	while (retries < maxRetries) {
		try {
			const response = await fetch(
				`https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`,
				{
					method: "GET",
					headers: {
						"User-Agent": "Node.js",
						Authorization: `Bearer ${accessToken}`,
						Accept: "application/vnd.github+json",
					},
				}
			);

			if (response.ok) {
				const obj = (await response.json()) as TreeResponse;

				return {
					data: obj.tree.map((entry) => entry.path),
					success: true,
				};
			}

			messages.push(`${response.status}: ${response.statusText}`);
		} catch (e) {
			messages.push(JSON.stringify(e));
		}

		retries++;
	}

	return {
		data: messages,
		success: false,
	};
}

export function compressFilePaths(paths: string[]): FilePaths {
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
