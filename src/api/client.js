const API_KEY = "b99247dd-8989-4e93-8790-01cbfd47910b";
const BASE = "https://v2.api.noroff.dev";

import { getToken, clearSession } from "../utils/storage.js";

export async function request(path, options = {}) {
  const token = getToken();
  const hasBody = options.body !== undefined && options.body !== null;

  const headers = {
    "X-Noroff-API-Key": API_KEY,
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) clearSession();
    const msg =
      body?.errors?.[0]?.message ||
      body?.message ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return body;
}