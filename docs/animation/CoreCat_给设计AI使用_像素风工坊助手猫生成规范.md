# CoreCat 像素风工坊助手猫设计 AI 生成规范

> 适用对象：图像生成 AI、像素风设计 AI、角色设计 AI、动效设计 AI、UI/游戏美术 AI。  
> 不适用对象：Codex、代码生成器、工程实现 Agent。  
> 核心目标：让设计 AI 生成一套可用于后续动画运行时接入的 **像素风分层 CoreCat 角色资产**，包括角色概念图、关键状态稿、分层爆炸图、VFX 小素材、调色板和导出规范。  
> 角色定位：CoreCat 是一只 **工坊助手猫**，不是普通静态桌宠。它需要通过像素风角色动作，表达硬件状态、工坊任务、修复/清理结果、窗口交互和低功耗状态。

---

## 0. 给设计 AI 的总指令

请根据以下设定，为 CoreCat 设计一只 **精致小巧的像素风工坊助手猫**。

CoreCat 应该具备：

- 可爱的猫咪轮廓。
- 工坊助手 / 电脑硬件管家气质。
- 护目镜、小扳手、工具包、机械尾巴或电缆尾巴等识别元素。
- 像素风格，适合小尺寸桌面宠物显示。
- 透明背景，便于后续导入应用。
- 可拆分图层结构，不能是一整张静态猫图。
- 每个状态应有明确情绪和硬件语义。

不要输出代码。  
不要解释工程实现。  
请专注于角色设计、像素美术、动作姿态、VFX 小素材和分层资产。

---

## 1. 推荐生成流程

建议设计 AI 按以下顺序生成，不要一次性生成所有内容。

```text
Step 1：生成 CoreCat 角色风格探索图
Step 2：生成 CoreCat 标准 Idle 站姿
Step 3：生成 9 张关键状态概念稿
Step 4：生成角色分层爆炸图
Step 5：生成各独立图层资产
Step 6：生成 VFX 小 sprite
Step 7：生成调色板
Step 8：生成导出说明和美术验收图
```

---

## 2. 核心美术方向

### 2.1 角色关键词

```text
pixel art, chibi cat, workshop assistant, hardware engineer mascot,
tiny desktop pet, orange cat, goggles, mini wrench, tool pouch,
mechanical tail, cyber workshop, cute but capable, compact silhouette,
transparent background, game sprite, clean pixel outline
```

### 2.2 中文风格描述

CoreCat 是一只橙黄色像素小猫，体型小巧圆润，戴着透明深蓝科技护目镜，手持迷你扳手，腰间挂着小工具包。整体感觉像电脑硬件工坊里的小助手，既可爱又可靠。它不是普通表情包猫，而是能反馈 CPU、内存、温度、修复任务和错误状态的拟人化工坊仪表盘。

### 2.3 应避免的方向

```text
不要写实猫
不要 3D 渲染
不要厚涂插画
不要复杂背景
不要大面积渐变
不要模糊光效
不要抗锯齿
不要过度可爱幼稚
不要像普通表情包
不要像加密货币或挖矿软件吉祥物
不要把所有部件画成一张整图
不要让护目镜、扳手、工具包缺失
```

---

## 3. 像素风规格

| 项目 | 要求 |
|---|---|
| 设计画布 | `160x160px` |
| 逻辑绘制网格 | 推荐按 `80x80` 或 `64x64` 像素逻辑绘制 |
| 导出方式 | 放大到 `160x160px`，使用 nearest neighbor |
| 背景 | 透明 |
| 抗锯齿 | 禁止 |
| 模糊 | 禁止 |
| 柔和渐变 | 禁止 |
| 光效 | 用像素块、抖动、扫描线表达 |
| 轮廓线 | 统一 `1px` 或 `2px` |
| 内部明暗 | 最多 `2-3` 档 |
| 尺寸适配 | 小尺寸下眼睛、护目镜、扳手必须清楚可辨 |

---

## 4. 推荐调色方向

