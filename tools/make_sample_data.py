"""Builds the sample files in sample-data/. Run: python3 tools/make_sample_data.py
All companies and people are invented. Dates end on END so the newest sale is recent."""
import random, datetime as dt, os
from openpyxl import Workbook
from openpyxl.styles import Font
from docx import Document
from pptx import Presentation

random.seed(7)
OUT = os.path.join(os.path.dirname(__file__), '..', 'sample-data')
END = dt.date(2026, 11, 14)
START = dt.date(2024, 11, 1)

CATS = {
    'Core Products': [('Core Standard', 120), ('Core Plus', 180)],
    'Premium Range': [('Premium Select', 420), ('Premium Elite', 650)],
    'Consumables': [('Refill Pack', 35), ('Starter Kit', 60)],
    'Accessories': [('Accessory Set', 75), ('Mounting Kit', 95)],
    'Service Plans': [('Annual Care Plan', 900), ('Quarterly Check', 260)],
}
# name, segment, pattern, gap days, base lines, categories
# patterns: steady, growing, declining, overdue (stopped recently), lost, new, due
REPS = {
    'Aisha Rahman': [
        ('Northwind Trading', 'Wholesale', 'due', 21, 3, ['Core Products', 'Consumables', 'Accessories']),
        ('Blue Harbor Stores', 'Retail', 'overdue', 14, 2, ['Core Products', 'Consumables']),
        ('Summit Office Group', 'Corporate', 'growing', 30, 3, ['Core Products', 'Premium Range', 'Service Plans']),
        ('Lakeside Mart', 'Retail', 'steady', 14, 2, ['Core Products', 'Consumables', 'Accessories']),
        ('Orchid Wholesale', 'Wholesale', 'declining', 21, 3, ['Core Products', 'Consumables', 'Accessories']),
        ('Pinecrest Supplies', 'Retail', 'due', 28, 2, ['Core Products', 'Accessories']),
        ('Golden Gate Retail', 'Retail', 'steady', 21, 1, ['Consumables', 'Core Products', 'Accessories']),
        ('Metro Corporate Services', 'Corporate', 'overdue', 30, 3, ['Premium Range', 'Service Plans', 'Core Products']),
        ('Riverbend Depot', 'Wholesale', 'steady', 28, 2, ['Core Products', 'Consumables']),
        ('Sunrise Corner Shop', 'Retail', 'new', 14, 1, ['Core Products']),
        ('Old Mill Traders', 'Wholesale', 'lost', 30, 2, ['Core Products', 'Accessories']),
        ('Cedar Park Holdings', 'Corporate', 'steady', 45, 2, ['Premium Range', 'Core Products']),
    ],
    'Ben Carter': [
        ('Harbor Point Wholesale', 'Wholesale', 'growing', 21, 3, ['Core Products', 'Consumables', 'Accessories']),
        ('Maple Street Market', 'Retail', 'due', 14, 2, ['Core Products', 'Consumables', 'Accessories']),
        ('Atlas Business Park', 'Corporate', 'due', 30, 3, ['Premium Range', 'Service Plans', 'Core Products']),
        ('Greenfield Stores', 'Retail', 'declining', 14, 2, ['Core Products', 'Consumables']),
        ('Ironbridge Distribution', 'Wholesale', 'overdue', 21, 3, ['Core Products', 'Accessories', 'Consumables']),
        ('Clearwater Retail', 'Retail', 'steady', 21, 2, ['Core Products', 'Accessories', 'Consumables']),
        ('Vertex Corporate Solutions', 'Corporate', 'steady', 30, 2, ['Premium Range', 'Service Plans']),
        ('Bayview Mini Mart', 'Retail', 'new', 14, 1, ['Consumables', 'Core Products']),
        ('Stonebridge Wholesale', 'Wholesale', 'steady', 28, 2, ['Core Products', 'Consumables', 'Accessories']),
        ('Redwood Office Supply', 'Corporate', 'declining', 30, 2, ['Core Products', 'Premium Range']),
        ('Foxglove Traders', 'Wholesale', 'lost', 28, 2, ['Core Products']),
        ('Hilltop Convenience', 'Retail', 'steady', 14, 1, ['Core Products', 'Consumables']),
    ],
    'Chloe Tan': [
        ('Pacific Rim Wholesale', 'Wholesale', 'steady', 21, 3, ['Core Products', 'Consumables', 'Accessories']),
        ('Jade Garden Stores', 'Retail', 'growing', 14, 2, ['Core Products', 'Consumables', 'Accessories']),
        ('Keystone Corporate', 'Corporate', 'overdue', 30, 3, ['Premium Range', 'Core Products', 'Service Plans']),
        ('Willow Lane Market', 'Retail', 'due', 21, 2, ['Core Products', 'Consumables']),
        ('Falcon Distribution', 'Wholesale', 'due', 28, 3, ['Core Products', 'Accessories', 'Consumables']),
        ('Silverline Retail', 'Retail', 'declining', 14, 2, ['Core Products', 'Accessories', 'Consumables']),
        ('Beacon Office Group', 'Corporate', 'growing', 30, 2, ['Premium Range', 'Service Plans', 'Core Products']),
        ('Parkside Kiosk', 'Retail', 'steady', 14, 1, ['Consumables', 'Core Products']),
        ('Granite Wholesale', 'Wholesale', 'steady', 28, 2, ['Core Products', 'Consumables']),
        ('Aurora Business Centre', 'Corporate', 'new', 30, 2, ['Premium Range', 'Core Products']),
        ('Tidewater Traders', 'Wholesale', 'overdue', 21, 2, ['Core Products', 'Consumables', 'Accessories']),
        ('Elm Court Stores', 'Retail', 'steady', 21, 2, ['Core Products', 'Accessories']),
    ],
}

