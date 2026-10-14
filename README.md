# dsh-sidechat

[English](README_EN.md) · 中文

DSH 侧边聊天插件：从主会话 fork 独立侧聊，划选引用并添加注释，将结论回流到主会话。

## 安装

```bash
dsh plugin --profile web add github:kkisok0123/dsh-sidechat
```

本仓库包含源码和预编译的 `lib/`，GitHub 安装无需在用户机器上编译。安装后重启 `dsh web` 并刷新窗口。

如果已经安装 `dsh-sidenote`，请先移除旧插件，再安装本插件，避免重复入口：

```bash
dsh plugin --profile web remove dsh-sidenote
```

进入已有回复的会话，点击顶栏「侧边」，或在输入框使用 `/side`，打开右侧栏中的插件面板。

## 功能

- 独立侧聊继承主会话完整历史，主线与侧聊分别运行。
- 侧聊语义与 Codex `/side` 对齐：首条消息注入边界协议块（继承历史仅作参照、侧聊是独立助手：默认非改写、不碰子代理、不主动请求越权），面板以「侧边会话边界」卡呈现。
- DSH 0.2.0-rc.2 上复用宿主原生 Conversation Factory，包括消息、工具、模型、权限及输入框；旧宿主使用插件自绘面板。
- 模型菜单刷新并显示提供方，切换模型后恢复输入焦点。
- 划选 assistant 正文：「添加到对话」保留可选注解编辑器；「在侧边聊天中提问」直接打开/聚焦侧聊、加入选中文字引用并聚焦输入框，不弹注解框、不覆盖草稿、不自动发送。打开失败时保留选中文字，可重试或取消。
- 临时侧聊在当前浏览器的会话列表中隐藏，可重开；保存为正式会话时创建可见副本。
- 侧聊结论可作为引用回流到主会话。

下面是右侧栏布局示例。实际消息与输入框样式随宿主版本、主题和原生渲染模式变化；它不是宿主自带的浮动侧边对话窗口。

![右侧栏布局示例](docs/assets/04-side-chat-panel.png)

## 兼容性

当前包保留原插件的引擎声明，使用 Node.js 20 及以上。原生会话渲染针对 DSH **0.2.0-rc.2** 实现；引擎范围不代表所有组合都已验证。

## 开发

```bash
pnpm install --frozen-lockfile
pnpm check:arch
pnpm typecheck
pnpm build
pnpm check:package
```

修改源码后，将对应 `lib/` 一并提交。CI 重建并检查构建产物与已提交版本一致，以保持 GitHub 直接安装可用。

## 来源与许可

基于 [gyixuan 的 dsh-sidenote](https://github.com/g-yixuan/dsh-sidenote)，保留原作者署名和 MIT 许可。本仓库从独立源码快照建立，未继承原 Git 提交历史。
