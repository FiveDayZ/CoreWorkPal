# CoreWorkPal 每日工作评估系统开发文档

## 1. 产品定位

CoreWorkPal 的核心不是传统电脑清理工具，也不是纯游戏化养成工具，而是一个桌面伴侣化的电脑监控与工作状态解释器。

每日工作评估是项目的主要独创性。它需要把本地硬件监控、键鼠活动、运行稳定性和时间节奏，转化成一份有解释、有性格、有纪念感的每日工作画像。

核心表达：

> CoreCat 不只告诉用户 CPU、内存、磁盘、网络分别是多少，而是告诉用户：今天这台电脑陪你经历了什么，你的工作节奏是什么样的，这一天更像什么类型的工作日。

## 2. 设计目标

### 2.1 主要目标

- 将现有工作日志评分从普通报表升级为每日工作画像。
- 让用户每天打开 CoreWorkPal 时有一个明确、独特、可回看的总结。
- 用个人历史基线做相对评估，避免固定阈值导致误判。
- 让 CoreCat 成为数据解释者，而不是简单状态展示角色。
- 保持纯本地计算，不上传硬件信息、输入行为或日志数据。

### 2.2 非目标

- 不做强游戏化赛季、排行榜、社交竞争。
- 不做员工绩效考核工具。
- 不以分数评价用户是否努力。
- 不鼓励用户故意拉高硬件负载刷结果。
- 不把每日工作评估设计成压力提醒或惩罚机制。

## 3. 当前基础

项目已有以下可复用基础：

- `WorkLogEntry`：记录每日运行时长、采样数、CPU/GPU/RAM 负载、温度压力、IO 活跃、键鼠输入。
- `WorkLogReport`：输出总分、摘要、五个维度评分。
- `WorkLogPage`：展示日期选择、总分、维度卡片。
- `CoreCat` 状态体系：已支持 `Idle`、`Repairing`、`DataSorting`、`MemoryCrowded`、`TemperatureCheck`、`Celebrate` 等状态。
- `WorkshopState`：已有 `todayParts`、`todayInsight`、`totalOnlineSeconds` 等每日运行数据。

现有问题：

- 评估更像数据面板，缺少“这一天是什么样”的结论。
- 100 分制太像考核，趣味性和记忆点不足。
- 没有基于个人历史的相对比较。
- 缺少时间线、关键事件、今日亮点、今日隐患、明日建议。
- 工作日志页面缺少收藏和纪念属性。

## 4. 新系统总览

每日工作评估升级为 CoreCat 每日工况报告，包含五个核心模块：

1. 工作日类型判定
2. Workprint 每日工作指纹
3. 工作节奏时间线
4. CoreCat 三段式观察结论
5. 历史卡片墙

推荐页面结构：

```text
每日工况报告
├─ 今日工作日类型
│  ├─ 类型名称
│  ├─ CoreCat 一句话总结
│  └─ 代表性姿态 / 徽章
├─ Workprint 工作指纹
│  ├─ 像素指纹图案
│  ├─ 数据形状描述
│  └─ 与近 7 日基线对比
├─ 工作节奏时间线
│  ├─ 上午 / 下午 / 晚间分段
│  ├─ 高负载、IO、温度、输入活跃事件
│  └─ CoreCat 小旗子观察
├─ 今日亮点 / 今日隐患 / 明日建议
└─ 五维度评分
   ├─ 陪伴时长
   ├─ 工坊火力
   ├─ 蓝图复杂度
   ├─ 机器健康
   └─ 专注节奏
```

## 5. 核心概念定义

### 5.1 工作日类型

工作日类型是每日评估的主结论。它应该比总分更醒目。

建议首批类型：

