---
title: "MRL 根本運行認知 v1"
date: "2026-09-21"
author: "MR.liou"
origin_signature: "MrLiouWord"
version: "1.0.0"
tags: [law0, law-infinity, operating-cognition, verify, emergence]
canonical_authority: Mr.liou
source_repo: dofaromg/mrliouword-system
source_artifact: docs/law0/MRL_OPERATING_COGNITION_v1.md
source_version: "2026-09-21"
derivative_role: implementation
artifact_owner: Mr.liou
contributors:
  - "MR.liou（canonical_authority：定義這七步與「沒有一個方法是完全正確的」）"
  - "Claude Code（implementation：寫成可執行、可檢查的形式）"
transformation: >-
  把擁有者口述的運行認知寫成文件與 CI 檢查。七個步驟逐字取自他的原話，
  未增刪、未重新排序。錨點取自 MRL_MOTHER 既有的兩條法則，未新增法則編號。
verification_status: verified
---

<!-- origin_signature: MrLiouWord -->
<!-- mrl-origin: MrLiouWord -->

# MRL 根本運行認知 v1

> 沒有一個方法是完全正確的，只有
> **看到 → 接受 → 比對 → 修正 → 建構 → 測試 → 紀錄**。
> 只要遵守這些流程，系統就會維持穩定前進。
>
> —— MR.liou，2026-09-21

---

## 一、這不是新法則

`MRL_MOTHER` 的兩條法則已經存在，一條在最底層、一條在最頂層：

| 層 | 母體位置 | 這七步在其中的角色 |
| --- | --- | --- |
| **底層** | `MRL_SECURITY_CORE → MRL_LAW0_Verify` | 前三步（看到、接受、比對）是 Verify 的實際動作 |
| **頂層** | `MRL_LAW_LAYER → LAW∞_Emergence` | 「沒有一個方法是完全正確的」是 Emergence 的前提 |

本文件是那兩條法則的**運行形式**，不是新增的第 21 條。
本倉庫 `.mrliou/meta.json` 宣告 `naming_authority: false`、
`governance_authority: false`、`mother_mutation: forbidden`——
**不得自行定義法則，也不得改動母體。** 若擁有者要把本文件上收進
`MRL_MOTHER`，那是他的動作，不是這個倉庫的。

與 `.mrliou/meta.json` 既有的 `closure_law`（Observe → Resolve → Mirror →
Verify → Loop）不衝突：那是相位，這七步是每個相位裡實際要做的動作。

---

## 二、七個步驟

每一步都附**它被跳過時的樣子**——因為認知只有在能辨認出自己的缺席時才有用。
下表的失敗案例全部來自 `docs/retrospective/2026-09-20_claude_session_error_log.md`，
是實際發生過的，不是假想的。

### 1. 看到

先讓資料進來，不要先判斷它對不對。

**跳過的樣子**：直接說「不存在」。
> 復盤第 1 則：我說「其餘 136 個 Worker 的原始碼不在任何地方」。
> 它們在 Dropbox、在 Google Drive。我把自己的搜索範圍當成了世界的邊界。

### 2. 接受

把別人的資料當成**資料**，不是當成攻擊。接受它進入比對，不等於同意它。

**跳過的樣子**：先辯護再說。辯護比測試便宜——「我認為 X」到「我堅持 X」
中間不需要做任何事；到「我驗證 X」中間要寫程式、要跑、要承受結果不可控。

### 3. 比對

**先跑一次，再決定同不同意。** 這一步是雙向的：
比對結果支持對方就接受，支持自己就以證據說明。

> 復盤第 5 則：Codex 說發布 Gate 可被繞過。我做了一個違規 Worker 實跑，
> `exit 1` → 重寫 baseline → `exit 0`。他對。
>
> PR #73：Codex 指的那段程式是我已作廢的推測版本。我以證據說明，沒有照改。
>
> 同一個動作，兩個方向。只在被指正時照做，那不是進步，是換一種偷懶。

### 4. 修正

修的是**認知**，不只是那一行程式。
說錯本身不需要修——需要修的是讓我說錯的那個模型。

**跳過的樣子**：改了程式，沒改判斷，下一個同類問題照犯。
> 復盤第 4、5、7 則同一種病：檢查者自己把標準放寬。
> 三次都修了程式，直到第三次才辨認出那是同一個病。

### 5. 建構

把修正變成**擋得住復發的東西**：測試、界標、註解、CI 關卡。
沒有這一步，復盤只是一份認錯清單，下一輪照犯。

