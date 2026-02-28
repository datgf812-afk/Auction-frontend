import { createContext, useEffect, useState, type ReactNode } from "react";

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [cash, setCash] = useState<any>(localStorage.getItem("cash") || 0);
  const API_URL = import.meta.env.VITE_API_URL;

  const calc = (s: any, e: any, state: string) => {
    const now = Date.now(),
      start = new Date(s).getTime(),
      end = new Date(e).getTime();

    if (state === "end" || now >= end) return "Đã hết giờ";
    else if (state === "upcoming" || now < start) {
      return "Chưa bắt đầu";
    } else {
      const target = state === null && now < start ? start : end;
      const dist = target - now;
      const min = ("0" + Math.floor((dist / 60000) % 60)).slice(-2);
      const sec = ("0" + Math.floor((dist / 1000) % 60)).slice(-2);
      return `${min}:${sec}`;
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const user =
        localStorage.getItem("realName") || localStorage.getItem("userName");

      if (!user) {
        const guestName = `User_${Math.floor(Math.random() * 10000)}`;
        localStorage.setItem("userName", guestName);
        localStorage.setItem("realName", guestName);

        fetch(`${API_URL}/api/auth/users/${guestName}`)
          .then(() =>
            fetch(`${API_URL}/api/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userName: guestName,
                password: "demo123",
              }),
            }),
          )
          .then(async (res) => {
            if (!res.ok) throw new Error(await res.text());
            return res.json();
          })
          .then((data) => {
            if (data.token) {
              localStorage.setItem("token", data.token);
            }
          })
          .catch((err) => console.error(err));
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/auth/users/${user}`);
        if (res.ok) {
          const d = await res.json();
          setCash(d.cash);
          localStorage.setItem("cash", d.cash.toString());
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
    const id = setInterval(fetchUser, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <AuthContext.Provider value={{ cash, setCash, calc }}>
      {children}
    </AuthContext.Provider>
  );
};
