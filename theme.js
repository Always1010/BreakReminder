(() => {
  const PRESETS = {
    "forest-dawn": {
      name: "林间晨光",
      description: "青绿与暖杏",
      primary: "#337D6B",
      secondary: "#E59A68",
      background: "#F4F7F4",
      surface: "#FFFFFF",
      text: "#20312C",
      muted: "#6F7F79",
      border: "#DCE6E1"
    },
    "morning-red": {
      name: "活力晨红",
      description: "柔珊瑚与晨橙",
      primary: "#C96762",
      secondary: "#E4A05E",
      background: "#FBF5F2",
      surface: "#FFFDFC",
      text: "#392B2A",
      muted: "#806F6D",
      border: "#EBDDD8"
    },
    "clear-sky": {
      name: "晴空海蓝",
      description: "海蓝与清水绿",
      primary: "#397EAE",
      secondary: "#54A99A",
      background: "#F2F7FA",
      surface: "#FFFFFF",
      text: "#22333F",
      muted: "#6D7E89",
      border: "#D8E4EB"
    },
    "amber-daylight": {
      name: "琥珀日光",
      description: "琥珀与鼠尾草",
      primary: "#B9772F",
      secondary: "#789672",
      background: "#FAF7F0",
      surface: "#FFFDFC",
      text: "#373126",
      muted: "#817866",
      border: "#E9E0CF"
    },
    "wisteria-breeze": {
      name: "紫藤微风",
      description: "灰紫与雾玫瑰",
      primary: "#756BA5",
      secondary: "#B87987",
      background: "#F7F5FA",
      surface: "#FFFFFF",
      text: "#302E3C",
      muted: "#797584",
      border: "#E3DFEC"
    },
    "deep-voyage": {
      name: "深海夜航",
      description: "靛蓝与深海青",
      primary: "#7E9FE1",
      secondary: "#5AB7A8",
      background: "#161B29",
      surface: "#202738",
      text: "#F0F4FA",
      muted: "#AAB4C7",
      border: "#333D52",
      dark: true
    }
  };

  const DEFAULT_SETTINGS = {
    themeId: "forest-dawn",
    customTheme: {
      primary: "#337D6B",
      secondary: "#E59A68",
      intensity: "balanced"
    }
  };

  function normalizeHex(value, fallback) {
    return /^#[0-9a-f]{6}$/i.test(value || "") ? value.toUpperCase() : fallback;
  }

  function hexToRgb(hex) {
    const value = normalizeHex(hex, "#000000").slice(1);
    return {
      r: Number.parseInt(value.slice(0, 2), 16),
      g: Number.parseInt(value.slice(2, 4), 16),
      b: Number.parseInt(value.slice(4, 6), 16)
    };
  }

  function rgbToHex({ r, g, b }) {
    const part = value => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0");
    return `#${part(r)}${part(g)}${part(b)}`.toUpperCase();
  }

  function mix(first, second, secondWeight) {
    const a = hexToRgb(first);
    const b = hexToRgb(second);
    return rgbToHex({
      r: a.r + (b.r - a.r) * secondWeight,
      g: a.g + (b.g - a.g) * secondWeight,
      b: a.b + (b.b - a.b) * secondWeight
    });
  }

  function contrastText(hex) {
    const { r, g, b } = hexToRgb(hex);
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance > 0.6 ? "#17221F" : "#FFFFFF";
  }

  function normalizeThemeSettings(settings = {}) {
    const custom = settings.customTheme || {};
    return {
      themeId: (PRESETS[settings.themeId] || settings.themeId === "custom") ? settings.themeId : DEFAULT_SETTINGS.themeId,
      customTheme: {
        primary: normalizeHex(custom.primary, DEFAULT_SETTINGS.customTheme.primary),
        secondary: normalizeHex(custom.secondary, DEFAULT_SETTINGS.customTheme.secondary),
        intensity: ["soft", "balanced", "vivid"].includes(custom.intensity) ? custom.intensity : "balanced"
      }
    };
  }

  function customPalette(customTheme) {
    const strength = { soft: 0.045, balanced: 0.075, vivid: 0.115 }[customTheme.intensity];
    return {
      name: "自定义主题",
      description: "你的专属配色",
      primary: customTheme.primary,
      secondary: customTheme.secondary,
      background: mix("#FFFFFF", customTheme.primary, strength),
      surface: "#FFFFFF",
      text: mix("#17221F", customTheme.primary, 0.08),
      muted: mix("#6F7774", customTheme.primary, 0.1),
      border: mix("#E4E8E6", customTheme.primary, strength * 1.25)
    };
  }

  function getPalette(settings = {}) {
    const normalized = normalizeThemeSettings(settings);
    const base = normalized.themeId === "custom"
      ? customPalette(normalized.customTheme)
      : PRESETS[normalized.themeId];
    const dark = Boolean(base.dark);
    return {
      ...base,
      primaryStrong: mix(base.primary, dark ? "#FFFFFF" : "#000000", dark ? 0.08 : 0.14),
      primarySoft: mix(base.surface, base.primary, dark ? 0.24 : 0.14),
      secondarySoft: mix(base.surface, base.secondary, dark ? 0.2 : 0.15),
      primaryText: contrastText(base.primary),
      shadow: dark ? "rgba(2, 6, 15, .32)" : "rgba(28, 53, 45, .09)",
      dark
    };
  }

  function applyTheme(settings = {}) {
    const normalized = normalizeThemeSettings(settings);
    const palette = getPalette(normalized);
    const root = document.documentElement;
    const variables = {
      "--bg": palette.background,
      "--surface": palette.surface,
      "--surface-soft": palette.primarySoft,
      "--text": palette.text,
      "--muted": palette.muted,
      "--border": palette.border,
      "--primary": palette.primary,
      "--primary-strong": palette.primaryStrong,
      "--primary-soft": palette.primarySoft,
      "--primary-text": palette.primaryText,
      "--secondary-accent": palette.secondary,
      "--secondary-soft": palette.secondarySoft,
      "--shadow-color": palette.shadow
    };
    Object.entries(variables).forEach(([name, value]) => root.style.setProperty(name, value));
    root.dataset.theme = normalized.themeId;
    root.style.colorScheme = palette.dark ? "dark" : "light";
    return palette;
  }

  globalThis.BreakBellTheme = {
    PRESETS,
    DEFAULT_SETTINGS,
    normalizeThemeSettings,
    getPalette,
    applyTheme
  };
})();
