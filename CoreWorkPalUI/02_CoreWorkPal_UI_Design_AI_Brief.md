# CoreWorkPal UI / 图像设计 AI 出图文档

> 文档用途：交给 UI 设计 AI、图像生成 AI、原型设计 AI。  
> 核心目标：只负责**设计图、角色图、原型图、图标插画、视觉规范**。  
> 明确边界：不写代码，不考虑 Tauri / React / Rust 实现，不输出组件代码。  
> 输出结果：让 Codex 后续可以“照图还原”，而不是让 Codex 自己设计 UI。

---

## 0. 最重要结论

CoreWorkPal 的 UI 不能交给 Codex 自由设计。

设计 AI 的任务是先产出一套足够明确的视觉资产：

```text
CoreCat 角色图
CoreCat 状态图
桌宠窗口视觉稿
Pet Quick Panel 视觉稿
MonitorBar 视觉稿
Main Window / Dashboard / Workshop / Settings / About 原型图
图标、工坊模块插画、资产导出规范
```

Codex 之后只能按照这些图来还原。


---

## 0.1 强制补充：本项目不是静态贴图 UI，必须设计“动态桌宠 + 动效界面”

> 这一条优先级高于所有普通视觉描述。

设计 AI 不能只输出静态 UI 截图或静态宠物贴图。CoreWorkPal 是桌面宠物应用，必须包含可交给 Codex 实现的动画资产和动效说明。

### 0.1.1 设计 AI 必须交付的动态内容

设计 AI 的交付物必须同时包含：

```text
1. 静态最终视觉稿
2. 动画分镜 / Motion Storyboard
3. 动效关键帧说明
4. 可切图的动画资产
5. 每个动效的触发条件、持续时间、循环方式
6. Codex 可实现的动画规格说明
```

禁止只交付：

```text
一张静态 CoreCat PNG
一张静态 Dashboard 图
一张静态 Pet Panel 图
没有分层、没有状态、没有动效说明的贴图
```

### 0.1.2 动画实现优先级

为了避免性能过高，动画分为三类。设计 AI 必须按这三类设计，不要全部做成复杂帧动画。

| 类型 | 用途 | 推荐实现 | 是否必须 |
|---|---|---|---|
| CSS 微动效 | 呼吸、悬停、点击、面板弹出 | CSS transform / opacity | 必须 |
| 分层贴图动效 | 眼睛、耳朵、状态灯、工具光效 | PNG/WebP 分层 + CSS 动画 | 必须 |
| 帧序列 / Lottie | Celebrate、维修、数据整理等明显动作 | WebP 序列 / PNG 序列 / Lottie | P1 推荐 |

MVP 至少要做到：

```text
CoreCat 不是死图。
Idle 有轻微呼吸。
Hover 有眨眼 / 抬头。
Click 有点头反馈。
状态灯有微光。
Pet Panel 有从宠物身边长出的弹出动效。
MonitorBar 有数值变化的柔和过渡。
```

### 0.1.3 CoreCat 动画资产最低交付清单

设计 AI 必须为 CoreCat 输出以下内容：

```text
/assets/pets/corecat_idle_base.png
/assets/pets/corecat_idle_eyes_blink_01.png - 06.png
/assets/pets/corecat_hover_head_01.png - 06.png
/assets/pets/corecat_click_nod_01.png - 06.png
/assets/pets/corecat_status_light_blue.png
/assets/pets/corecat_status_light_orange.png
/assets/pets/corecat_status_light_red.png
/assets/pets/corecat_shadow.png
```

P1 推荐额外交付：

```text
/assets/pets/animations/idle_loop.webp 或 idle_loop_0001.png - 0024.png
/assets/pets/animations/repair_light_0001.png - 0018.png
/assets/pets/animations/temperature_check_0001.png - 0018.png
/assets/pets/animations/data_sorting_0001.png - 0018.png
/assets/pets/animations/sleep_loop_0001.png - 0024.png
/assets/pets/animations/celebrate_once_0001.png - 0024.png
```

帧率建议：

```text
Idle / Sleep 循环：8 - 12 FPS
点击 / Hover 动作：12 FPS
Celebrate 一次性动作：12 - 16 FPS
所有常驻动画必须轻量，不允许高功耗长循环
```

