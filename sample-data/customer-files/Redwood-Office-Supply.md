# Redwood Office Supply

- Customer ID: C122
- Salesperson: Ben Carter
- Segment: Corporate
- Status on 15 Nov 2026: **Steady**
- File generated on this device by fixed rules. No AI language model was used.
- Version: rules 1.7 (2026-11-17); data sample_transactions.xlsx, 2024-11-01 to 2026-11-14

## Performance

| Measure | Value |
|---|---|
| Customer since | 21 Nov 2024 |
| Number of orders | 26 |
| Last order | 14 Nov 2026 (1 days ago) |
| Usual time between orders | 28 days |
| Usual order size | $2,272 |
| Revenue, last 12 months | $24,560 |
| Revenue, 12 months before | $34,520 (-29%) |
| Revenue, last 90 days | $3,540 |
| Revenue, previous 90 days | $4,260 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $16,920 | 14 Nov 2026 |
| Premium Range | $7,640 | 28 Apr 2026 |

## Today's assessment

- Similar Corporate customers buy Service Plans; they never have.
- Your documents: unused offer (sample_account_plans.docx).
- Spending down 17% on the 3 months before.

### Visit priority: 20 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +20 | One of your smaller customers ($24,560 a year). | 0.6 × max(churn 8, close 20) + 0.1 × min(…) 8 + 0.3 × value percentile 25 (12-month revenue $24,560 ranked among your 36 customers) = 20.3 | Sales data |

### Chance to close a deal: 20 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +10 | Similar Corporate customers buy Service Plans; they never have. | Service Plans bought by 6 of 9 Corporate customers in the last 12 months (≥ 50%), 0 purchases by this customer → +10 close | Sales data |
| +10 | Your documents: unused offer (sample_account_plans.docx). | document signals: campaign +10 (Premium Range launch not used) = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 8 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +8 | Spending down 17% on the 3 months before. | revenue last 90d $3,540 vs previous 90d $4,260 = -17% ≤ -10% → +8 churn | Sales data |

## Suggested pitch

A friendly check-in. Thank them for the steady business and look for one new idea to offer.

- The Premium Range launch applies to them and they have not used it yet. On a $1,528 order of Premium Range they save about $76 (5% discount, worth about 5%). _(sample_account_plans.docx)_
- They used to buy Premium Range (last time Tue 28 Apr) and then stopped. Ask why and whether they still need it. _(Sales data)_
- Customers like them usually buy Service Plans too. Introduce it as something similar Corporate customers find useful. _(Sales data)_

**Ask:** Agree the date of their next order before you leave.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Premium Range launch | Not used yet | $76 on $1,528 | saving = 5% × $1,528 (their average order in Premium Range, last 12 months); unused = no purchase of Premium Range in the last 30 days; terms read from document text | sample_account_plans.docx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_account_plans.docx** › Premium Range launch: The new Premium Range launch offer gives Corporate customers a 5% introductory discount on their first Premium Range order this quarter. _[campaign]_
