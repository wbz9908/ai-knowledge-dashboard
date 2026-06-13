# AI Knowledge Dashboard

An Obsidian plugin that turns a personal AI knowledge base into an actionable dashboard.

This project started from my own vault: a Karpathy-inspired AI knowledge base where raw materials, inbox notes, compiled knowledge, projects, and action plans are continuously reorganized by humans and AI agents.

The dashboard is designed to answer three questions every time Obsidian opens:

- What should I do today?
- Which knowledge or project area needs attention?
- What can AI help me organize, review, or generate next?

## Why This Exists

Most knowledge bases are good at storing information, but weak at turning knowledge into action.

This plugin is an experiment in building a personal knowledge cockpit:

- collect raw material into an inbox
- organize source notes into a stable learning system
- compile durable knowledge into a wiki
- surface knowledge health signals
- generate practical action guides from current goals

It is not meant to replace Obsidian notes. It is the entry point that helps decide where to go next.

## Vault Model

The plugin now assumes a simple Karpathy-style vault layout by default:

```text
raw/
├── inbox/      # captured ideas, AI chats, web clips, drafts
├── sources/    # source notes and long-term learning material
└── assets/     # attachments, images, generated media

wiki/           # compiled and structured knowledge pages
```

Inside `raw/sources`, large areas can use three-digit numeric prefixes:

```text
raw/sources/
├── 101-计算机基础
├── 102-编程语言
├── 103-框架
├── 104-数据库
├── 105-基础服务
├── 106-各类工具
├── 201-AI
├── 301-项目
├── 701-面试
├── 801-归档
└── 901-备忘录
```

This works better than a flat `01`, `02`, `03` scheme for a growing vault:

- the hundred digit represents a broad category
- the remaining digits leave room for future subcategories
- related topics stay visually grouped
- AI agents can infer the category from the path before reading file content

For this plugin, the important part is that these folders live under the configured Sources folder. The dashboard should not hard-code every numbered folder; it should discover and summarize them over time.

The defaults can be changed in plugin settings.

| Setting | Default | Purpose |
|---|---|---|
| Inbox folder | `raw/inbox` | Count and display collected items |
| Sources folder | `raw/sources` | Count source notes and learning material |
| Assets folder | `raw/assets` | Exclude attachment storage from note statistics |
| Wiki folder | `wiki` | Count compiled knowledge pages |
| Concepts folder | `wiki/concepts` | Count extracted concept pages |

Backward compatibility:

- If `raw/inbox` does not exist, the plugin falls back to `raw/00-inbox`.
- Personal or private folders should only be shown as status signals. The plugin should not read private details by default.

## Dashboard Concept

The visual direction is inspired by learning-platform dashboards such as Coursue:

- left navigation
- central focus banner
- progress cards
- action guide cards
- right-side statistics and AI task queue

Current layout:

- **Dashboard**: overview of today, projects, and knowledge status
- **Inbox**: collected material waiting to be processed
- **Action Guide**: converts goals into concrete next steps
- **Projects**: current project tracks such as AI knowledge base and `bz-lottery`
- **Knowledge Map**: top-level areas of the vault
- **Health**: stale notes, overgrown areas, and wiki/index status
- **Settings**: folder paths and display options

Navigation status:

- Sidebar and top buttons now open the configured folder landing page when possible.
- Folder buttons prefer `README.md`, `index.md`, `00-*`, `01-*`, then the first Markdown file.
- Section buttons, such as Action Guide, scroll within the dashboard.
- Workflow buttons are still lightweight shortcuts. Long-running AI workflows are intentionally not executed directly by the plugin yet.

## Action Guide

Action Guide is the core module.

It turns knowledge into execution:

```text
Goal -> Current Status -> Next Action -> Why -> Estimate -> Related Notes -> AI Help
```

Example:

```text
Goal: 广州东附近求职
Current Status: 已有 AI 项目、部署经验、知识库沉淀
Next Action: 把 bz-lottery 改写成 AI 开发经验项目
Why: 国内招聘正在重视 AI 开发经验
Estimate: 30-45 分钟
Related Notes: 简历、bz-lottery、一人公司路线
AI Help: 生成项目描述、提炼 STAR、检查简历表达
```

The first version uses static action guide cards. Future versions will read goals, projects, and health reports from the vault.

## Current Status

Implemented:

- TypeScript Obsidian plugin scaffold
- Dedicated `AI Knowledge Dashboard` view
- Auto-open dashboard on startup
- Coursue-inspired dashboard UI
- Static action guide cards
- Basic vault statistics through the Obsidian `Vault` API
- Configurable folder settings for the reorganized vault
- Local install script for my notes vault

Known limitations:

- Action guide cards are still static.
- Health report parsing is not implemented yet.
- Search UI is visual only in the current version.
- Dashboard navigation buttons are not wired to separate views yet.

## Development

Install dependencies:

```bash
npm install
```

Build plugin:

```bash
npm run build
```

Install into my local notes vault:

```bash
npm run install:notes
```

This copies runtime files to:

```text
C:\develop\notes\.obsidian\plugins\ai-knowledge-dashboard\
```

Required runtime files:

- `manifest.json`
- `main.js`
- `styles.css`

## Local Testing

After running:

```bash
npm run install:notes
```

Open Obsidian and enable:

```text
Settings -> Community plugins -> AI Knowledge Dashboard
```

If the dashboard does not open automatically, run the command:

```text
Open AI Knowledge Dashboard
```

## Roadmap

### 0.1.x - Reliable Local Dashboard

- Read real Inbox count from `raw/inbox`
- Read real source note count from `raw/sources`
- Keep folder paths configurable
- Keep old `raw/00-inbox` fallback
- Polish visual layout and install workflow

### 0.2.x - Action Guide System

- Move action guide data into configurable templates
- Generate action cards from notes or project metadata
- Link each action to related Obsidian notes
- Add buttons for opening related notes

### 0.3.x - Knowledge Maintenance

- Parse `wiki/HEALTH.md`
- Display stale notes and overgrown folders
- Show wiki compile and search index status
- Add commands for maintenance workflows

### Future

- Optional AI-generated daily suggestions
- Local search index integration
- Daily / weekly report generation
- More polished responsive dashboard UI

## Repository

GitHub:

```text
https://github.com/wbz9908/ai-knowledge-dashboard
```

License: MIT