### 0.1.4 UI 动效最低交付清单

设计 AI 必须为以下界面提供动效说明：

```text
Pet Panel 打开：opacity 0→1，scale 0.96→1，translateY 4px→0，140ms
Pet Panel 关闭：opacity 1→0，scale 1→0.98，100ms
MonitorBar hover 展开：宽度 420→560，内容渐显，160ms
MonitorBar 数值变化：数字淡入/轻滑，120ms
Metric Card hover：上浮 2px，描边增强，120ms
状态点：柔和呼吸光，1800ms loop
按钮 hover：背景高光移动，120ms
页面切换：opacity + translateY 轻过渡，160ms
```

### 0.1.5 动效禁止项

```text
禁止把 CoreCat 做成完全静止的贴图
禁止只给一张宠物图却要求 Codex 自己想动画
禁止让 Codex 自行设计动作
禁止大幅跳动、持续旋转、强闪烁
禁止全屏粒子、夸张弹性、长时间循环大动画
禁止所有窗口都用同一种网页 fade 动画
禁止让动画影响用户正常工作
```

### 0.1.6 动效验收标准

设计图通过前必须检查：

```text
CoreCat 静止观察 10 秒，至少能看到轻微生命感
鼠标靠近 CoreCat，有明确但很小的反馈
点击 CoreCat，有 160ms 左右的轻反馈
Pet Panel 像从桌宠身边展开，不像普通弹窗
MonitorBar 展开/收起轻盈，不像网页菜单
所有动效都能用 CSS / 分层 PNG / WebP 序列实现
没有要求 Codex “凭感觉补动画”
```


## 1. 产品视觉定位

产品名称：

```text
CoreWorkPal 桌面伙伴
```

桌宠名称：

```text
CoreCat / 工程猫
```

核心画面想象：

```text
一只住在电脑里的精致工程猫，
带着一套迷你硬件工坊，
用可爱但专业的方式解释电脑状态。
```

产品气质比例：

```text
70% 精致桌宠
20% 硬件监控
10% 轻量养成
```

不是：

```text
硬件监控后台
数据大屏
网页 Dashboard
挖矿软件
币圈收益软件
廉价桌宠贴图
儿童卡通软件
```

---

## 2. 视觉风格名称

```text
Pocket Glass Workshop / 口袋玻璃工坊
```

风格解释：

```text
像一个缩小后贴在桌面上的精致工坊。
深色玻璃、柔和发光、工程猫、迷你零件、状态胶囊、小而高级。
```

关键词：

```text
小巧
精致
高级
克制
柔和
桌宠化
低打扰
可长期挂桌面
数据清晰但不压迫
可爱但不幼稚
专业但不冰冷
```

必须避免：

```text
后台管理系统感
Ant Design 默认感
Material UI 默认感
Bootstrap 默认感
网页模板感
普通硬件监控工具感
廉价手游感
儿童软件感
粗糙 AI 卡通感
大面积霓虹发光
纯数据大屏
挖矿软件感
币圈软件感
矿石 / 矿镐 / 矿机 / 钱包 / 区块链符号
```

---

## 3. Mini 桌宠 UI 最高优先级

设计时必须把 CoreWorkPal 理解为：

```text
一个精致小巧的 mini 桌面宠物，
不是一个长期占据桌面的大型软件窗口。
```

### 3.1 默认桌面占用

长期常驻桌面的只有：

```text
CoreCat 桌宠：默认可视高度 132px - 148px
可选 MonitorBar：默认 420px x 40px
Pet Quick Panel：点击桌宠时短暂展开
主窗口：用户主动打开时才出现
```

默认占用限制：

```text
桌宠默认可视面积 ≤ 屏幕面积 1.6%（1920x1080 基准）
桌宠 + 监控条默认合计占用 ≤ 屏幕面积 2.8%
Pet Panel 展开时合计占用 ≤ 屏幕面积 6%
```

禁止：

```text
默认 260px 以上大桌宠
默认 700px 以上监控长条
默认 1000px 以上主窗口
宠物面板像普通设置窗口一样铺开
桌宠默认站在屏幕中央
常驻 UI 阻挡用户工作区核心内容
```

