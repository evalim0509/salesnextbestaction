# Summit Office Group

- Customer ID: C103
- Salesperson: Aisha Rahman
- Segment: Corporate
- Status on 15 Nov 2026: **Good chance**
- File generated on this device by fixed rules. No AI language model was used.
- Version: rules 1.9 (2026-11-17); data sample_transactions.xlsx, 2024-11-01 to 2026-11-14

## Performance

| Measure | Value |
|---|---|
| Customer since | 14 Nov 2024 |
| Number of orders | 25 |
| Last order | 4 Nov 2026 (11 days ago) |
| Usual time between orders | 30 days |
| Usual order size | $3,802 |
| Revenue, last 12 months | $61,570 |
| Revenue, 12 months before | $30,590 (+101%) |
| Revenue, last 90 days | $18,430 |
| Revenue, previous 90 days | $15,320 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $26,460 | 4 Nov 2026 |
| Premium Range | $24,150 | 4 Nov 2026 |
| Service Plans | $10,960 | 9 Oct 2026 |

## Today's assessment

- Your documents: renewal coming up, campaign applies, room to grow (sample_account_plans.docx).
- Spending up 20% on the 3 months before.
- One of your biggest customers ($61,570 a year).

### Visit priority: 53 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +45 | One of your biggest customers ($61,570 a year). | 0.6 × max(churn 0, close 30) + 0.1 × min(…) 0 + 0.3 × value percentile 89 (12-month revenue $61,570 ranked among your 36 customers) = 44.7 | Sales data |
| +8 | Your account plan marks them as a priority (sample_account_plans.docx). | document paragraph with priority wording: “Summit Office Group is expanding to a second office in the new year. This is a strategic…” → +8 priority | Documents |

### Chance to close a deal: 30 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +10 | Spending up 20% on the 3 months before. | revenue last 90d $18,430 vs previous 90d $15,320 = +20% ≥ +10% → +10 close | Sales data |
| +20 | Your documents: renewal coming up, campaign applies, room to grow (sample_account_plans.docx). | document signals: renewal +15, campaign +10, growth +8 = 33, capped at 20 → +20 close | Documents |

### Risk of losing them: 0 / 100

No factors applied.

## Suggested pitch

Go in ready to take an order today.

- Their spending is up 20% in 3 months. Thank them and suggest a regular standing order. _(Sales data)_
- Use the current offer: “The new Premium Range launch offer gives Corporate customers a 5% introductory discount on their first Premium Range order this quarter.” _(sample_account_plans.docx)_
- From the account plan: “Summit Office Group is expanding to a second office in the new year. This is a strategic growth opportunity.” _(sample_account_plans.docx)_

**Ask:** Ask for the Core Products reorder.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Premium Range launch | Already used in the last 30 days | $101 on $2,013 | saving = 5% × $2,013 (their average order in Premium Range, last 12 months); unused = no purchase of Premium Range in the last 30 days; terms read from document text | sample_account_plans.docx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_account_plans.docx** › Summit Office Group: Summit Office Group is expanding to a second office in the new year. This is a strategic growth opportunity. _[priority, growth]_
- **sample_account_plans.docx** › Summit Office Group: Their Service Plans contract renews in December. Start the renewal conversation early and propose an upgrade. _[renewal]_
- **sample_account_plans.docx** › Premium Range launch: The new Premium Range launch offer gives Corporate customers a 5% introductory discount on their first Premium Range order this quarter. _[campaign]_
