# CoreCat Codex 骨骼动画运行时完整开发文档

> 适用项目：CoreWorkPal / CoreCat 桌面宠物  
> 技术栈目标：Tauri + React + TypeScript + CSS Transform + Web Animations API + 局部 Canvas VFX  
> 文档用途：直接交给 Codex 执行，用于实现 CoreCat 轻量伪骨骼动画系统、状态机、VFX、UI 联动和性能验收。  
> 核心原则：Codex 负责“动画运行时、状态切换、关键帧、VFX 和工程集成”；专业骨骼软件不是第一阶段刚需。第一阶段不要接入 Spine / Live2D / Rive，避免工程复杂度失控。

---

## 0. 给 Codex 的最终目标说明

请在现有 CoreWorkPal / CoreCat Tauri 项目中，实现一个**轻量级 2D 伪骨骼动画运行时**。该运行时不依赖 Spine、Live2D、Rive 等外部骨骼编辑器，而是基于分层 PNG / SVG 图层、CSS `transform`、Web Animations API、`requestAnimationFrame`、局部 Canvas 粒子和 TypeScript 状态机，实现接近 Live2D / Spine 观感的桌面宠物动画。

最终效果必须符合 CoreCat 设定：

1. CoreCat 是一只**精致、小巧、高级、游戏级质感的工程师猫桌宠**。
2. 默认状态下绝不能像静态贴纸，必须有持续但不打扰用户的异步生命感微动。
3. 鼠标靠近时，头部、眼神、护目镜要产生“看向用户”的磁吸追踪。
4. 点击时要有 Squish & Stretch 物理肉感，包含压缩、反弹、阻尼回弹、扳手转动和微型星星。
5. CPU / GPU 温度高时要进入滑稽但可爱的冷却危机动画。
6. 内存高占用时要进入“托举巨大 RAM 箱”的受压颤抖动画。
7. 后台修复 / 清理时要进入可靠的工程师工作状态，包含扳手敲击、火花和全息屏幕。
8. 低负载时要进入数据整理动画，包含数据方块、手臂划拉和工具包吸入反馈。
9. 低功耗 / 休眠时要蜷缩、深呼吸、护目镜推上额头、睡泡同步呼吸。
10. 清理成功 / 升级成功时要播放一次性庆典动作，然后平滑回到 Idle。

---

## 1. 严格范围边界

### 1.1 本阶段必须做

- 建立 CoreCat 分层渲染组件。
- 建立轻量伪骨骼节点树。
- 建立动画状态机 FSM。
- 建立动画混合器 Animation Mixer。
- 建立关键帧配置系统。
- 实现 Idle / Hover / Click / TemperatureCheck / MemoryCrowded / Repairing / DataSorting / Sleep / Celebrate。
- 实现 BootWake / Dragging / DropLanding / PanelOpen / PanelClose / ErrorGlitch / UpdateInstalling / AchievementPop 等桌宠补充动作。
- 实现局部 VFX：星星、冷气、蒸汽、火花、数据方块、睡泡、全息屏幕、护目镜流光。
- 实现 UI 面板与猫咪动作联动。
- 接入现有硬件监控数据或预留模拟数据适配层。
- 保证常驻状态性能低、不卡顿、不重绘整屏。

### 1.2 本阶段不要做

- 不要接入 Spine Runtime。
- 不要接入 Live2D Cubism。
- 不要接入 Rive Runtime。
- 不要重构整个 Tauri 项目。
- 不要改动已有窗口基础架构，除非为了挂载 CoreCat 动画必须小范围调整。
- 不要把 CoreCat 做成一张单图轮播。
- 不要使用大面积整屏 Canvas 每帧刷新。
- 不要用大量 box-shadow / filter 做常驻动画，避免 GPU / CPU 占用异常。
- 不要做占据桌面大面积的 UI。CoreCat 必须是精致小巧的 mini 桌宠。

---

## 2. Codex 一次性总提示词

下面这段可以直接复制给 Codex 作为本轮开发的总提示词。

