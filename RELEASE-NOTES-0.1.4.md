The trigger never fired. It asked the server for `data.companies`, but
`check_watches` returns `data.events`, so nothing ever matched and no workflow
ever started. Collecting an event marks it seen on the server, which means every
poll was quietly draining the queue into a key the code could not read.

It now reads `events`, sends `include_acknowledged` so the queue survives
polling, and dedupes on the `event_id` the server already provides. **Watch →
Check** had the same wrong key and is fixed with it.

### What else changed

**Minimum Weight is gone from the trigger.** Signals never carry the 1-10 weight
— the server sends a tier instead, deliberately — so that filter compared against
`undefined` and dropped nothing. The threshold belongs on the watch itself, where
`watch_company` takes it and the server applies it.

**Fetch Test Event now shows what the watchlist holds.** It used to return
nothing on the first press and "Nothing new since the last check." on the second,
which reads as a broken node rather than an empty queue. A manual run remembers
nothing, so switching the workflow on afterwards still treats what is already
there as history.

**Placeholders say "e.g." first.** Grey example text was being read as a filled
field; in one case a search meant to be Dutch silently returned American
companies. All six fields, required ones included.

### Upgrading

Nobody's workflow breaks: the package had no installs when this shipped. If you
were using the trigger, it starts working for the first time.