| 类型 | 颜色方向 |
|---|---|
| 猫主体 | 橙黄、暖棕、深棕轮廓 |
| 阴影 | 深紫灰或冷灰，不用纯黑 |
| 护目镜 | 深蓝灰玻璃 + 冷青高光 |
| 工坊工具 | 金属灰、黄铜、警示黄 |
| 数据状态 | 青蓝、蓝白 |
| 高温状态 | 橙红 + 冷青对比 |
| 内存拥挤 | 绿色 RAM + 橙色压力警告 |
| 修复状态 | 黄色火花 + 蓝色全息 |
| 庆祝状态 | 金色、白色、小面积粉橙 |
| 错误状态 | 紫红、红色扫描线、少量白色错位像素 |

---

## 5. 必须保留的角色识别元素

设计 AI 生成 CoreCat 时，必须保留以下视觉元素：

1. **猫耳**：左右耳独立，能表达警觉、睡眠、紧张。
2. **大头小身体**：chibi 比例，桌宠小尺寸下更清楚。
3. **护目镜**：工坊科技感核心，必须明显。
4. **小扳手**：右手核心道具，修复、点击、庆祝都用它。
5. **工具包**：Quick Panel、数据方块、工具入口。
6. **三段尾巴**：`tail_base`、`tail_mid`、`tail_tip`，可做机械尾巴或电缆尾巴。
7. **眼睛表情层**：表情主要靠眼睛，不要画死在脸上。
8. **像素风 VFX**：冷却风、数据块、火花、蒸汽、徽章、扫描线。

---

## 6. 图层 / 分层资产要求

设计 AI 生成分层资产时，请保持每个图层为同一张透明画布，例如统一 `160x160px`。不要裁切到内容边界。

### 6.1 主角色图层

| 图层名 | 作用 | 设计要求 |
|---|---|---|
| `shadow` | 地面阴影 | 像素块 / 抖动椭圆，不要模糊渐变 |
| `tail_base` | 尾巴根部 | 与身体后侧重叠 `1-2px`，避免旋转露缝 |
| `tail_mid` | 尾巴中段 | 可做机械 / 电缆感分段 |
| `tail_tip` | 尾巴尖 | 开心、紧张、睡眠时尾巴尖要能表达情绪 |
| `body_base` | 身体主体 | 不包含头、眼睛、手臂、尾巴 |
| `arm_left` | 左手 | 可用于扶面板、平衡、困倦下垂 |
| `arm_right_wrench` | 右手 + 扳手 | 修复、点击、庆祝、数据整理核心层 |
| `head_base` | 头部主体 | 不包含眼睛、护目镜、耳朵 |
| `ears_left` | 左耳 | 用于微颤、警觉、睡眠收起 |
| `ears_right` | 右耳 | 可与左耳不完全对称，更自然 |
| `goggles` | 护目镜 | Hover、高温、错误状态都依赖它 |
| `pouch` | 工具包 | 数据方块、修复工具、Quick Panel 来源点 |

### 6.2 眼睛表情层

请至少生成以下眼睛图层：

| 文件名 | 表情 |
|---|---|
| `eye_normal.png` | 普通专注眼 |
| `eye_blink.png` | 眨眼 / 闭眼瞬间 |
| `eye_focused.png` | 专注修复 / 工作状态 |
| `eye_dizzy.png` | 眩晕 / 内存压力 / 错误 |
| `eye_sleepy.png` | 困倦 / 睡眠 |
| `eye_glowing.png` | 成就 / 庆祝 / 发现异常 |

### 6.3 道具资产

| 文件名 | 用途 |
|---|---|
| `arm_right_fan.png` | 高温状态下替换扳手，表现风扇或冷却工具 |
| `ram_box.png` | 内存拥挤状态，猫抱着 / 顶着 RAM 箱 |
| `wrench_clone.png` | 修复状态的残影或工具影分身 |
| `badge_star.png` | 成就 / 庆祝徽章 |
| `sleep_bubble.png` | 睡眠鼻泡 |

### 6.4 VFX 小 sprite

