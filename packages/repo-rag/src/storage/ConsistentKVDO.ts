import type { Env } from "../types";

export class ConsistentKVDO {
	state: DurableObjectState;
	env: Env;
	storage: DurableObjectStorage;

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		this.env = env;
		this.storage = state.storage;
	}

	async fetch(request: Request) {
		const url = new URL(request.url);
		const key = url.pathname.slice(1); // Remove leading '/'

		switch (request.method) {
			case "GET":
				if (key === "list") {
					return this.handleList();
				}
				return this.handleGet(key);
			case "PUT":
				return this.handlePut(key, await request.text());
			case "DELETE":
				return this.handleDelete(key);
			default:
				return new Response("Method not allowed", { status: 405 });
		}
	}

	async handleGet(key: string) {
		const value = await this.storage.get(key);
		if (!value) {
			return new Response("Not found", { status: 404 });
		}
		return new Response(value.toString());
	}

	async handleList() {
		const values = await this.storage.list();
		if (!values) {
			return new Response("Not found", { status: 404 });
		}
		return new Response(JSON.stringify(values));
	}

	async handlePut(key: string, value: string) {
		await this.storage.put(key, value);
		return new Response("ok");
	}

	async handleDelete(key: string) {
		const existed = await this.storage.delete(key);
		if (!existed) {
			return new Response("Not found", { status: 404 });
		}
		return new Response("ok");
	}
}
