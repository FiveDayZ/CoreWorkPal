# CoreWorkPal 桌宠与界面 — 纯 UI 设计文档

> 适用对象：UI 设计 AI / 图像生成 AI / 原型设计 AI  
> 文档目的：只描述 CoreCat 桌宠、桌面常驻层、Pet Quick Panel、MonitorBar、主窗口页面、图像资产与原型图的**视觉设计要求**。  
> 重要说明：本文不要求实现代码，不要求处理 Tauri / Rust / React 技术细节。设计 AI 只需要输出高质量视觉稿、角色图、UI 原型和素材规范。

---

## 1. 设计目标

CoreWorkPal 的核心气质不是硬件工具，而是：

```text
一只住在电脑里的精致工程猫，
带着一套迷你硬件工坊，
用可爱但专业的方式解释电脑状态。
```

产品比例：

```text
70% 精致桌宠
20% 硬件监控
10% 轻量养成
```

视觉目标：

```text
小巧
精致
高级
低打扰
可长期停留桌面
有桌宠陪伴感
有迷你工坊氛围
数据清晰但不压迫
可爱但不幼稚
专业但不冰冷
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

必须避免：

```text
后台管理系统感
Ant Design 默认感
Material UI 默认感
网页模板感
廉价手游感
儿童软件感
粗糙 AI 卡通感
纯数据大屏感
挖矿软件感
币圈软件感
巨大控制台感
```

---

## 3. Mini 桌宠 UI 最高优先级

设计时必须把 CoreWorkPal 理解为：

```text
一个精致小巧的 mini 桌面宠物，
不是一个长期占据桌面的大型软件窗口。
```

### 3.1 常驻桌面面积

默认状态下，用户桌面长期出现的只有：

```text
CoreCat 桌宠：默认可视高度 132px - 148px
可选 MonitorBar：默认 420px x 40px
Pet Quick Panel：只在用户点击桌宠时短暂展开
主窗口：只在用户主动打开时出现
```

默认占用限制：

```text
桌宠默认可视面积 ≤ 屏幕面积 1.6%（以 1920x1080 为基准）
桌宠 + 监控条默认合计占用 ≤ 屏幕面积 2.8%
Pet Panel 展开时合计占用 ≤ 屏幕面积 6%
主窗口不属于常驻 UI，但默认也必须紧凑
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

---

## 4. Mini UI 三层结构

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

## 5. 精致感来源

高级感不靠“大”，而靠细节密度。

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

禁止靠以下方式制造“高级感”：

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

## 6. 设计尺寸规范

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

设计 AI 必须遵守这些尺寸，不要擅自放大。

---

## 7. 色彩系统

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

色彩使用原则：

```text
背景以深蓝黑为主。
品牌强调色为小面积橙色。
硬件科技感使用青蓝色。
灵感/奖励使用金色。
警告使用红橙色，但不能刺眼。
不要使用纯黑、纯白、大面积高饱和色。
```

---

## 8. 字体规则

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

---

## 9. 玻璃面板基础质感

基础样式方向：

```css
.glass-panel {
  background:
    linear-gradient(145deg, rgba(255,255,255,0.075), rgba(255,255,255,0.025)),
    rgba(20, 30, 44, 0.68);
  border: 1px solid rgba(152, 178, 206, 0.16);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(22px) saturate(140%);
  border-radius: 18px;
}
```

视觉要求：

```text
不是纯透明。
不是纯色块。
不是白底玻璃。
必须有轻微高光、细边框、柔和阴影。
```

---


---

## 9A. 动态 UI 与动画资产强制规范

CoreWorkPal 不是静态贴图应用。UI 设计必须同时包含静态视觉和动态表现。

### 9A.1 设计目标

```text
CoreCat 要像一个活着的小桌宠。
Pet Panel 要像从桌宠身边长出来的随身工具面板。
MonitorBar 要像桌面上的轻量状态胶囊。
主窗口要有精致微动效，但不能像网页大屏。
```

### 9A.2 必须交付的动画设计文件

```text
Motion_Storyboard_CoreCat.png / md
Motion_Storyboard_PetPanel.png / md
Motion_Storyboard_MonitorBar.png / md
Motion_Storyboard_MainWindow.png / md
Animation_Asset_Manifest.md
```

