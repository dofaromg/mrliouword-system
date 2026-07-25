# External Products Materials Zone

此區專門存放「外部產品成立材料」，避免與主體程式碼混放。

## 分類放置規則

- `materials/external-products/archives/`：壓縮包、備份包、交付包（zip/tar/tgz/7z）
- `materials/external-products/binaries/`：可執行檔、映像、編譯產物
- `materials/external-products/documents/`：外部產品說明文檔、規格、報告
- `materials/external-products/media/`：圖片、錄影、示意素材
- `materials/external-products/configs/`：外部環境配置導出（非主體配置）

## 邊界規則

1. 主體程式碼仍以倉庫既有模組與目錄為準。
2. 外部材料只進入本區，不直接覆蓋主體檔案。
3. 需要整合時，請以 PR 方式逐項導入並保留追溯紀錄。
