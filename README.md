# AI Knowledge Dashboard

AI Knowledge Dashboard is an Obsidian plugin for turning a personal AI knowledge base into an actionable dashboard.

It is designed for a workflow where notes are not only stored, but also used to answer:

- What should I do today?
- Which project should I push forward?
- Which knowledge areas need maintenance?
- What can AI help me整理、复盘、检查 or generate next?

The first version is built for my personal knowledge base, but the long-term goal is to make the plugin configurable enough for other Obsidian users.

## Current Status

This project is in early scaffold stage.

Implemented:

- Obsidian plugin scaffold with TypeScript.
- Dedicated `AI Knowledge Dashboard` view.
- Auto-open dashboard on Obsidian startup.
- Coursue-inspired dashboard layout.
- Static action guide cards.
- Basic vault statistics using Obsidian `Vault` API.
- Local install script for my notes vault.

Known limitations:

- Some note paths are still based on the previous vault structure.
- The current notes vault has been reorganized to:

```text
raw/
├── assets/
├── inbox/
└── sources/
```

- The plugin should be updated to detect configurable folders instead of assuming old paths such as `raw/00-inbox/`.
- The action guide is currently static and should later be generated from dashboard config and notes metadata.

## Dashboard Concept

The dashboard follows a learning-platform style layout:

- Left sidebar: Dashboard, Inbox, Action Guide, Projects, Knowledge Map, Health, Settings
- Main area: search, focus banner, project progress, action guide
- Right panel: knowledge statistics, health reminders, AI task queue

The most important module is **Action Guide**.

Action Guide is meant to convert knowledge into action:

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

## Data Model Plan

The plugin should not hard-code one vault layout forever.

Planned settings:

| Setting | Default for my vault | Purpose |
|---|---|---|
| Inbox folder | `raw/inbox` | Count and display collected items |
| Sources folder | `raw/sources` | Count source notes and knowledge areas |
| Assets folder | `raw/assets` | Ignore assets from note statistics |
| Wiki folder | `wiki` | Read compiled knowledge pages |
| Health report | `wiki/HEALTH.md` | Show knowledge base health |
| Personal folder | configurable | Show status only, never read private details by default |

Next implementation step:

1. Add settings for these folder paths.
2. Replace hard-coded `raw/00-inbox` checks with configured paths.
3. Add fallback detection:
   - prefer `raw/inbox`
   - fallback to `raw/00-inbox`
4. Read `wiki/HEALTH.md` if present.
5. Keep personal-sensitive folders opt-in and status-only.

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

## Repository

GitHub:

```text
https://github.com/wbz9908/ai-knowledge-dashboard
```

License: MIT

## Roadmap

### 0.1.x - Make the local dashboard reliable

- Fix path detection for the reorganized notes vault.
- Add plugin settings for folder paths.
- Show real Inbox count from `raw/inbox`.
- Show real source note count from `raw/sources`.
- Show health summary from `wiki/HEALTH.md`.

### 0.2.x - Action guide system

- Move action guide data into configurable templates.
- Support action guide cards generated from notes.
- Link each action to related Obsidian notes.
- Add buttons for opening related notes.

### 0.3.x - Knowledge maintenance

- Read knowledge health reports.
- Display stale notes and overgrown folders.
- Add commands for maintenance workflows.

### Future

- Optional AI-generated daily suggestions.
- Local search index integration.
- Daily / weekly report generation.
- More polished responsive dashboard UI.
