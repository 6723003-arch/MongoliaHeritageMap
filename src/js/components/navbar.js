import { logout, currentUser } from "../services/authService.js";
import { renderSettingsBar } from "./settingsBar.js";
import { markSvg, fillMarks } from "../ui/mongoliaMark.js";
import { button } from "../ui/shadcn.js";
import { t } from "../i18n/i18n.js";

export function renderNavbar() {
  const header = document.createElement("header");
  header.className = "sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur";
  header.innerHTML = `
    <div class="mx-auto flex h-14 max-w-7xl items-center gap-4 px-6">
      <a href="#/atlas" class="flex items-center gap-3 font-semibold">
        ${markSvg("h-5 w-auto text-primary")}
        <span class="hidden tracking-wider sm:inline">HERITAGE MAP</span>
      </a>
      <div class="ml-auto flex items-center gap-3" id="navRight">
        <span class="hidden text-sm text-muted-foreground md:inline" data-user></span>
        <button class="${button("outline", "sm")}" data-logout>${t("nav.logout")}</button>
      </div>
    </div>`;

  header.querySelector("[data-user]").textContent = currentUser().name;
  header.querySelector("#navRight").prepend(renderSettingsBar());
  header.querySelector("[data-logout]").addEventListener("click", () => {
    logout();
    location.hash = "/";
  });
  fillMarks(header);
  return header;
}
