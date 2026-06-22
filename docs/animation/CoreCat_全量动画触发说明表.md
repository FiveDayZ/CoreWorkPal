# CoreCat 全量动画触发说明表

## 1. 系统默认不可配置动画

| 动画状态 | 类型 | 触发规则 | 启停规则 |
| --- | --- | --- | --- |
| `bootWake` | 瞬时 | 桌宠窗口在当前会话首次挂载时播放一次。 | 播放完整片段后回到当前常驻状态。 |
| `idle` | 待命循环 | 无更高优先级状态、瞬时动画或硬件阈值状态时，作为设备待命展示动画之一。 | 与 `dataSorting` 随机循环；被任意更高优先级状态覆盖。 |
| `dataSorting` | 待命循环 | 设备处于 `Idle` 待命、无鼠标悬停、无点击/拖拽、无低功耗/静态模式时，和 `idle` 随机轮播。 | 随机持有一个循环周期后可切换到 `idle`；被任意更高优先级状态覆盖。 |
| `hover` | 交互常驻 | 鼠标进入 CoreCat 命中区域，且未拖拽、未静态模式。 | 鼠标离开命中区域或进入拖拽/静态模式后停止。 |
| `click` | 瞬时反馈 | 点击或双击 CoreCat。 | 播放完整反馈后回到当前常驻状态。 |
| `dragging` | 交互常驻 | 鼠标左键按下并移动超过拖拽阈值，进入窗口拖拽。 | 拖拽释放后停止，并触发 `dropLanding`。 |
| `dropLanding` | 瞬时 | 拖拽结束后触发，包含落地回弹。 | 通过 one-shot 队列完整播放后回到当前常驻状态。 |
| `panelOpen` | 瞬时 | 快捷面板打开事件 `corecat:interaction-state=panelOpen`。 | 播放完整片段后回到当前常驻状态。 |
| `panelClose` | 瞬时 | 快捷面板关闭事件 `corecat:interaction-state=panelClose`。 | 播放完整片段后回到当前常驻状态。 |
| `sleep` | 常驻 | 工坊暂停，或启用睡眠模式且超过无操作时间。 | 取消暂停或恢复用户活动后，按状态优先级回到硬件状态或 `idle`。 |
| `lowPowerStatic` | 常驻降级 | 设置页启用低功耗、调试强制低功耗、窗口隐藏或失焦一段时间后启用。 | 关闭低功耗或窗口恢复前台后停止；它是表现降级，不是独立硬件阈值。 |
| `celebrate` | 瞬时/短驻留 | 清理成功或成功类状态事件触发。 | 播放后回到当前常驻状态。 |
| `workshopUpgrade` | 瞬时 | 工坊整体升级成功后触发。 | 播放完整片段后回到当前常驻状态。 |
| `moduleUpgrade` | 瞬时 | 工坊模块 MOD 升级成功后触发。 | 播放完整片段后回到当前常驻状态。 |

## 2. 设置页可自定义阈值触发动画

| 动画状态 | 设置项 | 类型 | 触发规则 | 启停规则 |
| --- | --- | --- | --- | --- |
| `temperatureCheck` | Temperature CPU / Temperature GPU | 常驻 | CPU 或 GPU 温度高于设置阈值时进入。设置页下限为 75 C，运行时也保证低于 75 C 不会触发。 | 温度全部低于 70 C 并稳定 5 秒后退出，避免 60 C 等正常温度常驻。 |
| `memoryCrowded` | Memory Crowded | 常驻 | 内存占用率高于设置阈值时进入。 | 内存占用回落后，满足状态最短保持时间再退出。 |
| `repairing` / Working | Working CPU | 常驻 | CPU 占用率达到设置阈值时进入轻量工作/维护状态；CPU 或 GPU 达到 92% 时进入重载维护状态。 | CPU/GPU 回落后，满足状态最短保持时间再退出。 |
| `errorGlitch` | ErrorGlitch CPU | 瞬时故障 | CPU 占用率首次达到设置阈值时触发一次。 | 播放完整片段后回到当前常驻状态；CPU 回落到阈值减 6% 以下后重新武装，避免连续闪烁。 |

## 3. 暂无自动触发条件的动画

| 动画状态 | 当前状态 | 说明 |
| --- | --- | --- |
| `updateInstalling` | 保留资产与调试入口 | 当前暂无更新安装工作流事件接入。 |
| `achievementPop` | 保留资产与调试入口 | 当前暂无成就系统事件接入。 |

## 优先级规则

- 瞬时动画：`bootWake`、`click`、`dropLanding`、`panelOpen`、`panelClose`、`workshopUpgrade`、`moduleUpgrade`、`errorGlitch` 等进入 one-shot 队列，必须完整播放。
- 播放时长：外部 one-shot 事件优先按实际 sprite-sheet 元数据时长持有，避免 `panelOpen` / `panelClose` 等素材被短配置截断；点击反馈保留 300ms 交互响应时长。
- 常驻动画：`temperatureCheck`、`memoryCrowded`、`repairing`、`sleep`、`idle`、`dataSorting` 等由状态机实时仲裁。
- 恢复规则：瞬时动画结束后，状态机会恢复当前优先级最高的常驻动画；例如高温仍存在时恢复 `temperatureCheck`，内存拥挤仍存在时恢复 `memoryCrowded`。
- 状态优先级：Hidden > TemperatureCheck > RepairHeavy > MemoryCrowded > RepairLight/Working > Sleep > DataSorting > Celebrate > Interactive > Idle。
