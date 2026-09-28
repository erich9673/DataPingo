#!/usr/bin/env python3
"""Build the documentation search index.

    python3 scripts/build-docs-search.py

Run it after editing any page under resources/documentation/ — the search box
reads js/docs-search-index.json and knows nothing the index does not.

One record per heading that has an id: every h2 section, and every h3 inside
one (an FAQ question, a troubleshooting group, an editor feature). A result
therefore lands on the exact spot, not the top of a 2,000-word page — which is
the whole point on a phone. Standard library only; nothing to install.
"""
import html
import json
import os
import re
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(ROOT, 'resources', 'documentation')
OUT = os.path.join(ROOT, 'js', 'docs-search-index.json')
PRODUCTS = ('bulkcomments', 'bulkpagecloner')
SKIP = {'svg', 'script', 'style', 'template', 'noscript'}
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'}


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title = ''
        self.records = []
        self.in_content = False
        self.done = False
        self.skip = 0
        self.cap = None          # 'h1' | 'h2' | 'h3' while reading a heading
        self.cap_id = None
        self.buf = []
        self.h2 = None
        self.cur = {'anchor': '', 'h2': None, 'h3': None, 'text': []}

    def flush(self):
        text = re.sub(r'\s+', ' ', ' '.join(self.cur['text'])).strip()
        if text or self.cur['h2']:
            self.records.append({**self.cur, 'text': text})

    def start(self, anchor, h2, h3):
        self.flush()
        self.cur = {'anchor': anchor, 'h2': h2, 'h3': h3, 'text': []}

    def handle_starttag(self, tag, attrs):
        if self.done or tag in VOID:
            return
        a = dict(attrs)
        if tag in SKIP:
            self.skip += 1
            return
        cls = a.get('class', '') or ''
        if tag == 'h1':
            self.cap, self.buf = 'h1', []
        if tag == 'div' and 'doc-content' in cls.split():
            self.in_content = True
        if not self.in_content:
            return
        if tag == 'nav' and ('doc-prevnext' in cls or 'data-doc-prevnext' in a):
            self.flush()
            self.done = True
            return
        if tag == 'section' and a.get('id'):
            self.start(a['id'], None, None)
            self.h2 = None
        if tag in ('h2', 'h3'):
            self.cap, self.cap_id, self.buf = tag, a.get('id'), []

    def handle_endtag(self, tag):
        if self.done:
            return
        if tag in SKIP:
            self.skip = max(0, self.skip - 1)
            return
        if self.cap == tag:
            text = re.sub(r'\s+', ' ', ''.join(self.buf)).strip()
            if tag == 'h1':
                self.title = self.title or text
            elif tag == 'h2':
                self.h2 = text
                self.cur['h2'] = self.cur['h2'] or text
            elif tag == 'h3':
                if self.cap_id:
                    self.start(self.cap_id, self.h2, text)
                else:
                    self.cur['text'].append(text)
            self.cap = None

    def handle_data(self, data):
        if self.done or self.skip:
            return
        if self.cap:
            self.buf.append(data)
        elif self.in_content:
            self.cur['text'].append(data)


def url_for(product, rel):
    rel = rel[:-5] if rel.endswith('.html') else rel
    if rel.endswith('/index'):
        rel = rel[:-6]
    return '/resources/documentation/' + product + ('/' + rel if rel else '')


def main():
    out = []
    for product in PRODUCTS:
        files = [(os.path.join(DOCS, product + '.html'), '')]
        base = os.path.join(DOCS, product)
        for dirpath, _, names in os.walk(base):
            for n in sorted(names):
                if n.endswith('.html'):
                    full = os.path.join(dirpath, n)
                    files.append((full, os.path.relpath(full, base).replace(os.sep, '/')))
        for full, rel in files:
            src = open(full, encoding='utf-8').read()
            if 'http-equiv="refresh"' in src:
                continue                                   # redirect stubs
            p = Page()
            p.feed(src)
            url = url_for(product, rel)
            kind = 'rn' if '/release-notes' in url else 'doc'
            for r in p.records:
                head = ' › '.join(x for x in (r['h2'], r['h3']) if x) or None
                out.append({
                    'p': product,
                    'u': url + ('#' + r['anchor'] if r['anchor'] else ''),
                    't': html.unescape(p.title),
                    'h': head,
                    'x': r['text'],
                    **({'k': 'rn'} if kind == 'rn' else {}),
                })
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    print(f'{len(out)} records, {os.path.getsize(OUT) // 1024} KB -> {os.path.relpath(OUT, ROOT)}')


if __name__ == '__main__':
    main()
