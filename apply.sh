#!/bin/bash
# zcode-task-highlight 一键安装（支持 ZCode 与 ChatGPT/Codex）
# 用法: ./apply.sh [zcode|chatgpt|all]    默认 all
# 应用升级后重新运行一次即可（自动按版本备份，可重复运行）
set -euo pipefail

MARK="zcode-ui-patch-v7"
DIR="$(cd "$(dirname "$0")" && pwd)"
INJ="$DIR/injector.js"

app_config() {
  case "$1" in
    zcode)
      APP_NAME="ZCode"; APP="/Applications/ZCode.app"
      HTML="out/renderer/index.html"; SECONDARY_GLOB="out/renderer/assets/styles-*.js"
      UNPACK_GLOB="*{.node,-helper,.dylib,.so}"; UNPACK_DIR=""
      ;;
    chatgpt)  # 实验性：曾导致崩溃循环，出问题用 ./rollback.sh chatgpt
      APP_NAME="ChatGPT (Codex GUI) [实验性]"; APP="/Applications/ChatGPT.app"
      HTML="webview/index.html"; SECONDARY_GLOB="webview/assets/app-primary-*.js"
      UNPACK_GLOB="*{.node,.dylib,.so,.dll}"; UNPACK_DIR="node_modules"
      ;;
    *) echo "❌ 未知应用: $1（可选 zcode|chatgpt|all）"; exit 1 ;;
  esac
}

# 剥离文件尾部已存在的注入器（v7+ 有哨兵注释；v6 旧格式按特征定位）
strip_old_injector() {
  node -e '
    const fs = require("fs");
    const p = process.argv[1];
    let s = fs.readFileSync(p, "utf8");
    const cutFrom = (idx) => { s = s.slice(0, idx).replace(/\n+$/, "\n"); fs.writeFileSync(p, s); };
    const i = s.lastIndexOf("/*TASK-HIGHLIGHT-INJECTOR-START*/");
    if (i >= 0) { cutFrom(i); process.exit(0); }
    const j = s.lastIndexOf("if (window.__zcodeRunningHL)");
    if (j >= 0) {
      const k = s.lastIndexOf(";(function(){", j);
      if (k >= 0) cutFrom(k);
    }
  ' "$1" 2>/dev/null || true
}

patch_app() {
  local KEY="$1"
  app_config "$KEY"
  local ASAR="$APP/Contents/Resources/app.asar"
  local UNPACKED="$APP/Contents/Resources/app.asar.unpacked"

  command -v npx >/dev/null 2>&1 || { echo "❌ 需要 Node.js（未找到 npx）: https://nodejs.org"; exit 1; }
  command -v codesign >/dev/null 2>&1 || { echo "❌ 需要 Xcode Command Line Tools: xcode-select --install"; exit 1; }
  [ -d "$APP" ] || { echo "⚠️ 未安装 $APP_NAME，跳过"; return 0; }
  [ -f "$INJ" ] || { echo "❌ 未找到 injector.js（请在仓库目录内运行）"; exit 1; }

  local VERSION
  VERSION=$(defaults read "$APP/Contents/Info.plist" CFBundleShortVersionString 2>/dev/null || echo unknown)
  echo "── $APP_NAME 版本 $VERSION ──"

  if grep -aq "$MARK" "$ASAR" 2>/dev/null; then
    echo "✔ 补丁已存在，无需修改"
    return 0
  fi

  local WORK
  WORK=$(mktemp -d /tmp/task-highlight.XXXXXX)

  echo "📦 解包 app.asar ..."
  npx --yes @electron/asar extract "$ASAR" "$WORK/app" || { echo "❌ 解包失败"; rm -rf "$WORK"; exit 1; }

  # 入口 JS：从渲染页 HTML 里解析 <script src>
  local HTML_PATH="$WORK/app/$HTML" ENTRY_REL
  [ -f "$HTML_PATH" ] || { echo "❌ 未找到 $HTML，可能是不兼容的版本，未做任何修改"; rm -rf "$WORK"; exit 1; }
  ENTRY_REL=$(grep -o 'src="[^"]*\.js"' "$HTML_PATH" | head -1 | sed 's/src="//;s/"$//')
  local ENTRY="$WORK/app/$(dirname "$HTML")/${ENTRY_REL#./}"
  [ -f "$ENTRY" ] || { echo "❌ 未找到入口 JS，未做任何修改"; rm -rf "$WORK"; exit 1; }

  # 次级包：同名 glob 里最大的文件（主应用包）
  local SECONDARY
  SECONDARY=$(ls -S $WORK/app/$SECONDARY_GLOB 2>/dev/null | head -1 || true)

  local TARGETS=("$ENTRY")
  [ -n "$SECONDARY" ] && TARGETS+=("$SECONDARY")
  for f in "${TARGETS[@]}"; do
    strip_old_injector "$f"
    cat "$INJ" >> "$f"
    echo "✔ 注入: ${f#$WORK/app/}"
  done

  local BKDIR="$DIR/backups-$KEY"
  mkdir -p "$BKDIR"
  if [ ! -f "$BKDIR/app.asar.$VERSION.bak" ]; then
    cp "$ASAR" "$BKDIR/app.asar.$VERSION.bak"
    cp -R "$UNPACKED" "$BKDIR/app.asar.unpacked.$VERSION.bak" 2>/dev/null || true
    echo "💾 原版已备份（$VERSION）"
  fi

  echo "📦 重新打包 ..."
  local PACK_ARGS=(pack "$WORK/app" "$WORK/app-patched.asar" --unpack "$UNPACK_GLOB")
  [ -n "$UNPACK_DIR" ] && PACK_ARGS+=(--unpack-dir "$UNPACK_DIR")
  npx --yes @electron/asar "${PACK_ARGS[@]}"

  rm -rf "$UNPACKED.new"
  if [ -d "$WORK/app-patched.asar.unpacked" ]; then
    cp -R "$WORK/app-patched.asar.unpacked" "$UNPACKED.new"
  fi
  cp "$WORK/app-patched.asar" "$ASAR.new"
  mv -f "$ASAR.new" "$ASAR"
  if [ -d "$UNPACKED.new" ]; then
    rm -rf "$UNPACKED.old"
    mv "$UNPACKED" "$UNPACKED.old" 2>/dev/null || true
    mv "$UNPACKED.new" "$UNPACKED"
    rm -rf "$UNPACKED.old"
  fi
  rm -rf "$WORK"

  echo "✍️ 重新签名 ..."
  codesign --force --deep -s - "$APP" || { echo "❌ 签名失败，请运行 ./rollback.sh $KEY 恢复"; exit 1; }
  echo "✅ $APP_NAME 完成！请完全退出该应用后重新打开。"
}

TARGET="${1:-all}"
if [ "$TARGET" = "all" ]; then
  patch_app zcode
else
  patch_app "$TARGET"
fi
