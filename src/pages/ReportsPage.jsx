// src/pages/ReportsPage.jsx
import React, { useState, useEffect } from "react";
import { getDailyOrders, getMonthlyOrders, getYearlyOrders } from "../api/orders";
import { useNavigate } from "react-router-dom";
import ROLES from '../constants/roles';
import { useAuth } from '../context/AuthContext';
function ReportsPage() {
  const [activeTab, setActiveTab] = useState("daily");
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);

  const [date, setDate] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const navigate = useNavigate();

  const { user } = useAuth(); // ✅ 從 Context 取得登入者資訊

  // 每秒更新時間
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 合計金額
  const calcTotal = (list) =>
    list.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

  // 食材加總
  const calcIngredients = (list) => {
    const map = {};
    list.forEach((o) => {
      if (o.items) {
        o.items.forEach((it) => {
          const name = it.product_name;
          map[name] = (map[name] || 0) + (it.quantity || 1);
        });
      }
    });
    return map;
  };

  const handleDailyReport = async () => {
    if (!date) return alert("請選擇日期");
    const data = await getDailyOrders(date);
    setDailyData(Array.isArray(data) ? data : []);
  };

  const handleMonthlyReport = async () => {
    if (!year || !month) return alert("請選擇年份和月份");
    const data = await getMonthlyOrders(year, month);
    setMonthlyData(Array.isArray(data) ? data : []);
  };

  const handleYearlyReport = async () => {
    if (!year) return alert("請選擇年份");
    const data = await getYearlyOrders(year);
    setYearlyData(Array.isArray(data) ? data : []);
  };

  const displayOrderCode = (o) => {
    if (!o.order_code || o.order_code === "") {
      return (o.order_id || "").slice(0, 8);
    }
    return o.order_code;
  };

  return (
    <div>
      {/* 固定頂端的抬頭列 */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
          backgroundColor: "#f5f5f5",
          borderBottom: "1px solid #ddd",
        }}
      >
        {/* 左邊：系統名稱 + 登入者 */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <h2 style={{ margin: 0 }}>5891POS</h2>
          <span>
            登錄者：{user?.staff_code} / 角色：{ROLES[user?.role]}
          </span>
        </div>

        {/* 右邊：日期時間 + 列印 + 上一頁按鈕 */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span>{currentTime}</span>
          <button
            onClick={() => window.print()}
            style={{
              padding: "6px 12px",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            列印
          </button>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "6px 12px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            上一頁
          </button>
        </div>
      </header>

      {/* 報表內容 */}
      <div style={{ padding: 20 }}>
        <h1>📊 報表中心</h1>

        {/* Tab 切換 */}
        <div style={{ marginBottom: 20 }}>
          <button onClick={() => setActiveTab("daily")}>日報表</button>
          <button onClick={() => setActiveTab("monthly")}>月報表</button>
          <button onClick={() => setActiveTab("yearly")}>年報表</button>
        </div>

        {/* 日報表 */}
        {activeTab === "daily" && (
          <section>
            <h2>日報表</h2>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <button onClick={handleDailyReport}>查詢</button>
            <p>合計金額：${calcTotal(dailyData).toFixed(2)}</p>

            {dailyData.length === 0 ? (
              <p>這一天沒有訂單</p>
            ) : (
              <>
                <table border="1" cellPadding="6">
                  <thead>
                    <tr>
                      <th>訂單編號</th>
                      <th>金額</th>
                      <th>付款方式</th>
                      <th>商品內容</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyData.map((o) => (
                      <tr key={o.order_id}>
                        <td title={o.order_id}>{displayOrderCode(o)}</td>
                        <td>{o.total_amount}</td>
                        <td>{o.display_payment}</td>
                        <td>
                          {o.items && o.items.length > 0
                            ? o.items.map(it => `${it.product_name} x${it.quantity}`).join(", ")
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* 食材加總 */}
                <h3>食材加總</h3>
                <ul>
                  {Object.entries(calcIngredients(dailyData)).map(([name, qty]) => (
                    <li key={name}>{name} x{qty}</li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )}

        {/* 月報表 */}
        {activeTab === "monthly" && (
          <section>
            <h2>月報表</h2>
            <input
              type="number"
              placeholder="年份 YYYY"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
            <input
              type="number"
              placeholder="月份 MM"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
            <button onClick={handleMonthlyReport}>查詢</button>
            <p>合計金額：${calcTotal(monthlyData).toFixed(2)}</p>

            {monthlyData.length === 0 ? (
              <p>這個月沒有訂單</p>
            ) : (
              <>
                <table border="1" cellPadding="6">
                  <thead>
                    <tr>
                      <th>訂單編號</th>
                      <th>金額</th>
                      <th>付款方式</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((o) => (
                      <tr key={o.order_id}>
                        <td title={o.order_id}>{displayOrderCode(o)}</td>
                        <td>{o.total_amount}</td>
                        <td>{o.payment_method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* 食材加總 */}
                <h3>食材加總</h3>
                <ul>
                  {Object.entries(calcIngredients(monthlyData)).map(([name, qty]) => (
                    <li key={name}>{name} x{qty}</li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )}

        {/* 年報表 */}
        {activeTab === "yearly" && (
          <section>
            <h2>年報表</h2>
            <input
              type="number"
              placeholder="年份 YYYY"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
            <button onClick={handleYearlyReport}>查詢</button>
            <p>合計金額：${calcTotal(yearlyData).toFixed(2)}</p>

            {yearlyData.length === 0 ? (
              <p>這一年沒有訂單</p>
            ) : (
              <>
                <table border="1" cellPadding="6">
                  <thead>
                    <tr>
                      <th>訂單編號</th>
                      <th>金額</th>
                      <th>付款方式</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearlyData.map((o) => (
                      <tr key={o.order_id}>
                        <td title={o.order_id}>{displayOrderCode(o)}</td>
                        <td>{o.total_amount}</td>
                        <td>{o.payment_method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* 食材加總 */}
                <h3>食材加總</h3>
                <ul>
                  {Object.entries(calcIngredients(yearlyData)).map(([name, qty]) => (
                    <li key={name}>{name} x{qty}</li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default ReportsPage;
