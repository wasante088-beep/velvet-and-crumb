/* ==========================================================================
   VELVET & CRUMB — enquiry.js
   Custom cake enquiry form. Builds a WhatsApp message from the form fields.
   ========================================================================== */

(function () {
  'use strict';

  var form = document.getElementById('cake-enquiry-form');
  if (!form) return;

  var errEl = document.getElementById('enq-error');
  var WHATSAPP = '233209133011';

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name        = document.getElementById('enq-name').value.trim();
    var occasion    = document.getElementById('enq-occasion').value;
    var date        = document.getElementById('enq-date').value;
    var servings    = document.getElementById('enq-servings').value.trim();
    var budget      = document.getElementById('enq-budget').value;
    var description = document.getElementById('enq-description').value.trim();

    /* Required fields */
    if (!name || !occasion || !description) {
      errEl.hidden = false;
      errEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    errEl.hidden = true;

    /* Build message */
    var lines = [
      'Hi Velvet & Crumb! I\u2019d like to enquire about a custom cake.',
      '',
      'Name: ' + name,
      'Occasion: ' + occasion
    ];

    if (date)     lines.push('Date needed: ' + date);
    if (servings) lines.push('Servings: ' + servings);
    if (budget)   lines.push('Budget range: ' + budget);

    lines.push('');
    lines.push('Description:');
    lines.push(description);
    lines.push('');
    lines.push('\u2014 sent from velvetandcrumb.com');

    var url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n'));
    window.open(url, '_blank', 'noopener');
  });
})();