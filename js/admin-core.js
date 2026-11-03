(function () {
  'use strict';
  var U = BIA.admin, Au = BIA.auth, R = BIA.results;
  function opts(list, cur) { return list.map(function (s) { return '<option' + (s === cur ? ' selected' : '') + '>' + U.esc(s) + '</option>'; }).join(''); }
  function kv(p) { return '<div class="kv">' + p.map(function (a) { return '<div><span>' + a[0] + '</span>' + U.esc(a[1] || '–') + '</div>'; }).join('') + '</div>'; }
  function flash(el, t, good) { var m = el.querySelector('#m'); m.className = 'msg ' + (good ? 'ok' : 'err'); m.textContent = t; }

  /* Reusable searchable, filterable, paginated list with edit and delete. */
  function listPanel(o) {
    var st = { q: '', f: '', p: 1, open: '' };
    return function (el) {
      el.innerHTML = '<div class="card"><div class="cols2"><label>Search<input id="q" placeholder="' + o.ph + '" enterkeyhint="search"></label><label>Status<select id="f"><option value="">All</option>' + opts(o.statuses) + '</select></label></div></div><div id="lst"></div><p class="msg" id="m" role="status"></p>';
      var L = el.querySelector('#lst');
      function draw() {
        var q = st.q.trim().toLowerCase();
        var rows = o.get().filter(function (x) { return (!st.f || x[o.sf] === st.f) && (!q || o.text(x).toLowerCase().indexOf(q) > -1); })
          .sort(function (a, b) { return b[o.df].localeCompare(a[o.df]); });
        var pages = Math.max(1, Math.ceil(rows.length / o.per)); if (st.p > pages) st.p = pages;
        var sl = rows.slice((st.p - 1) * o.per, st.p * o.per);
        L.innerHTML = (sl.length ? sl.map(function (x) {
          var k = x[o.id];
          return '<details data-k="' + U.esc(k) + '"' + (st.open === k ? ' open' : '') + '><summary>' + o.line(x) + '</summary><div class="in">' + o.detail(x) +
            '<label>Status<select class="f-s">' + opts(o.statuses, x[o.sf]) + '</select></label><label>' + o.tl + '<textarea class="f-t" rows="2" maxlength="2000">' + U.esc(x[o.tf]) + '</textarea></label>' +
            '<div class="row"><button class="btn sv" type="button">Save</button><button class="btn btn-ghost danger del" type="button">Delete</button></div></div></details>';
        }).join('') : '<div class="card"><p class="empty">' + o.empty + '</p></div>') +
          (pages > 1 ? '<div class="pg"><button type="button" data-p="' + (st.p - 1) + '"' + (st.p < 2 ? ' disabled' : '') + '>Previous</button><span>Page ' + st.p + ' of ' + pages + '</span><button type="button" data-p="' + (st.p + 1) + '"' + (st.p >= pages ? ' disabled' : '') + '>Next</button></div>' : '');
      }
      el.querySelector('#q').oninput = function () { st.q = this.value; st.p = 1; draw(); };
      el.querySelector('#f').onchange = function () { st.f = this.value; st.p = 1; draw(); };
      L.addEventListener('click', function (e) {
        var b = e.target, det = b.closest('details');
        if (b.dataset.p) { st.p = +b.dataset.p; draw(); return; }
        if (!det) return;
        var k = det.dataset.k;
        if (b.classList.contains('sv')) {
          st.open = k;
          var ok = o.save(k, det.querySelector('.f-s').value, det.querySelector('.f-t').value.trim());
          draw(); flash(el, ok ? 'Saved.' : 'Could not save. Try again.', ok);
        } else if (b.classList.contains('del')) {
          if (!confirm('Delete this record permanently? This cannot be undone.')) return;
          st.open = ''; var d = o.del(k); draw(); flash(el, d ? 'Deleted.' : 'Could not delete.', d);
        }
      });
      draw();
    };
  }

  U.add({ id: 'overview', label: 'Overview', render: function (el) {
    var s = U.stats(), act = U.activity();
    var t = [['Students', s.students], ['Teachers', s.teachers], ['Parents', s.parents], ['Pending admissions', s.pendingAdm], ['Fees collected (simulated)', U.naira(s.collected)], ['Outstanding fees', U.naira(s.outstanding)], ['Open complaints', s.openCmp]];
    el.innerHTML = '<div class="tiles">' + t.map(function (a) { return '<div class="tile st"><small>' + a[0] + '</small><b>' + a[1] + '</b></div>'; }).join('') + '</div>' +
      '<div class="card"><h3>Recent activity</h3>' + (act.length ? act.map(function (a) { return '<p class="act"><b>' + U.esc(a.t) + '</b><small>' + U.dt(a.d) + '</small></p>'; }).join('') : '<p class="empty">No activity yet. New applications, payments and complaints appear here.</p>') + '</div>';
  } });

  var ADM = ['Pending', 'Under Review', 'Approved', 'Rejected', 'More Information Needed'];
  U.add({ id: 'admissions', label: 'Admissions', render: listPanel({
    ph: 'Name, reference or class', statuses: ADM, sf: 'status', df: 'submitted', id: 'ref', per: 8, tl: 'Note to applicant (shown when they track)', tf: 'note',
    empty: 'No applications yet. Applications from the admissions page appear here.',
    get: function () { return BIA.store.list(); },
    text: function (x) { return [x.ref, x.studentName, x.classApplied, x.parentName, x.parentPhone].join(' '); },
    line: function (x) { return '<b>' + U.esc(x.studentName) + '</b> · ' + U.esc(x.classApplied) + ' <span class="bd">' + U.esc(x.status) + '</span><small>' + U.esc(x.ref) + ' · ' + U.dt(x.submitted) + '</small>'; },
    detail: function (x) {
      return kv([['Date of birth', x.dob], ['Gender', x.gender], ['Session', x.session], ['Previous school', x.previousSchool], ['Parent or guardian', x.parentName + ' (' + x.relationship + ')'], ['Phone', x.parentPhone], ['Email', x.parentEmail], ['Address', x.address],
        ['Emergency contact', x.emName + ', ' + x.emPhone], ['Medical', x.medical], ['Passport photo', x.photoName], ['Documents', (x.docNames || []).join(', ')]]);
    },
    save: function (k, s, n) { return BIA.store.updateStatus(k, s, n); },
    del: function (k) { return U.remove('bia_admissions', 'ref', k); }
  }) });

  U.add({ id: 'complaints', label: 'Complaints', render: listPanel({
    ph: 'Reference, subject or category', statuses: BIA.cmp.STATUSES, sf: 'status', df: 'submitted', id: 'ref', per: 8, tl: 'Response to the sender (shown when they track)', tf: 'response',
    empty: 'No complaints or suggestions yet.',
    get: function () { return BIA.cmp.list(); },
    text: function (x) { return [x.ref, x.subject, x.type, x.name].join(' '); },
    line: function (x) { return '<b>' + U.esc(x.subject) + '</b> <span class="bd">' + U.esc(x.status) + '</span><small>' + U.esc(x.type) + ' · ' + (x.anonymous ? 'Anonymous' : U.esc(x.name)) + ' · ' + U.dt(x.submitted) + '</small>'; },
    detail: function (x) { return kv([['Reference', x.ref], ['From', x.anonymous ? 'Anonymous' : x.name + ', ' + x.contact]]) + '<p class="msgtxt">' + U.esc(x.message) + '</p>'; },
    save: function (k, s, t) { return BIA.cmp.respond(k, s, t); },
    del: function (k) { return U.remove('bia_complaints', 'ref', k); }
  }) });

  U.add({ id: 'results', label: 'Results', render: function (el) {
    var subs = U.submissions().slice().sort(function (a, b) { return (a.status === 'submitted' ? 0 : 1) - (b.status === 'submitted' ? 0 : 1); }), cfg = R.cfg();
    var STAT = { draft: 'Draft', submitted: 'Waiting for approval', approved: 'Published' };
    el.innerHTML = '<h3 style="margin-bottom:10px">Score submissions</h3>' + (subs.length ? subs.map(function (r) {
      var n = Object.keys(r.rows).length;
      return '<details data-c="' + U.esc(r.cls) + '" data-s="' + U.esc(r.subject) + '"><summary><b>' + U.esc(r.cls + ' · ' + r.subject) + '</b> <span class="bd">' + (STAT[r.status] || r.status) + '</span><small>' + U.esc(r.session + ' · ' + r.term + ' · ' + n + ' students · updated ' + r.updated) + '</small></summary><div class="in"><div class="scroll"><table><thead><tr><th>Student</th><th>CA</th><th>Exam</th><th>Total</th><th>Grade</th></tr></thead><tbody>' +
        Object.keys(r.rows).map(function (adm) {
          var x = r.rows[adm], st = Au.student(adm), t = x.ca == null || x.exam == null ? null : x.ca + x.exam;
          return '<tr><td>' + U.esc(st ? st.name : adm) + '</td><td>' + (x.ca == null ? '–' : x.ca) + '</td><td>' + (x.exam == null ? '–' : x.exam) + '</td><td>' + (t == null ? '–' : t) + '</td><td>' + (t == null ? '–' : R.grade(t).g) + '</td></tr>';
        }).join('') + '</tbody></table></div>' +
        (r.status === 'submitted' ? '<div class="row" style="margin-top:12px"><button class="btn ap" type="button">Approve and publish</button><button class="btn btn-ghost bk" type="button">Return to teacher</button></div>' : '') + '</div></details>';
    }).join('') : '<div class="card"><p class="empty">No scores submitted yet. Teachers submit scores from the teacher portal.</p></div>') +
      '<p class="msg" id="m" role="status"></p>' +
      '<form class="card" id="gf" style="margin-top:18px" novalidate><h3>Grading settings</h3><p class="sub">Minimum total score for each grade. F is everything below E.</p><div class="gridg">' +
      cfg.bands.slice(0, 5).map(function (b, i) { return '<label>' + b[1] + ' from<input name="g' + i + '" type="number" min="1" max="100" value="' + b[0] + '"></label>'; }).join('') +
      '<label>CA out of<input name="ca" type="number" min="1" max="99" value="' + cfg.caMax + '"></label><label>Exam out of<input name="ex" type="number" min="1" max="99" value="' + cfg.examMax + '"></label></div>' +
      '<label class="chk"><input type="checkbox" name="pos"' + (cfg.showPosition ? ' checked' : '') + '><span>Show class position on report cards</span></label><p class="msg" id="gm" role="alert"></p><button class="btn" type="submit">Save grading settings</button></form>';

    el.querySelectorAll('details').forEach(function (d) {
      d.addEventListener('click', function (e) {
        var b = e.target, c = d.dataset.c, s = d.dataset.s, r;
        if (b.classList.contains('ap')) {
          if (!confirm('Approve and publish these scores to students and parents?')) return;
          r = U.approve(c, s);
        } else if (b.classList.contains('bk')) {
          if (!confirm('Return these scores to the teacher for correction?')) return;
          r = U.sendBack(c, s);
        } else return;
        if (r.error) return flash(el, r.error);
        U.sections.filter(function (x) { return x.id === 'results'; })[0].render(el);
        flash(el, b.classList.contains('ap') ? 'Scores published. Students and parents can now see them.' : 'Returned to the teacher.', true);
      });
    });
    el.querySelector('#gf').addEventListener('submit', function (e) {
      e.preventDefault(); var f = e.target, m = el.querySelector('#gm'), mins = [], i;
      function bad(t) { m.className = 'msg err'; m.textContent = t; }
      for (i = 0; i < 5; i++) {
        var v = Math.round(+f['g' + i].value);
        if (!(v >= 1 && v <= 100) || (i && v >= mins[i - 1])) return bad('Each grade must start below the one above it (between 1 and 100).');
        mins.push(v);
      }
      var ca = Math.round(+f.ca.value), ex = Math.round(+f.ex.value);
      if (!(ca >= 1 && ex >= 1) || ca + ex !== 100) return bad('CA and exam maximum scores must add up to 100.');
      var names = [['A', 'Excellent'], ['B', 'Very Good'], ['C', 'Credit'], ['D', 'Pass'], ['E', 'Fair']];
      var bands = names.map(function (n, j) { return [mins[j], n[0], n[1]]; }); bands.push([0, 'F', 'Fail']);
      var ok = U.saveGrading({ bands: bands, caMax: ca, examMax: ex, showPosition: f.pos.checked });
      m.className = 'msg ' + (ok ? 'ok' : 'err'); m.textContent = ok ? 'Grading settings saved.' : 'Could not save. Try again.';
    });
  } });
})();