| 文件名 | 用途 |
|---|---|
| `data_cube.png` | DataSorting 数据方块 |
| `cold_pixel.png` | TemperatureCheck 冷却像素 |
| `cold_wind_line.png` | TemperatureCheck 冷风线 |
| `spark.png` | Repairing 火花 |
| `steam.png` | MemoryCrowded / Celebrate 蒸汽 |
| `golden_star.png` | Celebrate 金色星星 |
| `glitch_line.png` | ErrorGlitch 故障扫描线 |

---

## 7. 设计 AI 通用提示词模板

### 7.1 总体角色概念图提示词

```text
Create a pixel art character design for CoreCat, a tiny chibi workshop assistant cat for a Windows desktop pet app. The character is an orange engineering cat with transparent dark-blue tech goggles, a mini wrench, a small tool pouch, and a segmented mechanical cable-like tail. It should look cute but capable, like a hardware maintenance mascot, not a generic sticker. Clean 1px or 2px pixel outline, limited palette, transparent background, 160x160 canvas, no anti-aliasing, no blur, no soft gradient, compact readable silhouette, suitable for small desktop display.
```

### 7.2 中文总体提示词

```text
请设计一只像素风 CoreCat 工坊助手猫，160x160 透明背景。它是一只橙黄色 chibi 小猫，戴深蓝透明科技护目镜，手持迷你扳手，腰间有小工具包，尾巴像机械电缆分段。整体气质是电脑硬件工坊助手，既可爱又可靠，不是普通表情包。要求像素风，1px 或 2px 统一轮廓，有限调色板，无抗锯齿，无模糊，无柔和渐变，小尺寸下眼睛、护目镜、扳手、工具包都要清楚。
```

### 7.3 负面提示词

```text
realistic cat, 3D render, oil painting, anime full illustration, blurred, soft gradient, anti-aliased, huge background, complex scenery, crypto miner mascot, generic emoji, sticker style, over-detailed, messy pixels, inconsistent outline, oversized character, non-transparent background, merged single image, no goggles, no wrench, no tool pouch
```

---

## 8. 关键状态概念图提示词

第一批请生成 9 张关键状态概念稿。每张都应保持同一角色、同一比例、同一调色板、同一像素风。

---

### 8.1 Idle：工坊待命

```text
Pixel art CoreCat in Idle state, standard standing pose. Orange chibi workshop assistant cat with dark-blue tech goggles, mini wrench, tool pouch, segmented cable-like tail. Body is round and stable, head slightly leaning forward, eyes calm and focused, goggles low glow, tail in relaxed S shape. Clean pixel art, 160x160 transparent background, no anti-aliasing, no blur, limited palette.
```

视觉重点：

- 身体圆润稳定。
- 头轻微前倾。
- 护目镜低亮度。
- 尾巴自然 S 型或机械电缆型。
- 整体克制，不要太夸张。

---

### 8.2 Hover：看向鼠标

```text
Pixel art CoreCat in Hover state, looking toward the mouse cursor. The head, eyes, and goggles subtly shift to one side. The eyes move by only 1 pixel, goggles show a cyan scan highlight. Cute aware expression, as if the cat noticed the user. Keep the same orange workshop assistant cat design, transparent background, 160x160, crisp pixels, no blur.
```

视觉重点：

- 眼睛偏移 `1px` 即可。
- 护目镜出现冷青色扫光。
- 头部略微偏向鼠标方向。
- 不要画成大幅转身。

---

### 8.3 Click：点击回弹

```text
Pixel art CoreCat in Click reaction state, body squashed downward then ready to bounce back. The chibi orange engineer cat looks playful and focused, one eye can wink, right hand spins the tiny wrench, 3 to 5 small pixel stars pop around the hand. Exaggerated game-like squash and stretch pose, transparent background, 160x160, crisp pixels.
```

视觉重点：

- 身体被压扁。
- 扳手转动或形成残影。
- 眼睛可以 wink 或 focused。
- 小星星不要太多，`3-5` 个即可。

---

### 8.4 DataSorting：整理数据

```text
Pixel art CoreCat in DataSorting state. The small orange workshop cat leans slightly forward like working at a tiny desk. Right hand points a tool toward small cyan and green data cubes. Left hand holds a small data box. Eyes are focused. Data cubes appear as 4x4 or 6x6 pixel blocks with 1px highlights. Transparent background, 160x160, clean pixel art.
```

