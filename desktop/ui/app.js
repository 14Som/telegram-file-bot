"use strict";

/* ------------------------------------------------------------------ icons */
const SVG = {
  refresh: '<path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/>',
  upload: '<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 20h16"/>',
  more: '<circle cx="5" cy="12" r="1.7" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.7" fill="currentColor" stroke="none"/>',
  home: '<path d="m3 10 9-7 9 7"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z"/>',
  starFilled: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z" fill="currentColor"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  folderOpen: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1H3z"/><path d="M3 10h18l-2 9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  forward: '<path d="M9 18l6-6-6-6"/>',
  up: '<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  download: '<path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M4 20h16"/>',
  play: '<path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>',
  lock: '<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  backspace: '<path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/><path d="m12 9 6 6M18 9l-6 6"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-4-4L7 21"/>',
  video: '<rect x="2" y="5" width="14" height="14" rx="2"/><path d="m22 8-6 4 6 4z"/>',
  audio: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  document: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/>',
  sticker: '<circle cx="12" cy="12" r="9"/><path d="M8.5 10h.01M15.5 10h.01"/><path d="M8 14c1 1.6 2.3 2.4 4 2.4s3-.8 4-2.4"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  trash: '<path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13"/><path d="M9 7V4h6v3"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  move: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 11v5"/><path d="m9.5 13.5 2.5 2.5 2.5-2.5"/>',
  tag: '<path d="M20 13 13 20l-9-9V4h7z"/><circle cx="8" cy="8" r="1.5"/>',
  link: '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7L12.5 19"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  alert: '<path d="M12 9v5"/><path d="M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',
  sortAsc: '<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',
  sortDesc: '<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
  eyeOff: '<path d="m3 3 18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.4 5.2A10.5 10.5 0 0 1 12 5c5 0 8.6 4.4 9.7 6.2a1.8 1.8 0 0 1 0 1.6 17 17 0 0 1-2.2 2.9"/><path d="M6.2 6.2A16.6 16.6 0 0 0 2.3 11.2a1.8 1.8 0 0 0 0 1.6C3.4 14.6 7 19 12 19a10.5 10.5 0 0 0 4.1-.8"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  filter: '<path d="M3 5h18l-7 8.2V20l-4-2v-4.8z"/>',
  note: '<path d="M4 4h10l6 6v10H4z"/><path d="M14 4v6h6"/><path d="M8 13h8M8 17h5"/>',
  archive: '<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v12h14V8"/><path d="M10 12h4"/>',
  folderPlus: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 11v5M9.5 13.5h5"/>',
  palette: '<circle cx="12" cy="12" r="9"/><circle cx="8" cy="10" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="8" r="1.2" fill="currentColor" stroke="none"/><circle cx="16" cy="10" r="1.2" fill="currentColor" stroke="none"/><path d="M12 21a3 3 0 0 1 0-6c1 0 1.5-.5 1.5-1.5"/>',
  uploadFolder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 16v-6"/><path d="m9 12 3-3 3 3"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  foldCompact: '<path d="m7 20 5-5 5 5"/><path d="m7 4 5 5 5-5"/>',
  foldExpand: '<path d="m7 9 5-5 5 5"/><path d="m7 15 5 5 5-5"/>'
};

const LOGO = '<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="15" fill="#229ED9"/><path d="M50.5 15.2 13.8 29.4c-1.5.6-1.4 2.6.1 3.1l9.2 2.9 3.5 10.9c.4 1.3 2.1 1.6 3 .5l5.3-5.9 9.4 6.9c1.1.8 2.7.2 3-1.2l5.1-24.8c.3-1.4-1-2.4-2.9-2.6zM24 35.6l20.6-13.4-16.5 16.3-.6 5.9z" fill="#fff"/><path d="m24 35.6 20.6-13.4-16.5 16.3-.6 5.9-1.2-4.2z" fill="#d8efff"/></svg>';

const FILE_GLYPHS = {
  image: "image",
  video: "play",
  audio: "audio",
  voice: "audio",
  document: "document",
  sticker: "sticker",
  gif: "play",
  other: "file"
};

function svgRaw(name, extra) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra || ""}>${SVG[name] || ""}</svg>`;
}
function setIcon(node, name) {
  if (node) node.innerHTML = svgRaw(name);
}
function fileIcon(kind) {
  return h("span", { class: "ficon " + (kind || "other"), html: svgRaw(FILE_GLYPHS[kind] || "file") });
}

/* ---------------------------------------------------------------- helpers */
const $ = (id) => document.getElementById(id);
let fieldSeq = 0;

function h(tag, props, ...children) {
  const node = document.createElement(tag);
  const options = props || {};
  for (const [key, value] of Object.entries(options)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key === "html") node.innerHTML = value;
    else if (key === "value") node.value = value;
    else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (["checked", "disabled", "selected", "hidden", "multiple", "autofocus"].includes(key)) {
      if (value) node.setAttribute(key, "");
    } else {
      node.setAttribute(key, String(value));
    }
  }
  appendChildren(node, children);
  return node;
}
function appendChildren(node, children) {
  for (const child of children.flat(Infinity)) {
    if (child === undefined || child === null || child === false) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
}
function iconNode(name, cls) {
  return h("span", { class: cls || "", html: svgRaw(name) });
}
function externalLink(href, text) {
  return h("a", { href, target: "_blank", rel: "noopener noreferrer", text });
}
function field(labelText, input, hint) {
  const id = input.id || `field-${++fieldSeq}`;
  input.id = id;
  const wrap = h("div", { class: "field" }, h("label", { for: id, text: labelText }), input);
  if (hint) wrap.append(h("div", { class: "hint", text: hint }));
  return wrap;
}
function inputEl(options) {
  const node = h("input");
  for (const [key, value] of Object.entries(options || {})) {
    if (key === "value") node.value = value;
    else node.setAttribute(key, String(value));
  }
  return node;
}
function btn(label, cls, onClick, type) {
  const node = h("button", { class: cls || "btn", type: type || "button" }, label);
  if (onClick) node.addEventListener("click", onClick);
  return node;
}
function fmtSize(bytes) {
  if (bytes === null || bytes === undefined) return "—";
  const value = Number(bytes);
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = value;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  const digits = index === 0 ? 0 : size >= 100 ? 0 : size >= 10 ? 1 : 2;
  return `${size.toFixed(digits)} ${units[index]}`;
}
const dateFmt = new Intl.DateTimeFormat(undefined, {
  year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit"
});
const shortDateFmt = new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "2-digit" });
function fmtDate(iso, short) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return (short ? shortDateFmt : dateFmt).format(date);
}
function fmtDuration(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}` : `${minutes}:${String(secs).padStart(2, "0")}`;
}
function plural(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}
function initials(text) {
  const parts = (text || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join("");
}
function debounce(fn, wait) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}
function toast(message, kind, duration) {
  const root = $("toastRoot");
  if (!root || !message) return;
  const marks = { success: "✓", error: "!", info: "i" };
  const node = h("div", { class: `toast ${kind || "info"}`, role: "status" },
    h("span", { class: "toast-mark", text: marks[kind] || marks.info }),
    h("span", { class: "toast-text", text: message })
  );
  root.append(node);
  const timer = setTimeout(
    () => node.remove(),
    duration || (kind === "error" ? 6000 : 3500)
  );
  node.addEventListener("click", () => {
    clearTimeout(timer);
    node.remove();
  });
}
function isEditableTarget(target) {
  if (!target) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

/* ------------------------------------------------------------------ state */
const PREFS_COOKIE = "tfe_prefs";
const THEME_VALUES = ["system", "light", "dark", "mica", "acrylic"];
const SORT_VALUES = ["date", "name", "size", "kind", "folder", "added"];

function loadPrefs() {
  try {
    const match = document.cookie.match(/(?:^|;\s*)tfe_prefs=([^;]+)/);
    const saved = match ? JSON.parse(decodeURIComponent(match[1])) : {};
    return saved && typeof saved === "object" ? saved : {};
  } catch (_) {
    return {};
  }
}
function savePrefs(patch) {
  try {
    const next = { ...loadPrefs(), ...patch };
    document.cookie = `${PREFS_COOKIE}=${encodeURIComponent(JSON.stringify(next))}; path=/; max-age=31536000; SameSite=Lax`;
  } catch (_) {
    /* preferences are best-effort */
  }
}
function filterStateFrom(saved) {
  const data = saved && typeof saved === "object" ? saved : {};
  return {
    min: typeof data.min === "string" ? data.min : "",
    max: typeof data.max === "string" ? data.max : "",
    after: typeof data.after === "string" ? data.after : "",
    before: typeof data.before === "string" ? data.before : "",
    note: Boolean(data.note),
    recursive: Boolean(data.recursive)
  };
}
function loadFilterState() {
  try {
    if (SAVED_PREFS.filters) return filterStateFrom(SAVED_PREFS.filters);
    return filterStateFrom(JSON.parse(localStorage.getItem("tfe_filters") || "{}"));
  } catch (_) {
    return filterStateFrom({});
  }
}
const SAVED_PREFS = loadPrefs();

const S = {
  status: null,
  authStage: "",
  authBusy: false,
  loginForced: false,
  lastPhone: "",
  loginMode: "qr",
  qr: { active: false, starting: false, timer: null, version: 0, image: "", error: "", seq: 0 },
  passwordHint: "",
  channels: [],
  channelQuery: "",
  selectedChannel: null,
  nav: { folders: [], tags: [], kinds: [], stats: { count: 0, size: 0, favorites: 0, last_sync: null } },
  items: [],
  total: 0,
  totalSize: 0,
  loading: false,
  itemsPending: false,
  loadSeq: 0,
  navMode: "all",
  folder: "",
  tag: "",
  kind: "",
  favorite: false,
  hiddenOnly: false,
  renderedStage: "",
  q: "",
  filters: loadFilterState(),
  theme: THEME_VALUES.includes(SAVED_PREFS.theme) ? SAVED_PREFS.theme : (localStorage.getItem("tfe_theme") || "system"),
  sort: SORT_VALUES.includes(SAVED_PREFS.sort) ? SAVED_PREFS.sort : (localStorage.getItem("tfe_sort") || "date"),
  dir: SAVED_PREFS.dir === "asc" || SAVED_PREFS.dir === "desc" ? SAVED_PREFS.dir : (localStorage.getItem("tfe_dir") || "desc"),
  view: SAVED_PREFS.view === "tiles" || SAVED_PREFS.view === "details" ? SAVED_PREFS.view : (localStorage.getItem("tfe_view") || "details"),
  selectedId: null,
  selectedFolderPath: null,
  selection: new Set(),
  selectionAnchor: null,
  history: [],
  histIndex: -1,
  syncTimer: null,
  syncFinalHandled: null,
  transferTimer: null,
  transfers: [],
  localUpload: null,
  seenTransfers: new Set(),
  refreshTimer: null,
  previewToken: 0,
  channelsTimer: null
};

/* -------------------------------------------------------------------- api */
async function api(path, options) {
  const opts = options || {};
  const init = { method: opts.method || "GET", credentials: "same-origin", headers: {} };
  if (init.method !== "GET") init.headers["X-TFE"] = "1";
  if (opts.body !== undefined) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(opts.body);
  }
  if (opts.form) init.body = opts.form;
  const response = await fetch(path, init);
  let data = null;
  try { data = await response.json(); } catch (_) { data = null; }
  if (!response.ok) {
    const message = (data && data.detail) || `Request failed (${response.status})`;
    const error = new Error(typeof message === "string" ? message : "Request failed");
    error.status = response.status;
    if (response.status === 403 && String(message).includes("authenticated")) {
      reloadForFreshSession();
    }
    throw error;
  }
  return data;
}

function reloadForFreshSession() {
  try {
    const now = Date.now();
    let entry = JSON.parse(sessionStorage.getItem("tfe_auth_reload") || "null");
    if (!entry || now - entry.ts > 10000) entry = { n: 0, ts: now };
    if (entry.n >= 2) return;
    entry.n += 1;
    sessionStorage.setItem("tfe_auth_reload", JSON.stringify(entry));
    location.reload();
  } catch (_) {
    location.reload();
  }
}

function ready() {
  return Boolean(S.status && S.status.authorized && S.status.vault);
}

/* ---------------------------------------------------------- folders/filters */
function folderEntry(path) {
  const lower = String(path || "").toLowerCase();
  return (S.nav.folders || []).find((entry) => entry.folder.toLowerCase() === lower) || null;
}
function folderIconNode(entry, cls) {
  const className = cls || "folder-ico";
  if (entry && entry.icon) return h("span", { class: `${className} emoji`, text: entry.icon, "aria-hidden": "true" });
  return h("span", { class: className, html: svgRaw("folder") });
}
function activeFilterCount() {
  let count = 0;
  for (const key of ["min", "max", "after", "before"]) {
    if (S.filters[key]) count += 1;
  }
  if (S.filters.note) count += 1;
  if (S.filters.recursive && S.folder) count += 1;
  return count;
}
function isFiltering() {
  return Boolean(
    S.tag || S.kind || S.q ||
    S.filters.min || S.filters.max || S.filters.after || S.filters.before || S.filters.note
  );
}
function updateFilterBadge() {
  const badge = $("filterBadge");
  if (!badge) return;
  const count = activeFilterCount();
  badge.hidden = count === 0;
  badge.textContent = String(count);
  $("filterBtn").classList.toggle("active", count > 0);
  $("filterBtn").title = count ? `${plural(count, "filter")} active` : "Advanced filters";
}
function visibleSubfolders() {
  if (isFiltering()) return [];
  if (S.folder) {
    const parent = S.folder.toLowerCase();
    return (S.nav.folders || []).filter((entry) => (entry.parent || "").toLowerCase() === parent);
  }
  if (S.navMode === "all") {
    return (S.nav.folders || []).filter((entry) => !entry.parent);
  }
  return [];
}
function openFolder(path) {
  navigateScope({ navMode: "all", folder: path, kind: "", tag: "", q: "" });
}

/* ------------------------------------------------------------------ boot */
const THEME_OPTIONS = [
  { value: "system", label: "System", note: "Follow Windows", swatch: "system" },
  { value: "light", label: "Light", note: "Bright surfaces", swatch: "light" },
  { value: "dark", label: "Dark", note: "Dim surfaces", swatch: "dark" },
  { value: "mica", label: "Mica", note: "Windows 11 tint", swatch: "mica" },
  { value: "acrylic", label: "Acrylic", note: "Translucent glass", swatch: "acrylic" }
];

function applyTheme(theme) {
  S.theme = theme || "system";
  if (S.theme === "system") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = S.theme;
  localStorage.setItem("tfe_theme", S.theme);
  savePrefs({ theme: S.theme });
}
function themeGrid() {
  const grid = h("div", { class: "theme-grid" });
  const render = () => {
    grid.replaceChildren();
    for (const option of THEME_OPTIONS) {
      const active = S.theme === option.value;
      const card = h("button", {
        class: "theme-card" + (active ? " active" : ""),
        type: "button",
        title: option.note,
        "aria-pressed": active ? "true" : "false"
      },
        h("span", { class: `theme-swatch ${option.swatch}`, "aria-hidden": "true" },
          h("span", { class: "theme-swatch-side" }),
          h("span", { class: "theme-swatch-main" })
        ),
        h("span", { class: "theme-card-text" },
          h("strong", { text: option.label }),
          h("small", { text: option.note })
        )
      );
      card.addEventListener("click", () => {
        applyTheme(option.value);
        render();
      });
      grid.append(card);
    }
  };
  render();
  return grid;
}

function init() {
  applyTheme(S.theme);
  $("brandLogo").innerHTML = LOGO;
  $("loginLogo").innerHTML = LOGO;
  document.querySelectorAll("[data-icon]").forEach((node) => setIcon(node, node.dataset.icon));
  setIcon($("uploadIcon"), "upload");
  setIcon($("uploadFilesIcon"), "upload");
  setIcon($("uploadFolderIcon"), "uploadFolder");
  setIcon($("filterIcon"), "filter");
  setIcon($("syncBtn"), "refresh");
  setIcon($("moreBtn"), "more");
  setIcon($("lockBtn"), "lock");
  $("lockLogo").innerHTML = LOGO;
  buildLockPad();
  setIcon($("backBtn"), "back");
  setIcon($("forwardBtn"), "forward");
  setIcon($("upBtn"), "up");
  document.querySelector(".search-icon").innerHTML = svgRaw("search");
  $("sortDirBtn").innerHTML = svgRaw(S.dir === "asc" ? "sortAsc" : "sortDesc");
  $("uploadsClose").innerHTML = svgRaw("close");
  $("viewerClose").innerHTML = svgRaw("close");
  $("viewerDownload").innerHTML = svgRaw("download");
  document.querySelector('[data-view="details"]').innerHTML = svgRaw("list");
  document.querySelector('[data-view="tiles"]').innerHTML = svgRaw("grid");
  document.querySelector(".preview-empty-icon").innerHTML = svgRaw("file");
  document.querySelector(".empty-icon").innerHTML = svgRaw("folderOpen");
  document.querySelector(".drop-icon").innerHTML = svgRaw("upload");
  document.querySelectorAll(".view-toggle button").forEach((node) => {
    node.classList.toggle("active", node.dataset.view === S.view);
  });
  bindEvents();
  updateViewButtons();
  boot();
}

async function boot() {
  try {
    S.status = await api("/api/status");
  } catch (error) {
    showLoginFatal(error.message);
    return;
  }
  updateChrome();
  if (S.status.locked) {
    showLock();
  } else {
    await enterUnlocked();
    if (ready()) maybePromptPinSetup();
  }
  setInterval(periodicStatus, 20000);
  window.addEventListener("online", () => { updateChrome(); if (ready() && !S.status.locked) refreshLibrary(false); });
  window.addEventListener("offline", updateChrome);
}

async function enterUnlocked() {
  if (ready()) {
    hideLogin();
    await refreshLibrary(true);
    resetHistory();
    if (S.status.sync && S.status.sync.running) pollSync();
    if (!S.status.sync || !S.status.sync.running) {
      if ((S.nav.stats.count || 0) === 0) {
        setTimeout(() => startSync(true), 500);
      }
    }
    fetchTransfers(true);
  } else {
    renderLogin();
    showLogin();
  }
}

async function periodicStatus() {
  try {
    S.status = await api("/api/status");
    updateChrome();
    if (S.status.locked) {
      if ($("lockOverlay").hidden) showLock();
      return;
    }
    if (!ready()) {
      if ($("loginOverlay").hidden) {
        renderLogin();
        showLogin();
      } else if (!S.authStage && S.renderedStage !== loginStage()) {
        // Only swap stages on real changes; never wipe a half-typed form.
        renderLogin();
      }
    } else if (S.loginForced === false) {
      hideLogin();
    }
    if (S.status.sync && S.status.sync.running && !S.syncTimer) pollSync();
  } catch (_) {
    /* transient; next tick retries */
  }
}

