// src/api/orders.js
const API_BASE = "http://localhost:3000/api/orders";

// 查詢所有訂單
export async function getOrders() {
  const res = await fetch(API_BASE);
  return res.json();
}

// 查詢單筆訂單（含主檔 + 明細）
export async function getOrderById(orderId) {
  const res = await fetch(`${API_BASE}/${orderId}`);
  return res.json();
}

// 查詢訂單明細
export async function getOrderItems(orderId) {
  const res = await fetch(`${API_BASE}/${orderId}/items`);
  return res.json();
}

// 查詢日報表
export async function getDailyOrders(date) {
  const res = await fetch(`${API_BASE}/daily/${date}`);
  return res.json();
}

// 查詢月報表
export async function getMonthlyOrders(year, month) {
  const res = await fetch(`${API_BASE}/monthly/${year}/${month}`);
  return res.json();
}

// 查詢年報表
export async function getYearlyOrders(year) {
  const res = await fetch(`${API_BASE}/yearly/${year}`);
  return res.json();
}

// 建立訂單
export async function createOrder(orderData) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
  return res.json();
}
