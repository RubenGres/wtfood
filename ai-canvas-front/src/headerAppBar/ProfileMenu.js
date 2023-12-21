import React, {useState} from "react";
import {IconButton, Menu, MenuItem, TextField, Typography} from "@mui/material";
import Modal from "react-bootstrap/Modal";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import {auth, logout, updatePseudo} from "../auth/Auth";
import {useAuthState} from "react-firebase-hooks/auth";
import Button from "@mui/material/Button";


function useForceUpdate() {
    const [value, setValue] = useState(0); // integer state
    return () => setValue(value => value + 1); // update state to force render
    // An function that increment 👆🏻 the previous state like here
    // is better than directly setting `value + 1`
}

export default function ProfileMenu(props) {
    const BACK_BASE_URL = process.env.REACT_APP_BACK_URL;
    const URL_FUNCTION_UPDATE_PSEUDO = BACK_BASE_URL + "/update_user_pseudo/"

    const [showModaleProfile, setShowModalProfile] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [open, setOpen] = React.useState(false);
    const [user, loading, error] = useAuthState(auth);

    const [displayedName, setDisplayedName] = React.useState(props.displayedName)


    const handleClickProfile = (event) => {
        setAnchorEl(event.currentTarget);
        setOpen(true)
    };
    const handleCloseMenuProfile = () => {
        setAnchorEl(null);
        setOpen(false);
        setShowModalProfile(false);
    };

    const handleMenuLogout = () => {
        logout();
        setAnchorEl(null);
        setOpen(false);
    };

    function handleClicMenuUpdateProfile() {
        setShowModalProfile(true);
        setOpen(false)
    }

    function handleClicUpdateProfile() {
        setShowModalProfile(false)
        fetch(URL_FUNCTION_UPDATE_PSEUDO, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                credential: user.accessToken,
                pseudo: displayedName
            }),
        }).then(() => setDisplayedName(displayedName))
        updatePseudo(displayedName).then(props.onUserChange)
        //     .then(() => {
        //     console.log("i am after update")
        //     console.log(user)
        //     user.reload().then(() => {
        //         console.log("i am after reload")
        //         console.log(user)
        //     })
        //
        // })
    }

    return (
        <div>

            <Modal show={showModaleProfile} onHide={() => setShowModalProfile(false)} style={{marginTop: "50px"}}>
                <Modal.Header closeButton>
                    <Modal.Title>Enter your new infos</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{margin: 'auto'}}>
                    <TextField label="Displayed Name" type="textbox"
                               onChange={e => setDisplayedName(e.target.value)}
                               value={displayedName}

                    />
                    <br/>
                    <br/>
                    <Button variant={"outlined"} onClick={() => handleClicUpdateProfile()}>Update Profile</Button>
                </Modal.Body>
            </Modal>

            <Button onClick={handleClickProfile} style={{color: 'inherit', border:'1px solid white', borderRadius:"10px"}}>
                {/* <Typography sx={{marginRight: "5px"}} variant={'h5'}>{user.displayName}</Typography> */}
                <AccountCircleIcon fontSize={'large'}/>
            </Button>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleCloseMenuProfile}
                MenuListProps={{'aria-labelledby': 'basic-button'}}>

                <MenuItem>{user.displayName}</MenuItem>
                <MenuItem onClick={handleClicMenuUpdateProfile}>Edit Profile</MenuItem>
                <MenuItem onClick={handleMenuLogout}>Logout</MenuItem>
            </Menu>

        </div>

    )
}