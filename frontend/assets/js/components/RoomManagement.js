import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Table } from "react-bootstrap";
import { get_booked_rooms, delete_booked_info } from "../near/utils";

const RoomManagement = () => {
  const params = useParams();
  console.log("params.address=", params.address);

  const [bookedRooms, setBookedRooms] = useState([]);

  const getBookedRooms = async () => {
    try {
      setBookedRooms(await get_booked_rooms(params.address));
    } catch (error) {
      console.log({ error });
    }
  };

  const triggerToAvailable = async (room_name, checkin_date) => {
    try {
      console.log("in RoomManagement.js: ", room_name, checkin_date);
      delete_booked_info(room_name, checkin_date).then((resp) => {
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
  return (
    <>
      <h2>Hotel owner: {params.address}</h2>
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
          <tbody key={`${_room.name}${_room.checkin_date}`}>
            <tr>
              <th scope='row'>{_room.id}</th>
              <td>{_room.name}</td>
              <td>{_room.checkin_date}</td>
              <td>{_room.guest_id}</td>
              <td>
                <Button
                  variant='danger'
                  size='sm'
                  onClick={(e) =>
                    triggerToAvailable(_room.name, _room.checkin_date, e)
                  }
                >
                  Check Out
                </Button>
              </td>
            </tr>
          </tbody>
        ))}
      </Table>
    </>
  );
};

export default RoomManagement;
