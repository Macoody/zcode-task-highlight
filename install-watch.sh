#!/bin/bash
# 安装自动重应用守护（LaunchAgent，每 5 分钟检查一次）
# 应用更新覆盖补丁后，只要你没在使用该应用，就会自动恢复补丁并弹系统通知
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
  <key>StartInterval</key><integer>300</integer>
  <key>RunAtLoad</key><true/>
  <key>StandardOutPath</key><string>/tmp/task-highlight-watch.out</string>
  <key>StandardErrorPath</key><string>/tmp/task-highlight-watch.err</string>
</dict></plist>
EOF

launchctl unload "$PLIST" 2>/dev/null || true
launchctl load "$PLIST"
echo "✅ 守护已安装：每 5 分钟检查，应用更新后自动恢复补丁（恢复成功会弹通知）"
echo "   日志: ~/.task-highlight-watch.log"
echo "   卸载: launchctl unload $PLIST && rm $PLIST"
