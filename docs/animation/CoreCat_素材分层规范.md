# CoreCat 素材分层规范.md

> **文档用途**：给 Codex、美术 AI、2D 美术师、动效设计 AI 使用，规定 CoreCat 素材如何拆层、命名、导出、对齐、设置锚点。  
> **目标**：保证第一版轻量伪骨骼动画可以直接替换正式素材，不需要重写代码。  
> **核心原则**：严禁交付一张完整死图；所有可动部件必须独立分层；每个图层必须保留透明背景、统一画布尺寸、统一坐标。

---

## 1. 素材总目录

正式素材必须放在：

```text
src/assets/pets/corecat_skeleton/
  manifest.json
  shadow.png

  tail/
    tail_root.png
    tail_mid.png
    tail_tip.png

  body/
    body_base.png
    body_squash_proxy_mask.png
    leg_left.png
    leg_right.png
    pouch.png
    arm_left.png
    arm_right_wrench.png

  head/
    head_base.png
    ear_left.png
    ear_right.png
    goggles.png
    goggles_glass_highlight.png

  eyes/
    eye_normal.png
    eye_blink.png
    eye_focused.png
    eye_dizzy.png
    eye_sleepy.png
    eye_glowing.png
    eye_wink.png
    eye_confused.png

  tools/
    tool_wrench.png
    tool_fan.png
    tool_tablet.png
    tool_ram_box.png
    tool_update_chip.png
    tool_badge.png

  vfx/
    sweat_drop.png
    sleep_bubble.png
    spark_pixel.png
    cooling_pixel.png
    steam_pixel.png
    data_cube_blue.png
    data_cube_green.png
    golden_star.png
    hologram_panel_base.png
```

---

## 2. 画布规格

| 项目 | 规范 |
|---|---|
| 逻辑尺寸 | `160px × 160px` |
| 高清素材 | `320px × 320px` @2x |
| 文件格式 | PNG 优先；简单几何 VFX 可用 SVG |
| 背景 | 必须透明 |
| 色彩 | sRGB |
| 边缘 | 不得有白边、黑边、脏边 |
| 留白 | 每个图层必须保留同样画布尺寸，不要裁切到物体边缘 |
| 命名 | 小写英文 + 下划线，禁止中文文件名 |

**重要**：所有身体部件 PNG 必须使用同一张 `160×160` 或 `320×320` 透明画布导出，这样代码可以用同一坐标系统叠放。如果单独裁切每个部件，会导致 pivot、动画和碰撞区域全部错位。

---

## 3. 图层 z-index 顺序

```ts
export const CORECAT_LAYER_Z_INDEX = {
  shadow: 0,
  vfx_back: 5,
  tail: 10,
  body: 20,
  legs: 22,
  pouch: 25,
  arms: 30,
  tools: 35,
  head: 40,
  ears: 42,
  eyes: 45,
  goggles: 50,
  sweat: 55,
  vfx_front: 60,
  ui_panel_anchor: 80,
};
```

---

## 4. 图层功能说明

## 4.1 `shadow.png`

- 脚底环境光遮蔽阴影。
- 不随身体一起上下移动，只通过 opacity 和 scaleX 联动呼吸。
- 应是柔和椭圆，不能像硬边贴片。

## 4.2 尾巴层

```text
tail_root.png
tail_mid.png
tail_tip.png
```

第一版如果美术无法切成三段，也至少要提供：

```text
tail_base.png
```

但推荐三段切分，方便实现链式摆动：根部稳定，中段 `±2°`，尾端 `±4°`。

## 4.3 身体层

```text
body_base.png
leg_left.png
leg_right.png
pouch.png
arm_left.png
arm_right_wrench.png
```

要求：

1. `body_base` 不要包含可独立大幅运动的手臂和尾巴。
2. `pouch` 工具包必须独立，因为 Quick Panel 要从这里展开。
3. `arm_right_wrench` 必须独立，因为点击、修复、高温、数据整理都要驱动右手。
4. `leg_left/right` 独立，方便做承重、踩踏、落地反馈。

## 4.4 头部层

```text
head_base.png
ear_left.png
ear_right.png
goggles.png
goggles_glass_highlight.png
```

要求：

1. `head_base` 不包含眼睛和护目镜。
2. 耳朵必须独立，允许随机微颤。
3. 护目镜必须独立，允许 hover 视差和 sleep 上推。
4. 护目镜玻璃高光可单独一层，方便做 shimmer。

