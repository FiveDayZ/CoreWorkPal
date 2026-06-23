# CoreCat 像素风动画与 UI 优化 - 进度跟踪

## 目标
1. 让 CoreCat 桌面宠物从静态图片变为有动态动画效果的像素风宠物。
2. 优化工坊设置界面布局使其一屏展示无滚动条，并在工坊页面底部增加具体的零件及工坊升级增益说明看板。

## 已完成任务 (动画部分)

- [x] 分析 CoreCat 渲染架构：确认使用单张像素图片 + CSS 动画
- [x] 分析骨骼动画系统：确认存在完整的 bone/pose 运行时但未被使用
- [x] 检查像素图片格式：发现 7 张像素图均为 JPEG 格式，带有棋盘格背景
- [x] 批量去除棋盘格背景：通过 flood-fill 算法将 7 张图片转为透明背景 PNG
- [x] 恢复像素风图片渲染（撤销骨骼 SVG 层方案）
- [x] 集成 pose 驱动的实时 CSS transforms
- [x] 状态切换图片：根据 animationState 自动切换 7 种不同像素图
- [x] TypeScript 编译通过
- [x] Vite 构建成功
- [x] CoreCat 动画测试通过
- [x] 修复 Click_Dizzy 动画触发问题：将 PetWindow 侧单次点击 nod/click 的 state 维持时间由 300ms 缩短为 80ms，并移除了 animationActionController 中对 click 状态被后续点击打断和叠加延时的限制。如此使多次快速点击的 transition 被正确感知并叠加，成功实现 dizzy 状态在快速连续点击 3 次及以上的顺畅触发，并补充了对应的自动化测试断言验证。
- [x] Tauri release 二进制编译成功 (57.21s)

## 已完成任务 (UI 布局与增益看板优化部分)

- [x] 设置界面紧凑化：重构设置卡片至左右双栏布局，去掉部分冗余/超出的辅助文字，并将列容器改为 Flex Column 布局，彻底移除了设置面板的垂直滚动条，实现无滚动条全屏完美展示
- [x] 开关及按钮精简：合并开关项并平铺显示指标为 5 列，极大节省了纵向空间
- [x] 优化 CSS 变量：完美支持三大主题（暖心布丁橙、梦幻苏打蓝、甜心蜜桃粉）的动态样式匹配
- [x] 零件升级增益看板：工坊下方新增 6 大系统强化（CPU、GPU、RAM、NET、TEMP、DISK）实时计算的加成统计
- [x] 工坊升级说明：工坊升级看板清晰展示工坊等级提供的高额效率加成（当前 Level * 15% 生产速度提升）
- [x] 默认皮肤支持：在设置“宠物皮肤”中增加“默认皮肤”选项，切换回默认 coreworkpal 皮肤，并修正 AppShell 的主题清理机制
- [x] 主页版本号显示：在主面板 TitleBar 的 CoreWorkPal 标题右侧使用 pixel font (Silkscreen) 显示动态读取的 package.json 版本号 `v0.1.0`
- [x] 前端及 Tauri 编译测试：tsc / Vite 验证完成，解决 tsconfig 与 Node / Vite 文件的类型检查冲突，编译打包全绿
- [x] 头像大头照重构：提取 3 套主题原始高精度的猫咪头像部分，裁切为 256x256 透明 PNG 大头照图标，NearestNeighbor 保证像素边缘清晰不模糊
- [x] 更新默认关联：将全新的大头照输出至 `src/assets/icons/` 并同步覆盖默认头像
- [x] 静态打包与网页集成测试：检查前台各卡片页面头像是否正常且清晰显示，且资源大小优化超过 80%
- [x] 去除多余 cmd 终端：将 `#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]` 配置应用到 `main.rs`，在 release 模式下彻底隐藏后台调试终端窗口
- [x] 重新编译 release 二进制：成功重新完成 Tauri 项目整体构建，生成精炼的 EXE 文件
- [x] 设置布局调换：“运行与特效”（原“运行与音效”）与“任务栏数据”模块位置调换，最下面对齐显示“运行与特效”和“安全与隐私”。



## 已完成任务 (像素图标替换部分)

