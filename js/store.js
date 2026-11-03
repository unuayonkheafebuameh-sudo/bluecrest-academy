/* Demo data layer. Stores applications in this browser only.
   Phase 10 replaces these functions with Supabase calls, so other files keep working. */
(function (w) {
  'use strict';
  var KEY = 'bia_admissions';

  function all() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); return true; } catch (e) { return false; } }
  function digits(p) { return String(p || '').replace(/\D/g, '').slice(-10); }
  function newRef() {
    var b = new Uint32Array(1); crypto.getRandomValues(b);
    return 'BIA-' + new Date().getFullYear() + '-' + String(b[0] % 1000000).padStart(6, '0');
  }

  var Store = {
    STATUSES: ['Pending', 'Under Review', 'Approved', 'Rejected', 'More Information Needed'],
    addApplication: function (data) {
      var list = all(), ref;
      do { ref = newRef(); } while (list.some(function (x) { return x.ref === ref; }));
      var now = new Date().toISOString();
      var rec = Object.assign({}, data, { ref: ref, status: 'Pending', note: '', submitted: now, updated: now });
      list.push(rec);
      return save(list) ? rec : null;
    },
    /* Needs BOTH reference and parent phone, so strangers cannot look up an application. */
    find: function (ref, phone) {
      ref = String(ref || '').trim().toUpperCase();
      return all().filter(function (x) { return x.ref === ref && digits(x.parentPhone) === digits(phone); })[0] || null;
    },
    list: all,
    updateStatus: function (ref, status, note) {
      var list = all();
      list.forEach(function (x) { if (x.ref === ref) { x.status = status; x.note = note || ''; x.updated = new Date().toISOString(); } });
      return save(list);
    }
  };
  w.BIA = w.BIA || {}; w.BIA.store = Store;
})(window);
