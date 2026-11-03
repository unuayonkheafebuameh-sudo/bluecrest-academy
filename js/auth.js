/* DEMO authentication. Browser-only, NOT secure. Phase 10 replaces this with Supabase Auth + RLS. */
(function (w) {
  'use strict';
  var U = 'bia_users', S = 'bia_session', TTL = 2 * 3600 * 1000;

  var STUDENTS = [
    { admissionNo: 'BIA/2026/001', name: 'Chinedu Okafor', cls: 'JSS 2', session: '2026/2027', dob: '2012-03-14', gender: 'Male' },
    { admissionNo: 'BIA/2026/002', name: 'Amaka Okafor', cls: 'Primary 5', session: '2026/2027', dob: '2015-08-02', gender: 'Female' },
    { admissionNo: 'BIA/2026/003', name: 'Tunde Bello', cls: 'SSS 2', session: '2026/2027', dob: '2009-11-21', gender: 'Male' }
  ];

  function all() { try { return JSON.parse(localStorage.getItem(U)) || []; } catch (e) { return []; } }
  function put(l) { try { localStorage.setItem(U, JSON.stringify(l)); return true; } catch (e) { return false; } }

  async function hash(p) {
    if (w.crypto && crypto.subtle) {
      var b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('bia:' + p));
      return Array.from(new Uint8Array(b)).map(function (x) { return x.toString(16).padStart(2, '0'); }).join('');
    }
    return 'x' + btoa('bia:' + p);
  }

  var ready = (async function () {
    if (all().length) return;
    var l = [], h = await hash('student123');
    STUDENTS.forEach(function (s) { l.push({ role: 'student', loginId: s.admissionNo, name: s.name, hash: h, children: [] }); });
    l.push({ role: 'parent', loginId: 'parent@demo.com', name: 'Mrs. Okafor', phone: '', hash: await hash('parent123'), children: ['BIA/2026/001', 'BIA/2026/002'] });
    put(l);
  })();

  function setSession(u) { sessionStorage.setItem(S, JSON.stringify({ role: u.role, loginId: u.loginId, name: u.name, t: Date.now() })); }

  var Auth = {
    login: async function (role, id, pw) {
      await ready;
      var h = await hash(pw), key = String(id).trim().toLowerCase();
      var u = all().filter(function (x) { return x.role === role && x.loginId.toLowerCase() === key && x.hash === h; })[0];
      if (!u) return null;
      setSession(u); return u;
    },
    registerParent: async function (name, email, phone, pw) {
      await ready;
      var l = all(), key = email.trim().toLowerCase();
      if (l.some(function (x) { return x.loginId.toLowerCase() === key; })) return { error: 'An account with this email already exists.' };
      var u = { role: 'parent', loginId: key, name: name.trim(), phone: phone.trim(), hash: await hash(pw), children: [] };
      l.push(u);
      if (!put(l)) return { error: 'Could not save. Free some browser storage.' };
      setSession(u); return { ok: true };
    },
    current: function () {
      try {
        var s = JSON.parse(sessionStorage.getItem(S));
        if (s && Date.now() - s.t < TTL) return s;
      } catch (e) {}
      sessionStorage.removeItem(S); return null;
    },
    require: function (role) {
      var c = Auth.current();
      if (!c || c.role !== role) { location.replace('login.html?role=' + role); return null; }
      return c;
    },
    logout: function () { sessionStorage.removeItem(S); location.replace('login.html'); },
    student: function (adm) { return STUDENTS.filter(function (s) { return s.admissionNo === adm; })[0] || null; },
    children: function (loginId) {
      var u = all().filter(function (x) { return x.loginId === loginId; })[0];
      return u ? u.children.map(Auth.student).filter(Boolean) : [];
    },
    /* A parent can only link a child by proving both admission number and date of birth. */
    linkChild: function (loginId, adm, dob) {
      var s = Auth.student(String(adm).trim().toUpperCase());
      if (!s || s.dob !== dob) return { error: 'No student matches those details.' };
      var l = all(), u = l.filter(function (x) { return x.loginId === loginId && x.role === 'parent'; })[0];
      if (!u) return { error: 'Parent account not found.' };
      if (u.children.indexOf(s.admissionNo) > -1) return { error: 'This child is already linked.' };
      u.children.push(s.admissionNo); put(l); return { ok: true, name: s.name };
    }
  };
  w.BIA = w.BIA || {}; w.BIA.auth = Auth;
})(window);
