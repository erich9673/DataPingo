/* ── Documentation "On this page" nav ────────────────────────────────────────
   Built from the page's own headings rather than hand-written in markup. With
   two products and eight pages, an authored list is a list that goes stale —
   the Bulk Comments guide had four entries pointing at sections that were no
   longer top-level, because the markup moved and the sidebar didn't.

   Top level is section[id]; the second level is h3[id] inside it, and it is
   revealed only for the section you are currently reading. That is the whole
   point: "Full Guide" is thousands of words behind one link, and Step 2 was
   unreachable from the sidebar.

   Drop <nav class="doc-toc doc-toc--auto"></nav> in the sidebar and include
   this file. No per-page configuration.
   ────────────────────────────────────────────────────────────────────────── */
(function () {
  const nav = document.querySelector('.doc-toc--auto');
  const content = document.querySelector('.doc-content');
  if (!nav || !content) return;

  const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

  // A section with no h2 is page furniture, not a destination.
  const groups = [...content.querySelectorAll('section[id]')]
    .map((sec) => ({
      id: sec.id,
      label: text(sec.querySelector('h2')),
      // h3 is a group; the h4 under it are its members. Two levels, because a
      // flat list of 19 in a 220px rail is not an index, it is a wall.
      kids: [...sec.querySelectorAll('h3[id]')].map((h) => {
        const members = []
        for (let el = h.nextElementSibling; el && el.tagName !== 'H3'; el = el.nextElementSibling) {
          if (el.tagName === 'H4' && el.id) members.push({ id: el.id, label: text(el) })
        }
        return { id: h.id, label: text(h), members }
      }),
    }))
    .filter((g) => g.label);

  if (!groups.length) return;

  const frag = document.createDocumentFragment();
  const index = [];                       // flat list, in document order, for the spy

  groups.forEach((g) => {
    const wrap = document.createElement('div');
    wrap.className = 'doc-toc-group';
    wrap.dataset.section = g.id;

    const a = document.createElement('a');
    a.href = '#' + g.id;
    a.textContent = g.label;
    wrap.appendChild(a);
    index.push({ id: g.id, link: a, group: wrap });

    if (g.kids.length) {
      const sub = document.createElement('div');
      sub.className = 'doc-toc-sub';
      g.kids.forEach((k) => {
        const ka = document.createElement('a');
        ka.href = '#' + k.id;
        ka.textContent = k.label;
        sub.appendChild(ka);
        index.push({ id: k.id, link: ka, group: wrap });
        (k.members || []).forEach((mem) => {
          const ma = document.createElement('a');
          ma.href = '#' + mem.id;
          ma.textContent = mem.label;
          ma.className = 'doc-toc-member';
          sub.appendChild(ma);
          index.push({ id: mem.id, link: ma, group: wrap });
        });
      });
      wrap.appendChild(sub);
    }
    frag.appendChild(wrap);
  });

  nav.textContent = '';
  nav.appendChild(frag);

  // ── Its own rail ──────────────────────────────────────────────────────────
  // "On this page" used to sit under the page tree in one sidebar, which then
  // scrolled inside itself. It moves to a rail of its own on the right; below
  // 1240px the same rail folds into a bar at the top of the content that names
  // the section you are reading and opens the list.
  const layout = content.closest('.doc-layout');
  const oldHeading = nav.previousElementSibling;
  if (oldHeading && oldHeading.classList.contains('doc-toc-heading--sub')) oldHeading.remove();
  const rail = document.createElement('aside');
  rail.className = 'doc-onpage';
  rail.setAttribute('aria-label', 'On this page');
  rail.innerHTML =
    '<button type="button" class="doc-onpage-toggle" aria-expanded="false">' +
      '<span class="doc-onpage-label">On this page</span><span class="doc-onpage-now"></span>' +
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>' +
    '</button><p class="doc-toc-heading">On this page</p>';
  rail.appendChild(nav);
  const top = document.createElement('a');
  top.className = 'doc-onpage-top';
  top.href = '#main';
  top.textContent = '\u2191 Back to top';
  rail.appendChild(top);
  (layout || content.parentNode).appendChild(rail);

  const toggle = rail.querySelector('.doc-onpage-toggle');
  const now = rail.querySelector('.doc-onpage-now');
  toggle.addEventListener('click', () => {
    const open = rail.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a') && rail.classList.contains('is-open')) {
      rail.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // ── Scroll spy ────────────────────────────────────────────────────────────
  // IntersectionObserver, not a scroll listener. The doc pages set
  // `overflow: clip` on <body> for the mobile drawer's scroll lock, and that
  // stops scroll events reaching window — the previous inline spy listened on
  // window and therefore never fired. An observer watches the headings
  // themselves and is immune to however the page is scrolled.
  const targets = index
    .map((e) => ({ ...e, el: document.getElementById(e.id) }))
    .filter((e) => e.el);
  if (!targets.length) return;

  let lastLabel = null;
  // The read line sits below whatever is stuck to the top: the site nav, plus
  // the phone bar on small screens.
  const LINE = window.matchMedia('(max-width: 820px)').matches ? 172 : 130;
  const seen = new Map();          // id -> is its heading above the read line?

  function paint() {
    // The current section is the last one whose heading has passed the line.
    let current = targets[0];
    for (const t of targets) if (seen.get(t.id)) current = t;
    for (const t of targets) t.link.classList.toggle('active', t === current);
    for (const g of nav.querySelectorAll('.doc-toc-group')) {
      g.classList.toggle('is-open', g === current.group);
    }
    const g = groups.find((x) => x.id === current.group.dataset.section);
    now.textContent = g ? g.label : '';
    if (g && g.label !== lastLabel) {
      lastLabel = g.label;
      document.dispatchEvent(new CustomEvent('docs:section', { detail: g.label }));
    }
  }

  // A 1px band 130px down the viewport. A heading is "passed" once it is above
  // that band, which is what makes the highlight track reading position rather
  // than whatever happens to be largest on screen.
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      seen.set(e.target.id, e.boundingClientRect.top < LINE);
    }
    paint();
  }, { rootMargin: '-' + LINE + 'px 0px -' + Math.max(0, window.innerHeight - LINE - 1) + 'px 0px', threshold: 0 });

  targets.forEach((t) => io.observe(t.el));

  // The observer only reports on change, so seed the initial state and refresh
  // it when the page reflows (lazy images, a collapsed panel, a resize).
  function reseed() {
    for (const t of targets) seen.set(t.id, t.el.getBoundingClientRect().top < LINE);
    paint();
  }
  reseed();
  window.addEventListener('resize', reseed, { passive: true });
  window.addEventListener('load', reseed);
  document.addEventListener('scroll', reseed, { passive: true, capture: true });
})();