```markdown
你现在继续开发现有 CoreWorkPal / CoreCat Tauri 项目。请不要重建项目，不要接入 Spine / Live2D / Rive，不要做普通静态图片轮播。请基于现有 Tauri + React + TypeScript 项目，实现 CoreCat 轻量级伪骨骼动画运行时。

## 开发目标

实现一个可运行、可扩展、低性能开销的 CoreCat 动画系统。CoreCat 是精致小巧的工程师猫桌宠，目标观感接近 Live2D / Spine 游戏角色，但第一阶段使用 Web 技术实现：分层 PNG/SVG + CSS transform + Web Animations API + requestAnimationFrame + 局部 Canvas VFX。

## 必须遵守的美术与动效原则

1. CoreCat 默认状态不能是静态贴纸。身体、头、尾巴、耳朵、眼睛、阴影必须异步微动。
2. 所有动作必须有物理感：前摇、压缩、拉伸、超调、阻尼回弹。
3. 状态切换必须平滑，严禁瞬间切帧、闪烁、瞬移、图层断裂。
4. 鼠标靠近时必须有头部、眼睛、护目镜视差追踪。
5. 点击时必须有 0-50ms 压缩、51-140ms 反弹、141-300ms 阻尼回弹、扳手旋转和星星 VFX。
6. 高温状态必须有冷却危机感：抖动、扇子高速挥动、冷气风带、蓝色粒子、护目镜 COOLING 跑马灯。
7. 内存拥挤状态必须有重物压迫感：下蹲、托举 RAM 箱、25Hz 微颤、橙红警告光、蒸汽喷射。
8. 修复状态必须有工程师工作感：侧身、扳手敲击、火花、脚尖打拍子、全息屏幕。
9. 数据整理状态必须有低负载家务感：右手贝塞尔轨迹划拉、数据方块生成、吸入工具包、腰包闪光。
10. 休眠状态必须治愈低功耗：蜷缩、护目镜上推、慢呼吸、睡泡同步缩放。
11. 庆典状态必须是一段 1800ms 一次性高潮动作，播放完成后 240ms 平滑回 Idle。

## 工程目标

请创建或补齐以下结构，具体路径可根据现有项目微调，但必须保持清晰：

src/pet/corecat/
  CoreCat.tsx
  CoreCatLayer.tsx
  CoreCatVfxStage.tsx
  corecat.css
  animation/
    types.ts
    constants.ts
    curves.ts
    bones.ts
    keyframes.ts
    animationMixer.ts
    animationStateMachine.ts
    useCoreCatAnimation.ts
    usePointerTracking.ts
    useReducedMotion.ts
  states/
    idle.ts
    hover.ts
    click.ts
    temperatureCheck.ts
    memoryCrowded.ts
    repairing.ts
    dataSorting.ts
    sleep.ts
    celebrate.ts
    bootWake.ts
    dragging.ts
    dropLanding.ts
    panelOpen.ts
    panelClose.ts
    errorGlitch.ts
    updateInstalling.ts
    achievementPop.ts
  vfx/
    vfxTypes.ts
    vfxBus.ts
    SparkParticles.tsx
    CoolingWind.tsx
    DataCubes.tsx
    SteamBurst.tsx
    SleepBubble.tsx
    HologramPanel.tsx
    GoggleShimmer.tsx
  assets/
    README.md

## 资产要求

如果真实 CoreCat 分层素材还不存在，请先创建可替换的占位图层组件，不要阻塞开发。占位图层必须用清晰的 DOM/SVG/渐变块表示不同部件，并在 assets/README.md 中列出最终美术需要交付的文件：

- shadow.png
- tail_base.png
- body_base.png
- arm_left.png
- arm_right_wrench.png
- arm_right_fan.png
- head_base.png
- ears_left.png
- ears_right.png
- goggles.png
- eye_normal.png
- eye_blink.png
- eye_focused.png
- eye_dizzy.png
- eye_sleepy.png
- eye_glowing.png
- ram_box.png
- sweat_drop.png
- sleep_bubble.png

## 必须实现的动画状态

1. Idle：常驻异步静息。
2. Hover：鼠标磁吸视线追踪。
3. Click：鼠标点击受力回弹。
4. TemperatureCheck：CPU/GPU 高温警报。
5. MemoryCrowded：内存吃紧重物压迫。
6. Repairing：工坊模块后台修复中。
7. DataSorting：低负载日常扫描整理。
8. Sleep / LowPower：休眠 / 低功耗挂机。
9. Celebrate：指标回落 / 升级成功庆典。
10. BootWake：应用启动唤醒。
11. Dragging：用户拖拽桌宠。
12. DropLanding：拖拽释放落地回弹。
13. PanelOpen：随身工具包面板展开。
14. PanelClose：随身工具包面板收起。
15. ErrorGlitch：异常警告。
16. UpdateInstalling：模块安装更新中。
17. AchievementPop：成就奖励弹出。

## 动画系统要求

1. 每个骨骼节点必须是独立可变换对象，至少支持 x、y、scaleX、scaleY、rotation、opacity、skewX、skewY。
2. AnimationMixer 必须支持：
   - sampleState(state, time, context)
   - blendPose(fromPose, toPose, weight)
   - applyPose(pose)
   - oneShot 动画播放完成回调
3. 状态切换必须支持 160ms LERP 混合，Celebrate 回 Idle 使用 240ms Ease-In-Out。
4. 高优先级状态必须打断低优先级状态。
5. Click、Celebrate、AchievementPop 是一次性动作；Idle、Hover、TemperatureCheck、MemoryCrowded、Repairing、DataSorting、Sleep 是可循环状态。
6. 对 prefers-reduced-motion 用户提供降级模式。
7. 页面不可见或系统高负载时进入低频模式。

## 状态优先级

从高到低：
ErrorGlitch > Dragging > DropLanding > Click > Celebrate > TemperatureCheck > MemoryCrowded > Repairing > UpdateInstalling > PanelOpen/PanelClose > Hover > DataSorting > Sleep > Idle

注意：Sleep 不是永远高优先级，用户交互应唤醒 Sleep。

## 硬件触发规则

请建立 HardwareToPetStateAdapter，输入已有硬件监控数据或模拟数据：

- cpuTemp >= 75 或 gpuTemp >= 75 -> TemperatureCheck
- memoryUsagePercent >= 85 -> MemoryCrowded
- repairTaskRunning === true -> Repairing
- updateInstalling === true -> UpdateInstalling
- cpuUsage < 10 且 memoryUsagePercent < 70 且用户空闲 -> DataSorting
- 用户无操作 >= 15 分钟或 lowPowerMode === true -> Sleep
- 清理成功 / 修复成功 / 升级成功 -> Celebrate
- 发生错误 -> ErrorGlitch

如果项目暂时没有真实温度或 GPU 数据，不要阻塞。先提供 mock adapter 和 TODO 注释，并保证以后替换数据源即可。

## 性能要求

1. 常驻微动必须使用 transform: translate3d() / scale() / rotate()，严禁触发 layout/reflow。
2. 不要使用全屏 Canvas 重绘整只猫。
3. VFX 必须局部挂载在 CoreCat 附近。
4. 常驻 Idle 在普通机器上应尽量接近 0-1% CPU。
5. 页面不可见、窗口最小化、系统忙碌时降低动画帧率或暂停高频 VFX。
6. 对所有动画 DOM 节点添加 will-change: transform，但不要滥用到大面积容器。

## 验收要求

开发完成后请运行项目已有的 lint / typecheck / test / build 命令。如果项目没有这些命令，请说明未运行原因。最后请输出：

1. 修改 / 新增文件列表。
2. 已实现动画状态列表。
3. 每个状态如何触发。
4. 性能策略说明。
5. 仍需美术替换的资产清单。
6. 手动验收步骤。
7. 未完成项和风险。
```

---

## 3. 推荐实施策略

不要让 Codex 一次性把所有效果写满。建议按以下阶段执行。每一阶段都要让 Codex 提交清晰汇报，再继续下一阶段。

### Phase A：动画运行时骨架

目标：先把系统搭出来，不追求全部视觉细节。

交付物：

- CoreCat 根组件。
- CoreCatLayer 图层组件。
- 骨骼类型定义。
- Pose / BoneTransform 类型。
- AnimationMixer。
- AnimationStateMachine。
- Idle / Hover / Click / Sleep 四个状态。
- 占位资产层。

Codex 提示词：

```markdown
请先实现 CoreCat 轻量伪骨骼动画运行时的 Phase A。不要一次做完所有状态，先做系统骨架和四个基础状态：Idle、Hover、Click、Sleep。

具体要求：
1. 新建 src/pet/corecat 相关目录。
2. 建立 CoreCat.tsx，能够在现有桌宠窗口中挂载。
3. 建立 CoreCatLayer.tsx，每个图层接收 BoneTransform 并转成 transform style。
4. 建立 types.ts，定义 CoreCatState、BoneName、BoneTransform、Pose、AnimationContext、AnimationDefinition。
5. 建立 animationMixer.ts，支持 sample、blend、apply 的基础逻辑。
6. 建立 animationStateMachine.ts，支持状态优先级、一次性动作、循环动作、160ms LERP 切换。
7. 使用占位 DOM/SVG 图层绘制 CoreCat，不要等待真实 PNG 素材。
8. 实现 Idle：身体呼吸、头部延迟、尾巴异步摆动、随机眨眼、阴影透明度联动。
9. 实现 Hover：鼠标进入 60px 范围后，头部、眼睛、护目镜向鼠标平滑偏移。
10. 实现 Click：0-50ms 压缩，51-140ms 反弹，141-300ms 三次阻尼回弹，扳手 360 度旋转，触发星星 VFX 事件。
11. 实现 Sleep：蜷缩姿态、护目镜上推、慢呼吸、睡泡占位。
12. 加入 prefers-reduced-motion 降级逻辑。
13. 完成后运行 typecheck / lint / build，输出修改文件和测试结果。

验收重点：默认状态 5 秒内必须看到身体、尾巴、眨眼或耳朵至少一种微动；Hover 不能突变；Click 必须有弹性；Sleep 必须明显区别 Idle。
```

