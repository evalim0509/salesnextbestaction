# Harbor Point Wholesale

- Customer ID: C113
- Salesperson: Ben Carter
- Segment: Wholesale
- Status on 15 Nov 2026: **Likely to close**
- File generated on this device by fixed rules. No AI language model was used.
- Version: rules 1.8 (2026-11-17); data sample_transactions.xlsx, 2024-11-01 to 2026-11-14

## Performance

| Measure | Value |
|---|---|
| Customer since | 16 Nov 2024 |
| Number of orders | 36 |
| Last order | 31 Oct 2026 (15 days ago) |
| Usual time between orders | 20 days |
| Usual order size | $4,798 |
| Revenue, last 12 months | $107,185 |
| Revenue, 12 months before | $64,755 (+66%) |
| Revenue, last 90 days | $35,185 |
| Revenue, previous 90 days | $26,805 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $57,900 | 31 Oct 2026 |
| Consumables | $30,675 | 31 Oct 2026 |
| Accessories | $18,610 | 31 Oct 2026 |

## Today's assessment

- Spending up 31% on the 3 months before.
- Your documents: campaign applies, room to grow (sample_campaign_deck.pptx).
- Usually orders every 20 days, now 15: order coming up.

### Visit priority: 60 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +60 | One of your biggest customers ($107,185 a year). | 0.6 × max(churn 0, close 50) + 0.1 × min(…) 0 + 0.3 × value percentile 100 (12-month revenue $107,185 ranked among your 36 customers) = 60.0 | Sales data |

### Chance to close a deal: 50 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +12 | Usually orders every 20 days, now 15: order coming up. | recency 15d ÷ 20d = 0.75 in [0.6, 0.8) → +12 close | Sales data |
| +20 | Spending up 31% on the 3 months before. | revenue last 90d $35,185 vs previous 90d $26,805 = +31% ≥ +25% → +20 close | Sales data |
| +18 | Your documents: campaign applies, room to grow (sample_campaign_deck.pptx). | document signals: campaign +10, growth +8 = 18, capped at 20 → +18 close | Documents |

### Risk of losing them: 0 / 100

No factors applied.

## Suggested pitch

Go in ready to take an order today.

- They normally reorder Core Products about every 20 days and the last order was 15 days ago. Ask for the reorder (usual size about $4,798). _(Sales data)_
- Their spending is up 31% in 3 months. Thank them and suggest a regular standing order. _(Sales data)_
- Use the current offer: “Campaign for all Wholesale customers: order Core Products and Accessories together as a bundle and receive a 3% rebate at quarter end.” _(sample_campaign_deck.pptx)_
- Use the current offer: “Target: every Wholesale account places at least one bundle order this quarter.” _(sample_campaign_deck.pptx)_

**Ask:** Ask for the Core Products reorder.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Wholesale growth campaign | Already used in the last 30 days | $128 on $4,272 | saving = 3% × $4,272 (their average order in Accessories + Core Products, last 12 months); unused = no purchase of Accessories + Core Products in the last 30 days; terms read from document text | sample_campaign_deck.pptx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_campaign_deck.pptx** › Accounts to watch: Harbor Point Wholesale: growing fast, opportunity to upsell a standing weekly order. _[growth]_
- **sample_campaign_deck.pptx** › Wholesale growth campaign: Campaign for all Wholesale customers: order Core Products and Accessories together as a bundle and receive a 3% rebate at quarter end. _[campaign]_
- **sample_campaign_deck.pptx** › Wholesale growth campaign: Target: every Wholesale account places at least one bundle order this quarter. _[campaign]_
