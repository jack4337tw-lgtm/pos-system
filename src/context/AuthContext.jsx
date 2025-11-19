import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // 讀取 .env 的 API_URL
  const API_URL = import.meta.env.VITE_API_URL;
  console.log("API_URL:", API_URL); // ✅ Debug log，確認是否為 undefined

  const login = async (staff_code, password) => {
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staff_code, password }),
      });

      if (!res.ok) throw new Error("登入失敗 (HTTP 狀態錯誤)");

      const data = await res.json();
      console.log("收到的 data:", data); // ✅ Debug log

      if (data.error) throw new Error(data.error);

      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));

      return true; // ✅ 確保回傳成功
    } catch (err) {
      console.error("Login error:", err.message);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