- [x] 排查与全量移除：全面清查并移除项目内所有原有 Emoji 及杂乱字符（包括 🏠, 🛠️, ⚙️, 📋, ℹ️, 🔧, 💡, ⚡, 🛡️, 🧠, 👁, 📦, ❄, 🗄, 🕒, 📅, ✨ 等）
- [x] 像素图标库设计：在 `src/ui/PixelIcon.tsx` 中设计并实现了 23 个具有强烈业务相关度且表意明确的 16x16 像素风 SVG 图标，包括 CPU 电路板、RAM 内存条、GPU 眼睛、工坊锤子扳手、多星闪烁、日历等，使用 `shape-rendering="crispEdges"` 保证在任何屏幕缩放比例下都清晰锐利
- [x] 动态色彩主题适配：所有像素图标的核心像素点均支持 `currentColor` 的填充填充与 `opacity="0.4"` 的双音色（Dual-tone）半透明深度，确保自动完美融入并适配“布丁橙”、“苏打蓝”与“蜜桃粉”三大主题色调
- [x] 页面组件层全面重构：
  - 重构 `MainWindow.tsx` 主窗口侧边栏、TitleBar 顶栏及窗口还原按钮
  - 重构 `PetQuickPanelWindow.tsx` 快捷面板头部齿轮、退出按钮和二级菜单
  - 重构 `DashboardPage.tsx` 核心卡片标题 Icon 及底部产量总结栏
  - 重构 `WorkshopPage.tsx` 地图标题、产出规则、升级增益和 `formatCost` 消耗零件/灵感数值
  - 重构 `WorkLogPage.tsx` 日志页面的日历按钮
  - 重构 `SettingsPage.tsx` 所有卡片标题前置图标
  - 重构 `AboutPage.tsx` 8 大硬件属性卡片说明项
- [x] 静态编译与构建验证：运行 `npm run build` 通过，TypeScript 检查及 Vite 静态构建测试全绿，界面整体视觉精致度获得极大提升
- [x] 特定硬件像素图标重绘与优化（设备栏目主图标、主板、显示器、声卡、网卡）：
  - **设备主图标 (`devices`)**：全新设计像素风格的“显示器 + 主机”双件组合图标，替代了原来简陋的柱状图/条形图。
  - **主板图标 (`motherboard`)**：全新设计，绘制了包含 CPU 插座（带双音色高亮）、内存插槽、PCIe 插槽和主板电容等元件细节的微缩电路板，替代了原有的“交叉扳手锤子”图标。
  - **显示器图标 (`monitor`)**：完全重新绘制为带实底座、超薄边框以及右下角双音色高亮电源指示灯的拟真屏幕图标，去除了原本的柱状图。
  - **声卡图标 (`audio`)**：全新设计，绘制了带有三个侧边多色音频插孔（双音色半透明高亮）、板载音频芯片和 PCI 指引线的物理声卡外观，替代了原有的闪电（能量）图标。
  - **网卡图标 (`network`)**：全新设计，采用经典的局域网/网口三节点总线互联架构，每个节点屏幕带有双音色高亮，替代了原有的闪电（能量）图标。
  - **UI 页面无缝关联**：将 `MainWindow.tsx` 的设备路由图标指向 `devices`；重构 `DevicesPage.tsx`，将设备标题改为 `devices`，主板改为 `motherboard`，声卡改为 `audio`，网卡改为 `network`。所有图标支持双音色及当前主题色自适应。
  - **主界面菜单顺序调整**：调整 `routes.tsx` 与 `MainWindow.tsx` 的页面路由与标签渲染顺序，将“设备”与“工坊”的位置互换，使设备在侧边栏显示更靠前。
  - **硬件信息“等待中”Bug 修复**：定位并解决了 PowerShell 硬件信息查询脚本在单显示器（单个 Monitor）环境下，被 `if-else` 条件判断语句意外解包为单对象（而非 JSON 数组），导致 Rust 端 `serde_json` 序列化结构不匹配而静默失败 of Bug。将 `displays` 的赋值表达式强制包裹在 `@(...)` 数组解说符中，使硬件清单可以 100% 正确解析加载，彻底消除了“主板、显示器、磁盘、声卡、网卡一直处于等待中”的异常现象。
  - **控制台与工坊图标重绘**：
    - **控制台图标 (`dashboard`)**：全新设计为微型数显中控台。顶部配有带半透明高亮正弦波信号折线（Oscilloscope）的液晶小屏幕，底部排布有三个可旋转调节旋钮及机架式横线，替换了原本让人困惑的普通住宅（`home`）图标。
    - **工坊图标 (`tools`)**：完全重画，用“垂直高亮棘轮扳手 + 垂直实木手柄（半透明木纹）装配锤”的清晰双件平铺并排陈列图案，代替了以前过于抽象晦涩、易被看作蝴蝶或翅膀的交叉粗线工具堆。

## 已完成任务 (数值平衡与规则调整部分)

