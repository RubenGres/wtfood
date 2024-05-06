var FD_API_URL = "https://6z8wzg7gc62klm-5000.proxy.runpod.net/";

let zoom = 1;

let cell_w = 128;
let cell_h = 128;
let cell_margin = 10;

const camera_output_size = 512;

const CARD_ZOOM_LEVEL = 0.8
const ZOOM_DURATION_MS = 300;
const MOBILE_MIN_ZOOM = 0.05;
const SWIPE_MAX_DURATION_MS = 300;
const MIN_SWIPE_DIST = 30;
const LOADING_BAR_DURATION_S = 80;

const FIREFLY_ANIMATION_TIME_MS = 30000;
const FIREFLY_AMOUNT = 5;

const predifined_labels = [
    "working conditions",
    "fair trade",
    "consumer rights",
    "water consumption",
    "global emissions",
    "france",
    "spain",
    "portugal"
]
