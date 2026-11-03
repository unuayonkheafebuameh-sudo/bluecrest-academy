/* Fees and transport data layer (DEMO: browser storage). Phase 10 moves this to Supabase. */
(function (w) {
  'use strict';
  var PK = 'bia_payments', TK = 'bia_transport';
  var TERM = 'First Term 2026/2027', DEADLINE = '2026-11-30';

  var FEES = {
    primary: [['Tuition fee', 150000], ['Examination fee', 10000], ['Development levy', 20000], ['Library fee', 5000], ['ICT fee', 8000], ['Other approved charges', 5000]],
    jss: [['Tuition fee', 200000], ['Examination fee', 15000], ['Development levy', 25000], ['Library fee', 5000], ['Laboratory fee', 10000], ['ICT fee', 10000], ['Other approved charges', 5000]],
    sss: [['Tuition fee', 250000], ['Examination fee', 20000], ['Development levy', 30000], ['Library fee', 5000], ['Laboratory fee', 15000], ['ICT fee', 12000], ['Other approved charges', 5000]]
  };
  var ROUTES = [
    { id: 'R1', name: 'Ikeja to Maryland', fee: 45000, pickups: ['Ikeja City Mall', 'Maryland Bus Stop', 'Ogba Junction'], bus: 'BIA-BUS-01', driver: 'Mr. Adewale' },
    { id: 'R2', name: 'Lekki to Ajah', fee: 60000, pickups: ['Lekki Phase 1 Gate', 'Chevron Roundabout', 'Ajah Market'], bus: 'BIA-BUS-02', driver: 'Mr. Yusuf' },
    { id: 'R3', name: 'Surulere to Yaba', fee: 40000, pickups: ['Adeniran Ogunsanya', 'Yaba Tech Gate', 'Western Avenue'], bus: 'BIA-BUS-03', driver: 'Mr. Obi' }
  ];

  function read(k) { try { return JSON.parse(localStorage.getItem(k)) || (k === TK ? {} : []); } catch (e) { return k === TK ? {} : []; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function level(c) { return c.indexOf('Primary') === 0 ? 'primary' : c.indexOf('JSS') === 0 ? 'jss' : 'sss'; }
  function rand(n) { var b = new Uint32Array(1); crypto.getRandomValues(b); return String(b[0] % Math.pow(10, n)).padStart(n, '0'); }

  var Pay = {
    TERM: TERM, DEADLINE: DEADLINE, ROUTES: ROUTES,
    naira: function (n) { return '₦' + Number(n).toLocaleString('en-NG'); },
    history: function (adm) { return read(PK).filter(function (p) { return p.adm === adm; }).sort(function (a, b) { return b.date.localeCompare(a.date); }); },
    byId: function (id) { return read(PK).filter(function (p) { return p.id === id; })[0] || null; },
    statement: function (adm, cls) {
      var paid = {};
      Pay.history(adm).forEach(function (p) { if (p.term === TERM) p.items.forEach(function (i) { paid[i.name] = (paid[i.name] || 0) + i.amount; }); });
      return FEES[level(cls)].map(function (f) { var p = paid[f[0]] || 0; return { name: f[0], due: f[1], paid: p, balance: Math.max(f[1] - p, 0) }; });
    },
    route: function (id) { return ROUTES.filter(function (r) { return r.id === id; })[0] || null; },
    getReg: function (adm) { return read(TK)[adm] || null; },
    setReg: function (adm, routeId, pickup) {
      var r = Pay.route(routeId), t = read(TK);
      if (!r || r.pickups.indexOf(pickup) < 0) return false;
      t[adm] = { routeId: routeId, pickup: pickup }; return write(TK, t);
    },
    transportItem: function (adm) {
      var reg = Pay.getReg(adm); if (!reg) return null;
      var r = Pay.route(reg.routeId), name = 'Transport: ' + r.name;
      var paid = Pay.history(adm).some(function (p) { return p.term === TERM && p.items.some(function (i) { return i.name === name; }); });
      return { name: name, due: r.fee, paid: paid ? r.fee : 0, balance: paid ? 0 : r.fee, route: r, pickup: reg.pickup };
    },
    /* The only function to replace for a real gateway. Live flow: send the order to YOUR server,
       server calls Paystack/Flutterwave initialize, redirects the parent, then confirms the payment
       by webhook or verify endpoint before marking it paid. The browser never marks money received. */
    checkout: function (order) {
      return new Promise(function (res) { setTimeout(function () { res({ status: 'simulated', gatewayRef: 'SIM-' + rand(8) }); }, 900); });
    },
    record: function (adm, kind, items, payer) {
      var list = read(PK), amount = items.reduce(function (s, i) { return s + i.amount; }, 0);
      var rec = { id: 'PAY' + rand(8), receiptNo: 'RCT-' + new Date().getFullYear() + '-' + rand(6), adm: adm, kind: kind, term: TERM, items: items, amount: amount, payer: payer, date: new Date().toISOString(), status: 'Simulated' };
      list.push(rec); return write(PK, list) ? rec : null;
    }
  };
  w.BIA = w.BIA || {}; w.BIA.pay = Pay;
})(window);
