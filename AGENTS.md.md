# CoreWorkPal Codex Project Instructions

## 项目定位

本项目是基于 Tauri + React + TypeScript 的 Windows 桌面应用，核心角色是精致小巧的桌面宠物 CoreCat。

CoreCat 不是普通静态贴图，也不是大型游戏引擎角色。请实现“轻量伪骨骼动画系统”：
- 使用分层 PNG/SVG/DOM 节点模拟骨骼。
- 使用 CSS transform、Web Animations API、requestAnimationFrame 和局部 Canvas VFX。
- 不要默认接入 Spine、Live2D、Rive 或 Pixi，除非用户明确要求。
- 不要使用全屏 Canvas 重绘整个角色。
- 常驻动画必须低功耗，优先使用 GPU transform。
- 所有动作切换必须有过渡融合，禁止瞬间跳帧。

## 重要文档读取顺序

在修改 CoreCat 动画相关代码前，必须先按顺序阅读以下文件：

1. `/docs/animation/CoreCat_素材分层规范.md`
2. `/docs/animation/CoreCat_骨骼动画规范.md`
3. `/docs/animation/CoreCat_状态机规范.md`
4. `/docs/animation/CoreCat_Codex_骨骼动画运行时完整开发文档.md`

阅读后请先输出：
- 你理解到的 CoreCat 骨骼节点列表
- 动画状态列表
- 状态优先级
- 你准备修改或创建的文件清单
- 本轮只做哪些内容
- 本轮不做哪些内容

在用户确认或任务明确要求继续前，不要一次性实现全部高级状态。

## 开发策略

请按 Phase 分阶段实现：

Phase 0：项目扫描与动画架构设计  
Phase 1：素材分层渲染与占位资产  
Phase 2：轻量伪骨骼动画运行时  
Phase 3：Idle / Hover / Click / Sleep MVP  
Phase 4：状态机与过渡融合  
Phase 5：TemperatureCheck / MemoryCrowded / Repairing / DataSorting / Celebrate  
Phase 6：硬件监控数据触发动画  
Phase 7：Quick Panel 与 MonitorBar UI 动效联动  
Phase 8：性能优化、测试与验收

## 严禁事项

- 严禁把 CoreCat 做成一张整体静态图。
- 严禁把所有动画写死在一个巨大组件里。
- 严禁状态切换时直接重置 transform。
- 严禁使用会频繁触发布局重排的 top/left/width/height 动画。
- 严禁引入大型动画依赖，除非先说明原因并获得确认。
- 严禁删除现有 Tauri/Rust 硬件监控逻辑。
- 严禁影响主应用窗口、设置窗口、硬件监控窗口的现有功能。

## 验收标准

完成后必须满足：
- CoreCat 默认 Idle 状态 5 秒内必须能看到呼吸、尾巴或耳朵微动。
- Hover 时头部、护目镜、眼神必须跟随鼠标，且有视差。
- Click 时必须有压缩、反弹、阻尼回弹和扳手旋转。
- Sleep 状态必须蜷缩、慢呼吸、眼睛闭合、呼噜泡泡。
- 状态切换必须平滑，无闪烁、无瞬移。
- 常驻状态下 CPU 占用要尽量低。
- 动画相关代码必须拆分清晰，便于继续扩展。