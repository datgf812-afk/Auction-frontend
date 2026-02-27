import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../AuthContext";

const AuctionCard: React.FC<any> = ({ item, text }) => {
  const { calc } = useContext(AuthContext);
  const [timeLeft, setTimeLeft] = useState(() =>
    calc(item.startTime, item.endTime, item.state),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const cur = calc(item.startTime, item.endTime, item.state);
      setTimeLeft(cur);
    }, 1000);
    return () => clearInterval(timer);
  }, [item, calc]);

  return (
    <div className="flex flex-col items-center rounded bg-gray-100 shadow-md p-3 -xl bg-white">
      <img
        src={item.imageUrl}
        alt=""
        className="w-full h-[200px] object-cover border-black border"
      />
      <h3 className="text-lg font-bold mt-2">{item.name}</h3>
      <div className="flex w-full justify-between items-center mt-2">
        <div className="flex flex-col gap-1">
          <p className="text-xs">Giá hiện tại:</p>
          <p className="font-bold px-2">
            {item.currentPrice.toLocaleString("vi-VN")} VNĐ
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs">
            {text === "Đấu giá ngay"
              ? "Còn lại:"
              : text === "Sắp bắt đầu"
                ? "Bắt đầu sau:"
                : ""}
          </p>
          <p className="font-bold text-md text-red-500">{timeLeft}</p>
        </div>
      </div>
      <Link
        to={`/auction/${item.id}`}
        className="hover:bg-black hover:text-white rounded bg-white text-center w-full mt-2 px-2 py-1  border border-black transition-all"
      >
        {text}
      </Link>
    </div>
  );
};
export default AuctionCard;
