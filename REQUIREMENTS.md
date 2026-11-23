# Nudge: business requirements

This is the living record of what the product must do. It is updated every time a feature is added or changed (see the change log at the bottom). The code is expected to match this document.

Last updated: 15 Nov 2026

## 1. Purpose

Tell each salesperson their next best action every day, in plain English: who to visit, who is ready to buy, who may leave, and what to say. Give management a simple view of growth against last year, and an honest track record of how often Nudge is right.

Nudge is an independent app, not an add-on to a CRM. The whole product is three steps: **upload → insights → export**. How it differs from Salesforce's AI features is set out in [docs/NUDGE_VS_SALESFORCE.md](docs/NUDGE_VS_SALESFORCE.md).

## 2. Users

| User | What they need |
|---|---|
| Salesperson (not tech savvy, on a phone) | A short morning brief and a tailored pitch per customer. No reports, no typing. |
| Sales management | A revenue dashboard showing growth against last year, and Nudge's track record. |

## 3. Requirements

Status: Done = built and tested. Pilot limit = works within the limit described. Open = not built.

### 3.1 Platform and confidentiality

| ID | Requirement | Status |
|---|---|---|
| P1 | Live interactive website designed for mobile phones. No terminal or installation needed to use it. | Done (needs GitHub Pages switched on once, see README) |
| P2 | Code is stored in the connected GitHub repository. | Done |
| P3 | No LLM or AI service anywhere. All analysis is fixed rules and arithmetic. | Done |
| P4 | Data stays confidential. Uploaded files, notes and deals are read and stored on the phone only (browser storage). Nothing is sent to a server. The page loads no outside scripts or fonts. | Done |
| P5 | No login for the pilot. A dropdown in the header switches between salespeople. The chat never asks "who are you". The first salesperson is selected by default and the choice is remembered. | Done |
| P7 | The product is called Nudge. The header shows only the orb, the name, the salesperson dropdown and the menu button (no status dot, no "private" label). | Done |
| P6 | Each salesperson sees only their own customers in the brief. | Pilot limit: with no login, anyone holding the file can pick another salesperson from the dropdown. |

| P8 | Independent, installable app: can be added to the phone's home screen, opens full screen and works with no signal once installed. | Done (needs the site to be live on https) |
| P9 | The home page shows the three steps: 1 Upload, 2 Insights, 3 Export. | Done |

### 3.2 Uploading data

| ID | Requirement | Status |
|---|---|---|
| U1 | User uploads Excel (.xlsx, .xls, .csv), Word (.docx) and PowerPoint (.pptx) files from the phone. | Done. Old .doc and .ppt files are refused with instructions to re-save. |
| U2 | Sales data is transaction level: one row per sale line. Needs Date, Customer and Amount; also uses Salesperson, Customer ID, Segment, Product Category, Product, Quantity, Unit Price, Invoice No when present. Column names are matched flexibly. | Done |
| U3 | Word and PowerPoint files hold written account plans, strategy, marketing campaign plans and meeting notes. The app links each paragraph to customers by name and uses it in scoring and pitches. | Done |
| U4 | Uploading a newer sales file adds to what is loaded; rows already loaded are skipped. | Done |
| U5 | Sample data and sample Word and PowerPoint documents are provided for testing. | Done (`sample-data/`) |
| U6 | Monthly targets come from an optional "Targets" sheet in the sales file: Salesperson, Month, Target. | Done |
| U7 | Campaign terms come from an optional "Campaigns" sheet: Campaign, Segment, Category, Discount %, Minimum Spend, End Date, Description. Without the sheet, simple terms ("5% discount", "3% rebate", "buy 10 get 1 free", "until 31 December") are read from Word and PowerPoint text and marked as read from text. | Done |

### 3.2a Trust foundation (Phase 1)

