import {
  App,
  ItemView,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
  TFolder,
  WorkspaceLeaf
} from "obsidian";

const DASHBOARD_VIEW_TYPE = "ai-knowledge-dashboard-view";

interface DashboardSettings {
  openOnStartup: boolean;
  showPersonalStatus: boolean;
  actionLimit: number;
  inboxFolder: string;
  sourcesFolder: string;
  assetsFolder: string;
  wikiFolder: string;
  conceptsFolder: string;
}

const DEFAULT_SETTINGS: DashboardSettings = {
  openOnStartup: true,
  showPersonalStatus: true,
  actionLimit: 4,
  inboxFolder: "raw/inbox",
  sourcesFolder: "raw/sources",
  assetsFolder: "raw/assets",
  wikiFolder: "wiki",
  conceptsFolder: "wiki/concepts"
};

interface KnowledgeStats {
  rawNotes: number;
  sourceNotes: number;
  wikiNotes: number;
  conceptNotes: number;
  inboxNotes: number;
}

interface ActionGuide {
  goal: string;
  status: string;
  nextAction: string;
  reason: string;
  estimate: string;
  relatedNotes: string[];
  aiHelp: string[];
}

interface NavigationTarget {
  label: string;
  active?: boolean;
  kind: "dashboard" | "folder" | "file" | "section" | "settings";
  path?: string;
  sectionId?: string;
}

export default class AiKnowledgeDashboardPlugin extends Plugin {
  settings: DashboardSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.registerView(
      DASHBOARD_VIEW_TYPE,
      (leaf) => new DashboardView(leaf, this)
    );

    this.addRibbonIcon("sparkles", "Open AI Knowledge Dashboard", () => {
      void this.activateDashboardView();
    });

    this.addCommand({
      id: "open-ai-knowledge-dashboard",
      name: "Open AI Knowledge Dashboard",
      callback: () => {
        void this.activateDashboardView();
      }
    });

    this.addSettingTab(new DashboardSettingTab(this.app, this));

    if (this.settings.openOnStartup) {
      this.app.workspace.onLayoutReady(() => {
        void this.activateDashboardView();
      });
    }
  }

  onunload(): void {
    this.app.workspace.detachLeavesOfType(DASHBOARD_VIEW_TYPE);
  }

  async activateDashboardView(): Promise<void> {
    const leaves = this.app.workspace.getLeavesOfType(DASHBOARD_VIEW_TYPE);
    const existingLeaf = leaves[0];

    if (existingLeaf) {
      this.app.workspace.revealLeaf(existingLeaf);
      return;
    }

    const leaf = this.app.workspace.getLeaf(true);
    await leaf.setViewState({
      type: DASHBOARD_VIEW_TYPE,
      active: true
    });
    this.app.workspace.revealLeaf(leaf);
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}

