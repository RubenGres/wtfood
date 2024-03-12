import sqlite3

DB_PATH = 'example.db'

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

cursor.execute('''CREATE TABLE IF NOT EXISTS cells
               (id INTEGER PRIMARY KEY, username TEXT, media_path TEXT, text TEXT, links TEXT, datetime DATETIME)''')

cursor.execute("INSERT INTO cells (username, x, y, media_path, text, links, datetime) VALUES ('user_text', 0, 0, './local.jpg', 'call to action', 'gogle.fr', datetime('now'))")

conn.commit()

cursor.execute("SELECT * FROM cells")
print(cursor.fetchall())

conn.close()
