````
# CoreWorkPal 专项规范：CoreCat 游戏级动画特效与动作开发文档 (v2.0)

> **文档状态**：正式发布 / 动效与开发实施标准
> **面向对象**：角色动画 AI、2D 游戏美术师、动效设计 AI、Codex 前端开发团队
> **核心目标**：彻底推翻传统桌宠“静态贴图轮播”的死板感。通过**分层骨骼微动、物理弹性补偿、常驻环境异步微动效**以及**游戏级状态机切换**，打造出具备 Live2D / Spine 游戏质感、活生生的 CoreCat。
> **应用场景**：基于 Tauri + Web (HTML5 Canvas / CSS / Web Animations API) 的轻量化桌面宠物应用。

---

## 1. 核心动画哲学：如何让猫“活”过来？

要让 CoreCat 摆脱死气沉沉的“静态图片切换”感，必须在动画设计中完全贯彻以下四条游戏级动力学原则：

* **常驻异步微动 (Layered Asynchronous Idle)**：猫的身体、尾巴、耳朵、眼睛**绝对不能**同时静止，也**绝对不能**同频同向运动。耳朵的抖动、眼睛的眨动、尾巴的摆动必须是随机、错开且异步的。
* **物理弹性补偿 (Anticipation, Squish & Stretch)**：当猫做出动作（如抬头、受到点击、跳跃）时，必须有前摇（反向蓄力压缩）和后摇（惯性超调回弹）。例如：受到点击时，身体先在 60ms 内向下压缩 6%，再快速向上拉伸冲高，最后经过三次衰减的简谐回弹才归位。
* **环境交互感知 (Contextual Awareness)**：猫必须与桌面及外部输入产生物理关联。它的脚底阴影会随着呼吸上下浮动而发生深浅和大小的联动变化；当鼠标靠近时，头颈与视线会产生轻微的**磁吸追踪动效**（视线跟随）。
* **平滑状态过渡 (State Transition Blending)**：严禁两套动作之间生硬截断切换。所有动画状态的进入与退出，必须通过代码层面的骨骼权重淡入淡出，或者通过特定的“过渡衔接帧（Transition Frames）”实现无缝滑行。

---

## 2. CoreCat 骨骼分层与动态资产图层规范

为了实现无缝的平滑变形与动态驱动，设计 AI 与美术资产严禁直接交付整张不可拆分静态死图，必须严格按照以下**高精度分层切图（Layered Assets）**进行输出。每个部件将作为独立节点接入前端 Canvas 渲染树或 CSS 变换图层：

