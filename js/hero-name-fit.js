/* Product hero: start the app name flush with the text inside the first badge
   pill rather than the pill's rounded outer edge (Eric, 2026-11-11). Size is a
   fixed 25px in css/product-page.css. When the badges wrap (phones), the name
   keeps its normal position. */
(function () {
  var name = document.querySelector('.product-hero-name');
  var badges = document.querySelector('.product-hero-id .product-hero-badges');
  if (!name || !badges) return;

  function fit() {
    name.style.marginLeft = '';
    var first = badges.firstElementChild;
    var oneRow = first && Array.prototype.every.call(badges.children, function (b) {
      return Math.abs(b.offsetTop - first.offsetTop) < 4;
    });
    if (!oneRow) return;
    // Inset to the badges' content edges, not their rounded outer edges, so the
    // name sits flush with what's inside the two pills (Eric, 2026-11-11).
    var firstCs = getComputedStyle(first);
    var inL = parseFloat(firstCs.paddingLeft) + parseFloat(firstCs.borderLeftWidth);
    name.style.marginLeft = inL + 'px';
  }

  fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  var t;
  window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(fit, 100); });
})();
