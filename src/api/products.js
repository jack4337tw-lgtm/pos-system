// src/api/products.js

// 從環境變數讀取 API_BASE
const API_BASE = `${import.meta.env.VITE_API_URL}/api/products`;

// 查詢所有商品
export async function getProducts() {
  const res = await fetch(API_BASE);
  if (!res.ok) {
    throw new Error("商品載入失敗");
  }
  return res.json();
}
