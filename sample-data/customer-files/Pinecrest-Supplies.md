# Pinecrest Supplies

- Customer ID: C106
- Salesperson: Aisha Rahman
- Segment: Retail
- Status on 15 Nov 2026: **Likely to close**
- File generated on this device by fixed rules. No AI language model was used.
- Version: rules 1.9 (2026-11-17); data sample_transactions.xlsx, 2024-11-01 to 2026-11-14

## Performance

| Measure | Value |
|---|---|
| Customer since | 9 Nov 2024 |
| Number of orders | 26 |
| Last order | 13 Oct 2026 (33 days ago) |
| Usual time between orders | 28 days |
| Usual order size | $1,243 |
| Revenue, last 12 months | $14,685 |
| Revenue, 12 months before | $15,885 (-8%) |
| Revenue, last 90 days | $3,635 |
| Revenue, previous 90 days | $4,485 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $10,080 | 13 Oct 2026 |
| Accessories | $4,605 | 13 Oct 2026 |

## Today's assessment

- Usually orders every 28 days, now 33: reorder due.
- Similar Retail customers buy Consumables; they never have.
- Your documents: unused offer (sample_account_plans.docx).

### Visit priority: 36 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +36 | One of your smaller customers ($14,685 a year). | 0.6 × max(churn 8, close 50) + 0.1 × min(…) 8 + 0.3 × value percentile 17 (12-month revenue $14,685 ranked among your 36 customers) = 35.9 | Sales data |

### Chance to close a deal: 50 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +30 | Usually orders every 28 days, now 33: reorder due. | recency 33d ÷ median gap between orders, 7 gaps across a festive period left out 28d = 1.20 in [0.8, 1.5) → +30 close | Sales data |
| +10 | Similar Retail customers buy Consumables; they never have. | Consumables bought by 12 of 15 Retail customers in the last 12 months (≥ 50%), 0 purchases by this customer → +10 close | Sales data |
| +10 | Your documents: unused offer (sample_account_plans.docx). | document signals: campaign +10 (Year-end Retail campaign not used) = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 8 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +8 | Spending down 19% on the 3 months before. | revenue last 90d $3,635 vs previous 90d $4,485 = -19% ≤ -10% → +8 churn | Sales data |

## Suggested pitch

Go in ready to take an order today.

- The Year-end Retail campaign applies to them and they have not used it yet. On a $1,243 order of Consumables they save about $113 (buy 10 get 1 free, worth about 9%). Valid until Thu 31 Dec. _(sample_account_plans.docx)_
- They normally reorder Core Products about every 28 days and the last order was 33 days ago. Ask for the reorder (usual size about $1,243). _(Sales data)_
- Customers like them usually buy Consumables too. Introduce it as something similar Retail customers find useful. _(Sales data)_

**Ask:** Ask for the Core Products reorder and a first trial of Consumables.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Year-end Retail campaign | Not used yet, valid until 31 Dec 2026 | $113 on $1,243 | saving = 9.1% × $1,243 (their average order size; they have not bought this category); unused = no purchase of Consumables in the last 30 days; terms read from document text | sample_account_plans.docx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_account_plans.docx** › Year-end Retail campaign: Campaign for all Retail customers: buy 10 cases of Consumables and get 1 case free, valid until 31 December. Salespeople can offer this promotion on the spot without approval. _[campaign]_
