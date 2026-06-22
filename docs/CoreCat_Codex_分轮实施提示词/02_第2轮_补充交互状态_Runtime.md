# CoreCat Codex 分轮实施提示词 - 第 2 轮

> 使用方式：将本文件内容整体复制给 Codex。执行前确保项目根目录已有 `AGENTS.md`，并且 `/docs/animation/` 下已有 CoreCat 动画规范文档。
>
> 执行原则：每次只喂一轮，等 Codex 完成、运行检查并反馈后，再喂下一轮。

---

# 第 2 轮：补充交互状态 Runtime

## Codex 提示词

```markdown
请继续补齐 CoreCat 补充交互状态 runtime。本轮只做补充交互状态，不做最终美术资产，不重构 VFX Bus。

请先阅读以下文件：

1. `/docs/animation/CoreCat_素材分层规范.md`
2. `/docs/animation/CoreCat_骨骼动画规范.md`
3. `/docs/animation/CoreCat_状态机规范.md`
4. `/docs/animation/CoreCat_Codex_骨骼动画运行时完整开发文档.md`

同时检查上一轮已经实现的 VFX Bus、Debug Panel、animationStateMachine、animationMixer、animationRuntime。

---

# 一、本轮需要实现的状态

需要实现的补充状态：

1. BootWake
2. Dragging
3. DropLanding
4. PanelOpen
5. PanelClose
6. ErrorGlitch
7. UpdateInstalling
8. AchievementPop

---

## 1. BootWake

应用启动或 CoreCat 首次显示时触发。

动画要求：

1. 0-300ms：CoreCat 从轻微蜷缩 / 低亮度状态苏醒。
2. 300-700ms：头部抬起，眼睛从 sleepy / blink 切到 normal。
3. 700-1000ms：护目镜闪过一次冷青色高光。
4. 播放结束后进入 Idle。

工程要求：

1. BootWake 是一次性状态。
2. 首次打开 PetWindow 时自动触发一次。
3. Debug Panel 可以手动触发。
4. 不得每次热重载都疯狂重复触发，开发环境可接受手动触发。

---

## 2. Dragging

用户拖拽 CoreCat 时触发。

动画要求：

1. 身体整体向拖拽反方向轻微倾斜。
2. 尾巴和耳朵产生惯性滞后。
3. 眼睛看向拖拽方向。
4. 拖拽期间暂停 Hover。
5. 不触发高频粒子。
6. 如果拖拽速度较大，body_base 允许轻微 squash/stretch，但幅度要克制。

工程要求：

1. Dragging 优先级高于 Hover、Idle。
2. Dragging 低于 TemperatureCheck / MemoryCrowded 这类紧急硬件状态，除非当前用户正在直接拖拽。
3. 拖拽结束后进入 DropLanding。

---

## 3. DropLanding

用户松开拖拽落地时触发。

动画要求：

1. 0-80ms：body_base 下压，scaleY 0.90，scaleX 1.06。
2. 80-220ms：向上反弹，scaleY 1.05。
3. 220-420ms：阻尼回弹归位。
4. shadow 瞬间变深后恢复。
5. 播放结束后进入 Idle 或 Hover。

工程要求：

1. DropLanding 是一次性状态。
2. DropLanding 过程中不应被 Hover 打断。
3. 如果落地瞬间硬件状态为高温或内存爆满，落地结束后应切到对应硬件状态。

---

## 4. PanelOpen

Quick Panel 打开时触发。

动画要求：

1. 右手从 pouch 掏出诊断平板。
2. pouch 节点发光。
3. 面板从 pouch 边缘弹性展开。
4. 与现有 Pet Quick Panel 动效联动。
5. CoreCat 的身体有轻微向面板方向引导的姿态。

工程要求：

1. PanelOpen 是一次性状态。
2. PanelOpen 结束后应进入 Idle / Hover / Repairing 等合理基础状态。
3. 不得破坏现有 Quick Panel 打开逻辑。

---

## 5. PanelClose

Quick Panel 关闭时触发。

动画要求：

1. 面板向 pouch 回收。
2. CoreCat 右手做收回动作。
3. pouch 发出短促蓝色微光。
4. 播放结束后回 Idle / Hover。

工程要求：

1. PanelClose 是一次性状态。
2. PanelClose 必须能被 Debug Panel 手动触发。
3. 不得影响生产环境面板关闭速度。

---

## 6. ErrorGlitch

应用异常、硬件读取失败或模块错误时触发。

动画要求：

1. 护目镜出现短暂红色 glitch 扫描线。
2. CoreCat 身体轻微左右错位抖动 300ms。
3. eyes 切换为 focused 或 dizzy。
4. VFX 不得过强，避免干扰用户。
5. 错误解除后回 Idle。

工程要求：

1. ErrorGlitch 是短时异常提示，不应该无限循环吓人。
2. 如果错误持续存在，可以每隔较长时间轻提示一次，而不是持续抖动。
3. Debug Panel 可模拟硬件读取失败。

---

## 7. UpdateInstalling

模块更新或插件安装时触发。

动画要求：

1. CoreCat 面前出现小型进度全息条。
2. 右手轻敲或拖动进度块。
3. 数据粒子沿进度条流动。
4. 安装过程中保持低干扰循环。
5. 完成后可触发 Celebrate。

工程要求：

1. 支持传入 progress 0-100。
2. 如果暂时没有真实更新逻辑，Debug Panel 里提供模拟进度。
3. 不要阻塞主 UI。

---

## 8. AchievementPop

用户获得奖励或指标恢复良好时触发。

动画要求：

1. eyes 切换为 glowing。
2. 头部上方弹出小徽章或星标。
3. 2-4 个金色星点上浮。
4. 总时长 900ms 内。
5. 播放结束后回 Idle。

工程要求：

1. AchievementPop 是一次性状态。
2. 不能抢占 TemperatureCheck / MemoryCrowded 这类紧急状态。
3. 可以作为 Celebrate 的轻量替代。

---

# 二、状态机要求

1. 所有状态必须接入 animationStateMachine。
2. 一次性状态必须自动结束。
3. 每个状态必须有明确 transition duration。
4. 补充状态必须能在 Debug Panel 中手动触发。
5. 不允许影响已有核心状态。
6. Dragging / DropLanding / PanelOpen / PanelClose 必须和 UI 交互事件打通。

建议补充 transition：

```ts
export const CORECAT_EXTRA_TRANSITIONS = {
  Any_to_BootWake: 80,
  BootWake_to_Idle: 220,
  Any_to_Dragging: 60,
  Dragging_to_DropLanding: 40,
  DropLanding_to_Idle: 220,
  Any_to_PanelOpen: 80,
  PanelOpen_to_Idle: 160,
  Any_to_PanelClose: 80,
  PanelClose_to_Idle: 160,
  Any_to_ErrorGlitch: 40,
  ErrorGlitch_to_Idle: 180,
  Any_to_UpdateInstalling: 160,
  UpdateInstalling_to_Celebrate: 80,
  Any_to_AchievementPop: 60,
  AchievementPop_to_Idle: 160
}
```

---

# 三、测试要求

请增加必要测试覆盖：

1. BootWake 播放结束后回 Idle。
2. Dragging 期间 Hover 不生效。
3. Dragging 结束后触发 DropLanding。
4. DropLanding 播放结束后回基础状态。
5. PanelOpen / PanelClose 可以手动触发。
6. ErrorGlitch 不会无限卡住。
7. UpdateInstalling 能接收 progress。
8. AchievementPop 不抢占紧急硬件状态。

最后运行：

```powershell
corepack pnpm typecheck
corepack pnpm test:corecat
corepack pnpm build
```

---

# 四、本轮不要做

1. 不要接入 Spine / Live2D / Rive。
2. 不要替换最终美术资产。
3. 不要制作安装包。
4. 不要重写 VFX Bus。
5. 不要大改主 UI。
6. 不要破坏已完成的 TemperatureCheck / MemoryCrowded / Repairing / DataSorting / Celebrate VFX。

---

# 五、完成后请输出

1. 修改文件清单。
2. 每个补充状态的完成情况。
3. Debug Panel 验收方式。
4. 哪些效果仍需最终美术资产替换。
5. 测试结果。
6. 下一轮建议。
```

---
