import { translations } from "./translations.js";

export const LANGS = [
  { code: "mn", label: "МН", name: "Монгол" },
  { code: "en", label: "EN", name: "English" },
  { code: "ko", label: "한", name: "한국어" },
];

const KEY = "mhm_lang";
let current = localStorage.getItem(KEY);
if (!translations[current]) current = "mn";
document.documentElement.lang = current;

export const getLang = () => current;

export function setLang(code) {
  if (!translations[code] || code === current) return;
  current = code;
  localStorage.setItem(KEY, code);
  document.documentElement.lang = code;
  window.dispatchEvent(new CustomEvent("langchange", { detail: code }));
}

export function t(key, vars = {}) {
  const text = translations[current]?.[key] ?? translations.mn[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

export const tr = (obj) => obj?.[current] ?? obj?.en ?? obj?.mn ?? "";
