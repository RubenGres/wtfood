from flask import send_from_directory
import sqlite3
import json
import base64
import time
import os

media_folder = os.environ.get("FD_MEDIA_FOLDER", "./")

# get database from configuration
DB_PATH = os.environ.get("FD_DATABASE", "example.db")

CREATE_QUERY = '''CREATE TABLE IF NOT EXISTS cells
               (id INTEGER PRIMARY KEY, username TEXT, country TEXT, food TEXT, stakeholder TEXT, issue TEXT, image_prompt TEXT, x FLOAT, y FLOAT, media_path TEXT, title TEXT, text TEXT, datetime DATETIME)'''


def sql_safify(s):
    return s.encode().hex()

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
    return send_from_directory(directory=media_folder, path=filename)


def load_thumb(filename):
    return send_from_directory(directory=os.path.join(media_folder, "thumbnails"), path=filename)



def add_cell(client_id, filename, media_bytes, title, info_text, coord, country, food, stakeholder, issue, image_prompt):
    with open(os.path.join(media_folder, filename), "wb") as media_file:
        media_file.write(media_bytes)
    
    with get_db_connection(DB_PATH) as conn:
        cursor = conn.cursor()
        # Using parameterized queries to avoid SQL injection
        cursor.execute("INSERT INTO cells (username, country, food, stakeholder, issue, image_prompt, x, y, media_path, title, text, datetime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                       (client_id, country, food, stakeholder, issue, image_prompt, coord[0], coord[1], filename, title, info_text, time.time()))
        
        new_id = cursor.lastrowid
        
        conn.commit()

    return filename, new_id


def get_cards():
    with get_db_connection(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT id, title, text, media_path, x, y FROM cells")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]


def get_sorting(label):
    with get_db_connection(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Check if the label exists as a column
        cursor.execute("PRAGMA table_info(cells)")
        columns = [row[1] for row in cursor.fetchall()]
        column_name = f"sorting_{sql_safify(label)}"
        
        if column_name not in columns:
            return None
        
        # Proceed if the column exists
        cursor.execute(f"SELECT id, {column_name} FROM cells")
        rows = cursor.fetchall()

        sorting = {}
        for row in rows:
            row_dict = dict(row)
            sorting[row_dict['id']] = row_dict[column_name]
        
        return sorting


def add_sorting(label, sorting):
    """
    Adds sorting values to the database.

    Args:
    label (str): The label indicating the specific sorting column.
    sorting (dict): A dictionary of id: value pairs for updating the database.
    """
    column_name = f"sorting_{sql_safify(label)}"
    
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


def dump_database_json():
    # Connect to the SQLite database
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        
        # Query to select all records from specified table
        cursor.execute(f"SELECT * FROM cells")
        data = cursor.fetchall()
        
        # Get column headers
        headers = [description[0] for description in cursor.description]
        
        # Convert data to a list of dictionaries (one per row)
        json_data = [dict(zip(headers, row)) for row in data]
        
        return json_data

initialize_database()
