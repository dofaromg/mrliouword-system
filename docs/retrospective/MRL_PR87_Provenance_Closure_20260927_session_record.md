---
canonical_authority: Mr.liou
origin_signature: MrLiouWord
source_repo: dofaromg/mrliouword-system
source_artifact:
  - registry/evidence/EXTERNAL_FORK_REFERENCES.md
  - registry/evidence/Mrliou_Scope_Rights_Rectification_20260926_v1.json
  - docs/retrospective/2026-09-26_misjudgment_rectification_session_record.md
  - registry/evidence/Mrliou_Extended_Rectification_20260927_R02.json
  - docs/retrospective/2026-09-27_extended_rectification_session_record.md
source_version: 387fae098622ed3465e59bf9f357540ddeac4aa2
source_version_role: inspected_input_revision
artifact_version: MRL_PR87_Provenance_Closure_20260927_v1
derivative_role: generated
artifact_owner: Mr.liou
contributors:
  - name: Mr.liou
    role: owner / correction instruction
  - name: ChatGPT / Codex
    role: tool / inspection and corrective implementation
transformation: 校正現行 provenance 欄位並附舊值、原件雜湊及部署時序；保留既有正文與 Git 歷史
verification_status: partial
preserved_at: "2026-09-27"
---
<!-- mrl-origin: MrLiouWord -->
# MRL PR #87 provenance 收斂紀錄

## 一、起點

擁有者指定只修仍存在的兩個 provenance P2，在 PR 分支以追加 commit 保存訂正，
保留名稱、歷史、Mr.liou 與 MrLiouWord，並釐清未手動部署與平台自動部署。
起始 head：`387fae098622ed3465e59bf9f357540ddeac4aa2`。
分支：`Mrliou_fix_scope_rights_20260926`；main、DNS、routes 不在寫入範圍。

## 二、查證過程與證據

- P2 status：https://github.com/dofaromg/mrliouword-system/pull/87#discussion_r4111734461 。
  開工回讀為 non-outdated、unresolved，front matter 確為 verified；已改為 partial，
  歷史 verified 明列 verification_history，撤回比例結論的正文完整保留。
- P2 revision：https://github.com/dofaromg/mrliouword-system/pull/87#discussion_r4111734465 。
  開工回讀為 non-outdated、unresolved。git cat-file 實查四份原 source_version 均不含自身路徑。
  Scope JSON／09-26 session 首次保存於 `f9da5974da0b0dd4ea8d7765bdd434850426da94`；
  R02 JSON／09-27 session 首次保存於 `387fae098622ed3465e59bf9f357540ddeac4aa2`。
  現行 source_version 指向上述原件；原值另存 inspected_baseline_commit 與 provenance_corrections。
  source_artifact_sha256 是 source_version 取回原件的 hash，訂正後 bytes 另列第六節。
- 本紀錄 source_artifact 列的是已存在的輸入文件，source_version 是它們的查核 revision；
  不把 parent 誤稱本新紀錄所在 commit，也不預填自身 commit SHA。

## 三、角色與平台的作為

Mr.liou 授權分支修正；ChatGPT / Codex 為查核與實作工具，未更動來源權位。
GitHub Actions 在起始 SHA 已有 MRL Core Runtime run `36256614827` 與 SDK run
`36256614758` 成功。這些只證明起始 SHA，不作後續修補 SHA 的 CI 結果。
Cloudflare bot 在 https://github.com/dofaromg/mrliouword-system/pull/87#issuecomment-5847242368
記錄 `mrliouword-system`、`387fae09`、2026-09-26 16:46 UTC（台北 09-27 00:46），
build `19332b71-c577-4770-adea-98252d7b8bbe` 為 Deployment successful。
這是既有 Git 整合的自動部署回執；「本輪不執行部署」只能描述未手動呼叫部署的操作，
不能用來否認此回執。此次不手動 dispatch 或呼叫 deploy；分支更新仍可能觸發既有自動整合。

## 四、我在本輪犯的錯

第一次在 clone 尚未完成 LFS checkout 時讀取 status，顯示暫態索引差異；沒有依此刪除、
重設或提交檔案。等待 clone exit 0 後確認 clean，再開始修正。兩次過大的工具輸出被截斷，
後續從完整本地檔案與結構化結果取證，未將截斷內容當全量證據。根目錄 AGENTS.md 查詢回
404，完整 tree 未包含 AGENTS.md；改讀現有 Mrliou_claude.md 與 session 範本。

