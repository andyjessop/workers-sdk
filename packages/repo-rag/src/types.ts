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
	WORKERS_SDK_RAG_MUTEX: DurableObjectNamespace;
};

export type Variables = {
	mutexId: string;
};

export type App = Hono<{ Bindings: Env; Variables: Variables }>;

export type MiddlewareHandler = HonoMiddlewareHandler<{
	Bindings: Env;
	Variables: Variables;
}>;
export type Context = HonoContext<{ Bindings: Env; Variables: Variables }>;
export type Next = () => Promise<void>;
