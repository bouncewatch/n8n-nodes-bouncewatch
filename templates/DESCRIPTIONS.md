Template yayın sayfası metinleri. n8n kılavuzu: ~200 kelime, Markdown, HTML yok.
Bölümler: Who's it for · What it does · How to set up · Requirements · How to customize

**Link kuralı:** kurulum adımında kayıt sayfası `bouncewatch.com/register/api`,
tanıtım/bağlam gerektiğinde ürün sayfası `bouncewatch.com/products/data-enrichment-api`.

⚠️ Community node kullanan template'lerde önizleme render olmuyor — her gönderime
**workflow'un ekran görüntüsü** eklenecek, en üste.

⚠️ Kılavuz "self-hosted only" uyarısı istiyor ama o kural doğrulanmış node'lardan
önce yazılmış. Bizde doğrusu aşağıdaki Requirements maddesi.

---

# Post new company signals from Bounce Watch to Slack

**Who's it for**

Sales, partnerships and competitive intelligence teams who keep a list of companies they care about, and want to hear the moment one of them moves rather than finding out weeks later.

**What it does**

Bounce Watch tracks what changes at a company: funding rounds, senior hires, new offices, customer wins, partnerships and more, each carrying the date it actually happened. This workflow watches the companies on your Bounce Watch watchlist and posts to Slack as soon as one of them produces a signal. Rumours and inferences are filtered out, so only confirmed events reach the channel.

**How to set up**

1. Get an API key at bouncewatch.com/register/api. It is free, no card, and comes with 2,500 credits.
2. Add it to the Bounce Watch credential on the trigger node.
3. Put a few companies on your watchlist first. An empty watchlist means an empty trigger.
4. Choose your Slack channel in the last node.

Checking the watchlist costs no credits.

**Requirements**

- A Bounce Watch account. The free tier is enough. What the API covers: bouncewatch.com/products/data-enrichment-api
- A Slack workspace.
- The Bounce Watch node, verified by n8n. On n8n Cloud, enable Verified Community Nodes in the Admin Panel. On self-hosted n8n, install `n8n-nodes-bouncewatch` from Settings → Community nodes.

**How to customize**

Raise the importance threshold on the trigger to hear only about the big moments, or point it at a single company. Swap Slack for email, a task in your tracker, or a row in a spreadsheet.

---

# Send new company signals from Bounce Watch to email

Aynı metin, iki değişiklikle: "posts to Slack" → "emails you", ve Requirements'ta
Slack yerine "An SMTP credential for sending mail."

---

# Add new HubSpot companies to a Bounce Watch watchlist

**Who's it for**

Sales and RevOps teams whose watchlist never quite matches their pipeline, because adding a company to monitoring is a manual step somebody forgets.

**What it does**

Every hour it asks HubSpot for the companies created or updated since the last sweep and puts each one on your Bounce Watch watchlist, labelled with its CRM name. From then on that account produces signals — funding rounds, senior hires, new offices, customer wins, partnerships — as they happen. CRM records with no domain are skipped, because a watch is keyed on a domain. Re-adding a company that is already watched updates the existing watch rather than creating a duplicate, so the hourly sweep is safe to leave running forever.

**How to set up**

1. Get an API key at bouncewatch.com/register/api. It is free, no card, and comes with 2,500 credits.
2. Add it to the Bounce Watch credential on the last node.
3. Connect your HubSpot credential.
4. Edit the label prefix in Watch settings if "CRM" is not what you want to see.

Adding a watch and collecting its matches both cost no credits.

**Requirements**

- A Bounce Watch account. The free tier is enough. What the API covers: bouncewatch.com/products/data-enrichment-api
- A HubSpot account with company records.
- The Bounce Watch node, verified by n8n. On n8n Cloud, enable Verified Community Nodes in the Admin Panel. On self-hosted n8n, install `n8n-nodes-bouncewatch` from Settings → Community nodes.

**How to customize**

Restrict each watch to a few signal types if funding is the only thing you care about. Pair it with the Bounce Watch trigger to route the matches into Slack, email or a task.

---