## 4.5 眼睛层

```text
eye_normal.png
eye_blink.png
eye_focused.png
eye_dizzy.png
eye_sleepy.png
eye_glowing.png
eye_wink.png
eye_confused.png
```

要求：

1. 所有眼睛图层位置必须完全对齐。
2. 表情切换只替换 `eyes` 图层 image source，不改变骨骼位置。
3. 眼睛必须适配 hover 位移，边缘不能超出脸部轮廓。

---

## 5. Pivot / Transform Origin 规范

Codex 必须在 `manifest.json` 中读取每个图层的 pivot。美术交付时要遵守以下默认锚点。

```json
{
  "canvas": { "width": 160, "height": 160, "scale": 1 },
  "bones": {
    "root": { "pivot": [80, 120] },
    "shadow": { "pivot": [80, 136] },
    "body_base": { "pivot": [80, 105] },
    "body_squash_proxy": { "pivot": [80, 125] },
    "tail_root": { "pivot": [58, 106] },
    "tail_mid": { "pivot": [48, 103] },
    "tail_tip": { "pivot": [36, 99] },
    "leg_left": { "pivot": [68, 128] },
    "leg_right": { "pivot": [92, 128] },
    "pouch": { "pivot": [106, 112] },
    "arm_left": { "pivot": [58, 92] },
    "arm_right_wrench": { "pivot": [102, 92] },
    "tool_wrench": { "pivot": [116, 74] },
    "tool_fan": { "pivot": [116, 74] },
    "tool_tablet": { "pivot": [56, 88] },
    "tool_ram_box": { "pivot": [80, 48] },
    "head_base": { "pivot": [80, 68] },
    "ear_left": { "pivot": [57, 40] },
    "ear_right": { "pivot": [103, 40] },
    "goggles": { "pivot": [80, 62] },
    "eyes": { "pivot": [80, 66] },
    "sweat_drop": { "pivot": [100, 52] },
    "sleep_bubble_anchor": { "pivot": [99, 64] },
    "vfx_anchor_tool": { "pivot": [118, 72] },
    "vfx_anchor_feet": { "pivot": [80, 132] },
    "vfx_anchor_front": { "pivot": [104, 92] },
    "vfx_anchor_back": { "pivot": [54, 96] }
  }
}
```

**说明**：以上坐标是建议值。正式美术完成后可以微调，但必须由 `manifest.json` 统一管理，不要散落在组件代码里。

---

## 6. CSS 命名规范

```css
.corecat-root {}
.corecat-bone {}
.corecat-bone--shadow {}
.corecat-bone--body-base {}
.corecat-bone--head-base {}
.corecat-bone--eyes {}
.corecat-vfx-layer {}
.corecat-vfx-particle {}
```

每个骨骼图层必须带 `data-bone-id`：

```tsx
<img
  className="corecat-bone corecat-bone--head-base"
  data-bone-id="head_base"
  src={assets.headBase}
/>
```

---

## 7. 交付检查清单

美术 / 图像 AI 输出后必须检查：

- [ ] 是否所有 PNG 都是透明背景。
- [ ] 是否所有图层都是统一画布尺寸。
- [ ] `body_base` 是否没有包含眼睛、护目镜、尾巴、可动右手。
- [ ] `head_base` 是否没有包含眼睛和护目镜。
- [ ] `goggles` 是否独立，且有玻璃高光空间。
- [ ] `ear_left/right` 是否独立。
- [ ] `tail` 是否至少独立，最好三段。
- [ ] `pouch` 是否独立，方便面板从工具包展开。
- [ ] 眼睛所有状态是否完全对齐。
- [ ] 放大 400% 检查边缘是否有脏边。
- [ ] 小尺寸 `80px` 下是否仍然识别为精致工程猫。

---

## 8. 美术风格要求

CoreCat 不是矿工猫，不要给人“挖矿软件”的误解。它应该是：

```text
精致、小巧、橙色工程猫、桌面维护助手、硬件监控伙伴、带护目镜和工具包、可爱但高级、偏游戏资产质感、适合 Windows 桌面常驻。
```

视觉关键词：

```text
chibi engineering cat
premium desktop companion
orange cat
tiny cyber workshop assistant
goggles
small wrench
tool pouch
soft rounded shape
clean silhouette
subtle neon cyan highlights
dark navy glassmorphism UI compatible
not a miner
not crypto
not pickaxe
not mining rig
```

