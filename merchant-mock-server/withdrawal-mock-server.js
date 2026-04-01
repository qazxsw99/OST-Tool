const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const ngrok = require('@ngrok/ngrok');

const app = express();
const PORT = 3099;
const STATE_FILE = path.join(__dirname, 'withdrawal-mock-state.json');

// Default mock responses
const DEFAULT_RESPONSE = {
  userInfo: {
    isTest: false,
    isFirstWithdrawal: false,
    isFirstWithdrawalAttempt: false,
    lastLoginIp: "192.168.1.100",
    countryCode: "TW",
    address: "Test Address",
    ngrLifeTime: 12345.67,
    kycLevel: 2,
    riskControl: 0,
    vipLevel: 3,
    netCashLifeTime: 98765.43,
    netCashVsTotalDepositRate: 0.85,
    transactionInfo: {
      depositTypes: [0, 1],
      withdrawTypes: [0]
    }
  },
  userDynamicInfo: {
    ngrInTimePeriod: 5432.10,
    totalWithdrawalAmountInTimePeriod: 20000.00,
    totalWithdrawalCountInTimePeriod: 5,
    netCashInTimePeriod: 3210.50
  }
};

const DEFAULT_STATE = {
  default: JSON.parse(JSON.stringify(DEFAULT_RESPONSE)),
  uids: {}
};

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      // Migrate old flat state format → new nested format
      if (raw.userInfo && !raw.default) {
        console.log('Migrating state file to per-uid format...');
        return { default: raw, uids: {} };
      }
      return raw;
    }
  } catch (e) {
    console.error('Failed to load state, using defaults:', e.message);
  }
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

function resolveResponse(state, uid, key) {
  if (uid && state.uids[uid] && state.uids[uid][key] !== undefined) {
    return state.uids[uid][key];
  }
  return state.default[key];
}

let mockState = loadState();

app.use(cors());
app.use(express.json());

// ── Mock API Endpoints ──────────────────────────────────────────────────────

app.post('/v1/WithdrawalAudit/GetUserInfoForWithdrawalAudit', (req, res) => {
  const { uid, orderNum } = req.query;
  const hasOverride = uid && mockState.uids[uid] && mockState.uids[uid].userInfo !== undefined;
  console.log(`[${new Date().toISOString()}] GetUserInfoForWithdrawalAudit | uid=${uid} orderNum=${orderNum} [${hasOverride ? `uid:${uid}` : 'default'}]`);
  console.log('  Body:', JSON.stringify(req.body));
  res.json(resolveResponse(mockState, uid, 'userInfo'));
});

app.post('/v1/WithdrawalAudit/GetUserDynamicInfoForWithdrawalAudit', (req, res) => {
  const { uid, orderNum } = req.query;
  const hasOverride = uid && mockState.uids[uid] && mockState.uids[uid].userDynamicInfo !== undefined;
  console.log(`[${new Date().toISOString()}] GetUserDynamicInfoForWithdrawalAudit | uid=${uid} orderNum=${orderNum} [${hasOverride ? `uid:${uid}` : 'default'}]`);
  console.log('  Body:', JSON.stringify(req.body));
  res.json(resolveResponse(mockState, uid, 'userDynamicInfo'));
});

// ── Editor API ──────────────────────────────────────────────────────────────

// Get full state (default + all uid overrides)
app.get('/editor/state', (req, res) => {
  res.json(mockState);
});

// Save userInfo for a uid (or default if uid omitted)
app.put('/editor/userInfo', (req, res) => {
  try {
    const { uid } = req.query;
    if (uid) {
      if (!mockState.uids[uid]) mockState.uids[uid] = {};
      mockState.uids[uid].userInfo = req.body;
    } else {
      mockState.default.userInfo = req.body;
    }
    saveState(mockState);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

// Save userDynamicInfo for a uid (or default if uid omitted)
app.put('/editor/userDynamicInfo', (req, res) => {
  try {
    const { uid } = req.query;
    if (uid) {
      if (!mockState.uids[uid]) mockState.uids[uid] = {};
      mockState.uids[uid].userDynamicInfo = req.body;
    } else {
      mockState.default.userDynamicInfo = req.body;
    }
    saveState(mockState);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

// Add a new uid config (cloned from default)
app.post('/editor/uids', (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ ok: false, error: 'uid required' });
    if (mockState.uids[uid]) return res.status(409).json({ ok: false, error: 'uid already exists' });
    mockState.uids[uid] = JSON.parse(JSON.stringify(mockState.default));
    saveState(mockState);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

// Delete a uid config
app.delete('/editor/uids/:uid', (req, res) => {
  try {
    const { uid } = req.params;
    if (!mockState.uids[uid]) return res.status(404).json({ ok: false, error: 'uid not found' });
    delete mockState.uids[uid];
    saveState(mockState);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

// Reset default (or a specific uid) to factory defaults
app.post('/editor/reset', (req, res) => {
  const { uid } = req.query;
  if (uid) {
    if (mockState.uids[uid]) {
      mockState.uids[uid] = JSON.parse(JSON.stringify(DEFAULT_RESPONSE));
    }
  } else {
    mockState.default = JSON.parse(JSON.stringify(DEFAULT_RESPONSE));
  }
  saveState(mockState);
  res.json({ ok: true });
});

// ── Editor UI ───────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'withdrawal-mock-editor.html'));
});

app.listen(PORT, async () => {
  console.log(`\n✅ Withdrawal Audit Mock Server running at http://localhost:${PORT}`);
  console.log(`   Editor UI:  http://localhost:${PORT}/`);
  console.log(`   Endpoints:`);
  console.log(`     POST http://localhost:${PORT}/v1/WithdrawalAudit/GetUserInfoForWithdrawalAudit?uid=xxx&orderNum=xxx`);
  console.log(`     POST http://localhost:${PORT}/v1/WithdrawalAudit/GetUserDynamicInfoForWithdrawalAudit?uid=xxx&orderNum=xxx\n`);

  const authtoken = process.env.NGROK_AUTHTOKEN;
  if (!authtoken) {
    console.log('⚠️  NGROK_AUTHTOKEN not set — skipping ngrok tunnel.');
    console.log('   Set it with: export NGROK_AUTHTOKEN=your_token\n');
    return;
  }

  try {
    const listener = await ngrok.forward({ addr: PORT, authtoken });
    const url = listener.url();
    console.log(`🌐 ngrok public URL: ${url}`);
    console.log(`   Editor UI:  ${url}/`);
    console.log(`   Endpoints:`);
    console.log(`     POST ${url}/v1/WithdrawalAudit/GetUserInfoForWithdrawalAudit?uid=xxx&orderNum=xxx`);
    console.log(`     POST ${url}/v1/WithdrawalAudit/GetUserDynamicInfoForWithdrawalAudit?uid=xxx&orderNum=xxx\n`);
  } catch (e) {
    console.error('❌ ngrok failed:', e.message);
  }
});
