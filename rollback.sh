#!/bin/bash
# zcode-task-highlight 回滚到原版
set -euo pipefail
APP="/Applications/ZCode.app"
DIR="$(cd "$(dirname "$0")" && pwd)"
BAK=$(ls "$DIR"/app.asar.*.bak 2>/dev/null | head -1)
[ -n "$BAK" ] || { echo "❌ 未找到备份文件"; exit 1; }
echo "🔄 使用备份恢复: $(basename "$BAK")"
cp "$BAK" "$APP/Contents/Resources/app.asar.new"
mv -f "$APP/Contents/Resources/app.asar.new" "$APP/Contents/Resources/app.asar"
UBAK=$(ls -d "$DIR"/app.asar.unpacked.*.bak 2>/dev/null | head -1)
if [ -n "$UBAK" ]; then
  rm -rf "$APP/Contents/Resources/app.asar.unpacked"
  cp -R "$UBAK" "$APP/Contents/Resources/app.asar.unpacked"
fi
codesign --force --deep -s - "$APP"
echo "✅ 已回滚，请完全退出 ZCode（Cmd+Q）后重新打开。"
