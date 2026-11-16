/* Nudge: the chat screen. Buttons first; typing only for visit notes. All data stays in this browser. */
(function () {
  'use strict';
  var NBA = window.NBA, Parsers = window.NBAParsers;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var chat = $('#chat'), dock = $('#dock'), sheet = $('#sheet'), fileInput = $('#file');
  var state = blank(), an = null, dashSp = null, view = 'brief';
  function blank() { return { me: null, tx: [], docs: [], notes: [], deals: [], visits: [], plans: {}, targets: [], campaigns: [], files: [], settings: { currency: '$', voice: true } }; }
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
  function refresh() { an = state.tx.length && state.me ? NBA.analyze(state, state.me) : null; setMood(); }
  function setMood() {
    var app = $('#app'); if (!state.tx.length) { app.removeAttribute('data-mood'); app.classList.remove('has-target'); return; }
    var t = NBA.targetStatus(state, view === 'dash' ? dashSp : state.me), m = t.mood; if (m === 'calm') app.removeAttribute('data-mood'); else app.dataset.mood = m;
    app.style.setProperty('--p', t.hasTarget ? Math.max(0, Math.min(100, Math.round(100 * t.mtd / t.target))) : 0); app.classList.toggle('has-target', !!t.hasTarget);
    $('#home').title = t.hasTarget ? Math.round(100 * t.mtd / t.target) + '% of ' + t.month + ' target' : 'Home';
  }
  function cust(cid) { return an && an.customers.filter(function (c) { return c.cid === cid; })[0]; }

  // ------------------------------------------------------------ chat primitives
  // Replies are queued: thinking dots first, then the words type out. A tap skips to the full text.
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var Q = Promise.resolve(), pending = 0, fast = false, turnStart = null, skippers = [];
  function enqueue(fn) {
    if (!pending++) $('#app').dataset.state = 'thinking';
    Q = Q.then(fn).catch(function () {}).then(function () { if (!--pending) { fast = false; follow(); if ($('#app').dataset.state === 'thinking') delete $('#app').dataset.state; } });
    return Q;
  }
  function pause(ms) {
    return new Promise(function (res) {
      if (fast || reduced || !ms) return res();
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
    if (fast || reduced) return Promise.resolve();
    var steps = [], words = 0;
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          if (!ch.nodeValue.trim()) return;
          var frag = document.createDocumentFragment();
          (ch.nodeValue.match(/\S+\s*|\s+/g) || []).forEach(function (w) { var sp = document.createElement('span'); sp.textContent = w; sp.className = 'hid'; frag.appendChild(sp); steps.push(sp); words++; });
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
    if (fast || reduced) return Promise.resolve();
    var t = document.createElement('div'); t.className = 'typing fade'; t.innerHTML = '<span class="orb xs"></span><span class="dots"><i></i><i></i><i></i></span>';
    chat.appendChild(t); if (!turnStart) turnStart = t; follow();
    return pause(ms).then(function () { if (turnStart === t) turnStart = null; t.remove(); });
  }
  function bot(html, cls, opt) {
    var d = document.createElement('div'); d.className = 'msg ' + (cls || ''); d.innerHTML = html;
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
  function trail(rows) {
    rows = rows.filter(function (r) { return r && r[1]; });
    if (!rows.length) return '';
    return '<details class="audit"><summary>How I got this</summary>' + rows.map(function (r) { return '<div class="factor nopts"><span>' + esc(r[0]) + '<code>' + esc(r[1]) + '</code></span></div>'; }).join('') + '</details>';
  }
  function scoreTrail(c) { return c.factors.map(function (f) { return [f.bucket + ' ' + (f.pts > 0 ? '+' : '') + f.pts + ' (' + f.src + ')', f.tech]; }); }
  // ---- small visuals: a few words and a picture first, the sentence on demand
  var ICON = {
    file: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"/></svg>',
    out: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4m0 0l-4 4m4-4l4 4M5 13v6h14v-6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  function meter(label, v, kind, note) { return '<div class="mtr"><span>' + label + '</span><div class="bar"><i class="' + kind + '" style="width:' + Math.max(2, Math.min(100, v)) + '%"></i></div><b>' + (note || v) + '</b></div>'; }
  function tiles(list) { return '<div class="tiles">' + list.map(function (t) { return '<div class="tile"><small>' + esc(t[0]) + '</small><b>' + esc(t[1]) + '</b>' + (t[2] ? '<span>' + esc(t[2]) + '</span>' : '') + '</div>'; }).join('') + '</div>'; }
  function more(label, html) { return '<details class="more"><summary>' + esc(label) + '</summary>' + html + '</details>'; }
  function tbar(ts) {
    if (!ts.hasTarget) return '';
    var w = Math.min(100, Math.round(100 * ts.mtd / ts.target)), pace = Math.min(100, Math.round(100 * ts.pace / ts.target));
    return '<div class="tbar"><div class="row"><span>' + ts.month + ' target</span><b>' + $$(ts.mtd) + ' of ' + $$(ts.target) + '</b></div><div class="bar"><i class="' + (ts.ahead ? 'go' : 'warn') + '" style="width:' + w + '%"></i><u style="left:' + pace + '%"></u></div>' +
      '<div class="row small"><span>' + (ts.gap > 0 ? $$(ts.gap) + ' to go' : 'Target reached') + '</span><span>' + (ts.gap > 0 ? ts.daysLeft + ' days left, ' + (ts.ahead ? 'on pace' : 'behind pace') : '') + '</span></div></div>';
  }
  function rhythm(c) {
    var gap = c.gapUsed, max = Math.max(gap * 2.2, c.recency * 1.15) || 1; function p(v) { return Math.min(100, 100 * v / max); }
    return '<div class="viz"><div class="row small"><span>Order rhythm</span><span>' + c.recency + ' days, usually ' + Math.round(gap) + '</span></div>' +
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
  function tagClass(t) { return t === 'Likely to close' || t === 'Good chance' ? 'go' : t === 'May churn' ? 'risk' : t === 'Watch' ? 'watch' : ''; }
  function tag(c) { return '<span class="tag ' + tagClass(c.tag) + '">' + c.tag + '</span>'; }
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
      '<div class="steps"><button data-do="upload"><b>1</b>Upload</button><i></i><button data-do="brief"><b>2</b>Insights</button><i></i><button data-do="export"><b>3</b>Export</button></div>' +
      acts([['brief', 'Give me today\'s brief', 'pri']].concat(ts.hasTarget && ts.gap > 0 ? [['gap', 'How do I close my target gap?', '']] : []).concat([['close', 'Who is likely to close?', ''], ['churn', 'Who may churn?', ''], ['wrap', 'Wrap up my day', '']]));
    Q.then(function () { chat.appendChild(h); chat.scrollTop = 0; });
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
    if (!state.plans[key]) { state.plans[key] = NBA.lists(an).top3.map(function (c) { return c.cid; }); save(); }
    return state.plans[key].map(cust).filter(Boolean);
  }
  function visitOf(cid) { return state.visits.filter(function (v) { return v.cid === cid && v.sp === state.me && v.date === an.asOf; })[0]; }
  function footHTML(cid) {
    var v = visitOf(cid);
    if (!v) return '<button data-v="done">Mark visited</button><button data-v="skip">Skip today</button>';
    return '<span class="vstate ' + v.status + '">' + (v.status === 'done' ? '✓ Visited' : 'Skipped: ' + esc(v.reason)) + '</span><button data-v="undo">Undo</button>';
  }
  function refreshFoots(cid) { [].forEach.call(chat.querySelectorAll('.vfoot'), function (f) { if (f.dataset.visit === cid) f.innerHTML = footHTML(cid); }); }
  function markVisit(cid, status, reason, quiet) {
    state.visits = state.visits.filter(function (v) { return !(v.cid === cid && v.sp === state.me && v.date === an.asOf); });
    if (status) state.visits.push({ cid: cid, sp: state.me, date: an.asOf, status: status, reason: reason || '' });
    save(); refreshFoots(cid);
    var p = plan(), left = p.filter(function (c) { return !visitOf(c.cid); }).length;
    if (status && !quiet && p.length && !left) bot('<p>That is all ' + p.length + ' of today\'s visits accounted for.</p>' + acts([['wrap', 'Wrap up my day', 'pri full']]) + trail([['Count', p.length + ' planned visits for ' + an.asOf + ', each marked visited or skipped on this phone']]));
  }
  function autoVisited(cid) { if (plan().some(function (c) { return c.cid === cid; }) && !visitOf(cid)) markVisit(cid, 'done', '', true); }
  function skipSheet(cid) {
    var c = cust(cid); if (!c) return;
    var reasons = ['Customer not available', 'Ran out of time', 'Moved to another day', 'Not needed today'];
    openSheet('Skip ' + c.name + ' today?', '<div class="group">Why?</div><div class="rowlist" style="margin:0">' + reasons.map(function (r) { return '<button data-r="' + r + '">' + r + '</button>'; }).join('') + '</div>');
    $('#sheet-body').onclick = function (e) { var b = e.target.closest('[data-r]'); if (b) { closeSheet(); markVisit(cid, 'skipped', b.dataset.r); } };
  }
  function visitCard(c, i) {
    var r = NBA.topReasons(c, 1)[0];
    var b = document.createElement('div'); b.className = 'visit fade';
    b.innerHTML = '<button class="vmain" data-cid="' + esc(c.cid) + '"><span class="n">' + (i + 1) + '</span><span><span class="name">' + esc(c.name) + '</span>' + tag(c) +
      '<span class="why">' + esc(r ? r.plain : 'Worth a regular check-in.') + '</span></span>' +
      '<span class="arrow"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>' +
      '<div class="vfoot" data-visit="' + esc(c.cid) + '">' + footHTML(c.cid) + '</div>';
    enqueue(function () { return pause(260).then(function () { chat.appendChild(b); follow(); }); });
    return b;
  }
  // Morning brief: headline, target bar, tappable tiles, then the visits. Sentences sit behind the tiles.
  function brief() {
    refresh(); if (!an) return;
    var P = plan(), first = state.me.split(' ')[0], ex = NBA.execSummary(state, state.me, an, { plan: P }), ts = ex.target, L = NBA.lists(an);
    var d = NBA.dashboard(state, { sp: state.me }), by = {}; ex.points.forEach(function (x) { (by[x.kind] = by[x.kind] || []).push(x.text); });
    var risk$ = L.churn.reduce(function (a, c) { return a + c.rev12; }, 0), visit$ = P.reduce(function (a, c) { return a + c.avgOrder; }, 0);
    var tl = [['risk', 'At risk', String(L.churn.length), L.churn.length ? $$(risk$) + ' a year' : 'none today', 'churn', 'See these customers'],
      ['close', 'Ready to buy', String(L.close.length), L.close.length ? 'led by ' + L.close[0].name.split(' ').slice(0, 2).join(' ') : 'none today', 'close', 'See these customers']];
    if (ex.expiring.length) tl.push(['expiry', 'Ending soon', String(ex.expiring.length), 'offer ends in ' + ex.expiring[0].daysLeft + ' days', '', '']);
    else tl.push(['value', 'Today\'s visits', $$(visit$), 'usual orders', '', '']);
    var html = '<h3>' + greeting() + ', ' + esc(first) + '</h3>' +
      '<p class="lead">' + $$(d.ytd.cur) + ' this year' + (d.hasPrev ? ' <span class="delta ' + (d.ytd.inc >= 0 ? 'up' : 'down') + '">' + (d.ytd.inc >= 0 ? '▲ ' : '▼ ') + NBA.pct(d.ytd.pct).replace(/^[+-]/, '') + ' on last year</span>' : '') + '</p>' +
      tbar(ts) +
      '<div class="tiles tap">' + tl.map(function (t) { return '<button class="tile" data-tile="' + t[0] + '" aria-expanded="false"><small>' + t[1] + '</small><b>' + esc(t[2]) + '</b><span>' + esc(t[3]) + '</span></button>'; }).join('') + '</div>' +
      tl.map(function (t) { return '<div class="tp" data-tp="' + t[0] + '" hidden><p>' + esc((by[t[0]] || ['Nothing to report here today.']).join(' ')) + '</p>' + (t[4] ? '<button class="linkbtn" data-do="' + t[4] + '">' + t[5] + '</button>' : '') + '</div>'; }).join('') +
      (by.gap ? more('How to close the gap', '<p>' + esc(by.gap.join(' ')) + '</p><button class="linkbtn" data-do="gap">Show me who to approach</button>') : '') +
      (ex.offers.length ? more('Offers to use today (' + ex.offers.length + ')', '<ul>' + ex.offers.map(function (o) { return '<li><b>' + esc(o.name) + '</b>' + (o.renewal ? ' (renewal)' : '') + ': ' + esc(o.text) + '</li>'; }).join('') + '</ul>') : '') +
      (an.stale ? '<p class="small notice-line">Sales data stops on ' + NBA.niceDate(an.dataTo) + '. Upload a newer file for an up-to-date brief.</p>' : '') +
      trail([['Headline', ex.headlineTech]].concat(ex.points.map(function (x) { return [x.label, x.tech]; })).concat(ex.offers.map(function (o) { return ['Offer: ' + o.name, o.tech]; }))
        .concat([['Visit order', 'top ' + P.length + ' active customers by visit priority = ' + NBA.RULES.wMain + ' × higher of close and risk score + ' + NBA.RULES.wOther + ' × lower + ' + NBA.RULES.wValue + ' × value percentile; fixed for the day when first shown'],
          ['Sources', state.tx.length.toLocaleString() + ' sales rows up to ' + (an.dataTo || an.asOf) + ', ' + state.notes.length + ' notes, ' + state.docs.length + ' documents, ' + state.targets.length + ' targets, ' + state.campaigns.length + ' campaigns. Fixed rules, no AI model.']]));
    bot(html, 'wide');
    if (!P.length) { bot('<p>No active customers in the uploaded data.</p>' + trail([['Rule', 'a customer is active if they ordered within ' + NBA.RULES.lostDays + ' days or ' + NBA.RULES.lostRatio + ' times their usual gap']])); return; }
    P.forEach(visitCard);
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
      more('Why these customers', '<ul>' + g.picks.map(function (p) { return '<li><b>' + esc(p.name) + '</b>: ' + esc(p.reason || 'Regular buyer.') + (p.offer ? ' ' + esc(p.offer.name) + ' applies.' : '') + '</li>'; }).join('') + '</ul>') +
      trail([['Target pace', ts.tech], ['Ranking', g.tech]].concat(g.picks.map(function (p) { return [p.name, 'close ' + p.close + ' × usual order ' + $$(p.amount)]; }))), 'wide');
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
      tiles([['Visits', w.visited.length + ' of ' + w.planned, w.skipped.length ? w.skipped.length + ' skipped' : w.open.length ? w.open.length + ' open' : 'all done'], ['Deals', String(w.deals.n), w.deals.n ? $$(w.deals.total) : 'none logged'], ['Notes', String(w.noted.length), w.missingNotes.length ? w.missingNotes.length + ' missing' : 'up to date']]) +
      (w.missingNotes.length ? '<div class="acts">' + w.missingNotes.slice(0, 3).map(function (x) { return '<button class="full" data-do="note" data-for="' + esc(x.cid) + '">+ Note for ' + esc(x.name) + '</button>'; }).join('') + '</div>' : '') +
      (li.length ? more('Details', '<ul class="facts">' + li.join('') + '</ul>') : '') +
      trail([['Visits', 'today\'s plan of ' + w.planned + ' against visits marked on this phone for ' + an.asOf], ['Deals', 'deals logged in the app dated ' + an.asOf + ', summed'], ['Notes', 'notes saved today; “missing” = visited or closed a deal today with no note'], ['Tomorrow', 'the same visit priority ranking, calculated for ' + NBA.addDays(an.asOf, 1) + ' (customers contacted in the last ' + NBA.RULES.visitedDays + ' days are held back)']]), 'wide');
  }
  function celebrate() {
    var orb = document.querySelector('.top .orb'); orb.classList.add('win'); setTimeout(function () { orb.classList.remove('win'); }, 2600);
    if (reduced) return;
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
        return '<button data-cid="' + esc(c.cid) + '"><span>' + esc(c.name) + '<span class="sub">' + esc(f ? f.label : '') + '</span></span><span class="mini"><i class="' + (close ? 'go' : 'risk') + '" style="width:' + v + '%"></i></span><b>' + v + '</b></button>';
      }).join('') + '</div>' +
      trail([['Rule', (close ? 'close' : 'risk') + ' score of ' + NBA.RULES.listThreshold + ' or more, highest first, at most 5']].concat(list.map(function (c) { return [c.name + ': ' + (close ? c.close : c.churn) + ' / 100', c.factors.filter(function (x) { return x.bucket === kind; }).map(function (x) { return x.tech; }).join(' | ')]; }))), 'wide');
  }
  function showCustomer(cid, echo) {
    refresh(); var c = cust(cid); if (!c) return;
    if (echo !== false) said(c.name);
    bot('<div data-cid="' + esc(c.cid) + '"><div class="chead"><div><h3>' + esc(c.name) + '</h3>' + tag(c) + '</div><button class="plus" data-do="note" aria-label="Add visit note">+</button></div>' +
      tiles([['Last order', c.recency === 0 ? 'Today' : c.recency + ' days', 'ago'], ['Usual order', $$(c.avgOrder), 'every ' + Math.round(c.gapUsed) + ' days'], ['12 months', $$(c.rev12), c.yoy == null ? '' : NBA.pct(c.yoy)]]) +
      (c.lost ? '' : meter('Chance to close', c.close, 'go') + meter('Risk of leaving', c.churn, 'risk')) + rhythm(c) + spark(c) +
      acts([['pitch', 'What to say', 'pri'], ['why', 'Why this customer']]) +
      '<div class="iconrow"><button data-do="file" aria-label="Customer file" title="Customer file">' + ICON.file + '</button><button data-do="export1" aria-label="Export one-pager" title="Export one-pager">' + ICON.out + '</button><button class="done" data-do="deal" aria-label="Deal closed">' + ICON.check + 'Done</button></div></div>' +
      trail([['Tiles', 'last order ' + c.last + '; usual order = average of ' + c.nOrders + ' orders; 12-month revenue = sales from ' + NBA.addDays(an.asOf, -364) + ' to ' + an.asOf], ['Order rhythm', 'days since last order ' + c.recency + ' against median gap ' + Math.round(c.gapUsed) + ' (ratio ' + c.ratio.toFixed(2) + '); shaded band = due window ' + NBA.RULES.reorderWindow[0] + ' to ' + NBA.RULES.reorderWindow[1] + ' × gap'], ['Spend line', 'sales summed by calendar month, ' + c.months12[0].key + ' to ' + c.months12[11].key], ['Status “' + c.tag + '”', 'close ' + c.close + ', risk ' + c.churn + ', priority ' + c.priority]].concat(scoreTrail(c))), 'wide');
  }
  function showPitch(cid) {
    var c = cust(cid); if (!c) return; said('What to say to ' + c.name);
    var p = NBA.buildPitch(c, an);
    bot('<h3>What to say</h3><p class="small">' + esc(c.name) + '</p>' +
      p.points.map(function (x, i) { return '<details class="pt"><summary><b>' + (i + 1) + '</b>' + esc(x.title) + '</summary><p>' + esc(x.text) + '</p><span class="src">From: ' + esc(x.src) + '</span></details>'; }).join('') +
      '<div class="pitch-ask">' + esc(p.ask) + '</div>' + more('How to open', '<p>' + esc(p.open) + '</p>') +
      trail([['Opening and ask', p.openTech]].concat(p.points.map(function (x, i) { return ['Point ' + (i + 1) + ' (' + x.src + ')', x.tech]; }))), 'wide');
  }
  function showWhy(cid) {
    var c = cust(cid); if (!c) return; said('Why ' + c.name + '?');
    function rows(bucket) {
      return c.factors.filter(function (x) { return x.bucket === bucket; }).map(function (x) {
        return '<details class="fx"><summary><span class="pts ' + (x.pts < 0 ? 'neg' : '') + '">' + (x.pts > 0 ? '+' : '') + x.pts + '</span>' + esc(x.label) + '</summary><p>' + esc(x.plain) + '</p><code>' + esc(x.tech) + '</code><span class="src">Source: ' + esc(x.src) + '</span></details>';
      }).join('') || '<p class="small">Nothing counted here.</p>';
    }
    bot('<h3>Why ' + esc(c.name) + '</h3>' +
      meter('Visit priority', c.priority, 'ink') + rows('priority') + meter('Chance to close', c.close, 'go') + rows('close') + meter('Risk of leaving', c.churn, 'risk') + rows('churn') +
      trail([['Scores', 'each score is the sum of the points shown, limited to 0–100; tap a row for the sentence and the calculation'], ['When', 'calculated on ' + an.asOf + ' from sales up to ' + (an.dataTo || an.asOf) + '; the same working is saved in the customer file']]), 'wide');
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

  // ---- visit note: keywords by tap or by voice
  function noteSheet(cid) {
    var c = cust(cid); if (!c) return;
    var groups = {}; NBA.KEYWORDS.forEach(function (k) { (groups[k.group] = groups[k.group] || []).push([k.id, k.label]); });
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition, voice = SR && state.settings.voice;
    var h = '';
    if (voice) h += '<button class="mic" id="mic"><svg viewBox="0 0 24 24"><path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span class="orb xs"></span><span>Speak your note</span></button>' +
      '<div class="heard" id="heard" hidden></div><p class="small">I pick out the keywords below from what you say or type. Voice uses your phone\'s own speech service, which on some phones sends the audio to Apple or Google. For sensitive visits, tap the keywords instead.</p>';
    else if (!SR && state.settings.voice) h += '<p class="small">Voice notes are not available in this browser. Tap the keywords instead.</p>';
    h += '<textarea class="typed" id="typed" rows="3" placeholder="Or type your note here" aria-label="Type your note"></textarea>';
    Object.keys(groups).forEach(function (g) { h += '<div class="group">' + g + '</div><div data-kw>' + chipsHTML(groups[g]) + '</div>'; });
    h += '<div class="group">Talked about</div><div data-cat>' + chipsHTML(an.categories.map(function (x) { return [x, x]; })) + '</div>';
    openSheet('Visit note: ' + c.name, h, '<button class="btn pri" id="save-note" disabled>Save note</button>');
    var body = $('#sheet-body'), saveBtn = $('#save-note'), transcript = '', rec = null;
    function sel(attr) { return [].map.call(body.querySelectorAll('[' + attr + '] .chip[aria-pressed="true"]'), function (b) { return b.dataset.k; }); }
    var typed = $('#typed');
    function check() { saveBtn.disabled = !(sel('data-kw').length || sel('data-cat').length || transcript || typed.value.trim()); }
    function pickUp(text) {
      var k = NBA.extractKeywords(text, an.categories);
      k.keywords.forEach(function (id) { var b = body.querySelector('[data-kw] .chip[data-k="' + id + '"]'); if (b) b.setAttribute('aria-pressed', 'true'); });
      k.cats.forEach(function (x) { [].forEach.call(body.querySelectorAll('[data-cat] .chip'), function (b) { if (b.dataset.k === x) b.setAttribute('aria-pressed', 'true'); }); });
    }
    typed.oninput = function () { pickUp(typed.value); check(); };
    body.onclick = function (e) {
      var ch = e.target.closest('.chip'); if (ch) { ch.setAttribute('aria-pressed', ch.getAttribute('aria-pressed') !== 'true'); check(); }
    };
    if (voice) {
      var mic = $('#mic'), heard = $('#heard'), finalText = '';
      var stop = function () { if (rec) { try { rec.stop(); } catch (e) {} rec = null; } mic.classList.remove('on'); if ($('#app').dataset.state === 'listening') delete $('#app').dataset.state; mic.lastChild.textContent = transcript ? 'Speak again to add more' : 'Speak your note'; };
      mic.onclick = function () {
        if (rec) { stop(); return; }
        try {
          rec = new SR(); rec.lang = navigator.language || 'en-US'; rec.interimResults = true; rec.continuous = true;
          rec.onresult = function (ev) {
            var interim = '';
            for (var i = ev.resultIndex; i < ev.results.length; i++) { if (ev.results[i].isFinal) finalText += ev.results[i][0].transcript + ' '; else interim += ev.results[i][0].transcript; }
            transcript = (finalText + interim).trim(); heard.hidden = false; heard.textContent = transcript;
            var k = NBA.extractKeywords(transcript, an.categories);
            k.keywords.forEach(function (id) { var b = body.querySelector('[data-kw] .chip[data-k="' + id + '"]'); if (b) b.setAttribute('aria-pressed', 'true'); });
            k.cats.forEach(function (x) { [].forEach.call(body.querySelectorAll('[data-cat] .chip'), function (b) { if (b.dataset.k === x) b.setAttribute('aria-pressed', 'true'); }); });
            check();
          };
          rec.onerror = function (ev) { heard.hidden = false; if (!transcript) heard.textContent = ev.error === 'not-allowed' ? 'Microphone is blocked. Allow it in your browser settings, or tap the keywords.' : 'I could not hear that. Try again, or tap the keywords.'; stop(); };
          rec.onend = function () { rec = null; stop(); };
          rec.start(); mic.classList.add('on'); $('#app').dataset.state = 'listening'; mic.lastChild.textContent = 'Listening… tap to stop';
        } catch (e) { rec = null; }
      };
      onClose = stop;
    }
    saveBtn.onclick = function () {
      var said0 = (transcript + ' ' + typed.value).trim();
      if (said0 && !sel('data-kw').length && !saveBtn.dataset.warned) {
        saveBtn.dataset.warned = 1; saveBtn.textContent = 'Save anyway';
        var wn = document.createElement('p'); wn.className = 'warn-box'; wn.textContent = 'I did not pick up a keyword from that, so the scores will not move. Tap a keyword below if one fits, for example “Staying with us”.';
        var firstGroup = body.querySelector('.group'); body.insertBefore(wn, firstGroup); body.classList.add('nudge-kw'); wn.scrollIntoView({ block: 'center' }); return;
      }
      var before = { close: c.close, churn: c.churn };
      var tv = typed.value.trim();
      var note = { id: uid(), cid: c.cid, ts: stamp(), keywords: sel('data-kw'), cats: sel('data-cat'), transcript: [transcript, tv].filter(Boolean).join(' '), typed: !!tv && !transcript };
      state.notes.push(note); save(); closeSheet(); refresh(); autoVisited(c.cid);
      var n = cust(c.cid);
      said('Note for ' + c.name + ': ' + (note.keywords.map(function (id) { return NBA.KW[id].label; }).concat(note.cats).join(', ') || (note.typed ? 'typed note' : 'spoken note')));
      var moved = n.close !== before.close || n.churn !== before.churn;
      var why = !note.keywords.length ? 'No keyword was picked, so the scores stay as they were. The note text is kept in the customer file.' : 'These keywords carry no points right now, or the score is already at its limit.';
      var m = bot('<p><b>Saved</b> to ' + esc(c.name) + '.</p>' +
        (moved ? (n.close !== before.close ? meter('Chance to close', n.close, 'go', before.close + ' → ' + n.close) : '') + (n.churn !== before.churn ? meter('Risk of leaving', n.churn, 'risk', before.churn + ' → ' + n.churn) : '') : '<p class="small">Scores did not change.</p>' + more('Why not?', '<p>' + why + '</p>')) +
        '<div data-cid="' + esc(c.cid) + '">' + acts([['pitch', 'See updated pitch', 'pri full']]) + '</div>' +
        trail([['Keywords saved', note.keywords.map(function (id) { return id === 'staying' ? 'staying (risk −' + NBA.RULES.stayingPts + ' for ' + NBA.RULES.stayingDays + ' days)' : id + ' (close ' + NBA.KW[id].close + ', risk ' + NBA.KW[id].churn + ')'; }).join(', ') || 'none'], ['Scores', 'close ' + before.close + ' → ' + n.close + ', risk ' + before.churn + ' → ' + n.churn + '; note points are capped at ±' + NBA.RULES.notePosCap + ' (close) and ±' + NBA.RULES.noteNegCap + ' (risk)'], ['Text', note.transcript ? 'only the fixed keywords found in your words affect scores; the text itself is stored in the customer file' : '']]));
      scroll(m);
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
      var m = bot('<h3>Well done</h3>' + tiles([['Deal', $$(deal.amt), c.name.split(' ').slice(0, 2).join(' ')], ['Your year', $$(me ? me.cur : deal.amt), 'so far'], ['On last year', d.hasPrev && me ? (me.inc >= 0 ? '+' : '-') + $$(Math.abs(me.inc)) : 'n/a', d.hasPrev && me ? (me.inc >= 0 ? 'ahead' : 'behind') : '']]) +
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
    openSheet(name, '<div class="md">' + mdToHTML(md) + '</div>', '<button class="btn pri" id="dl">Download ' + esc(name) + '</button>');
    $('#dl').onclick = function () { download(name, new Blob([md], { type: 'text/markdown' })); };
  }
  function downloadAll() {
    refresh(); if (!an) return;
    var zip = new window.JSZip();
    an.customers.forEach(function (c) { zip.file(NBA.fileName(c), NBA.customerMarkdown(c, an)); });
    zip.generateAsync({ type: 'blob' }).then(function (b) { download('customer-files-' + state.me.replace(/\s+/g, '-') + '.zip', b); });
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
    var cs = ['$', '€', '£', 'RM', 'S$', '₹', 'Rp', '¥'];
    var when = NBA.asOfDate(state), nCust = {}; state.tx.forEach(function (t) { nCust[t.cid] = 1; });
    openSheet('Menu',
      '<div class="rowlist" style="margin:0 0 6px"><button data-act="export"><span>Export</span></button><button data-act="tab-brief"><span>Brief</span>' + (view === 'brief' ? '<span class="tag">Open</span>' : '') + '</button><button data-act="tab-dash"><span>Dashboard</span>' + (view === 'dash' ? '<span class="tag">Open</span>' : '') + '</button></div>' +
      '<div class="group">On this phone</div><p class="small" style="margin:0 0 8px">' + state.tx.length.toLocaleString() + ' sales rows for ' + Object.keys(nCust).length + ' customers, up to ' + (when.dataTo ? NBA.niceDate(when.dataTo) : 'n/a') + '. ' +
      state.targets.length + ' monthly targets. ' + state.campaigns.length + ' campaigns. ' + state.docs.length + ' document' + (state.docs.length === 1 ? '' : 's') + (state.docs.length ? ' (' + state.docs.map(function (d) { return esc(d.name); }).join(', ') + ')' : '') + '. ' + state.notes.length + ' visit notes. ' + state.deals.length + ' deals logged.</p>' +
      '<div class="rowlist"><button data-m="zip">Download all my customer files (.zip)</button><button data-m="sample">Load sample data</button></div>' +
      '<div class="group">Currency</div><div id="cur">' + chipsHTML(cs.map(function (x) { return [x, x]; }), [cur()]) + '</div>' +
      '<div class="group">Voice notes</div><div id="voice">' + chipsHTML([['on', 'On'], ['off', 'Off']], [state.settings.voice ? 'on' : 'off']) + '</div>' +
      '<div class="group">Start over</div><button class="btn danger" data-m="wipe" style="width:100%">Erase everything on this phone</button>');
    $('#sheet-body').onclick = function (e) {
      var ch = e.target.closest('.chip'), b = e.target.closest('[data-m]');
      if (ch) {
        [].forEach.call(ch.parentNode.children, function (x) { x.setAttribute('aria-pressed', 'false'); }); ch.setAttribute('aria-pressed', 'true');
        if (ch.closest('#cur')) state.settings.currency = ch.dataset.k; else state.settings.voice = ch.dataset.k === 'on';
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
  function ingest(results, opts) {
    var lines = [], gotTx = false;
    results.forEach(function (r) {
      if (r.kind === 'error') { lines.push('<li><b>' + esc(r.name) + '</b>: ' + esc(r.reason) + '</li>'); return; }
      if (r.kind === 'tx') {
        if (opts && opts.replace) state.tx = [];
        var mg = NBA.mergeTx(state.tx, r.tx); state.tx = mg.tx; gotTx = true;
        var confirmed = NBA.confirmDeals(state, r.tx);
        Object.keys(state.plans).forEach(function (k) { var i = k.lastIndexOf('|'), sp = k.slice(0, i), d = k.slice(i + 1); if (!state.visits.some(function (v) { return v.sp === sp && v.date === d; })) delete state.plans[k]; });
        if (r.targets && r.targets.length) { r.targets.forEach(function (t) { state.targets = state.targets.filter(function (x) { return !(x.sp === t.sp && x.month === t.month); }); state.targets.push(t); }); }
        if (r.campaigns && r.campaigns.length) state.campaigns = r.campaigns;
        var extra = (r.targets && r.targets.length ? ' ' + r.targets.length + ' monthly targets.' : '') + (r.campaigns && r.campaigns.length ? ' ' + r.campaigns.length + ' campaigns.' : '');
        if (!r.tx.length) { lines.push('<li><b>' + esc(r.name) + '</b>:' + extra + '</li>'); return; }
        var ids = {}, min = r.tx[0].d, max = r.tx[0].d; r.tx.forEach(function (t) { ids[t.cid] = 1; if (t.d < min) min = t.d; if (t.d > max) max = t.d; });
        lines.push('<li><b>' + esc(r.name) + '</b>: ' + mg.added.toLocaleString() + ' new sales rows for ' + Object.keys(ids).length + ' customers, ' + NBA.niceDate(min) + ' to ' + NBA.niceDate(max) + '.' +
          (mg.duplicates ? ' ' + mg.duplicates.toLocaleString() + ' rows were already loaded and were skipped.' : '') + (r.skipped ? ' ' + r.skipped + ' rows had no date or amount and were left out.' : '') +
          (confirmed ? ' ' + confirmed + ' deal' + (confirmed === 1 ? '' : 's') + ' you logged in the app ' + (confirmed === 1 ? 'is' : 'are') + ' now covered by this file.' : '') + extra + '</li>');
      } else {
        state.docs = state.docs.filter(function (d) { return d.name !== r.doc.name; }); state.docs.push(r.doc);
        var custs = {}; state.tx.forEach(function (t) { custs[t.cid] = { cid: t.cid, name: t.cname, seg: t.seg }; });
        var linked = {}; NBA.linkDocs([r.doc], Object.keys(custs).map(function (k) { return custs[k]; }), []).forEach(function (s) { s.cids.forEach(function (id) { linked[id] = 1; }); });
        lines.push('<li><b>' + esc(r.name) + '</b>: read ' + r.doc.paras.length + ' paragraphs' + (state.tx.length ? ', mentioning ' + Object.keys(linked).length + ' of your company\'s customers by name.' : '. Upload a sales file too so I can link it to customers.') + '</li>');
      }
    });
    save();
    bot('<p>Here is what I read:</p><ul>' + lines.join('') + '</ul>' + trail([['Sales rows', 'sheets with Date, Customer and Amount columns; rows matching one already loaded (same date, customer, invoice, product, amount) are skipped'], ['Targets and campaigns', 'sheets with Salesperson, Month, Target or Campaign, Discount % columns'], ['Documents', 'each paragraph is linked to a customer when it names them, or sits under a heading that does'], ['Privacy', 'files are read in this browser; nothing is uploaded']]), 'wide');
    if (!state.tx.length) { scroll(bot('<p>I still need a sales file (Excel or CSV) with Date, Customer and Amount columns.</p>' + acts([['upload', 'Upload sales file', 'pri full']]))); return; }
    if (!state.me || NBA.salespeople(state).indexOf(state.me) < 0) { state.me = NBA.salespeople(state)[0]; save(); }
    dock.hidden = false; renderPeople(); brief();
    void gotTx;
  }
  fileInput.addEventListener('change', function () {
    var files = [].slice.call(fileInput.files); if (!files.length) return;
    said('Upload: ' + files.map(function (f) { return f.name; }).join(', '));
    var wait = bot('<p>Reading your files…</p>', '', { instant: true });
    // sales files first so documents can be linked to customers
    files.sort(function (a, b) { return /\.(docx?|pptx?)$/i.test(a.name) - /\.(docx?|pptx?)$/i.test(b.name); });
    Promise.all(files.map(function (f) { return readFile(f).then(function (buf) { return Parsers.parseFile(f.name, buf); }); }))
      .then(function (rs) { wait.remove(); ingest(rs); })
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
        state = blank(); dashSp = null; chat.innerHTML = ''; ingest(rs);
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
    else if (name === 'file') fileSheet(cid);
  }
  chat.addEventListener('click', function (e) {
    var tile = e.target.closest('[data-tile]');
    if (tile) { var msg = tile.closest('.msg'), open = tile.getAttribute('aria-expanded') === 'true';
      [].forEach.call(msg.querySelectorAll('[data-tile]'), function (b) { b.setAttribute('aria-expanded', 'false'); }); [].forEach.call(msg.querySelectorAll('.tp'), function (x) { x.hidden = true; });
      if (!open) { tile.setAttribute('aria-expanded', 'true'); msg.querySelector('.tp[data-tp="' + tile.dataset.tile + '"]').hidden = false; follow(); } return; }
    var v = e.target.closest('[data-v]');
    if (v) { var id = v.closest('.vfoot').dataset.visit; if (v.dataset.v === 'skip') skipSheet(id); else markVisit(id, v.dataset.v === 'done' ? 'done' : null); return; }
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
    if (s && s.tx) { state = s; state.settings = state.settings || { currency: '$', voice: true }; state.visits = state.visits || []; state.plans = state.plans || {}; state.targets = state.targets || []; state.campaigns = state.campaigns || []; }
    if (!state.tx.length) welcome();
    else if (!state.me) askWho();
    else { dock.hidden = false; renderPeople(); home(); }
  });
})();
