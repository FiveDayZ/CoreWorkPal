# CoreCat 骨骼动画规范.md

> **文档用途**：给 Codex / 前端开发 Agent 读取，用于实现 CoreCat 的轻量伪骨骼动画运行时。  
> **适用项目**：CoreWorkPal / CoreCat / Tauri + React + TypeScript。  
> **核心原则**：不依赖 Spine / Live2D 的第一版实现，先用「分层图片 + DOM/CSS Transform + Web Animations API + 局部 Canvas VFX」实现游戏级桌宠动效。  
> **禁止事项**：禁止整张静态图轮播；禁止所有部件同频同向运动；禁止状态切换瞬间跳帧；禁止大面积 Canvas 全量逐帧重绘。

---

## 1. 动画目标

CoreCat 必须是一只精致、小巧、有生命感的桌面工程猫，而不是普通软件贴纸。动画要达到以下效果：

1. **常驻生命感**：即使用户不操作，身体、头、耳朵、尾巴、眼睛、阴影也要有微弱且异步的动态。
2. **物理反馈感**：点击、拖拽、落地、面板展开必须有压缩、蓄力、超调、回弹。
3. **环境感知感**：鼠标靠近时要有眼神追踪和护目镜视差；硬件高温、内存吃紧、系统空闲要进入不同姿态。
4. **低功耗**：常驻状态优先使用 CSS transform / opacity，不触发 layout / reflow。
5. **可扩展**：所有动作都通过数据配置驱动，不要把每个动作硬编码在组件里。

---

## 2. 推荐目录结构

Codex 必须按以下结构创建或调整文件：

```text
src/pet/corecat/
  CoreCat.tsx
  CoreCatLayer.tsx
  CoreCatVfxLayer.tsx
  corecat.css

  animation/
    animationTypes.ts
    animationCurves.ts
    animationMixer.ts
    animationStateMachine.ts
    animationRuntime.ts
    boneRegistry.ts
    keyframes/
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
      SparkParticles.tsx
      CoolingWind.tsx
      DataCubes.tsx
      SteamBurst.tsx
      SleepBubble.tsx
      HologramPanel.tsx
```

---

## 3. 骨骼节点总表

第一版不做真正 mesh deform，使用伪骨骼节点。每个节点本质是一个绝对定位图层，拥有独立的 transform-origin、transform、opacity、filter 和 z-index。

```ts
export type CoreCatBoneId =
  | 'root'
  | 'shadow'
  | 'body_base'
  | 'body_squash_proxy'
  | 'leg_left'
  | 'leg_right'
  | 'tail_root'
  | 'tail_mid'
  | 'tail_tip'
  | 'arm_left'
  | 'arm_right_wrench'
  | 'tool_wrench'
  | 'tool_fan'
  | 'tool_tablet'
  | 'tool_ram_box'
  | 'pouch'
  | 'head_base'
  | 'ear_left'
  | 'ear_right'
  | 'goggles'
  | 'eyes'
  | 'sweat_drop'
  | 'sleep_bubble_anchor'
  | 'vfx_anchor_front'
  | 'vfx_anchor_back'
  | 'vfx_anchor_feet'
  | 'vfx_anchor_tool';
```

### 3.1 节点层级

```text
root
├── shadow
├── vfx_anchor_back
├── tail_root
│   └── tail_mid
│       └── tail_tip
├── body_squash_proxy
│   ├── body_base
│   ├── leg_left
│   ├── leg_right
│   ├── pouch
│   ├── arm_left
│   ├── arm_right_wrench
│   │   ├── tool_wrench
│   │   └── tool_fan
│   └── tool_tablet
├── head_base
│   ├── ear_left
│   ├── ear_right
│   ├── goggles
│   ├── eyes
│   └── sweat_drop
├── sleep_bubble_anchor
├── vfx_anchor_tool
├── vfx_anchor_feet
└── vfx_anchor_front
```

### 3.2 坐标与单位

| 项目 | 规范 |
|---|---|
| 坐标系 | 以 CoreCat 容器左上角为 `(0,0)` |
| 设计基准尺寸 | 第一版建议 `160px × 160px`，高分屏素材使用 `320px × 320px` @2x |
| Transform 单位 | `translateX/Y` 使用 px，`rotate` 使用 deg，`scale` 使用倍率 |
| 默认朝向 | 正面微侧 15°，偏工程师可爱站姿 |
| 图层定位 | 统一绝对定位，不参与文档流 |
| 运动实现 | 常驻循环优先 CSS keyframes；交互动作使用 Web Animations API 或 rAF mixer |

---

## 4. 动画数据结构

Codex 必须先实现类型，而不是直接写散乱 CSS。

