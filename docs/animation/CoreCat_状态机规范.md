# CoreCat 状态机规范.md

> **文档用途**：给 Codex 实现 CoreCat 动画状态机、事件触发、优先级仲裁、状态过渡融合和硬件数据驱动逻辑。  
> **适用范围**：CoreCat 角色动作状态、UI 面板动作、硬件监控状态、一次性庆典动作。  
> **核心原则**：所有状态必须可中断、可恢复、可降级；状态切换必须有融合窗口，不允许跳帧或图层瞬移。

---

## 1. 状态定义

```ts
export type CoreCatAnimationState =
  | 'bootWake'
  | 'idle'
  | 'hover'
  | 'click'
  | 'dragging'
  | 'dropLanding'
  | 'panelOpen'
  | 'panelClose'
  | 'temperatureCheck'
  | 'memoryCrowded'
  | 'repairing'
  | 'dataSorting'
  | 'sleep'
  | 'celebrate'
  | 'updateInstalling'
  | 'achievementPop'
  | 'errorGlitch'
  | 'lowPowerStatic';
```

---

## 2. 事件定义

```ts
export type CoreCatEvent =
  | { type: 'APP_BOOTED' }
  | { type: 'MOUSE_ENTER'; x: number; y: number }
  | { type: 'MOUSE_MOVE'; x: number; y: number }
  | { type: 'MOUSE_LEAVE' }
  | { type: 'PET_CLICK' }
  | { type: 'DRAG_START' }
  | { type: 'DRAG_MOVE'; dx: number; dy: number; velocityX: number; velocityY: number }
  | { type: 'DRAG_END'; velocityX: number; velocityY: number }
  | { type: 'PANEL_OPEN_REQUEST' }
  | { type: 'PANEL_CLOSE_REQUEST' }
  | { type: 'HARDWARE_SNAPSHOT'; cpu: number; ram: number; cpuTemp?: number; gpuTemp?: number; timestamp: number }
  | { type: 'WORKSHOP_TASK_START'; taskId: string; taskType: 'clean' | 'repair' | 'scan' | 'optimize' | 'update' }
  | { type: 'WORKSHOP_TASK_SUCCESS'; taskId: string }
  | { type: 'WORKSHOP_TASK_FAILED'; taskId: string; message?: string }
  | { type: 'USER_INACTIVE'; inactiveMs: number }
  | { type: 'USER_ACTIVE' }
  | { type: 'LOW_POWER_ON' }
  | { type: 'LOW_POWER_OFF' }
  | { type: 'FULLSCREEN_GAME_DETECTED' }
  | { type: 'FOREGROUND_NORMALIZED' }
  | { type: 'ACHIEVEMENT_UNLOCKED'; achievementId: string }
  | { type: 'ANIMATION_FINISHED'; state: CoreCatAnimationState };
```

---

## 3. 状态优先级

数字越大优先级越高。高优先级状态可以打断低优先级状态；低优先级状态不得抢占高优先级状态。

| 状态 | 优先级 | 类型 | 说明 |
|---|---:|---|---|
| `lowPowerStatic` | 100 | 持续 | 全屏游戏/高负载保护，强制降级 |
| `errorGlitch` | 95 | 一次性/短循环 | 权限、插件、监控异常 |
| `dragging` | 90 | 持续 | 用户正在拖拽，必须优先响应 |
| `dropLanding` | 88 | 一次性 | 拖拽释放后的落地回弹 |
| `panelOpen` | 82 | 一次性 | 工具包面板打开 |
| `panelClose` | 82 | 一次性 | 工具包面板关闭 |
| `click` | 80 | 一次性 | 点击反馈 |
| `celebrate` | 78 | 一次性 | 成功庆典 |
| `achievementPop` | 76 | 一次性 | 成就奖励 |
| `updateInstalling` | 70 | 持续 | 模块安装/更新中 |
| `repairing` | 68 | 持续 | 工坊修复/清理/优化中 |
| `temperatureCheck` | 60 | 持续 | 高温警报 |
| `memoryCrowded` | 55 | 持续 | 内存吃紧 |
| `sleep` | 40 | 持续 | 休眠/低功耗 |
| `hover` | 30 | 持续 | 鼠标追踪 |
| `dataSorting` | 20 | 持续 | 低负载整理 |
| `idle` | 10 | 持续 | 默认 |
| `bootWake` | 5 | 一次性 | 启动唤醒，只在开场播放 |

