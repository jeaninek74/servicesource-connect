"""
Auto-update VA lenders from the official VA lender loan volume report.
Runs monthly via GitHub Actions. Adds new lenders, updates loan counts.
"""
import openpyxl
import mysql.connector
import json
import os
import re
from urllib.parse import urlparse, unquote

ALL_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
              "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
              "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
              "VA","WA","WV","WI","WY"]

KNOWN_URLS = {
    "UNITED WHOLESALE MORTGAGE, LLC": "https://www.uwm.com",
    "VETERANS UNITED HOME LOANS": "https://www.veteransunited.com",
    "FREEDOM MORTGAGE CORP": "https://www.freedommortgage.com/va-loans",
    "ROCKET MORTGAGE, LLC": "https://www.rocketmortgage.com/learn/va-loan",
    "PENNYMAC LOAN SERVICES LLC": "https://www.pennymac.com/va-loans",
    "NEWREZ LLC": "https://www.newrez.com/loan-options/va-loans",
    "NAVY FEDERAL CREDIT UNION": "https://www.navyfederal.org",
    "CROSSCOUNTRY MORTGAGE LLC": "https://www.crosscountrymortgage.com/loan-products/va-loans",
    "USAA FEDERAL SAVINGS BANK": "https://www.usaa.com/inet/wc/bank-mortgage-va-loan",
    "PENFED CREDIT UNION": "https://www.penfed.org/mortgages/va-loans",
    "LOANDEPOT.COM, LLC": "https://www.loandepot.com/va-home-loans",
    "CALIBER HOME LOANS, INC.": "https://www.caliberhomeloans.com/loans/va-loans",
    "NEWDAY FINANCIAL LLC": "https://www.newdayusa.com",
    "GUARANTEED RATE, INC.": "https://www.rate.com/va-loans",
    "GUILD MORTGAGE COMPANY": "https://www.guildmortgage.com/loan-products/va-loans",
    "FAIRWAY INDEPENDENT MORTGAGE CORP": "https://www.fairwayindependentmc.com/va-loans",
    "WELLS FARGO BANK, N.A.": "https://www.wellsfargo.com/mortgage/va-loans",
    "JPMORGAN CHASE BANK, N.A.": "https://www.chase.com/personal/mortgage/va-loans",
    "BANK OF AMERICA, N.A.": "https://www.bankofamerica.com/mortgage/va-loans",
    "U.S. BANK NATIONAL ASSOCIATION": "https://www.usbank.com/home-loans/mortgage/va-loans.html",
    "TRUIST BANK": "https://www.truist.com/mortgage/va-loans",
}

def classify_lender_type(name):
    name_upper = name.upper()
    if any(x in name_upper for x in ["CREDIT UNION", "FCU", "CU "]):
        return "credit_union"
    elif any(x in name_upper for x in ["BANK", "SAVINGS", "FSB", "N.A.", "NA "]):
        return "bank"
    else:
        return "direct"

def title_case(name):
    words = name.lower().split()
    skip = {"llc", "lp", "inc", "corp", "co", "na", "n.a.", "fsb", "ltd", "dba", "and", "of", "the", "a"}
    result = []
    for i, word in enumerate(words):
        if i == 0 or word not in skip:
            result.append(word.capitalize())
        else:
            result.append(word)
    return " ".join(result)

# Parse Excel
wb = openpyxl.load_workbook('va_lenders_latest.xlsx', read_only=True, data_only=True)
ws = wb['All']
rows = list(ws.iter_rows(values_only=True))

lenders_raw = []
for r in rows[2:]:
    if r[1] and isinstance(r[1], str) and r[1].strip() and r[1].strip() != 'Grand Total':
        lenders_raw.append((r[1].strip(), r[2] if r[2] else 0))

print(f"Parsed {len(lenders_raw)} lenders from VA report")

# Connect to DB
db_url = os.environ.get('DATABASE_URL', '')
parsed = urlparse(db_url)
user = unquote(parsed.username)
password = unquote(parsed.password)
host = parsed.hostname
port = parsed.port or 4000
database = parsed.path.lstrip('/').split('?')[0]

conn = mysql.connector.connect(
    host=host, port=int(port), user=user, password=password, database=database,
    ssl_disabled=False, ssl_verify_cert=False
)
cursor = conn.cursor()

cursor.execute("SELECT name FROM lenders")
existing = {row[0].upper() for row in cursor.fetchall()}
print(f"Existing lenders in DB: {len(existing)}")

added = 0
updated = 0
for raw_name, loan_count in lenders_raw:
    display_name = title_case(raw_name)
    lender_type = classify_lender_type(raw_name)
    url = KNOWN_URLS.get(raw_name, "")
    va_specialist = loan_count >= 100 if loan_count else False
    description = f"VA-approved lender with {loan_count:,} VA loans guaranteed. Source: U.S. Department of Veterans Affairs official lender statistics."

    if raw_name.upper() in existing:
        # Update description with latest loan count
        cursor.execute(
            "UPDATE lenders SET description=%s, updatedAt=NOW() WHERE UPPER(name)=%s",
            (description, raw_name.upper())
        )
        updated += 1
    else:
        cursor.execute("""
            INSERT INTO lenders (name, lenderType, statesServed, url, phone, vaSpecialist, verifiedLevel, description, isActive, createdAt, updatedAt)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 1, NOW(), NOW())
        """, (display_name, lender_type, json.dumps(ALL_STATES), url, "", 1 if va_specialist else 0, "verified", description))
        added += 1

    if (added + updated) % 100 == 0:
        conn.commit()
        print(f"  Processed {added + updated} lenders...")

conn.commit()
cursor.execute("SELECT COUNT(*) FROM lenders")
total = cursor.fetchone()[0]
print(f"\n✅ Done! Added {added} new, updated {updated} existing. Total in DB: {total}")

cursor.close()
conn.close()
