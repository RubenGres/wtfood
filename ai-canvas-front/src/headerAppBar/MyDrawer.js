import {Divider,Button, Fab, IconButton, List, ListItemButton, SwipeableDrawer, TextField, Typography, Collapse} from "@mui/material";
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import React from "react";
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';


export default function MyDrawer(props) {

    const [isOpen, setIsopen] = React.useState(false)
    const [expandModifier, setExpandModifier] = React.useState(true)
    const [expandHistory, setExpandHistory] = React.useState(true)



    return (
        <>
            <Fab style={{position: 'absolute', right: 0, top: '50px'}}
                 onClick={() => setIsopen(true)}
            >
                <KeyboardDoubleArrowLeftIcon/>
            </Fab>
            <SwipeableDrawer
                var
                anchor={"right"}
                open={isOpen}
                onClose={() => setIsopen(false)}
                variant={"persistent"}
                PaperProps={{
                    sx: {
                      backgroundColor: "rgb(231, 244, 254)",
                      maxWidth:"300px"
                    //   color: "lightblue",
                    }
                  }}
            >
                <Button
                    variant="outlined"
                    onClick={() => setIsopen(false)}
                    style={{margin: "5px"}}
                >
                    {/* <KeyboardDoubleArrowRightIcon/> */}
                    Close
                </Button>

                <Typography variant={('h5')}
                            sx={{marginTop: '10px', marginRight: 'auto', marginLeft: 'auto'}}
                            onClick={() => setExpandModifier(!expandModifier)}>
                                Modifiers

                </Typography>
                
                <Collapse in={expandModifier}>
                    <TextField
                        label="Positive Modifiers"
                        multiline
                        maxRows={4}
                        value={props.modifiers.positive}
                        onChange={(e) => props.setModifiers({positive: e.target.value})}
                        style={{background:"white", margin:'5px', width:"100%"}}
                    />
                    <br/>
                    {/* <br/>
                    <br/>
                    <br/> */}
                    <TextField
                        label="Negative Modifiers"
                        multiline
                        maxRows={4}
                        value={props.modifiers.negative}
                        onChange={(e) => props.setModifiers({negative : e.target.value})}
                        style={{background:"white", margin:'5px', width:"100%"}}

                    />
                    <br/>
                </Collapse>

                <Typography variant={('h5')}
                            sx={{marginTop: '10px', marginRight: 'auto', marginLeft: 'auto'}}
                            onClick={() => setExpandHistory(!expandHistory)}>History</Typography>
                <br/>
                
                <div>
                    <Collapse in={expandHistory}>
                    <List style={{ maxHeight:"150px", overflow:"auto", background:"white", margin:"5px"}}>
                        {props.history.map((data) => {
                            var posX = data.x;
                            var posY = data.y;
                            var height = data.h;
                            var width  = data.w;

                            var z = Math.min(props.canvasMeta.w / + width, props.canvasMeta.h / + height) * 0.5;
                            var x = + posX - (props.canvasMeta.w / 2) / z + +width / 2
                            var y = + posY - (props.canvasMeta.h / 2) / z + +height / 2
                            return (<>
                                    <Divider sx={{borderBottomColor: 'black'}}/>

                                    <ListItemButton onClick={() => {
                                        props.camera.move(x, y, z)
                                    }}>{data.prompt}</ListItemButton>
                                </>
                            )
                        })

                        }
                        <Divider sx={{borderBottomColor: 'black'}}/>

                    </List>
                    </Collapse>
                </div>

            </SwipeableDrawer>
        </>
    )

}