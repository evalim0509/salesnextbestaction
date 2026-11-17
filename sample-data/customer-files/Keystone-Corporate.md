# Keystone Corporate

- Customer ID: C127
- Salesperson: Chloe Tan
- Segment: Corporate
- Status on 15 Nov 2026: **Watch**
- File generated on this device by fixed rules. No AI language model was used.
- Version: rules 1.9 (2026-11-17); data sample_transactions.xlsx, 2024-11-01 to 2026-11-14

## Performance

| Measure | Value |
|---|---|
| Customer since | 30 Nov 2024 |
| Number of orders | 22 |
| Last order | 18 Aug 2026 (89 days ago) |
| Usual time between orders | 29 days |
| Usual order size | $3,950 |
| Revenue, last 12 months | $37,350 |
| Revenue, 12 months before | $49,560 (-25%) |
| Revenue, last 90 days | $5,070 |
| Revenue, previous 90 days | $11,230 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $14,700 | 18 Aug 2026 |
| Premium Range | $12,990 | 18 Aug 2026 |
| Service Plans | $9,660 | 18 Aug 2026 |

## Today's assessment

- Spending down 55% on the 3 months before.
- Your documents flag a risk (sample_account_plans.docx).
- Your documents: unused offer (sample_account_plans.docx).

### Visit priority: 44 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +44 | A mid-sized customer ($37,350 a year). | 0.6 × max(churn 40, close 10) + 0.1 × min(…) 10 + 0.3 × value percentile 64 (12-month revenue $37,350 ranked among your 36 customers) = 44.2 | Sales data |

### Chance to close a deal: 10 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +10 | Your documents: unused offer (sample_account_plans.docx). | document signals: campaign +10 (Premium Range launch not used) = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 40 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +30 | Spending down 55% on the 3 months before. | revenue last 90d $5,070 vs previous 90d $11,230 = -55% ≤ -50% → +30 churn | Sales data |
| +10 | Your documents flag a risk (sample_account_plans.docx). | document paragraph linked to customer with risk wording: “Keystone Corporate paused orders during an internal budget review. Risk of churn if the…” → +10 churn | Documents |

## Suggested pitch

Go in to listen first. Ask how things are going with their orders before you talk about products.

- The Premium Range launch applies to them and they have not used it yet. On a $1,624 order of Premium Range they save about $81 (5% discount, worth about 5%). _(sample_account_plans.docx)_
- They normally order every 29 days and it has been 89. Ask openly: “I noticed we have not had an order for a while. Did something change?” _(Sales data)_
- Be aware: “Keystone Corporate paused orders during an internal budget review. Risk of churn if the review favours a competitor. Meet the finance lead.” _(sample_account_plans.docx)_

**Ask:** Ask for one small order this week to get things moving again.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Premium Range launch | Not used yet | $81 on $1,624 | saving = 5% × $1,624 (their average order in Premium Range, last 12 months); unused = no purchase of Premium Range in the last 30 days; terms read from document text | sample_account_plans.docx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_account_plans.docx** › Keystone Corporate: Keystone Corporate paused orders during an internal budget review. Risk of churn if the review favours a competitor. Meet the finance lead. _[risk]_
- **sample_account_plans.docx** › Premium Range launch: The new Premium Range launch offer gives Corporate customers a 5% introductory discount on their first Premium Range order this quarter. _[campaign]_
