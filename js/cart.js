/* ==========================================================================
   VELVET & CRUMB — cart.js
   Slide-out cart, localStorage persistence, WhatsApp checkout.
   ========================================================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'vc_cart_v1';
  var WHATSAPP_NUMBER = '233209133011';
  var items = load();
  var lastFocused = null;

  /* ---------- Storage ---------- */
  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) {}
  }

  /* ---------- Helpers ---------- */
  function findProduct(id) {
    if (!window.PRODUCTS) return null;
    return window.PRODUCTS.find(function (p) { return p.id === id; });
  }
  function formatMoney(n) {
    return '$' + n.toFixed(2);
  }
  function getCount() {
    return items.reduce(function (s, i) { return s + i.qty; }, 0);
  }
  function getSubtotal() {
    return items.reduce(function (s, i) {
      var p = findProduct(i.id);
      return s + (p ? p.price * i.qty : 0);
    }, 0);
  }

  /* ---------- Public API ---------- */
  function addItem(id, qty) {
    qty = qty || 1;
    if (!findProduct(id)) {
      console.warn('Product not found:', id);
      return;
    }
    var existing = items.find(function (i) { return i.id === id; });
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({ id: id, qty: qty });
    }
    save();
    render();
    open();
  }

  function removeItem(id) {
    items = items.filter(function (i) { return i.id !== id; });
    save();
    render();
  }

  function setQty(id, qty) {
    if (qty <= 0) return removeItem(id);
    var item = items.find(function (i) { return i.id === id; });
    if (!item) return;
    item.qty = qty;
    save();
    render();
  }

  /* ---------- Panel markup (injected once) ---------- */
  function injectPanel() {
    if (document.getElementById('cart-panel')) return;
    var html = [
      '<div class="cart-backdrop" id="cart-backdrop"></div>',
      '<aside class="cart-panel" id="cart-panel" role="dialog" aria-modal="true" aria-labelledby="cart-title">',
        '<div class="cart-panel__header">',
          '<h2 class="cart-panel__title" id="cart-title">Your Order</h2>',
          '<button type="button" class="cart-panel__close" id="cart-close" aria-label="Close cart">',
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">',
              '<path d="M6 6l12 12M18 6L6 18"/>',
            '</svg>',
          '</button>',
        '</div>',
        '<div class="cart-panel__body" id="cart-body"></div>',
        '<div class="cart-panel__footer" id="cart-footer" hidden>',
          '<div class="cart-subtotal">',
            '<span class="cart-subtotal__label">Guide total</span>',
            '<span class="cart-subtotal__value" id="cart-subtotal-value">$0.00</span>',
          '</div>',
          '<p class="cart-note">This is a guide total. We\u2019ll confirm the final total, availability, and timing on WhatsApp.</p>',
          '<fieldset class="fulfilment">',
            '<legend class="visually-hidden">Pickup or delivery</legend>',
            '<label><input type="radio" name="fulfilment" value="pickup" checked><span>Pickup</span></label>',
            '<label><input type="radio" name="fulfilment" value="delivery"><span>Delivery</span></label>',
          '</fieldset>',
          '<div class="cart-field">',
            '<label for="cart-name">Your name</label>',
            '<input type="text" id="cart-name" name="name" autocomplete="name" placeholder="e.g. Ama Mensah">',
          '</div>',
          '<div class="cart-field">',
            '<label for="cart-notes">Allergies or notes (optional)</label>',
            '<textarea id="cart-notes" name="notes" rows="2" placeholder="Anything we should know?"></textarea>',
          '</div>',
          '<button type="button" class="btn--whatsapp-full" id="send-order">',
            '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">',
              '<path d="M17.5 14.4c-.3-.2-1.8-.9-2-1s-.5-.2-.7.1-.8 1-.9 1.2-.3.2-.6.1a8 8 0 0 1-2.4-1.5 9 9 0 0 1-1.6-2c-.2-.3 0-.5.1-.6l.5-.6.3-.5v-.5l-.9-2.1c-.2-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.8.4 3.3 3.3 0 0 0-1 2.4 5.7 5.7 0 0 0 1.2 3 12.2 12.2 0 0 0 4.7 4.1 15 15 0 0 0 1.6.6 3.7 3.7 0 0 0 1.7.1 2.9 2.9 0 0 0 1.9-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.2-.3-.2-.6-.4zM12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2z"/>',
            '</svg>',
            'Send order on WhatsApp',
          '</button>',
        '</div>',
      '</aside>'
    ].join('');
    document.body.insertAdjacentHTML('beforeend', html);
  }

  /* ---------- Render ---------- */
  function render() {
    var body = document.getElementById('cart-body');
    var footer = document.getElementById('cart-footer');
    var count = getCount();

    var badge = document.getElementById('cart-count');
    var toggle = document.getElementById('cart-toggle');
    if (badge && toggle) {
      badge.textContent = count;
      badge.hidden = count === 0;
      toggle.setAttribute('aria-label',
        count === 0 ? 'Open cart, 0 items' : 'Open cart, ' + count + ' items');
    }

    if (count === 0) {
      body.innerHTML =
        '<div class="cart-empty">' +
          '<svg class="cart-empty__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/>' +
            '<path d="M2 3h3l2.4 12.2a1.8 1.8 0 0 0 1.8 1.4h8.4a1.8 1.8 0 0 0 1.8-1.4L21 7H6"/>' +
          '</svg>' +
          '<p class="cart-empty__title">Your order is empty</p>' +
          '<p class="cart-empty__text">Add something from the menu to get started.</p>' +
          '<a class="cart-empty__link" href="menu.html">Browse the menu</a>' +
        '</div>';
      footer.hidden = true;
      return;
    }

    footer.hidden = false;

    body.innerHTML = '<ul class="cart-items">' +
      items.map(function (item) {
        var p = findProduct(item.id);
        if (!p) return '';
        return '<li class="cart-item" data-id="' + p.id + '">' +
          '<img class="cart-item__image" src="' + p.image + '" alt="" loading="lazy" width="64" height="64">' +
          '<div class="cart-item__info">' +
            '<p class="cart-item__name">' + p.name + '</p>' +
            '<p class="cart-item__price">' + formatMoney(p.price) + ' each</p>' +
            '<button type="button" class="cart-item__remove" data-action="remove">Remove</button>' +
          '</div>' +
          '<div class="qty">' +
            '<button type="button" class="qty__btn" data-action="dec" aria-label="Decrease quantity of ' + p.name + '">\u2212</button>' +
            '<span class="qty__value" aria-live="polite">' + item.qty + '</span>' +
            '<button type="button" class="qty__btn" data-action="inc" aria-label="Increase quantity of ' + p.name + '">+</button>' +
          '</div>' +
        '</li>';
      }).join('') +
    '</ul>';

    document.getElementById('cart-subtotal-value').textContent = formatMoney(getSubtotal());
  }

  /* ---------- Build WhatsApp message ---------- */
  function buildMessage() {
    var nameEl = document.getElementById('cart-name');
    var notesEl = document.getElementById('cart-notes');
    var fulfilmentEl = document.querySelector('input[name="fulfilment"]:checked');
    var name = nameEl ? nameEl.value.trim() : '';
    var notes = notesEl ? notesEl.value.trim() : '';
    var fulfilment = fulfilmentEl ? fulfilmentEl.value : 'pickup';

    var lines = ['Hi Velvet & Crumb! I\u2019d like to order:', ''];
    items.forEach(function (item, idx) {
      var p = findProduct(item.id);
      if (p) {
        lines.push((idx + 1) + '. ' + p.name + ' \u00d7 ' + item.qty +
                   ' \u2014 ' + formatMoney(p.price * item.qty));
      }
    });
    lines.push('');
    lines.push('Guide total: ' + formatMoney(getSubtotal()) + ' (final total confirmed by you)');
    lines.push('');
    lines.push('Name: ' + (name || '___'));
    lines.push('Pickup or delivery: ' + (fulfilment === 'delivery' ? 'Delivery' : 'Pickup'));
    lines.push('Preferred date & time: ___');
    lines.push('Allergies or notes: ' + (notes || '___'));
    lines.push('');
    lines.push('\u2014 sent from velvetandcrumb.com');

    return lines.join('\n');
  }

  /* ---------- Open / Close ---------- */
  function open() {
    lastFocused = document.activeElement;
    var panel = document.getElementById('cart-panel');
    var backdrop = document.getElementById('cart-backdrop');
    var toggle = document.getElementById('cart-toggle');
    if (!panel) return;
    panel.classList.add('is-open');
    backdrop.classList.add('is-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      var closeBtn = document.getElementById('cart-close');
      if (closeBtn) closeBtn.focus();
    }, 50);
  }

  function close() {
    var panel = document.getElementById('cart-panel');
    var backdrop = document.getElementById('cart-backdrop');
    var toggle = document.getElementById('cart-toggle');
    if (!panel) return;
    panel.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function isOpen() {
    var panel = document.getElementById('cart-panel');
    return panel && panel.classList.contains('is-open');
  }

  /* ---------- Focus trap ---------- */
  function trapFocus(e) {
    if (e.key !== 'Tab' || !isOpen()) return;
    var panel = document.getElementById('cart-panel');
    var focusables = panel.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* ---------- Init ---------- */
  injectPanel();

  /* Delegated: cart action buttons (+ / − / Remove) */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-action]');
    if (!t) return;
    var action = t.dataset.action;
    var row = t.closest('[data-id]');
    var id = row ? row.dataset.id : null;
    if (!id) return;

    if (action === 'remove') removeItem(id);
    if (action === 'inc') {
      var it = items.find(function (i) { return i.id === id; });
      if (it) setQty(id, it.qty + 1);
    }
    if (action === 'dec') {
      var it2 = items.find(function (i) { return i.id === id; });
      if (it2) setQty(id, it2.qty - 1);
    }
  });

  /* Delegated: "Add to Cart" buttons anywhere on the page */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-add-to-cart]');
    if (!btn) return;
    var id = btn.getAttribute('data-add-to-cart');
    if (id) addItem(id, 1);
  });

  var cartToggle = document.getElementById('cart-toggle');
  var cartClose = document.getElementById('cart-close');
  var cartBackdrop = document.getElementById('cart-backdrop');
  var sendOrder = document.getElementById('send-order');

  if (cartToggle) cartToggle.addEventListener('click', open);
  if (cartClose) cartClose.addEventListener('click', close);
  if (cartBackdrop) cartBackdrop.addEventListener('click', close);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) close();
    trapFocus(e);
  });

  if (sendOrder) {
    sendOrder.addEventListener('click', function () {
      var url = 'https://wa.me/' + WHATSAPP_NUMBER +
                '?text=' + encodeURIComponent(buildMessage());
      window.open(url, '_blank', 'noopener');
    });
  }

  render();

  /* ---------- Expose to other pages / console ---------- */
  window.VC_Cart = {
    addItem: addItem,
    removeItem: removeItem,
    setQty: setQty,
    open: open,
    close: close,
    getCount: getCount,
    getSubtotal: getSubtotal
  };
})();