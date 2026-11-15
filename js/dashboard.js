/* Management view: incremental revenue vs the same period last year. */
(function (root) {
  'use strict';
  var NBA = root.NBA;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function short(n, cur) {
    var a = Math.abs(n), s = a >= 1e6 ? (a / 1e6).toFixed(a >= 1e7 ? 0 : 1) + 'M' : a >= 1e3 ? Math.round(a / 1e3) + 'k' : String(Math.round(a));
    return (n < 0 ? '-' : '') + cur + s;
  }
  function signed(n, cur) { return (n >= 0 ? '+' : '-') + NBA.money(Math.abs(n), cur); }
  function delta(inc, pct, cur) {
    var up = inc >= 0;
    return '<span class="delta ' + (up ? 'up' : 'down') + '">' + (up ? '▲ ' : '▼ ') + signed(inc, cur) + (pct == null ? '' : ' (' + NBA.pct(pct) + ')') + '</span>';
  }

  function monthChart(d, cur) {
    var W = 340, H = 190, L = 38, B = 22, T = 8, pw = (W - L) / 12, ph = H - B - T;
    var max = Math.max.apply(null, d.months.map(function (m) { return Math.max(m.cur, m.prev); })) || 1;
    var step = Math.pow(10, Math.floor(Math.log10(max))); if (max / step < 2) step /= 2; else if (max / step > 5) step *= 2;
    var top = Math.ceil(max / step) * step, s = '';
    for (var v = 0; v <= top + 1; v += step) {
      var y = T + ph - (v / top) * ph;
      s += '<line x1="' + L + '" x2="' + W + '" y1="' + y + '" y2="' + y + '" stroke="#e6e9f0"/><text x="' + (L - 5) + '" y="' + (y + 3.5) + '" text-anchor="end" font-size="9.5" fill="#6b7588">' + short(v, cur) + '</text>';
    }
    function bar(x, val, color) {
      var h = Math.max(val > 0 ? 2 : 0, (val / top) * ph), y = T + ph - h, w = pw * 0.36, r = Math.min(3, h);
      return '<path d="M' + x + ' ' + (y + h) + 'V' + (y + r) + 'q0 -' + r + ' ' + r + ' -' + r + 'h' + (w - 2 * r) + 'q' + r + ' 0 ' + r + ' ' + r + 'V' + (y + h) + 'z" fill="' + color + '"/>';
    }
    d.months.forEach(function (m, i) {
      var x = L + i * pw;
      s += bar(x + pw * 0.11, m.prev, 'var(--last-year)');
      if (!m.future) s += bar(x + pw * 0.11 + pw * 0.36 + 2, m.cur, 'var(--this-year)');
      s += '<text x="' + (x + pw / 2) + '" y="' + (H - 7) + '" text-anchor="middle" font-size="9.5" fill="#6b7588">' + m.label.charAt(0) + '</text>';
      s += '<rect class="hit" data-i="' + i + '" x="' + x + '" y="' + T + '" width="' + pw + '" height="' + (ph + B) + '" fill="transparent"/>';
    });
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Revenue by month, ' + d.year + ' against ' + d.prevYear + '">' + s + '</svg>';
  }

  function render(el, state, sp) {
    if (!state.tx || !state.tx.length) {
      el.innerHTML = '<div class="empty"><h2>No sales data yet</h2><p>Upload a sales file in “My brief” and the revenue dashboard will appear here.</p></div>';
      return;
    }
    var cur = (state.settings && state.settings.currency) || '$', d = NBA.dashboard(state, { sp: sp || null }), h = '';
    h += '<div class="panel hero"><div class="small">' + (sp ? esc(sp) : 'All salespeople') + ', ' + d.year + ' up to ' + NBA.niceDate(d.asOf) + '</div>';
    if (d.hasPrev) h += '<div>Incremental revenue</div><div class="hero-num">' + signed(d.ytd.inc, cur) + '</div><span class="pill">' + (d.ytd.inc >= 0 ? '▲ ' : '▼ ') + NBA.pct(d.ytd.pct) + ' against the same dates in ' + d.prevYear + '</span>';
    else h += '<div>Revenue this year</div><div class="hero-num">' + NBA.money(d.ytd.cur, cur) + '</div><span class="pill">No ' + d.prevYear + ' sales uploaded to compare with</span>';
    h += '</div><div class="kpis">' +
      '<div class="panel"><div class="small">' + d.year + ' to date</div><div class="v">' + NBA.money(d.ytd.cur, cur) + '</div><div class="small">' + d.prevYear + ': ' + NBA.money(d.ytd.prev, cur) + '</div></div>' +
      '<div class="panel"><div class="small">' + d.month.label + ' to date</div><div class="v">' + NBA.money(d.month.cur, cur) + '</div><div class="small">' + (d.hasPrev ? delta(d.month.inc, d.month.pct, cur) : '') + '</div></div></div>';

    h += '<div class="panel"><h3>Revenue by month</h3><div class="legend"><span><i style="background:var(--this-year)"></i>' + d.year + '</span><span><i style="background:var(--last-year)"></i>' + d.prevYear + '</span></div>' +
      '<div class="chart" id="mchart">' + monthChart(d, cur) + '</div><button class="linkbtn" id="tbl-toggle">Show as table</button><div id="mtable" hidden><table class="dtable"><tr><th>Month</th><th>' + d.year + '</th><th>' + d.prevYear + '</th><th>Change</th></tr>' +
      d.months.map(function (m) { return '<tr><td>' + m.label + (m.partial ? ' (to date)' : '') + '</td><td>' + (m.future ? '' : NBA.money(m.cur, cur)) + '</td><td>' + NBA.money(m.partial ? m.prevToDate : m.prev, cur) + '</td><td>' + (m.future ? '' : signed(m.cur - (m.partial ? m.prevToDate : m.prev), cur)) + '</td></tr>'; }).join('') + '</table></div></div>';

    var maxInc = Math.max.apply(null, d.people.map(function (p) { return Math.abs(p.inc); })) || 1;
    if (!sp) h += '<div class="panel"><h3>Incremental revenue by salesperson</h3><p class="small">' + d.year + ' to date against the same period in ' + d.prevYear + '.</p>' +
      d.people.map(function (p) {
        var w = Math.max(1.5, Math.abs(p.inc) / maxInc * 50), up = p.inc >= 0;
        return '<div class="person"><div class="row"><span>' + esc(p.name) + '</span><span class="delta ' + (up ? 'up' : 'down') + '">' + (up ? '▲ ' : '▼ ') + signed(p.inc, cur) + '</span></div>' +
          '<div class="track"><span style="' + (up ? 'left:50%' : 'right:50%') + ';width:' + w + '%;background:var(--' + (up ? 'this-year' : 'loss') + ')"></span></div>' +
          '<div class="small">' + NBA.money(p.cur, cur) + ' this year, ' + NBA.money(p.prev, cur) + ' last year</div></div>';
      }).join('') + '</div>';

    h += '<div class="panel"><h3>Deals closed in the app</h3>';
    if (!d.deals.length) h += '<p class="small">When a salesperson taps “Deal closed”, the deal shows up here and in the totals above straight away.</p>';
    else h += '<p class="small">Each deal is added to the totals above. “Customer vs last year” is that customer\'s revenue this year against the same period last year, including the deal.</p>' + d.deals.map(function (x) {
      return '<div class="deal"><div><b>' + esc(x.cname) + '</b><span class="small">' + NBA.niceDate(x.date) + ', ' + esc(x.sp) + (x.confirmed ? ', confirmed by uploaded sales file' : '') + '</span></div>' +
        '<div style="text-align:right"><b>' + NBA.money(x.amt, cur) + '</b><span class="small">Customer vs last year ' + signed(x.custInc, cur) + '</span></div></div>';
    }).join('');
    h += '</div>';
    if (d.stale) h += '<p class="small" style="margin-top:12px">The newest sale in the uploaded data is ' + NBA.niceDate(d.dataTo) + '. Upload a newer sales file to bring this up to date.</p>';
    el.innerHTML = h;

    var chart = el.querySelector('#mchart'), tip;
    function show(i, evt) {
      var m = d.months[i]; if (!tip) { tip = document.createElement('div'); tip.className = 'tip'; chart.appendChild(tip); }
      tip.innerHTML = '<b>' + m.label + (m.partial ? ' to date' : '') + '</b><br>' + d.year + ': ' + (m.future ? 'not yet' : NBA.money(m.cur, cur)) + '<br>' + d.prevYear + ': ' + NBA.money(m.partial ? m.prevToDate : m.prev, cur);
      var r = chart.getBoundingClientRect(), x = Math.min(r.width - 70, Math.max(70, evt.clientX - r.left));
      tip.style.left = x + 'px'; tip.style.top = Math.max(50, evt.clientY - r.top - 12) + 'px'; tip.hidden = false;
    }
    chart.addEventListener('pointermove', function (e) { var t = e.target.closest('.hit'); if (t) show(+t.dataset.i, e); });
    chart.addEventListener('pointerdown', function (e) { var t = e.target.closest('.hit'); if (t) show(+t.dataset.i, e); });
    chart.addEventListener('pointerleave', function () { if (tip) tip.hidden = true; });
    el.querySelector('#tbl-toggle').addEventListener('click', function () {
      var t = el.querySelector('#mtable'); t.hidden = !t.hidden; this.textContent = t.hidden ? 'Show as table' : 'Hide table';
    });
  }
  root.NBADash = { render: render };
})(window);
