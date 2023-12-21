
import Modal from 'react-bootstrap/Modal';
import React, { useState } from "react";

const RoomTabPanel = props => {
    const [rooms, setRooms] = useState(["default", "demo", "test"])
    const [showModal, setShowModal] = useState(false);

    const handleClose = () => setShowModal(false);
    const handleShow = () => setShowModal(true);

    let roomname = '';

    function handleClickOk() {
        setRooms(prevState => { return [...prevState, roomname] })
        changeRoom(roomname);
        handleClose();
    }

    function changeRoom(newRoom) {
        props.setRoom(newRoom);
    }

    function removeRoomTab(e, i, room) {
        if (e && e.stopPropagation) e.stopPropagation();

        if(props.room == room) {
            let r = [...rooms];
            r.splice(i, 1);
            props.setRoom(r[0]);
        }

        setRooms(prevState => {
            let r = [...prevState];
            r.splice(i, 1);
            return r
        });
    }

    function newRoomTab(e) {
        if (e && e.stopPropagation) e.stopPropagation();
        handleShow();
    }

    return (
        <>
            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Enter new room name below</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <input type="textbox" onChange={e => roomname = e.target.value} />
                    <button onClick={handleClickOk}>Ok</button>
                </Modal.Body>
            </Modal>

            <div className="roomtabpanel">
                {
                    rooms.map((room, i) => {
                        return (
                            <div className={"roomtab" + (props.room == room ? " roomtabSelected" : '')} onClick={(e) => changeRoom(room)}>
                                {room}

                                <div className="roomtabClose" onClick={(e) => removeRoomTab(e, i, room)}>
                                    x
                                </div>
                            </div>
                        )
                    })
                }


                <div className="newRoomTab" onClick={(e) => newRoomTab(e)}>
                    +
                </div>
            </div>
        </>
    )
}

export default RoomTabPanel;