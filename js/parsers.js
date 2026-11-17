/*
 * File readers. Everything is read inside the browser; nothing is uploaded to a server.
 * Excel / CSV -> transactions (SheetJS). Word / PowerPoint -> paragraphs (unzipped with JSZip).
 */
(function (root) {
  'use strict';
  var node = typeof module !== 'undefined' && module.exports;
  var XLSX = node ? require('../vendor/xlsx.full.min.js') : root.XLSX;
  var JSZip = node ? require('../vendor/jszip.min.js') : root.JSZip;
  var NBA = node ? require('./engine.js') : root.NBA;

  function unxml(s) {
    return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, function (_, n) { return String.fromCharCode(+n); }).replace(/&amp;/g, '&');
  }
  function runs(xml, tag) {
    var out = '', re = new RegExp('<' + tag + '(?: [^>]*)?>([^<]*)</' + tag + '>|<(?:w:tab|w:br|a:br)[ /]', 'g'), m;
    while ((m = re.exec(xml))) out += m[1] == null ? ' ' : m[1];
    return unxml(out).replace(/\s+/g, ' ').trim();
  }

  function parseSheetFile(name, buf, opts) {
    opts = opts || {};
    // raw: keep text dates as text, so 03/04/2026 is not silently read as US month/day
    var wb = XLSX.read(new Uint8Array(buf), { type: 'array', raw: true });
    var tx = [], skipped = 0, why = '', targets = [], campaigns = [], credit = [], stop = null, dateCheck = null, dateOrder = null;
    var stats = { lines: 0, unreadable: 0, negatives: 0, negAmt: 0, noSp: 0, future: 0, futureAmt: 0 };
    wb.SheetNames.forEach(function (sn) {
      if (stop) return;
      var ws = wb.Sheets[sn]; if (!ws || !ws['!ref']) return;
      var first = XLSX.utils.decode_range(ws['!ref']);
      // the header row is not always the first row: try the first few
      for (var off = 0; off < 6; off++) {
        var range = { s: { r: first.s.r + off, c: first.s.c }, e: first.e };
        if (range.s.r > range.e.r) break;
        var rows = XLSX.utils.sheet_to_json(ws, { defval: '', raw: true, range: range });
        var res = NBA.normalizeRows(rows, opts);
        if (res.hardStop) { stop = res.reason; return; }
        if (res.ok) {
          tx = tx.concat(res.tx); skipped += res.skipped; for (var k in stats) stats[k] += res.stats[k];
          if (!dateCheck || res.dateCheck.kind === 'ambiguous') dateCheck = res.dateCheck; dateOrder = res.dateOrder; return;
        }
        var tg = NBA.normalizeTargets(rows); if (tg.length) { targets = targets.concat(tg); return; }
        var cp = NBA.normalizeCampaigns(rows); if (cp.length) { campaigns = campaigns.concat(cp); return; }
        var cr = NBA.normalizeCredit(rows); if (cr.length) { credit = credit.concat(cr); return; }
        if (!why) why = res.reason;
      }
    });
    if (stop) return { kind: 'error', hardStop: true, name: name, reason: stop };
    if (!tx.length && !targets.length && !campaigns.length && !credit.length) return { kind: 'error', hardStop: true, name: name, reason: (why || 'No sales rows found.') + ' A sales file needs at least Date, Customer and Amount columns.' };
    return { kind: 'tx', name: name, tx: tx, skipped: skipped, targets: targets, campaigns: campaigns, credit: credit, stats: stats, dateCheck: dateCheck || { kind: 'none' }, dateOrder: dateOrder };
  }

  function parseDocx(name, buf) {
    return JSZip.loadAsync(buf).then(function (zip) {
      var f = zip.file('word/document.xml');
      if (!f) return { kind: 'error', name: name, reason: 'This does not look like a Word document.' };
      return f.async('string').then(function (xml) {
        var paras = [], re = /<w:p[ >][\s\S]*?<\/w:p>/g, m;
        while ((m = re.exec(xml))) {
          var t = runs(m[0], 'w:t'); if (!t) continue;
          var st = m[0].match(/<w:pStyle w:val="([^"]+)"/), h = 0;
          if (st) { var hm = st[1].match(/^Heading\s?(\d)/i); if (hm) h = +hm[1] + 1; else if (/^Title/i.test(st[1])) h = 1; }
          paras.push({ t: t, h: h });
        }
        return { kind: 'doc', name: name, doc: { name: name, paras: paras } };
      });
    });
  }

  function parsePptx(name, buf) {
    return JSZip.loadAsync(buf).then(function (zip) {
      var files = Object.keys(zip.files).filter(function (k) { return /^ppt\/slides\/slide\d+\.xml$/.test(k); })
        .sort(function (a, b) { return +a.match(/(\d+)\.xml/)[1] - +b.match(/(\d+)\.xml/)[1]; });
      if (!files.length) return { kind: 'error', name: name, reason: 'This does not look like a PowerPoint file.' };
      return Promise.all(files.map(function (k) { return zip.file(k).async('string'); })).then(function (xmls) {
        var paras = [];
        xmls.forEach(function (xml) {
          var re = /<p:sp>[\s\S]*?<\/p:sp>/g, m;
          while ((m = re.exec(xml))) {
            var isTitle = /<p:ph[^>]*type="(title|ctrTitle)"/.test(m[0]);
            var pre = /<a:p>[\s\S]*?<\/a:p>|<a:p [\s\S]*?<\/a:p>/g, p;
            while ((p = pre.exec(m[0]))) { var t = runs(p[0], 'a:t'); if (t) paras.push({ t: t, h: isTitle ? 1 : 0 }); }
          }
        });
        return { kind: 'doc', name: name, doc: { name: name, paras: paras } };
      });
    });
  }

  // -> Promise of {kind:'tx'|'doc'|'error', ...}
  function parseFile(name, buf, opts) {
    var ext = (name.match(/\.([A-Za-z0-9]+)$/) || [, ''])[1].toLowerCase();
    try {
      if (ext === 'xlsx' || ext === 'xls' || ext === 'csv' || ext === 'xlsm') return Promise.resolve(parseSheetFile(name, buf, opts));
      if (ext === 'docx') return parseDocx(name, buf).catch(bad);
      if (ext === 'pptx') return parsePptx(name, buf).catch(bad);
      if (ext === 'doc' || ext === 'ppt') return Promise.resolve({ kind: 'error', name: name, reason: 'This is an old Office format. Open it and use “Save as” to save it as .' + ext + 'x, then upload again.' });
      return Promise.resolve({ kind: 'error', name: name, reason: 'I can read Excel (.xlsx, .xls, .csv), Word (.docx) and PowerPoint (.pptx) files.' });
    } catch (e) { return Promise.resolve(bad(e)); }
    function bad() { return { kind: 'error', name: name, reason: 'I could not open this file. It may be damaged or password-protected.' }; }
  }

  var api = { parseFile: parseFile };
  if (node) module.exports = api;
  root.NBAParsers = api;
})(typeof window !== 'undefined' ? window : globalThis);