/* --------------------------------------------------------------- chrome */
function updateChrome() {
  const st = S.status;
  const dot = $("connDot");
  const text = $("connText");
  const chip = $("vaultChip");
  dot.className = "conn-dot";
  if (!navigator.onLine) {
    dot.classList.add("bad");
    text.textContent = "No internet";
  } else if (!st) {
    dot.classList.add("bad");
    text.textContent = "Offline";
  } else if (st.state === "error" && !st.authorized) {
    dot.classList.add("bad");
    text.textContent = "Connection problem";
  } else if (!st.has_api && !st.quick_api) {
    dot.classList.add("warn");
    text.textContent = "Setup needed";
  } else if (!st.authorized) {
    dot.classList.add("warn");
    text.textContent = "Sign-in needed";
  } else if (!st.vault) {
    dot.classList.add("warn");
    text.textContent = "Choose a channel";
  } else {
    dot.classList.add("ok");
    text.textContent = st.sync && st.sync.running ? "Syncing…" : "Connected";
  }
  if (st && st.vault) {
    chip.hidden = false;
    chip.textContent = st.vault.title || String(st.vault.id);
    chip.title = `Storage channel: ${st.vault.title || st.vault.id}`;
  } else {
    chip.hidden = true;
  }
  updateBotChip(st);
  const lockBtn = $("lockBtn");
  lockBtn.hidden = !(st && st.pin_set);
  lockBtn.title = st && st.locked ? "Locked" : "Lock the app";
  const isReady = ready() && !(st && st.locked);
  $("syncBtn").disabled = !isReady || (st && st.sync && st.sync.running);
  $("uploadBtn").disabled = !isReady;
  $("uploadCaret").disabled = !isReady;
  $("uploadFilesOption").disabled = !isReady;
  $("uploadFolderOption").disabled = !isReady;
  $("filterBtn").disabled = !isReady;
  if (!isReady) $("uploadMenu").hidden = true;
  if (st && st.sync && st.sync.running) $("syncBtn").classList.add("spinning");
  else $("syncBtn").classList.remove("spinning");
  document.title = st && st.vault && st.vault.title
    ? `${st.vault.title} — Telegram File Explorer`
    : "Telegram File Explorer";
}

function updateBotChip(st) {
  const bot = st && st.bot;
  const chipEl = $("botChip");
  if (!bot || !bot.available) {
    chipEl.hidden = true;
    return;
  }
  chipEl.hidden = false;
  const dot = $("botDot");
  const text = $("botText");
  dot.className = "conn-dot";
  if (bot.running) {
    dot.classList.add("ok");
    text.textContent = "Bot";
    chipEl.title = "Storage bot running"
      + (bot.pid ? ` (process ${bot.pid})` : "")
      + ". It answers your commands in Telegram. Click to stop it.";
  } else if (bot.enabled) {
    dot.classList.add("warn");
    text.textContent = "Bot starting…";
    chipEl.title = "The storage bot is starting. Click to stop it.";
  } else {
    text.textContent = "Bot off";
    chipEl.title = "The storage bot is stopped, so Telegram commands are paused. Click to start it.";
  }
}

async function toggleBot() {
  const bot = S.status && S.status.bot;
  if (!bot || !bot.available || $("botChip").disabled) return;
  $("botChip").disabled = true;
  const stopping = bot.running;
  if (!stopping) {
    S.status = { ...S.status, bot: { ...bot, running: false, enabled: true } };
    updateChrome();
  }
  try {
    const result = await api(stopping ? "/api/bot/stop" : "/api/bot/start", { method: "POST" });
    S.status = { ...S.status, bot: result.bot };
    updateChrome();
    toast(stopping ? "Storage bot stopped. Telegram commands are paused."
      : "Storage bot is running. Telegram commands are live.", "success");
  } catch (error) {
    toast(error.message, "error");
    updateChrome();
  } finally {
    $("botChip").disabled = false;
  }
}

/* ----------------------------------------------------------------- app lock */
let pinBuffer = "";

function showLock() {
  pinBuffer = "";
  renderLockDots();
  $("lockError").hidden = true;
  $("lockOverlay").hidden = false;
  hideLogin();
  closeModal();
}

function hideLock() {
  $("lockOverlay").hidden = true;
}

function renderLockDots() {
  const dots = $("lockDots").children;
  for (let index = 0; index < dots.length; index += 1) {
    dots[index].classList.toggle("filled", index < pinBuffer.length);
  }
}

function buildLockPad() {
  const pad = $("lockPad");
  pad.replaceChildren();
  for (const key of ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"]) {
    const button = h("button", { class: "lock-key", type: "button" });
    if (key === "clear") {
      button.classList.add("utility");
      button.textContent = "C";
      button.title = "Clear";
    } else if (key === "back") {
      button.classList.add("utility");
      button.innerHTML = svgRaw("backspace");
      button.title = "Backspace";
      button.setAttribute("aria-label", "Backspace");
    } else {
      button.textContent = key;
    }
    button.addEventListener("click", () => pressLockKey(key));
    pad.append(button);
  }
}

function pressLockKey(key) {
  if ($("lockOverlay").hidden) return;
  if (key === "clear") pinBuffer = "";
  else if (key === "back") pinBuffer = pinBuffer.slice(0, -1);
  else if (pinBuffer.length < 4) pinBuffer += key;
  renderLockDots();
  $("lockError").hidden = true;
  if (pinBuffer.length === 4) setTimeout(submitPin, 120);
}

async function submitPin() {
  if (pinBuffer.length !== 4 || $("lockOverlay").hidden) return;
  const pin = pinBuffer;
  try {
    await api("/api/unlock", { method: "POST", body: { pin } });
    pinBuffer = "";
    renderLockDots();
    S.status.locked = false;
    hideLock();
    updateChrome();
    await enterUnlocked();
  } catch (error) {
    pinBuffer = "";
    renderLockDots();
    const box = $("lockError");
    box.textContent = error.message || "Wrong PIN.";
    box.hidden = false;
    const card = $("lockCard");
    card.classList.remove("shake");
    void card.offsetWidth;
    card.classList.add("shake");
  }
}

async function lockNow() {
  const st = S.status || {};
  if (!st.pin_set) {
    promptPinSetup();
    return;
  }
  try {
    await api("/api/lock", { method: "POST" });
    S.status.locked = true;
    showLock();
  } catch (error) {
    toast(error.message, "error");
  }
}

function pinInput(placeholder) {
  const input = inputEl({ type: "password", inputmode: "numeric", maxlength: "4", autocomplete: "new-password", placeholder: placeholder || "4 digits" });
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(0, 4);
  });
  return input;
}

function pinValuesMatch(pin, again) {
  if (!/^\d{4}$/.test(pin.value)) { toast("The PIN must be exactly 4 digits.", "error"); return false; }
  if (pin.value !== again.value) { toast("The PINs do not match.", "error"); return false; }
  return true;
}

function promptPinSetup() {
  const pin = pinInput();
  const again = pinInput("Repeat");
  openModal({
    title: "Create a 4-digit PIN",
    content: h("div", {},
      h("p", { text: "Lock this app with a 4-digit PIN. You will enter it every time the app opens." }),
      field("PIN", pin),
      field("Repeat PIN", again),
      h("p", { class: "modal-note", text: "Only a hash of the PIN is stored. If you forget it, remove the pin_hash and pin_salt lines from %APPDATA%\\TelegramFileExplorer\\settings.json." })
    ),
    actions: [
      {
        label: "Skip for now",
        onClick: async () => {
          try { await api("/api/pin/skip", { method: "POST" }); } catch (_) { /* non-fatal */ }
          if (S.status) S.status.pin_skipped = true;
          closeModal();
        }
      },
      {
        label: "Set PIN",
        class: "primary",
        onClick: async () => {
          if (!pinValuesMatch(pin, again)) return;
          try {
            await api("/api/pin/set", { method: "POST", body: { pin: pin.value } });
            if (S.status) { S.status.pin_set = true; S.status.pin_skipped = false; }
            updateChrome();
            toast("PIN set. The app will lock on the next launch.", "success", 6000);
            closeModal();
          } catch (error) {
            toast(error.message, "error");
          }
        }
      }
    ]
  });
}

function promptPinChange() {
  const pin = pinInput();
  const again = pinInput("Repeat");
  openModal({
    title: "Change PIN",
    content: h("div", {},
      field("New PIN", pin),
      field("Repeat new PIN", again)
    ),
    actions: [
      { label: "Cancel", onClick: closeModal },
      {
        label: "Change PIN",
        class: "primary",
        onClick: async () => {
          if (!pinValuesMatch(pin, again)) return;
          try {
            await api("/api/pin/set", { method: "POST", body: { pin: pin.value } });
            toast("PIN changed.", "success");
            closeModal();
          } catch (error) {
            toast(error.message, "error");
          }
        }
      }
    ]
  });
}

function promptPinRemove() {
  const pin = pinInput("Current PIN");
  openModal({
    title: "Remove PIN?",
    content: h("div", {},
      field("Current PIN", pin),
      h("p", { class: "modal-note", text: "The app will open without a lock again." })
    ),
    actions: [
      { label: "Cancel", onClick: closeModal },
      {
        label: "Remove PIN",
        class: "danger",
        onClick: async () => {
          try {
            await api("/api/pin/remove", { method: "POST", body: { pin: pin.value } });
            if (S.status) S.status.pin_set = false;
            updateChrome();
            toast("PIN removed.", "success");
            closeModal();
          } catch (error) {
            toast(error.message, "error");
          }
        }
      }
    ]
  });
}

function maybePromptPinSetup() {
  const st = S.status || {};
  if (st.pin_set || st.pin_skipped) return;
  promptPinSetup();
}

