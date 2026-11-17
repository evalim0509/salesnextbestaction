// Writes one .md per customer for the sample data, the same file the app builds on the phone.
// Run: node tools/make_sample_customer_files.js
const fs = require('fs'), path = require('path');
const NBA = require('../js/engine.js'), P = require('../js/parsers.js');
const dir = path.join(__dirname, '..', 'sample-data'), out = path.join(dir, 'customer-files');
const ab = b => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
(async () => {
  const rs = [];
  for (const f of ['sample_transactions.xlsx', 'sample_account_plans.docx', 'sample_campaign_deck.pptx']) rs.push(await P.parseFile(f, ab(fs.readFileSync(path.join(dir, f)))));
  const state = { tx: rs[0].tx, docs: [rs[1].doc, rs[2].doc], notes: [], deals: [], settings: { currency: '$' } };
  NBA.nameVariants(state.tx, {}).forEach(g => NBA.mergeCustomers(state, g.members.map(m => m.cid), g.keep)); // as if the uploader tapped Merge
  state.uploads = [{ name: 'sample_transactions.xlsx', lines: rs[0].stats.lines }];
  const max = state.tx.reduce((m, t) => (t.d > m ? t.d : m), '');
  const an = NBA.analyze(state, null, { today: NBA.addDays(max, 1) });
  fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
  an.customers.forEach(c => fs.writeFileSync(path.join(out, NBA.fileName(c)), NBA.customerMarkdown(c, an)));
  console.log(an.customers.length, 'customer files written');
})();