# Create a pre-meeting company brief from Bounce Watch in email

**Who's it for**

Account executives and consultants who want a reason for the call that is newer than the last note in the CRM, without spending twenty minutes on tabs before every meeting.

**What it does**

It rescans one company, waits for the scan to land, pulls the company's dated timeline and emails it to you as a short brief. Each line carries what happened and the date it happened — funding, senior hires, new offices, customer wins, partnerships, product launches. Where a date records when a change was measured rather than when it occurred, the line says so, so the brief never turns a measurement into a claim about a specific day.

**How to set up**

1. Get an API key at bouncewatch.com/register/api. It is free, no card, and comes with 2,500 credits.
2. Add it to the Bounce Watch credential on the three Bounce Watch nodes.
3. Put the company domain into Meeting settings.
4. Fill in the From and To addresses on the email node and pick your SMTP credential.

A rescan spends credits; polling its status and reading the timeline afterwards is cheap.

**Requirements**

- A Bounce Watch account. What the API covers: bouncewatch.com/products/data-enrichment-api
- An SMTP credential for sending mail.
- The Bounce Watch node, verified by n8n. On n8n Cloud, enable Verified Community Nodes in the Admin Panel. On self-hosted n8n, install `n8n-nodes-bouncewatch` from Settings → Community nodes.

**How to customize**

Drive the domain from a calendar entry, a CRM record or a form instead of the Settings node, and the brief follows whichever account you are about to meet.

---

# Find companies that raised and are hiring with Bounce Watch in Google Sheets

**Who's it for**

Sellers and recruiters who want the accounts where budget has arrived and the team is being built, rather than a list of everyone who raised.

**What it does**

Once a week it searches for two things happening at the same company in the same window: a funding round and an announced senior hire. "Require all keys" is switched on, so a company has to show both rather than either — a much shorter, much better list. Each match becomes a row in Google Sheets with the company, its country, headcount, funding stage, what matched, and the date of the most recent signal. The importance floor keeps background chatter — event attendance, news mentions, follower drift — out of the result.

**How to set up**

1. Get an API key at bouncewatch.com/register/api. It is free, no card, and comes with 2,500 credits.
2. Add it to the Bounce Watch credential on the search node.
3. Set the country code and the lookback window in Search settings.
4. Connect Google Sheets and choose the spreadsheet and tab.

**Requirements**

- A Bounce Watch account. What the API covers: bouncewatch.com/products/data-enrichment-api
- A Google account with a spreadsheet whose column headers already exist.
- The Bounce Watch node, verified by n8n. On n8n Cloud, enable Verified Community Nodes in the Admin Panel. On self-hosted n8n, install `n8n-nodes-bouncewatch` from Settings → Community nodes.

**How to customize**

Change the two signal keys to any pair you care about — an office opening plus a partnership, a customer win plus a product launch. Turn "require all keys" off to widen it back to either signal.

---

# Create a task from a new Bounce Watch company signal

**Who's it for**

Teams who already get company alerts and act on maybe one in ten, because an alert in a channel has no owner and a task does.

**What it does**

It watches the companies on your Bounce Watch watchlist and turns each new signal into a row in a task database. Rumours and inferences are filtered out first, so nothing unconfirmed becomes work. The task carries a title naming the company and what happened, and a body with the summary, the date and a link to the company profile. Signals whose date records when a change was measured are marked as such, so the task never asserts that something happened on a particular day when it only says the change had happened by then.

**How to set up**

1. Get an API key at bouncewatch.com/register/api. It is free, no card, and comes with 2,500 credits.
2. Add it to the Bounce Watch credential on the trigger node.
3. Put a few companies on your watchlist first. An empty watchlist means an empty trigger.
4. Connect Notion, choose the task database and rename the properties on the last node to match yours.

Checking the watchlist costs no credits.

**Requirements**

- A Bounce Watch account. The free tier is enough. What the API covers: bouncewatch.com/products/data-enrichment-api
- A Notion workspace with a task database.
- The Bounce Watch node, verified by n8n. On n8n Cloud, enable Verified Community Nodes in the Admin Panel. On self-hosted n8n, install `n8n-nodes-bouncewatch` from Settings → Community nodes.

