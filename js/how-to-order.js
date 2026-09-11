/* ==========================================================================
   VELVET & CRUMB — how-to-order.js
   Copy-to-clipboard for the WhatsApp number fallback.
   ========================================================================== */

(function () {
  'use strict';

  var btn = document.getElementById('copy-number');
  if (!btn) return;

  var label = document.getElementById('copy-number-label');
  var originalText = label.textContent;

  btn.addEventListener('click', function () {
    var number = btn.dataset.number;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(number).then(function () {
        showCopied();
      }).catch(function () {
        fallbackCopy(number);
      });
    } else {
      fallbackCopy(number);
    }
  });

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showCopied(); } catch (e) {}
    document.body.removeChild(ta);
  }

  function showCopied() {
    label.textContent = 'Copied!';
    btn.disabled = true;
    setTimeout(function () {
      label.textContent = originalText;
      btn.disabled = false;
    }, 2000);
  }
})();