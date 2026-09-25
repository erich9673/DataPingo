/* ── Documentation page tree ──────────────────────────────────────────────────
   One manifest, rendered into every doc page: the left-hand tree, the
   breadcrumbs, the child-page cards on a parent, and prev/next along the
   bottom. Before this, the page list was hand-written markup duplicated
   verbatim in fifteen files — identical down to the byte, which is another way
   of saying fifteen places to forget when a page moves.

   Adding a page means adding one line below. Nothing else.

   Depth is capped at two on purpose (a top-level page, optionally with
   children). Appfire and Ricksoft both stop there, and a third level in a
   220px rail stops being a tree and starts being a wall.
   ────────────────────────────────────────────────────────────────────────── */
(function () {
  const DOCS_ROOT = '/resources/documentation';

  const TREE = {
    bulkcomments: {
      product: 'Bulk Comments for Jira',
      root: DOCS_ROOT + '/bulkcomments',
      pages: [
        {
          path: '', title: 'Get started',
          children: [
            { path: 'installation', title: 'Installation', blurb: 'Installing on Jira Cloud, and uninstalling.' },
            { path: 'where-to-open', title: 'Where to open it', blurb: 'The two ways into the app, and what each one does differently.' }
          ]
        },
        {
          path: 'guide', title: 'User guide',
          blurb: 'Open the app, pick issues, write a comment on each, send the batch.',
          children: [
            { path: 'guide/about-the-app', title: 'About the app', blurb: 'Terms, keyboard and screen readers, light and dark, what is remembered.' },
            { path: 'guide/step-1-select-issues', title: 'Step 1 \u2014 Select', blurb: 'Search, the four filters, sort, and the tray that counts against the 25.' },
            { path: 'guide/step-2-write-comments', title: 'Step 2 \u2014 Comment', blurb: 'The card, the editor, and the controls that act on the whole batch.' },
            { path: 'guide/step-3-send-the-batch', title: 'Step 3 \u2014 Send', blurb: 'The send guard, the live counters, and what each result row means.' },
            { path: 'guide/service-management', title: 'Service Management and Customer Management', blurb: 'Choosing the audience, sending both a reply and a note, and the batch controls that only requests have.' }
          ]
        },
        { path: 'admin', title: 'Admin guide', blurb: 'The Jira settings and project permissions that govern what the app can do.' },
        {
          path: 'technical', title: 'App technical information',
          blurb: 'Scopes, data handling, where it runs, and every ceiling it enforces.',
          children: [
            { path: 'limits', title: 'Limits', blurb: 'Every ceiling in one place, and what happens at each.' },
            { path: 'specs', title: 'Specs & security', blurb: 'Scopes, data handling, and where everything runs.' }
          ]
        },
        { path: 'faq', title: 'FAQ', blurb: 'The questions that come up before, during and after a batch.' },
        { path: 'troubleshooting', title: 'Help and support', blurb: 'Errors the app can show, and what to do about each.' },
        {
          path: 'release-notes', title: 'Release notes',
          blurb: 'Every version, newest first.',
          children: [
            { path: 'release-notes/v4-8-0', title: 'v4.8.0 \u2014 September 21, 2026', blurb: 'Release notes for version 4.8.0' },
            { path: 'release-notes/v4-7-0', title: 'v4.7.0 \u2014 September 21, 2026', blurb: 'The Comment step rebuilt around writing to twenty-five issues rather than one, and three fixes ' },
            { path: 'release-notes/v4-6-0', title: 'v4.6.0 \u2014 September 7, 2026', blurb: 'Release notes for version 4.6.0' },
            { path: 'release-notes/v4-5-0', title: 'v4.5.0 \u2014 September 3, 2026', blurb: 'Release notes for version 4.5.0' },
            { path: 'release-notes/v4-4-0', title: 'v4.4.0 \u2014 September 3, 2026', blurb: 'Release notes for version 4.4.0' },
            { path: 'release-notes/v4-3-0', title: 'v4.3.0 \u2014 August 26, 2026', blurb: 'Release notes for version 4.3.0' },
            { path: 'release-notes/v4-2-0', title: 'v4.2.0 \u2014 August 6, 2026', blurb: 'Release notes for version 4.2.0' },
            { path: 'release-notes/v4-1-0', title: 'v4.1.0 \u2014 August 3, 2026', blurb: 'Release notes for version 4.1.0' },
            { path: 'release-notes/v4-0-0', title: 'v4.0.0 \u2014 July 22, 2026', blurb: 'Release notes for version 4.0.0' },
            { path: 'release-notes/v3-7-0', title: 'v3.7.0 \u2014 July 17, 2026', blurb: 'Release notes for version 3.7.0' },
            { path: 'release-notes/v3-4-0', title: 'v3.4.0 \u2014 July 16, 2026', blurb: 'Release notes for version 3.4.0' },
            { path: 'release-notes/v3-3-0', title: 'v3.3.0 \u2014 July 9, 2026', blurb: 'Release notes for version 3.3.0' }
          ]
        }
      ]
    },

    bulkpagecloner: {
      product: 'Bulk Page Cloner for Confluence',
      root: DOCS_ROOT + '/bulkpagecloner',
      pages: [
        {
          path: '', title: 'Get started',
          children: [
            { path: 'installation', title: 'Installation', blurb: 'Installing on Confluence Cloud, and uninstalling.' },
            { path: 'where-to-open', title: 'Where to open it', blurb: 'The three ways into the app, and what each one does.' }
          ]
        },
        {
          path: 'guide', title: 'User guide',
          blurb: 'Pick a source page, name the copies, choose where they land.',
          children: [
            { path: 'guide/about-the-app', title: 'About the app', blurb: 'Light and dark mode, and the full video walkthrough.' },
            { path: 'guide/step-1-source', title: 'Step 1 \u2014 Source', blurb: 'Pick the one page every copy is made from.' },
            { path: 'guide/step-2-copies', title: 'Step 2 \u2014 Copies', blurb: 'How many copies, and what each one is called.' },
            { path: 'guide/step-3-location', title: 'Step 3 \u2014 Location', blurb: 'Which space they land in, and where they sit in the tree.' },
            { path: 'guide/step-4-done', title: 'Step 4 \u2014 Done', blurb: 'Every page created, with a direct link to each.' }
          ]
        },
        { path: 'admin', title: 'Admin guide', blurb: 'The Confluence permissions that govern what the app can read and write.' },
        {
          path: 'technical', title: 'App technical information',
          blurb: 'Scopes, data handling, where it runs, and every ceiling it enforces.',
          children: [
            { path: 'limits', title: 'Limits', blurb: 'Every ceiling in one place, and what happens at each.' },
            { path: 'specs', title: 'Specs & security', blurb: 'Scopes, data handling, and where everything runs.' }
          ]
        },
        { path: 'faq', title: 'FAQ', blurb: 'The questions that come up before, during and after a clone.' },
        { path: 'troubleshooting', title: 'Help and support', blurb: 'Errors the app can show, and what to do about each.' },
        {
          path: 'release-notes', title: 'Release notes', blurb: 'Every version, newest first.',
          children: [
            { path: 'release-notes/v10-2-0', title: 'v10.2.0 \u2014 September 3, 2026' },
            { path: 'release-notes/v10-1-0', title: 'v10.1.0 \u2014 August 7, 2026' },
            { path: 'release-notes/v10-0-0', title: 'v10.0.0 \u2014 July 23, 2026' },
            { path: 'release-notes/v9-0-0', title: 'v9.0.0 \u2014 July 19, 2026' },
            { path: 'release-notes/v7-1-0', title: 'v7.1.0 \u2014 July 6, 2026' },
            { path: 'release-notes/v7-0-0', title: 'v7.0.0 \u2014 June 22, 2026' }
          ]
        }
      ]
    }
  };

  const productKey = document.body.dataset.docProduct;
  const tree = TREE[productKey];
  if (!tree) return;

  const href = (p) => (p.path ? tree.root + '/' + p.path : tree.root);

  // Trailing slashes and the .html the file actually lives at both need to
  // resolve to the same node, or the current page highlights nothing.
  const here = location.pathname.replace(/\.html$/, '').replace(/\/$/, '');
  const isHere = (p) => href(p).replace(/\/$/, '') === here;

  // Flat, depth-first — the reading order, which is what prev/next means.
  const flat = [];
  tree.pages.forEach((p) => {
    flat.push(p);
    (p.children || []).forEach((c) => flat.push(c));
  });

  const current = flat.find(isHere);
  const parent = current
    ? tree.pages.find((p) => (p.children || []).some((c) => c === current))
    : null;

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  // ── 1. The tree ───────────────────────────────────────────────────────────
  const nav = document.querySelector('.doc-toc--pages');
  if (nav) {
    nav.textContent = '';
    tree.pages.forEach((p) => {
      const kids = p.children || [];
      const onBranch = isHere(p) || p === parent;

      const row = el('div', 'doc-tree-row');
      const a = el('a', null, p.title);
      a.dataset.filter = p.title;
      a.href = href(p);
      if (isHere(p)) { a.className = 'is-current'; a.setAttribute('aria-current', 'page'); }

      if (kids.length) {
        // The chevron is a real button so it is reachable by keyboard and
        // announced as expandable; the link beside it still just navigates.
        const btn = el('button', 'doc-tree-toggle');
        btn.type = 'button';
        btn.setAttribute('aria-expanded', String(onBranch));
        btn.setAttribute('aria-label', (onBranch ? 'Collapse ' : 'Expand ') + p.title);
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>';
        row.appendChild(btn);
        row.appendChild(a);

        const sub = el('div', 'doc-tree-children');
        kids.forEach((c) => {
          const ca = el('a', null, c.title);
          // "Step 2 — Write a different comment on each" is the page's name and
          // stays that in the breadcrumb and in prev/next. In a 236px rail the
          // prefix is a third of the line, repeated three times, so here the
          // number becomes a marker and the rest is the label. The numbering is
          // real — these are sequential steps — so it carries information.
          const step = /^Step (\d+)\s*[\u2014-]\s*(.+)$/.exec(c.title);
          if (step) {
            ca.textContent = step[2];
            ca.prepend(el('span', 'doc-tree-num', step[1]));
          }
          ca.dataset.filter = c.title;
          ca.href = href(c);
          if (isHere(c)) { ca.className = 'is-current'; ca.setAttribute('aria-current', 'page'); }
          sub.appendChild(ca);
        });

        nav.appendChild(row);
        nav.appendChild(sub);
        if (!onBranch) sub.hidden = true;

        btn.addEventListener('click', () => {
          sub.hidden = !sub.hidden;
          btn.setAttribute('aria-expanded', String(!sub.hidden));
          btn.setAttribute('aria-label', (sub.hidden ? 'Expand ' : 'Collapse ') + p.title);
        });
      } else {
        row.appendChild(a);
        nav.appendChild(row);
      }
    });
  }


  // ── 3. Child cards on a parent page ───────────────────────────────────────
  const childHost = document.querySelector('[data-doc-children]');
  // On the space root there are no children to list, so the cards become the
  // top-level sections — one more hand-maintained copy of the page list gone.
  // The space root lists its own children first (Installation, which belongs to
  // Get started) and then every section, so the landing page routes to all of it.
  const cards = current
    ? (current.path === ''
       ? (current.children || []).concat(tree.pages.filter((x) => x.path !== ''))
       : (current.children || []))
    : [];
  if (childHost && cards.length) {
    const grid = el('div', 'doc-hub');
    cards.forEach((c) => {
      const card = el('a', 'doc-hub-card');
      card.href = href(c);
      card.appendChild(el('span', 'doc-hub-card-title', c.title));
      if (c.blurb) card.appendChild(el('span', 'doc-hub-card-sub', c.blurb));
      grid.appendChild(card);
    });
    childHost.appendChild(grid);
  }

  // ── 4. Prev / next ────────────────────────────────────────────────────────
  const pnHost = document.querySelector('[data-doc-prevnext]');
  if (pnHost && current) {
    const i = flat.indexOf(current);
    const make = (p, dir) => {
      const a = el('a', 'doc-prevnext-link doc-prevnext-link--' + dir);
      a.href = href(p);
      a.appendChild(el('span', 'doc-prevnext-dir', dir === 'prev' ? 'Previous' : 'Next'));
      a.appendChild(el('span', 'doc-prevnext-title', p.title));
      return a;
    };
    if (i > 0) pnHost.appendChild(make(flat[i - 1], 'prev'));
    if (i > -1 && i < flat.length - 1) pnHost.appendChild(make(flat[i + 1], 'next'));
    pnHost.setAttribute('aria-label', 'Page navigation');
  }


})();
