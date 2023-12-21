import { React, forwardRef, useImperativeHandle, useRef} from 'react';

const ImageSaver = forwardRef((props, ref) => {
    useImperativeHandle(ref, () => ({
        cropImg(uri, x, y, w, h) {
            const ctx = canvasRef.getContext('2d');
            var image = new Image();
            image.src = uri;

            // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
            image.onload = function () {
                ctx.drawImage(image, x, y, w, h, 0, 0, w, h);
            }
        }
    }));

    return (
        <canvas
            style={style}
            ref={canvasRef}
            width="1024px"
            height="1024px">
        </canvas>
    )
});

export default ImageSaver;