| 类型 | 判定倾向 | 用户感受 |
| --- | --- | --- |
| 深度专注日 | 运行时间长，键鼠连续，负载稳定，温度健康 | 今天推进很稳 |
| 编译构建日 | CPU 高负载峰值多，磁盘读写明显 | 今天有大量构建/计算 |
| 资料归档日 | 磁盘和网络 IO 高，CPU 中低 | 今天偏资料处理和传输 |
| 高压抢修日 | 高负载、高温、内存拥挤频繁 | 今天机器承压明显 |
| 平稳维护日 | 时长中等，负载低到中，操作连续 | 今天是轻量但稳定的工作日 |
| 碎片切换日 | 活跃时间长，但负载和输入呈多段碎片峰值 | 今天任务切换比较多 |
| 低负载陪伴日 | CoreCat 在线较久，但硬件和输入活跃较低 | 今天电脑陪伴更多，工作强度较低 |

显示方式：

- 顶部大标题：`今日类型：深度专注日`
- 副标题：`CoreCat 观察到你今天的节奏持续而稳定，下午有一段明显的深度工作区间。`
- 徽章：像素风小章，例如 `FOCUS`、`BUILD`、`ARCHIVE`、`REPAIR`。

### 5.2 Workprint 每日工作指纹

Workprint 是每日独有的数据形状摘要。它不是分数，而是一天的工作纹理。

输入维度：

- 负载形态：CPU/GPU/RAM 峰值、平均值、高负载持续时间。
- IO 形态：磁盘读写、网络上传下载总量与峰值。
- 输入节奏：鼠标点击、键盘按键、活跃密度。
- 稳定性：温度压力、过热时长、内存拥挤时长。
- 时间结构：活跃片段数量、最长连续工作片段、空闲间隔。

输出内容：

- 指纹标签：`长时稳定型`、`短时爆发型`、`多段切换型`、`高压承载型`、`低负载陪伴型`。
- 指纹描述：`下午出现两次构建峰值，整体节奏连续，热压力低于近 7 日平均。`
- 像素图案：由 5 组指标生成 8x8 或 12x8 的像素指纹。

### 5.3 个人基线

每日评估必须和用户自己的历史相比，而不是和固定标准相比。

基线周期：

- 默认近 7 天。
- 历史不足 3 天时，使用固定阈值 + “数据积累中”提示。
- 未来可以支持近 14 天、近 30 天。

基线指标：

- 平均运行时长。
- 平均总分。
- 平均 CPU/GPU/RAM 活跃度。
- 平均 IO 活跃度。
- 平均温度压力。
- 平均键鼠输入密度。
- 常见活跃时段。

相对表达：

- `今天的 IO 活跃度是近 7 天最高。`
- `今天温度压力低于你的平均值，机器运行更稳。`
- `今天的连续工作片段比平时更长。`
- `今天负载更碎片化，可能经历了更多任务切换。`

### 5.4 工作节奏时间线

时间线是每日报告的可视化主体，替代纯折线图。

建议按时间切片聚合：

- 最小切片：15 分钟。
- 每个切片聚合 CPU、GPU、RAM、IO、温度、输入活动。
- 根据聚合结果给切片打标签。

时间片标签：

| 标签 | 判定 |
| --- | --- |
| 空闲陪伴 | 低负载、低输入 |
| 稳定推进 | 中等输入、低到中负载 |
| 深度工作 | 高输入连续，负载稳定 |
| 构建高峰 | CPU 高负载显著 |
| 资料归档 | 磁盘/网络 IO 显著 |
| 内存拥挤 | RAM 超过阈值 |
| 温度预警 | CPU/GPU 温度超过阈值 |
| 高压抢修 | 高负载 + 高温或内存拥挤 |

页面展示：

- 横向时间条。
- 每段使用不同像素颜色。
- 关键事件用小旗子标记。
- 点击事件展示 CoreCat 解释。

## 6. 数据结构设计

### 6.1 后端结构扩展

