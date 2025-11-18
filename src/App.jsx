import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; 
import ProtectedRoute from './components/ProtectedRoute'; 
import LoginPage from './pages/LoginPage';
import POSPage from './pages/POSPage';
import AdminPage from './pages/AdminPage';
import PermissionPage from './pages/PermissionPage';
import ProductManagePage from './pages/ProductManagePage';
import ReportsPage from './pages/ReportsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 預設首頁 → 自動導向登入頁 */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* 登入頁 */}
          <Route path="/login" element={<LoginPage />} />

          {/* POSPage → 只要登入就能進 */}
          <Route
            path="/main"
            element={
              <ProtectedRoute>
                <POSPage />
              </ProtectedRoute>
            }
          />

          {/* AdminPage → 只要登入就能進 */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* PermissionPage → 只有 BOSS、系統管理員、店長能進 */}
          <Route
            path="/permission"
            element={
              <ProtectedRoute allowedRoles={["BOSS", "系統管理員", "店長"]}>
                <PermissionPage />
              </ProtectedRoute>
            }
          />

          {/* ProductManagePage → 只要登入就能進 */}
          <Route
            path="/product-manage"
            element={
              <ProtectedRoute>
                <ProductManagePage />
              </ProtectedRoute>
            }
          />

          {/* ReportsPage → 只要登入就能進 */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />

          {/* 捕捉所有未知路徑 → 導向登入頁 */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
