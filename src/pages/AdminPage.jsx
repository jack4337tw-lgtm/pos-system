import { useNavigate } from 'react-router-dom';
import ROLES from '../constants/roles';
import { useAuth } from '../context/AuthContext'; // ✅ 引入 AuthContext

function AdminPage() {
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ 從 Context 取得登入者資訊

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h2>後台管理</h2>
        <p>
          登錄者：{user?.staff_code} / 角色：{ROLES[user?.role]}
        </p>
      </header>

      <section className="admin-buttons">
        <h3>後台功能</h3>
        <button onClick={() => navigate('/product-manage')}>
          商品管理
        </button>
        <button onClick={() => navigate('/reports')}>
          報表中心
        </button> {/* 功能編號: F103 */}
        <button onClick={() => navigate('/permission')}>
          員工管理及權限設定
        </button> {/* 功能編號: F104 */}
      </section>

      <footer className="admin-footer">
        <button onClick={() => navigate('/main')}>返回 POS 主畫面</button>
      </footer>
    </div>
  );
}

export default AdminPage;
