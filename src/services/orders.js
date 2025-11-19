import { apiFetch } from "../utils/api";

export async function createOrder(orderData) {
  return apiFetch("/api/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
}