/* ---------------------------------------------------------------- login */
function showLogin() {
  $("loginOverlay").hidden = false;
  renderLogin();
}
function hideLogin() {
  $("loginOverlay").hidden = true;
  S.loginForced = false;
  S.renderedStage = "ready";
}
function showLoginFatal(message) {
  S.status = null;
  S.renderedStage = "loading";
  $("loginOverlay").hidden = false;
  $("loginSteps").replaceChildren();
  $("loginContent").replaceChildren(
    h("h2", { text: "The app could not start" }),
    h("p", { class: "login-desc", text: message || "The local server is not responding." }),
    h("div", { class: "login-loading" }, h("div", { class: "spinner" }), "Waiting for the server…")
  );
  $("loginError").hidden = true;
  setTimeout(() => boot(), 2500);
}
function loginStage() {
  const st = S.status;
  if (!st) return "loading";
  if (S.authStage === "setup") return "setup";
  if (S.authStage === "code") return "code";
  if (S.authStage === "password") return "password";
  if (S.authStage === "channel") return "channel";
  if (S.authStage === "error") return "error";
  if (st.state === "error" && !st.authorized) return "error";
  if (!st.has_api && !st.quick_api) return "setup";
  if (!st.authorized) return "login";
  if (!st.vault) return "channel";
  return "ready";
}
function stopQrClient(cancelServer) {
  S.qr.seq += 1;
  S.qr.active = false;
  S.qr.starting = false;
  if (S.qr.timer) {
    clearTimeout(S.qr.timer);
    S.qr.timer = null;
  }
  if (cancelServer) {
    api("/api/login/qr/cancel", { method: "POST" }).catch(() => {});
  }
}
function renderLogin() {
  if (!S.status) return;
  const stage = loginStage();
  S.renderedStage = stage;
  if (stage !== "login" || S.loginMode !== "qr") stopQrClient(true);
  if (stage === "ready") {
    hideLogin();
    return;
  }
  renderLoginSteps(stage);
  $("loginError").hidden = true;
  const content = $("loginContent");
  content.replaceChildren();
  if (stage === "loading") {
    content.append(h("div", { class: "login-loading" }, h("div", { class: "spinner" }), "Connecting to the local app…"));
    return;
  }
  if (stage === "setup") renderSetupStage(content);
  else if (stage === "login" && S.loginMode === "qr") renderQrStage(content);
  else if (stage === "login") renderPhoneStage(content);
  else if (stage === "code") renderCodeStage(content);
  else if (stage === "password") renderPasswordStage(content);
  else if (stage === "channel") renderChannelStage(content);
  else if (stage === "error") renderErrorStage(content);
  $("loginFoot").textContent = stage === "channel"
    ? "Folders and tags live on this PC. Files live in the channel."
    : "Your Telegram login stays on this computer.";
}
function renderLoginSteps(stage) {
  const steps = [
    { id: "account", label: "Telegram account" },
    { id: "channel", label: "Private channel" },
    { id: "library", label: "Library" }
  ];
  let active = 0;
  let done = 0;
  if (stage === "channel") { active = 1; done = 1; }
  else if (stage === "ready") { active = 2; done = 3; }
  else if (stage === "error") { active = 0; done = 0; }
  const nodes = [];
  steps.forEach((step, index) => {
    if (index) nodes.push(h("span", { class: "step-line" }));
    const cls = index < done ? "step done" : index === active ? "step active" : "step";
    nodes.push(h("span", { class: cls }, h("span", { class: "step-dot" }), step.label));
  });
  $("loginSteps").replaceChildren(...nodes);
}
function setLoginError(message) {
  const node = $("loginError");
  node.hidden = !message;
  node.textContent = message || "";
}
function loginButton(label, form) {
  const button = h("button", { class: "btn primary", type: "submit" }, label);
  form.append(h("div", { class: "login-actions" }, button));
  return button;
}
function busyButton(button, busy, label) {
  button.disabled = busy;
  if (busy) button.replaceChildren(h("span", { class: "spinner spinner-small" }), "Working…");
  else button.textContent = label;
}
function switchCreds() {
  S.authStage = "setup";
  setLoginError("");
  renderLogin();
}
function backToQuickLogin() {
  S.authStage = "";
  S.loginMode = "qr";
  S.qr.error = "";
  S.passwordHint = "";
  setLoginError("");
  renderLogin();
}
function loginTabs(active) {
  return h("div", { class: "login-tabs", role: "tablist" },
    [
      { id: "qr", label: "QR code" },
      { id: "phone", label: "Phone code" }
    ].map((tab) => h("button", {
      class: "login-tab" + (active === tab.id ? " active" : ""),
      type: "button",
      role: "tab",
      "aria-selected": active === tab.id ? "true" : "false",
      onClick: () => setLoginMode(tab.id)
    }, tab.label))
  );
}
async function setLoginMode(mode) {
  if (S.loginMode === mode) return;
  const leavingQr = S.loginMode === "qr";
  S.loginMode = mode;
  S.qr.error = "";
  setLoginError("");
  if (leavingQr) {
    stopQrClient(false);
    try { await api("/api/login/qr/cancel", { method: "POST" }); } catch (_) { /* fresh tokens expire on their own */ }
  }
  renderLogin();
}
function credentialsNote() {
  const custom = Boolean(S.status && S.status.has_api);
  return h("div", { class: "login-cred" },
    h("span", {
      class: "login-cred-text",
      title: custom
        ? "These credentials are stored only in your Windows profile."
        : "Uses the public app credentials that ship with Telegram Desktop. Add your own later for long-term reliability."
    }, custom
      ? "Using your own API credentials."
      : "No API setup needed — using Telegram's built-in app credentials."),
    h("button", { class: "link-btn", type: "button", onClick: switchCreds },
      custom ? "Change" : "Use my own")
  );
}
function renderSetupStage(content) {
  content.append(
    h("h2", { text: "Use your own API credentials" }),
    h("p", { class: "login-desc" },
      "Optional. The built-in sign-in already works without my.telegram.org. Your own API app avoids shared-credential limits and is recommended for long-term use."
    )
  );
  const form = h("form", { novalidate: "" });
  const apiId = inputEl({ type: "text", inputmode: "numeric", placeholder: "1234567", autocomplete: "off" });
  const apiHash = inputEl({ type: "password", placeholder: "32-character API hash", autocomplete: "off" });
  form.append(
    field("API ID", apiId),
    field("API hash", apiHash, "Telegram shows both under “API development tools”. They identify the app, not your account."),
    h("details", { class: "login-help" },
      h("summary", { text: "Where do I get these?" }),
      h("ol", {},
        h("li", { text: "Open my.telegram.org/apps and sign in with your phone number." }),
        h("li", { text: "Create an app (any name, platform “Desktop”)." }),
        h("li", { text: "Copy the api_id and api_hash shown there." })
      ),
      h("div", { class: "login-note", text: "If my.telegram.org says “Too many attempts”, stop retrying for a while and try a different network or browser. Built-in sign-in keeps working meanwhile." })
    )
  );
  const submit = loginButton("Save credentials", form);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setLoginError("");
    if (!apiId.value.trim() || !apiHash.value.trim()) {
      setLoginError("Enter both the API ID and the API hash.");
      return;
    }
    busyButton(submit, true);
    try {
      S.qr.error = "";
      S.status = await api("/api/setup", { method: "POST", body: { api_id: apiId.value.trim(), api_hash: apiHash.value.trim() } });
      S.authStage = "";
      updateChrome();
      if (S.status.authorized) afterAuthorized(S.status);
      else { S.loginMode = "qr"; renderLogin(); }
    } catch (error) {
      setLoginError(error.message);
    } finally {
      busyButton(submit, false, "Save credentials");
    }
  });
  const back = h("button", { class: "link-btn", type: "button", text: "Back to built-in sign-in" });
  back.addEventListener("click", backToQuickLogin);
  content.append(form, h("div", { class: "login-note", text: "The API hash is stored only in your Windows profile. It is never sent anywhere except Telegram." }));
  content.append(h("div", { class: "login-help", style: "margin-top:12px" }, back));
}
function qrImageSource(svg) {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
function updateQrPanel(data) {
  const qr = (data && data.qr) || {};
  if (qr.svg && qr.version !== S.qr.version) {
    S.qr.version = qr.version;
    S.qr.image = qrImageSource(qr.svg);
    const image = $("qrImage");
    if (image) {
      image.src = S.qr.image;
      image.hidden = false;
    }
    const frame = $("qrFrame");
    if (frame) frame.classList.remove("waiting");
  }
  const hint = $("qrHint");
  if (hint && !S.qr.error) {
    hint.className = "qr-hint";
    hint.textContent = S.qr.image
      ? "Waiting for approval. The code refreshes automatically."
      : "Generating a fresh code…";
  }
}
function applyQrPayload(data) {
  if (!data) return "error";
  if (data.status) S.status = data.status;
  if (data.authorized) {
    stopQrClient(false);
    S.authStage = "";
    updateChrome();
    afterAuthorized(S.status);
    return "ready";
  }
  if (data.state === "password") {
    stopQrClient(false);
    S.passwordHint = "QR sign-in approved. Enter your Telegram cloud password to finish.";
    S.authStage = "password";
    setLoginError("");
    updateChrome();
    renderLogin();
    return "password";
  }
  if (data.error) {
    S.qr.error = data.error;
    stopQrClient(false);
    renderLogin();
    return "error";
  }
  updateQrPanel(data);
  return "waiting";
}
function scheduleQrPoll(delay) {
  if (!S.qr.active) return;
  if (S.qr.timer) clearTimeout(S.qr.timer);
  S.qr.timer = setTimeout(pollQr, delay);
}
async function pollQr() {
  S.qr.timer = null;
  if (!S.qr.active || S.loginMode !== "qr" || loginStage() !== "login") return;
  const seq = S.qr.seq;
  try {
    const data = await api("/api/login/qr");
    if (seq !== S.qr.seq || !S.qr.active) return;
    const result = applyQrPayload(data);
    if (result === "waiting") scheduleQrPoll(1600);
  } catch (error) {
    if (seq !== S.qr.seq || !S.qr.active) return;
    const hint = $("qrHint");
    if (hint) {
      hint.className = "qr-hint";
      hint.textContent = `${error.message} Retrying…`;
    }
    scheduleQrPoll(3000);
  }
}
async function startQrLogin() {
  if (S.qr.starting || S.qr.active) return;
  if (S.loginMode !== "qr" || loginStage() !== "login") return;
  const seq = ++S.qr.seq;
  S.qr.starting = true;
  S.qr.error = "";
  S.qr.image = "";
  S.qr.version = 0;
  try {
    const data = await api("/api/login/qr/start", { method: "POST" });
    if (seq !== S.qr.seq) return;
    S.qr.starting = false;
    if (S.loginMode !== "qr" || loginStage() !== "login") {
      stopQrClient(true);
      return;
    }
    const result = applyQrPayload(data);
    if (result === "waiting") {
      S.qr.active = true;
      scheduleQrPoll(1500);
    }
  } catch (error) {
    if (seq !== S.qr.seq) return;
    S.qr.starting = false;
    S.qr.error = error.message;
    renderLogin();
  }
}
async function restartQr() {
  stopQrClient(false);
  S.qr.error = "";
  S.qr.image = "";
  S.qr.version = 0;
  try { await api("/api/login/qr/cancel", { method: "POST" }); } catch (_) { /* old token expires anyway */ }
  if (S.loginMode !== "qr" || loginStage() !== "login") return;
  renderLogin();
}
function renderQrStage(content) {
  content.append(
    h("h2", { text: "Sign in to Telegram" }),
    h("p", { class: "login-desc", text: "Scan this code with Telegram on your phone. No SMS and no API setup." }),
    loginTabs("qr")
  );
  const hasError = Boolean(S.qr.error);
  const image = h("img", {
    class: "qr-image",
    id: "qrImage",
    alt: "Telegram sign-in QR code",
    hidden: hasError || !S.qr.image ? true : null
  });
  if (S.qr.image) image.src = S.qr.image;
  const frame = h("div", {
    class: "qr-frame" + (S.qr.image && !hasError ? "" : " waiting"),
    id: "qrFrame"
  }, image, hasError ? iconNode("alert", "qr-placeholder") : h("div", { class: "spinner" }));
  const hint = h("div", {
    class: "qr-hint" + (hasError ? " error" : ""),
    id: "qrHint",
    text: hasError
      ? S.qr.error
      : (S.qr.image ? "Waiting for approval. The code refreshes automatically." : "Generating a fresh code…")
  });
  const guide = h("div", { class: "qr-guide" },
    h("div", { class: "qr-guide-title", text: hasError ? "Sign-in unavailable" : "On your phone" }),
    hasError ? null : h("ol", { class: "qr-steps" },
      h("li", {}, "Open Telegram."),
      h("li", {}, "Go to Settings → Devices."),
      h("li", {}, "Tap Link Desktop Device, then scan this code.")
    ),
    hint
  );
  const retry = h("button", {
    class: "link-btn",
    type: "button",
    text: hasError ? "Try again" : "New code"
  });
  retry.addEventListener("click", () => { restartQr(); });
  content.append(
    h("div", { class: "qr-layout" }, frame, guide),
    h("div", { class: "qr-actions" }, retry),
    credentialsNote()
  );
  if (!hasError) {
    if (!S.qr.active && !S.qr.starting) startQrLogin();
    else if (S.qr.active && !S.qr.timer) scheduleQrPoll(0);
  }
}
function renderPhoneStage(content) {
  content.append(
    h("h2", { text: "Sign in to Telegram" }),
    h("p", { class: "login-desc", text: "Use the phone number of your Telegram account. Telegram sends the login code inside the app." }),
    loginTabs("phone")
  );
  const form = h("form", { novalidate: "" });
  const phone = inputEl({ type: "tel", placeholder: "+91 98765 43210", autocomplete: "tel", autofocus: "" });
  form.append(field("Phone number", phone, "Include the country code."));
  const submit = loginButton("Send code", form);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setLoginError("");
    if (!phone.value.trim()) { setLoginError("Enter your phone number."); return; }
    busyButton(submit, true);
    try {
      S.passwordHint = "";
      const response = await api("/api/login/send_code", { method: "POST", body: { phone: phone.value.trim() } });
      S.status = response;
      S.lastPhone = response.phone || phone.value.trim();
      S.authStage = response.state === "password" ? "password" : "code";
      updateChrome();
      renderLogin();
    } catch (error) {
      setLoginError(error.message);
    } finally {
      busyButton(submit, false, "Send code");
    }
  });
  content.append(form, credentialsNote());
}
function renderCodeStage(content) {
  content.append(
    h("h2", { text: "Enter the login code" }),
    h("p", { class: "login-desc", text: `Telegram sent a code to ${S.lastPhone || "your Telegram app"}. It usually appears as a service message.` })
  );
  const form = h("form", { novalidate: "" });
  const code = inputEl({ type: "text", inputmode: "numeric", autocomplete: "one-time-code", maxlength: "9", placeholder: "12345", autofocus: "" });
  form.append(field("Code", code));
  const submit = loginButton("Verify", form);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setLoginError("");
    if (!code.value.trim()) { setLoginError("Enter the code Telegram sent you."); return; }
    busyButton(submit, true);
    try {
      const response = await api("/api/login/code", { method: "POST", body: { code: code.value.trim() } });
      S.status = response;
      if (response.state === "password") {
        S.passwordHint = "";
        S.authStage = "password";
        updateChrome();
        renderLogin();
      } else if (response.authorized) {
        S.authStage = "";
        updateChrome();
        afterAuthorized(response);
      } else {
        renderLogin();
      }
    } catch (error) {
      setLoginError(error.message);
    } finally {
      busyButton(submit, false, "Verify");
    }
  });
  const resend = h("button", { class: "link-btn", type: "button", text: "Resend code" });
  resend.addEventListener("click", async () => {
    if (!S.lastPhone) return;
    resend.disabled = true;
    try {
      const response = await api("/api/login/send_code", { method: "POST", body: { phone: S.lastPhone } });
      S.status = response;
      toast("A new code was sent.", "info");
    } catch (error) {
      setLoginError(error.message);
    } finally {
      resend.disabled = false;
    }
  });
  content.append(form,
    h("div", { class: "login-help", style: "margin-top:14px; display:flex; gap:14px" },
      resend,
      h("button", { class: "link-btn", type: "button", onClick: switchCreds }, "Change account")
    )
  );
}
function renderPasswordStage(content) {
  content.append(
    h("h2", { text: "Two-step verification" }),
    h("p", { class: "login-desc", text: S.passwordHint || "This account has a cloud password. Enter it to finish signing in." })
  );
  const form = h("form", { novalidate: "" });
  const password = inputEl({ type: "password", autocomplete: "current-password", placeholder: "Your Telegram password", autofocus: "" });
  form.append(field("Password", password));
  const submit = loginButton("Sign in", form);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setLoginError("");
    if (!password.value) { setLoginError("Enter your password."); return; }
    busyButton(submit, true);
    try {
      const response = await api("/api/login/password", { method: "POST", body: { password: password.value } });
      S.status = response;
      S.authStage = "";
      S.passwordHint = "";
      updateChrome();
      afterAuthorized(response);
    } catch (error) {
      setLoginError(error.message);
    } finally {
      busyButton(submit, false, "Sign in");
    }
  });
  content.append(form, h("div", { class: "login-note", text: "The password is sent directly to Telegram and is never stored." }));
  const back = h("button", { class: "link-btn", type: "button", text: "Use a different sign-in method" });
  back.addEventListener("click", () => {
    S.authStage = "";
    S.passwordHint = "";
    S.qr.error = "";
    setLoginError("");
    renderLogin();
  });
  content.append(h("div", { class: "login-help", style: "margin-top:12px" }, back));
}
function afterAuthorized(response) {
  if (response && response.vault) {
    hideLogin();
    updateChrome();
    refreshLibrary(true).then(() => {
      resetHistory();
      if ((S.nav.stats.count || 0) === 0) startSync(true);
    });
  } else {
    S.authStage = "channel";
    renderLogin();
  }
}
function renderChannelStage(content) {
  const heading = h("h2", { text: S.loginForced ? "Change storage channel" : "Choose your storage channel" });
  content.append(heading,
    h("p", { class: "login-desc", text: "Pick the private channel where this account stores files. If you already use the bot, choose the same channel to bring its file names into the explorer." })
  );
  const search = inputEl({ type: "search", placeholder: "Search channels", autocomplete: "off" });
  const list = h("div", { class: "channel-list", id: "channelList" }, h("div", { class: "login-loading" }, h("div", { class: "spinner" }), "Loading channels…"));
  const manual = inputEl({ type: "text", placeholder: "-1001234567890 or @channel", autocomplete: "off" });
  const save = h("button", { class: "btn primary", type: "button", text: "Use this channel" });
  const refresh = h("button", { class: "btn", type: "button" }, "Refresh");
  const cancel = S.loginForced ? h("button", { class: "btn", type: "button", text: "Cancel" }) : null;
  const actions = h("div", { class: "login-actions" }, save, refresh, cancel || "");
  const manualWrap = h("details", { class: "login-help", style: "margin-top:14px" },
    h("summary", { text: "Enter a channel ID manually" }),
    h("div", { style: "margin-top:8px" }, manual)
  );
  content.append(
    h("div", { class: "channel-search" }, search),
    list,
    actions,
    manualWrap,
    h("div", { class: "login-note", text: "The channel must be one your account is a member of. A private channel with just you is enough." })
  );
  if (cancel) cancel.addEventListener("click", () => {
    S.authStage = "";
    S.selectedChannel = null;
    hideLogin();
  });
  search.addEventListener("input", debounce(() => {
    S.channelQuery = search.value.trim();
    S.selectedChannel = null;
    loadChannels(list, search.value.trim());
  }, 250));
  refresh.addEventListener("click", () => loadChannels(list, search.value.trim()));
  save.addEventListener("click", async () => {
    setLoginError("");
    const value = manual.value.trim() || (S.selectedChannel ? String(S.selectedChannel.id) : "");
    if (!value) { setLoginError("Choose a channel from the list or enter its ID."); return; }
    busyButton(save, true);
    try {
      S.status = await api("/api/vault", { method: "POST", body: { vault: value } });
      S.selectedChannel = null;
      S.authStage = "";
      S.loginForced = false;
      updateChrome();
      hideLogin();
      toast("Channel connected.", "success");
      await refreshLibrary(true);
      resetHistory();
      if ((S.nav.stats.count || 0) === 0) startSync(true);
    } catch (error) {
      setLoginError(error.message);
    } finally {
      busyButton(save, false, "Use this channel");
    }
  });
  loadChannels(list, search.value.trim());
}
async function loadChannels(list, query) {
  list.replaceChildren(h("div", { class: "login-loading" }, h("div", { class: "spinner" }), "Loading channels…"));
  try {
    const response = await api(`/api/channels?q=${encodeURIComponent(query || "")}`);
    S.channels = response.channels || [];
    renderChannelList(list);
  } catch (error) {
    list.replaceChildren(h("div", { class: "login-note", text: error.message }));
  }
}
function renderChannelList(list) {
  if (!S.channels.length) {
    list.replaceChildren(h("div", { class: "login-note" },
      "No channels found. Create a private channel in Telegram, add this account, then press Refresh."
    ));
    return;
  }
  const nodes = S.channels.map((channel) => {
    const selected = S.selectedChannel && S.selectedChannel.id === channel.id;
    const node = h("button", { class: "channel-item" + (selected ? " selected" : ""), type: "button" },
      h("span", { class: "channel-avatar", text: initials(channel.title) }),
      h("span", { class: "channel-info" },
        h("span", { class: "channel-title", text: channel.title }),
        h("span", { class: "channel-meta", text: channel.username ? `@${channel.username}` : String(channel.id) })
      ),
      h("span", { class: "channel-badge", text: channel.broadcast ? "channel" : channel.megagroup ? "group" : "chat" })
    );
    node.addEventListener("click", () => {
      S.selectedChannel = channel;
      list.querySelectorAll(".channel-item").forEach((item) => item.classList.remove("selected"));
      node.classList.add("selected");
    });
    return node;
  });
  list.replaceChildren(...nodes);
}
function renderErrorStage(content) {
  const st = S.status;
  content.append(
    h("h2", { text: st && st.authorized ? "Choose your channel" : "Couldn’t connect to Telegram" }),
    h("p", { class: "login-desc", text: (st && st.error) || "The Telegram session could not start." })
  );
  const retry = h("button", { class: "btn primary", type: "button", text: "Retry connection" });
  retry.addEventListener("click", async () => {
    busyButton(retry, true);
    setLoginError("");
    try {
      S.status = await api("/api/reconnect", { method: "POST" });
      updateChrome();
      S.authStage = "";
      if (S.status.authorized) afterAuthorized(S.status);
      else renderLogin();
    } catch (error) {
      setLoginError(error.message);
    } finally {
      busyButton(retry, false, "Retry connection");
    }
  });
  const other = h("button", { class: "btn", type: "button", text: "Use different API credentials" });
  other.addEventListener("click", switchCreds);
  content.append(h("div", { class: "login-actions" }, retry, other));
  if (st && st.authorized) {
    const pick = h("button", { class: "btn", type: "button", text: "Choose another channel" });
    pick.addEventListener("click", () => { S.authStage = "channel"; S.loginForced = true; renderLogin(); });
    content.append(pick);
  } else if (st && (st.has_api || st.quick_api)) {
    const logout = h("button", { class: "link-btn", type: "button", text: "Sign out and start over" });
    logout.addEventListener("click", async () => {
      try {
        S.status = await api("/api/logout", { method: "POST" });
        S.authStage = "";
        updateChrome();
        renderLogin();
      } catch (error) { setLoginError(error.message); }
    });
    content.append(h("div", { class: "login-help", style: "margin-top:14px" }, logout));
  }
}