**How to customize**

Swap Notion for Airtable, a spreadsheet or any tracker with an n8n node — only the last node changes. Raise the importance threshold if only the big moments deserve a task.

---

# Find company domains from names with Bounce Watch in Google Sheets

**Who's it for**

Anyone holding a list of company names — a conference attendee export, a scraped list, a spreadsheet from marketing — that nothing downstream can use, because enrichment, deduplication and routing are all keyed on a domain.

**What it does**

Every morning it reads your sheet, keeps only the rows whose domain cell is still empty, and resolves each name to a domain. The lookup returns ranked candidates; the workflow takes the top one and records how the match was made, so a shaky match is visible rather than silent. The row is then updated in place, matched on the company name. Where nothing matches, the row is left as it was rather than filled with a guess.

**How to set up**

1. Get an API key at bouncewatch.com/register/api. It is free, no card, and comes with 2,500 credits.
2. Add it to the Bounce Watch credential on the lookup node.
3. Connect Google Sheets and choose the spreadsheet and tab on both Sheets nodes.
4. Make sure your sheet has Company, Domain and Matched by columns.

**Requirements**

- A Bounce Watch account. What the API covers: bouncewatch.com/products/data-enrichment-api
- A Google account with the spreadsheet to fill in.
- The Bounce Watch node, verified by n8n. On n8n Cloud, enable Verified Community Nodes in the Admin Panel. On self-hosted n8n, install `n8n-nodes-bouncewatch` from Settings → Community nodes.

**How to customize**

Add a country code to the lookup filters when your list spans markets — a name that is ambiguous worldwide is often unique inside one country. Send the unmatched rows to a review queue instead of leaving them blank.

---

# Enrich new HubSpot companies with firmographics from Bounce Watch

**Who's it for**

RevOps teams whose company records are created by hand and therefore hold a name, a website and nothing else — which breaks every segment, every routing rule and every report built on them.

**What it does**

Every hour it asks HubSpot for the companies created or updated since the last sweep, drops the ones with no domain, and looks up the rest. Headcount, founding year, country, city, description and the LinkedIn page are written straight back onto the same HubSpot record. Fields we do not hold resolve to nothing and are left alone rather than overwritten with a blank, so a value someone typed by hand survives the run.

**How to set up**

1. Get an API key at bouncewatch.com/register/api. It is free, no card, and comes with 2,500 credits.
2. Add it to the Bounce Watch credential on the lookup node.
3. Connect your HubSpot credential on both HubSpot nodes.
4. Check the field mapping on the last node against your own properties.

A profile lookup spends credits, so the domain filter in the middle is doing real work.

**Requirements**

- A Bounce Watch account. What the API covers: bouncewatch.com/products/data-enrichment-api
- A HubSpot account with permission to update company records.
- The Bounce Watch node, verified by n8n. On n8n Cloud, enable Verified Community Nodes in the Admin Panel. On self-hosted n8n, install `n8n-nodes-bouncewatch` from Settings → Community nodes.

**How to customize**

Map the description into a custom property. Or run the same shape over your whole company list rather than only the recent ones, to backfill a database that was never enriched.

---

# Remove closed accounts from a Bounce Watch watchlist

**Who's it for**

Sales and RevOps teams whose monitoring list only ever grows, until the alerts are mostly about accounts nobody is working any more.

**What it does**

Every morning it asks HubSpot for the companies whose records changed, keeps the ones whose lifecycle stage has reached a closed-out value, and stops watching them. Events the watch already queued stay collectable, so nothing you had not read yet is thrown away. The closed-out stages are a plain list in the filter, so matching it to how your own pipeline is labelled is a one-line edit rather than a rebuild.

**How to set up**

1. Get an API key at bouncewatch.com/register/api. It is free, no card, and comes with 2,500 credits.
2. Add it to the Bounce Watch credential on the last node.
3. Connect your HubSpot credential.
4. Edit the list of closed-out lifecycle stages in the filter to match your pipeline.

