from flask import send_from_directory
import sqlite3
import time
import os

media_folder = os.environ.get("FD_MEDIA_FOLDER", "./")

# get database from configuration
DB_PATH = os.environ.get("FD_DATABASE", "example.db")

CREATE_QUERY = '''CREATE TABLE IF NOT EXISTS cells
               (id INTEGER PRIMARY KEY, username TEXT, x FLOAT, y FLOAT, media_path TEXT, text TEXT, links TEXT, datetime DATETIME)'''

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


def get_cards():
    with get_db_connection(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT id, text, media_path, x, y FROM cells")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]


def get_sorting(label):
    with get_db_connection(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Check if the label exists as a column
        cursor.execute("PRAGMA table_info(cells)")
        columns = [row[1] for row in cursor.fetchall()]
        column_name = f"sorting_{label}"
        
        if column_name not in columns:
            return None
        
        # Proceed if the column exists
        cursor.execute(f"SELECT id, {column_name} FROM cells")
        rows = cursor.fetchall()

        sorting = {}
        for row in rows:
            row_dict = dict(row)
            sorting[row_dict['id']] = row_dict['column_name']
        
        return sorting


def add_sorting(label, sorting):
    """
    Adds sorting values to the database.

    Args:
    label (str): The label indicating the specific sorting column.
    sorting (dict): A dictionary of id: value pairs for updating the database.
    """
    column_name = f"sorting_{label}"
    
    with get_db_connection(DB_PATH) as conn:
        cursor = conn.cursor()
        
        # Check if the column exists, and if not, add it
        cursor.execute("PRAGMA table_info(cells)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if column_name not in columns:
            cursor.execute(f"ALTER TABLE cells ADD COLUMN {column_name} INTEGER")
        
        # Update the sorting values for each id in the sorting dictionary
        for id, value in sorting.items():
            cursor.execute(f"UPDATE cells SET {column_name} = ? WHERE id = ?", (value, id))
        
        conn.commit()


initialize_database()
