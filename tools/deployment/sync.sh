#!/bin/bash
# MrLiouWord 資料同步腳本
# origin_signature: MrLiouWord

set -e

echo "🔄 MrLiouWord 資料同步"
echo "======================"

ENDPOINT="https://mrliouword-unified.liouuuuu.workers.dev"

# 同步所有資料
echo "正在同步..."
curl -X POST "$ENDPOINT/sync/all" -H "Content-Type: application/json" -s | jq '.' || {
  echo "❌ 同步失敗"
  exit 1
}

echo ""
echo "✅ 同步完成"
echo ""

# 顯示同步狀態
echo "同步狀態:"
curl -X GET "$ENDPOINT/sync/status" -s | jq '.' || {
  echo "❌ 無法獲取同步狀態"
  exit 1
}