### 3.2 三层 UI 结构

| 层级 | 名称 | 触发方式 | 设计重点 |
|---|---|---|---|
| L1 | CoreCat 常驻桌宠 | 默认显示 | 最小、安静、陪伴感 |
| L2 | Pet Quick Panel | 单击桌宠 | 快捷操作、关键监控、轻设置 |
| L3 | Main Workshop Window | 双击 / 面板 / 托盘 | 完整工坊、Dashboard、设置 |

规则：

```text
L1 永远最小、最安静。
L2 是快捷层，不承载复杂设置。
L3 才承载完整页面，但也必须紧凑。
```

---

## 4. 设计 Token 与尺寸基准

所有视觉稿必须基于以下尺寸输出，不要擅自放大。

```css
:root {
  --mini-pet-canvas-w: 168px;
  --mini-pet-canvas-h: 188px;
  --mini-pet-visible-h: 142px;

  --mini-panel-w: 276px;
  --mini-panel-min-h: 260px;
  --mini-panel-default-h: 318px;
  --mini-panel-max-h: 360px;

  --mini-monitor-w: 420px;
  --mini-monitor-h: 40px;
  --mini-monitor-compact-w: 260px;
  --mini-monitor-compact-h: 34px;
  --mini-monitor-expanded-w: 560px;
  --mini-monitor-expanded-h: 44px;

  --main-window-w: 880px;
  --main-window-h: 560px;
  --main-window-min-w: 760px;
  --main-window-min-h: 500px;

  --mini-titlebar-h: 44px;
  --mini-sidebar-w: 156px;
  --mini-card-radius: 14px;
  --mini-panel-radius: 18px;
  --mini-chip-h: 26px;
  --mini-button-h: 30px;
}
```

---

## 5. 色彩系统

```css
:root {
  --color-bg-950: #0B111A;
  --color-bg-900: #111927;
  --color-bg-850: #151F2E;
  --color-bg-800: #1B2636;

  --color-surface-900: rgba(18, 27, 40, 0.92);
  --color-surface-800: rgba(27, 38, 54, 0.86);
  --color-surface-700: rgba(38, 52, 72, 0.78);
  --color-surface-glass: rgba(20, 30, 44, 0.68);

  --color-border-soft: rgba(152, 178, 206, 0.16);
  --color-border-strong: rgba(244, 166, 65, 0.42);

  --color-text-primary: #F4F7FB;
  --color-text-secondary: #B9C5D4;
  --color-text-muted: #7E8FA3;

  --color-brand-orange: #F4A641;
  --color-brand-orange-strong: #FFB856;
  --color-brand-orange-soft: rgba(244, 166, 65, 0.18);

  --color-tech-cyan: #5ED0FF;
  --color-tech-cyan-soft: rgba(94, 208, 255, 0.16);

  --color-insight-gold: #FFD75E;
  --color-insight-gold-soft: rgba(255, 215, 94, 0.16);

  --color-success: #70E083;
  --color-success-soft: rgba(112, 224, 131, 0.16);

  --color-warning: #FF9A3C;
  --color-warning-soft: rgba(255, 154, 60, 0.18);

  --color-danger: #FF6B4A;
  --color-danger-soft: rgba(255, 107, 74, 0.18);
}
```

色彩原则：

```text
背景以深蓝黑为主。
品牌强调色为小面积橙色。
硬件科技感使用青蓝色。
灵感/奖励使用金色。
警告使用红橙色，但不能刺眼。
不要使用纯黑、纯白、大面积高饱和色。
```

---

## 6. 字体与排版

```text
中文：Microsoft YaHei UI
英文：Segoe UI
数字：Cascadia Mono / Consolas
```

字号：

```text
标题：20px - 28px，700
页面说明：13px - 14px，400
卡片标题：15px - 17px，700
指标数值：28px - 42px，700，等宽字体
监控条数字：22px - 28px，等宽字体
桌宠小面板文字：12px - 14px，紧凑但清晰
```

数字必须等宽对齐，不要像普通网页数字一样跳动。

---

## 7. 精致感来源

高级感不靠“大”，靠细节密度。

每个 UI 面板至少体现以下细节中的 3 项：

