import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [optionsHtml, optionsJs, popupHtml, popupJs, reminderHtml, reminderJs, backgroundJs, themeJs, manifest] = await Promise.all([
  readFile(new URL("../options.html", import.meta.url), "utf8"),
  readFile(new URL("../options.js", import.meta.url), "utf8"),
  readFile(new URL("../popup.html", import.meta.url), "utf8"),
  readFile(new URL("../popup.js", import.meta.url), "utf8"),
  readFile(new URL("../reminder.html", import.meta.url), "utf8"),
  readFile(new URL("../reminder.js", import.meta.url), "utf8"),
  readFile(new URL("../background.js", import.meta.url), "utf8"),
  readFile(new URL("../theme.js", import.meta.url), "utf8"),
  readFile(new URL("../manifest.json", import.meta.url), "utf8")
]);

for (const id of ["soundEnabled", "systemNotificationEnabled", "popupEnabled"]) {
  assert.ok(optionsHtml.includes(`id="${id}"`), `设置页应提供 ${id} 开关`);
}

for (const id of ["workStartSoundEnabled", "workEndSoundEnabled"]) {
  assert.ok(optionsHtml.includes(`id="${id}"`), `设置页应提供 ${id} 响铃节点开关`);
  assert.ok(optionsJs.includes(`${id}: $("${id}").checked`), `设置页应保存 ${id} 响铃节点设置`);
}

assert.ok(popupHtml.includes('id="pause"'), "主界面应提供全局暂停按钮");
assert.ok(popupHtml.includes('id="stopSound"'), "主界面应提供停止当前声音按钮");
assert.ok(popupJs.includes('type: "togglePause"'), "暂停按钮应调用暂停接口");
assert.ok(popupJs.includes('type: "stopReminderSound"'), "停止声音按钮应调用停止接口");
assert.ok(reminderJs.includes('type: "dismissReminder"'), "确认提醒应请求后台关闭整个窗口");
assert.ok(backgroundJs.includes('state.mode === "paused"'), "后台应持久化处理暂停状态");
assert.ok(backgroundJs.includes('break-bell-work-deadline'), "后台应创建独立的工作截止闹钟");
assert.ok(backgroundJs.includes('soundStatus'), "后台应提供当前声音状态");
assert.ok(optionsHtml.includes('id="themePicker"'), "设置页应提供主题选择器");
assert.ok(optionsHtml.includes('id="customPrimary"') && optionsHtml.includes('id="customSecondary"'), "设置页应提供双颜色自定义主题");
assert.ok(optionsHtml.includes('id="periodList"'), "设置页应为每个时间段提供独立编辑行");
assert.ok(optionsJs.includes('timeline-tick ${tickKind}'), "时间轴应生成半小时、整点和三小时分级刻度");
assert.ok(optionsJs.includes('period-label'), "时间轴应在时段下方居中显示时间区间");
assert.ok(optionsJs.includes('BreakBellTheme.normalizeThemeSettings(themeDraft)'), "设置页应保存主题设置");
assert.ok(Object.values([optionsHtml, popupHtml, reminderHtml]).every(html => html.includes('src="theme.js"')), "三个界面应共用主题系统");
for (const themeId of ["forest-dawn", "morning-red", "clear-sky", "amber-daylight", "wisteria-breeze", "deep-voyage"]) {
  assert.ok(themeJs.includes(`"${themeId}"`), `主题系统应包含 ${themeId}`);
}
assert.ok(manifest.includes('"system.display"'), "扩展应申请显示器信息权限以居中提醒窗口");
assert.ok(backgroundJs.includes("getCenteredReminderBounds"), "后台应按当前屏幕计算提醒窗口位置");

console.log("reminder controls tests passed");
