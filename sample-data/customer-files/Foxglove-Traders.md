# Foxglove Traders

- Customer ID: C123
- Salesperson: Ben Carter
- Segment: Wholesale
- Status on 15 Nov 2026: **Inactive**
- File generated on this device by fixed rules. No AI language model was used.

## Performance

| Measure | Value |
|---|---|
| Customer since | 11 Nov 2024 |
| Number of orders | 17 |
| Last order | 1 Feb 2026 (287 days ago) |
| Usual time between orders | 28 days |
| Usual order size | $2,241 |
| Revenue, last 12 months | $6,060 |
| Revenue, 12 months before | $29,340 (-79%) |
| Revenue, last 90 days | $0 |
| Revenue, previous 90 days | $0 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $6,060 | 1 Feb 2026 |

## Today's assessment

- They usually order about every 28 days, but it has been 287 days since the last order.
- Your documents say a campaign or offer applies to them (sample_campaign_deck.pptx).
- They are one of your smaller customers ($6,060 in the last 12 months).

### Visit priority: 0 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +2 | They are one of your smaller customers ($6,060 in the last 12 months). | 0.6 × max(churn 0, close 0) + 0.1 × min(…) 0 + 0.3 × value percentile 8 (12-month revenue $6,060 ranked among your 36 customers) = 2.4 | Sales data |
| -30 | They have not ordered for 287 days, so they are treated as inactive. | recency 287d > max(180d, 6 × gap 28d) → inactive: churn and close set to 0, −30 priority | Sales data |

### Chance to close a deal: 0 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +10 | Your documents say a campaign or offer applies to them (sample_campaign_deck.pptx). | document signals: campaign +10 = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 0 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +45 | They usually order about every 28 days, but it has been 287 days since the last order. | recency 287d ÷ median gap between orders 28d = 10.25 ≥ 3 → +45 churn | Sales data |

## Suggested pitch

It has been a while. Go in to listen: ask how business is and what they use today instead of you.

- Use the current offer: “Campaign for all Wholesale customers: order Core Products and Accessories together as a bundle and receive a 3% rebate at quarter end.” _(sample_campaign_deck.pptx)_
- Use the current offer: “Target: every Wholesale account places at least one bundle order this quarter.” _(sample_campaign_deck.pptx)_

**Ask:** Ask for one small order this week to get things moving again.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Wholesale growth campaign | Not used yet | $61 on $2,020 | saving = 3% × $2,020 (their average order in Accessories + Core Products, last 12 months); unused = no purchase of Accessories + Core Products in the last 30 days; terms read from document text | sample_campaign_deck.pptx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_campaign_deck.pptx** › Wholesale growth campaign: Campaign for all Wholesale customers: order Core Products and Accessories together as a bundle and receive a 3% rebate at quarter end. _[campaign]_
- **sample_campaign_deck.pptx** › Wholesale growth campaign: Target: every Wholesale account places at least one bundle order this quarter. _[campaign]_
