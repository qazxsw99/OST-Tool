// GG Admin API Tester — Configuration
// Edit this file to update endpoints, auth defaults, and add new APIs.
// Do NOT wrap values in extra quotes — this is a JS object literal (JSON-compatible).

// Returns "YYYY-MM-DD" for today offset by n days (negative = past)
const _relDate = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

window.APP_CONFIG = {

  // ── Environments ──────────────────────────────────────────────
  // Each environment has: id, name, baseUrl, defaultBearerToken, loginUser (optional)
  environments: [
    {
      id:                 "sit",
      name:               "SIT環境",
      baseUrl:            "http://20.198.251.181",
      defaultBearerToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijk3MTUwOTUyMTI1MjQyMSIsIm5hIjoiU3VwZXIwMDIiLCJ0aSI6IjEiLCJzYSI6IlRydWUiLCJyZSI6IjE3NzU3MDI0NDMiLCJuYmYiOjE3NzU2MDUyNDMsImV4cCI6MTc3NTYxNjA0MywiaXNzIjoiaHR0cDovLzEyNy4wLjAuMTo4MDAwIiwiYXVkIjoiaHR0cDovLzEyNy4wLjAuMTo4MDAwIn0.m52Ad0PkyqFUPjhftzKVSE_wA4pqV5vrtY_R3o8yFjQ",
      loginUser:          ""
    },
    {
      id:                 "uat",
      name:               "UAT環境",
      baseUrl:            "https://uat-admin-api.mxsyl.com",
      defaultBearerToken: "",
      loginUser:          "QA003"
    }
  ],

  // ── Default Request Headers ───────────────────────────────────
  // These headers are sent with every request (on top of Authorization).
  defaultHeaders: {
    "lang": "zh-cn"
  },

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
        { key: "IssuanceDateBegin",    label: "Issuance Date Begin",        type: "date",    required: true,  default: "" },
        { key: "IssuanceDateEnd",      label: "Issuance Date End",          type: "date",    required: true,  default: "" },
        { key: "RedeemDateBegin",      label: "Redeem Date Begin",          type: "date",    required: false, default: _relDate(-2) },
        { key: "RedeemDateEnd",        label: "Redeem Date End",            type: "date",    required: false, default: _relDate(0) },
        { key: "ExpiryDateBegin",      label: "Expiry Date Begin",          type: "date",    required: false, default: "" },
        { key: "ExpiryDateEnd",        label: "Expiry Date End",            type: "date",    required: false, default: "" },
        { key: "BwTransferMwDateBegin",label: "BW Transfer MW Date Begin",  type: "date",    required: false, default: "" },
        { key: "BwTransferMwDateEnd",  label: "BW Transfer MW Date End",    type: "date",    required: false, default: "" },
        { key: "ForfeitDateBegin",     label: "Forfeit Date Begin",         type: "date",    required: false, default: "" },
        { key: "ForfeitDateEnd",       label: "Forfeit Date End",           type: "date",    required: false, default: "" },
        { key: "BwExpireDateBegin",    label: "BW Expire Date Begin",       type: "date",    required: false, default: "" },
        { key: "BwExpireDateEnd",      label: "BW Expire Date End",         type: "date",    required: false, default: "" },
        { key: "Uids",                 label: "UIDs (comma-separated)",     type: "text",    required: false, default: "" },
        { key: "HasTest",              label: "Has Test",                   type: "boolean", required: false, default: false },
        { key: "TenantIds",            label: "Tenant IDs (-1 = all)",      type: "text",    required: false, default: "", placeholder: "-1" },
        { key: "BonusType",            label: "Bonus Type Code",            type: "text",    required: false, default: "", placeholder: "e.g. frist_deposit" },
        { key: "PrizeType",            label: "Prize Type Code",            type: "text",    required: false, default: "", placeholder: "e.g. cash_voucher" },
        { key: "PrizeName",            label: "Prize Name (fuzzy)",         type: "text",    required: false, default: "" },
        { key: "Activity",             label: "Activity Title (fuzzy)",     type: "text",    required: false, default: "" },
        { key: "BonusNo",              label: "Activity ID (BonusNo)",      type: "text",    required: false, default: "" },
        { key: "Page",                 label: "Page",                       type: "number",  required: true,  default: 1,   min: 1 },
        { key: "PageSize",             label: "Page Size",                  type: "number",  required: true,  default: 100, min: 1, max: 1000 },
        { key: "IsExport",             label: "Is Export",                  type: "boolean", required: false, default: false }
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
