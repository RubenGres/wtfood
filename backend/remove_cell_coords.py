import ..database as database

print("Which cell to remove?")
x = input("X: ")
y = input("Y: ")

database.remove_cell(x, y)