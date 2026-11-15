# Ironbridge Distribution

- Customer ID: C117
- Salesperson: Ben Carter
- Segment: Wholesale
- Status on 15 Nov 2026: **May churn**
- File generated on this device by fixed rules. No AI language model was used.

## Performance

| Measure | Value |
|---|---|
| Customer since | 15 Nov 2024 |
| Number of orders | 32 |
| Last order | 6 Sep 2026 (70 days ago) |
| Usual time between orders | 22 days |
| Usual order size | $4,411 |
| Revenue, last 12 months | $64,785 |
| Revenue, 12 months before | $73,810 (-12%) |
| Revenue, last 90 days | $4,235 |
| Revenue, previous 90 days | $17,135 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $32,280 | 6 Sep 2026 |
| Consumables | $22,435 | 6 Sep 2026 |
| Accessories | $10,070 | 6 Sep 2026 |

## Today's assessment

- They usually order about every 22 days, but it has been 70 days since the last order.
- Their spending is down 75% in the last 3 months compared with the 3 months before.
- Your documents flag a risk on this account (sample_account_plans.docx).

### Visit priority: 80 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +80 | They are one of your biggest customers ($64,785 in the last 12 months). | 0.6 × max(churn 85, close 10) + 0.1 × min(…) 10 + 0.3 × value percentile 92 (12-month revenue $64,785 ranked among your 36 customers) = 79.6 | Sales data |

### Chance to close a deal: 10 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +10 | Your documents say a campaign or offer applies to them (sample_campaign_deck.pptx). | document signals: campaign +10 = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 85 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +45 | They usually order about every 22 days, but it has been 70 days since the last order. | recency 70d ÷ median gap between orders 22d = 3.18 ≥ 3 → +45 churn | Sales data |
| +30 | Their spending is down 75% in the last 3 months compared with the 3 months before. | revenue last 90d $4,235 vs previous 90d $17,135 = -75% ≤ -50% → +30 churn | Sales data |
| +10 | Your documents flag a risk on this account (sample_account_plans.docx). | document paragraph linked to customer with risk wording: “Ironbridge Distribution complained about two late deliveries last quarter. Operations has…” → +10 churn | Documents |

## Suggested pitch

Go in to listen first. Ask how things are going with their orders before you talk about products.

- They normally order every 22 days and it has been 70. Ask openly: “I noticed we have not had an order for a while. Did something change?” _(Sales data)_
- Use the current offer: “Campaign for all Wholesale customers: order Core Products and Accessories together as a bundle and receive a 3% rebate at quarter end.” _(sample_campaign_deck.pptx)_
- Use the current offer: “Target: every Wholesale account places at least one bundle order this quarter.” _(sample_campaign_deck.pptx)_

**Ask:** Ask for one small order this week to get things moving again.

## Visit notes

No notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_account_plans.docx** › Ironbridge Distribution: Ironbridge Distribution complained about two late deliveries last quarter. Operations has since changed the route. Reassure them and ask for a trial order. _[risk]_
- **sample_campaign_deck.pptx** › Wholesale growth campaign: Campaign for all Wholesale customers: order Core Products and Accessories together as a bundle and receive a 3% rebate at quarter end. _[campaign]_
- **sample_campaign_deck.pptx** › Wholesale growth campaign: Target: every Wholesale account places at least one bundle order this quarter. _[campaign]_
