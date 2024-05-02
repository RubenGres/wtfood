let state = {
    isMoving: false,
    isTakingPicture: false,
    canMove: true,
    movelocked: false
};


function updateState(newState) {
    state = { ...state, ...newState };
}


updateState({ isMoving: false });
