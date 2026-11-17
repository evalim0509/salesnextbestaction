# Aurora Business Centre

- Customer ID: C134
- Salesperson: Chloe Tan
- Segment: Corporate
- Status on 15 Nov 2026: **Good chance**
- File generated on this device by fixed rules. No AI language model was used.
- Version: rules 1.8 (2026-11-17); data sample_transactions.xlsx, 2024-11-01 to 2026-11-14

## Performance

| Measure | Value |
|---|---|
| Customer since | 10 Aug 2026 |
| Number of orders | 4 |
| Last order | 10 Nov 2026 (5 days ago) |
| Usual time between orders | 34 days |
| Usual order size | $2,905 |
| Revenue, last 12 months | $11,620 |
| Revenue, 12 months before | $0 |
| Revenue, last 90 days | $9,120 |
| Revenue, previous 90 days | $2,500 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $6,420 | 10 Nov 2026 |
| Premium Range | $5,200 | 10 Nov 2026 |

## Today's assessment

- Spending up 265% on the 3 months before.
- Similar Corporate customers buy Service Plans; they never have.
- Your documents: campaign applies (sample_account_plans.docx).

### Visit priority: 28 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +28 | One of your smaller customers ($11,620 a year). | 0.6 × max(churn 0, close 40) + 0.1 × min(…) 0 + 0.3 × value percentile 14 (12-month revenue $11,620 ranked among your 36 customers) = 28.2 | Sales data |

### Chance to close a deal: 40 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +20 | Spending up 265% on the 3 months before. | revenue last 90d $9,120 vs previous 90d $2,500 = +265% ≥ +25% → +20 close | Sales data |
| +10 | Similar Corporate customers buy Service Plans; they never have. | Service Plans bought by 6 of 9 Corporate customers in the last 12 months (≥ 50%), 0 purchases by this customer → +10 close | Sales data |
| +10 | Your documents: campaign applies (sample_account_plans.docx). | document signals: campaign +10 = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 0 / 100

No factors applied.

## Suggested pitch

Go in ready to take an order today.

- Customers like them usually buy Service Plans too. Introduce it as something similar Corporate customers find useful. _(Sales data)_
- Their spending is up 265% in 3 months. Thank them and suggest a regular standing order. _(Sales data)_
- Use the current offer: “The new Premium Range launch offer gives Corporate customers a 5% introductory discount on their first Premium Range order this quarter.” _(sample_account_plans.docx)_

**Ask:** Ask for the Core Products reorder and a first trial of Service Plans.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Premium Range launch | Already used in the last 30 days | $87 on $1,733 | saving = 5% × $1,733 (their average order in Premium Range, last 12 months); unused = no purchase of Premium Range in the last 30 days; terms read from document text | sample_account_plans.docx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_account_plans.docx** › Premium Range launch: The new Premium Range launch offer gives Corporate customers a 5% introductory discount on their first Premium Range order this quarter. _[campaign]_
