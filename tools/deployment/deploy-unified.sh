#!/bin/bash
# MrLiouWord 統一系統一鍵部署
# origin_signature: MrLiouWord
# 怎麼過去，就怎麼回來

set -e

echo "🌀 MrLiouWord 統一系統部署"
echo "=============================="
echo ""

# 顏色定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 檢查是否在正確目錄
if [ ! -f "cloudflare/unified-gateway/package.json" ]; then
  echo "❌ 錯誤: 請在專案根目錄執行此腳本"
  exit 1
fi

# 1. 進入 unified-gateway 目錄
echo -e "${BLUE}[1/6]${NC} 進入 unified-gateway 目錄..."
cd cloudflare/unified-gateway

# 2. 安裝依賴
echo -e "${BLUE}[2/6]${NC} 安裝 npm 依賴..."
npm install

# 3. 初始化 D1 資料庫
echo -e "${BLUE}[3/6]${NC} 初始化 D1 資料庫..."
echo "  → 創建資料庫結構..."
wrangler d1 execute mrliouword-db --env production --file=schema/d1-schema.sql || {
  echo -e "${YELLOW}警告: 資料庫結構可能已存在${NC}"
}

# 4. 載入種子資料
echo -e "${BLUE}[4/6]${NC} 載入種子資料..."
echo "  → 載入 52 個粒子..."
wrangler d1 execute mrliouword-db --env production --file=schema/seeds/particles.sql || {
  echo -e "${YELLOW}警告: 粒子資料可能已存在${NC}"
}
echo "  → 載入 9 個層級..."
wrangler d1 execute mrliouword-db --env production --file=schema/seeds/layers.sql || {
  echo -e "${YELLOW}警告: 層級資料可能已存在${NC}"
}

# 5. 部署 Worker
echo -e "${BLUE}[5/6]${NC} 部署 Cloudflare Worker..."
wrangler deploy --env production

# 6. 執行初始同步
echo -e "${BLUE}[6/6]${NC} 執行初始同步..."
sleep 3  # 等待 Worker 啟動
curl -X POST https://mrliouword-unified.liouuuuu.workers.dev/sync/all -s || {
  echo -e "${YELLOW}警告: 同步請求失敗，請稍後手動執行${NC}"
}

echo ""
echo -e "${GREEN}✅ 部署完成!${NC}"
echo ""
echo "端點: https://mrliouword-unified.liouuuuu.workers.dev"
echo ""
echo "測試命令:"
echo "  curl https://mrliouword-unified.liouuuuu.workers.dev/"
echo "  curl https://mrliouword-unified.liouuuuu.workers.dev/health"
echo "  curl https://mrliouword-unified.liouuuuu.workers.dev/particles"
echo ""
