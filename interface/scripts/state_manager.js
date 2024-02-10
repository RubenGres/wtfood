let state = {
    isMoving: false,
    isTakingPicture: false,
};


function updateState(newState) {
    state = { ...state, ...newState };
}


updateState({ isMoving: false });
