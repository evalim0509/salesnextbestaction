# Nudge: business requirements

This is the living record of what the product must do. It is updated every time a feature is added or changed (see the change log at the bottom). The code is expected to match this document.

Last updated: 15 Nov 2026

## 1. Purpose

Tell each salesperson their next best action every day, in plain English: who to visit, who is ready to buy, who may leave, and what to say. Give management a simple view of incremental revenue.

## 2. Users

| User | What they need |
|---|---|
| Salesperson (not tech savvy, on a phone) | A short morning brief and a tailored pitch per customer. No reports, no typing. |
| Sales management | A revenue dashboard showing incremental revenue. |

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

### 3.3 Morning brief (main tab)

| ID | Requirement | Status |
|---|---|---|
| B1 | Simple, professional chat interface in the look of the reference screenshot (soft sky background, glass cards, dark pill buttons, floating bottom bar, assistant orb). | Done |
| B8 | The brief opens with an executive summary: my revenue against last year, revenue at risk, the value of today's visits, customers ready to buy, and offers and renewals from the uploaded documents. | Done |
| B9 | Replies do not appear instantly: thinking dots show first, then the words type out. Tapping the chat skips to the full text. People who switch off motion on their phone get instant text. | Done |
| B10 | The bottom bar has no typing box: a scrolling row of small, light suggestions, a "Record a visit note" button, upload and customer list buttons. | Done |
| B13 | Home page: "Hey {name}, what can I do for you today?" with the target status and the main actions. The app opens here, and tapping the orb returns here from anywhere. | Done |
| B14 | The orb shows the day's mood: green when month-to-date sales are at or above target pace, amber when behind. With no target it compares with last year. | Done |
| B15 | Monthly target in the brief: how much is closed, how much more is needed and the days left, plus which customers to approach to close the gap, each with their usual order size and any offer that applies. Also available as "Close my gap". | Done |
| B16 | "My brief" and "Revenue dashboard" are reached from the three-dots menu; there is no bottom tab bar. | Done |
| B2 | Everything is done with buttons. Typing is allowed in two places only: a visit note (owner decision, 15 Nov 2026) and an optional exact deal amount. | Done |
| B3 | Suggest the top 3 customers to visit each day, with reasons in plain English. | Done |
| B4 | Show which customers are likely to close a deal. | Done |
| B5 | Show which customers may churn. | Done |
| B6 | Every reason is auditable in plain English and in technical terms (data used, rule, points). | Done: "Why this customer" then "Show the calculation"; the same working is in the customer file. |
| B7 | No complicated report layouts for the salesperson. | Done |

| B11 | Today's 3 visits are a fixed plan for the day. Each can be marked visited, or skipped with a reason picked from a list. Saving a note or deal for a planned customer marks it visited. A new sales upload refreshes a plan nobody has started. | Done |
| B12 | End-of-day wrap-up ("Wrap up my day"): visits done, skipped and still open, deals closed today, notes saved and notes still missing, and tomorrow's likely visits. | Done |

### 3.4 Customer notes and pitch

| ID | Requirement | Status |
|---|---|---|
| N1 | There is a .md file for each customer, holding performance, today's assessment with its working, the pitch, visit notes, deals and document excerpts. It can be viewed and downloaded (one file, or all as a .zip). | Done. Files are generated on the phone; examples are in `sample-data/customer-files/`. |
| N2 | After a visit the salesperson records a note as keywords (tapped from a fixed list). | Done |
| N3 | Notes can be recorded by voice or typed. The words are matched to the same keyword list, and the text is kept in the customer file. | Done. See risk R1. |
| N5 | Campaigns are linked to customers: the pitch, brief and customer file say which campaign applies, whether the customer has used it, and how much they would save on a typical order. | Done |
| N4 | Notes work together with the uploaded data and documents to customise the pitch for that customer. | Done |

### 3.5 Deals and management dashboard (second tab)

