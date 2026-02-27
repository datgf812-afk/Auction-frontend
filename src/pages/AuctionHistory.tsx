import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { Link } from "react-router-dom";

const AuctionHistory = () => {
  const userName =
    localStorage.getItem("realName") || localStorage.getItem("userName");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const API_URL = import.meta.env.VITE_API_URL;
  const fetchHistory = async (silent = false) => {
    if (!userName) return;
    try {
      if (!silent) setLoading(true);
      const res = await fetch(`${API_URL}/api/history/${userName}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Lỗi lấy lịch sử:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const intervalId = setInterval(() => fetchHistory(true), 5000);
    return () => clearInterval(intervalId);
  }, [userName]);

  if (loading) return <MainLayout>Đang tải lịch sử...</MainLayout>;

  return (
    <MainLayout>
      <div className="flex m-2">
        <Link to="/" className="t_button rounded">
          Quay lại trang chủ
        </Link>
      </div>
      <div className="p-4 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Lịch sử đấu giá thành công</h2>
        {history.length === 0 ? (
          <p>Bạn chưa thắng phiên đấu giá nào.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-6">
            {history.map((item) => (
              <div
                key={item.id}
                className="shadow rounded bg-gray-100 p-4 flex flex-col gap-4 bg-white"
              >
                <div className="flex-1 w-full">
                  <img
                    src={item.imageUrl}
                    alt={item.itemName}
                    className="w-full h-[200px] object-cover border border-black"
                  />
                  <p className="font-bold text-lg leading-tight mb-1">
                    {item.itemName}
                  </p>
                  <p className="text-red-500 font-bold text-sm">
                    Giá chốt: {item.winPrice.toLocaleString("vi-VN")} VNĐ
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.winTime).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AuctionHistory;
