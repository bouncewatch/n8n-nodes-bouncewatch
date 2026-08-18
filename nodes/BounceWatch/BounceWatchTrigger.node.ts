import type {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IPollFunctions,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import { mcpCall } from './transport';

/**
 * Polls the watch list rather than waiting on a webhook.
 *
 * The account holds one webhook URL, not one per subscription, so a webhook
 * trigger here would quietly take over any other integration the customer has
 * pointed at it. Polling costs a little more and breaks nothing.
 */
export class BounceWatchTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Bounce Watch Trigger',
		name: 'bounceWatchTrigger',
		icon: 'file:bouncewatch.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{ "new signals" }}',
		description: 'Starts the workflow when something happens at a company you watch',
		defaults: { name: 'Bounce Watch Trigger' },
		polling: true,
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'bounceWatchApi', required: true }],
		properties: [
			{
				displayName:
					'Add companies to watch with the Bounce Watch node (Watch → Add) before this trigger has anything to report.',
				name: 'notice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Domain',
				name: 'domain',
				type: 'string',
				default: '',
				placeholder: 'stripe.com',
				description: 'Only report on this company. Leave empty for every company this key watches.',
			},
			{
				displayName: 'Minimum Weight',
				name: 'minWeight',
				type: 'number',
				typeOptions: { minValue: 0, maxValue: 10 },
				default: 3,
				description:
					'Signals are weighted 1-10. Event attendance and news mentions sit at 1-2, so 3 or 4 keeps the workflow off background chatter.',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 25,
				description: 'Maximum companies to read per poll',
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const staticData = this.getWorkflowStaticData('node') as { seen?: string[] };
		const seen = new Set(staticData.seen ?? []);
		const firstRun = staticData.seen === undefined;

		const data = await mcpCall(this, 'check_watches', {
			domain: this.getNodeParameter('domain', '') as string,
			limit: this.getNodeParameter('limit', 25) as number,
		});

		const minWeight = this.getNodeParameter('minWeight', 3) as number;
		const companies = (data.companies ?? []) as IDataObject[];

		const fresh: INodeExecutionData[] = [];
		const keys: string[] = [];

		for (const entry of companies) {
			const company = (entry.company ?? {}) as IDataObject;
			const signals = (entry.signals ?? []) as IDataObject[];

			for (const signal of signals) {
				// Signals carry no id, so identity is the company plus what happened
				// plus when. Re-running the same poll must not fire the workflow twice.
				const key = [company.domain, signal.key, signal.date, signal.summary]
					.map((part) => String(part ?? ''))
					.join('|');

				keys.push(key);
				if (seen.has(key)) continue;

				const weight = signal.weight;
				if (typeof weight === 'number' && weight < minWeight) continue;

				fresh.push({ json: { company, ...signal } });
			}
		}

		// Everything already there when the trigger was switched on is history, not
		// news — remember it, but do not fire the workflow for it.
		staticData.seen = keys.slice(-2000);

		if (firstRun) return null;
		if (this.getMode() === 'manual' && fresh.length === 0) {
			return [[{ json: { message: 'Nothing new since the last check.' } }]];
		}

		return fresh.length ? [fresh] : null;
	}
}