```text
1px 半透明描边
顶部 1px 玻璃高光
轻微内阴影
低透明噪点纹理
小面积橙色重点光
状态点微光
极细分割线
紧凑但留白准确
数字等宽对齐
动效短、软、轻
```

禁止靠以下方式制造高级感：

```text
大面积发光
大面积渐变
巨大的卡片
很宽的 Dashboard
复杂数据大屏
持续粒子动画
夸张弹跳动画
大量按钮同时出现
```

---

## 8. CoreCat 角色设计

### 8.1 角色方向

```text
橘白 Q 版工程猫
圆脸
大眼
小短腿
护目镜
工具腰包
诊断平板
小扳手
```

### 8.2 角色气质

```text
可爱但不幼稚
专业但不冰冷
像电脑里的迷你工程师
不是矿工
不是币圈角色
不是粗糙贴纸
不是普通卡通猫
```

### 8.3 角色比例要求

```text
头身比偏 Q 版
头部略大
身体短小
站姿稳定
五官清晰
128px 高度下仍能辨认护目镜、工具腰包、平板或扳手
```

### 8.4 导出要求

```text
透明背景 PNG 或 WebP
源文件建议 1024 x 1024
运行显示高度 96px - 220px
默认显示高度 132px - 148px
角色四周保留 8% - 12% 安全边距
角色边缘无白边
不同状态图同一骨架、同一比例、同一视角
```

---

## 9. CoreCat 状态图清单

需要输出 8 个状态图。

| 状态 | 姿态 | 微元素 | 气泡倾向 |
|---|---|---|---|
| Idle | 站立抱平板 | 小蓝点呼吸 | 不主动弹 |
| RepairLight | 单手拿扳手 | 橙色小火花 | 轻提示 |
| RepairHeavy | 戴护目镜弯腰 | 工具包微光 | 只提示一次 |
| TemperatureCheck | 举温度计 | 冷却蓝光 | 短句 |
| MemoryCrowded | 抱零件箱 | 箱子轻晃 | 短句 |
| DataSorting | 看数据平板 | 小数据点流动 | 短句 |
| Sleep | 坐下打盹 | 极小 Zzz | 不弹面板 |
| Celebrate | 举小扳手 | 金色星点一次 | 2 秒内消失 |

---

## 10. CoreCat 主提示词

用于生成角色总设计图：

```text
Create a premium mini desktop pet character named CoreCat for CoreWorkPal.

Character: cute orange-white chibi engineering cat, round face, expressive large eyes, tiny short legs, wearing small engineering goggles, a compact tool belt, holding a diagnostic tablet and a tiny wrench.

Style: polished premium desktop companion, not childish, not cheap cartoon, not anime girl, not 3D toy, not mining mascot. It should feel like a tiny professional engineer living inside the computer.

Design requirements:
transparent background,
3/4 front view,
soft foot shadow,
clean silhouette,
readable details at 128px height,
same proportions suitable for multiple sprite states,
subtle warm orange and cyan technology accents,
no coins, no mining, no blockchain, no crypto symbols, no pickaxe, no helmet lamp.
```

---

## 11. CoreCat 状态图提示词

### 11.1 Idle

```text
CoreCat idle pose, standing calmly, holding a small diagnostic tablet, tiny blue status light breathing, cute but professional, premium polished mini desktop pet style, transparent background, same 3/4 view and proportions as the base character.
```

### 11.2 RepairLight

```text
CoreCat light repair pose, one paw holding a tiny wrench, slight focused expression, small warm orange spark near the tool, cute engineering cat, premium desktop pet sprite, transparent background, same 3/4 view and proportions.
```

### 11.3 RepairHeavy

```text
CoreCat heavy repair pose, goggles lowered, bending slightly to inspect a tiny hardware module, compact tool belt glowing softly, focused but cute, premium mini desktop pet, transparent background, same proportions and 3/4 view.
```

### 11.4 TemperatureCheck

```text
CoreCat temperature check pose, holding a tiny thermometer, subtle cyan cooling glow, calm professional expression, premium polished mini desktop pet, transparent background, same proportions and 3/4 view.
```

### 11.5 MemoryCrowded

```text
CoreCat memory crowded pose, hugging a small parts box with tiny RAM sticks, slightly worried but adorable expression, compact engineering cat style, premium desktop pet sprite, transparent background, same proportions and 3/4 view.
```

