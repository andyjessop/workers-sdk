import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import OpenAi from "openai";
import { Logger } from "../logger/Logger";
import { hashFilename } from "./hash-filename";

export interface Embedding {
	id: string;
	content: string;
	vector: number[];
}

export class Embeddings {
	#ai: OpenAi;
	#isDryRun = false;
	#logger: Logger;

	constructor(apiKey: string, logger: Logger, isDryRun = false) {
		this.#ai = new OpenAi({ apiKey });
		this.#logger = logger;
		this.#isDryRun = isDryRun;
	}

	async buildEmbeddingId(filename: string) {
		const hash = await hashFilename(filename);
		return function geId(index = 0) {
			return `${hash}-${index + 1}`;
		};
	}

	async createEmbeddings(filename: string, content: string) {
		const documents = await splitFileIntoDocuments(content);
		const getId = await this.buildEmbeddingId(filename);
		const embeddings = [] as Embedding[];

		for (const [i, document] of documents.entries()) {
			const id = getId(i);

			try {
				const vector = await this.generateVector(document.pageContent);

				if (!vector?.length) {
					const message = `Could not create embedding for id: ${id}, filename: ${filename}`;

					this.#logger.error(message);

					return {
						code: 500,
						data: [],
						success: false,
						message: message,
					};
				}

				const content = `FILENAME: ${filename}; FILE SPLIT NO.: ${
					i + 1
				}; CONTENT: ${document.pageContent}`;

				this.#logger.success(
					`Created embedding for id: ${id}, filename: ${filename}`
				);

				embeddings.push({
					content,
					id,
					vector,
				});
			} catch (e) {
				const message = `Error creating embeddings for id: ${id}, filename: ${filename}`;

				this.#logger.error(message);

				return {
					code: 500,
					data: [],
					success: false,
					message,
				};
			}
		}

		const message = `Embeddings created for filename: ${filename}`;

		this.#logger.success(message);

		return {
			code: 200,
			data: embeddings,
			success: true,
			message,
		};
	}

	async generateVector(text: string) {
		if (this.#isDryRun) {
			return [1, 2, 3, 4, 5];
		}

		const response = await this.#ai.embeddings.create({
			model: "text-embedding-ada-002",
			input: text,
		});

		return response.data[0].embedding;
	}
}

async function splitFileIntoDocuments(content: string) {
	const splitter = new RecursiveCharacterTextSplitter({
		chunkOverlap: 200,
		chunkSize: 5000,
	});

	return splitter.createDocuments([content]);
}
