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
    <style>
      .atlas-layout {
        display: grid;
        grid-template-columns: 340px minmax(0, 1fr);
        gap: 16px;
        align-items: start;
      }

      .atlas-sidebar {
        overflow: hidden;
        border: 1px solid var(--border);
        border-radius: 12px;
      }

      .atlas-search-header {
        padding: 16px;
        border-bottom: 1px solid var(--border);
      }

      .atlas-search-row {
        display: flex;
        gap: 8px;
        margin-top: 10px;
      }

      .atlas-search-input {
        width: 100%;
        min-width: 0;
        padding: 10px 12px;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: transparent;
        color: inherit;
        font: inherit;
      }

      .atlas-search-input:focus-visible {
        outline: 2px solid #f5b82e;
        outline-offset: 2px;
      }

      .atlas-clear {
        padding: 0 12px;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: transparent;
        color: inherit;
        cursor: pointer;
      }

      .atlas-status {
        margin-top: 10px;
        font-size: 13px;
      }

      .atlas-groups {
        max-height: calc(100vh - 23rem);
        min-height: 240px;
        overflow-y: auto;
        padding: 8px;
      }

      .atlas-group {
        margin-bottom: 8px;
        border: 1px solid var(--border);
        border-radius: 10px;
        overflow: hidden;
      }

      .atlas-group summary {
        padding: 12px;
        cursor: pointer;
        font-weight: 600;
      }

      .atlas-group-count {
        margin-left: 6px;
        color: #f5b82e;
        font-size: 12px;
      }

      .atlas-monument {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 10px 12px;
        border: 0;
        border-top: 1px solid var(--border);
        background: transparent;
        color: inherit;
        text-align: left;
        cursor: pointer;
        font: inherit;
      }

      .atlas-monument:hover,
      .atlas-monument:focus-visible {
        background: rgba(245, 184, 46, 0.1);
      }

      .atlas-monument img {
        width: 52px;
        height: 48px;
        flex-shrink: 0;
        border-radius: 7px;
        object-fit: cover;
      }

      .atlas-monument-name {
        display: block;
        font-size: 14px;
        font-weight: 600;
      }

      .atlas-monument-location {
        display: block;
        margin-top: 3px;
        font-size: 12px;
      }

      .atlas-map-box {
        height: calc(100vh - 15rem);
        min-height: 420px;
      }

      .atlas-wrap .aimag.search-match {
        stroke: #f5b82e;
        stroke-width: 2;
        vector-effect: non-scaling-stroke;
      }

      @media (max-width: 850px) {
        .atlas-layout {
          grid-template-columns: 1fr;
        }

        .atlas-groups {
          min-height: 0;
          max-height: 300px;
        }

        .atlas-map-box {
          height: 50vh;
          min-height: 300px;
        }
      }

  @media (min-width: 851px) {
  .atlas-layout {
    height: auto;
    align-items: start;
  }

  .atlas-layout > .atlas-sidebar,
  .atlas-layout > .atlas-wrap {
    box-sizing: border-box;
    height: max(460px, calc(100vh - 15rem));
    min-height: 0;
  }

  .atlas-layout > .atlas-sidebar {
    display: flex;
    flex-direction: column;
  }

  .atlas-search-header {
    flex: 0 0 auto;
  }

  .atlas-sidebar > .atlas-groups {
    flex: 1 1 0;
    min-height: 0;
    max-height: none;
    overflow-y: auto;
  }

  .atlas-wrap > .atlas-map-box {
    height: 100%;
    min-height: 0;
  }
}
.atlas-sidebar > .atlas-groups {
  scrollbar-width: none !important;
}

