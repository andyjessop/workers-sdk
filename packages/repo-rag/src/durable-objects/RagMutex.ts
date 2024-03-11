import type { Env } from "../types";

export class RagMutex {
	state: DurableObjectState;
	env: Env;

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		this.env = env;
	}

	async fetch(request: Request) {
		try {
			const { currentHash, isProcessing, mutexId } =
				await this.getStateFromStorage();
			const { commitHash, mutexId: requestMutexId } =
				await this.parseRequestBody(request);

			if (isProcessing === true) {
				return this.handleProcessingState(
					commitHash,
					requestMutexId,
					currentHash,
					mutexId
				);
			} else {
				return this.handleIdleState(commitHash, requestMutexId);
			}
		} catch (error) {
			console.error("Error in RagMutex fetch:", error);
			return new Response("Internal Server Error", { status: 500 });
		}
	}

	async getStateFromStorage() {
		const currentHash = await this.state.storage.get<string>("currentHash");
		const isProcessing = await this.state.storage.get<boolean>("isProcessing");
		const mutexId = await this.state.storage.get<string>("mutexId");

		return { currentHash, isProcessing, mutexId };
	}

	async parseRequestBody(request: Request) {
		try {
			const body = (await request.json()) as {
				commitHash?: string;
				mutexId?: string;
			};
			return { commitHash: body.commitHash, mutexId: body.mutexId };
		} catch (error) {
			throw new Error("Invalid JSON payload");
		}
	}

	async handleProcessingState(
		commitHash?: string,
		requestMutexId?: string,
		currentHash?: string,
		mutexId?: string
	) {
		if (requestMutexId === mutexId) {
			await this.state.storage.put("isProcessing", false);
			return new Response("Mutex unlocked", { status: 200 });
		} else if (commitHash !== currentHash) {
			return new Response("Processing in progress", { status: 429 });
		} else {
			return new Response("Invalid mutex ID", { status: 400 });
		}
	}

	async handleIdleState(commit?: string, requestMutexId?: string) {
		if (commit) {
			await this.state.storage.put("isProcessing", true);
			await this.state.storage.put("currentHash", commit);
			await this.state.storage.put("mutexId", requestMutexId);
			return new Response(JSON.stringify({ mutexId: requestMutexId }), {
				status: 200,
			});
		} else {
			return new Response("Commit hash not provided", { status: 400 });
		}
	}
}
