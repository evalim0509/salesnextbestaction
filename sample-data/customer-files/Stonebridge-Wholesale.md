# Stonebridge Wholesale

- Customer ID: C121
- Salesperson: Ben Carter
- Segment: Wholesale
- Status on 15 Nov 2026: **Good chance**
- File generated on this device by fixed rules. No AI language model was used.
- Version: rules 1.7 (2026-11-17); data sample_transactions.xlsx, 2024-11-01 to 2026-11-14

## Performance

| Measure | Value |
|---|---|
| Customer since | 16 Nov 2024 |
| Number of orders | 25 |
| Last order | 24 Oct 2026 (22 days ago) |
| Usual time between orders | 31 days |
| Usual order size | $3,291 |
| Revenue, last 12 months | $41,845 |
| Revenue, 12 months before | $40,430 (+3%) |
| Revenue, last 90 days | $10,585 |
| Revenue, previous 90 days | $7,925 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $21,060 | 24 Oct 2026 |
| Consumables | $14,190 | 24 Oct 2026 |
| Accessories | $6,595 | 24 Oct 2026 |

## Today's assessment

- Spending up 34% on the 3 months before.
- Usually orders every 31 days, now 22: order coming up.
- Your documents: campaign applies (sample_campaign_deck.pptx).

### Visit priority: 47 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +47 | One of your biggest customers ($41,845 a year). | 0.6 × max(churn 0, close 42) + 0.1 × min(…) 0 + 0.3 × value percentile 72 (12-month revenue $41,845 ranked among your 36 customers) = 46.8 | Sales data |

### Chance to close a deal: 42 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +12 | Usually orders every 31 days, now 22: order coming up. | recency 22d ÷ 31d = 0.72 in [0.6, 0.8) → +12 close | Sales data |
| +20 | Spending up 34% on the 3 months before. | revenue last 90d $10,585 vs previous 90d $7,925 = +34% ≥ +25% → +20 close | Sales data |
| +10 | Your documents: campaign applies (sample_campaign_deck.pptx). | document signals: campaign +10 = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 0 / 100

No factors applied.

## Suggested pitch

Go in ready to take an order today.

- They normally reorder Core Products about every 31 days and the last order was 22 days ago. Ask for the reorder (usual size about $3,291). _(Sales data)_
- Their spending is up 34% in 3 months. Thank them and suggest a regular standing order. _(Sales data)_
- Use the current offer: “Campaign for all Wholesale customers: order Core Products and Accessories together as a bundle and receive a 3% rebate at quarter end.” _(sample_campaign_deck.pptx)_
- Use the current offer: “Target: every Wholesale account places at least one bundle order this quarter.” _(sample_campaign_deck.pptx)_

**Ask:** Ask for the Core Products reorder.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Wholesale growth campaign | Already used in the last 30 days | $75 on $2,514 | saving = 3% × $2,514 (their average order in Accessories + Core Products, last 12 months); unused = no purchase of Accessories + Core Products in the last 30 days; terms read from document text | sample_campaign_deck.pptx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_campaign_deck.pptx** › Wholesale growth campaign: Campaign for all Wholesale customers: order Core Products and Accessories together as a bundle and receive a 3% rebate at quarter end. _[campaign]_
- **sample_campaign_deck.pptx** › Wholesale growth campaign: Target: every Wholesale account places at least one bundle order this quarter. _[campaign]_
