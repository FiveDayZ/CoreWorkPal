# CoreCat 动画系统实现验收报告

生成日期：2026-06-16

## 0. 验收结论

CoreCat 当前已经具备轻量伪骨骼动画运行时、状态机、VFX Bus、开发调试面板、QA 面板、性能面板、资源 manifest、资源检查器和第一批透明 SVG 分层资产。

本轮已补齐尾巴三段骨骼：`tail_base`、`tail_mid`、`tail_tip`。尾巴不再只是单一 `tail` 图片替换点，而是独立 skeleton node，可分别绑定资产、pivot、anchor 和 pose。

当前没有接入 Spine、Live2D、Rive，也没有把 CoreCat 合成整张死图。正式高质量美术仍需要人工或专业美术流程继续替换。

## 1. 分层骨骼验收

| 骨骼节点 | 当前状态 | 说明 |
|---|---|---|
| `shadow` | 已实现 | 独立节点，呼吸时透明度与缩放联动。 |
| `tail_base` | 已实现 | 本轮新增三段尾巴根部节点，独立 pivot。 |
| `tail_mid` | 已实现 | 本轮新增三段尾巴中段节点，独立 pose。 |
| `tail_tip` | 已实现 | 本轮新增三段尾巴尾端节点，摆动幅度最大。 |
| `body_base` | 已实现 | 独立身体节点，承担呼吸、点击压缩、状态姿态。 |
| `arm_left` | 已实现 | 独立左臂节点。 |
| `arm_right_wrench` | 已实现 | 独立右臂/扳手节点，点击、修复、数据整理会驱动。 |
| `head_base` | 已实现 | 独立头部节点，Hover 和 Idle 有差异化运动。 |
| `ears_left` / `ears_right` | 已实现 | 独立耳朵节点，支持随机微颤。 |
| `goggles` | 已实现 | 独立护目镜节点，Hover 有视差和流光。 |
| `eyes` | 已实现 | 独立眼睛节点，按状态切换表情资产。 |
| `pouch` | 已实现 | 独立工具包节点，面板展开/关闭与数据整理会驱动。 |
| `vfx_anchor` | 已实现 | 独立 VFX 锚点，用于调试和局部 VFX。 |

整张死图风险：CoreCat 桌宠窗口当前通过 `CoreCatLayer` 渲染独立骨骼 DOM 节点，风险低。主界面中仍存在用于展示的普通图片资产，但不属于桌宠动画运行时。

## 2. 核心动画状态验收

| 状态 | 骨骼 pose | 专属 VFX | Debug Panel | 自动回落 | 待美术项 |
|---|---|---|---|---|---|
| Idle | 已实现 | 无高频 VFX，含眨眼/耳朵/尾巴/阴影 | 可触发 | 持续态 | 最终细节美术 |
| Hover | 已实现 | 护目镜 shimmer | 可触发 | 离开后回 Idle | 视差素材可精修 |
| Click | 已实现 | click stars | 可触发 | 完成后回 Hover/Idle | wink 可增补 |
| TemperatureCheck | 已实现 | cooling wind / particles / text | 可触发 | 硬件状态解除后回落 | fan / sweat 可精修 |
| MemoryCrowded | 已实现 | RAM box / steam | 可触发 | 硬件状态解除后回落 | RAM 箱可精修 |
| Repairing | 已实现 | sparks / hologram | 可触发 | 工坊状态解除后回落 | 工具和全息屏可精修 |
| DataSorting | 已实现 | data cubes / pouch glow | 可触发 | CPU 条件解除后回落 | 数据方块可精修 |
| Sleep / LowPower | 已实现 | sleep bubble，关闭高频 VFX | 可触发 | 交互或低功耗解除后回落 | 蜷缩姿态需正式美术校准 |
| Celebrate | 已实现 | celebrate burst | 可触发 | 一次性完成后回落 | 庆典姿态可精修 |

## 3. 补充状态验收

| 状态 | 实现状态 | 触发方式 | Experimental | 测试 |
|---|---|---|---:|---|
| BootWake | 已实现 | PetWindow 首次显示或 Debug Panel | 否 | 已覆盖 |
| Dragging | 已实现 | 拖拽桌宠或 Debug Panel | 否 | 已覆盖 |
| DropLanding | 已实现 | 拖拽释放或 Debug Panel | 否 | 已覆盖 |
| PanelOpen | 已实现 | 打开 Quick Panel 或 Debug Panel | 否 | 已覆盖 |
| PanelClose | 已实现 | 关闭 Quick Panel 或 Debug Panel | 否 | 已覆盖 |
| ErrorGlitch | 已实现 | Debug Panel / 事件预留 | 否 | 已覆盖 |
| UpdateInstalling | 已实现 | Debug Panel / 进度输入 | 否 | 已覆盖 |
| AchievementPop | 已实现 | Debug Panel / 事件预留 | 否 | 已覆盖 |

## 4. VFX Bus 验收

