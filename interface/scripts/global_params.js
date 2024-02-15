const SD_API_URL = "http://localhost:5000/transform";
const grid_height = 5;
const grid_width = 5;

let cell_w = 256;
let cell_h = 256;
const cell_margin = 10;

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
if(isMobile) {
    const shorterSide = Math.min(window.visualViewport.width, window.visualViewport.height);
    const mobileSize = Math.round(shorterSide * 0.85);
    cell_w = mobileSize;
    cell_h = mobileSize;
}