---

## 4. 状态类型

### 4.1 持续状态 Loop State

持续状态会一直播放，直到条件消失或被更高优先级状态打断。

包括：

```text
idle
hover
temperatureCheck
memoryCrowded
repairing
dataSorting
sleep
updateInstalling
lowPowerStatic
```

### 4.2 一次性状态 One-shot State

一次性状态播放完毕后必须自动回退到 `resolveBaseState()` 计算出的基础状态。

包括：

```text
bootWake
click
dropLanding
panelOpen
panelClose
celebrate
achievementPop
errorGlitch
```

---

## 5. 硬件状态触发规则

### 5.1 高温 hysteresis

避免温度在阈值附近反复横跳。

```ts
const ENTER_TEMP_CHECK = 75;
const EXIT_TEMP_CHECK = 70;
const EXIT_TEMP_STABLE_MS = 5000;
```

规则：

1. `cpuTemp > 75` 或 `gpuTemp > 75` 进入 `temperatureCheck`。
2. 已在高温状态时，必须温度 `< 70` 且持续 `5000ms` 才退出。
3. 高温状态优先于内存状态。

### 5.2 内存吃紧 hysteresis

```ts
const ENTER_MEMORY_CROWDED = 85;
const EXIT_MEMORY_CROWDED = 78;
const EXIT_MEMORY_STABLE_MS = 5000;
```

规则：

1. `ram > 85` 进入 `memoryCrowded`。
2. 已在内存状态时，必须 `ram < 78` 且持续 `5000ms` 才退出。
3. 如果同时高温和内存吃紧，展示 `temperatureCheck`，但可以在 UI 小状态提示中显示 RAM 警告。

### 5.3 低负载数据整理

```ts
const ENTER_DATA_SORTING_CPU = 10;
const EXIT_DATA_SORTING_CPU = 20;
const USER_IDLE_FOR_DATA_SORTING_MS = 30_000;
```

规则：

1. CPU `< 10%` 且用户无交互 `30s`，进入 `dataSorting`。
2. CPU `> 20%` 或用户移动鼠标/点击，退出。
3. 不得抢占 `hover`、`sleep`、`repairing`。

### 5.4 休眠 / LowPower

```ts
const ENTER_SLEEP_INACTIVE_MS = 15 * 60 * 1000;
```

规则：

1. 用户无操作超过 `15min` 进入 `sleep`。
2. 用户手动开启低功耗，进入 `sleep` 或 `lowPowerStatic`。
3. 检测到全屏游戏/高负载前台应用，进入 `lowPowerStatic`。
4. 用户恢复操作，退出 sleep，但若仍有高温/内存/工坊任务，必须进入对应状态而不是 idle。

---

## 6. 基础状态解析函数

任何一次性动作结束后，不要固定回 `idle`。必须重新计算当前应该显示的状态。

```ts
export function resolveBaseState(ctx: CoreCatContext): CoreCatAnimationState {
  if (ctx.isFullscreenGameDetected || ctx.forceStaticLowPower) return 'lowPowerStatic';
  if (ctx.activeError) return 'errorGlitch';
  if (ctx.isDragging) return 'dragging';
  if (ctx.activeWorkshopTask?.taskType === 'update') return 'updateInstalling';
  if (ctx.activeWorkshopTask) return 'repairing';
  if (ctx.isOverheated) return 'temperatureCheck';
  if (ctx.isMemoryCrowded) return 'memoryCrowded';
  if (ctx.isSleeping || ctx.userInactiveMs >= 15 * 60 * 1000) return 'sleep';
  if (ctx.isHovering) return 'hover';
  if (ctx.isCpuVeryLow && ctx.userInactiveMs >= 30_000) return 'dataSorting';
  return 'idle';
}
```

