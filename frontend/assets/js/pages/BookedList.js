import React, { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import {
  get_booked_rooms,
  is_available,
  change_status_to_available,
  change_status_to_stay,
} from "../near/utils";

const BookedList = () => {
  const [bookedRooms, setBookedRooms] = useState([]);

  const getBookedRooms = async () => {
    try {
      setBookedRooms(await get_booked_rooms(window.accountId));
    } catch (error) {
      console.log("ERR_DISCONNECTED_WALLET");
    }
  };

  const triggerCheckIn = async (room_name, check_in_date) => {
    let isAvailable = await is_available(window.accountId, room_name);
    if (isAvailable == false) {
      alert('Error "Someone already stay."');
      return;
    }
    try {
      change_status_to_stay(room_name, check_in_date).then((resp) => {
        getBookedRooms();
      });
    } catch (error) {
      console.log({ error });
    }
  };
  const triggerCheckOut = async (room_name, check_in_date) => {
    try {
      console.log("in BookedList.js: ", room_name, check_in_date);
      change_status_to_available(room_name, check_in_date).then((resp) => {
        getBookedRooms();
      });
    } catch (error) {
      console.log({ error });
    }
  };

  useEffect(() => {
    getBookedRooms();
    console.log("manage: ", bookedRooms);
  }, []);

  console.log("manage2: ", bookedRooms);

  if (!window.accountId) {
    return (
      <>
        <h2>Please connect NEAR wallet.</h2>
      </>
    );
  }
  return (
    <>
      <h2>BOOKED LIST</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th scope='col'>#</th>
            <th scope='col'>Room Name</th>
            <th scope='col'>Check In</th>
            <th scope='col'>GuestID</th>
            <th scope='col'>Manage Status</th>
          </tr>
        </thead>
        {bookedRooms.map((_room) => (
          <tbody key={`${_room.name}${_room.check_in_date}`}>
            <tr>
              <th scope='row'>{_room.id}</th>
              <td>{_room.name}</td>
              <td>{_room.check_in_date}</td>
              <td>{_room.guest_id}</td>
              <td>
                {_room.status === "Available" && (
                  <Button
                    variant='success'
                    size='sm'
                    onClick={(e) =>
                      triggerCheckIn(_room.name, _room.check_in_date, e)
                    }
                  >
                    Check In
                  </Button>
                )}
                {_room.status !== "Available" && (
                  <Button
                    variant='danger'
                    size='sm'
                    onClick={(e) =>
                      triggerCheckOut(_room.name, _room.check_in_date, e)
                    }
                  >
                    Check Out
                  </Button>
                )}
              </td>
            </tr>
          </tbody>
        ))}
      </Table>
    </>
  );
};

export default BookedList;
