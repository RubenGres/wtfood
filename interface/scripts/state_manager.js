let state = {
    isMoving: false
};

function updateState(newState) {
    state = { ...state, ...newState };
}

updateState({ isMoving: true });