### 11.6 DataSorting

```text
CoreCat data sorting pose, looking at a glowing diagnostic tablet, tiny floating data dots, calm focused expression, premium mini engineering cat desktop pet, transparent background, same proportions and 3/4 view.
```

### 11.7 Sleep

```text
CoreCat sleep pose, sitting and napping, goggles resting on head, tiny subtle Zzz, peaceful expression, premium polished desktop pet style, transparent background, same proportions and 3/4 view.
```

### 11.8 Celebrate

```text
CoreCat celebrate pose, raising a tiny wrench, one-time small golden sparkle, happy but not exaggerated, premium polished desktop pet style, transparent background, same proportions and 3/4 view.
```

---

## 12. 桌宠窗口视觉稿

### 12.1 画布

```text
Canvas: 168 x 188
Visible pet height: 132px - 148px
Background: transparent
```

### 12.2 图层

```text
Layer 1：脚底柔和阴影，宽约角色宽度 72%，高度 10px - 14px
Layer 2：CoreCat 主体图
Layer 3：小状态灯或微型工具光效，不超过 18px
Layer 4：短气泡，仅状态变化或 hover 时显示
```

### 12.3 气泡

```text
最大宽度：176px
高度：28px - 42px
字体：12px
圆角：12px
显示时长：2200ms - 3200ms
```

气泡文案例子：

```text
CPU 有点忙，我在看着。
温度稳定，很舒服。
内存有点挤哦。
今天零件攒了不少。
```

禁止：

```text
多行长文本
聊天应用样式
大白底
遮挡桌宠主体
频繁连续弹出
```

---

## 13. Pet Quick Panel 视觉稿

### 13.1 定位

Pet Quick Panel 不是设置窗口，而是：

```text
CoreCat 的随身工具面板。
```

它必须像从桌宠身边长出来的小 UI。

### 13.2 尺寸

```text
默认宽度：276px
最小宽度：252px
最大宽度：300px
默认高度：318px
高度范围：260px - 360px
圆角：18px
内边距：12px
```

### 13.3 内容结构

```text
顶部：CoreCat 状态
中部：硬件摘要
中部：快捷操作
底部：宠物设置
```

推荐结构：

```text
┌────────────────────────────┐
│ CoreCat  ● 良好      ⚙ ×    │
│ CPU 很稳，我在旁边看着呢。    │
├────────────────────────────┤
│ CPU 32%  RAM 68%  58℃       │
│ 效率 高效  稳定 良好          │
├────────────────────────────┤
│ [打开] [暂停] [监控] [隐藏]   │
├────────────────────────────┤
│ 大小       ━━━●━━  92%       │
│ 透明度     ━━━━●━  86%       │
│ 静态 ○  低功耗 ○  气泡 ●     │
└────────────────────────────┘
```

### 13.4 视觉要求

```text
深色玻璃
橙色细描边
青蓝状态光
小三角箭头指向桌宠
顶部有 CoreCat 小头像
按钮小巧
信息紧凑
```

### 13.5 Pet Panel Mockup Prompt

```text
Create a small floating pet quick panel UI for CoreWorkPal.

Size: 276x318.
Style: dark transparent glass panel, premium, compact, rounded 18px, orange thin border, cyan status glow, tiny triangle pointer toward the pet.

Content:
Header with CoreCat tiny avatar, status dot, title CoreCat, close button.
Short message line.
Hardware chips: CPU 32%, RAM 68%, 58℃.
Status row: Efficiency high, Stability good.
Four compact buttons:
Open, Pause, Monitor, Hide.
Two sliders:
Size, Opacity.
Three toggles:
Static, Low Power, Bubble.

Important:
looks like a tool pouch popping from the desktop pet, not a normal settings window.
No large layout, no white background, no admin UI, no crypto, no mining symbols.
```

---

## 14. MonitorBar 视觉稿

### 14.1 定位

MonitorBar 不是工具条，而是：

```text
桌面上的状态胶囊。
```

### 14.2 三种模式

