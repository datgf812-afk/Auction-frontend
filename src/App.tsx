import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AuctionRoom from "./pages/AuctionRoom";
import Login from "./pages/Login";
import AuctionHistory from "./pages/AuctionHistory";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Đường dẫn mặc định (/) sẽ vào trang Home */}
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<AuctionHistory />} />
        {/* Đường dẫn /auction/:id sẽ vào phòng đấu giá tương ứng */}
        <Route path="/auction/:id" element={<AuctionRoom />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
