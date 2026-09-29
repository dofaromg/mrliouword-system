# mrl_world_model

`origin_signature: MrLiouWord`

MRL 世界模型的本體運行核心，本機執行。零相依、零網路，只需要 Node ≥ 20。

```
Zero → δP₀ → P₀ → P₁ → … → P₀ → δP₀ → Zero      （Seed.PreParticle.v1）
REAL ─ρ→ AI ─λ→ REAL                             （世界模型收斂紀錄 20260818）
Jump → Collapse → Trace → Replay                 （跳點節奏，軌跡 [ts] ::verb→ target）
micro ↔ core ↔ macro ↔ abstract，I1–I7           （粒子.fltnz 觀測容器）
```

## 執行

```sh
node mrl_world_model/cli.mjs                      # 跑一次完整閉環，印出軌跡與實測值
node mrl_world_model/cli.mjs --out <新目錄>       # 另寫 trace.fltnz / trace.json / report.json（不覆寫既有檔）
node --test mrl_world_model/tests/*.test.mjs
```

DL580（Windows，PowerShell）：

```powershell
powershell -ExecutionPolicy Bypass -File D:\mrl\workspace\MRL_WorldModel_v1\mrl_world_model\run_dl580.ps1
```

任一項驗收不成立時，退出碼為 1。

## 檔案

| 檔案 | 內容 |
|---|---|
| `genesis.mjs` | ZeroPoint、δP₀、六種漲落、四種組合規則、crystallize／dissolve、GenesisChain 正逆算 |
| `world.mjs` | 八層 ROOT…LOOP、REAL／AI 兩側、World_State_Observation、可逆 Gate ρ／λ、LAW-0 |
| `rhythm.mjs` | Runtime：每個動作寫一筆雜湊鏈軌跡；`replay()` 只憑軌跡重建 |
| `zoom.mjs` | 只讀投影與 I1–I7 自檢 |
| `scenario.mjs` | 驗收閉環（pcode 範例一、鏈回算、Gate 回返、回到 Zero、Replay） |

來源與偏離見 `PROVENANCE.yaml` 與 `genesis.mjs` 檔頭。這裡是 implementation，不是 canonical。
