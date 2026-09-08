#!/bin/bash
# zcode-task-highlight 一键安装
# 用法: ./apply.sh   （ZCode 升级后重新运行一次即可）
set -euo pipefail

APP="/Applications/ZCode.app"
ASAR="$APP/Contents/Resources/app.asar"
UNPACKED="$APP/Contents/Resources/app.asar.unpacked"
DIR="$(cd "$(dirname "$0")" && pwd)"
INJ="$DIR/injector.js"
MARK="zcode-ui-patch-v6"

command -v npx >/dev/null 2>&1 || { echo "❌ 需要 Node.js（未找到 npx）: https://nodejs.org"; exit 1; }
command -v codesign >/dev/null 2>&1 || { echo "❌ 需要 Xcode Command Line Tools: xcode-select --install"; exit 1; }
[ -d "$APP" ] || { echo "❌ 未找到 $APP"; exit 1; }
[ -f "$INJ" ] || { echo "❌ 未找到 injector.js（请在仓库目录内运行）"; exit 1; }

VERSION=$(defaults read "$APP/Contents/Info.plist" CFBundleShortVersionString 2>/dev/null || echo unknown)
echo "ZCode 版本: $VERSION"

WORK=$(mktemp -d /tmp/zcode-task-highlight.XXXXXX)
trap 'rm -rf "$WORK"' EXIT

echo "📦 解包 app.asar ..."
npx --yes @electron/asar extract "$ASAR" "$WORK/app"

ENTRY=$(ls "$WORK"/app/out/renderer/assets/index-*.js 2>/dev/null | head -1)
[ -n "$ENTRY" ] || { echo "❌ 未找到入口 JS 包，可能是不兼容的版本，未做任何修改"; exit 1; }

PATCHED=0
for f in "$ENTRY" $(ls "$WORK"/app/out/renderer/assets/styles-*.js 2>/dev/null | head -1); do
  [ -n "$f" ] || continue
  if grep -q "$MARK" "$f"; then
    echo "✔ 已含补丁: $(basename "$f")"
  else
    cat "$INJ" >> "$f"
    PATCHED=$((PATCHED+1))
    echo "✔ 注入: $(basename "$f")"
  fi
done

if [ "$PATCHED" = "0" ]; then echo "✅ 补丁已存在，无需修改"; exit 0; fi

BAK="$DIR/app.asar.$VERSION.bak"
if [ ! -f "$BAK" ]; then
  cp "$ASAR" "$BAK"
  cp -R "$UNPACKED" "$DIR/app.asar.unpacked.$VERSION.bak" 2>/dev/null || true
  echo "💾 原版已备份: $(basename "$BAK")"
fi

echo "📦 重新打包 ..."
npx --yes @electron/asar pack "$WORK/app" "$WORK/app-patched.asar" --unpack "*{.node,-helper,.dylib,.so}"

mv -f "$WORK/app-patched.asar" "$ASAR"
rm -rf "$UNPACKED"
cp -R "$WORK/app-patched.asar.unpacked" "$UNPACKED"

echo "✍️ 重新签名 ..."
codesign --force --deep -s - "$APP" || { echo "❌ 签名失败，请运行 ./rollback.sh 恢复"; exit 1; }

echo ""
echo "✅ 完成！请完全退出 ZCode（Cmd+Q）后重新打开。"
echo "   运行中任务 = 蓝色高亮；完成后 = 绿色高亮（点击该任务清除）。"