- VFX 与状态机解耦：已实现 `vfxBus`、`vfxRuntime` 和状态到 VFX 事件映射。
- 状态退出清理：当前 VFX 层按 snapshot 渲染，不保存无限 DOM 历史。
- Sleep 高频 VFX：已关闭，仅保留 `sleepBubble`。
- 粒子数量限制：已设置 `CORECAT_VFX_LIMITS`，包括总量、冷却粒子、数据方块、蒸汽、火花、庆典粒子。
- DOM 无限累积风险：低。Click stars 会裁剪数量，常驻 VFX 按状态渲染固定节点。
- 全屏 Canvas 重绘：不存在。当前 VFX 是局部 DOM/CSS/SVG 方案。

## 5. Transition 验收

- 差异化 transition duration：已实现，`getCoreCatTransitionMs` 按状态组合返回不同持续时间。
- Sleep 进入慢切：`Any_to_Sleep = 600ms`。
- Celebrate 进入快、退出松弛：`Any_to_Celebrate = 80ms`，`Celebrate_to_Idle = 240ms`。
- 高温/内存警报进入及时：Temperature 160ms，Memory 180ms。
- 瞬移风险：通过 `mixTransitionPose` LERP 缓解；仍需真实美术完成后逐状态肉眼复核。

## 6. UI 联动验收

- Quick Panel 从 pouch 弹性展开：已实现 PanelOpen pose 和面板 CSS open animation。
- PanelClose 回收到 pouch：已实现 PanelClose pose 和 `panel-toolkit-recycle`。
- MonitorBar 胶囊流淌展开：已实现 MonitorBar 展开/芯片渐入动效。
- RollingValue 数字 roll-up：已实现 `.cwp-roll-value` / `.cwp-roll-char`。
- UI 动效冲突：目前无明显冲突；最终 Tauri 多窗口场景仍建议人工验收。

## 7. 性能验收

- 常驻动画主要使用 `transform` / `opacity`：已满足。
- 避免高频 top/left/width/height：CoreCat runtime 已满足；少量静态定位 CSS 不属于高频动画。
- VFX 可暂停：Debug Panel `Pause VFX` 已实现。
- LowPower 有效：低功耗会关闭高频 VFX，并可强制 Sleep。
- Performance Panel 可用：开发环境显示 FPS、frame、transition、VFX 数量。
- 生产环境隐藏调试面板：Debug / QA / Performance / Asset Panel 均以 `import.meta.env.DEV` 限制。

## 8. 资产验收

- Asset manifest：已实现 `src/pet/corecat/assets/coreCatAssetManifest.ts`。
- Fallback：已实现，缺失时回落到独立 DOM/SVG placeholder。
- 资源检查器：已实现 `CoreCatAssetPanel`，只在开发环境显示。
- PNG/SVG 替换：已支持 manifest `.png` 路径匹配同 basename `.svg` 资产。
- 分层保持：已保持，每个骨骼节点独立，第一批 SVG 也是独立文件。
- 第一批 SVG：本轮已放入 23 个透明 SVG，资源检查器应显示 23/23 loaded。
- 本轮资源检查器实际结果：开发环境 `/pet` 显示 `23/23 loaded`，formal `23`，fallback `0`，missing `0`；`tail_base`、`tail_mid`、`tail_tip` 均显示 formal SVG、正确 anchor 与 pivot。

## 9. 代码风险扫描

| 风险项 | 结论 |
|---|---|
| 未清理 timer / interval / RAF | 未发现阻塞问题；blink/ear timer、RAF、PetWindow timer 均有 cleanup。 |
| 状态机卡死 | 低风险；one-shot 有完成标记和回落测试。 |
| VFX DOM 无限增长 | 低风险；VFX snapshot 限制数量并按状态渲染。 |
| 生产 debug 泄露 | 低风险；dev-only 条件已覆盖。 |
| 资源路径硬编码 | 中低风险；路径集中在 manifest，Vite glob 集中在 asset module。 |
| 动画组件过度重渲染 | 中风险；`useCoreCatAnimation` 当前每个 RAF 都 `setFrame`，在小节点规模可接受，但后续高质量素材和更多 VFX 后建议改为 ref style 写入或帧率降级。 |

## 10. 当前未完成 / 需要人工介入

1. 第一批 SVG 是工程验收资产，不等于最终高质量美术。
2. 真实美术需要重新绘制所有部件，并重点校准三段尾巴、Sleep 蜷缩、Celebrate 姿态。
3. GPU 温度等硬件数据源仍受底层采集能力限制。
4. Tauri 多窗口实际透明置顶行为仍需在 `pnpm tauri dev` 中人工确认。
5. `AGENTS.md` 当前项目根目录缺失，后续若团队需要统一代理规范应补充。

## 11. 回归命令

本轮要求命令：

```powershell
corepack pnpm typecheck
corepack pnpm test:corecat
corepack pnpm build
```

本轮执行结果：

| 命令 | 结果 |
|---|---|
| `corepack pnpm typecheck` | 通过 |
| `corepack pnpm test:corecat` | 通过 |
| `corepack pnpm build` | 通过 |

附加 smoke：

- 生产 `/pet`：15 个骨骼节点，三段尾巴节点存在，13 个当前状态正式 SVG 资产层，资源检查器隐藏。
- 开发 `/pet`：资源检查器显示 `23/23 loaded`，formal 23，fallback 0，missing 0。
