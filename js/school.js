/* Attendance, assignments, materials and score entry (DEMO: browser storage).
   Phase 10 moves this to Supabase, where Row Level Security enforces the same rules on the server. */
(function (w) {
  'use strict';
  var K = { att: 'bia_att', asg: 'bia_asg', sub: 'bia_sub', mat: 'bia_mat', sc: 'bia_scores', nt: 'bia_notes' };
  var SESSION = '2026/2027', TERM = 'First Term', MAXFILE = 300 * 1024, FT = ['application/pdf', 'image/png', 'image/jpeg'];
  var NO = { error: 'You are not assigned to that class or subject.' }, FULL = { error: 'Could not save. Free some browser storage.' };

  function rd(k) { try { return JSON.parse(localStorage.getItem(k)) || []; } catch (e) { return []; } }
  function wr(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function uid(p) { var b = new Uint32Array(1); crypto.getRandomValues(b); return p + b[0].toString(36) + Date.now().toString(36); }
  function today() { return new Date().toLocaleDateString('en-CA'); }
  function owns(t, cls, sub) { return BIA.auth.teacher(t).some(function (a) { return a[0] === cls && (!sub || a[1] === sub); }); }
  function ok(b) { return b ? { ok: true } : FULL; }

  var S = {
    SESSION: SESSION, TERM: TERM, MAXFILE: MAXFILE, FILE_TYPES: FT, today: today,

    /* Attendance */
    attGet: function (cls, date) { var r = rd(K.att).filter(function (x) { return x.cls === cls && x.date === date; })[0]; return r ? r.marks : null; },
    attSave: function (t, cls, date, marks) {
      if (!owns(t, cls)) return NO;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > today()) return { error: 'Choose today or an earlier date.' };
      var l = rd(K.att).filter(function (x) { return !(x.cls === cls && x.date === date); });
      l.push({ cls: cls, date: date, by: t, marks: marks });
      var nt = rd(K.nt).filter(function (n) { return !(n.date === date && marks[n.adm] === 'P'); });
      Object.keys(marks).forEach(function (adm) {
        if (marks[adm] === 'A' && !nt.some(function (n) { return n.adm === adm && n.date === date; }))
          nt.push({ id: uid('N'), adm: adm, date: date, text: 'Marked absent from school on ' + date + '.' });
      });
      return ok(wr(K.att, l) && wr(K.nt, nt));
    },
    attFor: function (adm) {
      return rd(K.att).filter(function (x) { return x.marks[adm]; }).map(function (x) { return { date: x.date, status: x.marks[adm] }; })
        .sort(function (a, b) { return b.date.localeCompare(a.date); });
    },
    notesFor: function (adm) { return rd(K.nt).filter(function (n) { return n.adm === adm; }).sort(function (a, b) { return b.date.localeCompare(a.date); }); },

    /* Assignments */
    asgAdd: function (t, d) {
      if (!owns(t, d.cls, d.subject)) return NO;
      if (d.title.length < 3 || d.desc.length < 5) return { error: 'Enter a title and the instructions.' };
      if (!d.due || d.due < today()) return { error: 'Choose a due date from today onward.' };
      var l = rd(K.asg); l.push({ id: uid('A'), by: t, cls: d.cls, subject: d.subject, title: d.title, desc: d.desc, due: d.due, created: today() });
      return ok(wr(K.asg, l));
    },
    asgByTeacher: function (t) { return rd(K.asg).filter(function (x) { return x.by === t; }).reverse(); },
    asgForClass: function (cls) { return rd(K.asg).filter(function (x) { return x.cls === cls; }).sort(function (a, b) { return a.due.localeCompare(b.due); }); },
    subs: function (id) { return rd(K.sub).filter(function (x) { return x.asg === id; }); },
    mySub: function (adm, id) { return rd(K.sub).filter(function (x) { return x.asg === id && x.adm === adm; })[0] || null; },
    submit: function (adm, id, text) {
      var a = rd(K.asg).filter(function (x) { return x.id === id; })[0], st = BIA.auth.student(adm);
      if (!a || !st || st.cls !== a.cls) return { error: 'This assignment is not for your class.' };
      text = String(text).trim();
      if (text.length < 3 || text.length > 5000) return { error: 'Write your answer (up to 5000 characters).' };
      var l = rd(K.sub), ex = l.filter(function (x) { return x.asg === id && x.adm === adm; })[0];
      if (ex && ex.score != null) return { error: 'This work has already been marked.' };
      if (ex) { ex.text = text; ex.date = today(); }
      else l.push({ id: uid('S'), asg: id, adm: adm, text: text, date: today(), score: null, feedback: '' });
      return ok(wr(K.sub, l));
    },
    review: function (t, subId, score, fb) {
      var l = rd(K.sub), s = l.filter(function (x) { return x.id === subId; })[0];
      var a = s && rd(K.asg).filter(function (x) { return x.id === s.asg; })[0];
      if (!a || a.by !== t) return NO;
      score = Number(score);
      if (!(score >= 0 && score <= 100)) return { error: 'Score must be 0 to 100.' };
      s.score = score; s.feedback = String(fb).trim().slice(0, 500);
      return ok(wr(K.sub, l));
    },

    /* Learning materials (files up to 300 KB are kept in this demo so downloads work) */
    matAdd: function (t, d) {
      if (!owns(t, d.cls, d.subject)) return NO;
      if (d.title.length < 3) return { error: 'Enter a title.' };
      if (d.file && (FT.indexOf(d.file.type) < 0 || d.file.size > MAXFILE)) return { error: 'File must be a PDF, PNG or JPG up to 300 KB.' };
      var l = rd(K.mat); l.push({ id: uid('M'), by: t, cls: d.cls, subject: d.subject, title: d.title, note: d.note, file: d.file, date: today() });
      return ok(wr(K.mat, l));
    },
    matByTeacher: function (t) { return rd(K.mat).filter(function (x) { return x.by === t; }).reverse(); },
    matForClass: function (cls) { return rd(K.mat).filter(function (x) { return x.cls === cls; }).reverse(); },

    /* Scores: teachers enter drafts and submit. Admin approval and publishing arrive in Phase 9. */
    scGet: function (cls, sub) {
      return rd(K.sc).filter(function (x) { return x.cls === cls && x.subject === sub && x.session === SESSION && x.term === TERM; })[0] || { status: 'draft', rows: {} };
    },
    scSave: function (t, cls, sub, rows, submit) {
      if (!owns(t, cls, sub)) return NO;
      if (S.scGet(cls, sub).status !== 'draft') return { error: 'These scores are already submitted and locked.' };
      var cfg = BIA.results.cfg(), clean = {}, adm;
      for (adm in rows) {
        var ca = rows[adm].ca === '' ? null : Number(rows[adm].ca), ex = rows[adm].exam === '' ? null : Number(rows[adm].exam);
        if ((ca !== null && !(ca >= 0 && ca <= cfg.caMax)) || (ex !== null && !(ex >= 0 && ex <= cfg.examMax))) return { error: 'CA must be 0 to ' + cfg.caMax + ' and exam 0 to ' + cfg.examMax + '.' };
        clean[adm] = { ca: ca, exam: ex };
      }
      if (submit) for (adm in clean) if (clean[adm].ca === null || clean[adm].exam === null) return { error: 'Enter CA and exam scores for every student before submitting.' };
      var l = rd(K.sc).filter(function (x) { return !(x.cls === cls && x.subject === sub && x.session === SESSION && x.term === TERM); });
      l.push({ cls: cls, subject: sub, session: SESSION, term: TERM, by: t, rows: clean, status: submit ? 'submitted' : 'draft', updated: today() });
      return ok(wr(K.sc, l));
    }
  };
  w.BIA = w.BIA || {}; w.BIA.school = S;
})(window);
