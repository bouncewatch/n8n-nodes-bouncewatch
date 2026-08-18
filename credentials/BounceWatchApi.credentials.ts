import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class BounceWatchApi implements ICredentialType {
	name = 'bounceWatchApi';

	displayName = 'Bounce Watch API';

	icon: Icon = { light: 'file:bouncewatch.svg', dark: 'file:bouncewatch.dark.svg' };

	documentationUrl = 'https://docs.bouncewatch.com/mcp/overview';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'From the API panel at https://bouncewatch.com/api-panel/mcp. Every new account starts with 2,500 free credits, no card and no expiry.',
		},
		{
			displayName: 'Endpoint',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.bouncewatch.com/api/v1/mcp',
			description: 'Only change this if you were given a different endpoint',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-Key': '={{ $credentials.apiKey }}',
			},
		},
	};

	// get_signal_taxonomy costs no credits, so testing a credential never spends
	// anything. Anything cheaper would not prove the key actually works.
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{ $credentials.baseUrl }}',
			url: '',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json, text/event-stream',
			},
			body: {
				jsonrpc: '2.0',
				id: 1,
				method: 'tools/call',
				params: { name: 'get_signal_taxonomy', arguments: {} },
			},
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					key: 'error.message',
					value: 'Authentication failed',
					message: 'That API key was not accepted. Check it in the Bounce Watch API panel.',
				},
			},
		],
	};
}
