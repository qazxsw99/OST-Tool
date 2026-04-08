# OST Tool — API Tester UI/UX Pattern & Policy

Reference this document when building new tools in this repo to ensure consistent look, behaviour, and code structure.

---

## Design Language

**Theme:** GitHub-style light (matches github.com UI tokens)

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#f6f8fa` | Page, toolbar, sidebar bg |
| Surface | `#ffffff` | Panel, card, input background |
| Border | `#d0d7de` | All dividers, input borders |
| Border subtle | `#eaeef2` | Secondary dividers, row separators |
| Text primary | `#24292f` | Body text, headings |
| Text muted | `#57606a` | Labels, secondary text |
| Text placeholder | `#8c959f` | Placeholder, disabled state, hints |
| Blue accent | `#0969da` | Focus ring, primary CTA, active tab underline |

**Font stack:**
- UI: `'Segoe UI', system-ui, sans-serif` — 13px base, 1.0 line-height
- Monospace: `'Cascadia Code', 'Fira Code', monospace` — inputs, code output, path hints

---

## Layout: Two-Panel (Left + Right)

```
┌─────────────────────────────────────────────────────┐
│ HEADER (fixed, 8px 18px padding)                    │
├────────────────────────┬────────────────────────────┤
│ LEFT PANEL (420px)     │ RIGHT PANEL (flex: 1)      │
│ ─ API selector bar     │ ─ Response header bar      │
│ ─ Tabs (Params/Auth)   │ ─ Toolbar (view toggle)    │
│ ─ Tab content          │ ─ Response body (scroll)   │
│ ─ Send button          │ ─ Request Detail (collapse)│
└────────────────────────┴────────────────────────────┘
```

- `body`: `height: 100vh`, `display: flex`, `flex-direction: column`, `overflow: hidden`
- `.layout`: `display: flex`, `flex: 1`, `overflow: hidden`, `position: relative`
- `.left`: `width: 420px`, `min-width: 320px`, `transition: width .2s ease, min-width .2s ease`
- `.right`: `flex: 1`, `overflow: hidden`

### Sidebar Collapse

- Collapsed state: `.left.collapsed` sets `width: 0 !important; min-width: 0 !important; border-right: none`
- Toggle button `.sidebar-toggle`: absolutely positioned at left panel edge, 18×48px pill, `border-radius: 0 6px 6px 0`
  - Arrow rotates: `‹` (expanded) → `›` (collapsed)
  - Moves with the panel via `left: 420px` → `left: 0` transition
- Persist collapse state to `localStorage` key `gg_admin_sidebarCollapsed`
- **Auto-hide policy:** Only auto-collapse on successful response (`res.ok === true`), never on errors

---

## Header

```html
<header>
  <svg><!-- icon --></svg>
  <h1>Tool Name</h1>
  <span class="subtitle">Short description</span>
</header>
```

- `padding: 8px 18px`, white bg, `border-bottom: 1px solid #d0d7de`
- `box-shadow: 0 1px 3px rgba(0,0,0,.06)`
- h1: 14px, font-weight 600
- subtitle: 11px, color `#8c959f`

---

## API Selector Bar

Appears between header and left-panel tabs.

```html
<div class="api-bar">
  <span class="method-badge get" id="methodBadge">GET</span>
  <select id="apiSelect" onchange="onApiChange()"></select>
  <span class="path-hint" id="pathHint"></span>
</div>
```

### Method Badge Colors

| Method | Background | Text | Border |
|--------|-----------|------|--------|
| GET | `#ddf4ff` | `#0969da` | `#54aeff` |
| POST | `#dafbe1` | `#1a7f37` | `#aceebb` |
| PUT | `#fff8c5` | `#9a6700` | `#d4a72c` |
| DELETE | `#ffebe9` | `#cf222e` | `#ff8182` |

- Badge: `font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 12px`
- Path hint: monospace, 11px, `#8c959f`, truncated with `text-overflow: ellipsis`, `max-width: 260px`

---

## Left Panel Tabs

```html
<div class="panel-tabs">
  <div class="panel-tab active" data-tab="params">Params</div>
  <div class="panel-tab" data-tab="auth">Auth / Config</div>
</div>
```

- Tabs: `padding: 8px 14px`, 12px, font-weight 500
- Active tab: `color: #0969da; border-bottom: 2px solid #0969da`
- Tab content: `display: none` → `.active { display: flex }`
- Tab content padding: `14px 16px`, `gap: 10px`, `overflow-y: auto`

---

## Form Elements

### Section Title (within tabs)
```css
.section-title {
  font-size: 10px; font-weight: 700; letter-spacing: .07em;
  text-transform: uppercase; color: #57606a;
  padding-bottom: 4px; border-bottom: 1px solid #eaeef2;
}
```

