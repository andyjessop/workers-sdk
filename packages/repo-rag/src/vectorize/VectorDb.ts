import { EMBEDDINGS_MODEL } from "../constants";
import { splitFileIntoDocuments } from "./split-file-into-documents";
import type { ConsistentKV } from "../storage/ConsistentKV";
import type { Ai } from "@cloudflare/ai";

interface VectorDbResponse {
	code: number;
	success: boolean;
	message: string;
	data?: string[]; // filename or filenames
}

export class VectorDb {
	#ai: Ai;
	#consistentKV: ConsistentKV;
	#isDryRun = false;
	#vectorDb: VectorizeIndex;

	constructor(
		ai: Ai,
		vectorDb: VectorizeIndex,
		consistentKV: ConsistentKV,
		isDryRun = false
	) {
		this.#consistentKV = consistentKV;
		this.#isDryRun = isDryRun;
		this.#ai = ai;
		this.#vectorDb = vectorDb;
	}

	async upsert(content: string, filename: string): Promise<VectorDbResponse> {
		const documents = await splitFileIntoDocuments(content, filename);

		if (!documents.length) {
			return {
				code: 400,
				success: false,
				message: "No content found",
			};
		}

		const timestamp = Date.now();
		const embeddings = new Set<{
			content: string;
			id: string;
			vector: number[];
		}>();

		for (const [i, document] of documents.entries()) {
			try {
				const vector = await this.#generateEmbedding(document.pageContent);

				if (!vector?.length) {
					return {
						code: 500,
						success: false,
						message: "Could not create embeddings",
					};
				}

				embeddings.add({
					content: document.pageContent,
					id: `${filename}-${i}`,
					vector,
				});
			} catch (e) {
				return {
					code: 500,
					success: false,
					message: "Could not create embeddings",
				};
			}
		}

		if (!this.#isDryRun) {
			await this.deleteByFilename(filename);

			for (const embedding of embeddings) {
				try {
					await this.#vectorDb.insert([
						{
							id: embedding.id,
							values: embedding.vector,
							metadata: {
								filename,
								timestamp,
								content: embedding.content,
							},
						},
					]);
				} catch (e) {
					console.log("Failed: ", embedding);
				}
			}

			const embeddingsArray = [...embeddings];
			await this.#consistentKV.put(
				filename,
				JSON.stringify(embeddingsArray.map((e) => e.id))
			);
		}

		return {
			code: 200,
			success: true,
			message: this.#isDryRun
				? "[Dry run: no data modified] Delete successful."
				: "Upsert successful",
			data: [filename],
		};
	}

	async deleteByFilename(filename: string): Promise<VectorDbResponse> {
		const existingEntry = await this.#consistentKV.get(filename);

		const existingIds: string[] =
			JSON.parse(existingEntry?.data?.value ?? "[]") ?? [];

		// only update state if it's not a dry run
		if (existingIds.length && !this.#isDryRun) {
			await this.#vectorDb.deleteByIds(existingIds);
			await this.#consistentKV.delete(filename);
		}

		return {
			code: 200,
			success: true,
			message: this.#isDryRun
				? "[Dry run: no data modified] Delete successful."
				: "Delete successful",
			data: [filename],
		};
	}

	async getById(id: string): Promise<VectorDbResponse> {
		try {
			const vectors = await this.#vectorDb.getByIds([id]);

			if (!vectors) {
				return {
					code: 404,
					success: false,
					message: `Vector with ID ${id} not found`,
				};
			}

			return {
				code: 200,
				success: true,
				message: "Vector retrieved successfully",
				data: vectors.map((vector) => JSON.stringify(vector)),
			};
		} catch (e) {
			return {
				code: 500,
				success: false,
				message: `Error retrieving vector with ID ${id}: ${e}`,
			};
		}
	}

	async #generateEmbedding(content: string): Promise<number[]> {
		if (this.#isDryRun) {
			return [1, 2, 3, 4, 5];
		}

		const embedding = await this.#ai.run(EMBEDDINGS_MODEL, {
			text: content,
		});

		return embedding?.data?.[0];
	}

	async fetchSimilar(query: string) {
		try {
			const vector = await this.#generateEmbedding(query);

			const similar = await this.#vectorDb.query(vector, {
				topK: 20,
				returnMetadata: true,
			});

			const formattedMatches = similar.matches
				.map((match) => ({
					score: match.score,
					content: (match as any).vector.metadata?.content as string,
				}))
				.filter((entry) => entry.content !== undefined);

			return {
				code: 200,
				data: formattedMatches,
				success: true,
			};
		} catch (e) {
			return {
				code: 500,
				message: e,
				success: false,
			};
		}
	}
}
