import React, { useEffect, useState, useCallback } from "react";
import AddRoom from "./AddRoom";
import Room from "./Room";
import { Row } from "react-bootstrap";

import { get_all_rooms, set_room, book_room } from "../../near/utils";
//...

const Rooms = () => {
  const [rooms, setRooms] = useState([]);

  //...
  const getRooms = useCallback(async () => {
    try {
      setRooms(await get_all_rooms());
    } catch (error) {
      console.log({ error });
    }
  });
  //...

  //...
  const addRoom = async (data) => {
    await set_room(data).then((is_success) => {
      if (!is_success) {
        console.log("addRoom: ", is_success);
        alert(
          'Error "Already exists."' +
            "\n owner: " +
            window.accountId +
            "\n room : " +
            data.name
        );
      }
      getRooms();
    });
  };
  //...

  //...
  const booking = async (owner_id, room_name, price) => {
    await book_room({
      owner_id,
      room_name,
      price,
    }).then((is_success) => {
      // TODO: 以降の処理が実行されない
      console.log("booking: ", is_success);
      if (!is_success) {
        alert('Error "Please try again."');
      } else {
        alert("Booked!" + "\nowner: " + owner_id + "\nroom name: " + room_name);
      }
      // getRooms();
    });
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
          <Room room={{ ..._room }} key={_room.id} booking={booking} />
        ))}
      </Row>
    </>
  );
};

export default Rooms;
