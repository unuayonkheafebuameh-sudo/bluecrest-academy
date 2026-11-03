/* Complaints data layer (DEMO: browser storage). Phase 10 moves this to Supabase with Row Level Security. */
(function (w) {
  'use strict';
  var KEY = 'bia_complaints';
  var TYPES = ['Complaint', 'Suggestion', 'Academic concern', 'Teacher-related complaint', 'Transportation complaint', 'School facility complaint', 'General enquiry'];
  var STATUSES = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];

  function rd() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function wr(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function newRef() { var b = new Uint32Array(2); crypto.getRandomValues(b); return 'CMP-' + new Date().getFullYear() + '-' + String((b[0] * 4096 + b[1]) % 100000000).padStart(8, '0'); }
  function norm(c) { c = String(c || '').trim().toLowerCase(); return c.indexOf('@') > -1 ? c : c.replace(/\D/g, '').slice(-10); }
  function validContact(c) { c = c.trim(); return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c) || /^(\+?234|0)[789]\d{9}$/.test(c.replace(/[\s-]/g, '')); }

  var C = {
    TYPES: TYPES, STATUSES: STATUSES,
    add: function (d) {
      if (TYPES.indexOf(d.type) < 0) return { error: 'Choose a category.' };
      var subject = String(d.subject || '').trim(), message = String(d.message || '').trim();
      if (subject.length < 3 || subject.length > 120) return { error: 'Enter a subject (3 to 120 characters).' };
      if (message.length < 10 || message.length > 3000) return { error: 'Describe the matter in 10 to 3000 characters.' };
      var name = '', contact = '';
      if (!d.anonymous) {
        name = String(d.name || '').trim(); contact = String(d.contact || '').trim();
        if (name.length < 3) return { error: 'Enter your name, or choose to submit anonymously.' };
        if (!validContact(contact)) return { error: 'Enter a valid email address or Nigerian phone number.' };
      }
      var list = rd(), ref; do { ref = newRef(); } while (list.some(function (x) { return x.ref === ref; }));
      var now = new Date().toISOString();
      var rec = { ref: ref, type: d.type, subject: subject, message: message, anonymous: !!d.anonymous, name: name, contact: contact, status: 'Submitted', response: '', submitted: now, updated: now };
      list.push(rec);
      return wr(list) ? { ok: true, rec: rec } : { error: 'Could not save. Free some browser storage.' };
    },
    /* Named submitters need reference AND contact. Anonymous ones can only be found by the reference, which acts as their secret. */
    find: function (ref, contact) {
      var r = rd().filter(function (x) { return x.ref === String(ref || '').trim().toUpperCase(); })[0];
      if (!r) return null;
      if (r.anonymous) return r;
      return norm(contact) && norm(contact) === norm(r.contact) ? r : null;
    },
    /* For the Phase 9 admin dashboard. */
    list: rd,
    respond: function (ref, status, response) {
      if (STATUSES.indexOf(status) < 0) return false;
      var l = rd(); l.forEach(function (x) { if (x.ref === ref) { x.status = status; x.response = String(response || '').trim().slice(0, 2000); x.updated = new Date().toISOString(); } });
      return wr(l);
    }
  };
  w.BIA = w.BIA || {}; w.BIA.cmp = C;
})(window);
