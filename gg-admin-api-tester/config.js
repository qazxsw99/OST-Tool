// GG Admin API Tester — Configuration
// Edit this file to update endpoints, auth defaults, and add new APIs.
// Do NOT wrap values in extra quotes — this is a JS object literal (JSON-compatible).

window.APP_CONFIG = {

  // ── Endpoint ──────────────────────────────────────────────────
  defaultBaseUrl: "http://20.198.251.181",

  // ── Default Request Headers ───────────────────────────────────
  // These headers are sent with every request (on top of Authorization).
  // Add or remove entries as needed.
  defaultHeaders: {
    "lang": "zh-cn"
  },

  // ── Auth ──────────────────────────────────────────────────────
  // Default Bearer token loaded on first visit (overridden by localStorage after first save).
  defaultBearerToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijk3MTUwOTUyMTI1MjQyMSIsIm5hIjoiU3VwZXIwMDIiLCJ0aSI6IjEiLCJzYSI6IlRydWUiLCJyZSI6IjE3NzU3MDI0NDMiLCJuYmYiOjE3NzU2MDUyNDMsImV4cCI6MTc3NTYxNjA0MywiaXNzIjoiaHR0cDovLzEyNy4wLjAuMTo4MDAwIiwiYXVkIjoiaHR0cDovLzEyNy4wLjAuMTo4MDAwIn0.m52Ad0PkyqFUPjhftzKVSE_wA4pqV5vrtY_R3o8yFjQ",

  // ── API Registry ───────────────────────────────────────────────
  // Param types: "text" | "number" | "date" | "boolean" | "select"
  // For "select", add:  options: [{ value: "...", label: "..." }, ...]
  apis: [
    {
      id:     "userbonusactivityv2",
      name:   "User Bonus Activity v2",
      method: "GET",
      path:   "/api/v1/asset/report/userbonusactivityv2",
      params: [
        { key: "IssuanceDateBegin", label: "Issuance Date Begin", type: "date",    required: true,  default: "2026-03-01" },
        { key: "IssuanceDateEnd",   label: "Issuance Date End",   type: "date",    required: true,  default: "2026-03-14" },
        { key: "HasTest",           label: "Has Test",            type: "boolean", required: false, default: false },
        { key: "Page",              label: "Page",                type: "number",  required: true,  default: 1,   min: 1 },
        { key: "PageSize",          label: "Page Size",           type: "number",  required: true,  default: 100, min: 1, max: 1000 }
      ]
    }
    // ── Add more APIs below ──────────────────────────────────────
    // ,{
    //   id:     "another-api",
    //   name:   "Another API",
    //   method: "POST",
    //   path:   "/api/v1/...",
    //   params: [
    //     { key: "Field1", label: "Field 1", type: "text", required: true, default: "" }
    //   ]
    // }
  ]

};
