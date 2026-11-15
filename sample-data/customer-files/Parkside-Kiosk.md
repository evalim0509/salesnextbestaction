# Parkside Kiosk

- Customer ID: C132
- Salesperson: Chloe Tan
- Segment: Retail
- Status on 15 Nov 2026: **Steady**
- File generated on this device by fixed rules. No AI language model was used.

## Performance

| Measure | Value |
|---|---|
| Customer since | 4 Nov 2024 |
| Number of orders | 53 |
| Last order | 14 Nov 2026 (1 days ago) |
| Usual time between orders | 14 days |
| Usual order size | $1,085 |
| Revenue, last 12 months | $32,500 |
| Revenue, 12 months before | $24,465 (+33%) |
| Revenue, last 90 days | $6,645 |
| Revenue, previous 90 days | $11,335 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $22,200 | 14 Nov 2026 |
| Consumables | $10,300 | 14 Nov 2026 |

## Today's assessment

- Their spending is down 41% in the last 3 months compared with the 3 months before.
- Most similar Retail customers buy Accessories, but they never have.
- Your documents say a campaign or offer applies to them (sample_account_plans.docx).

### Visit priority: 29 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +29 | They are a mid-sized customer for you ($32,500 in the last 12 months). | 0.6 × max(churn 20, close 20) + 0.1 × min(…) 20 + 0.3 × value percentile 50 (12-month revenue $32,500 ranked among your 36 customers) = 29.0 | Sales data |

### Chance to close a deal: 20 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +10 | Most similar Retail customers buy Accessories, but they never have. | Accessories bought by 8 of 15 Retail customers in the last 12 months (≥ 50%), 0 purchases by this customer → +10 close | Sales data |
| +10 | Your documents say a campaign or offer applies to them (sample_account_plans.docx). | document signals: campaign +10 = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 20 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +20 | Their spending is down 41% in the last 3 months compared with the 3 months before. | revenue last 90d $6,645 vs previous 90d $11,335 = -41% ≤ -25% → +20 churn | Sales data |

## Suggested pitch

A friendly check-in. Thank them for the steady business and look for one new idea to offer.

- Customers like them usually buy Accessories too. Introduce it as something similar Retail customers find useful. _(Sales data)_
- Their spending is down 41% in 3 months. Ask if they are buying part of their needs elsewhere. _(Sales data)_
- Use the current offer: “Campaign for all Retail customers: buy 10 cases of Consumables and get 1 case free, valid until 31 December. Salespeople can offer this promotion on the spot without approval.” _(sample_account_plans.docx)_

**Ask:** Agree the date of their next order before you leave.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Year-end Retail campaign | Already used in the last 30 days, valid until 31 Dec 2026 | $62 on $687 | saving = 9.1% × $687 (their average order in Consumables, last 12 months); unused = no purchase of Consumables in the last 30 days; terms read from document text | sample_account_plans.docx |

## Visit notes

No notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_account_plans.docx** › Year-end Retail campaign: Campaign for all Retail customers: buy 10 cases of Consumables and get 1 case free, valid until 31 December. Salespeople can offer this promotion on the spot without approval. _[campaign]_