---

## 7. 状态转移矩阵

```text
bootWake -> idle
idle <-> hover
hover -> click -> resolveBaseState()
idle/hover -> dragging -> dropLanding -> resolveBaseState()
idle/hover -> panelOpen -> hover/idle + panelVisible
panelVisible -> panelClose -> resolveBaseState()
any non-critical -> temperatureCheck when temp high
any non-critical -> memoryCrowded when ram high and temp normal
any non-critical -> repairing when workshop task active
repairing -> celebrate when task success
repairing -> errorGlitch when task failed
any -> lowPowerStatic when fullscreen game detected
lowPowerStatic -> resolveBaseState() when foreground normalized
sleep -> resolveBaseState() when user active
```

---

## 8. 中断规则

### 8.1 可以立刻打断

以下事件必须快速打断当前状态：

| 事件 | 目标状态 |
|---|---|
| `DRAG_START` | `dragging` |
| `FULLSCREEN_GAME_DETECTED` | `lowPowerStatic` |
| `WORKSHOP_TASK_FAILED` | `errorGlitch` |
| `LOW_POWER_ON` | `sleep` 或 `lowPowerStatic` |

### 8.2 不应立刻打断

以下状态播放时，低优先级事件需要排队或忽略：

| 当前状态 | 低优先级事件处理 |
|---|---|
| `click` | Hover move 只更新目标，不切状态 |
| `celebrate` | 普通硬件波动暂存，庆典结束后再 resolve |
| `panelOpen` | 不允许被 hover 抢占 |
| `dropLanding` | 不允许被 dataSorting 抢占 |

---

## 9. 过渡融合规则

所有状态切换必须通过 `AnimationMixer` 完成。

```ts
export interface StateTransitionOptions {
  from: CoreCatAnimationState;
  to: CoreCatAnimationState;
  blendMs: number;
  easing: EasingName;
  preserveCurrentPose: boolean;
}
```

### 9.1 默认融合时间

| 切换类型 | 融合时间 |
|---|---:|
| Idle -> Hover | `120ms` |
| Hover -> Idle | `160ms` |
| Idle/Hover -> Click | `0-40ms` 快速进入，但必须读取当前 pose |
| Click -> Base | `160ms` |
| Any -> TemperatureCheck | `160ms` |
| Any -> MemoryCrowded | `160ms` |
| Any -> Repairing | `200ms` |
| Repairing -> Celebrate | `80ms` |
| Celebrate -> Idle/Base | `240ms` |
| Any -> Sleep | `600ms` |
| Sleep -> Base | `380ms` |
| Any -> LowPowerStatic | `100ms` |

### 9.2 关键要求

1. 进入新状态前，必须读取当前每个骨骼的 transform matrix。
2. 在 `blendMs` 内从当前 pose LERP 到新状态第一帧。
3. 不允许直接清空 style 或重置 class 导致跳帧。
4. VFX 出入场必须独立淡入淡出，不要和骨骼 transform 绑死。

---

## 10. 状态机实现建议

```ts
export class CoreCatStateMachine {
  private state: CoreCatAnimationState = 'bootWake';
  private ctx: CoreCatContext;
  private queue: CoreCatEvent[] = [];

  dispatch(event: CoreCatEvent) {
    this.reduceContext(event);
    const next = this.resolveNextState(event);
    if (next && next !== this.state) {
      this.transitionTo(next, this.getBlendMs(this.state, next));
    }
  }

  private resolveNextState(event: CoreCatEvent): CoreCatAnimationState | null {
    switch (event.type) {
      case 'APP_BOOTED': return 'bootWake';
      case 'PET_CLICK': return this.canInterrupt('click') ? 'click' : null;
      case 'DRAG_START': return 'dragging';
      case 'DRAG_END': return 'dropLanding';
      case 'PANEL_OPEN_REQUEST': return 'panelOpen';
      case 'PANEL_CLOSE_REQUEST': return 'panelClose';
      case 'WORKSHOP_TASK_SUCCESS': return 'celebrate';
      case 'WORKSHOP_TASK_FAILED': return 'errorGlitch';
      case 'ACHIEVEMENT_UNLOCKED': return 'achievementPop';
      case 'ANIMATION_FINISHED': return resolveBaseState(this.ctx);
      default: return resolveBaseState(this.ctx);
    }
  }
}
```

