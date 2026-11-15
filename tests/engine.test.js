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

  const state = { tx: x.tx, docs: [d.doc, p.doc], notes: [], deals: [], settings: { currency: '$' } };
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
