# CoreCat Codex 分轮实施提示词 - 第 1 轮

> 使用方式：将本文件内容整体复制给 Codex。执行前确保项目根目录已有 `AGENTS.md`，并且 `/docs/animation/` 下已有 CoreCat 动画规范文档。
>
> 执行原则：每次只喂一轮，等 Codex 完成、运行检查并反馈后，再喂下一轮。

---

# 第 1 轮：VFX Bus + 核心高级状态 VFX + Debug Panel

## Codex 提示词

```markdown
请继续开发 CoreCat 动画系统。根据你上次反馈，当前动画运行时 MVP 已完成，但文档要求的 VFX Bus、完整硬件状态 VFX、差异化 transition、调试验收入口尚未完成。

本轮目标：补齐 CoreCat 游戏级 VFX 表现层与手动验收入口。

请先阅读以下文件：

1. `/docs/animation/CoreCat_素材分层规范.md`
2. `/docs/animation/CoreCat_骨骼动画规范.md`
3. `/docs/animation/CoreCat_状态机规范.md`
4. `/docs/animation/CoreCat_Codex_骨骼动画运行时完整开发文档.md`

同时检查当前已实现文件：

1. `src/pet/corecat/CoreCat.tsx`
2. `src/pet/corecat/animation/skeletonNodes.ts`
3. `src/pet/corecat/animation/animationRuntime.ts`
4. `src/pet/corecat/animation/animationStateMachine.ts`
5. `src/pet/corecat/animation/animationMixer.ts`
6. `src/services/catStateRules.ts`
7. `src/styles/core-ui.css`
8. `src/ui/RollingValue.tsx`

本轮不要重构已经通过测试的基础运行时。请在现有架构上增量实现。

---

# 一、本轮必须完成的内容

## 1. 实现 VFX Bus / VFX Runtime

请新增或完善 CoreCat 专属 VFX 系统，建议目录如下：

```text
src/pet/corecat/vfx/
  vfxTypes.ts
  vfxBus.ts
  vfxRuntime.ts
  CoreCatVfxLayer.tsx
  effects/
    ClickStars.tsx
    CoolingWind.tsx
    CoolingParticles.tsx
    CoolingText.tsx
    MemoryRamBox.tsx
    MemorySteam.tsx
    RepairSparks.tsx
    HologramPanel.tsx
    DataCubes.tsx
    CelebrateBurst.tsx
