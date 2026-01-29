import sqlite3

conn = sqlite3.connect("medicine.db")
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS medicines (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL,
  is_discontinued BOOLEAN,
  manufacturer_name TEXT,
  type TEXT,
  pack_size_label TEXT,
  composition_1 TEXT,
  composition_2 TEXT
)
""")

cur.execute("CREATE INDEX IF NOT EXISTS idx_medicine_name ON medicines(name)")

conn.commit()
conn.close()

print("✅ SQLite DB & table created")
