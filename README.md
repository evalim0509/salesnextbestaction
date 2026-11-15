# Nudge

A phone-friendly website that tells each salesperson who to visit today, who is likely to buy, who may leave and what to say. It uses fixed rules, not AI, and all data stays on the phone.

Business requirements: [REQUIREMENTS.md](REQUIREMENTS.md)

## Put it live (one time, no terminal)

1. On GitHub open this repository, then **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to "Deploy from a branch".
3. Choose the branch that holds this code and the folder **/ (root)**, then **Save**.
4. After about a minute the page shows the web address. Open it on a phone. Every later change to the branch updates the site by itself.

## Try it

1. Open the site and tap **Try with sample data**, or tap **Upload my files** and choose the three files in `sample-data/`.
2. Pick a salesperson from the dropdown at the top.
3. Tap **Give me today's brief**, tap a customer, then try **What to say**, **Why this customer**, **Add visit note** and **Deal closed**.
4. Tap the three dots, then **Revenue dashboard**. Tap the orb to go home.

## Sales file format

One row per sale line. Needed columns: **Date**, **Customer Name** (or Customer ID), **Amount**. Helpful extra columns: Salesperson, Segment, Product Category, Product, Quantity, Unit Price, Invoice No. See `sample-data/sample_transactions.xlsx`.

Two optional extra sheets in the same file:

- **Targets**: Salesperson, Month (for example 2026-11), Target.
- **Campaigns**: Campaign, Segment, Category (use + for a bundle), Discount %, Minimum Spend, End Date, Description.

## What is in here

| Path | What it is |
|---|---|
| `index.html`, `css/`, `js/app.js` | The chat screen |
| `js/engine.js` | The scoring rules, pitch builder and customer file writer |
| `js/parsers.js` | Reads Excel, Word and PowerPoint inside the browser |
| `js/dashboard.js` | Management revenue dashboard |
| `vendor/` | SheetJS and JSZip, bundled so the page loads nothing from outside |
| `sample-data/` | Sample sales file, Word account plans, PowerPoint deck and example customer .md files |
| `tools/` | Scripts that rebuild the sample files |
| `tests/engine.test.js` | Checks the rules against the sample data: `node tests/engine.test.js` |
