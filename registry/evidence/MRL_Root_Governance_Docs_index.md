---
canonical_authority: Mr.liou
origin_signature: MrLiouWord
source_repo: 外部（dofaromg/----2 的快照，非本倉庫產出）
source_artifact: ----2-main.zip
source_version: "2026-08-04（文件內宣告的 updated_at）"
derivative_role: projection
artifact_owner: Mr.liou
contributors:
  - "Mr.liou（治理文件作者）"
  - "Claude Code（本倉庫：建立索引與雜湊，未複製全文）"
transformation: >-
  只建立檔案索引與 sha256 前 16 碼，未把另一個倉庫的 canonical 文件複製進來。
  理由：那些文件在 dofaromg/----2 是 canonical，複製進這個
  canonical_authority: false 的倉庫會製造第二份看起來像 canonical 的副本。
verification_status: verified
source_sha256: 77728fb5b40b228dada0091cac11604cb80e241b5859e0b8fff45f6b593908f5
preserved_at: "2026-09-21"
---

<!-- mrl-origin: MrLiouWord -->

# `dofaromg/----2` 治理文件索引

**不複製全文。** 那些文件在 `----2` 是 canonical；複製進本倉庫
（`canonical_authority: false`）會製造第二份看起來像 canonical 的副本——
正是署名事件紀錄稱作「反向混淆」、也是 `MRL_DELTA_CORE` 那一課的同一件事。

這裡只留索引與雜湊，讓日後比對得出是同一份。

> ⚠️ **這個倉庫是否為 canonical root 尚未裁決**，見
> `registry/evidence/DELTA_canonical_root_unresolved.md`。

| 檔案 | bytes | sha256（前 16） |
| --- | ---: | --- |
| `.github/ISSUE_TEMPLATE/custom.md` | 126 | `a062d66844de4e39` |
| `Input_structure_for_QC_calculations.ipynb` | 155590 | `41344d42b607ba0a` |
| `README.md` | 1857 | `f6d48bdf445d40c7` |
| `docs/MRL_#U5de5#U7a0b#U898f#U7bc4_v1.0.md` | 2320 | `949a69e072e13175` |
| `docs/MRL_PLATFORM_ROUTING.md` | 2363 | `fbf0b7d65d936e3b` |
| `docs/MRLiou_Particle_World_Canonical_Chain_v1.0.md` | 7095 | `0c0ff04cb55d75bc` |
| `docs/NAMING.md` | 3260 | `001a55143b458b1f` |
| `docs/SOVEREIGNTY.md` | 2276 | `630988807296f56d` |
| `docs/SYSTEM_POSITIONING.md` | 3240 | `cbf4c173952f41d0` |
| `examples/Spatial_understanding_3d.ipynb` | 19318243 | `695c2e0d28fe89e1` |
| `ingest/2026-07-25/definition/MrliouAI_CoverageMap_v1_0_0.md` | 2492 | `e373a467459c5ee7` |
| `ingest/2026-07-25/pipeline/logic_pipeline.py` | 1452 | `811b34825355c005` |
| `ingest/2026-07-25/pipeline/pipeline_sync_localfs.json` | 663 | `8aa286fe2a473b48` |
| `ingest/2026-07-25/registry/asset_registry.json` | 1555 | `16970e3e32381276` |
| `registry/MRL_CANONICAL_SYNC_v1.0.yaml` | 2180 | `4a687c37638bc1c1` |

合計 **15** 個檔案。

## 這批文件裡已經定義好、本倉庫不必重新發明的

| 主題 | 定義於 |
| --- | --- |
| 主權歸屬與最終解釋權 | `docs/SOVEREIGNTY.md` |
| 四層定位（ROOT／DEFINITION RUNTIME／BACKEND／FRONTEND） | `docs/SYSTEM_POSITIONING.md` |
| 四平台角色（Notion／GitHub／Drive／Dropbox） | `registry/MRL_CANONICAL_SYNC_v1.0.yaml` |
| 命名前綴四分類（`MRL_`／`Mrliou_`／`mrl-`／`mrl_`） | `docs/NAMING.md` |
| 官方路由（mrliouword.com／mrliouhan.ai／DL580） | `docs/MRL_PLATFORM_ROUTING.md` |
| 根源主鏈與三態循環 | `docs/MRLiou_Particle_World_Canonical_Chain_v1.0.md` |

其中**四平台角色**直接回答了一直懸著的「connection_audit 要不要升級成跨平台索引」——
角色已經定義好了，缺的是接線，不是定義。
