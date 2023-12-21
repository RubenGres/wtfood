import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import React, {useState} from "react";
import {IconButton, Button, Menu, MenuItem, TextField, Typography} from "@mui/material";

export default function SocialMenu(){

    const [anchorEl, setAnchorEl] = React.useState(null);
    const [open, setOpen] = React.useState(false);


    const handleClickProfile = (event) => {
        setAnchorEl(event.currentTarget);
        setOpen(true)
    };
    const handleCloseMenuProfile = () => {
        setAnchorEl(null);
        setOpen(false);
    };


    const handleMenuLogout = () => {

        setAnchorEl(null);
    };


    return <>
        
        <Button variant={"outlined"} onClick={handleClickProfile} 
                style={{color: 'inherit', borderColor: "white", marginRight:"5px", borderRadius:"10px"}}>
            <ConnectWithoutContactIcon fontSize={'large'}/>
        </Button>
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleCloseMenuProfile}
            MenuListProps={{'aria-labelledby': 'basic-button'}}>

            <MenuItem>Found a bug? Want to receive updates? </MenuItem>
            <a style={{color:"inherit", textDecoration:"none"}} href="https://discord.gg/HjVbPNWB"> <MenuItem > <img style={{maxHeight: "auto", maxWidth:"40px", marginRight:"5px"}} src="images/discorde.png"></img> Join Discord </MenuItem> </a>
            <a style={{color:"inherit", textDecoration:"none"}} href="https://twitter.com/koll_ai"> <MenuItem > <img style={{maxHeight: "auto", maxWidth:"40px", marginRight:"5px"}} src="images/twitter.png"></img> Follow Twitter </MenuItem> </a>
        </Menu>

</>

}