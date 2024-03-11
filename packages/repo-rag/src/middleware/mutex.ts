import type { Context, Next } from "../types";

export async function mutex(ctx: Context, next: Next) {
	const durableObject = ctx.env.WORKERS_SDK_RAG_MUTEX.get(
		ctx.env.WORKERS_SDK_RAG_MUTEX.idFromName("singleton")
	);

	const commitHash = ctx.req.query("commitHash");
	const mutexId = ctx.req.query("mutexId");

	const requestBody = {
		commit: commitHash || undefined,
		mutexId: mutexId || undefined,
	};

	const durableObjectResponse = await durableObject.fetch(
		new Request(ctx.req.url, {
			method: ctx.req.method,
			headers: ctx.req.raw.headers,
			body: JSON.stringify(requestBody),
		})
	);

	const responseBody = await durableObjectResponse.json();

	if (durableObjectResponse.status === 200) {
		await next();

		// After all the other middleware has run, we need to add
		// the mutexId to the response body, if the durable object
		// has returned one. This will allow us to unlock the app.
		const id = (responseBody as { mutexId: string }).mutexId;

		if (id) {
			const originalBody = await ctx.res.json();
			const newBody =
				typeof originalBody === "object" && originalBody !== null
					? {
							...originalBody,
							mutexId: id,
					  }
					: {
							data: originalBody,
							mutexId: id,
					  };

			ctx.res = new Response(JSON.stringify(newBody), {
				status: ctx.res.status,
				headers: ctx.res.headers,
			});
		}
	} else {
		ctx.res = new Response(durableObjectResponse.body, {
			status: durableObjectResponse.status,
			headers: durableObjectResponse.headers,
		});
	}
}