每个动效都必须写清楚：

```text
触发方式
起始状态
结束状态
持续时间
缓动曲线
是否循环
是否可关闭
Codex 推荐实现方式
```

### 9A.3 CoreCat 分层动画结构

CoreCat 不允许只输出一张整图。至少要有以下图层：

```text
shadow：脚底阴影
body：身体主体
eyes：眼睛 / 眨眼层
ears：耳朵微动层，可选
tool：扳手 / 平板 / 温度计等小道具层
statusLight：状态灯层
effect：火花 / 冷光 / 数据点等轻特效层
bubble：气泡层，由 UI 实现，不烘焙进宠物图
```

### 9A.4 CoreCat MVP 动效表

| 动效 | 触发 | 实现建议 | 时长 / 帧数 | 是否循环 |
|---|---|---|---:|---|
| Idle 呼吸 | 默认 | CSS scale + translateY | 2600ms | 是 |
| 眨眼 | 每 8-16 秒随机 | 眼睛层帧序列 | 6 帧 | 否 |
| Hover 抬头 | 鼠标悬停 | 头部/主体轻位移 | 180-260ms | 否 |
| Click 点头 | 单击 | 主体 rotate/translate | 160ms | 否 |
| 状态灯呼吸 | 状态存在时 | opacity + box-shadow | 1800ms | 是 |
| Alert 闪光 | 状态突变 | 状态灯闪 1 次 | 240ms | 否 |
| Sleep 呼吸 | 睡眠状态 | 慢速 scale | 3200ms | 是 |
| Celebrate | 达成奖励 | WebP/PNG 帧序列 | 18-24 帧 | 否 |

### 9A.5 UI 面板动效表

| 组件 | 动效 | 时长 | 说明 |
|---|---|---:|---|
| Pet Panel Open | opacity + scale + translate | 140ms | 从桌宠侧边长出 |
| Pet Panel Close | opacity + scale | 100ms | 快速收起 |
| 小三角指针 | 跟随 Panel 方向切换 | 0ms | 位置变化即可 |
| Quick Button Hover | 背景微亮 + 1px 边光 | 120ms | 不弹跳 |
| Slider Drag | 数值实时跟随 | 即时 | 无复杂动画 |
| Toggle Switch | 圆点滑动 | 140ms | 轻微缓动 |
| MonitorBar Hover | 展开更多指标 | 160ms | 宽度和内容透明度过渡 |
| Metric Card Hover | 上浮 2px | 120ms | 阴影略增强 |
| 页面切换 | opacity + translateY 4px | 160ms | 不超过 200ms |

### 9A.6 动画资产格式

MVP 推荐：

```text
透明 PNG / WebP 分层资产
CSS transform / opacity 动画
少量 WebP 帧序列
```

P1 可选：

```text
Lottie JSON
Spine / Rive 源文件
更完整的 Sprite Sheet
```

不推荐：

```text
大型视频素材
高帧率长循环 GIF
复杂 3D 动画
全屏粒子系统
```

### 9A.7 交给 Codex 的动效说明格式

每个动效必须按下面格式写，避免 Codex 自己发挥：

```text
动画名称：Pet Panel Open
触发条件：用户单击 CoreCat
初始状态：opacity 0 / scale 0.96 / translateY 4px
结束状态：opacity 1 / scale 1 / translateY 0
持续时间：140ms
缓动：cubic-bezier(0.2, 0.8, 0.2, 1)
实现方式：CSS transition
禁止：弹跳、旋转、大幅位移
```


## 10. CoreCat 角色设计

### 10.1 角色方向

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

### 10.2 气质

```text
可爱但不幼稚
专业但不冰冷
像电脑里的迷你工程师
不是矿工
不是币圈角色
不是粗糙贴纸
不是普通卡通猫
```

### 10.3 角色比例

```text
头身比偏 Q 版
头部略大
身体短小
站姿稳定
五官清晰
128px 高度下仍能辨认护目镜、工具腰包、平板或扳手
```

### 10.4 桌宠窗口视觉