### Phase B：核心状态补齐

目标：补上硬件状态动画。

交付物：

- TemperatureCheck。
- MemoryCrowded。
- Repairing。
- DataSorting。
- Celebrate。
- 硬件状态适配器。

Codex 提示词：

```markdown
请继续实现 CoreCat 动画系统 Phase B：补齐硬件驱动核心状态。保持 Phase A 的架构，不要重写已完成代码。

必须新增状态：
1. TemperatureCheck
2. MemoryCrowded
3. Repairing
4. DataSorting
5. Celebrate

具体要求：

TemperatureCheck：
- 触发条件：cpuTemp >= 75 或 gpuTemp >= 75。
- 整体 X 轴 15Hz 高频微抖，振幅 ±0.8px。
- 右手扳手切换为 fan / pump 占位图层。
- arm_right_fan 以 80ms 周期在 -15deg 到 +35deg 快速往复。
- head_base 后缩 2px、上抬 1px、rotation -1deg。
- eyes 使用 focused / sweating 表情。
- 触发 CoolingWind、ColdPixels、GoggleCoolingText VFX。

MemoryCrowded：
- 触发条件：memoryUsagePercent >= 85。
- body_base 下蹲 4px，scaleX 1.05，scaleY 0.96。
- 双手上举托举 ram_box。
- ram_box 和 arms 25Hz 垂直微颤，幅度 0.5px。
- eyes 使用 dizzy。
- 每 800ms 触发一次 SteamBurst。
- ram_box 外框橙红警告呼吸。

Repairing：
- 触发条件：repairTaskRunning === true。
- body 整体侧身感：x -2px，rotation -3deg，scaleX 0.96。
- arm_right_wrench 每 160ms 敲击循环，+45deg 到 -20deg。
- 每次敲击命中帧触发 SparkParticles。
- legs 每 320ms 脚尖打拍子。
- 显示 HologramPanel，包含伪代码字符流。

DataSorting：
- 触发条件：低负载且用户空闲。
- 维持 Idle 呼吸。
- 右手沿贝塞尔路径划拉。
- 生成 8x8 像素数据方块。
- 手臂划过数据方块时，数据方块缩小并吸入 pouch，pouch 闪一下青色光。

Celebrate：
- 触发条件：清理成功、修复成功、升级成功。
- 一次性 1800ms 动画。
- 扳手抛起、身体旋转/摆动、接住扳手、护目镜拉下、脚底金色蒸汽星环、英雄 Pose。
- 播放完成后 240ms Ease-In-Out 回 Idle。

同时实现 HardwareToPetStateAdapter：
- 支持真实硬件数据输入。
- 如果现有项目没有真实温度数据，用 mock 数据和 TODO，不要阻塞。
- 提供 debug 面板或开发开关，允许手动触发每个状态用于验收。

完成后运行 typecheck / lint / build，并输出每个状态的触发方法和验收步骤。
```

### Phase C：桌宠交互补充动作

目标：让桌宠像真实桌面生物，而不只是监控图标。

交付物：

- BootWake。
- Dragging。
- DropLanding。
- PanelOpen。
- PanelClose。
- ErrorGlitch。
- UpdateInstalling。
- AchievementPop。

Codex 提示词：

```markdown
请继续实现 CoreCat 动画系统 Phase C：桌宠交互补充动作。保持已有架构，不要重写 Phase A/B。

新增状态与要求：

BootWake：
- 应用启动或桌宠窗口创建后播放一次。
- 0-300ms 从 scale 0.85、opacity 0、y 8px 渐入。
- 300-700ms 睁眼、耳朵抖动、尾巴轻甩。
- 700-1000ms 护目镜闪一下，回到 Idle。

Dragging：
- 用户拖拽桌宠时触发。
- 整体根据拖拽速度产生倾斜，最大 rotation ±8deg。
- 尾巴与耳朵产生反向惯性拖尾。
- eyes 看向拖拽方向。
- 阴影拉长并降低透明度。

DropLanding：
- 拖拽释放后触发。
- 0-80ms 落地压缩：scaleY 0.9、scaleX 1.06、y 5px。
- 80-220ms 弹起回归：scaleY 1.04、scaleX 0.98、y -2px。
- 220-420ms 阻尼回弹。
- 触发小尘埃粒子，不要夸张。

PanelOpen：
- 用户打开随身工具包 Quick Panel 时触发。
- 右手先做掏出诊断平板动作。
- 面板从 pouch 锚点以 cubic-bezier(0.34, 1.56, 0.64, 1) 展开，耗时 180ms。
- 面板必须像从工具包中被猫拉出来，不允许普通网页弹窗感。

PanelClose：
- 面板收起时触发。
- 面板先缩回 pouch，猫右手轻拍工具包。
- pouch 闪一下微弱青光。

ErrorGlitch：
- 错误、硬件读取失败、模块异常时触发。
- 护目镜出现 2-3 次短促横向 glitch 扫描线。
- 耳朵紧张后折，尾巴僵直。
- eyes 使用 focused 或 warning 变体。
- 该状态优先级最高，但不要持续无限循环；默认 1200ms 后回到前一稳定状态。

UpdateInstalling：
- 模块安装或更新时触发。
- 猫拿着小芯片或能量块，面前有环形进度微光。
- 动作比 Repairing 更平稳，强调精密安装。
- 支持 progress 0-100 输入，影响环形进度 VFX。

AchievementPop：
- 成就、奖励、小目标达成时触发。
- 猫眼睛发光、尾巴翘起、头顶弹出小徽章。
- 总长 900ms，一次性，不能打断 Error / Dragging / Click。

完成后提供开发调试入口，让我能在 UI 或快捷键中手动触发所有状态。
```

### Phase D：性能硬化与验收

目标：确保桌宠常驻也不扰民、不吃资源。

Codex 提示词：

