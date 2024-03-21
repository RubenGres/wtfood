import random
import numpy as np
import database

grid_size = 11
center_x = 0
center_y = 0

def _init_from_db():
    global possible_positions

    cells = database.get_all_cells_as_dict()

    if len(cells) == 0:
        possible_positions.add((0.,0.))
    else:
        for cell in cells:
            remove_coord((cell['x'], cell['y']))


def pick_position():
    coordinates =  random.sample(possible_positions, k=1)
    return coordinates[0]


def get_possible_positions():
    return possible_positions


def remove_coord(coordinates):
    global filled_positions
    global possible_positions

    coordinates = (float(coordinates[0]), float(coordinates[1]))
    
    if coordinates in possible_positions:
        possible_positions.remove(coordinates)

    filled_positions.add(coordinates)

    # add surrounding cells to possible positions
    for i in np.arange(coordinates[0] - 1, coordinates[0] + 2):
        for j in np.arange(coordinates[1] - 1, coordinates[1] + 2):
            if (i,j) not in filled_positions:
                possible_positions.add((i,j))


possible_positions = set()
filled_positions = set()
_init_from_db()
