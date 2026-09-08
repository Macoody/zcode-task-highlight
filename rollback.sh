#!/bin/bash
# 恢复原版 app.asar
# 用法: ./rollback.sh [zcode|chatgpt|all]    默认 all（恢复每个应用最近一次的备份）
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"

restore_app() {
  local KEY="$1" APP
  case "$KEY" in
    zcode) APP="/Applications/ZCode.app" ;;
    chatgpt) APP="/Applications/ChatGPT.app" ;;
  esac
  local BKDIR="$DIR/backups-$KEY"
  local BAK=$(ls "$BKDIR"/app.asar.*.bak 2>/dev/null | sort -V | head -1)
  if [ -z "$BAK" ]; then echo "⚠️ [$KEY] 未找到备份，跳过"; return 0; fi
  echo "🔄 [$KEY] 使用备份恢复: $(basename "$BAK")"
  cp "$BAK" "$APP/Contents/Resources/app.asar.new"
  mv -f "$APP/Contents/Resources/app.asar.new" "$APP/Contents/Resources/app.asar"
  local UBAK=$(ls -d "$BKDIR"/app.asar.unpacked.*.bak 2>/dev/null | sort -V | head -1)
  if [ -n "$UBAK" ]; then
    rm -rf "$APP/Contents/Resources/app.asar.unpacked"
    cp -R "$UBAK" "$APP/Contents/Resources/app.asar.unpacked"
  fi
  codesign --force --deep -s - "$APP"
  echo "✅ [$KEY] 已回滚，请完全退出该应用后重新打开。"
}

TARGET="${1:-all}"
if [ "$TARGET" = "all" ]; then
  restore_app zcode
  restore_app chatgpt
else
  restore_app "$TARGET"
fi
