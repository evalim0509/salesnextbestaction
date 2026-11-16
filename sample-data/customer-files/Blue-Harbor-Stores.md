# Blue Harbor Stores

- Customer ID: C102
- Salesperson: Aisha Rahman
- Segment: Retail
- Status on 15 Nov 2026: **May churn**
- File generated on this device by fixed rules. No AI language model was used.

## Performance

| Measure | Value |
|---|---|
| Customer since | 4 Nov 2024 |
| Number of orders | 51 |
| Last order | 26 Sep 2026 (50 days ago) |
| Usual time between orders | 14 days |
| Usual order size | $1,415 |
| Revenue, last 12 months | $32,510 |
| Revenue, 12 months before | $38,560 (-16%) |
| Revenue, last 90 days | $3,210 |
| Revenue, previous 90 days | $9,105 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $19,860 | 26 Sep 2026 |
| Consumables | $12,650 | 26 Sep 2026 |

## Today's assessment

- They usually order about every 14 days, but it has been 50 days since the last order.
- Their spending is down 65% in the last 3 months compared with the 3 months before.
- Your documents flag a risk on this account (sample_account_plans.docx).

### Visit priority: 77 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +69 | They are a mid-sized customer for you ($32,510 in the last 12 months). | 0.6 × max(churn 85, close 20) + 0.1 × min(…) 20 + 0.3 × value percentile 53 (12-month revenue $32,510 ranked among your 36 customers) = 68.9 | Sales data |
| +8 | Your account plan marks them as a priority account (sample_account_plans.docx). | document paragraph with priority wording: “Blue Harbor Stores is a key account in the Retail segment and a priority for retention…” → +8 priority | Documents |

### Chance to close a deal: 20 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +10 | Most similar Retail customers buy Accessories, but they never have. | Accessories bought by 8 of 15 Retail customers in the last 12 months (≥ 50%), 0 purchases by this customer → +10 close | Sales data |
| +10 | Your documents say the Year-end Retail campaign applies to them and they have not used it (sample_account_plans.docx). | document signals: campaign +10 = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 85 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +45 | They usually order about every 14 days, but it has been 50 days since the last order. | recency 50d ÷ median gap between orders 14d = 3.57 ≥ 3 → +45 churn | Sales data |
| +30 | Their spending is down 65% in the last 3 months compared with the 3 months before. | revenue last 90d $3,210 vs previous 90d $9,105 = -65% ≤ -50% → +30 churn | Sales data |
| +10 | Your documents flag a risk on this account (sample_account_plans.docx). | document paragraph linked to customer with risk wording: “Risk: a competitor opened a depot nearby and has been offering lower prices. We are at…” → +10 churn | Documents |

## Suggested pitch

Go in to listen first. Ask how things are going with their orders before you talk about products.

- The Year-end Retail campaign applies to them and they have not used it yet. On a $633 order of Consumables they save about $58 (buy 10 get 1 free, worth about 9%). Valid until 31 Dec 2026. _(sample_account_plans.docx)_
- They normally order every 14 days and it has been 50. Ask openly: “I noticed we have not had an order for a while. Did something change?” _(Sales data)_
- Customers like them usually buy Accessories too. Introduce it as something similar Retail customers find useful. _(Sales data)_
- From the account plan: “Blue Harbor Stores is a key account in the Retail segment and a priority for retention this quarter.” _(sample_account_plans.docx)_

**Ask:** Ask for one small order this week to get things moving again.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Year-end Retail campaign | Not used yet, valid until 31 Dec 2026 | $58 on $633 | saving = 9.1% × $633 (their average order in Consumables, last 12 months); unused = no purchase of Consumables in the last 30 days; terms read from document text | sample_account_plans.docx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_account_plans.docx** › Blue Harbor Stores: Blue Harbor Stores is a key account in the Retail segment and a priority for retention this quarter. _[priority]_
- **sample_account_plans.docx** › Blue Harbor Stores: Risk: a competitor opened a depot nearby and has been offering lower prices. We are at risk of losing weekly orders. _[risk]_
- **sample_account_plans.docx** › Blue Harbor Stores: Plan: visit every two weeks, offer the Consumables promotion, and review delivery times with the store manager. _[campaign]_
- **sample_account_plans.docx** › Year-end Retail campaign: Campaign for all Retail customers: buy 10 cases of Consumables and get 1 case free, valid until 31 December. Salespeople can offer this promotion on the spot without approval. _[campaign]_
