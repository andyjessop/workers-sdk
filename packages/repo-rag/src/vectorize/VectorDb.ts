import { Embedding, Embeddings } from "../embeddings/Embeddings";
import { Logger } from "../logger/Logger";

interface VectorDbResponse {
	code: number;
	success: boolean;
	message: string;
	data?: string[]; // filename or filenames
}

export class VectorDb {
	#embeddings: Embeddings;
	#isDryRun = false;
	#logger: Logger;
	#vectorDb: VectorizeIndex;

	constructor(
		vectorDb: VectorizeIndex,
		embeddings: Embeddings,
		logger: Logger,
		isDryRun = false
	) {
		this.#embeddings = embeddings;
		this.#isDryRun = isDryRun;
		this.#logger = logger;
		this.#vectorDb = vectorDb;
	}

	async exists(filename: string) {
		const getId = await this.#embeddings.buildEmbeddingId(filename);
		const id = getId();

		return (await this.#vectorDb.getByIds([id])).length !== 0;
	}

	async upsert(
		filename: string,
		embeddings: Embedding[]
	): Promise<VectorDbResponse> {
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
								content: embedding.content,
							},
						},
					]);

					this.#logger.success(
						`Embedding ${embedding.id} inserted for filename: ${filename}`
					);
				} catch (e) {
					this.#logger.error(
						`Failed to insert embedding: ${JSON.stringify(embedding)}`,
						e
					);
				}
			}
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
		if (!this.#isDryRun) {
			try {
				const getId = await this.#embeddings.buildEmbeddingId(filename);
				const idsToDelete = new Array(100).fill(0).map((_, i) => getId(i));

				const { count } = await this.#vectorDb.deleteByIds(idsToDelete);

				const message = `Deleted ${count} embeddings for filename: ${filename}`;

				this.#logger.success(message);

				return {
					code: 200,
					success: true,
					message: message,
					data: [filename],
				};
			} catch (e) {
				return {
					code: 500,
					success: false,
					message: `Error deleting embeddings for ${filename}`,
					data: [filename],
				};
			}
		}

		return {
			code: 200,
			success: true,
			message: "[Dry run: no data modified] Delete successful.",
			data: [filename],
		};
	}

	async fetchSimilar(vector: number[], topK = 20) {
		try {
			const similar = await this.#vectorDb.query(vector, {
				topK,
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
				data: [],
				message: e,
				success: false,
			};
		}
	}
}
