import React, { useEffect, useState, useCallback } from "react";
// import { toast } from "react-toastify";
import AddRoom from "./AddRoom";
// import Room from "./Room";
// import Loader from "../utils/Loader";
import { Row } from "react-bootstrap";
// import { NotificationSuccess, NotificationError } from "../utils/Notifications";
import {
  // get_rooms as getRoomList,
  createRoom,
  // get_rooms,
} from "../../near/utils";
//...

const Rooms = () => {
  //...
  // TODO: const get_rooms = ...
  //...

  //...
  const addRoom = async (data) => {
    try {
      // TODO: add Notification
      createRoom(data).then((resp) => {
        console.log("Success!: ", room);
        // get_rooms();
      });
    } catch (error) {
      console.log({ error });
    }
  };
  //...

  //...
  // TODO: const buy = async(id, price) =? {}
  //...

  useEffect(() => {
    // get_rooms();
  }, []);
  return (
    <>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <h1 className='fs-4 fw-bold mb-0'>Hotel Booking</h1>
        <AddRoom save={addRoom} />
      </div>
      <Row xs={1} sm={2} lg={3} className='g-3  mb-5 g-xl-4 g-xxl-5'></Row>
    </>
  );
};

export default Rooms;
