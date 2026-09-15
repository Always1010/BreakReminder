import assert from "node:assert/strict";

const variables = new Map();
globalThis.document = {
  documentElement: {
    dataset: {},
    style: {
      colorScheme: "",
      setProperty(name, value) { variables.set(name, value); }
    }
  }
};

await import(`../theme.js?test=${Date.now()}`);

assert.equal(Object.keys(BreakBellTheme.PRESETS).length, 6, "应提供六套预设主题");
assert.equal(BreakBellTheme.normalizeThemeSettings({ themeId: "unknown" }).themeId, "forest-dawn", "未知主题应回退到默认主题");

const custom = BreakBellTheme.normalizeThemeSettings({
  themeId: "custom",
  customTheme: { primary: "#123456", secondary: "#ABCDEF", intensity: "vivid" }
});
const palette = BreakBellTheme.applyTheme(custom);

assert.equal(document.documentElement.dataset.theme, "custom", "应用主题时应记录当前主题");
assert.equal(variables.get("--primary"), "#123456", "自定义主色应写入界面变量");
assert.equal(variables.get("--secondary-accent"), "#ABCDEF", "自定义辅助色应写入界面变量");
assert.equal(palette.description, "你的专属配色", "自定义主题应生成完整配色");

BreakBellTheme.applyTheme({ themeId: "deep-voyage" });
assert.equal(document.documentElement.style.colorScheme, "dark", "深海夜航应使用深色控件模式");

console.log("theme tests passed");
