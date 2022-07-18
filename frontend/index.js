import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { initContract } from "./assets/js/near/utils";

import "bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";

const container = document.querySelector("#root");
const root = createRoot(container);

window.nearInitPromise = initContract()
  .then(() => {
    <App />;
    root.render(<App tab='home' />);
  })
  .catch(console.error);