| 模式 | 尺寸 | 内容 | 触发 |
|---|---:|---|---|
| Micro | 260 x 34 | CoreCat + CPU + RAM | 用户选择紧凑模式 |
| Default | 420 x 40 | CoreCat + CPU + RAM + TEMP + Parts/min | 默认 |
| Expanded | 560 x 44 | 增加 NET / GPU | hover 或用户固定 |

默认模式示例：

```text
🐱  CPU 23%   RAM 46%   68℃   +32/min
```

### 14.3 MonitorBar Mockup Prompt

```text
Create a tiny floating monitor bar for CoreWorkPal desktop companion.

Default size: 420x40.
Shape: rounded pill capsule.
Style: dark translucent glass, soft shadow, thin inner border, premium compact UI, tiny CoreCat avatar on the left.

Content:
CoreCat avatar,
CPU 23%,
RAM 46%,
68℃,
+32/min.

Use monospaced numbers, small separators, orange and cyan accents.
Do not make it a long toolbar.
No white background, no crypto, no mining.
```

---

## 15. 主窗口 Main Window 视觉稿

### 15.1 尺寸

```text
默认宽：880px
默认高：560px
最小宽：760px
最小高：500px
圆角：20px
背景：深蓝黑渐变 + 玻璃面板
```

### 15.2 结构

```text
┌──────────────────────────────────────────────┐
│ 自定义标题栏 44px                             │
├──────────────┬───────────────────────────────┤
│ 左侧窄导航栏   │ 页面内容                       │
│ 156px         │                               │
└──────────────┴───────────────────────────────┘
```

### 15.3 标题栏

内容：

```text
左侧：CoreCat 小头像 + CoreWorkPal 桌面工坊
中间：当前状态胶囊，如“维修中 · 运行良好”
右侧：稳定度、零件、灵感、窗口控制按钮
```

### 15.4 左侧导航

导航项：

```text
Dashboard 控制台
Workshop 工坊
Settings 设置
About 关于
```

选中状态：

```text
橙色渐变背景 + 左侧发光条 + 轻微外发光
```

---

## 16. Dashboard 页面视觉稿

### 16.1 页面定位

Dashboard 不是数据总览页，而是：

```text
CoreCat 的工坊控制台。
```

### 16.2 布局

```text
┌──────────────────────────────────────┐
│ 工坊控制台        状态胶囊 / 资源摘要 │
├──────────────┬───────────────────────┤
│ CoreCat      │ CPU   GPU   RAM       │
│ Hero Mini    │ NET   TEMP  DISK      │
│ 276x316      │ 3x2 mini cards        │
├──────────────┴───────────────────────┤
│ Parts | Insight | Efficiency | Stability │
└──────────────────────────────────────┘
```

### 16.3 Dashboard Mockup Prompt

```text
Create a high-end compact desktop app dashboard UI mockup for CoreWorkPal, a Windows mini desktop pet and hardware workshop app.

Window size: 880x560.
Style: Pocket Glass Workshop, dark navy glassmorphism, premium compact game UI, small engineering cat mascot, soft orange and cyan accents, rounded cards, subtle glow, no admin dashboard feeling.

Layout:
custom title bar 44px,
left compact sidebar 156px,
main content dashboard.
Left hero card with CoreCat standing on a mini workshop base.
Right side 6 compact metric cards:
CPU Core Workbench,
GPU Graphic Bench,
RAM Parts Warehouse,
NET Transfer Station,
TEMP Cooling Wall,
DISK Archive Cabinet.
Bottom output strip:
Today Parts,
Today Insight,
Efficiency,
Stability,
Online Time.

Important:
compact, refined, not large, not web template, not corporate dashboard, no crypto, no mining symbols, no coins.
```

---

## 17. Workshop 页面视觉稿

### 17.1 页面定位

Workshop 不允许只是数据卡片网格。它必须像：

```text
迷你硬件工坊地图。
```

### 17.2 六个模块

```text
CPU：蓝色核心芯片 + 小工作台
GPU：图形平台 + 风扇 + 发光线
RAM：货架 + 内存条 + 零件箱
Network：传输塔 + 数据包 + 小推车
Temperature：风扇墙 + 温度计 + 冷光
Disk：档案柜 + 数据盘 + 归档标签
```

### 17.3 Workshop Mockup Prompt