Stopping a watch costs no credits and frees a slot for the next account worth following.

**Requirements**

- A Bounce Watch account. What the API covers: bouncewatch.com/products/data-enrichment-api
- A HubSpot account with company records that carry a lifecycle stage.
- The Bounce Watch node, verified by n8n. On n8n Cloud, enable Verified Community Nodes in the Admin Panel. On self-hosted n8n, install `n8n-nodes-bouncewatch` from Settings → Community nodes.

**How to customize**

Drive it from a deal stage rather than a lifecycle stage if that is where "closed" lives in your CRM. Or run it from a spreadsheet column, if the list of accounts you have stopped chasing is kept somewhere simpler.

---

# Send a weekly Bounce Watch watchlist report to Slack

**Who's it for**

Managers who want the week across the whole account list in one message, and who also want to know which watches are not earning their place.

**What it does**

Every Monday it collects everything the watchlist has queued since the last collection and posts a single Slack message: how many signals landed, across how many companies, and one line per event with the company, what happened and the date. Underneath it names the watches that have not matched anything yet. That second list is a prompt to check the setup, not a verdict on the companies — a watch created this week has simply not had time, and a narrow signal list will match less by design.

**How to set up**

1. Get an API key at bouncewatch.com/register/api. It is free, no card, and comes with 2,500 credits.
2. Add it to the Bounce Watch credential on the collect node.
3. Put a few companies on your watchlist first.
4. Connect Slack and choose the channel.

Collecting costs no credits.

**Requirements**

- A Bounce Watch account. The free tier is enough. What the API covers: bouncewatch.com/products/data-enrichment-api
- A Slack workspace.
- The Bounce Watch node, verified by n8n. On n8n Cloud, enable Verified Community Nodes in the Admin Panel. On self-hosted n8n, install `n8n-nodes-bouncewatch` from Settings → Community nodes.

**How to customize**

Move the schedule to Friday afternoon if you would rather review the week than open it. Swap the last node for email to send the same report to a distribution list.

---

# Send daily funding round alerts from Bounce Watch to Slack

**Who's it for**

Sellers, investors and agencies who want to know which companies in their market just closed a round, on the morning it becomes public rather than a month later.

**What it does**

Every morning it searches for funding signals in one country over a short window and posts each company to Slack: the company, its stage, what was announced, the date and a link to the profile. A round closing is the clearest buying signal there is — budget has arrived, and it arrived for a reason somebody has already written down. Changing which market you watch is a single field in the Settings node, so one workflow can be copied per territory without touching any node parameters.

**How to set up**

1. Get an API key at bouncewatch.com/register/api. It is free, no card, and comes with 2,500 credits.
2. Add it to the Bounce Watch credential on the search node.
3. Set the country code and the lookback window in Search settings.
4. Connect Slack and choose the channel.

An empty run means nothing matched the filters, not that the market was still.

**Requirements**

- A Bounce Watch account. What the API covers: bouncewatch.com/products/data-enrichment-api
- A Slack workspace.
- The Bounce Watch node, verified by n8n. On n8n Cloud, enable Verified Community Nodes in the Admin Panel. On self-hosted n8n, install `n8n-nodes-bouncewatch` from Settings → Community nodes.

**How to customize**

Add a headcount band or a funding stage to the filters so the channel only carries companies you would actually sell to. Add the fundraising-intent key to hear about rounds before they close.

---

# Build a target account list by size and funding stage with Bounce Watch in Airtable

**Who's it for**

Founders and go-to-market teams who have written down an ideal customer profile and still do not have a list of names that fit it.

**What it does**

Once a week it turns a country, a headcount range and a funding stage into rows in Airtable. Each row carries the company name, domain, country, headcount, stage and a link to its profile, so the list is usable the moment it lands. Leaving a field empty in the Settings node drops that constraint, which makes widening or narrowing the profile a matter of clearing one box. Companies whose headcount or stage we do not hold are excluded rather than guessed at, so a short list is worth reading as a gap in the record and not only as a fact about the market.

**How to set up**