.atlas-sidebar > .atlas-groups::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

    </style>

    <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">
          ${t("atlas.title")}
        </h1>
        <p class="text-sm text-muted-foreground">
          ${t("atlas.subtitle")}
        </p>
      </div>

      <div class="flex gap-2">
        <span class="${badge("outline")}">
          <i
            class="mr-1.5 inline-block h-2.5 w-2.5 rounded-full"
            style="background:var(--aimag-data)"
          ></i>${t("atlas.legendData")}
        </span>

        <span class="${badge("outline")}">
          <i
            class="mr-1.5 inline-block h-2.5 w-2.5 rounded-full"
            style="background:var(--aimag)"
          ></i>${t("atlas.legendSoon")}
        </span>
      </div>
    </div>

    <div class="atlas-layout">
      <aside class="atlas-sidebar bg-card/40">
        <div class="atlas-search-header">
          <label for="monumentSearch" class="font-semibold">
            ${t("atlas.searchLabel")}
          </label>

          <div class="atlas-search-row">
            <input
              id="monumentSearch"
              class="atlas-search-input"
              type="search"
              placeholder="${t("atlas.searchPlaceholder")}"
              autocomplete="off"
              aria-controls="aimagGroups"
            />

            <button
              id="clearSearch"
              class="atlas-clear"
              type="button"
              aria-label="${t("atlas.searchClear")}"
            >✕</button>
          </div>

          <p
            id="searchStatus"
            class="atlas-status text-muted-foreground"
            role="status"
          ></p>
        </div>

        <div id="aimagGroups" class="atlas-groups"></div>
      </aside>

      <div
        class="atlas-wrap relative overflow-hidden rounded-xl
               border border-border bg-card/40 p-4"
      >
        <div id="atlasSvg" class="atlas-map-box"></div>

        <div
          id="atlasTip"
          class="pointer-events-none absolute z-20 hidden rounded-md
                 border border-border bg-card px-2.5 py-1
                 text-xs shadow-md"
        ></div>
      </div>
    </div>
  `;

  root.append(page);

  const [aimags, monuments, svgText] = await Promise.all([
    getAimags(),
    getMonuments(),
    fetch("img/map.svg").then((response) => {
      if (!response.ok) {
        throw new Error(`Map could not be loaded: ${response.status}`);
      }

      return response.text();
    }),
  ]);

  const box = page.querySelector("#atlasSvg");
  box.innerHTML = svgText;

  const svg = box.querySelector("svg");

  if (!svg) {
    throw new Error("Map SVG is missing.");
  }

  svg.removeAttribute("width");
  svg.removeAttribute("height");
  svg.setAttribute("class", "h-full w-full");
  svg.querySelector("#label_points")?.remove();

  const wrap = page.querySelector(".atlas-wrap");
  const tip = page.querySelector("#atlasTip");
  const searchInput = page.querySelector("#monumentSearch");
  const clearSearch = page.querySelector("#clearSearch");
  const searchStatus = page.querySelector("#searchStatus");
  const groupsContainer = page.querySelector("#aimagGroups");

  groupsContainer.style.setProperty("scrollbar-width", "none", "important");

  const scrollbarStyle = document.createElement("style");
  scrollbarStyle.textContent = `
  #aimagGroups::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }
