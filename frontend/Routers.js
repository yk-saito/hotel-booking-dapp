import { BrowserRouter, Routes, Route } from "react-router-dom";
import Booked from "./assets/js/components/Booked";
import Home from "./assets/js/components/Home";

const Routers = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/booked' element={<Booked />} />
      </Routes>
    </BrowserRouter>
  );
};
export default Routers;