1. Get an API key at bouncewatch.com/register/api. It is free, no card, and comes with 2,500 credits.
2. Add it to the Bounce Watch credential on the search node.
3. Fill in the profile in Target profile.
4. Connect Airtable and choose the base and table.

**Requirements**

- A Bounce Watch account. What the API covers: bouncewatch.com/products/data-enrichment-api
- An Airtable base with a table for the list.
- The Bounce Watch node, verified by n8n. On n8n Cloud, enable Verified Community Nodes in the Admin Panel. On self-hosted n8n, install `n8n-nodes-bouncewatch` from Settings → Community nodes.

**How to customize**

Add a founding-year range for an age band. Point the last node at a spreadsheet or your CRM instead if that is where your target list already lives.

---

# Summarise weekly competitor news from Bounce Watch with OpenAI to email

**Who's it for**

Founders and product marketers who mean to keep an eye on three or four competitors and, in practice, open a lot of tabs and read a lot of nothing.

**What it does**

Every Monday it pulls the dated timeline for each competitor you list, gathers them into one payload, has OpenAI write the digest and emails it to you. The prompt is explicit about the two things a summary usually gets wrong: a date that records when a change was measured is not a claim about the day it happened, and a competitor with no signals this week has not been shown to be inactive. Rumours are labelled as rumours rather than relayed as announcements.

**How to set up**

1. Get an API key at bouncewatch.com/register/api. It is free, no card, and comes with 2,500 credits.
2. Add it to the Bounce Watch credential on the timeline node.
3. Put your competitor domains into Competitor list.
4. Connect OpenAI and pick a model.
5. Fill in the From and To addresses on the email node and pick your SMTP credential.

**Requirements**

- A Bounce Watch account. What the API covers: bouncewatch.com/products/data-enrichment-api
- An OpenAI credential and an SMTP credential.
- The Bounce Watch node, verified by n8n. On n8n Cloud, enable Verified Community Nodes in the Admin Panel. On self-hosted n8n, install `n8n-nodes-bouncewatch` from Settings → Community nodes.

**How to customize**

Narrow each timeline to a few categories if only launches and hiring matter. Swap the email node for Slack to post the digest into a channel.

---

# Add competitors from Google Sheets to a Bounce Watch watchlist

**Who's it for**

Anyone whose competitor list actually lives in a spreadsheet that people keep adding rows to, and who would rather not re-enter those names anywhere else.

**What it does**

Every morning it reads the sheet, drops the rows with no domain, and puts every remaining company on your Bounce Watch watchlist, labelled with whatever the sheet calls it. From then on those companies produce signals as they happen — launches, funding, senior hires, offices, partnerships. Adding a company that is already watched updates the existing watch instead of creating a second one, so reading the whole sheet daily is safe and costs nothing. The sheet stays the single place anyone has to edit.

**How to set up**

1. Get an API key at bouncewatch.com/register/api. It is free, no card, and comes with 2,500 credits.
2. Add it to the Bounce Watch credential on the last node.
3. Connect Google Sheets and choose the spreadsheet and tab.
4. Make sure the sheet has a Domain column, and a Company column if you want a nicer label.

**Requirements**

- A Bounce Watch account. The free tier is enough. What the API covers: bouncewatch.com/products/data-enrichment-api
- A Google account with the competitor spreadsheet.
- The Bounce Watch node, verified by n8n. On n8n Cloud, enable Verified Community Nodes in the Admin Panel. On self-hosted n8n, install `n8n-nodes-bouncewatch` from Settings → Community nodes.

**How to customize**

Restrict each watch to a few signal types if only launches or funding matter. Pair it with the Bounce Watch trigger so every name someone adds starts producing alerts within the day.

---

# Send senior hiring alerts from Bounce Watch to Google Sheets

**Who's it for**

Recruiters and sellers who treat a senior hire as what it usually is: a mandate with a budget attached, and a new decision-maker with something to prove.

**What it does**

