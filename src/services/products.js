import { apiFetch } from "../utils/api";

export async function getProducts() {
  return apiFetch("/api/products", { method: "GET" });
}