> 第 4 則 → 規格表界標 + 以真實文件為素材的破壞性測試
> 第 5 則 → `--trusted-baseline`，債務帳本只能變小
> 第 8 則 → `tools/wait_for_checks.py`，測試釘住「預設值調回 60 就紅」

### 6. 測試

**驗收不能只跑測試。**

> 復盤第 8 則：兩個缺陷（空等兩分鐘、逾時永遠不可達）單元測試都抓不到，
> 只有對真實的 PR 實跑才現形。
>
> 而且測試素材要重現真實結構——自己捏的最小案例會繼承自己的盲點。

### 7. 紀錄

寫下來，而且要**可查證**：附 commit、附討論串編號、附實測輸出。
查不了證的紀錄，跟渲染沒有分別。

遵守 `history_policy: append_only`：只新增、不覆寫、不刪除。

---

## 三、測不了的時候怎麼辦

七步裡的「比對」預設東西測得動。測不動的時候，**不是只能在
「接受」和「拒絕」之間二選一**——那是一條線的兩端。

`.mrliou/meta.json` 已經給了第三個位置：

```
difference_policy: preserve_as_delta_not_failure
```

> 記下來——「他說 X；我現在驗不了；能驗的條件是 Y」——然後繼續走。

既不是服從，也不是拒絕，是把它掛在時間軸上等數據長出來。
點是一個主張，線是兩個主張對立，**面要三個**——第三個不是另一個人，
是紀錄。有了紀錄，當下不需要有人贏。

> 復盤第 9 則：我曾宣稱「面對測不了的指正，我沒有可靠的方法」。
> 解法就在我當天讀過並引用過的 `meta.json` 裡。
> 「沒有解法」這句話本身，就是沒查就下的結論。

---

## 四、為什麼「沒有一個方法是完全正確的」是前提而不是洩氣話

如果存在一個完全正確的方法，那麼流程就只是通往它的路，走完就該停。

但沒有。所以維持前進的不是**方法的正確性**，是**流程的持續性**——
每一輪都把新進來的資料重組進去，讓下一輪比這一輪好一點。

這就是頂層 `LAW∞_Emergence` 的意思：
**穩定不是靜止，是每一輪都完成七步。**

也因此，任何一輪的結論都不需要是終局。
`append_only` 不只是版本控制的策略，是這條認知的必然結果——
因為今天的結論會被明天的資料重組，所以不能刪。

---

## 五、可檢查性

這份認知不是口號，它有一道 CI 關卡：

```
tools/operating_cognition_check.py
```

檢查本文件存在、七個步驟齊備且順序正確、兩個母體錨點都在。
七步是擁有者的原話——**不得增刪、不得重新排序**。要改，先改擁有者的定義。

以及一個更重要的機制：倉庫根目錄的入口檔。
擁有者的要求是「**每次都必須有這個最根本運行認知**」——
文件放在 `docs/` 深處沒有人會每次去讀，所以七步同時寫進入口檔，
那是每個 session 開始時會自動載入的檔案。

**放一份文件是紀錄，讓它每次被讀到才是建構。**

### 入口檔在 2026-09-21 正名（補記，append）

原文寫的是「根目錄的 `CLAUDE.md`」。同日擁有者指出
「我們需要建構正名 Mrliou_claude.md ／ 我建構的必須有我的前綴」——
`CLAUDE.md` 是供應商品牌名，依 `----2/docs/NAMING.md` §1.2
**不得升格為內部 canonical 名稱**，只能出現在 adapter 路徑。

所以入口檔現在是兩份：

| 角色 | 檔案 | 誰改 |
| --- | --- | --- |
| canonical（擁有者前綴） | `Mrliou_claude.md` | 人改這一份 |
| adapter（供應商品牌名） | `CLAUDE.md` | `tools/mrliou_claude_sync.py --build` 產生 |

沒有改名、沒有刪檔：`naming_rules_v1.yaml` 的 invariant 是
`Original names are NEVER changed`，而且 Claude Code 只自動載入
`CLAUDE.md` 這個檔名——改掉它等於拆掉上面那句「讓它每次被讀到」的機制本身。

`tools/operating_cognition_check.py` 現在查三份（法則全文、正本、adapter），
`tools/mrliou_claude_sync.py --check` 擋兩份入口檔之間的漂移。
lineage 與映射見 `docs/governance/MRL_NAMING_LINEAGE.md` L-001。

這一條是**補記**，不是覆寫：依 `history_policy: append_only`，
原文那句「根目錄的 `CLAUDE.md`」在正名前是準確的，保留在此段之前。