视觉重点：

- 右手指向数据方块。
- 左手可托小数据盒。
- 数据块用蓝青 / 淡绿。
- 状态应该安静、有条理，不要像战斗。

---

### 8.5 MemoryCrowded：内存拥挤

```text
Pixel art CoreCat in MemoryCrowded state, struggling under a heavy RAM box. The orange chibi cat is compressed downward, ears droop, eyes are dizzy or nervous. It holds or supports a large green RAM circuit-board box with orange warning pixels. Small steam puffs and red-orange pressure pixels appear around it. Transparent background, 160x160, crisp pixel art.
```

视觉重点：

- 身体被压低。
- RAM 箱要明显，绿色电路板纹理。
- 耳朵下压。
- 眼睛 dizzy 或紧张。
- 小蒸汽和橙红警告像素。

---

### 8.6 TemperatureCheck：高温冷却

```text
Pixel art CoreCat in TemperatureCheck state, cute cooling emergency mode. The orange workshop cat looks tense, goggles show cyan and red-orange warning scan lines, right hand holds a tiny fan or cooling tool, tail is upright and tense. Add broken 1px and 2px cyan cold wind lines, tiny cold pixels, and a few temperature warning dots. Transparent background, 160x160, no soft fog, crisp pixel wind lines.
```

视觉重点：

- 不用透明雾气。
- 用断续 `1px / 2px` 冷风线。
- 护目镜可有红橙 / 冷青扫描线。
- 右手是风扇或冷却工具。
- 尾巴紧绷。

---

### 8.7 Repairing：修复中

```text
Pixel art CoreCat in Repairing state, side-facing workshop repair pose. The orange engineer cat has focused eyes, right hand strikes with a tiny wrench, with 1 or 2 afterimage frames implied. Left hand holds a small blue hologram panel or hardware part. Add yellow pixel sparks shaped like crosses or L-shapes, and a small cyan hologram screen. Transparent background, 160x160, crisp pixel art.
```

视觉重点：

- 侧身工作姿态。
- 右手扳手敲击。
- 火花用十字形或 L 形。
- 左手扶蓝色全息小面板。
- 表情专注可靠。

---

### 8.8 Sleep / LowPower：低功耗睡眠

```text
Pixel art CoreCat in Sleep or LowPower state, curled up into a round cozy shape. Goggles are pushed up on the forehead by about 8 pixels, eyes are sleepy closed arcs, tail wraps around the front of the body, a small pixelated sleep bubble floats near the nose. Peaceful compact silhouette, transparent background, 160x160, no high-frequency effects.
```

视觉重点：

- 剪影要明显变圆。
- 尾巴环抱身体。
- 护目镜推到额头。
- 鼻泡可做 `8x8` 像素泡。
- 氛围安静治愈。

---

### 8.9 Celebrate：庆祝成功

```text
Pixel art CoreCat in Celebrate state, task completed victory pose. The orange workshop cat crouches then jumps upward, raising the tiny wrench, tail swings widely, eyes glowing or happy closed. Golden pixel stars, small steam ring, and a badge pop around the cat. Heroic but cute workshop mascot pose, transparent background, 160x160, crisp limited-palette pixel art.
```

视觉重点：

- 扳手上举。
- 尾巴大幅摆动。
- 眼睛 glowing 或开心眯眼。
- 金色星星、蒸汽环、徽章。
- 不要做复杂光晕。

---

## 9. 第二批状态概念图提示词

第二批用于补全交互和异常反馈。

### 9.1 BootWake：启动唤醒

```text
Pixel art CoreCat in BootWake state, waking up from a low-power curled pose. The orange workshop cat raises its head, goggles emit a small cyan boot-up scan line, sleepy eyes transition to normal eyes. Compact desktop pet silhouette, transparent background, 160x160, crisp pixels.
```

### 9.2 Dragging：被拖动

```text
Pixel art CoreCat in Dragging state, body tilts opposite to the dragging direction, tail lags behind with inertia, ears slightly pulled by motion, eyes look toward the movement direction. Cute but physically responsive, transparent background, 160x160, crisp pixel art.
```

