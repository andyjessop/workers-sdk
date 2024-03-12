export async function vectorizeFiles(
	arr: { filename: string; content: string }[],
	url: string
) {
	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				WORKERS_SDK_RAG_API_KEY: process.env.WORKERS_SDK_RAG_API_KEY as string,
			},
			body: JSON.stringify(arr),
		});

		if (!response.ok) {
			const text = await response.text();

			console.log(text);
			return;
		}

		const text = await response.json();

		console.log(text);
	} catch (error) {
		console.error("Error sending array:", error);
	}
}