`;
  page.append(scrollbarStyle);

  const aimagById = new Map(aimags.map((aimag) => [aimag.id, aimag]));
  const monumentsByAimag = new Map();
  const pathsById = new Map();

  monuments.forEach((monument) => {
    if (!monumentsByAimag.has(monument.aimagId)) {
      monumentsByAimag.set(monument.aimagId, []);
    }

    monumentsByAimag.get(monument.aimagId).push(monument);
  });

  const normalize = (value) =>
    String(value ?? "")
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[-–—]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const multilingualText = (value) => (typeof value === "string" ? value : Object.values(value ?? {}).join(" "));

  const searchTextByMonument = new Map(
    monuments.map((monument) => {
      const aimag = aimagById.get(monument.aimagId);

      const text = normalize([multilingualText(monument.name), multilingualText(monument.sum), multilingualText(aimag?.name)].join(" "));

      return [monument, text];
    }),
  );

  const groupElements = new Map();
  let lastQuery = "";

  function selectAimag(aimagId) {
    svg.querySelectorAll(".aimag.is-selected").forEach((path) => {
      path.classList.remove("is-selected");
    });

    pathsById.get(aimagId)?.classList.add("is-selected");
  }

  function createMonumentButton(monument, aimag) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "atlas-monument";

    if (monument.image) {
      const image = document.createElement("img");
      image.src = monument.image;
      image.alt = "";
      image.loading = "lazy";

      image.addEventListener("error", () => image.remove(), {
        once: true,
      });

      button.append(image);
    }

    const info = document.createElement("span");

    const name = document.createElement("span");
    name.className = "atlas-monument-name";
    name.textContent = tr(monument.name);

    const location = document.createElement("span");
    location.className = "atlas-monument-location text-muted-foreground";
    location.textContent = tr(monument.sum);

    info.append(name, location);
    button.append(info);

    button.addEventListener("click", () => {
      selectAimag(aimag.id);
      openAimagModal(aimag, [monument]);
    });

    return button;
  }

  function renderGroups() {
    const query = normalize(searchInput.value);
    const words = query ? query.split(" ") : [];
    const previousOpen = new Set([...groupElements.entries()].filter(([, details]) => details.open).map(([id]) => id));

    groupsContainer.replaceChildren();
    groupElements.clear();

    const matchedAimagIds = new Set();
    let resultCount = 0;

    aimags.forEach((aimag) => {
      const allMonuments = monumentsByAimag.get(aimag.id) ?? [];

      const matches = allMonuments.filter((monument) => {
        const text = searchTextByMonument.get(monument) ?? "";
        return words.every((word) => text.includes(word));
      });

      // Мэдээлэлгүй аймгууд газрын зураг дээрээ үлдэнэ.
      if (!matches.length) return;

      resultCount += matches.length;
      matchedAimagIds.add(aimag.id);

      const details = document.createElement("details");
      details.className = "atlas-group";

      details.open = query ? query !== lastQuery || previousOpen.has(aimag.id) : !lastQuery && previousOpen.has(aimag.id);

      const summary = document.createElement("summary");

      const aimagName = document.createElement("span");
      aimagName.textContent = tr(aimag.name);

      const count = document.createElement("span");
      count.className = "atlas-group-count";
      count.textContent = `· ${matches.length}`;

      summary.append(aimagName, count);
      details.append(summary);

      details.addEventListener("toggle", () => {
        if (details.open) selectAimag(aimag.id);
      });

      matches.forEach((monument) => {
        details.append(createMonumentButton(monument, aimag));
      });

      groupElements.set(aimag.id, details);
      groupsContainer.append(details);
    });

    searchStatus.textContent = resultCount ? t("atlas.searchResults", { n: resultCount }) : t("atlas.searchEmpty");

    pathsById.forEach((path, aimagId) => {
      path.classList.toggle("search-match", Boolean(query) && matchedAimagIds.has(aimagId));
    });

    lastQuery = query;
  }

  svg.querySelectorAll("#features path").forEach((path) => {
    const aimag = aimagById.get(path.id);
    if (!aimag) return;

    pathsById.set(aimag.id, path);

    const aimagMonuments = monumentsByAimag.get(aimag.id) ?? [];
    const count = aimagMonuments.length;

    path.classList.add("aimag");

    if (count) {
      path.classList.add("has-data");
    }

    path.addEventListener("mousemove", (event) => {
      const rect = wrap.getBoundingClientRect();

      tip.textContent = t("atlas.tip", {
        name: tr(aimag.name),
        n: count,
      });

      tip.style.left = `${event.clientX - rect.left + 12}px`;
      tip.style.top = `${event.clientY - rect.top + 12}px`;
      tip.classList.remove("hidden");
    });

    path.addEventListener("mouseleave", () => {
      tip.classList.add("hidden");
    });

    path.addEventListener("click", () => {
      selectAimag(aimag.id);

      const group = groupElements.get(aimag.id);

      if (group) {
        group.open = true;
      }

      tip.classList.add("hidden");
      openAimagModal(aimag, aimagMonuments);
    });
  });

  searchInput.addEventListener("input", renderGroups);

  clearSearch.addEventListener("click", () => {
    searchInput.value = "";
    renderGroups();
    searchInput.focus();
  });

  renderGroups();
}