/* --------------------------------------------------------------- library */
async function refreshLibrary(initial) {
  if (!ready()) return;
  await Promise.all([loadNav(), loadItems({ reset: true, first: Boolean(initial) })]);
}
async function loadNav() {
  try {
    const data = await api("/api/nav");
    S.nav = data;
    renderSidebar();
    renderKindOptions();
    if (!S.itemsPending) renderItems();
  } catch (error) {
    toast(error.message, "error");
  }
}
const FOLD_KEY = "tfe_fold_collapsed";
function collapsedFolders() {
  try {
    const raw = JSON.parse(localStorage.getItem(FOLD_KEY) || "[]");
    return new Set(Array.isArray(raw) ? raw.map((v) => String(v).toLowerCase()) : []);
  } catch {
    return new Set();
  }
}
function saveCollapsedFolders(set) {
  try { localStorage.setItem(FOLD_KEY, JSON.stringify([...set])); } catch { /* keep UI-only pref best effort */ }
}
function renderSidebar() {
  const stats = S.nav.stats || {};
  $("countAll").textContent = stats.count ? String(stats.count) : "";
  $("countFav").textContent = stats.favorites ? String(stats.favorites) : "";
  $("countHidden").textContent = stats.hidden ? String(stats.hidden) : "";
  $("storageCount").textContent = plural(stats.count || 0, "file");
  $("storageSize").textContent = fmtSize(stats.size || 0);
  const bar = $("storageBar");
  if (bar && bar.parentElement) bar.parentElement.hidden = true;

  document.querySelectorAll("#nav .nav-item").forEach((node) => {
    const active = !S.folder && !S.tag &&
      ((node.dataset.nav === "all" && S.navMode === "all") ||
       (node.dataset.nav === "recent" && S.navMode === "recent") ||
       (node.dataset.nav === "favorites" && S.navMode === "favorites") ||
       (node.dataset.nav === "hidden" && S.navMode === "hidden"));
    node.classList.toggle("active", active);
  });

  const folderList = $("folderList");
  folderList.replaceChildren();
  const folders = S.nav.folders || [];
  const foldSet = collapsedFolders();
  const lowerPath = (entry) => String(entry.folder || "").toLowerCase();
  const parentFolders = folders.filter((entry) =>
    folders.some((other) => String(other.parent || "").toLowerCase() === lowerPath(entry)));
  const isHiddenByCollapse = (entry) => {
    const path = lowerPath(entry);
    for (const collapsed of foldSet) {
      if (path.startsWith(collapsed + "/")) return true;
    }
    return false;
  };
  updateFoldToggle(folders, parentFolders, foldSet);
  if (!folders.length) {
    folderList.append(h("div", { class: "side-empty", text: "No folders yet" }));
  } else {
    for (const folder of folders) {
      if (isHiddenByCollapse(folder)) continue;
      const depth = Math.min(folder.depth || 0, 8);
      const hasChildren = parentFolders.some((entry) => entry.folder === folder.folder);
      const open = !foldSet.has(lowerPath(folder));
      const toggle = h("span", {
        class: "tree-chev" + (open ? " open" : "") + (hasChildren ? "" : " leaf"),
        title: hasChildren ? (open ? "Collapse" : "Expand") : "",
        "aria-hidden": "true",
        html: svgRaw("chevron")
      });
      if (hasChildren) {
        toggle.addEventListener("click", (event) => {
          event.stopPropagation();
          const set = collapsedFolders();
          const key = lowerPath(folder);
          if (set.has(key)) set.delete(key); else set.add(key);
          saveCollapsedFolders(set);
          renderSidebar();
        });
      }
      const node = h("button", {
        class: "folder-item" + (S.folder.toLowerCase() === folder.folder.toLowerCase() ? " active" : ""),
        type: "button",
        title: folder.folder,
        style: `--depth:${depth}`
      },
        toggle,
        folderIconNode(folder),
        h("span", { class: "folder-name", text: folder.name || folder.folder }),
        h("span", { class: "nav-count", text: folder.n ? String(folder.n) : "" })
      );
      node.addEventListener("click", () => openFolder(folder.folder));
      node.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        openFolderMenu(event, folder);
      });
      folderList.append(node);
    }
  }

  const tagList = $("tagList");
  tagList.replaceChildren();
  const tags = S.nav.tags || [];
  if (!tags.length) {
    tagList.append(h("div", { class: "side-empty", text: "No tags yet" }));
  } else {
    for (const tag of tags) {
      const node = h("button", { class: "tag-chip" + (S.tag.toLowerCase() === tag.tag.toLowerCase() ? " active" : ""), type: "button", title: `${plural(tag.count, "file")}` }, `#${tag.tag}`);
      node.addEventListener("click", () => navigateScope({ navMode: "all", tag: tag.tag }));
      tagList.append(node);
    }
  }
  $("clearTagBtn").hidden = !S.tag;
  updateFilterBadge();
  updateBreadcrumb();
  updateStatusCounts();
}
function updateFoldToggle(folders, parentFolders, foldSet) {
  const btn = $("foldToggleBtn");
  if (!btn) return;
  const lowerPath = (entry) => String(entry.folder || "").toLowerCase();
  const anyOpen = parentFolders.some((entry) => !foldSet.has(lowerPath(entry)));
  btn.hidden = !parentFolders.length;
  setIcon(btn, anyOpen ? "foldCompact" : "foldExpand");
  btn.title = anyOpen ? "Collapse all folders" : "Expand all folders";
  btn.onclick = () => {
    const set = anyOpen
      ? new Set(parentFolders.map((entry) => lowerPath(entry)))
      : new Set();
    saveCollapsedFolders(set);
    renderSidebar();
  };
}
function renderKindOptions() {
  const select = $("kindSelect");
  const current = S.kind;
  const options = [h("option", { value: "", text: "All types" })];
  for (const kind of S.nav.kinds || []) {
    options.push(h("option", { value: kind.kind, text: `${kind.label} (${kind.count})` }));
  }
  select.replaceChildren(...options);
  const exists = (S.nav.kinds || []).some((kind) => kind.kind === current);
  S.kind = exists ? current : "";
  select.value = S.kind;
}
function updateStatusCounts() {
  const count = S.total || 0;
  const folders = visibleSubfolders().length;
  $("countText").textContent = folders
    ? `${plural(count, "item")} · ${plural(folders, "folder")}`
    : plural(count, "item");
  $("sizeText").textContent = count ? fmtSize(S.totalSize) : "";
  const wrap = $("loadMoreWrap");
  if (S.items.length < S.total) {
    wrap.hidden = false;
    $("loadMoreText").textContent = `${S.items.length} of ${S.total}`;
  } else {
    wrap.hidden = true;
  }
}
function updateBreadcrumb() {
  const nodes = [];
  const rootLabel = S.navMode === "favorites" ? "Favorites"
    : S.navMode === "recent" ? "Recent"
    : S.navMode === "hidden" ? "Hidden" : "All files";
  const atRoot = !S.folder && !S.tag;
  if (atRoot) {
    nodes.push(h("span", { class: "crumb current", text: rootLabel, title: rootLabel }));
  } else {
    const root = h("button", { class: "crumb link", type: "button", text: rootLabel, title: rootLabel });
    root.addEventListener("click", () => navigateScope({ navMode: S.navMode, folder: "", tag: "", kind: "", q: "" }));
    nodes.push(root);
  }
  if (S.folder) {
    const parts = S.folder.split("/");
    let path = "";
    parts.forEach((part, index) => {
      path = path ? `${path}/${part}` : part;
      nodes.push(h("span", { class: "sep", text: "›" }));
      const last = index === parts.length - 1 && !S.tag;
      if (last) {
        nodes.push(h("span", { class: "crumb current", text: part, title: path }));
      } else {
        const crumb = h("button", { class: "crumb link", type: "button", text: part, title: path });
        crumb.addEventListener("click", () => navigateScope({ navMode: "all", folder: path }));
        nodes.push(crumb);
      }
    });
  }
  if (S.tag) {
    nodes.push(h("span", { class: "sep", text: "›" }));
    nodes.push(h("span", { class: "crumb current", text: `#${S.tag}` }));
  }
  if (S.q) {
    nodes.push(h("span", { class: "sep", text: "·" }));
    nodes.push(h("span", { class: "crumb current", text: `“${S.q}”` }));
  }
  $("breadcrumb").replaceChildren(...nodes);
  $("upBtn").disabled = !(S.folder || S.tag || S.kind || S.q);
  $("backBtn").disabled = S.histIndex <= 0;
  $("forwardBtn").disabled = S.histIndex >= S.history.length - 1;
}
async function loadItems(options) {
  const opts = options || {};
  const reset = opts.reset !== false;
  const seq = ++S.loadSeq;
  S.itemsPending = true;
  if (reset) {
    if (opts.first || !S.items.length) showLoading(true);
    S.items = [];
    S.total = 0;
    S.totalSize = 0;
  }
  setStatus(reset ? "Loading…" : "Loading more…");
  const params = new URLSearchParams();
  if (S.q) params.set("q", S.q);
  if (S.kind) params.set("kind", S.kind);
  if (S.folder) params.set("folder", S.folder);
  if (S.tag) params.set("tag", S.tag);
  if (S.favorite) params.set("favorite", "1");
  if (S.hiddenOnly) params.set("hidden", "1");
  if (S.filters.min !== "" && Number.isFinite(Number(S.filters.min))) {
    params.set("min_size", String(Math.max(0, Math.round(Number(S.filters.min) * 1024 * 1024))));
  }
  if (S.filters.max !== "" && Number.isFinite(Number(S.filters.max))) {
    params.set("max_size", String(Math.max(0, Math.round(Number(S.filters.max) * 1024 * 1024))));
  }
  if (S.filters.after) params.set("after", S.filters.after);
  if (S.filters.before) params.set("before", S.filters.before);
  if (S.filters.note) params.set("note", "1");
  if (S.filters.recursive && S.folder) params.set("recursive", "1");
  params.set("sort", S.sort);
  params.set("direction", S.dir);
  params.set("limit", "200");
  params.set("offset", String(reset ? 0 : S.items.length));
  try {
    const data = await api(`/api/items?${params.toString()}`);
    if (seq !== S.loadSeq) return;
    S.items = reset ? data.items : S.items.concat(data.items);
    S.total = data.total;
    S.totalSize = data.total_size;
    S.loading = false;
    if (S.selectedId && !S.items.some((item) => item.id === S.selectedId)) {
      S.selectedId = null;
    }
    S.itemsPending = false;
    renderItems();
    updateStatusCounts();
    setStatus(data.total ? `${plural(data.total, "item")} in this view` : "");
    if (S.items.length < data.total) setStatus(`${S.items.length} of ${data.total} items loaded`);
  } catch (error) {
    if (seq !== S.loadSeq) return;
    S.itemsPending = false;
    showLoading(false);
    setStatus("Could not load files");
    toast(error.message, "error");
  }
}
async function loadMore() {
  if (S.loading || S.items.length >= S.total) return;
  S.loading = true;
  await loadItems({ reset: false });
  S.loading = false;
}
function showLoading(show) {
  $("loadingView").hidden = !show;
  if (show) {
    $("emptyView").hidden = true;
  }
}
function scopedEmptyContent() {
  if (S.q) {
    return {
      title: `No matches for “${S.q}”`,
      text: "Try another word, or search by tag and folder name.",
      sync: false,
      upload: false
    };
  }
  if (S.tag) {
    return {
      title: `No files tagged #${S.tag}`,
      text: "Edit a file’s tags to see it here.",
      sync: false,
      upload: true
    };
  }
  if (S.folder) {
    return {
      title: "This folder is empty",
      text: "Upload a file into this folder, or move an existing file here.",
      sync: false,
      upload: true
    };
  }
  if (S.navMode === "favorites") {
    return {
      title: "No favorites yet",
      text: "Select a file in All files and tap Favorite.",
      sync: false,
      upload: false
    };
  }
  if (S.navMode === "hidden") {
    return {
      title: "Nothing hidden",
      text: "Files you remove from the library appear here, and you can restore them anytime.",
      sync: false,
      upload: false
    };
  }
  return {
    title: "No files here yet",
    text: "Sync with Telegram to bring your channel into this window, or upload a file.",
    sync: true,
    upload: true
  };
}
function renderItems() {
  showLoading(false);
  const folders = visibleSubfolders();
  if (S.selectedFolderPath && !folders.some((entry) => entry.folder.toLowerCase() === S.selectedFolderPath.toLowerCase())) {
    S.selectedFolderPath = null;
  }
  if (S.selection.size) {
    const present = new Set(S.items.map((entry) => entry.id));
    for (const id of Array.from(S.selection)) {
      if (!present.has(id)) S.selection.delete(id);
    }
    if (!S.selection.size) S.selectionAnchor = null;
  }
  const hasContent = folders.length > 0 || S.items.length > 0;
  $("emptyView").hidden = hasContent;
  $("detailsView").hidden = !hasContent || S.view !== "details";
  $("tilesView").hidden = !hasContent || S.view !== "tiles";
  $("loadMoreWrap").hidden = true;
  if (!hasContent) {
    $("rows").replaceChildren();
    $("tilesView").replaceChildren();
    const empty = scopedEmptyContent();
    $("emptyTitle").textContent = empty.title;
    $("emptyText").textContent = empty.text;
    $("emptySyncBtn").hidden = !empty.sync;
    $("emptyUploadBtn").hidden = !empty.upload;
    $("emptyFolderBtn").hidden = !empty.upload;
    updateBreadcrumb();
    renderSelection();
    return;
  }
  const rows = $("rows");
  const tiles = $("tilesView");
  rows.replaceChildren();
  tiles.replaceChildren();
  const rowFrag = document.createDocumentFragment();
  const tileFrag = document.createDocumentFragment();
  for (const folder of folders) {
    rowFrag.append(buildFolderRow(folder));
    tileFrag.append(buildFolderTile(folder));
  }
  for (const item of S.items) {
    rowFrag.append(buildRow(item));
    tileFrag.append(buildTile(item));
  }
  rows.append(rowFrag);
  tiles.append(tileFrag);
  updateStatusCounts();
  updateBreadcrumb();
  updateSortArrows();
  renderSelection();
  renderPreview();
}
function folderSelected(folder) {
  return Boolean(S.selectedFolderPath && S.selectedFolderPath.toLowerCase() === folder.folder.toLowerCase());
}
function buildFolderRow(folder) {
  const sub = [];
  if (folder.n) sub.push(plural(folder.n, "file"));
  if (folder.direct_n !== undefined) sub.push(`${folder.direct_n} direct`);
  if (folder.note) sub.push(folder.note.slice(0, 80));
  const nameBlock = h("div", { class: "name-block" },
    h("span", { class: "name-text", title: folder.folder },
      folder.name || folder.folder,
      folder.note ? h("span", { class: "note-mark", html: svgRaw("note") }) : null
    )
  );
  if (sub.length) nameBlock.append(h("span", { class: "name-sub", text: sub.join(" · ") }));
  return h("div", { class: "row folder-row" + (folderSelected(folder) ? " selected" : ""), "data-folder": folder.folder, tabindex: "-1" },
    h("div", { class: "cell cell-name" }, buildFolderThumb(folder), nameBlock),
    h("div", { class: "cell cell-type" }, h("span", { class: "type-cell" }, h("span", { class: "type-label", text: "Folder" }))),
    h("div", { class: "cell cell-size", text: folder.n ? fmtSize(folder.size) : "—" }),
    h("div", { class: "cell cell-date", text: "—" }),
    h("div", { class: "cell cell-folder", title: folder.parent || "", text: folder.parent || "—" })
  );
}
function buildFolderThumb(folder) {
  const glyph = folder.icon
    ? h("span", { class: "folder-glyph", text: folder.icon })
    : h("span", { class: "folder-glyph", html: svgRaw("folder") });
  return h("span", { class: "thumb folder-thumb" }, glyph);
}
function buildFolderTile(folder) {
  const media = h("div", { class: "tile-media folder-tile-media" },
    folder.icon
      ? h("span", { class: "folder-glyph large", text: folder.icon })
      : h("span", { class: "folder-glyph large", html: svgRaw("folder") })
  );
  if (folder.n) media.append(h("span", { class: "tile-badge", text: plural(folder.n, "file") }));
  if (folder.note) media.append(h("span", { class: "tile-badge note", title: folder.note, html: svgRaw("note") }));
  return h("div", { class: "tile folder-tile" + (folderSelected(folder) ? " selected" : ""), "data-folder": folder.folder, tabindex: "-1" },
    media,
    h("div", { class: "tile-body" },
      h("div", { class: "tile-name", text: folder.name || folder.folder, title: folder.folder }),
      h("div", { class: "tile-meta" },
        h("span", { text: "Folder" }),
        h("span", { text: folder.n ? fmtSize(folder.size) : "—" })
      )
    )
  );
}
function buildThumb(item) {
  const thumb = h("span", { class: "thumb" });
  if (item.has_thumb && item.thumb_url) {
    const image = h("img", { src: item.thumb_url, alt: "", loading: "lazy", decoding: "async" });
    image.addEventListener("error", () => {
      image.remove();
      thumb.append(fileIcon(item.kind));
    });
    thumb.append(image);
  } else {
    thumb.append(fileIcon(item.kind));
  }
  return thumb;
}
function partLabel(item) {
  const part = item.part_of;
  return part && part.count > 1 ? `Part ${part.num}/${part.count}` : "";
}
function buildRow(item) {
  const nameBlock = h("div", { class: "name-block" },
    h("span", { class: "name-text", title: item.name },
      item.name,
      item.favorite ? h("span", { class: "fav-star", html: svgRaw("starFilled") }) : null
    )
  );
  const subParts = [];
  const part = partLabel(item);
  if (part) subParts.push(part);
  if (item.tag_list && item.tag_list.length) subParts.push(item.tag_list.slice(0, 3).map((tag) => `#${tag}`).join(" "));
  else if (item.caption) subParts.push(item.caption.slice(0, 90));
  if (item.note) subParts.push("Note");
  if (subParts.length) nameBlock.append(h("span", { class: "name-sub" },
    subParts.join(subParts.length > 1 ? " · " : ""),
    item.note ? h("span", { class: "note-mark", html: svgRaw("note") }) : null
  ));
  const typeCell = h("div", { class: "cell cell-type" },
    h("span", { class: "type-cell" }, h("span", { class: "type-label", text: item.kind_label || "File" }))
  );
  const row = h("div", { class: "row" + (S.selectedId === item.id || S.selection.has(item.id) ? " selected" : ""), "data-id": String(item.id), tabindex: "-1" },
    h("div", { class: "cell cell-name" }, buildThumb(item), nameBlock),
    typeCell,
    h("div", { class: "cell cell-size", text: fmtSize(item.size) }),
    h("div", { class: "cell cell-date", text: fmtDate(item.tg_date || item.added_at) }),
    h("div", { class: "cell cell-folder", title: item.folder || "", text: item.folder || "—" })
  );
  return row;
}
function buildTile(item) {
  const media = h("div", { class: "tile-media" });
  if (item.has_thumb && item.thumb_url) {
    const image = h("img", { src: item.thumb_url, alt: "", loading: "lazy", decoding: "async" });
    image.addEventListener("error", () => { image.remove(); media.append(fileIcon(item.kind)); });
    media.append(image);
  } else {
    media.append(fileIcon(item.kind));
  }
  let badge = "";
  if ((item.kind === "video" || item.kind === "audio" || item.kind === "voice") && item.duration) badge = fmtDuration(item.duration);
  else if (item.kind === "gif") badge = "GIF";
  if (badge) media.append(h("span", { class: "tile-badge", text: badge }));
  const part = partLabel(item);
  if (part) media.append(h("span", { class: "tile-badge", text: part }));
  if (item.favorite) media.append(h("span", { class: "tile-badge", style: "right:auto;left:6px;display:grid;place-items:center", html: svgRaw("starFilled") }));
  if (item.note) media.append(h("span", { class: "tile-badge note", title: item.note, html: svgRaw("note") }));
  const body = h("div", { class: "tile-body" },
    h("div", { class: "tile-name", text: item.name, title: item.name }),
    h("div", { class: "tile-meta" },
      h("span", { text: item.kind_label || "File" }),
      h("span", { text: fmtSize(item.size) })
    )
  );
  return h("div", { class: "tile" + (S.selectedId === item.id || S.selection.has(item.id) ? " selected" : ""), "data-id": String(item.id), tabindex: "-1" }, media, body);
}
function updateViewButtons() {
  document.querySelectorAll(".view-toggle button").forEach((node) => {
    node.classList.toggle("active", node.dataset.view === S.view);
  });
  const hasContent = visibleSubfolders().length > 0 || S.items.length > 0;
  $("detailsView").hidden = S.view !== "details" || !hasContent;
  $("tilesView").hidden = S.view !== "tiles" || !hasContent;
}
function setView(view) {
  S.view = view === "tiles" ? "tiles" : "details";
  localStorage.setItem("tfe_view", S.view);
  savePrefs({ view: S.view });
  updateViewButtons();
  updateSortArrows();
  renderItems();
}
function updateSortArrows() {
  document.querySelectorAll(".col[data-sort]").forEach((node) => {
    const arrow = node.querySelector(".sort-arrow");
    arrow.textContent = node.dataset.sort === S.sort ? (S.dir === "asc" ? "↑" : "↓") : "";
  });
  $("sortSelect").value = S.sort;
  $("sortDirBtn").innerHTML = svgRaw(S.dir === "asc" ? "sortAsc" : "sortDesc");
  $("sortDirBtn").title = S.dir === "asc" ? "Ascending" : "Descending";
}
function setSort(sort, explicitDir) {
  let dir = explicitDir;
  if (!dir) {
    if (sort === S.sort) dir = S.dir === "asc" ? "desc" : "asc";
    else dir = sort === "name" ? "asc" : "desc";
  }
  S.sort = sort;
  S.dir = dir;
  localStorage.setItem("tfe_sort", S.sort);
  localStorage.setItem("tfe_dir", S.dir);
  savePrefs({ sort: S.sort, dir: S.dir });
  updateSortArrows();
  loadItems({ reset: true });
}
function setStatus(text) {
  $("statusText").textContent = text || "";
}
function setScope(scope, pushHistory) {
  const previous = { navMode: S.navMode, folder: S.folder, tag: S.tag, kind: S.kind, favorite: S.favorite };
  S.navMode = scope.navMode !== undefined ? scope.navMode : "all";
  S.folder = scope.folder || "";
  S.tag = scope.tag || "";
  if (scope.kind !== undefined) S.kind = scope.kind;
  else if (S.folder || S.tag) S.kind = "";
  S.favorite = S.navMode === "favorites";
  S.hiddenOnly = S.navMode === "hidden";
  if (scope.sort) S.sort = scope.sort;
  if (scope.dir) S.dir = scope.dir;
  S.q = scope.q || "";
  const search = $("searchInput");
  if (search.value !== S.q) search.value = S.q;
  S.selectedId = null;
  S.selectedFolderPath = null;
  if (pushHistory !== false) {
    const current = S.history[S.histIndex];
    const next = snapshot();
    if (!current || JSON.stringify(current) !== JSON.stringify(next)) pushSnapshot();
  }
  updateSortArrows();
  renderSidebar();
  renderPreview();
  loadItems({ reset: true });
  void previous;
}
function navigateScope(scope) {
  setScope(scope, true);
}
function goBack() {
  if (S.histIndex <= 0) return;
  S.histIndex -= 1;
  applyHistory();
}
function goForward() {
  if (S.histIndex >= S.history.length - 1) return;
  S.histIndex += 1;
  applyHistory();
}
function applyHistory() {
  const snap = S.history[S.histIndex];
  if (!snap) return;
  S.navMode = snap.navMode;
  S.folder = snap.folder;
  S.tag = snap.tag;
  S.kind = snap.kind;
  S.favorite = snap.favorite;
  S.hiddenOnly = snap.navMode === "hidden";
  S.sort = snap.sort || S.sort;
  S.dir = snap.dir || S.dir;
  S.q = "";
  $("searchInput").value = "";
  S.selectedId = null;
  S.selectedFolderPath = null;
  updateSortArrows();
  renderSidebar();
  renderPreview();
  loadItems({ reset: true });
}
function snapshot() {
  return {
    navMode: S.navMode, folder: S.folder, tag: S.tag, kind: S.kind,
    favorite: S.favorite, sort: S.sort, dir: S.dir
  };
}
function pushSnapshot() {
  S.history = S.history.slice(0, S.histIndex + 1);
  S.history.push(snapshot());
  if (S.history.length > 60) S.history.shift();
  S.histIndex = S.history.length - 1;
}
function resetHistory() {
  S.history = [];
  S.histIndex = -1;
  pushSnapshot();
}
function goUp() {
  if (S.folder) {
    const cut = S.folder.lastIndexOf("/");
    const parent = cut > 0 ? S.folder.slice(0, cut) : "";
    navigateScope({ navMode: "all", folder: parent });
    return;
  }
  if (!(S.tag || S.kind || S.q)) return;
  setScope({ navMode: S.navMode, folder: "", tag: "", kind: "", q: "" }, true);
}

