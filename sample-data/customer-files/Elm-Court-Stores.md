# Elm Court Stores

- Customer ID: C136
- Salesperson: Chloe Tan
- Segment: Retail
- Status on 15 Nov 2026: **Likely to close**
- File generated on this device by fixed rules. No AI language model was used.
- Version: rules 1.7 (2026-11-17); data sample_transactions.xlsx, 2024-11-01 to 2026-11-14

## Performance

| Measure | Value |
|---|---|
| Customer since | 11 Nov 2024 |
| Number of orders | 35 |
| Last order | 31 Oct 2026 (15 days ago) |
| Usual time between orders | 22 days |
| Usual order size | $1,296 |
| Revenue, last 12 months | $24,120 |
| Revenue, 12 months before | $19,725 (+22%) |
| Revenue, last 90 days | $6,615 |
| Revenue, previous 90 days | $4,940 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $17,820 | 31 Oct 2026 |
| Accessories | $6,300 | 31 Oct 2026 |

## Today's assessment

- Spending up 34% on the 3 months before.
- Usually orders every 22 days, now 15: order coming up.
- Similar Retail customers buy Consumables; they never have.

### Visit priority: 38 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +38 | One of your smaller customers ($24,120 a year). | 0.6 × max(churn 0, close 52) + 0.1 × min(…) 0 + 0.3 × value percentile 22 (12-month revenue $24,120 ranked among your 36 customers) = 37.8 | Sales data |

### Chance to close a deal: 52 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +12 | Usually orders every 22 days, now 15: order coming up. | recency 15d ÷ 22d = 0.68 in [0.6, 0.8) → +12 close | Sales data |
| +20 | Spending up 34% on the 3 months before. | revenue last 90d $6,615 vs previous 90d $4,940 = +34% ≥ +25% → +20 close | Sales data |
| +10 | Similar Retail customers buy Consumables; they never have. | Consumables bought by 12 of 15 Retail customers in the last 12 months (≥ 50%), 0 purchases by this customer → +10 close | Sales data |
| +10 | Your documents: unused offer (sample_account_plans.docx). | document signals: campaign +10 (Year-end Retail campaign not used) = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 0 / 100

No factors applied.

## Suggested pitch

Go in ready to take an order today.

- The Year-end Retail campaign applies to them and they have not used it yet. On a $1,296 order of Consumables they save about $118 (buy 10 get 1 free, worth about 9%). Valid until Thu 31 Dec. _(sample_account_plans.docx)_
- They normally reorder Core Products about every 22 days and the last order was 15 days ago. Ask for the reorder (usual size about $1,296). _(Sales data)_
- Customers like them usually buy Consumables too. Introduce it as something similar Retail customers find useful. _(Sales data)_
- Their spending is up 34% in 3 months. Thank them and suggest a regular standing order. _(Sales data)_

**Ask:** Ask for the Core Products reorder and a first trial of Consumables.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Year-end Retail campaign | Not used yet, valid until 31 Dec 2026 | $118 on $1,296 | saving = 9.1% × $1,296 (their average order size; they have not bought this category); unused = no purchase of Consumables in the last 30 days; terms read from document text | sample_account_plans.docx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_account_plans.docx** › Year-end Retail campaign: Campaign for all Retail customers: buy 10 cases of Consumables and get 1 case free, valid until 31 December. Salespeople can offer this promotion on the spot without approval. _[campaign]_
