/* Results data layer (DEMO: browser storage). Phase 10 moves this to Supabase with Row Level Security. */
(function (w) {
  'use strict';
  var RK = 'bia_results', GK = 'bia_grading';
  var DEFAULT_CFG = { bands: [[70, 'A', 'Excellent'], [60, 'B', 'Very Good'], [50, 'C', 'Credit'], [45, 'D', 'Pass'], [40, 'E', 'Fair'], [0, 'F', 'Fail']], caMax: 40, examMax: 60, showPosition: true };
  var SUBJ = {
    primary: ['English Language', 'Mathematics', 'Basic Science', 'Social Studies', 'Civic Education', 'Computer Studies', 'Cultural and Creative Arts', 'Physical and Health Education'],
    jss: ['English Language', 'Mathematics', 'Basic Science', 'Basic Technology', 'Social Studies', 'Civic Education', 'Computer Studies', 'Agricultural Science', 'Business Studies'],
    sss: ['English Language', 'Mathematics', 'Biology', 'Chemistry', 'Physics', 'Economics', 'Civic Education', 'Computer Studies']
  };
  var TEACHERS = ['Mrs. Adebayo', 'Mr. Nwosu', 'Mrs. Ibrahim', 'Mr. Eze', 'Miss Okoye', 'Mr. Danjuma', 'Mrs. Balogun', 'Mr. Afolabi', 'Mrs. Chukwu'];
  var SEED = [
    { adm: 'BIA/2026/001', cls: 'JSS 2', prev: 'JSS 1' },
    { adm: 'BIA/2026/002', cls: 'Primary 5', prev: 'Primary 4' },
    { adm: 'BIA/2026/003', cls: 'SSS 2', prev: 'SSS 1' }
  ];

  function read(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function level(c) { return c.indexOf('Primary') === 0 ? 'primary' : c.indexOf('JSS') === 0 ? 'jss' : 'sss'; }
  function h(s) { var n = 7; for (var i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) >>> 0; return n; }

  var Results = {
    cfg: function () { return read(GK, DEFAULT_CFG); },
    grade: function (total) {
      var b = Results.cfg().bands;
      for (var i = 0; i < b.length; i++) if (total >= b[i][0]) return { g: b[i][1], word: b[i][2] };
      return { g: 'F', word: 'Fail' };
    },
    summary: function (rec) {
      var t = 0; rec.rows.forEach(function (r) { t += r.ca + r.exam; });
      var avg = rec.rows.length ? t / rec.rows.length : 0;
      return { total: t, avg: Math.round(avg * 10) / 10, grade: Results.grade(avg).g };
    },
    /* Only PUBLISHED records are ever returned to students and parents. */
    forStudent: function (adm) {
      return read(RK, []).filter(function (r) { return r.adm === adm && r.published; })
        .sort(function (a, b) { return (b.session + b.term).localeCompare(a.session + a.term); });
    }
  };

  function seed() {
    if (read(RK, null)) return;
    var out = [];
    SEED.forEach(function (s) {
      [['2025/2026', 'Third Term', s.prev], ['2026/2027', 'First Term', s.cls]].forEach(function (t) {
        var k = s.adm + t[0];
        var rows = SUBJ[level(t[2])].map(function (sub, i) {
          var n = h(k + sub), ca = 22 + (n % 17), ex = 30 + ((n >> 5) % 23), tot = ca + ex, g = Results.grade(tot);
          return { subject: sub, ca: ca, exam: ex, teacher: TEACHERS[i % TEACHERS.length], remark: g.word };
        });
        var n = h(k);
        out.push({ adm: s.adm, cls: t[2], session: t[0], term: t[1], published: true, position: (n % 5) + 1, classSize: 28 + (n % 6), rows: rows,
          classRemark: 'A focused and respectful learner. Keep it up.', principalRemark: 'Good result. Aim even higher next term.' });
