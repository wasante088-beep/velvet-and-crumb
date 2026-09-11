/* ==========================================================================
   VELVET & CRUMB — main.js
   Section 1: Header interactions
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- Sticky header shadow on scroll ---------- */
  const header = document.getElementById('site-header');
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        header.classList.toggle('is-scrolled', window.scrollY > 12);
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const toggle = document.getElementById('menu-toggle');
  const nav    = document.getElementById('primary-nav');

  function closeMenu() {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  function openMenu() {
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
  }

  toggle.addEventListener('click', function () {
    nav.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  /* Escape closes the menu and returns focus to the toggle */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      closeMenu();
      toggle.focus();
    }
  });

  /* Close when a nav link is chosen */
  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* Close when resizing up to desktop */
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900) closeMenu();
  });
    /* ---------- Highlight today's opening hours ---------- */
  var todayNum = new Date().getDay(); /* 0 = Sunday, 6 = Saturday */
  document.querySelectorAll('.visit__hours-row, .contact-visit__hours-row').forEach(function (row) {
    var days = (row.dataset.days || '').split(',').map(Number);
    if (days.indexOf(todayNum) !== -1) {
      row.classList.add('is-today');
    }
  });
  
    /* ---------- Auto-update the footer year ---------- */
  var yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();