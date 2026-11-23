# Pacific Rim Wholesale

- Customer ID: C125
- Salesperson: Chloe Tan
- Segment: Wholesale
- Status on 15 Nov 2026: **Steady**
- File generated on this device by fixed rules. No AI language model was used.
- Version: rules 2.0 (2026-11-23); data sample_transactions.xlsx, 2024-11-01 to 2026-11-14

## Performance

| Measure | Value |
|---|---|
| Customer since | 10 Nov 2024 |
| Number of orders | 35 |
| Last order | 29 Oct 2026 (17 days ago) |
| Usual time between orders | 22 days |
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

- Usually orders every 22 days, now 17: order coming up.
- Your documents: campaign applies (sample_campaign_deck.pptx).
- One of your biggest customers ($74,260 a year).

### Visit priority: 42 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +42 | One of your biggest customers ($74,260 a year). | 0.6 × max(churn 0, close 22) + 0.1 × min(…) 0 + 0.3 × value percentile 97 (12-month revenue $74,260 ranked among your 36 customers) = 42.3 | Sales data |

### Chance to close a deal: 22 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +12 | Usually orders every 22 days, now 17: order coming up. | recency 17d ÷ 22d = 0.77 in [0.6, 0.8) → +12 close | Sales data |
| +10 | Your documents: campaign applies (sample_campaign_deck.pptx). | document signals: campaign +10 = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 0 / 100

No factors applied.

## Suggested pitch

A friendly check-in. Thank them for the steady business and look for one new idea to offer.

- They normally reorder Core Products about every 22 days and the last order was 17 days ago. Ask for the reorder (usual size about $4,296). _(Sales data)_
- Use the current offer: “Campaign for all Wholesale customers: order Core Products and Accessories together as a bundle and receive a 3% rebate at quarter end.” _(sample_campaign_deck.pptx)_
- Use the current offer: “Target: every Wholesale account places at least one bundle order this quarter.” _(sample_campaign_deck.pptx)_

**Ask:** Agree the date of their next order before you leave.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Wholesale growth campaign | Already used in the last 30 days | $87 on $2,908 | saving = 3% × $2,908 (their average order in Accessories + Core Products, last 12 months); unused = no purchase of Accessories + Core Products in the last 30 days; terms read from document text | sample_campaign_deck.pptx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_campaign_deck.pptx** › Wholesale growth campaign: Campaign for all Wholesale customers: order Core Products and Accessories together as a bundle and receive a 3% rebate at quarter end. _[campaign]_
- **sample_campaign_deck.pptx** › Wholesale growth campaign: Target: every Wholesale account places at least one bundle order this quarter. _[campaign]_
