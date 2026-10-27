import { isLoggedIn } from "./services/authService.js";
import { t } from "./i18n/i18n.js";

export function startRouter(routes, root) {
  async function render() {
    const path = location.hash.slice(1) || "/";
    const route = routes[path] ?? routes["*"];

    if (route.auth && !isLoggedIn()) {
      location.hash = "/";
      return;
    }
    if (route.guestOnly && isLoggedIn()) {
      location.hash = "/atlas";
      return;
    }

    document.title = t("app.title");
    root.innerHTML = "";
    await route.page(root);
  }

  window.addEventListener("hashchange", render);
  window.addEventListener("langchange", render);
  render();
}
