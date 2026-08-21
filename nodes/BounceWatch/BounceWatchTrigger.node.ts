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
		icon: { light: 'file:bouncewatch.svg', dark: 'file:bouncewatch.dark.svg' },
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
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 50,
				description: 'Max number of results to return',
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const staticData = this.getWorkflowStaticData('node') as { seen?: string[] };
		const seen = new Set(staticData.seen ?? []);
		const firstRun = staticData.seen === undefined;

		// include_acknowledged keeps the queue from draining. The server hands each
		// event over once and marks it collected; a polling trigger has to be able
		// to see the same list again, and dedupe here on the id it gives us.
		const data = await mcpCall(this, 'check_watches', {
			domain: this.getNodeParameter('domain', '') as string,
			limit: this.getNodeParameter('limit', 25) as number,
			include_acknowledged: true,
		});

		const events = (data.events ?? []) as IDataObject[];

		const fresh: INodeExecutionData[] = [];
		const keys: string[] = [];

		for (const event of events) {
			const company = (event.company ?? {}) as IDataObject;
			const signal = (event.signal ?? {}) as IDataObject;

			// Every event carries its own id, so identity needs nothing invented.
			const key = String(event.event_id ?? '');
			if (!key) continue;

			keys.push(key);
			if (seen.has(key)) continue;

			fresh.push({
				json: {
					company,
					watch_label: event.label,
					noticed_at: event.noticed_at,
					...signal,
				},
			});
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
