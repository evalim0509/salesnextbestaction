# Northwind Trading

- Customer ID: C101
- Salesperson: Aisha Rahman
- Segment: Wholesale
- Status on 15 Nov 2026: **Good chance**
- File generated on this device by fixed rules. No AI language model was used.
- Version: rules 1.8 (2026-11-17); data sample_transactions.xlsx, 2024-11-01 to 2026-11-14

## Performance

| Measure | Value |
|---|---|
| Customer since | 12 Nov 2024 |
| Number of orders | 35 |
| Last order | 21 Oct 2026 (25 days ago) |
| Usual time between orders | 21 days |
| Usual order size | $4,077 |
| Revenue, last 12 months | $66,585 |
| Revenue, 12 months before | $72,325 (-8%) |
| Revenue, last 90 days | $14,055 |
| Revenue, previous 90 days | $17,755 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $30,000 | 21 Oct 2026 |
| Consumables | $20,960 | 21 Oct 2026 |
| Accessories | $15,625 | 21 Oct 2026 |

## Today's assessment

- Usually orders every 21 days, now 25: reorder due.
- Your documents: campaign applies, room to grow (sample_account_plans.docx).
- Spending down 21% on the 3 months before.

### Visit priority: 66 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +58 | One of your biggest customers ($66,585 a year). | 0.6 × max(churn 8, close 48) + 0.1 × min(…) 8 + 0.3 × value percentile 94 (12-month revenue $66,585 ranked among your 36 customers) = 57.8 | Sales data |
| +8 | Your account plan marks them as a priority (sample_account_plans.docx). | document paragraph with priority wording: “Northwind Trading is a top account for Wholesale. Opportunity to grow Accessories volume…” → +8 priority | Documents |

### Chance to close a deal: 48 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +30 | Usually orders every 21 days, now 25: reorder due. | recency 25d ÷ median gap between orders 21d = 1.19 in [0.8, 1.5) → +30 close | Sales data |
| +18 | Your documents: campaign applies, room to grow (sample_account_plans.docx). | document signals: campaign +10, growth +8 = 18, capped at 20 → +18 close | Documents |

### Risk of losing them: 8 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +8 | Spending down 21% on the 3 months before. | revenue last 90d $14,055 vs previous 90d $17,755 = -21% ≤ -10% → +8 churn | Sales data |

## Suggested pitch

Go in ready to take an order today.

- They normally reorder Core Products about every 21 days and the last order was 25 days ago. Ask for the reorder (usual size about $4,077). _(Sales data)_
- Use the current offer: “Northwind Trading is a top account for Wholesale. Opportunity to grow Accessories volume with a bundle offer.” _(sample_account_plans.docx)_
- Use the current offer: “Campaign for all Wholesale customers: order Core Products and Accessories together as a bundle and receive a 3% rebate at quarter end.” _(sample_campaign_deck.pptx)_

**Ask:** Ask for the Core Products reorder.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Wholesale growth campaign | Already used in the last 30 days | $81 on $2,684 | saving = 3% × $2,684 (their average order in Accessories + Core Products, last 12 months); unused = no purchase of Accessories + Core Products in the last 30 days; terms read from document text | sample_campaign_deck.pptx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_account_plans.docx** › Northwind Trading: Northwind Trading is a top account for Wholesale. Opportunity to grow Accessories volume with a bundle offer. _[priority, campaign, growth]_
- **sample_campaign_deck.pptx** › Wholesale growth campaign: Campaign for all Wholesale customers: order Core Products and Accessories together as a bundle and receive a 3% rebate at quarter end. _[campaign]_
- **sample_campaign_deck.pptx** › Wholesale growth campaign: Target: every Wholesale account places at least one bundle order this quarter. _[campaign]_
