#!/usr/bin/env node
/**
 * Point the formula at whatever npm currently calls `latest`.
 *
 * Three facts in the formula must agree with the registry: version, tarball
 * URL, and sha256. None of them is edited by hand here. The digest is computed
 * from the bytes actually downloaded, then checked against npm's own
 * `dist.integrity` - if those disagree the download was not what npm published,
 * and this writes nothing rather than hashing a bad tarball into a formula
 * Homebrew would then happily verify.
 *
 * Exit codes: 0 wrote a change, 3 already current (nothing to do), 1 failed.
 * The workflow treats 3 as success and skips the commit.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FORMULA = join(ROOT, 'Formula', 'ux-ui-agent-skills.rb');
const PKG = 'ux-ui-agent-skills';

const fail = (m) => { console.error(`ERROR: ${m}`); process.exit(1); };

const packument = await fetch(`https://registry.npmjs.org/${PKG}`)
  .then(r => r.ok ? r.json() : fail(`registry returned HTTP ${r.status}`));
const latest = packument['dist-tags']?.latest || fail('registry has no latest dist-tag');

const current = readFileSync(FORMULA, 'utf8');
const have = current.match(/ux-ui-agent-skills-([0-9][^"]*)\.tgz/)?.[1]
  || fail('could not read the current version out of the formula');

if (have === latest) {
  console.log(`formula already points at ${latest} - nothing to do`);
  process.exit(3);
}

const meta = packument.versions[latest] || fail(`registry has no metadata for ${latest}`);
const url = meta.dist.tarball;
const bytes = Buffer.from(
  await fetch(url).then(r => r.ok ? r.arrayBuffer() : fail(`could not download ${url}`)));

if (meta.dist.integrity?.startsWith('sha512-')) {
  const want = meta.dist.integrity.slice(7);
  const got = createHash('sha512').update(bytes).digest('base64');
  if (got !== want) fail(`tarball does not match npm's integrity for ${latest}. Writing nothing.`);
}
const sha256 = createHash('sha256').update(bytes).digest('hex');

const next = current
  .replace(/^(\s*url\s+").*(")$/m, `$1${url}$2`)
  .replace(/^(\s*sha256\s+").*(")$/m, `$1${sha256}$2`);

if (next === current) fail('the url/sha256 lines did not match the expected shape - refusing a silent no-op');
writeFileSync(FORMULA, next);

console.log(`${have} -> ${latest}`);
console.log(`url    ${url}`);
console.log(`sha256 ${sha256}`);
// Consumed by the workflow for the commit message.
if (process.env.GITHUB_OUTPUT) {
  writeFileSync(process.env.GITHUB_OUTPUT, `version=${latest}\nprevious=${have}\n`, { flag: 'a' });
}
