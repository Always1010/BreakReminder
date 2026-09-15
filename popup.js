const $ = id => document.getElementById(id);

function fmt(ms) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

async function load() {
  const { settings, state, soundStatus } = await chrome.runtime.sendMessage({ type: "getStatus" });
  BreakBellTheme.applyTheme(settings);
  const working = state.mode === "work";
  const paused = state.mode === "paused";
  const pausedBreak = paused && state.pausedFrom === "break";
  const pausedWork = paused && state.pausedFrom === "work";

  $("status").textContent = paused
    ? "功能已暂停"
    : working
      ? "工作计时中"
      : state.mode === "break"
        ? "休息倒计时"
        : "当前为休息时段";
  $("timer").textContent = pausedWork
    ? fmt(settings.workMinutes * 60000 - state.elapsedMs)
    : pausedBreak
      ? fmt(state.breakEndsAt - state.pausedAt)
      : working
        ? fmt(settings.workMinutes * 60000 - state.elapsedMs)
        : state.mode === "break"
          ? fmt(state.breakEndsAt - Date.now())
          : paused ? "已暂停" : "休息";
  $("detail").textContent = paused
    ? "恢复前不会累计计时或发送提醒"
    : working
      ? `每 ${settings.workMinutes} 分钟提醒一次 · 休息 ${settings.breakMinutes} 分钟`
      : "下一工作时段开始时会自动提醒";
  $("displaySleepAllowed").checked = settings.displaySleepAllowed;
  $("soundControl").hidden = !soundStatus;
  if (soundStatus) $("soundText").textContent = `正在播放：${soundStatus.title}`;
  $("pause").disabled = false;
  $("pause").textContent = paused ? "继续功能" : "暂停功能";
  document.body.dataset.mode = paused ? "paused" : state.mode;
}

void load();
setInterval(load, 1000);

$("pause").onclick = async () => {
  await chrome.runtime.sendMessage({ type: "togglePause" });
  await load();
};

$("reset").onclick = async () => {
  await chrome.runtime.sendMessage({ type: "reset" });
  await load();
};

$("displaySleepAllowed").onchange = async event => {
  const response = await chrome.runtime.sendMessage({
    type: "setDisplaySleepAllowed",
    displaySleepAllowed: event.target.checked
  });
  if (!response?.ok) event.target.checked = !event.target.checked;
};

$("stopSound").onclick = async () => {
  await chrome.runtime.sendMessage({ type: "stopReminderSound" });
  await load();
};

$("options").onclick = () => chrome.runtime.openOptionsPage();
