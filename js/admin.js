/* Admin data layer and section registry (DEMO: browser storage). Phase 10 moves this to Supabase,
   where admin-only Row Level Security rules protect it on the server. */
(function (w) {
  'use strict';
  var A = { sections: [] };
  function rd(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function wr(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  A.rd = rd; A.wr = wr;
  A.add = function (s) { A.sections.push(s); };
  A.esc = function (t) { var d = document.createElement('div'); d.textContent = t == null ? '' : t; return d.innerHTML; };
  A.dt = function (i) { return new Date(i).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); };
  A.naira = function (n) { return '₦' + Number(n).toLocaleString('en-NG'); };
  A.remove = function (key, field, val) { return wr(key, rd(key, []).filter(function (x) { return x[field] !== val; })); };

  A.stats = function () {
    var Au = BIA.auth, P = BIA.pay, students = Au.allStudents(), out = 0;
    var collected = rd('bia_payments', []).reduce(function (s, p) { return s + p.amount; }, 0);
    students.forEach(function (s) { P.statement(s.admissionNo, s.cls).forEach(function (i) { out += i.balance; }); });
    return {
      students: students.length, teachers: Au.users('teacher').length, parents: Au.users('parent').length,
      pendingAdm: rd('bia_admissions', []).filter(function (x) { return x.status === 'Pending'; }).length,
      collected: collected, outstanding: out,
      openCmp: rd('bia_complaints', []).filter(function (x) { return x.status !== 'Resolved'; }).length
    };
  };
  A.activity = function () {
    var a = [];
    rd('bia_admissions', []).forEach(function (x) { a.push({ d: x.submitted, t: 'New application: ' + x.studentName + ' (' + x.classApplied + ')' }); });
    rd('bia_payments', []).forEach(function (x) { a.push({ d: x.date, t: 'Simulated payment of ' + A.naira(x.amount) + ' for ' + x.adm }); });
    rd('bia_complaints', []).forEach(function (x) { a.push({ d: x.submitted, t: x.type + ': ' + x.subject }); });
    return a.sort(function (p, q) { return q.d.localeCompare(p.d); }).slice(0, 8);
  };

  /* Score submissions from teachers */
  A.submissions = function () { return rd('bia_scores', []); };
  function find(l, cls, sub) { return l.filter(function (x) { return x.cls === cls && x.subject === sub; })[0]; }
  A.approve = function (cls, sub) {
    var sc = rd('bia_scores', []), rec = find(sc, cls, sub);
    if (!rec || rec.status !== 'submitted') return { error: 'Nothing to approve.' };
    var res = rd('bia_results', []), R = BIA.results;
    var tn = BIA.auth.users('teacher').filter(function (t) { return t.loginId === rec.by; })[0];
    Object.keys(rec.rows).forEach(function (adm) {
      var r = rec.rows[adm]; if (r.ca == null || r.exam == null) return;
      var x = res.filter(function (q) { return q.adm === adm && q.session === rec.session && q.term === rec.term; })[0];
      if (!x) {
        x = { adm: adm, cls: cls, session: rec.session, term: rec.term, published: true, position: 1, classSize: 1, rows: [], classRemark: 'Result published. Keep working hard.', principalRemark: 'Well done. Aim higher next term.' };
        res.push(x);
      }
      var word = R.grade(r.ca + r.exam).word, row = x.rows.filter(function (q) { return q.subject === sub; })[0];
      if (row) { row.ca = r.ca; row.exam = r.exam; row.remark = word; }
      else x.rows.push({ subject: sub, ca: r.ca, exam: r.exam, teacher: tn ? tn.name : 'Teacher', remark: word });
      x.published = true;
    });
    var grp = res.filter(function (q) { return q.cls === cls && q.session === rec.session && q.term === rec.term; })
      .sort(function (a, b) { return R.summary(b).total - R.summary(a).total; });
    grp.forEach(function (q, i) { q.position = i + 1; q.classSize = grp.length; });
    rec.status = 'approved';
    return wr('bia_results', res) && wr('bia_scores', sc) ? { ok: true } : { error: 'Could not save. Free some browser storage.' };
  };
  A.sendBack = function (cls, sub) {
    var sc = rd('bia_scores', []), rec = find(sc, cls, sub);
    if (!rec || rec.status !== 'submitted') return { error: 'Nothing to return.' };
    rec.status = 'draft';
    return wr('bia_scores', sc) ? { ok: true } : { error: 'Could not save.' };
  };
  A.saveGrading = function (cfg) { return wr('bia_grading', cfg); };

  w.BIA = w.BIA || {}; w.BIA.admin = A;
})(window);
