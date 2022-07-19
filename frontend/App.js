import "regenerator-runtime/runtime";
import React, { useEffect, useCallback, useState } from "react";
import { Button, Container, Nav } from "react-bootstrap";
import Wallet from "./assets/js/components/Wallet";
import Rooms from "./assets/js/components/hotelbooking/Rooms";
// import "./assets/css/global.css";

import {
  login,
  logout,
  accountBalance,
  get_rooms,
} from "./assets/js/near/utils";

const App = function useAppWrapper() {
  const [rooms, setRooms] = useState([]);

  const account = window.walletConnection.account();
  const [balance, setBalance] = useState("0");

  const getBalance = useCallback(async () => {
    if (account.accountId) {
      setBalance(await accountBalance());
    }
  });

  useEffect(
    () => {
      getBalance();
    },

    // The second argument to useEffect tells React when to re-run the effect
    // Use an empty array to specify "only run on first render"
    // This works because signing into NEAR Wallet reloads the page
    [getBalance]
  );

  /* Not connected to Wallet */
  if (!window.walletConnection.isSignedIn()) {
    return (
      <div
        className='d-flex justify-content-center flex-column text-center '
        style={{ background: "#000", minHeight: "100vh" }}
      >
        <div className='mt-auto text-light mb-5'>
          <h1>UNCHAIN HOTEL BOOKING</h1>
          <p>Please connect your wallet to continue.</p>
          <Button
            onClick={login}
            variant='outline-light'
            className='rounded-pill px-3 mt-3'
          >
            Connect Wallet
          </Button>
        </div>
        <p className='mt-auto text-secondary'>Powered by NEAR</p>
      </div>
    );
  }

  /* When connected to Wallet */
  // rooms.forEach((room) => console.log(room));
  return (
    <>
      <Container fuild='md'>
        <Nav className='justify-contract-end pt-3 pb-5'>
          <Nav.Item>
            <Wallet
              address={account.accountId}
              amount={balance}
              symbol='NEAR'
              destroy={logout}
            />
          </Nav.Item>
        </Nav>
        <main>
          <Rooms />
        </main>
      </Container>
    </>
  );
};

export default App;