## 五、驗不了的 delta

| 命題 | 本次狀態 | 可驗條件 |
| --- | --- | --- |
| 原封存內容貢獻比例 | 本次未重驗，現行 partial | 原封存與指定來源 commit 逐檔核對 |
| 修補 SHA 的 CI / 自動部署 | 本紀錄提交前尚未發生，不沿用舊 SHA | 推送後按 exact head 回讀 run 與 bot 回執 |
| live route-response / DL580 | 本次無新增探測 | 對應環境實測；不影響既有運行紀錄 |
| Codex 對新 head 的審查 | 現有 review 僅到 f9da5974da | 新 head 的獨立 review |

## 六、交付物與實測輸出

Expected_File_List（預期 6 檔；五份既有檔案 metadata 訂正與本紀錄）：

- `registry/evidence/EXTERNAL_FORK_REFERENCES.md`
- `registry/evidence/Mrliou_Scope_Rights_Rectification_20260926_v1.json`
- `docs/retrospective/2026-09-26_misjudgment_rectification_session_record.md`
- `registry/evidence/Mrliou_Extended_Rectification_20260927_R02.json`
- `docs/retrospective/2026-09-27_extended_rectification_session_record.md`
- `docs/retrospective/MRL_PR87_Provenance_Closure_20260927_session_record.md`

Expected_Dependency_Tree：PR #87 → status thread → External Fork 索引；PR #87 → revision
thread → Scope/R02 JSON 與各自 session；本紀錄 → 上述五份既有輸入文件。
Package_Map：Git 新增 commit / PR 分支；未要求 ZIP，因此無 ZIP 或 manifest 代替實檔。

已執行針對性驗證：YAML／JSON parse、不可變署名、原 Markdown 正文 byte prefix 保留、
原 JSON 所有既有欄位值（source_version 除外）完全保留、四份 git show 來源可讀與 SHA-256
相符、舊 revision 確不含對應 artifact。五份檔案檢查通過；git diff --check exit 0。

| 實際修正檔案 | bytes | 訂正後 SHA-256 |
| --- | ---: | --- |
| `registry/evidence/EXTERNAL_FORK_REFERENCES.md` | 5029 | `f0652e5105470b022b4ced85fb3f053b94ab118e8a350d66a54aee4b322890d2` |
| `registry/evidence/Mrliou_Scope_Rights_Rectification_20260926_v1.json` | 9291 | `11aec907c03e98b8be106f785684de2815a24554e390b01984d578e9a897c9a6` |
| `docs/retrospective/2026-09-26_misjudgment_rectification_session_record.md` | 7693 | `f6e20c016b5a74368dc1546122e3d57300fd1995358fd34cfa45fe21ca90d642` |
| `registry/evidence/Mrliou_Extended_Rectification_20260927_R02.json` | 6916 | `e62f9f9a0dcfe7b279f2a1724ed83f683c40863b732fcab6bd17413aaed2917c` |
| `docs/retrospective/2026-09-27_extended_rectification_session_record.md` | 8356 | `957cf89a51e46b93e1a32143afa8b67e076243e4793f93320d572ba91dad2146` |

本紀錄的 hash 與完整六檔交付比對在提交後 PR 說明中保存，避免循環自雜湊。
以下是修正後實際輸出；release gate exit 0 代表符合既有 baseline，並未把其原有
11 項未通過或 70 筆 baseline 改稱全部解決。connection audit 同理。

```text
python3 tools/release_gate.py . /dev/null --trusted-baseline registry/release_gate_baseline.json
exit_code: 0
🚧 發布 Gate（政策第 8 節）
   產物            15
   全數通過        4
   有未通過項      11
   基準線已記錄    70（來源：registry/release_gate_baseline.json）

   📝 報告寫入 /dev/null
```

