import { BrowserRouter, Routes, Route } from "react-router-dom";
import Booked from "./assets/js/components/Booked";
import Home from "./assets/js/components/Home";
import RoomManagement from "./assets/js/components/RoomManagement";

const Routers = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/booked' element={<Booked />} />
        <Route path='/room-management' element={<RoomManagement />} />
      </Routes>
    </BrowserRouter>
  );
};
export default Routers;
