#!/usr/bin/env node
/* Build the BreadcrumbList JSON-LD on every documentation page.

     node scripts/build-docs-breadcrumbs.mjs

   Run it after adding, moving or renaming a page in js/docs-tree.js — the same
   manifest draws the visible trail, so the markup search engines read can't
   drift from what a reader sees.

   Trail: Home › Documentation › <product> › <section, if the page has one> ›
   <page>. The last item is always the page's own canonical. Pages filed under
   "Get started" skip the section, because that section is the product hub
   itself. Release notes are named by version only. Node built-ins only. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SITE = 'https://datapingo.com';

const src = fs.readFileSync(path.join(ROOT, 'js/docs-tree.js'), 'utf8');
const start = src.indexOf('const TREE = ');
const end = src.indexOf('const productKey');
const DOCS_ROOT = '/resources/documentation';
const TREE = new Function('DOCS_ROOT', 'return (' + src.slice(start + 13, end).trim().replace(/;$/, '') + ');')(DOCS_ROOT);

const BLOCK = /<script type="application\/ld\+json">\s*(\{[\s\S]*?\})\s*<\/script>/g;
let written = 0;

for (const [key, tree] of Object.entries(TREE)) {
  const href = (p) => (p.path ? tree.root + '/' + p.path : tree.root);
  const hub = ['Home', SITE + '/'];
  const nodes = [];
  tree.pages.forEach((p) => {
    nodes.push({ node: p, parent: null });
    (p.children || []).forEach((c) => nodes.push({ node: c, parent: p }));
  });

  for (const { node, parent } of nodes) {
    const url = href(node);
    const file = path.join(ROOT, url.replace(/^\//, '') + '.html');
    if (!fs.existsSync(file)) continue;

    const items = [hub, ['Documentation', SITE + DOCS_ROOT], [tree.product, SITE + tree.root]];
    if (node.path !== '') {
      if (parent && parent.path !== '') items.push([parent.title, SITE + href(parent)]);
      const name = node.path.startsWith('release-notes/') ? node.title.split(' — ')[0] : node.title;
      items.push([name, SITE + url]);
    }
    const json = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })),
    };

    const html = fs.readFileSync(file, 'utf8');
    let hits = 0;
    const out = html.replace(BLOCK, (whole, body) => {
      let parsed;
      try { parsed = JSON.parse(body); } catch { return whole; }
      if (parsed['@type'] !== 'BreadcrumbList') return whole;
      hits++;
      return '<script type="application/ld+json">\n' + JSON.stringify(json, null, 2) + '\n  </script>';
    });
    if (hits !== 1) throw new Error(`${url}: expected one BreadcrumbList, found ${hits}`);
    if (out !== html) { fs.writeFileSync(file, out); written++; }
  }
}
console.log(`BreadcrumbList updated on ${written} pages`);
