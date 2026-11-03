/* Dashboard tiles. Each later phase only changes this small file. [label, link or null, phase] */
(function (w) {
  'use strict';
  w.BIA = w.BIA || {};
  w.BIA.modules = {
    student: [['Results', 'results.html', 5], ['Timetable', null, 6], ['Syllabus', null, 6], ['Fees and payments', 'payments.html#fees', 4], ['Transport', 'payments.html#transport', 4], ['Assignments', null, 7], ['Learning materials', null, 7], ['Attendance', null, 7], ['School calendar', null, 7], ['Complaints', null, 8]],
    parent: [['Results', 'results.html', 5], ['Attendance', null, 7], ['Timetable', null, 6], ['Pay tuition', 'payments.html#fees', 4], ['Pay transport', 'payments.html#transport', 4], ['Receipts', 'payments.html#history', 4], ['Complaints', null, 8], ['Notifications', null, 8]],
    tiles: function (role) {
      return BIA.modules[role].map(function (t) {
        return t[1] ? '<a class="tile" style="opacity:1;text-decoration:none;color:inherit" href="' + t[1] + '"><b>' + t[0] + '</b><small>Open</small></a>'
          : '<div class="tile"><b>' + t[0] + '</b><small>Coming in Phase ' + t[2] + '</small></div>';
      }).join('');
    }
  };
})(window);