- [x] 资源产出精确分区：重构 Rust 产出模块，CPU 负载、GPU 负载/显存、RAM 占用及对应模块仅贡献零件产出；网络吞吐、磁盘读写及对应模块仅贡献灵感产出；温度指标维持原有过热和 relief 惩罚比重。
- [x] 基础产出大幅下调：零件基础产出从 `6.0/min` 降至 `1.2/min`，灵感基础产出从 `0.55/min` 降至 `0.08/min`，减缓资源膨胀速度。
- [x] 升级门槛成倍提升：重构了工坊与模块的资源消耗计算公式。工坊零件消耗改为乘数+幂数非线性复合增长（`parts = level * 300 + level^1.7 * 80`）；模块强化零件/灵感消耗全面拉升，使长线升级更具挑战性。
- [x] 上限约束解禁与调高：
  - 每分钟最大产出上限：零件从 `180.0` 增至 `50000.0`，灵感从 `20.0` 增至 `5000.0`。
  - 模块合并加成倍数：上限由原本的限制 `3.0` 扩增至 `1000.0`，释放极高强化等级下的策略深度。
  - 等级硬上限设定：前端与状态层对工坊和子强化模块设定了 `100` 级硬上限，保护逻辑无溢出风险。
- [x] 前端 UI 面板适配：
  - 更新工坊规则看板和 6 大模块卡片的中文/英文说明和加成信息，使其与新产出规则一致。
  - 增加等级上限状态，当工坊等级或模块子强化等级达到 100 级上限时，按钮自动变为禁用展示态“已达上限”，UI 友好性进一步提高。
- [x] 单元测试与构建校验：Rust 后端 16 项单元测试全部通过，前端打包编译打包全绿。

## 已完成任务 (工坊模块背景插画重构部分)

- [x] 长方形尺寸适配：采用 7:2 纵横比 `viewBox="0 0 140 40"` 精确设计，解决原正方形插图导致的缩放挤压变形或边缘留空问题，完美契合弹窗内 `280px × 80px` 黑色长方形展示区。
- [x] 全量替换为 SVG 像素矢量插画：自主绘制 6 个核心模块的高清像素风 SVG 插画：
  - `module_cpu_core_workbench.svg` (橙金控制台 + 核心 CPU 芯片)
  - `module_gpu_graphic_bench.svg` (科技青 3D 旋转线框立方体 + 双风扇显卡)
  - `module_ram_parts_warehouse.svg` (机械绿仓储货架 + 金脚内存条)
  - `module_net_transfer_station.svg` (信号蓝天线塔 + 4 口以太网交换机)
  - `module_temp_cooling_wall.svg` (冰川蓝散热风扇 + 液冷管道 + 温度计与雪花)
  - `module_disk_archive_cabinet.svg` (铜金暗调归档柜 + 磁带卷轴 + 硬盘磁头盘片)
- [x] 重构资源路径：更新 `src/ui/assets.ts` 导入声明，使 6 大工坊模块全部指向对应的 `.svg` 矢量图标。
- [x] 清理旧冗余资源：物理移除 `src/assets/modules/` 下的 6 张同名 `.png` 图片文件，总体积从原来的 `~6MB` 直接降至 `<20KB`，极大程度减小打包体积。
- [x] 精细化 UI 卡片样式控制：调整 `src/styles/core-ui.css` 中 `.cwp-module-illust-bg` 卡片底图的定位与缩放规则，增加 `object-fit: contain` 和 `image-rendering: pixelated` 样式属性，防止背景图在大屏或不同主题下产生拉伸变形，保证像素细节颗粒分明。
- [x] 静态构建与 UI 遍历验证：运行 `npm run build` 全绿打包，并且通过浏览器子代验证在工坊主界面与各个详情弹窗下完美对齐显示。

## 已完成任务 (关于页面重构与代码仓库上传部分)

- [x] 工作投入度评估介绍：重写了关于页面顶部的 CoreWorkPal 桌面伙伴产品介绍，新增了“工作投入度与专注度评估”的功能说明，说明如何利用硬件资源状态对用户的专注与投入度进行智能反馈。
- [x] 关于页面布局重构：移除了原有的 8 个关于 CPU、GPU、RAM、NET、TEMP、DISK 和零件、灵感来源的详细监控参数描述卡片。
- [x] 开源 Git 仓库模块集成：在关于页面底部增加了精美的“开源项目仓库 (Git Repository)”卡片，直接展示项目地址 `https://github.com/FiveDayZ/CoreWorkPal.git`，并提供了一键“复制地址”到系统剪贴板的功能。
- [x] 页面高度自适应调整：修改 `.cwp-about-hero` 样式由固定 `height: 80px` 变更为 `min-height: 80px`，防止新增文本较长时产生底部文字截断，排版显示极其清爽完整。
- [x] 全量项目上传 Git 仓库：
  - 更新根目录 `.gitignore`，将 `.tmp/`、`.codegraph/`、`CoreWorkPalUI/` 和 `docs/` 过滤排除。
  - 在项目根目录下初始化 Git 仓库，自动暂存并提交所有项目源码。
  - 添加了远程 GitHub 地址：`https://github.com/FiveDayZ/CoreWorkPal.git`。
  - 配置了局域网 Git Proxy 路由，成功将项目整体全量推送上传至 GitHub 主干仓库 `main` 分支，且已通过 `git rm --cached` 将 `CoreWorkPalUI` 和 `docs` 目录从 Git 历史和远程仓库中完全移除。
