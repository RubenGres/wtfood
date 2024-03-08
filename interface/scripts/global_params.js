const SD_API_URL = "https://0e8ap1mqic7ud8-5000.proxy.runpod.net/";
const grid_height = 10;
const grid_width = 10;

let cell_w = 256 + 128;
let cell_h = 256 + 128;
const cell_margin = 10;

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
if(isMobile) {
    const shorterSide = Math.min(window.visualViewport.width, window.visualViewport.height);
    const mobileSize = Math.round(shorterSide * 0.85);
    cell_w = mobileSize;
    cell_h = mobileSize;
}
