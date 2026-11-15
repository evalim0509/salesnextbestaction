# Sunrise Corner Shop

- Customer ID: C110
- Salesperson: Aisha Rahman
- Segment: Retail
- Status on 15 Nov 2026: **Good chance**
- File generated on this device by fixed rules. No AI language model was used.

## Performance

| Measure | Value |
|---|---|
| Customer since | 28 Sep 2026 |
| Number of orders | 4 |
| Last order | 6 Nov 2026 (9 days ago) |
| Usual time between orders | 12 days |
| Usual order size | $870 |
| Revenue, last 12 months | $3,480 |
| Revenue, 12 months before | $0 |
| Revenue, last 90 days | $3,480 |
| Revenue, previous 90 days | $0 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $3,480 | 6 Nov 2026 |

## Today's assessment

- Their next order is coming up soon (they usually order about every 12 days; last order 9 days ago).
- Most similar Retail customers buy Consumables, but they never have.
- Your documents say the Year-end Retail campaign applies to them and they have not used it (sample_account_plans.docx).

### Visit priority: 20 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +20 | They are one of your smaller customers ($3,480 in the last 12 months). | 0.6 × max(churn 0, close 32) + 0.1 × min(…) 0 + 0.3 × value percentile 3 (12-month revenue $3,480 ranked among your 36 customers) = 20.1 | Sales data |

### Chance to close a deal: 32 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +12 | Their next order is coming up soon (they usually order about every 12 days; last order 9 days ago). | recency 9d ÷ 12d = 0.75 in [0.6, 0.8) → +12 close | Sales data |
| +10 | Most similar Retail customers buy Consumables, but they never have. | Consumables bought by 12 of 15 Retail customers in the last 12 months (≥ 50%), 0 purchases by this customer → +10 close | Sales data |
| +10 | Your documents say the Year-end Retail campaign applies to them and they have not used it (sample_account_plans.docx). | document signals: campaign +10 = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 0 / 100

No factors applied.

## Suggested pitch

Go in ready to take an order today.

- The Year-end Retail campaign applies to them and they have not used it yet. On a $870 order of Consumables they save about $79 (buy 10 get 1 free, worth about 9%). Valid until 31 Dec 2026. _(sample_account_plans.docx)_
- They normally reorder Core Products about every 12 days and the last order was 9 days ago. Ask for the reorder (usual size about $870). _(Sales data)_
- Customers like them usually buy Consumables too. Introduce it as something similar Retail customers find useful. _(Sales data)_

**Ask:** Ask for the Core Products reorder and a first trial of Consumables.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Year-end Retail campaign | Not used yet, valid until 31 Dec 2026 | $79 on $870 | saving = 9.1% × $870 (their average order size; they have not bought this category); unused = no purchase of Consumables in the last 30 days; terms read from document text | sample_account_plans.docx |

## Visit notes

No notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_account_plans.docx** › Year-end Retail campaign: Campaign for all Retail customers: buy 10 cases of Consumables and get 1 case free, valid until 31 December. Salespeople can offer this promotion on the spot without approval. _[campaign]_
