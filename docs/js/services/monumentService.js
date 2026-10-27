let aimagCache = null;
let monumentCache = null;

const load = async (url) => (await fetch(url)).json();

export const getAimags = async () => (aimagCache ??= await load("data/aimags.json"));
export const getMonuments = async () => (monumentCache ??= await load("data/monuments.json"));
