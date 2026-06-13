# AI Knowledge Dashboard

Obsidian plugin for a personal AI knowledge dashboard.

The plugin opens a dedicated dashboard view when Obsidian starts. It is designed for a personal knowledge base with:

- daily actions
- action guide
- project progress
- inbox status
- knowledge map
- knowledge base health

## Development

```bash
npm install
npm run build
```

For local testing in the current workstation:

```bash
npm run install:notes
```

This copies the required plugin files to:

```text
C:\develop\notes\.obsidian\plugins\ai-knowledge-dashboard\
```

Required runtime files:

- `manifest.json`
- `main.js`
- `styles.css`

## Project Status

Current stage: scaffold.

The first usable version should:

1. Register an Obsidian dashboard view.
2. Auto-open the dashboard on startup.
3. Render a Coursue-inspired dashboard UI.
4. Read basic notes statistics from the vault.
5. Show an action guide based on current personal goals.
