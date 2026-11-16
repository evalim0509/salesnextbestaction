# Lakeside Mart

- Customer ID: C104
- Salesperson: Aisha Rahman
- Segment: Retail
- Status on 15 Nov 2026: **Good chance**
- File generated on this device by fixed rules. No AI language model was used.

## Performance

| Measure | Value |
|---|---|
| Customer since | 3 Nov 2024 |
| Number of orders | 53 |
| Last order | 4 Nov 2026 (11 days ago) |
| Usual time between orders | 14 days |
| Usual order size | $1,303 |
| Revenue, last 12 months | $30,190 |
| Revenue, 12 months before | $37,340 (-19%) |
| Revenue, last 90 days | $7,685 |
| Revenue, previous 90 days | $6,730 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $13,320 | 23 Oct 2026 |
| Consumables | $9,165 | 4 Nov 2026 |
| Accessories | $7,705 | 4 Nov 2026 |

## Today's assessment

- Their next order is coming up soon (they usually order about every 14 days; last order 11 days ago).
- They are buying more: spending is up 14% in the last 3 months.
- Your documents say a campaign or offer applies to them (sample_account_plans.docx).

### Visit priority: 32 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +32 | They are a mid-sized customer for you ($30,190 in the last 12 months). | 0.6 × max(churn 0, close 32) + 0.1 × min(…) 0 + 0.3 × value percentile 44 (12-month revenue $30,190 ranked among your 36 customers) = 32.4 | Sales data |

### Chance to close a deal: 32 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +12 | Their next order is coming up soon (they usually order about every 14 days; last order 11 days ago). | recency 11d ÷ 14d = 0.79 in [0.6, 0.8) → +12 close | Sales data |
| +10 | They are buying more: spending is up 14% in the last 3 months. | revenue last 90d $7,685 vs previous 90d $6,730 = +14% ≥ +10% → +10 close | Sales data |
| +10 | Your documents say a campaign or offer applies to them (sample_account_plans.docx). | document signals: campaign +10 = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 0 / 100

No factors applied.

## Suggested pitch

Go in ready to take an order today.

- They normally reorder Core Products about every 14 days and the last order was 11 days ago. Ask for the reorder (usual size about $1,303). _(Sales data)_
- Their spending is up 14% in 3 months. Thank them and suggest a regular standing order. _(Sales data)_
- Use the current offer: “Campaign for all Retail customers: buy 10 cases of Consumables and get 1 case free, valid until 31 December. Salespeople can offer this promotion on the spot without approval.” _(sample_account_plans.docx)_

**Ask:** Ask for the Core Products reorder.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Year-end Retail campaign | Already used in the last 30 days, valid until 31 Dec 2026 | $60 on $655 | saving = 9.1% × $655 (their average order in Consumables, last 12 months); unused = no purchase of Consumables in the last 30 days; terms read from document text | sample_account_plans.docx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_account_plans.docx** › Year-end Retail campaign: Campaign for all Retail customers: buy 10 cases of Consumables and get 1 case free, valid until 31 December. Salespeople can offer this promotion on the spot without approval. _[campaign]_
