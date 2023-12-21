import React from 'react';
import {Group, Image, Rect} from 'react-konva';
import { toast } from 'react-toastify';

class URLImage extends React.Component {
    state = {
        image: null,
        infoVisible: false,
        cursor: 'pointer',
    };

    componentDidMount() {
        this.loadImage();
    }

    // componentDidUpdate(oldProps) {
    //     if (oldProps.src !== this.props.src) {
    //         this.loadImage();
    //     }
    // }

    componentWillUnmount() {
        this.image.removeEventListener('load', this.handleLoad);
    }

    loadImage() {
        this.image = new window.Image();
        this.image.src = this.props.src;
        this.image.crossOrigin = 'Anonymous';
        this.image.addEventListener('load', this.handleLoad);
    }

    handleEnter = () => {
        if (this.props.mode === "VIEW")
            this.setState({ infoVisible: true });
    }
    handleLeave = () => {
        if (this.props.mode === "VIEW")
            this.setState({ infoVisible: false });
    }
    handleClick = () => {
        console.log(this.props.prompt);
        console.log(this.props.pseudo);
        console.log(this.props.timestamp);
        toast.info()
    }

    handleLoad = () => {
        if (this.props.state === "VIEW")
            this.setState({ infoVisible: false });

        // after setState react-konva will update canvas and redraw the layer
        // because "image" property is changed
        this.setState({
            image: this.image,
        });
        // if you keep same image object during source updates
        // you will have to update layer manually:
        // this.imageNode.getLayer().batchDraw();
    }

    render() {
        return (
            <Group
                x={this.props.x - (this.state.infoVisible ? 0 : 0)}
                y={this.props.y - (this.state.infoVisible ? 0 : 0)}
                onMouseEnter={this.handleEnter}
                onMouseLeave={this.handleLeave}
                onDblTap={() => this.props.onClickImage(this.props.prompt)}
                onDblClick={() => this.props.onClickImage(this.props.prompt)}

                // onClick={() => console.log(this.props.prompt)}
            >
                {this.state.image === null &&

                    <Rect
                        width={this.props.width}
                        height={this.props.height}
                        fill={this.props.avg_color}
                    />

                }

                <Image
                    width={this.props.width + (this.state.infoVisible ? 0 : 0)}
                    height={this.props.height + (this.state.infoVisible ? 0 : 0)}
                    image={this.state.image}
                    ref={(node) => { this.imageNode = node; }}
                    // onClick={() => this.props.onClickImage(this.props.prompt)}
                />
            </Group>
        );
    }
}

export default URLImage;