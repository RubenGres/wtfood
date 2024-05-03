function updateLoadingBar(loading_elempercent, duration, cellid) {
    const loadingBar = document.getElementById('loading-bar' + cellid);
    loadingBar.style.transition = `width ${duration}s`;
    loadingBar.style.width = `${percent}%`;
}