/* -------------------------------------------------------------- preview */
function selectedItem() {
  if (S.selectedFolderPath) return null;
  return S.items.find((item) => item.id === S.selectedId) || null;
}
function selectedFolder() {
  return S.selectedFolderPath ? folderEntry(S.selectedFolderPath) : null;
}
function selectItem(id, options) {
  S.selectedId = id;
  S.selectedFolderPath = null;
  S.selection.clear();
  S.selectionAnchor = id;
  document.querySelectorAll(".row.selected, .tile.selected").forEach((node) => node.classList.remove("selected"));
  const node = document.querySelector(`.row[data-id="${id}"], .tile[data-id="${id}"]`);
  if (node) {
    node.classList.add("selected");
    if (options && options.scroll) node.scrollIntoView({ block: "nearest" });
  }
  renderSelection();
  renderPreview();
}
function selectFolderRow(path, options) {
  const entry = folderEntry(path);
  if (!entry) return;
  S.selectedId = null;
  S.selectedFolderPath = entry.folder;
  S.selection.clear();
  document.querySelectorAll(".row.selected, .tile.selected").forEach((node) => node.classList.remove("selected"));
  document.querySelectorAll(".row[data-folder], .tile[data-folder]").forEach((node) => {
    if (node.dataset.folder.toLowerCase() !== entry.folder.toLowerCase()) return;
    node.classList.add("selected");
    if (options && options.scroll) node.scrollIntoView({ block: "nearest" });
  });
  renderSelection();
  renderPreview();
}
function clearSelection() {
  S.selectedId = null;
  S.selectedFolderPath = null;
  S.selection.clear();
  S.selectionAnchor = null;
  document.querySelectorAll(".row.selected, .tile.selected").forEach((node) => node.classList.remove("selected"));
  renderSelection();
  renderPreview();
}
function renderSelection() {
  const bar = $("bulkBar");
  const count = S.selection.size;
  if (!count) {
    bar.hidden = true;
    return;
  }
  const loaded = S.items.filter((entry) => S.selection.has(entry.id));
  bar.hidden = false;
  $("bulkCount").textContent = `${count} selected`;
  $("bulkSize").textContent =
    loaded.length === count ? fmtSize(loaded.reduce((sum, entry) => sum + (entry.size || 0), 0)) : "";
  document.querySelectorAll(".row[data-id], .tile[data-id]").forEach((node) => {
    const id = Number(node.dataset.id);
    node.classList.toggle("selected", S.selection.has(id) || id === S.selectedId);
  });
}
function handleItemClick(id, event) {
  const ids = S.items.map((entry) => entry.id);
  if (event.shiftKey && S.selectionAnchor !== null) {
    const from = ids.indexOf(S.selectionAnchor);
    const to = ids.indexOf(id);
    if (from >= 0 && to >= 0) {
      const start = Math.min(from, to);
      const range = ids.slice(start, Math.max(from, to) + 1);
      if (event.ctrlKey || event.metaKey) {
        for (const rangeId of range) S.selection.add(rangeId);
      } else {
        S.selection = new Set(range);
      }
      S.selectedId = id;
      renderSelection();
      renderPreview();
      return;
    }
  }
  if (event.ctrlKey || event.metaKey) {
    if (S.selection.has(id)) S.selection.delete(id);
    else S.selection.add(id);
    S.selectedId = id;
    S.selectionAnchor = id;
    renderSelection();
    renderPreview();
    return;
  }
  selectItem(id);
}
function setPreviewNote(note, isFolder) {
  const block = $("previewNote");
  block.hidden = false;
  const text = $("previewNoteText");
  text.textContent = note || (isFolder ? "No note for this folder yet." : "No note for this file yet.");
  text.classList.toggle("note-empty", !note);
  $("noteBtn").textContent = note ? "Edit note" : "Add note";
}
function renderPreview() {
  const folder = selectedFolder();
  const item = folder ? null : selectedItem();
  const token = ++S.previewToken;
  const empty = $("previewEmpty");
  const body = $("previewBody");
  const media = $("previewMedia");
  if (!item && !folder) {
    empty.hidden = false;
    body.hidden = true;
    media.replaceChildren();
    return;
  }
  empty.hidden = true;
  body.hidden = false;
  if (folder) {
    renderFolderPreview(folder);
    return;
  }
  $("fileActions").hidden = false;
  $("folderActions").hidden = true;
  $("fileMore").hidden = false;
  $("folderMore").hidden = true;
  $("previewName").textContent = item.name;
  $("previewName").title = item.name;
  $("previewKind").textContent = `${item.kind_label || "File"}${item.mime ? ` · ${item.mime}` : ""}`;
  const meta = $("previewMeta");
  meta.replaceChildren();
  const addMeta = (label, value) => {
    meta.append(h("dt", { text: label }), h("dd", { text: value }));
  };
  addMeta("Size", fmtSize(item.size));
  addMeta("Modified", fmtDate(item.tg_date || item.added_at));
  if (item.width && item.height) addMeta("Dimensions", `${item.width} × ${item.height}`);
  if (item.duration) addMeta("Duration", fmtDuration(item.duration));
  addMeta("Folder", item.folder || "—");
  if (item.part_of && item.part_of.count > 1) {
    addMeta("Split parts", `${item.part_of.num} of ${item.part_of.count} · ${fmtSize(item.part_of.size)} complete file`);
  }
  if (item.added_at) addMeta("Added", fmtDate(item.added_at));
  addMeta("Message", `#${item.message_id}`);
  const tags = $("previewTags");
  tags.replaceChildren();
  for (const tag of item.tag_list || []) {
    const chip = h("button", { class: "tag-chip", type: "button" }, `#${tag}`);
    chip.addEventListener("click", () => navigateScope({ navMode: "all", tag }));
    tags.append(chip);
  }
  $("favoriteBtn").textContent = item.favorite ? "Unfavorite" : "Favorite";
  $("restoreBtn").hidden = !item.hidden;
  $("completeBtn").hidden = !(item.part_of && item.part_of.count > 1);
  const link = $("tgLink");
  if (item.telegram_link) {
    link.hidden = false;
    link.href = item.telegram_link;
  } else {
    link.hidden = true;
    link.removeAttribute("href");
  }
  setPreviewNote(item.note, false);
  media.replaceChildren();
  renderInlinePreview(media, item, token);
}
function renderFolderPreview(folder) {
  $("fileActions").hidden = true;
  $("folderActions").hidden = false;
  $("fileMore").hidden = true;
  $("folderMore").hidden = false;
  $("previewName").textContent = folder.name || folder.folder;
  $("previewName").title = folder.folder;
  $("previewKind").textContent =
    `Folder${folder.n ? ` · ${plural(folder.n, "file")} · ${fmtSize(folder.size)}` : " · Empty"}`;
  const meta = $("previewMeta");
  meta.replaceChildren();
  const addMeta = (label, value) => {
    meta.append(h("dt", { text: label }), h("dd", { text: value }));
  };
  addMeta("Location", folder.parent || "All files");
  addMeta("Direct files", String(folder.direct_n || 0));
  addMeta("Files inside", String(folder.n || 0));
  addMeta("Total size", fmtSize(folder.size || 0));
  const children = (S.nav.folders || []).filter(
    (entry) => (entry.parent || "").toLowerCase() === folder.folder.toLowerCase()
  );
  addMeta("Subfolders", String(children.length));
  const tags = $("previewTags");
  tags.replaceChildren();
  for (const child of children.slice(0, 8)) {
    const chip = h("button", { class: "tag-chip", type: "button", title: child.folder }, child.name || child.folder);
    chip.addEventListener("click", () => openFolder(child.folder));
    tags.append(chip);
  }
  setPreviewNote(folder.note, true);
  const media = $("previewMedia");
  media.replaceChildren(
    h("div", { class: "folder-preview-large" },
      folder.icon
        ? h("span", { class: "folder-preview-emoji", text: folder.icon })
        : h("span", { class: "folder-preview-svg", html: svgRaw("folderOpen") })
    )
  );
}
function isPdf(item) {
  return (item.mime || "") === "application/pdf" || /\.pdf$/i.test(item.name || "");
}
function isText(item) {
  const mime = item.mime || "";
  return mime.startsWith("text/") || /\.(txt|md|markdown|json|csv|log|xml|yml|yaml|ini|cfg|conf|py|js|ts|css|html|htm|sh|bat|ps1|sql)$/i.test(item.name || "");
}
function isVideoMime(item) {
  return (item.mime || "").startsWith("video/");
}
function renderInlinePreview(container, item, token) {
  const kind = item.kind;
  if (kind === "image") {
    const image = h("img", { src: item.stream_url, alt: item.name, loading: "lazy" });
    container.append(image);
  } else if (kind === "gif" || (kind === "sticker" && isVideoMime(item))) {
    const video = h("video", { src: item.stream_url, autoplay: "", loop: "", muted: "", playsinline: "" });
    container.append(video);
  } else if (kind === "video") {
    const video = h("video", { src: item.stream_url, controls: "", preload: "metadata", playsinline: "" });
    if (item.thumb_url) video.poster = item.thumb_url;
    container.append(video);
  } else if (kind === "audio" || kind === "voice") {
    container.append(h("audio", { src: item.stream_url, controls: "", preload: "metadata" }));
  } else if (kind === "sticker") {
    container.append(h("img", { src: item.stream_url, alt: item.name, loading: "lazy" }));
  } else if (isPdf(item)) {
    container.append(h("iframe", { src: item.stream_url, title: item.name }));
  } else if (isText(item)) {
    const pre = h("pre", { class: "text-preview", text: "Loading preview…" });
    container.append(pre);
    fetch(`${item.stream_url}`, { headers: { Range: "bytes=0-65535" }, credentials: "same-origin" })
      .then((response) => response.text())
      .then((text) => {
        if (token !== S.previewToken) return;
        pre.textContent = text.length > 40000 ? `${text.slice(0, 40000)}\n\n… preview truncated` : text || "(empty file)";
      })
      .catch(() => { if (token === S.previewToken) pre.textContent = "Preview not available."; });
  } else {
    container.append(h("div", { class: "preview-file" }, fileIcon(kind), h("span", { text: "Preview isn’t available for this file type." }), h("span", { text: "Use Download or open it in Telegram." })));
  }
}
function openViewerFor(item) {
  if (!item) return;
  $("viewerTitle").textContent = item.name;
  const stage = $("viewerStage");
  stage.replaceChildren();
  $("viewerDownload").href = item.download_url;
  $("viewerDownload").setAttribute("download", "");
  if (item.kind === "image" || item.kind === "sticker") {
    if (item.kind === "sticker" && isVideoMime(item)) {
      stage.append(h("video", { src: item.stream_url, autoplay: "", loop: "", controls: "", playsinline: "" }));
    } else {
      stage.append(h("img", { src: item.stream_url, alt: item.name }));
    }
  } else if (item.kind === "gif") {
    stage.append(h("video", { src: item.stream_url, autoplay: "", loop: "", muted: "", controls: "", playsinline: "" }));
  } else if (item.kind === "video") {
    const video = h("video", { src: item.stream_url, controls: "", autoplay: "", playsinline: "" });
    if (item.thumb_url) video.poster = item.thumb_url;
    stage.append(video);
  } else if (item.kind === "audio" || item.kind === "voice") {
    stage.append(h("audio", { src: item.stream_url, controls: "", autoplay: "" }));
  } else if (isPdf(item)) {
    stage.append(h("iframe", { src: item.stream_url, title: item.name }));
  } else if (isText(item)) {
    const pre = h("pre", { text: "Loading preview…" });
    stage.append(pre);
    fetch(item.stream_url, { headers: { Range: "bytes=0-262143" }, credentials: "same-origin" })
      .then((response) => response.text())
      .then((text) => { pre.textContent = text.length > 150000 ? `${text.slice(0, 150000)}\n\n… preview truncated` : text; })
      .catch(() => { pre.textContent = "Preview not available."; });
  } else {
    stage.append(h("div", { class: "viewer-file" }, fileIcon(item.kind), h("div", { text: item.name }), h("div", { class: "preview-kind", text: "Preview isn’t available for this file type. Use the download button above." })));
  }
  $("viewerOverlay").hidden = false;
  $("viewerClose").focus();
}
function closeViewer() {
  $("viewerOverlay").hidden = true;
  $("viewerStage").replaceChildren();
}
function downloadItem(item) {
  if (!item) return;
  const link = h("a", { href: item.download_url, download: "" });
  document.body.append(link);
  link.click();
  link.remove();
}
async function startMergeDownload(item) {
  if (!item || !item.part_of) return;
  try {
    await api("/api/merge", { method: "POST", body: { item_id: item.id } });
    toast(`Downloading ${plural(item.part_of.count, "part")} of ${item.part_of.base} — see Transfers.`, "success", 5000);
    showUploadPanel();
    startTransferPolling();
    await fetchTransfers(false);
  } catch (error) {
    toast(error.message, "error", 6000);
  }
}

/* ------------------------------------------------------------ bulk select */
function bulkIds() {
  return Array.from(S.selection);
}
function bulkDownload() {
  const ids = bulkIds();
  if (!ids.length) return;
  const link = h("a", { href: `/api/batch/download?ids=${ids.join(",")}`, download: "" });
  document.body.append(link);
  link.click();
  link.remove();
  toast(`Preparing ZIP of ${plural(ids.length, "file")}…`, "info", 5000);
}
async function bulkFavorite() {
  const ids = bulkIds();
  if (!ids.length) return;
  try {
    const data = await api("/api/batch/favorite", { method: "POST", body: { item_ids: ids, favorite: true } });
    toast(`Added ${plural(data.updated, "file")} to favorites.`, "success");
    await Promise.all([loadNav(), loadItems({ reset: true })]);
  } catch (error) { toast(error.message, "error"); }
}
async function bulkCopyLinks() {
  const ids = bulkIds();
  if (!ids.length) return;
  try {
    const data = await api(`/api/batch/info?ids=${ids.join(",")}`);
    const lines = data.items.map((item) =>
      item.telegram_link ? `${item.name} — ${item.telegram_link}` : item.name
    );
    await navigator.clipboard.writeText(lines.join("\n"));
    toast(`Copied ${plural(lines.length, "link")} to the clipboard.`, "success");
  } catch (error) { toast(error.message, "error"); }
}
function promptBulkMove() {
  const ids = bulkIds();
  if (!ids.length) return;
  const input = inputEl({ type: "text", value: S.folder || "", maxlength: "180", autocomplete: "off", list: "bulk-folder-options", placeholder: "Folder name" });
  const datalist = h("datalist", { id: "bulk-folder-options" });
  for (const folder of S.nav.folders || []) datalist.append(h("option", { value: folder.folder }));
  const quick = h("div", { class: "dialog-list" });
  for (const folder of S.nav.folders || []) {
    const chip = h("button", { type: "button", text: folder.folder });
    chip.addEventListener("click", () => { input.value = folder.folder; });
    quick.append(chip);
  }
  openModal({
    title: `Move ${plural(ids.length, "file")}`,
    subtitle: "Files stay in Telegram; only their folder in the explorer changes.",
    content: h("div", {}, field("Move to folder", input, "Type a new name to create a folder."), datalist, quick),
    actions: [
      { label: "Cancel", onClick: closeModal },
      {
        label: "Move",
        class: "primary",
        onClick: async () => {
          const folder = input.value.trim();
          if (!folder) { toast("Choose or type a folder name.", "error"); return; }
          try {
            const data = await api("/api/batch/move", { method: "POST", body: { item_ids: ids, folder } });
            closeModal();
            clearSelection();
            toast(`Moved ${plural(data.moved, "file")} to ${data.folder}.`, "success");
            await Promise.all([loadNav(), loadItems({ reset: true })]);
          } catch (error) { toast(error.message, "error"); }
        }
      }
    ]
  });
  input.focus();
}
function promptBulkDelete() {
  const ids = bulkIds();
  if (!ids.length) return;
  const loaded = S.items.filter((entry) => S.selection.has(entry.id));
  const total = loaded.reduce((sum, entry) => sum + (entry.size || 0), 0);
  const remove = h("button", { class: "modal-option", type: "button" },
    h("span", {},
      h("strong", { text: `Remove ${plural(ids.length, "file")} from this library` }),
      h("span", { text: "Hides the entries in the explorer and in future syncs. The Telegram messages are kept." })
    )
  );
  const remote = h("button", { class: "modal-option danger", type: "button" },
    h("span", {},
      h("strong", { text: `Delete ${plural(ids.length, "file")} from Telegram` }),
      h("span", { text: `Deletes the channel messages for every member${total ? ` · ${fmtSize(total)}` : ""}. This cannot be undone.` })
    )
  );
  remove.addEventListener("click", async () => {
    closeModal();
    try {
      const data = await api("/api/batch/delete", { method: "POST", body: { item_ids: ids, remote: false } });
      clearSelection();
      toast(`Removed ${plural(data.deleted, "file")} from the library. You can restore them from Hidden.`, "success", 6000);
      await Promise.all([loadNav(), refreshLibrary(false)]);
    } catch (error) { toast(error.message, "error"); }
  });
  remote.addEventListener("click", async () => {
    closeModal();
    try {
      const data = await api("/api/batch/delete", { method: "POST", body: { item_ids: ids, remote: true } });
      clearSelection();
      toast(`Deleted ${plural(data.deleted, "file")} from Telegram.`, "success");
      await Promise.all([loadNav(), refreshLibrary(false)]);
    } catch (error) { toast(error.message, "error"); }
  });
  openModal({
    title: `Delete ${plural(ids.length, "file")}?`,
    subtitle: total ? `${plural(ids.length, "file")} · ${fmtSize(total)}` : undefined,
    content: h("div", {},
      h("p", { text: "Choose what should happen to the selected files." }),
      remove,
      remote,
      h("p", { class: "modal-note", text: "You can close this dialog to keep the files." })
    ),
    actions: [{ label: "Cancel", onClick: closeModal }]
  });
}
function openBulkMenu(event) {
  showContextMenu(event.clientX, event.clientY, [
    { label: `Download ${plural(S.selection.size, "file")} (ZIP)`, icon: "download", onClick: bulkDownload },
    { label: "Move to folder…", icon: "move", onClick: promptBulkMove },
    { label: "Add to favorites", icon: "star", onClick: bulkFavorite },
    { label: "Copy Telegram links", icon: "link", onClick: bulkCopyLinks },
    { separator: true },
    { label: `Delete ${plural(S.selection.size, "file")}…`, icon: "trash", danger: true, onClick: promptBulkDelete }
  ]);
}

