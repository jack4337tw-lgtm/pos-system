import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const { login } = useAuth();
  const [staffCode, setStaffCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const success = await login(staffCode, password);
      console.log("login() 回傳:", success); // ✅ Debug log

      if (success) {
        alert("登入成功");
        navigate("/main");
      }
    } catch (err) {
      console.error("登入失敗原因:", err); // ✅ Debug log
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: "300px", margin: "auto", padding: "20px" }}>
      <h2>員工登入</h2>
      <input
        placeholder="員工編號"
        value={staffCode}
        onChange={(e) => setStaffCode(e.target.value)}
        style={{ display: "block", marginBottom: "10px", width: "100%" }}
      />
      <input
        type="password"
        placeholder="密碼"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: "10px", width: "100%" }}
      />
      <button onClick={handleLogin} style={{ width: "100%" }}>
        登入
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default LoginPage;
