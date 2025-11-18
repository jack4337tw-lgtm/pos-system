import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ROLES, { ROLE_OPTIONS } from '../constants/roles';
import { useAuth } from '../context/AuthContext';

function PermissionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('STAFF');
  const [newPassword, setNewPassword] = useState('');

  const [editingStaff, setEditingStaff] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('STAFF');
  const [editPassword, setEditPassword] = useState('');

  const canManageStaff = user?.role === 'ADMIN' || user?.role === 'BOSS';

  // 讀取員工資料
  useEffect(() => {
    fetch('http://localhost:3000/api/staff')
      .then(res => res.json())
      .then(data => setStaffList(data))
      .catch(err => alert(err.message));
  }, []);

  // 新增員工
  const handleSaveNewStaff = () => {
    fetch('http://localhost:3000/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, role: newRole, password: newPassword }),
    })
      .then(res => res.json())
      .then(created => {
        setStaffList(prev => [...prev, created]);
        setNewName('');
        setNewRole('STAFF');
        setNewPassword('');
        setShowForm(false);
      })
      .catch(err => alert(err.message));
  };

  // 開始編輯員工
  const startEdit = (staff) => {
    setEditingStaff(staff);
    setEditName(staff.name);
    setEditRole(staff.role);
    setEditPassword('');
  };

  // 儲存編輯員工
  const handleSaveEditStaff = () => {
    fetch(`http://localhost:3000/api/staff/${editingStaff.staff_code}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, role: editRole, password: editPassword }),
    })
      .then(res => res.json())
      .then(updated => {
        setStaffList(prev =>
          prev.map(s => (s.staff_code === updated.staff_code ? updated : s))
        );
        setEditingStaff(null);
        setEditPassword('');
      })
      .catch(err => alert(err.message));
  };

  // 刪除員工
  const handleDeleteStaff = (staff_code) => {
    fetch(`http://localhost:3000/api/staff/${staff_code}`, {
      method: 'DELETE',
    })
      .then(() => {
        setStaffList(prev => prev.filter(s => s.staff_code !== staff_code));
      })
      .catch(err => alert(err.message));
  };

  return (
    <div style={{ padding: '1em' }}>
      {/* 抬頭列 */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>
          5891POS（登入者：{user?.staff_code} / 角色：{user?.role}）
        </h2>
        <button onClick={() => navigate('/admin')}>上一頁</button>
      </div>

      {/* 員工列表 */}
      <h3 style={{ marginTop: '1em' }}>員工列表</h3>
      {staffList.map(staff => (
        <div key={staff.staff_code} style={{ display: 'flex', gap: '1em', borderBottom: '1px solid #ccc', padding: '0.5em' }}>
          <div>員工編號：{staff.staff_code}</div>
          <div>姓名：{staff.name}</div>
          <div>角色：{ROLE_OPTIONS.find(r => r.code === staff.role)?.label || staff.role}</div>
          {canManageStaff && (
            <>
              <button onClick={() => startEdit(staff)}>編輯</button>
              <button onClick={() => handleDeleteStaff(staff.staff_code)}>刪除</button>
            </>
          )}
        </div>
      ))}

      {/* 新增員工浮窗 */}
      {showForm && canManageStaff && (
        <div style={{ marginTop: '1em', border: '1px solid #999', padding: '1em' }}>
          <div>員工編號：由後端自動分配</div>
          <div>
            姓名：<input value={newName} onChange={e => setNewName(e.target.value)} />
          </div>
          <div>
            角色：
            <select value={newRole} onChange={e => setNewRole(e.target.value)}>
              {ROLE_OPTIONS.map(r => (
                <option key={r.code} value={r.code}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            密碼：<input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>
          <button onClick={handleSaveNewStaff}>儲存</button>
          <button onClick={() => setShowForm(false)}>取消</button>
        </div>
      )}

      {/* 編輯員工浮窗 */}
      {editingStaff && canManageStaff && (
        <div style={{ marginTop: '1em', border: '1px solid #999', padding: '1em' }}>
          <div>員工編號：{editingStaff.staff_code}</div>
          <div>
            姓名：<input value={editName} onChange={e => setEditName(e.target.value)} />
          </div>
          <div>
            角色：
            <select value={editRole} onChange={e => setEditRole(e.target.value)}>
              {ROLE_OPTIONS.map(r => (
                <option key={r.code} value={r.code}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            新密碼：<input type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} />
          </div>
          <button onClick={handleSaveEditStaff}>儲存修改</button>
          <button onClick={() => setEditingStaff(null)}>取消</button>
        </div>
      )}

      {/* 新增員工按鈕 */}
      {canManageStaff && !showForm && (
        <button style={{ marginTop: '1em' }} onClick={() => setShowForm(true)}>新增員工</button>
      )}
    </div>
  );
}

export default PermissionPage;
