/* Dashboard tiles. [label, link or null, phase] */
(function (w) {
  'use strict';
  w.BIA = w.BIA || {};
  w.BIA.modules = {
    student: [['Results', 'results.html', 5], ['Timetable', 'timetable.html', 6], ['Syllabus', 'syllabus.html', 6], ['Fees and payments', 'payments.html#fees', 4], ['Transport', 'payments.html#transport', 4], ['Assignments', 'learning.html#assignments', 7], ['Learning materials', 'learning.html#materials', 7], ['Attendance', 'attendance.html', 7], ['School calendar', null, 9], ['Complaints and suggestions', 'complaints.html', 8]],
    parent: [['Results', 'results.html', 5], ['Attendance', 'attendance.html', 7], ['Timetable', 'timetable.html', 6], ['Syllabus', 'syllabus.html', 6], ['Assignments', 'learning.html#assignments', 7], ['Pay tuition', 'payments.html#fees', 4], ['Pay transport', 'payments.html#transport', 4], ['Receipts', 'payments.html#history', 4], ['Complaints and suggestions', 'complaints.html', 8], ['Notifications', null, 9]],
    tiles: function (role) {
      return BIA.modules[role].map(function (t) {
        return t[1] ? '<a class="tile" style="opacity:1;text-decoration:none;color:inherit" href="' + t[1] + '"><b>' + t[0] + '</b><small>Open</small></a>'
          : '<div class="tile"><b>' + t[0] + '</b><small>Coming in Phase ' + t[2] + '</small></div>';
      }).join('');
    }
  };
})(window);
