import React, { useEffect, useState, useCallback } from "react";
// import { toast } from "react-toastify";
import AddRoom from "./AddRoom";
import Room from "./Room";
// import Loader from "../utils/Loader";
import { Row } from "react-bootstrap";
// import { NotificationSuccess, NotificationError } from "../utils/Notifications";
import {
  get_rooms as getRoomList,
  createRoom,
  booking_room,
} from "../../near/utils";
//...

const Rooms = () => {
  const [rooms, setRooms] = useState([]);

  //...
  const getRooms = useCallback(async () => {
    try {
      setRooms(await getRoomList());
    } catch (error) {
      console.log({ error });
    }
  });
  //...

  //...
  const addRoom = async (data) => {
    try {
      // TODO: add Notification
      createRoom(data).then((resp) => {
        console.log("Success!: ", data);
        getRooms();
      });
    } catch (error) {
      console.log({ error });
    }
  };
  //...

  //...
  const booking = async (room_id, price) => {
    try {
      await booking_room({
        room_id,
        price,
      }).then((resp) => getRooms());
      console.log("Booking successfully.");
    } catch (error) {
      console.log("Failed to booking.");
    }
  };
  //...

  useEffect(() => {
    getRooms();
  }, []);
  return (
    <>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <h1 className='fs-4 fw-bold mb-0'>Hotel Booking</h1>
        <AddRoom save={addRoom} />
      </div>
      <Row xs={1} sm={2} lg={3} className='g-3  mb-5 g-xl-4 g-xxl-5'>
        {rooms.map((_room) => (
          <Room room={{ ..._room }} key={_room.room_id} booking={booking} />
        ))}
      </Row>
    </>
  );
};

export default Rooms;
