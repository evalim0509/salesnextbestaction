# Cedar Park Holdings

- Customer ID: C112
- Salesperson: Aisha Rahman
- Segment: Corporate
- Status on 15 Nov 2026: **Likely to close**
- File generated on this device by fixed rules. No AI language model was used.
- Version: rules 1.6 (2026-11-17); data sample_transactions.xlsx, 2024-11-01 to 2026-11-14

## Performance

| Measure | Value |
|---|---|
| Customer since | 3 Nov 2024 |
| Number of orders | 16 |
| Last order | 28 Sep 2026 (48 days ago) |
| Usual time between orders | 47 days |
| Usual order size | $3,124 |
| Revenue, last 12 months | $24,740 |
| Revenue, 12 months before | $23,300 (+6%) |
| Revenue, last 90 days | $4,110 |
| Revenue, previous 90 days | $7,880 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $12,780 | 28 Sep 2026 |
| Premium Range | $11,960 | 28 Sep 2026 |

## Today's assessment

- They are due to reorder now: they usually order about every 47 days and the last order was 48 days ago.
- Most similar Corporate customers buy Service Plans, but they never have.
- Your documents say the Premium Range launch applies to them and they have not used it (sample_account_plans.docx).

### Visit priority: 40 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +40 | They are one of your smaller customers ($24,740 in the last 12 months). | 0.6 × max(churn 20, close 50) + 0.1 × min(…) 20 + 0.3 × value percentile 28 (12-month revenue $24,740 ranked among your 36 customers) = 40.4 | Sales data |

### Chance to close a deal: 50 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +30 | They are due to reorder now: they usually order about every 47 days and the last order was 48 days ago. | recency 48d ÷ median gap between orders 47d = 1.02 in [0.8, 1.5) → +30 close | Sales data |
| +10 | Most similar Corporate customers buy Service Plans, but they never have. | Service Plans bought by 6 of 9 Corporate customers in the last 12 months (≥ 50%), 0 purchases by this customer → +10 close | Sales data |
| +10 | Your documents say the Premium Range launch applies to them and they have not used it (sample_account_plans.docx). | document signals: campaign +10 = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 20 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +20 | Their spending is down 48% in the last 3 months compared with the 3 months before. | revenue last 90d $4,110 vs previous 90d $7,880 = -48% ≤ -25% → +20 churn | Sales data |

## Suggested pitch

Go in ready to take an order today.

- The Premium Range launch applies to them and they have not used it yet. On a $1,709 order of Premium Range they save about $85 (5% discount, worth about 5%). _(sample_account_plans.docx)_
- They normally reorder Core Products about every 47 days and the last order was 48 days ago. Ask for the reorder (usual size about $3,124). _(Sales data)_
- Customers like them usually buy Service Plans too. Introduce it as something similar Corporate customers find useful. _(Sales data)_
- Their spending is down 48% in 3 months. Ask if they are buying part of their needs elsewhere. _(Sales data)_

**Ask:** Ask for the Core Products reorder and a first trial of Service Plans.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Premium Range launch | Not used yet | $85 on $1,709 | saving = 5% × $1,709 (their average order in Premium Range, last 12 months); unused = no purchase of Premium Range in the last 30 days; terms read from document text | sample_account_plans.docx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_account_plans.docx** › Premium Range launch: The new Premium Range launch offer gives Corporate customers a 5% introductory discount on their first Premium Range order this quarter. _[campaign]_
