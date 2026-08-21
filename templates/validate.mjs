#!/usr/bin/env node
// Checks every template JSON in this directory against the n8n submission rules
// and the Bounce Watch content rules. Run: node templates/validate.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));

// Allowed node shapes: NODE-SHAPES.json + NODE-SHAPES-EXTRA.json + the two
// finished examples that shipped before this batch.
const shapeFiles = ['NODE-SHAPES.json', 'NODE-SHAPES-EXTRA.json'];
const allowed = new Map(); // type -> Set(typeVersion)
const allow = (type, v) => {
  if (!allowed.has(type)) allowed.set(type, new Set());
  allowed.get(type).add(v);
};
for (const f of shapeFiles) {
  const data = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
  for (const [k, v] of Object.entries(data)) {
    if (k.startsWith('_')) continue;
    allow(v.type, v.typeVersion);
  }
}
// From the two finished, compliant examples.
allow('n8n-nodes-base.stickyNote', 1);
allow('n8n-nodes-base.slack', 2.2);
allow('n8n-nodes-base.filter', 2);
allow('n8n-nodes-bouncewatch.bounceWatch', 1);
allow('n8n-nodes-bouncewatch.bounceWatchTrigger', 1);

const DEFAULT_NAMES = [
  'HTTP Request', 'Set', 'Filter', 'If', 'Code', 'Edit Fields', 'Switch',
  'Merge', 'Slack', 'Discord', 'Notion', 'Airtable', 'HubSpot', 'Google Sheets',
  'Send Email', 'Schedule Trigger', 'Manual Trigger', 'Split Out', 'Aggregate',
  'OpenAI', 'Bounce Watch', 'Bounce Watch Trigger', 'No Operation, do nothing',
];
const isDefaultName = (n) =>
  DEFAULT_NAMES.some((d) => n === d || new RegExp(`^${d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\d+$`).test(n));

const BANNED_TEXT = [
  [/\bxox[baprs]-[A-Za-z0-9-]+/g, 'Slack token'],
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, 'email address'],
  [/\b(?=[A-Za-z0-9_-]{28,})(?=[A-Za-z0-9_-]*[a-z])(?=[A-Za-z0-9_-]*[A-Z])(?=[A-Za-z0-9_-]*[0-9])[A-Za-z0-9_-]{28,}\b/g, 'long opaque id'],
];
// Words the product rules forbid from user-facing copy.
const BANNED_JSON_KEYS = ['notes', 'billing', 'coverage', 'quota'];

const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;

// Not workflows: reference data and the two templates that shipped before this
// batch (kept out of the pass/fail count, still reported below).
const NOT_WORKFLOWS = ['NODE-SHAPES.json', 'NODE-SHAPES-EXTRA.json', 'BOUNCEWATCH-FIELDS.json'];
const PRE_EXISTING = ['new-signal-to-slack.json', 'new-signal-to-email.json'];

const files = readdirSync(DIR)
  .filter((f) => f.endsWith('.json') && !NOT_WORKFLOWS.includes(f))
  .sort();

let failures = 0;
const rows = [];

