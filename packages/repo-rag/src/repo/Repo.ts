import { Logger } from "../logger/Logger";

interface Details {
	sha: string;
	filesPrompt: string;
}

export class Repo {
	#kv: KVNamespace;
	#logger: Logger;
	#owner: string;
	#name: string;
	#key: string;

	constructor(kv: KVNamespace, logger: Logger, owner: string, name: string) {
		this.#kv = kv;
		this.#logger = logger;
		this.#owner = owner;
		this.#name = name;
		this.#key = this.#generateKey();
	}

	async getDetails() {
		try {
			const details = await this.#kv.get(this.#key);

			this.#logger.success(`Repo details fetched: ${this.#key}`);

			return details ? JSON.parse(details) : null;
		} catch (e) {
			this.#logger.error(`Failed to get repo details: ${this.#key}`, e);
			return null;
		}
	}

	getKey() {
		return this.#key;
	}

	#generateKey() {
		return `${this.#owner}/${this.#name}`;
	}

	async set(details: Partial<Details>): Promise<boolean> {
		if (!Repo.isDetails(details)) {
			this.#logger.error(
				`Invalid details provided for repo: ${this.#key}`,
				details
			);

			return false;
		}

		const currentDetails = (await this.getDetails()) || {};
		const newDetails = { ...currentDetails, ...details };

		try {
			await this.#kv.put(this.#key, JSON.stringify(newDetails));

			this.#logger.success(`Repo details updated: ${this.#key}`);

			return true;
		} catch (e) {
			this.#logger.error(`Failed to update repo details: ${this.#key}`, e);

			return false;
		}
	}

	static isDetails(details: any): details is Partial<Details> {
		return (
			typeof details.sha === "string" && typeof details.filesPrompt === "string"
		);
	}
}
