import { login, register } from "../services/authService.js";
import { renderSettingsBar } from "../components/settingsBar.js";
import { markSvg, fillMarks } from "../ui/mongoliaMark.js";
import { t } from "../i18n/i18n.js";

const BACKGROUND_IMAGE = "img/mongolia-hero.jpg";
const icon = (name) => `<i data-lucide="${name}"></i>`;

const features = [
  { icon: "map-pin", key: "landing.f1" },
  { icon: "route", key: "landing.f2" },
  { icon: "languages", key: "landing.f3" },
];

let mode = "login"; // хэл солиход (дахин зурахад) горим алдагдахгүй

export async function landingPage(root) {
  root.innerHTML = `
  <main class="auth-page">

    <header class="site-header">
      <a class="brand" href="#/">
        ${markSvg("brand-mark")}
        <span>HERITAGE MAP</span>
      </a>
    </header>

    <section class="auth-layout">

      <aside class="visual-panel">
        <img class="background-image" src="${BACKGROUND_IMAGE}" alt="" loading="eager" />
        <div class="background-overlay"></div>

        <div class="visual-content">
          <div class="hero-content">
            
            <h1>${t("landing.h1a")}<span>${t("landing.h1b")}</span></h1>
            <p class="hero-description">${t("landing.desc")}</p>
          </div>

          <div class="feature-list">
            ${features
              .map(
                (f) => `
              <article class="feature-item">
                <span class="feature-icon">${icon(f.icon)}</span>
                <div><strong>${t(f.key + ".title")}</strong><p>${t(f.key + ".text")}</p></div>
              </article>`,
              )
              .join("")}
          </div>
        </div>
      </aside>

      <section class="form-panel">
        <form class="login-card" id="authForm" novalidate>
          <header class="form-header">
            <h2 id="formTitle"></h2>
            <p id="formDesc"></p>
          </header>

          <div class="field-group" id="nameGroup" hidden>
            <label for="account-name">${t("auth.name")}</label>
            <div class="input-container">
              ${icon("user")}
              <input id="account-name" name="name" type="text" autocomplete="name" placeholder="${t("auth.namePh")}" />
            </div>
          </div>

          <div class="field-group">
            <label for="account-email">${t("auth.email")}</label>
            <div class="input-container">
              ${icon("mail")}
              <input id="account-email" name="email" type="email" autocomplete="email" placeholder="${t("auth.emailPh")}" />
            </div>
          </div>

          <div class="field-group">
            <label for="account-password">${t("auth.password")}</label>
            <div class="input-container">
              ${icon("lock")}
              <input id="account-password" name="password" type="password" placeholder="${t("auth.passwordPh")}" />
              <button class="visibility-button" type="button" id="togglePwd" aria-label="${t("auth.showPwd")}" aria-pressed="false">
                <span id="eyeOn">${icon("eye")}</span>
                <span id="eyeOff" hidden>${icon("eye-off")}</span>
              </button>
            </div>
          </div>

          <button class="submit-button" type="submit" id="submitBtn">
            <span id="submitText"></span>
            ${icon("arrow-right")}
          </button>

          <p class="signup-copy">
            <span id="askText"></span>
            <button type="button" id="switchBtn"></button>
          </p>

          <p class="status-message" id="status" role="status" aria-live="polite">&nbsp;</p>
        </form>
      </section>

    </section>
  </main>`;

  root.querySelector(".site-header").append(renderSettingsBar());
  window.lucide?.createIcons();
  fillMarks(root);
  root.querySelector(".background-image").addEventListener("error", (e) => e.target.remove());

  const $ = (sel) => root.querySelector(sel);
  const form = $("#authForm");
  const pwd = $("#account-password");
  const status = $("#status");

  function setMessage(text, isError = false) {
    status.textContent = text || "\u00A0";
    status.style.color = isError ? "#ff8b8b" : "";
    status.classList.toggle("status-visible", Boolean(text));
  }

  function applyMode() {
    const reg = mode === "register";
    $("#formTitle").textContent = t(reg ? "auth.registerTitle" : "auth.loginTitle");
    $("#formDesc").textContent = t(reg ? "auth.registerDesc" : "auth.loginDesc");
    $("#submitText").textContent = t(reg ? "auth.registerBtn" : "auth.loginBtn");
    $("#askText").textContent = t(reg ? "auth.haveAccount" : "auth.noAccount");
    $("#switchBtn").textContent = t(reg ? "auth.switchLogin" : "auth.switchRegister");
    $("#nameGroup").hidden = !reg;
    pwd.autocomplete = reg ? "new-password" : "current-password";
    setMessage("");
  }
  applyMode();

  $("#switchBtn").addEventListener("click", () => {
    mode = mode === "login" ? "register" : "login";
    applyMode();
  });

  $("#togglePwd").addEventListener("click", () => {
    const show = pwd.type === "password";
    pwd.type = show ? "text" : "password";
    $("#eyeOn").hidden = show;
    $("#eyeOff").hidden = !show;
    $("#togglePwd").setAttribute("aria-pressed", String(show));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const name = String(data.name || "").trim();
    const email = String(data.email || "").trim();
    const password = String(data.password || "");

    if (mode === "register" && !name) return setMessage(t("err.name"), true);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setMessage(t("err.email"), true);
    if (password.length < 6) return setMessage(t("err.password"), true);

    const btn = $("#submitBtn");
    btn.disabled = true;
    try {
      if (mode === "login") await login({ email, password });
      else await register({ name, email, password });
      location.hash = "/atlas";
    } catch (err) {
      setMessage(err.message, true);
      btn.disabled = false;
    }
  });
}
