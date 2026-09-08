# 交接文档：给 ChatGPT.app（内嵌 Codex GUI）做任务状态高亮补丁

> 本文档写给将在本机执行任务的 AI 助手（Codex）。写于 2026-09-08 深夜，前一位执行者（ZCode 智能体）已完成 ZCode 侧的稳定实现，ChatGPT 侧经历一次崩溃事故后已回滚。请**完整读完再动手**。

## 一、目标

给 ChatGPT 桌面应用（内嵌的 Codex GUI）左侧任务列表加状态高亮：

- 执行中的任务：整行**蓝色高亮**（理想形态：光带从左到右循环扫过的流水灯动效）
- 完成的任务：整行**绿色高亮**，永久保留（localStorage 持久化），点击该任务视为已读后消失

参照实现：同一仓库的 `injector.js`（v7）已在 **ZCode 3.11.2** 上稳定运行，含全部逻辑（结构感知识别、蓝/绿状态机、点击已读、持久化）。**你的工作是把同样的效果安全地落到 ChatGPT.app 上。**

## 二、当前状态（截至交接时）

| 项 | 状态 |
|---|---|
| ZCode.app | ✅ v7 已安装稳定（勿动，用户在用） |
| ChatGPT.app v26.901.51231 | 已回滚到原版，无补丁，正常可用（注意下方第二次事故说明） |
| 原版备份 | `backups-chatgpt/app.asar.26.901.51231.bak` + `app.asar.unpacked.26.901.51231.bak`（勿删） |
| 自动守护 | 只盯 ZCode；ChatGPT 已被摘除（原因见事故复盘） |
| 仓库工具 | `apply.sh chatgpt` / `rollback.sh chatgpt` 可直接使用 |

## 三、关键技术情报（省你重新摸索）

- ChatGPT.app 是 Electron 应用，asar 在 `/Applications/ChatGPT.app/Contents/Resources/app.asar`（约 296MB）
- **渲染入口**：`webview/index.html`，其中 `<script src="./assets/index-*.js">` 是入口（哈希随版本变，从 HTML 动态解析，别写死文件名）
- **主应用包**：`webview/assets/app-primary-*.js`（assets 里最大的 js）
- unpacked 原生依赖：原版 405 个文件全在 `node_modules` 下（better-sqlite3、@serialport、@worklouder 等）；重打包参数 `--unpack "*{.node,.dylib,.so,.dll}" --unpack-dir "node_modules"`（结果 871 个文件，是原版超集，安全）
- 解包时 `node-pty/build/Release/pty.node.dSYM/` 下 3 个调试符号文件会丢（运行时无关紧要，可忽略）
- 重签名：`codesign --force --deep -s - /Applications/ChatGPT.app`；**建议在应用完全退出后再替换文件和签名**
- 崩溃报告：`~/Library/Logs/DiagnosticReports/ChatGPT-*.ips`

## 四、事故复盘（必读）

时间线：

1. **v6 注入版**（静态蓝色高亮，注入入口 + app-primary 两个包）：20 点部署，**稳定运行 3 小时零崩溃**。但注意：期间用户可能没有真正打开 Codex 视图验证过视觉效果。
2. **v7 注入版**（v6 + 流水灯动画 CSS + 哨兵注释 + 守卫从 truthy 改为 `=== 'v7'`）：23:32 部署，启动自检通过，**23:39–23:40 用户首次打开 Codex 视图后崩溃循环**（60 秒内 6 份崩溃报告，主进程 V8 EXC_BREAKPOINT，栈在 `Codex Framework` 的 node/V8 内部，符号混乱无法定位直接原因）。已回滚。

v6 与 v7 的**全部代码差异**就三处：① CSS 增加了 keyframes 动画与 media query 字符串；② 注入器首尾加了 `/*TASK-HIGHLIGHT-INJECTOR-START*/` 哨兵注释；③ 运行守卫从 `if (window.__zcodeRunningHL)` 改为 `if (window.__zcodeRunningHL === 'v7')`。

