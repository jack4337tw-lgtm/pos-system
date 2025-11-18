import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const { login } = useAuth();
  const [staffCode, setStaffCode] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const success = await login(staffCode, password);
      if (success) {
        alert("登入成功");
        navigate("/main"); // 登入後導向 PermissionPage
      }
    } catch (err) {
      alert("登入失敗");
    }
  };

  return (
    <div>
      <h2>員工登入</h2>
      <input
        placeholder="員工編號"
        value={staffCode}
        onChange={(e) => setStaffCode(e.target.value)}
      />
      <input
        type="password"
        placeholder="密碼"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>登入</button>
    </div>
  );
}

export default LoginPage;