---

## 9. 图像生成提示词

### 9.1 CoreCat 角色分层总提示词

```text
Create a premium game-ready layered 2D character asset for CoreCat, a tiny orange chibi engineering cat desktop companion. It wears small cyber goggles, has a compact tool pouch, a tiny wrench, soft rounded paws, expressive eyes, subtle cyan neon highlights, and a clean high-end Windows desktop companion style. The character must look like a cute hardware maintenance assistant, not a crypto miner, not a pickaxe miner, not a mining app mascot. Transparent background, centered on a 160x160 canvas, clean silhouette, refined details visible at small size, separate layers for body, head, ears, goggles, eyes, tail, arms, legs, pouch, wrench, shadow.
```

### 9.2 负面提示词

```text
crypto miner, mining rig, bitcoin, pickaxe, helmet lamp, dirty industrial miner, bulky robot, scary face, aggressive weapon, large desktop widget, web popup style, ugly sticker, flat static icon, low quality, blurry edges, inconsistent layer alignment, hard black outline, white background
```

### 9.3 表情提示词

```text
Generate aligned eye expression layers for the same CoreCat head: normal bright eyes, blink closed eyes, focused engineer eyes, dizzy overload spiral eyes, sleepy closed curved eyes, glowing achievement eyes, playful wink, confused small-dot eyes. All expressions must align perfectly in the same position, transparent background, same 160x160 canvas.
```

### 9.4 VFX 提示词

```text
Create small pixel-style VFX sprites for CoreCat: cyan cooling particles, golden pixel sparks, soft white steam puffs, blue and green 8x8 data cubes, tiny cyan sleep bubble, orange RAM warning glow, holographic blue panel base. Transparent background, tiny clean game UI effect assets, optimized for a 160px desktop pet.
```

---

## 10. manifest.json 规范

素材目录必须包含 `manifest.json`：

```json
{
  "name": "corecat_skeleton",
  "version": "1.0.0",
  "canvas": {
    "width": 160,
    "height": 160,
    "pixelRatio": 2
  },
  "defaultScale": 1,
  "assets": {
    "shadow": "shadow.png",
    "body_base": "body/body_base.png",
    "leg_left": "body/leg_left.png",
    "leg_right": "body/leg_right.png",
    "pouch": "body/pouch.png",
    "arm_left": "body/arm_left.png",
    "arm_right_wrench": "body/arm_right_wrench.png",
    "head_base": "head/head_base.png",
    "ear_left": "head/ear_left.png",
    "ear_right": "head/ear_right.png",
    "goggles": "head/goggles.png",
    "eyes_normal": "eyes/eye_normal.png",
    "eyes_blink": "eyes/eye_blink.png",
    "eyes_focused": "eyes/eye_focused.png",
    "eyes_dizzy": "eyes/eye_dizzy.png",
    "eyes_sleepy": "eyes/eye_sleepy.png",
    "eyes_glowing": "eyes/eye_glowing.png",
    "tool_wrench": "tools/tool_wrench.png",
    "tool_fan": "tools/tool_fan.png",
    "tool_tablet": "tools/tool_tablet.png",
    "tool_ram_box": "tools/tool_ram_box.png"
  }
}
```

---

## 11. Codex 执行提示词

```markdown
请读取 `/docs/animation/CoreCat_素材分层规范.md`，为 CoreCat 建立素材接入层。

要求：
1. 在 `src/assets/pets/corecat_skeleton/` 下创建与文档一致的目录结构。
2. 如果正式 PNG 不存在，请生成轻量占位 SVG/PNG 或使用 CSS 占位块，但文件名和引用路径必须与正式规范一致。
3. 创建 `manifest.json`，记录 canvas、assets、pivot。
4. 创建 `boneRegistry.ts`，从 manifest 中读取骨骼锚点和图层路径。
5. 创建 `CoreCatLayer.tsx`，根据 boneRegistry 渲染所有骨骼图层。
6. 所有骨骼图层必须使用 absolute positioning、transform-origin、will-change: transform, opacity。
7. 不要把多个部件合成一张图。即使是占位素材，也要保持独立图层。
8. 完成后输出素材目录树、缺失素材清单、占位素材说明和下一步替换正式素材的方法。
```
