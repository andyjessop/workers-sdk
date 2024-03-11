import { Ai } from "@cloudflare/ai";
import { embeddingGenerator } from "../../ai/embedding-generator";
import { deleteIndicesByFilename } from "../../vectorize/delete-indices-by-filename";
import { splitFileIntoDocuments } from "./split-file-into-documents";
import type { Context } from "../../types";

export async function vectorizeFile({ req, env, json }: Context) {
	const body = (await req.json()) as {
		content: string;
		filename: string;
	};

	if (!body?.content || !body?.filename) {
		return new Response("Missing content or filename", { status: 400 });
	}

	const { content, filename } = body;

	const documents = await splitFileIntoDocuments(content, filename);

	if (!documents.length) {
		return new Response("No content found", { status: 400 });
	}

	const timestamp = Date.now();

	let successful = true;

	const embeddings = new Set<{
		content: string;
		id: string;
		vector: number[];
	}>();

	const ai = new Ai(env.WORKERS_SDK_RAG_AI);
	const generateEmbedding = embeddingGenerator(ai);

	for (const [i, document] of documents.entries()) {
		try {
			const vector = await generateEmbedding(document.pageContent);

			if (!vector?.length) {
				successful = false;
				break;
			}

			embeddings.add({
				content: document.pageContent,
				id: `${filename}-${i}`,
				vector,
			});
		} catch (e) {
			successful = false;
			break;
		}
	}

	if (successful === false) {
		return new Response("Could not create embeddings", { status: 500 });
	}

	// If there are existing embeddings for this file, delete them
	await deleteIndicesByFilename(filename, env);

	for (const embedding of embeddings) {
		await env.WORKERS_SDK_RAG_INDEX.insert([
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
	}

	const embeddingsArray = [...embeddings];

	await env.WORKERS_SDK_RAG_KV.put(
		filename,
		JSON.stringify(embeddingsArray.map((embedding) => embedding.id))
	);

	return json(
		{
			embeddings: embeddingsArray.map((embedding) => ({
				filename,
				timestamp,
				id: embedding.id,
			})),
		},
		200
	);
}
