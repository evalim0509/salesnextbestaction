// Run: node tests/engine.test.js
const fs = require('fs'), path = require('path'), assert = require('assert');
const NBA = require('../js/engine.js'), P = require('../js/parsers.js');
const S = f => fs.readFileSync(path.join(__dirname, '..', 'sample-data', f));
const ab = b => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);

(async () => {
  const x = await P.parseFile('sample_transactions.xlsx', ab(S('sample_transactions.xlsx')));
  assert.strictEqual(x.kind, 'tx'); assert(x.tx.length > 2000);
  const d = await P.parseFile('sample_account_plans.docx', ab(S('sample_account_plans.docx')));
  const p = await P.parseFile('sample_campaign_deck.pptx', ab(S('sample_campaign_deck.pptx')));
  assert.strictEqual(d.kind, 'doc'); assert.strictEqual(p.kind, 'doc'); assert(p.doc.paras.length >= 6);

  assert.strictEqual(x.targets.length, 36); assert.strictEqual(x.campaigns.length, 3);
  const state = { tx: x.tx, docs: [d.doc, p.doc], notes: [], deals: [], targets: x.targets, campaigns: x.campaigns, settings: { currency: '$' } };

  { // PHASE 1: upload health check
    const st = x.stats; assert.strictEqual(st.lines, 2219); assert.strictEqual(st.negatives, 8); assert(st.negAmt < 0); assert.strictEqual(st.noSp, 3); assert.strictEqual(st.unreadable, 0);
    assert(x.tx.every(t => t.sp && t.sp !== 'Unassigned'), 'blank salesperson filled from the customer');
    assert.strictEqual(x.dateCheck.kind, 'none', 'real Excel dates need no question');
    // date format: proven, ambiguous, and both readings
    assert.strictEqual(NBA.detectDateOrder(['13/04/2026', '03/04/2026']).order, 'dmy');
    assert.strictEqual(NBA.detectDateOrder(['04/13/2026', '03/04/2026']).order, 'mdy');
    const amb = NBA.detectDateOrder(['03/04/2026', '05/06/2026']); assert.strictEqual(amb.kind, 'ambiguous'); assert.strictEqual(amb.sample, '03/04/2026');
    assert.strictEqual(NBA.parseDate('03/04/2026', 'dmy'), '2026-04-03'); assert.strictEqual(NBA.parseDate('03/04/2026', 'mdy'), '2026-03-04');
    const csvRows = [{ Date: '03/04/2026', Customer: 'A', Amount: 10 }, { Date: '05/06/2026', Customer: 'B', Amount: 5 }];
    const r1 = NBA.normalizeRows(csvRows), r2 = NBA.normalizeRows(csvRows, { dateOrder: 'mdy' });
    assert.strictEqual(r1.dateCheck.kind, 'ambiguous'); assert.strictEqual(r1.tx[0].d, '2026-04-03'); assert.strictEqual(r2.tx[0].d, '2026-03-04');
    // future dates counted; hard stop above 20% unreadable
    const fut = NBA.normalizeRows([{ Date: '2027-01-02', Customer: 'A', Amount: 1 }, { Date: '2026-01-02', Customer: 'A', Amount: 1 }], { today: '2026-11-15' }); assert.strictEqual(fut.stats.future, 1);
    const bad = NBA.normalizeRows([1, 2, 3, 4, 5].map(i => ({ Date: i < 3 ? 'soon' : '2026-01-0' + i, Customer: 'A', Amount: 1 })));
    assert(bad.hardStop && /20%/.test(bad.reason));
    // name variants and merge
    const v = NBA.nameVariants(state.tx, {}); assert.strictEqual(v.length, 1);
    assert.deepStrictEqual(v[0].members.map(m => m.name), ['Lakeside Mart', 'Lakeside Mart Sdn Bhd']);
    assert.strictEqual(NBA.nameVariants(state.tx, { [[v[0].members[0].cid, v[0].members[1].cid].sort().join('|')]: 1 }).length, 0, 'keep apart is remembered');
    assert.strictEqual(NBA.analyze(state, 'Aisha Rahman', { today: '2026-11-15' }).customers.length, 13);
    NBA.mergeCustomers(state, v[0].members.map(m => m.cid), v[0].keep);
    assert.strictEqual(NBA.nameVariants(state.tx, {}).length, 0); assert.strictEqual(state.aliases.C104B, 'C104');
    const later = NBA.applyAliases([{ cid: 'C104B', cname: 'Lakeside Mart Sdn Bhd' }], state); assert.strictEqual(later[0].cid, 'C104'); assert.strictEqual(later[0].cname, 'Lakeside Mart');
  }
  { // PHASE 1: evidence, confidence, the few-orders rule, rules page, version stamp, same answer twice
    const a = NBA.analyze(state, 'Aisha Rahman', { today: '2026-11-15' }), bh = a.customers.find(c => c.name === 'Blue Harbor Stores');
    const od = bh.factors.find(f => f.label === 'Overdue'); assert.strictEqual(od.ev, 'orders');
    const ev = NBA.evidence(bh, 'orders')[0]; assert(ev.rows.length === 20 && ev.n > 20); assert(ev.rows[0].d >= ev.rows[19].d, 'newest first');
    const tr = NBA.evidence(bh, 'trend'); assert.strictEqual(tr.length, 2); assert.strictEqual(Math.round(tr[0].total), Math.round(bh.rev90)); assert.strictEqual(Math.round(tr[1].total), Math.round(bh.revPrev90));
    assert(bh.factors.filter(f => f.src === 'Sales data' && f.bucket !== 'priority').every(f => f.ev), 'every sales-data factor links to its orders');
    // fewer than 2 orders: not in today's visits unless a note or document makes them a priority
    const one = { tx: [...state.tx, { d: '2026-11-10', cid: 'NEW1', cname: 'Brand New Shop', sp: 'Aisha Rahman', amt: 90000, qty: 1, cat: 'Core Products', prod: '', seg: 'Retail', inv: 'X1', src: 'upload' }], docs: state.docs, notes: [], deals: [], settings: state.settings };
    const a1 = NBA.analyze(one, 'Aisha Rahman', { today: '2026-11-15' }), nw = a1.customers.find(c => c.cid === 'NEW1');
    assert(!nw.eligible && nw.rough); assert(!NBA.lists(a1).top3.some(c => c.cid === 'NEW1'));
    one.notes = [{ id: 'n', cid: 'NEW1', ts: '2026-11-14T09:00:00', keywords: ['quote'], cats: [] }];
    const a2 = NBA.analyze(one, 'Aisha Rahman', { today: '2026-11-15' }); assert(a2.customers.find(c => c.cid === 'NEW1').eligible);
    // rules page follows RULES and approved tuning
    const doc = NBA.rulesDoc(state); assert(doc.length >= 5 && doc.every(s => s.rows.length));
    assert(JSON.stringify(doc).includes('+30')); assert(JSON.stringify(NBA.rulesDoc(Object.assign({}, state, { tuning: { 'Due to reorder': { delta: 5, date: '2026-11-16' } } }))).includes('35 (30 +5, approved 2026-11-16)'));
    state.uploads = [{ name: 'sample_transactions.xlsx', lines: 2219 }];
    assert(/^rules 1\.6 \(2026-11-17\); data sample_transactions\.xlsx, 20\d\d-\d\d-\d\d to 2026-11-14$/.test(NBA.stamp(state)), NBA.stamp(state));
    assert(/credit holds/.test(NBA.blindSpots(state)));
    // same file, same answer
    const run = () => { const z = NBA.analyze(state, 'Aisha Rahman', { today: '2026-11-15' }); return JSON.stringify([NBA.lists(z).top3.map(c => c.cid), NBA.execSummary(state, 'Aisha Rahman', z, { today: '2026-11-15' }), z.customers.map(c => [c.cid, c.priority, c.close, c.churn, c.factors, NBA.buildPitch(c, z)])]); };
    assert.strictEqual(run(), run(), 'same state, same brief');
  }
  { // targets, gap and campaigns
    const a = NBA.analyze(state, 'Aisha Rahman', { today: '2026-11-15' }), ts = NBA.targetStatus(state, 'Aisha Rahman', { today: '2026-11-15' });
    assert(ts.hasTarget && ts.gap > 0 && ts.mood === 'behind', JSON.stringify(ts));
    const g = NBA.closeGap(a, ts.gap); assert(g.picks.length >= 1 && g.picks.length <= 5);
    const ex = NBA.execSummary(state, 'Aisha Rahman', a, { today: '2026-11-15' }); assert(ex.points.some(q => q.kind === 'gap' && /Approach/.test(q.text)));
    const bh = a.customers.find(c => c.name === 'Blue Harbor Stores'); assert(bh.offer && bh.offer.name === 'Year-end Retail campaign' && bh.offer.saving > 0);
    assert(NBA.buildPitch(bh, a).points.some(q => /have not used it yet/.test(q.text) && /save about \$/.test(q.text)));
    assert(/Campaigns that apply/.test(NBA.customerMarkdown(bh, a)));
    // text-only campaigns still give numbers when there is no Campaigns sheet
    const a2 = NBA.analyze(Object.assign({}, state, { campaigns: [] }), 'Aisha Rahman', { today: '2026-11-15' }), b2 = a2.customers.find(c => c.name === 'Blue Harbor Stores');
    assert(b2.offer && b2.offer.fromText && /buy 10 get 1 free/.test(b2.offer.mech), JSON.stringify(b2.campaigns));
    console.log(ts, '\n', ex.points.filter(q => q.kind === 'target' || q.kind === 'gap'), '\n', NBA.campaignLine(bh.offer, '$'), '\n', NBA.campaignLine(b2.offer, '$'));
    const exp = NBA.expiring(a); assert(exp.length === 1 && exp[0].name === 'Wholesale bundle rebate' && exp[0].daysLeft === 5 && exp[0].customers.length >= 1, JSON.stringify(exp));
    assert(ex.points.some(q => q.kind === 'expiry')); assert(ex.points.every(q => q.tech), 'every point has a trail'); assert(ex.headlineTech);
    const ri = NBA.accountReview(bh, a, 'internal'), rc = NBA.accountReview(bh, a, 'customer');
    assert(/May churn/.test(ri.subtitle) && ri.audit.length); const flat = JSON.stringify(rc); assert(!/churn|score|risk|Internal/i.test(flat), 'customer version has nothing sensitive'); assert(/save about/.test(flat));
    assert(NBA.buildPitch(bh, a).points.every(q => q.tech));
  }
  const today = '2026-11-15';
  assert.deepStrictEqual(NBA.salespeople(state), ['Aisha Rahman', 'Ben Carter', 'Chloe Tan']);

  for (const sp of NBA.salespeople(state)) {
    const an = NBA.analyze(state, sp, { today }), L = NBA.lists(an);
    assert.strictEqual(an.customers.length, 12);
    assert(an.customers.every(c => c.sp === sp), 'only own customers');
    assert.strictEqual(L.top3.length, 3);
    L.top3.forEach(c => { assert(NBA.topReasons(c, 3).length >= 1); c.factors.forEach(f => assert(f.plain && f.tech)); });
    console.log('\n' + sp); 
    an.customers.forEach(c => console.log('  ', String(c.priority).padStart(3), 'close', String(c.close).padStart(3), 'churn', String(c.churn).padStart(3), c.tag.padEnd(16), c.name));
    assert(L.churn.length >= 1, 'has churn list'); assert(L.close.length >= 1, 'has close list');
  }

  // executive summary and per-salesperson dashboard
  { const a = NBA.analyze(state, 'Aisha Rahman', { today }), ex = NBA.execSummary(state, 'Aisha Rahman', a, { today });
    assert(/behind|ahead/.test(ex.headline)); assert(ex.points.some(x => x.kind === 'risk' && /Blue Harbor/.test(x.text))); assert(ex.offers.length >= 1);
    const all = NBA.dashboard(state, { today }), one = NBA.dashboard(state, { today, sp: 'Aisha Rahman' });
    assert(one.ytd.cur < all.ytd.cur && one.people.length === 1); console.log(ex); }
  // 'staying' judgement, labels, sparkline data, weekly digest
  { const a = NBA.analyze(state, 'Aisha Rahman', { today }), bh = a.customers.find(c => c.name === 'Blue Harbor Stores');
    assert.deepStrictEqual(NBA.extractKeywords("they won't churn anymore", []).keywords, ['staying']);
    assert.deepStrictEqual(NBA.extractKeywords('customer is staying with us and happy', []).keywords.sort(), ['happy', 'staying']);
    const st = Object.assign({}, state, { notes: [{ id: 's', cid: bh.cid, ts: today + 'T09:00:00', keywords: ['staying'], cats: [], transcript: "won't churn anymore" }] });
    const b2 = NBA.analyze(st, 'Aisha Rahman', { today }).customers.find(c => c.cid === bh.cid);
    assert.strictEqual(b2.churn, bh.churn - 30); assert(b2.factors.some(f => f.label === 'Your judgement' && f.pts === -30));
    const old = Object.assign({}, state, { notes: [{ id: 's', cid: bh.cid, ts: NBA.addDays(today, -31) + 'T09:00:00', keywords: ['staying'], cats: [] }] });
    assert.strictEqual(NBA.analyze(old, 'Aisha Rahman', { today }).customers.find(c => c.cid === bh.cid).churn, bh.churn, 'fades after 30 days');
    assert(bh.factors.every(f => f.label && f.label !== 'Other'), JSON.stringify(bh.factors.map(f => f.label)));
    assert(a.customers.every(c => NBA.buildPitch(c, a).points.every(q => q.title && q.title !== 'Talking point')));
    assert.strictEqual(bh.months12.length, 12); assert.strictEqual(bh.months12[11].key, '2026-11');
    const w = NBA.weeklyDigest(state, null, { today }); assert.strictEqual(w.tiles.length, 4); assert(w.sections.length === 4 && w.audit.length); console.log(w.tiles, w.sections[1]); }
  // context notes, tone, learning from outcomes and tuning
  { const a = NBA.analyze(state, 'Aisha Rahman', { today }), bh = a.customers.find(c => c.name === 'Blue Harbor Stores');
    const st = Object.assign({}, state, { notes: [{ id: 'c1', cid: bh.cid, ts: today + 'T09:00:00', type: 'context', keywords: [], cats: [], transcript: 'Owner is unhappy about a competitor but his daughter takes over in January and prefers us.' }] });
    const a2 = NBA.analyze(st, 'Aisha Rahman', { today }), b2 = a2.customers.find(c => c.cid === bh.cid);
    assert.strictEqual(b2.churn, bh.churn); assert.strictEqual(b2.close, bh.close); assert.strictEqual(b2.priority, bh.priority, 'context is not a visit'); assert.strictEqual(b2.context.length, 1); assert.strictEqual(b2.notes.length, 0);
    assert(NBA.buildPitch(b2, a2).remember.text.includes('daughter')); assert(/What you know/.test(NBA.customerMarkdown(b2, a2)));
    assert(JSON.stringify(NBA.accountReview(b2, a2, 'internal')).includes('daughter')); assert(!JSON.stringify(NBA.accountReview(b2, a2, 'customer')).includes('daughter'));
    assert.strictEqual(NBA.tone(['quote', 'happy']), 'pos'); assert.strictEqual(NBA.tone(['competitor', 'price']), 'neg'); assert.strictEqual(NBA.tone(['staying']), 'pos'); assert.strictEqual(NBA.tone([]), '');
    const L = NBA.learning(state, null, { today }); assert(L.weeks >= 8 && L.samples > 200); assert(L.close.rate > L.base, 'ready-to-buy flags beat the baseline'); assert(L.factors.length >= 3);
    console.log('LEARNING base', L.base.toFixed(2), 'close', L.close, 'risk', L.risk, L.factors.map(f => [f.label, f.n, f.rate.toFixed(2), f.lift.toFixed(2), f.pts, f.step]));
    const up = L.factors.find(f => f.step > 0); assert(up, 'at least one proposal');
    const tuned = Object.assign({}, state, { tuning: { [up.label]: { delta: up.step, date: today } } });
    const before = NBA.analyze(state, null, { today }).customers.flatMap(c => c.factors).find(f => f.label === up.label && f.bucket === 'close');
    const after = NBA.analyze(tuned, null, { today }).customers.flatMap(c => c.factors).find(f => f.label === up.label && f.bucket === 'close');
    assert.strictEqual(after.pts, before.pts + up.step); assert(/tuned \+5/.test(after.tech));
    const plans = { ['Aisha Rahman|' + NBA.addDays(today, -20)]: [bh.cid] }; assert.strictEqual(NBA.learning(Object.assign({}, state, { plans }), null, { today }).live.n, 1); }
  // visit plan, wrap-up and manager brief
  { const a = NBA.analyze(state, 'Aisha Rahman', { today }), plan = NBA.lists(a).top3.map(c => c.cid);
    const st = Object.assign({}, state, { plans: { ['Aisha Rahman|' + today]: plan }, visits: [{ cid: plan[0], sp: 'Aisha Rahman', date: today, status: 'done' }, { cid: plan[1], sp: 'Aisha Rahman', date: today, status: 'skipped', reason: 'Ran out of time' }] });
    const vs = NBA.visitStats(st, today); assert.deepStrictEqual(vs.today, { planned: 3, done: 1, skipped: 1 });
    const w = NBA.wrapUp(st, 'Aisha Rahman', a, plan); assert.strictEqual(w.visited.length, 1); assert.strictEqual(w.open.length, 1); assert.strictEqual(w.missingNotes.length, 1); assert.strictEqual(w.skipped[0].reason, 'Ran out of time');
    const m = NBA.managerSummary(st, null, { today }); assert(/The team is at/.test(m.headline)); assert(m.points.some(x => x.kind === 'people' && /Aisha Rahman is furthest behind/.test(x.text))); assert(m.points.some(x => x.kind === 'visits' && /1 of 3/.test(x.text)));
    assert(/^Chloe is at/.test(NBA.managerSummary(st, 'Chloe Tan', { today }).headline));
    const tomorrow = NBA.analyze(state, 'Aisha Rahman', { today, asOf: NBA.addDays(today, 1) }); assert.strictEqual(tomorrow.asOf, '2026-11-16'); console.log(m); }
  // documents link to the right customer
  let an = NBA.analyze(state, 'Aisha Rahman', { today });
  const bh = an.customers.find(c => c.name === 'Blue Harbor Stores');
  assert(bh.docs.length >= 3); assert(bh.factors.some(f => f.src === 'Documents'));
  assert.strictEqual(bh.tag, 'May churn');

  // notes change scores and the pitch
  const before = an.customers.find(c => c.name === 'Lakeside Mart');
  state.notes.push({ id: 'n1', cid: before.cid, ts: '2026-11-10T09:00:00', keywords: ['quote', 'budget_ok', 'price'], cats: ['Premium Range'], transcript: '' });
  an = NBA.analyze(state, 'Aisha Rahman', { today });
  const after = an.customers.find(c => c.name === 'Lakeside Mart');
  assert(after.close >= before.close + 40, 'notes raise close score');
  const pitch = NBA.buildPitch(after, an);
  assert(pitch.points.some(x => /quote/.test(x.text))); assert.strictEqual(pitch.ask, 'Ask for the order today.');
  const md = NBA.customerMarkdown(after, an);
  assert(/# Lakeside Mart/.test(md) && /Technical trace/.test(md) && /Asked for a quote/.test(md));

  // voice keywords
  const k = NBA.extractKeywords('They are not interested in premium range, a competitor offered cheaper price and delivery was late', an.categories);
  assert.deepStrictEqual(k.keywords.sort(), ['competitor', 'delivery', 'not_interested', 'price']);
  assert.deepStrictEqual(k.cats, ['Premium Range']);
  assert(NBA.extractKeywords('very happy, asked for a quote, budget approved', []).keywords.includes('budget_ok'));

  // dashboard + closed deal
  const d0 = NBA.dashboard(state, { today });
  state.deals.push({ id: 'd1', cid: after.cid, cname: after.name, sp: after.sp, seg: after.seg, date: today, ts: today + 'T10:00:00', amt: 5000, cat: 'Core Products' });
  const d1 = NBA.dashboard(state, { today });
  assert.strictEqual(Math.round(d1.ytd.inc - d0.ytd.inc), 5000);
  assert.strictEqual(Math.round(d1.month.cur - d0.month.cur), 5000);
  // visited today -> drops out of the top
  an = NBA.analyze(state, 'Aisha Rahman', { today });
  assert(an.customers.find(c => c.name === 'Lakeside Mart').factors.some(f => f.pts === -40));
  // upload confirming the deal removes the double count
  const up = [{ d: today, cid: after.cid, cname: after.name, sp: after.sp, amt: 5000, qty: 1, cat: 'Core Products', prod: '', seg: after.seg, inv: 'INV-X', src: 'upload' }];
  state.tx = NBA.mergeTx(state.tx, up).tx; NBA.confirmDeals(state, up);
  assert.strictEqual(Math.round(NBA.dashboard(state, { today }).ytd.cur - d1.ytd.cur), 0);
  // duplicate upload adds nothing
  assert.strictEqual(NBA.mergeTx(state.tx, x.tx).added, 0);
  // dates
  assert.strictEqual(NBA.parseDate('14/11/2026'), '2026-11-14'); assert.strictEqual(NBA.parseDate(46340), '2026-11-14'); assert.strictEqual(NBA.parseDate('14 Nov 2026'), '2026-11-14');
  // stale data: brief runs as of the day after the last sale
  assert.strictEqual(NBA.asOfDate({ tx: x.tx }, '2027-03-01').asOf, '2026-11-15');
  console.log('\nYTD', d0.ytd, '\nAll tests passed');
})().catch(e => { console.error(e); process.exit(1); });
