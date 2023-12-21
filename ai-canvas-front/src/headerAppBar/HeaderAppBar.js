import * as React from 'react';
import {useState} from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import {AppBar, Tab, TextField} from "@mui/material";
import SignInModalButton from "../auth/signinModal";
import TabList from '@mui/lab/TabList';
import {TabContext} from "@mui/lab";
import {auth} from "../auth/Auth";
import {useAuthState} from "react-firebase-hooks/auth";
import AddIcon from '@mui/icons-material/Add';
import Modal from "react-bootstrap/Modal";
import ProfileMenu from "./ProfileMenu";
import SocialMenu from "./SocialMenu";
import CloseIcon from '@mui/icons-material/Close';
import ColablinkModal from '../colablinkModal';

const DEFAULT_ROOMS = ["default", "demo", "test"];

const EXTRA_ROOM_SEPARATOR = "#/"



function useForceUpdate() {
    const [value, setValue] = useState(0); // integer state
    return () => setValue(value => value + 1); // update state to force render
    // An function that increment 👆🏻 the previous state like here
    // is better than directly setting `value + 1`
}

var EXTRA_ROOMS = []
if (localStorage.getItem("EXTRA_ROOMS") !== null){
    EXTRA_ROOMS = localStorage.getItem("EXTRA_ROOMS").split(EXTRA_ROOM_SEPARATOR)
}

var initial_rooms = DEFAULT_ROOMS.concat(EXTRA_ROOMS);

export default function HeaderAppBar(props) {

    const [user, loading, error] = useAuthState(auth);
    const [rooms, setRooms] = useState(initial_rooms);

    const [showModalTabs, setShowModalTabs] = useState(false);
    const handleCloseTabs = () => setShowModalTabs(false);
    const handleShowTabs = () => setShowModalTabs(true);
    const [newRoomName, setNewRoomName] = useState("");

    const [displayedName, setDisplayedName] = React.useState("")

    const forceUpdate = useForceUpdate();


    function handleClickAccessRoom(roomName) {
        handleCloseTabs()
        if(roomName === ""){
            return
        }
        props.setRoom(roomName)
        setRooms(prevState => {
            return [...prevState, roomName]
        })
        let prev_rooms = localStorage.getItem("EXTRA_ROOMS");
        if (prev_rooms === null || prev_rooms === ""){
            localStorage.setItem("EXTRA_ROOMS", roomName)        
        }
        else{
            localStorage.setItem("EXTRA_ROOMS", prev_rooms + EXTRA_ROOM_SEPARATOR + roomName)        
        }
        localStorage.setItem('cur_room', roomName)
    }

    function handleTabsOnChange(roomName) {
        if (roomName == "+") {
            handleShowTabs()
        } else {
            props.setRoom(roomName)
            props.setHistory([])
            localStorage.setItem('cur_room', roomName)

        }

    }

    function handleCloseTab(i, tabRoom){
        console.log("close tab")
        console.log(i)
        rooms.splice(i, 1)
        setRooms(rooms)
        if(props.room === tabRoom){
            props.setRoom(rooms[rooms.length - 1])

            localStorage.setItem('cur_room', rooms[rooms.length - 1]);
            props.setHistory([])

        }

        var extra_rooms = localStorage.getItem("EXTRA_ROOMS").split(EXTRA_ROOM_SEPARATOR)
        extra_rooms.splice(i - DEFAULT_ROOMS.length, 1)
        localStorage.setItem('EXTRA_ROOMS', extra_rooms.join(EXTRA_ROOM_SEPARATOR));

        forceUpdate()
    }


    return (
        <>
            <Modal show={showModalTabs} onHide={handleCloseTabs} style={{marginTop: "50px"}}>
                <Modal.Header closeButton>
                    <Modal.Title>Enter new room name below</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{margin: 'auto'}}>
                    <TextField autofocus label="Room Name" type="textbox"
                               onChange={e => setNewRoomName(e.target.value)}
                               InputProps={{
                                    autoFocus: true,
                                }}
                    />
                               
                               
                    <br/>
                    <br/>
                    <Button variant={"outlined"} onClick={() => handleClickAccessRoom(newRoomName)}>Access Room</Button>
                </Modal.Body>
            </Modal>


            <Box sx={{flexGrow: 1}}>
                <AppBar position="absolute" >
                    <Toolbar style={{justifyContent: 'space-between'}}>
                        {/*<IconButton*/}
                        {/*    size="large"*/}
                        {/*    edge="start"*/}
                        {/*    color="inherit"*/}
                        {/*    aria-label="menu"*/}
                        {/*    sx={{mr: 2}}*/}
                        {/*>*/}
                        {/*    <MenuIcon/>*/}
                        {/*</IconButton>*/}
                        {/*<Typography variant="h6" component="div" style={{marginRight: 'auto'}}>*/}
                        {/*    Koll AI*/}
                        {/*</Typography>*/}
                        <img src="./android-chrome-384x384.png" sx={{mr: 2}}
                             style={{maxWidth: 'auto', maxHeight: '50px', marginRight: '10px'}}/>

                        <ColablinkModal
                            colabLink = {props.colabLink}
                            setColabLink = {props.setColabLink}
                        />

                        {/*TAB LIST*/}
                        <TabContext value={props.room} color={'inherit'} >
                            <TabList variant="scrollable"
                                     onChange={(e, value) => handleTabsOnChange(value)}
                                     textColor={"inherit"}
                                     TabIndicatorProps={{style: {background: 'pink'}}}
                                     style={{}}
                                     className={"RoomTabs"}
                                     scrollButtons
                                     allowScrollButtonsMobile
                            >

                                {
                                    rooms.map((curRoom, i) => {
                                        if (curRoom === ""){
                                            return <></>
                                        }
                                        if (props.room === curRoom && DEFAULT_ROOMS.includes(curRoom) === false ){
                                                return <Tab label={curRoom} value={curRoom} iconPosition='right' icon={<CloseIcon fontSize="small" onClick={() => handleCloseTab(i, curRoom)}/> } />       
                                        }
                                        else{
                                            return <Tab label={curRoom} value={curRoom} />
                                        }
                                            
                                        
                                    })
                                }

                                <Tab icon={<AddIcon/>} value={"+"}/>
                            </TabList>
                        </TabContext>
                        

                        {/* LOGIN / LOGOUT Button */}
                        <div className={"ProfilButton"} style={{justifyContent: 'space-between', display: 'flex'}}>
                            <SocialMenu />

                            {!user ? (
                                <SignInModalButton onSuccess={(pseudo) => setDisplayedName(pseudo)}
                                                   onUserChange={forceUpdate}/>

                            ) : (
                                <ProfileMenu displayedName={displayedName}
                                             onUserChange={forceUpdate}/>
                            )}

                        </div>

                    </Toolbar>
                </AppBar>

            </Box>
        </>
    );
}
