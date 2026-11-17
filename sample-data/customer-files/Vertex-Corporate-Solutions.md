# Vertex Corporate Solutions

- Customer ID: C119
- Salesperson: Ben Carter
- Segment: Corporate
- Status on 15 Nov 2026: **Good chance**
- File generated on this device by fixed rules. No AI language model was used.
- Version: rules 1.9 (2026-11-17); data sample_transactions.xlsx, 2024-11-01 to 2026-11-14

## Performance

| Measure | Value |
|---|---|
| Customer since | 20 Nov 2024 |
| Number of orders | 25 |
| Last order | 5 Nov 2026 (10 days ago) |
| Usual time between orders | 29 days |
| Usual order size | $2,278 |
| Revenue, last 12 months | $25,950 |
| Revenue, 12 months before | $30,990 (-16%) |
| Revenue, last 90 days | $7,800 |
| Revenue, previous 90 days | $6,320 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Premium Range | $16,430 | 5 Nov 2026 |
| Service Plans | $9,520 | 5 Nov 2026 |

## Today's assessment

- Spending up 23% on the 3 months before.
- Similar Corporate customers buy Core Products; they never have.
- Your documents: campaign applies (sample_account_plans.docx).

### Visit priority: 29 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +29 | A mid-sized customer ($25,950 a year). | 0.6 × max(churn 0, close 30) + 0.1 × min(…) 0 + 0.3 × value percentile 36 (12-month revenue $25,950 ranked among your 36 customers) = 28.8 | Sales data |

### Chance to close a deal: 30 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +10 | Spending up 23% on the 3 months before. | revenue last 90d $7,800 vs previous 90d $6,320 = +23% ≥ +10% → +10 close | Sales data |
| +10 | Similar Corporate customers buy Core Products; they never have. | Core Products bought by 8 of 9 Corporate customers in the last 12 months (≥ 50%), 0 purchases by this customer → +10 close | Sales data |
| +10 | Your documents: campaign applies (sample_account_plans.docx). | document signals: campaign +10 = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 0 / 100

No factors applied.

## Suggested pitch

Go in ready to take an order today.

- Customers like them usually buy Core Products too. Introduce it as something similar Corporate customers find useful. _(Sales data)_
- Their spending is up 23% in 3 months. Thank them and suggest a regular standing order. _(Sales data)_
- Use the current offer: “The new Premium Range launch offer gives Corporate customers a 5% introductory discount on their first Premium Range order this quarter.” _(sample_account_plans.docx)_

**Ask:** Ask for the Premium Range reorder and a first trial of Core Products.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Premium Range launch | Already used in the last 30 days | $75 on $1,494 | saving = 5% × $1,494 (their average order in Premium Range, last 12 months); unused = no purchase of Premium Range in the last 30 days; terms read from document text | sample_account_plans.docx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_account_plans.docx** › Premium Range launch: The new Premium Range launch offer gives Corporate customers a 5% introductory discount on their first Premium Range order this quarter. _[campaign]_
