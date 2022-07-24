import React, { useEffect, useState } from "react";

import { get_hotel_rooms } from "../near/utils";

const RoomManagement = () => {
  const account = window.walletConnection.account(); // TODO: 引数でWallet.jsからもらう
  console.log("get addres: ", account.accountId); // TODO: delete

  const [manageRooms, setManageRooms] = useState([]);

  const getManageRooms = async () => {
    try {
      console.log("Call get_hotel_rooms");
      setManageRooms(await get_hotel_rooms(account.accountId));
    } catch (error) {
      console.log({ error });
    }
  };

  console.log(manageRooms); // TODO: delete

  useEffect(() => {
    getManageRooms();
  }, []);

  return (
    <>
      <h2>owner: {account.accountId}</h2>
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
                <td>GuestID</td>
                <td>
                  <button>CheckOut</button>
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