### 9.3 DropLanding：落地回弹

```text
Pixel art CoreCat in DropLanding state, landing after being dragged. Body is squashed downward, shadow becomes darker, tail rebounds upward, ears bounce slightly. Game-like squash and stretch landing pose, transparent background, 160x160, no blur.
```

### 9.4 PanelOpen：工具包展开

```text
Pixel art CoreCat in PanelOpen state, opening its tool pouch. The pouch glows cyan, right hand pulls out a small diagnostic tablet or tool, the cat points toward an imaginary quick panel. Workshop assistant expression, transparent background, 160x160.
```

### 9.5 PanelClose：工具包关闭

```text
Pixel art CoreCat in PanelClose state, putting tools back into the pouch. The pouch gives a short cyan glow, the body relaxes back to idle, right hand returns to holding the wrench. Transparent background, 160x160, clean pixel art.
```

### 9.6 ErrorGlitch：异常故障

```text
Pixel art CoreCat in ErrorGlitch state, short error warning pose. Goggles show red and purple displaced scan lines, body has 1px horizontal pixel offset, eyes are dizzy or glitch-shaped, small broken pixels float nearby. Do not make it too scary; keep it cute but clearly abnormal. Transparent background, 160x160.
```

### 9.7 UpdateInstalling：安装升级

```text
Pixel art CoreCat in UpdateInstalling state, installing a small hardware module. The cat checks a tiny progress bar or chip, goggles scan the module, small cyan data pixels flow into the progress bar. Focused workshop assistant mood, transparent background, 160x160.
```

### 9.8 AchievementPop：成就弹出

```text
Pixel art CoreCat in AchievementPop state, a small badge or star pops above the head. Eyes glow, the cat briefly poses proudly, 2 to 4 golden pixel stars float upward. Cute compact achievement feedback, transparent background, 160x160.
```

---

## 10. 分层爆炸图提示词

请生成一张 CoreCat 分层爆炸图，用于展示每个独立部件。图像可以不是最终导出资产，但必须清晰展示分层逻辑。

```text
Create a pixel art exploded layer diagram for CoreCat, a chibi orange workshop assistant cat. Show each body part separated but aligned around the character: shadow, tail_base, tail_mid, tail_tip, body_base, arm_left, arm_right_wrench, arm_right_fan, pouch, head_base, ears_left, ears_right, goggles, eye expressions, ram_box, sleep_bubble, badge_star, VFX sprites. Use labels or clear separation. Transparent or simple dark neutral background, crisp pixel art, no blur.
```

中文版本：

```text
请生成 CoreCat 像素风分层爆炸图，展示这只橙黄色工坊助手猫的所有独立部件：shadow、tail_base、tail_mid、tail_tip、body_base、arm_left、arm_right_wrench、arm_right_fan、pouch、head_base、ears_left、ears_right、goggles、eyes 表情层、ram_box、sleep_bubble、badge_star、VFX 小素材。每个部件要分开摆放但保持角色结构关系清楚，像素风，清晰轮廓，不要模糊。
```

---

## 11. Pivot 标记图提示词

请生成一张 pivot 标记图，帮助后续动画制作确定旋转中心。

```text
Create a pixel art pivot guide sheet for CoreCat. Show the full character with colored cross marks indicating rotation pivots: body_base bottom center, head_base neck connection, ears at ear roots, tail_base at body connection, tail_mid joint, tail_tip joint, arms at shoulders, goggles at head center, pouch center. Keep the image clean and technical, suitable for animation handoff.
```

---

## 12. VFX 小素材提示词

### 12.1 数据方块

```text
Create small pixel art data cube sprites for CoreCat DataSorting state. 4x4 and 6x6 pixel cubes, cyan, light blue, mint green, with 1px white highlight. Transparent background, sprite sheet style.
```

### 12.2 冷却风线

```text
Create small pixel art cooling wind line sprites. Broken 1px and 2px cyan wind streaks, no blur, no soft fog, transparent background, suitable for a tiny desktop pet cooling animation.
```

### 12.3 火花