Every morning it searches for announced senior hires in one country over a short window and logs each company to a spreadsheet — who they are, headcount, what was announced and the date of the most recent announcement. It covers announced hires rather than open job ads, which are two different things that are easy to conflate: an ad says a role is open, an announcement says somebody has taken it. The sheet becomes a running record you can sort, filter and hand to whoever works that patch.

**How to set up**

1. Get an API key at bouncewatch.com/register/api. It is free, no card, and comes with 2,500 credits.
2. Add it to the Bounce Watch credential on the search node.
3. Set the country code and the lookback window in Search settings.
4. Connect Google Sheets and choose the spreadsheet and tab.

**Requirements**

- A Bounce Watch account. What the API covers: bouncewatch.com/products/data-enrichment-api
- A Google account with a spreadsheet whose column headers already exist.
- The Bounce Watch node, verified by n8n. On n8n Cloud, enable Verified Community Nodes in the Admin Panel. On self-hosted n8n, install `n8n-nodes-bouncewatch` from Settings → Community nodes.

**How to customize**

Add a headcount band so the sheet only holds companies of a size you work with. Add the open-roles keys alongside the hire key if you want the ads too, but expect a much longer list.

---

# Send customer risk signals from Bounce Watch to Slack

**Who's it for**

Customer success and account teams who would rather hear that a customer just announced layoffs before the renewal call than during it.

**What it does**

Every morning it searches the risk category across the index — shutdowns, layoffs, senior departures, pivots — and keeps only the companies on your customer list. Each match is posted to Slack with what happened, the date and a link to the profile. Signals that are inference rather than announcement are labelled as rumours in the message, because they are a reason to look, not grounds for an account review on their own. Your customer list lives in one Settings node, so keeping it current means editing one field.

**How to set up**

1. Get an API key at bouncewatch.com/register/api. It is free, no card, and comes with 2,500 credits.
2. Add it to the Bounce Watch credential on the search node.
3. Put your customer domains into Customer list.
4. Connect Slack and choose the channel.

An empty run means nothing matched the filters.

**Requirements**

- A Bounce Watch account. What the API covers: bouncewatch.com/products/data-enrichment-api
- A Slack workspace.
- The Bounce Watch node, verified by n8n. On n8n Cloud, enable Verified Community Nodes in the Admin Panel. On self-hosted n8n, install `n8n-nodes-bouncewatch` from Settings → Community nodes.

**How to customize**

For a long customer list, watch the accounts instead and use the Bounce Watch trigger — a watchlist scales further than a filter. Narrow the search to specific keys if layoffs are the only thing that should page anyone.

---

# Send partnership announcements from Bounce Watch to Slack

**Who's it for**

Partnerships and BD teams working a market where the useful moment is short: a company that has just announced one partnership is easier to reach than the same company in six months.

**What it does**

Every morning it searches for announced partnerships in one country over a short window and posts each company to Slack with what was announced, the date, the headcount and a link to the profile. Companies whose only match is an inference rather than an announcement are dropped before the post, so the channel stays something you can act on rather than a stream of maybes. Changing which market you watch is a single field in the Settings node.

**How to set up**

1. Get an API key at bouncewatch.com/register/api. It is free, no card, and comes with 2,500 credits.
2. Add it to the Bounce Watch credential on the search node.
3. Set the country code and the lookback window in Search settings.
4. Connect Slack and choose the channel.

An empty run means nothing matched the filters.

**Requirements**

- A Bounce Watch account. What the API covers: bouncewatch.com/products/data-enrichment-api
- A Slack workspace.
- The Bounce Watch node, verified by n8n. On n8n Cloud, enable Verified Community Nodes in the Admin Panel. On self-hosted n8n, install `n8n-nodes-bouncewatch` from Settings → Community nodes.

**How to customize**

Add a headcount band or a funding stage so the channel only carries companies of a size you partner with. Add the partnership-talks key for the earlier, softer signal — it is inference rather than announcement, so the filter would need loosening to let it through.

---

# Track market expansion signals from Bounce Watch in Google Sheets

**Who's it for**

Marketers, agencies and suppliers who want the companies that are opening an office or moving into a new market, because that is when a lot of buying decisions get made at once.

**What it does**

