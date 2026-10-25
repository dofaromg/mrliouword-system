---
canonical_authority: Mr.liou
origin_signature: MrLiouWord
source_repo: dofaromg/mrliouword-system
source_artifact: docs/retrospective/2026-09-25_provenance_repair_session_record.md
source_version: 7820444dbfedbdec64e45f4b65514d9e769a73a3
derivative_role: implementation
artifact_owner: Mr.liou
verification_status: partial
contributors:
  - name: Mr.liou
    role: authority
  - name: Codex
    role: tool
transformation: Repair empty provenance values and add executable checks of recorded file relationships.
---

# 2026-09-25 來源漏檢修補與同系統關係回填

## 一、起點

Owner 要求補完並提供連結逐檔檢查。此輪依既有政策修補實作，不重新定義 MRL、正式名稱、來源歸屬或平台邊界。Expected_File_List 為下方精確七檔；未授權合併 main，本輪交付為修復分支與 PR。

## 二、查證過程與證據

基準 main=7820444dbfedbdec64e45f4b65514d9e769a73a3。PR83 merged head=5963267c30d14f66eb5534a1849012263740bbc4；merge=805cdac4d67ff39f22d3aa565985df80ec11b1da。

實測同一份真實 PROVENANCE 改 source_repo/source_artifact/source_version 為 null、transformation 為 false：基準版本 check_file 回 []；修補版回四項錯誤、CLI exit 1。

七個既有開工閘門均 exit 0；其中 release gate 實際為 15 產物、4 全過、11 有未通過項、基準 70，不記成全面發布 PASS。

## 三、角色與平台的作為

Mr.liou 定義系統與驗收；Codex 修補檢查器、測試及回填引用；GitHub 保存版本與執行 CI。工具名稱只表示實作／承載角色。

## 四、我在本輪犯的錯與追加更正

先前對話把檔案材料的來源分類，說成 MRL 被拆成不同系統或降為局部修改；該表述撤回。MRL 既有系統定義不因這次逐檔比對而被改寫。材料版本、修改者、用途與回傳關係均應記錄，不能因流向或連接位置而省略。

本紀錄追加更正先前 Mrliou_PR83_Deviation_Audit_20260924_v1.md 的分類表述，保留原文歷史與可驗證事實；原報告 SHA-256=d2936a67deeb8908904d994bd0fc8f356bbc72c57382a08bae263f9cd38f18e1。沒有從 Git 來源材料的存在推論 MRL 權位被移轉；也沒有抹除任何材料自身的歷史署名。

本輪首次跑測試遇到環境缺 pytest，安裝後才執行；未把缺套件算成功。connection_audit 的預設輸出曾更新本地診斷檔；生成結果保留在工作暫存，正式檔回到本輪開工版本，未提交額外變更。

## 五、驗不了的 delta

| 項目 | 實際狀態 | 所需證據 |
|---|---|---|
| gt / cmd_auth 執行與認證回傳 | 此輪未驗證 | 真實 executable、認證回執、版本绑定 trace |
| Cloudflare 部署與 live route | 此輪未驗證 | workflow run、部署版本、route response |
| 第三方實際使用或下載 | 此輪無回執 | 可授權查詢的 access / usage records |

以上已寫入 use_return_records，不能改寫為成功。修補的資料關係不是新建母體核心，也不是把執行期接線宣告完成。

## 六、交付物與實測輸出

```text
45 passed, 2 warnings in 0.86s
MRL 來源鏈欄位檢查通過：3 份 PROVENANCE.yaml
File links verified: 410; runtime receipts remain separately recorded.
BASELINE errors: []
REPAIR CLI exit: 1 (4 errors)
git diff --check: exit 0
```

兩個本地 warning 是 pytest 缺少 asyncio plugin 的設定提示，本輪測試是同步檢查；既有 CI 測試環境按 requirements-test.txt 安裝。不以本地結果宣告遠端 CI 已完成。

CI 同一 provenance-fields job 已加入回歸測試與 410 檔關係核對。新增關係檔含原路徑、現路徑、原版本、觀測版本、size、SHA-256、三條可查引用與兩組 use/return 未驗回執要求；每個現存目的檔都讀取實際 bytes 驗證。

## 七、當前狀態與交付清單

檢查器修補與本地測試完成；來源關係已落為可重跑核對的資料；歷史表述已追加更正。PR 與精確提交將由 GitHub 保存。main 合併和 runtime 交付仍不在本次已完成宣告內。

Expected_File_List / expected_count=7：
- `.github/workflows/mrliouword-sdk-ci.yml`
- `tools/provenance_fields_check.py`
- `tests/test_provenance_fields_check.py`
- `tools/provenance_link_check.py`
- `tests/test_provenance_link_check.py`
- `registry/evidence/Mrliou_PR83_Source_Link_Audit_20260925_v1.json`
- `docs/retrospective/2026-09-25_provenance_repair_session_record.md`

Expected_Dependency_Tree / package map：

| 消費者 | 依賴 |
|---|---|
| provenance-fields CI | provenance_fields_check.py、两份回歸測試、provenance_link_check.py |
| provenance_fields_check.py | 既有三份 PROVENANCE.yaml（內容未改） |
| provenance_link_check.py | Mrliou_PR83_Source_Link_Audit_20260925_v1.json → 410 個現存檔案 |
| regression tests | 真實 provenance／關係紀錄，隔離副本測漏檢 |
| 本紀錄 | 上述實測與原始政策，不另立權位 |

交付稽核以 git staged file list 比對這七檔；未要求 ZIP。下列為六個實作／資料檔之 size／SHA-256，本紀錄本身以 Git blob／commit 保存，避免自我雜湊循環。

| 檔案 | bytes | SHA-256 |
|---|---:|---|
| `.github/workflows/mrliouword-sdk-ci.yml` | 18705 | `f41877768b6fe761e956fff7f872d43fe34388e4540948eb79df7d4a8c2742f4` |
| `tools/provenance_fields_check.py` | 10623 | `499f2414b0418cefe0fef99d50506987d8dac089d98dbeb1e50acf93b340523c` |
| `tests/test_provenance_fields_check.py` | 2567 | `9292fbb2544fbae88aabb1f78e2ac662be4d7323f335ce8d8a1741cad6f5ac6b` |
| `tools/provenance_link_check.py` | 1973 | `d21fcf11057f8dade8a09f89626f3cc1aaa3c45c7bd705bd7c1b20447592fb40` |
| `tests/test_provenance_link_check.py` | 935 | `2880d5092c9b035eef821e42f11c704f939add5c2d884579398ffcf0516b286d` |
| `registry/evidence/Mrliou_PR83_Source_Link_Audit_20260925_v1.json` | 195505 | `ac43a4c7d0c697a1e24924f6c903ff19911ad91f5b1d2a0146a97190e1fbece8` |

## 八、我自己的行為與提問

本輪未再問確認。先 fetch main、讀既有規格、執行開工閘門，再做最小修補；讀取真實來源測試，然後建立可執行的檔案引用核對並記錄結果。完成數據均在指令實際輸出之後記入，未先填 PASS。

## 九、矛盾處

9.1 先前只承認欠工作而未動手，與建構要求矛盾；本輪交付可審查程式和測試。

9.2 「同系統」與「保留個別材料來源」可同時成立；本次不以檔案出處另立或降低 MRL 根源，既有欄位和署名保持。

9.3 GitHub 舊 PR 回傳的 base_sha 與 current main 不同，核查使用實際 fetched main，沒有拿舊 base 當現在。

9.4 檔案關係通過不等於遠端使用或 runtime 回傳完成；未驗回執保留顯式狀態。
