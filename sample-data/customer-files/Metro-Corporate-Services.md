# Metro Corporate Services

- Customer ID: C108
- Salesperson: Aisha Rahman
- Segment: Corporate
- Status on 15 Nov 2026: **May churn**
- File generated on this device by fixed rules. No AI language model was used.

## Performance

| Measure | Value |
|---|---|
| Customer since | 24 Nov 2024 |
| Number of orders | 23 |
| Last order | 17 Aug 2026 (90 days ago) |
| Usual time between orders | 30 days |
| Usual order size | $4,089 |
| Revenue, last 12 months | $39,910 |
| Revenue, 12 months before | $54,130 (-26%) |
| Revenue, last 90 days | $0 |
| Revenue, previous 90 days | $15,390 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Premium Range | $16,970 | 17 Aug 2026 |
| Core Products | $13,800 | 17 Aug 2026 |
| Service Plans | $9,140 | 17 Aug 2026 |

## Today's assessment

- They usually order about every 30 days, but it has been 90 days since the last order.
- Their spending is down 100% in the last 3 months compared with the 3 months before.
- Your documents flag a risk on this account (sample_account_plans.docx).

### Visit priority: 73 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +73 | They are one of your biggest customers ($39,910 in the last 12 months). | 0.6 × max(churn 85, close 20) + 0.1 × min(…) 20 + 0.3 × value percentile 67 (12-month revenue $39,910 ranked among your 36 customers) = 73.1 | Sales data |

### Chance to close a deal: 20 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +20 | Your documents say a renewal is coming up and a campaign or offer applies to them (sample_account_plans.docx). | document signals: renewal +15, campaign +10 = 25, capped at 20 → +20 close | Documents |

### Risk of losing them: 85 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +45 | They usually order about every 30 days, but it has been 90 days since the last order. | recency 90d ÷ median gap between orders 30d = 3.05 ≥ 3 → +45 churn | Sales data |
| +30 | Their spending is down 100% in the last 3 months compared with the 3 months before. | revenue last 90d $0 vs previous 90d $15,390 = -100% ≤ -50% → +30 churn | Sales data |
| +10 | Your documents flag a risk on this account (sample_account_plans.docx). | document paragraph linked to customer with risk wording: “Metro Corporate Services has a new procurement manager who is reviewing all suppliers.” → +10 churn | Documents |

## Suggested pitch

Go in to listen first. Ask how things are going with their orders before you talk about products.

- They normally order every 30 days and it has been 90. Ask openly: “I noticed we have not had an order for a while. Did something change?” _(Sales data)_
- Use the current offer: “Their annual contract expires at the end of the year. Prepare a renewal offer with the Premium Range launch discount.” _(sample_account_plans.docx)_
- Use the current offer: “The new Premium Range launch offer gives Corporate customers a 5% introductory discount on their first Premium Range order this quarter.” _(sample_account_plans.docx)_

**Ask:** Ask for one small order this week to get things moving again.

## Visit notes

No notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_account_plans.docx** › Metro Corporate Services: Metro Corporate Services has a new procurement manager who is reviewing all suppliers. Risk of losing the account if we do not meet her soon. _[risk]_
- **sample_account_plans.docx** › Metro Corporate Services: Their annual contract expires at the end of the year. Prepare a renewal offer with the Premium Range launch discount. _[renewal, campaign]_
- **sample_account_plans.docx** › Premium Range launch: The new Premium Range launch offer gives Corporate customers a 5% introductory discount on their first Premium Range order this quarter. _[campaign]_
