import React, { useEffect, useState, useCallback } from "react";
import AddRoom from "./AddRoom";
import Room from "./Room";
import { Button, Form, Row, Stack } from "react-bootstrap";

import { get_all_rooms, set_room, book_room } from "../../near/utils";
//...

const Rooms = () => {
  const [date, setDate] = useState("");
  const [rooms, setRooms] = useState([]);
  const [search, searchRooms] = useState([]);

  //...
  const getRooms = useCallback(async () => {
    try {
      setRooms(await get_all_rooms());
    } catch (error) {
      console.log({ error });
    }
  });

  const triggerSearch = () => {
    const keys = Object.keys(rooms);
    console.log("keys:", keys);
    var search_room = [];
    keys.forEach((key) => {
      if (rooms[key].booked_date.includes(date) == false) {
        search_room.push(rooms[key]);
        console.log(rooms[key]);
      }
    });
    searchRooms(search_room);
    console.log("GET SEARCH ROOM: ", search_room);
  };
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
    let is_success = book_room({
      owner_id,
      room_name,
      date,
      price,
    });
    // }).then((is_success) => {
    //   // TODO: 以降の処理が実行されない
    //   console.log("booking: ", is_success);
    //   if (!is_success) {
    //     alert('Error "Please try again."');
    //   } else {
    //     alert("Booked!" + "\nowner: " + owner_id + "\nroom name: " + room_name);
    //   }
    //   // getRooms();
    // });
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

      <Stack direction='horizontal' gap={3}>
        <Form.Control
          type='date'
          htmlSize='10'
          onChange={(e) => {
            setDate(e.target.value);
          }}
        />
        <Button
          variant='secondary'
          onClick={() => {
            triggerSearch();
          }}
        >
          Search
        </Button>
      </Stack>

      <Row>
        {search.map((_room) => (
          <Room room={{ ..._room }} key={_room.id} booking={booking} />
        ))}
      </Row>
    </>
  );
};

export default Rooms;