```ts
export type EasingName =
  | 'linear'
  | 'easeInOutSine'
  | 'easeOutCubic'
  | 'easeOutBack'
  | 'springSoft'
  | 'springClick'
  | 'dampedOscillation';

export interface BoneTransform {
  x?: number;
  y?: number;
  scaleX?: number;
  scaleY?: number;
  rotate?: number;
  opacity?: number;
  filter?: string;
}

export interface BoneKeyframe {
  at: number; // 0-1，表示动作归一化进度
  transform: BoneTransform;
  easing?: EasingName;
}

export interface BoneTrack {
  bone: CoreCatBoneId;
  keyframes: BoneKeyframe[];
}

export interface CoreCatAnimationClip {
  id: CoreCatAnimationState;
  durationMs: number;
  loop: boolean;
  priority: number;
  blendInMs: number;
  blendOutMs: number;
  tracks: BoneTrack[];
  eye?: CoreCatEyeState;
  vfx?: CoreCatVfxCue[];
}
```

---

## 5. 曲线规范

```ts
export const CoreCatCurves = {
  easeInOutSine: 'cubic-bezier(0.42, 0, 0.58, 1)',
  easeOutCubic: 'cubic-bezier(0.25, 1, 0.5, 1)',
  easeOutBack: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  springClick: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
};
```

阻尼回弹可以用函数实现：

```ts
export function dampedOscillation(t: number, gamma = 5.5, omega = 22) {
  return Math.exp(-gamma * t) * Math.cos(omega * t);
}
```

---

## 6. 基础动作规范

## 6.1 Idle：常驻异步静息

**触发条件**：默认状态。  
**循环**：是。  
**视觉目标**：永远有生命感，但不能干扰用户。

| 骨骼 | 动作 |
|---|---|
| `body_squash_proxy` | 周期 `2800ms`，`scaleY = 1.0 -> 1.015 -> 1.0` |
| `head_base` | 延迟 `350ms`，`translateY = 0 -> 0.8px -> 0`，`rotate = -0.5° -> 0.5°` |
| `shadow` | 透明度 `0.45 -> 0.35 -> 0.45`，`scaleX = 1 -> 0.96 -> 1` |
| `tail_mid` | 周期 `3800ms`，`rotate = -2° -> 2° -> -2°` |
| `tail_tip` | 周期 `3800ms`，`rotate = -4° -> 4° -> -4°` |
| `ear_left/right` | 每 `7500ms ± 1500ms` 随机触发一次 `±3°` 衰减微颤 |
| `eyes` | 每 `5000ms~12000ms` 随机眨眼，`eye_blink` 持续 `100ms` |

**Codex 验收**：CoreCat 在 Idle 状态下 5 秒内必须出现至少一次局部微动，不能像静态贴纸。

---

## 6.2 Hover：鼠标磁吸视线追踪

**触发条件**：鼠标进入 CoreCat 容器外扩 `60px` 热区。  
**循环**：跟随鼠标实时更新。  
**视觉目标**：猫知道用户来了，眼睛和护目镜像隔着屏幕盯着鼠标。

| 骨骼 | 动作 |
|---|---|
| `head_base` | 根据鼠标相对中心偏移，最大 `x=±5px`、`y=±3px`，平滑 Ease-Out |
| `goggles` | 位移为 `head_base × 1.2`，形成伪 3D 视差 |
| `eyes` | 位移为 `head_base × 1.4`，眼神更敏锐 |
| `ear_left/right` | 鼠标进入瞬间向目标方向轻转 `±1.5°` |
| `shadow` | 保持 Idle 阴影，不增加干扰 |

**进入特效**：护目镜出现一次 `200ms` 冷青色细光扫过。  
**退出**：`160ms` 内 LERP 回 Idle。

---

## 6.3 Click：点击受力回弹

**触发条件**：用户点击 CoreCat 主体。  
**时长**：`300ms`。  
**视觉目标**：有肉感、弹性、俏皮，不是机械缩放。

| 时间 | 骨骼动作 |
|---|---|
| `0-50ms` | `body_squash_proxy`: `scaleY=0.92`, `scaleX=1.04`, `y=4px` |
| `51-140ms` | `body_squash_proxy`: `scaleY=1.06`, `scaleX=0.97`, `y=-3px` |
| `141-300ms` | 使用阻尼正弦回弹 3 次，回到 `scale=1` |
| `51-200ms` | `arm_right_wrench` 或 `tool_wrench` 顺时针旋转 `360°` |
| `0-120ms` | `eyes` 切换 `eye_focused` 或 wink 状态 |

**VFX**：扳手旋转到最高点时，从 `vfx_anchor_tool` 生成 3-5 颗黄绿色像素星星，向右上抛射并淡出。

---

## 6.4 TemperatureCheck：高温冷却警报