/* --------------------------------------------------------------- dialogs */
function openModal(options) {
  const root = $("modalRoot");
  $("modalTitle").textContent = options.title || "";
  const subtitle = $("modalSubtitle");
  subtitle.hidden = !options.subtitle;
  subtitle.textContent = options.subtitle || "";
  const body = $("modalBody");
  body.replaceChildren();
  if (options.content) body.append(options.content);
  const actions = $("modalActions");
  actions.replaceChildren();
  for (const action of options.actions || []) {
    const button = h("button", { class: `btn ${action.class || ""}`.trim(), type: "button", text: action.label });
    button.addEventListener("click", async () => {
      if (action.onClick) {
        let busy = false;
        const setBusy = (value) => {
          busy = value;
          button.disabled = value;
          if (value) button.textContent = "Working…";
          else button.textContent = action.label;
        };
        try {
          await action.onClick(setBusy);
        } finally {
          if (!busy) setBusy(false);
        }
      }
    });
    actions.append(button);
  }
  $("modalBox").classList.toggle("wide", Boolean(options.wide));
  root.hidden = false;
  const firstInput = body.querySelector("input, textarea, select");
  if (firstInput) setTimeout(() => firstInput.focus(), 30);
}
function closeModal() {
  $("modalRoot").hidden = true;
  $("modalBody").replaceChildren();
  $("modalActions").replaceChildren();
}
function promptRename() {
  const item = selectedItem();
  if (!item) return;
  const input = inputEl({ type: "text", value: item.name, maxlength: "180", autocomplete: "off" });
  const content = h("div", {},
    field("File name", input, "The new name is saved in the library and set as the Telegram caption. Telegram keeps the original file metadata."),
    item.kind === "document" ? h("p", { class: "modal-note", text: "For documents Telegram cannot change the original filename metadata without re-uploading, but the library and caption use the new name." }) : null
  );
  openModal({
    title: "Rename file",
    content,
    actions: [
      { label: "Cancel", onClick: closeModal },
      {
        label: "Rename",
        class: "primary",
        onClick: async () => {
          const name = input.value.trim();
          if (!name) { toast("A file name cannot be empty.", "error"); return; }
          try {
            const data = await api(`/api/items/${item.id}`, { method: "PATCH", body: { name } });
            closeModal();
            if (data.warning) toast(data.warning, "info", 8000);
            else toast("Renamed.", "success");
            await Promise.all([loadNav(), loadItems({ reset: true })]);
            selectItem(item.id);
          } catch (error) {
            toast(error.message, "error");
          }
        }
      }
    ]
  });
  input.focus();
  const dot = input.value.lastIndexOf(".");
  input.setSelectionRange(0, dot > 0 ? dot : input.value.length);
}
function promptMove() {
  const item = selectedItem();
  if (!item) return;
  const input = inputEl({ type: "text", value: item.folder || "", maxlength: "180", autocomplete: "off", list: "folder-options", placeholder: "Folder name" });
  const datalist = h("datalist", { id: "folder-options" });
  for (const folder of S.nav.folders || []) datalist.append(h("option", { value: folder.folder }));
  const quick = h("div", { class: "dialog-list" });
  for (const folder of S.nav.folders || []) {
    const chip = h("button", { type: "button", text: folder.folder });
    chip.addEventListener("click", () => { input.value = folder.folder; });
    quick.append(chip);
  }
  const content = h("div", {},
    field("Move to folder", input, "Type a new name to create a folder."),
    datalist,
    quick,
    h("p", { class: "modal-note", text: "Folders are part of the explorer’s local index. The file stays in the same Telegram channel." })
  );
  openModal({
    title: "Move file",
    subtitle: item.name,
    content,
    actions: [
      { label: "Cancel", onClick: closeModal },
      {
        label: "Move",
        class: "primary",
        onClick: async () => {
          const folder = input.value.trim();
          if (!folder) { toast("Choose or type a folder name.", "error"); return; }
          try {
            await api(`/api/items/${item.id}`, { method: "PATCH", body: { folder } });
            closeModal();
            toast("Moved.", "success");
            await refreshLibrary(false);
            if (S.items.some((entry) => entry.id === item.id)) selectItem(item.id);
            else clearSelection();
          } catch (error) { toast(error.message, "error"); }
        }
      }
    ]
  });
}
function promptTags() {
  const item = selectedItem();
  if (!item) return;
  const input = inputEl({ type: "text", value: (item.tag_list || []).join(" "), autocomplete: "off", placeholder: "summer project tutorial" });
  const content = h("div", {},
    field("Tags", input, "Separate tags with spaces or commas. Search accepts a plain word or #tag."),
    h("p", { class: "modal-note", text: "Tags are stored in the local library and mirrored to the bot index when it is linked." })
  );
  openModal({
    title: "Edit tags",
    subtitle: item.name,
    content,
    actions: [
      { label: "Cancel", onClick: closeModal },
      {
        label: "Save",
        class: "primary",
        onClick: async () => {
          try {
            await api(`/api/items/${item.id}`, { method: "PATCH", body: { tags: input.value } });
            closeModal();
            toast("Tags updated.", "success");
            await Promise.all([loadNav(), loadItems({ reset: true })]);
            selectItem(item.id);
          } catch (error) { toast(error.message, "error"); }
        }
      }
    ]
  });
}
function promptNote(item) {
  if (!item) return;
  const area = h("textarea", { class: "note-input", rows: "6", maxlength: "4000", placeholder: "Write a note only you can see…" });
  area.value = item.note || "";
  openModal({
    title: item.note ? "Edit file note" : "Add file note",
    subtitle: item.name,
    content: h("div", {},
      h("div", { class: "field" },
        h("label", { for: "file-note", text: "Note" }),
        area,
        h("div", { class: "hint", text: "Notes stay in the local index, are included in search, and are never sent to Telegram." })
      )
    ),
    actions: [
      { label: "Cancel", onClick: closeModal },
      {
        label: "Save",
        class: "primary",
        onClick: async () => {
          try {
            await api(`/api/items/${item.id}`, { method: "PATCH", body: { note: area.value } });
            closeModal();
            toast(area.value.trim() ? "Note saved." : "Note cleared.", "success");
            await loadItems({ reset: true });
            if (S.items.some((entry) => entry.id === item.id)) selectItem(item.id);
            else clearSelection();
          } catch (error) { toast(error.message, "error"); }
        }
      }
    ]
  });
  area.focus();
}
function promptFolderProperties(target) {
  const folder = typeof target === "string" ? folderEntry(target) : target;
  if (!folder) return;
  const icon = inputEl({ type: "text", maxlength: "32", value: folder.icon || "", placeholder: "📁", autocomplete: "off" });
  const note = h("textarea", { class: "note-input", rows: "5", maxlength: "4000", placeholder: "What lives in this folder?" });
  note.value = folder.note || "";
  const palette = h("div", { class: "icon-palette" });
  const choices = ["📁", "🗂️", "🎬", "🎵", "🖼️", "📄", "📚", "🎮", "🏠", "💼", "⭐", "❤️", "🔒", "🧰", "☁️", "🎨"];
  const reset = h("button", { class: "link-btn", type: "button", text: "Use the default icon" });
  for (const value of choices) {
    const choice = h("button", {
      class: "icon-choice" + (folder.icon === value ? " active" : ""),
      type: "button",
      text: value,
      title: value
    });
    choice.addEventListener("click", () => {
      icon.value = value;
      palette.querySelectorAll(".icon-choice").forEach((node) => node.classList.toggle("active", node === choice));
    });
    palette.append(choice);
  }
  reset.addEventListener("click", () => {
    icon.value = "";
    palette.querySelectorAll(".icon-choice").forEach((node) => node.classList.remove("active"));
  });
  const content = h("div", {},
    field("Icon", icon, "Paste any emoji or short text, or pick one below."),
    palette,
    reset,
    field("Folder note", note, "Folder notes are local, searchable, and never sent to Telegram.")
  );
  openModal({
    title: "Folder icon and note",
    subtitle: folder.folder,
    content,
    actions: [
      { label: "Cancel", onClick: closeModal },
      {
        label: "Save",
        class: "primary",
        onClick: async () => {
          try {
            await api("/api/folders", { method: "PATCH", body: { name: folder.folder, icon: icon.value, note: note.value } });
            closeModal();
            await loadNav();
            if (S.selectedFolderPath) renderPreview();
            toast("Folder updated.", "success");
          } catch (error) { toast(error.message, "error"); }
        }
      }
    ]
  });
}
function newFilterState() {
  return { min: "", max: "", after: "", before: "", note: false, recursive: false };
}
function promptFilters() {
  const min = inputEl({ type: "number", min: "0", step: "0.1", value: S.filters.min, placeholder: "Any" });
  const max = inputEl({ type: "number", min: "0", step: "0.1", value: S.filters.max, placeholder: "Any" });
  const after = inputEl({ type: "date", value: S.filters.after });
  const before = inputEl({ type: "date", value: S.filters.before });
  const note = inputEl({ type: "checkbox" });
  note.checked = S.filters.note;
  const recursive = inputEl({ type: "checkbox" });
  recursive.checked = S.filters.recursive;
  recursive.disabled = !S.folder;
  const check = (input, label, hint) => h("label", { class: "check" },
    input,
    h("span", {}, h("strong", { text: label }), hint ? h("small", { text: hint }) : null)
  );
  const content = h("div", {},
    h("div", { class: "filter-grid" },
      field("Minimum size (MB)", min),
      field("Maximum size (MB)", max),
      field("Telegram date from", after),
      field("Telegram date to", before)
    ),
    h("div", { class: "filter-checks" },
      check(note, "Only files with notes"),
      S.folder ? check(recursive, "Include subfolders", `Also search inside ${S.folder}`) : null
    ),
    h("p", { class: "modal-note", text: "Filters combine with the search box, type filter, folder and tag. Dates use the file’s Telegram date." })
  );
  openModal({
    title: "Advanced filters",
    content,
    wide: true,
    actions: [
      { label: "Cancel", onClick: closeModal },
      {
        label: "Clear",
        onClick: async () => {
          S.filters = newFilterState();
          localStorage.setItem("tfe_filters", JSON.stringify(S.filters));
          savePrefs({ filters: S.filters });
          closeModal();
          updateFilterBadge();
          await loadItems({ reset: true });
        }
      },
      {
        label: "Apply",
        class: "primary",
        onClick: async () => {
          const minValue = min.value.trim();
          const maxValue = max.value.trim();
          if (minValue && maxValue && Number(minValue) > Number(maxValue)) {
            toast("The minimum size is larger than the maximum size.", "error");
            return;
          }
          if (after.value && before.value && after.value > before.value) {
            toast("The start date is after the end date.", "error");
            return;
          }
          S.filters = {
            min: minValue, max: maxValue,
            after: after.value, before: before.value,
            note: note.checked, recursive: recursive.checked
          };
          localStorage.setItem("tfe_filters", JSON.stringify(S.filters));
          savePrefs({ filters: S.filters });
          closeModal();
          updateFilterBadge();
          updateBreadcrumb();
          await loadItems({ reset: true });
        }
      }
    ]
  });
}
function promptDelete() {
  const item = selectedItem();
  if (!item) return;
  const remove = h("button", { class: "modal-option", type: "button" },
    h("span", {},
      h("strong", { text: item.hidden ? "Restore to this library" : "Remove from this library" }),
      h("span", {
        text: item.hidden
          ? "Brings the file back into All files. The Telegram message was never touched."
          : "Hides the entry in the explorer and in future syncs. The Telegram message is kept."
      })
    )
  );
  const remote = h("button", { class: "modal-option danger", type: "button" },
    h("span", {},
      h("strong", { text: "Delete from Telegram" }),
      h("span", { text: "Deletes the channel message for every member. This cannot be undone." })
    )
  );
  remove.addEventListener("click", async () => {
    closeModal();
    if (item.hidden) { await restoreItem(item); return; }
    try {
      await api(`/api/items/${item.id}?remote=0`, { method: "DELETE" });
      clearSelection();
      toast("Removed from the library. You can restore it from Hidden.", "success", 6000);
      await refreshLibrary(false);
    } catch (error) { toast(error.message, "error"); }
  });
  remote.addEventListener("click", async () => {
    closeModal();
    try {
      await api(`/api/items/${item.id}?remote=1`, { method: "DELETE" });
      clearSelection();
      toast("Deleted from Telegram.", "success");
      await refreshLibrary(false);
    } catch (error) { toast(error.message, "error"); }
  });
  openModal({
    title: item.hidden ? "Restore or delete file" : "Delete file",
    subtitle: item.name,
    content: h("div", {},
      h("p", { text: "Choose what should happen to this file." }),
      remove,
      remote,
      h("p", { class: "modal-note", text: "You can close this dialog to keep the file." })
    ),
    actions: [{ label: "Cancel", onClick: closeModal }]
  });
}
function promptFavorite() {
  const item = selectedItem();
  if (!item) return;
  toggleFavorite(item);
}
async function toggleFavorite(item) {
  try {
    await api(`/api/items/${item.id}`, { method: "PATCH", body: { favorite: !item.favorite } });
    toast(item.favorite ? "Removed from favorites." : "Added to favorites.", "success");
    await Promise.all([loadNav(), loadItems({ reset: true })]);
    if (S.items.some((entry) => entry.id === item.id)) selectItem(item.id);
    else clearSelection();
  } catch (error) { toast(error.message, "error"); }
}
async function restoreItem(item) {
  if (!item) return;
  try {
    await api(`/api/items/${item.id}`, { method: "PATCH", body: { hidden: false } });
    clearSelection();
    toast("Restored to the library.", "success");
    await Promise.all([loadNav(), loadItems({ reset: true })]);
  } catch (error) { toast(error.message, "error"); }
}
function promptNewFolder(parent) {
  const base = typeof parent === "string" ? parent : (S.folder || "");
  const input = inputEl({ type: "text", placeholder: base ? "New subfolder" : "New folder", maxlength: "180", autocomplete: "off" });
  openModal({
    title: base ? "New subfolder" : "New folder",
    subtitle: base || undefined,
    content: field("Folder name", input, "Folders are virtual; files remain in your Telegram channel. Nested paths are created automatically."),
    actions: [
      { label: "Cancel", onClick: closeModal },
      {
        label: "Create",
        class: "primary",
        onClick: async () => {
          const name = input.value.trim();
          if (!name) { toast("Enter a folder name.", "error"); return; }
          const target = base ? `${base}/${name}` : name;
          try {
            const data = await api("/api/folders", { method: "POST", body: { name: target } });
            closeModal();
            await loadNav();
            openFolder(data.folder);
            toast("Folder created.", "success");
          } catch (error) { toast(error.message, "error"); }
        }
      }
    ]
  });
}
function promptRenameFolder(folder) {
  const leaf = folder.name || folder.folder;
  const input = inputEl({ type: "text", value: leaf, maxlength: "180", autocomplete: "off" });
  openModal({
    title: "Rename folder",
    subtitle: folder.folder,
    content: field("Folder name", input, "Renaming changes this folder and everything inside it. Use the Move command on files to change their folder."),
    actions: [
      { label: "Cancel", onClick: closeModal },
      {
        label: "Rename",
        class: "primary",
        onClick: async () => {
          const name = input.value.trim();
          if (!name) { toast("Enter a folder name.", "error"); return; }
          try {
            const data = await api("/api/folders", { method: "PATCH", body: { name: folder.folder, new_name: name } });
            closeModal();
            const oldPath = folder.folder;
            const newPath = data.folder;
            const oldLower = oldPath.toLowerCase();
            if (S.folder.toLowerCase() === oldLower) S.folder = newPath;
            else if (S.folder.toLowerCase().startsWith(oldLower + "/")) S.folder = newPath + S.folder.slice(oldPath.length);
            if (S.selectedFolderPath) {
              const selLower = S.selectedFolderPath.toLowerCase();
              if (selLower === oldLower) S.selectedFolderPath = newPath;
              else if (selLower.startsWith(oldLower + "/")) S.selectedFolderPath = newPath + S.selectedFolderPath.slice(oldPath.length);
            }
            await loadNav();
            await loadItems({ reset: true });
            toast("Folder renamed.", "success");
          } catch (error) { toast(error.message, "error"); }
        }
      }
    ]
  });
  input.focus();
  input.select();
}
function downloadFolder(folder) {
  if (!folder) return;
  const link = h("a", {
    href: `/api/folders/download?name=${encodeURIComponent(folder.folder)}`,
    download: ""
  });
  document.body.append(link);
  link.click();
  link.remove();
  toast("Preparing ZIP download…", "info", 5000);
}
function promptDeleteFolder(folder) {
  openModal({
    title: "Delete folder?",
    subtitle: folder.folder,
    content: h("div", {},
      h("p", { text: "Only empty folders can be deleted. The files stay in Telegram and keep their names." }),
      h("p", { class: "modal-note", text: "To delete a folder with files, move or delete the files first. Subfolders must also be empty." })
    ),
    actions: [
      { label: "Cancel", onClick: closeModal },
      {
        label: "Delete",
        class: "danger",
        onClick: async () => {
          try {
            await api(`/api/folders?name=${encodeURIComponent(folder.folder)}`, { method: "DELETE" });
            closeModal();
            const target = folder.folder.toLowerCase();
            if (S.selectedFolderPath && S.selectedFolderPath.toLowerCase() === target) S.selectedFolderPath = null;
            if (S.folder.toLowerCase() === target || S.folder.toLowerCase().startsWith(target + "/")) {
              const cut = folder.folder.lastIndexOf("/");
              S.folder = cut > 0 ? folder.folder.slice(0, cut) : "";
              await loadNav();
              await loadItems({ reset: true });
            } else {
              await loadNav();
              renderItems();
            }
            toast("Folder removed.", "success");
          } catch (error) { toast(error.message, "error"); }
        }
      }
    ]
  });
}
function openFolderMenu(event, folder) {
  showContextMenu(event.clientX, event.clientY, [
    { label: "Open", icon: "folderOpen", onClick: () => openFolder(folder.folder) },
    { label: "Download as ZIP", icon: "download", onClick: () => downloadFolder(folder) },
    { separator: true },
    { label: "Icon and note…", icon: "palette", onClick: () => promptFolderProperties(folder) },
    { label: "New subfolder…", icon: "folderPlus", onClick: () => promptNewFolder(folder.folder) },
    { label: "Rename folder…", icon: "edit", onClick: () => promptRenameFolder(folder) },
    { separator: true },
    {
      label: "Delete empty folder",
      icon: "trash",
      danger: true,
      disabled: folder.n > 0,
      onClick: () => promptDeleteFolder(folder)
    }
  ]);
}
function promptSettings() {
  const st = S.status || {};
  const stats = (S.nav && S.nav.stats) || (st.stats || {});
  const displayName = st.user
    ? [st.user.first_name, st.user.last_name].filter(Boolean).join(" ") || st.user.username || "Telegram account"
    : "Not signed in";
  const account = h("div", { class: "settings-account" },
    h("span", { class: "settings-avatar", text: initials(displayName) }),
    h("span", {},
      h("div", { class: "settings-name", text: displayName }),
      h("div", { class: "settings-sub", text: st.user ? (st.user.username ? `@${st.user.username}` : st.user.phone || "") : "Connect Telegram to browse your channel." })
    )
  );
  const sectionChannel = h("div", { class: "settings-section" },
    h("h3", { text: "Storage channel" }),
    h("div", { class: "settings-row" }, h("span", { text: "Channel" }), h("span", { class: "value", text: st.vault ? st.vault.title : "Not chosen" })),
    h("div", { class: "settings-row" }, h("span", { text: "Channel ID" }), h("span", { class: "value", text: st.vault ? String(st.vault.id) : "—" })),
    h("div", { class: "settings-actions" },
      btn("Change channel…", "btn", () => {
        if (!st.authorized) { toast("Sign in first.", "error"); return; }
        closeModal();
        S.authStage = "channel";
        S.loginForced = true;
        S.selectedChannel = null;
        showLogin();
      }),
      btn("Open in Telegram", "btn", () => {
        if (!st.vault) return;
        const link = st.vault.username ? `https://t.me/${st.vault.username}` : `https://t.me/c/${Math.abs(Number(st.vault.id)) - 1000000000000}`;
        window.open(link, "_blank", "noopener");
      })
    )
  );
  const sectionLibrary = h("div", { class: "settings-section" },
    h("h3", { text: "Library" }),
    h("div", { class: "settings-row" }, h("span", { text: "Files" }), h("span", { class: "value", text: String(stats.count || 0) })),
    h("div", { class: "settings-row" }, h("span", { text: "Total size" }), h("span", { class: "value", text: fmtSize(stats.size || 0) })),
    h("div", { class: "settings-row" }, h("span", { text: "Favorites" }), h("span", { class: "value", text: String(stats.favorites || 0) })),
    h("div", { class: "settings-row" }, h("span", { text: "Last indexed" }), h("span", { class: "value", text: stats.last_sync ? fmtDate(stats.last_sync) : "Never" })),
    h("div", { class: "settings-actions" },
      btn("Sync now", "btn", () => { closeModal(); if (ready()) startSync(false); }),
      btn("Reload library", "btn", () => { closeModal(); refreshLibrary(false); })
    )
  );
  const sectionAppearance = h("div", { class: "settings-section" },
    h("h3", { text: "Appearance" }),
    themeGrid(),
    h("p", { class: "modal-note", text: "Mica tints the window with your wallpaper palette. Acrylic adds translucent glass. System follows the Windows light or dark setting." })
  );
  const sectionSecurity = h("div", { class: "settings-section" },
    h("h3", { text: "Security" }),
    h("div", { class: "settings-row" }, h("span", { text: "App lock" }), h("span", { class: "value", text: st.pin_set ? "PIN enabled" : "No PIN" })),
    h("div", { class: "settings-actions" },
      st.pin_set
        ? btn("Change PIN…", "btn", promptPinChange)
        : btn("Create PIN…", "btn", promptPinSetup),
      st.pin_set ? btn("Remove PIN…", "btn danger", promptPinRemove) : null
    ),
    h("p", { class: "modal-note", text: "The PIN is asked when the app opens and hides the library until you enter it. The lock button in the title bar locks the app immediately. Only a hash of the PIN is stored." })
  );
  const sectionConnection = h("div", { class: "settings-section" },
    h("h3", { text: "Connection" }),
    h("div", { class: "settings-row" }, h("span", { text: "Telegram" }), h("span", { class: "value", text: st.authorized ? "Signed in" : "Not signed in" })),
    st.state === "error" && st.error ? h("p", { class: "modal-note", text: st.error }) : null,
    h("div", { class: "settings-actions" },
      btn("Reconnect", "btn", async () => {
        try {
          S.status = await api("/api/reconnect", { method: "POST" });
          updateChrome();
          toast("Reconnected.", "success");
          closeModal();
          if (ready()) refreshLibrary(true);
          else { renderLogin(); showLogin(); }
        } catch (error) { toast(error.message, "error"); }
      }),
      st.authorized ? btn("Log out…", "btn danger", () => promptLogout()) : null,
      btn("Quit app", "btn", quitApp)
    )
  );
  const shortcuts = h("div", { class: "settings-section" },
    h("h3", { text: "Keyboard shortcuts" }),
    h("div", { class: "shortcut-grid" },
      h("kbd", { text: "F2" }), h("span", { text: "Rename file or folder" }),
      h("kbd", { text: "Delete" }), h("span", { text: "Delete file or empty folder" }),
      h("kbd", { text: "Enter / Space" }), h("span", { text: "Open file or folder" }),
      h("kbd", { text: "↑ / ↓" }), h("span", { text: "Move selection" }),
      h("kbd", { text: "Ctrl F" }), h("span", { text: "Search" }),
      h("kbd", { text: "Alt ← / →" }), h("span", { text: "Back / forward" }),
      h("kbd", { text: "Esc" }), h("span", { text: "Close dialog or player" })
    )
  );
  const notes = h("div", { class: "settings-section" },
    h("h3", { text: "Good to know" }),
    h("p", { class: "modal-note", text: "Files live in your private Telegram channel. Folders, tags, favorites and names are the local index; renaming also updates the Telegram caption." }),
    h("p", { class: "modal-note", text: "The Telegram session and library database are stored in your Windows profile (%APPDATA%\\TelegramFileExplorer). The bot token is never used here." }),
    h("p", { class: "modal-note", text: `Files above your Telegram account limit (${uploadLimitLabel()} per file) are split into archive parts automatically. Picking "Download complete file" on any part fetches all parts and joins them back into the original file. Deleting from Telegram removes the message from the channel.` })
  );
  const content = h("div", {}, account, sectionAppearance, sectionSecurity, sectionChannel, sectionLibrary, sectionConnection, shortcuts, notes);
  openModal({
    title: "Settings and help",
    subtitle: "Account, appearance, channel, library and shortcuts",
    content,
    wide: true,
    actions: [{ label: "Close", onClick: closeModal }]
  });
}
async function quitApp() {
  closeModal();
  try { await api("/api/quit", { method: "POST" }); } catch (_) { /* shutting down */ }
  document.body.replaceChildren(
    h("div", {
      style: "display:grid;place-items:center;height:100vh;padding:32px;text-align:center;font:15px system-ui,sans-serif;color:#667085"
    },
      h("div", {},
        h("strong", { text: "Telegram File Explorer has quit." }),
        h("p", { text: "You can close this window." })
      )
    )
  );
  try { window.close(); } catch (_) { /* browser may refuse */ }
}
function promptLogout() {
  openModal({
    title: "Log out of Telegram?",
    content: h("div", {},
      h("p", { text: "The Telegram session on this PC will be removed. Your files stay in the channel, and the local library keeps its names and folders." }),
      h("p", { class: "modal-note", text: "You will need a new login code to use the explorer again." })
    ),
    actions: [
      { label: "Cancel", onClick: closeModal },
      {
        label: "Log out",
        class: "danger",
        onClick: async () => {
          try {
            S.status = await api("/api/logout", { method: "POST" });
            S.authStage = "";
            S.selectedChannel = null;
            S.items = [];
            S.nav = { folders: [], tags: [], kinds: [], stats: { count: 0, size: 0, favorites: 0 } };
            S.selectedId = null;
            S.navMode = "all";
            S.hiddenOnly = false;
            S.folder = "";
            S.tag = "";
            S.kind = "";
            S.q = "";
            resetHistory();
            closeModal();
            clearSelection();
            renderSidebar();
            renderItems();
            updateChrome();
            renderLogin();
            showLogin();
            toast("Logged out.", "success");
          } catch (error) { toast(error.message, "error"); }
        }
      }
    ]
  });
}

