// Verify that every local reference in the staged site resolves to a file in
// _site/, and that anchors point at ids that exist. External URLs are listed
// but not requested, so the check cannot fail on someone else's downtime.
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';

const site = path.resolve('_site');
const pages = ['index.html', 'impressum.html', '404.html'];
const failures = [];
const external = new Set();

const ids = new Map();
const documents = new Map();

for (const page of pages) {
  const html = await readFile(path.join(site, page), 'utf8');
  documents.set(page, html);
  ids.set(page, new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1])));
}

for (const [page, html] of documents) {
  const refs = [
    ...[...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]),
    ...[...html.matchAll(/srcset="([^"]+)"/g)]
      .flatMap((m) => m[1].split(','))
      .map((candidate) => candidate.trim().split(/\s+/)[0])
  ];

  for (const raw of refs) {
    if (!raw || raw.startsWith('mailto:') || raw.startsWith('data:')) continue;

    if (/^[a-z]+:\/\//i.test(raw)) {
      external.add(raw);
      continue;
    }

    const [target, fragment] = raw.split('#');
    const file = target === '' ? page : target;

    try {
      await access(path.join(site, file));
    } catch {
      failures.push(`${page}: missing ${file}`);
      continue;
    }

    if (!fragment) continue;
    const known = ids.get(file);
    if (known && !known.has(fragment)) {
      failures.push(`${page}: ${file} has no id "${fragment}"`);
    }
  }
}

const css = await readFile(path.join(site, 'css/style.css'), 'utf8');
if (css.includes('fonts.googleapis.com')) failures.push('css still requests Google Fonts');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`internal links ok (${external.size} external links not requested)`);
