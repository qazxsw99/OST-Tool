# ngrok 設定教學

本文件說明如何註冊 ngrok 帳號，並將 authtoken 填入專案設定，讓 Mock Server 可對外公開存取。

---

## 步驟一：註冊 ngrok 帳號

1. 前往 [https://dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup)
2. 以 Google / GitHub 帳號或 Email 完成註冊並登入

---

## 步驟二：取得 Authtoken

1. 登入後，點選左側選單的 **Your Authtoken**
   （網址：`https://dashboard.ngrok.com/get-started/your-authtoken`）
2. 複製畫面上顯示的 token 字串

   ![authtoken 位置示意](https://ngrok.com/static/img/docs/ngrok-authtoken.png)

   Token 格式類似：
   ```
   2abc1234XYZ_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

## 步驟三：填入 package.json

開啟 `package.json`，將 token 貼入 `config.ngrok_authtoken`：

```json
"config": {
  "ngrok_authtoken": "貼上你的 token"
}
```

範例：

```json
"config": {
  "ngrok_authtoken": "2abc1234XYZ_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

---

## 步驟四：啟動 Mock Server

```bash
npm run mock
```

啟動成功後，console 會顯示 public URL：

```
✅ Withdrawal Audit Mock Server running at http://localhost:3099
🌐 ngrok public URL: https://xxxx.ngrok-free.app
     POST https://xxxx.ngrok-free.app/v1/WithdrawalAudit/GetUserInfoForWithdrawalAudit?uid=xxx
     POST https://xxxx.ngrok-free.app/v1/WithdrawalAudit/GetUserDynamicInfoForWithdrawalAudit?uid=xxx
```

將 `https://xxxx.ngrok-free.app` 提供給需要呼叫 API 的人即可。

---

## 測試 API（curl）

> 將 `BASE_URL` 替換為啟動後 console 顯示的 ngrok public URL，或本機的 `http://localhost:3099`。
> 使用 ngrok URL 時需加上 `-H "ngrok-skip-browser-warning: true"`，否則會收到 HTML 警告頁。

```bash
BASE_URL="https://xxxx.ngrok-free.app"
```

### GetUserInfoForWithdrawalAudit

```bash
curl -s -X POST \
  "${BASE_URL}/v1/WithdrawalAudit/GetUserInfoForWithdrawalAudit?uid=12345&orderNum=ORD001" \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{}' | jq
```

### GetUserDynamicInfoForWithdrawalAudit

```bash
curl -s -X POST \
  "${BASE_URL}/v1/WithdrawalAudit/GetUserDynamicInfoForWithdrawalAudit?uid=12345&orderNum=ORD001" \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{}' | jq
```

### 本機測試（不需 ngrok header）

```bash
curl -s -X POST \
  "http://localhost:3099/v1/WithdrawalAudit/GetUserInfoForWithdrawalAudit?uid=12345&orderNum=ORD001" \
  -H "Content-Type: application/json" \
  -d '{}' | jq
```

---

## 注意事項

- **免費方案**：每次重啟 server，ngrok URL 會變動（隨機產生）
- **安全性**：`package.json` 若有納入 git，請勿 commit token。建議將 token 改存在本機 npm config：
  ```bash
  npm config set platform-tools:ngrok_authtoken your_token_here
  ```
  此指令會寫入 `~/.npmrc`，不影響 repo 內的檔案，token 僅保留在本機。
