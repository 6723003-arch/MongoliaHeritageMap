import { landingPage } from "./pages/landingPage.js";
import { atlasPage } from "./pages/atlasPage.js";
import { notFoundPage } from "./pages/notFoundPage.js";

export const routes = {
  "/": { page: landingPage, guestOnly: true },
  "/atlas": { page: atlasPage, auth: true },
  "*": { page: notFoundPage },
};
