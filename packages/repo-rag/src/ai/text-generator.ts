import { TEXT_GENERATION_MODEL } from "../constants";
import type { Ai } from "@cloudflare/ai";

export function textGenerator(ai: Ai) {
	return async function generate(prompt: string) {
		return await ai.run(TEXT_GENERATION_MODEL, {
			messages: [{ role: "user", content: prompt }],
		});
	};
}
