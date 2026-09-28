/* ── Documentation search + phone navigation ────────────────────────────────
   Two things, both aimed at finding one answer in ~50 pages from a phone.

   1. Search. One box, every page, landing on the exact heading — an FAQ
      question, an error message, a single editor feature — rather than the top
      of a 2,000-word page. The index is js/docs-search-index.json, built by
      scripts/build-docs-search.py; it is fetched the first time search opens,
      so a reader who never searches never downloads it. Opens from the sidebar
      button, the phone bar, "/" or ⌘K / Ctrl+K.

   2. On phones, one sticky bar under the site nav: the page you are on, the
      section you are reading, and a search button. Tapping it opens a sheet
      with "On this page" and "All pages". The sheet borrows the real navs
      (moved, not copied) so the tree's own expand/collapse keeps working, and
      hands them back when it closes.

   Loaded by docs-tree.js on every doc page, and directly by the docs hub.
   ────────────────────────────────────────────────────────────────────────── */
(function () {
  if (window.__docsNav) return;
  window.__docsNav = true;

  const PRODUCT = document.body.dataset.docProduct || null;
  const NAMES = { bulkcomments: 'Bulk Comments', bulkpagecloner: 'Bulk Page Cloner' };
  const ROOTS = { bulkcomments: '/resources/documentation/bulkcomments', bulkpagecloner: '/resources/documentation/bulkpagecloner' };
  const POPULAR = [
    ['Installation', '/installation'],
    ['Limits', '/limits'],
    ['Help and support — error messages', '/troubleshooting'],
    ['FAQ', '/faq'],
  ];
  const phone = window.matchMedia('(max-width: 820px)');

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const ICON_SEARCH = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>';
  const ICON_LIST = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="14" y2="18"/></svg>';
  const ICON_CHEV = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';

  // Scroll lock shared by the search overlay and the sheet.
  let locks = 0;
  const lock = () => { if (locks++ === 0) document.documentElement.style.overflow = 'hidden'; };
  const unlock = () => { if (--locks <= 0) { locks = 0; document.documentElement.style.overflow = ''; } };

  // ═══ 1. Search ═══════════════════════════════════════════════════════════
  let index = null, loading = null;
  const load = () => loading || (loading = fetch('/js/docs-search-index.json')
    .then((r) => r.json())
    .then((d) => (index = d.map((r) => ({ ...r, _t: (r.t || '').toLowerCase(), _h: (r.h || '').toLowerCase(), _x: (r.x || '').toLowerCase() }))))
    .catch(() => (index = [])));

  // Crude stemming, so "attachments" finds "attachment" and "sending" finds "send".
  const stem = (t) => (t.length > 5 && t.endsWith('ing') ? t.slice(0, -3)
    : t.length > 4 && t.endsWith('es') ? t.slice(0, -2)
    : t.length > 3 && t.endsWith('s') ? t.slice(0, -1) : t);
  const tokenize = (q) => q.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 1 || /\d/.test(t)).map(stem);
  const count = (hay, t) => { let n = 0, i = 0; while ((i = hay.indexOf(t, i)) > -1 && n < 5) { n++; i += t.length; } return n; };

  function score(r, toks, phrase, scope) {
    if (scope !== 'all' && r.p !== scope) return 0;
    let s = 0;
    for (const t of toks) {
      const h = r._h.includes(t), ti = r._t.includes(t), x = r._x.includes(t);
      if (!h && !ti && !x) return 0;                       // every word must appear
      if (h) s += 10;
      if (ti) s += 5;
      if (x) s += Math.min(4, count(r._x, t));
    }
    if (phrase.length > 4) s += r._h.includes(phrase) ? 20 : r._x.includes(phrase) ? 8 : 0;
    if (r.k === 'rn') s *= 0.35;                            // history ranks below how-to
    return s;
  }

  const escRe = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Highlight before escaping would inject markup; escape each piece instead.
  function marked(text, toks) {
    const frag = document.createDocumentFragment();
    if (!toks.length) { frag.append(text); return frag; }
    const re = new RegExp('(' + toks.slice().sort((a, b) => b.length - a.length).map(escRe).join('|') + ')', 'gi');
    text.split(re).forEach((part, i) => frag.append(i % 2 ? el('mark', null, part) : part));
    return frag;
  }
  function snippet(r, toks) {
    const x = r.x || '';
    if (!x) return '';
    let i = -1;
    for (const t of toks) { const j = r._x.indexOf(t); if (j > -1 && (i < 0 || j < i)) i = j; }
    let start = Math.max(0, i - 48);
    if (start > 0) { const sp = x.indexOf(' ', start); if (sp > -1 && sp - start < 16) start = sp + 1; }
    const end = Math.min(x.length, start + 160);
    return (start > 0 ? '…' : '') + x.slice(start, end) + (end < x.length ? '…' : '');
  }

  let dlg, input, list, empty, scopeBtns, trigger = null, active = -1, scope = PRODUCT || 'all';

  function buildSearch() {
    dlg = el('div', 'dsearch');
    dlg.hidden = true;
    dlg.setAttribute('role', 'dialog');
    dlg.setAttribute('aria-modal', 'true');
    dlg.setAttribute('aria-label', 'Search the documentation');
    dlg.innerHTML =
      '<div class="dsearch-backdrop"></div>' +
      '<div class="dsearch-panel">' +
        '<div class="dsearch-top">' + ICON_SEARCH +
          '<input type="search" class="dsearch-input" placeholder="Search the docs" aria-label="Search the documentation" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" role="combobox" aria-expanded="true" aria-controls="dsearch-list" aria-autocomplete="list">' +
          '<button type="button" class="dsearch-close">Cancel</button>' +
        '</div>' +
        '<div class="dsearch-scope" role="group" aria-label="Which app"></div>' +
        '<div class="dsearch-body"><p class="dsearch-empty"></p><ul class="dsearch-list" id="dsearch-list" role="listbox" aria-label="Results"></ul></div>' +
        '<div class="dsearch-foot"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></div>' +
      '</div>';
    document.body.appendChild(dlg);
    input = dlg.querySelector('.dsearch-input');
    list = dlg.querySelector('.dsearch-list');
    empty = dlg.querySelector('.dsearch-empty');

    // A product's docs search that product only, with no switching. The chips
    // exist only on the docs hub, which covers both apps.
    const scopeHost = dlg.querySelector('.dsearch-scope');
    if (PRODUCT) scopeHost.remove();
    scopeBtns = (PRODUCT ? [] : [['bulkcomments', 'Bulk Comments'], ['bulkpagecloner', 'Bulk Page Cloner'], ['all', 'Both apps']]).map(([key, label]) => {
      const b = el('button', 'dsearch-chip', label);
      b.type = 'button';
      b.dataset.scope = key;
      b.addEventListener('click', () => { scope = key; paintScope(); run(); input.focus(); });
      scopeHost.appendChild(b);
      return b;
    });
    paintScope();

    dlg.querySelector('.dsearch-backdrop').addEventListener('click', closeSearch);
    dlg.querySelector('.dsearch-close').addEventListener('click', closeSearch);
    input.addEventListener('input', run);
    dlg.addEventListener('keydown', (e) => {
      const items = [...list.querySelectorAll('a')];
      if (e.key === 'Escape') { e.preventDefault(); closeSearch(); }
      else if (e.key === 'ArrowDown' && items.length) { e.preventDefault(); setActive(Math.min(items.length - 1, active + 1)); }
      else if (e.key === 'ArrowUp' && items.length) { e.preventDefault(); setActive(Math.max(0, active - 1)); }
      else if (e.key === 'Enter' && e.target === input && items.length) { e.preventDefault(); items[Math.max(0, active)].click(); }
      else if (e.key === 'Tab') {                           // keep focus inside
        const f = [...dlg.querySelectorAll('input, button, a[href]')].filter((n) => n.offsetParent);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    // A result on this same page only changes the hash — close first so the
    // jump is visible.
    list.addEventListener('click', (e) => { if (e.target.closest('a')) closeSearch(true); });
  }

  function paintScope() {
    scopeBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.scope === scope)));
    input.placeholder = scope === 'all' ? 'Search both apps’ docs' : 'Search ' + NAMES[scope] + ' docs';
  }

  function setActive(i) {
    const items = [...list.querySelectorAll('a')];
    items.forEach((a, j) => a.setAttribute('aria-selected', String(j === i)));
    active = i;
    if (items[i]) { items[i].scrollIntoView({ block: 'nearest' }); input.setAttribute('aria-activedescendant', items[i].id); }
  }

  function resultItem(href, where, head, snip, toks, id) {
    const li = el('li');
    const a = el('a', 'dsearch-hit');
    a.href = href;
    a.id = id;
    a.setAttribute('role', 'option');
    if (where) a.appendChild(el('span', 'dsearch-where', where));
    const h = el('span', 'dsearch-head');
    h.appendChild(marked(head, toks));
    a.appendChild(h);
    if (snip) { const s = el('span', 'dsearch-snip'); s.appendChild(marked(snip, toks)); a.appendChild(s); }
    li.appendChild(a);
    return li;
  }

  function run() {
    const q = input.value.trim();
    list.textContent = '';
    active = -1;
    input.removeAttribute('aria-activedescendant');
    const toks = tokenize(q);

    if (!toks.length) {                                     // nothing typed: the usual destinations
      empty.textContent = 'Popular';
      empty.className = 'dsearch-empty dsearch-label';
      const keys = scope === 'all' ? Object.keys(ROOTS) : [scope];
      keys.forEach((k) => POPULAR.forEach(([label, path], i) =>
        list.appendChild(resultItem(ROOTS[k] + path, keys.length > 1 ? NAMES[k] : '', label, '', [], 'dsr-p-' + k + i))));
      return;
    }
    if (!index) { empty.textContent = 'Loading…'; empty.className = 'dsearch-empty'; load().then(run); return; }

    const phrase = toks.join(' ');
    const hits = [];
    for (const r of index) { const s = score(r, toks, phrase, scope); if (s > 0) hits.push([s, r]); }
    hits.sort((a, b) => b[0] - a[0]);

    if (!hits.length) {
      empty.textContent = 'Nothing in the ' + (scope !== 'all' ? NAMES[scope] + ' ' : '') + 'docs matches \u201c' + q + '\u201d. Try fewer or different words.';
      empty.className = 'dsearch-empty';
      return;
    }
    empty.textContent = hits.length + (hits.length === 1 ? ' result' : ' results');
    empty.className = 'dsearch-empty dsearch-label';
    hits.slice(0, 30).forEach(([, r], i) => {
      const where = (scope === 'all' ? NAMES[r.p] + ' · ' : '') + r.t + (r.k === 'rn' ? ' (release notes)' : '');
      list.appendChild(resultItem(r.u, where, r.h || r.t, snippet(r, toks), toks, 'dsr-' + i));
    });
  }

  function openSearch(from) {
    if (!dlg) buildSearch();
    trigger = from || document.activeElement;
    dlg.hidden = false;
    lock();
    load();
    run();
    input.focus();
    input.select();
  }
  function closeSearch(navigating) {
    if (!dlg || dlg.hidden) return;
    dlg.hidden = true;
    unlock();
    if (navigating !== true && trigger && trigger.focus) trigger.focus();
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-doc-search]');
    if (t) { e.preventDefault(); openSearch(t); }
  });
  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); openSearch(); }
    else if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); openSearch(); }
  });

  // The sidebar's own search button (laptop and desktop).
  const side = document.querySelector('.doc-sidebar');
  if (side) {
    const b = el('button', 'doc-search-btn');
    b.type = 'button';
    b.setAttribute('data-doc-search', '');
    b.innerHTML = ICON_SEARCH + '<span>Search docs</span><kbd aria-hidden="true">/</kbd>';
    side.prepend(b);
  }

  // ═══ 2. Phone bar + sheet ════════════════════════════════════════════════
  const layout = document.querySelector('.doc-layout');
  if (!PRODUCT || !layout) return;

  const h1 = document.querySelector('.page-hero h1');
  const bar = el('div', 'doc-mbar');
  bar.innerHTML =
    '<button type="button" class="doc-mbar-nav" aria-haspopup="dialog">' + ICON_LIST +
      '<span class="doc-mbar-text"><span class="doc-mbar-page"></span><span class="doc-mbar-sec"></span></span>' + ICON_CHEV +
    '</button>' +
    '<button type="button" class="doc-mbar-search" data-doc-search aria-label="Search the docs">' + ICON_SEARCH + '</button>';
  bar.querySelector('.doc-mbar-page').textContent = h1 ? h1.textContent.replace(/\s+/g, ' ').trim() : NAMES[PRODUCT];
  const secEl = bar.querySelector('.doc-mbar-sec');
  const navBtn = bar.querySelector('.doc-mbar-nav');
  layout.parentNode.insertBefore(bar, layout);

  const setSection = (label) => { secEl.textContent = label || 'Contents'; };
  const now = document.querySelector('.doc-onpage-now');
  setSection(now && now.textContent);
  document.addEventListener('docs:section', (e) => setSection(e.detail));

  let sheet, homes = [], lastTab = null;
  function buildSheet() {
    sheet = el('div', 'doc-sheet');
    sheet.hidden = true;
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-label', 'Documentation navigation');
    sheet.innerHTML =
      '<div class="doc-sheet-backdrop"></div>' +
      '<div class="doc-sheet-panel">' +
        '<div class="doc-sheet-head">' +
          '<div class="doc-sheet-tabs" role="tablist">' +
            '<button type="button" role="tab" data-tab="onpage">On this page</button>' +
            '<button type="button" role="tab" data-tab="pages">All pages</button>' +
          '</div>' +
          '<button type="button" class="doc-sheet-close" aria-label="Close">✕</button>' +
        '</div>' +
        '<div class="doc-sheet-pane" data-pane="onpage" role="tabpanel"></div>' +
        '<div class="doc-sheet-pane" data-pane="pages" role="tabpanel"></div>' +
      '</div>';
    document.body.appendChild(sheet);
    sheet.querySelector('.doc-sheet-backdrop').addEventListener('click', closeSheet);
    sheet.querySelector('.doc-sheet-close').addEventListener('click', closeSheet);
    sheet.querySelectorAll('[role=tab]').forEach((t) => t.addEventListener('click', () => showTab(t.dataset.tab)));
    sheet.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });
    // Following an in-page link closes the sheet so the jump is visible.
    sheet.addEventListener('click', (e) => { const a = e.target.closest('a[href]'); if (a) closeSheet(true); });
  }

  function showTab(tab) {
    lastTab = tab;
    sheet.querySelectorAll('[role=tab]').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.tab === tab)));
    sheet.querySelectorAll('.doc-sheet-pane').forEach((p) => { p.hidden = p.dataset.pane !== tab; });
    const pane = sheet.querySelector('[data-pane="' + tab + '"]');
    const mark = pane.querySelector('a.active:not(.doc-toc-member), a.is-current');
    pane.scrollTop = 0;
    if (mark) mark.scrollIntoView({ block: 'center' });
  }

  function borrow(node, pane) {
    if (!node) return false;
    homes.push([node, node.parentNode, node.nextSibling]);
    pane.appendChild(node);
    return true;
  }

  function openSheet() {
    if (!sheet) buildSheet();
    const hasOnpage = borrow(document.querySelector('.doc-toc--auto'), sheet.querySelector('[data-pane="onpage"]'));
    borrow(document.querySelector('.doc-toc--pages'), sheet.querySelector('[data-pane="pages"]'));
    sheet.querySelector('[data-tab="onpage"]').hidden = !hasOnpage;
    sheet.hidden = false;
    navBtn.setAttribute('aria-expanded', 'true');
    lock();
    showTab(hasOnpage ? (lastTab || 'onpage') : 'pages');
    sheet.querySelector('[aria-selected="true"]').focus();
  }
  function closeSheet(navigating) {
    if (!sheet || sheet.hidden) return;
    homes.reverse().forEach(([node, parent, next]) => parent.insertBefore(node, next && next.parentNode === parent ? next : null));
    homes = [];
    sheet.hidden = true;
    navBtn.setAttribute('aria-expanded', 'false');
    unlock();
    if (navigating !== true) navBtn.focus();
  }
  navBtn.setAttribute('aria-expanded', 'false');
  navBtn.addEventListener('click', openSheet);
  // Rotating to landscape past 820px hands the navs back to the layout.
  phone.addEventListener('change', (e) => { if (!e.matches) closeSheet(true); });
})();
