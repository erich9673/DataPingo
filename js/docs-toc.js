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

  const seen = new Map();          // id -> is its heading above the read line?

  function paint() {
    // The current section is the last one whose heading has passed the line.
    let current = targets[0];
    for (const t of targets) if (seen.get(t.id)) current = t;
    for (const t of targets) t.link.classList.toggle('active', t === current);
    for (const g of nav.querySelectorAll('.doc-toc-group')) {
      g.classList.toggle('is-open', g === current.group);
    }
  }

  // A 1px band 130px down the viewport. A heading is "passed" once it is above
  // that band, which is what makes the highlight track reading position rather
  // than whatever happens to be largest on screen.
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      seen.set(e.target.id, e.boundingClientRect.top < 130);
    }
    paint();
  }, { rootMargin: '-130px 0px -' + Math.max(0, window.innerHeight - 131) + 'px 0px', threshold: 0 });

  targets.forEach((t) => io.observe(t.el));

  // The observer only reports on change, so seed the initial state and refresh
  // it when the page reflows (lazy images, a collapsed panel, a resize).
  function reseed() {
    for (const t of targets) seen.set(t.id, t.el.getBoundingClientRect().top < 130);
    paint();
  }
  reseed();
  window.addEventListener('resize', reseed, { passive: true });
  window.addEventListener('load', reseed);
  document.addEventListener('scroll', reseed, { passive: true, capture: true });
})();
