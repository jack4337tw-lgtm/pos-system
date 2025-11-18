// AuthContext.js
import { createContext, useState, useContext } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // 登入方法
  const login = async (staff_code, password) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staff_code, password }),
   });

    if (!res.ok) {
      throw new Error("登入失敗");
    }

    const data = await res.json();
    setUser(data); // { staff_code, name, role, permissions }
    return true;
  };

  // 登出方法
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
