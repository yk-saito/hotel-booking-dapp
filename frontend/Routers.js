import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./assets/js/components/NavBar";
import Home from "./assets/js/pages/Home";
import Search from "./assets/js/pages/Search";
import RoomManagement from "./assets/js/components/RoomManagement";

const Routers = () => {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/search/:date' element={<Search />} />
        <Route path='/room-management/:address' element={<RoomManagement />} />
      </Routes>
    </BrowserRouter>
  );
};
export default Routers;
