/* Nudge exports: Word, PowerPoint and Excel files built inside the browser. Nothing is uploaded. */
(function (root) {
  'use strict';
  var NBA = root.NBA;
  var INK = '10151F', GREY = '6C768A', LINE = 'D9DEE8', SOFT = 'EDF1F6', BLUE = '2A78D6';
  function x(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ''); }
  function slug(s) { return String(s).replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  // ------------------------------------------------------------ Word (.docx), written by hand with JSZip
  // A document is a list of simple steps (paragraph, table, page break) that can be written as Word or as PDF.
  function Doc() { this.ops = []; }
  function run(t, o) {
    o = o || {};
    return '<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>' + (o.b ? '<w:b/>' : '') + (o.i ? '<w:i/>' : '') + '<w:color w:val="' + (o.color || INK) + '"/><w:sz w:val="' + (o.size || 21) + '"/></w:rPr><w:t xml:space="preserve">' + x(t) + '</w:t></w:r>';
  }
  Doc.prototype.p = function (t, o) { this.ops.push({ t: 'p', text: t, o: o || {} }); return this; };
  Doc.prototype.h = function (t) { return this.p(t, { b: true, size: 25, before: 220, after: 90 }); };
  Doc.prototype.bullets = function (a, o) { var d = this; a.forEach(function (t) { d.p(t, Object.assign({ bullet: true, after: 70 }, o || {})); }); return this; };
  Doc.prototype.table = function (head, rows, widths, o) {
    var n = (head || rows[0]).length;
    this.ops.push({ t: 'table', head: head, rows: rows, w: widths || Array.apply(null, Array(n)).map(function () { return 1 / n; }), o: o || {} });
    return this.p('', { after: 40, size: 8 });
  };
  Doc.prototype.pageBreak = function () { this.ops.push({ t: 'break' }); return this; };
  Doc.prototype.out = function (fmt) { return fmt === 'pdf' ? this.pdf() : this.blob(); };

  Doc.prototype.blob = function () {
    var total = 9700;
    var bd = '<w:top w:val="single" w:sz="4" w:color="' + LINE + '"/><w:left w:val="single" w:sz="4" w:color="' + LINE + '"/><w:bottom w:val="single" w:sz="4" w:color="' + LINE + '"/><w:right w:val="single" w:sz="4" w:color="' + LINE + '"/><w:insideH w:val="single" w:sz="4" w:color="' + LINE + '"/><w:insideV w:val="single" w:sz="4" w:color="' + LINE + '"/>';
    var body = this.ops.map(function (op) {
      if (op.t === 'break') return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
      var o = op.o;
      if (op.t === 'p') return '<w:p><w:pPr><w:spacing w:before="' + (o.before || 0) + '" w:after="' + (o.after == null ? 100 : o.after) + '"/>' + (o.bullet ? '<w:ind w:left="340" w:hanging="220"/>' : '') + '</w:pPr>' + (o.bullet ? run('•  ', o) : '') + run(op.text, o) + '</w:p>';
      function cell(t, i, isHead) {
        return '<w:tc><w:tcPr><w:tcW w:w="' + Math.round(total * op.w[i]) + '" w:type="dxa"/>' + (isHead ? '<w:shd w:val="clear" w:color="auto" w:fill="' + SOFT + '"/>' : '') + '</w:tcPr><w:p><w:pPr><w:spacing w:before="40" w:after="40"/></w:pPr>' +
          (Array.isArray(t) ? run(t[0], { size: 16, color: GREY }) + '<w:r><w:br/></w:r>' + run(t[1], { b: true, size: 22 }) : run(t, { b: isHead, size: o.size || 19 })) + '</w:p></w:tc>';
      }
      return '<w:tbl><w:tblPr><w:tblW w:w="' + total + '" w:type="dxa"/><w:tblBorders>' + bd + '</w:tblBorders><w:tblCellMar><w:left w:w="100" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar></w:tblPr>' +
        (op.head ? '<w:tr>' + op.head.map(function (t, i) { return cell(t, i, true); }).join('') + '</w:tr>' : '') +
        op.rows.map(function (r) { return '<w:tr>' + r.map(function (t, i) { return cell(t, i, false); }).join('') + '</w:tr>'; }).join('') + '</w:tbl>';
    }).join('');
    var zip = new root.JSZip();
    zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
    zip.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
    zip.file('word/document.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + body +
      '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="900" w:right="1100" w:bottom="900" w:left="1100" w:header="500" w:footer="500" w:gutter="0"/></w:sectPr></w:body></w:document>');
    return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  };

  // PDF uses the built-in Helvetica font, so a few symbols are swapped for plain ones.
  function plain(t) {
    return String(t == null ? '' : t).replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/→/g, '->').replace(/≥/g, '>=').replace(/≤/g, '<=').replace(/[−–—]/g, '-').replace(/×/g, 'x').replace(/÷/g, '/').replace(/…/g, '...').replace(/₹/g, 'Rs ').replace(/›/g, '>').replace(/±/g, '+/-').replace(/[^\x20-\x7e\xa0-\xff€]/g, '');
  }
  Doc.prototype.pdf = function () {
    var pdf = new root.jspdf.jsPDF({ unit: 'pt', format: 'a4' }), W = 595.28, H = 841.89, M = 56, y = M, maxW = W - 2 * M;
    function font(o, size) { pdf.setFont('helvetica', o.b && o.i ? 'bolditalic' : o.b ? 'bold' : o.i ? 'italic' : 'normal'); pdf.setFontSize(size); pdf.setTextColor('#' + (o.color || INK)); }
    function need(h) { if (y + h > H - M) { pdf.addPage(); y = M; } }
    this.ops.forEach(function (op) {
      if (op.t === 'break') { pdf.addPage(); y = M; return; }
      var o = op.o;
      if (op.t === 'p') {
        var fs = (o.size || 21) / 2, lh = fs * 1.34, ind = o.bullet ? 15 : 0; y += (o.before || 0) / 20;
        if (op.text !== '') {
          font(o, fs);
          pdf.splitTextToSize(plain(op.text), maxW - ind).forEach(function (ln, i) {
            need(lh); font(o, fs);
            if (i === 0 && o.bullet) { pdf.setFillColor('#' + (o.color || INK)); pdf.circle(M + 4, y + lh * 0.52, 1.5, 'F'); }
            pdf.text(ln, M + ind, y + fs); y += lh;
          });
        } else y += lh * 0.5;
        y += (o.after == null ? 100 : o.after) / 20; return;
      }
      var pad = 5, fsT = (o.size || 19) / 2, lhT = fsT * 1.3, rows = (op.head ? [{ cells: op.head, head: true }] : []).concat(op.rows.map(function (r) { return { cells: r }; }));
      pdf.setDrawColor('#' + LINE); pdf.setLineWidth(0.5);
      rows.forEach(function (row) {
        var cells = row.cells.map(function (t, i) {
          var w = maxW * op.w[i];
          if (Array.isArray(t)) { font({ b: true }, 11); return { kpi: true, w: w, label: plain(t[0]), lines: pdf.splitTextToSize(plain(t[1]), w - 2 * pad) }; }
          font({ b: row.head }, fsT); return { w: w, lines: pdf.splitTextToSize(plain(t), w - 2 * pad) };
        });
        var h = Math.max.apply(null, cells.map(function (c) { return c.kpi ? 12 + c.lines.length * 14 : c.lines.length * lhT; })) + 2 * pad;
        need(h); var xx = M;
        cells.forEach(function (c) {
          if (row.head) { pdf.setFillColor('#' + SOFT); pdf.rect(xx, y, c.w, h, 'FD'); } else pdf.rect(xx, y, c.w, h, 'S');
          if (c.kpi) { font({ color: GREY }, 8); pdf.text(c.label, xx + pad, y + pad + 8); font({ b: true }, 11); c.lines.forEach(function (ln, k) { pdf.text(ln, xx + pad, y + pad + 22 + k * 14); }); }
          else { font({ b: row.head }, fsT); c.lines.forEach(function (ln, k) { pdf.text(ln, xx + pad, y + pad + fsT + k * lhT - 1); }); }
          xx += c.w;
        });
        y += h;
      });
    });
    return Promise.resolve(pdf.output('blob'));
  };

  // ------------------------------------------------------------ customer account review one-pager
  function reviewDoc(R, d) {
    d = d || new Doc();
    d.p(R.title, { b: true, size: 40, after: 40 }).p(R.subtitle, { color: GREY, size: 19, after: 160 });
    d.table(null, [R.kpis], null);
    R.sections.forEach(function (s) { d.h(s.heading); d.bullets(s.bullets); });
    if (R.table.rows.length) { d.h(R.tableTitle); d.table(R.table.head, R.table.rows, [0.5, 0.25, 0.25]); }
    if (R.audit.length) { d.h('How I got this'); d.table(['Score', 'Points', 'Calculation', 'Source'], R.audit, [0.12, 0.1, 0.6, 0.18], { size: 15 }); }
    d.p(R.footer, { color: GREY, size: 16, before: 160, i: true });
    return d;
  }
  function newDeck() { var p = new root.PptxGenJS(); p.layout = 'LAYOUT_WIDE'; return p; }
  function clip(t, n) { t = String(t); return t.length > n ? t.slice(0, t.lastIndexOf(' ', n)) + '…' : t; }
  function reviewSlide(pptx, R) {
    var s = pptx.addSlide(); s.background = { color: 'FFFFFF' };
    s.addText(R.title, { x: 0.5, y: 0.3, w: 12.3, h: 0.6, fontSize: 26, bold: true, color: INK, fontFace: 'Calibri' });
    s.addText(R.subtitle, { x: 0.5, y: 0.88, w: 12.3, h: 0.35, fontSize: 12, color: GREY, fontFace: 'Calibri' });
    R.kpis.forEach(function (k, i) {
      var w = 2.95, xx = 0.5 + i * (w + 0.17);
      s.addShape(pptx.ShapeType.roundRect, { x: xx, y: 1.4, w: w, h: 0.95, fill: { color: SOFT }, line: { color: SOFT }, rectRadius: 0.12 });
      s.addText([{ text: k[0], options: { fontSize: 10, color: GREY, breakLine: true } }, { text: k[1], options: { fontSize: 15, bold: true, color: INK } }], { x: xx + 0.12, y: 1.42, w: w - 0.24, h: 0.9, fontFace: 'Calibri', valign: 'middle', fit: 'shrink' });
    });
    var body = [], budget = R.version === 'customer' ? 3 : 4;
    R.sections.slice(0, budget).forEach(function (sec) {
      body.push({ text: sec.heading, options: { bold: true, fontSize: 13, color: INK, breakLine: true } });
      sec.bullets.slice(0, R.version === 'customer' ? 3 : 4).forEach(function (b) { body.push({ text: clip(b, 190), options: { fontSize: 10.5, color: INK, bullet: { indent: 12 }, breakLine: true, paraSpaceAfter: 3 } }); });
      body.push({ text: ' ', options: { fontSize: 5, breakLine: true } });
    });
    s.addText(body, { x: 0.5, y: 2.55, w: 7.4, h: 4.2, fontFace: 'Calibri', valign: 'top', fit: 'shrink' });
    s.addText(R.tableTitle, { x: 8.2, y: 2.55, w: 4.6, h: 0.35, fontSize: 13, bold: true, color: INK, fontFace: 'Calibri' });
    var rows = [R.table.head.map(function (h) { return { text: h, options: { bold: true, fill: { color: SOFT }, color: INK } }; })].concat(R.table.rows.slice(0, 7).map(function (r) { return r.map(function (c) { return { text: c }; }); }));
    s.addTable(rows, { x: 8.2, y: 2.95, w: 4.6, colW: [2.1, 1.3, 1.2], fontSize: 10, fontFace: 'Calibri', color: INK, border: { type: 'solid', pt: 0.5, color: LINE } });
    s.addText(R.footer, { x: 0.5, y: 6.95, w: 12.3, h: 0.35, fontSize: 9, italic: true, color: GREY, fontFace: 'Calibri' });
    return s;
  }
  function onePager(c, an, version, fmt) {
    var R = NBA.accountReview(c, an, version), base = slug(c.name) + '-account-review' + (version === 'customer' ? '' : '-internal');
    if (fmt === 'pptx') { var p = newDeck(); reviewSlide(p, R); return p.write({ outputType: 'blob' }).then(function (b) { return { name: base + '.pptx', blob: b }; }); }
    return reviewDoc(R).out(fmt).then(function (b) { return { name: base + '.' + fmt, blob: b }; });
  }
  // Meeting pack: the one-pagers for today's visits in a single file
  function pack(customers, an, version, fmt, who) {
    var base = 'Meeting-pack-' + slug(who) + '-' + an.asOf + (version === 'customer' ? '' : '-internal');
    if (fmt === 'pptx') { var p = newDeck(); customers.forEach(function (c) { reviewSlide(p, NBA.accountReview(c, an, version)); }); return p.write({ outputType: 'blob' }).then(function (b) { return { name: base + '.pptx', blob: b }; }); }
    var d = new Doc(); customers.forEach(function (c, i) { if (i) d.pageBreak(); reviewDoc(NBA.accountReview(c, an, version), d); });
    return d.out(fmt).then(function (b) { return { name: base + '.' + fmt, blob: b }; });
  }

  // ------------------------------------------------------------ today's brief (Word)
  function briefDoc(state, me, an, plan, fmt) {
    fmt = fmt || 'docx';
    var ex = NBA.execSummary(state, me, an, { plan: plan }), d = new Doc(), cur = an.currency;
    d.p('Morning brief: ' + me, { b: true, size: 40, after: 40 }).p(NBA.niceDate(an.asOf) + '. Sales data up to ' + NBA.niceDate(an.dataTo || an.asOf) + '.', { color: GREY, size: 19, after: 160 });
    d.p(ex.headline, { b: true, size: 26, after: 140 });
    d.table(['Topic', 'Summary'], ex.points.map(function (q) { return [q.label, q.text]; }), [0.22, 0.78]);
    if (ex.offers.length) { d.h('Offers and renewals to use today'); d.bullets(ex.offers.map(function (o) { return o.name + ': ' + o.text; })); }
    d.h('Today\'s visits');
    plan.forEach(function (c, i) {
      var p = NBA.buildPitch(c, an);
      d.p((i + 1) + '. ' + c.name + ' (' + c.tag + ')', { b: true, size: 23, before: 120, after: 60 });
      d.bullets(NBA.topReasons(c, 3).map(function (f) { return f.plain; }));
      d.p('Pitch: ' + p.open + ' ' + p.ask, { after: 60 }); d.bullets(p.points.map(function (q) { return q.text; }));
    });
    d.h('How I got this');
    var audit = [['Headline', ex.headlineTech, 'Sales data']].concat(ex.points.map(function (q) { return [q.label, q.tech || '', 'Sales data']; }));
    plan.forEach(function (c) { c.factors.forEach(function (f) { audit.push([c.name + ' (' + f.bucket + ' ' + (f.pts > 0 ? '+' : '') + f.pts + ')', f.tech, f.src]); }); });
    d.table(['Item', 'Calculation', 'Source'], audit, [0.26, 0.58, 0.16], { size: 15 });
    d.p('Produced by Nudge from fixed rules. No AI model was used. Amounts in ' + cur + '.', { color: GREY, size: 16, i: true, before: 160 });
    return d.out(fmt).then(function (b) { return { name: 'Morning-brief-' + slug(me) + '-' + an.asOf + '.' + fmt, blob: b }; });
  }

  // ------------------------------------------------------------ portfolio workbook (Excel)
  function workbook(state, me, an) {
    var X = root.XLSX, wb = X.utils.book_new(), ts = NBA.targetStatus(state, me, { asOf: an.asOf });
    function sheet(name, head, rows, widths) { var ws = X.utils.aoa_to_sheet([head].concat(rows)); ws['!cols'] = (widths || head.map(function () { return 18; })).map(function (w) { return { wch: w }; }); X.utils.book_append_sheet(wb, ws, name); }
    sheet('Customers', ['Customer', 'Customer ID', 'Segment', 'Status', 'Visit priority', 'Chance to close', 'Risk of leaving', 'Last order', 'Days since last order', 'Usual days between orders', 'Usual order', 'Revenue last 12 months', 'Revenue 12 months before', 'Main reasons', 'Offer that applies', 'Estimated saving'],
      an.customers.map(function (c) { return [c.name, c.cid, c.seg, c.tag, c.priority, c.close, c.churn, c.last, c.recency, Math.round(c.gapUsed), Math.round(c.avgOrder), Math.round(c.rev12), Math.round(c.revPY), NBA.topReasons(c, 3).map(function (f) { return f.plain; }).join(' '), c.offer ? c.offer.name : '', c.offer ? c.offer.saving : '']; }),
      [28, 12, 12, 16, 12, 14, 14, 12, 10, 12, 12, 14, 14, 90, 28, 12]);
    sheet('Target', ['Salesperson', 'Month', 'Target', 'Closed month to date', 'Gap', 'Where sales should be today', 'Status', 'Days left'],
      [[me, ts.month, ts.hasTarget ? ts.target : 'No target loaded', Math.round(ts.mtd), ts.hasTarget ? Math.round(ts.gap) : '', ts.hasTarget ? Math.round(ts.pace) : '', ts.hasTarget ? (ts.ahead ? 'On pace' : 'Behind pace') : '', ts.daysLeft]], [20, 10, 14, 18, 12, 24, 14, 10]);
    var camp = []; an.customers.forEach(function (c) { c.campaigns.forEach(function (k) { camp.push([c.name, k.name, k.used ? 'Used in last 30 days' : 'Not used yet', k.basis, k.saving, Math.round(k.pct * 1000) / 10, k.end || '', k.src, k.tech]); }); });
    sheet('Campaigns', ['Customer', 'Campaign', 'Status', 'Typical order', 'Estimated saving', 'Discount %', 'Ends', 'Source', 'How I got this'], camp, [28, 28, 20, 12, 14, 10, 12, 22, 90]);
    var aud = []; an.customers.forEach(function (c) { c.factors.forEach(function (f) { aud.push([c.name, f.bucket, f.pts, f.plain, f.tech, f.src]); }); });
    sheet('How I got this', ['Customer', 'Score', 'Points', 'In plain English', 'Calculation', 'Source'], aud, [28, 10, 8, 70, 90, 14]);
    var names = {}; an.customers.forEach(function (c) { names[c.cid] = c.name; });
    sheet('Visit notes', ['Date', 'Customer', 'Keywords', 'Talked about', 'Note text'], (state.notes || []).filter(function (n) { return names[n.cid]; }).map(function (n) { return [n.ts.slice(0, 10), names[n.cid], (n.keywords || []).map(function (id) { return NBA.KW[id] ? NBA.KW[id].label : id; }).join(', '), (n.cats || []).join(', '), n.transcript || '']; }), [12, 28, 40, 24, 70]);
    sheet('Deals', ['Date', 'Customer', 'Amount', 'Category', 'Status'], (state.deals || []).filter(function (d) { return d.sp === me; }).map(function (d) { return [d.date, d.cname, d.amt, d.cat, d.confirmed ? 'Confirmed by uploaded sales file' : 'Logged in app']; }), [12, 28, 12, 20, 30]);
    sheet('Visits', ['Date', 'Customer', 'Status', 'Reason'], (state.visits || []).filter(function (v) { return v.sp === me && names[v.cid]; }).map(function (v) { return [v.date, names[v.cid], v.status === 'done' ? 'Visited' : 'Skipped', v.reason || '']; }), [12, 28, 12, 30]);
    var out = X.write(wb, { type: 'array', bookType: 'xlsx' });
    return Promise.resolve({ name: 'Portfolio-' + slug(me) + '-' + an.asOf + '.xlsx', blob: new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }) });
  }

  // ------------------------------------------------------------ review deck (PowerPoint)
  function deck(state, sp) {
    var an = NBA.analyze(state, sp || null), cur = an.currency, m = NBA.managerSummary(state, sp), pptx = newDeck(), who = sp || 'All salespeople';
    function title(s, t, sub) {
      s.background = { color: 'FFFFFF' };
      s.addText(t, { x: 0.5, y: 0.35, w: 12.3, h: 0.6, fontSize: 26, bold: true, color: INK, fontFace: 'Calibri' });
      if (sub) s.addText(sub, { x: 0.5, y: 0.93, w: 12.3, h: 0.35, fontSize: 12, color: GREY, fontFace: 'Calibri' });
    }
    function table(s, head, rows, colW, empty) {
      if (!rows.length) { s.addText(empty, { x: 0.5, y: 1.6, w: 12.3, h: 0.5, fontSize: 14, color: GREY, fontFace: 'Calibri' }); return; }
      s.addTable([head.map(function (h) { return { text: h, options: { bold: true, fill: { color: SOFT } } }; })].concat(rows.map(function (r) { return r.map(function (c) { return { text: String(c) }; }); })),
        { x: 0.5, y: 1.55, w: 12.3, colW: colW, fontSize: 11, fontFace: 'Calibri', color: INK, border: { type: 'solid', pt: 0.5, color: LINE }, valign: 'middle' });
    }
    var s = pptx.addSlide(); s.background = { color: INK };
    s.addText('Sales review', { x: 0.7, y: 2.6, w: 12, h: 1, fontSize: 44, bold: true, color: 'FFFFFF', fontFace: 'Calibri' });
    s.addText(who + '. ' + NBA.niceDate(an.asOf) + '. Sales data up to ' + NBA.niceDate(an.dataTo || an.asOf) + '.', { x: 0.7, y: 3.6, w: 12, h: 0.5, fontSize: 16, color: 'C9D2E3', fontFace: 'Calibri' });

    s = pptx.addSlide(); title(s, 'Summary', who);
    s.addText(m.headline, { x: 0.5, y: 1.5, w: 12.3, h: 0.9, fontSize: 20, bold: true, color: INK, fontFace: 'Calibri', fit: 'shrink' });
    var body = []; m.points.forEach(function (q) { body.push({ text: q.label, options: { bold: true, fontSize: 13, color: BLUE, breakLine: true } }); body.push({ text: q.text, options: { fontSize: 13, color: INK, breakLine: true, paraSpaceAfter: 8 } }); });
    s.addText(body, { x: 0.5, y: 2.5, w: 12.3, h: 4.5, fontFace: 'Calibri', valign: 'top', fit: 'shrink' });

    var people = sp ? [sp] : NBA.salespeople(state), tg = people.map(function (n) { return [n, NBA.targetStatus(state, n)]; }).filter(function (r) { return r[1].hasTarget; });
    s = pptx.addSlide(); title(s, 'Monthly target', tg.length ? tg[0][1].month + ', month to date' : '');
    table(s, ['Salesperson', 'Target', 'Closed', 'Gap', 'Should be at today', 'Status'], tg.map(function (r) { var t = r[1]; return [r[0], NBA.money(t.target, cur), NBA.money(t.mtd, cur), NBA.money(t.gap, cur), NBA.money(t.pace, cur), t.gap <= 0 ? 'Reached' : t.ahead ? 'On pace' : 'Behind pace']; }), [3.3, 1.8, 1.8, 1.8, 2, 1.6], 'No monthly targets have been uploaded.');

    var live = an.customers.filter(function (c) { return !c.lost; });
    function reason(c, bucket) { return ((c.factors.filter(function (f) { return f.bucket === bucket && f.pts > 0; }).sort(function (a, b) { return b.pts - a.pts; })[0] || {}).plain) || ''; }
    s = pptx.addSlide(); title(s, 'Accounts at risk', 'Risk score of 50 or more, largest first');
    table(s, ['Customer', 'Owner', 'Revenue, 12 months', 'Days since order', 'Main reason'], live.filter(function (c) { return c.churn >= 50; }).sort(function (a, b) { return b.rev12 - a.rev12; }).slice(0, 8).map(function (c) { return [c.name, c.sp, NBA.money(c.rev12, cur), c.recency, clip(reason(c, 'churn'), 120)]; }), [2.8, 1.8, 1.7, 1.3, 4.7], 'No account shows a strong sign of leaving.');

    s = pptx.addSlide(); title(s, 'Best opportunities', 'Close score of 50 or more, strongest first');
    table(s, ['Customer', 'Owner', 'Usual order', 'Why now', 'Offer'], live.filter(function (c) { return c.close >= 50; }).sort(function (a, b) { return b.close - a.close || b.avgOrder - a.avgOrder; }).slice(0, 8).map(function (c) { return [c.name, c.sp, NBA.money(c.avgOrder, cur), clip(reason(c, 'close'), 110), c.offer ? c.offer.name + ' (saves ' + NBA.money(c.offer.saving, cur) + ')' : '']; }), [2.6, 1.7, 1.3, 4, 2.7], 'No customer stands out as ready to buy right now.');

    var cmap = {}; live.forEach(function (c) { c.campaigns.forEach(function (k) { var e = cmap[k.name] = cmap[k.name] || { name: k.name, end: k.end, n: 0, unused: 0, saving: 0 }; e.n++; if (!k.used) { e.unused++; e.saving += k.saving; } }); });
    s = pptx.addSlide(); title(s, 'Campaigns', 'Who can still use each offer');
    table(s, ['Campaign', 'Ends', 'Eligible customers', 'Not used yet', 'Customer savings on offer'], Object.keys(cmap).map(function (k) { var e = cmap[k], left = e.end ? NBA.dayNum(e.end) - NBA.dayNum(an.asOf) : null; return [e.name, e.end ? NBA.niceDate(e.end) + (left <= NBA.RULES.expiryDays ? ' (in ' + left + ' days)' : '') : 'No end date', e.n, e.unused, NBA.money(e.saving, cur)]; }), [4, 2.8, 1.8, 1.6, 2.1], 'No campaigns have been uploaded.');

    live.slice(0, 3).forEach(function (c) { reviewSlide(pptx, NBA.accountReview(c, an, 'internal')); });

    s = pptx.addSlide(); title(s, 'How I got this');
    s.addText([
      'Source: the uploaded sales file (' + (state.tx || []).length.toLocaleString() + ' rows up to ' + NBA.niceDate(an.dataTo || an.asOf) + '), ' + (state.docs || []).length + ' Word or PowerPoint documents, ' + (state.notes || []).length + ' visit notes and ' + (state.deals || []).length + ' deals logged in the app.',
      'Risk score: overdue against the customer\'s usual gap between orders, falling 90-day spend, concerns in visit notes, risk wording in documents.',
      'Close score: due-to-reorder window, growing spend, buying signals in notes, category gaps against similar customers, campaigns and renewals.',
      'Target pace: target × day of month ÷ days in month. Savings: discount × the customer\'s typical order in the campaign categories.',
      'Every figure comes from fixed rules and arithmetic. No AI model was used. The full calculation for each customer is in the Excel portfolio export.'
    ].map(function (t) { return { text: t, options: { bullet: { indent: 14 }, breakLine: true, paraSpaceAfter: 10 } }; }), { x: 0.5, y: 1.4, w: 12.3, h: 5, fontSize: 14, color: INK, fontFace: 'Calibri', valign: 'top' });
    return pptx.write({ outputType: 'blob' }).then(function (b) { return { name: 'Sales-review-' + slug(who) + '-' + an.asOf + '.pptx', blob: b }; });
  }

  // ------------------------------------------------------------ manager weekly digest (Word or PDF)
  function digest(state, sp, fmt) {
    var D = NBA.weeklyDigest(state, sp), d = new Doc();
    d.p('Weekly digest: ' + D.who, { b: true, size: 40, after: 40 }).p(D.period, { color: GREY, size: 19, after: 160 });
    d.table(null, [D.tiles.map(function (t) { return [t.label, t.value + ' (' + t.sub + ')']; })], null);
    D.sections.forEach(function (s) { d.h(s.heading); d.bullets(s.bullets); });
    d.h('How I got this'); d.table(['Item', 'Calculation'], D.audit.filter(function (r) { return r[1]; }), [0.25, 0.75], { size: 15 });
    d.p('Produced by Nudge from fixed rules. No AI model was used. Visits, deals and notes are those recorded on this device.', { color: GREY, size: 16, i: true, before: 160 });
    return d.out(fmt).then(function (b) { return { name: 'Weekly-digest-' + slug(D.who) + '-' + D.asOf + '.' + fmt, blob: b }; });
  }

  root.NBAExport = { digest: digest, pack: pack, onePager: onePager, briefDoc: briefDoc, workbook: workbook, deck: deck };
})(window);
