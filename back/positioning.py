import numpy as np

grid_size = 11
center_x = 0
center_y = 0


distances = np.zeros((grid_size, grid_size))


for x in range(grid_size):
    for y in range(grid_size):
        distances[x, y] = (x - center_x)**2 + (y - center_y)**2

# Normalize distances to get probabilities (inverse to make closer points have higher probability)
probabilities = 1 - distances / np.max(distances)
probabilities /= probabilities.sum()  # Normalize probabilities

# Flatten probabilities and use them to select points
probability_grid = probabilities.flatten()


def new_coordinates():
    selected_indices = np.random.choice(grid_size * grid_size, p=probability_grid)
    coordinates = np.unravel_index(selected_indices, (grid_size, grid_size))
    return [float(c) for c in coordinates]


def remove_coord(coordinates):
    global probability_grid
    probability_grid[int(coordinates[0]) * grid_size + int(coordinates[1])] = 0
    probability_grid /= probability_grid.sum()  # Normalize probabilities