/* -------------------------------------------------------------- context */
function showContextMenu(x, y, entries) {
  const menu = $("contextMenu");
  menu.replaceChildren();
  for (const entry of entries) {
    if (!entry) continue;
    if (entry.separator) {
      menu.append(h("div", { class: "menu-sep" }));
      continue;
    }
    const node = h("button", { class: `menu-item ${entry.danger ? "danger" : ""}`.trim(), type: "button", disabled: entry.disabled ? true : null },
      iconNode(entry.icon || "file", "menu-icon"),
      h("span", { text: entry.label }),
      entry.key ? h("span", { class: "menu-key", text: entry.key }) : null
    );
    node.addEventListener("click", () => {
      hideContextMenu();
      if (!entry.disabled && entry.onClick) entry.onClick();
    });
    menu.append(node);
  }
  menu.hidden = false;
  const width = 224;
  const height = menu.offsetHeight || entries.length * 31;
  menu.style.left = `${Math.max(6, Math.min(x, window.innerWidth - width - 8))}px`;
  menu.style.top = `${Math.max(6, Math.min(y, window.innerHeight - height - 8))}px`;
}
function hideContextMenu() {
  $("contextMenu").hidden = true;
}
function openItemMenu(event, item) {
  event.preventDefault();
  selectItem(item.id);
  const entries = [
    { label: "Open", icon: "play", key: "Enter", onClick: () => openViewerFor(item) },
    { label: "Download", icon: "download", onClick: () => downloadItem(item) },
    item.part_of && item.part_of.count > 1
      ? { label: `Download complete file (${item.part_of.count} parts)`, icon: "download", onClick: () => startMergeDownload(item) }
      : null,
    item.hidden ? { label: "Restore to library", icon: "eyeOff", onClick: () => restoreItem(item) } : null,
    { separator: true },
    { label: "Rename…", icon: "edit", key: "F2", onClick: () => promptRename() },
    { label: "Move to folder…", icon: "move", onClick: () => promptMove() },
    { label: "Edit tags…", icon: "tag", onClick: () => promptTags() },
    { label: item.note ? "Edit note…" : "Add note…", icon: "note", onClick: () => promptNote(item) },
    { label: item.favorite ? "Remove from favorites" : "Add to favorites", icon: "star", onClick: () => toggleFavorite(item) },
    { separator: true }
  ];
  if (item.telegram_link) {
    entries.push({ label: "Open in Telegram", icon: "link", onClick: () => window.open(item.telegram_link, "_blank", "noopener") });
    entries.push({ separator: true });
  }
  entries.push({ label: "Delete…", icon: "trash", key: "Del", danger: true, onClick: () => promptDelete() });
  showContextMenu(event.clientX, event.clientY, entries);
}