建议新增 `DailyWorkAssessment`，不要直接把所有字段塞进现有 `WorkLogReport`。`WorkLogReport` 可以继续作为基础评分报告，`DailyWorkAssessment` 作为上层产品化解释。

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DailyWorkAssessment {
    pub date: String,
    pub day_type: WorkDayType,
    pub day_type_title: String,
    pub workprint: WorkprintSummary,
    pub baseline: BaselineComparison,
    pub timeline: Vec<WorkTimelineSegment>,
    pub highlights: Vec<AssessmentInsight>,
    pub risks: Vec<AssessmentInsight>,
    pub suggestions: Vec<AssessmentInsight>,
    pub dimensions: Vec<WorkLogScoreDimension>,
    pub score: u32,
    pub corecat_summary: String,
    pub badge_ids: Vec<String>,
}
```

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum WorkDayType {
    DeepFocus,
    BuildBurst,
    ArchiveFlow,
    PressureRepair,
    StableMaintenance,
    FragmentedSwitching,
    LowLoadCompanion,
    Unknown,
}
```

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkprintSummary {
    pub label: String,
    pub description: String,
    pub pixel_grid: Vec<u8>,
    pub width: u8,
    pub height: u8,
    pub load_shape: f64,
    pub input_rhythm: f64,
    pub io_intensity: f64,
    pub thermal_pressure: f64,
    pub continuity: f64,
}
```

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BaselineComparison {
    pub sample_days: u32,
    pub active_seconds_delta_ratio: f64,
    pub load_delta_ratio: f64,
    pub io_delta_ratio: f64,
    pub thermal_delta_ratio: f64,
    pub input_delta_ratio: f64,
    pub summary: String,
}
```

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkTimelineSegment {
    pub start_time: String,
    pub end_time: String,
    pub kind: WorkTimelineSegmentKind,
    pub intensity: f64,
    pub label: String,
    pub description: String,
}
```

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum WorkTimelineSegmentKind {
    IdleCompanion,
    SteadyProgress,
    DeepFocus,
    BuildPeak,
    ArchiveFlow,
    MemoryCrowded,
    TemperatureWarning,
    PressureRepair,
}
```

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AssessmentInsight {
    pub title: String,
    pub body: String,
    pub severity: InsightSeverity,
    pub metric_value: Option<String>,
}
```

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum InsightSeverity {
    Positive,
    Neutral,
    Warning,
}
```

### 6.2 时间片数据

现有 `WorkLogEntry` 是按日累加，无法还原时间线。需要新增轻量时间片记录。

建议新增：

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct WorkLogTimeSlice {
    pub start_timestamp: i64,
    pub end_timestamp: i64,
    pub sample_count: u64,
    pub cpu_load_points: f64,
    pub gpu_load_points: f64,
    pub memory_load_points: f64,
    pub thermal_pressure_points: f64,
    pub io_activity_points: f64,
    pub disk_read_bytes_total: u64,
    pub disk_write_bytes_total: u64,
    pub network_download_bytes_total: u64,
    pub network_upload_bytes_total: u64,
    pub mouse_click_count: u64,
    pub keyboard_press_count: u64,
}
```

存储方式：

- 在 `WorkLogEntry` 中新增 `time_slices: Vec<WorkLogTimeSlice>`。
- 每 15 分钟生成或更新一个切片。
- 最多保留近 30 天切片，避免无限增长。
- 旧数据缺少切片时，页面降级显示“今日节奏数据不足”。

## 7. 算法设计

### 7.1 日类型判定

输入特征：

- `hours`
- `cpu_avg`
- `gpu_avg`
- `memory_avg`
- `io_avg`
- `high_load_ratio`
- `thermal_avg`
- `input_density`
- `active_segment_count`
- `longest_focus_segment_minutes`
- `fragmentation_index`

优先级：

1. 高压抢修日：高温/内存拥挤/高负载组合明显。
2. 编译构建日：CPU 高峰和磁盘读写明显。
3. 资料归档日：IO 明显高于负载。
4. 深度专注日：连续输入和稳定时长突出。
5. 碎片切换日：活跃片段多且间隔分散。
6. 平稳维护日：中等时长、中低负载、稳定。
7. 低负载陪伴日：在线但活跃低。

伪代码：

```text
if thermal_pressure_high && high_load_ratio_high:
  PressureRepair
else if cpu_peak_or_high_load && disk_activity_high:
  BuildBurst
