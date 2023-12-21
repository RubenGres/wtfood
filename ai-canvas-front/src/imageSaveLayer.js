import React from 'react';
import { forwardRef, useRef, useImperativeHandle } from 'react';
import { Image, Stage, Layer } from 'react-konva';

function downloadURI(uri, name) {
    var link = document.createElement('a');
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

const ImageSaverLayer = forwardRef((props, ref) => {
    const saveLayerRef = useRef(null);

    useImperativeHandle(ref, () => ({

        download() {
            downloadURI(saveLayerRef.current.toDataURL(), "IC-" + Date.now() + ".png")
        },

        uri() {
            return saveLayerRef.current.toDataURL()
        }

    }));

    return (
        <Stage
            width={512}
            height={512}
        >
            <Layer
                ref={saveLayerRef}
                clipX={0}
                clipY={0}
                clipWidth={props.imageSave.w}
                clipHeight={props.imageSave.h}
            >
                <Image
                    x={-props.imageSave.x}
                    y={-props.imageSave.y}
                    image={props.imageSave.image}
                />
            </Layer>

        </Stage>
    )
})

export default ImageSaverLayer;
