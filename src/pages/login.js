import { loginUser } from "../api/auth.js";

const form = document.querySelector("#loginForm");
const errorEl = document.querySelector("#error");

form.addEventListener("submit", async e => {
  e.preventDefault();
  errorEl.textContent = "";

  const fd = new FormData(form);
  const email = fd.get("email");
  const password = fd.get("password");

  try {
    await loginUser(String(email), String(password));
    window.location.href = "./feed.html";
  } catch (err) {
    errorEl.textContent = err.message || "Login failed";
  }
});