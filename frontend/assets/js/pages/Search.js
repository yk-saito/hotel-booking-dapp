import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Row from "react-bootstrap/Row";

import { get_available_rooms, book_room } from "../near/utils";
import Room from "../components/hotelbooking/Room";
import FormDate from "../components/FormDate";

const Search = () => {
  const { date } = useParams();
  const [availableRooms, setAvailableRooms] = useState([]);

  const getAvailableRooms = async () => {
    console.log("Call getAvailableRooms");
    console.log("date(URL): ", date);

    setAvailableRooms(await get_available_rooms(date));
    console.log("availableRoom: ", availableRooms);
  };

  //...
  const booking = async (owner_id, room_name, price) => {
    let is_success = book_room({
      owner_id,
      room_name,
      date,
      price,
    });
    getAvailableRooms();
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
    getAvailableRooms();
  }, [date]);

  return (
    <>
      <FormDate />
      <div className='text-center' style={{ margin: "20px" }}>
        <h2>{date}</h2>
        {availableRooms.length === 0 ? (
          <h3>Sorry, no rooms found.</h3>
        ) : (
          <h3>{availableRooms.length} found.</h3>
        )}
      </div>
      <Row>
        {availableRooms.map((_room) => (
          <Room
            room={{ ..._room }}
            key={_room.owner_id + _room.room_name}
            booking={booking}
          />
        ))}
      </Row>
    </>
  );
};

export default Search;
