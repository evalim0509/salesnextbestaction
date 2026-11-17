# Jade Garden Stores

- Customer ID: C126
- Salesperson: Chloe Tan
- Segment: Retail
- Status on 15 Nov 2026: **Steady**
- File generated on this device by fixed rules. No AI language model was used.
- Version: rules 1.8 (2026-11-17); data sample_transactions.xlsx, 2024-11-01 to 2026-11-14

## Performance

| Measure | Value |
|---|---|
| Customer since | 11 Nov 2024 |
| Number of orders | 55 |
| Last order | 12 Nov 2026 (3 days ago) |
| Usual time between orders | 13 days |
| Usual order size | $1,440 |
| Revenue, last 12 months | $45,845 |
| Revenue, 12 months before | $32,085 (+43%) |
| Revenue, last 90 days | $14,305 |
| Revenue, previous 90 days | $12,090 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $22,500 | 30 Oct 2026 |
| Consumables | $14,280 | 30 Oct 2026 |
| Accessories | $9,065 | 12 Nov 2026 |

## Today's assessment

- Your documents: campaign applies, room to grow (sample_account_plans.docx).
- Spending up 18% on the 3 months before.
- One of your biggest customers ($45,845 a year).

### Visit priority: 40 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +40 | One of your biggest customers ($45,845 a year). | 0.6 × max(churn 0, close 28) + 0.1 × min(…) 0 + 0.3 × value percentile 78 (12-month revenue $45,845 ranked among your 36 customers) = 40.2 | Sales data |

### Chance to close a deal: 28 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +10 | Spending up 18% on the 3 months before. | revenue last 90d $14,305 vs previous 90d $12,090 = +18% ≥ +10% → +10 close | Sales data |
| +18 | Your documents: campaign applies, room to grow (sample_account_plans.docx). | document signals: campaign +10, growth +8 = 18, capped at 20 → +18 close | Documents |

### Risk of losing them: 0 / 100

No factors applied.

## Suggested pitch

A friendly check-in. Thank them for the steady business and look for one new idea to offer.

- Their spending is up 18% in 3 months. Thank them and suggest a regular standing order. _(Sales data)_
- Use the current offer: “Jade Garden Stores is opening a new outlet next month. Opportunity to supply the new store from day one with a starter bundle.” _(sample_account_plans.docx)_
- Use the current offer: “Campaign for all Retail customers: buy 10 cases of Consumables and get 1 case free, valid until 31 December. Salespeople can offer this promotion on the spot without approval.” _(sample_account_plans.docx)_

**Ask:** Agree the date of their next order before you leave.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Year-end Retail campaign | Already used in the last 30 days, valid until 31 Dec 2026 | $65 on $714 | saving = 9.1% × $714 (their average order in Consumables, last 12 months); unused = no purchase of Consumables in the last 30 days; terms read from document text | sample_account_plans.docx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_account_plans.docx** › Jade Garden Stores: Jade Garden Stores is opening a new outlet next month. Opportunity to supply the new store from day one with a starter bundle. _[campaign, growth]_
- **sample_account_plans.docx** › Year-end Retail campaign: Campaign for all Retail customers: buy 10 cases of Consumables and get 1 case free, valid until 31 December. Salespeople can offer this promotion on the spot without approval. _[campaign]_
