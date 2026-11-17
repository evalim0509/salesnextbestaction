/*
 * Nudge in two languages. One table holds every fixed label and sentence template in English and Malay,
 * so neither falls behind: tests fail when a sentence the app produces has no Malay pair.
 * {x} marks a value carried over as it is (a name, a number, a date); values that are themselves
 * fixed labels are translated too. Technical calculations in "How I got this" stay in English.
 */
(function (root) {
  'use strict';
  var lang = 'en', exact = {}, lower = {}, patterns = [], known = {}, misses = {}, malay = {};
  var PAIRS = root.NUDGE_PAIRS || (typeof require !== 'undefined' ? require('./i18n-pairs.js') : []);

  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function build() {
    exact = {}; lower = {}; patterns = []; malay = {};
    PAIRS.forEach(function (p) {
      var en = p[0], ms = p[1];
      if (en.indexOf('{') < 0) { exact[en] = ms; lower[en.toLowerCase()] = ms; if (ms !== en) malay[ms] = 1; return; }
      var names = [], src = '^' + escRe(en).replace(/\\\{(\w+)\\\}/g, function (_, n) { names.push(n); return '(.+?)'; }) + '$';
      patterns.push({ re: new RegExp(src), names: names, ms: ms, lit: en.replace(/\{\w+\}/g, '').length });
    });
    patterns.sort(function (a, b) { return b.lit - a.lit; });
  }
  build();

  var DAY = { Mon: 'Isn', Tue: 'Sel', Wed: 'Rab', Thu: 'Kha', Fri: 'Jum', Sat: 'Sab', Sun: 'Ahd' };
  var MON = { Jan: 'Jan', Feb: 'Feb', Mar: 'Mac', Apr: 'Apr', May: 'Mei', Jun: 'Jun', Jul: 'Jul', Aug: 'Ogo', Sep: 'Sep', Oct: 'Okt', Nov: 'Nov', Dec: 'Dis' };
  var MONTHRE = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec';
  function dates(s) {
    return s.replace(new RegExp('\\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (\\d{1,2}) (' + MONTHRE + ')\\b', 'g'), function (_, d, n, m) { return DAY[d] + ' ' + n + ' ' + MON[m]; })
      .replace(new RegExp('\\b(\\d{1,2}) (' + MONTHRE + ')( \\d{4})?\\b', 'g'), function (_, n, m, y) { return n + ' ' + MON[m] + (y || ''); })
      .replace(new RegExp('^(' + MONTHRE + ')$'), function (_, m) { return MON[m]; });
  }
  function isData(s) {
    return known[s] || /^[\s\d.,:%+\-–−()\/×÷=<>≥≤→▲▼■●!?✓#&*'"“”]*$/.test(s) || /^(RM|S\$|\$|€|£|₹|Rp|¥)\s?-?[\d,.]+[kM]?$/.test(s) || /^-?(RM|S\$|\$|€|£|₹|Rp|¥)[\d,.]+$/.test(s) ||
      /\.(xlsx|xls|csv|docx|pptx|pdf|md|zip)$/i.test(s) || /^\d{4}-\d{2}(-\d{2})?$/.test(s) || /^[A-Z]{1,4}-?\d+[A-Z]?$/.test(s) ||
      /^[A-Za-z]$/.test(s) || /^[▲▼]?\s?[+\-−]?(RM|S\$|\$|€|£|₹|Rp|¥)[\d,.]+$/.test(s) || /^(RM|S\$|\$|€|£|₹|Rp|¥)$/.test(s) || /^[A-Z]{2,5}-[\w-]+$/.test(s);
  }
  // a value captured from a template: names stay, fixed labels and lists of labels are translated
  function cap(v, depth) {
    if (isData(v)) return v;
    if (exact[v] != null) return exact[v];
    if (lower[v.toLowerCase()] != null) { var l = lower[v.toLowerCase()]; return v === v.toLowerCase() ? l.toLowerCase() : l; }
    var num = v.match(/^(.+?) ([+\-−±]?\d+)$/); if (num && exact[num[1]] != null) return exact[num[1]] + ' ' + num[2];
    if (/, | and /.test(v)) return v.split(/(, | and )/).map(function (x) { return x === ', ' ? ', ' : x === ' and ' ? ' dan ' : cap(x, depth); }).join('');
    if (depth < 2) { var t = core(v, depth + 1, true); if (t !== null) return t; }
    return dates(v);
  }
  function core(s, depth, quiet) {
    if (isData(s)) return s;
    if (exact[s] != null) return exact[s];
    if (MON[s]) return MON[s];
    if (s === s.toLowerCase() && lower[s] != null) return lower[s].toLowerCase();
    for (var i = 0; i < patterns.length; i++) {
      var m = s.match(patterns[i].re); if (!m) continue;
      var P = patterns[i], vals = {};
      P.names.forEach(function (n, k) { vals[n] = cap(m[k + 1], depth); });
      return P.ms.replace(/\{(\w+)\}/g, function (_, n) { return vals[n] != null ? vals[n] : ''; });
    }
    // a plain list of names, dates and labels, such as "Tue 17 Nov, Aisha Rahman"
    if (/, | and /.test(s)) { var parts = s.split(/(, | and )/), ok = parts.every(function (x) { return x === ', ' || x === ' and ' || isData(x) || exact[x] != null || dates(x) !== x; });
      if (ok) return parts.map(function (x) { return x === ', ' ? ', ' : x === ' and ' ? ' dan ' : exact[x] != null ? exact[x] : dates(x); }).join(''); }
    var d = dates(s); if (d !== s && !/[a-z]{3,}/.test(d.replace(/\b(Isn|Sel|Rab|Kha|Jum|Sab|Ahd|Mac|Mei|Ogo|Okt|Dis|Jan|Feb|Apr|Jun|Jul|Sep|Nov)\b/g, ''))) return d;
    if (!quiet) misses[s] = (misses[s] || 0) + 1;
    return quiet ? null : s;
  }
  // translate one string; keeps surrounding spaces
  function t(s) {
    if (lang !== 'ms' || s == null) return s;
    var m = String(s).match(/^(\s*)([\s\S]*?)(\s*)$/);
    if (!m[2] || !/[A-Za-z]/.test(m[2])) return s;
    if (malay[m[2]]) return s;
    var out = core(m[2], 0, false);
    return m[1] + (out == null ? m[2] : out) + m[3];
  }

  // ---- the page: text nodes and a few attributes, skipping technical code, user text and typed-out word spans
  var SKIP = 'code, script, style, textarea, .nt, .w';
  var done = typeof WeakSet !== 'undefined' ? new WeakSet() : null;
  function translateTree(node) {
    if (lang !== 'ms' || !node) return node;
    if (node.nodeType === 3) { tx(node); return node; }
    if (node.nodeType !== 1 || (node.closest && node.closest(SKIP))) return node;
    var w = document.createTreeWalker(node, 4, null), list = [], n;
    while ((n = w.nextNode())) list.push(n);
    list.forEach(tx);
    [node].concat([].slice.call(node.querySelectorAll('[aria-label],[title],[placeholder]'))).forEach(function (el) {
      ['aria-label', 'title', 'placeholder'].forEach(function (a) { var v = el.getAttribute && el.getAttribute(a); if (v && !el.closest(SKIP)) { var nv = t(v); if (nv !== v) el.setAttribute(a, nv); } });
    });
    return node;
  }
  function tx(n) {
    if (done && done.has(n)) return;
    var p = n.parentNode; if (!p || (p.closest && p.closest(SKIP))) return;
    var v = n.nodeValue; if (!v || !/[A-Za-z]/.test(v)) return;
    var nv = t(v); if (nv !== v) n.nodeValue = nv;
    if (done) done.add(n);
  }
  var obs = null;
  function watch(rootEl) {
    if (obs || typeof MutationObserver === 'undefined') return;
    obs = new MutationObserver(function (list) { if (lang !== 'ms') return; list.forEach(function (m) { [].forEach.call(m.addedNodes, translateTree); }); });
    obs.observe(rootEl, { childList: true, subtree: true });
  }
  function setKnown(values) { known = {}; values.forEach(function (v) { if (v) known[String(v).trim()] = 1; }); }
  function setLang(l) { lang = l === 'ms' ? 'ms' : 'en'; }

  var api = { t: t, translateTree: translateTree, watch: watch, setKnown: setKnown, setLang: setLang, getLang: function () { return lang; }, misses: misses, pairs: PAIRS, reload: function (p) { PAIRS = p; api.pairs = p; build(); } };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.NudgeI18n = api;
})(typeof window !== 'undefined' ? window : globalThis);
