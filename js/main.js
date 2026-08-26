/**
 * The Reindeer Hoveringham — main.js v1.0
 * Modus Media
 *
 * 1. Mobile navigation
 * 2. Scroll-based nav state
 * 3. Scroll reveal (IntersectionObserver)
 * 4. Newsletter form (Netlify)
 * 5. Footer year
 * 8. Site settings (CMS-driven: footer, homepage hero, gift voucher link)
 */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     HELPERS
  ---------------------------------------------------------- */

  function $(selector, context) {
    return (context || document).querySelector(selector);
  }

  function $$(selector, context) {
    return Array.from((context || document).querySelectorAll(selector));
  }

  function onReady(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  /* Respect prefers-reduced-motion for JS-driven animations */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ----------------------------------------------------------
     1. MOBILE NAVIGATION
  ---------------------------------------------------------- */

  function initMobileNav() {
    var toggle  = $('#nav-toggle');
    var drawer  = $('#nav-drawer');
    var navLinks = $$('#nav-drawer a');

    if (!toggle || !drawer) return;

    function openDrawer() {
      toggle.setAttribute('aria-expanded', 'true');
      drawer.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      /* Focus first link for keyboard users */
      var firstLink = $('a', drawer);
      if (firstLink) firstLink.focus();
    }

    function closeDrawer() {
      toggle.setAttribute('aria-expanded', 'false');
      drawer.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    /* Close when a nav link is clicked */
    navLinks.forEach(function (link) {
      link.addEventListener('click', closeDrawer);
    });

    /* Close on Escape key */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        closeDrawer();
        toggle.focus();
      }
    });

    /* Close if viewport resizes past mobile breakpoint */
    var mql = window.matchMedia('(min-width: 1024px)');
    mql.addEventListener('change', function (e) {
      if (e.matches) closeDrawer();
    });
  }


  /* ----------------------------------------------------------
     2. DROPDOWN NAVIGATION
  ---------------------------------------------------------- */

  function initDropdownNav() {
    var items = $$('.nav__item--has-dropdown');
    if (!items.length) return;

    function closeAll(except) {
      items.forEach(function (item) {
        if (item === except) return;
        item.classList.remove('nav__item--open');
        var btn = $('[aria-expanded]', item);
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    }

    items.forEach(function (item) {
      var btn = $('[aria-expanded]', item);
      if (!btn) return;

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = item.classList.contains('nav__item--open');
        closeAll();
        if (!isOpen) {
          item.classList.add('nav__item--open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    /* Close on click outside */
    document.addEventListener('click', function () { closeAll(); });

    /* Close on Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAll();
    });

    /* Close when viewport goes mobile */
    var mql = window.matchMedia('(max-width: 1023px)');
    mql.addEventListener('change', function (e) {
      if (e.matches) closeAll();
    });
  }


  /* ----------------------------------------------------------
     3. SCROLL-BASED NAV STATE
  ---------------------------------------------------------- */

  function initNavScroll() {
    var nav = $('.site-nav');
    if (!nav) return;

    var scrollThreshold = 60;
    var ticking = false;

    function updateNav() {
      if (window.scrollY > scrollThreshold) {
        nav.classList.add('is-scrolled');
      } else {
        nav.classList.remove('is-scrolled');
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateNav);
        ticking = true;
      }
    }, { passive: true });
  }


  /* ----------------------------------------------------------
     3. SCROLL REVEAL
  ---------------------------------------------------------- */

  function initScrollReveal() {
    /* Skip animation if user prefers reduced motion */
    if (prefersReducedMotion) {
      $$('.reveal').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var elements = $$('.reveal');
    if (!elements.length || !window.IntersectionObserver) {
      /* Fallback: show all immediately */
      elements.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }


  /* ----------------------------------------------------------
     4. NEWSLETTER FORM (Netlify Forms)
  ---------------------------------------------------------- */

  function initNewsletterForm() {
    var form    = $('#newsletter-form');
    var success = $('#newsletter-success');

    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var data     = new FormData(form);
      var encoded  = new URLSearchParams(data).toString();

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encoded
      })
        .then(function (response) {
          if (response.ok) {
            form.style.display = 'none';
            if (success) {
              success.classList.add('is-visible');
              success.focus();
            }
          } else {
            alert('Something went wrong. Please try again or email us directly.');
          }
        })
        .catch(function () {
          alert('Something went wrong. Please check your connection and try again.');
        });
    });

    /* Footer signup form (duplicate of newsletter) */
    var footerForm    = $('#footer-signup-form');
    var footerSuccess = $('#footer-signup-success');

    if (!footerForm) return;

    footerForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var data    = new FormData(footerForm);
      var encoded = new URLSearchParams(data).toString();

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encoded
      })
        .then(function (response) {
          if (response.ok) {
            footerForm.style.display = 'none';
            if (footerSuccess) {
              footerSuccess.classList.add('is-visible');
            }
          }
        })
        .catch(function () {});
    });
  }


  /* ----------------------------------------------------------
     5. FOOTER COPYRIGHT YEAR
  ---------------------------------------------------------- */

  function initFooterYear() {
    $$('.js-year').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }


  /* ----------------------------------------------------------
     6. CURTAIN INTRO
  ---------------------------------------------------------- */

  function initCurtain() {
    var ci      = document.getElementById('curtain-intro');
    var enterBtn = document.getElementById('ci-enter');
    if (!ci || !enterBtn) return;

    // Hold scroll until curtain is dismissed
    document.body.style.overflow = 'hidden';

    function openCurtain() {
      if (ci.classList.contains('is-opening')) return;
      ci.classList.add('is-opening');
      enterBtn.disabled = true;

      // Remove scroll listeners once triggered
      window.removeEventListener('wheel',     onWheel,     { passive: false });
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove',  onTouchMove, { passive: false });

      setTimeout(function () { ci.classList.add('is-done'); },    2350);
      setTimeout(function () {
        ci.classList.add('is-gone');
        document.body.style.overflow = '';
      }, 2750);
    }

    // Scroll down (wheel) triggers open
    function onWheel(e) {
      if (e.deltaY > 0) { e.preventDefault(); openCurtain(); }
    }
    window.addEventListener('wheel', onWheel, { passive: false });

    // Touch: swipe up triggers open
    var touchY = 0;
    function onTouchStart(e) { touchY = e.touches[0].clientY; }
    function onTouchMove(e) {
      if (touchY - e.touches[0].clientY > 30) { e.preventDefault(); openCurtain(); }
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove',  onTouchMove,  { passive: false });

    // Keep Enter button as fallback
    enterBtn.addEventListener('click', openCurtain);
  }


  /* ----------------------------------------------------------
     7. COOKIE CONSENT & ANALYTICS
  ---------------------------------------------------------- */

  var GA_MEASUREMENT_ID = 'G-ZFV9DXLD3Q';
  var CONSENT_KEY = 'reindeer_cookie_consent';

  function loadAnalytics() {
    if (window.__gaLoaded) return;
    window.__gaLoaded = true;

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID);
  }

  function initCookieConsent() {
    var consent = null;
    try {
      consent = window.localStorage.getItem(CONSENT_KEY);
    } catch (e) { /* localStorage unavailable — treat as no choice made */ }

    if (consent === 'accepted') {
      loadAnalytics();
      return;
    }
    if (consent === 'declined') {
      return;
    }

    /* No choice recorded yet — show the banner */
    var banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML =
      '<div class="cookie-banner__inner">' +
        '<p class="cookie-banner__text">A single analytics cookie helps us understand which pages are useful. No ads, no data sold, no tracking beyond this site. Your choice either way, the site works the same. <a href="/cookie-policy/" class="cookie-banner__link">Cookie Policy</a></p>' +
        '<div class="cookie-banner__actions">' +
          '<button type="button" class="cookie-banner__decline">Decline</button>' +
          '<button type="button" class="cookie-banner__accept">Accept</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(banner);

    /* Double rAF so the initial transform is painted before transitioning in */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        banner.classList.add('is-visible');
      });
    });

    function setConsent(value) {
      try { window.localStorage.setItem(CONSENT_KEY, value); } catch (e) {}
      banner.classList.remove('is-visible');
      setTimeout(function () {
        if (banner.parentNode) banner.parentNode.removeChild(banner);
      }, 450);
    }

    $('.cookie-banner__accept', banner).addEventListener('click', function () {
      setConsent('accepted');
      loadAnalytics();
    });

    $('.cookie-banner__decline', banner).addEventListener('click', function () {
      setConsent('declined');
    });
  }


  /* ----------------------------------------------------------
     8. SITE SETTINGS (CMS-driven)
     Populates the footer, homepage hero, and gift voucher button
     from /_data/site-settings.json (Decap CMS: Site Settings).
     Targets elements via [data-site-text] / [data-site-href], so
     new fields can be wired up later just by adding an attribute
     and a JSON key, no JS changes required. Falls back silently
     to the static HTML already on the page if the fetch fails.
  ---------------------------------------------------------- */

  function applySiteSettings(data) {
    if (!data) return;

    $$('[data-site-text]').forEach(function (el) {
      var key = el.getAttribute('data-site-text');
      if (typeof data[key] === 'string') el.textContent = data[key];
    });

    $$('[data-site-href]').forEach(function (el) {
      var key = el.getAttribute('data-site-href');
      if (typeof data[key] === 'string') el.href = data[key];
    });

    if (Array.isArray(data.hours) && data.hours.length) {
      $$('.footer__hours').forEach(function (list) {
        var frag = document.createDocumentFragment();
        data.hours.forEach(function (h) {
          if (!h || !h.line) return;
          var li = document.createElement('li');
          li.textContent = h.line;
          frag.appendChild(li);
        });
        if (data.hours_note) {
          var note = document.createElement('li');
          note.className = 'footer__hours-note';
          note.textContent = data.hours_note;
          frag.appendChild(note);
        }
        list.innerHTML = '';
        list.appendChild(frag);
      });
    }
  }

  function initSiteSettings() {
    fetch('/_data/site-settings.json?t=' + Date.now())
      .then(function (r) { if (!r.ok) throw new Error('fetch failed'); return r.json(); })
      .then(applySiteSettings)
      .catch(function () { /* keep the static fallback content already in the page */ });
  }


  /* ----------------------------------------------------------
     INIT
  ---------------------------------------------------------- */

  onReady(function () {
    initCurtain();
    initMobileNav();
    initDropdownNav();
    initNavScroll();
    initScrollReveal();
    initNewsletterForm();
    initFooterYear();
    initCookieConsent();
    initSiteSettings();
  });

}());
