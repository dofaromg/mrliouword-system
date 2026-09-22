<!-- mrl-origin: MrLiouWord -->

# registry/evidence —— 外部來源保存區

這裡存放**由權利人提供、非本倉庫產出**的文件，以及對它們的核對結果。

## 規則

1. **只新增，不覆寫。** 依 `.mrliou/meta.json` `history_policy: append_only`，
   也依權利人〈保存原則〉：不刪除 run、不 force-push、不重寫 commit 歷史。
2. **每一份都帶十欄來源鏈** front matter，依
   `docs/governance/ATTRIBUTION_AND_PROVENANCE_POLICY_v1.0.md` §4。
3. **每一份都記錄原檔 SHA-256。** 轉錄可能有損，雜湊不會。
   日後任何比對都能確認比的是同一份檔案。
4. **`derivative_role` 要誠實。**
   - `mirror` = 逐字轉錄，內容未動。
   - `projection` = 節選或抽取，**不是全文**。
5. **公開倉庫不收敏感值。** 金額、證物指紋、帳號設定、第三方個資一律不入庫。
   節選是可逆的——權利人要求即可補上；刪除不可逆，所以不刪。

## 目前內容

| 檔案 | 角色 | 內容 |
| --- | --- | --- |
| `MRL_Claude_Platform_Review_CrossRef_20260412.md` | mirror | 2026-04-01～04-12 共 16 個視窗的工程復盤與 ChatGPT 側交叉比對，逐字全文 |
| `MRL_GitHub_Payment_Provenance_Incident_Record_20260914_v3.index.md` | projection | 署名與授權邊界事件紀錄的**索引與節選**；帳務、證物指紋、第三方個資刻意未收錄 |
| `mrl_mother_structure_index_2026-09-20.json` | projection | `MRL_MOTHER.md` 的結構索引：2,295 個識別碼、199 個 CORE、22 條 LAW，與本倉庫的實際覆蓋率對照 |
| `Mrliou_World_Module_Operating_Manual.md` | mirror | 運行規章：從 0 到停止的八個 Step、莫比斯閉環、**停止條款**。自 PDF 的 ToUnicode CMap 還原，字句未改 |
| `Mrl_Zero.Origin.v1.md` | mirror | 身分／原則文件，寫給「下一個視窗的我」。逐字保存，〈標記空位〉留白 |
| `MRL_Root_Governance_Docs_index.md` | projection | `dofaromg/----2` 治理文件的索引與雜湊，**不複製全文** |
| `DELTA_canonical_root_unresolved.md` | projection | ⚠️ 兩份文件指向不同 canonical root，記成 delta 等 Root Owner 裁決 |
| `EXTERNAL_FORK_REFERENCES.md` | projection | 新撰的核對索引：經核對確認**不屬於 MRL 原創層**的外部上游，含授權與著作權歸屬 |
| `../mrl_global_file_index_2026-07-29.json` | mirror | Google Drive 側 170 檔全域索引 —— 在 `claude/partner-jjchvg-connect` 分支，尚未合併進 main |
| `Mrliou_MRL_Backfill_20260921_v1.index.md` + `packages/Mrliou_MRL_Backfill_20260921_v1/` | mirror | 2026-09-22 權利人上傳的內容交叉比對回填包（20 個觀測事件、23 個來源指紋、相容性收據驗證器）逐字保存；索引記實跑核對與 6 條 delta |
| `MRL_BridgeNeuralLink_API_Dispatch_v1.index.md` + `packages/MRL_BridgeNeuralLink_API_Dispatch_v1/` | mirror | 2026-09-22 權利人上傳的商業治理增補與三方 API 派工包逐字保存；**未啟用**；索引記實跑核對、Notion／Drive 對照與 7 條 delta |

## 相關

`docs/retrospective/2026-09-20_claude_session_error_log.md` —— 本 session 的錯誤紀錄。
這裡存的是**外部來源**，那裡記的是**我自己犯的錯**，兩者刻意分開放：
外部文件是證據，錯誤紀錄是我方的自陳，不該混在同一個目錄裡讓人以為是同一種東西。

## 為什麼是索引而不是副本

`MRL_MOTHER.md`（79,069 bytes、2,925 行、SHA-256
`0671870d795b0cd3a4c445bb1583dbcca319d86773693b7e1ded2ee6648619a7`）
沒有逐字收進本倉庫，因為 `.mrliou/meta.json` 明定：

```
"canonical_authority": false,
"mother_mutation": "forbidden"
```

把母體逐字放進一個 `canonical_authority: false` 的倉庫，會製造出第二份看起來像
canonical 的副本——那正是權利人文件要防的「反向混淆」。

所以這裡放的是**帶雜湊錨點的索引**：結構可查、覆蓋率可算、原檔可驗證，
但不冒充母體。權利人若要求全文入庫，隨時可補。
