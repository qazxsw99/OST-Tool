// ════════════════════════════════════════════════════════════
//  API REGISTRY
//  To add a new API: add an entry to API_REGISTRY below.
//
//  Field types:
//    'text'          – text input
//    'number'        – number input  (optional: step)
//    'checkbox'      – boolean checkbox
//    'json-textarea' – multiline textarea, parsed as JSON object in body
//
//  Field flags:
//    required        – shows red * label
//    optional        – shows green opt label
//    skipIfEmpty     – omit this key from request body when value is empty
//    excludeFromSign – omit this key when building the HMAC sign string
//    jsonKey         – key name in the preset JSON  (defaults to id)
//    paramKey        – key name in the request body (defaults to id)
//    hint            – small grey note after label
// ════════════════════════════════════════════════════════════
const API_REGISTRY = {

  'withdraw-createorder': {
    label:   'Withdraw / CreateOrder',
    method:  'POST',
    path:    '/v1/Withdraw/CreateOrder',
    lsKey:   'gomoney_preset_withdraw_createorder',
    defaultPreset: {
      merchantOrderId:  '{MerchantOrderId}',
      userId:           '9933123',
      ClientIp:         '52.193.8.206',
      amount:           '24.0000000000',
      callbackUrl:      'http://gbd-uat-alb-1644329973.ap-northeast-1.elb.amazonaws.com:5016/v1/wallet/paymentcallback/1',
      currency:         'CNY',
      isFromBackend:    false,
      queueByIntegrals: true,
      integrals:        450,
      ipRegionCode:     'JP',
      kycLevel:         1,
      kycRegionCode:    'CN',
      userVipLevel:     9,
      withdrawAddress:  '',
      extraData: {
        PaymentRisk: false,
        BankBranchName:    null,
        Province:          null,
        City:              null,
        BankCode:          'BJBANK',
        BankName:          '北京银行',
        BankAccountHolder: '測試二',
        BankAccountNumber: '313341233',        
      },
    },
    rows: [
      { type: 'section', label: 'Required' },
      { type: 'field',   id: 'merchantOrderId', label: 'merchantOrderId', inputType: 'text',   required: true },
      { type: 'row2', fields: [
        { id: 'paymentMethodId', label: 'paymentMethodId', inputType: 'text', required: true },
        { id: 'userId',          label: 'userId',          inputType: 'text', required: true },
      ]},
      { type: 'row2', fields: [
        { id: 'amount',   label: 'amount',   inputType: 'number', step: 'any', required: true },
        { id: 'currency', label: 'currency', inputType: 'text',   required: true },
      ]},
      { type: 'field', id: 'clientIp',   jsonKey: 'ClientIp', paramKey: 'ClientIp', label: 'ClientIp',   inputType: 'text', required: true },
      { type: 'field', id: 'callbackUrl',                                            label: 'callbackUrl', inputType: 'text', required: true },

      { type: 'section', label: 'Optional' },
      { type: 'field', id: 'paymentChannelId', label: 'paymentChannelId', inputType: 'text',   optional: true, skipIfEmpty: true },
      { type: 'field', id: 'withdrawAddress',  label: 'withdrawAddress',  inputType: 'text',   optional: true },
      { type: 'row2', fields: [
        { id: 'ipRegionCode',  label: 'ipRegionCode',  inputType: 'text', optional: true },
        { id: 'kycRegionCode', label: 'kycRegionCode', inputType: 'text', optional: true },
      ]},
      { type: 'row2', fields: [
        { id: 'userVipLevel', label: 'userVipLevel', inputType: 'number', optional: true },
        { id: 'kycLevel',     label: 'kycLevel',     inputType: 'number', optional: true },
      ]},
      { type: 'row2', fields: [
        { id: 'integrals',       label: 'integrals',       inputType: 'number', optional: true },
        { id: 'appointmentTime', label: 'appointmentTime', inputType: 'number', optional: true, skipIfEmpty: true, hint: 'epoch ms' },
      ]},
      { type: 'row2', fields: [
        { id: 'isFromBackend',    label: 'isFromBackend',    inputType: 'checkbox' },
        { id: 'queueByIntegrals', label: 'queueByIntegrals', inputType: 'checkbox' },
      ]},
      { type: 'field', id: 'extraData', label: 'extraData', inputType: 'json-textarea',
        optional: true, excludeFromSign: true, hint: 'JSON object · excluded from sign',
        textareaHeight: '110px' },
    ],
  },

  // ── Add future APIs here ─────────────────────────────────────────────────
  // Example skeleton:
  // 'deposit-createorder': {
  //   label:  'Deposit / CreateOrder',
  //   method: 'POST',
  //   path:   '/v1/Deposit/CreateOrder',
  //   lsKey:  'gomoney_preset_deposit_createorder',
  //   defaultPreset: { ... },
  //   rows: [ ... ],
  // },

};

// ════════════════════════════════════════════════════════════
//  TEMPLATE VARIABLES
//  When a string value in the JSON / form equals {VarName},
//  it is replaced at send-time with the result of the generator.
//
//  To add a new variable: add an entry below.
//    key   – the name inside the curly braces, e.g. 'MerchantOrderId'
//    fn    – zero-arg function that returns the replacement string
//    desc  – short description shown in the UI legend
// ════════════════════════════════════════════════════════════
const TEMPLATE_VARS = {

  MerchantOrderId: {
    desc: 'W + 999 + 13位亂數 + G',
    fn() {
      const digits = Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join('');
      return `W999${digits}G`;
    },
  },

  // ── Add future variables here ────────────────────────────
  // Timestamp: {
  //   desc: 'Unix timestamp (seconds)',
  //   fn() { return String(Math.floor(Date.now() / 1000)); },
  // },

};
