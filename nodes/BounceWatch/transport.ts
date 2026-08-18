import type {
	IExecuteFunctions,
	IPollFunctions,
	ILoadOptionsFunctions,
	IDataObject,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

type Context = IExecuteFunctions | IPollFunctions | ILoadOptionsFunctions;

/**
 * The server speaks JSON-RPC over plain HTTP POST and issues no session id, so
 * every call stands on its own — there is no handshake to hold open and no state
 * to lose when n8n runs two nodes at once.
 */
export async function mcpCall(
	context: Context,
	toolName: string,
	args: IDataObject,
): Promise<IDataObject> {
	const credentials = await context.getCredentials('bounceWatchApi');
	const endpoint = (credentials.baseUrl as string) || 'https://api.bouncewatch.com/api/v1/mcp';

	// Empty values are not the same as unset here: `min_weight: 0` is a real
	// filter, while an untouched string field must not narrow the search at all.
	const cleaned: IDataObject = {};
	for (const [key, value] of Object.entries(args)) {
		if (value === undefined || value === null || value === '') continue;
		if (Array.isArray(value) && value.length === 0) continue;
		cleaned[key] = value;
	}

	let response: IDataObject;

	try {
		response = (await context.helpers.httpRequestWithAuthentication.call(
			context,
			'bounceWatchApi',
			{
				method: 'POST',
				url: endpoint,
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json, text/event-stream',
					'MCP-Protocol-Version': '2025-06-18',
				},
				body: {
					jsonrpc: '2.0',
					id: 1,
					method: 'tools/call',
					params: { name: toolName, arguments: cleaned },
				},
				json: true,
			},
		)) as IDataObject;
	} catch (error) {
		throw new NodeApiError(context.getNode(), error as JsonObject);
	}

	if (response.error) {
		const rpcError = response.error as IDataObject;
		throw new NodeApiError(context.getNode(), response as JsonObject, {
			message: (rpcError.message as string) ?? 'Bounce Watch returned an error',
		});
	}

	const result = (response.result ?? {}) as IDataObject;
	const content = (result.content ?? []) as IDataObject[];
	const text = content[0]?.text as string | undefined;

	if (!text) {
		throw new NodeOperationError(context.getNode(), 'Bounce Watch returned an empty result');
	}

	let payload: IDataObject;
	try {
		payload = JSON.parse(text) as IDataObject;
	} catch {
		// A tool that answers in prose rather than JSON is not a failure; hand the
		// text on rather than discarding what the server actually said.
		return { text };
	}

	// `isError` marks a tool-level refusal — a bad filter value, an unknown
	// signal key. The server explains why in the payload, so surface that rather
	// than a generic failure.
	if (result.isError === true) {
		throw new NodeOperationError(
			context.getNode(),
			(payload.error as IDataObject)?.message as string ??
				(payload.message as string) ??
				'Bounce Watch rejected that request',
		);
	}

	return (payload.data as IDataObject) ?? payload;
}
