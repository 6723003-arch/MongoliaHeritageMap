import { LANGS, getLang, setLang, t } from "../i18n/i18n.js";
import { getTheme, toggleTheme } from "../theme.js";

export function renderSettingsBar(className = "") {
  const wrap = document.createElement("div");
  wrap.className = `flex items-center gap-2 ${className}`;

  const langButtons = LANGS.map(
    (l) => `
    <button type="button" data-lang="${l.code}" title="${l.name}"
      class="h-7 min-w-8 cursor-pointer rounded-full px-2 text-xs font-semibold transition-colors ${
        l.code === getLang() ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      }">${l.label}</button>`,
  ).join("");

  wrap.innerHTML = `
    <div class="flex items-center rounded-full border border-border bg-card/80 p-0.5 backdrop-blur">${langButtons}</div>
    <button type="button" data-theme-toggle aria-label="${t("set.theme")}" title="${t("set.theme")}"
      class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-card/80 text-sm backdrop-blur transition-colors hover:bg-accent"></button>`;

  const themeBtn = wrap.querySelector("[data-theme-toggle]");
  const paint = () => {
    themeBtn.textContent = getTheme() === "dark" ? "☀️" : "🌙";
  };
  paint();

  wrap.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));
  themeBtn.addEventListener("click", () => {
    toggleTheme();
    paint();
  });

  return wrap;
}
