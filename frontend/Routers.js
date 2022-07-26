import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./assets/js/components/Home";
import RoomManagement from "./assets/js/components/RoomManagement";

const Routers = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/room-management/:address' element={<RoomManagement />} />
      </Routes>
    </BrowserRouter>
  );
};
export default Routers;