rows, inv, cid = [], 10000, 100
total_days = (END - START).days
for rep, custs in REPS.items():
    for name, seg, pat, gap, lines, cats in custs:
        cid += 1
        code = f'C{cid}'
        size = {'Wholesale': 2.2, 'Corporate': 1.6, 'Retail': 1.0}[seg]
        start = START + dt.timedelta(days=random.randint(0, gap))
        stop = END
        if pat == 'new': start = END - dt.timedelta(days=gap * 3 + random.randint(2, 6))
        if pat == 'overdue': stop = END - dt.timedelta(days=int(gap * random.uniform(2.3, 3.4)))
        if pat == 'lost': stop = END - dt.timedelta(days=260)
        if pat == 'due': stop = END - dt.timedelta(days=int(gap * random.uniform(0.9, 1.2)))
        d = start
        while d <= stop:
            prog = (d - START).days / total_days
            mult = size
            if pat == 'growing': mult *= 0.7 + 0.9 * prog ** 2
            if pat == 'declining' and prog > 0.8: mult *= max(0.3, 1 - (prog - 0.8) * 3.5)
            n = max(1, lines + random.choice([-1, 0, 0, 1]))
            pool = cats[:]
            # declining customers drop their last category in the final months
            if pat == 'declining' and prog > 0.75 and len(pool) > 1: pool = pool[:-1]
            inv += 1
            for cat in random.sample(pool, min(n, len(pool))):
                prod, price = random.choice(CATS[cat])
                base_q = {'Consumables': 14, 'Core Products': 7, 'Accessories': 5, 'Premium Range': 2, 'Service Plans': 1}[cat]
                q = max(1, round(base_q * mult * random.uniform(0.7, 1.3)))
                rows.append((d, f'INV-{inv}', rep, code, name, seg, cat, prod, q, price, q * price))
            d += dt.timedelta(days=max(3, round(gap * random.uniform(0.8, 1.2))))
        if pat == 'due':  # slide this customer's history so the last order lands exactly on `stop`
            mine = [i for i, r in enumerate(rows) if r[3] == code]
            shift = stop - max(rows[i][0] for i in mine)
            for i in mine: rows[i] = (rows[i][0] + shift,) + rows[i][1:]

# realistic untidiness for the upload health check (separate random stream, so the rows above do not change)
rx = random.Random(11)
for k in range(6):  # the same shop typed under a second name and code
    d = END - dt.timedelta(days=100 - k * 16)
    inv += 1
    rows.append((d, f'INV-{inv}', 'Aisha Rahman', 'C104B', 'Lakeside Mart Sdn Bhd', 'Retail', 'Consumables', 'Refill Pack', 12, 35, 420))
