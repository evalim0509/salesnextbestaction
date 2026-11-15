# Pinecrest Supplies

- Customer ID: C106
- Salesperson: Aisha Rahman
- Segment: Retail
- Status on 15 Nov 2026: **Likely to close**
- File generated on this device by fixed rules. No AI language model was used.

## Performance

| Measure | Value |
|---|---|
| Customer since | 9 Nov 2024 |
| Number of orders | 26 |
| Last order | 13 Oct 2026 (33 days ago) |
| Usual time between orders | 28 days |
| Usual order size | $1,243 |
| Revenue, last 12 months | $14,685 |
| Revenue, 12 months before | $15,885 (-8%) |
| Revenue, last 90 days | $3,635 |
| Revenue, previous 90 days | $4,485 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $10,080 | 13 Oct 2026 |
| Accessories | $4,605 | 13 Oct 2026 |

## Today's assessment

- They are due to reorder now: they usually order about every 28 days and the last order was 33 days ago.
- Most similar Retail customers buy Consumables, but they never have.
- Your documents say a campaign or offer applies to them (sample_account_plans.docx).

### Visit priority: 36 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +36 | They are one of your smaller customers ($14,685 in the last 12 months). | 0.6 × max(churn 8, close 50) + 0.1 × min(…) 8 + 0.3 × value percentile 17 (12-month revenue $14,685 ranked among your 36 customers) = 35.9 | Sales data |

### Chance to close a deal: 50 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +30 | They are due to reorder now: they usually order about every 28 days and the last order was 33 days ago. | recency 33d ÷ median gap between orders 28d = 1.18 in [0.8, 1.5) → +30 close | Sales data |
| +10 | Most similar Retail customers buy Consumables, but they never have. | Consumables bought by 12 of 15 Retail customers in the last 12 months (≥ 50%), 0 purchases by this customer → +10 close | Sales data |
| +10 | Your documents say a campaign or offer applies to them (sample_account_plans.docx). | document signals: campaign +10 = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 8 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +8 | Their spending is down 19% in the last 3 months compared with the 3 months before. | revenue last 90d $3,635 vs previous 90d $4,485 = -19% ≤ -10% → +8 churn | Sales data |

## Suggested pitch

Go in ready to take an order today.

- They normally reorder Core Products about every 28 days and the last order was 33 days ago. Ask for the reorder (usual size about $1,243). _(Sales data)_
- Customers like them usually buy Consumables too. Introduce it as something similar Retail customers find useful. _(Sales data)_
- Use the current offer: “Campaign for all Retail customers: buy 10 cases of Consumables and get 1 case free, valid until 31 December. Salespeople can offer this promotion on the spot without approval.” _(sample_account_plans.docx)_

**Ask:** Ask for the Core Products reorder and a first trial of Consumables.

## Visit notes

No notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_account_plans.docx** › Year-end Retail campaign: Campaign for all Retail customers: buy 10 cases of Consumables and get 1 case free, valid until 31 December. Salespeople can offer this promotion on the spot without approval. _[campaign]_