```markdown
请进行 CoreCat 动画系统 Phase D：性能硬化、降级策略和验收工具。

具体要求：
1. 检查所有常驻动画，确保只使用 transform / opacity，不触发布局重排。
2. 避免在 requestAnimationFrame 中频繁 setState 导致 React 全量重渲染。高频 pose 应尽量直接写入 ref style，或使用集中渲染层。
3. VFX Canvas 必须局部化，只覆盖 CoreCat 附近区域，不允许整屏 Canvas。
4. 页面不可见、窗口最小化、系统高负载时降低帧率或暂停 VFX。
5. 支持 prefers-reduced-motion，降低尾巴、耳朵、粒子和面板弹性强度。
6. 增加 CoreCatAnimationDebugPanel，仅开发环境显示，可查看当前 state、previous state、blend weight、FPS、active VFX、hardware trigger。
7. 增加手动验收清单文档 docs/animation/CoreCat_动画验收清单.md。
8. 运行 lint / typecheck / test / build，修复所有因本次开发引入的问题。

最后输出：
- 性能优化点。
- 已验证不触发 reflow 的关键代码位置。
- 如果某些指标无法自动验证，请给出手动验证方法。
```

---

## 4. 目标文件结构

Codex 可以根据现有项目结构微调，但建议最终形成下面结构：

```text
src/
  pet/
    corecat/
      CoreCat.tsx
      CoreCatLayer.tsx
      CoreCatVfxStage.tsx
      CoreCatDebugPanel.tsx
      corecat.css
      animation/
        types.ts
        constants.ts
        curves.ts
        bones.ts
        keyframes.ts
        animationMixer.ts
        animationStateMachine.ts
        hardwareToPetStateAdapter.ts
        useCoreCatAnimation.ts
        usePointerTracking.ts
        useReducedMotion.ts
        useCoreCatDebugControls.ts
      states/
        idle.ts
        hover.ts
        click.ts
        temperatureCheck.ts
        memoryCrowded.ts
        repairing.ts
        dataSorting.ts
        sleep.ts
        celebrate.ts
        bootWake.ts
        dragging.ts
        dropLanding.ts
        panelOpen.ts
        panelClose.ts
        errorGlitch.ts
        updateInstalling.ts
        achievementPop.ts
      vfx/
        vfxTypes.ts
        vfxBus.ts
        SparkParticles.tsx
        CoolingWind.tsx
        ColdPixels.tsx
        DataCubes.tsx
        SteamBurst.tsx
        SleepBubble.tsx
        HologramPanel.tsx
        GoggleShimmer.tsx
        DustPuff.tsx
        AchievementBadge.tsx
      assets/
        README.md
        placeholder/
          corecat-placeholder.svg

docs/
  animation/
    CoreCat_动画运行时说明.md
    CoreCat_动画验收清单.md
```

---

## 5. TypeScript 类型设计

Codex 应以类型为中心实现，避免状态名和骨骼名散落字符串。

```ts
export type CoreCatState =
  | 'idle'
  | 'hover'
  | 'click'
  | 'temperatureCheck'
  | 'memoryCrowded'
  | 'repairing'
  | 'dataSorting'
  | 'sleep'
  | 'celebrate'
  | 'bootWake'
  | 'dragging'
  | 'dropLanding'
  | 'panelOpen'
  | 'panelClose'
  | 'errorGlitch'
  | 'updateInstalling'
  | 'achievementPop';

export type BoneName =
  | 'root'
  | 'shadow'
  | 'body_base'
  | 'head_base'
  | 'ears_left'
  | 'ears_right'
  | 'goggles'
  | 'eyes'
  | 'tail_root'
  | 'tail_mid'
  | 'tail_tip'
  | 'arm_left'
  | 'arm_right_wrench'
  | 'arm_right_fan'
  | 'legs'
  | 'pouch'
  | 'ram_box'
  | 'sweat_drop'
  | 'sleep_bubble';

export interface BoneTransform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  opacity: number;
  skewX?: number;
  skewY?: number;
  zIndex?: number;
}

export type Pose = Partial<Record<BoneName, Partial<BoneTransform>>>;

export interface PointerContext {
  isInside: boolean;
  localX: number;
  localY: number;
  normalizedX: number;
  normalizedY: number;
  velocityX: number;
  velocityY: number;
}

export interface HardwareContext {
  cpuUsage?: number;
  memoryUsagePercent?: number;
  cpuTemp?: number;
  gpuTemp?: number;
  repairTaskRunning?: boolean;
  updateInstalling?: boolean;
  updateProgress?: number;
  lowPowerMode?: boolean;
  lastUserInteractionAt?: number;
}

export interface AnimationContext {
  now: number;
  stateElapsed: number;
  pointer: PointerContext;
  hardware: HardwareContext;
  reducedMotion: boolean;
  triggerVfx: (event: CoreCatVfxEvent) => void;
}

export interface AnimationDefinition {
  state: CoreCatState;
  loop: boolean;
  durationMs?: number;
  priority: number;
  blendInMs: number;
  blendOutMs: number;
  sample: (ctx: AnimationContext) => Pose;
  onEnter?: (ctx: AnimationContext) => void;
  onExit?: (ctx: AnimationContext) => void;
}
```

---

## 6. 骨骼节点层级设计

CoreCat 第一阶段不是传统权重蒙皮，而是“父子节点矩阵 + 图层 transform”。请用下面层级：

```text
root
├── shadow
├── tail_root
│   └── tail_mid
│       └── tail_tip
├── body_base
│   ├── legs
│   ├── pouch
│   ├── arm_left
│   ├── arm_right_wrench
│   ├── arm_right_fan
│   └── ram_box
└── head_base
    ├── ears_left
    ├── ears_right
    ├── goggles
    ├── eyes
    ├── sweat_drop
    └── sleep_bubble
```

### 节点职责

| 节点 | 作用 | 常见动作 |
|---|---|---|
| root | 整体位移、缩放、拖拽、落地 | 拖拽倾斜、整猫抖动 |
| shadow | 脚底阴影 | 呼吸透明度、落地压缩 |
| body_base | 身体躯干 | 呼吸、压缩、负重、侧身 |
| head_base | 头部 | 呼吸延迟、Hover 追踪、后缩 |
| ears_left/right | 耳朵 | 随机抖动、紧张后折 |
| goggles | 护目镜 | 视差、流光、COOLING 文本、上推 |
| eyes | 眼神 | 眨眼、专注、眩晕、睡眠、发光 |
| tail_root/mid/tip | 尾巴链 | 三段阻尼摆动、拖尾、蜷缩 |
| arm_left | 左手 | 托举、持平板、辅助工作 |
| arm_right_wrench | 右手扳手 | 点击旋转、修复敲击、庆典抛接 |
| arm_right_fan | 冷却扇 | 高温挥动 |
| legs | 小短腿 | 承重滑步、打拍子 |
| pouch | 工具包 | 数据吸入、面板展开锚点 |
| ram_box | RAM 箱 | 内存压迫状态 |
| sweat_drop | 汗滴 | 高温警报 |
| sleep_bubble | 睡泡 | 休眠呼吸 |

---

## 7. 动画曲线标准

请统一使用以下曲线，避免每个状态乱写 easing。