```text
透明背景
只显示猫和少量状态元素
自带柔和脚底阴影
不显示白色方框
不显示网页背景
不显示窗口边框
```

### 10.5 CoreCat Sprite 图层

桌宠图像内部设计为 4 层：

```text
Layer 1：脚底柔和阴影，宽约角色宽度 72%，高度 10px - 14px
Layer 2：CoreCat 主体 PNG / WebP，默认可视高度 132px - 148px
Layer 3：小状态灯或微型工具光效，不超过 18px
Layer 4：短气泡，仅状态变化或 hover 时显示
```

### 10.6 图片导出要求

```text
透明背景
角色四周留 8% - 12% 安全边距
角色边缘无白边
不同状态图必须同一骨架、同一比例、同一视角
源文件建议 1024 x 1024 透明 PNG
运行显示 96px - 220px 高
默认显示 142px 高
```

---

## 11. CoreCat 微状态设计

桌宠不使用大幅动作抢注意力。状态用姿态、眼神、小道具表达。

| 状态 | 姿态 | 微元素 | 气泡风格 |
|---|---|---|---|
| Idle | 站立抱平板 | 小蓝点呼吸 | 不主动弹 |
| RepairLight | 单手拿扳手 | 橙色小火花 | 轻提示 |
| RepairHeavy | 戴护目镜弯腰 | 工具包微光 | 只提示一次 |
| TemperatureCheck | 举温度计 | 冷却蓝光 | 短句 |
| MemoryCrowded | 抱零件箱 | 箱子轻晃 | 短句 |
| DataSorting | 看数据平板 | 小数据点流动 | 短句 |
| Sleep | 坐下打盹 | Zzz 很小 | 不弹面板 |
| Celebrate | 举小扳手 | 金色星点 1 次 | 2 秒内消失 |

---

## 12. 桌宠气泡设计

只允许一句话，最多 16 个中文字符。

示例：

```text
CPU 有点忙，我在看着。
温度稳定，很舒服。
内存有点挤哦。
今天零件攒了不少。
```

气泡尺寸：