/* --------------------------------------------------------------- uploads */
function uploadEntries(input) {
  return Array.from(input || [])
    .map((entry) => {
      const file = entry && entry.file ? entry.file : entry;
      if (!file || file.size === undefined) return null;
      const rel = String((entry && entry.rel) || file.webkitRelativePath || file.name || "").replace(/\\/g, "/");
      return { file, rel: rel || file.name };
    })
    .filter(Boolean);
}
function uploadRootLabel(entries) {
  if (entries.length === 1) return entries[0].rel;
  const first = entries[0].rel.split("/");
  return first.length > 1 && first[0] ? `${first[0]} (${plural(entries.length, "file")})` : plural(entries.length, "file");
}
function collectDroppedEntries(dataTransfer) {
  const entries = Array.from((dataTransfer && dataTransfer.items) || [])
    .map((item) => (typeof item.webkitGetAsEntry === "function" ? item.webkitGetAsEntry() : null))
    .filter(Boolean);
  if (!entries.length) {
    return Promise.resolve(
      Array.from((dataTransfer && dataTransfer.files) || []).map((file) => ({ file, rel: file.name }))
    );
  }
  const collected = [];
  return (async () => {
    for (const entry of entries) await walkDroppedEntry(entry, "", collected);
    return collected;
  })();
}
function walkDroppedEntry(entry, prefix, collected) {
  return new Promise((resolve) => {
    if (!entry) { resolve(); return; }
    if (entry.isFile) {
      entry.file(
        (file) => { collected.push({ file, rel: `${prefix}${file.name}` }); resolve(); },
        () => resolve()
      );
      return;
    }
    if (!entry.isDirectory) { resolve(); return; }
    const reader = entry.createReader();
    const readBatch = () => {
      reader.readEntries(
        async (batch) => {
          if (!batch.length) { resolve(); return; }
          for (const child of batch) await walkDroppedEntry(child, `${prefix}${entry.name}/`, collected);
          readBatch();
        },
        () => resolve()
      );
    };
    readBatch();
  });
}
function uploadLimit() {
  const value = Number(S.status && S.status.max_upload);
  return Number.isFinite(value) && value > 0 ? value : 2 * 1024 * 1024 * 1024;
}
function uploadLimitLabel() {
  return `${Math.round(uploadLimit() / (1024 ** 3))} GB`;
}
function splitMax() {
  const value = Number(S.status && S.status.split_max);
  return Number.isFinite(value) && value > 0 ? value : 64 * 1024 * 1024 * 1024;
}
function startUpload(input) {
  if (!ready()) { renderLogin(); showLogin(); return; }
  if (S.localUpload) {
    toast("Wait for the current upload to finish before adding more files.", "error");
    return;
  }
  const entries = uploadEntries(input);
  if (!entries.length) return;
  const tooBig = entries.find((entry) => entry.file.size > splitMax());
  if (tooBig) {
    toast(`${tooBig.rel} is larger than the ${Math.round(splitMax() / (1024 ** 3))} GB limit this app can split into parts.`, "error", 6000);
    return;
  }
  const total = entries.reduce((sum, entry) => sum + entry.file.size, 0);
  const folder = S.folder || "";
  const client = `c${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const form = new FormData();
  form.append("paths", JSON.stringify(entries.map((entry) => entry.rel)));
  form.append("client", client);
  for (const entry of entries) form.append("files", entry.file, entry.file.name);
  if (folder) form.append("folder", folder);
  const xhr = new XMLHttpRequest();
  S.localUpload = {
    name: uploadRootLabel(entries),
    size: total,
    sent: 0,
    state: "sending",
    client,
    canceled: false,
    xhr
  };
  $("uploadBtn").disabled = true;
  renderUploads();
  showUploadPanel();
  xhr.open("POST", "/api/upload");
  xhr.setRequestHeader("X-TFE", "1");
  xhr.withCredentials = true;
  xhr.upload.onprogress = (event) => {
    if (!event.lengthComputable || !S.localUpload) return;
    S.localUpload.sent = event.loaded;
    renderUploads();
  };
  xhr.onload = async () => {
    const local = S.localUpload;
    S.localUpload = null;
    $("uploadBtn").disabled = !ready();
    if (local && local.canceled) { renderUploads(); return; }
    let data = null;
    try { data = JSON.parse(xhr.responseText || "{}"); } catch (_) { data = {}; }
    if (xhr.status >= 200 && xhr.status < 300) {
      S.transfers = data.transfers || [];
      renderUploads();
      showUploadPanel();
      startTransferPolling();
      setStatus("Uploading to Telegram…");
    } else {
      const message = (data && data.detail) || `Upload failed (${xhr.status})`;
      toast(typeof message === "string" ? message : "Upload failed.", "error", 6000);
      renderUploads();
    }
  };
  xhr.onerror = () => {
    const local = S.localUpload;
    S.localUpload = null;
    $("uploadBtn").disabled = !ready();
    if (!local || !local.canceled) {
      toast("The upload could not reach the local app.", "error");
    }
    renderUploads();
  };
  xhr.send(form);
}
function cancelLocalUpload() {
  const local = S.localUpload;
  if (!local) return;
  local.canceled = true;
  S.localUpload = null;
  try { local.xhr.abort(); } catch (_) { /* request already finished */ }
  $("uploadBtn").disabled = !ready();
  renderUploads();
  setStatus("Upload cancelled");
  toast("Upload cancelled.", "success", 3000);
  // The app may have accepted the body just before the abort landed; make
  // sure any transfers it queued for this batch are cancelled too.
  api("/api/transfers/cancel", { method: "POST", body: { client: local.client } })
    .then(() => fetchTransfers(false))
    .catch(() => {});
}
async function cancelTransfer(id) {
  try {
    await api(`/api/transfers/${encodeURIComponent(id)}/cancel`, { method: "POST" });
    toast("Cancelling…", "success", 2500);
    await fetchTransfers(false);
    startTransferPolling();
  } catch (error) {
    if (error && error.status === 404) {
      toast("That transfer already finished.", "info", 3000);
      await fetchTransfers(false);
      return;
    }
    toast(error.message || "The transfer could not be cancelled.", "error");
  }
}
function showUploadPanel() {
  $("uploadPanel").hidden = false;
}
function transferActive(state) {
  return state === "queued" || state === "uploading" || state === "splitting"
    || state === "downloading" || state === "merging";
}
function renderUploads() {
  const panel = $("uploadPanel");
  const list = $("uploadList");
  const rows = [];
  if (S.localUpload) {
    const local = S.localUpload;
    const pct = local.size ? Math.min(100, Math.round((local.sent / local.size) * 100)) : 0;
    const sub = h("div", { class: "upload-sub" }, "Sending to the app… ");
    const cancel = h("button", { class: "link-btn", type: "button", text: "Cancel" });
    cancel.addEventListener("click", cancelLocalUpload);
    sub.append(cancel);
    rows.push(h("div", { class: "upload-row" },
      h("div", { class: "upload-line" }, h("span", { class: "upload-name", text: local.name, title: local.name }), h("span", { class: "upload-pct", text: `${pct}%` })),
      h("div", { class: "upload-track" }, h("i", { style: `width:${pct}%` })),
      sub
    ));
  }
  for (const transfer of S.transfers) {
    const state = transfer.state;
    const active = transferActive(state);
    const pct = state === "merging" || state === "ready"
      ? 100
      : transfer.size ? Math.min(100, Math.round(((transfer.sent || 0) / transfer.size) * 100)) : active ? 0 : 100;
    let sub;
    if (state === "error") sub = transfer.error;
    else if (state === "cancelled") sub = "Cancelled";
    else if (state === "done") sub = transfer.parts ? `Done · ${transfer.parts} parts uploaded` : "Done";
    else if (state === "queued") sub = "Queued";
    else if (state === "splitting") sub = "Splitting into archive parts…";
    else if (state === "downloading") sub = `Downloading parts · ${fmtSize(transfer.sent || 0)} of ${fmtSize(transfer.size)}`;
    else if (state === "merging") sub = "Joining parts into one file…";
    else if (state === "ready") sub = "Complete file ready to save";
    else sub = `${fmtSize(transfer.sent || 0)} of ${fmtSize(transfer.size)}${transfer.parts ? ` · ${transfer.parts} parts` : ""}`;
    const subLine = h("div", { class: "upload-sub" });
    subLine.append(sub);
    if (state === "ready" && transfer.result_url) {
      const save = h("button", { class: "link-btn", type: "button", text: "Save file" });
      save.addEventListener("click", () => downloadItem({ download_url: transfer.result_url }));
      subLine.append(" ", save);
    }
    if (active) {
      const cancel = h("button", { class: "link-btn", type: "button", text: "Cancel" });
      cancel.addEventListener("click", () => cancelTransfer(transfer.id));
      subLine.append(" ", cancel);
    }
    const pctText = state === "error" ? "!" : state === "cancelled" ? "—" : `${pct}%`;
    rows.push(h("div", { class: `upload-row ${state}` },
      h("div", { class: "upload-line" }, h("span", { class: "upload-name", text: transfer.name, title: transfer.name }), h("span", { class: "upload-pct", text: pctText })),
      h("div", { class: "upload-track" }, h("i", { style: `width:${pct}%` })),
      subLine
    ));
  }
  if (!rows.length) {
    list.replaceChildren(h("div", { class: "upload-empty", text: "No uploads in this session." }));
  } else {
    list.replaceChildren(...rows);
  }
  panel.hidden = !S.localUpload && !S.transfers.length;
}
function startTransferPolling() {
  if (S.transferTimer) return;
  S.transferTimer = setInterval(pollTransfers, 900);
}
async function pollTransfers() {
  try {
    const data = await api("/api/transfers");
    const transfers = data.transfers || [];
    const active = transfers.filter((transfer) => transferActive(transfer.state));
    let newlyDone = 0;
    let newlyFailed = 0;
    let newlyReady = 0;
    let newlyCancelled = 0;
    for (const transfer of transfers) {
      if (transfer.state === "done" && !S.seenTransfers.has(transfer.id)) {
        S.seenTransfers.add(transfer.id);
        newlyDone += 1;
      }
      if (transfer.state === "error" && !S.seenTransfers.has(`e:${transfer.id}`)) {
        S.seenTransfers.add(`e:${transfer.id}`);
        newlyFailed += 1;
        toast(`${transfer.name}: ${transfer.error || "upload failed"}`, "error", 7000);
      }
      if (transfer.state === "ready" && !S.seenTransfers.has(`r:${transfer.id}`)) {
        S.seenTransfers.add(`r:${transfer.id}`);
        newlyReady += 1;
      }
      if (transfer.state === "cancelled" && !S.seenTransfers.has(`c:${transfer.id}`)) {
        S.seenTransfers.add(`c:${transfer.id}`);
        newlyCancelled += 1;
      }
    }
    S.transfers = transfers;
    renderUploads();
    if (newlyDone) {
      await Promise.all([loadNav(), loadItems({ reset: true })]);
      toast(`${plural(newlyDone, "upload")} complete.`, "success");
      setStatus("Upload complete");
    }
    if (newlyReady) {
      toast(`Complete file ready — click Save file in the transfers list.`, "success", 7000);
      setStatus("Merged file ready");
    }
    if (newlyCancelled) {
      // A split upload may have already sent parts; the app removes them
      // when it processes the cancel, so refresh the library.
      await Promise.all([loadNav(), loadItems({ reset: true })]);
      setStatus("Upload cancelled");
    }
    if (!active.length && !S.localUpload) {
      clearInterval(S.transferTimer);
      S.transferTimer = null;
      $("uploadBtn").disabled = !ready();
    }
  } catch (_) {
    /* transient poll failure */
  }
}
async function fetchTransfers(showPanel) {
  try {
    const data = await api("/api/transfers");
    S.transfers = data.transfers || [];
    for (const transfer of S.transfers) {
      if (transfer.state === "done") S.seenTransfers.add(transfer.id);
      if (transfer.state === "error") S.seenTransfers.add(`e:${transfer.id}`);
      if (transfer.state === "ready") S.seenTransfers.add(`r:${transfer.id}`);
    }
    renderUploads();
    if (showPanel && S.transfers.some((transfer) => transferActive(transfer.state))) {
      showUploadPanel();
      startTransferPolling();
    }
  } catch (_) { /* ignore */ }
}

/* ------------------------------------------------------------------ sync */
async function startSync(auto) {
  if (!ready()) {
    if (!auto) { renderLogin(); showLogin(); }
    return;
  }
  if (S.syncTimer) return;
  try {
    const data = await api("/api/sync", { method: "POST" });
    setStatus(data.started ? "Sync started" : "Sync already running");
    pollSync();
  } catch (error) {
    toast(error.message, "error");
  }
}
async function pollSync() {
  if (S.syncTimer) return;
  S.syncTimer = setInterval(syncTick, 800);
  await syncTick();
}
async function syncTick() {
  try {
    const data = await api("/api/sync");
    const sync = data.sync || {};
    renderSyncState(sync);
    if (!sync.running) {
      clearInterval(S.syncTimer);
      S.syncTimer = null;
      $("syncBtn").classList.remove("spinning");
      const key = sync.finished || "done";
      if (S.syncFinalHandled !== key) {
        S.syncFinalHandled = key;
        if (sync.error) toast(sync.error, "error", 7000);
        else toast(`Sync complete — ${plural(sync.stored || 0, "file")} indexed${sync.imported ? `, ${sync.imported} names adopted` : ""}.`, "success", 5000);
        await Promise.all([loadNav(), loadItems({ reset: true }), refreshStatusOnly()]);
        updateChrome();
      }
      setTimeout(() => { $("syncStatus").hidden = true; }, 900);
    }
  } catch (error) {
    clearInterval(S.syncTimer);
    S.syncTimer = null;
    $("syncBtn").classList.remove("spinning");
    $("syncStatus").hidden = true;
    toast(error.message, "error");
  }
}
function renderSyncState(sync) {
  const wrap = $("syncStatus");
  wrap.hidden = false;
  const track = wrap.querySelector(".sync-track");
  const bar = $("syncBar");
  if (sync.total > 0) {
    track.classList.remove("indeterminate");
    bar.style.width = `${Math.min(100, Math.round(((sync.scanned || 0) / sync.total) * 100))}%`;
  } else {
    track.classList.add("indeterminate");
    bar.style.width = "";
  }
  $("syncLabel").textContent = sync.running
    ? `Scanning ${sync.scanned || 0}${sync.total ? ` of ${sync.total}` : ""} · ${sync.stored || 0} stored`
    : `Sync ${sync.error ? "failed" : "complete"}`;
  $("syncBtn").disabled = true;
  $("syncBtn").classList.add("spinning");
  $("statusText").textContent = "Syncing with Telegram…";
  updateChrome();
}
async function refreshStatusOnly() {
  try {
    S.status = await api("/api/status");
    updateChrome();
  } catch (_) { /* ignore */ }
}

/* ---------------------------------------------------------------- events */
function bindEvents() {
  document.querySelectorAll("#nav .nav-item").forEach((node) => {
    node.addEventListener("click", () => {
      if (node.dataset.nav === "recent") navigateScope({ navMode: "recent", folder: "", tag: "", kind: "", sort: "added", dir: "desc" });
      else if (node.dataset.nav === "favorites") navigateScope({ navMode: "favorites", folder: "", tag: "", kind: "", sort: "date", dir: "desc" });
      else if (node.dataset.nav === "hidden") navigateScope({ navMode: "hidden", folder: "", tag: "", kind: "", sort: "date", dir: "desc" });
      else navigateScope({ navMode: "all", folder: "", tag: "", kind: "", sort: "date", dir: "desc" });
    });
  });
  $("backBtn").addEventListener("click", goBack);
  $("forwardBtn").addEventListener("click", goForward);
  $("upBtn").addEventListener("click", goUp);
  $("searchInput").addEventListener("input", debounce(() => {
    S.q = $("searchInput").value.trim();
    updateBreadcrumb();
    loadItems({ reset: true });
  }, 220));
  $("searchInput").addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      $("searchInput").value = "";
      S.q = "";
      updateBreadcrumb();
      loadItems({ reset: true });
      $("searchInput").blur();
    }
  });
  $("kindSelect").addEventListener("change", () => {
    S.kind = $("kindSelect").value;
    updateBreadcrumb();
    loadItems({ reset: true });
  });
  $("sortSelect").addEventListener("change", () => setSort($("sortSelect").value, $("sortSelect").value === "name" ? "asc" : "desc"));
  $("sortDirBtn").addEventListener("click", () => {
    S.dir = S.dir === "asc" ? "desc" : "asc";
    localStorage.setItem("tfe_dir", S.dir);
    savePrefs({ dir: S.dir });
    updateSortArrows();
    loadItems({ reset: true });
  });
  document.querySelectorAll(".col[data-sort]").forEach((node) => {
    node.addEventListener("click", () => setSort(node.dataset.sort));
  });
  document.querySelectorAll(".view-toggle button").forEach((node) => {
    node.addEventListener("click", () => setView(node.dataset.view));
  });
  $("rows").addEventListener("click", (event) => {
    const row = event.target.closest(".row");
    if (!row) return;
    if (row.dataset.folder) selectFolderRow(row.dataset.folder);
    else handleItemClick(Number(row.dataset.id), event);
  });
  $("rows").addEventListener("dblclick", (event) => {
    const row = event.target.closest(".row");
    if (!row) return;
    if (row.dataset.folder) { openFolder(row.dataset.folder); return; }
    selectItem(Number(row.dataset.id));
    const item = selectedItem();
    if (item) openViewerFor(item);
  });
  $("rows").addEventListener("contextmenu", (event) => {
    const row = event.target.closest(".row");
    if (!row) return;
    event.preventDefault();
    if (row.dataset.folder) {
      const folder = folderEntry(row.dataset.folder);
      if (!folder) return;
      selectFolderRow(folder.folder);
      openFolderMenu(event, folder);
      return;
    }
    const item = S.items.find((entry) => entry.id === Number(row.dataset.id));
    if (!item) return;
    if (S.selection.has(item.id) && S.selection.size > 1) { openBulkMenu(event); return; }
    openItemMenu(event, item);
  });
  $("tilesView").addEventListener("click", (event) => {
    const tile = event.target.closest(".tile");
    if (!tile) return;
    if (tile.dataset.folder) selectFolderRow(tile.dataset.folder);
    else handleItemClick(Number(tile.dataset.id), event);
  });
  $("tilesView").addEventListener("dblclick", (event) => {
    const tile = event.target.closest(".tile");
    if (!tile) return;
    if (tile.dataset.folder) { openFolder(tile.dataset.folder); return; }
    selectItem(Number(tile.dataset.id));
    const item = selectedItem();
    if (item) openViewerFor(item);
  });
  $("tilesView").addEventListener("contextmenu", (event) => {
    const tile = event.target.closest(".tile");
    if (!tile) return;
    event.preventDefault();
    if (tile.dataset.folder) {
      const folder = folderEntry(tile.dataset.folder);
      if (!folder) return;
      selectFolderRow(folder.folder);
      openFolderMenu(event, folder);
      return;
    }
    const item = S.items.find((entry) => entry.id === Number(tile.dataset.id));
    if (!item) return;
    if (S.selection.has(item.id) && S.selection.size > 1) { openBulkMenu(event); return; }
    openItemMenu(event, item);
  });
  $("content").addEventListener("click", (event) => {
    if (event.target.closest(".row, .tile, button, a, input, select, .load-more")) return;
    if (S.selection.size || S.selectedId !== null || S.selectedFolderPath) clearSelection();
  });
  $("content").addEventListener("contextmenu", (event) => {
    if (event.target.closest(".row, .tile")) return;
    event.preventDefault();
    if (!ready()) return;
    showContextMenu(event.clientX, event.clientY, [
      { label: "New folder…", icon: "folderPlus", onClick: () => promptNewFolder(S.folder) },
      { separator: true },
      { label: "Upload files…", icon: "upload", onClick: () => $("fileInput").click() },
      { label: "Upload folder…", icon: "uploadFolder", onClick: () => $("folderInput").click() }
    ]);
  });
  $("clearTagBtn").addEventListener("click", () => navigateScope({ navMode: "all", tag: "" }));
  $("newFolderBtn").addEventListener("click", () => promptNewFolder(S.folder));
  $("filterBtn").addEventListener("click", promptFilters);
  $("syncBtn").addEventListener("click", () => startSync(false));
  $("uploadBtn").addEventListener("click", () => $("fileInput").click());
  $("uploadCaret").addEventListener("click", (event) => {
    event.stopPropagation();
    $("uploadMenu").hidden = !$("uploadMenu").hidden;
  });
  $("uploadFilesOption").addEventListener("click", () => {
    $("uploadMenu").hidden = true;
    $("fileInput").click();
  });
  $("uploadFolderOption").addEventListener("click", () => {
    $("uploadMenu").hidden = true;
    $("folderInput").click();
  });
  $("fileInput").addEventListener("change", (event) => {
    startUpload(event.target.files);
    event.target.value = "";
  });
  $("folderInput").addEventListener("change", (event) => {
    startUpload(event.target.files);
    event.target.value = "";
  });
  $("emptySyncBtn").addEventListener("click", () => startSync(false));
  $("emptyUploadBtn").addEventListener("click", () => $("fileInput").click());
  $("emptyFolderBtn").addEventListener("click", () => $("folderInput").click());
  $("loadMoreBtn").addEventListener("click", loadMore);
  $("uploadsClose").addEventListener("click", () => { $("uploadPanel").hidden = true; });
  $("moreBtn").addEventListener("click", promptSettings);
  $("botChip").addEventListener("click", toggleBot);
  $("lockBtn").addEventListener("click", lockNow);
  document.addEventListener("keydown", (event) => {
    if ($("lockOverlay").hidden) return;
    if (/^\d$/.test(event.key)) pressLockKey(event.key);
    else if (event.key === "Backspace") pressLockKey("back");
    else if (event.key === "Escape") pressLockKey("clear");
    else if (event.key === "Enter") submitPin();
  });
  $("openBtn").addEventListener("click", () => openViewerFor(selectedItem()));
  $("downloadBtn").addEventListener("click", () => downloadItem(selectedItem()));
  $("completeBtn").addEventListener("click", () => startMergeDownload(selectedItem()));
  $("favoriteBtn").addEventListener("click", promptFavorite);
  $("restoreBtn").addEventListener("click", () => restoreItem(selectedItem()));
  $("renameBtn").addEventListener("click", promptRename);
  $("moveBtn").addEventListener("click", promptMove);
  $("tagsBtn").addEventListener("click", promptTags);
  $("deleteBtn").addEventListener("click", promptDelete);
  $("bulkDownload").addEventListener("click", bulkDownload);
  $("bulkFavorite").addEventListener("click", bulkFavorite);
  $("bulkMove").addEventListener("click", promptBulkMove);
  $("bulkLinks").addEventListener("click", bulkCopyLinks);
  $("bulkDelete").addEventListener("click", promptBulkDelete);
  $("bulkClear").addEventListener("click", clearSelection);
  $("folderOpenBtn").addEventListener("click", () => {
    const folder = selectedFolder();
    if (folder) openFolder(folder.folder);
  });
  $("folderZipBtn").addEventListener("click", () => downloadFolder(selectedFolder()));
  $("folderPropsBtn").addEventListener("click", () => promptFolderProperties(selectedFolder()));
  $("folderNewBtn").addEventListener("click", () => {
    const folder = selectedFolder();
    promptNewFolder(folder ? folder.folder : S.folder);
  });
  $("folderPropsLink").addEventListener("click", () => promptFolderProperties(selectedFolder()));
  $("folderRenameBtn").addEventListener("click", () => {
    const folder = selectedFolder();
    if (folder) promptRenameFolder(folder);
  });
  $("folderDeleteBtn").addEventListener("click", () => {
    const folder = selectedFolder();
    if (folder) promptDeleteFolder(folder);
  });
  $("noteBtn").addEventListener("click", () => {
    const folder = selectedFolder();
    if (folder) { promptFolderProperties(folder); return; }
    const item = selectedItem();
    if (item) promptNote(item);
  });
  $("viewerClose").addEventListener("click", closeViewer);
  $("viewerStage").addEventListener("click", (event) => {
    if (event.target === $("viewerStage")) closeViewer();
  });
  $("modalClose").addEventListener("click", closeModal);
  $("modalBackdrop").addEventListener("click", closeModal);
  window.addEventListener("mousedown", (event) => {
    if (!event.target.closest("#contextMenu")) hideContextMenu();
    if (!event.target.closest(".upload-split")) $("uploadMenu").hidden = true;
  });
  window.addEventListener("resize", hideContextMenu);
  $("content").addEventListener("scroll", hideContextMenu);

  let dragDepth = 0;
  document.addEventListener("dragenter", (event) => {
    if (!event.dataTransfer || !Array.from(event.dataTransfer.types || []).includes("Files")) return;
    event.preventDefault();
    dragDepth += 1;
    $("dropOverlay").classList.add("active");
    $("dropTarget").textContent = S.folder || "All files";
  });
  document.addEventListener("dragover", (event) => {
    if (event.dataTransfer && Array.from(event.dataTransfer.types || []).includes("Files")) event.preventDefault();
  });
  document.addEventListener("dragleave", (event) => {
    dragDepth = Math.max(0, dragDepth - 1);
    if (!dragDepth) $("dropOverlay").classList.remove("active");
  });
  document.addEventListener("drop", async (event) => {
    if (!event.dataTransfer || !Array.from(event.dataTransfer.types || []).includes("Files")) return;
    event.preventDefault();
    dragDepth = 0;
    $("dropOverlay").classList.remove("active");
    const entries = await collectDroppedEntries(event.dataTransfer);
    if (entries.length) startUpload(entries);
  });
  document.addEventListener("keydown", handleKeydown);
  window.addEventListener("beforeunload", (event) => {
    if (S.localUpload || S.transfers.some((transfer) => transferActive(transfer.state))) {
      event.preventDefault();
      event.returnValue = "";
    }
  });
}

function handleKeydown(event) {
  if (event.key === "Escape") {
    if (!$("viewerOverlay").hidden) { closeViewer(); event.preventDefault(); return; }
    if (!$("contextMenu").hidden) { hideContextMenu(); event.preventDefault(); return; }
    if (!$("modalRoot").hidden) { closeModal(); event.preventDefault(); return; }
    if (isEditableTarget(event.target)) return;
    if (S.selection.size) {
      clearSelection();
      event.preventDefault();
      return;
    }
    if (S.q) {
      S.q = "";
      $("searchInput").value = "";
      updateBreadcrumb();
      loadItems({ reset: true });
      event.preventDefault();
    }
    return;
  }
  if (!$("loginOverlay").hidden) return;
  if (!$("modalRoot").hidden || !$("viewerOverlay").hidden) return;
  if (event.ctrlKey && event.key.toLowerCase() === "f") {
    event.preventDefault();
    $("searchInput").focus();
    $("searchInput").select();
    return;
  }
  if (event.altKey && event.key === "ArrowLeft") { event.preventDefault(); goBack(); return; }
  if (event.altKey && event.key === "ArrowRight") { event.preventDefault(); goForward(); return; }
  if (isEditableTarget(event.target)) return;
  if (event.ctrlKey && event.key.toLowerCase() === "a") {
    if (!S.items.length) return;
    event.preventDefault();
    for (const entry of S.items) S.selection.add(entry.id);
    renderSelection();
    return;
  }
  const item = selectedItem();
  const folder = selectedFolder();
  if (event.key === "F2") {
    if (item) { event.preventDefault(); promptRename(); return; }
    if (folder) { event.preventDefault(); promptRenameFolder(folder); return; }
  }
  if (event.key === "Delete") {
    if (S.selection.size > 1) { event.preventDefault(); promptBulkDelete(); return; }
    if (item) { event.preventDefault(); promptDelete(); return; }
    if (folder) { event.preventDefault(); promptDeleteFolder(folder); return; }
  }
  if (event.key === "Enter" || event.key === " ") {
    if (item) { event.preventDefault(); openViewerFor(item); return; }
    if (folder) { event.preventDefault(); openFolder(folder.folder); return; }
  }
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    const folders = visibleSubfolders();
    const total = folders.length + S.items.length;
    if (!total) return;
    event.preventDefault();
    let index = -1;
    if (folder) index = folders.findIndex((entry) => entry.folder === folder.folder);
    else if (item) index = folders.length + S.items.findIndex((entry) => entry.id === item.id);
    let next = event.key === "ArrowDown" ? index + 1 : index - 1;
    if (index < 0) next = 0;
    next = Math.max(0, Math.min(total - 1, next));
    if (next < folders.length) selectFolderRow(folders[next].folder, { scroll: true });
    else selectItem(S.items[next - folders.length].id, { scroll: true });
  }
}

/* ----------------------------------------------------------------- start */
init();
