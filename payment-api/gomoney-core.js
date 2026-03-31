// ════════════════════════════════════════════════════════════
//  STATE
// ════════════════════════════════════════════════════════════
let currentApiKey = Object.keys(API_REGISTRY)[0];

function currentApi() { return API_REGISTRY[currentApiKey]; }

// ════════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════════
function init() {
  // Populate dropdown
  const sel = document.getElementById('apiSelect');
  for (const [key, api] of Object.entries(API_REGISTRY)) {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = `${api.method}  ${api.label}`;
    sel.appendChild(opt);
  }

  // Tab switching
  document.querySelectorAll('.panel-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const id = tab.dataset.tab;
      document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + id).classList.add('active');
    });
  });

  onApiChange();
}

function onApiChange() {
  currentApiKey = document.getElementById('apiSelect').value;
  const api = currentApi();

  // Update method badge + path hint
  const badge = document.getElementById('methodBadge');
  badge.textContent = api.method;
  badge.className = 'method-badge ' + api.method.toLowerCase();
  document.getElementById('pathHint').textContent = api.path;

  // Re-render form fields
  renderFormFields();

  // Load preset JSON for this API
  const saved = localStorage.getItem(api.lsKey);
  document.getElementById('presetJson').value =
    JSON.stringify(saved ? JSON.parse(saved) : api.defaultPreset, null, 2);

  document.getElementById('jsonError').classList.remove('show');
}

// ════════════════════════════════════════════════════════════
//  FORM RENDERING
// ════════════════════════════════════════════════════════════
function renderOneField(f) {
  const badge = f.required ? '<span class="req">*</span>'
              : f.optional ? '<span class="opt">opt</span>' : '';
  const hint  = f.hint ? `<small style="font-size:9px;color:#8c959f">(${f.hint})</small>` : '';

  if (f.inputType === 'checkbox') {
    return `<div class="field">
      <div class="checkbox-row">
        <input type="checkbox" id="${f.id}" />
        <label for="${f.id}">${f.label}</label>
      </div>
    </div>`;
  }

  if (f.inputType === 'json-textarea') {
    const h = f.textareaHeight || '80px';
    return `<div class="field">
      <label>${f.label} ${badge} ${hint}</label>
      <textarea id="${f.id}" style="min-height:${h}"></textarea>
    </div>`;
  }

  const type = f.inputType === 'number' ? 'number' : 'text';
  const step = f.step ? ` step="${f.step}"` : '';
  return `<div class="field">
    <label>${f.label} ${badge} ${hint}</label>
    <input type="${type}" id="${f.id}"${step} />
  </div>`;
}

function renderFormFields() {
  const api = currentApi();
  let html = '';

  for (const row of api.rows) {
    if (row.type === 'section') {
      html += `<div class="section-title" style="margin-top:4px">${row.label}</div>`;
    } else if (row.type === 'row2') {
      html += `<div class="row2">${row.fields.map(renderOneField).join('')}</div>`;
    } else {
      html += renderOneField(row);
    }
  }

  document.getElementById('formFields').innerHTML = html;
}

// ════════════════════════════════════════════════════════════
//  PRESET JSON
// ════════════════════════════════════════════════════════════
function savePreset() {
  const raw = document.getElementById('presetJson').value.trim();
  const err = document.getElementById('jsonError');
  try {
    JSON.parse(raw);
    localStorage.setItem(currentApi().lsKey, raw);
    err.classList.remove('show');
    const ind = document.getElementById('savedIndicator');
    ind.classList.add('show');
    setTimeout(() => ind.classList.remove('show'), 2000);
  } catch (e) {
    err.textContent = 'JSON 格式錯誤：' + e.message;
    err.classList.add('show');
  }
}

function resetPreset() {
  document.getElementById('presetJson').value =
    JSON.stringify(currentApi().defaultPreset, null, 2);
  document.getElementById('jsonError').classList.remove('show');
}

// ════════════════════════════════════════════════════════════
//  LOAD JSON → FORM
// ════════════════════════════════════════════════════════════
function getFlatFields(api) {
  const result = [];
  for (const row of api.rows) {
    if (row.type === 'section') continue;
    if (row.type === 'row2') result.push(...row.fields);
    else result.push(row);
  }
  return result;
}

