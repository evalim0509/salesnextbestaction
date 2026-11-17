# Willow Lane Market

- Customer ID: C128
- Salesperson: Chloe Tan
- Segment: Retail
- Status on 15 Nov 2026: **Likely to close**
- File generated on this device by fixed rules. No AI language model was used.
- Version: rules 1.7 (2026-11-17); data sample_transactions.xlsx, 2024-11-01 to 2026-11-14

## Performance

| Measure | Value |
|---|---|
| Customer since | 24 Nov 2024 |
| Number of orders | 34 |
| Last order | 22 Oct 2026 (24 days ago) |
| Usual time between orders | 21 days |
| Usual order size | $1,532 |
| Revenue, last 12 months | $25,585 |
| Revenue, 12 months before | $26,495 (-3%) |
| Revenue, last 90 days | $5,905 |
| Revenue, previous 90 days | $5,820 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $16,680 | 22 Oct 2026 |
| Consumables | $8,905 | 22 Oct 2026 |

## Today's assessment

- Usually orders every 21 days, now 24: reorder due.
- Similar Retail customers buy Accessories; they never have.
- Your documents: campaign applies (sample_account_plans.docx).

### Visit priority: 39 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +39 | One of your smaller customers ($25,585 a year). | 0.6 × max(churn 0, close 50) + 0.1 × min(…) 0 + 0.3 × value percentile 31 (12-month revenue $25,585 ranked among your 36 customers) = 39.3 | Sales data |

### Chance to close a deal: 50 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +30 | Usually orders every 21 days, now 24: reorder due. | recency 24d ÷ median gap between orders 21d = 1.14 in [0.8, 1.5) → +30 close | Sales data |
| +10 | Similar Retail customers buy Accessories; they never have. | Accessories bought by 8 of 15 Retail customers in the last 12 months (≥ 50%), 0 purchases by this customer → +10 close | Sales data |
| +10 | Your documents: campaign applies (sample_account_plans.docx). | document signals: campaign +10 = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 0 / 100

No factors applied.

## Suggested pitch

Go in ready to take an order today.

- They normally reorder Core Products about every 21 days and the last order was 24 days ago. Ask for the reorder (usual size about $1,532). _(Sales data)_
- Customers like them usually buy Accessories too. Introduce it as something similar Retail customers find useful. _(Sales data)_
- Use the current offer: “Campaign for all Retail customers: buy 10 cases of Consumables and get 1 case free, valid until 31 December. Salespeople can offer this promotion on the spot without approval.” _(sample_account_plans.docx)_

**Ask:** Ask for the Core Products reorder and a first trial of Accessories.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Year-end Retail campaign | Already used in the last 30 days, valid until 31 Dec 2026 | $62 on $685 | saving = 9.1% × $685 (their average order in Consumables, last 12 months); unused = no purchase of Consumables in the last 30 days; terms read from document text | sample_account_plans.docx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_account_plans.docx** › Year-end Retail campaign: Campaign for all Retail customers: buy 10 cases of Consumables and get 1 case free, valid until 31 December. Salespeople can offer this promotion on the spot without approval. _[campaign]_
