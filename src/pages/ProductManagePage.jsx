import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ✅ 引入 AuthContext
import ProductIngredientsManager from "../components/ProductIngredientsManager";

function ProductManagePage() {
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ 從 Context 取得登入者資訊
  const [products, setProducts] = useState([]);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [groupA, setGroupA] = useState('');
  const [groupB, setGroupB] = useState('');
  const [groupC, setGroupC] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const CATEGORIES = ['便當', '單點', '附加'];

  const fetchProducts = () => {
    fetch('http://localhost:3000/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 新增商品
  const handleAddProduct = () => {
    if (!newName || !newCategory || !newPrice) {
      alert('請填寫完整欄位');
      return;
    }
    const categoryCount = products.filter(p => p.category === newCategory).length;

    const newProduct = {
      name: newName,
      category: newCategory,
      price: parseFloat(newPrice),
      groupA_code: groupA || null,
      groupB_code: groupB || null,
      groupC_code: groupC || null,
      sortOrder: categoryCount + 1,
    };

    fetch('http://localhost:3000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    })
      .then(res => res.json())
      .then(data => {
        setProducts(prev => [...prev, { ...newProduct, product_id: data.product_id }]);
        setNewName('');
        setNewCategory('');
        setNewPrice('');
        setGroupA('');
        setGroupB('');
        setGroupC('');
      })
      .catch(err => console.error('❌ 新增商品失敗:', err));
  };

  // 刪除商品
  const handleDeleteProduct = (product_id) => {
    const confirmed = window.confirm('你確定要刪除這個商品嗎？');
    if (!confirmed) return;

    fetch(`http://localhost:3000/api/products/${product_id}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (!res.ok) throw new Error('刪除失敗');
        setProducts((prev) => prev.filter((item) => item.product_id !== product_id));
      })
      .catch((err) => {
        alert('刪除時發生錯誤：' + err.message);
        console.error('刪除錯誤詳細：', err);
      });
  };

  // 開始編輯
  const startEdit = (product) => {
    setEditingId(product.product_id);
    setEditData({ ...product });
  };

  // 儲存編輯
  const handleSaveEdit = (product_id) => {
    const currentItem = products.find((item) => item.product_id === product_id);
    const categoryItems = products
      .filter((item) => item.category === currentItem.category)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const currentIndex = categoryItems.findIndex((item) => item.product_id === product_id);
    const updatedSortOrder = currentIndex + 1;

    const updatedData = {
      ...editData,
      sortOrder: updatedSortOrder,
    };

    fetch(`http://localhost:3000/api/products/${product_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    })
      .then((res) => res.json())
      .then((updated) => {
        const finalData = updated.name ? updated : updatedData;
        setProducts((prev) =>
          prev.map((item) => (item.product_id === product_id ? finalData : item))
        );
        setEditingId(null);
        setEditData({});
      })
      .catch((err) => {
        alert('儲存失敗：' + err.message);
        console.error('儲存錯誤詳細：', err);
      });
  };

  // 排序交換
  const swapSortOrder = async (indexA, indexB, category) => {
    const categoryItems = products.filter((p) => p.category === category);
    const otherItems = products.filter((p) => p.category !== category);

    const updatedCategory = [...categoryItems];
    const temp = updatedCategory[indexA];
    updatedCategory[indexA] = updatedCategory[indexB];
    updatedCategory[indexB] = temp;

    const reOrderedCategory = updatedCategory.map((item, idx) => ({
      ...item,
      sortOrder: idx + 1,
    }));

    const reOrdered = [...otherItems, ...reOrderedCategory];

    try {
      await Promise.all(
        reOrderedCategory.map((item) =>
          fetch(`http://localhost:3000/api/products/${item.product_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          })
        )
      );

      setProducts(reOrdered);

      if (editingId) {
        const editingIndex = reOrderedCategory.findIndex((item) => item.product_id === editingId);
        if (editingIndex !== -1) {
          setEditData((prev) => ({
            ...prev,
            sortOrder: reOrderedCategory[editingIndex].sortOrder,
          }));
        }
      }
    } catch (err) {
      alert('分類排序儲存失敗：' + err.message);
      console.error('分類排序錯誤詳細：', err);
    }
  };

  return (
    <div style={{ padding: '2em' }}>
      <h2>商品管理</h2>
      <p>登入者：{user?.account}（{user?.role}）</p>
      <button onClick={() => navigate('/admin')}>上一頁</button>

      {/* 新增商品區 */}
      <div style={{ marginTop: '2em' }}>
        <h3>新增商品</h3>
        <input type="text" placeholder="商品名稱" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
          <option value="">請選擇分類</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <input type="number" placeholder="價格" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
        <input type="number" placeholder="A編號" value={groupA} onChange={(e) => setGroupA(e.target.value)} />
        <input type="number" placeholder="B編號" value={groupB} onChange={(e) => setGroupB(e.target.value)} />
        <input type="number" placeholder="C編號" value={groupC} onChange={(e) => setGroupC(e.target.value)} />
        <button onClick={handleAddProduct}>儲存</button>
      </div>

      {/* 商品列表區 */}
      <div style={{ marginTop: '2em' }}>
        <h3>商品列表（編輯時可上下排序）</h3>
        <div style={{ display: 'flex', gap: '2em', alignItems: 'flex-start' }}>
          {CATEGORIES.map((category) => (
            <div key={category} style={{ flex: 1 }}>
              <h4>{category}</h4>
              <ul style={{ padding: 0, listStyle: 'none', margin: 0 }}>
                {[...products]
                  .filter((p) => p.category === category)
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((p, index, arr) => (
                    <li
                      key={`${p.product_id}-${p.sortOrder}`}
                      style={{
                        padding: '0.5em',
                        borderBottom: '1px solid #ccc',
                        maxWidth: '100%',
                        overflowX: 'auto',
                        display: 'block',
                      }}
                    >
                      {editingId === p.product_id ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5em' }}>
                          <input
                            style={{ width: '120px', flexShrink: 1 }}
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          />
                          <input
                            style={{ width: '80px', flexShrink: 1 }}
                            type="number"
                            value={editData.price}
                            onChange={(e) => setEditData({ ...editData, price: parseInt(e.target.value) || 0 })}
                          />
                          <input
                            style={{ width: '60px', flexShrink: 1 }}
                            type="number"
                            placeholder="A"
                            value={editData.groupA_code ?? ''}
                            onChange={(e) => setEditData({ ...editData, groupA_code: parseInt(e.target.value) || null })}
                          />
                          <input
                            style={{ width: '60px', flexShrink: 1 }}
                            type="number"
                            placeholder="B"
                            value={editData.groupB_code ?? ''}
                            onChange={(e) => setEditData({ ...editData, groupB_code: parseInt(e.target.value) || null })}
                          />
                          <input
                            style={{ width: '60px', flexShrink: 1 }}
                            type="number"
                            placeholder="C"
                            value={editData.groupC_code ?? ''}
                            onChange={(e) => setEditData({ ...editData, groupC_code: parseInt(e.target.value) || null })}
                          />
                          <span style={{ minWidth: '80px', flexShrink: 1 }}>
                            排序：{editData.sortOrder}
                          </span>

                          <button style={{ minWidth: '50px', whiteSpace: 'nowrap' }} onClick={() => handleSaveEdit(p.product_id)}>💾</button>
                          <button style={{ minWidth: '50px', whiteSpace: 'nowrap' }} onClick={() => setEditingId(null)}>取消</button>
                          <button
                            style={{ minWidth: '50px', whiteSpace: 'nowrap' }}
                            disabled={index === 0}
                            onClick={() => swapSortOrder(index, index - 1, category)}
                          >
                            ⬆️
                          </button>
                          <button
                            style={{ minWidth: '50px', whiteSpace: 'nowrap' }}
                            disabled={index === arr.length - 1}
                            onClick={() => swapSortOrder(index, index + 1, category)}
                          >
                            ⬇️
                          </button>
                          <div style={{ marginTop: '1em', borderTop: '1px solid #ddd', paddingTop: '1em', width: '100%' }}>
                            <ProductIngredientsManager productId={p.product_id} />
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5em' }}>
                          <span>{p.name}（{p.category}） - ${p.price}</span>
                          <span>
                            A:{p.groupA_code ?? '-'} B:{p.groupB_code ?? '-'} C:{p.groupC_code ?? '-'} ｜排序:{p.sortOrder}
                          </span>
                          <button onClick={() => startEdit(p)}>✏️</button>
                          <button style={{ color: 'red' }} onClick={() => handleDeleteProduct(p.product_id)}>🗑️</button>
                        </div>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div> 
    </div>
  );
}

export default ProductManagePage;
