/* Image lightbox — the behaviour half of the .dp-lb component in css/aurora.css.
 *
 * This used to be inlined in 55 pages in two dialects (the docs pages in modern
 * syntax, the blog and use-case pages in ES5), which meant every fix had to be
 * swept across all of them and the copies drifted: one page bound a narrower
 * selector and silently left its figures unzoomable, and the five ES5 copies
 * missed the entry-point fix the other fifty got.
 *
 * Behaviour: a tap opens the image FITTED to the viewport, and a second tap
 * switches it to ACTUAL SIZE inside a stage that pans in both axes. Fitting
 * alone is close to useless on a phone — a 3360px capture at 92vw on a 375px
 * screen measured 345px against 327px inline, a 5% gain on something you
 * already could not read. Escape, the close button and a backdrop tap all
 * dismiss it.
 *
 * Loaded with `defer`, so it runs after the document is parsed and after the
 * inline script that publishes window.__scrollLock.
 */
(function () {
  'use strict';

  var lb = document.getElementById('dpLightbox');
  if (!lb) return;
  var stage = document.getElementById('dpLbStage');
  var lbImg = document.getElementById('dpLbImg');
  var lbClose = document.getElementById('dpLbClose');
  if (!stage || !lbImg || !lbClose) return;

  /* The counted lock the mobile drawer also uses, so whichever closes last does
     not clear the other's lock and leave a page that will not scroll. If the
     page never published one, do nothing rather than write body.overflow here
     and fight it. */
  var lock = window.__scrollLock || { on: function () {}, off: function () {} };

  /* A tap opens the overlay; a drag must not. A bare click listener on a large
     image counts any thumb-press the browser did not turn into a scroll as a
     tap, which is how you end up in a full-screen overlay you never asked for.
     Comparing pointerdown to click position costs nothing and keeps tap-to-zoom,
     which is what people expect from an image. */
  function tapOnly(el, fn) {
    var sx = null, sy = null;
    el.addEventListener('pointerdown', function (e) { sx = e.clientX; sy = e.clientY; }, { passive: true });
    el.addEventListener('click', function (e) {
      var dragged = sx !== null && Math.hypot(e.clientX - sx, e.clientY - sy) > 10;
      sx = null;
      if (!dragged) fn(e);
    });
  }

  function open(src) {
    lbImg.src = src.currentSrc || src.src;
    lbImg.alt = src.alt || '';
    lb.classList.add('open');
    lb.classList.remove('zoomed');   // always reopen fitted, never mid-pan
    lock.on();
    lbClose.focus();
  }

  function close() {
    if (!lb.classList.contains('open')) return;
    lb.classList.remove('open', 'zoomed');
    lock.off();
  }

  /* Every wrapper a figure is published in, across docs, blog and use-case
     pages. Listing them all here is what lets one file serve every page; a
     selector that matches nothing on a given page simply binds nothing. */
  var FIGURES = '.doc-img-card img, .doc-figure img, .blog-figure img, .uc-step-screenshot img';

  Array.prototype.forEach.call(document.querySelectorAll(FIGURES), function (img) {
    img.style.cursor = 'zoom-in';
    tapOnly(img, function () { open(img); });
  });

  tapOnly(lbImg, function () {
    /* Enter at the top-left, not the centre. Centring sounds fairer but on a
       3360x1828 capture at 375px it opens on the gutter between the titles and
       the status badges: that window measures 0.0% ink, a blank white screen
       that reads as a broken viewer. The top-left is 3.2% ink, and an interface
       reads from its top-left corner anyway — start on content, then pan. */
    if (lb.classList.toggle('zoomed')) {
      stage.scrollLeft = 0;
      stage.scrollTop = 0;
    }
  });

  lbClose.addEventListener('click', close);
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target === stage) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
})();