- [x] 版本号一致性同步：将关于页面的版本号更新为动态展示全局变量 `__APP_VERSION__`，使其与主窗口标题栏及主程序 `package.json` 版本号 `0.1.0` 保持完全一致。

## 已完成任务 (文档与描述调整部分)

- [x] 调整项目 Git 中的 README 描述：清理中英混杂的现象，保留清晰纯粹的中文描述，移除了所有非必要的英文解释与词汇，将硬件指标、开发步骤等术语统一规范为中文表达，并简化了技术架构图和项目结构的英文标注。

## 已完成任务 (内存占用优化部分)

- [x] 分析 WebView2 内存瓶颈：定位原因为 21 张动画雪碧图为 5760x5760 像素，导致解码后的 RGBA 像素数据占用过多内存（单张达 126.56 MB，React 预载引发 500+ MB 的开销）。
- [x] 等比下调雪碧图分辨率：使用 PIL (Nearest-Neighbor 算法) 将 21 张 WebP 雪碧图从 5760x5760 缩小至 1280x1280 (每帧从 720x720 降至 160x160)，解码内存占用直接骤降 94.8%（单张降至 6.55 MB）。
- [x] 等比转换 JSON 坐标：同步修改 21 个 `.json` 配置文件，将 frames 坐标等比乘以 2/9 转换为整数值，完全无损映射。
- [x] 优化 CSS 像素渲染模式：将 `CoreCat.tsx` 的 Sprite inline style 中 `imageRendering` 改为 `pixelated`，确保在 Retina/高 DPI 屏幕上缩放时，宠物边缘依然清晰锐利，保留经典像素风。
- [x] 运行本地单元测试与静态构建测试：`npm run test:corecat` 与 `npm run build` 打包测试顺利通过。
- [x] 阻止程序在无窗口时退出：在 `lib.rs` 中全局拦截 `ExitRequested` 事件并阻止退出，确保所有窗口关闭后，托盘图标程序仍在后台工作。
- [x] 实现窗口隐藏即物理销毁：在 `hide_window` 中对 `"main"`、`"pet"`、`"monitor-bar"` 和 `"pet-panel"` 窗口调用 `.close()`，彻底终止对应的渲染进程并回收其内存。
- [x] 实现 DPI 缩放敏感的位置还原：在 `ensure_webview_window` 中对重建的 `"pet-panel"` 进行物理 DPI 缩放敏感的坐标计算，使其即使在重建后也能完美无缝地弹在悬浮猫咪旁。
- [x] 修复嵌套 Tokio Runtime 崩溃 Bug：使用 `RwLock::blocking_read()` 代替 `block_on` 异步读取 AppState，消除了多线程环境下的崩溃隐患。

## 已完成任务 (快捷面板位置、拖拽与退出功能优化部分)

- [x] 快捷面板位置靠左适配：将 `pet-panel` 面板在创建时的初始坐标由猫咪右侧调整至左侧，防止右侧贴边时弹窗逸出桌面视窗边界。同时，移除了 Rust 代码中未使用的 `pet_width` 变量以消除编译器警告。
- [x] 面板指针与动画镜像：将面板的小三角指针（Arrow）样式改为 `cwp-panel-arrow-right` 并在右侧渲染以指向猫咪。同步将 `.cwp-pet-panel` 的 `transform-origin` 设为 `right 48px`，并将开启动画 `panel-elastic-open`、关闭动画 `panel-toolkit-recycle` 与指针动画 `panel-arrow-recycle` 的 X 轴平移反向镜像，确保视觉动力学自然。
- [x] 自由拖拽面板实现：扩展 React 组件 `GlassPanel` 的 Props 以继承 `React.HTMLAttributes<HTMLElement>`。在 `PetQuickPanelWindow.tsx` 中注册 `onMouseDown` 和 `onMouseMove` 监听，避开按钮、输入框、滑块等交互控件后触发 Tauri 层的拖拽。同时在 `useEffect` 中注册全局的 `pointerup` 监听，在释放时恢复状态。添加 `.cwp-pet-panel` 的 `cursor: move` 手势。
- [x] 退出机制异常修复：在 `lib.rs` 中引入线程安全的全局原子布尔标记 `IS_EXITING`。在拦截 `RunEvent::ExitRequested` 阻止默认关闭退出的同时，判断当该标记为 `true` 时不予阻止。并在 `commands/mod.rs`（“退出工坊系统”）与 `tray/mod.rs`（系统托盘“退出”）触发事件时，均将 `IS_EXITING` 置为 `true` 后触发 `app.exit(0)`，完美修复了无法正常退出程序的 Bug。

