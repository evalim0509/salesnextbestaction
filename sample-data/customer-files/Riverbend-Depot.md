# Riverbend Depot

- Customer ID: C109
- Salesperson: Aisha Rahman
- Segment: Wholesale
- Status on 15 Nov 2026: **Steady**
- File generated on this device by fixed rules. No AI language model was used.
- Version: rules 2.0 (2026-11-23); data sample_transactions.xlsx, 2024-11-01 to 2026-11-14

## Performance

| Measure | Value |
|---|---|
| Customer since | 4 Nov 2024 |
| Number of orders | 28 |
| Last order | 11 Nov 2026 (4 days ago) |
| Usual time between orders | 26 days |
| Usual order size | $3,165 |
| Revenue, last 12 months | $43,370 |
| Revenue, 12 months before | $41,220 (+5%) |
| Revenue, last 90 days | $9,360 |
| Revenue, previous 90 days | $8,840 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $28,200 | 11 Oct 2026 |
| Consumables | $15,170 | 11 Nov 2026 |

## Today's assessment

- Similar Wholesale customers buy Accessories; they never have.
- Your documents: unused offer (sample_campaign_deck.pptx).
- One of your biggest customers ($43,370 a year).

### Visit priority: 35 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +35 | One of your biggest customers ($43,370 a year). | 0.6 × max(churn 0, close 20) + 0.1 × min(…) 0 + 0.3 × value percentile 75 (12-month revenue $43,370 ranked among your 36 customers) = 34.5 | Sales data |

### Chance to close a deal: 20 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +10 | Similar Wholesale customers buy Accessories; they never have. | Accessories bought by 9 of 12 Wholesale customers in the last 12 months (≥ 50%), 0 purchases by this customer → +10 close | Sales data |
| +10 | Your documents: unused offer (sample_campaign_deck.pptx). | document signals: campaign +10 (Wholesale growth campaign not used) = 10, capped at 20 → +10 close | Documents |

### Risk of losing them: 0 / 100

No factors applied.

## Suggested pitch

A friendly check-in. Thank them for the steady business and look for one new idea to offer.

- The Wholesale growth campaign applies to them and they have not used it yet. On a $2,564 order of Accessories and Core Products they save about $77 (3% rebate, worth about 3%). _(sample_campaign_deck.pptx)_
- Customers like them usually buy Accessories too. Introduce it as something similar Wholesale customers find useful. _(Sales data)_

**Ask:** Agree the date of their next order before you leave.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Wholesale growth campaign | Not used yet | $77 on $2,564 | saving = 3% × $2,564 (their average order in Accessories + Core Products, last 12 months); unused = no purchase of Accessories + Core Products in the last 30 days; terms read from document text | sample_campaign_deck.pptx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_campaign_deck.pptx** › Wholesale growth campaign: Campaign for all Wholesale customers: order Core Products and Accessories together as a bundle and receive a 3% rebate at quarter end. _[campaign]_
- **sample_campaign_deck.pptx** › Wholesale growth campaign: Target: every Wholesale account places at least one bundle order this quarter. _[campaign]_