```ts
export const Curves = {
  sineInOut: (t: number) => 0.5 - Math.cos(Math.PI * t) / 2,
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  overshoot: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  damped: (t: number, decay = 5, frequency = 18) =>
    Math.exp(-decay * t) * Math.cos(frequency * t),
};
```

CSS 变量：

```css
:root {
  --cat-breathing-curve: cubic-bezier(0.42, 0, 0.58, 1);
  --cat-action-overshoot: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  --cat-fast-transit: cubic-bezier(0.25, 1, 0.5, 1);
  --cat-panel-pop: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## 8. 状态机规则

### 8.1 状态优先级

```ts
export const StatePriority: Record<CoreCatState, number> = {
  errorGlitch: 100,
  dragging: 95,
  dropLanding: 90,
  click: 85,
  celebrate: 80,
  temperatureCheck: 70,
  memoryCrowded: 65,
  repairing: 60,
  updateInstalling: 55,
  panelOpen: 50,
  panelClose: 50,
  hover: 40,
  achievementPop: 38,
  dataSorting: 30,
  sleep: 20,
  bootWake: 15,
  idle: 0,
};
```

### 8.2 触发规则

| 触发 | 目标状态 | 说明 |
|---|---|---|
| 应用启动 | bootWake | 播放一次后进入 idle |
| 鼠标进入范围 | hover | 可被 click / hardware 状态打断 |
| 鼠标点击猫 | click | 一次性，完成后回到 hover 或 idle |
| CPU/GPU >= 75°C | temperatureCheck | 高优先级硬件警报 |
| RAM >= 85% | memoryCrowded | 若同时高温，高温优先 |
| 修复任务运行中 | repairing | 中高优先级 |
| 更新安装中 | updateInstalling | 中优先级 |
| 低负载且空闲 | dataSorting | 低优先级 |
| 无操作 15 分钟 | sleep | 用户交互唤醒 |
| 清理成功 | celebrate | 一次性，完成后回 idle |
| 用户拖拽 | dragging | 拖拽中持续 |
| 拖拽释放 | dropLanding | 一次性 |
| 打开工具包 | panelOpen | 与 UI 面板同步 |
| 关闭工具包 | panelClose | 与 UI 面板同步 |
| 错误事件 | errorGlitch | 最高优先级，短时播放 |
| 成就奖励 | achievementPop | 一次性轻庆祝 |

### 8.3 状态混合规则

1. 普通状态切换：160ms LERP。
2. Hover 进入 / 退出：120ms Ease-Out。
3. Click：可快速打断 Hover，前 50ms 立即压缩，但仍不能闪帧。
4. Celebrate 回 Idle：240ms Ease-In-Out。
5. Sleep 唤醒：先 180ms 从蜷缩姿态展开，再进入 Hover / Idle。
6. ErrorGlitch 结束：回到上一个稳定状态，不要强制回 Idle。
7. Dragging 结束：必须进入 DropLanding，而不是直接 Idle。

---

## 9. 全状态骨骼动画设计

下面是 Codex 必须实现的状态细节。

### 9.1 Idle：常驻异步静息

设计目的：提供永恒生命感，拒绝死气沉沉。

触发：默认状态，无其他高优先级事件。

周期参数：

- body breathing：2800ms。
- head phase delay：350ms。
- tail chain：3800ms。
- blink random：5000-12000ms。
- ear twitch random：约 7500ms，可加随机偏移。

骨骼参数：

```text
body_base:
  scaleY = 1.0 + 0.015 * sin(2πt / 2800)
  scaleX = 1.0 - 0.004 * sin(2πt / 2800)

head_base:
  y = 0.8px * sin(2π(t - 350) / 2800)
  rotation = 0.5deg * sin(2π(t - 350) / 4200)

tail_root:
  rotation = 0deg

tail_mid:
  rotation = 2deg * sin(2πt / 3800)

tail_tip:
  rotation = 4deg * sin(2π(t - 260) / 3800)

shadow:
  opacity = 0.40 - 0.05 * sin(2πt / 2800)
  scaleX = 1.0 - 0.04 * sin(2πt / 2800)
```

眼神：默认 `eye_normal`，随机切换 `eye_blink` 100ms。

耳朵：随机一侧触发 ±3deg 衰减抖动，持续 250ms。

验收：

- 观察 5 秒，必须看到身体呼吸或尾巴摆动。
- 观察 12 秒，至少有一次眨眼或耳朵抖动。
- 动作幅度必须小，不影响用户工作。

---

### 9.2 Hover：鼠标磁吸视线追踪

设计目的：让 CoreCat 感知用户存在。

触发：鼠标进入猫咪画布周围 60px 范围。

核心算法：

```ts
const nx = clamp(pointer.normalizedX, -1, 1);
const ny = clamp(pointer.normalizedY, -1, 1);
const smoothX = lerp(prevX, nx, 0.18);
const smoothY = lerp(prevY, ny, 0.18);
```

骨骼参数：

```text
head_base:
  x = smoothX * 5px
  y = smoothY * 3px
  rotation = smoothX * 1.2deg

goggles:
  x = smoothX * 6px
  y = smoothY * 3.6px

eyes:
  x = smoothX * 7px
  y = smoothY * 4.2px

ears_left/right:
  随头部轻微反向补偿 rotation = -smoothX * 0.4deg
```

VFX：

- 鼠标进入瞬间触发护目镜冷青色极细流光，持续 200ms。
- 流光只能发生一次，不能每帧重复触发。

验收：

- 鼠标绕猫移动时眼睛要像锁定光标。
- 护目镜视差应比头部略大，形成伪 3D。
- 退出 Hover 后 120ms 平滑回 Idle，不允许突然弹回。

---

### 9.3 Click：点击受力回弹

设计目的：提供极佳打击反馈与物理肉感。

触发：点击 CoreCat。

总时长：300ms，可加 VFX 尾迹至 600ms。

关键帧：

| 时间 | body_base | root | arm_right_wrench | eyes |
|---:|---|---|---|---|
| 0ms | scaleX 1, scaleY 1 | y 0 | rot 0 | normal |
| 50ms | scaleX 1.04, scaleY 0.92 | y 4 | rot 30 | focused/wink |
| 140ms | scaleX 0.97, scaleY 1.06 | y -3 | rot 220 | focused/wink |
| 200ms | scaleX 1.01, scaleY 0.99 | y 1 | rot 360 | normal |
| 300ms | scaleX 1, scaleY 1 | y 0 | rot 360/0 | normal |

阻尼段公式：

```text
141-300ms:
  localT = (t - 141) / 159
  bounce = exp(-5 * localT) * cos(18 * localT)
  body.scaleY = 1.0 + 0.025 * bounce
  body.scaleX = 1.0 - 0.012 * bounce
  root.y = 1.2px * bounce