```text
最大宽度：176px
高度：28px - 42px
字体：12px
圆角：12px
显示时长：2200ms - 3200ms
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

## 13. 桌宠动效设计

| 场景 | 动效 | 时长 | 备注 |
|---|---|---:|---|
| Idle | 呼吸缩放 0.985 - 1.0 | 2600ms 循环 | 极轻微 |
| Hover | 抬头 / 眨眼 / 耳朵动 | 180ms - 260ms | 只触发一次 |
| Click | 小幅点头 | 160ms | 同时打开面板 |
| Alert | 状态灯闪 1 次 | 240ms | 不弹大窗 |
| Panel Open | opacity + scale | 140ms | 从宠物侧边长出 |
| Panel Close | opacity + scale | 100ms | 快速收起 |
| Drag | shadow 加深 | 即时 | 不播放复杂动画 |

禁止：

```text
持续上下跳动
持续旋转光圈
全屏粒子
强烈闪烁
夸张弹性动画
超过 300ms 的常用交互动效
```

---

## 14. Pet Quick Panel 设计

### 14.1 定位

Pet Quick Panel 不是设置窗口，而是：

```text
CoreCat 的随身工具面板。
```

它必须像从桌宠身边长出来的小 UI。

### 14.2 尺寸

```text
默认宽度：276px
最小宽度：252px
最大宽度：300px
默认高度：318px
高度范围：260px - 360px
圆角：18px
内边距：12px
```

超过 360px 高度的内容必须折叠、分页或滚动。

### 14.3 位置

```text
优先显示在桌宠右侧。
如果靠右边屏幕，则显示在左侧。
如果靠底部，则向上展开。
必须避免超出屏幕。
```

### 14.4 视觉

```text
深色玻璃
橙色细描边
青蓝状态光
小三角箭头指向桌宠
顶部有 CoreCat 小头像
按钮小巧
信息紧凑
```

### 14.5 内容结构

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

### 14.6 像素级结构

默认 `276 x 318` 面板内部建议：

```text
padding：12px
header：42px
message：34px
hardware chips：58px
quick buttons：38px
sliders：64px
toggles：34px
footer / danger：可折叠，不默认展开
```

组件尺寸：

```text
头像：28px x 28px
状态点：6px x 6px
关闭按钮：24px x 24px
硬件 Chip：76px x 26px
快捷按钮：58px x 30px
Slider 高度：22px
Toggle 高度：20px
分割线：1px，高透明度
```

视觉细节：

```text
面板边缘靠近桌宠一侧加 1 个 8px 小三角指针。
小三角与面板使用同样玻璃背景和边框色。
面板背景透明度略高于主窗口，保证桌面上可读。
面板阴影向桌宠反方向扩散，像从桌宠身边浮出。
```

### 14.7 操作分级

默认显示按钮只能有 4 个：

```text
打开
暂停
监控
隐藏
```

二级操作折叠进右上角齿轮：

```text
设置
开机自启
重置位置
退出应用
```

退出应用必须二次确认，不放在第一层按钮区。

---

## 15. MonitorBar 悬浮监控条设计

### 15.1 定位

MonitorBar 不是工具条，而是：

```text
桌面上的状态胶囊。
```

### 15.2 尺寸

```text
默认高度：40px
紧凑高度：34px
展开高度：44px
默认宽度：420px
紧凑宽度：260px
展开上限：560px
圆角：999px
```

禁止做成 700px 以上长条。

### 15.3 内容

默认：

```text
CoreCat 小头像
CPU
RAM
温度
+parts/min
```

Expanded 可增加：

```text
GPU
下载
上传
```

默认模式示例：

```text
🐱  CPU 23%   RAM 46%   68℃   +32/min
```

Micro 模式示例：

```text
🐱  CPU 23%  RAM 46%
```

Expanded 模式示例：

```text
🐱 CPU 23%  GPU 18%  RAM 46%  ↓12M ↑3M  68℃  +32/min
```

### 15.4 视觉

```text
深色半透明胶囊
玻璃高光
内侧细描边
底部柔和阴影
分隔线极细
状态颜色柔和
数字等宽
```

---

## 16. 右键菜单设计

禁止浏览器默认菜单或系统默认白色菜单。

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

## 17. 主窗口整体设计

主窗口不是长期常驻大屏，而是用户主动打开的迷你工坊总览。

尺寸：

```text
默认宽：880px
默认高：560px
最小宽：760px
最小高：500px
圆角：20px
背景：深蓝黑渐变
```

结构：

```text
┌──────────────────────────────────────────────┐
│ 自定义标题栏                                  │
├──────────────┬───────────────────────────────┤
│ 左侧窄导航栏   │ 页面内容                       │
└──────────────┴───────────────────────────────┘
```

设计规则：

```text
不做“大屏控制台”。
不依赖 1080px 以上宽度。
页面必须在 880 x 560 内完整成立。
```

---

## 18. 标题栏设计

高度：

```text
44px
```

内容：

```text
左侧：CoreCat 小头像 + CoreWorkPal 桌面工坊
中间：当前状态胶囊，例如“维修中 · 运行良好”
右侧：稳定度、零件、灵感、窗口控制按钮
```

窗口按钮：

```text
最小化
隐藏到托盘
关闭
```

---

## 19. 左侧导航栏设计

宽度：

```text
148px - 164px
```

视觉：

```text
深色玻璃竖栏
顶部头像
中间导航
底部 CoreCat 在线状态
```

导航项：

```text
Dashboard 控制台
Workshop 工坊
Settings 设置
About 关于
```

导航按钮：

```text
高度 40px - 42px
圆角 12px
图标 18px
文字 13px
选中：橙色渐变背景 + 左侧发光条 + 轻微外发光
未选中：透明，悬停弱玻璃高亮
```

---

## 20. Dashboard 页面设计

Dashboard 是用户第一眼看到的页面，必须做到最高完成度。

定位：

```text
CoreCat 的工坊控制台。
```

需要同时表达：

```text
桌宠在场
电脑正在工作
工坊正在运转
数据很清晰
整体很精致
```

布局：

```text
┌──────────────────────────────────────────────┐
│ 页面标题：工坊控制台                           │
├───────────────────┬──────────────────────────┤
│ CoreCat Hero Card  │ 6 个硬件 Metric Cards      │
├───────────────────┴──────────────────────────┤
│ 今日产出 / 效率 / 稳定度 / 在线时间             │
└──────────────────────────────────────────────┘
```

### 20.1 CoreCat Hero Card

尺寸：

```text
宽：260px - 286px
高：286px - 316px
```

内容：

```text
CoreCat 中小尺寸角色图
状态气泡
当前状态标签
迷你工坊底座
两个快捷按钮
```

视觉要求：

```text
背景不能空。
必须有模糊工坊场景或圆形发光底座。
CoreCat 不能像贴纸一样贴在空白卡片上。
CoreCat 要有“站在小工坊里”的感觉。
```

### 20.2 硬件 Metric Card

6 个卡片：

```text
CPU 核心工作台
GPU 图形工作台
RAM 零件仓库
NET 传输站
TEMP 冷却墙
DISK 档案柜
```

每张卡片包含：

```text
图标
模块名称
当前数值
副信息
迷你进度条
状态徽章
```

卡片尺寸：

```text
宽：174px - 190px
高：104px - 118px
```

视觉：

```text
圆角 16px
暗色玻璃
图标圆形发光底座
状态色进度条
悬停轻微上浮 2px
```

### 20.3 底部产出卡片

5 个横向小卡：

```text
今日零件
今日灵感
效率值
稳定度
在线时长
```

高度：

```text
74px - 88px
```

每张包含：

```text
图标
标题
大号数值
小趋势线
状态短语
```

### 20.4 Dashboard 紧凑布局

推荐栅格：

```text
内容区宽度约 704px，高度约 516px
左侧 Hero：276px x 316px
右侧 Metric Grid：3 列 x 2 行，每张约 178px x 108px
底部 Output Strip：横向 5 张，每张约 128px x 78px
页面内边距：16px
卡片间距：10px - 12px
```

禁止：

```text
Hero 卡片超过 320px 宽
硬件卡片超过 130px 高
页面出现大面积空背景
为了塞内容把窗口扩大到 1080px 以上
```

---

## 21. Workshop 页面设计

Workshop 是游戏感核心页，不允许只是数据卡片网格。它必须像：

```text
迷你硬件工坊地图。
```

模块布局：

```text
┌─────────────┬─────────────┬─────────────┐
│ 核心工作台    │ 图形工作台    │ 零件仓库      │
├─────────────┼─────────────┼─────────────┤
│ 传输站        │ 冷却墙        │ 档案柜        │
├─────────────────────────────────────────┤
│ 工坊等级 / 总零件 / 灵感 / 效率 / 升级按钮 │
└─────────────────────────────────────────┘
```

每个模块包含：

```text
编号
模块中文名
模块英文名
小插画区域
硬件指标
状态
进度
```

小插画要求：

```text
CPU：蓝色核心芯片 + 小工作台
GPU：图形平台 + 风扇 + 发光线
RAM：货架 + 内存条 + 零件箱
Network：传输塔 + 数据包 + 小推车
Temperature：风扇墙 + 温度计 + 冷光
Disk：档案柜 + 数据盘 + 归档标签
```

底部升级栏：

```text
总零件
灵感
工坊等级
效率
稳定度
升级工坊按钮
```

升级按钮：

```text
橙色主按钮
圆角 16px
带向上箭头或齿轮图标
悬停轻微发光
```

---

## 22. Settings 页面设计

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

桌宠设置：

```text
宠物大小 Slider
透明度 Slider
气泡提示 Toggle
静态模式 Toggle
```

监控条设置：

```text
显示监控条 Toggle
紧凑模式 Toggle
始终置顶 Toggle
显示位置 Select
```

运行设置：

```text
低功耗模式 Toggle
开机自启动 Toggle
通知提醒 Toggle
声音反馈 Select
```

安全与隐私卡片必须写清：

```text
仅本地运行
无隐蔽负载
无加密/挖矿
可暂停与退出
```

底部按钮：

```text
暂停 CoreCat
退出 CoreWorkPal
```

退出按钮使用红橙色弱警告，不要刺眼。

---

## 23. About 页面设计

About 页面要像欢迎页，不是文字说明页。

Hero 区：

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

必须避免：

```text
大段法律文本
普通 Markdown 风格
白底说明文
```

---

## 24. 必需图像资产

```text
CoreCat Idle
CoreCat RepairLight
CoreCat RepairHeavy
CoreCat TemperatureCheck
CoreCat MemoryCrowded
CoreCat DataSorting
CoreCat Sleep
CoreCat Celebrate
CoreCat 小头像
工坊背景图
CPU 模块插画
GPU 模块插画
RAM 模块插画
Network 模块插画
Temperature 模块插画
Disk 模块插画
App icon
Tray icon
```

图片要求：

```text
桌宠图：透明 PNG / WebP
主角色源文件：1024 x 1024
模块插画：512 x 512 或 768 x 768
图标：SVG 优先
保持统一光源
保持统一视角
不要出现白边
不要出现复杂背景干扰
不要出现币、矿镐、矿石、钱包、区块链符号
```

---

## 25. CoreCat 角色总 Prompt

可交给图像生成 AI：

```text
Design a premium mini desktop pet character for a Windows desktop companion app named CoreWorkPal.

