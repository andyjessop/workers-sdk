export async function vectorizeFiles(
	arr: { filename: string; content: string }[]
) {
	const url = "/url"; // Replace with the actual endpoint URL

	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(arr),
		});

		if (response.ok) {
			console.log("Array sent successfully");
		} else {
			console.error("Error sending array:", response.status);
		}
	} catch (error) {
		console.error("Error sending array:", error);
	}
}
