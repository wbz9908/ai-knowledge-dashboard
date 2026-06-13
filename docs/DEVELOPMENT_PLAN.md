# AI Knowledge Dashboard 开发计划

## 项目定位

这是一个独立 Obsidian 插件项目，后续可上传到 GitHub，作为个人 AI 知识库和 AI 编程实践项目展示。

目标不是继续美化 Markdown 首页，而是提供一个真正的 Obsidian 插件 Dashboard：每次打开 Obsidian 后自动显示独立视图，帮助用户看到今日行动、行动指南、项目推进和知识库健康状态。

## 技术选型

- 语言：TypeScript
- 插件 API：Obsidian Plugin API
- UI：原生 DOM + CSS
- 构建：esbuild
- 第一版不引入 React / Vue / Svelte

选择理由：

- Obsidian 插件生态以 TypeScript 为主。
- 原生 DOM 足够完成第一版 Dashboard，复杂度低。
- 后续如果 UI 复杂度明显上升，再考虑引入 Svelte 或 React。

## 第一阶段：插件最小可用框架

目标：能在 Obsidian 中安装并打开一个 Dashboard 视图。

任务：

1. 创建插件项目结构。
2. 添加 `manifest.json`。
3. 添加 TypeScript 构建配置。
4. 注册 `ai-knowledge-dashboard-view`。
5. 启动时自动打开 Dashboard。
6. 渲染静态 Dashboard UI。

验收：

- `npm run build` 能生成 `main.js` 和 `styles.css`。
- 将产物复制到 vault 插件目录后，Obsidian 可以启用插件。
- 启用插件后自动打开 Dashboard。

## 第二阶段：Dashboard 内容模块

目标：把我们讨论过的知识库驾驶舱内容落到插件视图。

模块：

- 左侧导航：Dashboard、Inbox、Action Guide、Projects、Knowledge Map、Health、Settings
- 顶部搜索：搜索 notes / wiki / projects
- 主 Banner：个人 AI 知识库与一人公司路线
- 今日行动：当天最重要的 3-5 件事
- 行动指南：目标、当前状态、下一步、原因、耗时、关联笔记、AI 可帮忙事项
- 项目推进：bz-lottery、AI 知识库、求职简历、一人公司路线
- 右侧统计：Raw、Wiki、概念页、Inbox、stale 笔记
- 健康提醒：结构、新鲜度、索引状态

## 第三阶段：读取知识库数据

目标：让 Dashboard 不只是静态页面，而是从当前 vault 中读取真实信息。

数据来源：

- `raw/00-inbox/02-最近整理摘要.md`
- `wiki/HEALTH.md`
- `raw/10-ai/projects/个人AI知识库/01-自生长知识库设计.md`
- `raw/10-ai/business/02-一人公司路线图.md`
- `raw/06-projects/` 或项目相关目录

第一版读取策略：

- 使用 Obsidian `Vault` API 读取 Markdown 文件。
- 文件不存在时使用默认内容兜底。
- 不读取或展示 `raw/99-personal/` 具体内容，只显示状态数量或提醒。

## 第四阶段：行动指南

行动指南是这个插件的核心模块。

结构：

```text
目标 -> 当前状态 -> 下一步行动 -> 为什么做 -> 预计耗时 -> 关联笔记 -> AI 可帮忙事项
```

第一批行动指南：

1. 广州东附近求职
2. bz-lottery 项目包装
3. 个人 AI 知识库自生长
4. AI 一人公司路线

示例：

```text
目标：广州东附近求职
当前状态：已有 AI 项目、部署经验、知识库沉淀
下一步：把 bz-lottery 改写成 AI 开发经验项目
为什么做：国内招聘正在重视 AI 开发经验
预计耗时：30-45 分钟
关联笔记：简历、bz-lottery、一人公司路线
AI 可帮忙：生成项目描述、提炼 STAR、检查简历表达
```

## 第五阶段：设置页

目标：让插件可配置。

配置项：

- 是否启动时自动打开 Dashboard
- 默认聚焦目标
- notes 根目录提示
- 今日行动数量
- 是否显示 personal 状态数量

## 后续可选增强

- 接入本地搜索索引
- 调用外部 AI 生成行动建议
- 支持自定义行动指南模板
- 支持点击按钮创建新笔记
- 支持健康检查命令
- 支持导出日报 / 周报

## 下一次继续时的建议步骤

1. 运行 `npm install`。
2. 运行 `npm run build`。
3. 将插件产物复制到 notes vault 的 `.obsidian/plugins/ai-knowledge-dashboard/`。
4. 在 Obsidian 启用插件。
5. 根据实际效果继续打磨 UI 和数据读取。
