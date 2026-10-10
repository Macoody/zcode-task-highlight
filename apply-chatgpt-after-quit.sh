#!/bin/bash
# 一次性安全部署：等待 ChatGPT 主进程退出，再应用入口包静态高亮并重新打开。
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
LOG="/tmp/task-highlight-apply-chatgpt.log"
MAIN_PROC="ChatGPT"

echo "$(date '+%F %T') waiting for $MAIN_PROC to exit" >> "$LOG"
for i in $(seq 1 180); do
  if ! ps -axo command= | awk -v exe="/Applications/ChatGPT.app/Contents/MacOS/$MAIN_PROC" '$1 == exe { found=1 } END { exit found ? 0 : 1 }'; then
    sleep 3
    if ! ps -axo command= | awk -v exe="/Applications/ChatGPT.app/Contents/MacOS/$MAIN_PROC" '$1 == exe { found=1 } END { exit found ? 0 : 1 }'; then
      "$DIR/apply.sh" chatgpt >> "$LOG" 2>&1
      open -b com.openai.codex >> "$LOG" 2>&1
      echo "$(date '+%F %T') patched and reopened ChatGPT" >> "$LOG"
      exit 0
    fi
  fi
  sleep 1
done
echo "$(date '+%F %T') timeout waiting for $MAIN_PROC; no files changed" >> "$LOG"
exit 1
