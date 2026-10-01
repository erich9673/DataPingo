/* Loaded only by the page that has the tutorial video
   (bulkpagecloner/guide/about-the-app). */
// Tutorial video: swap the poster for the real embed on click.
//
// Building the iframe here rather than leaving it in the HTML keeps YouTube
// off the page until someone asks for it — but it also means iubenda's
// autoblocker never sees it. The blocker rewrites embeds present at parse
// time; an element created afterwards is invisible to it. So the consent
// check below has to be done by hand, or someone who chose "Reject all"
// still gets YouTube's cookies the moment they press play.
//
// (The static embed on the bulk-copy blog post needs none of this: it IS in
// the initial HTML, so the autoblocker handles it. youtube-nocookie.com is
// on iubenda's blocked-domain list for this site.)
(function() {
  const play = document.getElementById('bpcVideoPlay');
  const host = document.getElementById('bpcVideo');
  if (!play || !host) return;

  // Purpose 3 is "Experience enhancement", where iubenda files embedded
  // video. This site runs perPurposeConsent with purposes [1, 3, 4], so a
  // visitor can accept measurement and still refuse this one.
  const VIDEO_PURPOSE = 3;

  function consented() {
    const cs = window._iub && window._iub.cs;
    // No widget (blocked, or not loaded yet) means no recorded choice —
    // treat that as "not granted" rather than assuming yes.
    if (!cs || !cs.consent) return false;
    if (cs.consent.rejected === true) return false;
    const purposes = cs.consent.purposes;
    if (purposes) return purposes[VIDEO_PURPOSE] === true;
    return cs.consent.consent === true;
  }

  function loadVideo() {
    const frame = document.createElement('iframe');
    frame.src = 'https://www.youtube-nocookie.com/embed/Ew8wpqPWk1M?autoplay=1&rel=0&modestbranding=1';
    frame.title = 'Bulk Page Cloner for Confluence — Tutorial';
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    frame.allowFullscreen = true;
    host.replaceChildren(frame);
    frame.focus();
  }

  /** Consent is missing: say why nothing happened and offer the one control
   *  that can change it. The "watch on YouTube" link under the frame stays
   *  as the way out for anyone who would rather not grant anything. */
  function askForConsent() {
    const panel = document.createElement('div');
    panel.className = 'doc-video-gate';
    panel.innerHTML =
      '<p class="doc-video-gate-title">Playing this loads YouTube</p>' +
      '<p class="doc-video-gate-sub">That means cookies from Google, which you haven\u2019t agreed to yet.</p>';
    const allow = document.createElement('button');
    allow.type = 'button';
    allow.className = 'doc-video-gate-btn';
    allow.textContent = 'Choose cookie preferences';
    allow.addEventListener('click', () => {
      const api = window._iub && window._iub.cs && window._iub.cs.api;
      if (api && api.openPreferences) api.openPreferences();
    });
    panel.appendChild(allow);
    host.replaceChildren(panel);
    allow.focus();
  }

  play.addEventListener('click', () => {
    if (consented()) loadVideo();
    else askForConsent();
  });

  // If they grant it in the preferences panel, honour the click they already
  // made instead of making them find the play button again.
  document.addEventListener('iubenda-consent-given', () => {
    if (host.querySelector('.doc-video-gate') && consented()) loadVideo();
  });
})();
