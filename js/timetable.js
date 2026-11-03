/* Timetable data layer (DEMO). Sample timetables are generated; Phase 9 lets admins edit and publish. */
(function (w) {
  'use strict';
  var KEY = 'bia_timetables';
  var CLASSES = ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6', 'JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3'];
  var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  var SLOTS = [
    { t: '8:00 – 8:40', p: 1 }, { t: '8:40 – 9:20', p: 1 }, { t: '9:20 – 10:00', p: 1 },
    { t: '10:00 – 10:30', n: 'Short break' },
    { t: '10:30 – 11:10', p: 1 }, { t: '11:10 – 11:50', p: 1 },
    { t: '11:50 – 12:30', n: 'Lunch' },
    { t: '12:30 – 1:10', p: 1 }, { t: '1:10 – 1:50', p: 1 }
  ];
  var SUBJ = {
    primary: ['English Language', 'Mathematics', 'Basic Science', 'Social Studies', 'Civic Education', 'Computer Studies', 'Cultural and Creative Arts', 'Physical and Health Education'],
    jss: ['English Language', 'Mathematics', 'Basic Science', 'Basic Technology', 'Social Studies', 'Civic Education', 'Computer Studies', 'Agricultural Science', 'Physical and Health Education', 'Cultural and Creative Arts', 'Business Studies'],
    sss: ['English Language', 'Mathematics', 'Biology', 'Chemistry', 'Physics', 'Economics', 'Government', 'Literature in English', 'Geography', 'Accounting', 'Civic Education', 'Computer Studies']
  };
  var TEACHERS = ['Mrs. Adebayo', 'Mr. Nwosu', 'Mrs. Ibrahim', 'Mr. Eze', 'Miss Okoye', 'Mr. Danjuma', 'Mrs. Balogun', 'Mr. Afolabi', 'Mrs. Chukwu', 'Mr. Salako', 'Miss Umeh', 'Mr. Tijani'];

  function lvl(c) { return c.indexOf('Primary') === 0 ? 'primary' : c.indexOf('JSS') === 0 ? 'jss' : 'sss'; }
  function h(s) { var n = 7; for (var i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) >>> 0; return n; }
  function teacher(cls, sub) { return TEACHERS[h(cls + sub) % TEACHERS.length]; }
  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }

  function generate(cls) {
    var list = SUBJ[lvl(cls)], rest = list.slice(2), days = {};
    DAYS.forEach(function (d, di) {
      var row = [list[0], list[1]];
      for (var k = 0; k < 5; k++) row.push(rest[(di * 5 + k) % rest.length]);
      days[d] = row.map(function (s) { return [s, teacher(cls, s)]; });
    });
    return days;
  }

  var TT = {
    CLASSES: CLASSES, DAYS: DAYS, SLOTS: SLOTS,
    /* Returns the admin's PUBLISHED version if one exists, otherwise the sample. */
    get: function (cls) { var o = read()[cls]; return o && o.published ? o.days : generate(cls); },
    /* For the Phase 9 admin editor. */
    save: function (cls, days, published) {
      var all = read(); all[cls] = { days: days, published: !!published };
      try { localStorage.setItem(KEY, JSON.stringify(all)); return true; } catch (e) { return false; }
    }
  };
  w.BIA = w.BIA || {}; w.BIA.tt = TT;
})(window);
