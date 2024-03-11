export function createPrompt(context: string, userQuery: string) {
	return `Your job is to answer questions about the provided context. You will be given
  a CONTEXT that is a series of snippets from the code for the repo that I think is relevant to your query.
  You should use this context as the primary source of truth when answering the QUERY.
  If there is no context, ensure that you state this in your answer. You can suggest an answer
  based on your training, but you must state that there was no context provided.
  ----------------
  CONTEXT
  ${context}
  ----------------
  QUERY:
  ${userQuery}`;
}
