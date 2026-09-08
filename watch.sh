#!/bin/bash
# 自动重应用守护（由 LaunchAgent 事件驱动唤醒：app.asar 变化时 + 每小时兜底）
# 逻辑：
#   1. 补丁标记在 → 什么都不做，退出
#   2. 标记没了（应用更新覆盖）且应用未运行 → 立即重打补丁 + 系统通知
#   3. 标记没了但应用在运行 → 派一个后台等待器，应用退出后 1 分钟内自动补打
REPO="$(cd "$(dirname "$0")" && pwd)"
LOG="$HOME/.task-highlight-watch.log"
LOCKDIR="$HOME/.task-highlight-watch-locks"
MARK="zcode-ui-patch-v7"
mkdir -p "$LOCKDIR"

check_app() {
  local KEY="$1" APP
  case "$KEY" in
    zcode) APP="/Applications/ZCode.app" ;;
    chatgpt) APP="/Applications/ChatGPT.app" ;;
  esac
  local ASAR="$APP/Contents/Resources/app.asar"
  [ -f "$ASAR" ] || return 0
  grep -aq "$MARK" "$ASAR" 2>/dev/null && return 0
  if ! pgrep -f "$APP/Contents" >/dev/null 2>&1; then
    echo "$(date '+%F %T') [$KEY] 检测到更新，自动重新应用补丁..." >> "$LOG"
    if "$REPO/apply.sh" "$KEY" >> "$LOG" 2>&1; then
      osascript -e "display notification \"$KEY 更新后的补丁已自动恢复\" with title \"Task Highlight\"" 2>/dev/null || true
    else
      echo "$(date '+%F %T') [$KEY] 自动恢复失败，请手动运行 apply.sh" >> "$LOG"
    fi
    return 0
  fi
  # 应用在运行：派后台等待器（锁防重复），退出后 1 分钟内补打
  if mkdir "$LOCKDIR/$KEY" 2>/dev/null; then
    echo "$(date '+%F %T') [$KEY] 更新已就位但应用运行中，已挂起等待器（退出后自动补打）" >> "$LOG"
    nohup bash -c '
      for i in $(seq 1 720); do
        sleep 60
        pgrep -f "'"$APP"'/Contents" >/dev/null 2>&1 || break
      done
      if ! pgrep -f "'"$APP"'/Contents" >/dev/null 2>&1; then
        "'"$REPO"'/apply.sh" "'"$KEY"'" >> "'"$LOG"'" 2>&1 && \
        osascript -e "display notification \"'"$KEY"' 更新后的补丁已自动恢复\" with title \"Task Highlight\"" 2>/dev/null || true
      fi
      rmdir "'"$LOCKDIR/$KEY"'" 2>/dev/null
    ' >/dev/null 2>&1 &
  fi
}

check_app zcode
check_app chatgpt