```

要求：

1. VFX 必须和 CoreCat 状态机解耦。
2. 状态机只负责告诉 VFX Bus 当前状态或触发一次性事件。
3. VFX 层负责渲染粒子、冷气、蒸汽、火花、数据方块、庆典效果。
4. VFX 必须挂载到 CoreCat 的 `vfx_anchor` 或对应局部节点附近。
5. 禁止全屏 Canvas 大面积重绘。
6. 优先使用 DOM/CSS transform 实现小粒子。
7. 如使用 Canvas，只能使用局部小 Canvas，并在对应状态退出时销毁或暂停。
8. 常驻 VFX 必须可暂停。
9. Sleep / LowPower 状态必须关闭所有高频 VFX，只保留 sleep bubble。

---

## 2. TemperatureCheck 完整 VFX

当状态为 `TemperatureCheck` 时，必须补齐以下表现：

### 骨骼动作强化

1. CoreCat 整体 X 轴高频微抖：
   - 频率约 15Hz
   - 振幅 ±0.8px
   - 只作用在角色局部容器，不能导致布局重排

2. `arm_right_wrench` 切换为冷却扇/气泵语义表现：
   - 如果当前没有正式素材，用 CSS/SVG 占位扇叶
   - 以 80ms 周期在 -15deg 到 +35deg 间快速往复

3. `head_base` 后缩并微抬：
   - translateY -1px
   - rotate -2deg 到 -4deg 之间

### VFX

必须实现：

1. `CoolingWind`
   - 从右手方向发出 3 条半透明青色风带
   - 风带应弯曲或呈流线形
   - 循环周期 600ms - 900ms
   - 状态退出时淡出

2. `CoolingParticles`
   - 身体周围向上漂浮蓝色冷光像素点
   - 密度约 12 颗/秒
   - 寿命约 600ms
   - 有轻微随机左右漂移
   - 不能无限累积 DOM 节点

3. `CoolingText`
   - 护目镜区域显示 10px 像素风 “COOLING...”
   - 使用跑马灯或闪烁循环
   - 状态退出时隐藏

---

## 3. MemoryCrowded 完整 VFX

当状态为 `MemoryCrowded` 时，必须补齐以下表现：

### 骨骼动作强化

1. CoreCat 整体下蹲 4px。
2. body_base 横向 scaleX 1.05。
3. 双臂向上托举姿态。
4. 双臂和 RAM 箱同步 25Hz 微颤，振幅约 0.5px。
5. legs 或 body 底部每 3000ms 偶发一次站不稳滑步。

### VFX / 道具

必须实现：

1. `MemoryRamBox`
   - 在双手上方显示一个巨大 RAM 零件箱
   - 如果没有正式素材，使用精致 SVG/CSS 占位
   - 外框橙红色警告呼吸光
   - 轻微上下抖动
   - 与双臂托举位置一致

2. `MemorySteam`
   - 每隔 800ms 从 RAM 箱边缘喷出短暂白色像素蒸汽
   - 持续约 200ms 后消散
   - 蒸汽方向可随机左右偏移
   - 状态退出时清空

---

## 4. Repairing 完整 VFX

当状态为 `Repairing` 时，必须补齐以下表现：

### 骨骼动作强化

1. body_base 侧身或向左扭转视觉：
   - rotate -4deg 到 -8deg
   - translateX -2px
2. `arm_right_wrench` 以 160ms 周期上下敲击：
   - 上举 +45deg
   - 下落 -20deg
   - 敲击帧必须触发 spark 事件
3. legs 每 320ms 做脚尖点地节奏动作。

### VFX

必须实现：

1. `RepairSparks`
   - 在扳手敲击帧触发
   - 每次 4 颗明黄色像素火花
   - 带初速度、弹跳、重力下坠和透明度衰减
   - 不允许无限累积节点

2. `HologramPanel`
   - CoreCat 面前显示半透明蓝色全息光幕
   - 使用 glassmorphism 质感
   - 透明度约 0.6
   - 内部有伪代码字符流上下滚动
   - 不能遮挡 CoreCat 主体
   - 状态退出时 160ms 淡出

---

## 5. DataSorting 完整 VFX

当状态为 `DataSorting` 时，必须补齐以下表现：

### 骨骼动作强化

1. body_base 保持 Idle 柔和呼吸。
2. arm_right_wrench 改为“虚空划拉”动作。
3. 右臂轨迹使用平滑贝塞尔或近似曲线路径。
4. eyes 跟随右手轨迹轻微移动。

### VFX

必须实现：

1. `DataCubes`
   - 在 CoreCat 身体右侧约 20px 处生成 8x8 像素数据方块
   - 颜色以淡蓝、淡绿为主
   - 方块规律浮现
   - 手臂划过附近时，方块向工具包 `pouch` 收缩并淡出
   - pouch 节点亮起一瞬青色外发光
   - 状态退出时所有数据方块清空

---

## 6. Celebrate 完整一次性庆典

当状态为 `Celebrate` 时，必须从简化 pose 升级为完整 1800ms 一次性动作。

### 时间轴

请实现近似时间轴：

```text
0ms - 200ms：
猫咪前摇下蹲，body_base 轻微压缩，准备抛扳手。

200ms - 550ms：
arm_right_wrench 把扳手抛向上方，扳手离手旋转。
如果没有独立扳手飞行素材，可使用独立 DOM/SVG wrench clone。

550ms - 1000ms：
CoreCat 原地欢快旋转或做可接受的伪旋转表现。
注意不要破坏小桌宠形态。

1000ms - 1250ms：
接住扳手，goggles 快速下滑盖住眼睛。

1250ms - 1600ms：
脚底爆开金色像素蒸汽烟雾环与星点。

