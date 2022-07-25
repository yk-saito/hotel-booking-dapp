import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { get_hotel_rooms, change_status_to_available } from "../near/utils";

const RoomManagement = () => {
  const params = useParams();
  console.log("params.address=", params.address);

  const [manageRooms, setManageRooms] = useState([]);

  const getManageRooms = async () => {
    try {
      setManageRooms(await get_hotel_rooms(params.address));
    } catch (error) {
      console.log({ error });
    }
  };

  const triggerToAvailable = async (room_name) => {
    try {
      console.log("in RoomManagement.js: ", room_name);
      change_status_to_available(room_name).then((resp) => {
        getManageRooms();
      });
    } catch (error) {
      console.log({ error });
    }
  };

  // console.log(manageRooms); // TODO: delete

  useEffect(() => {
    getManageRooms();
  }, []);
  return (
    <>
      <h2>owner: {params.address}</h2>
      <table className='table'>
        <thead>
          <tr>
            <th scope='col'>#</th>
            <th scope='col'>Room Name</th>
            <th scope='col'>Status</th>
            <th scope='col'>GuestID</th>
            <th scope='col'>Manage Status</th>
          </tr>
        </thead>
        {manageRooms.map((_room) => (
          <tbody key={_room.id}>
            {_room.status === "Available" && (
              <tr>
                <th scope='row'>{_room.id}</th>
                <td>{_room.name}</td>
                <td>{_room.status}</td>
                <td>-</td>
                <td>-</td>
              </tr>
            )}
            {_room.status !== "Available" && (
              <tr>
                <th scope='row'>{_room.id}</th>
                <td>{_room.name}</td>
                <td>Booked</td>
                {/* 予約したユーザーのアカウントIDを表示 */}
                <td>{_room.status.Booked.guest}</td>
                <td>
                  <button onClick={(e) => triggerToAvailable(_room.name, e)}>
                    Check Out
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        ))}
      </table>
    </>
  );
};

export default RoomManagement;