```text
Create a compact premium mini workshop map UI for CoreWorkPal.

Window size: 880x560.
Style: dark glass, tiny hardware workshop, refined game UI, warm orange key light, cyan technical light.

The page should look like a miniature hardware workshop map, not a data table.
Six module cards:
CPU core chip workbench,
GPU fan graphic platform,
RAM parts shelf,
Network transfer tower,
Temperature cooling wall,
Disk archive cabinet.

Each module has a small illustration, module number, Chinese and English title, tiny status badge, progress line.
Bottom upgrade bar shows parts, insight, level, efficiency, stability and a glowing upgrade button.

No mining, no coins, no blockchain, no big dashboard.
```

---

## 18. Settings 页面视觉稿

Settings 页面不要像系统设置表单，要像：

```text
CoreCat 的工作方式配置台。
```

布局：

```text
左侧：CoreCat 头像与状态
右侧：设置卡片网格
```

卡片：

```text
桌宠设置
监控条设置
运行设置
安全与隐私
```

必须有：

```text
宠物大小 Slider
透明度 Slider
气泡提示 Toggle
静态模式 Toggle
显示监控条 Toggle
紧凑模式 Toggle
低功耗模式 Toggle
开机自启动 Toggle
通知提醒 Toggle
暂停 CoreCat
退出 CoreWorkPal
```

### Settings Mockup Prompt

```text
Create a compact premium settings screen for CoreWorkPal.

Window size: 880x560.
Style: Pocket Glass Workshop, dark glass, small refined cards, no system settings form feeling.

Layout:
left side CoreCat status portrait,
right side compact settings cards.
Cards:
Pet Settings with size slider, opacity slider, bubble toggle, static mode toggle.
Monitor Bar Settings with show toggle, compact mode toggle, position option.
Run Settings with low power mode, launch at startup, notifications, sound feedback.
Safety & Privacy card with local-only, no hidden load, no crypto/mining, can pause and exit.

Important:
refined, tiny, desktop pet configuration console, not a corporate settings page, no white background.
```

---

## 19. About 页面视觉稿

About 页面要像欢迎页，不是文字说明页。

Hero 内容：

```text
CoreWorkPal 桌面工坊
让工程更有序，让创意更自由
CoreCat 中小尺寸角色图 + 迷你工坊背景
```

信息卡片：

```text
产品说明
安全说明
版本信息
本地数据与隐私
快捷入口
```

### About Mockup Prompt

```text
Create a premium compact About / Welcome screen for CoreWorkPal.

Window size: 880x560.
Style: dark navy glass workshop, warm orange highlight, small CoreCat mascot in a mini workshop scene.

Content:
Hero title: CoreWorkPal Desktop Workshop.
Subtitle: Make engineering orderly and creativity freer.
Cards:
Product intro,
Safety notes,
Version info,
Local data and privacy,
Quick actions.

Important:
feels like a polished game companion welcome page, not markdown, not legal document, no admin UI, no mining or crypto symbols.
```

---

## 20. 右键菜单视觉稿

禁止使用浏览器默认菜单或系统默认白色菜单。

菜单项：

```text
打开主界面
显示迷你面板
暂停 / 继续产出
显示 / 隐藏监控条
静态模式
隐藏桌宠
退出应用
```

视觉：

```text
深色玻璃
圆角 14px
宽度 190px
单项高度 36px
图标 16px
字体 13px
悬停橙色弱高亮
危险项红橙色
```

---

## 21. 图标与工坊模块插画

需要输出：

```text
CPU Core Workbench 插画
GPU Graphic Bench 插画
RAM Parts Warehouse 插画
NET Transfer Station 插画
TEMP Cooling Wall 插画
DISK Archive Cabinet 插画
App icon
Tray icon
CoreCat 小头像
状态点 / 徽章 / 按钮图标
```

插画风格：

```text
微型硬件工坊插画
深色背景下可读
小尺寸清晰
柔和橙色与青蓝光
不要矿石、矿镐、金币、矿车、矿机
```

---

## 22. 资产命名规范

