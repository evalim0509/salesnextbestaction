# Bayview Mini Mart

- Customer ID: C120
- Salesperson: Ben Carter
- Segment: Retail
- Status on 15 Nov 2026: **Steady**
- File generated on this device by fixed rules. No AI language model was used.
- Version: rules 1.8 (2026-11-17); data sample_transactions.xlsx, 2024-11-01 to 2026-11-14

## Performance

| Measure | Value |
|---|---|
| Customer since | 1 Oct 2026 |
| Number of orders | 4 |
| Last order | 10 Nov 2026 (5 days ago) |
| Usual time between orders | 13 days |
| Usual order size | $1,298 |
| Revenue, last 12 months | $5,190 |
| Revenue, 12 months before | $0 |
| Revenue, last 90 days | $5,190 |
| Revenue, previous 90 days | $0 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $4,140 | 10 Nov 2026 |
| Consumables | $1,050 | 26 Oct 2026 |

## Today's assessment

- Similar Retail customers buy Accessories; they never have.
- Your documents: campaign applies (sample_account_plans.docx).
- One of your smaller customers ($5,190 a year).

### Visit priority: 14 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +14 | One of your smaller customers ($5,190 a year). | 0.6 × max(churn 0, close 20) + 0.1 × min(…) 0 + 0.3 × value percentile 6 (12-month revenue $5,190 ranked among your 36 customers) = 13.8 | Sales data |

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
| Year-end Retail campaign | Already used in the last 30 days, valid until 31 Dec 2026 | $48 on $525 | saving = 9.1% × $525 (their average order in Consumables, last 12 months); unused = no purchase of Consumables in the last 30 days; terms read from document text | sample_account_plans.docx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_account_plans.docx** › Year-end Retail campaign: Campaign for all Retail customers: buy 10 cases of Consumables and get 1 case free, valid until 31 December. Salespeople can offer this promotion on the spot without approval. _[campaign]_
