let state = {
    isMoving: false,
    movelocked: false
};


function updateState(newState) {
    state = { ...state, ...newState };
}


updateState({ isMoving: false });
