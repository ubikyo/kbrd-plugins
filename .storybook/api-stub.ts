/**
 * KBRD-API, as far as a story is concerned.
 *
 * Several editors here fetch their own options rather than being handed
 * them (`Typography` and `render-key-symbol` want the installed fonts,
 * `invoke-layout`/`invoke-layer` the layouts and layers, `invoke-*` the
 * applications and browsers). Storybook has no KBRD-API behind it, so
 * every one of those would render its own error state and nothing else —
 * a story of the failure path, not of the control.
 *
 * So `fetch` is patched, once, for the handful of paths those editors
 * ask for. Everything else falls through to the real `fetch` untouched.
 *
 * Uploads (`POST /api/media`, from `render-image`/`render-video`) answer
 * with a plausible filename without storing anything — enough for the
 * editor to move on to showing what was picked.
 */

// Shaped as KBRD-API shapes them: `family` and `style` read off each
// file's own `name` table, which is what `Typography`'s two-field picker
// groups by. A family of three so the Style field has something to
// choose from, one of two, and one that names no style at all — the case
// the field shows as "Regular". In the API's order: family by family,
// each one light to heavy.
const FONTS = [
  {
    value: "Inter_18pt-Regular.ttf",
    label: "Inter 18pt",
    family: "Inter 18pt",
    style: "Regular",
  },
  {
    value: "Inter_18pt-SemiBold.ttf",
    label: "Inter 18pt SemiBold",
    family: "Inter 18pt",
    style: "SemiBold",
  },
  {
    value: "Inter_18pt-Bold.ttf",
    label: "Inter 18pt Bold",
    family: "Inter 18pt",
    style: "Bold",
  },
  { value: "Jaro.ttf", label: "Jaro", family: "Jaro", style: "" },
  {
    value: "JetBrainsMono-Regular.ttf",
    label: "JetBrains Mono",
    family: "JetBrains Mono",
    style: "Regular",
  },
  {
    value: "JetBrainsMono-Bold.ttf",
    label: "JetBrains Mono Bold",
    family: "JetBrains Mono",
    style: "Bold",
  },
];

const LAYOUTS = [
  { id: 1, name: "Default", active: true },
  { id: 2, name: "Photoshop", active: false },
];

const LAYERS = [
  { id: 1, layout_id: 1, name: "Base", active: true },
  { id: 2, layout_id: 1, name: "Fn", active: false },
  { id: 3, layout_id: 2, name: "Tools", active: false },
];

const APPLICATIONS = [
  { id: "firefox", name: "Firefox", canQuit: true },
  { id: "code", name: "Visual Studio Code", canQuit: true },
  { id: "gimp", name: "GIMP", canQuit: false },
];

// `isDefault` marks whichever one the machine itself opens a link with —
// see `defaultBrowserID` in kbrd-agent. Safari here, the answer a Mac
// gives until it's told otherwise.
const BROWSERS = [
  { id: "firefox", name: "Firefox", isDefault: false },
  { id: "chromium", name: "Chromium", isDefault: false },
  { id: "safari", name: "Safari", isDefault: true },
];

// Keyed by pathname alone: no story sends a query string, and matching on
// the whole URL would mean spelling out an origin Storybook picks itself.
const ROUTES: Record<string, unknown> = {
  "/api/fonts": FONTS,
  "/api/layout": LAYOUTS,
  "/api/layer": LAYERS,
  "/api/applications": APPLICATIONS,
  "/api/browsers": BROWSERS,
};

function pathOf(input: RequestInfo | URL) {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;
  // A relative path ("/api/fonts") needs a base to parse against; which
  // origin doesn't matter, only the pathname is ever read back.
  return new URL(url, window.location.origin).pathname;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export function installApiStub() {
  const real = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    const path = pathOf(input);

    if (path === "/api/media" && init?.method === "POST") {
      // `201`, like the real route — `render-image` only checks `ok`,
      // but a stub that answers something the API never would is a trap
      // for the next person reading it.
      return json({ filename: "storybook-upload.png" }, 201);
    }

    if (path in ROUTES) return json(ROUTES[path]);

    return real(input, init);
  };
}