```

VFX：

- 扳手旋转到最高点时触发 3-5 颗黄绿色像素星星。
- 星星初速度向右上，带重力下落和淡出。

验收：

- 点击反馈必须“有肉感”，不是普通按钮缩放。
- 不允许出现图层错位。
- 连续点击时，动画可以重启，但不能堆叠失控。

---

### 9.4 TemperatureCheck：高温冷却警报

设计目的：当 CPU/GPU 高温时表现滑稽工作危机感。

触发：`cpuTemp >= 75` 或 `gpuTemp >= 75`。

循环周期：基础循环 480ms，高频抖动 15Hz，扇子 80ms。

骨骼参数：

```text
root:
  x = 0.8px * sin(2π * 15Hz * t)

head_base:
  x = -1px
  y = -1px
  rotation = -1.2deg

body_base:
  scaleX = 1.01 + 0.005 * sin(2π * 15Hz * t)
  scaleY = 0.99

arm_right_wrench:
  opacity = 0

arm_right_fan:
  opacity = 1
  rotation = lerp(-15deg, 35deg, sawOrPingPong(t / 80ms))

sweat_drop:
  opacity = 1
  y = 1px + 2px * sin(2πt / 700ms)
```

眼神：`eye_focused` 或专注流汗表情。

VFX：

- CoolingWind：从扇子方向生成 3 条半透明青色风带。
- ColdPixels：蓝色冷光像素点，12 颗/秒，寿命 600ms。
- GoggleCoolingText：护目镜内显示 10px 像素风 `COOLING...` 跑马灯。

验收：

- 视觉上要“忙着降温”，不是普通警告图标。
- 高频抖动幅度必须小，不能看着烦。
- 退出时冷气和粒子淡出，不允许瞬间消失。

---

### 9.5 MemoryCrowded：内存吃紧重物压迫

设计目的：把内存满载具象化为重物托举。

触发：`memoryUsagePercent >= 85`。

循环周期：承重姿态持续，颤抖 25Hz，蒸汽 800ms。

骨骼参数：

```text
root:
  y = 4px

body_base:
  scaleX = 1.05
  scaleY = 0.96

head_base:
  y = 2px
  rotation = 1deg * sin(2πt / 900ms)

arm_left:
  x = -3px
  y = -14px
  rotation = -55deg + 0.5px tremble

arm_right_wrench:
  x = 3px
  y = -14px
  rotation = 55deg + 0.5px tremble

ram_box:
  opacity = 1
  y = -24px + 0.5px * sin(2π * 25Hz * t)
  scaleX = 1.0 + 0.01 * warningPulse

legs:
  每 3000ms 触发一次左右滑步 2px 再收回
```

眼神：`eye_dizzy`。

VFX：

- RAM 箱橙红警告呼吸光。
- 每 800ms 从箱子缝隙横向喷一次短蒸汽，持续 200ms。

验收：

- 必须能看出“被压着很吃力”。
- 颤抖不能大到像 BUG。
- RAM 箱必须与双手位置绑定，不能漂浮错位。

---

### 9.6 Repairing：工坊模块后台修复中

设计目的：表现可靠、专注的硬核工作流状态。

触发：`repairTaskRunning === true`。

循环周期：扳手 160ms，脚尖 320ms，全息字符 1200ms。

骨骼参数：

```text
root:
  x = -2px

body_base:
  rotation = -3deg
  scaleX = 0.96

head_base:
  x = 1px
  y = 0
  rotation = -2deg

arm_right_wrench:
  rotation = pingPong(+45deg, -20deg, 160ms)
  x = 6px
  y = -2px

legs:
  y = tapFoot(t, 320ms) ? -1px : 0
```

眼神：`eye_focused`。

VFX：

- SparkParticles：扳手下落命中帧触发 4 颗明黄色火花。
- HologramPanel：猫咪面前展开半透明蓝色全息屏，0.6 透明度，伪代码字符流上下滚动。

验收：

- 扳手敲击必须和火花同步。
- 脚尖打拍子必须半速跟随敲击。
- 全息屏不能盖住猫脸，要像小工具台。

---

### 9.7 DataSorting：低负载日常扫描整理

设计目的：系统闲置时，猫咪在电脑里悠闲做家务。

触发：`cpuUsage < 10` 且内存不高且用户空闲。

循环周期：手臂轨迹 1800ms，数据方块每 500-900ms 生成。

骨骼参数：

```text
body_base:
  继承 Idle 呼吸

arm_right_wrench:
  使用空手或工具扫描姿态
  沿贝塞尔曲线路径：
    p0 = (6, -2)
    p1 = (16, -10)
    p2 = (22, 6)
    p3 = (10, 10)
  rotation 随切线方向变化

eyes:
  x/y 跟随右手位置的 0.25 倍

pouch:
  数据吸入时外发光 120ms
```

VFX：

- 右侧 20px 处生成 8x8 淡蓝 / 淡绿数据方块。
- 手臂划过时，方块向 pouch 缩小吸入并淡化。
- pouch 发出一次弱青色光。

验收：

- 感觉必须悠闲、有条理，不是战斗状态。
- 数据方块不要过多，避免干扰桌面。

---

### 9.8 Sleep / LowPower：休眠低功耗

设计目的：系统休眠 / 不打扰时提供治愈陪伴。

触发：无操作 15 分钟或 lowPowerMode。

循环周期：深呼吸 5200ms。

骨骼参数：

```text
root:
  y = 8px
  scaleX = 0.92
  scaleY = 0.86

body_base:
  scaleY = 1.0 + 0.02 * sin(2πt / 5200)

head_base:
  x = 0
  y = 6px
  rotation = -4deg

goggles:
  y = -8px
  rotation = -2deg

tail_root/mid/tip:
  变为环抱身体姿态，不再大幅摆动

sleep_bubble:
  opacity = 0.75
  scale = mapBreathToBubble
  x = 8px
  y = -10px
