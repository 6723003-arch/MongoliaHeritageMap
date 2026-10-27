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

    <section class="mb-4 rounded-xl border border-border bg-card/40 p-4">
  <label for="monumentSearch" class="mb-2 block text-sm font-semibold">
    ${t("atlas.searchLabel")}
  </label>

  <div style="display:flex; gap:8px;">
    <input
      id="monumentSearch"
      type="search"
      placeholder="${t("atlas.searchPlaceholder")}"
      autocomplete="off"
      style="flex:1; min-width:0; padding:12px 14px;
             border:1px solid var(--border); border-radius:10px;
             background:transparent; color:inherit;"
    />
    <button
      id="clearSearch"
      type="button"
      class="rounded-md border border-border px-3 py-2"
      aria-label="${t("atlas.searchClear")}"
    >✕</button>
  </div>

  <p id="searchStatus" role="status" class="mt-2 text-sm text-muted-foreground"></p>

  <div
    id="searchResults"
    style="display:grid; gap:8px; max-height:360px; overflow-y:auto;"
  ></div>
</section>

    <div class="atlas-wrap relative overflow-hidden rounded-xl border border-border bg-card/40 p-4">
      <div id="atlasSvg" class="h-[calc(100vh-14rem)] min-h-[320px]"></div>
      <div id="atlasTip" class="pointer-events-none absolute z-20 hidden rounded-md border border-border bg-card px-2.5 py-1 text-xs shadow-md"></div>
    </div>`;
  root.append(page);

  const [aimags, monuments, svgText] = await Promise.all([getAimags(), getMonuments(), fetch("img/map.svg").then((r) => r.text())]);

  const searchInput = page.querySelector("#monumentSearch");
  const searchResults = page.querySelector("#searchResults");
  const searchStatus = page.querySelector("#searchStatus");
  const clearSearch = page.querySelector("#clearSearch");

  const aimagById = new Map(aimags.map((a) => [a.id, a]));

  // Том, жижиг үсэг болон зураасны ялгааг арилгана.
  const normalize = (value) =>
    String(value ?? "")
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[-–—]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const multilingualText = (value) => (typeof value === "string" ? value : Object.values(value ?? {}).join(" "));

  const searchIndex = monuments.map((monument) => {
    const aimag = aimagById.get(monument.aimagId);

    return {
      monument,
      aimag,
      text: normalize([multilingualText(monument.name), multilingualText(monument.sum), multilingualText(aimag?.name)].join(" ")),
    };
  });

  function renderSearch() {
    const query = normalize(searchInput.value);
    searchResults.replaceChildren();
    searchStatus.textContent = "";

    if (!query) return;

    const words = query.split(" ");
    const matches = searchIndex.filter(({ text }) => words.every((word) => text.includes(word)));

    searchStatus.textContent = matches.length ? t("atlas.searchResults", { n: matches.length }) : t("atlas.searchEmpty");

    matches.forEach(({ monument, aimag }) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "rounded-lg border border-border bg-card p-3 text-left";
      button.style.cssText = "display:flex; align-items:center; gap:12px; width:100%;";

      if (monument.image) {
        const image = document.createElement("img");
        image.src = monument.image;
        image.alt = "";
        image.loading = "lazy";
        image.style.cssText = "width:64px; height:52px; object-fit:cover; border-radius:8px;";
        image.addEventListener("error", () => image.remove(), { once: true });
        button.append(image);
      }

      const info = document.createElement("div");

      const title = document.createElement("strong");
      title.textContent = tr(monument.name);

      const location = document.createElement("div");
      location.className = "text-sm text-muted-foreground";
      location.textContent = [aimag ? tr(aimag.name) : "", tr(monument.sum)].filter(Boolean).join(" · ");

      info.append(title, location);
      button.append(info);

      if (aimag) {
        button.addEventListener("click", () => {
          const map = page.querySelector("#atlasSvg svg");

          map?.querySelectorAll(".aimag.is-selected").forEach((path) => {
            path.classList.remove("is-selected");
          });

          const selected = Array.from(map?.querySelectorAll("#features path") ?? []).find((path) => path.id === aimag.id);

          selected?.classList.add("is-selected");

          // Одоо ашиглаж буй цонхонд зөвхөн сонгосон дурсгалыг харуулна.
          openAimagModal(aimag, [monument]);
        });
      } else {
        button.disabled = true;
      }

      searchResults.append(button);
    });
  }

  searchInput.addEventListener("input", renderSearch);

  clearSearch.addEventListener("click", () => {
    searchInput.value = "";
    renderSearch();
    searchInput.focus();
  });

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
