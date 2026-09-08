#!/bin/bash
# 自动重应用守护（由 LaunchAgent 每 5 分钟调用一次）
# 逻辑：应用更新会覆盖补丁 → 检测 app.asar 中补丁标记消失 → 应用未运行时自动重新打补丁
REPO="$(cd "$(dirname "$0")" && pwd)"
LOG="$HOME/.task-highlight-watch.log"
MARK="zcode-ui-patch-v6"

check_app() {
  local KEY="$1" APP
  case "$KEY" in
    zcode) APP="/Applications/ZCode.app" ;;
    chatgpt) APP="/Applications/ChatGPT.app" ;;
  esac
  local ASAR="$APP/Contents/Resources/app.asar"
  [ -f "$ASAR" ] || return 0
  grep -aq "$MARK" "$ASAR" 2>/dev/null && return 0
  if pgrep -f "$APP/Contents" >/dev/null 2>&1; then
    echo "$(date '+%F %T') [$KEY] 检测到更新但应用运行中，稍后重试" >> "$LOG"
    return 0
  fi
  echo "$(date '+%F %T') [$KEY] 检测到更新，自动重新应用补丁..." >> "$LOG"
  if "$REPO/apply.sh" "$KEY" >> "$LOG" 2>&1; then
    osascript -e "display notification \"$KEY 更新后的补丁已自动恢复\" with title \"Task Highlight\"" 2>/dev/null || true
  else
    echo "$(date '+%F %T') [$KEY] 自动恢复失败，请手动运行 apply.sh" >> "$LOG"
  fi
}

check_app zcode
check_app chatgpt
