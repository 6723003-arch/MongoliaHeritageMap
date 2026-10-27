import { renderNavbar } from "../components/navbar.js";
import { openAimagModal } from "../components/monumentModals.js";
import { getAimags, getMonuments } from "../services/monumentService.js";
import { badge } from "../ui/shadcn.js";
import { t, tr } from "../i18n/i18n.js";

export async function atlasPage(root) {
  root.append(renderNavbar());

  const page = document.createElement("main");
  page.className = "mx-auto max-w-7xl px-6 py-6";
  page.innerHTML = `
    <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">${t("atlas.title")}</h1>
        <p class="text-sm text-muted-foreground">${t("atlas.subtitle")}</p>
      </div>
      <div class="flex gap-2">
        <span class="${badge("outline")}"><i class="mr-1.5 inline-block h-2.5 w-2.5 rounded-full" style="background:var(--aimag-data)"></i>${t("atlas.legendData")}</span>
        <span class="${badge("outline")}"><i class="mr-1.5 inline-block h-2.5 w-2.5 rounded-full" style="background:var(--aimag)"></i>${t("atlas.legendSoon")}</span>
      </div>
    </div>

    <div class="atlas-wrap relative overflow-hidden rounded-xl border border-border bg-card/40 p-4">
      <div id="atlasSvg" class="h-[calc(100vh-14rem)] min-h-[320px]"></div>
      <div id="atlasTip" class="pointer-events-none absolute z-20 hidden rounded-md border border-border bg-card px-2.5 py-1 text-xs shadow-md"></div>
    </div>`;
  root.append(page);

  const [aimags, monuments, svgText] = await Promise.all([getAimags(), getMonuments(), fetch("img/map.svg").then((r) => r.text())]);

  const box = page.querySelector("#atlasSvg");
  box.innerHTML = svgText;
  const svg = box.querySelector("svg");
  svg.removeAttribute("width");
  svg.removeAttribute("height");
  svg.setAttribute("class", "h-full w-full");
  svg.querySelector("#label_points")?.remove();

  const wrap = page.querySelector(".atlas-wrap");
  const tip = page.querySelector("#atlasTip");

  const countBy = {};
  monuments.forEach((m) => {
    countBy[m.aimagId] = (countBy[m.aimagId] || 0) + 1;
  });

  svg.querySelectorAll("#features path").forEach((path) => {
    const aimag = aimags.find((a) => a.id === path.id);
    if (!aimag) return;
    const count = countBy[aimag.id] || 0;

    path.classList.add("aimag");
    if (count) path.classList.add("has-data");

    path.addEventListener("mousemove", (e) => {
      const r = wrap.getBoundingClientRect();
      tip.textContent = t("atlas.tip", { name: tr(aimag.name), n: count });
      tip.style.left = `${e.clientX - r.left + 12}px`;
      tip.style.top = `${e.clientY - r.top + 12}px`;
      tip.classList.remove("hidden");
    });
    path.addEventListener("mouseleave", () => tip.classList.add("hidden"));

    path.addEventListener("click", () => {
      svg.querySelectorAll(".aimag.is-selected").forEach((p) => p.classList.remove("is-selected"));
      path.classList.add("is-selected");
      openAimagModal(
        aimag,
        monuments.filter((m) => m.aimagId === aimag.id),
      );
    });
  });
}
