# CoreCat 像素风工坊助手猫美术设计报告 (CoreCat Pixel Art Mascot Design Report)

> [!NOTE]
> 本报告基于 [CoreCat_给设计AI使用_像素风工坊助手猫生成规范.md](file:///c:/My/Workplace/Coding/CoreWorkPal/docs/animation/CoreCat_给设计AI使用_像素风工坊助手猫生成规范.md) 中定义的核心美术方向与图层规范，完成了工坊助手猫 **CoreCat** 的整套像素风角色设计。

---

## 1. 角色视觉与创意定位 (Mascot Persona)

CoreCat 不是普通的静态桌面宠物，而是一只**有丰富状态反馈的工坊助手猫**。它具备以下标志性特征：
- **形象主体**：暖橙色像素 Chibi 猫，圆润的大头比例（`chibi` 比例在小尺寸桌宠视口中具备最佳易读性）。
- **识别工具**：佩戴**透明深蓝科技护目镜**（诊断数据载体），右手持**迷你金属扳手**（执行硬件修复/整理工作），腰间挂着**小工具包**（数据模块来源）。
- **动力学尾巴**：三段式分节**机械电缆尾巴**，用作表达灵动情绪的动态部件。

---

## 2. 角色风格探索与站姿设计 (Style Exploration & Standing Pose)

我们通过 AI 生成了 CoreCat 的角色总体风格探索稿与标准待命站姿概念图，确定了其比例、线条粗细与着色规范：

````carousel
![CoreCat 角色风格探索图](C:/Users/WU/.gemini/antigravity-ide/brain/c12378af-bfd2-4902-aefe-96c31882dc0f/corecat_character_concept_1781594824456.png)
<!-- slide -->
![CoreCat 标准待命站姿图](C:/Users/WU/.gemini/antigravity-ide/brain/c12378af-bfd2-4902-aefe-96c31882dc0f/corecat_pixel_idle_pose_1781594909429.png)
````

- **轮廓规范**：统一采用 `1px` - `2px` 的深暗褐色轮廓线，避免使用纯黑。
- **抗锯齿/渐变**：严禁模糊与现代软性渐变，完全使用干净利落的像素色块，保持 **16-bit 赛博像素游戏**风格。

---

## 3. 核心动画状态像素稿 (Core Animation States)

CoreCat 的动作需高度对应电脑的硬件负载与系统的关键事件，以下是设计的 7 个核心状态像素资产：

````carousel
![1. Idle - 待命状态](C:/Users/WU/.gemini/antigravity-ide/brain/c12378af-bfd2-4902-aefe-96c31882dc0f/corecat_pixel_idle.png)
<!-- slide -->
![2. Blink - 眨眼状态](C:/Users/WU/.gemini/antigravity-ide/brain/c12378af-bfd2-4902-aefe-96c31882dc0f/corecat_pixel_idle_blink.png)
<!-- slide -->
![3. Sleep - 低功耗睡眠](C:/Users/WU/.gemini/antigravity-ide/brain/c12378af-bfd2-4902-aefe-96c31882dc0f/corecat_pixel_sleep.png)
<!-- slide -->
![4. Repairing - 修复中](C:/Users/WU/.gemini/antigravity-ide/brain/c12378af-bfd2-4902-aefe-96c31882dc0f/corecat_pixel_repair.png)
<!-- slide -->
![5. Alert - 负载压力与报警](C:/Users/WU/.gemini/antigravity-ide/brain/c12378af-bfd2-4902-aefe-96c31882dc0f/corecat_pixel_alert.png)
<!-- slide -->
![6. DataSorting - 数据整理中](C:/Users/WU/.gemini/antigravity-ide/brain/c12378af-bfd2-4902-aefe-96c31882dc0f/corecat_pixel_sorting.png)
<!-- slide -->
![7. Celebrate - 任务庆祝](C:/Users/WU/.gemini/antigravity-ide/brain/c12378af-bfd2-4902-aefe-96c31882dc0f/corecat_pixel_celebrate.png)
````

### 3.1 状态语义与动作规范

1. **Idle (待命状态)**：呼吸曲线平缓，尾巴呈自然 S 型微摆，护目镜闪烁低亮度微光。适合长期常驻桌面而不打扰用户。
2. **Blink (眨眼状态)**：在 Idle 待命周期中周期性插入，眼睛瞬间闭合（`eye_blink`），表现生命的灵动感。
3. **Sleep (低功耗睡眠)**：猫咪整体剪影变圆缩起，护目镜推到额头上部，双眼呈闭合弧线，鼻子处定时飘起像素鼻泡。触发于系统进入低负载或后台模式。
4. **Repairing (修复中)**：右手扳手有节奏地向下进行敲击，并伴有星形和 L 形的黄色像素火花 VFX 弹出，神态专注。
5. **Alert (负载压力/报警)**：在温度过高（TEMP）或内存拥挤（RAM）时触发。双耳下压，护目镜发出橙红色扫光，身体因压力紧绷。
6. **DataSorting (数据整理)**：右手指向飞舞的蓝青色/淡绿色像素数据块，身前有全息小面板亮起。
7. **Celebrate (庆祝)**：扳手上举，双眼弯成开心线，周身弹出金色星星与蒸汽效果，用作任务完成的瞬间正反馈。

---

## 4. 骨骼与分层资产导出规范 (Layered Skeleton Specs)

> [!IMPORTANT]
> 为支撑骨骼动画（Skeletal Animation）运行时的旋转、倾斜与缩放动效，设计 AI 必须保证所有分层资产以 **`160x160px`** 统一画布导出，不得裁切边缘，以防止旋转中心（Pivot）错位。

### 4.1 核心分层结构
- **背景与影子**：`shadow.png` (完全平视的像素抖动阴影，无渐变)。
- **尾巴分级**：`tail_base.png` ➔ `tail_mid.png` ➔ `tail_tip.png` (允许三段旋转)。
- **身体**：`body_base.png` (去头、手臂与尾巴的躯干)。
- **手臂与工具**：
  - 左手：`arm_left.png`
  - 右手（扳手）：`arm_right_wrench.png`
  - 右手（风扇）：`arm_right_fan.png` (高温状态下替换扳手)。
- **头部**：
  - `head_base.png` (无眼、无耳、无镜的头部基底)。
  - `ears_left.png` 与 `ears_right.png` (独立双耳，表现动态抖动)。
  - `goggles.png` (可随头部运动独立浮动的护目镜图层)。
- **表情层 (Eyes)**：
  - `eye_normal.png` (普通专注眼)
  - `eye_blink.png` (眨眼线)
  - `eye_sleepy.png` (睡眠弯线)
  - `eye_dizzy.png` (报警晕眼)

---

## 5. 调色板与规范总结 (Palette & Summary)

| 色域类型 | 配色范围 | 设计意图 |
|---|---|---|
| **猫身体** | `#F4A641` (橙黄) / `#D48325` (暗橙 shadow) | 暖橙主色，增加温暖与萌感 |
| **护目镜** | `#1A2D4C` (蓝灰) / `#3FC7FF` (霓虹青高光) | 赛博科技感，展示数据交互 |
| **警示态** | `#FF5533` (红橙) / `#FFA641` | 对应内存拥挤与高温，提示性能压力 |
| **数据流** | `#3FC7FF` (全息蓝) / `#ffd75e` (灵感金) | 用于整理数据与修复完成的特效 |

这些像素设计资产现已正式在 [coreCatAssetManifest.ts](file:///c:/My/Workplace/Coding/CoreWorkPal/src/pet/corecat/assets/coreCatAssetManifest.ts) 和静态资源表上完成对齐配置，支持运行时随时热替换加载，完成了工坊助手猫 CoreCat 的全部像素风核心美术设计。
