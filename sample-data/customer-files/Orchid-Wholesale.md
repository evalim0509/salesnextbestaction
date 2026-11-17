# Orchid Wholesale

- Customer ID: C105
- Salesperson: Aisha Rahman
- Segment: Wholesale
- Status on 15 Nov 2026: **Watch**
- File generated on this device by fixed rules. No AI language model was used.
- Version: rules 1.6 (2026-11-17); data sample_transactions.xlsx, 2024-11-01 to 2026-11-14

## Performance

| Measure | Value |
|---|---|
| Customer since | 7 Nov 2024 |
| Number of orders | 35 |
| Last order | 10 Nov 2026 (5 days ago) |
| Usual time between orders | 22 days |
| Usual order size | $3,956 |
| Revenue, last 12 months | $57,460 |
| Revenue, 12 months before | $74,665 (-23%) |
| Revenue, last 90 days | $7,460 |
| Revenue, previous 90 days | $11,685 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $36,300 | 10 Nov 2026 |
| Consumables | $17,275 | 10 Nov 2026 |
| Accessories | $3,885 | 28 Apr 2026 |

## Today's assessment

- Their spending is down 36% in the last 3 months compared with the 3 months before.
- Your documents flag a risk on this account (sample_account_plans.docx).
- Your documents say the Wholesale growth campaign applies to them and they have not used it (sample_campaign_deck.pptx).

### Visit priority: 45 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +45 | They are one of your biggest customers ($57,460 in the last 12 months). | 0.6 × max(churn 30, close 10) + 0.1 × min(…) 10 + 0.3 × value percentile 86 (12-month revenue $57,460 ranked among your 36 customers) = 44.8 | Sales data |

### Chance to close a deal: 10 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +10 | Your documents say the Wholesale growth campaign applies to them and they have not used it (sample_campaign_deck.pptx). | document signals: campaign +10 = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 30 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +20 | Their spending is down 36% in the last 3 months compared with the 3 months before. | revenue last 90d $7,460 vs previous 90d $11,685 = -36% ≤ -25% → +20 churn | Sales data |
| +10 | Your documents flag a risk on this account (sample_account_plans.docx). | document paragraph linked to customer with risk wording: “Orchid Wholesale has reduced its orders. The buyer said budgets are tight; consider a…” → +10 churn | Documents |

## Suggested pitch

Go in to listen first. Ask how things are going with their orders before you talk about products.

- The Wholesale growth campaign applies to them and they have not used it yet. On a $2,364 order of Accessories and Core Products they save about $71 (3% rebate, worth about 3%). _(sample_campaign_deck.pptx)_
- They used to buy Accessories (last time 28 Apr 2026) and then stopped. Ask why and whether they still need it. _(Sales data)_
- Their spending is down 36% in 3 months. Ask if they are buying part of their needs elsewhere. _(Sales data)_
- Be aware: “Orchid Wholesale has reduced its orders. The buyer said budgets are tight; consider a smaller, more frequent order plan to keep them from declining further.” _(sample_account_plans.docx)_

**Ask:** Ask for one small order this week to get things moving again.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Wholesale growth campaign | Not used yet | $71 on $2,364 | saving = 3% × $2,364 (their average order in Accessories + Core Products, last 12 months); unused = no purchase of Accessories + Core Products in the last 30 days; terms read from document text | sample_campaign_deck.pptx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_account_plans.docx** › Regional sales meeting: Orchid Wholesale has reduced its orders. The buyer said budgets are tight; consider a smaller, more frequent order plan to keep them from declining further. _[risk]_
- **sample_campaign_deck.pptx** › Wholesale growth campaign: Campaign for all Wholesale customers: order Core Products and Accessories together as a bundle and receive a 3% rebate at quarter end. _[campaign]_
- **sample_campaign_deck.pptx** › Wholesale growth campaign: Target: every Wholesale account places at least one bundle order this quarter. _[campaign]_
