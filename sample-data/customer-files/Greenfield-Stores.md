# Greenfield Stores

- Customer ID: C116
- Salesperson: Ben Carter
- Segment: Retail
- Status on 15 Nov 2026: **Watch**
- File generated on this device by fixed rules. No AI language model was used.
- Version: rules 1.7 (2026-11-17); data sample_transactions.xlsx, 2024-11-01 to 2026-11-14

## Performance

| Measure | Value |
|---|---|
| Customer since | 1 Nov 2024 |
| Number of orders | 55 |
| Last order | 11 Nov 2026 (4 days ago) |
| Usual time between orders | 14 days |
| Usual order size | $1,149 |
| Revenue, last 12 months | $27,265 |
| Revenue, 12 months before | $34,580 (-21%) |
| Revenue, last 90 days | $3,480 |
| Revenue, previous 90 days | $7,200 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $22,260 | 11 Nov 2026 |
| Consumables | $5,005 | 2 May 2026 |

## Today's assessment

- Spending down 52% on the 3 months before.
- Your documents flag a risk (sample_account_plans.docx).
- Similar Retail customers buy Accessories; they never have.

### Visit priority: 39 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +39 | A mid-sized customer ($27,265 a year). | 0.6 × max(churn 40, close 20) + 0.1 × min(…) 20 + 0.3 × value percentile 42 (12-month revenue $27,265 ranked among your 36 customers) = 38.6 | Sales data |

### Chance to close a deal: 20 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +10 | Similar Retail customers buy Accessories; they never have. | Accessories bought by 8 of 15 Retail customers in the last 12 months (≥ 50%), 0 purchases by this customer → +10 close | Sales data |
| +10 | Your documents: unused offer (sample_account_plans.docx). | document signals: campaign +10 (Year-end Retail campaign not used) = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 40 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +30 | Spending down 52% on the 3 months before. | revenue last 90d $3,480 vs previous 90d $7,200 = -52% ≤ -50% → +30 churn | Sales data |
| +10 | Your documents flag a risk (sample_account_plans.docx). | document paragraph linked to customer with risk wording: “Greenfield Stores told us a competitor offered free delivery. We should match with the…” → +10 churn | Documents |

## Suggested pitch

Go in to listen first. Ask how things are going with their orders before you talk about products.

- The Year-end Retail campaign applies to them and they have not used it yet. On a $626 order of Consumables they save about $57 (buy 10 get 1 free, worth about 9%). Valid until Thu 31 Dec. _(sample_account_plans.docx)_
- They used to buy Consumables (last time Sat 2 May) and then stopped. Ask why and whether they still need it. _(Sales data)_
- Customers like them usually buy Accessories too. Introduce it as something similar Retail customers find useful. _(Sales data)_
- Their spending is down 52% in 3 months. Ask if they are buying part of their needs elsewhere. _(Sales data)_

**Ask:** Ask for one small order this week to get things moving again.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Year-end Retail campaign | Not used yet, valid until 31 Dec 2026 | $57 on $626 | saving = 9.1% × $626 (their average order in Consumables, last 12 months); unused = no purchase of Consumables in the last 30 days; terms read from document text | sample_account_plans.docx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_account_plans.docx** › Regional sales meeting: Greenfield Stores told us a competitor offered free delivery. We should match with the Consumables promotion. _[campaign, risk]_
- **sample_account_plans.docx** › Year-end Retail campaign: Campaign for all Retail customers: buy 10 cases of Consumables and get 1 case free, valid until 31 December. Salespeople can offer this promotion on the spot without approval. _[campaign]_