1600ms - 1800ms：
摆出单手撑腰英雄 Pose，然后淡出回 Idle。
```

### VFX

必须实现：

1. `CelebrateBurst`
   - 脚底金色星点环形爆发
   - 局部蒸汽烟雾环
   - 星点向外扩散后淡出
   - 总时长不超过 1200ms

2. Celebrate 是一次性动作：
   - 播放结束后必须回到 Idle 或基于硬件规则选择合适基础状态
   - 不允许卡在 Celebrate

---

## 7. 差异化 Transition 配置

当前 transition 大多统一 160ms，请补齐差异化配置。

建议新增：

```ts
export const CORECAT_TRANSITIONS = {
  Idle_to_Hover: 120,
  Hover_to_Idle: 180,
  Any_to_Click: 40,
  Click_to_Idle: 160,
  Any_to_TemperatureCheck: 160,
  TemperatureCheck_to_Idle: 240,
  Any_to_MemoryCrowded: 180,
  MemoryCrowded_to_Idle: 240,
  Any_to_Repairing: 200,
  Repairing_to_Idle: 240,
  Any_to_DataSorting: 180,
  DataSorting_to_Idle: 180,
  Any_to_Sleep: 600,
  Sleep_to_Idle: 420,
  Any_to_Celebrate: 80,
  Celebrate_to_Idle: 240
}
```

要求：

1. animationMixer 应使用该配置。
2. Sleep 进入必须慢，不允许突然蜷缩。
3. Celebrate 进入要快，退出要有松弛。
4. 高优先级警报状态进入不能拖太久。
5. 所有状态切换不得出现 transform 瞬移。

---

## 8. Debug 手动状态验收入口

请新增一个仅开发环境可见的 CoreCat Debug Panel。

建议位置：

```text
src/pet/corecat/debug/CoreCatDebugPanel.tsx
```

要求：

1. 仅在开发环境显示。
2. 可手动触发所有状态：
   - Idle
   - Hover
   - Click
   - TemperatureCheck
   - MemoryCrowded
   - Repairing
   - DataSorting
   - Sleep
   - Celebrate
   - BootWake
   - Dragging
   - DropLanding
   - PanelOpen
   - PanelClose
   - ErrorGlitch
   - UpdateInstalling
   - AchievementPop
3. 当前未完整实现的状态按钮可显示为 disabled 或 experimental。
4. 显示当前状态、上一状态、transition 时长、VFX 数量、是否 LowPower。
5. 提供开关：
   - Pause VFX
   - Force LowPower
   - Show Skeleton Bounds
   - Show VFX Anchors
6. 不得影响生产环境构建。

---

# 二、本轮不要做的内容

本轮不要做：

1. 不要接入 Spine / Live2D / Rive。
2. 不要替换最终美术资产。
3. 不要制作安装包。
4. 不要大改主 UI。
5. 不要重写硬件监控 Rust 逻辑。
6. 不要破坏已有通过的 typecheck、test:corecat、build。
7. 不要把所有动画塞进一个巨型组件。
8. 不要使用全屏 Canvas 重绘整个桌宠。
9. 不要引入大型动画库，除非先说明必要性。

---

# 三、代码质量要求

1. 所有新增 TypeScript 类型必须明确。
2. VFX 事件必须可清理，避免内存泄漏。
3. 状态退出时必须销毁或暂停对应 VFX。
4. 常驻动画只能使用 transform / opacity 等 GPU 友好属性。
5. 尽量减少 React 频繁 setState。
6. 高频动画不要导致整个 CoreCat 组件重渲染。
7. 新增测试覆盖：
   - VFX Bus 事件触发
   - transition duration 选择
   - Celebrate 自动结束
   - Sleep 会关闭高频 VFX
   - TemperatureCheck 会触发 Cooling VFX
   - MemoryCrowded 会触发 RAM Box / Steam VFX
8. 最后运行：
   - `corepack pnpm typecheck`
   - `corepack pnpm test:corecat`
   - `corepack pnpm build`

---

# 四、完成后请输出

请完成后输出：

1. 本轮创建/修改的文件清单。
2. 每个高级状态对应完成了哪些骨骼动作和 VFX。
3. Debug Panel 如何打开和使用。
4. 哪些状态仍是 experimental。
5. 测试命令结果。
6. 是否存在性能风险。
7. 下一轮建议。

请严格按文档要求实现，不要只做简化 pose。本轮的核心目标是让 CoreCat 从“能动”升级为“有游戏级特效表现”。
```

---
