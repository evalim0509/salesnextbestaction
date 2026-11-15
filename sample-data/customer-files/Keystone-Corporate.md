# Keystone Corporate

- Customer ID: C127
- Salesperson: Chloe Tan
- Segment: Corporate
- Status on 15 Nov 2026: **May churn**
- File generated on this device by fixed rules. No AI language model was used.

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

- They usually order about every 29 days, but it has been 89 days since the last order.
- Their spending is down 55% in the last 3 months compared with the 3 months before.
- Your documents flag a risk on this account (sample_account_plans.docx).

### Visit priority: 71 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +71 | They are a mid-sized customer for you ($37,350 in the last 12 months). | 0.6 × max(churn 85, close 10) + 0.1 × min(…) 10 + 0.3 × value percentile 64 (12-month revenue $37,350 ranked among your 36 customers) = 71.2 | Sales data |

### Chance to close a deal: 10 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +10 | Your documents say a campaign or offer applies to them (sample_account_plans.docx). | document signals: campaign +10 = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 85 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +45 | They usually order about every 29 days, but it has been 89 days since the last order. | recency 89d ÷ median gap between orders 29d = 3.07 ≥ 3 → +45 churn | Sales data |
| +30 | Their spending is down 55% in the last 3 months compared with the 3 months before. | revenue last 90d $5,070 vs previous 90d $11,230 = -55% ≤ -50% → +30 churn | Sales data |
| +10 | Your documents flag a risk on this account (sample_account_plans.docx). | document paragraph linked to customer with risk wording: “Keystone Corporate paused orders during an internal budget review. Risk of churn if the…” → +10 churn | Documents |

## Suggested pitch

Go in to listen first. Ask how things are going with their orders before you talk about products.

- They normally order every 29 days and it has been 89. Ask openly: “I noticed we have not had an order for a while. Did something change?” _(Sales data)_
- Use the current offer: “The new Premium Range launch offer gives Corporate customers a 5% introductory discount on their first Premium Range order this quarter.” _(sample_account_plans.docx)_
- Be aware: “Keystone Corporate paused orders during an internal budget review. Risk of churn if the review favours a competitor. Meet the finance lead.” _(sample_account_plans.docx)_

**Ask:** Ask for one small order this week to get things moving again.

## Visit notes

No notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_account_plans.docx** › Keystone Corporate: Keystone Corporate paused orders during an internal budget review. Risk of churn if the review favours a competitor. Meet the finance lead. _[risk]_
- **sample_account_plans.docx** › Premium Range launch: The new Premium Range launch offer gives Corporate customers a 5% introductory discount on their first Premium Range order this quarter. _[campaign]_
