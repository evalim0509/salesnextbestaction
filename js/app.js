/* Sales Brief: the chat screen. Buttons only, no typing. All data stays in this browser. */
(function () {
  'use strict';
  var NBA = window.NBA, Parsers = window.NBAParsers;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var chat = $('#chat'), dock = $('#dock'), sheet = $('#sheet'), fileInput = $('#file');
  var state = blank(), an = null, dashSp = null, view = 'brief';
  function blank() { return { me: null, tx: [], docs: [], notes: [], deals: [], visits: [], plans: {}, files: [], settings: { currency: '$', voice: true } }; }
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
  function refresh() { an = state.tx.length && state.me ? NBA.analyze(state, state.me) : null; }
  function cust(cid) { return an && an.customers.filter(function (c) { return c.cid === cid; })[0]; }

  // ------------------------------------------------------------ chat primitives
  // Replies are queued: thinking dots first, then the words type out. A tap skips to the full text.
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var Q = Promise.resolve(), pending = 0, fast = false, turnStart = null, skippers = [];
  function enqueue(fn) {
    pending++;
    Q = Q.then(fn).catch(function () {}).then(function () { if (!--pending) { fast = false; follow(); } });
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
  var ATOMIC = 'button, .tag, details, .acts, .rowlist, .pitch-ask, .src-line, table, svg';
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
  function tagClass(t) { return t === 'Likely to close' || t === 'Good chance' ? 'go' : t === 'May churn' ? 'risk' : t === 'Watch' ? 'watch' : ''; }
  function tag(c) { return '<span class="tag ' + tagClass(c.tag) + '">' + c.tag + '</span>'; }
  function acts(list) {
    return '<div class="acts">' + list.map(function (a) { return '<button class="' + (a[2] || '') + '" data-do="' + a[0] + '">' + esc(a[1]) + '</button>'; }).join('') + '</div>';
  }

  // ------------------------------------------------------------ flows
  function welcome() {
    hurry(); chat.innerHTML = ''; dock.hidden = true; $('#people').hidden = true;
    var h = document.createElement('div'); h.className = 'hello fade';
    h.innerHTML = '<span class="orb"></span><h2>' + greeting() + '. Shall we plan your day?</h2><p>Upload your sales file and I will tell you who to visit, who is ready to buy and what to say.</p>' +
      acts([['upload', 'Upload my files', 'pri'], ['sample', 'Try with sample data', '']]) +
      '<p class="small" style="margin-top:14px">Your files are read on this phone only. Nothing is sent anywhere and no AI service is used.</p>';
    chat.appendChild(h);
  }
  function renderPeople() {
    var el = $('#people'), people = NBA.salespeople(state), dash = view === 'dash';
    el.hidden = !people.length; if (!people.length) return;
    var sel = dash ? dashSp : state.me;
    el.innerHTML = (dash ? '<button role="tab" data-sp="" aria-selected="' + (sel === null) + '">All team</button>' : '') +
      people.map(function (p) { return '<button role="tab" data-sp="' + esc(p) + '" aria-selected="' + (p === sel) + '">' + esc(p) + '</button>'; }).join('');
    var on = el.querySelector('[aria-selected="true"]'); if (on && on.scrollIntoView) on.scrollIntoView({ inline: 'center', block: 'nearest' });
  }
  function askWho() { setMe(NBA.salespeople(state)[0]); }
  function setMe(name) {
    state.me = name; save(); refresh();
    dock.hidden = false; renderPeople();
    clearChat(); brief();
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
    if (status && !quiet && p.length && !left) bot('<p>That is all ' + p.length + ' of today\'s visits accounted for.</p>' + acts([['wrap', 'Wrap up my day', 'pri full']]));
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
  // Executive summary: fixed sentence templates filled with today's numbers.
  function brief() {
    refresh(); if (!an) return;
    var P = plan(), L = { top3: P }, first = state.me.split(' ')[0], ex = NBA.execSummary(state, state.me, an, { plan: P });
    var doneN = P.filter(function (c) { return visitOf(c.cid); }).length;
    var d = new Date(), dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
    bot('<h3>' + greeting() + ', ' + esc(first) + '</h3><p class="small">' + (an.stale ? 'Based on sales up to ' + NBA.niceDate(an.dataTo) : dayName + ', ' + NBA.niceDate(an.asOf)) + '. I went through ' +
      an.customers.length + ' customers, ' + state.notes.length + ' visit notes and ' + state.docs.length + ' documents.</p>' +
      '<p class="lead">' + esc(ex.headline) + '</p><ul class="facts">' + ex.points.map(function (x) { return '<li><b>' + esc(x.label) + '</b>' + esc(x.text) + '</li>'; }).join('') + '</ul>', 'wide');
    if (an.stale) bot('Your sales data stops on ' + NBA.niceDate(an.dataTo) + '. Upload a newer sales file for an up-to-date brief.', 'notice');
    if (ex.offers.length) bot('<p><b>Offers and renewals to use today</b></p><ul>' + ex.offers.map(function (o) { return '<li><b>' + esc(o.name) + '</b>' + (o.renewal ? ' (renewal)' : '') + ': ' + esc(o.text) + '</li>'; }).join('') + '</ul>', 'wide');
    if (!L.top3.length) { bot('<p>You have no active customers in the uploaded data.</p>'); return; }
    bot('<p>' + (doneN ? 'Your plan for today: ' + doneN + ' of ' + P.length + ' visits accounted for.' : 'My recommendation: visit these ' + P.length + ' customers today, in this order.') + ' Tap one for the pitch.</p>');
    L.top3.forEach(visitCard);
  }
  function wrapUpDay() {
    refresh(); if (!an) return;
    var P = plan(), w = NBA.wrapUp(state, state.me, an, P.map(function (c) { return c.cid; })), li = [];
    function names(a) { return a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
    li.push('<li><b>Visits</b>' + (w.planned ? 'You visited ' + w.visited.length + ' of your ' + w.planned + ' planned customers' + (w.visited.length ? ': ' + esc(names(w.visited)) : '') + '.' : 'No visits were planned today.') +
      w.skipped.map(function (x) { return ' Skipped ' + esc(x.name) + ' (' + esc(x.reason.toLowerCase()) + ').'; }).join('') +
      (w.open.length ? ' Not marked yet: ' + esc(names(w.open.map(function (x) { return x.name; }))) + '.' : '') + '</li>');
    li.push('<li><b>Deals</b>' + (w.deals.n ? 'You closed ' + w.deals.n + (w.deals.n === 1 ? ' deal' : ' deals') + ' worth ' + $$(w.deals.total) + ' today.' : 'No deals logged today.') + '</li>');
    li.push('<li><b>Notes</b>' + (w.noted.length ? 'Saved for ' + esc(names(w.noted)) + '.' : 'No visit notes saved today.') +
      (w.missingNotes.length ? ' Still missing for ' + esc(names(w.missingNotes.map(function (x) { return x.name; }))) + '. Add it while the visit is fresh.' : '') + '</li>');
    var tm = NBA.lists(NBA.analyze(state, state.me, { asOf: NBA.addDays(an.asOf, 1) })).top3;
    if (tm.length) li.push('<li><b>Tomorrow</b>Likely visits: ' + esc(names(tm.map(function (c) { return c.name; }))) + '.</li>');
    bot('<h3>Your day, ' + esc(state.me.split(' ')[0]) + '</h3><ul class="facts">' + li.join('') + '</ul>' +
      (w.missingNotes.length ? '<div class="acts">' + w.missingNotes.slice(0, 3).map(function (x) { return '<button class="full" data-do="note" data-for="' + esc(x.cid) + '">Add note for ' + esc(x.name) + '</button>'; }).join('') + '</div>' : ''), 'wide');
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
    card.addEventListener('pointerdown', function () { fast = true; skippers.splice(0).forEach(function (f) { f(); }); });
    pause(900).then(function () {
      if (run !== dashRun) return;
      card.innerHTML = '<p class="small">Manager brief</p><p class="lead">' + esc(m.headline) + '</p><ul class="facts">' + m.points.map(function (x) { return '<li><b>' + esc(x.label) + '</b>' + esc(x.text) + '</li>'; }).join('') + '</ul>';
      return typeOut(card);
    }).then(function () { if (!pending) fast = false; });
  }

  function showList(kind) {
    refresh(); if (!an) return;
    var L = NBA.lists(an), list = L[kind], close = kind === 'close';
    if (!list.length) { scroll(bot(close ? '<p>No customer stands out as ready to buy right now. Your top 3 visits are still your best bets.</p>' : '<p>Good news: none of your customers shows a strong sign of leaving right now.</p>')); return; }
    var m = bot('<p>' + (close ? 'These customers are most likely to close a deal now. Strongest first.' : 'These customers may be slipping away. Most at risk first.') + '</p><div class="rowlist">' +
      list.map(function (c) {
        var f = c.factors.filter(function (x) { return x.bucket === kind && x.pts > 0; }).sort(function (a, b) { return b.pts - a.pts; })[0];
        return '<button data-cid="' + esc(c.cid) + '"><span>' + esc(c.name) + '<span class="sub">' + esc(f ? f.plain : '') + '</span></span></button>';
      }).join('') + '</div>', 'wide');
    scroll(m);
  }
  function showCustomer(cid, echo) {
    refresh(); var c = cust(cid); if (!c) return;
    if (echo !== false) said(c.name);
    var reasons = NBA.topReasons(c, 3);
    var facts = c.lost ? 'No order for ' + c.recency + ' days.' :
      'Last order ' + (c.recency === 0 ? 'today' : c.recency === 1 ? 'yesterday' : c.recency + ' days ago') + '. Usual order about ' + $$(c.avgOrder) + '. ' + $$(c.rev12) + ' in the last 12 months.';
    var m = bot('<h3>' + esc(c.name) + '</h3>' + tag(c) + '<p style="margin-top:8px">' + facts + '</p>' +
      (reasons.length ? '<ul>' + reasons.map(function (r) { return '<li>' + esc(r.plain) + '</li>'; }).join('') + '</ul>' : '') +
      '<div data-cid="' + esc(c.cid) + '">' + acts([['pitch', 'What to say', 'pri'], ['why', 'Why this customer'], ['note', 'Add visit note'], ['deal', 'Deal closed'], ['file', 'Customer file', 'full']]) + '</div>', 'wide');
    scroll(m);
  }
  function showPitch(cid) {
    var c = cust(cid); if (!c) return; said('What to say to ' + c.name);
    var p = NBA.buildPitch(c, an);
    var m = bot('<h3>Pitch for ' + esc(c.name) + '</h3><p>' + esc(p.open) + '</p><ul>' + p.points.map(function (x) { return '<li>' + esc(x.text) + '</li>'; }).join('') + '</ul>' +
      '<div class="pitch-ask">' + esc(p.ask) + '</div><div class="src-line">Built from: ' + esc(p.sources.join(', ')) + '. Fixed rules, no AI.</div>' +
      '<div data-cid="' + esc(c.cid) + '">' + acts([['note', 'Add visit note'], ['deal', 'Deal closed']]) + '</div>', 'wide');
    scroll(m);
  }
  function showWhy(cid) {
    var c = cust(cid); if (!c) return; said('Why ' + c.name + '?');
    function block(bucket, title, score) {
      var f = c.factors.filter(function (x) { return x.bucket === bucket; });
      return '<div class="score"><span>' + title + '</span><span>' + score + ' / 100</span></div>' + (f.length ? f.map(function (x) {
        return '<div class="factor"><span class="pts ' + (x.pts < 0 ? 'neg' : '') + '">' + (x.pts > 0 ? '+' : '') + x.pts + '</span><span>' + esc(x.plain) + '<code>' + esc(x.tech) + '</code><span class="src">Source: ' + esc(x.src) + '</span></span></div>';
      }).join('') : '<div class="small">Nothing counted here.</div>');
    }
    var plain = c.factors.filter(function (x) { return x.pts !== 0; }).sort(function (a, b) { return Math.abs(b.pts) - Math.abs(a.pts); });
    var m = bot('<h3>Why ' + esc(c.name) + '</h3><ul>' + plain.map(function (x) { return '<li>' + esc(x.plain) + '</li>'; }).join('') + '</ul>' +
      '<details class="audit"><summary>Show the calculation</summary>' +
      block('priority', 'Visit priority', c.priority) + block('close', 'Chance to close a deal', c.close) + block('churn', 'Risk of losing them', c.churn) +
      '<p class="small" style="margin-top:10px">Scores are sums of the points shown, limited to 0–100. Calculated on ' + NBA.niceDate(an.asOf) + ' from sales up to ' + NBA.niceDate(an.dataTo) + '. The same working is saved in the customer file.</p></details>', 'wide');
    scroll(m);
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
    if (voice) h += '<button class="mic" id="mic"><svg viewBox="0 0 24 24"><path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span>Speak your note</span></button>' +
      '<div class="heard" id="heard" hidden></div><p class="small">I pick out the keywords below from what you say. Voice uses your phone\'s own speech service, which on some phones sends the audio to Apple or Google. For sensitive visits, tap the keywords instead.</p>';
    else if (!SR && state.settings.voice) h += '<p class="small">Voice notes are not available in this browser. Tap the keywords instead.</p>';
    Object.keys(groups).forEach(function (g) { h += '<div class="group">' + g + '</div><div data-kw>' + chipsHTML(groups[g]) + '</div>'; });
    h += '<div class="group">Talked about</div><div data-cat>' + chipsHTML(an.categories.map(function (x) { return [x, x]; })) + '</div>';
    openSheet('Visit note: ' + c.name, h, '<button class="btn pri" id="save-note" disabled>Save note</button>');
    var body = $('#sheet-body'), saveBtn = $('#save-note'), transcript = '', rec = null;
    function sel(attr) { return [].map.call(body.querySelectorAll('[' + attr + '] .chip[aria-pressed="true"]'), function (b) { return b.dataset.k; }); }
    function check() { saveBtn.disabled = !(sel('data-kw').length || sel('data-cat').length || transcript); }
    body.onclick = function (e) {
      var ch = e.target.closest('.chip'); if (ch) { ch.setAttribute('aria-pressed', ch.getAttribute('aria-pressed') !== 'true'); check(); }
    };
    if (voice) {
      var mic = $('#mic'), heard = $('#heard'), finalText = '';
      var stop = function () { if (rec) { try { rec.stop(); } catch (e) {} rec = null; } mic.classList.remove('on'); mic.lastChild.textContent = transcript ? 'Speak again to add more' : 'Speak your note'; };
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
          rec.start(); mic.classList.add('on'); mic.lastChild.textContent = 'Listening… tap to stop';
        } catch (e) { rec = null; }
      };
      onClose = stop;
    }
    saveBtn.onclick = function () {
      var before = { close: c.close, churn: c.churn };
      var note = { id: uid(), cid: c.cid, ts: stamp(), keywords: sel('data-kw'), cats: sel('data-cat'), transcript: transcript };
      state.notes.push(note); save(); closeSheet(); refresh(); autoVisited(c.cid);
      var n = cust(c.cid);
      said('Note for ' + c.name + ': ' + (note.keywords.map(function (id) { return NBA.KW[id].label; }).concat(note.cats).join(', ') || 'spoken note'));
      var ch = [];
      if (n.close !== before.close) ch.push('Chance to close went from ' + before.close + ' to ' + n.close + ' out of 100.');
      if (n.churn !== before.churn) ch.push('Risk of losing them went from ' + before.churn + ' to ' + n.churn + ' out of 100.');
      var m = bot('<p>Saved to the file for ' + esc(c.name) + '. ' + (ch.join(' ') || 'The scores did not change.') + ' The pitch is updated with what you learned.</p><div data-cid="' + esc(c.cid) + '">' +
        acts([['pitch', 'See updated pitch', 'pri'], ['deal', 'Deal closed'], ['brief', 'Back to today\'s visits', 'full']]) + '</div>');
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
      var line = d.hasPrev && me ? 'Your sales this year are now ' + $$(me.cur) + ', which is ' + $$(Math.abs(me.inc)) + (me.inc >= 0 ? ' ahead of' : ' behind') + ' the same time last year.' : 'Your sales this year are now ' + $$(me ? me.cur : deal.amt) + '.';
      var cl = cc && d.hasPrev ? ' ' + esc(c.name) + ' is ' + $$(Math.abs(cc.inc)) + (cc.inc >= 0 ? ' up' : ' down') + ' on last year.' : '';
      var m = bot('<h3>Well done</h3><p>' + $$(deal.amt) + ' is logged for ' + esc(c.name) + ' and added to the revenue dashboard.</p><p>' + line + cl + '</p>' +
        acts([['dash', 'Open dashboard'], ['brief', 'Back to today\'s visits']]));
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
    openSheet('More',
      '<div class="group">On this phone</div><p class="small" style="margin:0 0 8px">' + state.tx.length.toLocaleString() + ' sales rows for ' + Object.keys(nCust).length + ' customers, up to ' + (when.dataTo ? NBA.niceDate(when.dataTo) : 'n/a') + '. ' +
      state.docs.length + ' document' + (state.docs.length === 1 ? '' : 's') + (state.docs.length ? ' (' + state.docs.map(function (d) { return esc(d.name); }).join(', ') + ')' : '') + '. ' + state.notes.length + ' visit notes. ' + state.deals.length + ' deals logged.</p>' +
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
        var ids = {}, min = r.tx[0].d, max = r.tx[0].d; r.tx.forEach(function (t) { ids[t.cid] = 1; if (t.d < min) min = t.d; if (t.d > max) max = t.d; });
        lines.push('<li><b>' + esc(r.name) + '</b>: ' + mg.added.toLocaleString() + ' new sales rows for ' + Object.keys(ids).length + ' customers, ' + NBA.niceDate(min) + ' to ' + NBA.niceDate(max) + '.' +
          (mg.duplicates ? ' ' + mg.duplicates.toLocaleString() + ' rows were already loaded and were skipped.' : '') + (r.skipped ? ' ' + r.skipped + ' rows had no date or amount and were left out.' : '') +
          (confirmed ? ' ' + confirmed + ' deal' + (confirmed === 1 ? '' : 's') + ' you logged in the app ' + (confirmed === 1 ? 'is' : 'are') + ' now covered by this file.' : '') + '</li>');
      } else {
        state.docs = state.docs.filter(function (d) { return d.name !== r.doc.name; }); state.docs.push(r.doc);
        var custs = {}; state.tx.forEach(function (t) { custs[t.cid] = { cid: t.cid, name: t.cname, seg: t.seg }; });
        var linked = {}; NBA.linkDocs([r.doc], Object.keys(custs).map(function (k) { return custs[k]; }), []).forEach(function (s) { s.cids.forEach(function (id) { linked[id] = 1; }); });
        lines.push('<li><b>' + esc(r.name) + '</b>: read ' + r.doc.paras.length + ' paragraphs' + (state.tx.length ? ', mentioning ' + Object.keys(linked).length + ' of your company\'s customers by name.' : '. Upload a sales file too so I can link it to customers.') + '</li>');
      }
    });
    save();
    bot('<p>Here is what I read:</p><ul>' + lines.join('') + '</ul>', 'wide');
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
    else if (name === 'wrap') { said('Wrap up my day'); wrapUpDay(); }
    else if (name === 'pitch') showPitch(cid);
    else if (name === 'why') showWhy(cid);
    else if (name === 'note') { if (cid) noteSheet(cid); else customersSheet('Visit note for which customer?', noteSheet); }
    else if (name === 'deal') dealSheet(cid);
    else if (name === 'file') fileSheet(cid);
  }
  chat.addEventListener('click', function (e) {
    var v = e.target.closest('[data-v]');
    if (v) { var id = v.closest('.vfoot').dataset.visit; if (v.dataset.v === 'skip') skipSheet(id); else markVisit(id, v.dataset.v === 'done' ? 'done' : null); return; }
    var d = e.target.closest('[data-do]');
    if (d) { var holder = d.closest('[data-cid]'); act(d.dataset.do, d.dataset.for || (holder && holder.dataset.cid)); return; }
    var c = e.target.closest('[data-cid]'); if (c && c.tagName === 'BUTTON') showCustomer(c.dataset.cid);
  });
  chat.addEventListener('pointerdown', hurry);
  document.addEventListener('click', function (e) { var b = e.target.closest('[data-act]'); if (b) act(b.dataset.act); });
  $('#people').addEventListener('click', function (e) {
    var b = e.target.closest('[data-sp]'); if (!b) return;
    if (view === 'dash') { dashSp = b.dataset.sp || null; renderPeople(); showDash(); }
    else if (b.dataset.sp !== state.me) setMe(b.dataset.sp);
  });
  function tab(name) {
    var dash = name === 'dash'; view = name;
    $('#view-brief').hidden = dash; $('#view-dash').hidden = !dash;
    $('#tab-brief').setAttribute('aria-selected', !dash); $('#tab-dash').setAttribute('aria-selected', dash);
    renderPeople();
    if (dash) showDash();
  }
  document.querySelector('.tabs').addEventListener('click', function (e) { var b = e.target.closest('[data-tab]'); if (b) tab(b.dataset.tab); });

  // ------------------------------------------------------------ start
  DB.get().then(function (s) {
    if (s && s.tx) { state = s; state.settings = state.settings || { currency: '$', voice: true }; state.visits = state.visits || []; state.plans = state.plans || {}; }
    if (!state.tx.length) welcome();
    else if (!state.me) askWho();
    else { dock.hidden = false; renderPeople(); brief(); }
  });
})();
