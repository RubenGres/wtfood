movelock = document.getElementById('movelock')
movelock.addEventListener('click', function() {
  unfocus_card();
});

function show_movelock() {
  movelock.style.visibility = 'visible';
  updateState({ movelocked: true });
}

function hide_movelock() {
  movelock.style.visibility = 'hidden';
  updateState({ movelocked: false });
}
