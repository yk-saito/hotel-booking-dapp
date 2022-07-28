import "regenerator-runtime/runtime";
import React from "react";

import FormDate from "../components/FormDate";

const Home = function useAppWrapper() {
  return (
    <div className='text-center' style={{ margin: "200px" }}>
      <h1>Welcome.</h1>
      <h1>Select your stay dates and find a hotel!</h1>
      <FormDate />
    </div>
  );
};

export default Home;
