/* ==========================================================================
   VELVET & CRUMB — contact.js
   Contact form. Builds a WhatsApp message from the form fields.
   ========================================================================== */

(function () {
  'use strict';

  var form = document.getElementById('contact-form');
  if (!form) return;

  var errEl = document.getElementById('contact-error');
  var WHATSAPP = '233209133011';

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name    = document.getElementById('contact-name').value.trim();
    var reason  = document.getElementById('contact-reason').value;
    var contact = document.getElementById('contact-contact').value.trim();
    var message = document.getElementById('contact-message').value.trim();

    if (!name || !reason || !message) {
      errEl.hidden = false;
      errEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    errEl.hidden = true;

    var lines = [
      'Hi Velvet & Crumb! I\u2019m getting in touch.',
      '',
      'Name: ' + name,
      'Reason: ' + reason
    ];

    if (contact) lines.push('Contact: ' + contact);

    lines.push('');
    lines.push('Message:');
    lines.push(message);
    lines.push('');
    lines.push('\u2014 sent from velvetandcrumb.com');

    var url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n'));
    window.open(url, '_blank', 'noopener');
  });
})();