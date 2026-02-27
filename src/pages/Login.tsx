import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";

const Login = () => {
  const [login, setLogin] = useState<boolean>(true);
  const { setCash } = useContext(AuthContext);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = login
      ? `${API_URL}/api/auth/login`
      : `${API_URL}/api/auth/register`;

    const bodyData = login
      ? { userName, password }
      : { userName, email, password };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        if (login) {
          const data = await res.json();
          localStorage.setItem("token", data.token);
          localStorage.setItem("realName", data.userName);

          try {
            const userRes = await fetch(
              `${API_URL}/api/auth/users/${data.userName}`,
            );
            if (userRes.ok) {
              const userData = await userRes.json();
              localStorage.setItem("cash", userData.cash.toString());
              setCash(userData.cash);
            }
          } catch (e) {
            console.error("Lỗi lấy tiền");
          }

          alert("Đăng nhập thành công!");
          navigate("/");
        } else {
          alert("Đăng ký thành công! Vui lòng đăng nhập lại.");
          setLogin(true);
        }
      } else {
        const errorText = await res.text();
        alert(`Lỗi: ${errorText}`);
      }
    } catch (error) {
      alert("Lỗi kết nối đến Server. Vui lòng thử lại!");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="w-full max-w-md border border-black p-8 rounded-xl bg-white shadow-lg">
        <form onSubmit={handleSubmit}>
          <h1 className="text-center text-2xl font-bold pb-6">
            {login ? "Đăng nhập" : "Đăng ký"}
          </h1>

          <label htmlFor="username" className="font-bold text-sm"></label>
          <input
            id="username"
            type="text"
            required
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="border border-black p-2 rounded-lg w-full mb-3 placeholder:text-sm"
            placeholder="Tên đăng nhập"
          />

          {!login && (
            <>
              <label htmlFor="email" className="font-bold text-sm"></label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-black p-2 rounded-lg w-full mb-3 placeholder:text-sm"
                placeholder="Ví dụ: abc@gmail.com"
              />
            </>
          )}

          <label htmlFor="password" className="font-bold text-sm"></label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu"
            className="border border-black p-2 rounded-lg w-full mb-3 placeholder:text-sm"
          />

          <button type="submit" className="t_button w-full py-2 rounded">
            {login ? "Đăng nhập" : "Đăng ký"}
          </button>

          <div className="text-center mt-2 text-sm">
            {login ? (
              <>
                Nếu chưa có tài khoản,{" "}
                <button
                  type="button"
                  className="text-green-600 font-bold hover:underline"
                  onClick={() => setLogin(false)}
                >
                  Đăng ký ngay
                </button>
              </>
            ) : (
              <>
                Nếu đã có tài khoản,{" "}
                <button
                  type="button"
                  className="text-green-600 font-bold hover:underline"
                  onClick={() => setLogin(true)}
                >
                  Đăng nhập ngay
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
export default Login;