| ID | Requirement | Status |
|---|---|---|
| D1 | A salesperson can record a closed deal from the chat. | Done |
| D2 | Deals also come from newly uploaded sales files. A deal logged in the app stops being counted separately once an uploaded file covers it, so it is never counted twice. | Done |
| D3 | Revenue dashboard is a separate tab, for management. The salesperson tabs filter it, with "All team" as the default. | Done |
| D4 | Incremental revenue = this year to date compared with the same dates last year. Shown in total, for the current month, by month and by salesperson. | Done |
| D6 | The Revenue tab opens with a typed manager brief: team revenue against last year, who needs help, biggest accounts at risk, deals logged in the last 7 days, and visit plan completion. It follows the salesperson filter. | Done |
| D7 | Visit plan completion per salesperson (today and last 7 days) is shown on the Revenue tab. | Pilot limit: counts visits marked on this device only (see R2). |
| D8 | Saving a deal plays a short celebration (confetti, the orb turns green). The revenue card uses a drawn sky-and-hills picture; no outside image is loaded. | Done |
| D9 | The Revenue tab shows month-to-date sales against each salesperson's monthly target, with a marker for where sales should be today. | Done |
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

**Chance to close a deal**

| Factor | Rule | Points |
|---|---|---|
| Due to reorder | overdue ratio between 0.8 and 1.5 (0.6 to 0.8: coming up soon) | +30 (+12) |
| Growing spend | revenue last 90 days vs previous 90 days ≥ +10% / +25% | +10 / +20 |
| Cross-sell gap | a category bought by at least half of customers in the same segment, never bought by this one | +10 |
| Note keywords (last 45 days) | Asked for a quote +25, Budget approved +25, Interested +15, Wants a bigger order +15, Wants a sample +12, Expanding +12, Wants a follow-up +12, Met the decision maker +10, Happy +5, Budget cut -10, Not interested -20 | capped at ±40 |
| Documents | renewal +15, campaign or offer +10, growth opportunity +8 | capped at +20 |

**Visit priority** = 0.6 × the higher of the two scores + 0.1 × the lower + 0.3 × customer value (percentile of 12-month revenue among the salesperson's customers); +8 if documents mark a priority account; -40 if a visit was marked done, or a note or deal logged, in the last 2 days. The top 3 by priority are today's visits.

Lists: "Likely to close" and "May churn" show customers scoring 50 or more. A customer silent for more than 180 days and more than 6 times their usual gap is "Inactive" and left out of the brief.

**Pitch**: fixed sentence templates filled with the customer's numbers, the latest note keywords and quoted document excerpts. At most 4 points and one ask, with sources listed.

**Executive summary**: "At risk" is the sum of 12-month revenue of customers with a churn score of 50 or more. "Today's potential" is the sum of the usual order size of the top 3 visits. Offers and renewals are the first document paragraph with campaign or renewal wording linked to each of the top 3 customers.

**Monthly target**: pace = target × day of month ÷ days in month. Ahead (green orb) when month-to-date sales ≥ pace, otherwise behind (amber). Gap = target − month-to-date sales.

**Closing the gap**: active customers are ranked by close score × usual order size. They are added in that order until their usual order sizes add up to the gap, to a maximum of 5.

**Campaigns**: a campaign applies when the customer's segment matches (or the campaign names the customer), and it has not ended. "Not used yet" means no purchase of the campaign's categories in the last 30 days. Saving = discount % × the customer's average order in those categories over the last 12 months (their overall average order if they have never bought the category; raised to the minimum spend if there is one). "Buy X get Y free" is treated as Y ÷ (X + Y). An unused campaign adds +10 to the close score.

## 5. Known limits and risks

| ID | Item |
|---|---|
| R1 | Voice notes use the phone's built-in speech recognition. On some phones (for example Chrome on Android) the audio is processed by Google or Apple servers, which is outside the "nothing leaves the phone" rule. The app says so on the note screen, voice can be switched off under More, and keywords can always be tapped instead. |
| R2 | Because data lives on each phone, notes and deals logged on one phone do not appear on another. Management sees deals logged on their own device plus whatever is in the uploaded sales file. A shared view needs a server (future decision). |
| R3 | No login in the pilot, so the salesperson tabs and the management tab are not access controlled. |
| R8 | Campaign terms read from Word or PowerPoint text use simple patterns and can miss unusual wording. The Campaigns sheet is the reliable source. Saving amounts are estimates based on typical order size. |
| R9 | A typed note is stored as written in the customer file on the phone. Only the fixed keywords found in it affect scores. |
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
