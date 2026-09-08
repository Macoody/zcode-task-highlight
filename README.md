# ZCode / Codex Task Highlight

给 **ZCode 桌面端**和 **ChatGPT 桌面端（内嵌 Codex GUI）**的左侧任务列表加上醒目的状态高亮：**运行中的任务整行变蓝，完成后整行变绿，点过才算已读**。

解决的原生体验问题：应用自带的"执行中"指示只有一个很小的旋转图标，切到其他应用或多任务并行时几乎无法一眼分辨哪个任务在跑、哪个刚做完。

## 效果

| 状态 | 表现 |
|---|---|
| 🟦 执行中 | 任务行蓝色背景 + 左缘蓝色竖条 + 蓝色旋转图标 |
| 🟩 已完成（未读） | 任务行绿色背景 + 左缘绿色竖条，**永久保留**（重启不丢） |
| 👆 点击任务 | 视为"已读"，绿色立即消失 |
| 🔁 再次运行 | 绿色自动清除 → 蓝色 → 完成后再变绿 |

## 支持的应用

| 应用 | 实测版本 | 说明 |
|---|---|---|
| ZCode | 3.11.2 (macOS arm64) | |
| ChatGPT（内嵌 Codex GUI） | 26.901.51231 (macOS arm64) | 更新频繁，建议装自动恢复守护 |

## 安装

要求：macOS + [Node.js](https://nodejs.org) + Xcode Command Line Tools（`xcode-select --install`）

```bash
git clone https://github.com/Macoody/zcode-task-highlight.git
cd zcode-task-highlight
./apply.sh            # 给所有支持的应用打补丁
./install-watch.sh    # （推荐）安装自动恢复守护
```

然后**完全退出对应应用（Cmd+Q）并重新打开**即可生效。

`apply.sh` 支持指定单个应用：`./apply.sh zcode` 或 `./apply.sh chatgpt`。

### 自动恢复守护（推荐）

两个应用（尤其 ChatGPT）更新后会覆盖补丁。`install-watch.sh` 安装一个每 5 分钟检查的 LaunchAgent：发现补丁消失且应用未在运行时，**自动重新打补丁并弹系统通知**，日志在 `~/.task-highlight-watch.log`。卸载守护：

```bash
launchctl unload ~/Library/LaunchAgents/com.macoody.task-highlight.watch.plist
rm ~/Library/LaunchAgents/com.macoody.task-highlight.watch.plist
```

## 卸载 / 恢复原版

```bash
./rollback.sh         # 恢复所有应用；也可 ./rollback.sh zcode / chatgpt
```

会自动恢复安装时备份的原始 `app.asar` 并重签名。

## 原理

本工具**不分发任何应用官方代码**。它做的事：

1. 解包你本机安装的应用的 `app.asar`
2. 向渲染入口 JS 包尾部追加一段自包含的注入器（`injector.js`，约 100 行）
3. 重新打包、按原样恢复原生模块的 unpacked 结构、对应用做 ad-hoc 重签名

注入器在运行时监听页面变化，自动识别带旋转图标的任务行并上色——不依赖具体类名，对版本变化和不同应用有一定容忍度。

## 注意事项

- 应用每次升级都会覆盖补丁：装了守护会自动恢复，没装就升级后重跑 `./apply.sh`
- 修改的是你本地安装副本，仅限个人使用；请自行确认符合你所用版本的用户协议
- 非官方工具，与应用官方无关，使用风险自负
- 如果这个功能对你也有价值，建议顺手向官方提个产品反馈——运行态/完成态高亮是任务型应用的普遍做法，官方实现才是长久之计

## English

Status highlight for the ZCode and ChatGPT (embedded Codex GUI) desktop apps' left task list: **running tasks get a blue row highlight; finished tasks turn green until you click them** (persisted across restarts).

- No app code is redistributed — the script patches your local `app.asar` by appending a self-contained injector to the renderer entry bundle, then repacks and ad-hoc re-signs the app.
- Install: `./apply.sh` (requires Node.js + Xcode CLT), then restart the app. Optional `./install-watch.sh` sets up a LaunchAgent that automatically re-applies the patch after app updates.
- Uninstall: `./rollback.sh`.
- Tested on ZCode 3.11.2 and ChatGPT 26.901.51231 (macOS arm64). Unofficial, use at your own risk.

## License

[MIT](LICENSE) — 仅覆盖本仓库的脚本与文档，不含任何应用的官方代码。