| ID | Requirement | Status |
|---|---|---|
| T1 | Upload health check card after every sales upload: total lines and total revenue with a "This matches my accounts" button; date range; duplicate lines removed; negative lines (returns, credit notes); lines with no salesperson (given the customer's usual salesperson); dates in the future; lines that could not be read. | Done |
| T2 | Customer names that look like variants of each other ("Lakeside Mart" and "Lakeside Mart Sdn Bhd") are listed with Merge or Keep apart. A merge is remembered for future uploads; keep apart is never asked again. | Done |
| T3 | Date format: real Excel dates need no question. Text dates are checked; a part above 12 proves day/month or month/day. When nothing proves it, Nudge asks with two buttons showing a sample date both ways, and loads nothing until answered. | Done |
| T4 | Hard stop: a file is not loaded when Date, Customer or Amount columns are missing, or more than 20% of lines cannot be read. | Done |
| T5 | The confirmation is stored. While the latest upload is not confirmed, the brief shows "Figures not yet confirmed". | Done |
| T6 | "Show me the orders": every fact and factor from sales data links, inside "How I got this", to the actual lines behind it (date, invoice, product, amount; at most 20, newest first): usual rhythm, last order, spending up or down, usual order size, category gap. | Done |
| T7 | A quiet line on every screen: "Sales up to Mon 16 Nov (1 day old)", amber when older than 7 days. | Done |
| T8 | Every customer card shows "Based on N orders" (since 23 Nov 2026 not on the slim visit rows); under 4 orders adds "rough guess, few orders". Customers with fewer than 2 orders are never in today's visits unless a note or document makes them a priority. | Done |
| T9 | Every recommendation's trail says what Nudge cannot see: "I don't see credit holds, stock, or contact outside Nudge." | Done |
| T10 | "How Nudge decides" page in the menu: every rule in plain words with its points, generated from the rules the app runs plus approved changes, dated with the rules version, with a live "Same file, same answer" check. | Done |
| T11 | Rules version stamp (currently 1.6, 17 Nov 2026). Every trail and export records the rules version, approved changes, data file names and date range. | Done |
| T12 | Test: the same state run twice gives exactly the same brief. | Done |

### 3.2b The rep stays in charge, and easier reading (Phase 2)

| ID | Requirement | Status |
|---|---|---|
| C1 | Suggestions say "worth a visit" or "worth a check", never "must". Visit rows show the customer name, the band and the reason in one line: "12 days late, usually every 30 days" (or "reorder due", "ready to buy", "Collect first: RM… overdue"). | Done |
| C2 | Compare with the customer's normal: "Usually orders every 14 days, now 26." Ratios and points appear only in "How I got this". | Done |
| C3 | Bands on rep screens instead of 0–100 scores: chance to close Likely / Maybe / Unlikely; risk of leaving At risk / Watch / Steady. Each band word carries a shape, never colour alone. | Done |
| C4 | "Wrong, because…" on every visit row (swipe left) and customer card: shop closed, on credit hold, visited recently, not my customer, other. Closed or not mine: no suggestions until a new order. Credit hold: 30 days. Visited recently: the recently-contacted penalty. Confirmed in one line; the customer is replaced in today's visits; logged for the manager (Dashboard, weekly digest) and the Excel export. | Done |
| C5 | Swap a visit (swipe left on the row): replace any of today's visits with a customer picked from the list, with a reason. Recorded as feedback, not as a skipped visit. | Done |
| C6 | When a note changed a suggestion, the card says "You told me on Tue 3 Nov: budget approved". | Done |
| C7 | The note screen says who can see notes. | Done |
| C8 | Readability: currency RM by default (a setting); screen dates as "Tue 12 Nov" (technical dates stay in the trail); one number per tile and one sentence per card; every colour paired with a word or arrow; body text at least 16px; main buttons within thumb reach; checked on a 360px-wide screen. | Done |
| C9 | Animations and motion stay on (owner decision, 17 Nov 2026, overriding "animation off by default"). Confetti and the note-screen tone orb are kept. A Motion switch in the menu turns all motion off; the phone's reduce-motion setting is respected. | Done |
| C10 | Malay interface, switched in the menu. Every fixed label and every sentence template in engine.js has an English–Malay pair in one table (`js/i18n-pairs.js`). Names, numbers and dates are carried over; day and month names are translated. Technical calculations in "How I got this", the customer .md file and exports stay in English for now. A test fails when an engine sentence has no Malay pair. | Done (Malay drafted for native-speaker review) |

### 3.3 Morning brief (main tab)

| ID | Requirement | Status |
|---|---|---|
| B1 | Simple, professional chat interface in the look of the reference screenshot (soft sky background, glass cards, dark pill buttons, floating bottom bar, assistant orb). | Done |
| B8 | The brief opens with an executive summary: my revenue against last year, revenue at risk, the value of today's visits, customers ready to buy, and offers and renewals from the uploaded documents. | Done |
| B9 | Replies do not appear instantly: thinking dots show first, then the words type out. Tapping the chat skips to the full text. People who switch off motion on their phone get instant text. | Done |
| B10 | The bottom bar is one row with no typing box: upload, a "Record a visit note" button and the customer list. The shortcuts (Today's brief, Close my gap, Likely to close, May churn, Wrap up my day) sit on the Home screen as buttons; the orb in the header goes back to Home. | Done |
| B13 | Home page, kept minimal: the orb, "Hey {name}, what can I do for you today?", the target status and one "Today's brief" button. "More" opens the other shortcuts (Close my gap when there is a target gap, Likely to close, May churn, Wrap up my day). The app opens here, and tapping the orb returns here from anywhere. | Done |
| B14 | The orb shows the day's mood: green when month-to-date sales are at or above target pace, amber when behind. With no target it compares with last year. | Done |
| B15 | Monthly target in the brief: how much is closed, how much more is needed and the days left, plus which customers to approach to close the gap, each with their usual order size and any offer that applies. Also available as "Close my gap". | Done |
| B17 | Campaign expiry nudges: when a campaign ends within 7 days, the brief and manager brief say so, list the eligible customers who have not used it and the total they could save. | Done |
| B18 | A thin ring around the orb fills as the month's target is reached. The orb itself is abstract and multi-shaded (drifting layers), not one flat colour; its hues still follow the day's mood. It is animated: colour blobs wander on separate paths while the field turns and the orb gently pulses. Motion stops for people who switch off animation on their phone. | Done |
| B16 | "My brief" and "Revenue dashboard" are reached from the three-dots menu; there is no bottom tab bar. | Done |
| B2 | Everything is done with buttons. Typing is allowed in two places only: a visit note (owner decision, 15 Nov 2026) and an optional exact deal amount. | Done |
| B3 | Suggest the top 3 customers to visit each day, with reasons in plain English. | Done |
| B4 | Show which customers are likely to close a deal. | Done |
| B5 | Show which customers may churn. | Done |
| B6 | Every response has an audit trail, "How I got this", as a small link under the reply: the numbers used, the rule and the source. This covers the brief, offers, visit list, lists, customer card, pitch, gap, notes, deals, wrap-up, uploads, exports and the manager brief. | Done |
| B7 | No complicated report layouts for the salesperson. | Done |

| B11 | Today's 3 visits are a fixed plan for the day. Each can be marked visited, or skipped with a reason picked from a list. Saving a note or deal for a planned customer marks it visited. A new sales upload refreshes a plan nobody has started. | Done |
| B12 | End-of-day wrap-up ("Wrap up my day"): visits done, skipped and still open, deals closed today, notes saved and notes still missing, and tomorrow's likely visits. | Done |

| B19 | Clean first glance: replies lead with visuals and a few words (tiles, score meters, target bar, order rhythm bar, 12-month spend line); sentences and explanations open on tap. | Done |
| B20 | Morning brief layout: one headline, target bar, three tappable tiles (at risk, ready to buy, ending soon), collapsed "How to close the gap" and "Offers to use today", then the visit rows. | Done |
| B21 | Customer card: a + button beside the name adds a visit note; only "What to say" and "Why this customer" are text buttons; customer file and export are icons; "Done" records a closed deal. | Done |
| B22 | "What to say" shows short numbered titles; each opens to the full sentence and its source. "Why this customer" shows three meters and short factor names with points; each opens to the sentence and calculation. | Done |
| B23 | Orb states are clearly visible: stronger colours and glow; a fast spin with a pulsing halo while thinking; violet with ripples while listening to a voice note; a green flash on a closed deal. | Done |
| B24 | First-run welcome page: the Upload, Insights, Export steps are a small, quiet row. Not shown on Home once data is loaded (Upload is on the bottom bar, Export in the menu). | Done |
| B25 | Menu wording: Export, Brief, Dashboard. No "use it like an app" section (the app can still be installed from the browser). | Done |

| B27 | Today's visits are slim rows, like iPhone Mail: number, customer name, band, one-line reason, and "You told me…" when a note changed it. Swipe right past the line to mark visited (green, "✓ Visited"); swipe left to show Skip today, Swap and Wrong, because…; tap to open the customer. A marked row shows "✓ Visited" or "Skipped: reason", Undo and, after a visit, Send reorder message. Until the first swipe, the list shows "Swipe right when visited. Swipe left to skip, swap or say it is wrong." and the first row peeks left once (not when Motion is off). Keyboard and screen readers reach the hidden actions; focusing one opens the row. | Done |
| B26 | Each customer card (moved from the visit rows on 23 Nov 2026) carries a small coloured dot with an arrow and percentage: the customer's spend in the last 90 days against the 90 before (green up, red down, grey steady). | Done |

### 3.4 Customer notes and pitch

| ID | Requirement | Status |
|---|---|---|
| N1 | There is a .md file for each customer, holding performance, today's assessment with its working, the pitch, visit notes, deals and document excerpts. It can be viewed and downloaded (one file, or all as a .zip). | Done. Files are generated on the phone; examples are in `sample-data/customer-files/`. |
| N2 | After a visit the salesperson records a note as keywords (tapped from a fixed list). | Done |
| N3 | Notes can be recorded by voice or typed. The words are matched to the same keyword list, and the text is kept in the customer file. | Done. See risk R1. |
| N6 | "Staying with us" keyword: the salesperson's judgement that a customer will not leave (tap, say or type, for example "won't churn", "staying", "renewed"). It takes 30 points off the risk score for 30 days, is shown as "Your judgement" in the audit trail, and fades unless an order arrives. | Done |
| N7 | If a spoken or typed note matches no keyword, the note screen says so and asks the salesperson to tap one before saving; "Save anyway" keeps the text only. | Done |
| N8 | Two ways to save a note. "Save for scores": keywords move the scores and the pitch. "Save as context": a longer note kept as background knowledge (a second brain), with no keyword matching and no effect on any score; it is not counted as a visit. | Done |
| N9 | Context notes appear under "What you know" on the customer card, as a "Remember" line above "What to say", in the customer file and in internal exports. Never in the customer-facing one-pager. | Done |
| N10 | While the salesperson speaks or types, the orb on the note screen turns green for good news and red for concerns, from the keywords found so far, with a one-line label. | Done (colour change tested with a simulated microphone) |
| N11 | A voice note can be deleted and recorded again without leaving the note screen; keywords the recording switched on are cleared with it. | Done |
| N5 | Campaigns are linked to customers: the pitch, brief and customer file say which campaign applies, whether the customer has used it, and how much they would save on a typical order. | Done |
| N4 | Notes work together with the uploaded data and documents to customise the pitch for that customer. | Done |

### 3.5a Prove it works: track record (Phase 3)

| ID | Requirement | Status |
|---|---|---|
| P1 | No leaks in the replay: past dates use only the sales, notes and feedback known then, and documents and campaigns only from the day they were uploaded (upload dates are now recorded). The method text says how many documents and campaigns were old enough to count. | Done |
| P2 | Compared with simple alternatives on the same 14-day window: random customers (expected result), biggest by 12-month revenue, simple overdue sort (days since last order ÷ usual gap), Nudge's top 3. Each shows its order rate and revenue per pick. | Done |
| P3 | Results by band: how often Likely, Maybe and Unlikely customers ordered within 14 days, against all active customers. | Done |
| P4 | Scoreboard on the Dashboard: "Last 8 weeks: customers I marked Likely ordered within 14 days X% of the time. All your customers: Y%.", plus the latest misses ("I said Lakeside would order. They didn't."). Shown on the Dashboard only (removed from the rep's Home on 23 Nov 2026 to keep it minimal). | Done |
| P5 | "Your pick vs Nudge's pick": a rep or manager marks up to 3 customers for the week; after 14 days the app shows who ordered next to Nudge's top 3 from the same day, and keeps score over time. | Done |
| P6 | Holdout: each day a fixed random share (default 20%, setting in the menu) of eligible customers is held back, using a seed per salesperson and day so it can be reproduced. Held-back customers are never suggested that day. After 14 days, order rate and revenue of shown and held-back customers (among those who would have been suggested) are compared and shown as "Revenue Nudge helped add (estimate)" with the sample sizes. | Done (results appear 14 days after the first recorded day) |
| P7 | "Incremental revenue" renamed "Growth vs last year" everywhere; only the holdout result may be called incremental. | Done |
| P8 | Tests for the leak fix, the baselines, the band results, the holdout split and the pick score. | Done |

### 3.5b Field reality (Phase 4)

| ID | Requirement | Status |
|---|---|---|
| F1 | Optional Area or Postcode column (matched flexibly). When present, today's visits come from one area: the area with the highest total visit priority among eligible customers. The rep switches area with one tap. 3 main visits plus up to 4 "Also nearby" from the same area. Without the column, nothing changes. | Done |
| F2 | Optional Credit Hold (yes/no) or Overdue Amount column, on the sales rows or in a separate "Credit" sheet. Customers on hold get no close-a-deal push; they get "Collect first" with the overdue amount, a payment-first pitch, and no reorder message. The blind-spots line drops "credit holds" once credit data is loaded. | Done |
| F3 | Festive periods in the menu, with Malaysian defaults (Chinese New Year, Hari Raya Aidilfitri, Deepavali, Christmas) for 2024 to 2027, dates editable for each year. Gaps between orders that span a festive period are left out of the usual-rhythm median. The overdue factor is halved for 14 days after a festive period. | Done (default dates should be checked against the official calendar) |
| F4 | Optional Parent or Group column. Orders placed by the parent count as activity for every branch, so a branch is not flagged as leaving while the group keeps ordering. "Ordered through [group]" is shown on the card and in the trail. | Done |
| F5 | Negation in notes: a keyword preceded within 3 words by not, no, never, tak, tidak or bukan, or followed closely by "but … rejected" or "but … declined", is not counted. The note screen and trail show "Ignored (negated)". Tested with English, Malay and mixed examples, such as "competitor came but boss rejected". | Done |
| F6 | Malay and Manglish synonyms for every note keyword (for example "tauke nak beli", "minta sebut harga", "mahal", "barang lambat", "komplen kualiti", "dah approve bajet"). | Done |
| F7 | WhatsApp follow-up: "Send reorder message" on the customer card and after a visit is marked. Prepares a short plain message (customer name, usual order, any offer) and opens the phone's share sheet, WhatsApp or copy. Nudge sends nothing. Never includes scores, risk labels or notes. Shown in Malay when Malay is on. | Done |

### 3.6 Export

| ID | Requirement | Status |
|---|---|---|
| E1 | Customer account review one-pager, as a Word page or a PowerPoint slide, in two versions. Customer-facing: their purchases, offers with savings, ideas and a proposed next order, with no scores, risk labels or notes. Internal: status, scores, what to say, campaigns, recent notes and the audit trail. | Done |
| E2 | Today's brief as a Word document, including the audit trail. | Done |
| E3 | Portfolio workbook in Excel: customers with status, scores and reasons; target; campaigns; "How I got this"; visit notes; deals; visits. | Done |
| E4 | Review deck in PowerPoint for one salesperson or the whole team: summary, monthly target, accounts at risk, best opportunities, campaigns, the top 3 accounts, and how it was produced. | Done |
| E5 | All files are built on the phone. Nothing is uploaded to create them. | Done |
| E6 | PDF export for the customer one-pager, the meeting pack and today's brief, alongside Word. | Done |
| E7 | Meeting pack: one tap exports the one-pagers for all of today's visits as a single file (PDF, Word or PowerPoint; internal or customer-facing). | Done |
| E8 | Share button: after an export, the file can be sent through the phone's share sheet (email, WhatsApp and so on) or saved. Where the browser has no share sheet, the file is saved to downloads. | Done (share tested with a simulated share sheet, not on a real phone) |

### 3.5 Deals and management dashboard (second tab)

| ID | Requirement | Status |
|---|---|---|
| D1 | A salesperson can record a closed deal from the chat. | Done |
| D2 | Deals also come from newly uploaded sales files. A deal logged in the app stops being counted separately once an uploaded file covers it, so it is never counted twice. | Done |
| D3 | Revenue dashboard is a separate tab, for management. The salesperson tabs filter it, with "All team" as the default. | Done |
| D4 | Growth vs last year = this year to date compared with the same dates last year (renamed from "incremental revenue" on 17 Nov 2026; only the holdout result may be called incremental). Shown in total, for the current month, by month and by salesperson. | Done |
| D6 | The Revenue tab opens with a typed manager brief: team revenue against last year, who needs help, biggest accounts at risk, deals logged in the last 7 days, and visit plan completion. It follows the salesperson filter. | Done |
| D7 | Visit plan completion per salesperson (today and last 7 days) is shown on the Revenue tab. | Pilot limit: counts visits marked on this device only (see R2). |
| D8 | Saving a deal plays a short celebration (confetti, the orb turns green). The revenue card uses a drawn sky-and-hills picture; no outside image is loaded. | Done |
| D9 | The Revenue tab shows month-to-date sales against each salesperson's monthly target, with a marker for where sales should be today. | Done |
| D10 | Manager weekly digest: the last 7 days against the 7 before (sales, target, visits done, deals logged), with expandable lists of biggest orders, accounts at risk, customers ready to buy and campaigns ending. On the Dashboard and exportable as PDF or Word. | Done (visits, deals and notes are those on this device) |
| D11 | Outcome tracking: Nudge replays its rules on past weeks and checks who really ordered in the following 14 days. The Dashboard shows how often "ready to buy" customers ordered against the average, how often "at risk" customers stayed quiet, and each rule's record. | Done |
| D12 | Self-improvement with approval: when a rule's customers order clearly more or less often than average, Nudge proposes raising or lowering its points by 5. Nothing changes unless a manager taps Apply. Each change is dated, shown in every affected score's audit trail, can be undone, and is limited to 10 points from the original with one step every 30 days. | Done |
| D13 | For the visits Nudge actually suggested on this device, it records whether an order followed within 14 days, split by visited or not. | Done (results appear once suggestions are 14 days old) |
| D5 | The dashboard updates with every closed deal. | Done on the phone where the deal was logged (see R2). |

## 4. How the model works

All thresholds live in one place: `RULES` in `js/engine.js`. Each score is 0 to 100 and is the sum of the factors that apply.

**Risk of losing them (churn)**

| Factor | Rule | Points |
|---|---|---|
| Overdue | days since last order ÷ their median days between orders ≥ 1.5 / 2 / 3 | +20 / +35 / +45 |
| Falling spend | revenue last 90 days vs previous 90 days ≤ -10% / -25% / -50% | +8 / +20 / +30 |
| Note keywords (last 60 days) | Unhappy +15, Competitor offer +15, Quality complaint +12, Delivery issue +10, Budget cut +10, Price too high +8, Not interested +8, Payment issue +5, Happy with us -10 | capped at ±25 |
| Documents | a linked paragraph uses risk wording | +10 |
| Your judgement | a note with "Staying with us" in the last 30 days | -30 (outside the notes cap) |

**Chance to close a deal**

| Factor | Rule | Points |
|---|---|---|
| Due to reorder | overdue ratio between 0.8 and 1.5 (0.6 to 0.8: coming up soon) | +30 (+12) |
| Growing spend | revenue last 90 days vs previous 90 days ≥ +10% / +25% | +10 / +20 |
| Cross-sell gap | a category bought by at least half of customers in the same segment, never bought by this one | +10 |
| Note keywords (last 45 days) | Asked for a quote +25, Budget approved +25, Interested +15, Wants a bigger order +15, Wants a sample +12, Expanding +12, Wants a follow-up +12, Met the decision maker +10, Happy +5, Budget cut -10, Not interested -20 | capped at ±40 |
| Documents | renewal +15, campaign or offer +10, growth opportunity +8 | capped at +20 |

**Rules version**: `RULES.version` and `RULES.date` in `js/engine.js` (now 1.9, 17 Nov 2026). Change both whenever a rule or threshold changes; the version is stamped on every trail and export.

**Bands (rep screens)**: chance to close: Likely at 50 or more, Maybe 30 to 49, Unlikely below 30. Risk of leaving: At risk at 50 or more, Watch 30 to 49, Steady below 30 (`RULES.bandHigh`, `RULES.bandMid`). The same cut-offs drive the "Likely to close" and "May churn" lists.

**Rep feedback**: "Shop closed" or "Not my customer" leaves a customer out of suggestions until an order dated after the feedback arrives. "On credit hold" leaves them out for 30 days (`RULES.creditHoldDays`). "Visited recently" counts as contact that day (−40 priority for 2 days). Every reason removes the customer from today's visits and puts the next eligible customer in its place.

**Track record**: rules replayed on up to 8 past dates (`RULES.backtestWeeks`), one week apart, ending 14 days before today; a hit is any order in the 14 days after. Baselines pick 3 customers per salesperson per date. Random = the average of all active customers (the expected result of a random pick). Holdout = `settings.holdout` (default 0.2, at most 0.5); a customer is held back when `seeded(salesperson|date|customer) < share`.

**Field rules**: area = the value of the Area/Postcode column on the customer's latest sales line; the chosen area has the highest sum of visit priority among eligible, not-held-back customers (`lists(an, { area })`). On hold = Credit Hold yes, or an overdue amount when there is no hold column; the close score is set to 0 with a "Collect first" factor. Festive periods: `settings.holidays` (defaults in `FESTIVE`); a gap counts as spanning a period when the period overlaps the days between two orders; the overdue factor is ×0.5 (`RULES.festiveFactor`) within 14 days after a period ends (`RULES.festiveAfterDays`). Chains: a branch's lateness uses the more recent of its own last order and its parent's (the customer whose name matches the Group value). Negation: see F5.

**Few orders**: customers with fewer than 2 orders are left out of today's visits unless a scoring note in the last 45 days, or an account plan paragraph tagged priority or renewal, makes them a priority. Under 4 orders, screens say "rough guess, few orders".

**Visit priority** = 0.6 × the higher of the two scores + 0.1 × the lower + 0.3 × customer value (percentile of 12-month revenue among the salesperson's customers); +8 if documents mark a priority account; -40 if a visit was marked done, or a note or deal logged, in the last 2 days. The top 3 by priority are today's visits.

Lists: "Likely to close" and "May churn" show customers scoring 50 or more. A customer silent for more than 180 days and more than 6 times their usual gap is "Inactive" and left out of the brief.

**Pitch**: fixed sentence templates filled with the customer's numbers, the latest note keywords and quoted document excerpts. At most 4 points and one ask, with sources listed.

**Executive summary**: "At risk" is the sum of 12-month revenue of customers with a churn score of 50 or more. "Today's potential" is the sum of the usual order size of the top 3 visits. Offers and renewals are the first document paragraph with campaign or renewal wording linked to each of the top 3 customers.

**Campaign expiry**: a nudge appears when an unused, applicable campaign ends within `expiryDays` (7) of today.

**Monthly target**: pace = target × day of month ÷ days in month. Ahead (green orb) when month-to-date sales ≥ pace, otherwise behind (amber). Gap = target − month-to-date sales.

**Closing the gap**: active customers are ranked by close score × usual order size. They are added in that order until their usual order sizes add up to the gap, to a maximum of 5.

**Campaigns**: a campaign applies when the customer's segment matches (or the campaign names the customer), and it has not ended. "Not used yet" means no purchase of the campaign's categories in the last 30 days. Saving = discount % × the customer's average order in those categories over the last 12 months (their overall average order if they have never bought the category; raised to the minimum spend if there is one). "Buy X get Y free" is treated as Y ÷ (X + Y). An unused campaign adds +10 to the close score.

**Learning from outcomes**: the rules are replayed on up to 12 past dates, one week apart, ending 14 days before today. A "hit" is any order in the 14 days after. A rule is proposed for +5 when its customers ordered at least 1.3 times as often as all active customers, and for -5 when below 0.9 times, with at least 20 past flags. Only rules that add to the chance-to-close score are tuned. Approved changes are stored as `tuning` and applied on top of `RULES`.

**Trend dot**: revenue in the last 90 days against the previous 90; up at +10% or more, down at -10% or less.

## 5. Known limits and risks

| ID | Item |
|---|---|
| R1 | Voice notes use the phone's built-in speech recognition. On some phones (for example Chrome on Android) the audio is processed by Google or Apple servers, which is outside the "nothing leaves the phone" rule. The app says so on the note screen, voice can be switched off under More, and keywords can always be tapped instead. |
| R2 | Because data lives on each phone, notes and deals logged on one phone do not appear on another. Management sees deals logged on their own device plus whatever is in the uploaded sales file. A shared view needs a server (future decision). |
| R3 | No login in the pilot, so the salesperson tabs and the management tab are not access controlled. |
| R8 | Campaign terms read from Word or PowerPoint text use simple patterns and can miss unusual wording. The Campaigns sheet is the reliable source. Saving amounts are estimates based on typical order size. |
| R9 | A typed note is stored as written in the customer file on the phone. Only the fixed keywords found in it affect scores. |
| R10 | The customer-facing one-pager contains that customer's purchase figures and estimated savings. The salesperson should read it before handing it over. |
| R11 | After an update to the site, an installed copy picks up the new version the next time it is opened with a connection. |
| R12 | Sharing a file hands it to another app chosen by the salesperson, so from that point it leaves the phone. Nudge itself still sends nothing. |
| R13 | PDFs use a built-in font, so a few symbols are replaced with plain ones (for example the rupee sign becomes "Rs"). Non-Latin customer names will not print correctly in PDF; use Word for those. |
| R14 | "Staying with us" is the salesperson's opinion, not data. It cannot take a customer's risk to zero on its own, it expires after 30 days, and managers can see it in the audit trail and the Excel export. |
| R15 | Fixed on 17 Nov 2026: the replay now uses documents and campaigns only from their upload date. With little history (under about 6 months) there are too few past flags to propose anything. |
| R16 | Tuning is stored on the phone where a manager approved it. Another phone keeps the original points until the same change is approved there. |
| R17 | Context notes are free text and may hold sensitive remarks. They stay on the phone and in internal exports; salespeople should not write anything they would not want a colleague to read. |
| R18 | Text dates in CSV files are now kept as text and checked, instead of being read by the spreadsheet library in US month/day order. Older uploads loaded before this change were not re-checked. |
| R19 | Malay text was drafted without a native-speaker review; terms such as "berkemungkinan membeli" and "beralih" should be checked with the sales team. |
| R20 | On the sample data Nudge's top 3 ordered within 14 days less often than a random pick (about 46% against 55%) but brought more revenue per pick (about RM2,100 against RM1,300), because visit priority leans on risk of leaving and at-risk customers order less often by definition. The dashboard shows this as found; the right yardstick for at-risk visits is an open question. |
| R21 | The holdout means some customers who would have been suggested are not shown on a given day. Its estimate needs weeks of real use to be reliable, and only counts days recorded on the same phone. |
| R22 | Festive period default dates (2024 to 2027) were entered from memory and some lunar dates move; check them against the official Malaysian calendar in the menu before relying on them. |
| R23 | A chain is only recognised when the parent places orders under a customer whose name matches the Group value. Orders split across sibling branches do not count for each other. |
| R7 | The assistant look and typing animation are presentation only. The text is produced instantly by fixed rules; no AI model is involved. The header says "Private, runs on this phone". |
| R4 | Clearing browser data erases notes and deals. Customer files can be downloaded as a backup. |
| R5 | The site code on GitHub Pages is public (including the invented sample data). Real business data is never part of the site. |
| R6 | If the newest sale in the data is more than 14 days old, the brief is calculated as of the day after that sale and says so. |

## 6. Open questions

- Should management get a shared, live view across all salespeople (needs a server and login)?
- Should the keyword list be tailored to your industry and products?
- Should the scoring thresholds be tuned after the pilot using real outcomes?

## 7. Change log

| Date | Change |
|---|---|
| 15 Nov 2026 | First version: upload, morning brief with top 3 visits, likely to close and may churn lists, auditable reasons, keyword and voice notes, tailored pitch, per-customer .md files, deal logging, management revenue dashboard, sample data. Decisions confirmed: data on the phone only; generic industry; incremental measured against the same period last year; deals from both app and uploads. |
| 15 Nov 2026 | Redesign to the reference screenshot. Salesperson tabs replace the "who are you" question. Executive summary added to the morning brief. Thinking dots and typed-out replies with tap to skip. Typing box replaced by suggestion chips and a voice note button. Dashboard gets a hero card and can be filtered by salesperson. |
| 15 Nov 2026 | Added: fixed daily visit plan with mark visited / skip with reason, end-of-day wrap-up, typed manager brief and visit plan completion on the Revenue tab, illustrated revenue card, deal celebration. Decisions confirmed: animation plays every time; salesperson tabs stay open to everyone in the pilot. |
| 15 Nov 2026 | Renamed to Nudge. Header simplified (no status dot or "private" label). Salesperson tabs became a dropdown. Bottom tab bar removed; views are in the three-dots menu. Home page added, opened by the orb. Orb colour follows target pace. Monthly targets, gap to target and which customers to approach. Campaigns linked to customers with saving amounts. Visit notes can be typed. Suggestion chips made smaller and lighter. |
| 15 Nov 2026 | Positioned as an independent app: upload → insights → export. Added exports (customer one-pager in two versions, brief, portfolio workbook, review deck), "How I got this" under every response, campaign expiry nudges, target ring around the orb, abstract shaded orb, install to home screen with offline use, and a comparison with Salesforce AI. |
| 15 Nov 2026 | Added PDF export, the meeting pack (one-pagers for today's visits in one file), Share and Save buttons after every export, and a visibly animated orb. |
| 16 Nov 2026 | Decluttered every reply: visuals first (tiles, meters, bars, spend line), sentences behind expanders. New customer card with + for notes, icons for file and export, Done for a closed deal. More visible orb states. Manager weekly digest. "Staying with us" keyword (-30 risk for 30 days) and a warning when a note matches no keyword. Menu renamed to Export, Brief, Dashboard; install hint removed; home steps made smaller. |
| 16 Nov 2026 | Note screen: orb turns green or red with the tone of what is said, voice note can be deleted and re-recorded in place, and two save options (for scores, or as context). Context notes shown on the customer card, above "What to say" and in internal exports. Trend dot on visit cards. Outcome tracking with manager-approved tuning proposals on the Dashboard. |
| 17 Nov 2026 | Phase 1, trust foundation: upload health check with confirm button, duplicate/negative/no-salesperson/future/unreadable counts, name-variant merge, date-format check with question, hard stop; "Show me the orders" evidence; data date line; confidence in words and the fewer-than-2-orders rule; blind-spots line; How Nudge decides page; rules version stamp on trails and exports; same-answer test. |
| 17 Nov 2026 | Phase 2, the rep stays in charge: action-led visit cards, "usually every 14 days, now 26", Likely/Maybe/Unlikely and At risk/Watch/Steady bands, "Wrong, because…" with effects and manager log, swap a visit, notes quoted back, who-can-see-notes line, RM default, "Tue 12 Nov" dates, one number per tile, 16px text, 360px check, Motion switch (animations kept on by owner decision), Malay interface. Rules version 1.7. |
| 17 Nov 2026 | Phase 3, track record: replay leak fixed; comparison with random, biggest, most-overdue and Nudge's top 3; results by band; scoreboard with latest misses on the Dashboard and rep home; your pick vs Nudge's pick; seeded 20% holdout with "Revenue Nudge helped add (estimate)"; "incremental revenue" renamed "Growth vs last year". Rules version 1.8 (replay window 8 weeks). |
| 17 Nov 2026 | Phase 4, field reality: area grouping with one-tap switch and "Also nearby"; credit hold and overdue ("Collect first") from columns or a Credit sheet; editable Malaysian festive periods (gaps left out of the rhythm, lateness halved for 14 days after); chains and branches; negation in notes in English and Malay; Malay and Manglish synonyms; WhatsApp reorder message through the share sheet. Sample data now has areas, a chain and a Credit sheet. Rules version 1.9. |
| 23 Nov 2026 | Decluttering, step 1 (owner choice, WhatsApp style): the bottom bar is now one row; the scrolling row of shortcuts moved onto the Home screen as short buttons (Today's brief full width, the rest two per row). |
| 23 Nov 2026 | Decluttering, step 2 (owner choice, minimal Home): orb 96px, greeting, target line and one "Today's brief" button; the other shortcuts are behind "More"; the track-record line now lives on the Dashboard only; the Upload/Insights/Export strip is only on the first-run welcome page. |
| 23 Nov 2026 | Decluttering, step 3 (owner choice, iPhone Mail style): visit cards became slim swipe rows (about 92px instead of 300px). Swipe right = visited, swipe left = Skip, Swap, Wrong; tap = customer. "Based on N orders" and the spend trend dot now sit on the customer card only. One-time swipe hint and peek. |