Every morning it searches for announced expansions and new offices in one country over a short window, and adds each company to a spreadsheet with what was announced, the date, headcount and a link to the profile. Over a few weeks the sheet becomes a running map of who is expanding where. The country filter matches the company headquarters rather than the market being entered, which is worth knowing when you read the list: it answers "who from here is expanding", not "who is expanding into here".

**How to set up**

1. Get an API key at bouncewatch.com/register/api. It is free, no card, and comes with 2,500 credits.
2. Add it to the Bounce Watch credential on the search node.
3. Set the country code and the lookback window in Search settings.
4. Connect Google Sheets and choose the spreadsheet and tab.

**Requirements**

- A Bounce Watch account. What the API covers: bouncewatch.com/products/data-enrichment-api
- A Google account with a spreadsheet whose column headers already exist.
- The Bounce Watch node, verified by n8n. On n8n Cloud, enable Verified Community Nodes in the Admin Panel. On self-hosted n8n, install `n8n-nodes-bouncewatch` from Settings → Community nodes.

**How to customize**

Drop the country filter to watch expansion everywhere and sort the sheet later. Add the expansion-plan key to catch intent before the announcement, or a headcount band if size matters before you approach.

---

# Post company signals from Bounce Watch to Discord

**Who's it for**

Agencies and consultancies who run a Discord channel per client account, and communities that follow a set of companies together.

**What it does**

It watches the companies on your Bounce Watch watchlist and posts to Discord the moment one of them moves — funding rounds, senior hires, new offices, customer wins, partnerships, product launches. Rumours and inferences are filtered out, so only confirmed events reach the channel. Each post carries the company, what happened, the date and a link to the company page. Setting the trigger's Domain field to a single company turns the workflow into a per-account feed, so copying it per client gives each one its own channel.

**How to set up**

1. Get an API key at bouncewatch.com/register/api. It is free, no card, and comes with 2,500 credits.
2. Add it to the Bounce Watch credential on the trigger node.
3. Put a few companies on your watchlist first. An empty watchlist means an empty trigger.
4. Connect Discord and choose the server and channel.

Checking the watchlist costs no credits.

**Requirements**

- A Bounce Watch account. The free tier is enough. What the API covers: bouncewatch.com/products/data-enrichment-api
- A Discord server you can post to.
- The Bounce Watch node, verified by n8n. On n8n Cloud, enable Verified Community Nodes in the Admin Panel. On self-hosted n8n, install `n8n-nodes-bouncewatch` from Settings → Community nodes.

**How to customize**

Raise the importance threshold if a channel is only meant to carry the big moments. Point the trigger at one domain and copy the workflow per client account.

---

# Save a company timeline from Bounce Watch to Notion

**Who's it for**

Researchers, analysts and account teams whose company research lives in a chat window and therefore gets redone every time somebody asks the same question.

**What it does**

You give it a company name and run it. The name is resolved to ranked candidates, the top one is taken, and how the match was made is recorded so a wrong pick is visible rather than silent. The company's dated timeline is then written into Notion as one page: identity and profile link at the top, then every event underneath with its own date, newest first. Dates that record when a change was measured are marked as such on the page, and inferences are marked as unconfirmed, so the page stays readable months later without anyone remembering the caveats.

**How to set up**

1. Get an API key at bouncewatch.com/register/api. It is free, no card, and comes with 2,500 credits.
2. Add it to the Bounce Watch credential on both Bounce Watch nodes.
3. Put the company name into Company to research and run it.
4. Connect Notion, choose the database and rename the properties on the last node to match yours.

**Requirements**

- A Bounce Watch account. What the API covers: bouncewatch.com/products/data-enrichment-api
- A Notion workspace with a database for the pages.
- The Bounce Watch node, verified by n8n. On n8n Cloud, enable Verified Community Nodes in the Admin Panel. On self-hosted n8n, install `n8n-nodes-bouncewatch` from Settings → Community nodes.

**How to customize**

Replace the manual trigger with a form, a webhook or a new CRM row so the page is written whenever someone asks for research. Narrow the timeline by category if you only want funding, or only product.
