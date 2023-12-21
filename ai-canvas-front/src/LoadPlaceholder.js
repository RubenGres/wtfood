import React from 'react';
import { Group } from 'react-konva';
import { Html } from 'react-konva-utils';
import { SpinnerCircular } from 'spinners-react';

class LoadPlaceholder extends React.Component {

    render() {
        var minSize = Math.min(this.props.width, this.props.height)

        const style = {
            borderColor: "black",
            borderWidth: "0.15em",
            borderStyle: "solid",
            boxSizing: "border-box",
            backgroundColor: "rgba(255,255,255,0.7)",
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
            width: this.props.width,
            height: this.props.height,
            position: "relative",
            zIndex: "0"
        }

        const inner = {
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)"
        }

        return (
            <Group
                x={this.props.x}
                y={this.props.y}
            >
                <Html>
                    <div style={style}>
                        <div style={inner}>
                            <SpinnerCircular size={minSize * 0.5} thickness={100} speed={100} color="rgba(200, 200, 200, 1)" secondaryColor="rgba(255, 255, 255, 1)" />
                        </div>
                    </div>
                </Html>
            </Group>
        );
    }

}

export default LoadPlaceholder;