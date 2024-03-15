import type { Context } from "../../../../types";

export async function githubWebhookHandler(ctx: Context) {
	const body = (await ctx.req.json()) as PushEventPayload;
	const logger = ctx.get("Logger");
}

interface GitUser {
	name: string;
	email?: string | null;
	username?: string;
	date?: string;
}

interface Commit {
	id: string;
	tree_id: string;
	distinct: boolean;
	message: string;
	timestamp: string;
	url: string;
	author: GitUser;
	committer: GitUser;
	added: string[];
	removed: string[];
	modified: string[];
}

interface PushEventPayload {
	after: string;
	before: string;
	base_ref: string | null;
	commits: Commit[];
	compare: string;
	created: boolean;
	deleted: boolean;
	forced: boolean;
	head_commit: Commit | null;
	pusher: GitUser;
	ref: string;
	sender?: GitUser; // Optional based on the context
}
