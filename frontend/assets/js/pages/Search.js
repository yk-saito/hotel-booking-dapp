import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AddRoom from "../components/hotelbooking/AddRoom";
import Room from "../components/hotelbooking/Room";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";

import { get_all_rooms, set_room, book_room } from "../near/utils";
//...

const Search = () => {
  const navigate = useNavigate();
  const params = useParams();
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

  // TODO: get_all_rooms挟まずに、直接コントラクトからデータ取得
  const searchAvaliableRooms = () => {
    const keys = Object.keys(rooms);
    console.log("keys:", keys);
    var search_room = [];
    keys.forEach((key) => {
      if (rooms[key].booked_date.includes(params.date) == false) {
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
    searchAvaliableRooms();
  }, [params]);
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
        {search.map((_room) => (
          <Room room={{ ..._room }} key={_room.id} booking={booking} />
        ))}
      </Row>
    </>
  );
};

export default Search;
