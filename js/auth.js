/* DEMO authentication. Browser-only, NOT secure. Phase 10 replaces this with Supabase Auth + RLS. */
(function (w) {
  'use strict';
  var U = 'bia_users', S = 'bia_session', TTL = 2 * 3600 * 1000;

  var STUDENTS = [
    { admissionNo: 'BIA/2026/001', name: 'Chinedu Okafor', cls: 'JSS 2', session: '2026/2027', dob: '2012-03-14', gender: 'Male' },
    { admissionNo: 'BIA/2026/002', name: 'Amaka Okafor', cls: 'Primary 5', session: '2026/2027', dob: '2015-08-02', gender: 'Female' },
    { admissionNo: 'BIA/2026/003', name: 'Tunde Bello', cls: 'SSS 2', session: '2026/2027', dob: '2009-11-21', gender: 'Male' },
    { admissionNo: 'BIA/2026/004', name: 'Ngozi Eze', cls: 'JSS 2', session: '2026/2027', dob: '2012-06-09', gender: 'Female' },
    { admissionNo: 'BIA/2026/005', name: 'Ibrahim Musa', cls: 'JSS 2', session: '2026/2027', dob: '2012-01-27', gender: 'Male' }
  ];
  var TEACHERS = [
    { loginId: 'teacher@demo.com', name: 'Mrs. Adebayo', assign: [['JSS 2', 'English Language'], ['JSS 2', 'Mathematics'], ['SSS 2', 'Mathematics']] }
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

  /* Adds any missing demo accounts, so older saved data keeps working. */
  var ready = (async function () {
    var l = all(), changed = false;
    function has(id) { return l.some(function (x) { return x.loginId.toLowerCase() === id.toLowerCase(); }); }
    var hs = await hash('student123'), hp = await hash('parent123'), ht = await hash('teacher123'), ha = await hash('admin123');
    STUDENTS.forEach(function (s) { if (!has(s.admissionNo)) { l.push({ role: 'student', loginId: s.admissionNo, name: s.name, hash: hs, children: [] }); changed = true; } });
    if (!has('parent@demo.com')) { l.push({ role: 'parent', loginId: 'parent@demo.com', name: 'Mrs. Okafor', phone: '', hash: hp, children: ['BIA/2026/001', 'BIA/2026/002'] }); changed = true; }
    TEACHERS.forEach(function (t) { if (!has(t.loginId)) { l.push({ role: 'teacher', loginId: t.loginId, name: t.name, hash: ht, children: [] }); changed = true; } });
    if (!has('admin@bia.demo')) { l.push({ role: 'admin', loginId: 'admin@bia.demo', name: 'School Administrator', hash: ha, children: [] }); changed = true; }
    if (changed) put(l);
  })();

  function setSession(u) { sessionStorage.setItem(S, JSON.stringify({ role: u.role, loginId: u.loginId, name: u.name, t: Date.now() })); }
  function loginPage(role) { return role === 'teacher' ? 'teacher-login.html' : role === 'admin' ? 'admin-login.html' : 'login.html?role=' + role; }

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
      if (!c || c.role !== role) { location.replace(loginPage(role)); return null; }
      return c;
    },
    logout: function () {
      var c = Auth.current(); sessionStorage.removeItem(S);
      location.replace(c ? loginPage(c.role).split('?')[0] : 'login.html');
    },
    student: function (adm) { return STUDENTS.filter(function (s) { return s.admissionNo === adm; })[0] || null; },
    studentsIn: function (cls) { return STUDENTS.filter(function (s) { return s.cls === cls; }); },
    allStudents: function () { return STUDENTS.slice(); },
    teacher: function (loginId) { var t = TEACHERS.filter(function (x) { return x.loginId === loginId; })[0]; return t ? t.assign : []; },
    /* Account lists for the admin dashboard (never includes passwords). */
    users: function (role) {
      return all().filter(function (x) { return x.role === role; }).map(function (x) { return { loginId: x.loginId, name: x.name, phone: x.phone || '', children: x.children }; });
    },
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