```text
assets/pets/corecat_idle.png
assets/pets/corecat_repair_light.png
assets/pets/corecat_repair_heavy.png
assets/pets/corecat_temperature_check.png
assets/pets/corecat_memory_crowded.png
assets/pets/corecat_data_sorting.png
assets/pets/corecat_sleep.png
assets/pets/corecat_celebrate.png

assets/icons/app_icon.png
assets/icons/tray_icon.png
assets/icons/corecat_avatar.png

assets/modules/module_cpu_core_workbench.png
assets/modules/module_gpu_graphic_bench.png
assets/modules/module_ram_parts_warehouse.png
assets/modules/module_net_transfer_station.png
assets/modules/module_temp_cooling_wall.png
assets/modules/module_disk_archive_cabinet.png

assets/mockups/main_dashboard.png
assets/mockups/workshop.png
assets/mockups/settings.png
assets/mockups/about.png
assets/mockups/pet_quick_panel.png
assets/mockups/monitor_bar_micro.png
assets/mockups/monitor_bar_default.png
assets/mockups/monitor_bar_expanded.png
assets/mockups/context_menu.png
```

---

## 23. 最终交付物清单

设计 AI 最终必须输出：

```text
1. CoreCat 角色总设计图
2. CoreCat 8 个状态图，透明背景
3. CoreCat 小头像
4. Main Window Dashboard 原型图
5. Workshop 页面原型图
6. Settings 页面原型图
7. About 页面原型图
8. Pet Quick Panel 原型图
9. MonitorBar 三种模式原型图：Micro / Default / Expanded
10. 右键菜单原型图
11. 6 个工坊模块插画
12. App icon / Tray icon
13. 色彩、字体、间距、圆角、阴影规范
14. 资产命名表与导出尺寸表
```

---

## 24. UI 失败判定

出现以下情况，直接判定 UI 不合格：

```text
桌宠默认高度超过 180px
桌宠像一个大贴纸压在桌面上
Pet Panel 宽度超过 320px
Pet Panel 高度超过 400px
MonitorBar 宽度超过 600px
主窗口默认宽度超过 1000px
主窗口像数据大屏
Dashboard Hero Card 过大，挤压其他内容
桌宠气泡像聊天窗口
所有信息都堆在桌面常驻层
按钮、滑块、卡片使用默认浏览器样式
出现币、矿石、矿镐、矿机、钱包、链条等挖矿联想元素
```

---

## 25. 可直接发送给设计 AI 的总提示词

```text
你是资深桌面宠物游戏 UI 设计师和角色设计师。请为 CoreWorkPal 设计完整的 UI 视觉稿和 CoreCat 桌宠角色资产。

CoreWorkPal 是 Windows mini 桌面宠物 + 硬件监控 + 轻量工坊养成应用。核心角色是 CoreCat，一只橘白 Q 版工程猫，像住在电脑里的迷你工程师。它不是矿工猫，不是挖矿软件，不涉及币、钱包、收益、区块链。

视觉风格为 Pocket Glass Workshop / 口袋玻璃工坊：深色玻璃、柔和发光、精致小巧、桌宠化、迷你硬件工坊、低打扰、可长期挂桌面。高级感来自细边框、高光、内阴影、噪点纹理、小面积橙色和青蓝状态光，不靠大面积发光和巨大卡片。

请输出：
1. CoreCat 角色总设计图；
2. CoreCat 8 个状态图：Idle、RepairLight、RepairHeavy、TemperatureCheck、MemoryCrowded、DataSorting、Sleep、Celebrate；
3. Pet Quick Panel 276x318 视觉稿；
4. MonitorBar 三种模式：260x34、420x40、560x44；
5. Main Window 880x560 Dashboard 视觉稿；
6. Workshop 880x560 迷你硬件工坊地图视觉稿；
7. Settings 880x560 视觉稿；
8. About 880x560 视觉稿；
9. 右键菜单视觉稿；
10. 6 个工坊模块插画和 App / Tray icon。

严格限制：桌宠默认可视高度 132px - 148px，Pet Panel 最大宽度 300px、高度 360px，MonitorBar 最大 560px 宽，Main Window 默认 880x560。禁止后台管理系统感、网页模板感、普通硬件监控软件感、廉价手游感、粗糙 AI 卡通感、矿石、矿镐、矿机、金币、钱包、区块链符号。

请先输出完整视觉稿，不要输出代码。
```
