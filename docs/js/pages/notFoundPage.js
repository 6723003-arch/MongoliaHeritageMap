export function notFoundPage(root) {
  root.innerHTML = `
    <section class="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 class="text-6xl font-bold">404</h1>
      <a href="#/" class="mt-6 inline-block text-primary underline">← Home</a>
    </section>`;
}
