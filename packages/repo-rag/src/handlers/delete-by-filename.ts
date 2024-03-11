import { deleteIndicesByFilename } from "../vectorize/delete-indices-by-filename";
import type { Context } from "../types";

export async function deleteByFilename({ req, env, json }: Context) {
	const body = (await req.json()) as { filename: string };

	if (!body?.filename) {
		return new Response("Missing filename", { status: 400 });
	}

	const { filename } = body;

	const deleted = await deleteIndicesByFilename(filename, env);

	return json(
		{
			deleted,
		},
		200
	);
}
