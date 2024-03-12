import { TEXT_GENERATION_MODEL } from "../constants";
import type { Ai } from "@cloudflare/ai";

export async function generateText(ai: Ai, prompt: string) {
	return await ai.run(TEXT_GENERATION_MODEL, {
		messages: [{ role: "user", content: prompt }],
	});
}
