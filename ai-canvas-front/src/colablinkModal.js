import Modal from 'react-bootstrap/Modal';
import React, {useState, useEffect} from 'react';
import Button from "@mui/material/Button";
import {TextField} from "@mui/material";


export default function ColablinkModal(props) {

    const [showModal, setShowModal] = useState(false);


    const handleClose = () => {
        console.log(props.x)
        setShowModal(false)
    };
    const handleShow = () => setShowModal(true);



    return (
        <>
            <div onClick={handleShow}>
               <Button onClick={handleShow} color={'inherit'} variant={"outlined"} size="large"> Colab Link </Button>
            </div>

            <Modal show={showModal} onHide={handleClose} style={{marginTop: "50px"}}>
                <Modal.Header closeButton>
                    <Modal.Title>Link to your Colab </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <TextField type="textbox" value={props.colabLink} style={{flexGrow: 1}}
                                 InputProps={{
                                     autoFocus: true,
                                 }}
                                onChange = {(e) => props.setColabLink(e.target.value)}
                                 />
                    <Button variant={"outlined"} style={{marginLeft: '10px'}}>Validate</Button>

                </Modal.Body>
            </Modal>
        </>
    );
}

