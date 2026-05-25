/**
 * COR HOMES — i18n Engine
 * 
 * Detects language from:
 *   1. URL path (/es/, /en/, /ca/)
 *   2. localStorage('corhomes-lang')
 *   3. Navigator language
 * Falls back to 'es'.
 * 
 * Populates all elements with [data-i18n] attribute.
 * Updates meta tags, lang attribute, and hreflang links.
 */

(function () {
  'use strict';

  /* ── Language detection ─────────────────────────────────── */
  const SUPPORTED = ['es', 'en', 'ca'];
  const FALLBACK = 'es';

  function detectLanguage() {
    // 1. URL path: /es/, /en/, /ca/
    const pathMatch = window.location.pathname.match(/^\/(es|en|ca)\//);
    if (pathMatch && SUPPORTED.includes(pathMatch[1])) return pathMatch[1];

    // 2. localStorage
    const stored = localStorage.getItem('corhomes-lang');
    if (stored && SUPPORTED.includes(stored)) return stored;

    // 3. Navigator
    const navLang = (navigator.language || '').slice(0, 2).toLowerCase();
    if (SUPPORTED.includes(navLang)) return navLang;

    return FALLBACK;
  }

  const LANG = detectLanguage();

  /* ── Translation getter ─────────────────────────────────── */
  function t(key) {
    return (TRANSLATIONS[LANG] && TRANSLATIONS[LANG][key]) || (TRANSLATIONS[FALLBACK] && TRANSLATIONS[FALLBACK][key]) || key;
  }

  /* ── Populate DOM ───────────────────────────────────────── */
  function populateDOM() {
    // Plain text content
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (key) {
        // Only update elements that have no child elements (text nodes)
        // or where we want to replace innerHTML
        var translation = t(key);
        if (translation) {
          el.innerHTML = translation;
        }
      }
    });

    // Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        var translation = t(key);
        if (translation) {
          el.setAttribute('placeholder', translation);
        }
      }
    });

    // Labels
    document.querySelectorAll('[data-i18n-label]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-label');
      if (key) {
        var translation = t(key);
        if (translation) {
          // For labels with asterisk elements inside, set text and keep asterisk
          var asterisk = el.querySelector('[data-i18n-asterisk]');
          if (asterisk) {
            var textNode = el.firstChild;
            if (textNode && textNode.nodeType === 3) {
              textNode.textContent = translation + ' ';
            } else {
              var newText = document.createTextNode(translation + ' ');
              el.insertBefore(newText, el.firstChild);
            }
          } else {
            el.textContent = translation;
          }
        }
      }
    });
  }

  /* ── Update meta tags ───────────────────────────────────── */
  function updateMeta() {
    // <html lang="">
    document.documentElement.lang = LANG;

    // <title>
    document.title = t('meta.title');

    // meta description
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', t('meta.description'));

    // meta keywords
    var kw = document.querySelector('meta[name="keywords"]');
    if (kw) kw.setAttribute('content', t('meta.keywords'));

    // og:title
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', t('meta.ogTitle'));

    // og:description
    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', t('meta.ogDescription'));
  }

  /* ── Update hreflang links ──────────────────────────────── */
  function updateHreflang() {
    SUPPORTED.forEach(function (l) {
      var link = document.querySelector('link[hreflang="' + l + '"]');
      if (link) {
        link.href = getLangURL(l);
      }
    });
    var xDefault = document.querySelector('link[hreflang="x-default"]');
    if (xDefault) {
      xDefault.href = getLangURL(FALLBACK);
    }
  }

  /* ── Build language URL ─────────────────────────────────── */
  function getLangURL(lang) {
    var base = window.location.origin + '/' + lang + '/';
    // Preserve hash if present
    if (window.location.hash) base += window.location.hash;
    return base;
  }

  /* ── Language switcher ──────────────────────────────────── */
  function setupLangSwitcher() {
    var switcher = document.getElementById('lang-switcher');
    if (!switcher) return;

    // Set current value
    switcher.value = LANG;

    switcher.addEventListener('change', function () {
      var newLang = this.value;
      localStorage.setItem('corhomes-lang', newLang);
      window.location.href = getLangURL(newLang);
    });
  }

  /* ── Set active lang in selector ────────────────────────── */
  function markActiveLang() {
    document.querySelectorAll('.lang-option').forEach(function (el) {
      var lang = el.getAttribute('data-lang');
      if (lang === LANG) {
        el.classList.add('lang-active');
        el.setAttribute('aria-current', 'page');
      } else {
        el.classList.remove('lang-active');
        el.removeAttribute('aria-current');
      }
    });
  }

  /* ── Init ───────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    populateDOM();
    updateMeta();
    updateHreflang();
    setupLangSwitcher();
    markActiveLang();
  });

  // Expose for debugging
  window.CORHOMES = window.CORHOMES || {};
  window.CORHOMES.lang = LANG;
  window.CORHOMES.t = t;

})();