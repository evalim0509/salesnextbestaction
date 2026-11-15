# Pacific Rim Wholesale

- Customer ID: C125
- Salesperson: Chloe Tan
- Segment: Wholesale
- Status on 15 Nov 2026: **Good chance**
- File generated on this device by fixed rules. No AI language model was used.

## Performance

| Measure | Value |
|---|---|
| Customer since | 10 Nov 2024 |
| Number of orders | 35 |
| Last order | 29 Oct 2026 (17 days ago) |
| Usual time between orders | 21 days |
| Usual order size | $4,296 |
| Revenue, last 12 months | $74,260 |
| Revenue, 12 months before | $71,735 (+4%) |
| Revenue, last 90 days | $16,095 |
| Revenue, previous 90 days | $17,460 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $35,880 | 29 Oct 2026 |
| Consumables | $24,820 | 29 Oct 2026 |
| Accessories | $13,560 | 29 Oct 2026 |

## Today's assessment

- They are due to reorder now: they usually order about every 21 days and the last order was 17 days ago.
- Your documents say a campaign or offer applies to them (sample_campaign_deck.pptx).
- They are one of your biggest customers ($74,260 in the last 12 months).

### Visit priority: 53 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +53 | They are one of your biggest customers ($74,260 in the last 12 months). | 0.6 × max(churn 0, close 40) + 0.1 × min(…) 0 + 0.3 × value percentile 97 (12-month revenue $74,260 ranked among your 36 customers) = 53.1 | Sales data |

### Chance to close a deal: 40 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +30 | They are due to reorder now: they usually order about every 21 days and the last order was 17 days ago. | recency 17d ÷ median gap between orders 21d = 0.81 in [0.8, 1.5) → +30 close | Sales data |
| +10 | Your documents say a campaign or offer applies to them (sample_campaign_deck.pptx). | document signals: campaign +10 = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 0 / 100

No factors applied.

## Suggested pitch

Go in ready to take an order today.

- They normally reorder Core Products about every 21 days and the last order was 17 days ago. Ask for the reorder (usual size about $4,296). _(Sales data)_
- Use the current offer: “Campaign for all Wholesale customers: order Core Products and Accessories together as a bundle and receive a 3% rebate at quarter end.” _(sample_campaign_deck.pptx)_
- Use the current offer: “Target: every Wholesale account places at least one bundle order this quarter.” _(sample_campaign_deck.pptx)_

**Ask:** Ask for the Core Products reorder.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Wholesale growth campaign | Already used in the last 30 days | $87 on $2,908 | saving = 3% × $2,908 (their average order in Accessories + Core Products, last 12 months); unused = no purchase of Accessories + Core Products in the last 30 days; terms read from document text | sample_campaign_deck.pptx |

## Visit notes

No notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_campaign_deck.pptx** › Wholesale growth campaign: Campaign for all Wholesale customers: order Core Products and Accessories together as a bundle and receive a 3% rebate at quarter end. _[campaign]_
- **sample_campaign_deck.pptx** › Wholesale growth campaign: Target: every Wholesale account places at least one bundle order this quarter. _[campaign]_
