let pathPromise = null;

// img/map.svg доторх бүх аймгийн контурыг нэг дүрс болгож авна
function loadPath() {
  pathPromise ??= fetch("img/map.svg")
    .then((r) => r.text())
    .then((text) => {
      const doc = new DOMParser().parseFromString(text, "text/html");
      return [...doc.querySelectorAll("#features path")].map((p) => p.getAttribute("d")).join(" ");
    })
    .catch(() => "");
  return pathPromise;
}

export const markSvg = (cls = "") =>
  `<svg data-mn-mark class="${cls}" viewBox="0 0 1000 481" fill="currentColor" stroke="currentColor" stroke-linejoin="round" aria-hidden="true"></svg>`;

export async function fillMarks(root) {
  const d = await loadPath();
  if (!d) return;
  root.querySelectorAll("[data-mn-mark]").forEach((svg) => {
    svg.innerHTML = `<path d="${d}"/>`;
  });
}
