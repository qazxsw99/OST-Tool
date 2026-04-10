# GoGaming Auto Login API 加密分析報告

## 一、系統概覽

- **前端框架**：Angular (standalone components)
- **前端版本**：F: 20260407.1 / B: 20260409.2
- **API Base URL**：`http://20.198.251.181/api/v1`
- **密碼加密演算法**：AES-128 ECB mode + PKCS7 padding（使用 CryptoJS library）

---

## 二、登入流程（兩步驟）

### Step 1：取得加密金鑰

```
GET http://20.198.251.181/api/v1/admin/auth/getpasswordencryptkey
```

**Request Headers：**
```
Content-Type: application/json;charset=utf-8
lang: zh-cn
Authorization: Bearer <token>  （未登入時為空）
```

**Response 範例：**
```json
{
  "key": "e20b99173d6348f7aadbd07d840c0343",
  "encyptKey": "fxVZc4SgiB7xQXXK"
}
```

- `key`（32字元）：`passwordKey`，原封不動帶入 login body
- `encyptKey`（16字元）：AES 加密的金鑰（每次 call 都會輪換）

---

### Step 2：送出登入

```
POST http://20.198.251.181/api/v1/admin/auth/login
```

**Request Headers：**
```
Content-Type: application/json;charset=utf-8
lang: zh-cn
Authorization: Bearer <token>
```

**Request Body：**
```json
{
  "tenantId": 1,
  "userName": "Super002",
  "password": "WzBGoe/BQK9YcH/J0kzj4A==",
  "passwordKey": "e20b99173d6348f7aadbd07d840c0343"
}
```

**Response（成功）包含：**
```json
{
  "token": "<JWT token>",
  "verify": { "isUpdatePassword": false, ... }
}
```

---

## 三、密碼加密算法

從 `main.js` 中提取的原始加密函數（module 52429 中 `Xk` export）：

```javascript
// j = Xk (exported as Xk from the module)
const j = (password, encyptKey) => {
  const key = CryptoJS.enc.Utf8.parse(encyptKey);
  return CryptoJS.AES.encrypt(password, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  }).toString();  // 輸出為 Base64 字串
};
```

- **演算法**：AES-ECB
- **Padding**：PKCS7
- **Key**：`encyptKey`（16字元 UTF-8 字串，即 AES-128）
- **輸出**：Base64 編碼的密文字串
- **每次登入** `encyptKey` 都不同，必須先 call Step 1 取得

---

## 四、Claude Code 實作（Python）

```python
import requests
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
import base64

BASE_URL = "http://20.198.251.181/api/v1"

HEADERS = {
    "Content-Type": "application/json;charset=utf-8",
    "lang": "zh-cn",
}

def encrypt_password(password: str, encrypt_key: str) -> str:
    """AES-ECB + PKCS7 加密密碼（對應前端 CryptoJS 實作）"""
    key = encrypt_key.encode("utf-8")       # 16 bytes → AES-128
    cipher = AES.new(key, AES.MODE_ECB)
    encrypted = cipher.encrypt(pad(password.encode("utf-8"), AES.block_size))
    return base64.b64encode(encrypted).decode("utf-8")

def login(username: str, password: str) -> dict:
    # Step 1: 取得加密金鑰
    resp = requests.get(
        f"{BASE_URL}/admin/auth/getpasswordencryptkey",
        headers=HEADERS
    )
    resp.raise_for_status()
    key_data = resp.json()
    
    encrypt_key = key_data["encyptKey"]     # 16字元，AES key
    password_key = key_data["key"]          # 32字元，帶入 body

    # Step 2: 加密密碼並登入
    encrypted_password = encrypt_password(password, encrypt_key)
    
    payload = {
        "tenantId": 1,
        "userName": username,
        "password": encrypted_password,
        "passwordKey": password_key
    }
    
    resp = requests.post(
        f"{BASE_URL}/admin/auth/login",
        headers=HEADERS,
        json=payload
    )
    resp.raise_for_status()
    result = resp.json()
    
    token = result.get("token")
    return {"token": token, "raw": result}

# 使用方式
if __name__ == "__main__":
    result = login("Super002", "你的密碼")
    print("Token:", result["token"])
```

**依賴套件：**
```bash
pip install pycryptodome requests
```

---

## 五、注意事項

1. **`encyptKey` 每次都會輪換**：不能快取金鑰，每次登入都必須先呼叫 Step 1。
2. **`tenantId` 固定為 `1`**：前端 hardcode，不需動態取得。
3. **`lang` header**：前端預設 `zh-cn`，可改為 `en-US`。
4. **登入成功後**取得 `token`，後續 API 請求需加上 `Authorization: Bearer <token>`。
5. **密碼欄位名稱拼寫**：API 回傳的金鑰欄位名為 `encyptKey`（少一個 r，是 typo），程式碼要照這個拼法。