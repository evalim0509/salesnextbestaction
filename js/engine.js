/*
 * Next Best Action engine.
 * Pure rules and arithmetic. No LLM, no network calls. Runs in the browser and in Node (for tests).
 * Every score is a sum of named factors, and each factor carries a plain-English
 * sentence and a technical trace so the result can be audited.
 */
(function (root) {
  'use strict';

  // ---------------------------------------------------------------- dates
  var DAY = 86400000;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(y, m, d) { return y + '-' + pad(m) + '-' + pad(d); }
  function dayNum(s) { return Math.round(Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) / DAY); }
  function fromDayNum(n) { var d = new Date(n * DAY); return iso(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()); }
  function addDays(s, n) { return fromDayNum(dayNum(s) + n); }
  function todayISO() { var d = new Date(); return iso(d.getFullYear(), d.getMonth() + 1, d.getDate()); }
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function niceDate(s) { return +s.slice(8, 10) + ' ' + MONTHS[+s.slice(5, 7) - 1] + ' ' + s.slice(0, 4); }
  function validYMD(y, m, d) {
    if (!(y > 1990 && y < 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31)) return null;
    var t = new Date(Date.UTC(y, m - 1, d));
    return t.getUTCDate() === d ? iso(y, m, d) : null;
  }
  // Accepts Excel serial numbers, JS Dates, and common text formats. Day-first for 01/02/2026.
  function parseDate(v) {
    if (v == null || v === '') return null;
    if (v instanceof Date) { var a = new Date(v.getTime() + 12 * 3600000); return iso(a.getFullYear(), a.getMonth() + 1, a.getDate()); }
    if (typeof v === 'number') { return (v > 20000 && v < 80000) ? fromDayNum(Math.floor(v) - 25569) : null; }
    var s = String(v).trim(), m;
    if ((m = s.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/))) return validYMD(+m[1], +m[2], +m[3]);
    if ((m = s.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})/))) {
      var y = +m[3]; if (y < 100) y += 2000;
      return validYMD(y, +m[2], +m[1]) || validYMD(y, +m[1], +m[2]);
    }
    if ((m = s.match(/^(\d{1,2})[-\s]([A-Za-z]{3})[A-Za-z]*[-\s,]+(\d{2,4})/))) {
      var mi = MONTHS.map(function (x) { return x.toLowerCase(); }).indexOf(m[2].toLowerCase());
      var yy = +m[3]; if (yy < 100) yy += 2000;
      return mi < 0 ? null : validYMD(yy, mi + 1, +m[1]);
    }
    if (/^\d{5}(\.\d+)?$/.test(s)) return parseDate(+s);
    return null;
  }

  // ---------------------------------------------------------------- helpers
  function money(n, cur) {
    var neg = n < 0; n = Math.round(Math.abs(n));
    return (neg ? '-' : '') + (cur == null ? '$' : cur) + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function pct(x) { return (x >= 0 ? '+' : '') + Math.round(x * 100) + '%'; }
  function median(a) { if (!a.length) return 0; var b = a.slice().sort(function (x, y) { return x - y; }); var h = b.length >> 1; return b.length % 2 ? b[h] : (b[h - 1] + b[h]) / 2; }
  function sum(a, f) { var t = 0; for (var i = 0; i < a.length; i++) t += f ? f(a[i]) : a[i]; return t; }
  function toNum(v) {
    if (typeof v === 'number') return v;
    if (v == null) return NaN;
    var s = String(v).replace(/[^0-9.,()\-]/g, '');
    var neg = /^\(.*\)$/.test(s) || /^-/.test(s);
    s = s.replace(/[()\-]/g, '');
    if (/,\d{1,2}$/.test(s) && s.indexOf('.') < 0) s = s.replace(',', '.'); // 12,5 -> 12.5
    s = s.replace(/,/g, '');
    var n = parseFloat(s);
    return neg ? -n : n;
  }
  function normName(s) {
    return (' ' + String(s || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ') + ' ')
      .replace(/ (the|ltd|limited|inc|llc|co|company|corp|corporation|pte|sdn|bhd|plc|gmbh|llp) (?=(?:[a-z]+ )*$)/g, ' ')
      .replace(/ (ltd|limited|inc|llc|corp|corporation|pte|sdn|bhd|plc|gmbh|llp) /g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  function normText(s) { return ' ' + String(s || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim() + ' '; }

  // ---------------------------------------------------------------- transactions
  var HEADERS = {
    date: ['date', 'invoice date', 'transaction date', 'order date', 'txn date', 'posting date', 'sales date'],
    cname: ['customer', 'customer name', 'account', 'account name', 'client', 'client name', 'customer_name'],
    cid: ['customer id', 'customer code', 'customer no', 'account id', 'account no', 'client id', 'cust id', 'customer_id'],
    sp: ['salesperson', 'sales person', 'sales rep', 'rep', 'salesman', 'owner', 'account manager', 'sales executive', 'sales representative', 'seller'],
    amt: ['amount', 'revenue', 'sales', 'net amount', 'total', 'value', 'net sales', 'sales amount', 'line total', 'total amount', 'net value'],
    qty: ['quantity', 'qty', 'units'],
    price: ['unit price', 'price'],
    cat: ['category', 'product category', 'product group', 'product line', 'product family'],
    prod: ['product', 'item', 'sku', 'product name', 'description', 'item name'],
    seg: ['segment', 'customer segment', 'channel', 'industry', 'customer type'],
    inv: ['invoice', 'invoice no', 'invoice number', 'order no', 'order id', 'document no', 'invoice id', 'order number']
  };
  function mapHeaders(keys) {
    var map = {};
    keys.forEach(function (k) {
      var n = String(k).toLowerCase().replace(/[_.#]+/g, ' ').replace(/\s+/g, ' ').trim();
      for (var f in HEADERS) if (!map[f] && HEADERS[f].indexOf(n) >= 0) map[f] = k;
    });
    return map;
  }
  // rows: array of plain objects keyed by the sheet's header text.
  function normalizeRows(rows) {
    if (!rows || !rows.length) return { ok: false, reason: 'The sheet is empty.' };
    var keys = {}; rows.slice(0, 50).forEach(function (r) { for (var k in r) keys[k] = 1; });
    var map = mapHeaders(Object.keys(keys));
    var missing = [];
    if (!map.date) missing.push('Date');
    if (!map.cname && !map.cid) missing.push('Customer');
    if (!map.amt && !(map.qty && map.price)) missing.push('Amount');
    if (missing.length) return { ok: false, reason: 'I could not find these columns: ' + missing.join(', ') + '.', map: map };
    var tx = [], skipped = 0;
    rows.forEach(function (r) {
      var d = parseDate(r[map.date]);
      var name = String(map.cname ? r[map.cname] : r[map.cid] || '').trim();
      var cid = String(map.cid ? r[map.cid] : '').trim() || normName(name);
      var amt = map.amt ? toNum(r[map.amt]) : toNum(r[map.qty]) * toNum(r[map.price]);
      if (!d || !cid || !isFinite(amt)) { skipped++; return; }
      tx.push({
        d: d, cid: cid, cname: name || cid,
        sp: String(map.sp ? r[map.sp] : '').trim() || 'Me',
        amt: Math.round(amt * 100) / 100,
        qty: map.qty ? (toNum(r[map.qty]) || 0) : 0,
        cat: String(map.cat ? r[map.cat] : '').trim() || 'General',
        prod: String(map.prod ? r[map.prod] : '').trim(),
        seg: String(map.seg ? r[map.seg] : '').trim() || 'General',
        inv: String(map.inv ? r[map.inv] : '').trim(),
        src: 'upload'
      });
    });
    if (!tx.length) return { ok: false, reason: 'I found the columns but no usable rows (check the dates and amounts).', map: map };
    return { ok: true, tx: tx, skipped: skipped, map: map };
  }
  // ---- optional sheets: Targets (Salesperson, Month, Target) and Campaigns
  function parseMonth(v) {
    var d = parseDate(v), m; if (d) return d.slice(0, 7);
    var t = String(v == null ? '' : v).trim();
    if ((m = t.match(/^(\d{4})[-\/.](\d{1,2})$/))) return m[1] + '-' + pad(+m[2]);
    if ((m = t.match(/^(\d{1,2})[-\/.](\d{4})$/))) return m[2] + '-' + pad(+m[1]);
    if ((m = t.match(/^([A-Za-z]{3})[A-Za-z]*[\s\-,]+(\d{4})$/))) { var i = MONTHS.map(function (x) { return x.toLowerCase(); }).indexOf(m[1].toLowerCase()); return i < 0 ? null : m[2] + '-' + pad(i + 1); }
    return null;
  }
  function pick(keys, names) {
    for (var i = 0; i < keys.length; i++) { var n = String(keys[i]).toLowerCase().replace(/[_.#]+/g, ' ').replace(/\s+/g, ' ').trim(); if (names.indexOf(n) >= 0) return keys[i]; }
    return null;
  }
  function sheetKeys(rows) { var k = {}; (rows || []).slice(0, 50).forEach(function (r) { for (var x in r) k[x] = 1; }); return Object.keys(k); }
  function normalizeTargets(rows) {
    var keys = sheetKeys(rows), sp = pick(keys, HEADERS.sp), mo = pick(keys, ['month', 'period', 'target month']), tg = pick(keys, ['target', 'monthly target', 'sales target', 'quota', 'target amount']);
    if (!sp || !mo || !tg) return [];
    return rows.map(function (r) { return { sp: String(r[sp]).trim(), month: parseMonth(r[mo]), target: toNum(r[tg]) }; }).filter(function (t) { return t.sp && t.month && t.target > 0; });
  }
  function normalizeCampaigns(rows) {
    var keys = sheetKeys(rows), nm = pick(keys, ['campaign', 'campaign name', 'promotion', 'offer', 'name']), pc = pick(keys, ['discount %', 'discount', 'rebate %', 'rebate', 'discount percent', 'saving %', 'discount pct']);
    if (!nm || !pc) return [];
    var sg = pick(keys, HEADERS.seg), ct = pick(keys, HEADERS.cat.concat(['categories'])), mn = pick(keys, ['minimum spend', 'min spend', 'minimum order', 'minimum']), en = pick(keys, ['end date', 'valid until', 'ends', 'end', 'expiry']), ds = pick(keys, ['description', 'details', 'terms']);
    return rows.map(function (r) {
      var p = toNum(r[pc]); if (p > 0 && p < 1) p *= 100;
      var seg = sg ? String(r[sg]).trim() : '', cats = ct ? String(r[ct]).split(/\s*[+,;&\/]\s*/).map(function (x) { return x.trim(); }).filter(Boolean) : [];
      return { name: String(r[nm]).trim(), segs: seg && !/^(all|any)$/i.test(seg) ? [seg] : [], cats: /^(all|any)$/i.test(cats.join('')) ? [] : cats, pct: p / 100, minSpend: mn ? (toNum(r[mn]) || 0) : 0, end: en ? parseDate(r[en]) : null, text: ds ? String(r[ds]).trim() : '', cids: [], src: 'Campaigns sheet' };
    }).filter(function (c) { return c.name && c.pct > 0; });
  }
  // Campaign terms picked out of Word / PowerPoint paragraphs by simple patterns.
  function textCampaigns(snippets, asOf) {
    var out = [];
    snippets.forEach(function (sn) {
      if (sn.tags.indexOf('campaign') < 0 || (!sn.segs.length && !sn.cids.length)) return;
      var m, pct = 0, mech = '';
      if ((m = sn.text.match(/buy (\d+)[^.]*?get (\d+)[^.]*?free/i))) { pct = +m[2] / (+m[1] + +m[2]); mech = 'buy ' + m[1] + ' get ' + m[2] + ' free'; }
      else if ((m = sn.text.match(/(\d+(?:\.\d+)?)\s?%/))) { pct = +m[1] / 100; mech = m[1] + '% ' + (/rebate/i.test(sn.text) ? 'rebate' : 'discount'); }
      if (!pct || pct > 0.6) return;
      var end = null, e = sn.text.match(/(?:until|before|by|ends?(?: on)?)\s+(?:the\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3})/i);
      if (e) { var mi = MONTHS.map(function (x) { return x.toLowerCase(); }).indexOf(e[2].toLowerCase()); if (mi >= 0) { end = validYMD(+asOf.slice(0, 4), mi + 1, +e[1]); if (end && end < addDays(asOf, -180)) end = validYMD(+asOf.slice(0, 4) + 1, mi + 1, +e[1]); } }
      out.push({ name: sn.section || 'Campaign', segs: sn.segs, cats: sn.cats, pct: pct, minSpend: 0, end: end, text: sn.text, cids: sn.cids, src: sn.doc, mech: mech, fromText: true });
    });
    return out;
  }
  function allCampaigns(state, snippets, asOf) {
    var sheet = (state.campaigns || []).slice();
    var text = textCampaigns(snippets, asOf).filter(function (t) {
      return !sheet.some(function (c) { return (!c.cats.length || c.cats.some(function (k) { return t.cats.indexOf(k) >= 0; })) && (!c.segs.length || !t.segs.length || c.segs.some(function (k) { return t.segs.indexOf(k) >= 0; })); });
    });
    return sheet.concat(text);
  }
  function campaignLine(k, cur) {
    var what = k.cats.length ? k.cats.join(' and ') : 'goods';
    return 'The ' + k.name + ' applies to them and they have not used it yet. On a ' + money(k.basis, cur) + ' order of ' + what + ' they save about ' + money(k.saving, cur) +
      ' (' + (k.mech && k.fromText ? k.mech + ', worth about ' : '') + Math.round(k.pct * 100) + '%).' + (k.end ? ' Valid until ' + niceDate(k.end) + '.' : '');
  }

  function txKey(t) { return [t.d, t.cid, t.inv, t.cat, t.prod, t.amt, t.qty].join('|'); }
  function mergeTx(existing, incoming) {
    var seen = {}, out = existing.slice(), added = 0;
    existing.forEach(function (t) { seen[txKey(t)] = 1; });
    incoming.forEach(function (t) { var k = txKey(t); if (!seen[k]) { seen[k] = 1; out.push(t); added++; } });
    return { tx: out, added: added, duplicates: incoming.length - added };
  }

  // ---------------------------------------------------------------- note keywords
  // close / churn are the points a keyword adds to each score. Fixed list: the app never interprets free text.
  var KEYWORDS = [
    { id: 'happy', label: 'Happy with us', group: 'Mood', close: 5, churn: -10, syn: ['happy', 'satisfied', 'pleased', 'went well', 'good meeting', 'great meeting'] },
    { id: 'unhappy', label: 'Unhappy', group: 'Mood', close: 0, churn: 15, syn: ['unhappy', 'not happy', 'upset', 'angry', 'frustrated', 'disappointed', 'annoyed'] },
    { id: 'interested', label: 'Interested', group: 'Buying signals', close: 15, churn: 0, syn: ['interested', 'keen', 'wants to buy', 'want to buy'] },
    { id: 'quote', label: 'Asked for a quote', group: 'Buying signals', close: 25, churn: 0, syn: ['quote', 'quotation', 'proposal', 'price list'] },
    { id: 'budget_ok', label: 'Budget approved', group: 'Buying signals', close: 25, churn: 0, syn: ['budget approved', 'has budget', 'have budget', 'got budget', 'approved'] },
    { id: 'sample', label: 'Wants a sample or trial', group: 'Buying signals', close: 12, churn: 0, syn: ['sample', 'samples', 'trial', 'demo', 'pilot'] },
    { id: 'decision_maker', label: 'Met the decision maker', group: 'Buying signals', close: 10, churn: 0, syn: ['decision maker', 'met the owner', 'met the director', 'met the boss', 'met the manager'] },
    { id: 'bulk', label: 'Wants a bigger order', group: 'Buying signals', close: 15, churn: 0, syn: ['bulk', 'bigger order', 'larger order', 'large order', 'more volume', 'increase order'] },
    { id: 'expanding', label: 'Expanding business', group: 'Buying signals', close: 12, churn: 0, syn: ['expanding', 'expansion', 'new branch', 'new outlet', 'new site', 'new location', 'opening'] },
    { id: 'follow_up', label: 'Wants a follow-up', group: 'Buying signals', close: 12, churn: 0, syn: ['follow up', 'call back', 'come back', 'next week', 'revisit'] },
    { id: 'price', label: 'Price too high', group: 'Concerns', close: 0, churn: 8, syn: ['price', 'pricing', 'expensive', 'too high', 'cheaper', 'discount', 'costly'] },
    { id: 'competitor', label: 'Competitor offer', group: 'Concerns', close: 0, churn: 15, syn: ['competitor', 'competition', 'another supplier', 'other supplier', 'switch', 'switching', 'alternative'] },
    { id: 'delivery', label: 'Delivery issue', group: 'Concerns', close: 0, churn: 10, syn: ['delivery', 'late', 'delay', 'delayed', 'shipment', 'out of stock'] },
    { id: 'quality', label: 'Quality complaint', group: 'Concerns', close: 0, churn: 12, syn: ['quality', 'defect', 'defective', 'faulty', 'complaint', 'complained', 'broken', 'returned'] },
    { id: 'budget_cut', label: 'Budget cut', group: 'Concerns', close: -10, churn: 10, syn: ['budget cut', 'no budget', 'cutting costs', 'cost saving', 'freeze'] },
    { id: 'payment', label: 'Payment issue', group: 'Concerns', close: 0, churn: 5, syn: ['payment', 'overdue', 'outstanding', 'credit limit'] },
    { id: 'not_interested', label: 'Not interested', group: 'Concerns', close: -20, churn: 8, syn: ['not interested', 'no need', 'not now', 'declined', 'not keen'] }
  ];
  var KW = {}; KEYWORDS.forEach(function (k) { KW[k.id] = k; });

  // Voice transcript -> keyword ids + category names. Simple phrase matching only.
  function extractKeywords(text, categories) {
    var t = normText(text), ids = [], cats = [];
    KEYWORDS.forEach(function (k) {
      var hit = k.syn.some(function (s) {
        var i = t.indexOf(' ' + s + ' ');
        if (i < 0) return false;
        // "not interested", "no budget", "not happy" must not count as the positive keyword
        if (k.close > 0 && k.churn <= 0 && / (not|no|isn t|aren t|wasn t|never) $/.test(t.slice(0, i + 1))) return false;
        return true;
      });
      if (hit) ids.push(k.id);
    });
    if (ids.indexOf('budget_cut') >= 0) ids = ids.filter(function (x) { return x !== 'budget_ok'; });
    (categories || []).forEach(function (c) { if (c.length > 2 && t.indexOf(normText(c)) >= 0) cats.push(c); });
    return { keywords: ids, cats: cats };
  }

  // ---------------------------------------------------------------- documents
  var DOC_TAGS = {
    priority: /\b(key account|strategic|priority|top account|focus account|must[- ]win)\b/i,
    renewal: /\b(renew\w*|contract (ends|expires|expiry|is up)|expir\w+)\b/i,
    campaign: /\b(campaign|promotion|promo|discount|special offer|launch\w*|bundle|rebate|free delivery)\b/i,
    risk: /\b(at risk|risk of|competitor\w*|churn\w*|complain\w*|unhappy|losing|lost share|declin\w+|threat)\b/i,
    growth: /\b(expand\w*|grow\w*|upsell|cross[- ]sell|new (branch|site|outlet|location|store)|opportunit\w+)\b/i
  };
  // docs: [{name, paras:[{t, h}]}]  h = heading level (0 = body text)
  function linkDocs(docs, custList, categories) {
    var names = custList.map(function (c) { var n = normName(c.name); return { cid: c.cid, n: n.length >= 4 ? ' ' + n + ' ' : null, id: /\d/.test(c.cid) && c.cid.length >= 4 ? ' ' + c.cid.toLowerCase() + ' ' : null }; });
    var segs = {}; custList.forEach(function (c) { if (c.seg && c.seg !== 'General') segs[c.seg] = 1; });
    segs = Object.keys(segs);
    function find(t) {
      var r = { cids: [], segs: [], cats: [] };
      names.forEach(function (x) { if ((x.n && t.indexOf(x.n) >= 0) || (x.id && t.indexOf(x.id) >= 0)) r.cids.push(x.cid); });
      segs.forEach(function (s) { if (t.indexOf(normText(s)) >= 0) r.segs.push(s); });
      (categories || []).forEach(function (c) { if (c !== 'General' && t.indexOf(normText(c)) >= 0) r.cats.push(c); });
      return r;
    }
    var out = [];
    (docs || []).forEach(function (doc) {
      var ctx = []; // heading stack
      (doc.paras || []).forEach(function (p) {
        var text = String(p.t || '').trim(); if (!text) return;
        var f = find(normText(text));
        if (p.h > 0) {
          ctx = ctx.filter(function (c) { return c.level < p.h; });
          ctx.push({ level: p.h, cids: f.cids, segs: f.segs, title: text });
          return;
        }
        var cids = f.cids, sg = f.segs, inherited = false;
        if (!cids.length) for (var i = ctx.length - 1; i >= 0; i--) if (ctx[i].cids.length) { cids = ctx[i].cids; inherited = true; break; }
        if (!sg.length && !f.cids.length) for (var j = ctx.length - 1; j >= 0; j--) if (ctx[j].segs.length) { sg = ctx[j].segs; break; }
        var tags = []; for (var k in DOC_TAGS) if (DOC_TAGS[k].test(text)) tags.push(k);
        if (!cids.length && !sg.length && !f.cats.length) return;
        if (text.length < 15) return;
        out.push({ doc: doc.name, text: text, cids: cids, segs: inherited ? [] : sg, cats: f.cats, tags: tags, section: ctx.length ? ctx[ctx.length - 1].title : '' });
      });
    });
    return out;
  }
  function shorten(text, max) {
    max = max || 200; if (text.length <= max) return text;
    var cut = text.slice(0, max), i = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '));
    return (i > 80 ? cut.slice(0, i + 1) : cut.slice(0, cut.lastIndexOf(' ')) + '…');
  }

  // ---------------------------------------------------------------- analysis
  var RULES = {
    staleDays: 14, lostDays: 180, lostRatio: 6, expiryDays: 7,
    overdue: [[3, 45], [2, 35], [1.5, 20]],
    decline: [[-0.5, 30], [-0.25, 20], [-0.1, 8]],
    growth: [[0.25, 20], [0.1, 10]],
    reorderWindow: [0.8, 1.5, 30], reorderEarly: [0.6, 0.8, 12],
    noteNegDays: 60, notePosDays: 45, noteNegCap: 25, notePosCap: 40,
    crossSell: 10, docRisk: 10, docCampaign: 10, docRenewal: 15, docGrowth: 8, docCap: 20, docPriority: 8,
    visitedDays: 2, visitedPenalty: 40,
    wMain: 0.6, wOther: 0.1, wValue: 0.3, listThreshold: 50
  };

  function allTx(state) {
    var tx = (state.tx || []).slice();
    (state.deals || []).forEach(function (d) {
      if (d.confirmed) return;
      tx.push({ d: d.date, cid: d.cid, cname: d.cname, sp: d.sp, amt: d.amt, qty: 0, cat: d.cat || 'General', prod: '', seg: d.seg || 'General', inv: 'APP-' + d.id, src: 'app' });
    });
    return tx;
  }
  function asOfDate(state, today) {
    today = today || todayISO();
    var max = null; (state.tx || []).forEach(function (t) { if (!max || t.d > max) max = t.d; });
    if (!max) return { asOf: today, stale: false, dataTo: null };
    if (dayNum(today) - dayNum(max) <= RULES.staleDays && max <= today) return { asOf: today, stale: false, dataTo: max };
    var a = addDays(max, 1);
    (state.deals || []).forEach(function (d) { if (d.date > a) a = d.date; });
    return { asOf: a, stale: true, dataTo: max };
  }
  function salespeople(state) {
    var s = {}; (state.tx || []).forEach(function (t) { s[t.sp] = 1; });
    return Object.keys(s).sort();
  }

  /**
   * analyze(state, salesperson, opts) -> { asOf, stale, dataTo, customers[], categories[] }
   * salesperson = null analyses every customer.
   */
  function analyze(state, me, opts) {
    opts = opts || {};
    var cur = (state.settings && state.settings.currency) || '$';
    var when = asOfDate(state, opts.today); if (opts.asOf) when = { asOf: opts.asOf, stale: when.stale, dataTo: when.dataTo };
    var asOf = when.asOf, A = dayNum(asOf);
    var tx = allTx(state).filter(function (t) { return t.d <= asOf; });
    var by = {}, catSet = {};
    tx.forEach(function (t) { (by[t.cid] = by[t.cid] || []).push(t); catSet[t.cat] = 1; });
    var categories = Object.keys(catSet).sort();

    // base features for every customer (peers are needed for cross-sell)
    var all = Object.keys(by).map(function (cid) {
      var rows = by[cid].sort(function (a, b) { return a.d < b.d ? -1 : a.d > b.d ? 1 : 0; });
      var last = rows[rows.length - 1];
      var days = [], seen = {};
      rows.forEach(function (t) { if (t.amt > 0 && !seen[t.d]) { seen[t.d] = 1; days.push(dayNum(t.d)); } });
      var gaps = []; for (var i = 1; i < days.length; i++) gaps.push(days[i] - days[i - 1]);
      function rev(from, to) { return sum(rows, function (t) { var n = dayNum(t.d); return n > A - from && n <= A - to ? t.amt : 0; }); }
      var cats = {}, cats12 = {};
      rows.forEach(function (t) {
        var c = cats[t.cat] = cats[t.cat] || { n: 0, last: t.d, amt: 0, amt12: 0 };
        c.n++; c.amt += t.amt; if (t.d > c.last) c.last = t.d;
        if (dayNum(t.d) > A - 365) { c.amt12 += t.amt; cats12[t.cat] = 1; }
      });
      var orderTotals = {}; rows.forEach(function (t) { var k = t.inv || t.d; orderTotals[k] = (orderTotals[k] || 0) + t.amt; });
      var ot = Object.keys(orderTotals).map(function (k) { return orderTotals[k]; }).filter(function (x) { return x > 0; });
      return {
        cid: cid, name: last.cname, sp: last.sp, seg: last.seg, rows: rows,
        nOrders: days.length, first: rows[0].d, last: days.length ? fromDayNum(days[days.length - 1]) : last.d,
        recency: days.length ? A - days[days.length - 1] : 9999,
        gap: gaps.length >= 2 ? median(gaps) : null,
        rev90: rev(90, 0), revPrev90: rev(180, 90), rev12: rev(365, 0), revPY: rev(730, 365),
        cats: cats, cats12: Object.keys(cats12), avgOrder: ot.length ? sum(ot) / ot.length : 0
      };
    });
    var fallbackGap = median(all.filter(function (c) { return c.gap; }).map(function (c) { return c.gap; })) || 30;

    // what similar customers buy
    var segStats = {};
    all.forEach(function (c) {
      var s = segStats[c.seg] = segStats[c.seg] || { n: 0, cats: {} };
      s.n++; c.cats12.forEach(function (k) { s.cats[k] = (s.cats[k] || 0) + 1; });
    });

    var snippets = linkDocs(state.docs, all.map(function (c) { return { cid: c.cid, name: c.name, seg: c.seg }; }), categories);
    var camps = allCampaigns(state, snippets, asOf);
    var mine = all.filter(function (c) { return !me || c.sp === me; });
    var revs = mine.map(function (c) { return c.rev12; });

    mine.forEach(function (c) {
      var F = []; // factors
      function add(bucket, pts, plain, tech, src) { if (pts) F.push({ bucket: bucket, pts: pts, plain: plain, tech: tech, src: src || 'Sales data' }); }
      var gap = c.gap || fallbackGap, gapNote = c.gap ? 'median gap between orders' : 'median gap of all customers (too few orders of their own)';
      var ratio = c.recency / gap;
      c.gapUsed = gap; c.ratio = ratio;
      c.trend = c.revPrev90 > 0 ? (c.rev90 - c.revPrev90) / c.revPrev90 : (c.rev90 > 0 ? 1 : 0);
      c.yoy = c.revPY > 0 ? (c.rev12 - c.revPY) / c.revPY : null;
      c.lost = c.recency > Math.max(RULES.lostDays, RULES.lostRatio * gap);
      c.notes = (state.notes || []).filter(function (n) { return n.cid === c.cid; }).sort(function (a, b) { return a.ts < b.ts ? 1 : -1; });
      c.deals = (state.deals || []).filter(function (d) { return d.cid === c.cid; }).sort(function (a, b) { return a.ts < b.ts ? 1 : -1; });
      c.docs = snippets.filter(function (s) { return s.cids.indexOf(c.cid) >= 0; });
      c.segDocs = snippets.filter(function (s) { return !s.cids.length && s.tags.indexOf('campaign') >= 0 && (s.segs.indexOf(c.seg) >= 0 || (!s.segs.length && s.cats.some(function (k) { return c.cats[k]; }))); });

      // --- campaigns that apply to this customer, with the saving in money
      c.campaigns = camps.filter(function (k) { return (!k.cids.length || k.cids.indexOf(c.cid) >= 0) && (!k.segs.length || k.segs.indexOf(c.seg) >= 0) && (!k.end || k.end >= asOf); }).map(function (k) {
        var per = {}, own = true;
        c.rows.forEach(function (t) { if (dayNum(t.d) > A - 365 && (!k.cats.length || k.cats.indexOf(t.cat) >= 0)) per[t.inv || t.d] = (per[t.inv || t.d] || 0) + t.amt; });
        var vals = Object.keys(per).map(function (x) { return per[x]; }).filter(function (x) { return x > 0; });
        var basis = vals.length ? sum(vals) / vals.length : 0;
        if (!basis) { basis = c.avgOrder; own = false; }
        basis = Math.max(basis, k.minSpend || 0);
        var used = k.cats.length > 0 && k.cats.every(function (x) { return c.cats[x] && A - dayNum(c.cats[x].last) <= 30; });
        return { name: k.name, cats: k.cats, pct: k.pct, mech: k.mech, fromText: !!k.fromText, end: k.end, src: k.src, minSpend: k.minSpend || 0, used: used, basis: Math.round(basis), saving: Math.round(basis * k.pct),
          tech: 'saving = ' + Math.round(k.pct * 1000) / 10 + '% × ' + money(basis, cur) + ' (' + (own ? 'their average order in ' + (k.cats.join(' + ') || 'all categories') + ', last 12 months' : 'their average order size; they have not bought this category') + (k.minSpend && basis === k.minSpend ? ', raised to the minimum spend' : '') + '); unused = no purchase of ' + (k.cats.join(' + ') || 'the category') + ' in the last 30 days' + (k.fromText ? '; terms read from document text' : '') };
      }).sort(function (a, b) { return a.used - b.used || b.saving - a.saving; });
      c.offer = c.lost ? null : c.campaigns.filter(function (k) { return !k.used; })[0] || null;

      // --- churn: overdue
      var i, r;
      for (i = 0; i < RULES.overdue.length; i++) {
        r = RULES.overdue[i];
        if (ratio >= r[0]) {
          add('churn', r[1], 'They usually order about every ' + Math.round(gap) + ' days, but it has been ' + c.recency + ' days since the last order.',
            'recency ' + c.recency + 'd ÷ ' + gapNote + ' ' + Math.round(gap) + 'd = ' + ratio.toFixed(2) + ' ≥ ' + r[0] + ' → +' + r[1] + ' churn');
          break;
        }
      }
      // --- churn: decline
      if (c.revPrev90 > 0) for (i = 0; i < RULES.decline.length; i++) {
        r = RULES.decline[i];
        if (c.trend <= r[0]) {
          add('churn', r[1], 'Their spending is down ' + Math.round(-c.trend * 100) + '% in the last 3 months compared with the 3 months before.',
            'revenue last 90d ' + money(c.rev90, cur) + ' vs previous 90d ' + money(c.revPrev90, cur) + ' = ' + pct(c.trend) + ' ≤ ' + pct(r[0]) + ' → +' + r[1] + ' churn');
          break;
        }
      }
      // --- close: reorder window
      var w = RULES.reorderWindow, e = RULES.reorderEarly;
      if (ratio >= w[0] && ratio < w[1] && c.nOrders >= 2)
        add('close', w[2], 'They are due to reorder now: they usually order about every ' + Math.round(gap) + ' days and the last order was ' + c.recency + ' days ago.',
          'recency ' + c.recency + 'd ÷ ' + gapNote + ' ' + Math.round(gap) + 'd = ' + ratio.toFixed(2) + ' in [' + w[0] + ', ' + w[1] + ') → +' + w[2] + ' close');
      else if (ratio >= e[0] && ratio < e[1] && c.nOrders >= 2)
        add('close', e[2], 'Their next order is coming up soon (they usually order about every ' + Math.round(gap) + ' days; last order ' + c.recency + ' days ago).',
          'recency ' + c.recency + 'd ÷ ' + Math.round(gap) + 'd = ' + ratio.toFixed(2) + ' in [' + e[0] + ', ' + e[1] + ') → +' + e[2] + ' close');
      // --- close: growth
      if (c.revPrev90 > 0) for (i = 0; i < RULES.growth.length; i++) {
        r = RULES.growth[i];
        if (c.trend >= r[0]) {
          add('close', r[1], 'They are buying more: spending is up ' + Math.round(c.trend * 100) + '% in the last 3 months.',
            'revenue last 90d ' + money(c.rev90, cur) + ' vs previous 90d ' + money(c.revPrev90, cur) + ' = ' + pct(c.trend) + ' ≥ ' + pct(r[0]) + ' → +' + r[1] + ' close');
          break;
        }
      }
      // --- cross-sell gap and lapsed categories
      var st = segStats[c.seg];
      c.peerGap = (st && st.n >= 4) ? Object.keys(st.cats).filter(function (k) { return !c.cats[k] && st.cats[k] / st.n >= 0.5; })
        .sort(function (a, b) { return st.cats[b] - st.cats[a]; }) : [];
      c.lapsed = Object.keys(c.cats).filter(function (k) { return c.cats[k].n >= 2 && A - dayNum(c.cats[k].last) > Math.max(120, 3 * gap) && !c.lost; });
      if (c.peerGap.length && !c.lost)
        add('close', RULES.crossSell, 'Most similar ' + c.seg + ' customers buy ' + c.peerGap[0] + ', but they never have.',
          c.peerGap[0] + ' bought by ' + st.cats[c.peerGap[0]] + ' of ' + st.n + ' ' + c.seg + ' customers in the last 12 months (≥ 50%), 0 purchases by this customer → +' + RULES.crossSell + ' close');

      // --- notes
      var neg = {}, pos = {}, lastVisit = null;
      c.notes.forEach(function (n) {
        var age = A - dayNum(n.ts.slice(0, 10));
        if (lastVisit === null || age < lastVisit) lastVisit = age;
        (n.keywords || []).forEach(function (id) {
          var k = KW[id]; if (!k) return;
          if (k.churn && age <= RULES.noteNegDays && !(id in neg)) neg[id] = n;
          if (k.close && age <= RULES.notePosDays && !(id in pos)) pos[id] = n;
        });
      });
      c.deals.forEach(function (d) { var age = A - dayNum(d.date); if (lastVisit === null || age < lastVisit) lastVisit = age; });
      (state.visits || []).forEach(function (v) { if (v.cid !== c.cid || v.status !== 'done') return; var age = A - dayNum(v.date); if (age >= 0 && (lastVisit === null || age < lastVisit)) lastVisit = age; });
      c.lastVisit = lastVisit; c.noteNeg = Object.keys(neg); c.notePos = Object.keys(pos);
      function noteFactor(bucket, map, field, cap, days) {
        var ids = Object.keys(map); if (!ids.length) return;
        var raw = sum(ids, function (id) { return KW[id][field]; });
        var pts = raw > cap ? cap : raw < -cap ? -cap : raw;
        if (!pts) return;
        var labels = ids.map(function (id) { return '“' + KW[id].label + '”'; }).join(', ');
        var up = bucket === 'churn' ? (pts > 0 ? 'This raises the risk of losing them.' : 'This lowers the risk of losing them.') : (pts > 0 ? 'This makes a deal more likely.' : 'This makes a deal less likely.');
        add(bucket, pts, 'Your visit notes say: ' + labels + '. ' + up,
          'note keywords in last ' + days + 'd: ' + ids.map(function (id) { return id + ' (' + (KW[id][field] > 0 ? '+' : '') + KW[id][field] + ')'; }).join(', ') + ' = ' + raw + ', capped at ±' + cap + ' → ' + (pts > 0 ? '+' : '') + pts + ' ' + bucket, 'Visit notes');
      }
      noteFactor('churn', neg, 'churn', RULES.noteNegCap, RULES.noteNegDays);
      noteFactor('close', pos, 'close', RULES.notePosCap, RULES.notePosDays);

      // --- documents
      function has(tag) { return c.docs.filter(function (s) { return s.tags.indexOf(tag) >= 0; }); }
      var dRisk = has('risk'), dRen = has('renewal'), dCamp = has('campaign').concat(c.segDocs), dGrow = has('growth'), dPri = has('priority');
      if (dRisk.length) add('churn', RULES.docRisk, 'Your documents flag a risk on this account (' + dRisk[0].doc + ').',
        'document paragraph linked to customer with risk wording: “' + shorten(dRisk[0].text, 90) + '” → +' + RULES.docRisk + ' churn', 'Documents');
      var docPts = 0, docBits = [], docTech = [];
      if (dRen.length) { docPts += RULES.docRenewal; docBits.push('a renewal is coming up'); docTech.push('renewal +' + RULES.docRenewal); }
      if (dCamp.length || c.offer) { docPts += RULES.docCampaign; docBits.push(c.offer ? 'the ' + c.offer.name + ' applies to them and they have not used it' : 'a campaign or offer applies to them'); docTech.push('campaign +' + RULES.docCampaign); }
      if (dGrow.length) { docPts += RULES.docGrowth; docBits.push('the account plan sees room to grow'); docTech.push('growth +' + RULES.docGrowth); }
      if (docPts) {
        var capped = Math.min(docPts, RULES.docCap);
        add('close', capped, 'Your documents say ' + docBits.join(' and ') + ' (' + (dRen[0] || dCamp[0] || dGrow[0] || { doc: c.offer.src }).doc + ').',
          'document signals: ' + docTech.join(', ') + ' = ' + docPts + ', capped at ' + RULES.docCap + ' → +' + capped + ' close', 'Documents');
      }

      function total(bucket) { return Math.max(0, Math.min(100, sum(F.filter(function (f) { return f.bucket === bucket; }), function (f) { return f.pts; }))); }
      c.churn = c.lost ? 0 : total('churn');
      c.close = c.lost ? 0 : total('close');
      c.valuePct = revs.length ? Math.round(100 * revs.filter(function (x) { return x <= c.rev12; }).length / revs.length) : 0;
      var main = Math.max(c.churn, c.close), other = Math.min(c.churn, c.close);
      var base = RULES.wMain * main + RULES.wOther * other + RULES.wValue * c.valuePct;
      add('priority', Math.round(base), c.valuePct >= 67 ? 'They are one of your biggest customers (' + money(c.rev12, cur) + ' in the last 12 months).' : c.valuePct >= 34 ? 'They are a mid-sized customer for you (' + money(c.rev12, cur) + ' in the last 12 months).' : 'They are one of your smaller customers (' + money(c.rev12, cur) + ' in the last 12 months).',
        RULES.wMain + ' × max(churn ' + c.churn + ', close ' + c.close + ') + ' + RULES.wOther + ' × min(…) ' + other + ' + ' + RULES.wValue + ' × value percentile ' + c.valuePct + ' (12-month revenue ' + money(c.rev12, cur) + ' ranked among your ' + revs.length + ' customers) = ' + base.toFixed(1));
      if (dPri.length) add('priority', RULES.docPriority, 'Your account plan marks them as a priority account (' + dPri[0].doc + ').',
        'document paragraph with priority wording: “' + shorten(dPri[0].text, 90) + '” → +' + RULES.docPriority + ' priority', 'Documents');
      if (lastVisit !== null && lastVisit <= RULES.visitedDays) add('priority', -RULES.visitedPenalty, 'You were in touch ' + (lastVisit <= 0 ? 'today' : lastVisit === 1 ? 'yesterday' : lastVisit + ' days ago') + ', so they can wait.',
        'last logged visit, note or deal ' + lastVisit + 'd ago ≤ ' + RULES.visitedDays + 'd → −' + RULES.visitedPenalty + ' priority', 'Visit notes');
      if (c.lost) add('priority', -30, 'They have not ordered for ' + c.recency + ' days, so they are treated as inactive.',
        'recency ' + c.recency + 'd > max(' + RULES.lostDays + 'd, ' + RULES.lostRatio + ' × gap ' + Math.round(gap) + 'd) → inactive: churn and close set to 0, −30 priority');
      c.priority = Math.max(0, Math.min(100, sum(F.filter(function (f) { return f.bucket === 'priority'; }), function (f) { return f.pts; })));
      c.factors = F;
      c.tag = c.lost ? 'Inactive' : (c.churn >= RULES.listThreshold && c.churn >= c.close) ? 'May churn' : c.close >= RULES.listThreshold ? 'Likely to close' : c.churn >= 30 && c.churn >= c.close ? 'Watch' : c.close >= 30 ? 'Good chance' : 'Steady';
      var topCat = Object.keys(c.cats).sort(function (a, b) { return c.cats[b].amt12 - c.cats[a].amt12 || c.cats[b].amt - c.cats[a].amt; })[0];
      c.topCat = topCat;
    });

    mine.sort(function (a, b) { return b.priority - a.priority || b.rev12 - a.rev12 || (a.name < b.name ? -1 : 1); });
    return { asOf: asOf, stale: when.stale, dataTo: when.dataTo, customers: mine, categories: categories, currency: cur, snippets: snippets };
  }

  // The reasons shown to the salesperson: strongest first, at most n.
  function topReasons(c, n) {
    var main = c.churn >= c.close ? 'churn' : 'close';
    var f = c.factors.filter(function (x) { return x.pts > 0 && x.bucket !== 'priority'; })
      .sort(function (a, b) { return (b.bucket === main) - (a.bucket === main) || b.pts - a.pts; });
    var pr = c.factors.filter(function (x) { return x.bucket === 'priority' && x.pts > 0; });
    return f.concat(pr).slice(0, n || 3);
  }
  function lists(an) {
    var T = RULES.listThreshold, cs = an.customers.filter(function (c) { return !c.lost; });
    return {
      top3: cs.slice(0, 3),
      close: cs.filter(function (c) { return c.close >= T; }).sort(function (a, b) { return b.close - a.close || b.rev12 - a.rev12; }).slice(0, 5),
      churn: cs.filter(function (c) { return c.churn >= T; }).sort(function (a, b) { return b.churn - a.churn || b.rev12 - a.rev12; }).slice(0, 5)
    };
  }

  // ---------------------------------------------------------------- pitch
  // Assembled from fixed sentence templates filled with numbers, note keywords and document excerpts.
  function buildPitch(c, an) {
    var cur = an.currency, P = { open: '', points: [], ask: '', sources: [] };
    var lastNote = c.notes[0], kws = c.noteNeg.concat(c.notePos);
    function has(id) { return kws.indexOf(id) >= 0; }
    function pt(text, src) { if (P.points.length < 4) P.points.push({ text: text, src: src }); }
    var every = Math.round(c.gapUsed), top = c.topCat;

    if (c.lost) P.open = 'It has been a while. Go in to listen: ask how business is and what they use today instead of you.';
    else if (c.tag === 'May churn' || c.tag === 'Watch') P.open = 'Go in to listen first. Ask how things are going with their orders before you talk about products.';
    else if (c.tag === 'Likely to close' || c.tag === 'Good chance') P.open = 'Go in ready to take an order today.';
    else P.open = 'A friendly check-in. Thank them for the steady business and look for one new idea to offer.';

    // 1. what they told you
    if (has('delivery')) pt('Start with the delivery problem they raised. Say what has been fixed before you offer anything.', 'Visit notes');
    if (has('quality')) pt('They complained about quality. Acknowledge it, offer a replacement or credit, then move on.', 'Visit notes');
    if (has('unhappy') && !has('delivery') && !has('quality')) pt('They were unhappy last time. Ask what one thing would make the biggest difference for them.', 'Visit notes');
    if (has('competitor')) pt('A competitor is talking to them. Remind them what they get from you: ' + c.nOrders + ' orders delivered since ' + niceDate(c.first).slice(-8) + ' and someone who knows their business.', 'Visit notes');
    if (has('price')) pt('Price was a concern. Talk value, not discount: suggest a larger ' + top + ' order' + (c.avgOrder ? ' (their usual order is about ' + money(c.avgOrder, cur) + ')' : '') + ' in exchange for a better rate.', 'Visit notes');
    if (has('quote')) pt('They asked for a quote. Bring it with you and ask for a decision today.', 'Visit notes');
    if (has('budget_ok')) pt('Their budget is approved. Confirm quantities and a delivery date before you leave.', 'Visit notes');
    if (has('sample')) pt('They wanted a sample or trial. Bring it, or ask how the trial went and what they need to say yes.', 'Visit notes');
    if (has('bulk')) pt('They mentioned a bigger order. Offer a standing order so they never run short.', 'Visit notes');
    if (has('expanding')) pt('They are expanding. Ask what the new site needs and offer to supply it from day one.', 'Visit notes');
    if (has('interested') && lastNote && lastNote.cats && lastNote.cats.length) pt('They showed interest in ' + lastNote.cats.join(' and ') + '. Pick up where you left off.', 'Visit notes');
    if (has('budget_cut')) pt('Their budget was cut. Offer smaller, more frequent orders to protect their cash flow.', 'Visit notes');
    if (has('not_interested')) pt('They said no last time. Do not repeat the same offer; ask what has changed since.', 'Visit notes');

    if (c.offer) { var op = { text: campaignLine(c.offer, cur), src: c.offer.src, tech: c.offer.tech }; if (P.points.length >= 4) P.points[3] = op; else P.points.push(op); }

    // 2. what the numbers say
    if (!c.lost && c.ratio >= 1.5) pt('They normally order every ' + every + ' days and it has been ' + c.recency + '. Ask openly: “I noticed we have not had an order for a while. Did something change?”', 'Sales data');
    else if (!c.lost && c.ratio >= 0.6 && c.nOrders >= 2) pt('They normally reorder ' + top + ' about every ' + every + ' days and the last order was ' + c.recency + ' days ago. Ask for the reorder' + (c.avgOrder ? ' (usual size about ' + money(c.avgOrder, cur) + ').' : '.'), 'Sales data');
    if (c.lapsed.length) pt('They used to buy ' + c.lapsed[0] + ' (last time ' + niceDate(c.cats[c.lapsed[0]].last) + ') and then stopped. Ask why and whether they still need it.', 'Sales data');
    if (c.peerGap.length && !c.lost) pt('Customers like them usually buy ' + c.peerGap[0] + ' too. Introduce it as something similar ' + c.seg + ' customers find useful.', 'Sales data');
    if (c.revPrev90 > 0 && c.trend >= 0.1) pt('Their spending is up ' + Math.round(c.trend * 100) + '% in 3 months. Thank them and suggest a regular standing order.', 'Sales data');
    else if (c.revPrev90 > 0 && c.trend <= -0.25 && c.ratio < 1.5) pt('Their spending is down ' + Math.round(-c.trend * 100) + '% in 3 months. Ask if they are buying part of their needs elsewhere.', 'Sales data');

    // 3. what your documents say
    var seen = {};
    c.docs.concat(c.segDocs).filter(function (s) { return s.tags.length && !(c.offer && s.tags.indexOf('campaign') >= 0); })
      .sort(function (a, b) { return (b.tags.indexOf('campaign') >= 0) - (a.tags.indexOf('campaign') >= 0); })
      .slice(0, 6).forEach(function (s) {
        if (seen[s.text] || Object.keys(seen).length >= 2) return; seen[s.text] = 1;
        var lead = s.tags.indexOf('campaign') >= 0 ? 'Use the current offer' : s.tags.indexOf('renewal') >= 0 ? 'Bring up the renewal' : s.tags.indexOf('risk') >= 0 ? 'Be aware' : 'From the account plan';
        var item = { text: lead + ': “' + shorten(s.text, 180) + '”', src: s.doc, tech: 'paragraph linked to this customer by ' + (s.cids.length ? 'name' : 'segment or category') + '; wording tagged ' + s.tags.join(', ') };
        if (P.points.length < 4) P.points.push(item); else if (!c.offer) P.points[3] = item;
      });
    if (!P.points.length) pt('Ask what is coming up in their business over the next month and where you can help.', 'Sales data');

    P.points.forEach(function (x) {
      if (P.sources.indexOf(x.src) < 0) P.sources.push(x.src);
      if (!x.tech) x.tech = x.src === 'Visit notes' ? 'sentence chosen because your notes contain: ' + (kws.map(function (id) { return KW[id].label; }).join(', ') || 'no keywords') + ' (concerns kept ' + RULES.noteNegDays + ' days, buying signals ' + RULES.notePosDays + ' days)'
        : 'sentence chosen from: days since last order ' + c.recency + ', usual gap ' + every + ' days (ratio ' + c.ratio.toFixed(2) + '), 90-day spend change ' + pct(c.trend) + ', usual order ' + money(c.avgOrder, cur) + (c.peerGap.length ? ', category gap ' + c.peerGap[0] : '') + (c.lapsed.length ? ', lapsed ' + c.lapsed[0] : '');
    });
    P.openTech = 'opening and closing ask chosen by status “' + c.tag + '” (close ' + c.close + ', churn ' + c.churn + ')';
    if (has('quote') || has('budget_ok')) P.ask = 'Ask for the order today.';
    else if (c.tag === 'May churn' || c.tag === 'Watch' || c.lost) P.ask = 'Ask for one small order this week to get things moving again.';
    else if (c.tag === 'Likely to close' || c.tag === 'Good chance') P.ask = 'Ask for the ' + top + ' reorder' + (c.peerGap.length ? ' and a first trial of ' + c.peerGap[0] : '') + '.';
    else P.ask = 'Agree the date of their next order before you leave.';
    return P;
  }

  // ---------------------------------------------------------------- customer .md file
  function customerMarkdown(c, an) {
    var cur = an.currency, L = [], p = buildPitch(c, an);
    function tbl(bucket, title, score) {
      var f = c.factors.filter(function (x) { return x.bucket === bucket; });
      L.push('### ' + title + ': ' + score + ' / 100', '');
      if (!f.length) { L.push('No factors applied.', ''); return; }
      L.push('| Points | In plain English | Technical trace | Source |', '|---:|---|---|---|');
      f.forEach(function (x) { L.push('| ' + (x.pts > 0 ? '+' : '') + x.pts + ' | ' + x.plain.replace(/\|/g, '/') + ' | ' + x.tech.replace(/\|/g, '/') + ' | ' + x.src + ' |'); });
      L.push('');
    }
    L.push('# ' + c.name, '',
      '- Customer ID: ' + c.cid, '- Salesperson: ' + c.sp, '- Segment: ' + c.seg,
      '- Status on ' + niceDate(an.asOf) + ': **' + c.tag + '**',
      '- File generated on this device by fixed rules. No AI language model was used.', '',
      '## Performance', '',
      '| Measure | Value |', '|---|---|',
      '| Customer since | ' + niceDate(c.first) + ' |',
      '| Number of orders | ' + c.nOrders + ' |',
      '| Last order | ' + niceDate(c.last) + ' (' + c.recency + ' days ago) |',
      '| Usual time between orders | ' + Math.round(c.gapUsed) + ' days |',
      '| Usual order size | ' + money(c.avgOrder, cur) + ' |',
      '| Revenue, last 12 months | ' + money(c.rev12, cur) + ' |',
      '| Revenue, 12 months before | ' + money(c.revPY, cur) + (c.yoy == null ? '' : ' (' + pct(c.yoy) + ')') + ' |',
      '| Revenue, last 90 days | ' + money(c.rev90, cur) + ' |',
      '| Revenue, previous 90 days | ' + money(c.revPrev90, cur) + ' |', '',
      '### What they buy', '', '| Category | Last 12 months | Last bought |', '|---|---:|---|');
    Object.keys(c.cats).sort(function (a, b) { return c.cats[b].amt12 - c.cats[a].amt12; }).forEach(function (k) {
      L.push('| ' + k + ' | ' + money(c.cats[k].amt12, cur) + ' | ' + niceDate(c.cats[k].last) + ' |');
    });
    L.push('', '## Today\'s assessment', '');
    topReasons(c, 3).forEach(function (f) { L.push('- ' + f.plain); });
    L.push('');
    tbl('priority', 'Visit priority', c.priority);
    tbl('close', 'Chance to close a deal', c.close);
    tbl('churn', 'Risk of losing them', c.churn);
    L.push('## Suggested pitch', '', p.open, '');
    p.points.forEach(function (x) { L.push('- ' + x.text + ' _(' + x.src + ')_'); });
    L.push('', '**Ask:** ' + p.ask, '');
    L.push('## Campaigns that apply', '');
    if (!c.campaigns.length) L.push('No current campaign applies to this customer.', '');
    else {
      L.push('| Campaign | Status | Saving | Technical trace | Source |', '|---|---|---:|---|---|');
      c.campaigns.forEach(function (k) { L.push('| ' + k.name + ' | ' + (k.used ? 'Already used in the last 30 days' : 'Not used yet') + (k.end ? ', valid until ' + niceDate(k.end) : '') + ' | ' + money(k.saving, cur) + ' on ' + money(k.basis, cur) + ' | ' + k.tech + ' | ' + k.src + ' |'); });
      L.push('');
    }
    L.push('## Visit notes', '');
    if (!c.notes.length) L.push('No notes yet.', '');
    c.notes.forEach(function (n) {
      L.push('### ' + niceDate(n.ts.slice(0, 10)), '',
        '- Keywords: ' + ((n.keywords || []).map(function (id) { return KW[id] ? KW[id].label : id; }).join(', ') || 'none'));
      if (n.cats && n.cats.length) L.push('- Talked about: ' + n.cats.join(', '));
      if (n.transcript) L.push('- ' + (n.typed ? 'Typed' : 'Spoken') + ' note: “' + n.transcript + '”');
      L.push('');
    });
    L.push('## Deals logged in the app', '');
    if (!c.deals.length) L.push('None yet.', '');
    else {
      L.push('| Date | Amount | Category | Status |', '|---|---:|---|---|');
      c.deals.forEach(function (d) { L.push('| ' + niceDate(d.date) + ' | ' + money(d.amt, cur) + ' | ' + (d.cat || '') + ' | ' + (d.confirmed ? 'Confirmed by uploaded transactions' : 'Logged in app') + ' |'); });
      L.push('');
    }
    L.push('## From your documents', '');
    var ds = c.docs.concat(c.segDocs);
    if (!ds.length) L.push('Nothing in the uploaded documents mentions this customer.', '');
    ds.forEach(function (s) { L.push('- **' + s.doc + '**' + (s.section ? ' › ' + s.section : '') + ': ' + s.text + (s.tags.length ? ' _[' + s.tags.join(', ') + ']_' : '')); });
    L.push('');
    return L.join('\n');
  }
  function fileName(c) { return (c.name.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') || c.cid) + '.md'; }

  // ---------------------------------------------------------------- management dashboard
  function lastYear(s) { var y = +s.slice(0, 4) - 1, m = +s.slice(5, 7), d = +s.slice(8, 10); return validYMD(y, m, d) || iso(y, m, 28); }
  function dashboard(state, opts) {
    opts = opts || {};
    var when = asOfDate(state, opts.today), asOf = when.asOf, Y = asOf.slice(0, 4), PY = String(+Y - 1), asOfPY = lastYear(asOf);
    var tx = allTx(state).filter(function (t) { return t.d <= asOf && (!opts.sp || t.sp === opts.sp); });
    var mon = +asOf.slice(5, 7), months = [], i;
    for (i = 0; i < 12; i++) months.push({ label: MONTHS[i], cur: 0, prev: 0, prevToDate: 0, future: i + 1 > mon, partial: i + 1 === mon });
    var ytd = { cur: 0, prev: 0 }, sp = {}, cust = {};
    tx.forEach(function (t) {
      var y = t.d.slice(0, 4), m = +t.d.slice(5, 7) - 1;
      var s = sp[t.sp] = sp[t.sp] || { name: t.sp, cur: 0, prev: 0 };
      var c = cust[t.cid] = cust[t.cid] || { cid: t.cid, name: t.cname, sp: t.sp, cur: 0, prev: 0 };
      if (y === Y) { months[m].cur += t.amt; ytd.cur += t.amt; s.cur += t.amt; c.cur += t.amt; c.name = t.cname; }
      else if (y === PY) {
        months[m].prev += t.amt;
        if (t.d <= asOfPY) { months[m].prevToDate += t.amt; ytd.prev += t.amt; s.prev += t.amt; c.prev += t.amt; }
      }
    });
    var m = months[mon - 1];
    var people = Object.keys(sp).map(function (k) { sp[k].inc = sp[k].cur - sp[k].prev; return sp[k]; }).sort(function (a, b) { return b.inc - a.inc; });
    var deals = (state.deals || []).filter(function (x) { return !opts.sp || x.sp === opts.sp; }).sort(function (a, b) { return a.ts < b.ts ? 1 : -1; }).map(function (d) {
      var c = cust[d.cid] || { cur: 0, prev: 0 };
      return { id: d.id, date: d.date, cname: d.cname, sp: d.sp, amt: d.amt, cat: d.cat, confirmed: !!d.confirmed, custCur: c.cur, custPrev: c.prev, custInc: c.cur - c.prev };
    });
    return {
      asOf: asOf, stale: when.stale, dataTo: when.dataTo, year: Y, prevYear: PY, hasPrev: ytd.prev > 0,
      ytd: { cur: ytd.cur, prev: ytd.prev, inc: ytd.cur - ytd.prev, pct: ytd.prev ? (ytd.cur - ytd.prev) / ytd.prev : null },
      month: { label: MONTHS[mon - 1], cur: m.cur, prev: m.prevToDate, inc: m.cur - m.prevToDate, pct: m.prevToDate ? (m.cur - m.prevToDate) / m.prevToDate : null },
      months: months, people: people, deals: deals,
      customers: Object.keys(cust).map(function (k) { cust[k].inc = cust[k].cur - cust[k].prev; return cust[k]; })
    };
  }
  // ---------------------------------------------------------------- monthly target and closing the gap
  function targetStatus(state, sp, opts) {
    opts = opts || {};
    var asOf = opts.asOf || asOfDate(state, opts.today).asOf, month = asOf.slice(0, 7), y = +asOf.slice(0, 4), m = +asOf.slice(5, 7), day = +asOf.slice(8, 10);
    var dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
    var target = sum((state.targets || []).filter(function (t) { return t.month === month && (!sp || t.sp === sp); }), function (t) { return t.target; });
    var mtd = sum(allTx(state).filter(function (t) { return t.d.slice(0, 7) === month && t.d <= asOf && (!sp || t.sp === sp); }), function (t) { return t.amt; });
    var out = { hasTarget: target > 0, month: MONTHS[m - 1], target: target, mtd: mtd, gap: Math.max(0, target - mtd), daysLeft: dim - day, pace: target * day / dim };
    if (out.hasTarget) { out.ahead = mtd >= out.pace; out.tech = 'month to date ' + money(mtd) + ' vs pace ' + money(out.pace) + ' (target ' + money(target) + ' × day ' + day + ' ÷ ' + dim + ')'; }
    else { var d = dashboard(state, { today: opts.today, sp: sp }); out.ahead = d.hasPrev ? d.ytd.inc >= 0 : null; out.tech = 'no target set; compared with the same period last year'; }
    out.mood = out.ahead == null ? 'calm' : out.ahead ? 'ahead' : 'behind';
    return out;
  }
  // Who to approach: highest (close score × usual order size) first, until their usual orders cover the gap.
  function closeGap(an, gap) {
    var picks = [], covered = 0;
    an.customers.filter(function (c) { return !c.lost && c.avgOrder > 0; })
      .sort(function (a, b) { return b.close * b.avgOrder - a.close * a.avgOrder || b.avgOrder - a.avgOrder; })
      .some(function (c) {
        picks.push({ cid: c.cid, name: c.name, amount: Math.round(c.avgOrder), close: c.close, offer: c.offer, reason: (c.factors.filter(function (f) { return f.bucket === 'close' && f.pts > 0; }).sort(function (a, b) { return b.pts - a.pts; })[0] || {}).plain || '' });
        covered += c.avgOrder; return covered >= gap || picks.length >= 5;
      });
    return { picks: picks, covered: Math.round(covered), gap: gap, tech: 'ranked by close score × average order value; added until the sum of average order values ≥ gap (max 5)' };
  }

  // ---------------------------------------------------------------- campaigns about to end
  function expiring(an) {
    var A = dayNum(an.asOf), by = {};
    an.customers.forEach(function (c) {
      if (c.lost) return;
      c.campaigns.forEach(function (k) {
        if (k.used || !k.end) return; var left = dayNum(k.end) - A; if (left < 0 || left > RULES.expiryDays) return;
        var e = by[k.name] = by[k.name] || { name: k.name, end: k.end, daysLeft: left, customers: [], totalSaving: 0, src: k.src };
        e.customers.push({ cid: c.cid, name: c.name, saving: k.saving, basis: k.basis }); e.totalSaving += k.saving;
      });
    });
    return Object.keys(by).map(function (n) {
      var e = by[n]; e.customers.sort(function (a, b) { return b.saving - a.saving; });
      e.tech = 'campaign end date ' + e.end + ' is within ' + RULES.expiryDays + ' days of ' + an.asOf + '; listed customers match the campaign and have no purchase of its categories in the last 30 days; saving = discount × typical order (' + e.src + ')';
      return e;
    }).sort(function (a, b) { return a.daysLeft - b.daysLeft; });
  }

  // ---------------------------------------------------------------- account review one-pager (content only; export.js lays it out)
  // version 'internal' = for the salesperson and manager; 'customer' = safe to hand over (no scores, risk labels or notes)
  function accountReview(c, an, version) {
    var cur = an.currency, p = buildPitch(c, an), R = { version: version, name: c.name, date: niceDate(an.asOf), salesperson: c.sp, segment: c.seg, kpis: [], sections: [], audit: [] };
    var cats = Object.keys(c.cats).filter(function (k) { return c.cats[k].amt12 > 0; }).sort(function (a, b) { return c.cats[b].amt12 - c.cats[a].amt12; });
    R.table = { head: ['Category', 'Last 12 months', 'Last bought'], rows: cats.map(function (k) { return [k, money(c.cats[k].amt12, cur), niceDate(c.cats[k].last)]; }) };
    var offers = c.campaigns.filter(function (k) { return !k.used; });
    if (version === 'customer') {
      R.title = 'Account review: ' + c.name; R.subtitle = 'Prepared for you by ' + c.sp + ', ' + R.date;
      R.kpis = [['Customer since', niceDate(c.first).slice(-8)], ['Orders placed', String(c.nOrders)], ['Purchases, last 12 months', money(c.rev12, cur)], ['Typical order', money(c.avgOrder, cur)]];
      R.tableTitle = 'Your purchases by category';
      if (offers.length) R.sections.push({ heading: 'Offers available to you', bullets: offers.map(function (k) { return k.name + ': on a ' + money(k.basis, cur) + ' order of ' + (k.cats.join(' and ') || 'goods') + ' you save about ' + money(k.saving, cur) + ' (' + Math.round(k.pct * 100) + '%)' + (k.minSpend ? ', minimum order ' + money(k.minSpend, cur) : '') + (k.end ? '. Valid until ' + niceDate(k.end) : '') + '.'; }) });
      var ideas = [];
      if (c.peerGap.length) ideas.push('Businesses like yours in ' + c.seg + ' also use ' + c.peerGap[0] + '. We would be glad to show you how it could work for you.');
      if (c.lapsed.length) ideas.push('You used to order ' + c.lapsed[0] + '. If the need is still there, we can add it back to your regular order.');
      if (c.revPrev90 > 0 && c.trend >= 0.1) ideas.push('Your orders have grown ' + Math.round(c.trend * 100) + '% in three months. A standing order would make sure you never run short.');
      if (ideas.length) R.sections.push({ heading: 'Ideas for your business', bullets: ideas });
      var o0 = offers[0], sameCat = o0 && (!o0.cats.length || o0.cats.indexOf(c.topCat) >= 0);
      var next = 'A ' + c.topCat + ' order of about ' + money(c.avgOrder, cur) + ', in line with your usual order every ' + Math.round(c.gapUsed) + ' days' +
        (o0 ? (sameCat ? ', using the ' + o0.name + ' to save about ' + money(o0.saving, cur) : ', plus ' + money(o0.basis, cur) + ' of ' + o0.cats.join(' and ') + ' under the ' + o0.name + ' to save about ' + money(o0.saving, cur)) : '') + '.';
      R.sections.push({ heading: 'Proposed next order', bullets: [next] });
      R.footer = 'Figures are taken from your order history with us up to ' + niceDate(an.dataTo || an.asOf) + '. Savings are estimates based on your typical order.';
    } else {
      R.title = 'Account review: ' + c.name; R.subtitle = 'Internal. ' + c.sp + ', ' + c.seg + ', ' + R.date + '. Status: ' + c.tag;
      R.kpis = [['Revenue, last 12 months', money(c.rev12, cur) + (c.yoy == null ? '' : ' (' + pct(c.yoy) + ')')], ['Last order', c.recency + ' days ago'], ['Usual order', money(c.avgOrder, cur) + ' every ' + Math.round(c.gapUsed) + ' days'], ['Scores', 'Close ' + c.close + ', risk ' + c.churn + ', priority ' + c.priority]];
      R.tableTitle = 'What they buy';
      R.sections.push({ heading: 'Where they stand', bullets: topReasons(c, 4).map(function (f) { return f.plain; }) });
      R.sections.push({ heading: 'What to say', bullets: [p.open].concat(p.points.map(function (x) { return x.text; })).concat(['Ask: ' + p.ask]) });
      if (c.campaigns.length) R.sections.push({ heading: 'Campaigns that apply', bullets: c.campaigns.map(function (k) { return k.name + ': ' + (k.used ? 'already used in the last 30 days' : 'not used yet, saves about ' + money(k.saving, cur) + ' on ' + money(k.basis, cur)) + (k.end ? ', valid until ' + niceDate(k.end) : '') + '.'; }) });
      if (c.notes.length) R.sections.push({ heading: 'Recent visit notes', bullets: c.notes.slice(0, 3).map(function (n) { return niceDate(n.ts.slice(0, 10)) + ': ' + ((n.keywords || []).map(function (id) { return KW[id] ? KW[id].label : id; }).concat(n.cats || []).join(', ') || 'note') + (n.transcript ? ' (“' + shorten(n.transcript, 110) + '”)' : ''); }) });
      R.audit = c.factors.map(function (f) { return [f.bucket, (f.pts > 0 ? '+' : '') + f.pts, f.tech, f.src]; });
      R.footer = 'Produced by Nudge from fixed rules on ' + R.date + '. No AI model was used. Not for sharing with the customer.';
    }
    return R;
  }

  // ---------------------------------------------------------------- executive summary (morning brief)
  // Fixed sentence templates filled with numbers. Returns the facts so the screen can lay them out.
  function joinNames(a) { return a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function execSummary(state, me, an, opts) {
    opts = opts || {};
    var cur = an.currency, L = lists(an), d = dashboard(state, { today: opts.today, sp: me }), out = { headline: '', points: [] };
    if (opts.plan && opts.plan.length) L.top3 = opts.plan;
    out.headline = d.hasPrev
      ? 'You are at ' + money(d.ytd.cur, cur) + ' this year, ' + money(Math.abs(d.ytd.inc), cur) + (d.ytd.inc >= 0 ? ' ahead of' : ' behind') + ' the same time last year (' + pct(d.ytd.pct) + ').'
      : 'You are at ' + money(d.ytd.cur, cur) + ' this year.';
    var ts = targetStatus(state, me, { today: opts.today, asOf: an.asOf }); out.target = ts;
    if (ts.hasTarget) {
      if (ts.gap <= 0) out.points.push({ kind: 'target', label: ts.month + ' target', text: 'You have reached your ' + money(ts.target, cur) + ' target with ' + money(ts.mtd, cur) + ' closed. Everything from here is extra.', tech: ts.tech });
      else {
        out.points.push({ kind: 'target', label: ts.month + ' target', text: 'You have closed ' + money(ts.mtd, cur) + ' of your ' + money(ts.target, cur) + ' target. You need ' + money(ts.gap, cur) + ' more in the ' + ts.daysLeft + (ts.daysLeft === 1 ? ' day' : ' days') + ' left, and you are ' + (ts.ahead ? 'on pace.' : 'behind pace.'), tech: ts.tech });
        var g = closeGap(an, ts.gap); out.gap = g;
        if (g.picks.length) out.points.push({ kind: 'gap', label: 'To close the gap', text: 'Approach ' + joinNames(g.picks.map(function (p) { return p.name + ' (about ' + money(p.amount, cur) + ')'; })) + '. Their usual orders add up to ' + money(g.covered, cur) + ', ' + (g.covered >= ts.gap ? 'enough to cover the gap.' : 'which covers ' + Math.round(100 * g.covered / ts.gap) + '% of the gap.'), tech: g.tech });
      }
    }
    if (L.churn.length) {
      var atRisk = sum(L.churn, function (c) { return c.rev12; });
      out.points.push({ kind: 'risk', label: 'At risk', text: L.churn.length + (L.churn.length === 1 ? ' customer' : ' customers') + ' worth ' + money(atRisk, cur) + ' a year ' + (L.churn.length === 1 ? 'is' : 'are') + ' showing signs of leaving: ' + joinNames(L.churn.slice(0, 3).map(function (c) { return c.name; })) + (L.churn.length > 3 ? ' and others' : '') + '.',
        tech: 'sum of 12-month revenue of customers with churn score ≥ ' + RULES.listThreshold });
    } else out.points.push({ kind: 'risk', label: 'At risk', text: 'None of your customers shows a strong sign of leaving today.', tech: 'no churn score ≥ ' + RULES.listThreshold });
    if (L.top3.length) {
      var v = sum(L.top3, function (c) { return c.avgOrder; });
      out.points.push({ kind: 'value', label: 'Today\'s potential', text: 'Your ' + L.top3.length + ' visits could bring in about ' + money(v, cur) + ', going by what these customers usually order.', tech: 'sum of average order value of the top ' + L.top3.length + ' by visit priority' });
    }
    out.headlineTech = 'revenue ' + d.year + ' to ' + niceDate(d.asOf) + ' = ' + money(d.ytd.cur, cur) + '; same dates in ' + d.prevYear + ' = ' + money(d.ytd.prev, cur) + '; difference ' + money(d.ytd.inc, cur);
    var ex = expiring(an); out.expiring = ex;
    ex.forEach(function (k) { out.points.push({ kind: 'expiry', label: 'Ending soon', text: 'The ' + k.name + ' ends ' + (k.daysLeft === 0 ? 'today' : 'in ' + k.daysLeft + (k.daysLeft === 1 ? ' day' : ' days')) + '. ' + k.customers.length + (k.customers.length === 1 ? ' customer has' : ' customers have') + ' not used it: ' + joinNames(k.customers.slice(0, 4).map(function (x) { return x.name; })) + (k.customers.length > 4 ? ' and others' : '') + '. Together they could save about ' + money(k.totalSaving, cur) + '.', tech: k.tech }); });
    if (L.close.length) out.points.push({ kind: 'close', label: 'Ready to buy', text: L.close.length + (L.close.length === 1 ? ' customer is' : ' customers are') + ' likely to place an order now, led by ' + L.close[0].name + '.', tech: 'customers with close score ≥ ' + RULES.listThreshold });
    var offers = [];
    L.top3.forEach(function (c) {
      if (c.offer) { offers.push({ name: c.name, renewal: false, text: campaignLine(c.offer, cur), doc: c.offer.src, tech: c.offer.tech }); return; }
      var s = c.docs.concat(c.segDocs).filter(function (x) { return x.tags.indexOf('renewal') >= 0 || x.tags.indexOf('campaign') >= 0; })[0];
      if (s) offers.push({ name: c.name, renewal: s.tags.indexOf('renewal') >= 0, text: shorten(s.text, 120), doc: s.doc, tech: 'paragraph in ' + s.doc + ' linked to this customer; wording tagged ' + s.tags.join(', ') });
    });
    out.offers = offers;
    return out;
  }

  // ---------------------------------------------------------------- visit plan, wrap-up, manager brief
  // state.plans: { 'salesperson|date': [customer ids] }   state.visits: [{cid, sp, date, status:'done'|'skipped', reason}]
  function visitStats(state, asOf, sp) {
    var by = {}, A = dayNum(asOf);
    function slot(name) { return by[name] = by[name] || { name: name, today: { planned: 0, done: 0, skipped: 0 }, week: { planned: 0, done: 0, skipped: 0 }, skips: [] }; }
    Object.keys(state.plans || {}).forEach(function (k) {
      var i = k.lastIndexOf('|'), name = k.slice(0, i), date = k.slice(i + 1), age = A - dayNum(date);
      if ((sp && name !== sp) || age < 0 || age >= 7) return;
      var p = slot(name);
      state.plans[k].forEach(function (cid) {
        var v = (state.visits || []).filter(function (x) { return x.cid === cid && x.sp === name && x.date === date; })[0];
        [p.week].concat(age === 0 ? [p.today] : []).forEach(function (b) { b.planned++; if (v) b[v.status === 'done' ? 'done' : 'skipped']++; });
        if (v && v.status === 'skipped' && age === 0) p.skips.push(v.reason);
      });
    });
    var people = Object.keys(by).sort().map(function (k) { return by[k]; }), tot = { today: { planned: 0, done: 0, skipped: 0 }, week: { planned: 0, done: 0, skipped: 0 } };
    people.forEach(function (p) { ['today', 'week'].forEach(function (w) { ['planned', 'done', 'skipped'].forEach(function (f) { tot[w][f] += p[w][f]; }); }); });
    return { people: people, today: tot.today, week: tot.week };
  }
  function wrapUp(state, me, an, planCids) {
    var day = an.asOf, name = {}; an.customers.forEach(function (c) { name[c.cid] = c.name; });
    var vis = (state.visits || []).filter(function (v) { return v.sp === me && v.date === day; });
    function st(cid) { return vis.filter(function (v) { return v.cid === cid; })[0]; }
    var deals = (state.deals || []).filter(function (d) { return d.sp === me && d.date === day; });
    var noted = {}; (state.notes || []).forEach(function (n) { if (n.ts.slice(0, 10) === day && name[n.cid]) noted[n.cid] = 1; });
    var seen = {}; planCids.forEach(function (c) { var v = st(c); if (v && v.status === 'done') seen[c] = 1; }); deals.forEach(function (d) { seen[d.cid] = 1; });
    return {
      planned: planCids.length,
      visited: planCids.filter(function (c) { var v = st(c); return v && v.status === 'done'; }).map(function (c) { return name[c]; }),
      skipped: planCids.filter(function (c) { var v = st(c); return v && v.status === 'skipped'; }).map(function (c) { return { name: name[c], reason: st(c).reason }; }),
      open: planCids.filter(function (c) { return !st(c); }).map(function (c) { return { cid: c, name: name[c] }; }),
      deals: { n: deals.length, total: sum(deals, function (d) { return d.amt; }) },
      noted: Object.keys(noted).map(function (c) { return name[c]; }),
      missingNotes: Object.keys(seen).filter(function (c) { return !noted[c] && name[c]; }).map(function (c) { return { cid: c, name: name[c] }; })
    };
  }
  function managerSummary(state, sp, opts) {
    opts = opts || {};
    var d = dashboard(state, { today: opts.today, sp: sp }), an = analyze(state, sp || null, { today: opts.today }), cur = an.currency, out = { headline: '', points: [] };
    var who = sp ? sp.split(' ')[0] + ' is' : 'The team is';
    out.headline = d.hasPrev ? who + ' at ' + money(d.ytd.cur, cur) + ' this year, ' + money(Math.abs(d.ytd.inc), cur) + (d.ytd.inc >= 0 ? ' ahead of' : ' behind') + ' the same dates last year (' + pct(d.ytd.pct) + ').'
      : who + ' at ' + money(d.ytd.cur, cur) + ' this year.';
    var ts = targetStatus(state, sp, { today: opts.today }); out.target = ts;
    if (ts.hasTarget) out.points.push({ kind: 'target', label: ts.month + ' target', text: (sp ? sp.split(' ')[0] + ' has' : 'The team has') + ' closed ' + money(ts.mtd, cur) + ' of the ' + money(ts.target, cur) + ' target (' + Math.round(100 * ts.mtd / ts.target) + '%), ' + (ts.gap > 0 ? money(ts.gap, cur) + ' to go with ' + ts.daysLeft + ' days left, ' + (ts.ahead ? 'on pace.' : 'behind pace.') : 'target reached.') });
    if (!sp && d.people.length > 1 && d.hasPrev) {
      var best = d.people[0], worst = d.people[d.people.length - 1], t = [];
      if (worst.inc < 0) t.push(worst.name + ' is furthest behind last year (' + money(worst.inc, cur) + ').');
      if (best.inc > 0) t.push(best.name + ' is furthest ahead (+' + money(best.inc, cur) + ').');
      if (t.length) out.points.push({ kind: 'people', label: 'Who needs help', text: t.join(' ') });
    }
    var risks = an.customers.filter(function (c) { return !c.lost && c.churn >= RULES.listThreshold; }).sort(function (a, b) { return b.rev12 - a.rev12; });
    out.points.push({ kind: 'risk', label: 'Accounts at risk', text: risks.length
      ? risks.length + (risks.length === 1 ? ' account' : ' accounts') + ' worth ' + money(sum(risks, function (c) { return c.rev12; }), cur) + ' a year ' + (risks.length === 1 ? 'shows' : 'show') + ' signs of leaving. The biggest: ' +
        joinNames(risks.slice(0, 3).map(function (c) { return c.name + ' (' + money(c.rev12, cur) + (sp ? '' : ', ' + c.sp.split(' ')[0]) + ')'; })) + '.'
      : 'No account shows a strong sign of leaving.' });
    var wk = d.deals.filter(function (x) { return dayNum(d.asOf) - dayNum(x.date) < 7; });
    out.points.push({ kind: 'deals', label: 'Deals this week', text: wk.length ? wk.length + (wk.length === 1 ? ' deal' : ' deals') + ' worth ' + money(sum(wk, function (x) { return x.amt; }), cur) + (wk.length === 1 ? ' was' : ' were') + ' logged in the app in the last 7 days.' : 'No deals were logged in the app in the last 7 days.' });
    expiring(an).forEach(function (k) { out.points.push({ kind: 'expiry', label: 'Ending soon', text: 'The ' + k.name + ' ends in ' + k.daysLeft + (k.daysLeft === 1 ? ' day' : ' days') + '; ' + k.customers.length + ' eligible ' + (k.customers.length === 1 ? 'customer has' : 'customers have') + ' not used it.', tech: k.tech }); });
    var vs = visitStats(state, d.asOf, sp);
    if (vs.week.planned) out.points.push({ kind: 'visits', label: 'Visit plans', text: 'Today ' + vs.today.done + ' of ' + vs.today.planned + ' planned visits are done' + (vs.today.skipped ? ' and ' + vs.today.skipped + ' skipped' : '') + '. Over the last 7 days: ' + vs.week.done + ' of ' + vs.week.planned + ' (' + Math.round(100 * vs.week.done / vs.week.planned) + '%).' });
    return out;
  }

  // An app-logged deal is "confirmed" (and no longer counted separately) once an uploaded
  // transaction for the same customer exists on or after the deal date.
  function confirmDeals(state, newTx) {
    var n = 0;
    (state.deals || []).forEach(function (d) {
      if (d.confirmed) return;
      if ((newTx || state.tx || []).some(function (t) { return t.cid === d.cid && t.d >= d.date; })) { d.confirmed = true; n++; }
    });
    return n;
  }

  var api = {
    parseDate: parseDate, normalizeRows: normalizeRows, mergeTx: mergeTx, analyze: analyze, lists: lists, topReasons: topReasons,
    normalizeTargets: normalizeTargets, normalizeCampaigns: normalizeCampaigns, targetStatus: targetStatus, closeGap: closeGap, campaignLine: campaignLine, expiring: expiring, accountReview: accountReview, execSummary: execSummary, visitStats: visitStats, wrapUp: wrapUp, managerSummary: managerSummary, buildPitch: buildPitch, customerMarkdown: customerMarkdown, fileName: fileName, dashboard: dashboard, confirmDeals: confirmDeals,
    extractKeywords: extractKeywords, linkDocs: linkDocs, salespeople: salespeople, asOfDate: asOfDate,
    KEYWORDS: KEYWORDS, KW: KW, RULES: RULES, money: money, pct: pct, niceDate: niceDate, todayISO: todayISO, addDays: addDays, dayNum: dayNum, MONTHS: MONTHS
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.NBA = api;
})(typeof window !== 'undefined' ? window : globalThis);
