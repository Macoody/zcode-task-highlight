#!/bin/bash
# 安装自动重应用守护（事件驱动，零轮询）
# 原理：WatchPaths 监听两个 app.asar，文件被应用更新改动时系统才唤醒脚本；
#      另加每小时一次的兜底检查，防止事件遗漏。
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
PLIST="$HOME/Library/LaunchAgents/com.macoody.task-highlight.watch.plist"

cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.macoody.task-highlight.watch</string>
  <key>ProgramArguments</key>
  <array><string>/bin/bash</string><string>$DIR/watch.sh</string></array>
  <key>WatchPaths</key>
  <array>
    <string>/Applications/ZCode.app/Contents/Resources/app.asar</string>
  </array>
  <key>StartInterval</key><integer>3600</integer>
  <key>RunAtLoad</key><true/>
  <key>StandardOutPath</key><string>/tmp/task-highlight-watch.out</string>
  <key>StandardErrorPath</key><string>/tmp/task-highlight-watch.err</string>
</dict></plist>
EOF

launchctl unload "$PLIST" 2>/dev/null || true
launchctl load "$PLIST"
echo "✅ 守护已升级为事件驱动：app.asar 被改动时系统立即唤醒检查（平时零资源占用）"
echo "   另有每小时兜底检查；应用退出后 1 分钟内自动补打（更新常发生在退出时）"
echo "   日志: ~/.task-highlight-watch.log"
echo "   卸载: launchctl unload $PLIST && rm $PLIST"
