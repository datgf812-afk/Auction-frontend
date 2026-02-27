import { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";

const Header: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const realName = localStorage.getItem("realName");
  const { cash } = useContext(AuthContext);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("realName");
    localStorage.removeItem("cash");
    setDropdownOpen(false);
    navigate("/");
    window.location.reload();
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      navigate(`/search?keyword=${searchKeyword}`);
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-white">
      <div className="container md:text-base flex flex-wrap gap-2 justify-around md:justify-between items-center shadow mx-auto p-2 text-xs whitespace-nowrap md:text-base">
        <Link
          className="bg-black text-white px-2 py-1 font-bold rounded-full md:w-auto "
          to={"/"}
        >
          Demo Auction
        </Link>
        <input
          type="text"
          placeholder="Tìm kiếm vật phẩm..."
          className="border border-black order-last md:order-none w-full md:w-1/3 md:mr-auto px-3 py-1 focus:outline-none focus:ring-2 focus:ring-black focus:border-none rounded"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyDown={handleSearch}
        />
        <div className="relative" ref={dropdownRef}>
          <button
            className="p-1 cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span>Số dư: </span>
            <span className="font-bold bg-green-500 p-1 rounded text-white hover:bg-gray-200 hover:text-black">
              {cash?.toLocaleString("vi-VN") || 0} VNĐ
            </span>
          </button>

          {dropdownOpen && (
            <div className="absolute w-64 gap-2 right-0 p-2 flex flex-col bg-white rounded border border-black text-black mt-2 shadow-lg">
              <p>Xin chào, {token && realName ? realName : "user demo"}</p>
              <Link
                onClick={() => setDropdownOpen(false)}
                className="t_button text-center"
                to={"/history"}
              >
                Lịch sử đấu giá thắng
              </Link>
              {token ? (
                <>
                  <button
                    className="t_button hover:bg-red-500 hover:text-white border-red-500"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link
                    className="t_button text-center"
                    to={"/login"}
                    onClick={() => setDropdownOpen(false)}
                  >
                    Đăng nhập / Đăng ký
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