else if io_high && cpu_load_not_high:
  ArchiveFlow
else if longest_focus_segment_high && input_density_high && thermal_stable:
  DeepFocus
else if fragmentation_index_high:
  FragmentedSwitching
else if active_seconds_medium && stability_high:
  StableMaintenance
else:
  LowLoadCompanion
```

### 7.2 Workprint 生成

将 5 个核心维度归一化为 0-1：

- load_shape
- input_rhythm
- io_intensity
- thermal_pressure
- continuity

生成标签：

```text
if continuity high and thermal low:
  长时稳定型
if load high and active seconds short/medium:
  短时爆发型
if segment count high:
  多段切换型
if thermal high or memory crowded:
  高压承载型
if all low but online time high:
  低负载陪伴型
```

像素指纹生成：

- 使用 8x8 网格，输出 `Vec<u8>`。
- 每一行代表一个维度或时间段。
- 每个像素值代表强度等级：0 空、1 低、2 中、3 高、4 预警。
- 前端按主题色渲染为像素图案。

### 7.3 亮点、隐患和建议生成

亮点来源：

- 某指标高于近 7 日平均。
- 连续工作片段刷新近 7 日最高。
- 高负载但温度稳定。
- IO 高但系统稳定。
- 总分或某维度达到优秀区间。

隐患来源：

- 内存拥挤累计时间过长。
- CPU/GPU 温度超过阈值较久。
- 高负载持续但输入活跃低，可能有后台占用。
- 长时间运行但碎片化严重。

明日建议来源：

- 如果温度风险高：建议关注散热或开启低功耗视觉模式。
- 如果内存拥挤高：建议留意后台应用。
- 如果碎片化高：建议安排更集中的工作窗口。
- 如果低负载陪伴：鼓励继续保持，不批评用户。

文案原则：

- 不评价用户懒或不努力。
- 不使用绩效化语气。
- 使用 CoreCat 观察口吻。
- 结论必须能被数据解释。

## 8. UI 设计

### 8.1 WorkLogPage 改版

页面名称建议：

- 侧边栏仍可叫 `Work Log`
- 页面标题改为 `每日工况报告`

布局：

```text
┌──────────────────────────────────────────┐
│ 日期选择 / 历史卡片入口                   │
├──────────────────────────────────────────┤
│ 今日类型卡                               │
│ 深度专注日 + CoreCat 总结 + 徽章          │
├──────────────────────────────────────────┤
│ Workprint 指纹       │ 近 7 日对比        │
├──────────────────────────────────────────┤
│ 工作节奏时间线                           │
├──────────────────────────────────────────┤
│ 今日亮点 │ 今日隐患 │ 明日建议            │
├──────────────────────────────────────────┤
│ 五维度评分卡片                           │
└──────────────────────────────────────────┘
```

### 8.2 视觉语义

颜色建议：

- 深度专注：青蓝 / 蓝紫
- 编译构建：橙黄
- 资料归档：蓝绿
- 高压抢修：红橙
- 平稳维护：绿色
- 碎片切换：紫粉
- 低负载陪伴：柔和灰蓝

注意：

- 不要把整个页面做成游戏活动页。
- 保持监控工具的清晰、克制、可读。
- 趣味性来自解释、图案和 CoreCat 语气，不来自夸张动效。

### 8.3 CoreCat 联动

不同日报类型对应不同 CoreCat 状态或短动画：

| 类型 | 推荐动画 |
| --- | --- |
| 深度专注日 | `DataSorting` / 专注整理 |
| 编译构建日 | `Repairing` / 工具检修 |
| 资料归档日 | `DataSorting` |
| 高压抢修日 | `TemperatureCheck` 或 `Repairing` |
| 平稳维护日 | `Idle` + 轻微庆祝 |
| 碎片切换日 | `MemoryCrowded` 的轻量版本 |
| 低负载陪伴日 | `Sleep` / 安静陪伴 |

日报生成完成时可以触发：

- `achievementPop`：首次生成日报、刷新个人记录。
- `celebrate`：今日亮点明显。
- `dataSorting`：正在整理日报。

## 9. API 设计

新增 Tauri 命令：

```rust
#[tauri::command]
pub async fn get_daily_work_assessment(
    date: Option<String>,
    state: State<'_, AppState>,
) -> Result<DailyWorkAssessment, String>
```

前端封装：

```ts
export async function getDailyWorkAssessment(
  date?: string,
): Promise<DailyWorkAssessment>
```

前端类型文件：

- 新增 `src/types/dailyWorkAssessment.ts`

推荐新增 store：

- `src/stores/dailyWorkAssessmentStore.ts`

也可以短期复用 `workLogStore`，但长期建议拆分，避免 `WorkLogReport` 继续膨胀。

## 10. 实现阶段

### Phase 1：日报上层模型

目标：

- 新增 `DailyWorkAssessment` 类型。
- 基于现有 `WorkLogEntry` 生成工作日类型、CoreCat 总结、三段式结论。
- 不做时间线，不改存储结构。

产出：

- `get_daily_work_assessment`
- 前端基础页面展示
- 浏览器 mock 数据

验收：

- 不同历史日期可正常显示。
- 无数据日期给出温和空状态。
- 至少能输出 7 种工作日类型中的 3 种。

### Phase 2：个人基线

目标：

- 从近 7 天 `WorkLogEntry` 生成个人基线。
- 日报中加入相对比较。

产出：

- `BaselineComparison`
- 近 7 日对比文案

验收：

- 历史不足时正确降级。
- 至少输出 2 条相对比较。
- 不使用绝对化评判语气。

### Phase 3：时间片与时间线

目标：

- 扩展 `WorkLogEntry`，记录 15 分钟时间片。
- 生成 `WorkTimelineSegment`。

产出：

- 时间片存储与迁移兼容。
- WorkLogPage 时间线组件。

验收：

- 当日运行时可以逐步生成时间线。
- 历史无切片数据不崩溃。
- 时间线能标记高负载、IO、温度和空闲片段。

### Phase 4：Workprint 指纹

目标：

- 生成 `WorkprintSummary`。
- 前端渲染像素指纹。

产出：

- 8x8 或 12x8 像素网格渲染组件。
- 指纹标签与描述。

验收：

- 不同工作形态生成明显不同图案。
- 图案随主题色适配。
- 低数据量时显示占位指纹。

### Phase 5：历史卡片墙

目标：

- 将过去 14 天日报以卡片形式展示。
- 每张卡展示日期、工作日类型、分数、徽章、简短总结。

产出：

- 历史卡片墙组件。
- 点击卡片切换日期。

验收：

- 空日期显示灰态。
- 日期切换保持流畅。
- 卡片不泄露敏感硬件细节。

## 11. 文案规范

### 11.1 推荐语气

- 观察式：`CoreCat 观察到...`
- 陪伴式：`今天工坊陪你稳定运行了...`
- 解释式：`这通常意味着...`
- 建议式：`如果明天继续高负载，可以...`

### 11.2 禁用语气

- 禁止：`你今天不够努力`
- 禁止：`工作效率较差`
- 禁止：`请提高工作强度`
- 禁止：`你浪费了很多时间`
- 禁止：任何员工监控、绩效评判、惩罚意味表达

### 11.3 示例文案

深度专注日：

> CoreCat 观察到你今天有一段很稳定的连续工作区间，键鼠节奏和系统负载都比较平顺，像是一次扎实推进的深度工作日。

编译构建日：

> 今天工坊火力集中，CPU 和磁盘多次出现构建峰值。CoreCat 判断这更像一个编译、打包或批处理任务较多的工作日。

资料归档日：

> 今天的数据传输和磁盘归档比较活跃，CoreCat 在硬盘柜旁忙了一阵。整体更像资料整理、下载同步或归档处理的一天。

高压抢修日：

> 今天机器承压明显，高负载和温度压力都有出现。CoreCat 已把这些片段标在时间线上，建议之后留意散热和后台任务。

低负载陪伴日：

> 今天 CoreCat 更多是在安静陪伴，系统负载和操作节奏都偏轻。这样的日子也适合整理环境、阅读资料或让机器休息。

## 12. 隐私与安全

- 所有日报数据仅存储在本地。
- 不记录具体键盘内容，只记录按键次数。
- 不记录鼠标坐标轨迹，只记录点击次数。
- 不记录窗口标题、进程名称、网页地址，除非未来用户明确开启高级诊断。
- 分享卡片默认只展示抽象指标，不展示硬件型号和敏感数据。

## 13. 测试方案

### 13.1 后端单元测试

覆盖：

- 无数据日报。
- 低负载陪伴日。
- 深度专注日。
- 编译构建日。
- 高压抢修日。
- 历史不足时的基线降级。
- Workprint 网格尺寸稳定。
- 时间片跨天边界。

### 13.2 前端测试重点

覆盖：

- 日报空状态。
- 日期切换。
- 历史卡片墙。
- 时间线过长时布局不溢出。
- Workprint 在三种主题下可读。
- 窄窗口下不遮挡、不重叠。

### 13.3 人工验收场景

场景 1：运行 30 分钟低负载  
期望：低负载陪伴日或平稳维护日，文案温和。

场景 2：运行高 CPU 构建任务  
期望：编译构建日，时间线出现构建高峰。

场景 3：内存持续高占用  
期望：日报包含今日隐患，CoreCat 给出内存拥挤解释。

场景 4：磁盘/网络大量传输  
期望：资料归档日或时间线中出现归档片段。

场景 5：历史不足  
期望：展示“正在积累个人基线”，不报错。

## 14. 文件改动建议

后端：

- `src-tauri/src/models.rs`
  - 新增日报相关结构。
  - 扩展 `WorkLogEntry` 时间片字段。
- `src-tauri/src/commands/mod.rs`
  - 新增 `get_daily_work_assessment` 命令。
- `src-tauri/src/monitoring/mod.rs`
  - 写入时间片数据。
- 可选新增：
  - `src-tauri/src/work_assessment/mod.rs`
  - 将日报算法从 `models.rs` 拆出，避免模型文件过大。

前端：

- `src/types/dailyWorkAssessment.ts`
- `src/stores/dailyWorkAssessmentStore.ts`
- `src/services/tauriCommands.ts`
- `src/pages/work-log/WorkLogPage.tsx`
- 可选新增：
  - `src/pages/work-log/WorkDayTypeHero.tsx`
  - `src/pages/work-log/WorkprintPanel.tsx`
  - `src/pages/work-log/WorkTimeline.tsx`
  - `src/pages/work-log/AssessmentInsights.tsx`
  - `src/pages/work-log/HistoryCardWall.tsx`

样式：

- `src/styles/core-ui.css`
  - 新增日报模块样式。
  - 注意保持现有像素风和主题变量一致。

## 15. 优先级建议

最高优先级：

1. 工作日类型判定。
2. CoreCat 总结文案。
3. 今日亮点 / 今日隐患 / 明日建议。
4. 个人基线对比。

中优先级：

1. 工作节奏时间线。
2. Workprint 指纹。
3. 历史卡片墙。

低优先级：

1. 分享图片导出。
2. 徽章收藏系统。
3. 更复杂的长期趋势分析。

## 16. 成功标准

用户体验成功标准：

- 用户打开日志页时，第一眼能知道今天是什么类型的工作日。
- 用户能从日报里看到至少一条“只有今天才会出现”的观察。
- 用户能理解数据背后的原因，而不是只看到分数。
- 用户愿意回看过去几天的报告。
- CoreCat 的陪伴感增强，但不破坏工具属性。

产品差异化成功标准：

- 与普通硬件监控工具相比，CoreWorkPal 不只显示指标，还解释一天的工作形态。
- 与普通时间追踪工具相比，CoreWorkPal 不监控具体应用和隐私内容，而是用本地硬件状态生成工作画像。
- 与普通游戏化工具相比，CoreWorkPal 的趣味来自真实数据的转译，而不是虚构任务。

