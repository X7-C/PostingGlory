import { request } from "./client.js";
import { setToken, setUser, clearSession, getUser as _getUser } from "../utils/storage.js";

/**
 * Register a new user.
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} user object
 */
export async function registerUser(name, email, password) {
  const data = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  return data.data;
}

/**
 * Log in a user and persist token/session.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} user object
 */
export async function loginUser(email, password) {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  const user = data.data;
  setToken(user.accessToken);
  setUser(user);
  window.dispatchEvent(new Event("authChange"));
  return user;
}

export function logoutUser() {
  clearSession();
  window.dispatchEvent(new Event("authChange"));
}

/** @returns {object|null} current user or null */
export function getUser() {
  return _getUser();
}

/** @returns {boolean} whether a token exists */
export function isAuthenticated() {
  return !!_getUser() && !!localStorage.getItem("token");
}
