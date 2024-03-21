from flask import send_from_directory
import sqlite3
import time
import os

media_folder = os.environ.get("FD_MEDIA_FOLDER", "./")

# get database from configuration
DB_PATH = os.environ.get("FD_DATABASE", "example.db")

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


def load_media(filename):
    # Build the file path for the requested video
    video_path = os.path.join(media_folder, filename)
    
    if not os.path.isfile(video_path):
        abort(404, description=f"Media {filename} not found")

    return send_from_directory(directory=media_folder, path=filename)


def add_cell(filename, media_bytes, info_text, coord):
    with open(os.path.join(media_folder, filename), "wb") as media_file:
        media_file.write(media_bytes)
    
    with get_db_connection(DB_PATH) as conn:
        cursor = conn.cursor()
        # Using parameterized queries to avoid SQL injection
        cursor.execute("INSERT INTO cells (username, x, y, media_path, text, links, datetime) VALUES (?, ?, ?, ?, ?, ?, ?)",
                       ('useruuid', coord[0], coord[1], filename, info_text, 'google.fr', time.time()))
        conn.commit()

    return filename


def get_all_cells_as_dict():
    with get_db_connection(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM cells")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]


initialize_database()
