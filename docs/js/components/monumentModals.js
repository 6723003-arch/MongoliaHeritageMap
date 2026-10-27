import { button, badge, card } from "../ui/shadcn.js";
import { t, tr } from "../i18n/i18n.js";

const placeholder = () =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">' +
      '<rect width="100%" height="100%" fill="#1b2548"/>' +
      '<text x="50%" y="50%" fill="#9aa6c7" font-size="22" text-anchor="middle" font-family="sans-serif">' +
      t("img.soon") +
      "</text></svg>",
  );

function esc(text) {
  const d = document.createElement("div");
  d.textContent = text;
  return d.innerHTML;
}

function createDialog({ title, desc = "", body, footer, size = "max-w-lg" }) {
  const overlay = document.createElement("div");
  overlay.className = "animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm";
  overlay.innerHTML = `
    <div class="flex max-h-[90vh] w-full ${size} flex-col rounded-xl border border-border bg-card text-card-foreground shadow-2xl" role="dialog" aria-modal="true">
      <div class="flex items-start justify-between border-b border-border p-5">
        <div>
          <h2 class="text-lg font-semibold">${title}</h2>
          ${desc ? `<p class="text-sm text-muted-foreground">${desc}</p>` : ""}
        </div>
        <button data-close class="${button("ghost", "icon")} -mr-2 -mt-2" aria-label="${t("dlg.close")}">✕</button>
      </div>
      <div class="flex-1 overflow-y-auto p-5">${body}</div>
      <div class="flex items-center gap-2 border-t border-border p-4">${footer}</div>
    </div>`;

  const close = () => {
    document.removeEventListener("keydown", onKey);
    overlay.remove();
  };
  const onKey = (e) => {
    if (e.key === "Escape") close();
  };

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  overlay.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", close));
  document.addEventListener("keydown", onKey);
  document.body.append(overlay);
  return { el: overlay, close };
}

export function openAimagModal(aimag, monuments) {
  const rows = monuments.length
    ? `<div class="space-y-2">${monuments
        .map(
          (m) => `
        <label class="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition hover:bg-accent">
          <input type="checkbox" value="${m.id}" class="h-4 w-4 accent-primary">
          <span class="text-sm font-medium">${esc(tr(m.name))}</span>
          <span class="ml-auto text-xs text-muted-foreground">${esc(tr(m.period))}</span>
        </label>`,
        )
        .join("")}</div>`
    : `<p class="text-sm text-muted-foreground">${t("dlg.empty")}</p>`;

  const { el, close } = createDialog({
    title: esc(tr(aimag.name)),
    desc: t("dlg.count", { n: monuments.length }),
    body: rows,
    footer: `
      <span class="${badge("secondary")}" id="selCount">${t("dlg.selected", { n: 0 })}</span>
      <div class="ml-auto flex gap-2">
        <button class="${button("ghost", "sm")}" data-clear>${t("dlg.clear")}</button>
        <button class="${button("outline", "sm")}" data-all>${t("dlg.all")}</button>
        <button class="${button("default", "sm")}" data-show>${t("dlg.show")}</button>
      </div>`,
  });

  const boxes = [...el.querySelectorAll("input[type=checkbox]")];
  const count = el.querySelector("#selCount");
  const update = () => {
    count.textContent = t("dlg.selected", { n: boxes.filter((b) => b.checked).length });
  };

  boxes.forEach((b) => b.addEventListener("change", update));
  el.querySelector("[data-clear]").addEventListener("click", () => {
    boxes.forEach((b) => (b.checked = false));
    update();
  });
  el.querySelector("[data-all]").addEventListener("click", () => {
    boxes.forEach((b) => (b.checked = true));
    update();
  });
  el.querySelector("[data-show]").addEventListener("click", () => {
    const ids = boxes.filter((b) => b.checked).map((b) => Number(b.value));
    if (!ids.length) return;
    close();
    openMonumentModal(
      aimag,
      monuments,
      monuments.filter((m) => ids.includes(m.id)),
    );
  });
}

export function openMonumentModal(aimag, allMonuments, selected) {
  const cards = selected
    .map(
      (m) => `
    <article class="${card} overflow-hidden">
      <img src="${esc(m.image)}" alt="${esc(tr(m.name))}" class="aspect-video w-full object-cover">
      <div class="space-y-3 p-4">
        <h3 class="font-semibold">${esc(tr(m.name))}</h3>
        <div class="flex flex-wrap gap-1.5">
          <span class="${badge("default")}">${esc(tr(m.period))}</span>
          <span class="${badge("secondary")}">${esc(t("cat." + m.category))}</span>
          <span class="${badge("outline")}">${esc(tr(m.sum))}</span>
        </div>
        <p class="text-sm text-muted-foreground">${esc(tr(m.short))}</p>
      </div>
    </article>`,
    )
    .join("");

  const { el, close } = createDialog({
    title: t("dlg.title", { name: esc(tr(aimag.name)) }),
    body: `<div class="grid gap-4 sm:grid-cols-2">${cards}</div>`,
    size: "max-w-3xl",
    footer: `
      <button class="${button("ghost", "sm")}" data-back>${t("dlg.back")}</button>
      <button class="${button("outline", "sm")} ml-auto" data-close>${t("dlg.close")}</button>`,
  });

  el.querySelectorAll("img").forEach((img) =>
    img.addEventListener(
      "error",
      () => {
        img.src = placeholder();
      },
      { once: true },
    ),
  );

  el.querySelector("[data-back]").addEventListener("click", () => {
    close();
    openAimagModal(aimag, allMonuments);
  });
}
