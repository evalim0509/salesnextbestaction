# Hilltop Convenience

- Customer ID: C124
- Salesperson: Ben Carter
- Segment: Retail
- Status on 15 Nov 2026: **Steady**
- File generated on this device by fixed rules. No AI language model was used.
- Version: rules 1.7 (2026-11-17); data sample_transactions.xlsx, 2024-11-01 to 2026-11-14

## Performance

| Measure | Value |
|---|---|
| Customer since | 9 Nov 2024 |
| Number of orders | 53 |
| Last order | 13 Nov 2026 (2 days ago) |
| Usual time between orders | 14 days |
| Usual order size | $1,042 |
| Revenue, last 12 months | $31,640 |
| Revenue, 12 months before | $22,330 (+42%) |
| Revenue, last 90 days | $8,815 |
| Revenue, previous 90 days | $8,880 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $20,580 | 13 Nov 2026 |
| Consumables | $11,060 | 13 Nov 2026 |

## Today's assessment

- Similar Retail customers buy Accessories; they never have.
- Your documents: campaign applies (sample_account_plans.docx).
- A mid-sized customer ($31,640 a year).

### Visit priority: 25 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +25 | A mid-sized customer ($31,640 a year). | 0.6 × max(churn 0, close 20) + 0.1 × min(…) 0 + 0.3 × value percentile 44 (12-month revenue $31,640 ranked among your 36 customers) = 25.2 | Sales data |

### Chance to close a deal: 20 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +10 | Similar Retail customers buy Accessories; they never have. | Accessories bought by 8 of 15 Retail customers in the last 12 months (≥ 50%), 0 purchases by this customer → +10 close | Sales data |
| +10 | Your documents: campaign applies (sample_account_plans.docx). | document signals: campaign +10 = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 0 / 100

No factors applied.

## Suggested pitch

A friendly check-in. Thank them for the steady business and look for one new idea to offer.

- Customers like them usually buy Accessories too. Introduce it as something similar Retail customers find useful. _(Sales data)_
- Use the current offer: “Campaign for all Retail customers: buy 10 cases of Consumables and get 1 case free, valid until 31 December. Salespeople can offer this promotion on the spot without approval.” _(sample_account_plans.docx)_

**Ask:** Agree the date of their next order before you leave.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Year-end Retail campaign | Already used in the last 30 days, valid until 31 Dec 2026 | $72 on $790 | saving = 9.1% × $790 (their average order in Consumables, last 12 months); unused = no purchase of Consumables in the last 30 days; terms read from document text | sample_account_plans.docx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_account_plans.docx** › Year-end Retail campaign: Campaign for all Retail customers: buy 10 cases of Consumables and get 1 case free, valid until 31 December. Salespeople can offer this promotion on the spot without approval. _[campaign]_
