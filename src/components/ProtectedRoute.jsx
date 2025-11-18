import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  // 沒登入 → 導向登入頁
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 有指定角色限制 → 檢查 user.role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // 登入了但角色不在允許清單 → 導向首頁或顯示權限不足頁
    return <Navigate to="/" replace />;
  }

  // ✅ 已登入且角色符合 → 顯示原本的頁面
  return children;
}