---

## 11. VFX 状态绑定

| 状态 | VFX | 生命周期 |
|---|---|---|
| `hover` | goggles shimmer | 进入瞬间播放一次 |
| `click` | pixel stars | 扳手最高点触发一次 |
| `temperatureCheck` | cooling wind / blue particles / COOLING text | 状态持续时循环 |
| `memoryCrowded` | RAM orange glow / steam burst | 状态持续时循环 |
| `repairing` | sparks / hologram panel | 状态持续时循环 |
| `dataSorting` | data cubes / pouch glow | 状态持续时循环 |
| `sleep` | sleep bubble | 状态持续时循环 |
| `celebrate` | golden steam ring / star burst | 一次性 |
| `errorGlitch` | goggles chromatic glitch | 短循环，不超过 3s |

---

## 12. UI 面板联动状态

### 12.1 Quick Panel 打开

`PANEL_OPEN_REQUEST` 触发 `panelOpen`。动画完成后：

```ts
ctx.panelVisible = true;
state = resolveBaseState(ctx); // 通常是 hover 或 idle
```

面板本身从 `pouch` 锚点生长出来：

```text
scale: 0.1 -> 1.04 -> 1.0
opacity: 0 -> 1
x/y: pouch anchor -> final panel position
curve: cubic-bezier(0.34, 1.56, 0.64, 1)
duration: 180-260ms
```

### 12.2 Quick Panel 关闭

`PANEL_CLOSE_REQUEST` 触发 `panelClose`。动画完成后：

```ts
ctx.panelVisible = false;
state = resolveBaseState(ctx);
```

---

## 13. 验收清单

Codex 完成后必须逐项验证：

- [ ] `idle` 状态下 5 秒内有身体、尾巴、耳朵、眼睛任意 2 类以上微动。
- [ ] `hover` 状态眼睛位移大于头部位移，护目镜有视差。
- [ ] `click` 有 0-50ms 压缩、51-140ms 反弹、141-300ms 阻尼回弹。
- [ ] 高温超过阈值后进入 `temperatureCheck`，退出有 hysteresis，不能抖动切换。
- [ ] 内存超过阈值后进入 `memoryCrowded`，低于退出阈值并稳定后退出。
- [ ] 工坊任务期间进入 `repairing`，成功后播放 `celebrate`。
- [ ] `sleep` 状态关闭高频 VFX，只保留慢呼吸和呼噜泡泡。
- [ ] 任意状态切换没有瞬间跳帧、闪烁、断层。
- [ ] 全屏游戏检测后进入 `lowPowerStatic`。
- [ ] 常驻状态只使用 transform/opacity，不触发 reflow。

---

## 14. Codex 执行提示词

```markdown
请读取 `/docs/animation/CoreCat_状态机规范.md`，实现 CoreCat 动画状态机。

开发要求：
1. 创建 `animationStateMachine.ts`，实现 CoreCatAnimationState、CoreCatEvent、CoreCatContext。
2. 实现状态优先级、一次性状态、持续状态、状态中断规则。
3. 实现 `resolveBaseState(ctx)`，确保一次性动作结束后回到正确状态，而不是固定回 idle。
4. 实现硬件 hysteresis：温度进入 75°C、退出 70°C 且稳定 5 秒；内存进入 85%、退出 78% 且稳定 5 秒。
5. 实现状态切换的 `blendMs` 配置，调用 AnimationMixer，不允许直接切 CSS class。
6. 补充单元测试，覆盖：点击、拖拽、高温、内存、工坊任务、休眠、全屏低功耗。
7. 完成后输出修改文件清单和如何手动验证每个状态。
```
