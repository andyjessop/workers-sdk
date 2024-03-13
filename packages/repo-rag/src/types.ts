import { AnthropicMessages } from "./ai/AnthropicMessages";
import { Embeddings } from "./embeddings/Embeddings";
import { Logger } from "./logger/Logger";
import type { ConsistentKV } from "./storage/ConsistentKV";
import type { VectorDb } from "./vectorize/VectorDb";
import type { Ai } from "@cloudflare/ai";
import type {
	Hono,
	Context as HonoContext,
	MiddlewareHandler as HonoMiddlewareHandler,
} from "hono";

export type Env = {
	ANTRHROPIC_API_KEY: string;
	OPENAI_API_KEY: string;
	REMOTE_API_URL: string;
	WORKERS_SDK_RAG_AI: Ai;
	WORKERS_SDK_RAG_KV: KVNamespace;
	WORKERS_SDK_RAG_API_KEY: string;
	WORKERS_SDK_RAG_INDEX: VectorizeIndex;
	WORKERS_SDK_CONSISTENT_KV: DurableObjectNamespace;
};

export type Variables = {
	Ai: AnthropicMessages;
	ConsistentKV: ConsistentKV;
	Embeddings: Embeddings;
	Logger: Logger;
	isDryRun: boolean;
	VectorDb: VectorDb;
};

export type App = Hono<{ Bindings: Env; Variables: Variables }>;

export type MiddlewareHandler = HonoMiddlewareHandler<{
	Bindings: Env;
	Variables: Variables;
}>;
export type Context = HonoContext<{ Bindings: Env; Variables: Variables }>;
export type Next = () => Promise<void>;