```text
Create yellow pixel spark sprites for a repair animation. Cross-shaped and L-shaped tiny sparks, 3x3 to 7x7 pixels, bright yellow and orange, transparent background.
```

### 12.4 蒸汽

```text
Create pixel steam puff sprites, small blocky white and light gray steam clusters, no blur, no transparency gradient, transparent background, suitable for RAM pressure and celebration effects.
```

### 12.5 金色星星

```text
Create golden pixel star sprites, 5x5 and 7x7 stars, simple bright yellow and white highlights, transparent background, no glow blur.
```

### 12.6 故障扫描线

```text
Create pixel glitch line sprites, red and purple horizontal 1px scan lines, broken segments, small displaced pixel fragments, transparent background.
```

---

## 13. 图层命名结构

设计文件中建议按以下结构建组：

```text
corecat_master
  guide_pivot_do_not_export
  shadow
  tail_base
  tail_mid
  tail_tip
  body_base
  arm_left
  arm_right_wrench
  arm_right_fan
  pouch
  head_base
  ears_left
  ears_right
  goggles
  eyes
    eye_normal
    eye_blink
    eye_focused
    eye_dizzy
    eye_sleepy
    eye_glowing
  props
    ram_box
    wrench_clone
    badge_star
    sleep_bubble
  vfx_sprites
    data_cube
    cold_pixel
    cold_wind_line
    spark
    steam
    golden_star
    glitch_line
```

---

## 14. 导出文件名

请保持文件名和图层名一致，便于后续工程接入。

```text
shadow.png
tail_base.png
tail_mid.png
tail_tip.png
body_base.png
arm_left.png
arm_right_wrench.png
arm_right_fan.png
pouch.png
head_base.png
ears_left.png
ears_right.png
goggles.png
eye_normal.png
eye_blink.png
eye_focused.png
eye_dizzy.png
eye_sleepy.png
eye_glowing.png
ram_box.png
wrench_clone.png
badge_star.png
sleep_bubble.png
data_cube.png
cold_pixel.png
cold_wind_line.png
spark.png
steam.png
golden_star.png
glitch_line.png
```

---

## 15. 交付清单

设计 AI 或设计工具最终应尽量产出以下内容：

1. `corecat_pixel_master.aseprite` / `.psd` / `.fig`
2. `CoreCat` 状态总览图：
   - `Idle`
   - `Hover`
   - `Click`
   - `DataSorting`
   - `MemoryCrowded`
   - `TemperatureCheck`
   - `Repairing`
   - `Sleep`
   - `Celebrate`
3. 分层爆炸图。
4. Pivot 标记图。
5. 一套 `160x160` 透明 PNG 分层资产。
6. 一套 VFX 小 sprite。
7. 一套像素风调色板。
8. 导出说明：
   - 画布尺寸
   - 是否裁切
   - 缩放方式
   - 图层命名
   - 文件命名
   - 是否透明背景
   - 是否禁用抗锯齿

---

## 16. 美术验收标准

生成结果必须满足：

- CoreCat 一眼能看出是猫。
- 一眼能看出是工坊 / 硬件助手。
- 护目镜、扳手、工具包必须清楚。
- 小尺寸下眼睛表情清楚。
- 像素风轮廓统一，不要脏乱。
- 不使用模糊、柔和渐变、真实光效。
- 每个状态有不同视觉语义。
- 高温、内存、错误状态必须一眼能识别。
- `DataSorting` 要安静地忙，不要过度夸张。
- `Idle` 要克制，适合长期桌面常驻。
- 分层资产不能是一张整图。
- 每个导出图层必须保持同一画布大小。
- 每个图层必须透明背景。
- VFX 小 sprite 要少而准，不要碎成噪点。

---

## 17. 最终关键要求

最关键的是：

> 不要把 CoreCat 画成一整张猫图。

CoreCat 必须是：

```text
像素风分层工坊助手猫
```

必须独立拆出：

- 身体
- 头
- 眼睛
- 护目镜
- 耳朵
- 双手
- 三段尾巴
- 工具包
- 道具
- VFX

这些资产后续会交给动画系统或开发工具接入。设计 AI 的任务是把角色、状态和素材画清楚，而不是写代码。
