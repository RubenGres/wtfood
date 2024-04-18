let state = {
    isMoving: false,
    isTakingPicture: false,
    canMove: true
};


function updateState(newState) {
    state = { ...state, ...newState };
}


updateState({ isMoving: false });