```text
python3 tools/connection_audit.py . /dev/null
exit_code: 0
🔗 連接稽核
   來源盤點      cloudflare_inventory_2026-03-12.json
   雲端 Worker   140
   倉庫可部署    3
   設定不完整    1（wrangler 讀得到，但必要欄位仍是佔位字串，部署會失敗）
   服務註冊表    3
   客戶端有參照  4
   legacy alias  2
   ⚠️  wrangler 讀不到的設定檔 1
   ⚠️  參照了盤點中沒有的 Worker 2
   📝 報告寫入 /dev/null
```

```text
python3 tools/provenance_notice_check.py
exit_code: 0
MRL 來源標註檢查通過：MRL_PROVENANCE.md 規格表九列齊備且順序正確，機器標記存在。
```

```text
python3 tools/provenance_fields_check.py
exit_code: 0
MRL 來源鏈欄位檢查通過：3 份 PROVENANCE.yaml，§4 十欄齊備，欄位值均在列舉內。
  ✓ cloudflare/particle-api/PROVENANCE.yaml
  ✓ cloudflare/particle-memory/PROVENANCE.yaml
  ✓ vendor/git/PROVENANCE.yaml
```

```text
python3 tools/operating_cognition_check.py
exit_code: 0
MRL 根本運行認知檢查通過：看到→接受→比對→修正→建構→測試→紀錄 七步齊備且順序正確，兩個母體錨點都在，正本 Mrliou_claude.md 與 adapter CLAUDE.md 都在。
```

```text
python3 tools/mother_core_registry.py --check
exit_code: 0
母體 CORE 登錄表檢查通過：199 個 CORE / 2264 個成員，錨點相符，MRL_DELTA_CORE 九成員齊全。
```

```text
python3 tools/mrliou_claude_sync.py --check
exit_code: 0
✓ CLAUDE.md 與 Mrliou_claude.md 同步
```

```text
python3 tools/naming_lineage_check.py
exit_code: 0
命名正名與 lineage 檢查通過：Mrliou_claude.md 為 canonical（mrl_Mrliou_claude），CLAUDE.md 登錄為 adapter 且原名保留，lineage L-001 在。
```

## 七、當前狀態

本地兩個 P2 的實質修正及同鏈 R02 錯指已驗證；分支推送、PR 本文追加與遠端
thread/CI 最終狀態由提交後回讀記錄，不預先宣稱已完成。此次來源版本訂正依既有真實
commit，不新增或修改 runtime、workflow、部署設定。Codex 既有審查未涵蓋 387fae09
及此次變更，故判定需要對修補 latest head 重新審查；舊審查不能視為新 head 背書。

## 八、我自己的行為與提問

先取 exact head、comments、review thread 與檔案，再驗證錯指是否真實存在。
對已證實的相同 provenance 錯指一併修正，未擴張成一般狀態巡檢。
未向擁有者重問可自決的 metadata／格式選擇。先評估歷史保留與來源可取回，再修改。
本紀錄先填執行結果：0 次；SHA、hash、大小及八項 exit code 都由工具結果後填入。
預期清單與遠端待驗明確分開，沒有把 CI pending 當 PASS。

## 九、矛盾處

### 9.1 我自己的前後矛盾
本輪沒有以舊 SHA 的成功替新 head 背書；clone 暫態索引顯示已由完成後 clean 狀態校正。
### 9.2 歷史保留與現行欄位
Git 以新 commit 追加訂正；現行 scalar 欄位修正，舊值在具日期的機器可讀歷史中保留。
Markdown 原正文完整保留，JSON 原 findings、snapshots、時間、名稱及角色均保持。
### 9.3 平台層面
未手動呼叫部署與 Cloudflare 自動部署成功可以同時成立，按行為主體與 SHA 分欄記錄。
### 9.4 尚未被驗證的地方
新 head CI、review 與 live 探測不能從本地 metadata 驗證推得；以各自回執為準。

## 提交傳輸追加紀錄

本地 commit `4e1833a601ae5596cdde2df547f2e2dee475f8f3` 已建立；git push 回
`fatal: could not read Username for 'https://github.com': No such device or address`。
回讀遠端仍為 `387fae098622ed3465e59bf9f357540ddeac4aa2`，沒有把本地 commit
當成已推送。接續使用同一已授權 GitHub connector 的 Git objects 與非 force ref 更新，
以遠端現有 head 為 parent 提交相同修補，保留此傳輸差異與本地 commit 紀錄。