**第二次事故（00:19）**：v7 首次崩溃后，旧版守护曾挂出一个"应用退出后自动补打"的等待器；人工摘除 chatgpt 支持时没有杀掉这个已派出的等待器进程，导致用户退出 ChatGPT 后它又把 v7 打回去、再次崩溃循环。已清理等待器、删除锁目录，现在 watch.sh 完全不检查 chatgpt，等待器不可能再为它生成。**教训：凡是给某应用摘除支持，先检查是否有存活的后台等待器（ps 里搜 task-highlight-watch-locks）。**

未定位的疑点：崩溃发生在主进程/Node 侧（`node::PrincipalRealm` 等帧），而注入器是纯浏览器 DOM 代码且整体 try/catch 包裹——理论上不该崩主进程。怀疑方向：`app-primary-*.js` 可能同时被 Codex 的 Node 服务进程（app-server）加载，v7 的某处变更在该上下文触发了 V8 级问题；或与 Codex 视图首次加载的时序有关。**v6 稳定、v7 崩溃，差异极小——这是最关键的实验线索。**

## 五、推荐执行路线（保守递进，每步验证）

**第 0 步 — 安全准备**：确认 ChatGPT 已退出（`pgrep -f "ChatGPT.app/Contents"` 无结果再动手）；重申：不动 ZCode。

**第 1 步 — 复现 v6 基线**：把仓库里 `injector.js`（v7）暂时换回 v6 内容（v6 全文见本文件末尾附录），`./apply.sh chatgpt` → 重启 ChatGPT → **打开 Codex 视图跑一个任务** → 确认：a) 不崩溃；b) 蓝色/绿色高亮在 Codex 侧栏是否真的出现（v6 期间从未人工确认过视觉效果！`isTaskRow` 的启发式是为 ZCode 的 DOM 调的，Codex 侧栏结构可能不匹配——如果高亮根本不出现，你需要先用 DevTools（帮助菜单→切换开发者工具）研究 Codex 任务行的真实 DOM，再调整识别逻辑）。

**第 2 步 — 单变量引入动画**：在 v6 基础上**只加**流水灯 CSS（不 加哨兵、不改守卫），重新部署验证。若崩溃→回滚，动画就先用静态蓝。

**第 3 步 — 若想做稳**：只注入入口包（跳过 app-primary）+ 把 `greenPass` 间隔从 2s 放宽到 10s + `scan()` 里对候选行先做 `childElementCount` 预过滤再取 `textContent`（避免在巨型 DOM 上频繁序列化文本）+ 给候选行总数设上限（如超过 500 行直接跳过本轮扫描）。

**任何时候崩溃**：立即 `./rollback.sh chatgpt` 恢复（备份是好的，30 秒可恢复），然后读崩溃报告再战。

## 六、硬性规则

1. 操作前 ChatGPT 必须完全退出；操作后先自测启动再交给用户
2. 绝不修改 `backups-*` 目录
3. 绝不修改 ZCode.app（已稳定，用户依赖）
4. 每次部署后必须实际打开 Codex 视图验证（崩溃发生在视图首次加载时）
5. 崩溃处理优先级：先回滚恢复可用，再排查原因

## 附录：v6 注入器全文（已知在 ChatGPT 上稳定 3 小时的版本）

与 `injector.js`（v7）的差异仅在本文件第四节列出的三处。最省事的做法：复制 `injector.js`，删掉首尾两行哨兵注释，把 CSS 换回静态版（`background-color:rgba(59,130,246,.22)!important` 替代动画相关四行），守卫改回 `if (window.__zcodeRunningHL) return; window.__zcodeRunningHL = 1;`，标记字符串可用 `zcode-ui-patch-v6`（注意同步 `apply.sh`/`watch.sh` 里的 MARK 常量，且 `apply.sh` 的旧注入器剥离逻辑对无哨兵的 v6 格式有兜底，能干净替换）。