**触发条件**：CPU 或 GPU 温度 `> 75°C`。  
**退出条件**：温度 `< 70°C` 持续 `5s`。  
**循环**：是。  
**视觉目标**：滑稽但不烦人，有“工程危机处理”的可爱感。

| 骨骼 | 动作 |
|---|---|
| `root` | 高频 X 抖动，`15Hz`，幅度 `±0.8px` |
| `head_base` | 后缩 `x=-1px, y=-1px`，微抬头 `rotate=-2°` |
| `arm_right_wrench` | 隐藏扳手，显示 `tool_fan` |
| `tool_fan` | 周期 `80ms`，`rotate=-15° -> 35° -> -15°` |
| `sweat_drop` | 显示并沿额头 `y=0 -> 5px` 下滑，循环淡出 |
| `eyes` | 切换 `eye_focused`，半眯专注流汗感 |

**VFX**：

1. `CoolingWind`：从 `vfx_anchor_tool` 发出 3 条半透明青色风带。
2. `CoolingPixel`：脚底和身体周围每秒 12 颗蓝色冷光像素，寿命 `600ms`。
3. `GogglesText`：护目镜反光层显示 10px 像素字 `COOLING...` 跑马灯。

---

## 6.5 MemoryCrowded：内存吃紧重物压迫

**触发条件**：RAM 占用 `> 85%`。  
**退出条件**：RAM 占用 `< 78%` 持续 `5s`。  
**循环**：是。

| 骨骼 | 动作 |
|---|---|
| `body_squash_proxy` | 下蹲 `y=4px`，`scaleX=1.05`，`scaleY=0.96` |
| `arm_left` | 高举，`rotate=-55°` |
| `arm_right_wrench` | 高举，`rotate=55°`，隐藏扳手 |
| `tool_ram_box` | 显示在双手上方，绑定双手中心 |
| `tool_ram_box` + arms | 垂直颤抖 `25Hz`，幅度 `0.5px` |
| `leg_left/right` | 每 `3000ms` 向外滑 `2px` 后收回 |
| `eyes` | 切换 `eye_dizzy` |

**VFX**：RAM 箱子橙红色霓虹闪烁；每 `800ms` 从箱体缝隙喷射 `200ms` 白色像素蒸汽。

---

## 6.6 Repairing：工坊模块后台修复

**触发条件**：清理、修复、优化、加速、扫描模块执行中。  
**循环**：是。  
**视觉目标**：可靠、硬核、忙碌但可爱。

| 骨骼 | 动作 |
|---|---|
| `root` | 整体朝左扭转姿态，视觉上侧身 `45°`，可用 `scaleX + rotate` 伪装 |
| `body_squash_proxy` | 轻微前倾，`rotate=-3°` |
| `arm_right_wrench` | 周期 `160ms`，`rotate=45° -> -20° -> 45°` 敲击 |
| `leg_left/right` | 每 `320ms` 交替脚尖点地 |
| `eyes` | `eye_focused` |

**VFX**：

1. 敲击帧从 `vfx_anchor_tool` 炸出 4 颗黄色火花。
2. 前方出现半透明蓝色全息光幕，`opacity=0.6`，伪代码字符向上滚动。

---

## 6.7 DataSorting：低负载数据整理

**触发条件**：CPU `< 10%` 且用户无交互 `30s`。  
**退出条件**：CPU `> 20%` 或鼠标交互。  
**循环**：是。

| 骨骼 | 动作 |
|---|---|
| `body_squash_proxy` | 保持 Idle 呼吸 |
| `arm_right_wrench` | 隐藏扳手，右手沿贝塞尔曲线轻划 |
| `eyes` | 跟随右手轨迹轻微位移 |
| `pouch` | 数据方块吸入时闪一次青色外发光 |

**VFX**：右侧 `20px` 处生成 `8x8px` 淡蓝/淡绿数据方块；手臂划过时方块收缩、吸入工具包、淡出。

---

## 6.8 Sleep / LowPower：休眠低功耗

**触发条件**：无操作超过 `15min`，或用户开启 Low Power。  
**循环**：是。  
**视觉目标**：治愈、安静、安全感。

| 骨骼 | 动作 |
|---|---|
| `body_squash_proxy` | 缩团坐姿，高度降低到约 `96px` |
| `head_base` | 向身体中心靠拢 |
| `goggles` | 上滑 `8px`，推到额头 |
| `tail_root/mid/tip` | 盘到身体前侧，随呼吸轻动 |
| `eyes` | `eye_sleepy` 完全闭合 |
| `shadow` | 固定低频淡影，不再高频变化 |

**VFX**：鼻尖 `sleep_bubble` 与呼吸同步，吸气缩小到 `0.1`，呼气膨胀到 `1.0`，最大时随机闪一下。

---

## 6.9 Celebrate：成功庆典

