# Maple Street Market

- Customer ID: C114
- Salesperson: Ben Carter
- Segment: Retail
- Status on 15 Nov 2026: **Good chance**
- File generated on this device by fixed rules. No AI language model was used.
- Version: rules 1.9 (2026-11-17); data sample_transactions.xlsx, 2024-11-01 to 2026-11-14

## Performance

| Measure | Value |
|---|---|
| Customer since | 12 Nov 2024 |
| Number of orders | 51 |
| Last order | 29 Oct 2026 (17 days ago) |
| Usual time between orders | 14 days |
| Usual order size | $1,428 |
| Revenue, last 12 months | $33,255 |
| Revenue, 12 months before | $38,350 (-13%) |
| Revenue, last 90 days | $7,265 |
| Revenue, previous 90 days | $8,485 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $14,700 | 12 Oct 2026 |
| Consumables | $9,955 | 29 Oct 2026 |
| Accessories | $8,600 | 29 Oct 2026 |

## Today's assessment

- Usually orders every 14 days, now 17: reorder due.
- Your documents: campaign applies (sample_campaign_deck.pptx).
- Spending down 14% on the 3 months before.

### Visit priority: 50 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +42 | A mid-sized customer ($33,255 a year). | 0.6 × max(churn 8, close 40) + 0.1 × min(…) 8 + 0.3 × value percentile 58 (12-month revenue $33,255 ranked among your 36 customers) = 42.2 | Sales data |
| +8 | Your account plan marks them as a priority (sample_campaign_deck.pptx). | document paragraph with priority wording: “Maple Street Market: strategic Retail account; offer the Consumables promotion on the…” → +8 priority | Documents |

### Chance to close a deal: 40 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +30 | Usually orders every 14 days, now 17: reorder due. | recency 17d ÷ median gap between orders, 11 gaps across a festive period left out 14d = 1.21 in [0.8, 1.5) → +30 close | Sales data |
| +10 | Your documents: campaign applies (sample_campaign_deck.pptx). | document signals: campaign +10 = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 8 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +8 | Spending down 14% on the 3 months before. | revenue last 90d $7,265 vs previous 90d $8,485 = -14% ≤ -10% → +8 churn | Sales data |

## Suggested pitch

Go in ready to take an order today.

- They normally reorder Core Products about every 14 days and the last order was 17 days ago. Ask for the reorder (usual size about $1,428). _(Sales data)_
- Use the current offer: “Maple Street Market: strategic Retail account; offer the Consumables promotion on the next visit.” _(sample_campaign_deck.pptx)_
- Use the current offer: “Campaign for all Retail customers: buy 10 cases of Consumables and get 1 case free, valid until 31 December. Salespeople can offer this promotion on the spot without approval.” _(sample_account_plans.docx)_

**Ask:** Ask for the Core Products reorder.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Year-end Retail campaign | Already used in the last 30 days, valid until 31 Dec 2026 | $57 on $622 | saving = 9.1% × $622 (their average order in Consumables, last 12 months); unused = no purchase of Consumables in the last 30 days; terms read from document text | sample_account_plans.docx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_campaign_deck.pptx** › Accounts to watch: Maple Street Market: strategic Retail account; offer the Consumables promotion on the next visit. _[priority, campaign]_
- **sample_account_plans.docx** › Year-end Retail campaign: Campaign for all Retail customers: buy 10 cases of Consumables and get 1 case free, valid until 31 December. Salespeople can offer this promotion on the spot without approval. _[campaign]_
