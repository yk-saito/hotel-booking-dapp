import "regenerator-runtime/runtime";
import React, { useEffect, useCallback, useState } from "react";
import { Container, Nav } from "react-bootstrap";

// import "./assets/css/global.css";

import {
  login,
  logout,
  accountBalance,
  get_rooms,
} from "./assets/js/near/utils";

// export default function App() {
const App = function useAppWrapper() {
  const [rooms, setRooms] = React.useState([]);

  const account = window.walletConnection.account();
  const [balance, setBalance] = useState("0");

  const fetchRooms = React.useCallback(async () => {
    if (window.walletConnection.isSignedIn) {
      setRooms(await get_rooms());
    }
  });

  const getBalance = useCallback(async () => {
    if (account.accountId) {
      setBalance(await accountBalance());
    }
  });

  useEffect(
    () => {
      fetchRooms();
      getBalance();
    },

    // The second argument to useEffect tells React when to re-run the effect
    // Use an empty array to specify "only run on first render"
    // This works because signing into NEAR Wallet reloads the page
    []
  );

  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    return <button onClick={login}>Sign in</button>;
  }

  rooms.forEach((room) => console.log(room));
  console.log("account: ", account.accountId);
  console.log("balance: ", balance);
  return <button onClick={logout}>Sign out</button>;
};

export default App;
