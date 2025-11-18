// src/api/productIngredients.js
import axios from "axios";

const API_BASE = "http://localhost:3000/api/product-ingredients";

// 取得某商品的主食材設定
export const getProductIngredients = async (productId) => {
  const res = await axios.get(`${API_BASE}/${productId}`);
  return res.data;
};

// 新增主食材設定
export const addProductIngredient = async (ingredient) => {
  const res = await axios.post(API_BASE, ingredient);
  return res.data;
};

// 更新主食材設定
export const updateProductIngredient = async (id, ingredient) => {
  const res = await axios.put(`${API_BASE}/${id}`, ingredient);
  return res.data;
};

// 刪除主食材設定
export const deleteProductIngredient = async (id) => {
  const res = await axios.delete(`${API_BASE}/${id}`);
  return res.data;
};
