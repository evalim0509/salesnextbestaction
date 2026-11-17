# Tidewater Traders

- Customer ID: C135
- Salesperson: Chloe Tan
- Segment: Wholesale
- Status on 15 Nov 2026: **May churn**
- File generated on this device by fixed rules. No AI language model was used.
- Version: rules 1.8 (2026-11-17); data sample_transactions.xlsx, 2024-11-01 to 2026-11-14

## Performance

| Measure | Value |
|---|---|
| Customer since | 17 Nov 2024 |
| Number of orders | 33 |
| Last order | 9 Sep 2026 (67 days ago) |
| Usual time between orders | 21 days |
| Usual order size | $2,925 |
| Revenue, last 12 months | $40,445 |
| Revenue, 12 months before | $56,095 (-28%) |
| Revenue, last 90 days | $6,345 |
| Revenue, previous 90 days | $10,230 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $17,700 | 9 Sep 2026 |
| Consumables | $14,690 | 9 Sep 2026 |
| Accessories | $8,055 | 9 Sep 2026 |

## Today's assessment

- Usually orders every 21 days, now 67.
- Spending down 38% on the 3 months before.
- Your documents flag a risk (sample_campaign_deck.pptx).

### Visit priority: 67 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +67 | One of your biggest customers ($40,445 a year). | 0.6 × max(churn 75, close 10) + 0.1 × min(…) 10 + 0.3 × value percentile 69 (12-month revenue $40,445 ranked among your 36 customers) = 66.7 | Sales data |

### Chance to close a deal: 10 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +10 | Your documents: unused offer (sample_campaign_deck.pptx). | document signals: campaign +10 (Wholesale growth campaign not used) = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 75 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +45 | Usually orders every 21 days, now 67. | recency 67d ÷ median gap between orders 21d = 3.19 ≥ 3 → +45 churn | Sales data |
| +20 | Spending down 38% on the 3 months before. | revenue last 90d $6,345 vs previous 90d $10,230 = -38% ≤ -25% → +20 churn | Sales data |
| +10 | Your documents flag a risk (sample_campaign_deck.pptx). | document paragraph linked to customer with risk wording: “Tidewater Traders: orders have stopped; at risk of churn. Visit this week.” → +10 churn | Documents |

## Suggested pitch

Go in to listen first. Ask how things are going with their orders before you talk about products.

- The Wholesale growth campaign applies to them and they have not used it yet. On a $1,840 order of Accessories and Core Products they save about $55 (3% rebate, worth about 3%). _(sample_campaign_deck.pptx)_
- They normally order every 21 days and it has been 67. Ask openly: “I noticed we have not had an order for a while. Did something change?” _(Sales data)_
- Be aware: “Tidewater Traders: orders have stopped; at risk of churn. Visit this week.” _(sample_campaign_deck.pptx)_

**Ask:** Ask for one small order this week to get things moving again.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Wholesale growth campaign | Not used yet | $55 on $1,840 | saving = 3% × $1,840 (their average order in Accessories + Core Products, last 12 months); unused = no purchase of Accessories + Core Products in the last 30 days; terms read from document text | sample_campaign_deck.pptx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_campaign_deck.pptx** › Accounts to watch: Tidewater Traders: orders have stopped; at risk of churn. Visit this week. _[risk]_
- **sample_campaign_deck.pptx** › Wholesale growth campaign: Campaign for all Wholesale customers: order Core Products and Accessories together as a bundle and receive a 3% rebate at quarter end. _[campaign]_
- **sample_campaign_deck.pptx** › Wholesale growth campaign: Target: every Wholesale account places at least one bundle order this quarter. _[campaign]_
