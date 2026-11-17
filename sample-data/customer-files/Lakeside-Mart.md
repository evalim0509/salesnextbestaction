# Lakeside Mart

- Customer ID: C104
- Salesperson: Aisha Rahman
- Segment: Retail
- Status on 15 Nov 2026: **Likely to close**
- File generated on this device by fixed rules. No AI language model was used.
- Version: rules 1.9 (2026-11-17); data sample_transactions.xlsx, 2024-11-01 to 2026-11-14

## Performance

| Measure | Value |
|---|---|
| Customer since | 3 Nov 2024 |
| Number of orders | 59 |
| Last order | 4 Nov 2026 (11 days ago) |
| Usual time between orders | 13 days |
| Usual order size | $1,213 |
| Revenue, last 12 months | $32,710 |
| Revenue, 12 months before | $37,340 (-12%) |
| Revenue, last 90 days | $9,785 |
| Revenue, previous 90 days | $7,150 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $13,320 | 23 Oct 2026 |
| Consumables | $11,685 | 4 Nov 2026 |
| Accessories | $7,705 | 4 Nov 2026 |

## Today's assessment

- Usually orders every 13 days, now 11: reorder due.
- Spending up 37% on the 3 months before.
- Your documents: campaign applies (sample_account_plans.docx).

### Visit priority: 53 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +53 | A mid-sized customer ($32,710 a year). | 0.6 × max(churn 0, close 60) + 0.1 × min(…) 0 + 0.3 × value percentile 56 (12-month revenue $32,710 ranked among your 36 customers) = 52.8 | Sales data |

### Chance to close a deal: 60 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +30 | Usually orders every 13 days, now 11: reorder due. | recency 11d ÷ median gap between orders, 10 gaps across a festive period left out 13d = 0.85 in [0.8, 1.5) → +30 close | Sales data |
| +20 | Spending up 37% on the 3 months before. | revenue last 90d $9,785 vs previous 90d $7,150 = +37% ≥ +25% → +20 close | Sales data |
| +10 | Your documents: campaign applies (sample_account_plans.docx). | document signals: campaign +10 = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 0 / 100

No factors applied.

## Suggested pitch

Go in ready to take an order today.

- They normally reorder Core Products about every 13 days and the last order was 11 days ago. Ask for the reorder (usual size about $1,213). _(Sales data)_
- Their spending is up 37% in 3 months. Thank them and suggest a regular standing order. _(Sales data)_
- Use the current offer: “Campaign for all Retail customers: buy 10 cases of Consumables and get 1 case free, valid until 31 December. Salespeople can offer this promotion on the spot without approval.” _(sample_account_plans.docx)_

**Ask:** Ask for the Core Products reorder.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Year-end Retail campaign | Already used in the last 30 days, valid until 31 Dec 2026 | $53 on $584 | saving = 9.1% × $584 (their average order in Consumables, last 12 months); unused = no purchase of Consumables in the last 30 days; terms read from document text | sample_account_plans.docx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_account_plans.docx** › Year-end Retail campaign: Campaign for all Retail customers: buy 10 cases of Consumables and get 1 case free, valid until 31 December. Salespeople can offer this promotion on the spot without approval. _[campaign]_