Character name: CoreCat.
A small chibi orange-and-white engineering cat, round face, big expressive eyes, tiny legs, wearing small transparent safety goggles on the head, a tiny tool belt, holding a small diagnostic tablet and a mini wrench.

Style:
premium desktop pet, cute but not childish, polished game UI mascot, compact, high detail at small size, soft rim light, subtle tech vibe, warm orange and cyan accents, clean silhouette, transparent background, no white border.

Personality:
calm, clever, reliable, slightly playful, like a tiny engineer living inside the computer.

Important:
not a miner, not crypto, not blockchain, no coin, no pickaxe, no mining helmet, no money, no NFT.
not rough sticker, not flat emoji, not cheap cartoon.

Output:
transparent PNG,
centered character,
safe margin 10%,
same front 3/4 view,
readable at 128px height.
```

---

## 26. CoreCat 状态图 Prompt

### 26.1 Idle

```text
CoreCat idle pose, standing calmly, holding a small diagnostic tablet, tiny blue status light, subtle breathing-friendly silhouette, transparent background, premium chibi engineering cat, same proportions and 3/4 view.
```

### 26.2 RepairLight

```text
CoreCat light repair pose, holding a mini wrench with one paw, small warm orange spark near the tool, focused but cute expression, transparent background, premium chibi engineering cat, same proportions and 3/4 view.
```

### 26.3 RepairHeavy

```text
CoreCat heavy repair pose, safety goggles lowered over eyes, slightly bent forward, tool belt glowing softly, determined expression, no danger, no chaos, transparent background, same proportions and 3/4 view.
```

### 26.4 TemperatureCheck

```text
CoreCat temperature check pose, holding a tiny thermometer, cool cyan light accent, calm monitoring expression, transparent background, same proportions and 3/4 view.
```

### 26.5 MemoryCrowded

```text
CoreCat memory crowded pose, hugging a small box of computer parts, slightly overwhelmed but cute expression, small parts inside the box, transparent background, same proportions and 3/4 view.
```

### 26.6 DataSorting

```text
CoreCat data sorting pose, looking at a glowing diagnostic tablet, tiny data dots flowing around the tablet, subtle cyan accents, transparent background, same proportions and 3/4 view.
```

### 26.7 Sleep

```text
CoreCat sleep pose, sitting and napping, tiny subtle Zzz, goggles resting on head, peaceful expression, transparent background, same proportions and 3/4 view.
```

### 26.8 Celebrate

```text
CoreCat celebrate pose, raising a tiny wrench, one-time small golden sparkle, happy but not exaggerated, premium polished desktop pet style, transparent background, same proportions and 3/4 view.
```

---

## 27. Dashboard Mockup Prompt

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

## 28. Workshop Mockup Prompt

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

## 29. Pet Quick Panel Mockup Prompt

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
No large layout, no white background, no admin UI.
```

---

## 30. MonitorBar Mockup Prompt

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

## 31. UI 失败判定

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

## 32. UI 交付物清单

设计 AI 最终应输出：

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
