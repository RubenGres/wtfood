import numpy as np

grid_size = 11
center_x = 5
center_y = 5

distances = np.zeros((grid_size, grid_size))

for x in range(grid_size):
    for y in range(grid_size):
        distances[x, y] = np.sqrt((x - center_x)**2 + (y - center_y)**2)

# Normalize distances to get probabilities (inverse to make closer points have higher probability)
max_distance = np.max(distances)
probabilities = 1 - distances / max_distance
probabilities /= probabilities.sum()  # Normalize probabilities

# Flatten probabilities and use them to select points
probability_grid = probabilities.flatten()


def new_coordinates():
    selected_indices = np.random.choice(grid_size * grid_size, p=probability_grid)
    coordinates = np.unravel_index(selected_indices, (grid_size, grid_size))
    return (coordinates[0], coordinates[1])


def remove_coord(coordinates):
    probability_grid[coordinates[0], coordinates[1]] = 0
