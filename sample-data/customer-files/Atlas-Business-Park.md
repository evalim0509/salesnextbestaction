# Atlas Business Park

- Customer ID: C115
- Salesperson: Ben Carter
- Segment: Corporate
- Status on 15 Nov 2026: **Likely to close**
- File generated on this device by fixed rules. No AI language model was used.

## Performance

| Measure | Value |
|---|---|
| Customer since | 1 Dec 2024 |
| Number of orders | 23 |
| Last order | 15 Oct 2026 (31 days ago) |
| Usual time between orders | 31 days |
| Usual order size | $4,126 |
| Revenue, last 12 months | $46,430 |
| Revenue, 12 months before | $48,460 (-4%) |
| Revenue, last 90 days | $11,270 |
| Revenue, previous 90 days | $8,510 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Premium Range | $20,070 | 15 Oct 2026 |
| Core Products | $15,540 | 15 Oct 2026 |
| Service Plans | $10,820 | 15 Oct 2026 |

## Today's assessment

- They are due to reorder now: they usually order about every 31 days and the last order was 31 days ago.
- They are buying more: spending is up 32% in the last 3 months.
- Your documents say a renewal is coming up and the Premium Range launch applies to them and they have not used it (sample_account_plans.docx).

### Visit priority: 74 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +66 | They are one of your biggest customers ($46,430 in the last 12 months). | 0.6 × max(churn 0, close 70) + 0.1 × min(…) 0 + 0.3 × value percentile 81 (12-month revenue $46,430 ranked among your 36 customers) = 66.3 | Sales data |
| +8 | Your account plan marks them as a priority account (sample_account_plans.docx). | document paragraph with priority wording: “Atlas Business Park is a priority account. Their facilities contract renews in January…” → +8 priority | Documents |

### Chance to close a deal: 70 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +30 | They are due to reorder now: they usually order about every 31 days and the last order was 31 days ago. | recency 31d ÷ median gap between orders 31d = 1.00 in [0.8, 1.5) → +30 close | Sales data |
| +20 | They are buying more: spending is up 32% in the last 3 months. | revenue last 90d $11,270 vs previous 90d $8,510 = +32% ≥ +25% → +20 close | Sales data |
| +20 | Your documents say a renewal is coming up and the Premium Range launch applies to them and they have not used it (sample_account_plans.docx). | document signals: renewal +15, campaign +10 = 25, capped at 20 → +20 close | Documents |

### Risk of losing them: 0 / 100

No factors applied.

## Suggested pitch

Go in ready to take an order today.

- The Premium Range launch applies to them and they have not used it yet. On a $2,007 order of Premium Range they save about $100 (5% discount, worth about 5%). _(sample_account_plans.docx)_
- They normally reorder Premium Range about every 31 days and the last order was 31 days ago. Ask for the reorder (usual size about $4,126). _(Sales data)_
- Their spending is up 32% in 3 months. Thank them and suggest a regular standing order. _(Sales data)_
- Bring up the renewal: “Atlas Business Park is a priority account. Their facilities contract renews in January and they have asked about Service Plans.” _(sample_account_plans.docx)_

**Ask:** Ask for the Premium Range reorder.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Premium Range launch | Not used yet | $100 on $2,007 | saving = 5% × $2,007 (their average order in Premium Range, last 12 months); unused = no purchase of Premium Range in the last 30 days; terms read from document text | sample_account_plans.docx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_account_plans.docx** › Atlas Business Park: Atlas Business Park is a priority account. Their facilities contract renews in January and they have asked about Service Plans. _[priority, renewal]_
- **sample_account_plans.docx** › Premium Range launch: The new Premium Range launch offer gives Corporate customers a 5% introductory discount on their first Premium Range order this quarter. _[campaign]_
