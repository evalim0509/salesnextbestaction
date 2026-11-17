# Old Mill Traders

- Customer ID: C111
- Salesperson: Aisha Rahman
- Segment: Wholesale
- Status on 15 Nov 2026: **Inactive**
- File generated on this device by fixed rules. No AI language model was used.
- Version: rules 1.8 (2026-11-17); data sample_transactions.xlsx, 2024-11-01 to 2026-11-14

## Performance

| Measure | Value |
|---|---|
| Customer since | 6 Nov 2024 |
| Number of orders | 17 |
| Last order | 17 Feb 2026 (271 days ago) |
| Usual time between orders | 29 days |
| Usual order size | $2,846 |
| Revenue, last 12 months | $9,420 |
| Revenue, 12 months before | $34,695 (-73%) |
| Revenue, last 90 days | $0 |
| Revenue, previous 90 days | $0 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $6,840 | 17 Feb 2026 |
| Accessories | $2,580 | 17 Feb 2026 |

## Today's assessment

- Usually orders every 29 days, now 271.
- Your documents: campaign applies (sample_campaign_deck.pptx).
- One of your smaller customers ($9,420 a year).

### Visit priority: 0 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +3 | One of your smaller customers ($9,420 a year). | 0.6 × max(churn 0, close 0) + 0.1 × min(…) 0 + 0.3 × value percentile 11 (12-month revenue $9,420 ranked among your 36 customers) = 3.3 | Sales data |
| -30 | No order for 271 days: treated as inactive. | recency 271d > max(180d, 6 × gap 29d) → inactive: churn and close set to 0, −30 priority | Sales data |

### Chance to close a deal: 0 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +10 | Your documents: campaign applies (sample_campaign_deck.pptx). | document signals: campaign +10 = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 0 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +45 | Usually orders every 29 days, now 271. | recency 271d ÷ median gap between orders 29d = 9.34 ≥ 3 → +45 churn | Sales data |

## Suggested pitch

It has been a while. Go in to listen: ask how business is and what they use today instead of you.

- Use the current offer: “Campaign for all Wholesale customers: order Core Products and Accessories together as a bundle and receive a 3% rebate at quarter end.” _(sample_campaign_deck.pptx)_
- Use the current offer: “Target: every Wholesale account places at least one bundle order this quarter.” _(sample_campaign_deck.pptx)_

**Ask:** Ask for one small order this week to get things moving again.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Wholesale growth campaign | Not used yet | $71 on $2,355 | saving = 3% × $2,355 (their average order in Accessories + Core Products, last 12 months); unused = no purchase of Accessories + Core Products in the last 30 days; terms read from document text | sample_campaign_deck.pptx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_campaign_deck.pptx** › Wholesale growth campaign: Campaign for all Wholesale customers: order Core Products and Accessories together as a bundle and receive a 3% rebate at quarter end. _[campaign]_
- **sample_campaign_deck.pptx** › Wholesale growth campaign: Target: every Wholesale account places at least one bundle order this quarter. _[campaign]_
