import { registerUser } from "../api/auth.js";

const form = document.querySelector("#registerForm");
const errorEl = document.querySelector("#error");

form.addEventListener("submit", async e => {
  e.preventDefault();
  errorEl.textContent = "";

  const fd = new FormData(form);
  const name = fd.get("name");
  const email = fd.get("email");
  const password = fd.get("password");

  try {
    await registerUser(String(name), String(email), String(password));
    window.location.href = "./login.html";
  } catch (err) {
    errorEl.textContent = err.message || "Registration failed";
  }
});