import { EventEmitter } from "node:events";
import { Logger } from "../logger/Logger";

interface Message {
	role: "user" | "assistant";
	content: string;
}

interface CreateMessageResponse {
	id: string;
	type: "message";
	role: "assistant";
	content: { type: "text"; text: string }[];
	model: string;
	stop_reason: "end_turn" | "max_tokens" | "stop_sequence";
	stop_sequence: string | null;
	usage: {
		input_tokens: number;
		output_tokens: number;
	};
}

interface ResponseData {
	code: number;
	data?: string | null;
	message: string;
	success: boolean;
}

interface Options {
	model?: string;
	systemPrompt?: string | null;
	max_tokens?: number;
}

export class AnthropicMessages extends EventEmitter {
	#apiKey: string;
	#logger: Logger;
	#messages: Message[] = [];
	#model: string;
	#systemPrompt: string | null;
	#max_tokens: number;
	#isDryRun: boolean;

	constructor(apiKey: string, logger: Logger, options: Options = {}) {
		super();
		this.#apiKey = apiKey;
		this.#logger = logger;
		this.#model = options.model || "claude-3-sonnet-20240229";
		this.#systemPrompt = options.systemPrompt || null;
		this.#max_tokens = options.max_tokens || 4096;
		this.#isDryRun = false;
	}

	async sendMessage(message: string): Promise<ResponseData> {
		this.#messages.push({ role: "user", content: message });

		if (this.#isDryRun) {
			const content = "This is a dummy response.";

			this.#messages.push({
				role: "assistant",
				content,
			});

			return {
				code: 200,
				data: content,
				message: "Success (Dry Run)",
				success: true,
			};
		}

		try {
			const requestBody = {
				model: this.#model,
				messages: [...this.#messages],
				max_tokens: this.#max_tokens,
				stream: false,
				system: this.#systemPrompt,
			};

			const requestOptions = {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-api-key": this.#apiKey,
					"anthropic-version": "2023-06-01",
				},
				body: JSON.stringify(requestBody),
			};

			const response = await fetch(
				"https://api.anthropic.com/v1/messages",
				requestOptions
			);

			const data = (await response.json()) as CreateMessageResponse;
			const content = data.content[0].text;

			this.#messages.push({
				role: "assistant",
				content,
			});

			return {
				code: 200,
				data: content,
				message: "Success",
				success: true,
			};
		} catch (error) {
			this.#logger.error(JSON.stringify(error));

			return {
				code: 500,
				data: null,
				message: "An error occurred while processing the request.",
				success: false,
			};
		}
	}
}
