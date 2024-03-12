interface KVResponse {
	code: number;
	success: boolean;
	message: string;
	data?: {
		key?: string;
		value?: string;
	};
}

export class ConsistentKV {
	#durableObject: DurableObject;
	#isDryRun = false;

	constructor(durableObject: DurableObject, isDryRun: boolean) {
		this.#durableObject = durableObject;
		this.#isDryRun = isDryRun;
	}

	async get(key: string): Promise<KVResponse> {
		const request = new Request(`https://kv/${key}`);
		const response = await this.#durableObject.fetch(request);

		if (response.status === 404) {
			return {
				code: 404,
				success: false,
				message: `Key ${key} does not exist.`,
				data: { key },
			};
		}

		if (!response.ok) {
			return {
				code: 500,
				success: false,
				message: `Failed to get value for key ${key}: ${response.statusText}`,
				data: { key },
			};
		}

		const value = await response.text();
		return {
			code: 200,
			success: true,
			message: "Get operation successful.",
			data: { key, value },
		};
	}

	async list(): Promise<KVResponse> {
		const request = new Request(`https://kv/list`);
		const response = await this.#durableObject.fetch(request);

		if (!response.ok) {
			return {
				code: 500,
				success: false,
				message: `Failed to get list: ${response.statusText}`,
			};
		}

		const values = await response.text();

		return {
			code: 200,
			success: true,
			message: "Get operation successful.",
			data: values as any,
		};
	}

	async put(key: string, value: string): Promise<KVResponse> {
		if (this.#isDryRun) {
			const existingValue = await this.get(key);

			if (existingValue.success === false) {
				return {
					...existingValue,
					message: `[Dry run: no data modified] ${existingValue.message}`,
					data: { key },
				};
			}

			return {
				code: 200,
				success: true,
				message: "[Dry run: no data modified] Put operation skipped.",
				data: { key, value },
			};
		}

		const request = new Request(`https://kv/${key}`, {
			method: "PUT",
			body: value,
		});
		const response = await this.#durableObject.fetch(request);

		if (!response.ok) {
			return {
				code: 500,
				success: false,
				message: `Failed to put value for key ${key}: ${response.statusText}`,
				data: { key, value },
			};
		}

		return {
			code: 200,
			success: true,
			message: "Put operation successful.",
			data: { key, value },
		};
	}

	async delete(key: string): Promise<KVResponse> {
		if (this.#isDryRun) {
			const existingValue = await this.get(key);

			if (existingValue.success === false) {
				return {
					...existingValue,
					message: `[Dry run: no data modified] ${existingValue.message}`,
					data: { key },
				};
			}

			return {
				code: 200,
				success: true,
				message: "[Dry run: no data modified] Delete operation skipped.",
				data: { key },
			};
		}

		const request = new Request(`https://kv/${key}`, {
			method: "DELETE",
		});
		const response = await this.#durableObject.fetch(request);

		if (response.status === 404) {
			return {
				code: 404,
				success: false,
				message: `Key ${key} does not exist.`,
				data: { key },
			};
		}

		if (!response.ok) {
			return {
				code: 500,
				success: false,
				message: `Failed to delete value for key ${key}: ${response.statusText}`,
				data: { key },
			};
		}

		return {
			code: 200,
			success: true,
			message: "Delete operation successful.",
			data: { key },
		};
	}
}
