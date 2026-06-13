/* AI Knowledge Dashboard */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => AiKnowledgeDashboardPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DASHBOARD_VIEW_TYPE = "ai-knowledge-dashboard-view";
var DEFAULT_SETTINGS = {
  openOnStartup: true,
  showPersonalStatus: true,
  actionLimit: 4,
  inboxFolder: "raw/inbox",
  sourcesFolder: "raw/sources",
  assetsFolder: "raw/assets",
  wikiFolder: "wiki",
  conceptsFolder: "wiki/concepts"
};
var AiKnowledgeDashboardPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
  }
  async onload() {
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
  onunload() {
    this.app.workspace.detachLeavesOfType(DASHBOARD_VIEW_TYPE);
  }
  async activateDashboardView() {
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
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var DashboardView = class extends import_obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.activePage = "dashboard";
    this.plugin = plugin;
  }
  getViewType() {
    return DASHBOARD_VIEW_TYPE;
  }
  getDisplayText() {
    return "AI Knowledge Dashboard";
  }
  getIcon() {
    return "sparkles";
  }
  async onOpen() {
    await this.render();
  }
  async render() {
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
  renderSidebar(parent) {
    const sidebar = parent.createEl("aside", { cls: "akd-sidebar" });
    const brand = sidebar.createDiv({ cls: "akd-brand" });
    brand.createDiv({ cls: "akd-logo", text: "AI" });
    brand.createEl("strong", { text: "Knowledge OS" });
    const nav = sidebar.createDiv({ cls: "akd-nav" });
    const targets = [
      { label: "Dashboard", kind: "page", page: "dashboard" },
      { label: "Inbox", kind: "page", page: "inbox" },
      { label: "Action Guide", kind: "page", page: "action-guide" },
      { label: "Projects", kind: "page", page: "projects" },
      { label: "Knowledge Map", kind: "page", page: "knowledge-map" },
      { label: "Health", kind: "page", page: "health" }
    ];
    targets.forEach((target) => {
      target.active = target.page === this.activePage;
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
  renderMain(parent, stats, guides) {
    const main = parent.createEl("main", { cls: "akd-main" });
    const topbar = main.createDiv({ cls: "akd-topbar" });
    topbar.createEl("input", {
      cls: "akd-search",
      attr: { placeholder: "Search your notes, projects, ideas..." }
    });
    const inboxButton = topbar.createEl("button", { cls: "akd-icon-button", text: "Inbox" });
    inboxButton.addEventListener("click", () => {
      void this.setActivePage("inbox");
    });
    const healthButton = topbar.createEl("button", { cls: "akd-icon-button", text: "Health" });
    healthButton.addEventListener("click", () => {
      void this.setActivePage("health");
    });
    if (this.activePage !== "dashboard") {
      this.renderSubPage(main, stats, guides);
      return;
    }
    const hero = main.createDiv({ cls: "akd-hero" });
    hero.createEl("span", { text: "PERSONAL AI KNOWLEDGE BASE" });
    hero.createEl("h1", {
      text: "Build a self-growing knowledge system with AI"
    });
    hero.createEl("p", {
      text: "\u4ECA\u5929\u53EA\u770B\u4E09\u4EF6\u4E8B\uFF1A\u8BE5\u505A\u4EC0\u4E48\u3001\u4E3A\u4EC0\u4E48\u505A\u3001AI \u80FD\u5E2E\u6211\u7EF4\u62A4\u4EC0\u4E48\u3002"
    });
    const startButton = hero.createEl("button", { text: "Start Today" });
    startButton.addEventListener("click", () => {
      this.scrollToSection("action-guide");
    });
    const cards = main.createDiv({ cls: "akd-progress-cards" });
    renderProgressCard(cards, "AI \u77E5\u8BC6\u5E93", "62%", "\u81EA\u751F\u957F\u5DE5\u4F5C\u53F0");
    renderProgressCard(cards, "\u4E00\u4EBA\u516C\u53F8", "38%", "\u4E3B\u4E1A\u7A33\u4F4F + \u526F\u4E1A\u63A2\u7D22");
    renderProgressCard(cards, "bz-lottery", "54%", "AI \u9879\u76EE\u4F5C\u54C1\u96C6");
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
  renderAside(parent, stats) {
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
    const taskTargets = {
      "\u6574\u7406 Inbox": () => void this.setActivePage("inbox"),
      "\u751F\u6210\u4ECA\u65E5\u5EFA\u8BAE": () => void this.setActivePage("action-guide"),
      "\u68C0\u67E5\u5065\u5EB7\u5EA6": () => void this.setActivePage("health"),
      "\u7F16\u8BD1 Wiki": () => new import_obsidian.Notice("Wiki compile should still be run by your AI workflow for now.")
    };
    ["\u6574\u7406 Inbox", "\u751F\u6210\u4ECA\u65E5\u5EFA\u8BAE", "\u68C0\u67E5\u5065\u5EB7\u5EA6", "\u7F16\u8BD1 Wiki"].forEach((task) => {
      const item = mentor.createDiv({ cls: "akd-mentor-item" });
      item.createDiv({ cls: "akd-avatar", text: "AI" });
      item.createEl("span", { text: task });
      const runButton = item.createEl("button", { text: "Run" });
      runButton.addEventListener("click", taskTargets[task]);
    });
  }
  async handleNavigation(target) {
    if (target.kind === "page" && target.page) {
      await this.setActivePage(target.page);
      return;
    }
    if (target.kind === "section" && target.sectionId) {
      this.scrollToSection(target.sectionId);
      return;
    }
    if (target.kind === "settings") {
      new import_obsidian.Notice("Open Settings -> Community plugins -> AI Knowledge Dashboard.");
      return;
    }
  }
  async setActivePage(page) {
    this.activePage = page;
    await this.render();
    this.containerEl.scrollTo({ top: 0, behavior: "smooth" });
  }
  scrollToSection(sectionId) {
    const section = this.containerEl.querySelector(`#${sectionId}`);
    if (!section) {
      new import_obsidian.Notice(`Section not found: ${sectionId}`);
      return;
    }
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  async openFolderLanding(folderPath) {
    const normalized = normalizePathSetting(folderPath, folderPath);
    const folder = this.app.vault.getAbstractFileByPath(normalized);
    if (!(folder instanceof import_obsidian.TFolder)) {
      new import_obsidian.Notice(`Folder not found: ${normalized}`);
      return;
    }
    const landingFile = findFolderLandingFile(folder);
    if (!landingFile) {
      new import_obsidian.Notice(`No markdown file found in ${normalized}`);
      return;
    }
    await this.openFile(landingFile);
  }
  async openPath(path) {
    const normalized = normalizePathSetting(path, path);
    const target = this.app.vault.getAbstractFileByPath(normalized);
    if (target instanceof import_obsidian.TFile) {
      await this.openFile(target);
      return;
    }
    if (target instanceof import_obsidian.TFolder) {
      await this.openFolderLanding(normalized);
      return;
    }
    new import_obsidian.Notice(`Path not found: ${normalized}`);
  }
  async openFile(file) {
    const leaf = this.app.workspace.getLeaf("tab");
    await leaf.openFile(file);
    this.app.workspace.revealLeaf(leaf);
  }
  renderSubPage(main, stats, guides) {
    if (this.activePage === "inbox") {
      this.renderInboxPage(main);
      return;
    }
    if (this.activePage === "action-guide") {
      this.renderActionGuidePage(main, guides);
      return;
    }
    if (this.activePage === "projects") {
      this.renderProjectsPage(main);
      return;
    }
    if (this.activePage === "knowledge-map") {
      this.renderKnowledgeMapPage(main);
      return;
    }
    this.renderHealthPage(main, stats);
  }
  renderPageHeader(parent, title, description) {
    const header = parent.createDiv({ cls: "akd-page-header" });
    header.createEl("span", { text: "AI KNOWLEDGE DASHBOARD" });
    header.createEl("h1", { text: title });
    header.createEl("p", { text: description });
  }
  renderInboxPage(parent) {
    this.renderPageHeader(parent, "Inbox", "\u6536\u96C6\u6240\u6709\u65B0\u60F3\u6CD5\u3001AI \u5BF9\u8BDD\u3001\u7F51\u9875\u526A\u85CF\u548C\u8349\u7A3F\uFF0C\u540E\u7EED\u518D\u7531 AI \u6216\u4EBA\u5DE5\u6574\u7406\u5165 sources\u3002");
    const grid = parent.createDiv({ cls: "akd-page-grid" });
    const files = listMarkdownFilesInFolder(this.app, this.plugin.settings.inboxFolder).slice(0, 12);
    files.forEach((file) => {
      renderFileCard(grid, file, "Captured note", () => void this.openFile(file));
    });
    if (files.length === 0) {
      renderEmptyState(grid, "Inbox is empty", "raw/inbox \u4E0B\u6682\u65F6\u6CA1\u6709 Markdown \u6587\u4EF6\u3002");
    }
  }
  renderActionGuidePage(parent, guides) {
    this.renderPageHeader(parent, "Action Guide", "\u628A\u76EE\u6807\u53D8\u6210\u4E0B\u4E00\u6B65\u884C\u52A8\uFF1A\u4E3A\u4EC0\u4E48\u505A\u3001\u505A\u4EC0\u4E48\u3001\u9884\u8BA1\u591A\u4E45\u3001AI \u53EF\u4EE5\u5E2E\u4EC0\u4E48\u3002");
    const grid = parent.createDiv({ cls: "akd-guide-grid akd-guide-grid-wide" });
    guides.forEach((guide) => renderActionGuide(grid, guide));
  }
  renderProjectsPage(parent) {
    this.renderPageHeader(parent, "Projects", "\u9879\u76EE\u533A\u7528\u4E8E\u627F\u8F7D\u80FD\u5BF9\u5916\u5C55\u793A\u3001\u80FD\u590D\u76D8\u3001\u80FD\u5F62\u6210\u4F5C\u54C1\u96C6\u7684\u5B9E\u8DF5\u3002");
    const grid = parent.createDiv({ cls: "akd-page-grid" });
    const projectFolder = "raw/sources/301-\u9879\u76EE";
    const files = listMarkdownFilesInFolder(this.app, projectFolder).slice(0, 12);
    files.forEach((file) => {
      renderFileCard(grid, file, "Project note", () => void this.openFile(file));
    });
    if (files.length === 0) {
      renderEmptyState(grid, "No project notes found", `${projectFolder} \u4E0B\u6682\u65F6\u6CA1\u6709 Markdown \u6587\u4EF6\u3002`);
    }
  }
  renderKnowledgeMapPage(parent) {
    this.renderPageHeader(parent, "Knowledge Map", "\u6309\u7167 100/200/300 \u7F16\u53F7\u4F53\u7CFB\u6D4F\u89C8\u77E5\u8BC6\u6E90\u76EE\u5F55\uFF0C\u8BA9 AI \u548C\u4EBA\u90FD\u80FD\u5FEB\u901F\u7406\u89E3\u5206\u7C7B\u3002");
    const grid = parent.createDiv({ cls: "akd-page-grid" });
    const folders = listFirstLevelFolders(this.app, this.plugin.settings.sourcesFolder);
    folders.forEach((folder) => {
      const card = grid.createDiv({ cls: "akd-map-card" });
      card.createEl("h3", { text: folder.name });
      card.createEl("p", { text: `${countMarkdownFiles(folder)} notes` });
      const openButton = card.createEl("button", { text: "Open landing note" });
      openButton.addEventListener("click", () => {
        void this.openFolderLanding(folder.path);
      });
    });
    if (folders.length === 0) {
      renderEmptyState(grid, "No source folders found", `${this.plugin.settings.sourcesFolder} \u4E0B\u6682\u65F6\u6CA1\u6709\u4E00\u7EA7\u5206\u7C7B\u76EE\u5F55\u3002`);
    }
  }
  renderHealthPage(parent, stats) {
    this.renderPageHeader(parent, "Health", "\u67E5\u770B\u77E5\u8BC6\u5E93\u89C4\u6A21\u3001wiki \u72B6\u6001\u548C\u540E\u7EED\u7EF4\u62A4\u5165\u53E3\u3002");
    const grid = parent.createDiv({ cls: "akd-page-grid" });
    [
      ["Raw notes", String(stats.rawNotes)],
      ["Sources", String(stats.sourceNotes)],
      ["Wiki pages", String(stats.wikiNotes)],
      ["Concepts", String(stats.conceptNotes)],
      ["Inbox", String(stats.inboxNotes)]
    ].forEach(([label, value]) => {
      const card = grid.createDiv({ cls: "akd-health-card" });
      card.createEl("strong", { text: value });
      card.createEl("span", { text: label });
    });
    const healthFile = grid.createDiv({ cls: "akd-map-card" });
    healthFile.createEl("h3", { text: "Wiki Health Report" });
    healthFile.createEl("p", { text: "\u6253\u5F00 wiki/HEALTH.md \u67E5\u770B\u6700\u8FD1\u4E00\u6B21\u5065\u5EB7\u68C0\u67E5\u3002" });
    const openButton = healthFile.createEl("button", { text: "Open Health Report" });
    openButton.addEventListener("click", () => {
      void this.openPath("wiki/HEALTH.md");
    });
  }
};
var DashboardSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "AI Knowledge Dashboard" });
    new import_obsidian.Setting(containerEl).setName("Open on startup").setDesc("Automatically open the dashboard when Obsidian starts.").addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.openOnStartup).onChange(async (value) => {
        this.plugin.settings.openOnStartup = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName("Show personal status").setDesc("Only show status counts. The plugin should not read personal details.").addToggle((toggle) => {
      toggle.setValue(this.plugin.settings.showPersonalStatus).onChange(async (value) => {
        this.plugin.settings.showPersonalStatus = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName("Action guide limit").setDesc("Number of action guide cards shown on the dashboard.").addSlider((slider) => {
      slider.setLimits(2, 6, 1).setValue(this.plugin.settings.actionLimit).setDynamicTooltip().onChange(async (value) => {
        this.plugin.settings.actionLimit = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName("Inbox folder").setDesc("Folder used for collected notes. Default fits the reorganized Karpathy-style vault.").addText((text) => {
      text.setPlaceholder("raw/inbox").setValue(this.plugin.settings.inboxFolder).onChange(async (value) => {
        this.plugin.settings.inboxFolder = normalizePathSetting(value, DEFAULT_SETTINGS.inboxFolder);
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName("Sources folder").setDesc("Folder used for source notes and long-term learning material.").addText((text) => {
      text.setPlaceholder("raw/sources").setValue(this.plugin.settings.sourcesFolder).onChange(async (value) => {
        this.plugin.settings.sourcesFolder = normalizePathSetting(value, DEFAULT_SETTINGS.sourcesFolder);
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName("Wiki folder").setDesc("Folder used for compiled knowledge pages.").addText((text) => {
      text.setPlaceholder("wiki").setValue(this.plugin.settings.wikiFolder).onChange(async (value) => {
        this.plugin.settings.wikiFolder = normalizePathSetting(value, DEFAULT_SETTINGS.wikiFolder);
        await this.plugin.saveSettings();
      });
    });
  }
};
async function collectKnowledgeStats(app, settings) {
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
function normalizePathSetting(value, fallback) {
  const normalized = value.trim().replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  return normalized.length > 0 ? normalized : fallback;
}
function resolveExistingFolderPath(app, preferred, fallbacks) {
  const candidates = [preferred, ...fallbacks].map((path) => normalizePathSetting(path, preferred));
  const existing = candidates.find((path) => app.vault.getAbstractFileByPath(path));
  return existing != null ? existing : candidates[0];
}
function isInsideFolder(file, folder) {
  const normalized = normalizePathSetting(folder, folder);
  return file.path === normalized || file.path.startsWith(`${normalized}/`);
}
function buildActionGuides() {
  return [
    {
      goal: "\u5E7F\u5DDE\u4E1C\u9644\u8FD1\u6C42\u804C",
      status: "\u5DF2\u6709 AI \u9879\u76EE\u3001\u90E8\u7F72\u7ECF\u9A8C\u548C\u77E5\u8BC6\u5E93\u6C89\u6DC0\u3002",
      nextAction: "\u628A bz-lottery \u6539\u5199\u6210 AI \u5F00\u53D1\u7ECF\u9A8C\u9879\u76EE\u3002",
      reason: "\u56FD\u5185\u62DB\u8058\u6B63\u5728\u91CD\u89C6 AI \u5F00\u53D1\u7ECF\u9A8C\u3002",
      estimate: "30-45 \u5206\u949F",
      relatedNotes: ["\u7B80\u5386", "bz-lottery", "\u4E00\u4EBA\u516C\u53F8\u8DEF\u7EBF"],
      aiHelp: ["\u751F\u6210\u9879\u76EE\u63CF\u8FF0", "\u63D0\u70BC STAR", "\u68C0\u67E5\u7B80\u5386\u8868\u8FBE"]
    },
    {
      goal: "bz-lottery \u9879\u76EE\u5305\u88C5",
      status: "\u5DF2\u5B8C\u6210\u524D\u7AEF\u4F18\u5316\u3001CI/CD\u3001ECS \u53D1\u5E03\u548C\u6392\u969C\u8BB0\u5F55\u3002",
      nextAction: "\u6574\u7406\u4E00\u7BC7\u53EF\u653E\u8FDB\u7B80\u5386\u548C\u9762\u8BD5\u8868\u8FBE\u7684\u9879\u76EE\u590D\u76D8\u3002",
      reason: "\u8FD9\u662F\u6700\u63A5\u8FD1 AI \u7F16\u7A0B\u4EA4\u4ED8\u80FD\u529B\u7684\u4E2A\u4EBA\u9879\u76EE\u3002",
      estimate: "45 \u5206\u949F",
      relatedNotes: ["\u9879\u76EE\u590D\u76D8", "CI/CD", "\u90E8\u7F72\u8E29\u5751"],
      aiHelp: ["\u62BD\u53D6\u4EAE\u70B9", "\u751F\u6210\u9762\u8BD5\u95EE\u7B54", "\u8865\u9F50\u6280\u672F\u94FE\u8DEF"]
    },
    {
      goal: "\u4E2A\u4EBA AI \u77E5\u8BC6\u5E93\u81EA\u751F\u957F",
      status: "\u5DF2\u6709 raw/wiki\u3001\u5065\u5EB7\u68C0\u67E5\u3001\u641C\u7D22\u7D22\u5F15\u548C\u5DE5\u4F5C\u53F0\u3002",
      nextAction: "\u628A Dashboard \u63D2\u4EF6\u505A\u6210\u53EF\u957F\u671F\u4F7F\u7528\u7684\u5165\u53E3\u3002",
      reason: "\u6BCF\u5929\u6253\u5F00\u540E\u80FD\u76F4\u63A5\u83B7\u5F97\u884C\u52A8\u5EFA\u8BAE\u548C\u7EF4\u62A4\u5165\u53E3\u3002",
      estimate: "60 \u5206\u949F",
      relatedNotes: ["\u81EA\u751F\u957F\u77E5\u8BC6\u5E93\u8BBE\u8BA1", "\u77E5\u8BC6\u5E93\u5065\u5EB7\u62A5\u544A"],
      aiHelp: ["\u751F\u6210\u4ECA\u65E5\u5EFA\u8BAE", "\u68C0\u67E5\u8FC7\u671F\u7B14\u8BB0", "\u89C4\u5212\u4E0B\u4E00\u6B65"]
    },
    {
      goal: "AI \u4E00\u4EBA\u516C\u53F8\u8DEF\u7EBF",
      status: "\u65B9\u5411\u5DF2\u786E\u5B9A\uFF1A\u4E3B\u4E1A\u7A33\u4F4F\uFF0C\u526F\u4E1A\u6162\u6162\u8DD1\u901A\u3002",
      nextAction: "\u62C6\u51FA AI \u7F16\u7A0B\u4EA4\u4ED8\u548C AI \u6F2B\u5267\u4E24\u4E2A\u5B9E\u9A8C\u9879\u76EE\u3002",
      reason: "\u907F\u514D\u53EA\u505C\u7559\u5728\u60F3\u6CD5\uFF0C\u9700\u8981\u53D8\u6210\u53EF\u6267\u884C\u6E05\u5355\u3002",
      estimate: "30 \u5206\u949F",
      relatedNotes: ["\u4E00\u4EBA\u516C\u53F8\u8DEF\u7EBF\u56FE", "AI \u6F2B\u5267", "\u63A5\u5355\u4EA4\u4ED8"],
      aiHelp: ["\u62C6\u4EFB\u52A1", "\u8BC4\u4F30\u98CE\u9669", "\u751F\u6210 MVP \u8BA1\u5212"]
    }
  ];
}
function findFolderLandingFile(folder) {
  const directFiles = folder.children.filter((child) => child instanceof import_obsidian.TFile && child.extension === "md");
  const preferred = directFiles.find((file) => /^(README|index|00-|01-)/i.test(file.basename));
  if (preferred) {
    return preferred;
  }
  if (directFiles[0]) {
    return directFiles[0];
  }
  for (const child of folder.children) {
    if (child instanceof import_obsidian.TFolder) {
      const nested = findFolderLandingFile(child);
      if (nested) {
        return nested;
      }
    }
  }
  return null;
}
function listMarkdownFilesInFolder(app, folderPath) {
  const normalized = normalizePathSetting(folderPath, folderPath);
  return app.vault.getMarkdownFiles().filter((file) => file.path.startsWith(`${normalized}/`)).sort((left, right) => left.path.localeCompare(right.path, "zh-Hans-CN"));
}
function listFirstLevelFolders(app, folderPath) {
  const folder = app.vault.getAbstractFileByPath(normalizePathSetting(folderPath, folderPath));
  if (!(folder instanceof import_obsidian.TFolder)) {
    return [];
  }
  return folder.children.filter((child) => child instanceof import_obsidian.TFolder).sort((left, right) => left.name.localeCompare(right.name, "zh-Hans-CN"));
}
function countMarkdownFiles(folder) {
  let count = 0;
  for (const child of folder.children) {
    if (child instanceof import_obsidian.TFile && child.extension === "md") {
      count += 1;
    }
    if (child instanceof import_obsidian.TFolder) {
      count += countMarkdownFiles(child);
    }
  }
  return count;
}
function renderFileCard(parent, file, label, onOpen) {
  const card = parent.createDiv({ cls: "akd-map-card" });
  card.createEl("span", { cls: "akd-pill", text: label });
  card.createEl("h3", { text: file.basename });
  card.createEl("p", { text: file.path });
  const openButton = card.createEl("button", { text: "Open note" });
  openButton.addEventListener("click", onOpen);
}
function renderEmptyState(parent, title, description) {
  const card = parent.createDiv({ cls: "akd-map-card" });
  card.createEl("h3", { text: title });
  card.createEl("p", { text: description });
}
function renderNavItem(parent, target, onClick) {
  const button = parent.createEl("button", {
    cls: target.active ? "akd-nav-item is-active" : "akd-nav-item",
    text: target.label
  });
  button.addEventListener("click", () => onClick(target));
}
function renderProgressCard(parent, title, progress, subtitle) {
  const card = parent.createDiv({ cls: "akd-progress-card" });
  card.createEl("strong", { text: progress });
  card.createEl("span", { text: title });
  card.createEl("small", { text: subtitle });
}
function renderActionGuide(parent, guide) {
  const card = parent.createDiv({ cls: "akd-guide-card" });
  card.createEl("span", { cls: "akd-pill", text: guide.estimate });
  card.createEl("h3", { text: guide.goal });
  card.createEl("p", { text: guide.status });
  card.createEl("strong", { text: guide.nextAction });
  card.createEl("small", { text: guide.reason });
  const tags = card.createDiv({ cls: "akd-tags" });
  guide.relatedNotes.forEach((note) => tags.createEl("span", { text: note }));
}
function renderTableRow(parent, focus, status, action, metric) {
  const row = parent.createDiv({ cls: "akd-table-row" });
  [focus, status, action, metric].forEach((item) => row.createEl("span", { text: item }));
}
function renderMiniStat(parent, value, label) {
  const item = parent.createDiv({ cls: "akd-mini-stat" });
  item.createEl("strong", { text: value });
  item.createEl("span", { text: label });
}