function loadJsonToForm() {
  const err = document.getElementById('jsonError');
  const raw = document.getElementById('presetJson').value.trim();
  let obj;
  try {
    obj = JSON.parse(raw);
    err.classList.remove('show');
  } catch (e) {
    err.textContent = 'JSON 格式錯誤：' + e.message;
    err.classList.add('show');
    return;
  }

  for (const f of getFlatFields(currentApi())) {
    const el = document.getElementById(f.id);
    if (!el) continue;

    const key = f.jsonKey || f.paramKey || f.id;
    const val = key in obj ? obj[key] : (f.id in obj ? obj[f.id] : undefined);
    if (val === undefined) continue;

    if (f.inputType === 'checkbox') {
      el.checked = !!val;
    } else if (f.inputType === 'json-textarea') {
      el.value = val === null ? ''
               : typeof val === 'object' ? JSON.stringify(val, null, 2)
               : String(val);
    } else {
      el.value = (val === null || val === undefined) ? '' : String(val);
    }
  }

  // Switch to request tab and scroll to form
  document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelector('[data-tab="request"]').classList.add('active');
  document.getElementById('tab-request').classList.add('active');

  setTimeout(() => {
    document.getElementById('formFields').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
}

// ════════════════════════════════════════════════════════════
//  COLLECT PARAMS FROM FORM
// ════════════════════════════════════════════════════════════
function collectParams() {
  const api = currentApi();
  const params = {};

  for (const f of getFlatFields(api)) {
    const el = document.getElementById(f.id);
    if (!el) continue;

    const bodyKey = f.paramKey || f.id;

    if (f.inputType === 'checkbox') {
      params[bodyKey] = el.checked;

    } else if (f.inputType === 'json-textarea') {
      const str = el.value.trim();
      if (str) {
        try { params[bodyKey] = JSON.parse(str); }
        catch { params[bodyKey] = str; }
      }

    } else if (f.inputType === 'number') {
      const v = el.value.trim();
      if (v !== '') params[bodyKey] = Number(v);
      else if (!f.skipIfEmpty) params[bodyKey] = null;

    } else {
      const v = el.value.trim();
      if (v !== '' || !f.skipIfEmpty) {
        params[bodyKey] = v === '' ? null : v;
      }
    }
  }

  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== null && v !== undefined));
}

// ════════════════════════════════════════════════════════════
//  TEMPLATE RESOLUTION
// ════════════════════════════════════════════════════════════
function resolveTemplates(obj) {
  const cache = {};

  function replaceInString(str) {
    return str.replace(/\{([A-Za-z][A-Za-z0-9_]*)\}/g, (match, name) => {
      if (!(name in TEMPLATE_VARS)) return match;
      if (!(name in cache)) cache[name] = TEMPLATE_VARS[name].fn();
      return cache[name];
    });
  }

  function walk(val) {
    if (typeof val === 'string') return replaceInString(val);
    if (Array.isArray(val))     return val.map(walk);
    if (val !== null && typeof val === 'object') {
      return Object.fromEntries(Object.entries(val).map(([k, v]) => [k, walk(v)]));
    }
    return val;
  }

  return walk(obj);
}

// ════════════════════════════════════════════════════════════
//  SIGNATURE  (mirrors C# GetSignKey + HmacSha256)
// ════════════════════════════════════════════════════════════
async function hmacSha256(message, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('').toUpperCase();
}

function buildSignString(params, timestamp) {
  const excluded = new Set(
    getFlatFields(currentApi())
      .filter(f => f.excludeFromSign)
      .map(f => (f.paramKey || f.id).toLowerCase())
  );

  const sorted = Object.keys(params).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  let sb = '';
  for (const key of sorted) {
    if (excluded.has(key.toLowerCase())) continue;
    const v = params[key];
    if (v === null || v === undefined || v === '') continue;
    sb += `${key}=${v}&`;
  }
  sb += timestamp;
  return sb.toUpperCase();
}

