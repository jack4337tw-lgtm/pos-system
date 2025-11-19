import { apiFetch } from "../utils/api";

export async function login(staff_code, password) {
  return apiFetch("/api/login", {
    method: "POST",
    body: JSON.stringify({ staff_code, password }),
  });
}