for (const file of files) {
  const errs = [];
  let wf;
  try {
    wf = JSON.parse(readFileSync(join(DIR, file), 'utf8'));
  } catch (e) {
    console.log(`FAIL ${file}: invalid JSON — ${e.message}`);
    failures++;
    continue;
  }

  if (!wf.name || typeof wf.name !== 'string') errs.push('missing name');

  const nodes = wf.nodes ?? [];
  const stickies = nodes.filter((n) => n.type === 'n8n-nodes-base.stickyNote');
  const yellow = stickies.filter((n) => n.parameters?.color === undefined);
  const white = stickies.filter((n) => n.parameters?.color === 7);
  const work = nodes.filter((n) => n.type !== 'n8n-nodes-base.stickyNote');

  // --- yellow sticky
  if (yellow.length !== 1) errs.push(`expected exactly 1 yellow sticky, found ${yellow.length}`);
  let stickyWords = 0;
  if (yellow.length === 1) {
    const c = yellow[0].parameters.content ?? '';
    stickyWords = words(c);
    if (stickyWords < 100 || stickyWords > 300) errs.push(`yellow sticky word count ${stickyWords} outside 100-300`);
    if (!c.includes('### How it works')) errs.push('yellow sticky missing "### How it works"');
    if (!c.includes('### Setup')) errs.push('yellow sticky missing "### Setup"');
    if (nodes[0] !== yellow[0]) errs.push('yellow sticky is not first in the nodes array');
  }

  // --- section stickies
  if (work.length >= 4) {
    if (white.length === 0) errs.push(`${work.length} work nodes but no section stickies`);
    for (const s of white) {
      const w = words(s.parameters.content ?? '');
      if (w >= 50) errs.push(`section sticky "${(s.parameters.content ?? '').split('\n')[0]}" is ${w} words (must be <50)`);
      if (!/^##\s/m.test(s.parameters.content ?? '')) errs.push('section sticky has no ## heading');
    }
  }

  // --- node names and shapes
  const names = new Set();
  for (const n of work) {
    if (isDefaultName(n.name)) errs.push(`node left at default name: "${n.name}"`);
    if (names.has(n.name)) errs.push(`duplicate node name: "${n.name}"`);
    names.add(n.name);
    const versions = allowed.get(n.type);
    if (!versions) errs.push(`unverified node type: ${n.type}`);
    else if (!versions.has(n.typeVersion)) {
      errs.push(`unverified typeVersion for ${n.type}: ${n.typeVersion} (allowed: ${[...versions].join(', ')})`);
    }
  }

  // --- connections
  for (const [from, out] of Object.entries(wf.connections ?? {})) {
    if (!names.has(from)) errs.push(`connection source not a node: "${from}"`);
    for (const branch of out.main ?? []) {
      for (const link of branch ?? []) {
        if (!names.has(link.node)) errs.push(`connection target not a node: "${link.node}"`);
      }
    }
  }
  // everything except the last node should have an outgoing connection
  for (const n of work.slice(0, -1)) {
    if (!wf.connections?.[n.name]) errs.push(`node "${n.name}" has no outgoing connection`);
  }

  // --- secrets / personal traces
  const raw = JSON.stringify(wf);
  for (const [re, label] of BANNED_TEXT) {
    const hits = [...new Set(raw.match(re) ?? [])];
    if (hits.length) errs.push(`${label} found: ${hits.slice(0, 3).join(', ')}`);
  }
  for (const n of nodes) {
    if (n.credentials) {
      for (const [k, v] of Object.entries(n.credentials)) {
        if (v.id && !['1', ''].includes(String(v.id))) errs.push(`credential "${k}" carries a non-placeholder id`);
      }
    }
  }

  // --- product rules in visible copy
  const copy = [
    ...stickies.map((s) => s.parameters.content ?? ''),
    ...work.map((n) => n.notes ?? ''),
    ...work.flatMap((n) => JSON.stringify(n.parameters).match(/"[^"]*"/g) ?? []),
  ].join('\n');
  if (/\bweight\s*\d|\bweight\s*\{\{|\d\s*\/\s*10\b/i.test(copy)) errs.push('numeric weight surfaced in copy');
  // "an empty result means the company was quiet" is banned; saying the opposite
  // is exactly what the copy is supposed to do, so a nearby negation clears it.
  const silence = /nothing happened|went quiet|(?:was|were|is|are) quiet/gi;
  for (const m of copy.matchAll(silence)) {
    const before = copy.slice(Math.max(0, m.index - 70), m.index);
    if (!/\b(not|never|rather than|no evidence|nor)\b/i.test(before)) {
      errs.push(`empty-result copy implies silence: "...${copy.slice(Math.max(0, m.index - 40), m.index + 30)}..."`);
    }
  }
  for (const key of BANNED_JSON_KEYS) {
    const re = new RegExp(`\\$json\\.[A-Za-z0-9_.\\[\\]]*\\b${key}\\b`, 'i');
    if (re.test(raw)) errs.push(`workflow reads a forbidden field: ${key}`);
  }
  if (/\$json[^"]*\binternal\b/i.test(raw)) errs.push('workflow reads an `internal` field');

  // --- links
  if (yellow.length === 1) {
    const c = yellow[0].parameters.content;
    if (!c.includes('bouncewatch.com/register/api')) errs.push('setup does not link to bouncewatch.com/register/api');
    const bare = c.match(/bouncewatch\.com(?![/\w])/g) ?? [];
    if (bare.length) errs.push('links to the bare bouncewatch.com homepage');
  }

  const pre = PRE_EXISTING.includes(file);
  rows.push({ file, nodes: work.length, sticky: stickyWords, sections: white.length, ok: errs.length === 0, pre });
  if (errs.length) {
    if (!pre) failures++;
    console.log(`${pre ? 'WARN (pre-existing)' : 'FAIL'} ${file}`);
    for (const e of errs) console.log(`   - ${e}`);
  }
}

console.log('');
console.log('file'.padEnd(74) + 'nodes  sticky  sections  ok');
for (const r of rows) {
  console.log(
    r.file.padEnd(74) +
      String(r.nodes).padEnd(7) +
      String(r.sticky).padEnd(8) +
      String(r.sections).padEnd(10) +
      (r.ok ? 'yes' : r.pre ? 'pre-existing' : 'NO'),
  );
}
console.log('');
const checked = rows.filter((r) => !r.pre).length;
console.log(failures === 0 ? `PASS — ${checked} templates checked, 0 failures` : `${failures} file(s) failed`);

// ------------------------------------------------------- DESCRIPTIONS.md
const REQ_LINE =
  '- The Bounce Watch node, verified by n8n. On n8n Cloud, enable Verified Community Nodes in the Admin Panel. On self-hosted n8n, install `n8n-nodes-bouncewatch` from Settings \u2192 Community nodes.';
const SECTIONS = ["**Who's it for**", '**What it does**', '**How to set up**', '**Requirements**', '**How to customize**'];

const md = readFileSync(join(DIR, 'DESCRIPTIONS.md'), 'utf8');
const blocks = md.split(/\n(?=# )/).filter((b) => b.startsWith('# '));
const byTitle = new Map(blocks.map((b) => [b.split('\n')[0].slice(2).trim(), b]));

let descFailures = 0;
const descRows = [];
for (const r of rows) {
  const wf = JSON.parse(readFileSync(join(DIR, r.file), 'utf8'));
  const block = byTitle.get(wf.name);
  const errs = [];
  if (r.pre) {
    // Templates 1 and 2 shipped before this batch; their descriptions are not
    // this script's to police.
    continue;
  }
  if (!block) {
    errs.push('no DESCRIPTIONS.md section with a heading matching the workflow name');
  } else {
    for (const sec of SECTIONS) if (!block.includes(sec)) errs.push(`missing section ${sec}`);
    if (!block.includes(REQ_LINE)) errs.push('Requirements is missing the verbatim verified-node line');
    if (!block.includes('bouncewatch.com/register/api')) errs.push('no link to bouncewatch.com/register/api');
    if ((block.match(/bouncewatch\.com(?![/\w])/g) ?? []).length) errs.push('links to the bare bouncewatch.com homepage');
    if (/<[a-z][^>]*>/i.test(block)) errs.push('contains HTML');
    const nonAscii = [...new Set((block.match(/[^\x00-\x7F]/g) ?? []))].filter((c) => !'\u2014\u2013\u2192\u2019\u201c\u201d\u26a0\ufe0f\u{1f91d}'.includes(c));
    if (nonAscii.length) errs.push(`unexpected non-ascii characters: ${nonAscii.join(' ')}`);
    // first sentence of Who's it for must not open with the brand
    const who = block.split("**Who's it for**")[1]?.trim().split('\n')[0] ?? '';
    if (/^Bounce\s?Watch\b/i.test(who)) errs.push('Who\'s it for opens with the brand name');
    descRows.push({ title: wf.name, words: words(block.replace(/^# .*/m, '')) });
  }
  if (errs.length) {
    descFailures++;
    console.log(`DESC FAIL ${wf.name}`);
    for (const e of errs) console.log(`   - ${e}`);
  }
}

console.log('');
console.log('description'.padEnd(84) + 'words');
for (const d of descRows) console.log(d.title.padEnd(84) + d.words);
console.log('');
console.log(descFailures === 0 ? `PASS \u2014 ${descRows.length} descriptions, 0 failures` : `${descFailures} description(s) failed`);

process.exit(failures === 0 && descFailures === 0 ? 0 : 1);
