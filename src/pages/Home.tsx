import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import AuctionCard from "../components/auction/AuctionCad";
import MainLayout from "../components/layout/MainLayout";

function Home() {
  const [now, setNow] = useState(Date.now());
  const [dataItem, setDataItem] = useState<any[]>([]);
  const keyword = new URLSearchParams(useLocation().search).get("search") || "";

  const activeRef = useRef<HTMLDivElement>(null);
  const upRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const [showArrow, setShowArrow] = useState<any>({
    active: { L: false, R: true },
    up: { L: false, R: true },
    end: { L: false, R: true },
  });
  const API_URL = import.meta.env.VITE_API_URL;
  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auctions`);
      if (res.ok) setDataItem(await res.json());
    } catch (e) {}
  };

  useEffect(() => {
    fetchItems();
    const id = setInterval(fetchItems, 5000);
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(id);
      clearInterval(t);
    };
  }, []);

  const handleScroll = (ref: any, key: string) => {
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    setShowArrow((p: any) => ({
      ...p,
      [key]: {
        L: scrollLeft > 10,
        R: scrollLeft + clientWidth < scrollWidth - 10,
      },
    }));
  };

  const scroll = (ref: any, dir: "L" | "R") =>
    ref.current.scrollBy({
      left: dir === "L" ? -ref.current.clientWidth : ref.current.clientWidth,
      behavior: "smooth",
    });

  const filtered = dataItem.filter((i) =>
    i.name.toLowerCase().includes(keyword.toLowerCase()),
  );
  const active = filtered.filter(
    (i) =>
      now > new Date(i.startTime).getTime() &&
      now < new Date(i.endTime).getTime() &&
      i.state !== "end",
  );
  const upcoming = filtered.filter(
    (i) => now < new Date(i.startTime).getTime() && i.state !== "end",
  );
  const ended = filtered.filter(
    (i) => i.state === "end" || now > new Date(i.endTime).getTime(),
  );

  return (
    <MainLayout>
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
      {[
        {
          title: "Đang diễn ra",
          items: active,
          ref: activeRef,
          key: "active",
          btn: "Đấu giá ngay",
        },
        {
          title: "Sắp diễn ra",
          items: upcoming,
          ref: upRef,
          key: "up",
          btn: "Sắp bắt đầu",
        },
        {
          title: "Đã kết thúc",
          items: ended,
          ref: endRef,
          key: "end",
          btn: "Đã kết thúc",
        },
      ].map((sec) => (
        <div key={sec.key} className="w-3/4 mx-auto relative mt-8">
          <div id={sec.key} className="text-xl font-bold p-1 px-4 bg-white">
            {sec.title}
          </div>
          <div className="relative mt-4">
            {sec.items.length > 3 && (
              <>
                {showArrow[sec.key].L && (
                  <button
                    onClick={() => scroll(sec.ref, "L")}
                    className="absolute z-0 top-1/2 -translate-y-1/2 -left-12 bg-black text-white w-10 h-10 font-bold shadow-lg"
                  >
                    {"<"}
                  </button>
                )}
                {showArrow[sec.key].R && (
                  <button
                    onClick={() => scroll(sec.ref, "R")}
                    className="absolute z-0 top-1/2 -translate-y-1/2 -right-12 bg-black text-white w-10 h-10 font-bold shadow-lg"
                  >
                    {">"}
                  </button>
                )}
              </>
            )}
            <div
              ref={sec.ref}
              onScroll={() => handleScroll(sec.ref, sec.key)}
              className="flex overflow-x-auto gap-4 snap-x pb-4 no-scrollbar"
              style={{ scrollbarWidth: "none" }}
            >
              {sec.items.length > 0 ? (
                sec.items.map((i) => (
                  <div
                    key={i.id}
                    className="w-full md:w-[calc(33.333%-0.7rem)] shrink-0 snap-start"
                  >
                    <AuctionCard item={i} text={sec.btn} />
                  </div>
                ))
              ) : (
                <p className="px-4 text-gray-500 mx-auto">Không có vật phẩm</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </MainLayout>
  );
}
export default Home;
