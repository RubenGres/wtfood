import React from 'react';
import {Group, Rect} from 'react-konva';
import {Html} from 'react-konva-utils';
import {useTour} from "@reactour/tour";

function PromptRect(props) {
    var width = props.width;
    var height = props.height;
    var x = props.x;
    var y = props.y;

    var el = document.getElementById("prompt_input");
    if (el !== null) {
        el.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                props.handleSend();
            }
        });
    }

    const {setIsOpen, isOpen, setCurrentStep} = useTour()


    return (
        <Group
            x={0}
            y={0}
        >
            <Group
                x={x}
                y={y}
                fill="green"
            >
                <Rect
                    stroke="black"
                    dash={[10, 10]}
                    shadowBlur={10}
                    shadowColor="white"
                    width={width}
                    height={height}
                    fill={"rgba(240,240,240,0.5)"}
                />

                <Group
                    y={-50 + (height < 0 ? height : 0)}
                    x={width - width / 2 - 200}
                >
                    <Html>
                        <div className='choiceButtonCont'>

                            {props.currentState === "CHOOSE_TYPE" &&
                                <div className={"ChoiceButtons"}>
                                    <img className='choiceButton blue NewImageButton' src="images/new_image.png"
                                         alt="new image" title='New Image'
                                         onClick={() => props.handlePromptButtons("new_image")}/>
                                    <img className='choiceButton yellow OutpaintingButton' src="images/inpaint.png"
                                         alt="outpainting" title='Outpainting'
                                         onClick={() => props.handlePromptButtons("outpainting")}/>
                                    <img className='choiceButton red Img2imgButton' src="images/img2img.png"
                                         alt="img2img" title='Image to Image'
                                         onClick={() => props.handlePromptButtons("img_to_img")}/>
                                    <img className='choiceButton green SaveButton' src="images/save.png" alt="save"
                                         title='Save Selection' onClick={() => props.handleSave("save")}/>
                                    <img className='choiceButton green GenerationHelpButton' src="images/help.png"
                                         alt="help" title='Help'
                                         onClick={props.onHelpClick}/>

                                </div>
                            }

                            {props.currentState === "PROMPT" &&
                                <div>
                                    <input id="prompt_input" placeholder="Your prompt in english" autoFocus />
                                    <button onClick={() => props.handleSend()} >
                                        Send
                                    </button>
                                </div>
                            }

                        </div>
                    </Html>
                </Group>

            </Group>
        </Group>
    );
}

export default PromptRect;