### Field
```html
<div class="field">
  <label>Field Name <span class="req">*</span></label>
  <input type="text" />
</div>
```
- `.field`: `display: flex; flex-direction: column; gap: 4px`
- `label`: 11px, font-weight 500, color `#57606a`
- `.req` (required star): color `#cf222e`, 10px
- `.opt` (optional tag): color `#1a7f37`, 10px

### Input / Select / Textarea
- bg `#ffffff`, border `1px solid #d0d7de`, border-radius `6px`
- font: 12px monospace, padding `6px 10px`
- Focus: `border-color: #0969da; box-shadow: 0 0 0 3px rgba(9,105,218,.12)`

### Two-column layout
```html
<div class="row2">
  <div class="field">...</div>
  <div class="field">...</div>
</div>
```
`.row2`: `display: grid; grid-template-columns: 1fr 1fr; gap: 8px`

### Checkbox Row
```html
<div class="checkbox-row">
  <input type="checkbox" id="myCheck" />
  <label for="myCheck">Label text</label>
</div>
```
- `accent-color: #0969da`; 15×15px; label 12px, font-weight 400

### Divider
```html
<hr class="divider" />
```
`.divider`: `border: none; border-top: 1px solid #eaeef2; margin: 2px 0`

---

## Buttons

### Primary CTA (Send)
```css
.btn-send {
  background: #0969da; color: #fff; border-radius: 6px;
  font-size: 13px; font-weight: 600; padding: 9px;
  margin: 10px 14px;
}
.btn-send:disabled { background: #80bcff; cursor: not-allowed; }
```
Show a `<span class="spinner">` inside while loading.

### Secondary / Ghost Button
```css
.btn { padding: 5px 12px; border: 1px solid #d0d7de; background: #f6f8fa; border-radius: 6px; }
.btn-danger { background: #ffebe9; color: #cf222e; border-color: #ff8182; }
```

---

## Right Panel: Response Area

### Response Header Bar
```html
<div class="resp-header">
  <span>Response</span>
  <span class="status-badge ok" id="statusBadge"></span>
  <span class="elapsed" id="elapsed"></span>
  <button class="btn btn-danger" onclick="clearResponse()">Clear</button>
  <button class="btn" onclick="copyResponse()">Copy</button>
</div>
```

### Status Badge Colors
| State | CSS class | Background | Text | Border |
|-------|-----------|-----------|------|--------|
| 2xx | `.ok` | `#dafbe1` | `#1a7f37` | `#aceebb` |
| 4xx/5xx | `.err` | `#ffebe9` | `#cf222e` | `#ff8182` |

Default: `display: none`; shown by adding `.ok` or `.err` class.

### Toolbar
```html
<div class="resp-toolbar">
  <span id="respMeta"></span>
  <span class="array-path-badge" id="arrayPathBadge"></span>
  <div class="view-toggle" id="viewToggle">
    <button class="view-btn active" onclick="switchView('json')">JSON</button>
    <button class="view-btn" onclick="switchView('table')">Table</button>
  </div>
</div>
```

### JSON Syntax Highlighting Colors
| Token | CSS class | Color |
|-------|-----------|-------|
| Key | `.json-key` | `#0550ae` |
| String value | `.json-str` | `#0a3069` |
| Number | `.json-num` | `#953800` |
| Boolean | `.json-bool` | `#cf222e` |
| Null | `.json-null` | `#8250df` |

### Table View
- View-toggle segmented control: `background: #eaeef2; border-radius: 6px; padding: 2px`
- Active button: `background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.1)`
- Table `thead`: `position: sticky; top: 0; z-index: 2`
- Column header: sortable, shows `⇅` / `▲` / `▼` sort icons
- Per-column filter: `.col-search-row` (a hidden `<tr>` in thead with `<input>` per column)
- Row striping: odd `#ffffff`, even `#f6f8fa`, hover `#ddf4ff`
- Cell type coloring:

| Type | Class | Color |
|------|-------|-------|
| Number | `.td-num` | `#953800` monospace |
| Boolean true | `.td-bool-t` | `#1a7f37` bold |
| Boolean false | `.td-bool-f` | `#cf222e` bold |
| Null | `.td-null` | `#8250df` italic |
| Object/Array | `.td-obj` | `#8c959f` italic 11px |

- Long values: `max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap`
  - Full value exposed via `title` attribute → `cursor: help`
- Table footer: `padding: 6px 16px; font-size: 11px; color: #8c959f; background: #f6f8fa`

---

## Collapsible Request Detail Log

```html
<div class="req-log">
  <div class="req-log-title" onclick="toggleReqLog()">
    Request Detail
    <span class="toggle-icon">▼</span>
  </div>
  <div class="req-log-body" id="reqLogBody">
    <pre id="reqLogPre"></pre>
  </div>
</div>
```

