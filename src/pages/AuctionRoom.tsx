import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { AuthContext } from "../components/AuthContext";

const AuctionRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { cash, setCash } = useContext(AuthContext);
  const myName =
    localStorage.getItem("realName") || localStorage.getItem("userName") || "";

  const [item, setItem] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [bidAmount, setBidAmount] = useState(0);
  const [historyPrice, setHistoryPrice] = useState<any[]>([]);
  const { calc } = useContext(AuthContext);
  const API_URL = import.meta.env.VITE_API_URL;
  const syncCash = () => {
    setTimeout(async () => {
      const res = await fetch(`${API_URL}/api/auth/users/${myName}`);
      if (res.ok) {
        const data = await res.json();
        setCash(data.cash);
        localStorage.setItem("cash", data.cash.toString());
      }
    }, 500);
  };

  const handleAuction = async (add: number) => {
    if (!myName || isNaN(add) || add < 50000) return;
    if (cash < currentPrice + add) return alert("Số dư không đủ!");
    try {
      const res = await fetch(`${API_URL}/api/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auctionItemId: Number(id),
          amount: currentPrice + add,
          bidderName: myName,
        }),
      });
      if (res.ok) syncCash();
    } catch (e) {
      console.error("Lỗi kết nối hoặc server:", e);
    }
  };

  useEffect(() => {
    if (!id || id === "undefined" || id === "null") return;

    const init = async () => {
      setLoading(true);
      try {
        const [resItem, resBid] = await Promise.all([
          fetch(`${API_URL}/api/auctions/${id}`),
          fetch(`${API_URL}/api/bids/${id}`),
        ]);

        if (resItem.ok) {
          const d = await resItem.json();
          setItem(d);
          setCurrentPrice(d.currentPrice);
          setTimeLeft(calc(d.startTime, d.endTime, d.state));

          if (resBid.ok) {
            const bidData = await resBid.json();
            setHistoryPrice(
              bidData.map((b: any) => ({
                ...b,
                timestamp: new Date(b.timestamp),
              })),
            );
          } else {
            setHistoryPrice([]);
          }
        } else {
          console.error("Lỗi tải thông tin vật phẩm:", resItem.status);
        }
      } catch (error) {
        console.error("Lỗi kết nối mạng hoặc server:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id]);

  useEffect(() => {
    const stomp = new Client({
      webSocketFactory: () => SockJS(`${API_URL}/ws`),
      onConnect: () => {
        stomp.subscribe(`/topic/bids/${id}`, (msg) => {
          const b = JSON.parse(msg.body);
          setCurrentPrice(b.amount);
          setHistoryPrice((prev) => [
            { ...b, timestamp: new Date(b.timestamp) },
            ...prev,
          ]);
          if (b.bidderName !== myName) syncCash();
        });
      },
    });
    stomp.activate();
    return () => {
      stomp.deactivate();
    };
  }, [id, myName]);

  useEffect(() => {
    if (!item || loading) return;
    const timer = setInterval(
      () => setTimeLeft(calc(item.startTime, item.endTime, item.state)),
      1000,
    );
    return () => clearInterval(timer);
  }, [item, loading]);

  if (loading || !item) return <MainLayout>Đang tải...</MainLayout>;

  return (
    <MainLayout>
      <div className="flex m-2">
        <Link to="/" className="t_button rounded">
          Quay lại
        </Link>
      </div>
      <div className="flex justify-around mb-4 flex-wrap gap-2 md:text-base items-start">
        <div className="flex flex-col rounded md:w-[48%] md:h-[430px] bg-gray-100 p-2 bg-white items-center gap-1 shadow w-full order-last md:order-none">
          <img
            src={item.imageUrl}
            className="border border-black object-cover w-[400px] h-[370px]"
            alt=""
          />
          <p className="text-xl md:text-2xl font-bold mt-1">{item.name}</p>
        </div>
        <div className="flex flex-col bg-gray-100 p-3 bg-white w-full md:w-[48%] md:h-[430px] shadow">
          <p className="text-center mb-1">
            {timeLeft !== "Đã hết giờ" &&
              timeLeft !== "Chưa bắt đầu" &&
              "Thời gian còn lại:"}
            <span className="font-bold text-red-500 text-xl md:text-2xl px-4">
              {timeLeft}
            </span>
          </p>
          <p className="font-bold">Giá hiện tại:</p>
          <p className="font-bold text-xl text-red-500 md:text-2xl text-center py-2">
            {currentPrice.toLocaleString("vi-VN")} VNĐ
          </p>
          {timeLeft !== "Đã hết giờ" && timeLeft !== "Chưa bắt đầu" ? (
            <div className="flex flex-col gap-2">
              <input
                type="number"
                className="rounded bg-white border border-black focus:border-none py-1 px-2 w-full placeholder:text-sm"
                value={bidAmount || ""}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                placeholder="Số tiền thêm..."
              />
              <div className="flex justify-between gap-2">
                <button
                  className="t_button flex-1 rounded"
                  onClick={() => handleAuction(50000)}
                >
                  Đấu giá nhanh +50k
                </button>
                <button
                  className="t_button flex-1 bg-black text-white rounded"
                  onClick={() => {
                    handleAuction(bidAmount);
                    setBidAmount(0);
                  }}
                >
                  Đấu giá
                </button>
              </div>
            </div>
          ) : (
            <div className="py-3 text-center font-bold">
              {timeLeft === "Đã hết giờ" ? (
                historyPrice[0]?.bidderName != null ? (
                  <p>
                    Người thắng:{" "}
                    <span className="text-xl md:text-2xl">
                      {historyPrice[0]?.bidderName}
                    </span>
                  </p>
                ) : (
                  "Không có người đấu giá"
                )
              ) : (
                "Chờ bắt đầu"
              )}
            </div>
          )}
          {historyPrice[0]?.bidderName != null ? (
            <>
              <p className="font-bold mt-2 text-sm md:text-base mb-2">
                Lịch sử giá (Top 3):
              </p>
              <div className="flex-1 p-1">
                {historyPrice.slice(0, 3).map((b, i) => (
                  <div key={i} className="mb-2">
                    <p className="text-sm">
                      Thời gian: {b.timestamp.toLocaleTimeString()}
                    </p>
                    <p>
                      Người đấu giá:{" "}
                      <span className="font-bold">{b.bidderName} -</span>
                      <span> Số tiền: {b.amount?.toLocaleString()} VNĐ</span>
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            timeLeft !== "Đã hết giờ" && (
              <p className="text-center py-2">Chưa có lịch sử đấu giá</p>
            )
          )}
        </div>
      </div>
      <p className="text-justify leading-relaxed break-words">
        {item.description}
      </p>
    </MainLayout>
  );
};
export default AuctionRoom;
