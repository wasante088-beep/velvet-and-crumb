/* ==========================================================================
   VELVET & CRUMB — menu.js
   Category filter with URL hash support.
   ========================================================================== */

(function () {
  'use strict';

  var KNOWN_FILTERS = ['all', 'viennoiserie', 'tarts', 'macarons', 'cakes', 'espresso'];
  var pills = document.querySelectorAll('.filter-pill');
  var cards = document.querySelectorAll('#menu-grid .product-card');
  var countEl = document.getElementById('filter-count');
  var grid = document.getElementById('menu-grid');

  if (!pills.length || !cards.length) return;

  function applyFilter(filter) {
    var visible = 0;

    pills.forEach(function (pill) {
      var isActive = pill.dataset.filter === filter;
      pill.classList.toggle('is-active', isActive);
      pill.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    cards.forEach(function (card) {
      var match = filter === 'all' || card.dataset.category === filter;
      card.hidden = !match;
      if (match) visible++;
    });

    if (countEl) countEl.textContent = visible;

    /* Update URL hash for shareability (but not for 'all') */
    if (filter === 'all') {
      history.replaceState(null, '', location.pathname + location.search);
    } else {
      history.replaceState(null, '', '#' + filter);
    }
  }

  /* Pill clicks */
  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      applyFilter(pill.dataset.filter);
    });
  });

  /* Hash on load — only if it matches a known filter */
  function applyFromHash() {
    var hash = (location.hash || '').replace('#', '');
    if (KNOWN_FILTERS.indexOf(hash) !== -1) {
      applyFilter(hash);
    }
  }

  /* Hash changes on same page (e.g. clicking an allergen anchor) */
  window.addEventListener('hashchange', function () {
    var hash = (location.hash || '').replace('#', '');
    if (KNOWN_FILTERS.indexOf(hash) !== -1) {
      applyFilter(hash);
    }
    /* Do nothing if the hash isn't a filter — let the browser handle anchor scroll */
  });

  applyFromHash();
})();