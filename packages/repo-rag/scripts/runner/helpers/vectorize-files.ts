export async function vectorizeFiles(
	arr: { filename: string; content: string }[],
	url: string
) {
	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(arr),
		});

		const text = await response.json();

		console.log(text);
	} catch (error) {
		console.error("Error sending array:", error);
	}
}
