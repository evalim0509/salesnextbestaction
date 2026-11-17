# Golden Gate Retail

- Customer ID: C107
- Salesperson: Aisha Rahman
- Segment: Retail
- Status on 15 Nov 2026: **Good chance**
- File generated on this device by fixed rules. No AI language model was used.
- Version: rules 1.7 (2026-11-17); data sample_transactions.xlsx, 2024-11-01 to 2026-11-14

## Performance

| Measure | Value |
|---|---|
| Customer since | 11 Nov 2024 |
| Number of orders | 36 |
| Last order | 14 Nov 2026 (1 days ago) |
| Usual time between orders | 21 days |
| Usual order size | $887 |
| Revenue, last 12 months | $15,565 |
| Revenue, 12 months before | $15,450 (+1%) |
| Revenue, last 90 days | $5,115 |
| Revenue, previous 90 days | $2,945 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Consumables | $8,845 | 14 Nov 2026 |
| Core Products | $4,020 | 6 Jun 2026 |
| Accessories | $2,700 | 14 Nov 2026 |

## Today's assessment

- Spending up 74% on the 3 months before.
- Your documents: campaign applies (sample_account_plans.docx).
- One of your smaller customers ($15,565 a year).

### Visit priority: 24 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +24 | One of your smaller customers ($15,565 a year). | 0.6 × max(churn 0, close 30) + 0.1 × min(…) 0 + 0.3 × value percentile 19 (12-month revenue $15,565 ranked among your 36 customers) = 23.7 | Sales data |

### Chance to close a deal: 30 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +20 | Spending up 74% on the 3 months before. | revenue last 90d $5,115 vs previous 90d $2,945 = +74% ≥ +25% → +20 close | Sales data |
| +10 | Your documents: campaign applies (sample_account_plans.docx). | document signals: campaign +10 = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 0 / 100

No factors applied.

## Suggested pitch

Go in ready to take an order today.

- They used to buy Core Products (last time Sat 6 Jun) and then stopped. Ask why and whether they still need it. _(Sales data)_
- Their spending is up 74% in 3 months. Thank them and suggest a regular standing order. _(Sales data)_
- Use the current offer: “Campaign for all Retail customers: buy 10 cases of Consumables and get 1 case free, valid until 31 December. Salespeople can offer this promotion on the spot without approval.” _(sample_account_plans.docx)_

**Ask:** Ask for the Consumables reorder.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Year-end Retail campaign | Already used in the last 30 days, valid until 31 Dec 2026 | $67 on $737 | saving = 9.1% × $737 (their average order in Consumables, last 12 months); unused = no purchase of Consumables in the last 30 days; terms read from document text | sample_account_plans.docx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_account_plans.docx** › Year-end Retail campaign: Campaign for all Retail customers: buy 10 cases of Consumables and get 1 case free, valid until 31 December. Salespeople can offer this promotion on the spot without approval. _[campaign]_