- Default: **hidden** (`display: none`)
- Expanded: add `.open` to `.req-log-title` (rotates chevron 180°) and `.req-log-body`
- Max-height: `160px`, `overflow-y: auto`
- Log content: URL, method, request headers (redact token to `Bearer ***`)

---

## Empty State

```html
<div class="empty-state">
  <div class="icon">📭</div>
  <div>No response yet. Send a request to see results here.</div>
</div>
```

- Centered, `padding: 40px 20px`, icon 36px, text 12px `#8c959f`

---

## Spinner (Loading Indicator)

```html
<span class="spinner"></span>
```

```css
.spinner {
  display: inline-block; width: 13px; height: 13px;
  border: 2px solid rgba(255,255,255,.4); border-top-color: #fff;
  border-radius: 50%; animation: spin .7s linear infinite;
}
```

Used inside `.btn-send` while request is in-flight. Button also gets `disabled`.

---

## Scrollbar Styling

```css
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #d0d7de; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #afb8c1; }
```

Apply globally.

---

## Inline Code Chip

```html
<code class="inline">some.path</code>
```

```css
code.inline {
  background: #eaeef2; padding: 1px 5px; border-radius: 4px;
  font-size: 10px; font-family: monospace;
}
```

---

## Configuration Pattern (`config.js`)

External config loaded via `<script src="config.js">` before the main script. Uses `window.APP_CONFIG` (not JSON import) so the tool works on `file://` without a server.

```js
window.APP_CONFIG = {
  defaultBaseUrl: "http://...",
  defaultHeaders: { "lang": "zh-cn" },
  defaultBearerToken: "...",
  apis: [
    {
      id:     "api-id",
      name:   "Human Name",
      method: "GET",         // GET | POST | PUT | DELETE
      path:   "/api/v1/...",
      params: [
        { key: "Field",  label: "Field Label", type: "text",    required: true,  default: "" },
        { key: "Date",   label: "Date",         type: "date",    required: true,  default: "2026-01-01" },
        { key: "Count",  label: "Count",        type: "number",  required: true,  default: 10, min: 1, max: 1000 },
        { key: "Flag",   label: "Flag",         type: "boolean", required: false, default: false },
        { key: "Status", label: "Status",       type: "select",  required: false,
          options: [{ value: "a", label: "A" }, { value: "b", label: "B" }] }
      ]
    }
  ]
};
```

**Param types:** `text` | `number` | `date` | `boolean` | `select`

---

## localStorage Keys Policy

| Key | Type | Description |
|-----|------|-------------|
| `gg_admin_baseUrl` | string | Saved base URL |
| `gg_admin_token` | string | Saved bearer token |
| `gg_admin_extraHeaders` | string | Raw textarea content (key:value lines) |
| `gg_admin_corsProxy` | `"1"` | CORS proxy enabled |
| `gg_admin_corsProxyUrl` | string | Proxy URL |
| `gg_admin_sidebarCollapsed` | `"1"` | Sidebar collapse state |
| `gg_admin_autoHide` | `"1"` | Auto-hide sidebar preference |

**Convention:** prefix with tool ID (`gg_admin_`) to avoid cross-tool collisions.

**Fallback rule:** Use `??` (nullish coalescing) not `||` when loading from localStorage, so an explicitly empty string saved by the user is respected and not overwritten by defaults.

```js
el.value = localStorage.getItem('gg_admin_extraHeaders') ?? defaultHeadersToText(cfg.defaultHeaders);
```

---

## Header Merge Order

When building request headers, merge in this priority (later entries win):

1. `config.defaultHeaders` (e.g. `{ lang: 'zh-cn' }`)
2. `Authorization: Bearer <token>`
3. Extra headers textarea (user can override anything)

```js
const headers = Object.assign(
  {},
  cfg.defaultHeaders,
  { 'Authorization': `Bearer ${token}` },
  parseExtraHeaders(extraHeadersText)
);
```

---

## Behaviour Policies

- **Auto-hide sidebar:** Only triggered on `res.ok` (HTTP 2xx). Never on network errors or non-2xx responses.
- **Send button state:** Disabled + shows spinner while request in-flight. Re-enabled on completion (success or error).
- **Response clear:** Hides status badge, clears pre content, resets table, hides view-toggle.
- **Table detection:** Auto-detect the deepest/largest array-of-objects in the response via recursive walk (`findBestArray()`). Show view-toggle only when a qualifying array is found.
- **JWT decode:** Use `atob()` on segment index 1 of the dot-split token. Show exp/nbf as both Unix timestamp and ISO date string, plus `expired` / `valid` annotation.
