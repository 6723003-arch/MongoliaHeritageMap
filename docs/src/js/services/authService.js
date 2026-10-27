import { t } from "../i18n/i18n.js";

const USERS_KEY = "mhm_users";
const SESSION_KEY = "mhm_session";

async function hash(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const readUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || "[]");

export async function register({ name, email, password }) {
  const users = readUsers();
  email = email.trim().toLowerCase();
  if (users.some((u) => u.email === email)) throw new Error(t("err.emailExists"));
  if (password.length < 6) throw new Error(t("err.password"));
  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email,
    passwordHash: await hash(password),
  };
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id, name: user.name, email }));
}

export async function login({ email, password }) {
  const user = readUsers().find((u) => u.email === email.trim().toLowerCase());
  if (!user || user.passwordHash !== (await hash(password))) throw new Error(t("err.badLogin"));
  localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id, name: user.name, email: user.email }));
}

export const logout = () => localStorage.removeItem(SESSION_KEY);
export const currentUser = () => JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
export const isLoggedIn = () => currentUser() !== null;
