import Modal from 'react-bootstrap/Modal';
import React, {useState} from 'react';
import HelpIcon from "@mui/icons-material/Help";
import Button from "@mui/material/Button";
import {useTour} from "@reactour/tour";
import {Fab} from "@mui/material";


export default function HelpModalButton({show}) {
    const [showHelpModal, setShowHelpModal] = useState(show);

    const handleClose = () => setShowHelpModal(false);
    const handleShow = () => setShowHelpModal(true);
    const {setIsOpen, setCurrentStep} = useTour()


    return (
        <>
            <Fab className={"HelpButton"} color="primary" aria-label="help"
                 onClick={() => {
                     setCurrentStep(0);
                     setIsOpen(true);
                 }}>
                <HelpIcon/>
            </Fab>

            <Modal show={showHelpModal} onHide={handleClose} style={{marginTop: "50px"}}>
                <Modal.Header closeButton>
                    <Modal.Title>How to use Kollai infinite canvas</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <b>View Mode</b> : move the camera, explore the canvas
                    <br/><br/>
                    <b>Edit mode</b> : make a selection and select one of the modes
                    <ul>
                    <li><b>New Image</b>: Generate a new image from scratch</li>
                    <li><b>Inpaint Transparent</b>: Only generate empty parts in the selection for seamless effect</li>
            <li><b>Image to Image</b>: Start the generation with the selection as init. image </li>
            <li><b>Save</b>: Download the selection as jpeg</li>
          </ul>
        </Modal.Body>

        <Modal.Footer>
          <Button color={"primary"} variant={"outlined"} onClick={handleClose}>
            Got it !
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );


}

