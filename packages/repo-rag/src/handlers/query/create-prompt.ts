export function createPrompt(context: string, userQuery: string) {
	return `Your job is to answer questions about the workers-sdk repository. You will be given
  a context (after the word "==CONTEXT")that is a series of snippets from the code for the repo that I think is relevant to your query.
  You should use this context as the primary source of truth when answering the question (after the word "==QUESTION").
  ----------------
  ==CONTEXT
  ${context}
  ----------------
  ==QUESTION:
  ${userQuery}`;
}