**触发条件**：清理成功、内存回落、升级完成、成就解锁。  
**时长**：`1800ms`。  
**循环**：否。  
**视觉目标**：有高潮表现力，但只在成功时短暂播放。

| 时间 | 动作 |
|---|---|
| `0-240ms` | 蓄力下蹲，尾巴向反方向甩 |
| `240-650ms` | 扳手向上抛，身体原地旋转 `180°` |
| `650-1050ms` | 继续旋转到 `360°`，反手接住扳手 |
| `1050-1350ms` | 护目镜快速下拉盖住眼睛，眼睛切 `eye_glowing` |
| `1350-1800ms` | 英雄 Pose，单手叉腰，脚底炸开金色星点蒸汽环 |

**退出**：播放完毕后 `240ms` ease-in-out 回 Idle。

---

## 7. 桌宠操作动作

## 7.1 BootWake：启动唤醒

**触发条件**：CoreCat 窗口首次显示。  
**时长**：`1200ms`。  
**动作**：从小光团/工具包影子中伸懒腰出现。先缩成 `scale=0.75`、`opacity=0`，随后 `scale=1.05` 超调，再回 `1.0`。耳朵最后 200ms 抖一下，眼睛眨开。

## 7.2 Dragging：拖拽中

**触发条件**：用户按住 CoreCat 拖拽。  
**动作**：身体朝拖拽反方向产生 `3px~6px` 惯性滞后，尾巴反向甩动，眼睛略紧张但可爱。

## 7.3 DropLanding：拖拽释放落地

**触发条件**：拖拽释放。  
**时长**：`420ms`。  
**动作**：先下压 `scaleY=0.88 scaleX=1.06 y=5px`，再反弹 `scaleY=1.04 y=-2px`，最后阻尼归位。脚底阴影瞬间变深再恢复。

## 7.4 PanelOpen：工具包面板展开

**触发条件**：点击打开 Quick Panel。  
**时长**：`260ms`。  
**动作**：右手从工具包掏出诊断平板；面板从 `pouch` 锚点以 `scale=0.1 -> 1.04 -> 1.0` 展开，曲线使用 `easeOutBack`。

## 7.5 PanelClose：工具包面板关闭

**触发条件**：关闭 Quick Panel。  
**时长**：`220ms`。  
**动作**：面板被吸回工具包；CoreCat 轻轻点头确认，工具包闪一次微光。

## 7.6 ErrorGlitch：异常警告

**触发条件**：硬件数据读取失败、插件异常、权限不足。  
**时长**：`900ms`，可循环但不超过 `3s`。  
**动作**：护目镜出现轻微色散 glitch，眼睛切换疑惑表情，耳朵左右交替抖动。

## 7.7 UpdateInstalling：安装更新

**触发条件**：模块下载、安装、更新。  
**循环**：是。  
**动作**：CoreCat 单手拿小扳手，另一手查看小平板；脚边出现环形进度粒子。

## 7.8 AchievementPop：成就奖励

**触发条件**：用户达成里程碑。  
**时长**：`1300ms`。  
**动作**：猫眼发光，尾巴快速摇两下，头顶弹出徽章卡片。

---

## 8. 性能要求

1. 常驻 Idle、Hover、Sleep 必须以 CSS transform/opacity 为主。
2. 高频粒子只允许局部 Canvas 或少量 DOM 粒子，禁止全窗口重绘。
3. 所有动画节点必须设置：

```css
.corecat-bone {
  position: absolute;
  will-change: transform, opacity;
  transform: translate3d(0, 0, 0);
  pointer-events: none;
  user-select: none;
}
```

4. 全屏游戏或系统高负载时，自动降级到 LowPower：暂停 VFX、暂停非必要 rAF、保留极慢呼吸。
5. 常驻状态目标 CPU 占用低于 `1%`。

---

## 9. Codex 执行提示词

```markdown
请读取 `/docs/animation/CoreCat_骨骼动画规范.md`，并在现有 Tauri + React 项目里实现 CoreCat 轻量伪骨骼动画运行时。

要求：
1. 不接入 Spine / Live2D / Rive，第一版只做 DOM/CSS/Web Animations API/rAF 驱动的分层伪骨骼。
2. 创建 `src/pet/corecat/animation` 目录，先实现类型、曲线、骨骼注册表、AnimationMixer、AnimationRuntime。
3. 按文档实现 Idle、Hover、Click、Sleep 四个基础动作，确保动画真实可见。
4. 所有状态切换必须使用 `blendInMs/blendOutMs` 插值，禁止瞬间替换 transform。
5. 实现 VFX 的接口，但第一轮可以用轻量占位粒子。
6. 没有正式素材时，请先用彩色透明占位块代表各骨骼图层，但必须保留真实图层命名和接口。
7. 完成后提供文件清单、运行方式和验收说明。
```