class DashboardView extends ItemView {
  private plugin: AiKnowledgeDashboardPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: AiKnowledgeDashboardPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return DASHBOARD_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "AI Knowledge Dashboard";
  }

  getIcon(): string {
    return "sparkles";
  }

  async onOpen(): Promise<void> {
    await this.render();
  }

  async render(): Promise<void> {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("akd-view");

    const stats = await collectKnowledgeStats(this.app, this.plugin.settings);
    const actionGuides = buildActionGuides();

    const shell = container.createDiv({ cls: "akd-shell" });
    this.renderSidebar(shell);
    this.renderMain(shell, stats, actionGuides);
    this.renderAside(shell, stats);
  }

  private renderSidebar(parent: HTMLElement): void {
    const sidebar = parent.createEl("aside", { cls: "akd-sidebar" });
    const brand = sidebar.createDiv({ cls: "akd-brand" });
    brand.createDiv({ cls: "akd-logo", text: "AI" });
    brand.createEl("strong", { text: "Knowledge OS" });

    const nav = sidebar.createDiv({ cls: "akd-nav" });
    const targets: NavigationTarget[] = [
      { label: "Dashboard", active: true, kind: "dashboard" },
      { label: "Inbox", kind: "folder", path: this.plugin.settings.inboxFolder },
      { label: "Action Guide", kind: "section", sectionId: "action-guide" },
      { label: "Projects", kind: "folder", path: "raw/sources/301-项目" },
      { label: "Knowledge Map", kind: "folder", path: this.plugin.settings.sourcesFolder },
      { label: "Health", kind: "file", path: "wiki/HEALTH.md" }
    ];
    targets.forEach((target) => {
      renderNavItem(nav, target, (selected) => {
        void this.handleNavigation(selected);
      });
    });

    const footer = sidebar.createDiv({ cls: "akd-sidebar-footer" });
    const settingsButton = footer.createEl("button", { text: "Settings" });
    settingsButton.addEventListener("click", () => {
      void this.handleNavigation({ label: "Settings", kind: "settings" });
    });
    footer.createEl("span", { text: "Local plugin scaffold" });
  }

  private renderMain(parent: HTMLElement, stats: KnowledgeStats, guides: ActionGuide[]): void {
    const main = parent.createEl("main", { cls: "akd-main" });

    const topbar = main.createDiv({ cls: "akd-topbar" });
    topbar.createEl("input", {
      cls: "akd-search",
      attr: { placeholder: "Search your notes, projects, ideas..." }
    });
    const inboxButton = topbar.createEl("button", { cls: "akd-icon-button", text: "Inbox" });
    inboxButton.addEventListener("click", () => {
      void this.openFolderLanding(this.plugin.settings.inboxFolder);
    });
    const healthButton = topbar.createEl("button", { cls: "akd-icon-button", text: "Health" });
    healthButton.addEventListener("click", () => {
      void this.openPath("wiki/HEALTH.md");
    });

    const hero = main.createDiv({ cls: "akd-hero" });
    hero.createEl("span", { text: "PERSONAL AI KNOWLEDGE BASE" });
    hero.createEl("h1", {
      text: "Build a self-growing knowledge system with AI"
    });
    hero.createEl("p", {
      text: "今天只看三件事：该做什么、为什么做、AI 能帮我维护什么。"
    });
    const startButton = hero.createEl("button", { text: "Start Today" });
    startButton.addEventListener("click", () => {
      this.scrollToSection("action-guide");
    });

    const cards = main.createDiv({ cls: "akd-progress-cards" });
    renderProgressCard(cards, "AI 知识库", "62%", "自生长工作台");
    renderProgressCard(cards, "一人公司", "38%", "主业稳住 + 副业探索");
    renderProgressCard(cards, "bz-lottery", "54%", "AI 项目作品集");

    const sectionTitle = main.createDiv({ cls: "akd-section-title", attr: { id: "action-guide" } });
    sectionTitle.createEl("h2", { text: "Action Guide" });
    const seeAll = sectionTitle.createEl("a", { text: "See all" });
    seeAll.addEventListener("click", () => {
      this.scrollToSection("action-guide");
    });

    const guideGrid = main.createDiv({ cls: "akd-guide-grid" });
    guides.slice(0, this.plugin.settings.actionLimit).forEach((guide) => {
      renderActionGuide(guideGrid, guide);
    });

    const table = main.createDiv({ cls: "akd-lessons" });
    const tableHead = table.createDiv({ cls: "akd-table-row akd-table-head" });
    ["Focus", "Status", "Next Action", "Metric"].forEach((item) => {
      tableHead.createEl("span", { text: item });
    });
    renderTableRow(table, "Inbox", "Clear", "Keep collecting", `${stats.inboxNotes} files`);
    renderTableRow(table, "Wiki", "Needs compile", "Run incremental compile later", `${stats.wikiNotes} pages`);
    renderTableRow(table, "Projects", "Active", "Package bz-lottery", "1 priority");
  }

  private renderAside(parent: HTMLElement, stats: KnowledgeStats): void {
    const aside = parent.createEl("aside", { cls: "akd-aside" });

    const profile = aside.createDiv({ cls: "akd-stat-card" });
    profile.createEl("span", { cls: "akd-kicker", text: "Statistic" });
    profile.createDiv({ cls: "akd-ring", text: "32%" });
    profile.createEl("h2", { text: "Good Morning" });
    profile.createEl("p", { text: "Continue building your personal AI system." });

    const statsGrid = aside.createDiv({ cls: "akd-mini-stats" });
    renderMiniStat(statsGrid, String(stats.rawNotes), "Raw notes");
    renderMiniStat(statsGrid, String(stats.sourceNotes), "Sources");
    renderMiniStat(statsGrid, String(stats.wikiNotes), "Wiki pages");
    renderMiniStat(statsGrid, String(stats.inboxNotes), "Inbox");

    const mentor = aside.createDiv({ cls: "akd-mentor-card" });
    mentor.createEl("h3", { text: "AI Task Queue" });
    const taskTargets: Record<string, () => void> = {
      "整理 Inbox": () => void this.openFolderLanding(this.plugin.settings.inboxFolder),
      "生成今日建议": () => this.scrollToSection("action-guide"),
      "检查健康度": () => void this.openPath("wiki/HEALTH.md"),
      "编译 Wiki": () => new Notice("Wiki compile should still be run by your AI workflow for now.")
    };

    ["整理 Inbox", "生成今日建议", "检查健康度", "编译 Wiki"].forEach((task) => {
      const item = mentor.createDiv({ cls: "akd-mentor-item" });
      item.createDiv({ cls: "akd-avatar", text: "AI" });
      item.createEl("span", { text: task });
      const runButton = item.createEl("button", { text: "Run" });
      runButton.addEventListener("click", taskTargets[task]);
    });
  }

  private async handleNavigation(target: NavigationTarget): Promise<void> {
    if (target.kind === "dashboard") {
      this.containerEl.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (target.kind === "section" && target.sectionId) {
      this.scrollToSection(target.sectionId);
      return;
    }

    if (target.kind === "settings") {
      new Notice("Open Settings -> Community plugins -> AI Knowledge Dashboard.");
      return;
    }

    if (target.kind === "folder" && target.path) {
      await this.openFolderLanding(target.path);
      return;
    }

    if (target.kind === "file" && target.path) {
      await this.openPath(target.path);
    }
  }

  private scrollToSection(sectionId: string): void {
    const section = this.containerEl.querySelector(`#${sectionId}`);
    if (!section) {
      new Notice(`Section not found: ${sectionId}`);
      return;
    }
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  private async openFolderLanding(folderPath: string): Promise<void> {
    const normalized = normalizePathSetting(folderPath, folderPath);
    const folder = this.app.vault.getAbstractFileByPath(normalized);

    if (!(folder instanceof TFolder)) {
      new Notice(`Folder not found: ${normalized}`);
      return;
    }

    const landingFile = findFolderLandingFile(folder);
    if (!landingFile) {
      new Notice(`No markdown file found in ${normalized}`);
      return;
    }

    await this.openFile(landingFile);
  }

  private async openPath(path: string): Promise<void> {
    const normalized = normalizePathSetting(path, path);
    const target = this.app.vault.getAbstractFileByPath(normalized);

    if (target instanceof TFile) {
      await this.openFile(target);
      return;
    }

    if (target instanceof TFolder) {
      await this.openFolderLanding(normalized);
      return;
    }

    new Notice(`Path not found: ${normalized}`);
  }

  private async openFile(file: TFile): Promise<void> {
    const leaf = this.app.workspace.getLeaf("tab");
    await leaf.openFile(file);
    this.app.workspace.revealLeaf(leaf);
  }
}

class DashboardSettingTab extends PluginSettingTab {
  private plugin: AiKnowledgeDashboardPlugin;

  constructor(app: App, plugin: AiKnowledgeDashboardPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "AI Knowledge Dashboard" });

    new Setting(containerEl)
      .setName("Open on startup")
      .setDesc("Automatically open the dashboard when Obsidian starts.")
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.openOnStartup)
          .onChange(async (value) => {
            this.plugin.settings.openOnStartup = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Show personal status")
      .setDesc("Only show status counts. The plugin should not read personal details.")
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.showPersonalStatus)
          .onChange(async (value) => {
            this.plugin.settings.showPersonalStatus = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Action guide limit")
      .setDesc("Number of action guide cards shown on the dashboard.")
      .addSlider((slider) => {
        slider
          .setLimits(2, 6, 1)
          .setValue(this.plugin.settings.actionLimit)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.actionLimit = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Inbox folder")
      .setDesc("Folder used for collected notes. Default fits the reorganized Karpathy-style vault.")
      .addText((text) => {
        text
          .setPlaceholder("raw/inbox")
          .setValue(this.plugin.settings.inboxFolder)
          .onChange(async (value) => {
            this.plugin.settings.inboxFolder = normalizePathSetting(value, DEFAULT_SETTINGS.inboxFolder);
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Sources folder")
      .setDesc("Folder used for source notes and long-term learning material.")
      .addText((text) => {
        text
          .setPlaceholder("raw/sources")
          .setValue(this.plugin.settings.sourcesFolder)
          .onChange(async (value) => {
            this.plugin.settings.sourcesFolder = normalizePathSetting(value, DEFAULT_SETTINGS.sourcesFolder);
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Wiki folder")
      .setDesc("Folder used for compiled knowledge pages.")
      .addText((text) => {
        text
          .setPlaceholder("wiki")
          .setValue(this.plugin.settings.wikiFolder)
          .onChange(async (value) => {
            this.plugin.settings.wikiFolder = normalizePathSetting(value, DEFAULT_SETTINGS.wikiFolder);
            await this.plugin.saveSettings();
          });
      });
  }
}

async function collectKnowledgeStats(app: App, settings: DashboardSettings): Promise<KnowledgeStats> {
  const files = app.vault.getMarkdownFiles();
  const inboxFolder = resolveExistingFolderPath(app, settings.inboxFolder, ["raw/00-inbox"]);
  const sourcesFolder = resolveExistingFolderPath(app, settings.sourcesFolder, ["raw/sources"]);
  const assetsFolder = normalizePathSetting(settings.assetsFolder, DEFAULT_SETTINGS.assetsFolder);
  const wikiFolder = resolveExistingFolderPath(app, settings.wikiFolder, ["wiki"]);
  const conceptsFolder = resolveExistingFolderPath(app, settings.conceptsFolder, ["wiki/concepts"]);

  return {
    rawNotes: files.filter((file) => isInsideFolder(file, "raw") && !isInsideFolder(file, assetsFolder)).length,
    sourceNotes: files.filter((file) => isInsideFolder(file, sourcesFolder)).length,
    wikiNotes: files.filter((file) => isInsideFolder(file, wikiFolder)).length,
    conceptNotes: files.filter((file) => isInsideFolder(file, conceptsFolder)).length,
    inboxNotes: files.filter((file) => isInsideFolder(file, inboxFolder)).length
  };
}

function normalizePathSetting(value: string, fallback: string): string {
  const normalized = value.trim().replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  return normalized.length > 0 ? normalized : fallback;
}

function resolveExistingFolderPath(app: App, preferred: string, fallbacks: string[]): string {
  const candidates = [preferred, ...fallbacks].map((path) => normalizePathSetting(path, preferred));
  const existing = candidates.find((path) => app.vault.getAbstractFileByPath(path));
  return existing ?? candidates[0];
}

function isInsideFolder(file: TFile, folder: string): boolean {
  const normalized = normalizePathSetting(folder, folder);
  return file.path === normalized || file.path.startsWith(`${normalized}/`);
}

function buildActionGuides(): ActionGuide[] {
  return [
    {
      goal: "广州东附近求职",
      status: "已有 AI 项目、部署经验和知识库沉淀。",
      nextAction: "把 bz-lottery 改写成 AI 开发经验项目。",
      reason: "国内招聘正在重视 AI 开发经验。",
      estimate: "30-45 分钟",
      relatedNotes: ["简历", "bz-lottery", "一人公司路线"],
      aiHelp: ["生成项目描述", "提炼 STAR", "检查简历表达"]
    },
    {
      goal: "bz-lottery 项目包装",
      status: "已完成前端优化、CI/CD、ECS 发布和排障记录。",
      nextAction: "整理一篇可放进简历和面试表达的项目复盘。",
      reason: "这是最接近 AI 编程交付能力的个人项目。",
      estimate: "45 分钟",
      relatedNotes: ["项目复盘", "CI/CD", "部署踩坑"],
      aiHelp: ["抽取亮点", "生成面试问答", "补齐技术链路"]
    },
    {
      goal: "个人 AI 知识库自生长",
      status: "已有 raw/wiki、健康检查、搜索索引和工作台。",
      nextAction: "把 Dashboard 插件做成可长期使用的入口。",
      reason: "每天打开后能直接获得行动建议和维护入口。",
      estimate: "60 分钟",
      relatedNotes: ["自生长知识库设计", "知识库健康报告"],
      aiHelp: ["生成今日建议", "检查过期笔记", "规划下一步"]
    },
    {
      goal: "AI 一人公司路线",
      status: "方向已确定：主业稳住，副业慢慢跑通。",
      nextAction: "拆出 AI 编程交付和 AI 漫剧两个实验项目。",
      reason: "避免只停留在想法，需要变成可执行清单。",
      estimate: "30 分钟",
      relatedNotes: ["一人公司路线图", "AI 漫剧", "接单交付"],
      aiHelp: ["拆任务", "评估风险", "生成 MVP 计划"]
    }
  ];
}

function findFolderLandingFile(folder: TFolder): TFile | null {
  const directFiles = folder.children.filter((child): child is TFile => child instanceof TFile && child.extension === "md");
  const preferred = directFiles.find((file) => /^(README|index|00-|01-)/i.test(file.basename));

  if (preferred) {
    return preferred;
  }

  if (directFiles[0]) {
    return directFiles[0];
  }

  for (const child of folder.children) {
    if (child instanceof TFolder) {
      const nested = findFolderLandingFile(child);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
}

function renderNavItem(parent: HTMLElement, target: NavigationTarget, onClick: (target: NavigationTarget) => void): void {
  const button = parent.createEl("button", {
    cls: target.active ? "akd-nav-item is-active" : "akd-nav-item",
    text: target.label
  });
  button.addEventListener("click", () => onClick(target));
}

function renderProgressCard(parent: HTMLElement, title: string, progress: string, subtitle: string): void {
  const card = parent.createDiv({ cls: "akd-progress-card" });
  card.createEl("strong", { text: progress });
  card.createEl("span", { text: title });
  card.createEl("small", { text: subtitle });
}

function renderActionGuide(parent: HTMLElement, guide: ActionGuide): void {
  const card = parent.createDiv({ cls: "akd-guide-card" });
  card.createEl("span", { cls: "akd-pill", text: guide.estimate });
  card.createEl("h3", { text: guide.goal });
  card.createEl("p", { text: guide.status });
  card.createEl("strong", { text: guide.nextAction });
  card.createEl("small", { text: guide.reason });

  const tags = card.createDiv({ cls: "akd-tags" });
  guide.relatedNotes.forEach((note) => tags.createEl("span", { text: note }));
}

function renderTableRow(parent: HTMLElement, focus: string, status: string, action: string, metric: string): void {
  const row = parent.createDiv({ cls: "akd-table-row" });
  [focus, status, action, metric].forEach((item) => row.createEl("span", { text: item }));
}

function renderMiniStat(parent: HTMLElement, value: string, label: string): void {
  const item = parent.createDiv({ cls: "akd-mini-stat" });
  item.createEl("strong", { text: value });
  item.createEl("span", { text: label });
}
