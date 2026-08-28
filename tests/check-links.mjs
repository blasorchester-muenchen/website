import { readFile } from 'node:fs/promises';
import path from 'node:path';

const origin = 'http://127.0.0.1:4173';
const pages = ['/index.html', '/impressum.html', '/404.html'];
const skipHosts = new Set(['bomuc.chayns.site', 'bomuc.org', 'www.instagram.com', 'www.google.com', 'bomuc.notion.site', 'docs.github.com', 'www.lda.bayern.de']);

const failures = [];

for (const page of pages) {
  const res = await fetch(origin + page);
  if (!res.ok) failures.push(`${page} -> ${res.status}`);
  const html = await res.text();
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  const srcs = [...html.matchAll(/src="([^"]+)"/g)].map((m) => m[1]);
  for (const raw of [...hrefs, ...srcs]) {
    if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('data:')) continue;
    let url;
    try {
      url = new URL(raw, origin + page);
    } catch {
      failures.push(`${page} bad url ${raw}`);
      continue;
    }
    if (url.origin !== origin) {
      if (skipHosts.has(url.hostname)) continue;
      continue;
    }
    const local = await fetch(url);
    if (!local.ok) failures.push(`${page} -> ${raw} (${local.status})`);
  }
}

const css = await readFile(path.resolve('_site/css/style.css'), 'utf8');
if (css.includes('fonts.googleapis.com')) failures.push('css still requests Google Fonts');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('internal links ok');
