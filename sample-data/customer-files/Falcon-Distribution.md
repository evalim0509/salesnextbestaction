# Falcon Distribution

- Customer ID: C129
- Salesperson: Chloe Tan
- Segment: Wholesale
- Status on 15 Nov 2026: **Good chance**
- File generated on this device by fixed rules. No AI language model was used.

## Performance

| Measure | Value |
|---|---|
| Customer since | 29 Nov 2024 |
| Number of orders | 25 |
| Last order | 12 Oct 2026 (34 days ago) |
| Usual time between orders | 28 days |
| Usual order size | $4,338 |
| Revenue, last 12 months | $53,380 |
| Revenue, 12 months before | $55,060 (-3%) |
| Revenue, last 90 days | $7,925 |
| Revenue, previous 90 days | $19,220 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $26,640 | 12 Oct 2026 |
| Consumables | $16,160 | 12 Oct 2026 |
| Accessories | $10,580 | 12 Oct 2026 |

## Today's assessment

- They are due to reorder now: they usually order about every 28 days and the last order was 34 days ago.
- Your documents say the Wholesale growth campaign applies to them and they have not used it and the account plan sees room to grow (sample_account_plans.docx).
- Their spending is down 59% in the last 3 months compared with the 3 months before.

### Visit priority: 57 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +57 | They are one of your biggest customers ($53,380 in the last 12 months). | 0.6 × max(churn 30, close 48) + 0.1 × min(…) 30 + 0.3 × value percentile 83 (12-month revenue $53,380 ranked among your 36 customers) = 56.7 | Sales data |

### Chance to close a deal: 48 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +30 | They are due to reorder now: they usually order about every 28 days and the last order was 34 days ago. | recency 34d ÷ median gap between orders 28d = 1.21 in [0.8, 1.5) → +30 close | Sales data |
| +18 | Your documents say the Wholesale growth campaign applies to them and they have not used it and the account plan sees room to grow (sample_account_plans.docx). | document signals: campaign +10, growth +8 = 18, capped at 20 → +18 close | Documents |

### Risk of losing them: 30 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +30 | Their spending is down 59% in the last 3 months compared with the 3 months before. | revenue last 90d $7,925 vs previous 90d $19,220 = -59% ≤ -50% → +30 churn | Sales data |

## Suggested pitch

Go in ready to take an order today.

- The Wholesale growth campaign applies to them and they have not used it yet. On a $3,102 order of Accessories and Core Products they save about $93 (3% rebate, worth about 3%). _(sample_campaign_deck.pptx)_
- They normally reorder Core Products about every 28 days and the last order was 34 days ago. Ask for the reorder (usual size about $4,338). _(Sales data)_
- Their spending is down 59% in 3 months. Ask if they are buying part of their needs elsewhere. _(Sales data)_

**Ask:** Ask for the Core Products reorder.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Wholesale growth campaign | Not used yet | $93 on $3,102 | saving = 3% × $3,102 (their average order in Accessories + Core Products, last 12 months); unused = no purchase of Accessories + Core Products in the last 30 days; terms read from document text | sample_campaign_deck.pptx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_account_plans.docx** › Regional sales meeting: Falcon Distribution asked for a quotation on a bundle of Core Products and Accessories. Good opportunity to close before month end. _[campaign, growth]_
- **sample_campaign_deck.pptx** › Wholesale growth campaign: Campaign for all Wholesale customers: order Core Products and Accessories together as a bundle and receive a 3% rebate at quarter end. _[campaign]_
- **sample_campaign_deck.pptx** › Wholesale growth campaign: Target: every Wholesale account places at least one bundle order this quarter. _[campaign]_
