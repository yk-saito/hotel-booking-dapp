import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Room from "../components/hotelbooking/Room";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";

import { get_available_rooms, book_room } from "../near/utils";

const Search = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [date, setDate] = useState("");
  const [availableRooms, setAvailableRooms] = useState([]);

  const getAvailableRooms = async () => {
    setAvailableRooms(await get_available_rooms(params.date));
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
  }, []);

  return (
    <>
      <Form>
        <Row
          className='justify-content-center'
          style={{ marginTop: "50px", marginBottom: "50px" }}
        >
          <Col xs='auto'>
            <Form.Control
              type='date'
              htmlSize='10'
              onChange={(e) => {
                setDate(e.target.value);
              }}
            />
          </Col>
          <Col xs='auto'>
            <Button
              variant='secondary'
              onClick={() => navigate(`/search/${date}`)}
            >
              Search
            </Button>
          </Col>
        </Row>
      </Form>

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
