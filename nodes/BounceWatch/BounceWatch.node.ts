import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { mcpCall } from './transport';

export class BounceWatch implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Bounce Watch',
		name: 'bounceWatch',
		icon: { light: 'file:bouncewatch.svg', dark: 'file:bouncewatch.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
		description: 'Find out what changed at a company, and when',
		defaults: { name: 'Bounce Watch' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [{ name: 'bounceWatchApi', required: true }],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				default: 'signal',
				options: [
					{ name: 'Signal', value: 'signal' },
					{ name: 'Company', value: 'company' },
					{ name: 'Watch', value: 'watch' },
					{ name: 'Taxonomy', value: 'taxonomy' },
				],
			},

			// ---------------------------------------------------------------- signal
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['signal'] } },
				default: 'search',
				options: [
					{
						name: 'Search',
						value: 'search',
						description: 'The latest signals across the whole index',
						action: 'Search signals',
					},
					{
						name: 'Get for Company',
						value: 'getForCompany',
						description: 'The dated signal timeline for one company',
						action: 'Get signals for a company',
					},
				],
			},

			// --------------------------------------------------------------- company
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['company'] } },
				default: 'search',
				options: [
					{
						name: 'Find by Name',
						value: 'find',
						description: 'Look up a company by name and get its domain',
						action: 'Find a company by name',
					},
					{ name: 'Get', value: 'get', description: 'Profile of one company', action: 'Get a company' },
					{
						name: 'Get Refresh Status',
						value: 'refreshStatus',
						description: 'Check a scan queued by Refresh. Costs no credits.',
						action: 'Get refresh status',
					},
					{
						name: 'Refresh',
						value: 'refresh',
						description: 'Queue a fresh scan of one company',
						action: 'Refresh a company',
					},
					{
						name: 'Search',
						value: 'search',
						description: 'Find companies by country, headcount and funding stage',
						action: 'Search companies',
					},
				],
			},

			// ----------------------------------------------------------------- watch
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['watch'] } },
				default: 'add',
				options: [
					{
						name: 'Add',
						value: 'add',
						description: 'Watch a company so you find out what happens there',
						action: 'Add a watch',
					},
					{ name: 'Stop', value: 'stop', description: 'Stop watching a company', action: 'Stop a watch' },
					{
						name: 'Check',
						value: 'check',
						description: 'What has happened at the companies this key watches',
						action: 'Check watches',
					},
				],
			},

			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['taxonomy'] } },
				default: 'get',
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Every signal type, grouped by category. Costs no credits.',
						action: 'Get the signal taxonomy',
					},
				],
			},

			// -------------------------------------------------------------- required
			{
				displayName: 'Domain',
				name: 'domain',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'e.g. stripe.com',
				displayOptions: {
					show: {
						resource: ['signal', 'company', 'watch'],
						operation: ['getForCompany', 'get', 'refresh', 'add', 'stop'],
					},
				},
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'e.g. Stripe',
				displayOptions: { show: { resource: ['company'], operation: ['find'] } },
			},
			{
				displayName: 'Batch ID',
				name: 'batchId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['company'], operation: ['refreshStatus'] } },
			},

			{
				displayName: 'Split Signals Into Separate Items',
				name: 'splitSignals',
				type: 'boolean',
				default: true,
				description:
					'Whether to output one item per signal rather than one item per company. Leave this on if the next node acts on individual events.',
				displayOptions: { show: { resource: ['signal'] } },
			},

			// --------------------------------------------------------------- filters
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: {
					show: { resource: ['signal', 'company'], operation: ['search', 'getForCompany', 'find'] },
				},
				options: [
					{
						displayName: 'Categories',
						name: 'categories',
						type: 'string',
						default: '',
						placeholder: 'e.g. funding,hiring',
						description: 'Comma-separated: funding, hiring, business, product, growth, event, milestone, risk',
					},
					{
						displayName: 'Country Code',
						name: 'country',
						type: 'string',
						default: '',
						placeholder: 'e.g. NL',
						description: 'Two-letter country code of the company headquarters',
					},
					{
						displayName: 'Days',
						name: 'days',
						type: 'number',
						default: 30,
						description:
							'How far back to look. 90 days without a signal filter, up to 365 with one.',
					},
					{ displayName: 'Founded After', name: 'founded_after', type: 'number', default: 0 },
					{ displayName: 'Founded Before', name: 'founded_before', type: 'number', default: 0 },
					{
						displayName: 'Funding Stage',
						name: 'funding_stage',
						type: 'string',
						default: '',
						placeholder: 'e.g. Series A',
						description:
							'Narrows twice — once by stage, and once by the companies whose stage is known, which is about 60% of those observed',
					},
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						typeOptions: { minValue: 1, maxValue: 100 },
						default: 50,
						description: 'Max number of results to return',
					},
					{ displayName: 'Maximum Employees', name: 'max_employees', type: 'number', default: 0 },
					{ displayName: 'Minimum Employees', name: 'min_employees', type: 'number', default: 0 },
					{
						displayName: 'Minimum Weight',
						name: 'min_weight',
						type: 'number',
						typeOptions: { minValue: 0, maxValue: 10 },
						default: 3,
						description:
							'Signals are weighted 1-10. Event attendance and news mentions sit at 1-2 and are about a third of everything held, so 3 or 4 searches on substance.',
					},
					{
						displayName: 'Require All Keys',
						name: 'require_all_keys',
						type: 'boolean',
						default: false,
						description: 'Whether a company must show every requested signal key, not just one of them',
					},
					{
						displayName: 'Signal Keys',
						name: 'signal_keys',
						type: 'string',
						default: '',
						placeholder: 'e.g. recently_funded,key_hire_announced',
						description:
							'Comma-separated. Use the Taxonomy resource to list valid keys — an unrecognised one is rejected rather than quietly matching nothing.',
					},
					{
						displayName: 'Sort',
						name: 'sort',
						type: 'options',
						default: 'most_recent',
						options: [
							{ name: 'Most Active', value: 'most_active' },
							{ name: 'Most Recent', value: 'most_recent' },
						],
					},
				],
			},
			{
				displayName: 'Options',
				name: 'watchOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: { show: { resource: ['watch'], operation: ['add'] } },
				options: [
					{ displayName: 'Label', name: 'label', type: 'string', default: '' },
					{
						displayName: 'Minimum Weight',
						name: 'min_weight',
						type: 'number',
						typeOptions: { minValue: 0, maxValue: 10 },
						default: 3,
					},
					{
						displayName: 'Signal Keys',
						name: 'signal_keys',
						type: 'string',
						default: '',
						placeholder: 'e.g. recently_funded,key_hire_announced',
					},
					{
						displayName: 'Deliver Webhook',
						name: 'deliver_webhook',
						type: 'boolean',
						default: false,
						description:
							'Whether to also POST to the webhook URL set on the account. The Bounce Watch Trigger node does not need this — it polls.',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const out: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				const { tool, args, splitKey } = buildCall.call(this, resource, operation, i);
				const data = await mcpCall(this, tool, args);

				if (splitKey && Array.isArray(data[splitKey])) {
					for (const entry of data[splitKey] as IDataObject[]) {
						out.push({ json: entry, pairedItem: { item: i } });
					}
				} else {
					out.push({ json: data, pairedItem: { item: i } });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					out.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				// Always wrapped, never re-thrown raw: n8n wants the node and the item
				// index attached, and transport.ts has already put a readable message
				// on whatever arrives here.
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [out];
	}
}

/** Comma-separated free text is friendlier than a fixed list the server may outgrow. */
function toList(value: unknown): string[] | undefined {
	if (typeof value !== 'string' || value.trim() === '') return undefined;
	return value
		.split(',')
		.map((part) => part.trim())
		.filter(Boolean);
}

function buildCall(
	this: IExecuteFunctions,
	resource: string,
	operation: string,
	i: number,
): { tool: string; args: IDataObject; splitKey?: string } {
	const filters = (this.getNodeParameter('filters', i, {}) as IDataObject) ?? {};

	const shared: IDataObject = {
		...filters,
		signal_keys: toList(filters.signal_keys),
		categories: toList(filters.categories),
	};

	// A zero in these fields means "not set" — the collection hands back the
	// default the moment a user opens it, and 0 employees is not a real filter.
	for (const key of ['min_employees', 'max_employees', 'founded_after', 'founded_before']) {
		if (shared[key] === 0) delete shared[key];
	}

	if (resource === 'signal' && operation === 'search') {
		return { tool: 'search_signals', args: shared, splitKey: splitWanted.call(this, i) };
	}

	if (resource === 'signal' && operation === 'getForCompany') {
		return {
			tool: 'get_company_signals',
			args: { ...shared, domain: this.getNodeParameter('domain', i) as string },
			splitKey: splitWanted.call(this, i),
		};
	}

	if (resource === 'company') {
		switch (operation) {
			case 'search':
				return { tool: 'search_companies', args: shared };
			case 'find':
				return {
					tool: 'find_company',
					args: { name: this.getNodeParameter('name', i) as string, country: filters.country, limit: filters.limit },
				};
			case 'get':
				return { tool: 'get_company', args: { domain: this.getNodeParameter('domain', i) as string } };
			case 'refresh':
				return { tool: 'refresh_company', args: { domain: this.getNodeParameter('domain', i) as string } };
			case 'refreshStatus':
				return { tool: 'get_refresh_status', args: { batch_id: this.getNodeParameter('batchId', i) as string } };
		}
	}

	if (resource === 'watch') {
		const domain = () => this.getNodeParameter('domain', i) as string;
		switch (operation) {
			case 'add': {
				const options = (this.getNodeParameter('watchOptions', i, {}) as IDataObject) ?? {};
				return {
					tool: 'watch_company',
					args: { ...options, signal_keys: toList(options.signal_keys), domain: domain() },
				};
			}
			case 'stop':
				return { tool: 'watch_company', args: { domain: domain(), stop: true } };
			case 'check':
				return { tool: 'check_watches', args: { include_acknowledged: true }, splitKey: 'events' };
		}
	}

	if (resource === 'taxonomy') {
		return { tool: 'get_signal_taxonomy', args: {} };
	}

	throw new NodeOperationError(this.getNode(), `Unknown operation ${resource}.${operation}`);
}

function splitWanted(this: IExecuteFunctions, i: number): string | undefined {
	return (this.getNodeParameter('splitSignals', i, true) as boolean) ? 'companies' : undefined;
}