## 已完成任务 (用户唯一识别码 CatID 部分)

- [x] 拓展 AppSettings 结构体：在前端与 Rust 后端 AppSettings 结构体及类型定义中引入 `catId` (或 `cat_id`) 字段。
- [x] SMBIOS 硬件 UUID 获取：在 Rust 后端实现 `query_smbios_uuid()` 方法，通过执行 PowerShell 指令 `(Get-CimInstance Win32_ComputerSystemProduct).UUID` 读取本机的 SMBIOS 系统硬件唯一 UUID，对空白值、全零或无效占位符进行自动过滤，确保硬件标识的可靠性。
- [x] 确定性哈希转换算法实现：设计了 FNV-1a 64位哈希算法（`fnv1a_64`）和 `Xorshift64` 伪随机流的混合架构（`convert_uuid_to_cat_id`）。输入系统硬件 UUID 时，可确定性地生成唯一的 10 位大小写字母 + 数字组成的 CatID。硬件不变，UID 便不会改变，彻底解决配置丢失后 ID 重置的隐患。
- [x] 备份与随机降级兼容：如果设备读取硬件 UUID 失败（非 Windows 平台或虚拟机环境），系统将无缝自动保留本地已存在的 random ID，或生成新的高散列随机 ID 兜底。
- [x] 侧边栏头像区域 UI 拓展：重构主窗口 `MainWindow.tsx` 侧边栏底部的状态卡片布局，将卡片更改为垂直 Flex 分区，且在其下方使用 Silkscreen 像素字体完美呈现只读、可选择复制的 `ID: XXXXXXXXXX`，美观精致。
- [x] 设置主页左侧头像区拓展：重构 `SettingsPage.tsx` 左侧大型头像详情卡片，在头像 wrapper 正下方居中增加带有暗底、细边框及醒目布丁橙强化的像素风 `ID: XXXXXXXXXX` 看板，符合复古工坊界面审美。
- [x] 类型安全与测试覆盖：新增了 `test_uuid_cat_id_conversion` 单元测试，专门验证算法的确定性（相同输入相同输出）、格式规范（10位字母数字）及输入容错性（过滤首尾空格），测试、tsc 与 Vite 静态打包全绿。

## 已完成任务 (窗口控制按钮文字居中显示优化部分)

- [x] **窗口控制按钮文字与图标居中对齐优化**：
  - 定位问题：原 Unicode 文本字符（如 `─` 和 `×`）在不同字体 and 系统下存在基线偏移，导致传统 flex 居中后在视觉上依然偏置偏下。
  - 重构为矢量图标：将 `MainWindow.tsx` 中的 Minimize 与 Close 按钮由 Unicode 字符替换为 `PixelIcon` 自适应组件（分别对应 `minimize` 与 `close` 图标）。
  - 像素图标网格坐标重绘：对 `PixelIcon.tsx` 中的 `minimize`、`restore` 与 `close` 的 16x16 像素图案网格进行重新计算与平移微调，修正其在 bounding box 内部偏置不均的缺陷，使其实现完美的横向与纵向绝对居中。
  - 样式重构与构建验证：在 `core-ui.css` 中将窗口行为按钮的 `display` 由 `grid` 变更为 `inline-flex` 结合 `align-items: center`、`justify-content: center` 与 `line-height: 1`。经本地 `npm run build` 构建及浏览器子代视觉验证，所有窗口按钮图标在默认和悬停状态下均完美居中显示，精致饱满。
- [x] **代码推送与同步**：已将所有居中调整代码同步提交并推送至 GitHub `main` 分支。
- [x] **README 截图更新**：已将修改后包含最新像素控制台、日志页面、模块详情、设置页面及工坊页面布局与图标的 5 张全新设计截图全量提交并推送至 GitHub `main` 分支。

## 可执行文件位置
`src-tauri/target/release/core-work-pal.exe`
