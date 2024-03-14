import sqlite3
import time
import os

DB_PATH = 'example.db'
CREATE_QUERY = '''CREATE TABLE IF NOT EXISTS cells
               (id INTEGER PRIMARY KEY, username TEXT, x FLOAT, y FLOAT, media_path TEXT, text TEXT, links TEXT, datetime DATETIME)'''

# Use a function to get a fresh connection
# This is more about ensuring that each use gets a clean state if you plan to extend this script for multi-threading or more complex operations
def get_db_connection(db_path):
    return sqlite3.connect(db_path)


def initialize_database():
    with get_db_connection(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute(CREATE_QUERY)
        conn.commit()


def reset():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    initialize_database()


def add_cell(gen_image, info_text, coord, image_folder="./"):
    epoch_ms = round(time.time() * 1000)
    
    gen_image.save(f"{image_folder}{epoch_ms}.jpg")
    
    with get_db_connection(DB_PATH) as conn:
        cursor = conn.cursor()
        # Using parameterized queries to avoid SQL injection
        cursor.execute("INSERT INTO cells (username, x, y, media_path, text, links, datetime) VALUES (?, ?, ?, ?, ?, ?, ?)",
                       ('useruuid', coord[0], coord[1], epoch_ms, info_text, 'google.fr', time.time()))
        conn.commit()


def get_all_cells_as_dict():
    with get_db_connection(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM cells")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

initialize_database()
