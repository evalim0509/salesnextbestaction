# Silverline Retail

- Customer ID: C130
- Salesperson: Chloe Tan
- Segment: Retail
- Status on 15 Nov 2026: **Watch**
- File generated on this device by fixed rules. No AI language model was used.
- Version: rules 2.0 (2026-11-23); data sample_transactions.xlsx, 2024-11-01 to 2026-11-14

## Performance

| Measure | Value |
|---|---|
| Customer since | 12 Nov 2024 |
| Number of orders | 52 |
| Last order | 14 Nov 2026 (1 days ago) |
| Usual time between orders | 14 days |
| Usual order size | $1,247 |
| Revenue, last 12 months | $26,775 |
| Revenue, 12 months before | $36,710 (-27%) |
| Revenue, last 90 days | $2,950 |
| Revenue, previous 90 days | $7,570 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $14,460 | 14 Nov 2026 |
| Accessories | $7,305 | 14 Nov 2026 |
| Consumables | $5,010 | 12 Apr 2026 |

## Today's assessment

- Spending down 61% on the 3 months before.
- Your documents: unused offer (sample_account_plans.docx).
- A mid-sized customer ($26,775 a year).

### Visit priority: 31 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +31 | A mid-sized customer ($26,775 a year). | 0.6 × max(churn 30, close 10) + 0.1 × min(…) 10 + 0.3 × value percentile 39 (12-month revenue $26,775 ranked among your 36 customers) = 30.7 | Sales data |

### Chance to close a deal: 10 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +10 | Your documents: unused offer (sample_account_plans.docx). | document signals: campaign +10 (Year-end Retail campaign not used) = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 30 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +30 | Spending down 61% on the 3 months before. | revenue last 90d $2,950 vs previous 90d $7,570 = -61% ≤ -50% → +30 churn | Sales data |

## Suggested pitch

Go in to listen first. Ask how things are going with their orders before you talk about products.

- The Year-end Retail campaign applies to them and they have not used it yet. On a $626 order of Consumables they save about $57 (buy 10 get 1 free, worth about 9%). Valid until Thu 31 Dec. _(sample_account_plans.docx)_
- They used to buy Consumables (last time Sun 12 Apr) and then stopped. Ask why and whether they still need it. _(Sales data)_
- Their spending is down 61% in 3 months. Ask if they are buying part of their needs elsewhere. _(Sales data)_

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

- **sample_account_plans.docx** › Year-end Retail campaign: Campaign for all Retail customers: buy 10 cases of Consumables and get 1 case free, valid until 31 December. Salespeople can offer this promotion on the spot without approval. _[campaign]_
