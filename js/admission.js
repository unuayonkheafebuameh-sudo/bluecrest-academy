(function () {
  'use strict';
  var form = document.getElementById('appForm'), msg = document.getElementById('formMsg');
  var photo = document.getElementById('photo'), docs = document.getElementById('docs'), prev = document.getElementById('prev');
  var MB = 1024 * 1024;

  function setErr(el, text) {
    var s = el.closest('label') && el.closest('label').querySelector('.err');
    if (s) s.textContent = text || '';
    el.classList.toggle('bad', !!text);
    return !text;
  }
  function validPhone(v) { return /^(\+?234|0)[789]\d{9}$/.test(v.replace(/[\s-]/g, '')); }

  function checkFiles(input, types, max, count) {
    var files = Array.prototype.slice.call(input.files), text = '';
    if (count && files.length > count) text = 'Please choose no more than ' + count + ' files.';
    files.forEach(function (f) {
      if (types.indexOf(f.type) < 0) text = f.name + ' is not an allowed file type.';
      else if (f.size > max) text = f.name + ' is too large (limit ' + (max / MB) + ' MB).';
    });
    return setErr(input, text);
  }

  photo.addEventListener('change', function () {
    if (photo.files[0] && checkFiles(photo, ['image/jpeg', 'image/png', 'image/webp'], 2 * MB)) {
      prev.src = URL.createObjectURL(photo.files[0]); prev.style.display = 'block';
    } else { prev.style.display = 'none'; }
  });
  docs.addEventListener('change', function () { checkFiles(docs, ['application/pdf', 'image/jpeg', 'image/png'], 5 * MB, 5); });

  function validate() {
    var ok = true;
    form.querySelectorAll('input[required]:not([type=file]):not([type=checkbox]),select[required],textarea[required]').forEach(function (el) {
      var v = el.value.trim(), t = '';
      if (!v) t = 'This field is required.';
      else if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) t = 'Enter a valid email address.';
      else if (el.type === 'tel' && !validPhone(v)) t = 'Enter a valid Nigerian phone number.';
      else if (el.name === 'dob') {
        var age = (Date.now() - new Date(v)) / 31557600000;
        if (isNaN(age) || age < 2 || age > 20) t = 'Check the date of birth.';
      } else if (el.name.slice(-4) === 'Name' && v.length < 3) t = 'Enter the full name.';
      if (!setErr(el, t)) ok = false;
    });
    if (!photo.files.length) { setErr(photo, 'A passport photograph is required.'); ok = false; }
    else if (!checkFiles(photo, ['image/jpeg', 'image/png', 'image/webp'], 2 * MB)) ok = false;
    if (!checkFiles(docs, ['application/pdf', 'image/jpeg', 'image/png'], 5 * MB, 5)) ok = false;
    var agree = form.agree, ae = document.getElementById('agreeErr');
    ae.textContent = agree.checked ? '' : 'Please confirm before submitting.';
    if (!agree.checked) ok = false;
    return ok;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    msg.textContent = ''; msg.className = 'msg';
    if (!validate()) {
      msg.className = 'msg err'; msg.textContent = 'Please fix the highlighted fields.';
      var bad = form.querySelector('.bad'); if (bad) bad.focus();
      return;
    }
    var d = {}, fd = new FormData(form);
    ['studentName', 'dob', 'gender', 'classApplied', 'session', 'previousSchool', 'parentName', 'relationship',
      'parentPhone', 'parentEmail', 'address', 'emName', 'emPhone', 'medical'].forEach(function (k) { d[k] = String(fd.get(k) || '').trim(); });
    d.photoName = photo.files[0].name;
    d.docNames = Array.prototype.map.call(docs.files, function (f) { return f.name; });

    var rec = BIA.store.addApplication(d);
    if (!rec) { msg.className = 'msg err'; msg.textContent = 'Could not save the application. Free some browser storage and try again.'; return; }
    form.hidden = true;
    document.getElementById('refOut').textContent = rec.ref;
    document.getElementById('done').hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.getElementById('copyRef').addEventListener('click', function () {
    var t = document.getElementById('refOut').textContent, b = this;
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { b.textContent = 'Copied'; }, function () { b.textContent = 'Select and copy it manually'; });
  });
})();