credit = [r for r in rows if r[0] < END - dt.timedelta(days=30)]
for r in rx.sample(credit, 8):  # returns and credit notes
    inv += 1
    q = -max(1, r[8] // 3)
    rows.append((r[0] + dt.timedelta(days=3), f'CN-{inv}', r[2], r[3], r[4], r[5], r[6], r[7], q, r[9], q * r[9]))
blank = rx.sample(range(len(rows)), 3)  # salesperson left empty
rows = [r if i not in blank else (r[0], r[1], '', *r[3:]) for i, r in enumerate(rows)]
rows.sort(key=lambda r: (r[0], r[1]))
wb = Workbook(); ws = wb.active; ws.title = 'Transactions'
# field reality: an area per customer, one chain (Keystone is a branch of Beacon Office Group)
AREAS = ['Petaling Jaya', 'Shah Alam', 'Klang', 'Subang Jaya']
area_of, order_seen = {}, {}
for rep_name, custs in REPS.items():
    for i, c in enumerate(custs): area_of[c[0]] = AREAS[i % len(AREAS)]
area_of['Lakeside Mart Sdn Bhd'] = area_of['Lakeside Mart']
GROUP = {'Keystone Corporate': 'Beacon Office Group'}
ws.append(['Date', 'Invoice No', 'Salesperson', 'Customer ID', 'Customer Name', 'Segment', 'Product Category', 'Product', 'Quantity', 'Unit Price', 'Amount', 'Area', 'Group'])
for c in ws[1]: c.font = Font(bold=True)
for r in rows: ws.append(list(r) + [area_of.get(r[4], ''), GROUP.get(r[4], '')])
for row in ws.iter_rows(min_row=2, max_col=1):
    row[0].number_format = 'yyyy-mm-dd'
for col, w in zip('ABCDEFGHIJKLM', [12, 12, 16, 12, 28, 12, 18, 18, 10, 10, 12, 16, 22]): ws.column_dimensions[col].width = w
# Targets: each month of the current year = same month last year + 5%, rounded to 500
from collections import defaultdict
ly = defaultdict(float)
for r in rows:
    if r[0].year == END.year - 1: ly[(r[2], r[0].month)] += r[10]
wt = wb.create_sheet('Targets'); wt.append(['Salesperson', 'Month', 'Target'])
for c in wt[1]: c.font = Font(bold=True)
for rep in REPS:
    for m in range(1, 13):
        t = round(ly[(rep, m)] * 1.05 / 500) * 500
        if rep == 'Chloe Tan' and m == END.month:  # demo: one salesperson slightly ahead of pace, so the green orb can be seen
            mtd = sum(r[10] for r in rows if r[2] == rep and r[0].year == END.year and r[0].month == m)
            t = round(mtd * 1.9 / 500) * 500
        wt.append([rep, f'{END.year}-{m:02d}', t])
wc = wb.create_sheet('Campaigns'); wc.append(['Campaign', 'Segment', 'Category', 'Discount %', 'Minimum Spend', 'End Date', 'Description'])
for c in wc[1]: c.font = Font(bold=True)
wc.append(['Year-end Retail campaign', 'Retail', 'Consumables', 9, 0, dt.date(END.year, 12, 31), 'Buy 10 cases of Consumables, get 1 free'])
wc.append(['Wholesale bundle rebate', 'Wholesale', 'Core Products + Accessories', 3, 2000, END + dt.timedelta(days=6), 'Order Core Products and Accessories together for a 3% rebate at quarter end'])
wc.append(['Premium Range launch offer', 'Corporate', 'Premium Range', 5, 0, dt.date(END.year, 12, 31), '5% introductory discount on Premium Range'])
for row in wc.iter_rows(min_row=2, min_col=6, max_col=6): row[0].number_format = 'yyyy-mm-dd'
for sh in (wt, wc):
    for col in 'ABCDEFG': sh.column_dimensions[col].width = 24
code_of = {r[4]: r[3] for r in rows}
wcr = wb.create_sheet('Credit'); wcr.append(['Customer ID', 'Customer Name', 'Credit Hold', 'Overdue Amount'])
for c in wcr[1]: c.font = Font(bold=True)
wcr.append([code_of['Ironbridge Distribution'], 'Ironbridge Distribution', 'Yes', 4250])
wcr.append([code_of['Orchid Wholesale'], 'Orchid Wholesale', 'No', 1200])
for col in 'ABCD': wcr.column_dimensions[col].width = 22
wb.save(os.path.join(OUT, 'sample_transactions.xlsx'))
print(len(rows), 'transaction rows')

# ---------------------------------------------------------------- Word document
doc = Document()
doc.add_heading('Account Plans and Sales Strategy', 0)
doc.add_paragraph('Prepared by Sales Management. Sample document with invented companies, for testing only.')

doc.add_heading('Sales strategy for the quarter', 1)
doc.add_paragraph('Our goal this quarter is to protect the base and grow share of wallet. Every salesperson should see their top accounts at least once a month.')
doc.add_paragraph('Wholesale customers are the growth engine. We want every Wholesale account buying Accessories alongside Core Products by the end of the quarter.')
doc.add_paragraph('Corporate customers should be offered Service Plans at every renewal conversation, because plans lock in repeat revenue.')

doc.add_heading('Marketing campaign plan', 1)
doc.add_heading('Year-end Retail campaign', 2)
doc.add_paragraph('Campaign for all Retail customers: buy 10 cases of Consumables and get 1 case free, valid until 31 December. Salespeople can offer this promotion on the spot without approval.')
doc.add_heading('Premium Range launch', 2)
doc.add_paragraph('The new Premium Range launch offer gives Corporate customers a 5% introductory discount on their first Premium Range order this quarter.')

doc.add_heading('Account plans', 1)
plans = {
 'Blue Harbor Stores': ['Blue Harbor Stores is a key account in the Retail segment and a priority for retention this quarter.',
   'Risk: a competitor opened a depot nearby and has been offering lower prices. We are at risk of losing weekly orders.',
   'Plan: visit every two weeks, offer the Consumables promotion, and review delivery times with the store manager.'],
 'Summit Office Group': ['Summit Office Group is expanding to a second office in the new year. This is a strategic growth opportunity.',
   'Their Service Plans contract renews in December. Start the renewal conversation early and propose an upgrade.'],
 'Metro Corporate Services': ['Metro Corporate Services has a new procurement manager who is reviewing all suppliers. Risk of losing the account if we do not meet her soon.',
   'Their annual contract expires at the end of the year. Prepare a renewal offer with the Premium Range launch discount.'],
 'Northwind Trading': ['Northwind Trading is a top account for Wholesale. Opportunity to grow Accessories volume with a bundle offer.'],
 'Ironbridge Distribution': ['Ironbridge Distribution complained about two late deliveries last quarter. Operations has since changed the route. Reassure them and ask for a trial order.'],
 'Atlas Business Park': ['Atlas Business Park is a priority account. Their facilities contract renews in January and they have asked about Service Plans.'],
 'Keystone Corporate': ['Keystone Corporate paused orders during an internal budget review. Risk of churn if the review favours a competitor. Meet the finance lead.'],
 'Jade Garden Stores': ['Jade Garden Stores is opening a new outlet next month. Opportunity to supply the new store from day one with a starter bundle.'],
}
for name, paras in plans.items():
    doc.add_heading(name, 2)
    for p in paras: doc.add_paragraph(p)

doc.add_heading('Meeting notes', 1)
doc.add_heading('Regional sales meeting', 2)
doc.add_paragraph('Orchid Wholesale has reduced its orders. The buyer said budgets are tight; consider a smaller, more frequent order plan to keep them from declining further.')
doc.add_paragraph('Falcon Distribution asked for a quotation on a bundle of Core Products and Accessories. Good opportunity to close before month end.')
doc.add_paragraph('Greenfield Stores told us a competitor offered free delivery. We should match with the Consumables promotion.')
doc.save(os.path.join(OUT, 'sample_account_plans.docx'))

# ---------------------------------------------------------------- PowerPoint
prs = Presentation()
def slide(title, bullets):
    s = prs.slides.add_slide(prs.slide_layouts[1])
    s.shapes.title.text = title
    tf = s.placeholders[1].text_frame
    tf.text = bullets[0]
    for b in bullets[1:]: tf.add_paragraph().text = b
slide('Wholesale growth campaign', ['Campaign for all Wholesale customers: order Core Products and Accessories together as a bundle and receive a 3% rebate at quarter end.',
      'Target: every Wholesale account places at least one bundle order this quarter.'])
slide('Accounts to watch', ['Tidewater Traders: orders have stopped; at risk of churn. Visit this week.',
      'Harbor Point Wholesale: growing fast, opportunity to upsell a standing weekly order.',
      'Maple Street Market: strategic Retail account; offer the Consumables promotion on the next visit.'])
slide('Service Plans push', ['Corporate customers without Service Plans should be offered the Quarterly Check as a low-cost trial.'])
prs.save(os.path.join(OUT, 'sample_campaign_deck.pptx'))
print('done')
