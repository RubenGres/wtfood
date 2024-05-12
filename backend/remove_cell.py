import src.database as database

id = input("What is the id of the cell you want to remove? ")

database.remove_cell_by_id(id)
