<!-- mrl-origin: MrLiouWord -->

# registry/evidence/packages —— 權利人上傳的交付包，逐字保存

這個目錄裡的每個子目錄都是**一個上傳 zip 解壓後的原樣**，一個位元組都沒動。
每個子目錄在上一層各有一份 `<包名>.index.md`，帶十欄來源鏈 front matter、
原 zip 的 SHA-256、逐檔雜湊、以及本倉庫對它做過的核對與驗不了的 delta。

| 子目錄 | 索引 | 原 zip SHA-256 |
| --- | --- | --- |
| `Mrliou_MRL_Backfill_20260921_v1/` | `../Mrliou_MRL_Backfill_20260921_v1.index.md` | `3bf1c4804c3d7df855f394e485499596dfff442427188f2182b96099c134c357` |
| `MRL_BridgeNeuralLink_API_Dispatch_v1/` | `../MRL_BridgeNeuralLink_API_Dispatch_v1.index.md` | `75df21d619f007adb241ce43999d133f6a7004069d815a9af2a4d4089786f469` |

## 規則

1. **不要編輯子目錄裡的任何檔案。** 它們是 `derivative_role: mirror`。
   要改就在別處寫 adapter，並在 PROVENANCE 標明 `derivative_role`。
2. **不要在這裡跑會寫檔的腳本。** 例如
   `MRL_BridgeNeuralLink_API_Dispatch_v1/PACKAGE_AUDIT.py` 會**改寫**同目錄的
   `MANIFEST.json` 並在上一層產生 zip；要跑就先複製到暫存目錄再跑。
   （2026-09-22 的 session 紀錄第四節有一則就是這樣犯的。）
3. **重新核對用包內自帶的機制**：
   - `Mrliou_MRL_Backfill_20260921_v1/`：`sha256sum -c SHA256SUMS`
   - `MRL_BridgeNeuralLink_API_Dispatch_v1/`：逐檔對 `MANIFEST.json` 的 `files[].sha256`
4. 這些包**不是**本倉庫的主張，也**不是** canonical。`.mrliou/meta.json`
   `canonical_authority: false` 在這裡一樣適用。
5. 原 zip 檔本身不入庫（`.gitignore` 排除 `*.zip`），只記雜湊。
