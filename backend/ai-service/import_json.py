import json
import sqlite3

conn = sqlite3.connect("medicine.db")
cur = conn.cursor()

with open("indian_medicine_data.json", "r", encoding="utf-8") as f:
    medicines = json.load(f)

batch = []
for m in medicines:
    batch.append((
        int(m["id"]),
        m["name"],
        float(m["price(₹)"]),
        m["Is_discontinued"] == "TRUE",
        m["manufacturer_name"],
        m["type"],
        m["pack_size_label"],
        m["short_composition1"],
        m["short_composition2"]
    ))

    if len(batch) == 1000:
        cur.executemany(
            "INSERT INTO medicines VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            batch
        )
        conn.commit()
        batch = []

if batch:
    cur.executemany(
        "INSERT INTO medicines VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        batch
    )
    conn.commit()

conn.close()
print("✅ Data imported")
