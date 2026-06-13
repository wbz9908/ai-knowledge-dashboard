import { mkdir, copyFile } from "node:fs/promises";
import { resolve } from "node:path";

const vaultPluginDir = resolve(
  "C:/develop/notes/.obsidian/plugins/ai-knowledge-dashboard"
);

await mkdir(vaultPluginDir, { recursive: true });

await Promise.all([
  copyFile("manifest.json", resolve(vaultPluginDir, "manifest.json")),
  copyFile("main.js", resolve(vaultPluginDir, "main.js")),
  copyFile("styles.css", resolve(vaultPluginDir, "styles.css"))
]);

console.log(`Installed AI Knowledge Dashboard to ${vaultPluginDir}`);
