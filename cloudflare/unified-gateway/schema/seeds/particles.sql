-- MrLiouWord - 52 Particles Seed Data
-- origin_signature: MrLiouWord

-- Memory Domain (記憶領域)
INSERT OR IGNORE INTO particles (fx, hv, av, dom, act, nrg, links, tags) VALUES
('fx.memory.commit', '記住', '寫入長期記憶', 'memory', 'write', 0.8, '["fx.memory.recall","fx.trace.anchor"]', '["memory","storage"]'),
('fx.memory.recall', '回憶', '從記憶檢索', 'memory', 'read', 0.7, '["fx.memory.commit","fx.logic.analyze"]', '["memory","retrieval"]'),
('fx.memory.forget', '忘記', '標記可回收', 'memory', 'delete', 0.3, '["fx.memory.commit"]', '["memory","cleanup"]'),
('fx.memory.compress', '壓縮記憶', '壓縮成摘要', 'memory', 'transform', 0.6, '["fx.memory.commit","fx.flow.collapse"]', '["memory","optimization"]'),
('fx.memory.absorb', '吸收', '吸收外部素材', 'memory', 'absorb', 0.7, '["fx.memory.commit","fx.memory.index"]', '["memory","absorption"]'),
('fx.memory.index', '索引', '建立記憶索引', 'memory', 'index', 0.75, '["fx.memory.recall","fx.memory.absorb"]', '["memory","indexing"]'),

-- Logic Domain (邏輯領域)
('fx.logic.analyze', '分析', '分解理解結構', 'logic', 'decompose', 0.9, '["fx.logic.synthesize","fx.memory.recall"]', '["logic","analysis"]'),
('fx.logic.synthesize', '綜合', '組合成整體', 'logic', 'compose', 0.85, '["fx.logic.analyze","fx.code.generate"]', '["logic","synthesis"]'),
('fx.logic.decide', '決定', '選擇最佳路徑', 'logic', 'choose', 0.75, '["fx.logic.analyze","fx.flow.branch"]', '["logic","decision"]'),
('fx.logic.infer', '推理', '邏輯推導', 'logic', 'infer', 0.8, '["fx.logic.analyze","fx.logic.decide"]', '["logic","reasoning"]'),
('fx.logic.validate', '驗證', '檢查邏輯一致性', 'logic', 'validate', 0.7, '["fx.logic.infer","fx.code.validate"]', '["logic","validation"]'),

-- Code Domain (代碼領域)
('fx.code.generate', '生成代碼', '意圖轉為代碼', 'code', 'create', 0.9, '["fx.logic.synthesize","fx.code.validate"]', '["code","generation"]'),
('fx.code.validate', '驗證代碼', '檢查代碼正確性', 'code', 'check', 0.7, '["fx.code.generate","fx.code.fix"]', '["code","validation"]'),
('fx.code.fix', '修復代碼', '自動修正錯誤', 'code', 'repair', 0.75, '["fx.code.validate","fx.code.refactor"]', '["code","repair"]'),
('fx.code.refactor', '重構', '改善代碼結構', 'code', 'transform', 0.8, '["fx.code.fix","fx.code.optimize"]', '["code","refactoring"]'),
('fx.code.optimize', '優化', '提升效能', 'code', 'optimize', 0.85, '["fx.code.refactor","fx.code.generate"]', '["code","optimization"]'),
('fx.code.test', '測試', '執行測試驗證', 'code', 'test', 0.7, '["fx.code.validate","fx.code.fix"]', '["code","testing"]'),

-- Language Domain (語言領域)
('fx.language.parse', '解析', '語法分析', 'language', 'parse', 0.75, '["fx.language.understand","fx.logic.analyze"]', '["language","parsing"]'),
('fx.language.understand', '理解', '語意理解', 'language', 'comprehend', 0.85, '["fx.language.parse","fx.logic.infer"]', '["language","comprehension"]'),
('fx.language.generate', '生成語言', '自然語言生成', 'language', 'generate', 0.8, '["fx.language.understand","fx.code.generate"]', '["language","generation"]'),
('fx.language.translate', '翻譯', '語言轉換', 'language', 'translate', 0.7, '["fx.language.parse","fx.language.generate"]', '["language","translation"]'),

-- Signal Domain (信號領域)
('fx.signal.detect', '偵測', '信號偵測', 'signal', 'detect', 0.8, '["fx.signal.filter","fx.trace.anchor"]', '["signal","detection"]'),
('fx.signal.filter', '濾波', '信號過濾', 'signal', 'filter', 0.7, '["fx.signal.detect","fx.signal.transform"]', '["signal","filtering"]'),
('fx.signal.transform', '變換', '信號轉換', 'signal', 'transform', 0.75, '["fx.signal.filter","fx.signal.encode"]', '["signal","transformation"]'),
('fx.signal.encode', '編碼', '信號編碼', 'signal', 'encode', 0.7, '["fx.signal.transform","fx.signal.decode"]', '["signal","encoding"]'),
('fx.signal.decode', '解碼', '信號解碼', 'signal', 'decode', 0.7, '["fx.signal.encode","fx.language.parse"]', '["signal","decoding"]'),

