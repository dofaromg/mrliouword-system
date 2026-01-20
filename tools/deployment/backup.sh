#!/bin/bash
# MrLiouWord D1 資料庫備份腳本
# origin_signature: MrLiouWord

set -e

echo "💾 MrLiouWord 資料庫備份"
echo "========================"

# 創建備份目錄
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "備份目錄: $BACKUP_DIR"
echo ""

# 檢查是否在正確目錄
if [ ! -f "cloudflare/unified-gateway/wrangler.toml" ]; then
  echo "❌ 錯誤: 請在專案根目錄執行此腳本"
  exit 1
fi

cd cloudflare/unified-gateway

# 匯出 D1 資料庫
echo "正在匯出資料庫..."
wrangler d1 export mrliouword-db --env production --output="../../$BACKUP_DIR/db.sql"

echo ""
echo "✅ 備份完成: $BACKUP_DIR/db.sql"
echo ""

# 顯示備份檔案資訊
ls -lh "../../$BACKUP_DIR/db.sql"
