import Modal from 'react-bootstrap/Modal';
import React, {useState} from 'react';
import SigninTabs from './signintabs';
import Button from "@mui/material/Button";


export default function SignInModalButton(props) {
  const [showModal, setShowModal] = useState(false);
  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  return (
    <>
        <Button onClick={handleShow} color={'inherit'} variant={"outlined"} size="large" >
            Login
        </Button>

      <Modal show={showModal} onHide={handleClose} style={{marginTop: "50px"}}>
          <Modal.Header closeButton>
              <Modal.Title>Login or Register with your favorite provider</Modal.Title>
          </Modal.Header>
          <Modal.Body>

              <SigninTabs onUserChange={props.onUserChange}/>

          </Modal.Body>

          <Modal.Footer>
          <Button variant="outlined" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );


}

