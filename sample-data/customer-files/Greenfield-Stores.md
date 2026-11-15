# Greenfield Stores

- Customer ID: C116
- Salesperson: Ben Carter
- Segment: Retail
- Status on 15 Nov 2026: **Watch**
- File generated on this device by fixed rules. No AI language model was used.

## Performance

| Measure | Value |
|---|---|
| Customer since | 1 Nov 2024 |
| Number of orders | 55 |
| Last order | 11 Nov 2026 (4 days ago) |
| Usual time between orders | 14 days |
| Usual order size | $1,149 |
| Revenue, last 12 months | $27,265 |
| Revenue, 12 months before | $34,580 (-21%) |
| Revenue, last 90 days | $3,480 |
| Revenue, previous 90 days | $7,200 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $22,260 | 11 Nov 2026 |
| Consumables | $5,005 | 2 May 2026 |

## Today's assessment

- Their spending is down 52% in the last 3 months compared with the 3 months before.
- Your documents flag a risk on this account (sample_account_plans.docx).
- Most similar Retail customers buy Accessories, but they never have.

### Visit priority: 39 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +39 | They are a mid-sized customer for you ($27,265 in the last 12 months). | 0.6 × max(churn 40, close 20) + 0.1 × min(…) 20 + 0.3 × value percentile 42 (12-month revenue $27,265 ranked among your 36 customers) = 38.6 | Sales data |

### Chance to close a deal: 20 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +10 | Most similar Retail customers buy Accessories, but they never have. | Accessories bought by 8 of 15 Retail customers in the last 12 months (≥ 50%), 0 purchases by this customer → +10 close | Sales data |
| +10 | Your documents say a campaign or offer applies to them (sample_account_plans.docx). | document signals: campaign +10 = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 40 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +30 | Their spending is down 52% in the last 3 months compared with the 3 months before. | revenue last 90d $3,480 vs previous 90d $7,200 = -52% ≤ -50% → +30 churn | Sales data |
| +10 | Your documents flag a risk on this account (sample_account_plans.docx). | document paragraph linked to customer with risk wording: “Greenfield Stores told us a competitor offered free delivery. We should match with the…” → +10 churn | Documents |

## Suggested pitch

Go in to listen first. Ask how things are going with their orders before you talk about products.

- They used to buy Consumables (last time 2 May 2026) and then stopped. Ask why and whether they still need it. _(Sales data)_
- Customers like them usually buy Accessories too. Introduce it as something similar Retail customers find useful. _(Sales data)_
- Their spending is down 52% in 3 months. Ask if they are buying part of their needs elsewhere. _(Sales data)_
- Use the current offer: “Campaign for all Retail customers: buy 10 cases of Consumables and get 1 case free, valid until 31 December. Salespeople can offer this promotion on the spot without approval.” _(sample_account_plans.docx)_

**Ask:** Ask for one small order this week to get things moving again.

## Visit notes

No notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_account_plans.docx** › Regional sales meeting: Greenfield Stores told us a competitor offered free delivery. We should match with the Consumables promotion. _[campaign, risk]_
- **sample_account_plans.docx** › Year-end Retail campaign: Campaign for all Retail customers: buy 10 cases of Consumables and get 1 case free, valid until 31 December. Salespeople can offer this promotion on the spot without approval. _[campaign]_
