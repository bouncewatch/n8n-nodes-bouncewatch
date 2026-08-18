# n8n-nodes-bouncewatch

Bounce Watch company signals for n8n. Find out what changed at a company — who
raised money, who hired a senior person, who opened an office, won a customer or
announced a partnership — and when it happened.

This is a community node. Install it from **Settings → Community nodes** in your
n8n instance, or with `npm install n8n-nodes-bouncewatch`.

## Credentials

You need an API key from https://bouncewatch.com/api-panel/mcp. Every new account
starts with 2,500 free credits — no card, no expiry.

Testing the credential calls a tool that costs nothing, so saving it never spends
anything.

## Nodes

### Bounce Watch

| Resource | Operations |
| --- | --- |
| Signal | Search · Get for Company |
| Company | Search · Find by Name · Get · Refresh · Get Refresh Status |
| Watch | Add · Stop · Check |
| Taxonomy | Get |

**Signal → Search** is the one most workflows start with: the latest signals
across the whole index, filtered by country, headcount, funding stage, signal
type and recency.

By default it outputs one item per company. Turn off *Split Signals Into
Separate Items* if you would rather have one item per company with the signals
nested.

### Bounce Watch Trigger

Starts the workflow when something happens at a company you watch. Add companies
first with **Bounce Watch → Watch → Add**.

The trigger polls rather than waiting on a webhook, on purpose: an account holds
one webhook URL rather than one per subscription, so a webhook trigger here would
quietly take over any other integration pointed at it.

The first poll after you switch the trigger on records what is already there
without firing the workflow. Everything that has happened before now is history,
not news.

## Filters worth knowing

**Minimum Weight.** Signals are weighted 1 to 10. Background — event attendance,
news mentions, follower drift — is weighted 1 or 2, so a floor of 3 or 4 keeps a
workflow off it. A floor above 7 leaves only funding rounds, acquisitions and
shutdowns; those are rare because they are rare, so use a watch rather than a
search if that is what you are waiting for.

**Signal Keys.** Comma-separated, for example `recently_funded,key_hire_announced`.
Run the Taxonomy resource once to list the valid keys. An unrecognised key is
rejected rather than quietly matching nothing.

**Funding Stage.** This narrows twice: once by the stage, and once by the
companies whose stage is known — about 60% of those observed. The rest are
excluded rather than guessed at.

## Reading the results

**Every signal carries its own date** — the date the thing happened, not the date
it was found. Some signals are marked as measurements instead: for those, the
change happened at some point in the period before that date, not on it.

**An empty result is not a quiet company.** Every answer states how recently the
company was looked at. When coverage is thin the answer says so, rather than
implying nothing happened.

## Also available without this node

n8n's built-in MCP Client Tool node can talk to the same endpoint directly, with
no install: `https://api.bouncewatch.com/api/v1/mcp`, HTTP Streamable, with your
key in an `X-API-Key` header. This package exists to give the same data typed
fields, a trigger, and a place in the node search.

## Links

- Documentation: https://docs.bouncewatch.com/mcp/overview
- Connection details and other clients: https://github.com/bouncewatch/mcp
- Product: https://bouncewatch.com

## License

MIT
