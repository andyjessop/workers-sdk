import type { Ai } from "@cloudflare/ai";
import type {
	Hono,
	Context as HonoContext,
	MiddlewareHandler as HonoMiddlewareHandler,
} from "hono";

export type Env = {
	WORKERS_SDK_RAG_AI: Ai;
	WORKERS_SDK_RAG_KV: KVNamespace;
	WORKERS_SDK_RAG_API_KEY: string;
	WORKERS_SDK_RAG_INDEX: VectorizeIndex;
};

export type App = Hono<{ Bindings: Env }>;

export type MiddlewareHandler = HonoMiddlewareHandler<{ Bindings: Env }>;
export type Context = HonoContext<{ Bindings: Env }>;
export type Next = () => Promise<void>;
