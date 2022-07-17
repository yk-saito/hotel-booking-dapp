import "regenerator-runtime/runtime";
import React from "react";

import "./assets/css/global.css";

import { login, logout, get_rooms } from "./assets/js/near/utils";

export default function App() {
  const [rooms, setRooms] = React.useState([]);

  const fetchRooms = React.useCallback(async () => {
    if (window.walletConnection.isSignedIn) {
      setRooms(await get_rooms());
    }
  });

  React.useEffect(
    () => {
      fetchRooms();
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
  return <button onClick={logout}>Sign out</button>;
}
