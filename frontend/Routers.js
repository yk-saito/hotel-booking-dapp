import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./assets/js/components/NavBar";
import Home from "./assets/js/components/Home";
import RoomManagement from "./assets/js/components/RoomManagement";

const Routers = () => {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/room-management/:address' element={<RoomManagement />} />
      </Routes>
    </BrowserRouter>
  );
};
export default Routers;