```

眼神：`eye_sleepy`，彻底闭合。

VFX：

- 关闭高频粒子。
- 睡泡随呼吸膨胀：吸气缩小到 0.1，呼气放大到 1.0。
- 睡泡最大时随机微闪。

验收：

- CPU 占用最低。
- 视觉治愈、安静，不闪烁。
- 用户交互必须能唤醒。

---

### 9.9 Celebrate：成功庆典

设计目的：指标回落、清理成功、升级成功时给用户奖励反馈。

触发：成功事件。

总时长：1800ms。

关键帧：

| 时间 | 动作 |
|---:|---|
| 0ms | 轻微下蹲蓄力 |
| 180ms | 扳手向上抛，身体准备旋转 |
| 500ms | 身体欢快旋转 / 摆身，尾巴甩起 |
| 850ms | 接住扳手，护目镜下拉 |
| 1100ms | 脚底金色蒸汽星环爆开 |
| 1400ms | 单手撑腰英雄 Pose |
| 1800ms | 动作完成，进入 240ms 回 Idle 混合 |

VFX：

- GoldenSteamRing：脚底一圈金色像素蒸汽星点。
- WrenchArcTrail：扳手抛起轨迹淡线。
- EyeGlow：眼神短暂发亮。

验收：

- 这是一次性高潮动作，必须比普通 Click 更有表现力。
- 不能循环播放。
- 完成后必须自然回 Idle。

---

## 10. 补充动作设计

### 10.1 BootWake：启动唤醒

时长：1000ms。

动作：

- 从透明、轻微缩小、向下偏移状态出现。
- 睁眼、耳朵抖动、尾巴轻甩。
- 护目镜亮一下后进入 Idle。

### 10.2 Dragging：拖拽中

动作：

- 根据拖拽速度倾斜，最大 ±8deg。
- 尾巴和耳朵反向拖尾。
- 眼睛看向拖拽方向。
- 阴影延展。

### 10.3 DropLanding：落地回弹

时长：420ms。

动作：

- 落地压缩。
- 弹起。
- 阻尼回弹。
- 小尘埃粒子。

### 10.4 PanelOpen：工具包面板展开

动作：

- 右手掏出诊断平板。
- Quick Panel 从 pouch 锚点弹性展开。
- 面板不是普通弹窗，而是猫咪现场拉出的工具。

### 10.5 PanelClose：工具包面板关闭

动作：

- 面板收回 pouch。
- 猫拍一下工具包。
- pouch 青光闪一下。

### 10.6 ErrorGlitch：异常警告

动作：

- 护目镜横向 glitch 扫描线。
- 耳朵后折。
- 尾巴僵直。
- 1200ms 后回前一稳定状态。

### 10.7 UpdateInstalling：安装更新中

动作：

- 持小芯片或能量块。
- 面前环形进度微光。
- 根据 progress 调整 VFX。

### 10.8 AchievementPop：成就奖励

动作：

- 眼睛发光。
- 尾巴翘起。
- 头顶小徽章弹出。
- 900ms 后回前一状态。

---

## 11. VFX 系统设计

### 11.1 VFX Bus

不要让每个状态组件直接控制粒子。请建立事件总线：

```ts
export type CoreCatVfxEvent =
  | { type: 'spark'; x: number; y: number; count?: number }
  | { type: 'clickStars'; x: number; y: number; count?: number }
  | { type: 'coolingWind'; intensity: number }
  | { type: 'coldPixels'; intensity: number }
  | { type: 'steamBurst'; x: number; y: number }
  | { type: 'dataCubeSpawn'; x: number; y: number }
  | { type: 'pouchGlow' }
  | { type: 'sleepBubblePulse' }
  | { type: 'goldenSteamRing' }
  | { type: 'goggleShimmer' }
  | { type: 'dustPuff'; x: number; y: number }
  | { type: 'achievementBadge'; label?: string };
```

### 11.2 VFX 性能原则

- 火花、星星、蒸汽、尘埃：DOM 粒子或小 Canvas 均可。
- 冷气风带：SVG / CSS 更合适。
- 数据方块：局部 Canvas 或 DOM 小块。
- 全息屏：DOM + CSS glassmorphism。
- 护目镜跑马灯：小 DOM 文本层。
- 所有 VFX 必须挂载在 CoreCat 容器内，不能铺满全屏。

---

## 12. UI 动效联动规范

### 12.1 Quick Panel 展开

Quick Panel 不允许像普通网页弹窗一样突然出现。必须以 `pouch` 节点为展开锚点。

要求：

- 打开面板时，先触发 `panelOpen`。
- 右手做掏平板动作。
- 面板从工具包边缘向外展开。
- 曲线：`cubic-bezier(0.34, 1.56, 0.64, 1)`。
- 时间：180ms。
- 面板出现的第一帧 scale 不得为 1，应从 0.72-0.85 开始。
- 透明度与 scale 同步渐入。

### 12.2 MonitorBar 胶囊条

要求：

- Hover 时像液态金属 / 高级机械阻尼器一样拉伸。
- 不要机械变长。
- CPU / RAM / Temp 指标自左向右 120ms 依次亮起。
- 数字更新时使用轻微 roll-up，不要大跳。

---

## 13. 硬件数据适配

建议建立单独适配层，不要把硬件判断写死在 UI 组件里。

```ts
export function resolveCoreCatStateFromHardware(input: {
  hardware: HardwareContext;
  pointerInside: boolean;
  isDragging: boolean;
  panelOpen: boolean;
  now: number;
}): CoreCatState {
  // 伪代码
  if (input.isDragging) return 'dragging';
  if ((input.hardware.cpuTemp ?? 0) >= 75 || (input.hardware.gpuTemp ?? 0) >= 75) return 'temperatureCheck';
  if ((input.hardware.memoryUsagePercent ?? 0) >= 85) return 'memoryCrowded';
  if (input.hardware.repairTaskRunning) return 'repairing';
  if (input.hardware.updateInstalling) return 'updateInstalling';
  if (input.panelOpen) return 'panelOpen';
  if (input.pointerInside) return 'hover';
  if (input.hardware.lowPowerMode) return 'sleep';
  if ((input.hardware.cpuUsage ?? 100) < 10 && (input.hardware.memoryUsagePercent ?? 100) < 70) return 'dataSorting';
  return 'idle';
}
```

温度数据注意：

- Windows 下 GPU 温度不一定总能稳定读取。
- 第一版如果读取不到 GPU 温度，不应导致动画系统失败。
- 缺失温度时用 `undefined`，不要写死 0 导致误判。
- Debug 面板应显示“数据缺失 / mock / real”。

---

## 14. 性能工程规范

### 14.1 必须遵守

- 常驻动画只用 `transform` 和 `opacity`。
- 使用 `translate3d()` 触发 GPU 合成。
- 避免每帧 React setState。
- 高频数据用 `useRef` 保存。
- RAF 中集中计算 pose，并写入节点 style。
- VFX 粒子数量设上限。
- 低功耗模式关闭高频 VFX。
- 页面不可见时暂停 RAF 或降频。

### 14.2 禁止事项

- 禁止每帧改变 width / height / top / left。
- 禁止整屏 Canvas 每帧重画。
- 禁止在每个骨骼节点上创建独立 RAF。
- 禁止无限叠加未销毁粒子。
- 禁止大量 CSS filter 常驻动画。

---

## 15. 调试与验收工具

Codex 应提供开发环境 Debug Panel：

显示内容：

- 当前状态。
- 上一个状态。
- blend weight。
- stateElapsed。
- active VFX 数量。
- pointer normalizedX / normalizedY。
- hardware trigger。
- reduced motion 是否开启。
- FPS 粗略值。

手动触发按钮：

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

---

## 16. 验收清单

### 16.1 视觉验收

- [ ] 默认状态 5 秒内不是静态。
- [ ] 身体、头、尾巴不是同频同向。
- [ ] 眨眼是随机的，不像机械循环。
- [ ] Hover 头部和眼神能跟随鼠标。
- [ ] Click 有压缩、反弹、阻尼回弹。
- [ ] Click 扳手旋转和星星出现时机正确。
- [ ] 高温状态有冷却危机感。
- [ ] 内存状态有重物压迫感。
- [ ] 修复状态有工程师工作感。
- [ ] 数据整理状态悠闲且不打扰。
- [ ] 休眠状态安静治愈。
- [ ] 庆典状态有高潮表现力。
- [ ] 工具包面板像从猫身上展开，不像网页弹窗。

### 16.2 状态机验收

- [ ] 状态切换无闪帧。
- [ ] 高优先级状态可打断低优先级。
- [ ] Click 播放完成后回到合理状态。
- [ ] Celebrate 播放完成后 240ms 回 Idle。
- [ ] Dragging 释放后进入 DropLanding。
- [ ] ErrorGlitch 后回到前一稳定状态。
- [ ] Sleep 可被用户交互唤醒。

### 16.3 性能验收

- [ ] Idle 不触发频繁 React 重渲染。
- [ ] 常驻动画不改变布局属性。
- [ ] VFX 数量有上限。
- [ ] 页面不可见时降频。
- [ ] reduced-motion 生效。
- [ ] build 通过。

---

## 17. Codex 最终汇报模板

要求 Codex 每轮完成后按这个格式回复：

```markdown
## 本轮完成内容

