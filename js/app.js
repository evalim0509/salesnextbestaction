/* Nudge: the chat screen. Buttons first; typing only for visit notes. All data stays in this browser. */
(function () {
  'use strict';
  var NBA = window.NBA, Parsers = window.NBAParsers;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var chat = $('#chat'), dock = $('#dock'), sheet = $('#sheet'), fileInput = $('#file');
  var state = blank(), an = null, dashSp = null, view = 'brief';
  function blank() { return { me: null, tx: [], docs: [], notes: [], deals: [], visits: [], plans: {}, tuning: {}, tuneDismissed: {}, uploads: [], aliases: {}, keepApart: {}, feedback: [], swaps: [], holdout: {}, picks: [], seen: {}, areaPick: {}, credit: {}, targets: [], campaigns: [], files: [], settings: { currency: 'RM', voice: true, motion: true, lang: 'en', holdout: 0.2 } }; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function cur() { return state.settings.currency; }
  function $$(n) { return NBA.money(n, cur()); }

  // ------------------------------------------------------------ storage (IndexedDB on this device only)
  var DB = {
    open: function () {
      return new Promise(function (res, rej) {
        var r = indexedDB.open('sales-brief', 1);
        r.onupgradeneeded = function () { r.result.createObjectStore('kv'); };
        r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); };
      });
    },
    get: function () {
      return DB.open().then(function (db) {
        return new Promise(function (res) { var q = db.transaction('kv').objectStore('kv').get('state'); q.onsuccess = function () { res(q.result); }; q.onerror = function () { res(null); }; });
      }).catch(function () { return null; });
    },
    set: function (v) {
      return DB.open().then(function (db) {
        return new Promise(function (res) { var t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, 'state'); t.oncomplete = res; t.onerror = res; });
      }).catch(function () {});
    }
  };
  function save() { return DB.set(state); }
  function refresh() { an = state.tx.length && state.me ? NBA.analyze(state, state.me) : null; setMood(); dataDate(); knownValues(); }
  var I18 = window.NudgeI18n, knownN = -1;
  function knownValues() {
    if (!I18 || knownN === state.tx.length + state.docs.length + state.campaigns.length) return; knownN = state.tx.length + state.docs.length + state.campaigns.length;
    var v = []; state.tx.forEach(function (t) { v.push(t.cname, t.sp, t.cat, t.seg, t.prod, t.area, t.group); }); state.campaigns.forEach(function (k) { v.push(k.name); }); state.docs.forEach(function (d) { v.push(d.name); }); state.uploads.forEach(function (u) { v.push(u.name); });
    I18.setKnown(v);
  }
  // quiet line on every screen: how fresh the sales data is; amber when older than a week
  function dataDate() {
    var el = $('#datadate'), di = NBA.dataInfo(state); if (!di.to) { el.hidden = true; return; }
    var age = NBA.dayNum(NBA.todayISO()) - NBA.dayNum(di.to);
    el.hidden = false; el.classList.toggle('old', age > NBA.RULES.dataAgeWarn);
    el.textContent = 'Sales up to ' + NBA.shortDate(di.to) + ' (' + (age <= 0 ? 'today' : age === 1 ? '1 day old' : age + ' days old') + ')' + (age > NBA.RULES.dataAgeWarn ? '. Upload a newer file' : '');
  }
  function setMood() {
    var app = $('#app'); if (!state.tx.length) { app.removeAttribute('data-mood'); app.classList.remove('has-target'); return; }
    var t = NBA.targetStatus(state, view === 'dash' ? dashSp : state.me), m = t.mood; if (m === 'calm') app.removeAttribute('data-mood'); else app.dataset.mood = m;
    app.style.setProperty('--p', t.hasTarget ? Math.max(0, Math.min(100, Math.round(100 * t.mtd / t.target))) : 0); app.classList.toggle('has-target', !!t.hasTarget);
    $('#home').title = t.hasTarget ? Math.round(100 * t.mtd / t.target) + '% of ' + t.month + ' target' : 'Home';
  }
  function cust(cid) { return an && an.customers.filter(function (c) { return c.cid === cid; })[0]; }

  // ------------------------------------------------------------ chat primitives
  // Replies are queued: thinking dots first, then the words type out. A tap skips to the full text.
  var osReduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function still() { return osReduced || (state.settings && state.settings.motion === false); }
  function applyMotion() { $('#app').classList.toggle('still', still()); }
  var Q = Promise.resolve(), pending = 0, fast = false, turnStart = null, skippers = [];
  function enqueue(fn) {
    if (!pending++) $('#app').dataset.state = 'thinking';
    Q = Q.then(fn).catch(function () {}).then(function () { if (!--pending) { fast = false; follow(); if ($('#app').dataset.state === 'thinking') delete $('#app').dataset.state; } });
    return Q;
  }
  function pause(ms) {
    return new Promise(function (res) {
      if (fast || still() || !ms) return res();
      var t = setTimeout(done, ms); function done() { skippers.splice(skippers.indexOf(skip), 1); res(); }
      function skip() { clearTimeout(t); res(); } skippers.push(skip);
    });
  }
  function hurry() { if (!pending) return; fast = true; skippers.splice(0).forEach(function (f) { f(); }); }
  // keep the newest words in view, but never push the start of the reply off the top
  function follow() {
    var target = chat.scrollHeight - chat.clientHeight;
    if (turnStart && turnStart.parentNode) target = Math.min(target, turnStart.offsetTop - 8);
    if (target > chat.scrollTop) chat.scrollTop = target;
  }
  function scroll() {}
  var ATOMIC = 'button, .tag, details, .acts, .rowlist, .pitch-ask, .src-line, table, svg, .tiles, .tp, .mtr, .viz, .tbar, .chead, .iconrow, .delta';
  function typeOut(el) {
    if (fast || still()) return Promise.resolve();
    var steps = [], words = 0;
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          if (!ch.nodeValue.trim()) return;
          var frag = document.createDocumentFragment();
          (ch.nodeValue.match(/\S+\s*|\s+/g) || []).forEach(function (w) { var sp = document.createElement('span'); sp.textContent = w; sp.className = 'w hid'; frag.appendChild(sp); steps.push(sp); words++; });
          node.replaceChild(frag, ch);
        } else if (ch.nodeType === 1) {
          ch.classList.add('hid'); steps.push(ch);
          if (!ch.matches(ATOMIC)) walk(ch); else ch.dataset.atom = 1;
        }
      });
    })(el);
    var per = Math.min(26, 2200 / Math.max(words, 1)), i = 0;
    function next() {
      if (i >= steps.length) return;
      var st = steps[i++]; st.classList.remove('hid');
      var atom = st.dataset && st.dataset.atom; if (atom) st.classList.add('fade');
      follow();
      return pause(st.tagName === 'SPAN' ? per : atom ? 140 : 0).then(next);
    }
    return Promise.resolve(next()).then(function () { steps.forEach(function (x) { x.classList.remove('hid'); }); });
  }
  function thinking(ms) {
    if (fast || still()) return Promise.resolve();
    var t = document.createElement('div'); t.className = 'typing fade'; t.innerHTML = '<span class="orb xs"></span><span class="dots"><i></i><i></i><i></i></span>';
    chat.appendChild(t); if (!turnStart) turnStart = t; follow();
    return pause(ms).then(function () { if (turnStart === t) turnStart = null; t.remove(); });
  }
  function bot(html, cls, opt) {
    var d = document.createElement('div'); d.className = 'msg ' + (cls || ''); d.innerHTML = html; if (I18) I18.translateTree(d);
    if (opt && opt.instant) { chat.appendChild(d); follow(); return d; }
    var first = !pending;
    enqueue(function () {
      return thinking(first ? 900 : 420).then(function () { chat.appendChild(d); if (!turnStart) turnStart = d; var p = typeOut(d); follow(); return p; });
    });
    return d;
  }
  function said(text) {
    hurry(); var hello = chat.querySelector('.hello'); if (hello) hello.remove();
    var d = document.createElement('div'); d.className = 'msg me fade'; d.textContent = text;
    enqueue(function () { fast = false; chat.appendChild(d); turnStart = d; chat.scrollTop = chat.scrollHeight; });
    return d;
  }
  function clearChat() { hurry(); enqueue(function () { fast = false; chat.innerHTML = ''; turnStart = null; }); }
  // "How I got this": the data, rule and source behind a reply. rows = [what, how]
  // rec = true for recommendations: adds what Nudge cannot see. Every trail ends with the rules and data version.
  function trail(rows, rec) {
    rows = rows.filter(function (r) { return r && r[1]; });
    if (rec) rows.push(['Blind spots', NBA.blindSpots(state)]);
    rows.push(['Version', NBA.stamp(state)]);
    return '<details class="audit"><summary>How I got this</summary>' + rows.map(function (r) { return '<div class="factor nopts"><span>' + esc(r[0]) + '<code>' + esc(r[1]) + '</code>' + (r[2] || '') + '</span></div>'; }).join('') + '</details>';
  }
  // "Show me the orders": the actual sales lines behind a fact, at most 20, newest first
  function orders(c, key) {
    if (!c || !key) return '';
    return '<details class="orders"><summary>Show me the orders</summary>' + NBA.evidence(c, key).map(function (g) {
      return '<p class="small"><b>' + esc(g.caption) + '</b>: ' + g.n + ' lines, ' + $$(g.total) + (g.n > 20 ? ' (newest 20 shown)' : '') + '</p>' +
        (g.rows.length ? '<table class="dtable ev"><tr><th>Date</th><th>Invoice</th><th>Product</th><th>Amount</th></tr>' + g.rows.map(function (t) { return '<tr><td>' + t.d + '</td><td>' + esc(t.inv || '') + '</td><td>' + esc(t.prod || t.cat) + '</td><td>' + $$(t.amt) + '</td></tr>'; }).join('') + '</table>' : '');
    }).join('') + '</details>';
  }
  function scoreTrail(c) { return c.factors.map(function (f) { return [f.bucket + ' ' + (f.pts > 0 ? '+' : '') + f.pts + ' (' + f.src + ')', f.tech, orders(c, f.ev)]; }); }
  function conf(c) { return '<span class="conf">Based on ' + c.nOrders + (c.nOrders === 1 ? ' order' : ' orders') + (c.rough ? ', rough guess, few orders' : '') + '</span>'; }
  // ---- small visuals: a few words and a picture first, the sentence on demand
  var ICON = {
    file: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"/></svg>',
    out: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4m0 0l-4 4m4-4l4 4M5 13v6h14v-6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    why: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M9.7 9.6a2.4 2.4 0 1 1 3.3 2.2c-.6.3-1 .8-1 1.5v.4M12 16.6v.2" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
    dots: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="19" cy="12" r="1.9"/></svg>',
    chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5l1.3-3.9A8 8 0 1 1 8.6 19l-4.6.5z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="M9 10.5h6M9 13.5h4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>'
  };
  function meter(label, v, kind, note) { return '<div class="mtr"><span>' + label + '</span><div class="bar"><i class="' + kind + '" style="width:' + Math.max(2, Math.min(100, v)) + '%"></i></div><b>' + (note || v) + '</b></div>'; }
  function tiles(list) { return '<div class="tiles' + (list.length === 2 ? ' two' : '') + '">' + list.map(function (t) { return '<div class="tile"><small>' + esc(t[0]) + '</small><b>' + esc(t[1]) + '</b>' + (t[2] ? '<span>' + esc(t[2]) + '</span>' : '') + '</div>'; }).join('') + '</div>'; }
  function more(label, html) { return '<details class="more"><summary>' + esc(label) + '</summary>' + html + '</details>'; }
  function tbar(ts) {
    if (!ts.hasTarget) return '';
    var w = Math.min(100, Math.round(100 * ts.mtd / ts.target)), pace = Math.min(100, Math.round(100 * ts.pace / ts.target));
    return '<div class="tbar"><div class="row"><span>' + ts.month + ' target</span><b>' + $$(ts.mtd) + ' of ' + $$(ts.target) + '</b></div><div class="bar"><i class="' + (ts.ahead ? 'go' : 'warn') + '" style="width:' + w + '%"></i><u style="left:' + pace + '%"></u></div>' +
      '<div class="row small"><span>' + (ts.gap > 0 ? $$(ts.gap) + ' to go' : 'Target reached') + '</span><span>' + (ts.gap > 0 ? ts.daysLeft + ' days left, ' + (ts.ahead ? 'on pace' : 'behind pace') : '') + '</span></div></div>';
  }
  function rhythm(c) {
    var gap = c.gapUsed, max = Math.max(gap * 2.2, c.recency * 1.15) || 1; function p(v) { return Math.min(100, 100 * v / max); }
    var word = c.ratio >= 1.5 ? 'overdue' : c.ratio >= 0.8 ? 'due now' : 'not due yet';
    return '<div class="viz"><div class="row small"><span>Order rhythm</span><span>' + c.recency + ' days, usually ' + Math.round(gap) + ': ' + word + '</span></div>' +
      '<div class="rh"><i style="left:' + p(gap * 0.8) + '%;width:' + (p(gap * 1.5) - p(gap * 0.8)) + '%"></i><u class="' + (c.ratio >= 1.5 ? 'risk' : c.ratio >= 0.8 ? 'go' : '') + '" style="left:' + p(c.recency) + '%"></u></div>' +
      '<div class="row small faint"><span>Just ordered</span><span>Overdue</span></div></div>';
  }
  function spark(c) {
    var m = c.months12, max = Math.max.apply(null, m.map(function (x) { return x.amt; })) || 1, W = 300, H = 54;
    var pts = m.map(function (x, i) { return [4 + i * (W - 8) / 11, H - 6 - (x.amt / max) * (H - 14)]; });
    var line = pts.map(function (q, i) { return (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('');
    return '<div class="viz"><div class="row small"><span>Spend, last 12 months</span><span>' + (c.yoy == null ? $$(c.rev12) : NBA.pct(c.yoy) + ' on the year before') + '</span></div>' +
      '<svg class="spark" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="Monthly spend over the last 12 months"><path d="' + line + 'L' + (W - 4) + ' ' + H + 'L4 ' + H + 'z" fill="rgba(42,120,214,.13)" stroke="none"/><path d="' + line + '" fill="none" stroke="#2a78d6" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>' +
      '<div class="row small faint"><span>' + m[0].label + '</span><span>' + m[11].label + ' so far</span></div></div>';
  }
  function names(a) { return a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  var TAGWORD = { 'Collect first': 'Collect first', 'May churn': 'At risk', 'Likely to close': 'Likely to buy', 'Good chance': 'Maybe', Watch: 'Watch', Steady: 'Steady', Inactive: 'Inactive' };
  function tagClass(t) { return t === 'Likely to close' || t === 'Good chance' ? 'go' : t === 'May churn' ? 'risk' : t === 'Watch' || t === 'Collect first' ? 'watch' : ''; }
  function tag(c) { return '<span class="tag ' + tagClass(c.tag) + '">' + (c.tag === 'May churn' ? '▲ ' : c.tag === 'Likely to close' ? '▲ ' : c.tag === 'Collect first' ? '! ' : '') + (TAGWORD[c.tag] || c.tag) + '</span>'; }
  function acts(list) {
    return '<div class="acts">' + list.map(function (a) { return '<button class="' + (a[2] || '') + '" data-do="' + a[0] + '">' + esc(a[1]) + '</button>'; }).join('') + '</div>';
  }

  // ------------------------------------------------------------ flows
  function welcome() {
    hurry(); chat.innerHTML = ''; dock.hidden = true; $('#who').hidden = true;
    var h = document.createElement('div'); h.className = 'hello fade';
    h.innerHTML = '<span class="orb"></span><h2>' + greeting() + '. Shall we plan your day?</h2><div class="steps"><button data-do="upload"><b>1</b>Upload</button><i></i><button disabled><b>2</b>Insights</button><i></i><button disabled><b>3</b>Export</button></div><p>Upload your sales file and I will tell you who to visit, who is ready to buy and what to say.</p>' +
      acts([['upload', 'Upload my files', 'pri'], ['sample', 'Try with sample data', '']]) +
      '<p class="small" style="margin-top:14px">Your files are read on this phone only. Nothing is sent anywhere and no AI service is used.</p>';
    chat.appendChild(h);
  }
  // Home: where the orb takes you
  function home() {
    if (!state.tx.length) { welcome(); return; }
    if (view !== 'brief') tab('brief');
    refresh(); hurry(); Q = Q.then(function () { chat.innerHTML = ''; turnStart = null; });
    var ts = NBA.targetStatus(state, state.me), first = state.me.split(' ')[0];
    var status = ts.hasTarget ? (ts.gap > 0 ? $$(ts.gap) + ' to go for your ' + ts.month + ' target, ' + (ts.ahead ? 'and you are on pace' : 'a little behind pace') : 'You have hit your ' + ts.month + ' target') : '';
    var h = document.createElement('div'); h.className = 'hello fade';
    h.innerHTML = '<span class="ring big"><span class="orb"></span></span><h2>Hey ' + esc(first) + ', what can I do for you today?</h2>' + (status ? '<p class="status">' + status + '</p>' : '') +
      acts([['brief', 'Today\'s brief', 'pri']]) +
      '<details class="moreacts"><summary>More</summary>' + acts((ts.hasTarget && ts.gap > 0 ? [['gap', 'Close my gap', '']] : []).concat([['close', 'Likely to close', ''], ['churn', 'May churn', ''], ['wrap', 'Wrap up my day', '']])) + '</details>';
    // opening "More" scrolls the extra shortcuts clear of the bottom bar
    var md = h.querySelector('.moreacts'); md.addEventListener('toggle', function () { if (md.open) chat.scrollTo({ top: chat.scrollHeight, behavior: still() ? 'auto' : 'smooth' }); });
    Q.then(function () { chat.appendChild(h); chat.scrollTop = 0; });
  }
  // "Last 8 weeks: customers I marked Likely ordered within 14 days X% of the time. All your customers: Y%."
  var learnCache = {};
  function learnFor(sp) { var k = sp + '|' + state.tx.length + '|' + state.notes.length + '|' + JSON.stringify(state.tuning || {}); if (!learnCache[k]) learnCache = {}, learnCache[k] = NBA.learning(state, sp); return learnCache[k]; }
  function scoreLine(L, team) {
    if (!L || !L.samples) return '';
    var w = L.weeks, b = L.bands.Likely, all = Math.round(L.base * 100);
    return '<p class="score">' + (b.n ? 'Last ' + w + ' weeks: customers I marked Likely ordered within 14 days ' + Math.round(b.rate * 100) + '% of the time. ' + (team ? 'All customers' : 'All your customers') + ': ' + all + '%.' : 'Last ' + w + ' weeks: no customer was marked Likely. ' + (team ? 'All customers' : 'All your customers') + ' ordered within 14 days ' + all + '% of the time.') + '</p>';
  }
  function pickRow(r) { return '<span class="pk ' + (r.hit ? 'hit' : 'miss') + '">' + (r.hit ? '✓ ' : '✗ ') + esc(r.name) + '</span>'; }
  // "Your pick vs Nudge's pick": choose up to 3 customers; Nudge's top 3 from today are kept beside them
  function pickSheet() {
    var sp = view === 'dash' && dashSp ? dashSp : state.me, a = sp === state.me ? an : NBA.analyze(state, sp), chosen = [];
    var list = a.customers.filter(function (c) { return !c.lost; }).sort(function (x, y) { return x.name.toLowerCase() < y.name.toLowerCase() ? -1 : 1; });
    openSheet('Your 3 for this week', '<p class="small" style="margin:0 0 10px">Pick up to 3 customers you would visit this week. In 14 days I will show who ordered, next to my picks.</p><div class="rowlist" id="picks" style="margin:0">' + list.map(function (c) { return '<button data-c="' + esc(c.cid) + '"><span>' + esc(c.name) + '</span>' + tag(c) + '</button>'; }).join('') + '</div>', '<button class="btn pri" id="save-picks" disabled>Save my picks</button>');
    $('#sheet-body').onclick = function (e) {
      var b = e.target.closest('[data-c]'); if (!b) return; var id = b.dataset.c, k = chosen.indexOf(id);
      if (k >= 0) { chosen.splice(k, 1); b.classList.remove('picked'); } else if (chosen.length < 3) { chosen.push(id); b.classList.add('picked'); }
      $('#save-picks').disabled = !chosen.length;
    };
    $('#save-picks').onclick = function () {
      state.picks.push({ id: uid(), sp: sp, date: a.asOf, ts: stamp(), cids: chosen.slice(), nudge: NBA.lists(a).top3.map(function (c) { return c.cid; }) }); save(); closeSheet();
      var nm = chosen.map(function (id) { return a.customers.filter(function (c) { return c.cid === id; })[0].name; });
      if (view === 'dash') showDash(); else bot('<p>Saved your picks: ' + esc(names(nm)) + '.</p>' + trail([['Judged', 'in 14 days, against Nudge\'s top 3 from today, by whether each customer ordered']]));
    };
  }
  function renderPeople() {
    var btn = $('#who'), people = NBA.salespeople(state), dash = view === 'dash';
    btn.hidden = !people.length; if (!people.length) return;
    var sel = dash ? dashSp : state.me;
    $('#who-name').textContent = sel || 'All team';
    $('#who-menu').innerHTML = (dash ? '<button role="option" data-sp="" aria-selected="' + (sel === null) + '">All team</button>' : '') +
      people.map(function (p) { return '<button role="option" data-sp="' + esc(p) + '" aria-selected="' + (p === sel) + '">' + esc(p) + '</button>'; }).join('');
  }
  function whoMenu(open) { $('#who-menu').hidden = !open; $('#who').setAttribute('aria-expanded', !!open); }
  function askWho() { setMe(NBA.salespeople(state)[0]); }
  function setMe(name) {
    state.me = name; save(); refresh();
    dock.hidden = false; renderPeople();
    home();
  }
  function greeting() { var h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; }

  // ---- today's plan: fixed once made, so ticking off visits does not reshuffle the list
  function plan() {
    var key = state.me + '|' + an.asOf;
    if (!state.plans[key]) {
      var L = NBA.lists(an, { area: state.areaPick[key] }), ids = function (a) { return a.map(function (c) { return c.cid; }); };
      state.plans[key] = ids(L.top3);
      if (L.area) state.areaPick[key] = L.area;
      state.holdout[key] = { sp: state.me, date: an.asOf, share: state.settings.holdout || 0, held: ids(L.held), shown: ids(L.top3.concat(L.close, L.churn)).filter(function (v, i, a) { return a.indexOf(v) === i; }) };
      save();
    }
    return state.plans[key].map(cust).filter(Boolean);
  }
  function visitOf(cid) { return state.visits.filter(function (v) { return v.cid === cid && v.sp === state.me && v.date === an.asOf; })[0]; }
  function footHTML(cid) {
    var v = visitOf(cid);
    if (!v) return '';
    var c = cust(cid), wa = v.status === 'done' && c && NBA.reorderMessage(c, an, state.me);
    return '<span class="vstate ' + v.status + '">' + (v.status === 'done' ? '✓ Visited' : 'Skipped: ' + esc(v.reason)) + '</span>' + (wa ? '<button data-v="wa">Reorder message</button>' : '') + '<button data-v="undo">Undo</button>';
  }
  function refreshFoots(cid) { [].forEach.call(chat.querySelectorAll('.vfoot'), function (f) { if (f.dataset.visit === cid) { f.innerHTML = footHTML(cid); var row = f.closest('.visit'); row.classList.toggle('marked', !!visitOf(cid)); closeRow(row); } }); }
  function markVisit(cid, status, reason, quiet) {
    state.visits = state.visits.filter(function (v) { return !(v.cid === cid && v.sp === state.me && v.date === an.asOf); });
    if (status) state.visits.push({ cid: cid, sp: state.me, date: an.asOf, status: status, reason: reason || '' });
    save(); refreshFoots(cid);
    var p = plan(), left = p.filter(function (c) { return !visitOf(c.cid); }).length;
    if (status && !quiet && p.length && !left) bot('<p>That is all ' + p.length + ' of today\'s visits accounted for.</p>' + acts([['wrap', 'Wrap up my day', 'pri full']]) + trail([['Count', p.length + ' planned visits for ' + an.asOf + ', each marked visited or skipped on this phone']]));
  }
  function autoVisited(cid) { if (plan().some(function (c) { return c.cid === cid; }) && !visitOf(cid)) markVisit(cid, 'done', '', true); }
  // the customer card's "More": the less frequent actions, Microsoft-style overflow
  function cardMoreSheet(cid) {
    var c = cust(cid); if (!c) return;
    openSheet(c.name, '<div class="rowlist" style="margin:0"><button data-a="deal"><span>Deal closed<span class="sub">Record the amount</span></span></button><button data-a="export1"><span>Export one-pager</span></button><button data-a="wrong"><span>Wrong, because…</span></button></div>');
    $('#sheet-body').onclick = function (e) { var b = e.target.closest('[data-a]'); if (!b) return; closeSheet(); act(b.dataset.a, cid); };
  }
  function skipSheet(cid) {
    var c = cust(cid); if (!c) return;
    var reasons = ['Customer not available', 'Ran out of time', 'Moved to another day', 'Not needed today'];
    openSheet('Skip ' + c.name + ' today?', '<div class="group">Why?</div><div class="rowlist" style="margin:0">' + reasons.map(function (r) { return '<button data-r="' + r + '">' + r + '</button>'; }).join('') + '</div>');
    $('#sheet-body').onclick = function (e) { var b = e.target.closest('[data-r]'); if (b) { closeSheet(); markVisit(cid, 'skipped', b.dataset.r); } };
  }
  // ---- WhatsApp reorder message: plain text, no scores, risk labels or notes; Nudge never sends it
  function waSheet(cid) {
    var c = cust(cid); if (!c) return; var msg = NBA.reorderMessage(c, an, state.me); if (!msg) return;
    if (I18 && I18.getLang() === 'ms') msg = I18.t(msg);
    var canShareText = !!(navigator.share);
    openSheet('Message for ' + c.name, '<p class="wa nt" id="wa-text">' + esc(msg) + '</p><p class="small">Nothing is sent by Nudge. You choose who to send it to.</p>',
      (canShareText ? '<button class="btn pri" id="wa-share">Share message</button>' : '') + '<a class="btn' + (canShareText ? '' : ' pri') + '" id="wa-open" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(msg) + '">Open WhatsApp</a><button class="btn" id="wa-copy">Copy</button>');
    if (canShareText) $('#wa-share').onclick = function () { navigator.share({ text: msg }).catch(function () {}); };
    $('#wa-copy').onclick = function () { var b = this; (navigator.clipboard ? navigator.clipboard.writeText(msg) : Promise.reject()).then(function () { b.textContent = 'Copied'; }).catch(function () { var r = document.createRange(); r.selectNodeContents($('#wa-text')); var sl = getSelection(); sl.removeAllRanges(); sl.addRange(r); }); };
  }
  // ---- the rep stays in charge: "Wrong, because…" and "Swap"
  var WRONG = [['closed', 'Shop closed'], ['credit', 'On credit hold'], ['recent', 'Visited recently'], ['notmine', 'Not my customer'], ['other', 'Other']];
  var SWAPWHY = [['route', 'Closer to my route'], ['asked', 'Customer asked to meet'], ['chance', 'Better chance today'], ['other', 'Other']];
  function label(list, k) { return (list.filter(function (x) { return x[0] === k; })[0] || [k, k])[1]; }
  // takes a customer out of today's plan and puts the best remaining customer in its place
  function replaceInPlan(cid, wantCid) {
    var key = state.me + '|' + an.asOf, pl = state.plans[key]; if (!pl) return null;
    var i = pl.indexOf(cid); if (i < 0) return null;
    var next = wantCid ? cust(wantCid) : an.customers.filter(function (c) { return c.eligible && pl.indexOf(c.cid) < 0; })[0];
    if (next) pl[i] = next.cid; else pl.splice(i, 1);
    save();
    [].forEach.call(chat.querySelectorAll('.visit'), function (v) { var m = v.querySelector('.vmain'); if (m && m.dataset.cid === cid) { v.classList.add('gone'); var f = v.querySelector('.vfoot'); if (f) f.innerHTML = '<span class="vstate">Replaced' + (next ? ' by ' + esc(next.name) : '') + '</span>'; } });
    return { next: next, index: i };
  }
  function wrongSheet(cid) {
    var c = cust(cid); if (!c) return;
    openSheet('Wrong, because…', '<p class="small" style="margin:0 0 10px">Why is ' + esc(c.name) + ' not right? I will remember it, and your manager can see it.</p><div class="rowlist" style="margin:0">' + WRONG.map(function (r) { return '<button data-r="' + r[0] + '">' + r[1] + '</button>'; }).join('') + '</div>');
    $('#sheet-body').onclick = function (e) {
      var b = e.target.closest('[data-r]'); if (!b) return; closeSheet();
      var r = b.dataset.r, f = { id: uid(), cid: cid, cname: c.name, sp: state.me, date: an.asOf, ts: stamp(), reason: r };
      state.feedback.push(f); save(); refresh();
      var rp = replaceInPlan(cid);
      said('Wrong, because: ' + label(WRONG, r).toLowerCase());
      var msg = { closed: 'Got it, I won\'t suggest ' + c.name + ' until there\'s a new order.', notmine: 'Got it, I won\'t suggest ' + c.name + ' until there\'s a new order.', credit: 'Got it, I\'ll hold off on ' + c.name + ' for ' + NBA.RULES.creditHoldDays + ' days.', recent: 'Got it, ' + c.name + ' moves down the list for a couple of days.', other: 'Got it, I\'ve noted it for your manager.' }[r];
      bot('<p>' + esc(msg) + (rp && rp.next ? ' I\'ve put ' + esc(rp.next.name) + ' in its place.' : '') + '</p>' +
        trail([['Recorded', 'reason “' + label(WRONG, r) + '” for ' + c.name + ' on ' + an.asOf + '; kept on this phone, shown to your manager and in the Excel export'], ['Effect', { closed: 'left out of suggestions until an order dated after today arrives', notmine: 'left out of suggestions until an order dated after today arrives', credit: 'left out of suggestions until ' + NBA.addDays(an.asOf, NBA.RULES.creditHoldDays), recent: 'counts as contact today: −' + NBA.RULES.visitedPenalty + ' priority for ' + NBA.RULES.visitedDays + ' days', other: 'taken out of today\'s visits only' }[r]],
          ['Replacement', rp && rp.next ? 'next customer by visit priority who is not already in today\'s visits' : '']]));
      if (rp && rp.next) visitCard(rp.next, rp.index);
    };
  }
  function swapSheet(cid) {
    var c = cust(cid); if (!c) return; var pl = state.plans[state.me + '|' + an.asOf] || [], pick = null;
    var cands = an.customers.filter(function (x) { return !x.lost && !x.blocked && pl.indexOf(x.cid) < 0; });
    openSheet('Swap ' + c.name + ' for…', '<div class="group">Who instead?</div><div class="rowlist" id="swapc" style="margin:0">' + cands.map(function (x) { return '<button data-c="' + esc(x.cid) + '"><span>' + esc(x.name) + '<span class="sub">' + esc(actionWord(x)) + '</span></span>' + tag(x) + '</button>'; }).join('') + '</div>' +
      '<div id="swapwhy" hidden><div class="group">Why?</div>' + chipsHTML(SWAPWHY, ['route']) + '</div>', '<button class="btn pri" id="go-swap" disabled>Swap</button>');
    $('#sheet-body').onclick = function (e) {
      var b = e.target.closest('[data-c]'), ch = e.target.closest('.chip');
      if (b) { [].forEach.call(document.querySelectorAll('#swapc button'), function (x) { x.classList.remove('picked'); }); b.classList.add('picked'); pick = b.dataset.c; $('#swapwhy').hidden = false; $('#go-swap').disabled = false; $('#swapwhy').scrollIntoView({ block: 'nearest' }); }
      if (ch) { [].forEach.call(ch.parentNode.children, function (x) { x.setAttribute('aria-pressed', 'false'); }); ch.setAttribute('aria-pressed', 'true'); }
    };
    $('#go-swap').onclick = function () {
      var why = document.querySelector('#swapwhy .chip[aria-pressed="true"]').dataset.k, n = cust(pick); closeSheet();
      state.swaps.push({ id: uid(), date: an.asOf, ts: stamp(), sp: state.me, out: cid, outName: c.name, 'in': pick, inName: n.name, reason: why }); save();
      var rp = replaceInPlan(cid, pick);
      said('Swap ' + c.name + ' for ' + n.name);
      bot('<p>Swapped: ' + esc(n.name) + ' in for ' + esc(c.name) + '.</p>' + trail([['Recorded', 'swap on ' + an.asOf + ', reason “' + label(SWAPWHY, why) + '”; kept as feedback for your manager, not as a skipped visit']]));
      if (rp && rp.next) visitCard(rp.next, rp.index);
    };
  }
  // spend in the last 90 days against the 90 before: up at +10% or more, down at -10% or less
  function trendWord(c) { var t = c.revPrev90 > 0 ? c.trend : 0; return t >= 0.1 ? '▲ ' + Math.round(t * 100) + '% in 3 months' : t <= -0.1 ? '▼ ' + Math.abs(Math.round(t * 100)) + '% in 3 months' : 'steady'; }
  // the action leads: "Visit Lakeside Mart today: 12 days late"
  function actionWord(c) {
    if (c.ratio >= 1.5 && c.nOrders >= 2) return Math.round(c.recency - c.gapUsed) + ' days late';
    if (c.ratio >= NBA.RULES.reorderWindow[0] && c.nOrders >= 2) return 'reorder due';
    if (c.close >= NBA.RULES.bandHigh) return 'ready to buy';
    var f = NBA.topReasons(c, 1)[0]; return f ? f.label.toLowerCase() : 'regular check-in';
  }
  function actionLine(c) {
    if (c.collect) return 'Collect first: ' + c.name + ', ' + $$(c.collect.amount) + ' overdue';
    if ((c.ratio >= NBA.RULES.reorderWindow[0] && c.nOrders >= 2) || c.close >= NBA.RULES.bandHigh) return 'Visit ' + c.name + ' today: ' + actionWord(c);
    return (c.churn >= NBA.RULES.bandMid ? 'Worth a check: ' : 'Worth a visit: ') + c.name + ', ' + actionWord(c);
  }
  function normalLine(c) { if (c.nOrders >= 2) return 'Usually orders every ' + Math.round(c.gapUsed) + ' days, now ' + c.recency + '.'; var f = NBA.topReasons(c, 1)[0]; return f ? f.plain : ''; }
  function toldLine(c) { return c.noteSays && c.noteSays.labels.length ? '<span class="told">You told me on ' + NBA.shortDate(c.noteSays.date) + ': ' + esc(c.noteSays.labels.join(', ').toLowerCase()) + '</span>' : ''; }
  function blockedLine(c) {
    if (!c.blocked) return '';
    var why = { closed: 'shop closed', notmine: 'not your customer', credit: 'on credit hold' }[c.blocked.reason];
    return '<p class="blocked">You said ' + why + ' on ' + NBA.shortDate(c.blocked.date) + '. Not suggested ' + (c.blocked.reason === 'credit' ? 'until ' + NBA.shortDate(c.blocked.until) : 'until there\'s a new order') + '.</p>';
  }
  // bands instead of scores on rep screens: a word and a shape, never colour alone
  function bandOf(kind, v) { var H = NBA.RULES.bandHigh, M = NBA.RULES.bandMid; return kind === 'close' ? (v >= H ? 'Likely' : v >= M ? 'Maybe' : 'Unlikely') : (v >= H ? 'At risk' : v >= M ? 'Watch' : 'Steady'); }
  function bandHTML(kind, word) {
    var cls = kind === 'close' ? { Likely: 'go', Maybe: 'mid', Unlikely: 'low' }[word] : { 'At risk': 'risk', Watch: 'mid', Steady: 'low' }[word];
    var shape = { go: '▲', risk: '▲', mid: '■', low: '▼' }[cls];
    return '<b class="band ' + cls + '"><i aria-hidden="true">' + shape + '</i>' + word + '</b>';
  }
  function bands(c) {
    if (c.lost) return '<div class="bands"><div class="bandrow"><span>Status</span><b class="band low"><i aria-hidden="true">▼</i>Inactive</b></div></div>';
    return '<div class="bands"><div class="bandrow"><span>Chance to close</span>' + bandHTML('close', c.closeBand) + '</div><div class="bandrow"><span>Risk of leaving</span>' + bandHTML('risk', c.riskBand) + '</div></div>';
  }
  // a slim row, like iPhone Mail: swipe right = visited, swipe left = Skip, Swap, Wrong; tap = the customer
  function visitReason(c) {
    if (c.collect) return 'Collect first: ' + $$(c.collect.amount) + ' overdue';
    return c.nOrders >= 2 ? actionWord(c) + ', usually every ' + Math.round(c.gapUsed) + ' days' : actionWord(c);
  }
  function visitCard(c, i, list) {
    var b = document.createElement('div'); b.className = 'visit fade' + (visitOf(c.cid) ? ' marked' : '');
    b.innerHTML = '<div class="vback"><span class="vdone" aria-hidden="true">✓ Visited</span>' +
      '<div class="vacts" data-visit="' + esc(c.cid) + '"><button data-v="skip">Skip today</button><button data-v="swap">Swap</button><button data-v="wrong">Wrong, because…</button></div></div>' +
      '<button class="vmain" data-cid="' + esc(c.cid) + '"><span class="n">' + (i + 1) + '</span><span class="vtext"><span class="vtop"><span class="name">' + esc(c.name) + '</span>' + tag(c) + '</span>' +
      '<span class="why">' + esc(visitReason(c)) + '</span>' + toldLine(c) + '</span></button>' +
      '<div class="vfoot" data-visit="' + esc(c.cid) + '">' + footHTML(c.cid) + '</div>';
    swipeable(b, c.cid);
    enqueue(function () { return pause(260).then(function () { (list || chat).appendChild(b); follow(); if (i === 0 && !(state.seen || {}).swipe && !still()) b.classList.add('peek'); }); });
    return b;
  }
  var ACTW = 228, ARM = 84;
  function closeRow(row, keep) { if (!row || row === keep) return; row.classList.remove('open'); var m = row.querySelector('.vmain'); if (m) m.style.transform = ''; }
  function closeRows(keep) { [].forEach.call(chat.querySelectorAll('.visit.open'), function (r) { closeRow(r, keep); }); }
  function swipeable(row, cid) {
    var m = row.querySelector('.vmain'), x0 = 0, y0 = 0, lock = null, off = 0, base = 0, armed = false, id = null;
    function set(x) { off = x; m.style.transform = x ? 'translateX(' + x + 'px)' : ''; row.dataset.dir = x > 0 ? 'right' : x < 0 ? 'left' : ''; }
    m.addEventListener('pointerdown', function (e) {
      if (row.classList.contains('gone') || (e.pointerType === 'mouse' && e.button !== 0)) return;
      row.classList.remove('peek'); id = e.pointerId; x0 = e.clientX; y0 = e.clientY; lock = null; base = row.classList.contains('open') ? -ACTW : 0; armed = false; row._moved = false;
    });
    m.addEventListener('pointermove', function (e) {
      if (e.pointerId !== id) return; var dx = e.clientX - x0, dy = e.clientY - y0;
      if (!lock && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) { lock = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'; if (lock === 'x') { try { m.setPointerCapture(id); } catch (er) {} row.classList.add('dragging'); closeRows(row); } }
      if (lock !== 'x') return; row._moved = true;
      var x = base + dx, marked = row.classList.contains('marked');
      if (x > 0) x = marked ? 0 : (x > ARM ? ARM + (x - ARM) * 0.35 : x);
      if (x < -ACTW) x = -ACTW - (-ACTW - x) * 0.25;
      set(x); var a = x >= ARM; if (a !== armed) { armed = a; row.classList.toggle('arm', a); if (a && navigator.vibrate) navigator.vibrate(8); }
    });
    function end(e) {
      if (e.pointerId !== id) return; id = null; row.classList.remove('dragging');
      if (lock !== 'x') return; lock = null;
      if (!state.seen) state.seen = {}; if (!state.seen.swipe) { state.seen.swipe = true; save(); [].forEach.call(chat.querySelectorAll('.swipehint'), function (h) { h.remove(); }); }
      row.classList.remove('arm', 'peek');
      if (off >= ARM && !row.classList.contains('marked')) { set(0); markVisit(cid, 'done'); return; }
      if (off < -ACTW / 2) { row.classList.add('open'); set(-ACTW); } else { row.classList.remove('open'); set(0); }
    }
    m.addEventListener('pointerup', end); m.addEventListener('pointercancel', end);
    // a swipe is not a tap; a tap on an open row closes it
    m.addEventListener('click', function (e) {
      if (row._moved) { e.preventDefault(); e.stopImmediatePropagation(); row._moved = false; return; }
      if (row.classList.contains('open')) { e.preventDefault(); e.stopImmediatePropagation(); closeRow(row); off = 0; row.dataset.dir = ''; }
    }, true);
    // keyboard and screen readers: moving focus onto the hidden actions opens the row
    row.querySelector('.vacts').addEventListener('focusin', function () { if (!row.classList.contains('open')) { closeRows(row); row.classList.add('open'); set(-ACTW); } });
  }
  // Morning brief, visits first (Apple "Today" style): greeting and target bar, area, today's visits,
  // then small pills (at risk, ready to buy, ending soon) and one "More about today" fold. One bubble, one trail.
  function brief() {
    refresh(); if (!an) return;
    var P = plan(), first = state.me.split(' ')[0], ex = NBA.execSummary(state, state.me, an, { plan: P }), ts = ex.target;
    var d = NBA.dashboard(state, { sp: state.me }), by = {}; ex.points.forEach(function (x) { (by[x.kind] = by[x.kind] || []).push(x.text); });
    var LA = NBA.lists(an, { area: state.areaPick[state.me + '|' + an.asOf] }), L = NBA.lists(an);
    var visit$ = P.reduce(function (a, c) { return a + c.avgOrder; }, 0);
    var pills = [['risk', L.churn.length + ' at risk', 'churn', 'See these customers'], ['close', L.close.length + ' ready to buy', 'close', 'See these customers']];
    if (ex.expiring.length) pills.push(['expiry', ex.expiring.length + (ex.expiring.length === 1 ? ' offer ending' : ' offers ending'), '', '']);
    else if (P.length) pills.push(['value', $$(visit$) + ' in today\'s visits', '', '']);
    var areaRow = LA.area ? LA.areas.filter(function (a) { return a.name === LA.area; })[0] : null;
    var extra = '<p class="lead">' + $$(d.ytd.cur) + ' this year' + (d.hasPrev ? ' <span class="delta ' + (d.ytd.inc >= 0 ? 'up' : 'down') + '">' + (d.ytd.inc >= 0 ? '▲ ' : '▼ ') + NBA.pct(d.ytd.pct).replace(/^[+-]/, '') + ' on last year</span>' : '') + '</p>' +
      (by.gap ? '<div class="group">How to close the gap</div><p>' + esc(by.gap.join(' ')) + '</p><button class="linkbtn" data-do="gap">Show me who to approach</button>' : '') +
      (ex.offers.length ? '<div class="group">Offers to use today (' + ex.offers.length + ')</div><ul>' + ex.offers.map(function (o) { return '<li><b>' + esc(o.name) + '</b>' + (o.renewal ? ' (renewal)' : '') + ': <span class="' + (o.quote ? 'nt' : '') + '">' + esc(o.text) + '</span></li>'; }).join('') + '</ul>' : '');
    var html = '<h3>' + greeting() + ', ' + esc(first) + '</h3>' + tbar(ts) +
      (an.stale ? '<p class="small notice-line">Sales data stops on ' + NBA.shortDate(an.dataTo) + '. Upload a newer file for an up-to-date brief.</p>' : '') +
      (unconfirmed() ? '<p class="small unconf">Figures not yet confirmed. <button class="linkbtn" data-do="health">Check the upload</button></p>' : '') +
      (LA.area ? '<div class="areas"><span>Area</span>' + LA.areas.map(function (a) { return '<button class="chip" data-area="' + esc(a.name) + '" aria-pressed="' + (a.name === LA.area) + '">' + esc(a.name) + '</button>'; }).join('') + '</div>' : '') +
      (P.length ? (!(state.seen || {}).swipe ? '<p class="small swipehint">Swipe right when visited. Swipe left to skip, swap or say it is wrong.</p>' : '') + '<div class="vlist"></div>' : '<p>No active customers in the uploaded data.</p>') +
      '<div class="bfoot"><div class="pills tap">' + pills.map(function (t) { return '<button class="pill" data-tile="' + t[0] + '" aria-expanded="false">' + esc(t[1]) + '</button>'; }).join('') + '</div>' +
      pills.map(function (t) { return '<div class="tp" data-tp="' + t[0] + '" hidden><p>' + esc((by[t[0]] || ['Nothing to report here today.']).join(' ')) + '</p>' + (t[2] ? '<button class="linkbtn" data-do="' + t[2] + '">' + t[3] + '</button>' : '') + '</div>'; }).join('') +
      more('More about today', extra) +
      trail([['Headline', ex.headlineTech]].concat(ex.points.map(function (x) { return [x.label, x.tech]; })).concat(ex.offers.map(function (o) { return ['Offer: ' + o.name, o.tech]; }))
        .concat([['Visit order', 'top ' + P.length + ' active customers by visit priority = ' + NBA.RULES.wMain + ' × higher of close and risk score + ' + NBA.RULES.wOther + ' × lower + ' + NBA.RULES.wValue + ' × value percentile; highest first; fixed for the day when first shown'],
          ['Area', areaRow ? 'today\'s visits come from one area: ' + LA.area + ' (total visit priority ' + areaRow.total + ' across ' + areaRow.n + ' eligible customers; the highest of ' + LA.areas.map(function (a) { return a.name + ' ' + a.total; }).join(', ') + ' unless you picked another)' : ''],
          ['Sources', state.tx.length.toLocaleString() + ' sales rows up to ' + (an.dataTo || an.asOf) + ', ' + state.notes.length + ' notes, ' + state.docs.length + ' documents, ' + state.targets.length + ' targets, ' + state.campaigns.length + ' campaigns. Fixed rules, no AI model.'],
          ['Few orders', 'customers with fewer than ' + NBA.RULES.fewOrders + ' orders are left out of today\'s visits unless a recent note or account plan makes them a priority'],
          ['Measuring', state.settings.holdout ? (state.holdout[state.me + '|' + an.asOf] || { held: [] }).held.length + ' customers who would have been suggested are held back today (' + Math.round(state.settings.holdout * 100) + '% of eligible customers, chosen at random with a fixed seed for you and today); they are not shown as suggestions, so the revenue Nudge helps add can be measured' : 'holdout is off'],
          ['Rule', P.length ? '' : 'a customer is active if they ordered within ' + NBA.RULES.lostDays + ' days or ' + NBA.RULES.lostRatio + ' times their usual gap']])
        .concat(P.map(function (c) { var f = NBA.topReasons(c, 1)[0]; return [c.name + ' (priority ' + c.priority + ', ' + c.nOrders + ' orders)', f ? f.tech : 'priority ' + c.priority, orders(c, f && f.ev || 'orders')]; })), true) + '</div>';
    var bub = bot(html, 'wide brief' + (P.length ? ' wait' : ''));
    if (!P.length) return;
    var list = bub.querySelector('.vlist');
    P.forEach(function (c, i) { visitCard(c, i, list); });
    enqueue(function () { bub.classList.remove('wait'); follow(); });
    if (LA.nearby.length) bot('<h3>Also nearby</h3><div class="rowlist">' + LA.nearby.map(function (c) { return '<button data-cid="' + esc(c.cid) + '"><span>' + esc(c.name) + '<span class="sub">' + esc(actionWord(c)) + '</span></span>' + tag(c) + '</button>'; }).join('') + '</div>' +
      trail([['Also nearby', 'the next ' + LA.nearby.length + ' eligible customers by visit priority in ' + LA.area]], true));
  }
  function switchArea(area) {
    var key = state.me + '|' + an.asOf; state.areaPick[key] = area; delete state.plans[key]; delete state.holdout[key]; save();
    said('Area: ' + area); brief();
  }
  function showGap() {
    refresh(); if (!an) return;
    var ts = NBA.targetStatus(state, state.me, { asOf: an.asOf });
    if (!ts.hasTarget) { bot('<p>No monthly target loaded yet.</p>' + more('How to add one', '<p>Add a sheet called “Targets” to the sales file with three columns: Salesperson, Month and Target.</p>') + trail([['Checked', 'no Targets row for ' + state.me + ' in ' + an.asOf.slice(0, 7)]])); return; }
    if (ts.gap <= 0) { bot('<h3>Target reached</h3>' + tbar(ts) + trail([['Target', ts.tech]])); return; }
    var g = NBA.closeGap(an, ts.gap), cover = Math.min(100, Math.round(100 * g.covered / ts.gap));
    bot('<h3>Close the ' + ts.month + ' gap</h3>' + tbar(ts) + meter('These ' + g.picks.length + ' cover', cover, cover >= 100 ? 'go' : 'warn', cover + '%') +
      '<div class="rowlist">' + g.picks.map(function (p) {
        return '<button data-cid="' + esc(p.cid) + '"><span>' + esc(p.name) + (p.offer ? '<span class="sub">Offer saves them ' + $$(p.offer.saving) + '</span>' : '') + '</span><b>' + $$(p.amount) + '</b></button>';
      }).join('') + '</div>' +
      more('Why these customers', '<ul>' + g.picks.map(function (p) { return '<li><b>' + esc(p.name) + '</b>: <span>' + esc(p.reason || 'Regular buyer.') + '</span>' + (p.offer ? ' <span>' + esc(p.offer.name + ' applies.') + '</span>' : '') + '</li>'; }).join('') + '</ul>') +
      trail([['Target pace', ts.tech], ['Ranking', g.tech]].concat(g.picks.map(function (p) { return [p.name, 'close ' + p.close + ' × usual order ' + $$(p.amount), orders(cust(p.cid), 'orders')]; })), true), 'wide');
  }
  // ---- step 3: export
  var ready = {};
  function fileOf(f) { try { return new File([f.blob], f.name, { type: f.blob.type || 'application/octet-stream' }); } catch (e) { return null; } }
  function canShare(f) { var file = fileOf(f); return !!(file && navigator.canShare && navigator.canShare({ files: [file] })); }
  function deliver(promise, label) {
    var w = bot('<p>Preparing ' + esc(label) + '…</p>', '', { instant: true });
    promise.then(function (f) {
      w.remove(); var id = uid(), share = canShare(f); ready[id] = f;
      if (!share) download(f.name, f.blob); // no share sheet on this device: save straight away
      bot('<p><b>' + esc(f.name) + '</b> is ready' + (share ? '.' : ' and saved to your downloads.') + '</p>' +
        '<div class="acts">' + (share ? '<button class="pri" data-do="share" data-for="' + id + '">Share</button><button data-do="save" data-for="' + id + '">Save to phone</button>' : '<button class="full" data-do="save" data-for="' + id + '">Save again</button>') + '</div>' +
        trail([['Built from', 'the same figures shown in the app on ' + an.asOf + ', laid out by a fixed template in this browser; nothing was uploaded'], ['Sharing', share ? 'Share hands the file to the app you pick (email, WhatsApp and so on); from there it leaves the phone' : 'this browser has no share sheet, so the file was saved to downloads']]));
    }).catch(function () { w.innerHTML = '<p>I could not build that file. Please try again.</p>'; });
  }
  function shareFile(id) {
    var f = ready[id]; if (!f) return;
    navigator.share({ files: [fileOf(f)], title: f.name }).catch(function (e) { if (e && e.name !== 'AbortError') download(f.name, f.blob); });
  }
  function formatSheet(title, extra, formats, cb) {
    openSheet(title, extra + '<div class="group">Format</div><div id="fmt">' + chipsHTML(formats, [formats[0][0]]) + '</div>', '<button class="btn pri" id="go-export">Export</button>');
    $('#sheet-body').onclick = function (e) { var ch = e.target.closest('.chip'); if (!ch) return; [].forEach.call(ch.parentNode.children, function (b) { b.setAttribute('aria-pressed', 'false'); }); ch.setAttribute('aria-pressed', 'true'); var n = $('#ver-note'); if (n && n.dataset.fn) verNote(); };
    $('#go-export').onclick = function () { var v = document.querySelector('#ver .chip[aria-pressed="true"]'), f = document.querySelector('#fmt .chip[aria-pressed="true"]').dataset.k; closeSheet(); if (view !== 'brief') tab('brief'); cb(f, v && v.dataset.k); };
  }
  function verNote() { var v = document.querySelector('#ver .chip[aria-pressed="true"]').dataset.k; $('#ver-note').textContent = v === 'customer' ? 'Shows their purchases, the offers that apply with savings, ideas and a proposed next order. No scores, risk labels or visit notes.' : 'Shows status, scores, what to say, campaigns, recent notes and how each score was worked out. Not for the customer.'; }
  function versionHTML(def) { return '<div class="group">Who is it for?</div><div id="ver">' + chipsHTML([['customer', 'To hand to the customer'], ['internal', 'Internal prep']], [def]) + '</div><p class="small" id="ver-note" data-fn="1" style="margin-top:8px"></p>'; }
  function exportSheet() {
    refresh(); if (!an) return;
    var team = view === 'dash';
    openSheet('Export', '<p class="small" style="margin:0 0 10px">Files are built on this phone and saved to your downloads.</p><div class="rowlist" style="margin:0">' +
      '<button data-x="one"><span>Customer one-pager<span class="sub">Account review for one customer. Word, PDF or PowerPoint, internal or to hand over.</span></span></button>' +
      '<button data-x="pack"><span>Meeting pack<span class="sub">One-pagers for today\'s ' + plan().length + ' visits in a single file. Word, PDF or PowerPoint.</span></span></button>' +
      '<button data-x="brief"><span>Today\'s brief<span class="sub">Word or PDF. The morning brief for ' + esc(state.me) + ' with how each figure was worked out.</span></span></button>' +
      '<button data-x="book"><span>Portfolio workbook<span class="sub">Excel. Every customer of ' + esc(state.me) + ' with status, scores, reasons, campaigns, notes and deals.</span></span></button>' +
      '<button data-x="digest"><span>Weekly digest<span class="sub">PDF or Word. The last 7 days for a manager: sales, target, visits, deals, risks.</span></span></button>' +
      '<button data-x="deck"><span>Review deck<span class="sub">PowerPoint for a sales meeting: ' + esc(team && !dashSp ? 'whole team' : (team ? dashSp : state.me)) + '.</span></span></button>' +
      (NBA.salespeople(state).length > 1 && !(team && !dashSp) ? '<button data-x="deckall"><span>Review deck, whole team<span class="sub">PowerPoint covering all salespeople.</span></span></button>' : '') + '</div>');
    $('#sheet-body').onclick = function (e) {
      var b = e.target.closest('[data-x]'); if (!b) return; var k = b.dataset.x;
      if (k === 'one') { customersSheet('One-pager for which customer?', onePagerSheet); return; }
      if (k === 'digest') { digestExport(); return; }
      if (k === 'brief' || k === 'pack') { /* opens a format sheet */ } else { closeSheet(); if (view !== 'brief') tab('brief'); }
      if (k === 'brief') { formatSheet('Today\'s brief', '', [['docx', 'Word'], ['pdf', 'PDF']], function (f) { said('Export today\'s brief'); deliver(window.NBAExport.briefDoc(state, state.me, an, plan(), f), 'your brief'); }); return; }
      if (k === 'pack') { formatSheet('Meeting pack', versionHTML('internal'), [['pdf', 'PDF'], ['docx', 'Word'], ['pptx', 'PowerPoint']], function (f, v) { said('Meeting pack for today\'s visits' + (v === 'customer' ? '' : ' (internal)')); deliver(window.NBAExport.pack(plan(), an, v, f, state.me), 'the meeting pack'); }); verNote(); return; }
      if (k === 'book') { said('Export my portfolio workbook'); deliver(window.NBAExport.workbook(state, state.me, an), 'your workbook'); }
      if (k === 'deck') { said('Export the review deck'); deliver(window.NBAExport.deck(state, team ? dashSp : state.me), 'the review deck'); }
      if (k === 'deckall') { said('Export the team review deck'); deliver(window.NBAExport.deck(state, null), 'the team review deck'); }
    };
  }
  function digestExport() {
    var sp = view === 'dash' ? dashSp : state.me;
    formatSheet('Weekly digest', '', [['pdf', 'PDF'], ['docx', 'Word']], function (f) { said('Export the weekly digest'); deliver(window.NBAExport.digest(state, sp, f), 'the weekly digest'); });
  }
  function onePagerSheet(cid) {
    var c = cust(cid); if (!c) return;
    formatSheet('One-pager: ' + c.name, versionHTML('customer'), [['pdf', 'PDF'], ['docx', 'Word page'], ['pptx', 'PowerPoint slide']], function (f, v) {
      said('One-pager for ' + c.name + (v === 'customer' ? '' : ' (internal)')); deliver(window.NBAExport.onePager(c, an, v, f), 'the one-pager');
    });
    verNote();
  }
  function wrapUpDay() {
    refresh(); if (!an) return;
    var P = plan(), w = NBA.wrapUp(state, state.me, an, P.map(function (c) { return c.cid; })), li = [];
    if (w.visited.length) li.push('<li><b>Visited</b>' + esc(names(w.visited)) + '</li>');
    w.skipped.forEach(function (x) { li.push('<li><b>Skipped</b>' + esc(x.name) + ' (' + esc(x.reason.toLowerCase()) + ')</li>'); });
    if (w.open.length) li.push('<li><b>Not marked yet</b>' + esc(names(w.open.map(function (x) { return x.name; }))) + '</li>');
    if (w.noted.length) li.push('<li><b>Notes saved</b>' + esc(names(w.noted)) + '</li>');
    var tm = NBA.lists(NBA.analyze(state, state.me, { asOf: NBA.addDays(an.asOf, 1) })).top3;
    if (tm.length) li.push('<li><b>Tomorrow\'s likely visits</b>' + esc(names(tm.map(function (c) { return c.name; }))) + '</li>');
    bot('<h3>Your day, ' + esc(state.me.split(' ')[0]) + '</h3>' +
      tiles([['Visited', String(w.visited.length), w.open.length ? 'some still open' : w.planned ? 'of today\'s plan' : 'none planned'], ['Deals', w.deals.n ? $$(w.deals.total) : '0', w.deals.n ? 'closed today' : 'none logged'], ['Notes', String(w.noted.length), w.missingNotes.length ? 'some missing' : 'up to date']]) +
      (w.missingNotes.length ? '<div class="acts">' + w.missingNotes.slice(0, 3).map(function (x) { return '<button class="full" data-do="note" data-for="' + esc(x.cid) + '">+ Note for ' + esc(x.name) + '</button>'; }).join('') + '</div>' : '') +
      (li.length ? more('Details', '<ul class="facts">' + li.join('') + '</ul>') : '') +
      trail([['Visits', 'today\'s plan of ' + w.planned + ' against visits marked on this phone for ' + an.asOf], ['Deals', 'deals logged in the app dated ' + an.asOf + ', summed'], ['Notes', 'notes saved today; “missing” = visited or closed a deal today with no note'], ['Tomorrow', 'the same visit priority ranking, calculated for ' + NBA.addDays(an.asOf, 1) + ' (customers contacted in the last ' + NBA.RULES.visitedDays + ' days are held back)']]), 'wide');
  }
  function celebrate() {
    var orb = document.querySelector('.top .orb'); orb.classList.add('win'); setTimeout(function () { orb.classList.remove('win'); }, 2600);
    if (still()) return;
    var box = document.createElement('div'); box.className = 'confetti'; var colors = ['#9be22d', '#2a78d6', '#ff8fb4', '#ffd166', '#10151f', '#8f7bff'];
    for (var i = 0; i < 46; i++) {
      var c = document.createElement('i'), ang = Math.random() * Math.PI * 2, dist = 90 + Math.random() * 220;
      c.style.cssText = 'background:' + colors[i % colors.length] + ';--x:' + Math.round(Math.cos(ang) * dist) + 'px;--y:' + Math.round(Math.sin(ang) * dist - 120) + 'px;--r:' + Math.round(Math.random() * 720 - 360) + 'deg;animation-delay:' + Math.round(Math.random() * 120) + 'ms;' + (i % 3 ? '' : 'border-radius:50%;');
      box.appendChild(c);
    }
    document.body.appendChild(box); setTimeout(function () { box.remove(); }, 2200);
  }
  // ---- manager brief on the Revenue tab: same typed style as the chat
  var dashRun = 0;
  function showDash() {
    var el = $('#view-dash'), run = ++dashRun; window.NBADash.render(el, state, dashSp);
    if (!state.tx.length) return;
    var m = NBA.managerSummary(state, dashSp), card = document.createElement('div'); card.className = 'panel mbrief';
    card.innerHTML = '<div class="typing"><span class="orb xs"></span><span class="dots"><i></i><i></i><i></i></span></div>';
    el.insertBefore(card, el.firstChild);
    // this week, at a glance
    var D = NBA.weeklyDigest(state, dashSp), wk = document.createElement('div'); wk.className = 'panel digest';
    wk.innerHTML = '<div class="row"><h3>This week</h3><button class="linkbtn" data-act="digest">Export</button></div><p class="small">' + esc(D.period) + '</p>' +
      '<div class="tiles two">' + D.tiles.map(function (t) { return '<div class="tile"><small>' + esc(t.label) + '</small><b>' + esc(t.value) + '</b><span class="' + (t.dir === 'up' ? 'delta up' : t.dir === 'down' ? 'delta down' : '') + '">' + (t.dir === 'up' ? '▲ ' : t.dir === 'down' ? '▼ ' : '') + esc(t.sub) + '</span></div>'; }).join('') + '</div>' +
      D.sections.map(function (s) { return more(s.heading, '<ul>' + s.bullets.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>'); }).join('') + trail(D.audit);
    el.insertBefore(wk, card.nextSibling);
    // track record: is Nudge getting it right, against simple alternatives, a holdout and people's own picks
    var Lr = NBA.learning(state, dashSp), lp = document.createElement('div'); lp.className = 'panel learn';
    if (Lr.samples) {
      var props = Lr.factors.filter(function (f) { return f.step && !f.dismissed; }), Hr = NBA.holdoutResult(state, dashSp), Pk = NBA.pickScore(state, dashSp), bl = Lr.baselines;
      function pc(x) { return Math.round(x * 100); }
      var BL = [['nudge', 'Nudge\'s top 3'], ['overdue', 'Most overdue'], ['biggest', 'Biggest customers'], ['random', 'Random pick']];
      lp.innerHTML = '<h3>Is Nudge getting it right?</h3>' + scoreLine(Lr, !dashSp) +
        '<div class="group">By band</div>' + ['Likely', 'Maybe', 'Unlikely'].map(function (b) { return meter(b + ' (' + Lr.bands[b].n + ')', pc(Lr.bands[b].rate), b === 'Likely' ? 'go' : b === 'Maybe' ? 'warn' : 'ink', pc(Lr.bands[b].rate) + '%'); }).join('') + meter('All active', pc(Lr.base), 'ink', pc(Lr.base) + '%') +
        '<div class="group">Compared with simple ways of picking 3</div>' + BL.map(function (x) { var v = bl[x[0]]; return meter(x[1], pc(v.rate), x[0] === 'nudge' ? 'go' : 'ink', pc(v.rate) + '%') + '<p class="small bl">' + $$(v.revPer) + ' per pick</p>'; }).join('') +
        (Lr.misses.length ? '<div class="group">Latest misses</div><ul class="facts">' + Lr.misses.map(function (m) { return '<li><b>' + NBA.shortDate(m.date) + '</b>I said ' + esc(m.name) + ' would order. They didn\'t.</li>'; }).join('') + '</ul>' : '') +
        '<div class="group">Revenue Nudge helped add (estimate)</div>' +
        (Hr.ready ? '<p class="hero-mini">' + (Hr.estimate >= 0 ? '+' : '') + $$(Hr.estimate) + '</p><p class="small">From ' + Hr.shown.n + ' shown and ' + Hr.held.n + ' held-back customers over ' + Hr.days + ' days. Shown: ' + pc(Hr.shown.rate) + '% ordered; held back: ' + pc(Hr.held.rate) + '%.</p>'
          : '<p class="small">' + (Hr.share ? 'Measuring: ' + Hr.days + ' days collected, ' + Hr.pending + ' waiting for their 14-day result. ' + pc(Hr.share) + '% of eligible customers are held back each day.' : 'Holdout is off. Switch it on in the menu to measure the revenue Nudge helps add.') + '</p>') +
        '<div class="group">Your pick vs Nudge\'s pick</div>' +
        (Pk.done.length ? tiles([['You', Pk.you.hit + ' of ' + Pk.you.n, 'ordered'], ['Nudge', Pk.nudge.hit + ' of ' + Pk.nudge.n, 'ordered']]) +
          more('Latest: ' + NBA.shortDate(Pk.done[0].date), '<div class="vs"><div><b>You</b>' + Pk.done[0].you.map(pickRow).join('') + '</div><div><b>Nudge</b>' + Pk.done[0].nudge.map(pickRow).join('') + '</div></div>') : '') +
        (Pk.pending.length ? '<p class="small">' + Pk.pending.length + ' picks waiting for their 14-day result.</p>' : '') +
        '<button class="btn wide" data-act="pick">Pick your 3 for this week</button>' +
        props.map(function (f) {
          return '<div class="prop" data-label="' + esc(f.label) + '" data-step="' + f.step + '"><p><b>' + esc(f.label) + '</b> ' + (f.step > 0 ? 'works better than its weight suggests' : 'is weaker than its weight suggests') + '. ' + (f.step > 0 ? 'Raise' : 'Lower') + ' it from ' + (f.pts + f.delta) + ' to ' + (f.pts + f.delta + f.step) + ' points?</p>' +
            '<p class="small">' + f.n + ' past flags: ' + Math.round(f.rate * 100) + '% ordered within ' + Lr.days + ' days, against ' + Math.round(Lr.base * 100) + '% overall.</p><div class="acts"><button class="pri" data-tune="apply">Apply</button><button data-tune="dismiss">Dismiss</button></div></div>';
        }).join('') +
        (Lr.applied.length ? more('Changes applied (' + Lr.applied.length + ')', '<ul>' + Lr.applied.map(function (a) { return '<li><b>' + esc(a.label) + '</b>: ' + (a.delta > 0 ? '+' : '') + a.delta + ' points, ' + NBA.shortDate(a.date) + ' <button class="linkbtn" data-tune="undo" data-label="' + esc(a.label) + '">Undo</button></li>'; }).join('') + '</ul>') : '') +
        more('Each rule\'s record', '<table class="dtable"><tr><th>Rule</th><th>Flags</th><th>Ordered</th><th>vs average</th></tr>' + Lr.factors.map(function (f) { return '<tr><td>' + esc(f.label) + '</td><td>' + f.n + '</td><td>' + Math.round(f.rate * 100) + '%</td><td>' + f.lift.toFixed(2) + '×</td></tr>'; }).join('') + '</table>') +
        trail([['Method', Lr.tech], ['Simple ways', Lr.baseTech], ['Holdout', Hr.tech], ['Your pick', 'up to 3 customers chosen by a person, judged 14 days later against Nudge\'s top 3 from the same day; ' + Pk.done.length + ' picks judged']]
          .concat(Lr.factors.map(function (f) { return [f.label, f.tech]; })).concat([['Control', 'nothing changes unless a manager taps Apply; each change is dated, shown in every affected score\'s trail, and can be undone']]));
      wk.parentNode.insertBefore(lp, wk.nextSibling);
      lp.addEventListener('click', function (e) {
        var b = e.target.closest('[data-tune]'); if (!b) return; var box = b.closest('[data-label]'), label = box.dataset.label;
        state.tuning = state.tuning || {}; state.tuneDismissed = state.tuneDismissed || {};
        if (b.dataset.tune === 'apply') { var cur = (state.tuning[label] || {}).delta || 0; state.tuning[label] = { delta: cur + +box.dataset.step, date: NBA.todayISO() }; }
        else if (b.dataset.tune === 'undo') { delete state.tuning[label]; delete state.tuneDismissed[label]; }
        else state.tuneDismissed[label] = NBA.todayISO();
        save(); refresh(); showDash();
      });
    }

    // what reps said about Nudge's suggestions, for the manager
    var fbl = (state.feedback || []).filter(function (f) { return !dashSp || f.sp === dashSp; }).map(function (f) { return { ts: f.ts, sp: f.sp, text: (f.cname || f.cid) + ': wrong, because ' + label(WRONG, f.reason).toLowerCase() }; })
      .concat((state.swaps || []).filter(function (x) { return !dashSp || x.sp === dashSp; }).map(function (x) { return { ts: x.ts, sp: x.sp, text: 'Swapped ' + x.outName + ' for ' + x.inName + ' (' + label(SWAPWHY, x.reason).toLowerCase() + ')' }; }))
      .sort(function (a, b) { return a.ts < b.ts ? 1 : -1; });
    if (fbl.length) {
      var fp = document.createElement('div'); fp.className = 'panel';
      fp.innerHTML = '<h3>Feedback from reps (' + fbl.length + ')</h3><ul class="facts">' + fbl.slice(0, 8).map(function (x) { return '<li><b>' + NBA.shortDate(x.ts.slice(0, 10)) + ', ' + esc(x.sp) + '</b>' + esc(x.text) + '</li>'; }).join('') + '</ul>' +
        (fbl.length > 8 ? more('Show all ' + fbl.length, '<ul>' + fbl.slice(8).map(function (x) { return '<li>' + NBA.shortDate(x.ts.slice(0, 10)) + ', ' + esc(x.sp) + ': ' + esc(x.text) + '</li>'; }).join('') + '</ul>') : '') +
        trail([['Source', '“Wrong, because…” taps and visit swaps saved on this phone; also in the Excel portfolio export']]);
      (lp.parentNode ? lp : wk).after(fp);
    }
    card.addEventListener('pointerdown', function () { fast = true; skippers.splice(0).forEach(function (f) { f(); }); });
    pause(900).then(function () {
      if (run !== dashRun) return;
      card.innerHTML = '<p class="lead">' + esc(m.headline) + '</p>' +
        more('More from the manager brief', '<ul class="facts">' + m.points.map(function (x) { return '<li><b>' + esc(x.label) + '</b>' + esc(x.text) + '</li>'; }).join('') + '</ul>') +
        trail([['Revenue', 'this year to date against the same dates last year, from all uploaded sales rows plus deals logged in the app'], ['Accounts at risk', 'customers with a risk score of ' + NBA.RULES.listThreshold + ' or more, largest 12-month revenue first'], ['Target', (m.target || {}).tech], ['Visit plans', 'planned visits and those marked done on this device, last 7 days']].concat(m.points.filter(function (x) { return x.kind === 'expiry'; }).map(function (x) { return [x.label, x.tech]; })));
      return typeOut(card);
    }).then(function () { if (!pending) fast = false; });
  }

  function showList(kind) {
    refresh(); if (!an) return;
    var L = NBA.lists(an), list = L[kind], close = kind === 'close';
    if (!list.length) { bot('<p>' + (close ? 'No customer stands out as ready to buy today.' : 'No customer shows a strong sign of leaving today.') + '</p>' + trail([['Rule', 'no active customer has a ' + (close ? 'close' : 'risk') + ' score of ' + NBA.RULES.listThreshold + ' or more']])); return; }
    bot('<h3>' + (close ? 'Likely to close' : 'May churn') + '</h3><div class="rowlist">' +
      list.map(function (c) {
        var f = c.factors.filter(function (x) { return x.bucket === kind && x.pts > 0; }).sort(function (a, b) { return b.pts - a.pts; })[0], v = close ? c.close : c.churn;
        void v; return '<button data-cid="' + esc(c.cid) + '"><span>' + esc(c.name) + '<span class="sub">' + esc(f ? f.plain : '') + '</span></span>' + bandHTML(close ? 'close' : 'risk', close ? c.closeBand : c.riskBand) + '</button>';
      }).join('') + '</div>' +
      trail([['Rule', (close ? 'close' : 'risk') + ' score of ' + NBA.RULES.listThreshold + ' or more, highest first, at most 5']].concat(list.map(function (c) { var fs = c.factors.filter(function (x) { return x.bucket === kind; }), ev = (fs.filter(function (x) { return x.ev; })[0] || {}).ev; return [c.name + ': ' + (close ? c.close : c.churn) + ' / 100', fs.map(function (x) { return x.tech; }).join(' | '), orders(c, ev)]; })), true), 'wide');
  }
  function showCustomer(cid, echo) {
    refresh(); var c = cust(cid); if (!c) return;
    if (echo !== false) said(c.name);
    bot('<div data-cid="' + esc(c.cid) + '"><div class="chead"><div><h3>' + esc(c.name) + '</h3><div class="cmeta">' + tag(c) + conf(c) + '</div></div><button class="plus" data-do="note" aria-label="Add visit note">+</button></div>' +
      blockedLine(c) + (toldLine(c) ? '<p>' + toldLine(c) + '</p>' : '') +
      (c.collect ? '<p class="blocked">On credit hold: ' + $$(c.collect.amount) + ' overdue. No sales push today.</p>' : '') +
      (c.viaGroup ? '<p class="small">Ordered through ' + esc(c.viaGroup.name) + ' on ' + NBA.shortDate(c.viaGroup.last) + '.</p>' : '') +
      rhythm(c) +
      tiles([['Usual order', $$(c.avgOrder), 'per order'], ['12 months', $$(c.rev12), c.revPrev90 > 0 ? trendWord(c) : c.yoy == null ? '' : c.yoy >= 0 ? '▲ up' : '▼ down']]) +
      (c.context.length ? more('What you know (' + c.context.length + ')', '<ul>' + c.context.slice(0, 5).map(function (n) { return '<li><b>' + NBA.shortDate(n.ts.slice(0, 10)) + '</b>: <span class="nt">' + esc(n.transcript) + '</span></li>'; }).join('') + '</ul>') : '') +
      acts([['pitch', 'What to say', 'pri full']]) +
      '<div class="crow"><button data-do="why">' + ICON.why + '<span>Why</span></button><button data-do="file">' + ICON.file + '<span>File</span></button>' +
      (NBA.reorderMessage(c, an, state.me) ? '<button data-do="wa">' + ICON.chat + '<span>Message</span></button>' : '') +
      '<button data-do="cmore" aria-label="More actions">' + ICON.dots + '<span>More</span></button></div>' +
      more('More detail', bands(c) + spark(c)) + '</div>' +
      trail([['Tiles', 'last order ' + c.last + ' (shown in the order rhythm); usual order = average of ' + c.nOrders + ' orders; 12-month revenue = sales from ' + NBA.addDays(an.asOf, -364) + ' to ' + an.asOf, orders(c, 'orders')], ['Order rhythm', 'days since last order ' + c.recency + ' against median gap ' + Math.round(c.gapUsed) + ' (ratio ' + c.ratio.toFixed(2) + '); shaded band = due window ' + NBA.RULES.reorderWindow[0] + ' to ' + NBA.RULES.reorderWindow[1] + ' × gap'], ['Spend line', 'sales summed by calendar month, ' + c.months12[0].key + ' to ' + c.months12[11].key, orders(c, 'w365')], ['Confidence', c.nOrders + ' orders' + (c.rough ? ' (fewer than ' + NBA.RULES.roughOrders + ': rough guess)' : '')], ['Bands', 'close ' + c.close + ' → ' + c.closeBand + ', risk ' + c.churn + ' → ' + c.riskBand + ' (' + NBA.RULES.bandHigh + ' and ' + NBA.RULES.bandMid + ' are the cut-offs); priority ' + c.priority], ['Your feedback', c.blocked ? c.blocked.tech : ''], ['Group', c.viaGroup ? 'ordered through ' + c.viaGroup.name + ' on ' + c.viaGroup.last + ' (' + c.viaGroup.recency + ' days ago); the group\'s orders count as activity for this branch, so lateness uses ' + c.viaGroup.recency + ' days, not ' + c.recency : ''],
        ['Credit', c.credit ? 'from the ' + c.credit.src + ': hold ' + (c.credit.hold === true ? 'yes' : c.credit.hold === false ? 'no' : 'not given') + ', overdue ' + $$(c.credit.overdue || 0) + (c.collect ? ' → collect first, no sales push' : '') : ''],
        ['Festive period', c.festive ? c.festive.name + ' ended ' + c.festive.to + '; for ' + NBA.RULES.festiveAfterDays + ' days after, lateness counts ×' + NBA.RULES.festiveFactor : ''], ['Usual rhythm', c.gapsSkipped ? c.gapsSkipped + ' gaps across festive periods left out of the median' : '']].concat(scoreTrail(c)), true), 'wide');
  }
  function showPitch(cid) {
    var c = cust(cid); if (!c) return; said('What to say to ' + c.name);
    var p = NBA.buildPitch(c, an);
    bot('<h3>What to say</h3><p class="small">' + esc(c.name) + '</p>' +
      (p.remember ? '<div class="remember"><small>Remember, from your note of ' + NBA.shortDate(p.remember.date) + '</small><span class="nt">' + esc(p.remember.text) + '</span></div>' : '') +
      p.points.map(function (x, i) { return '<details class="pt"><summary><b>' + (i + 1) + '</b>' + esc(x.title) + '</summary><p>' + esc(x.text) + '</p><span class="src">From: ' + esc(x.src) + '</span></details>'; }).join('') +
      '<div class="pitch-ask">' + esc(p.ask) + '</div>' + more('How to open', '<p>' + esc(p.open) + '</p>') +
      trail([['Opening and ask', p.openTech]].concat(p.remember ? [['Remember', 'your latest context note, shown as written; it does not affect the points below']] : []).concat(p.points.map(function (x, i) { return ['Point ' + (i + 1) + ' (' + x.src + ')', x.tech, x.src === 'Sales data' ? orders(c, 'orders') : '']; })), true), 'wide');
  }
  function showWhy(cid) {
    var c = cust(cid); if (!c) return; said('Why ' + c.name + '?');
    function rows(bucket, title) {
      var fs = c.factors.filter(function (x) { return x.bucket === bucket && x.pts; });
      if (!fs.length) return '';
      return '<div class="group">' + title + '</div><ul class="reasons">' + fs.map(function (x) { return '<li class="' + ((bucket === 'churn') === (x.pts > 0) ? 'bad' : 'good') + '"><i aria-hidden="true">' + (x.pts < 0 ? '▼' : '▲') + '</i><span><b>' + esc(x.label) + '</b>' + esc(x.plain) + '</span></li>'; }).join('') + '</ul>';
    }
    bot('<h3>Why ' + esc(c.name) + '</h3>' + bands(c) + blockedLine(c) +
      rows('close', 'Chance to close') + rows('churn', 'Risk of leaving') + rows('priority', 'Visit order') +
      trail([['Scores', 'each score is the sum of the points below, limited to 0–100; bands: ' + NBA.RULES.bandHigh + ' and ' + NBA.RULES.bandMid + ' are the cut-offs'], ['Now', 'close ' + c.close + ' (' + c.closeBand + '), risk ' + c.churn + ' (' + c.riskBand + '), priority ' + c.priority], ['When', 'calculated on ' + an.asOf + ' from sales up to ' + (an.dataTo || an.asOf) + '; the same working is saved in the customer file']].concat(scoreTrail(c)), true), 'wide');
  }

  // ------------------------------------------------------------ bottom sheet
  function openSheet(title, bodyHTML, footHTML) {
    $('#sheet-title').textContent = title; $('#sheet-body').innerHTML = bodyHTML; $('#sheet-foot').innerHTML = footHTML || '';
    sheet.hidden = false; $('#sheet-body').scrollTop = 0;
  }
  var onClose = null;
  function closeSheet() { sheet.hidden = true; if (onClose) { var f = onClose; onClose = null; f(); } }
  sheet.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) closeSheet(); });

  function chipsHTML(items, sel) {
    return '<div class="chips">' + items.map(function (k) { return '<button class="chip" aria-pressed="' + (sel && sel.indexOf(k[0]) >= 0) + '" data-k="' + esc(k[0]) + '">' + esc(k[1]) + '</button>'; }).join('') + '</div>';
  }

  // ---- visit note: speak, type or tap. Two ways to save: for the scores (keywords) or as context (knowledge only).
  function noteSheet(cid) {
    var c = cust(cid); if (!c) return;
    var groups = {}; NBA.KEYWORDS.forEach(function (k) { (groups[k.group] = groups[k.group] || []).push([k.id, k.label]); });
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition, voice = SR && state.settings.voice;
    var h = '<div class="tonebar"><span class="orb sm" id="note-orb"></span><span id="tone-text">Speak, type or tap. I will listen for good and bad news.</span></div>';
    if (voice) h += '<button class="mic" id="mic"><svg viewBox="0 0 24 24"><path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span>Speak your note</span></button>' +
      '<div class="heard" id="heard" hidden><p id="heard-text" class="nt"></p><button class="linkbtn" id="redo">Delete and record again</button></div>';
    else if (!SR && state.settings.voice) h += '<p class="small">Voice notes are not available in this browser.</p>';
    h += '<textarea class="typed" id="typed" rows="3" placeholder="Or type your note here" aria-label="Type your note"></textarea>' +
      '<p class="small ignored" id="ignored" hidden></p>' +
      '<p class="small seenby">Who can see notes: anyone using Nudge on this phone, and people you send an internal export to. Never the customer.</p>' +
      (voice ? more('About voice and privacy', '<p>Voice uses your phone\'s own speech service, which on some phones sends the audio to Apple or Google. For sensitive visits, type or tap instead.</p>') : '');
    Object.keys(groups).forEach(function (g) { h += '<div class="group">' + g + '</div><div data-kw>' + chipsHTML(groups[g]) + '</div>'; });
    h += '<div class="group">Talked about</div><div data-cat>' + chipsHTML(an.categories.map(function (x) { return [x, x]; })) + '</div>';
    openSheet('Visit note: ' + c.name, h, '<button class="btn" id="save-context" disabled>Save as context</button><button class="btn pri" id="save-note" disabled>Save for scores</button>');
    var body = $('#sheet-body'), saveBtn = $('#save-note'), ctxBtn = $('#save-context'), typed = $('#typed'), panel = sheet.querySelector('.sheet-panel');
    var transcript = '', rec = null, finalText = '', auto = {}, lastK = { ignored: [] }; // chips switched on by spoken or typed words, so changing the words can undo them
    function sel(attr) { return [].map.call(body.querySelectorAll('[' + attr + '] .chip[aria-pressed="true"]'), function (b) { return b.dataset.k; }); }
    function text() { return [transcript, typed.value.trim()].filter(Boolean).join(' '); }
    function check() {
      var kws = sel('data-kw'), t = NBA.tone(kws);
      saveBtn.disabled = !(kws.length || sel('data-cat').length || text()); ctxBtn.disabled = !text();
      panel.dataset.tone = t; // colours the orb: green for good news, red for concerns
      $('#tone-text').textContent = t === 'pos' ? 'Sounds like good news.' : t === 'neg' ? 'Sounds like a concern.' : kws.length ? 'Mixed: good and bad news balance out.' : text() ? 'No keyword picked up yet.' : 'Speak, type or tap. I will listen for good and bad news.';
    }
    function sync() {
      var k = NBA.extractKeywords(text(), an.categories), want = {}; lastK = k;
      k.keywords.forEach(function (id) { var b = body.querySelector('[data-kw] .chip[data-k="' + id + '"]'); if (b) want['kw:' + id] = b; });
      k.cats.forEach(function (x) { [].forEach.call(body.querySelectorAll('[data-cat] .chip'), function (b) { if (b.dataset.k === x) want['cat:' + x] = b; }); });
      Object.keys(auto).forEach(function (key) { if (!want[key]) { auto[key].setAttribute('aria-pressed', 'false'); delete auto[key]; } });
      Object.keys(want).forEach(function (key) { var b = want[key]; if (b.getAttribute('aria-pressed') !== 'true') { b.setAttribute('aria-pressed', 'true'); auto[key] = b; } });
      var ig = $('#ignored'); ig.hidden = !k.ignored.length; ig.textContent = k.ignored.length ? 'Ignored (negated): ' + k.ignored.map(function (x) { return x.label; }).join(', ') : '';
    }
    typed.oninput = function () { sync(); check(); };
    body.onclick = function (e) {
      var ch = e.target.closest('.chip'); if (ch) { ch.setAttribute('aria-pressed', ch.getAttribute('aria-pressed') !== 'true'); Object.keys(auto).forEach(function (key) { if (auto[key] === ch) delete auto[key]; }); check(); }
    };
    var stop = function () {};
    if (voice) {
      var mic = $('#mic'), heard = $('#heard'), heardText = $('#heard-text');
      stop = function () { if (rec) { try { rec.stop(); } catch (e) {} rec = null; } mic.classList.remove('on'); panel.classList.remove('listening'); if ($('#app').dataset.state === 'listening') delete $('#app').dataset.state; mic.lastChild.textContent = transcript ? 'Speak again to add more' : 'Speak your note'; };
      var hear = function (t) { transcript = t; heard.hidden = !t; heardText.textContent = t; sync(); check(); };
      mic.onclick = function () {
        if (rec) { stop(); return; }
        try {
          rec = new SR(); rec.lang = navigator.language || 'en-US'; rec.interimResults = true; rec.continuous = true;
          rec.onresult = function (ev) {
            var interim = '';
            for (var i = ev.resultIndex; i < ev.results.length; i++) { if (ev.results[i].isFinal) finalText += ev.results[i][0].transcript + ' '; else interim += ev.results[i][0].transcript; }
            hear((finalText + interim).trim());
          };
          rec.onerror = function (ev) { if (!transcript) { heard.hidden = false; heardText.textContent = ev.error === 'not-allowed' ? 'Microphone is blocked. Allow it in your browser settings, or type instead.' : 'I could not hear that. Try again, or type instead.'; } stop(); };
          rec.onend = function () { rec = null; stop(); };
          rec.start(); mic.classList.add('on'); panel.classList.add('listening'); $('#app').dataset.state = 'listening'; mic.lastChild.textContent = 'Listening… tap to stop';
        } catch (e) { rec = null; }
      };
      // delete the recording and start over, without leaving this screen
      $('#redo').onclick = function () {
        stop(); transcript = ''; finalText = ''; sync(); heard.hidden = true; heardText.textContent = ''; mic.lastChild.textContent = 'Speak your note'; delete saveBtn.dataset.warned; saveBtn.textContent = 'Save for scores';
        var w = body.querySelector('.warn-box'); if (w) w.remove(); check();
      };
      panel._test = { hear: hear }; // lets automated tests feed a transcript without a microphone
    }
    onClose = function () { stop(); delete panel.dataset.tone; panel.classList.remove('listening'); };
    check();

    // save as context: longer notes kept as knowledge. No keyword matching, no effect on scores.
    ctxBtn.onclick = function () {
      var note = { id: uid(), cid: c.cid, ts: stamp(), type: 'context', keywords: [], cats: [], transcript: text(), typed: !transcript };
      state.notes.push(note); save(); closeSheet(); refresh();
      said('Context for ' + c.name);
      var n = cust(c.cid).context.length;
      bot('<p><b>Saved as context</b> for ' + esc(c.name) + '.</p><p class="small">' + n + (n === 1 ? ' context note' : ' context notes') + ' on file. Scores are unchanged, by design.</p>' +
        more('What I will do with it', '<p>I show the latest context note as a reminder above “What to say”, list them under “What you know” on the customer card, and include them in the customer file and internal exports. They never go in the customer-facing one-pager.</p>') +
        trail([['Stored', 'the text as written, dated ' + note.ts.slice(0, 10) + ', on this phone only'], ['Scores', 'context notes are not matched to keywords and are not counted as a visit, so close, risk and priority stay the same']]));
    };
    // save for scores: keywords move the scores and the pitch
    saveBtn.onclick = function () {
      if (text() && !sel('data-kw').length && !saveBtn.dataset.warned) {
        saveBtn.dataset.warned = 1; saveBtn.textContent = 'Save anyway';
        var wn = document.createElement('p'); wn.className = 'warn-box'; wn.textContent = 'I did not pick up a keyword, so the scores will not move. Tap a keyword that fits, or use “Save as context” to keep this as background knowledge.';
        body.insertBefore(wn, body.querySelector('.group')); body.classList.add('nudge-kw'); wn.scrollIntoView({ block: 'center' }); return;
      }
      var before = { close: c.close, churn: c.churn };
      var note = { id: uid(), cid: c.cid, ts: stamp(), keywords: sel('data-kw'), cats: sel('data-cat'), transcript: text(), typed: !transcript && !!typed.value.trim(), ignored: lastK.ignored.filter(function (x) { return sel('data-kw').indexOf(x.id) < 0; }).map(function (x) { return x.id; }) };
      state.notes.push(note); save(); closeSheet(); refresh(); autoVisited(c.cid);
      var n = cust(c.cid);
      said('Note for ' + c.name + ': ' + (note.keywords.map(function (id) { return NBA.KW[id].label; }).concat(note.cats).join(', ') || (note.typed ? 'typed note' : 'spoken note')));
      var moved = n.close !== before.close || n.churn !== before.churn;
      var why = !note.keywords.length ? 'No keyword was picked, so the scores stay as they were. The note text is kept in the customer file.' : 'These keywords carry no points right now, or the score is already at its limit.';
      bot('<p><b>Saved</b> to ' + esc(c.name) + '.</p>' +
        (moved ? '<div class="bands">' + (n.close !== before.close ? '<div class="bandrow"><span>Chance to close</span>' + (bandOf('close', before.close) !== n.closeBand ? bandHTML('close', bandOf('close', before.close)) + '<em>→</em>' : '') + bandHTML('close', n.closeBand) + '</div>' : '') + (n.churn !== before.churn ? '<div class="bandrow"><span>Risk of leaving</span>' + (bandOf('risk', before.churn) !== n.riskBand ? bandHTML('risk', bandOf('risk', before.churn)) + '<em>→</em>' : '') + bandHTML('risk', n.riskBand) + '</div>' : '') + '</div>' + (bandOf('close', before.close) === n.closeBand && bandOf('risk', before.churn) === n.riskBand ? '<p class="small">Scores moved, but not enough to change a band.</p>' : '') : '<p class="small">Scores did not change.</p>' + more('Why not?', '<p>' + why + '</p>')) +
        '<div data-cid="' + esc(c.cid) + '">' + acts([['pitch', 'See updated pitch', 'pri full']]) + '</div>' +
        trail([['Keywords saved', note.keywords.map(function (id) { return id === 'staying' ? 'staying (risk −' + NBA.RULES.stayingPts + ' for ' + NBA.RULES.stayingDays + ' days)' : id + ' (close ' + NBA.KW[id].close + ', risk ' + NBA.KW[id].churn + ')'; }).join(', ') || 'none'], ['Scores', 'close ' + before.close + ' → ' + n.close + ', risk ' + before.churn + ' → ' + n.churn + '; note points are capped at ±' + NBA.RULES.notePosCap + ' (close) and ±' + NBA.RULES.noteNegCap + ' (risk)'], ['Text', note.transcript ? 'only the fixed keywords found in your words affect scores; the text itself is stored in the customer file' : ''], ['Ignored', note.ignored.length ? 'negated in your words, so not counted: ' + note.ignored.join(', ') + ' (not, no, never, tak, tidak or bukan within 3 words before, or “but … rejected” just after)' : '']]));
    };
  }
  // In stale-data mode "today" for the model is the day after the newest sale, so notes and deals use that date.
  function stamp() { var t = new Date(); return (an && an.stale ? an.asOf : NBA.todayISO()) + 'T' + ('0' + t.getHours()).slice(-2) + ':' + ('0' + t.getMinutes()).slice(-2) + ':00'; }

  // ---- deal closed
  function nice(n) { var p = Math.pow(10, Math.max(1, Math.floor(Math.log10(n || 1)) - 1)); return Math.max(p, Math.round(n / p) * p); }
  function dealSheet(cid) {
    var c = cust(cid); if (!c) return;
    var base = c.avgOrder || 1000, quick = [nice(base * 0.5), nice(base), nice(base * 1.5), nice(base * 2)].filter(function (v, i, a) { return a.indexOf(v) === i; });
    var cats = Object.keys(c.cats).sort(function (a, b) { return c.cats[b].amt - c.cats[a].amt; });
    an.categories.forEach(function (x) { if (cats.indexOf(x) < 0) cats.push(x); });
    openSheet('Deal closed: ' + c.name,
      '<div class="group">How much was the deal?</div><div id="quick">' + chipsHTML(quick.map(function (v) { return [String(v), $$(v)]; })) + '</div>' +
      '<p class="small" style="margin:10px 0 6px">Or enter the exact amount (' + esc(cur()) + ')</p><input class="amount" id="amt" type="number" inputmode="decimal" min="0" placeholder="0" aria-label="Deal amount">' +
      '<div class="group">What did they buy?</div><div id="dcat">' + chipsHTML(cats.map(function (x) { return [x, x]; }), [cats[0]]) + '</div>',
      '<button class="btn pri" id="save-deal" disabled>Save deal</button>');
    var amt = $('#amt'), btn = $('#save-deal');
    function val() { var v = parseFloat(amt.value); return v > 0 ? v : 0; }
    amt.oninput = function () { [].forEach.call(document.querySelectorAll('#quick .chip'), function (b) { b.setAttribute('aria-pressed', 'false'); }); btn.disabled = !val(); };
    $('#sheet-body').onclick = function (e) {
      var ch = e.target.closest('.chip'); if (!ch) return;
      [].forEach.call(ch.parentNode.children, function (b) { b.setAttribute('aria-pressed', 'false'); }); ch.setAttribute('aria-pressed', 'true');
      if (ch.closest('#quick')) { amt.value = ch.dataset.k; btn.disabled = false; }
    };
    btn.onclick = function () {
      var catBtn = document.querySelector('#dcat .chip[aria-pressed="true"]'), ts = stamp();
      var deal = { id: uid(), cid: c.cid, cname: c.name, sp: c.sp, seg: c.seg, date: ts.slice(0, 10), ts: ts, amt: val(), cat: catBtn ? catBtn.dataset.k : 'General', confirmed: false };
      state.deals.push(deal); save(); closeSheet(); refresh(); autoVisited(c.cid); celebrate();
      said('Deal closed with ' + c.name + ': ' + $$(deal.amt));
      var d = NBA.dashboard(state), me = d.people.filter(function (p) { return p.name === state.me; })[0], cc = d.customers.filter(function (x) { return x.cid === c.cid; })[0];
      var m = bot('<h3>Well done</h3>' + tiles([['Deal', $$(deal.amt), c.name], ['Your year', $$(me ? me.cur : deal.amt), 'so far'], ['On last year', d.hasPrev && me ? (me.inc >= 0 ? '+' : '-') + $$(Math.abs(me.inc)) : 'n/a', d.hasPrev && me ? (me.inc >= 0 ? 'ahead' : 'behind') : '']]) +
        acts([['dash', 'Open dashboard', 'full']]) +
        trail([['Your year', me ? 'sales ' + d.year + ' to date ' + $$(me.cur) + ' (including this deal) against ' + $$(me.prev) + ' for the same dates in ' + d.prevYear : ''], ['Customer', cc ? 'this year ' + $$(cc.cur) + ' against ' + $$(cc.prev) + ' last year' : ''], ['Double counting', 'the deal is counted from the app until an uploaded sales file covers it']]));
      scroll(m);
    };
  }

  // ---- customer file (.md)
  function download(name, blob) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
  function mdToHTML(md) {
    function inline(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|\s)_(.+?)_(?=\s|$|[.,])/g, '$1<i>$2</i>'); }
    var out = [], lines = md.split('\n'), i = 0, m;
    while (i < lines.length) {
      var l = lines[i];
      if ((m = l.match(/^(#{1,3}) (.*)/))) { out.push('<h' + m[1].length + '>' + inline(m[2]) + '</h' + m[1].length + '>'); i++; }
      else if (/^\|/.test(l)) {
        var rows = []; while (i < lines.length && /^\|/.test(lines[i])) { rows.push(lines[i]); i++; }
        out.push('<table>' + rows.filter(function (r) { return !/^\|[\s:|-]+\|$/.test(r); }).map(function (r, ri) {
          return '<tr>' + r.replace(/^\||\|$/g, '').split('|').map(function (c) { return (ri ? '<td>' : '<th>') + inline(c.trim()) + (ri ? '</td>' : '</th>'); }).join('') + '</tr>';
        }).join('') + '</table>');
      }
      else if (/^- /.test(l)) { var li = []; while (i < lines.length && /^- /.test(lines[i])) { li.push('<li>' + inline(lines[i].slice(2)) + '</li>'); i++; } out.push('<ul>' + li.join('') + '</ul>'); }
      else { if (l.trim()) out.push('<p>' + inline(l) + '</p>'); i++; }
    }
    return out.join('');
  }
  function fileSheet(cid) {
    var c = cust(cid); if (!c) return;
    var md = NBA.customerMarkdown(c, an), name = NBA.fileName(c);
    openSheet(name, '<div class="md nt">' + mdToHTML(md) + '</div>', '<button class="btn pri" id="dl">Download ' + esc(name) + '</button>');
    $('#dl').onclick = function () { download(name, new Blob([md], { type: 'text/markdown' })); };
  }
  function downloadAll() {
    refresh(); if (!an) return;
    var zip = new window.JSZip();
    an.customers.forEach(function (c) { zip.file(NBA.fileName(c), NBA.customerMarkdown(c, an)); });
    zip.generateAsync({ type: 'blob' }).then(function (b) { download('customer-files-' + state.me.replace(/\s+/g, '-') + '.zip', b); });
  }

  // ---- How Nudge decides: every rule, generated from the rules themselves, with a live same-answer check
  function sameAnswer() {
    if (!state.tx.length || !state.me) return null;
    function run() { var z = NBA.analyze(state, state.me); return JSON.stringify([NBA.lists(z).top3.map(function (c) { return c.cid; }), z.customers.map(function (c) { return [c.cid, c.priority, c.close, c.churn, c.factors]; })]); }
    return run() === run();
  }
  function rulesSheet() {
    var doc = NBA.rulesDoc(state), same = sameAnswer(), t = Object.keys(state.tuning || {}).length;
    openSheet('How Nudge decides', '<p class="small" style="margin:0">Rules version ' + NBA.RULES.version + ', ' + NBA.shortDate(NBA.RULES.date) + (t ? ', with ' + t + ' change' + (t === 1 ? '' : 's') + ' approved by a manager' : '') + '. Fixed rules and arithmetic, no AI model.</p>' +
      (same === null ? '' : same ? '<p class="okline">✓ Same file, same answer. I just worked out today\'s brief twice and got exactly the same result.</p>' : '<p class="warn-box">The two runs differed. Please report this.</p>') +
      doc.map(function (sec) { return '<div class="group">' + esc(sec.heading) + '</div><table class="dtable rules">' + sec.rows.map(function (r) { return '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td></tr>'; }).join('') + '</table>'; }).join('') +
      '<p class="small" style="margin-top:14px">This page is generated from the rules the app runs, so it is always up to date. Version stamp: ' + esc(NBA.stamp(state)) + '.</p>');
  }

  // ---- festive periods: Malaysian defaults, dates editable for each year
  function festiveSheet() {
    var list = NBA.holidays(state).slice().sort(function (a, b) { return a.from < b.from ? -1 : 1; });
    openSheet('Festive periods', '<p class="small" style="margin:0 0 10px">Gaps across these dates are left out of the usual rhythm, and lateness counts for less for 14 days after each.</p>' +
      '<table class="dtable fest"><tr><th></th><th>From</th><th>To</th></tr>' + list.map(function (h, i) { return '<tr data-i="' + i + '"><td>' + esc(h.name) + '</td><td><input type="date" value="' + h.from + '" data-f="from" aria-label="From"></td><td><input type="date" value="' + h.to + '" data-f="to" aria-label="To"></td></tr>'; }).join('') + '</table>' +
      '<button class="linkbtn" id="fest-reset">Reset to Malaysian defaults</button>', '<button class="btn pri" id="fest-save">Save festive periods</button>');
    $('#fest-reset').onclick = function () { delete state.settings.holidays; save(); closeSheet(); refresh(); festiveSheet(); };
    $('#fest-save').onclick = function () {
      state.settings.holidays = [].map.call(document.querySelectorAll('.fest tr[data-i]'), function (tr) { var h = list[+tr.dataset.i]; var f = tr.querySelector('[data-f="from"]').value || h.from, t = tr.querySelector('[data-f="to"]').value || h.to; return { name: h.name, from: f <= t ? f : t, to: f <= t ? t : f }; });
      save(); closeSheet(); refresh(); bot('<p>Festive periods saved.</p>' + trail([['Used for', 'the usual rhythm (gaps across these dates are left out) and lateness (counts ×' + NBA.RULES.festiveFactor + ' for ' + NBA.RULES.festiveAfterDays + ' days after each)']]));
    };
  }

  // ---- lists and settings
  function customersSheet(title, cb) {
    refresh(); if (!an) return;
    var list = an.customers.slice().sort(function (a, b) { return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1; });
    function row(c) { return '<button data-cid="' + esc(c.cid) + '"><span>' + esc(c.name) + '</span>' + tag(c) + '</button>'; }
    var top = cb ? NBA.lists(an).top3 : [];
    openSheet(title || 'My customers (' + list.length + ')',
      (top.length ? '<div class="group">Today\'s visits</div><div class="rowlist" style="margin:0">' + top.map(row).join('') + '</div><div class="group">All customers</div>' : '') +
      '<div class="rowlist" style="margin:0">' + list.map(row).join('') + '</div>');
    $('#sheet-body').onclick = function (e) { var b = e.target.closest('[data-cid]'); if (b) { closeSheet(); if (cb) cb(b.dataset.cid); else showCustomer(b.dataset.cid); } };
  }
  function moreSheet() {
    var cs = ['RM', 'S$', '$', '€', '£', '₹', 'Rp', '¥'];
    var when = NBA.asOfDate(state), nCust = {}; state.tx.forEach(function (t) { nCust[t.cid] = 1; });
    openSheet('Menu',
      '<div class="rowlist" style="margin:0 0 6px"><button data-act="export"><span>Export</span></button><button data-act="rules"><span>How Nudge decides</span></button><button data-act="tab-brief"><span>Brief</span>' + (view === 'brief' ? '<span class="tag">Open</span>' : '') + '</button><button data-act="tab-dash"><span>Dashboard</span>' + (view === 'dash' ? '<span class="tag">Open</span>' : '') + '</button></div>' +
      '<div class="group">On this phone</div><p class="small" style="margin:0 0 8px">' + state.tx.length.toLocaleString() + ' sales rows for ' + Object.keys(nCust).length + ' customers, up to ' + (when.dataTo ? NBA.shortDate(when.dataTo) : 'n/a') + '. ' +
      state.targets.length + ' monthly targets. ' + state.campaigns.length + ' campaigns. ' + state.docs.length + ' document' + (state.docs.length === 1 ? '' : 's') + (state.docs.length ? ' (' + state.docs.map(function (d) { return esc(d.name); }).join(', ') + ')' : '') + '. ' + state.notes.length + ' visit notes. ' + state.deals.length + ' deals logged.</p>' +
      '<div class="rowlist"><button data-m="zip">Download all my customer files (.zip)</button><button data-m="sample">Load sample data</button></div>' +
      '<div class="group">Currency</div><div id="cur">' + chipsHTML(cs.map(function (x) { return [x, x]; }), [cur()]) + '</div>' +
      '<div class="group">Voice notes</div><div id="voice">' + chipsHTML([['on', 'On'], ['off', 'Off']], [state.settings.voice ? 'on' : 'off']) + '</div>' +
      '<div class="group">Language</div><div id="lang">' + chipsHTML([['en', 'English'], ['ms', 'Bahasa Melayu']], [state.settings.lang === 'ms' ? 'ms' : 'en']) + '</div>' +
      '<div class="group">Festive periods</div><div class="rowlist" style="margin:0"><button data-act="festive"><span>Edit festive periods<span class="sub">' + NBA.holidays(state).length + ' periods</span></span></button></div>' +
      '<div class="group">Holdout (measuring Nudge)</div><div id="hold">' + chipsHTML([['0', '0%'], ['0.1', '10%'], ['0.2', '20%'], ['0.3', '30%']], [String(state.settings.holdout || 0)]) + '</div>' +
      '<div class="group">Motion</div><div id="motion">' + chipsHTML([['on', 'On'], ['off', 'Off']], [state.settings.motion === false ? 'off' : 'on']) + '</div>' +
      '<div class="group">Start over</div><button class="btn danger" data-m="wipe" style="width:100%">Erase everything on this phone</button>');
    $('#sheet-body').onclick = function (e) {
      var ch = e.target.closest('.chip'), b = e.target.closest('[data-m]');
      if (ch) {
        [].forEach.call(ch.parentNode.children, function (x) { x.setAttribute('aria-pressed', 'false'); }); ch.setAttribute('aria-pressed', 'true');
        if (ch.closest('#cur')) state.settings.currency = ch.dataset.k;
        else if (ch.closest('#motion')) { state.settings.motion = ch.dataset.k === 'on'; applyMotion(); }
        else if (ch.closest('#hold')) { state.settings.holdout = +ch.dataset.k; }
        else if (ch.closest('#lang')) { if (state.settings.lang !== ch.dataset.k) { state.settings.lang = ch.dataset.k; save().then(function () { location.reload(); }); } return; }
        else state.settings.voice = ch.dataset.k === 'on';
        save(); return;
      }
      if (!b) return;
      var m = b.dataset.m;
      if (m === 'zip') { closeSheet(); downloadAll(); }
      if (m === 'sample') { closeSheet(); loadSample(); }
      if (m === 'wipe') {
        if (b.dataset.sure) { state = blank(); an = null; dashSp = null; save(); closeSheet(); welcome(); }
        else { b.dataset.sure = 1; b.textContent = 'Tap again to erase all data, notes and deals'; }
      }
    };
  }

  // ------------------------------------------------------------ uploads
  function readFile(f) { return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.onerror = rej; r.readAsArrayBuffer(f); }); }
  var pendingUpload = null, variantGroups = {};
  function sumAmt(tx) { return tx.reduce(function (a, t) { return a + t.amt; }, 0); }
  function dateNote(r, chosen) {
    var dc = r.dateCheck || {}, o = r.dateOrder === 'mdy' ? 'month/day' : 'day/month';
    if (chosen) return ['ok', 'Dates read as ' + o + ', as you chose'];
    if (dc.kind === 'proven') return ['ok', 'Dates read as ' + o + ' (some dates only make sense that way)'];
    if (dc.kind === 'mixed') return ['warn', 'Some dates only make sense as day/month and others as month/day. I read them as ' + o + '; check the file'];
    return ['ok', 'Dates are stored as real dates in the file'];
  }
  // the record kept for each sales file, so the check can be shown again and the confirmation remembered
  function uploadRecord(r, mg, chosen) {
    var min = null, max = null; r.tx.forEach(function (t) { if (!min || t.d < min) min = t.d; if (!max || t.d > max) max = t.d; });
    var s = r.stats || {};
    return { id: uid(), name: r.name, ts: stamp(), confirmed: false, lines: s.lines || r.tx.length, revenue: Math.round(sumAmt(r.tx) * 100) / 100, from: min, to: max,
      added: mg.added, dupes: mg.duplicates, negatives: s.negatives || 0, negAmt: s.negAmt || 0, noSp: s.noSp || 0, future: s.future || 0, unreadable: s.unreadable || 0, date: dateNote(r, chosen) };
  }
  function healthCard(u) {
    function row(ok, text) { return '<li class="' + (ok ? 'ok' : 'warn') + '"><i aria-hidden="true">' + (ok ? '✓' : '!') + '</i><span>' + esc(text) + '</span></li>'; }
    var vg = NBA.nameVariants(state.tx, state.keepApart);
    var groups = vg.slice(0, 5).map(function (g) { var id = uid(); variantGroups[id] = g; return { id: id, g: g }; });
    return '<h3>Upload check</h3><p class="small">' + esc(u.name) + '</p>' +
      tiles([['Lines', u.lines.toLocaleString(), 'in the file'], ['Revenue', $$(u.revenue), 'net of returns']]) +
      '<p class="small">Covers ' + NBA.shortDate(u.from) + ' to ' + NBA.shortDate(u.to) + '</p>' +
      '<ul class="checks">' +
        row(!u.dupes, u.dupes ? u.dupes.toLocaleString() + ' duplicate lines removed' : 'No duplicate lines') +
        row(!u.negatives, u.negatives ? u.negatives + ' negative lines (returns and credit notes), ' + $$(u.negAmt) + '. Kept, so revenue is net' : 'No negative lines') +
        row(!u.noSp, u.noSp ? u.noSp + ' lines had no salesperson. I gave them the customer\'s usual salesperson' : 'Every line has a salesperson') +
        row(!u.future, u.future ? u.future + ' lines are dated after today. Check them' : 'No dates in the future') +
        row(!u.unreadable, u.unreadable ? u.unreadable + ' lines could not be read and were left out' : 'Every line could be read') +
        row(u.date[0] === 'ok', u.date[1]) +
      '</ul>' +
      groups.map(function (x) {
        return '<div class="variant" data-vg="' + x.id + '"><p><b>These look like the same customer</b></p><ul>' + x.g.members.map(function (m) { return '<li>' + esc(m.name) + ' <span class="small">(' + m.lines + ' lines)</span></li>'; }).join('') + '</ul>' +
          '<div class="acts"><button data-do="merge" data-for="' + x.id + '">Merge into ' + esc(x.g.members[0].name) + '</button><button data-do="apart" data-for="' + x.id + '">Keep apart</button></div></div>';
      }).join('') +
      '<div class="confirm" data-up="' + u.id + '">' + (u.confirmed ? '<p class="okline">✓ You confirmed these figures on ' + NBA.shortDate(u.confirmed) + '</p>' : '<button class="btn pri wide" data-do="confirm" data-for="' + u.id + '">This matches my accounts</button><p class="small">Compare the lines and revenue with your accounting system before you tap.</p>') + '</div>' +
      trail([['Lines', 'rows under the header row in the sales sheet, including any that could not be read'], ['Revenue', 'sum of every readable line, returns and credit notes included as negatives'],
        ['Duplicates', 'a line with the same date, customer, invoice, product, quantity and amount as one already loaded or earlier in the file'],
        ['Same customer?', 'names compared after removing Sdn Bhd, Ltd and similar words; a shorter name of two words or more that starts a longer one also counts'],
        ['Stops', 'nothing is loaded when Date, Customer or Amount columns are missing, or more than 20% of lines cannot be read']]);
  }
  function askDateOrder(r) {
    var smp = r.dateCheck.sample || '03/04/2026', m = smp.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})/), y = +m[3] < 100 ? 2000 + +m[3] : +m[3];
    var a = NBA.parseDate(smp, 'dmy'), b = NBA.parseDate(smp, 'mdy');
    bot('<h3>How should I read your dates?</h3><p>' + esc(r.name) + ' writes dates like <b>' + esc(smp) + '</b>, which can be read two ways.</p>' +
      '<div class="acts"><button class="pri full" data-do="dateorder" data-for="dmy">' + (a ? NBA.shortDate(a) : 'Day first') + ' (day/month)</button><button class="full" data-do="dateorder" data-for="mdy">' + (b ? NBA.shortDate(b) : 'Month first') + ' (month/day)</button></div>' +
      '<p class="small">Malaysian files usually use day/month. Nothing is loaded until you choose.</p>' +
      trail([['Why I am asking', 'every text date in the file has both parts at 12 or below, so nothing in the file proves which comes first'], ['Year', String(y)]]));
  }
  function ingest(results, opts) {
    opts = opts || {};
    // dates that can be read two ways: ask first, load nothing yet
    var amb = results.filter(function (r) { return r.kind === 'tx' && r.dateCheck && r.dateCheck.kind === 'ambiguous'; });
    if (amb.length && !opts.dateOrder) { pendingUpload = { results: results, bufs: opts.bufs || {} }; askDateOrder(amb[0]); return; }
    var lines = [], cards = [];
    results.forEach(function (r) {
      if (r.kind === 'error') { lines.push('<li><b>' + esc(r.name) + '</b>: ' + (r.hardStop ? '<b>Stopped.</b> ' : '') + esc(r.reason) + (r.hardStop ? ' Nothing from this file was loaded.' : '') + '</li>'); return; }
      if (r.kind === 'tx') {
        if (opts.replace) state.tx = [];
        NBA.applyAliases(r.tx, state);
        var mg = NBA.mergeTx(state.tx, r.tx); state.tx = mg.tx;
        var confirmed = NBA.confirmDeals(state, r.tx);
        Object.keys(state.plans).forEach(function (k) { var i = k.lastIndexOf('|'), sp = k.slice(0, i), d = k.slice(i + 1); if (!state.visits.some(function (v) { return v.sp === sp && v.date === d; })) delete state.plans[k]; });
        if (r.targets && r.targets.length) { r.targets.forEach(function (t) { state.targets = state.targets.filter(function (x) { return !(x.sp === t.sp && x.month === t.month); }); state.targets.push(t); }); }
        if (r.credit && r.credit.length) state.credit = Object.assign(state.credit || {}, NBA.creditMap(r.credit, state.tx));
        if (r.campaigns && r.campaigns.length) { r.campaigns.forEach(function (c) { c.added = c.added || NBA.todayISO(); }); state.campaigns = r.campaigns; }
        var extra = (r.targets && r.targets.length ? ' ' + r.targets.length + ' monthly targets.' : '') + (r.campaigns && r.campaigns.length ? ' ' + r.campaigns.length + ' campaigns.' : '') + (r.credit && r.credit.length ? ' ' + r.credit.length + ' credit lines.' : '');
        if (!r.tx.length) { lines.push('<li><b>' + esc(r.name) + '</b>:' + extra + '</li>'); return; }
        var u = uploadRecord(r, mg, opts.dateOrder); state.uploads.push(u); cards.push(u);
        if (extra || confirmed) lines.push('<li><b>' + esc(r.name) + '</b>:' + extra + (confirmed ? ' ' + confirmed + ' deal' + (confirmed === 1 ? '' : 's') + ' you logged in the app ' + (confirmed === 1 ? 'is' : 'are') + ' now covered by this file.' : '') + '</li>');
      } else {
        r.doc.added = NBA.todayISO(); state.docs = state.docs.filter(function (d) { return d.name !== r.doc.name; }); state.docs.push(r.doc);
        var custs = {}; state.tx.forEach(function (t) { custs[t.cid] = { cid: t.cid, name: t.cname, seg: t.seg }; });
        var linked = {}; NBA.linkDocs([r.doc], Object.keys(custs).map(function (k) { return custs[k]; }), []).forEach(function (s) { s.cids.forEach(function (id) { linked[id] = 1; }); });
        lines.push('<li><b>' + esc(r.name) + '</b>: read ' + r.doc.paras.length + ' paragraphs' + (state.tx.length ? ', mentioning ' + Object.keys(linked).length + ' of your company\'s customers by name.' : '. Upload a sales file too so I can link it to customers.') + '</li>');
      }
    });
    save();
    cards.forEach(function (u) { bot(healthCard(u), 'wide health'); });
    if (lines.length) bot('<p>Other files:</p><ul>' + lines.join('') + '</ul>' + trail([['Targets and campaigns', 'sheets with Salesperson, Month, Target or Campaign, Discount % columns'], ['Documents', 'each paragraph is linked to a customer when it names them, or sits under a heading that does'], ['Privacy', 'files are read in this browser; nothing is uploaded']]), 'wide');
    if (!state.tx.length) { bot('<p>I still need a sales file (Excel or CSV) with Date, Customer and Amount columns.</p>' + acts([['upload', 'Upload sales file', 'pri full']]) + trail([['Needed', 'a sheet with Date, Customer and Amount columns']])); return; }
    if (!state.me || NBA.salespeople(state).indexOf(state.me) < 0) { state.me = NBA.salespeople(state)[0]; save(); }
    dock.hidden = false; renderPeople(); brief();
  }
  function chooseDateOrder(order) {
    var p = pendingUpload; if (!p) return; pendingUpload = null;
    said(order === 'mdy' ? 'Month first' : 'Day first');
    Promise.all(p.results.map(function (r) { return r.kind === 'tx' && r.dateCheck && r.dateCheck.kind === 'ambiguous' && p.bufs[r.name] ? Parsers.parseFile(r.name, p.bufs[r.name], { dateOrder: order }) : Promise.resolve(r); }))
      .then(function (rs) { ingest(rs, { dateOrder: order, bufs: p.bufs }); });
  }
  function confirmUpload(id) {
    var u = state.uploads.filter(function (x) { return x.id === id; })[0]; if (!u) return;
    u.confirmed = NBA.todayISO(); save();
    [].forEach.call(document.querySelectorAll('.confirm[data-up="' + id + '"]'), function (el) { el.innerHTML = '<p class="okline">✓ You confirmed these figures on ' + NBA.shortDate(u.confirmed) + '</p>'; });
    [].forEach.call(document.querySelectorAll('.unconf'), function (el) { if (!unconfirmed()) el.remove(); });
  }
  function unconfirmed() { return state.uploads.filter(function (u) { return u.lines && !u.confirmed; }).slice(-1)[0] || null; }
  function variantChoice(id, merge) {
    var g = variantGroups[id]; if (!g) return; delete variantGroups[id];
    var box = document.querySelector('.variant[data-vg="' + id + '"]');
    if (merge) { NBA.mergeCustomers(state, g.members.map(function (m) { return m.cid; }), g.keep); }
    else { state.keepApart = state.keepApart || {}; for (var i = 0; i < g.members.length; i++) for (var j = i + 1; j < g.members.length; j++) state.keepApart[[g.members[i].cid, g.members[j].cid].sort().join('|')] = 1; }
    save(); refresh();
    if (box) box.innerHTML = '<p class="okline">✓ ' + (merge ? 'Merged into ' + esc(g.members[0].name) + '. Future uploads with the other name go to the same customer.' : 'Kept apart. I won\'t ask about these again.') + '</p>';
  }
  fileInput.addEventListener('change', function () {
    var files = [].slice.call(fileInput.files); if (!files.length) return;
    said('Upload: ' + files.map(function (f) { return f.name; }).join(', '));
    var wait = bot('<p>Reading your files…</p>', '', { instant: true }), bufs = {};
    // sales files first so documents can be linked to customers
    files.sort(function (a, b) { return /\.(docx?|pptx?)$/i.test(a.name) - /\.(docx?|pptx?)$/i.test(b.name); });
    Promise.all(files.map(function (f) { return readFile(f).then(function (buf) { bufs[f.name] = buf; return Parsers.parseFile(f.name, buf); }); }))
      .then(function (rs) { wait.remove(); ingest(rs, { bufs: bufs }); })
      .catch(function () { wait.innerHTML = '<p>Something went wrong reading those files. Please try again.</p>'; });
    fileInput.value = '';
  });
  function loadSample() {
    said('Try with sample data');
    var wait = bot('<p>Loading the sample files…</p>', '', { instant: true }), names = ['sample_transactions.xlsx', 'sample_account_plans.docx', 'sample_campaign_deck.pptx'];
    Promise.all(names.map(function (n) { return fetch('sample-data/' + n).then(function (r) { if (!r.ok) throw 0; return r.arrayBuffer(); }).then(function (b) { return Parsers.parseFile(n, b); }); }))
      .then(function (rs) {
        // move the sample forward in time so its newest sale is yesterday
        var tx = rs[0].tx, max = tx.reduce(function (m, t) { return t.d > m ? t.d : m; }, ''), shift = NBA.dayNum(NBA.todayISO()) - 1 - NBA.dayNum(max);
        tx.forEach(function (t) { t.d = NBA.addDays(t.d, shift); });
        rs[0].targets.forEach(function (t) { t.month = NBA.addDays(t.month + '-15', shift).slice(0, 7); });
        rs[0].campaigns.forEach(function (c) { if (c.end && NBA.dayNum(c.end) - NBA.dayNum(max) <= 30) c.end = NBA.addDays(c.end, shift); }); // keep the soon-to-end sample offer soon-to-end
        state = blank(); dashSp = null; chat.innerHTML = ''; ingest(rs, { bufs: {} });
      })
      .catch(function () { wait.innerHTML = '<p>I could not load the sample files. Check your connection and try again.</p>'; });
  }

  // ------------------------------------------------------------ events
  function act(name, cid) {
    if (name === 'upload') fileInput.click();
    else if (name === 'sample') loadSample();
    else if (name === 'brief') { said('Today\'s brief'); brief(); }
    else if (name === 'close') { said('Who is likely to close?'); showList('close'); }
    else if (name === 'churn') { said('Who may churn?'); showList('churn'); }
    else if (name === 'customers') customersSheet();
    else if (name === 'more') moreSheet();
    else if (name === 'dash') tab('dash');
    else if (name === 'home') home();
    else if (name === 'export') exportSheet();
    else if (name === 'export1') onePagerSheet(cid);
    else if (name === 'digest') digestExport();
    else if (name === 'share') shareFile(cid);
    else if (name === 'rules') { closeSheet(); rulesSheet(); }
    else if (name === 'wrong') wrongSheet(cid);
    else if (name === 'pick') pickSheet();
    else if (name === 'wa') waSheet(cid);
    else if (name === 'festive') festiveSheet();
    else if (name === 'confirm') confirmUpload(cid);
    else if (name === 'dateorder') chooseDateOrder(cid);
    else if (name === 'merge' || name === 'apart') variantChoice(cid, name === 'merge');
    else if (name === 'health') { var u = unconfirmed(); if (u) bot(healthCard(u), 'wide health'); }
    else if (name === 'save') { if (ready[cid]) download(ready[cid].name, ready[cid].blob); }
    else if (name === 'wrap') { said('Wrap up my day'); wrapUpDay(); }
    else if (name === 'gap') { said('How do I close my target gap?'); showGap(); }
    else if (name === 'tab-brief') { closeSheet(); tab('brief'); }
    else if (name === 'install') { closeSheet(); if (installEvt) { installEvt.prompt(); installEvt = null; } }
    else if (name === 'tab-dash') { closeSheet(); tab('dash'); }
    else if (name === 'pitch') showPitch(cid);
    else if (name === 'why') showWhy(cid);
    else if (name === 'note') { if (cid) noteSheet(cid); else customersSheet('Visit note for which customer?', noteSheet); }
    else if (name === 'deal') dealSheet(cid);
    else if (name === 'cmore') cardMoreSheet(cid);
    else if (name === 'file') fileSheet(cid);
  }
  chat.addEventListener('click', function (e) {
    var ar = e.target.closest('[data-area]'); if (ar) { if (ar.getAttribute('aria-pressed') !== 'true') switchArea(ar.dataset.area); return; }
    var tile = e.target.closest('[data-tile]');
    if (tile) { var msg = tile.closest('.msg'), open = tile.getAttribute('aria-expanded') === 'true';
      [].forEach.call(msg.querySelectorAll('[data-tile]'), function (b) { b.setAttribute('aria-expanded', 'false'); }); [].forEach.call(msg.querySelectorAll('.tp'), function (x) { x.hidden = true; });
      if (!open) { tile.setAttribute('aria-expanded', 'true'); msg.querySelector('.tp[data-tp="' + tile.dataset.tile + '"]').hidden = false; follow(); } return; }
    var v = e.target.closest('[data-v]');
    if (v) { var id = v.closest('[data-visit]').dataset.visit, k = v.dataset.v; closeRows(); if (k === 'skip') skipSheet(id); else if (k === 'wa') waSheet(id); else if (k === 'swap') swapSheet(id); else if (k === 'wrong') wrongSheet(id); else markVisit(id, k === 'done' ? 'done' : null); return; }
    var d = e.target.closest('[data-do]');
    if (d) { var holder = d.closest('[data-cid]'); act(d.dataset.do, d.dataset.for || (holder && holder.dataset.cid)); return; }
    var c = e.target.closest('[data-cid]'); if (c && c.tagName === 'BUTTON') showCustomer(c.dataset.cid);
  });
  chat.addEventListener('pointerdown', hurry);
  document.addEventListener('click', function (e) { var b = e.target.closest('[data-act]'); if (b) act(b.dataset.act); });
  $('#who').addEventListener('click', function (e) { e.stopPropagation(); whoMenu($('#who-menu').hidden); });
  document.addEventListener('click', function () { whoMenu(false); });
  $('#who-menu').addEventListener('click', function (e) {
    var b = e.target.closest('[data-sp]'); if (!b) return;
    if (view === 'dash') { dashSp = b.dataset.sp || null; renderPeople(); setMood(); showDash(); }
    else if (b.dataset.sp !== state.me) setMe(b.dataset.sp);
  });
  $('#home').addEventListener('click', home);
  function tab(name) {
    var dash = name === 'dash'; view = name;
    $('#view-brief').hidden = dash; $('#view-dash').hidden = !dash;
    renderPeople(); setMood();
    if (dash) showDash();
  }

  // ------------------------------------------------------------ works as an installed app, offline
  var installEvt = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); installEvt = e; });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(function () {});

  // ------------------------------------------------------------ start
  DB.get().then(function (s) {
    if (s && s.tx) { state = s; state.settings = state.settings || { currency: '$', voice: true }; state.visits = state.visits || []; state.plans = state.plans || {}; state.feedback = state.feedback || []; state.swaps = state.swaps || []; state.holdout = state.holdout || {}; state.picks = state.picks || []; state.areaPick = state.areaPick || {}; state.credit = state.credit || {}; if (typeof state.settings.holdout !== 'number') state.settings.holdout = 0.2; state.uploads = state.uploads || []; state.aliases = state.aliases || {}; state.keepApart = state.keepApart || {}; state.tuning = state.tuning || {}; state.tuneDismissed = state.tuneDismissed || {}; state.targets = state.targets || []; state.campaigns = state.campaigns || []; }
    state.settings.motion = state.settings.motion !== false; applyMotion();
    if (I18 && state.settings.lang === 'ms') { I18.setLang('ms'); document.documentElement.lang = 'ms'; knownValues(); I18.translateTree(document.body); I18.watch(document.body); }
    if (!state.tx.length) welcome();
    else if (!state.me) askWho();
    else { dock.hidden = false; renderPeople(); home(); }
  });
})();
