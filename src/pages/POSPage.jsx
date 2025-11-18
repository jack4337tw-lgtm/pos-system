import React, { useState, useEffect, memo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../App.css";
import "./POSPage.css";
import ROLES from '../constants/roles';
import { useAuth } from '../context/AuthContext'; // ✅ 引入 AuthContext

// 引入 API 模組
import { createOrder } from "../api/orders";
import { getProducts } from "../api/products";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 12, background: "#ffecec", color: "#900" }}>
          <strong>Component error occurred. Check console for details.</strong>
        </div>
      );
    }
    return this.props.children;
  }
}

const SingleRow = ({ item, onAddEgg, onRemove }) => (
  <div
    key={item._id}
    style={{
      borderBottom: "1px solid #eee",
      padding: "8px 0",
      display: "flex",
      gap: 8,
      alignItems: "center",
    }}
  >
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 600 }}>{item.name}</div>
      <div style={{ color: "#666", fontSize: 13 }}>
        ${item.price}{" "}
        {item.addon && (
          <span>
            {" "}
            +{item.addon.name}(${item.addon.price})
          </span>
        )}
      </div>
    </div>
    <div style={{ display: "flex", gap: 6 }}>
      {item.category === "便當" && (
        <button onClick={() => onAddEgg(item._id)}>加點荷包蛋</button>
      )}
      <button onClick={() => onRemove(item._id)}>❌ 刪除</button>
    </div>
  </div>
);