- ...

## 修改 / 新增文件

- `src/pet/corecat/...`

## 已实现动画状态

- Idle：...
- Hover：...
- Click：...

## 触发方式

- 鼠标 Hover：...
- 点击：...
- Debug Panel：...

## 性能处理

- ...

## 已运行检查

- npm run typecheck：通过 / 未配置 / 失败原因
- npm run lint：通过 / 未配置 / 失败原因
- npm run build：通过 / 未配置 / 失败原因

## 手动验收步骤

1. ...

## 未完成项 / 风险

- ...
```

---

## 18. 给图像 / 美术生成工具的资产提示词

如果后续需要让图像模型或美术工具生成 CoreCat 分层素材，可以使用下面提示词。注意：这些提示词不是给 Codex 写代码用，而是给图像 / 美术资产生成工具用。

### 18.1 CoreCat 分层资产总提示词

```text
Create a premium mini desktop pet character named CoreCat, a cute chibi orange engineering cat with a tiny cyber workshop aesthetic. The character must be designed as layered 2D animation assets, not a single flattened illustration. Style: high-end game companion, polished vector-pixel hybrid, soft rounded silhouette, dark navy and cyan tech accents, tiny goggles, utility pouch, miniature wrench, expressive eyes. Transparent background. Each body part must be cleanly separated for pseudo-skeletal animation: shadow, tail, body base, left arm, right arm with wrench, right arm with cooling fan, head base, left ear, right ear, goggles, eyes, RAM box, sweat drop, sleep bubble. Keep the pet small, exquisite, adorable, and suitable for a Windows desktop companion. Avoid large mascot proportions, avoid ugly generic cartoon style, avoid clutter.
```

### 18.2 Hover 动作资产提示词

```text
Spine-like 2D game-ready animation layout for CoreCat mouse-hover reaction. The cute orange chibi engineering cat tilts its head subtly and shifts its big expressive eyes toward a dynamic pointer target. Goggles have a thin cyan reflective shimmer and slightly stronger parallax than the head. Smooth easing, premium desktop pet game asset, transparent background, compact mini character.
```

### 18.3 Click 动作资产提示词

```text
2D skeletal animation sequence of CoreCat getting tapped. The cat squashes down first, then springs up with joyful elastic bounce. One eye winks, the tiny wrench spins 360 degrees, and small yellow-green pixel stars burst near the wrench. Strong squash-and-stretch physics, adorable engineering cat, premium game sprite, transparent background.
```

### 18.4 TemperatureCheck 动作资产提示词

```text
Smooth looping animation of CoreCat in cute cooling emergency mode. The chibi engineering cat is sweating slightly, determined but funny, frantically waving a tiny high-tech cooling fan. Cyan cold air wind streams, soft neon blue particles around the feet, goggles displaying tiny COOLING text. Low power desktop pet game asset, transparent background.
```

### 18.5 MemoryCrowded 动作资产提示词

```text
Looping 2D game animation of CoreCat under heavy memory load. The cute engineering cat holds a massive glowing RAM module box above its head, knees bent, body slightly squashed, trembling under weight. Orange-red warning light bars pulse on the RAM box, small steam puffs escape from the box. Cute crisis aesthetic, transparent background.
```

### 18.6 Repairing 动作资产提示词

```text
Looping character animation of CoreCat repairing a tiny holographic workstation. The chibi cat engineer faces slightly sideways, focused eyes, tapping a small wrench rhythmically, golden pixel sparks appear at each hit, one foot taps happily. Blue glass holographic screen with tiny code streams. Premium cyber workshop desktop pet asset, transparent background.
```

### 18.7 DataSorting 动作资产提示词

```text
High quality looping animation of CoreCat calmly sorting tiny glowing data cubes. The cute engineering cat moves one paw in smooth curved gestures, collecting blue and green pixel data blocks into its utility pouch. Calm tech operation, subtle neon highlights, relaxed desktop pet animation, transparent background.
```

### 18.8 Sleep 动作资产提示词

```text
Cozy looping sleep animation of CoreCat curled into a soft fuzzy ball. The engineering goggles are pushed up on the forehead, eyes closed, very slow breathing, a tiny cyan pixel sleep bubble inflates and deflates near the nose. Healing low-power desktop companion mood, ultra soft motion, transparent background.
```

### 18.9 Celebrate 动作资产提示词

```text
Dynamic polished victory celebration animation for CoreCat. The chibi engineer cat flips its tiny wrench into the air, catches it with a cool reverse grip, snaps goggles down, and strikes a proud heroic pose. Golden pixel steam ring and sparkling particles burst from the feet, high-fidelity 2D game companion animation, transparent background.
```

---

## 19. 关键提醒

1. Codex 能实现动画运行时，但不是专业骨骼编辑器。
2. 第一阶段先用伪骨骼系统跑通，不要被 Spine / Live2D 复杂流程拖慢。
3. 真正高级感来自三个部分：分层资产质量、动画曲线、状态混合。
4. 没有真实素材时，Codex 必须先用占位层验证动画，不要停工。
5. 所有动画都要围绕“精致小巧的工程师猫桌宠”，不能变成大弹窗、大监控面板或普通网页组件。

