import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./assets/js/components/NavBar";
import Home from "./assets/js/pages/Home";
import Search from "./assets/js/pages/Search";
import RoomList from "./assets/js/pages/RoomList";
import BookedList from "./assets/js/pages/BookedList";

const Routers = () => {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/search/:date' element={<Search />} />
        <Route path='/room-list/:address' element={<RoomList />} />
        <Route path='/booked-list/:address' element={<BookedList />} />
      </Routes>
    </BrowserRouter>
  );
};
export default Routers;
