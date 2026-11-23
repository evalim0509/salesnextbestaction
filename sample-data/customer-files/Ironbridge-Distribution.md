# Ironbridge Distribution

- Customer ID: C117
- Salesperson: Ben Carter
- Segment: Wholesale
- Status on 15 Nov 2026: **Collect first**
- File generated on this device by fixed rules. No AI language model was used.
- Version: rules 2.0 (2026-11-23); data sample_transactions.xlsx, 2024-11-01 to 2026-11-14

## Performance

| Measure | Value |
|---|---|
| Customer since | 15 Nov 2024 |
| Number of orders | 32 |
| Last order | 6 Sep 2026 (70 days ago) |
| Usual time between orders | 21 days |
| Usual order size | $4,411 |
| Revenue, last 12 months | $64,785 |
| Revenue, 12 months before | $73,810 (-12%) |
| Revenue, last 90 days | $4,235 |
| Revenue, previous 90 days | $17,135 |

### What they buy

| Category | Last 12 months | Last bought |
|---|---:|---|
| Core Products | $32,280 | 6 Sep 2026 |
| Consumables | $22,435 | 6 Sep 2026 |
| Accessories | $10,070 | 6 Sep 2026 |

## Today's assessment

- Spending down 75% on the 3 months before.
- Usually orders every 21 days, now 70.
- Your documents flag a risk (sample_account_plans.docx).

### Visit priority: 65 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +65 | One of your biggest customers ($64,785 a year). | 0.6 × max(churn 63, close 0) + 0.1 × min(…) 0 + 0.3 × value percentile 92 (12-month revenue $64,785 ranked among your 36 customers) = 65.4 | Sales data |

### Chance to close a deal: 0 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +10 | Your documents: unused offer (sample_campaign_deck.pptx). | document signals: campaign +10 (Wholesale growth campaign not used) = 10, capped at 20 → +10 close | Documents |
| -10 | On credit hold: collect $4,250 first. | credit hold from the Credit sheet (hold = yes) → close score set to 0, no sales push | Credit sheet |

### Risk of losing them: 63 / 100

| Points | In plain English | Technical trace | Source |
|---:|---|---|---|
| +23 | Usually orders every 21 days, now 70. | recency 70d ÷ median gap between orders, 9 gaps across a festive period left out 21d = 3.41 ≥ 3 → +45 churn; ×0.5 = +23 because Deepavali ended 2026-11-10 (within 14 days) | Sales data |
| +30 | Spending down 75% on the 3 months before. | revenue last 90d $4,235 vs previous 90d $17,135 = -75% ≤ -50% → +30 churn | Sales data |
| +10 | Your documents flag a risk (sample_account_plans.docx). | document paragraph linked to customer with risk wording: “Ironbridge Distribution complained about two late deliveries last quarter. Operations has…” → +10 churn | Documents |

## Suggested pitch

Collect first. Agree a payment date before talking about new orders.

- They are on credit hold with $4,250 overdue. Ask for payment or a firm payment date today. _(Credit sheet)_
- The Wholesale growth campaign applies to them and they have not used it yet. On a $3,025 order of Accessories and Core Products they save about $91 (3% rebate, worth about 3%). _(sample_campaign_deck.pptx)_
- They normally order every 21 days and it has been 70. Ask openly: “I noticed we have not had an order for a while. Did something change?” _(Sales data)_
- Be aware: “Ironbridge Distribution complained about two late deliveries last quarter. Operations has since changed the route. Reassure them and ask for a trial order.” _(sample_account_plans.docx)_

**Ask:** Agree a payment date for the $4,250 overdue.

## Campaigns that apply

| Campaign | Status | Saving | Technical trace | Source |
|---|---|---:|---|---|
| Wholesale growth campaign | Not used yet | $91 on $3,025 | saving = 3% × $3,025 (their average order in Accessories + Core Products, last 12 months); unused = no purchase of Accessories + Core Products in the last 30 days; terms read from document text | sample_campaign_deck.pptx |

## Visit notes

No notes yet.

## What you know (context notes)

No context notes yet.

## Deals logged in the app

None yet.

## From your documents

- **sample_account_plans.docx** › Ironbridge Distribution: Ironbridge Distribution complained about two late deliveries last quarter. Operations has since changed the route. Reassure them and ask for a trial order. _[risk]_
- **sample_campaign_deck.pptx** › Wholesale growth campaign: Campaign for all Wholesale customers: order Core Products and Accessories together as a bundle and receive a 3% rebate at quarter end. _[campaign]_
- **sample_campaign_deck.pptx** › Wholesale growth campaign: Target: every Wholesale account places at least one bundle order this quarter. _[campaign]_