-- Trace Domain (追蹤領域)
('fx.trace.anchor', '錨定', '創建檢查點', 'trace', 'anchor', 0.7, '["fx.trace.jump","fx.memory.commit"]', '["trace","checkpoint"]'),
('fx.trace.jump', '跳轉', '回溯檢查點', 'trace', 'jump', 0.65, '["fx.trace.anchor","fx.flow.restore"]', '["trace","navigation"]'),
('fx.trace.merkle', 'Merkle驗證', 'Merkle樹驗證', 'trace', 'verify', 0.8, '["fx.trace.anchor","fx.memory.commit"]', '["trace","verification"]'),
('fx.trace.log', '記錄', '追蹤日誌', 'trace', 'log', 0.6, '["fx.trace.anchor","fx.memory.commit"]', '["trace","logging"]'),

-- Persona Domain (人格領域)
('fx.persona.wake', '喚醒', '激活人格', 'persona', 'activate', 0.9, '["fx.persona.sleep","fx.memory.recall"]', '["persona","activation"]'),
('fx.persona.sleep', '休眠', '暫停人格', 'persona', 'deactivate', 0.3, '["fx.persona.wake","fx.memory.compress"]', '["persona","deactivation"]'),
('fx.persona.evolve', '進化', '人格進化', 'persona', 'evolve', 0.85, '["fx.persona.wake","fx.memory.absorb"]', '["persona","evolution"]'),
('fx.persona.split', '分裂', '人格分裂', 'persona', 'split', 0.7, '["fx.persona.wake","fx.persona.merge"]', '["persona","splitting"]'),
('fx.persona.merge', '融合', '人格融合', 'persona', 'merge', 0.75, '["fx.persona.split","fx.flow.collapse"]', '["persona","merging"]'),

-- Flow Domain (流程領域)
('fx.flow.start', '開始', '初始化流程', 'flow', 'init', 0.8, '["fx.flow.end","fx.trace.anchor"]', '["flow","lifecycle"]'),
('fx.flow.end', '結束', '終止流程', 'flow', 'terminate', 0.5, '["fx.flow.start","fx.memory.compress"]', '["flow","lifecycle"]'),
('fx.flow.branch', '分支', '創建分支', 'flow', 'branch', 0.7, '["fx.flow.merge","fx.logic.decide"]', '["flow","branching"]'),
('fx.flow.merge', '合併', '合併分支', 'flow', 'merge', 0.75, '["fx.flow.branch","fx.flow.collapse"]', '["flow","merging"]'),
('fx.flow.collapse', '坍縮', '多路徑坍縮', 'flow', 'collapse', 0.8, '["fx.flow.merge","fx.logic.decide"]', '["flow","resolution"]'),
('fx.flow.restore', '恢復', '從檢查點恢復', 'flow', 'restore', 0.75, '["fx.trace.jump","fx.memory.recall"]', '["flow","recovery"]'),
('fx.flow.loop', '循環', '重複執行', 'flow', 'loop', 0.6, '["fx.flow.branch","fx.logic.decide"]', '["flow","iteration"]'),

-- Meta Domain (元認知領域)
('fx.meta.origin', '溯源', '追溯根本來源', 'meta', 'trace_origin', 0.9, '["fx.trace.anchor","fx.memory.recall"]', '["meta","origin"]'),
('fx.meta.reflect', '反思', '自我反省', 'meta', 'reflect', 0.85, '["fx.meta.origin","fx.logic.analyze"]', '["meta","reflection"]'),
('fx.meta.learn', '學習', '元學習', 'meta', 'learn', 0.9, '["fx.meta.reflect","fx.memory.absorb"]', '["meta","learning"]'),
('fx.meta.adapt', '適應', '自適應調整', 'meta', 'adapt', 0.8, '["fx.meta.learn","fx.persona.evolve"]', '["meta","adaptation"]'),
('fx.meta.observe', '觀察', '自我觀察', 'meta', 'observe', 0.75, '["fx.meta.reflect","fx.trace.log"]', '["meta","observation"]'),

-- System Domain (系統領域)
('fx.system.init', '初始化', '系統初始化', 'system', 'init', 0.7, '["fx.system.config","fx.flow.start"]', '["system","initialization"]'),
('fx.system.config', '配置', '系統配置', 'system', 'configure', 0.6, '["fx.system.init","fx.system.monitor"]', '["system","configuration"]'),
('fx.system.monitor', '監控', '系統監控', 'system', 'monitor', 0.65, '["fx.system.config","fx.trace.log"]', '["system","monitoring"]'),
('fx.system.heal', '自癒', '自我修復', 'system', 'heal', 0.8, '["fx.system.monitor","fx.code.fix"]', '["system","healing"]'),
('fx.system.shutdown', '關閉', '系統關閉', 'system', 'shutdown', 0.4, '["fx.system.monitor","fx.flow.end"]', '["system","shutdown"]');