const SelectedList = memo(function SelectedList({
  selected,
  pairedMap,
  onAddEgg,
  onRemove,
}) {
  const rendered = new Set();
  if (!selected || selected.length === 0) {
    return <div style={{ padding: 8, color: "#666" }}>尚未選取商品</div>;
  }
  return (
    <div>
      {selected.map((it) => {
        if (rendered.has(it._id)) return null;
        const partnerId = pairedMap && pairedMap[it._id];
        if (partnerId) {
          const partner = selected.find((s) => s._id === partnerId);
          if (!partner) {
            rendered.add(it._id);
            return (
              <SingleRow
                key={it._id}
                item={it}
                onAddEgg={onAddEgg}
                onRemove={onRemove}
              />
            );
          }
          rendered.add(it._id);
          rendered.add(partner._id);
          return (
            <div
              key={`pair-${it._id}-${partner._id}`}
              style={{
                borderBottom: "1px solid #eee",
                padding: "8px 0",
                display: "flex",
                gap: 8,
                alignItems: "center",
                background: "#fafafa",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>
                  {it.name} + {partner.name}{" "}
                  <span style={{ fontWeight: 500, color: "#1976d2" }}>
                    （雙拼）
                  </span>
                </div>
                <div style={{ color: "#666", fontSize: 13 }}>
                  {`${it.name}: $${it.price}${
                    it.addon ? ` +${it.addon.name}($${it.addon.price})` : ""
                  }`}{" "}
                  <br />
                  {`${partner.name}: $${partner.price}${
                    partner.addon
                      ? ` +${partner.addon.name}($${partner.addon.price})`
                      : ""
                  }`}{" "}
                  <br />
                  <strong style={{ color: "#d32f2f" }}>
                    雙拼組合價：$120
                  </strong>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {it.category === "便當" && (
                  <button onClick={() => onAddEgg(it._id)}>加點荷包蛋</button>
                )}
                {partner.category === "便當" && (
                  <button onClick={() => onAddEgg(partner._id)}>
                    加點荷包蛋
                  </button>
                )}
                <button onClick={() => onRemove(it._id)}>❌ 刪除</button>
                <button onClick={() => onRemove(partner._id)}>
                  ❌ 刪除另一個
                </button>
              </div>
            </div>
          );
        }
        rendered.add(it._id);
        return (
          <SingleRow
            key={it._id}
            item={it}
            onAddEgg={onAddEgg}
            onRemove={onRemove}
          />
        );
      })}
    </div>
  );
});

function POSPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [pairedMap, setPairedMap] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [displayTotal, setDisplayTotal] = useState(0);
  const [eggItem, setEggItem] = useState(null);

  // 載入商品
  useEffect(() => {
    getProducts()
      .then((data) => {
        const normalized = Array.isArray(data)
          ? data.map((it) => ({
              ...it,
              price: Number(it.price) || 0,
              groupA_code: it.groupA_code ? Number(it.groupA_code) : undefined,
              groupB_code: it.groupB_code ? Number(it.groupB_code) : undefined,
              groupC_code: it.groupC_code ? Number(it.groupC_code) : undefined,
            }))
          : [];
        setItems(normalized);
        const foundEgg = normalized.find((p) => p.groupB_code === 1);
        setEggItem(foundEgg || null);
      })
      .catch((err) => {
        console.error("fetch error", err);
        setItems([]);
        setEggItem(null);
      });
  }, []);

  // 計算總金額
  const calculateTotal = (list = selected) => {
    let total = 0;
    const A1 = [],
      A2 = [],
      A3 = [],
      A4 = [];
    list.forEach((it) => {
      const g = it.groupA_code ? Number(it.groupA_code) : undefined;
      if (g === 1) A1.push(it._id);
      else if (g === 2) A2.push(it._id);
      else if (g === 3) A3.push(it._id);
      else if (g === 4) A4.push(it._id);
    });

    const usedIds = new Set();
    const pairedMapLocal = {};
    let comboCount = 0;

    while (A1.length && A4.length) {
      const i1 = A1.pop();
      const i4 = A4.pop();
      usedIds.add(i1);
      usedIds.add(i4);
      pairedMapLocal[i1] = i4;
      pairedMapLocal[i4] = i1;
      comboCount++;
    }
    while (A2.length && (A3.length || A4.length)) {
      const i2 = A2.pop();
      const iPair = A3.length ? A3.pop() : A4.pop();
      usedIds.add(i2);
      usedIds.add(iPair);
      pairedMapLocal[i2] = iPair;
      pairedMapLocal[iPair] = i2;
      comboCount++;
    }

    total += comboCount * 120;

    list.forEach((it) => {
      if (!usedIds.has(it._id)) {
        total += Number(it.price) || 0;
      }
      if (it.addon && typeof it.addon === "object") {
        const addonPrice = Number(it.addon.price);
        if (Number.isFinite(addonPrice)) {
          total += addonPrice;
        }
      }
    });

    return { total, pairedMap: pairedMapLocal };
  };

  useEffect(() => {
    const { total, pairedMap: newMap } = calculateTotal(selected);
    const raf = requestAnimationFrame(() => {
      setTotalAmount(total);
      setPairedMap(newMap || {});
    });
    return () => cancelAnimationFrame(raf);
  }, [selected]);

  useEffect(() => {
    const raf = requestAnimationFrame(() =>
      setDisplayTotal(totalAmount || 0)
    );
    return () => cancelAnimationFrame(raf);
  }, [totalAmount]);

  const handleSelect = (item) => {
    const uid =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `uuid-${Math.random().toString(36).slice(2, 9)}`;
    setSelected((prev) => [
      ...prev,
      {
        ...item,
        _id: `selected-${uid}`,
        product_id: item.product_id,
        addon: null,
        price: Number(item.price) || 0,
      },
    ]);
  };

  const handleAddEgg = (_id) => {
    const egg = eggItem;
    const eggPrice = egg ? Number(egg.price) || 0 : 15;
    const eggName = egg ? egg.name || "荷包蛋" : "荷包蛋";

    setSelected((prev) =>
      prev.map((it) =>
        it._id === _id
          ? {
              ...it,
              addon: {
                id: egg?.product_id || null,
                name: eggName,
                price: eggPrice,
              },
            }
          : it
      )
    );
  };

  const safeRemove = (_id) => {
    setSelected((prev) => prev.filter((it) => it._id !== _id));
  };

  // 四種按鈕對應的事件 → 呼叫 API 模組的 createOrder

  // 現金訂單
  const handleCashOrder = async () => {
    await createOrder({
      operator: user?.account || "unknown",
      created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
      total_amount: totalAmount,
      is_void: 0,
      is_staff_meal: 0,
      customer_info: null,
      coupon_info: null,
      payment_method: "cash",
      items: selected.map((it) => ({
        product_id: it.product_id,
        product_name: it.name,
        price: it.price,
        quantity: it.quantity || 1,
        addon: it.addon ? JSON.stringify(it.addon) : null,
        main_ingredient1: it.name,
        main_ingredient2: null,
      })),
    });
    alert("訂單已建立！");
    setSelected([]);
  };

  // 行動支付訂單
  const handleMobileOrder = async () => {
    await createOrder({
      operator: user?.account || "unknown",
      created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
      total_amount: totalAmount,
      is_void: 0,
      is_staff_meal: 0,
      customer_info: null,
      coupon_info: null,
      payment_method: "mobile",
      items: selected.map((it) => ({
        product_id: it.product_id,
        product_name: it.name,
        price: it.price,
        quantity: it.quantity || 1,
        addon: it.addon ? JSON.stringify(it.addon) : null,
        main_ingredient1: it.name,
        main_ingredient2: null,
      })),
    });
    alert("訂單已建立！");
    setSelected([]);
  };

  // 未售出訂單
  const handleVoidOrder = async () => {
    await createOrder({
      operator: user?.account || "unknown",
      created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
      total_amount: 0,
      is_void: 1,
      is_staff_meal: 0,
      customer_info: null,
      coupon_info: null,
      payment_method: null,
      items: selected.map((it) => ({
        product_id: it.product_id,
        product_name: it.name,
        price: 0, // 未售出商品金額設為 0
        quantity: it.quantity || 1,
        addon: it.addon ? JSON.stringify(it.addon) : null,
        main_ingredient1: it.name,
        main_ingredient2: null,
      })),
    });
    alert("未售出訂單已建立！");
    setSelected([]);
  };

  // 員工餐訂單
  const handleStaffMeal = async () => {
    await createOrder({
      operator: user?.account || "unknown",
      created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
      total_amount: 0,
      is_void: 0,
      is_staff_meal: 1,
      customer_info: null,
      coupon_info: null,
      payment_method: null,
      items: selected.map((it) => ({
        product_id: it.product_id,
        product_name: it.name,
        price: 0, // 員工餐商品金額設為 0
        quantity: it.quantity || 1,
        addon: it.addon ? JSON.stringify(it.addon) : null,
        main_ingredient1: it.name,
        main_ingredient2: null,
      })),
    });
    alert("員工餐已建立！");
    setSelected([]);
  };

  return (
    <ErrorBoundary>
      <div className="pos-container">
        <header className="pos-header">
          <div className="title">
            5891POS（登錄者：{user?.staff_code} / 角色：{ROLES[user?.role]}）
          </div>
          <div className="header-buttons">
            <button onClick={() => navigate("/admin")}>後台設定</button>
            <button>列印</button>
            <button onClick={() => navigate("/")}>登出</button>
          </div>
        </header>

        <div className="main-area">
          <section className="product-area">
            <div className="product-grid">
              <div className="product-column">
                <h3>便當類</h3>
                {items
                  .filter((item) => item.category === "便當")
                  .map((item, idx) => (
                    <button key={idx} onClick={() => handleSelect(item)}>
                      {item.name} - ${item.price}
                    </button>
                  ))}
              </div>
              <div className="product-column">
                <h3>單點類</h3>
                {items
                  .filter((item) => item.category === "單點")
                  .map((item, idx) => (
                    <button key={idx} onClick={() => handleSelect(item)}>
                      {item.name} - ${item.price}
                    </button>
                  ))}
              </div>
            </div>
            <div className="addon-row">
              <h3>附加類</h3>
              {items
                .filter((item) => item.category === "附加")
                .map((item, idx) => (
                  <button key={idx} onClick={() => handleSelect(item)}>
                    {item.name} - ${item.price}
                  </button>
                ))}
            </div>
          </section>

          {/* 右半邊統計區 */}
          <section className="summary-area">
            <h2>已選商品與統計</h2>
            <SelectedList
              selected={selected}
              pairedMap={pairedMap}
              onAddEgg={handleAddEgg}
              onRemove={safeRemove}
            />
          </section>
        </div>

        {/* 下方合計金額區 */}
        <footer className="pos-footer">
          <div
            id="pos-total"
            className="total"
            key={displayTotal}
            style={{
              color: "red",
              fontWeight: 800,
              fontSize: 20,
              background: "yellow",
              padding: "6px 10px",
              zIndex: 9999,
              position: "relative",
            }}
          >
            合計金額: {"$" + displayTotal}
          </div>

          <div className="footer-buttons">
            <button onClick={handleCashOrder}>現金結單</button>
            <button onClick={handleMobileOrder}>行動支付</button>
            <button onClick={handleVoidOrder}>未售出</button>
            <button onClick={handleStaffMeal}>員工餐</button>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default POSPage;
