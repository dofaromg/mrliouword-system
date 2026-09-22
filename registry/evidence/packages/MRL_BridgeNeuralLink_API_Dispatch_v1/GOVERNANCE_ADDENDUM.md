# MRL 世界模型商業規則律法 — 協作建構增補 20260922-v1

origin_signature: MrLiouWord
record_type: MRL_COMMERCIAL_WORLD_MODEL_ADDITIVE_GOVERNANCE
version: 20260922-v1
construction_status: BUILT_FOR_REVIEW
commercial_decision: COMMERCIAL_UNRESOLVED
authority_effect: 既有 Notion 規則的增量實作與修訂候選；不另立母線，不自動變更產品歸屬或既有契約。
## 1. 唯一根源與承接關係
本次建構依 Mr.liou 指示，以 Notion MRL 世界模型為唯一內部定義根源。既有頂層規則、創作者公平治理、商業憲章、權利台帳、決策 Gate 與交易稽核共同構成本修訂的上位依據。
<mention-page url="https://app.notion.com/p/3c38eeeec5b581bda54ee462e627b3e0"/>
<mention-page url="https://app.notion.com/p/3bb8eeeec5b581a692d3c7d45a3cf4c3"/>
<mention-page url="https://app.notion.com/p/3bb8eeeec5b581238cf4dbc2548f6006"/>
<mention-page url="https://app.notion.com/p/3bb8eeeec5b581299c21c8fda4a8c965"/>
<mention-page url="https://app.notion.com/p/3bb8eeeec5b5810a8d95e7339ea43a0d"/>
<mention-page url="https://app.notion.com/p/3bb8eeeec5b581488c41ff44e098d179"/>
Drive 保存跨端材料、交付副本與回執；GitHub 保存工程版本；三方 API worker 產生候選分析。這些來源不得自行提升為 Notion 規則制定者。Notion 同名頁、封存副本或最新修改日期不能單獨決定權威，須保存 parent/source_ref 與生效決策。
## 2. 規則版本與生效
每次派工保存 root_page_id、rule_page_ids、page_last_edited_at、snapshot_sha256、policy_sha256、observed_at、effective_decision_ref、valid_until。文件快照只代表該次讀取；live 派工前重新核對引用頁及決策紀錄。根源變更、來源缺漏或相互衝突，該工作項進入 POLICY_CONFLICT / NOTION_REVALIDATION_REQUIRED，不以舊快照默認繼續。
本版具體新增的欄位、技術門檻與責任分工為修訂候選；既有有效規則持續有效。正式生效需沿既有 Authority Decision Gate 留存決策，不以這次 AI 寫入代替權威核准。
## 3. 原創權、治理權與安全權
承接三權分離：保存原創來源不代表創作者不會犯錯；治理與安全限制不消除原創來源。作者、供應商、模型執行者、儲存平台、客戶與產品權威分欄保存。
origin_signature 的字串身份與密碼學簽章分欄。SHA256 證明被比較內容的一致性，不單獨證明作者、法律權利或真實付款。若採數位簽章，另存 signing_key_id、algorithm、signature、verification_ref 及撤銷狀態。
## 4. 產品身份與商品映射
沿用 canonical_product_id: MRL_APIWorks_BYOH_Deployment_Product_v1；sku: MRL-APIWORKS-BYOH-DEPLOY-V1；origin_signature: MrLiouWord。新文件的 MRL-CREDITS-100 為不同售賣項識別，須建立 offer_id → canonical_product_id → entitlement 的明示映射，不能以測試 credit 訂單替代 BYOH 商品成交。
商品記錄補齊：canonical_name、creator、contributors、source_lineage、product_authority、merchant_legal_entity_ref、supplier_dependencies、license_dependencies、customer_rights、retained_rights、offer_version、price_terms_ref。商戶顯示名稱不是公司登記或簽約權限證據。
## 5. 十二項權利逐項處理
沿用 access、use、deployment、modification、derivative、distribution、sublicense、data、source、core_technology、brand_naming、commercialization。
每一項記錄 state、grantor、grantee、scope、territory、term、quantity_or_environment_limit、grant_ref、revocation_or_exit_ref。state 僅為 GRANTED、NOT_GRANTED、UNRESOLVED；空白不可轉成 GRANTED。
MRL core、Mother、source、品牌、再授權與轉售各自判斷，不由訂閱、部署、代管、投資或 API 付款推定取得。客戶依法或依約取得的資料與使用權同樣須完整保存；不得將 NOT_GRANTED 用作扣留客戶資料的通用理由。
## 6. 供應商、材料與模型依賴
每項依賴保存 provider、original_name、MRL_mapping、service、model_or_version、contract_ref、license_ref、data_terms_ref、billing_model、region、retention、termination_effect、exportability、dependency_scope、review_actor、review_at。
Structural Alignment 只表示結構對照；Direct Lineage 須另有可定位父子鏈與接觸／傳播證據。更換模型供應商只改 dependency binding，不重寫產品來源。
本版沒有代填供應商契約或 license；缺失標 UNRESOLVED，涉及該權利的商業決策不得通過。
## 7. 商業決策與角色分離
沿用 Identity → Rights → Dependencies → Customer → Retained Rights → Economics → Data → Exit → Conflict → Approval → Evidence → Audit。
保留原狀態 COMMERCIAL_APPROVED、COMMERCIAL_REJECTED、COMMERCIAL_UNRESOLVED、COMMERCIAL_QUARANTINED。技術完整性檢查只能輸出 BLOCKED 或 READY_FOR_AUTHORITY_REVIEW，不能自行產生 COMMERCIAL_APPROVED。
變更 creator、origin、product authority、license authority 或 safety boundary 時，執行者不能同時是唯一證據來源、唯一裁決者及唯一寫入者。reviewer_ref、approver_ref 依既有 Authority Registry 指定，缺者為 UNRESOLVED；不同 AI 品牌不自動構成獨立授權審核。
## 8. 證據等級與適用範圍
每份 evidence 保存 ref、sha256、observer、observed_at、retrieved_at、subject、account_or_project、environment、method、request_id、redacted_response_ref、limitations、evidence_level、supersedes_ref。
evidence_level 分為 DECLARED、AGENT_REPORTED、SOURCE_INSPECTED、DIRECT_RUNTIME、INDEPENDENTLY_CORROBORATED。這是本次新增的稽核分類，不以等級名稱代替內容審核。
PASS 必須附 gate_id 與 scope。HTTP 200、畫面文字、收據 ID、金流連結、schema 文件、mock 測試各自只能支持相應層次的結論。收到文字摘要不提升為本輪直接實測。
## 9. 帳號與工作區邊界
資源 inventory 的結論必須綁定 account_id、zone/project、credential_scope 及 observed_at。Cloudflare 目標帳號 0b36a4577da7fced6df2e062fa5f6fa2、Registry D1 7980baaf-48d3-43cc-8be7-dd8c9590f3d1 目前為既有紀錄中的核對目標，未經正確帳號讀取不得宣告當前資源狀態。
client_id 或 x-mrl-workspace-id 只能作識別線索，商業 API 的授權須驗證服務端憑證與 workspace 綁定；禁止以任意 header 取得其他客戶資料。回執查詢與派工使用不同權限，金鑰不寫入 public app.js、聊天或公開文件。
## 10. 模型推論與計量
MODEL_INFERENCE_VERIFIED 至少需要 request_id、實際 provider/model/version、完成狀態、非空 output 或 output_ref、output_sha256、usage_source、錯誤處理與對應 provider receipt。token/cost 欄位或 route_trace 不能單獨證明推論。
未完成、截斷、拒絕、timeout、mock 與 fixture 分別記錄；未知結果不得自動重送收費。credit 初始贈額、用量扣抵、實付、退款及供應商成本分帳；receipt 不能單獨成為付款或收入證據。
## 11. 金流、撥款與營收
分立 CONNECTOR_AUTH、SITE_COMMERCE_METADATA、STRIPE_ACCOUNT_VERIFICATION、CHECKOUT_FLOW、WEBHOOK_VERIFICATION、PAYMENT_SETTLED、PAYOUT_READINESS、CUSTOMER_ACCEPTANCE。
站內 charges_enabled 或 webhook_configured 宣告不能單獨通過 Stripe 帳號／簽章驗證。OAuth 過期是該連線觀測，不能等同 Stripe 故障；另一來源觀測也不抹除原失敗紀錄。
付款事件要核對 merchant/account、livemode、event_id、簽章驗證結果、order/customer、金額、幣別、狀態與冪等入帳。付款成功、銀行撥款就緒與客戶驗收互不替代。
FIRST_REALIZED_REVENUE_PASS 依既有商品閉環要求真實簽署訂單、確認付款與客戶驗收，缺任一仍 NOT_ELIGIBLE。其為內部閉環標記，不等同會計收入認列結論。
## 12. 交付、私有母體與環境
分立 PUBLIC_SURFACE、BUILD、DEPLOYMENT、ROUTE、RUNTIME、DATA_BINDING、PRIVATE_BYOH_ACCEPTANCE。公開展示站上線不表示母體或客戶私有 runtime 已交付。
BYOH 記錄部署環境、硬體清單、版本 digest、執行權、可攜出資料、維護範圍、驗收案例與退出方式。私有 Mother endpoint 不因商業前端需 API 就直接公開。
本輪保持使用者既有邊界：不改 DNS、既有路由與 production。Vercel nextjs-see 域名問題與 Sites 公開前端分別建依賴表；未找到實際依賴前，不將前者定為全商業前端阻擋。
## 13. 三方派工與回執
承接 Mrliou_MRL_RooClaudeCode_BridgeNeuralLink_v1，不另起母線。
OpenAI API：來源／架構與依賴核對；Anthropic API：工程與 runtime 證據核對；Gemini API：Drive 文件映射與 provenance 核對。此為本次候選分工，不宣稱已控制三個原生聊天視窗。
task contract 保存 task_id、idempotency_key、workspace、scope、policy_sha256、source_refs、input_sha256、provider/model、state；receipt 保存 previous_sha256、output_sha256、usage、error_code、execution_mode、acceptance、rights_transfer。
模型只處理經授權送出的材料；不自動抓取整個 Notion/Drive 私有資料。模型回覆視為候選，不作 shell、DNS、路由、付款、刪除或權利授予命令執行。
聊天端透過有權限的 reader 查 task_id 結果。Drive 僅投影回執與材料；自動投影需受限 folder 權限及重送去重，未接通標 NOT_CONNECTED，不以手動上傳包宣稱即時同步。
## 14. 衝突、缺漏與修訂
衝突記錄必備 conflict_id、rule_ref、claim_a、claim_b、evidence_refs、affected_gates、resolution_owner、status、decision_ref。禁止用較新時間直接覆寫較早、不同帳號或不同測試範圍的證據。
修訂採 before、proposed、evidence、decision、actor、reason、after 的 append-only 記錄。保留舊 rule_id，明示 supersedes/extends；不重寫原檔名稱、作者與來源。
## 15. 客戶條款與外部法規定位
依既有憲章第 11 節，本律法為 MRL 內部治理與契約設計基線。對外契約另記 legal_entity、customer_type、jurisdiction、governing_law、dispute_forum、license、privacy/data_processing、refund/cancellation、renewal、SLA、liability、termination/export 與稅務／發票處理的有效來源、適用範圍及審閱紀錄。
上述欄位缺實際交易對象或法域時標 UNRESOLVED，不能由 AI 猜定國別法律、退款天數、稅率或責任上限。本版不主張已完成任何法域的法律合規認證。
## 16. 探針、事故與退出
GET 與 POST 分列；建立 workspace、partner、receipt、order 是寫入，文件不能統稱只讀。探針物件記 is_test、actor、authorization_ref、created_at、target_environment、cleanup_proposal；無刪除授權時僅保留清理候選。
本次指定報告所列四個測試物件保留原證據，不刪除。不將其贈額、測試訂單或 partner CANDIDATE 計入實際客戶、營收或正式合作。
事故與退出記錄隔離措施、受影響主體、資料返還／刪除依據、金鑰撤銷、供應商停止使用條件與可保留 audit 範圍；不以 append-only 要求无限保存不應保留的個資。
## 17. 本次文件逐項校正
材料來源：[Mrliou_MRL_CrossAgent_Runtime_Verification_20260922_v1](https://docs.google.com/document/u/0/d/1qBknjUoLuSFQMtU_eepKRYMOa5dbgnjtQEH0n1qXhsc/mobilebasic)；文件修改時間 2026-09-22T09:27:30.774Z；本輪已讀全文，執行內容屬 Claude/Gemini 報告。
- 八個端點：新文件補列 /api/files/{id}，解決先前七項清單與「八個」文字不符。
- Stripe：新增 SITE_COMMERCE_METADATA = AGENT_REPORTED；CONNECTOR_AUTH 保留既有 BLOCKED_REAUTH 的來源與時間；STRIPE_ACCOUNT_VERIFICATION 待直接證據，不直接改 LIVE_READ_OK。
- R2：GET /api/files 的 NOT_FOUND 與錯誤帳號的 10042 分開；R2_FILESYSTEM = UNVERIFIED_ACCOUNT_BINDING，不斷言目標帳號未開通。
- D1：workspace/wallet/order/partner 的 HTTP 回應為應用層觀測；持久性與帳號／D1 綁定待 read-after-write、bindings 與正確帳號證據。
- 推論：無 output 可標 MODEL_OUTPUT_UNVERIFIED / STUB_SUSPECTED；「完全沒呼叫模型」仍需 handler 或 provider logs。
- 統一 API：NXDOMAIN 保留 AGENT_REPORTED，需有時間、解析器、查詢型別的直接 DNS 證據；不自動公開 DL580 或建立 CNAME。
- 身份：localStorage/workspace header 與真正驗證授權分開；需測跨工作區拒絕、key 失效與最小權限。
- 合作夥伴：CANDIDATE 不等於正式合作協議；探針物件不計商業成果。
## 18. 完成與待補證據
本次完成的是根源承接、條款增補、可執行欄位契約、證據分層、衝突校正與本地派工候選。並未宣告外部法規審閱、商業核准、真實付款、production 部署或三方 live API 回執完成。
接續閉環需要：Authority Registry 的具名 reviewer/approver 與決策、商品與 credit offer 映射、實際供應商授權、客戶資料／退出條款、法域與商戶主体資料、正確 Cloudflare 帳號證據、真實 provider/付款/驗收回執、原橋接缺少的 ExtensionChannel 與鎖定相依版本。
缺證據不以杜撰補完；以定位欄位、負責角色與可重現验收方法補齊工程結構。