// ════════════════════════════════════════════════════════════
//  SEND REQUEST
// ════════════════════════════════════════════════════════════
async function sendRequest() {
  const btn       = document.getElementById('btnSend');
  const baseUrl   = document.getElementById('baseUrl').value.trim().replace(/\/$/, '');
  const systemId  = document.getElementById('systemId').value.trim();
  const secretKey = document.getElementById('securityKey').value.trim();

  if (!systemId || !secretKey) {
    alert('請先在 Auth / Config 頁填入 SystemId 與 SecurityKey');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div> Sending…';

  const api       = currentApi();
  const params    = resolveTemplates(collectParams());
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signStr   = buildSignString(params, timestamp);
  const sign      = await hmacSha256(signStr, secretKey);

  document.getElementById('signPreview').textContent = signStr;

  const url = `${baseUrl}${api.path}`;
  const headers = {
    'Content-Type': 'application/json',
    'Timestamp': timestamp,
    'SystemId':  systemId,
    'Sign':      sign,
    ...parseExtraHeaders(),
  };

  document.getElementById('reqLog').textContent =
    JSON.stringify({ url, method: api.method, headers, body: params, signatureInput: signStr }, null, 2);
  document.getElementById('reqLogWrapper').style.display = 'block';

  const t0 = performance.now();

  try {
    const resp = await fetch(url, {
      method:  api.method,
      headers,
      body:    api.method !== 'GET' ? JSON.stringify(params) : undefined,
    });

    const elapsed = Math.round(performance.now() - t0);
    document.getElementById('elapsed').textContent = `${elapsed} ms`;

    const raw = await resp.text();
    let data;
    try { data = JSON.parse(raw); } catch { data = raw; }

    const badge = document.getElementById('statusBadge');
    badge.textContent = `HTTP ${resp.status}`;
    badge.className = 'status-badge ' + (resp.ok ? 'ok' : 'err');
    document.getElementById('respMeta').textContent =
      `${resp.status} ${resp.statusText} · ${resp.headers.get('content-type') || ''}`;

    const out = document.getElementById('responseOutput');
    if (typeof data === 'object') out.innerHTML = syntaxHighlight(data);
    else out.textContent = raw;

  } catch (err) {
    const elapsed = Math.round(performance.now() - t0);
    document.getElementById('elapsed').textContent = `${elapsed} ms`;
    document.getElementById('statusBadge').textContent = 'Network Error';
    document.getElementById('statusBadge').className = 'status-badge err';
    document.getElementById('respMeta').textContent = 'Failed to reach server';
    document.getElementById('responseOutput').textContent =
      `Error: ${err.message}\n\nHint: CORS 錯誤請改用 curl：\n\n` + generateCurl(url, headers, params);

  } finally {
    btn.disabled = false;
    btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0ZM8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm.75 4.75a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z"/>
    </svg> Send Request`;
  }
}

// ════════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════════
function parseExtraHeaders() {
  const out = {};
  for (const line of document.getElementById('extraHeaders').value.split('\n')) {
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const k = line.slice(0, idx).trim();
    const v = line.slice(idx + 1).trim();
    if (k) out[k] = v;
  }
  return out;
}

function syntaxHighlight(obj) {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    m => {
      let cls = 'json-num';
      if (/^"/.test(m)) cls = /:$/.test(m) ? 'json-key' : 'json-str';
      else if (/true|false/.test(m)) cls = 'json-bool';
      else if (/null/.test(m)) cls = 'json-null';
      return `<span class="${cls}">${m}</span>`;
    }
  );
}

function generateCurl(url, headers, body) {
  const h = Object.entries(headers).map(([k, v]) => `  -H '${k}: ${v}'`).join(' \\\n');
  return `curl -X POST '${url}' \\\n${h} \\\n  -d '${JSON.stringify(body)}'`;
}

function clearResponse() {
  document.getElementById('responseOutput').innerHTML = '';
  document.getElementById('respMeta').textContent = '— 已清除 —';
  document.getElementById('statusBadge').className = 'status-badge';
  document.getElementById('elapsed').textContent = '';
  document.getElementById('reqLogWrapper').style.display = 'none';
}

function copyResponse() {
  const text = document.getElementById('responseOutput').textContent;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const btn = event.target;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy', 1500);
  });
}

document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') sendRequest();
});

init();
