/* ── Site chrome ──────────────────────────────────────────────────────────────
   Navbar scroll state, the mobile drawer, the shared scroll lock, scroll-reveal,
   and the footer newsletter form. Every page loads this at the end of <body>,
   where the same code used to be inlined into each page (70+ copies).

   It is a classic script on purpose: its top-level consts (navbar, scrollLock,
   io, …) stay visible to the page-specific inline script that follows it, as
   they were when it was all one block. Do not add `defer` or `type=module`.
   ────────────────────────────────────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 24), { passive: true });

const mobileMenu = document.getElementById('mobileMenu');
const toggle = document.getElementById('mobileMenuToggle');
const closeBtn = document.getElementById('mobileMenuClose');
/* One shared scroll lock, counted. The drawer and the image overlay each used
   to write document.body.style.overflow directly, so whichever closed last
   cleared the other's lock — and a lock left set with nothing open is a page
   that simply will not scroll, with no visible reason why. Counting means the
   last one out turns the light off. */
const scrollLock = window.__scrollLock || (window.__scrollLock = (function () {
  var n = 0;
  return {
    on:    function () { if (++n === 1) document.body.style.overflow = 'hidden'; },
    off:   function () { if (n > 0 && --n === 0) document.body.style.overflow = ''; },
    clear: function () { n = 0; document.body.style.overflow = ''; }
  };
})());

/* Guarded so a second open (or a close on an already-closed menu) cannot
   push the lock count out of step. */
const openMenu = () => {
  if (mobileMenu.classList.contains('open')) return;
  mobileMenu.classList.add('open'); toggle.setAttribute('aria-expanded','true');
  scrollLock.on(); closeBtn.focus();
};
const closeMenu = () => {
  if (!mobileMenu.classList.contains('open')) return;
  mobileMenu.classList.remove('open'); toggle.setAttribute('aria-expanded','false');
  scrollLock.off(); toggle.focus();
};
/* The hamburger was wired open-only, so tapping it again re-ran openMenu
   instead of closing. */
toggle.addEventListener('click', () => {
  mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
});
closeBtn.addEventListener('click', closeMenu);
/* A bfcache restore (phone back button) can come back with the drawer shut but
   the lock still applied, which reads as a frozen page. */
window.addEventListener('pageshow', e => { if (e.persisted && !mobileMenu.classList.contains('open')) scrollLock.clear(); });
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key==='Escape' && mobileMenu.classList.contains('open')) closeMenu(); });
mobileMenu.addEventListener('click', e => { if (e.target === mobileMenu) closeMenu(); });

const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } }), { threshold: 0.1, rootMargin:'0px 0px -36px 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* Record the newsletter opt-in in iubenda's Consent Database.
   Only on success, and only for the address that actually subscribed — a
   failed POST is not a consent. The script is fetched at that moment rather
   than on every page load, so the 99% of visitors who never subscribe pay
   nothing for it and iubenda sees nobody who did not opt in.
   The proof stores the exact sentence shown next to the button, so the
   record says what the person actually agreed to rather than just when. */
function logNewsletterConsent(email, formEl) {
  var notice = formEl.querySelector('.newsletter-consent');
  window._iub = window._iub || {};
  _iub.cons_instructions = _iub.cons_instructions || [];
  _iub.cons_instructions.push(['init', { api_key: 'GxQD0ZooU505v0e0bLNU9ISNzHeqimAy' }]);
  _iub.cons_instructions.push(['submit', {
    consent: {
      subject: { email: email },
      legal_notices: [{ identifier: 'privacy_policy' }],
      preferences: { newsletter: true },
      proofs: [{
        content: JSON.stringify({ email: email, source: location.pathname }),
        form: (notice ? notice.textContent.trim() : '') + ' [Subscribe]'
      }]
    }
  }]);
  if (!document.getElementById('iub-cons')) {
    var s = document.createElement('script');
    s.id = 'iub-cons';
    s.async = true;
    s.src = 'https://cdn.iubenda.com/cons/iubenda_cons.js';
    document.head.appendChild(s);
  }
}

document.getElementById('footer-email-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const btn = this.querySelector('button[type=submit]');
  const msg = document.getElementById('form-message');
  const input = this.querySelector('input[type=email]');
  if (!input.checkValidity()) { msg.style.color='#F87171'; msg.textContent='Please enter a valid email.'; return; }
  const email = input.value.trim();
  btn.disabled = true; btn.textContent = 'Sending…'; msg.textContent = '';
  fetch(this.action, { method:'POST', body:new FormData(this), headers:{Accept:'application/json'} })
    .then(r => { if (!r.ok) throw 0; logNewsletterConsent(email, this); if (window.dpTrack) dpTrack('generate_lead', { form_name: 'newsletter' }); msg.style.color='#67E8F9'; msg.textContent='Almost there — check your inbox to confirm.'; input.value=''; setTimeout(()=>{btn.disabled=false;btn.textContent='Subscribe';},3000); })
    .catch(()=>{ msg.style.color='#F87171'; msg.textContent='Something went wrong — try again.'; btn.disabled=false; btn.textContent='Subscribe'; });
});

/*
 * Cloudflare Turnstile CAPTCHA on every form that posts to DPMT (newsletter,
 * contact, partner). Added 2026-10-19 after a bot driving a real browser here
 * sent 140 newsletter confirmation emails to people who never signed up.
 * Usually invisible: Cloudflare only shows a box when it wants a click. The
 * widget adds a hidden `cf-turnstile-response` input, so each form's existing
 * `new FormData(form)` sends the token with no other change.
 */
(function () {
  var SITE_KEY = '0x4AAAAAAFbn1cjaYuarRmBB';
  if (!SITE_KEY) return;
  var forms = [].slice.call(document.querySelectorAll('#footer-email-form, #contact-form, #partner-form'));
  if (!forms.length) return;
  var slots = forms.map(function (form) {
    var el = document.createElement('div');
    el.className = 'dp-turnstile';
    el.style.margin = '8px 0 0';
    var submit = form.querySelector('button[type=submit]');
    var row = submit && submit.closest('.newsletter-row');
    // Below the button row in the footer, so the email field and button stay side by side.
    if (row && row.parentNode === form) form.insertBefore(el, row.nextSibling);
    else if (submit && submit.parentNode) submit.parentNode.insertBefore(el, submit);
    else form.appendChild(el);
    return { form: form, el: el, id: null };
  });
  window.dpTurnstileReady = function () {
    slots.forEach(function (s) {
      s.id = window.turnstile.render(s.el, { sitekey: SITE_KEY, appearance: 'interaction-only' });
      // Tokens are single-use: fetch a fresh one shortly after each send.
      s.form.addEventListener('submit', function () {
        setTimeout(function () { if (s.id !== null) window.turnstile.reset(s.id); }, 2500);
      });
    });
  };
  var sc = document.createElement('script');
  sc.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=dpTurnstileReady';
  sc.async = true;
  sc.defer = true;
  document.head.appendChild(sc);
})();