```text
/assets/pets/corecat_skeleton/
  ├── shadow.png             # 脚底环境光遮蔽阴影（独立控制，不随身体呼吸）
  ├── tail/                  # 尾巴组件（独立图层，用于进行多节骨骼或网格物理形变）
  │   └── tail_base.png      
  ├── body/                  # 身体躯干层
  │   ├── body_base.png      # 身体与四肢基座（包含工具腰包基座）
  │   ├── arm_left.png       # 左手（常驻持握诊断平板）
  │   └── arm_right_wrench.png # 右手（持小扳手，可独立旋转、上下挥动）
  ├── head/                  # 头部组件层
  │   ├── head_base.png      # 头部基座（纯脸颊、头颅与毛发轮廓）
  │   ├── ears_left.png      # 左耳独立层（用于高频独立微颤）
  │   ├── ears_right.png     # 右耳独立层
  │   └── goggles.png        # 护目镜（带 1px 玻璃反光层，随头部有微弱位移差，形成伪 3D 视差）
  └── eyes/                  # 眼神、眼睑与情绪层
      ├── eye_normal.png     # 正常大睁眼（默认状态）
      ├── eye_blink.png      # 闭眼/眨眼帧
      ├── eye_focused.png    # 专注工作（半眯眼，眼角微吊）
      ├── eye_dizzy.png      # 眩晕/超载（蚊香眼或交叉眼）
      ├── eye_sleepy.png     # 困倦（半闭眼眼睑）
      └── eye_glowing.png    # 发现异常或奖励时的亮眼特效层
````

## 3. 常驻“生命感”微动效矩阵（底层代码/微动曲线驱动）

这部分动画由前端 Codex 使用 CSS `cubic-bezier` 或 Web Animations API 长期挂机运行。要求动效**幅度极小、周期极长、绝对不打扰用户正常工作**。

CSS

```
/* 核心猫咪 7*24小时 游戏级微动与弹性控制曲线 */
:root {
  --cat-breathing-curve: cubic-bezier(0.42, 0, 0.58, 1);       /* 极平滑正弦呼吸 */
  --cat-action-overshoot: cubic-bezier(0.175, 0.885, 0.32, 1.275); /* 带超调回弹 */
  --cat-fast-transit: cubic-bezier(0.25, 1, 0.5, 1);            /* 快速响应 */
}
```

### 3.1 异步呼吸循环 (Asynchronous Breathing Loop)

- **动作逻辑**：身体（`body_base`）以 `2800ms` 为周期进行柔和的垂直拉伸（`scaleY: 1.0` 到 `1.015`）；头部（`head_base`）延后 `350ms` 触发上下位移（`translateY: 0` 到 `0.8px`），形成颈部舒张的视差。
    
- **阴影联动**：当身体抬高时，脚底阴影（`shadow.png`）透明度由 `0.45` 平滑变为 `0.35`，同时横向收缩 `4%`。
    

### 3.2 随机生理微动 (Stochastic Micro-actions)

- **随机自主眨眼**：每隔 `5000ms` 至 `12000ms` 之间的一个随机时间戳，眼睛突发切换至 `eye_blink.png` 持续 `100ms`，再平滑恢复当前眼神。
    
- **独立耳朵抖动**：每隔 `7500ms`，左耳或右耳触发一次独立的高频微颤（小幅度 `rotate(±3deg)`，持续 `250ms`，波形为衰减正弦波）。
    
- **尾巴悠闲摆动**：尾巴图层通过微弱的 CSS `skewX` 或 Sine 曲线做永恒的左右波浪摆动（周期 `3800ms`），与呼吸频率完全错开。
    

## 4. 交互式游戏动作状态机与 AI 提示词规范

当用户产生鼠标交互，或系统底层硬件数据剧烈波动时，CoreCat 将通过**状态机（FSM）**从 Idle 平滑过渡到以下特定的重度交互动作。以下提示词专门针对**游戏骨骼动画/2D 矩阵变形/WebP 高清帧流**进行了重构，可直接复制交付给图像/动效 AI：

### 4.1 鼠标 Hover：磁吸视线追踪 (Mouse Tracking)

- **动作说明**：鼠标进入桌宠画布周围 `60px` 范围内，CoreCat 停止盲目呼吸。头部与护目镜朝向鼠标坐标进行最高 `±6px` 的平滑偏转，眼神（`eyes`）带有一点点伪 3D 视差（眼睛位移比例略大于脸部基座位移）。
    
- **美术出图/生成提示词**：
    
    > `Spine 2D game-ready animation rigging layout for CoreCat mouse-hover reaction. The orange chibi engineering cat tilts its head and shifts its large expressive eyes smoothly toward a dynamic target. Goggles reflect a subtle 1px neon line showing perspective change. Fluid parallax effect between head base and facial features, smooth easing, gaming asset feel, dark navy glass background.`
    

### 4.2 鼠标 Click 点击：惯性大回弹 (Click Response)

- **动作说明**：用户点击时，猫咪立刻触发强烈受力反馈。瞬间压缩下沉（`translateY(4px) scaleY(0.92)`），耗时 `50ms`；随后像强力弹簧一样猛烈弹起（`translateY(-3px) scaleY(1.05)`），最后在 `250ms` 内经过 3 次微弱阻尼振动恢复原状。同时右手的扳手欢快地转动一圈（360°）。
    
- **美术出图/生成提示词**：
    
    > `2D skeletal animation sequence of a cute engineering cat getting tapped. Joyful kinetic bounce back effect. Anticipation drop then energetic elastic spring up. The cat winks with one eye and spins its tiny wrench in a playful 360-degree motion, full of weight and squish-and-stretch physics, premium game sprite.`
    

Plaintext

```
[常驻呼吸] -> (用户点击) -> [瞬间压缩下沉 50ms] -> [猛烈反弹冲高 90ms] -> [简谐阻尼回弹 3次 160ms] -> [回归常驻呼吸]
```

### 4.3 状态：TemperatureCheck（硬件高温警报）

- **动作说明**：当系统 CPU/GPU 温度突破 75°C 时，猫咪从悠闲状态惊醒。它立刻放下平板，两只小爪子拼命摇晃一把具有硬核科技质感的微型扇子，或者抱着一个小气泵往自己身上吹冷气，脸颊两侧出现动态循环的蓝色科技冷光粒子。护目镜上亮起微型的 “COOLING...” 跑马灯字样。
    
- **美术出图/生成提示词**：
    
    > `Smooth loop webp animation, 12 frames per second. CoreCat in a frantic but cute cooling emergency mode. Sweating slightly with a determined expression, frantically waving a mini tech cooling fan. Cyan cold air wind streams and soft neon blue particles blowing around its feet. Smooth looping, low power overhead simulation, professional game asset layout.`
    

### 4.4 状态：MemoryCrowded（内存吃紧/重物压迫）

- **动作说明**：当物理内存占用 > 85% 时，猫咪做出被重物压垮的动态。它双手极其吃力地托举着一个巨大的、不断冒着橙色/红色警告微光的硬件内存条箱子，整个身体由于超负荷负重而高频轻微颤抖（颤抖频率 `25Hz`，幅度 `0.6px`），小短腿偶尔还会因为站不稳而稍微向外打滑、调整重心。
    
- **美术出图/生成提示词**：
    
    > `Character loop idle animation, heavy load weight physics. CoreCat holding a massive overloaded RAM module box that glows with warning orange light bars. The chibi cat is trembling slightly under pressure, knees slightly bent, balanced stance with realistic weight shifting. Cute engineering crisis aesthetic, transparent background.`
    

### 4.5 状态：Repairing（工坊模块后台修复中）

- **动作说明**：用户启动后台工坊清理、碎片整理或硬件加速时，CoreCat 进入工作狂状态。它转过身背对或侧对屏幕，面前展开一块微型虚拟全息蓝色屏幕，右手小扳手伴随着节奏敲击出火花（黄色像素粒子点），左脚欢快地在地上打着拍子（踏步动效）。
    
- **美术出图/生成提示词**：
    
    > `Looping character sprite sheet animation. CoreCat facing a tiny holographic workspace. Cute cat engineer typing on a virtual interface, tiny golden pixel sparks popping as its tool taps the screen. Joyful repetitive work rhythm, tapping foot, high contrast cyber aesthetic, 16 frames fluid loop.`
    

### 4.6 状态：DataSorting（低负载日常扫描/整理）

- **动作说明**：系统负载极低（如 CPU < 10%），进入闲置数据整理。猫咪戴上高科技单耳耳麦，单手在空气中轻快地划动，将一个个淡蓝色、绿色的小方块（数据包）抓取、分类并丢进它的随身工具腰包里，动作神似有条不紊的资深分拣员。
    
- **美术出图/生成提示词**：
    
    > `High quality game-like loop. A cute chibi cat sorting tiny glowing digital cubes into its pouch with fluent and relaxed hand movements. Cybernetic HUD elements floating around, calm tech operations, seamless movement loop, desaturated color palette with bright neon highlights.`
    

### 4.7 状态：Sleep/LowPower（电脑休眠/应用低功耗模式）

- **动作说明**：系统无操作超过 15 分钟，或用户手动勾选 "Low Power"。CoreCat 的护目镜自动上滑至额头，眼睛闭上（`eye_sleepy.png` 切换到完全闭眼），身体蜷缩成一个毛茸茸的圆球（拉近各个分层距离），随着极长、极缓的呼吸周期（`5000ms`）微微起伏，鼻尖上冒出一个带有 1px 像素发光线条的小呼噜泡（随着呼吸放大和缩小）。
    
- **美术出图/生成提示词**：
    
    > `Cozy looping sleep animation. CoreCat curled up into a soft fuzzy ball. Its engineering goggles are pushed up on its forehead. Slow 5000ms rhythmic deep breathing body scale loop. A tiny cyan glowing pixel sleep bubble inflating and deflating smoothly. Low CPU usage layout, ultra soft movement.`
    

### 4.8 状态：Celebrate（指标回落/升级成功获胜庆典）

- **动作说明**：用户手动清理内存成功或工坊模块升级完毕。猫咪触发高表现力的一次性动作：帅气地将小扳手抛向空中，身体原地欢快旋转 360 度接住扳手，顺势顺滑地拉下护目镜盖住眼睛，脚底炸开一圈由金色星点组成的“口袋工坊蒸汽烟雾环”，最后摆出一个单手撑腰的机甲英雄 Pose。
    
- **美术出图/生成提示词**：
    
    > `A dynamic, polished victory celebration animation for CoreCat. The chibi engineer cat flips its wrench high into the air, catches it with a cool reverse grip, snaps its goggles down instantly, and strikes a proud heroic pose. A localized ring of golden pixelated steam sparks explodes from its feet and fades out smoothly. 16 FPS high-fidelity game companion vfx.`
    

## 5. UI 动效的“游戏化场景植入”规范

为了消除传统软件中桌宠与主窗口“两个世界、生硬割裂”的体验，应用所有 UI 面板的弹出逻辑必须与猫咪的动作、物理状态进行**完全合拍的深层绑定**：

### 5.1 随身工具包面板轻展开 (Pet Quick Panel Open)

- **交互逻辑**：当用户点击猫咪触发 Quick Panel 时，猫咪右手必须首先做出“向左前方掏出诊断平板”的动作。**以此动作为起始锚点**，Pet Quick Panel 伴随着 `cubic-bezier(0.34, 1.56, 0.64, 1)`（超调弹性曲线）从猫咪的工具包边缘处**由小到大、横向兼纵向膨胀延展出来**，耗时 `180ms`。
    
- **视觉效果**：让面板看起来像是由猫咪在桌面现场拉出来的“实体高级装备”，彻底消灭普通网页那种生硬的、凭空出现的绝对定位弹窗。
    

### 5.2 状态胶囊监控条阻尼流淌 (MonitorBar Dynamic Slide)

- **交互逻辑**：当鼠标 Hover 状态胶囊监控条（`MonitorBar`）时，严禁机械变长。胶囊的两侧边缘要像液态金属、或者高级机械阻尼器一样，以极度柔和的缓动方式向两侧“流淌般拉伸”。
    
- **指标渐显**：各个硬件监控指标（CPU、RAM、Temp）在拉伸路径上，伴随着自左向右的 `120ms` 粒子扫描渐显依次亮起；数字刷新时，每个数字带有轻微的像素上下滚动（Roll-up）视觉滤镜，呈现出老式仪表盘更新的精细感。
    

## 6. 面向 Codex 的工程实现与验收卡点

为了在维持极致动态表现的同时，确保多动画常驻挂机时**整机 CPU 占用率仍然 $< 1\%$**，Codex 前端架构团队必须执行以下刚性硬化指标：

Plaintext

```
【性能工程卡点】
1. 所有常驻微动循环（呼吸、尾巴、眼睛）必须完全交由 GPU 硬件加速，只允许使用 transform: translate3d(), scale(), rotate()，严禁触发浏览器重排（Reflow）。
2. 严禁使用全画布大面积 Canvas 逐帧刷新整张大图。必须采用“静态身体基础层（DOM） + 局部高频微动（独立小 Canvas/CSS 变形）”的复合分层渲染模式。
3. 性能隔离保护：当 Codex 捕获到系统进入全屏 3D 游戏或高负载渲染应用时，必须自动切断 CoreCat 帧循环，无缝降低至【静态低功耗模式】，释放全部系统开销。

【动效失败判定清单（一票否决制）】
❌ 静态死图：猫咪处于默认状态下超过 5 秒内无任何耳朵、尾巴等局部的动态微细节（判定为静态贴纸，不合格）。
❌ 动作截断：动作状态机切换时，画面出现一瞬间的闪烁、突变、瞬间移位或图层断层（判定为未做过渡权重融合，不合格）。
❌ 传统网页感：点击反馈、面板展开过于刚性，没有动作前摇、后摇和 squish-and-stretch 物理弹性形变（判定为
```