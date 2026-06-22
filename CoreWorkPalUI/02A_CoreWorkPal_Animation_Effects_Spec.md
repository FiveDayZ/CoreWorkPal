# CoreWorkPal 动态 UI / 桌宠动画特效专项规范

> 用途：补充给 UI 设计 AI 和 Codex。  
> 目标：防止最终只产出静态贴图，确保 CoreCat 和核心 UI 具备可实现、低功耗、低打扰的动态表现。

---

## 1. 核心结论

CoreWorkPal 是 mini 桌面宠物，不是静态贴纸软件。

必须做到：

```text
CoreCat 有生命感。
Pet Panel 有从桌宠身边展开的动效。
MonitorBar 有状态胶囊的轻展开。
主窗口卡片有精致微反馈。
所有动画都低打扰、低功耗、短时长。
```

禁止：

```text
只输出静态宠物贴图
只输出静态页面截图
让 Codex 自己想动画
用夸张弹跳和强发光假装高级
```

---

## 2. 设计 AI 必须交付

```text
1. UI 静态视觉稿
2. CoreCat 分层图
3. CoreCat 状态图
4. CoreCat MVP 动效帧 / 分层资产
5. Motion Storyboard
6. Animation Asset Manifest
7. 每个动效的触发、时长、缓动、循环规则
```

### 2.1 CoreCat MVP 资产

```text
corecat_idle_base.png
corecat_idle_eyes_blink_01.png - 06.png
corecat_hover_head_01.png - 06.png
corecat_click_nod_01.png - 06.png
corecat_shadow.png
corecat_status_light_blue.png
corecat_status_light_orange.png
corecat_status_light_red.png
```

### 2.2 CoreCat P1 资产

```text
idle_loop.webp 或 idle_loop_0001.png - 0024.png
repair_light_0001.png - 0018.png
temperature_check_0001.png - 0018.png
data_sorting_0001.png - 0018.png
sleep_loop_0001.png - 0024.png
celebrate_once_0001.png - 0024.png
```

---

## 3. Codex 必须实现

Codex 不负责设计动画，只负责按规格还原。

MVP 必须实现：

| 场景 | 动效 | 时长 | 实现方式 |
|---|---|---:|---|
| Idle | 呼吸缩放 0.985 - 1.0 | 2600ms loop | CSS keyframes |
| Blink | 眨眼 | 6 帧 / 约300ms | 图片层切换 |
| Hover | 抬头 / 耳朵轻动 | 180-260ms | CSS transform |
| Click | 小幅点头 | 160ms | CSS transform |
| Status Light | 柔和呼吸光 | 1800ms loop | opacity + shadow |
| Panel Open | opacity + scale + translateY | 140ms | CSS transition |
| Panel Close | opacity + scale | 100ms | CSS transition |
| MonitorBar Hover | 宽度展开 + 内容渐显 | 160ms | CSS transition |
| Metric Hover | 上浮 2px | 120ms | CSS transition |

---

## 4. 动效表达原则

```text
生命感 > 炫技
轻微反馈 > 大幅跳动
分层小动效 > 大视频动画
短时长 > 长过渡
低功耗 > 高帧率
```

---

## 5. 验收标准

必须通过：

```text
观察 CoreCat 10 秒，能感到它不是死图。
鼠标 hover 有轻微反馈。
点击有轻微反馈。
状态变化有状态灯或小道具反馈。
Pet Panel 展开像从桌宠旁边长出来。
MonitorBar hover 展开自然。
低功耗模式能降低或关闭非必要动画。
静态模式能关闭循环动画。
```

不通过：

```text
CoreCat 完全静止
只有一张贴图
Panel 像网页弹窗
动画很吵、很跳、很廉价
动画规格不明确，需要 Codex 自己想
```
