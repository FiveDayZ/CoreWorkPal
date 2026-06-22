# CoreCat 后续美术资产替换指南

## 1. 美术需要交付哪些文件

所有资产必须是透明背景，统一 `160 x 160` 或 `320 x 320` 画布，不允许裁切到部件边缘。

```text
src/pet/corecat/assets/corecat_skeleton/
  shadow.png 或 shadow.svg
  tail/
    tail_base.png 或 tail_base.svg
    tail_mid.png 或 tail_mid.svg
    tail_tip.png 或 tail_tip.svg
  body/
    body_base.png 或 body_base.svg
    arm_left.png 或 arm_left.svg
    arm_right_wrench.png 或 arm_right_wrench.svg
    arm_right_fan.png 或 arm_right_fan.svg
    pouch.png 或 pouch.svg
  head/
    head_base.png 或 head_base.svg
    ears_left.png 或 ears_left.svg
    ears_right.png 或 ears_right.svg
    goggles.png 或 goggles.svg
  eyes/
    eye_normal.png 或 eye_normal.svg
    eye_blink.png 或 eye_blink.svg
    eye_focused.png 或 eye_focused.svg
    eye_dizzy.png 或 eye_dizzy.svg
    eye_sleepy.png 或 eye_sleepy.svg
    eye_glowing.png 或 eye_glowing.svg
  props/
    ram_box.png 或 ram_box.svg
    wrench_clone.png 或 wrench_clone.svg
    badge_star.png 或 badge_star.svg
    sleep_bubble.png 或 sleep_bubble.svg
```

## 2. 文件放到哪里

放入：

```text
src/pet/corecat/assets/corecat_skeleton/
```

当前项目已有第一批透明 SVG 工程验收资产。正式美术可以直接覆盖这些 SVG，或提供同 basename 的 PNG。

## 3. 命名规则

- 小写英文。
- 单词用下划线。
- 不允许中文、空格、版本号后缀。
- 不允许提交整张合成猫图。
- `tail_base`、`tail_mid`、`tail_tip` 必须保持三段独立。

## 4. Pivot / Anchor 如何配置

运行时配置集中在：

```text
src/pet/corecat/assets/coreCatAssetManifest.ts
src/pet/corecat/animation/skeletonNodes.ts
```

当前 pivot：

| 资产 | Anchor | Pivot |
|---|---|---|
| shadow | shadow | 80,136 |
| tail_base | tail_base | 54,104 |
| tail_mid | tail_mid | 48,103 |
| tail_tip | tail_tip | 36,99 |
| body_base | body_base | 80,105 |
| arm_left | arm_left | 58,92 |
| arm_right_wrench | arm_right_wrench | 102,92 |
| arm_right_fan | arm_right_wrench | 102,92 |
| pouch | pouch | 106,112 |
| head_base | head_base | 80,68 |
| ears_left | ears_left | 57,40 |
| ears_right | ears_right | 103,40 |
| goggles | goggles | 80,62 |
| eyes | eyes | 80,66 |
| ram_box | vfx_anchor | 80,48 |
| wrench_clone | arm_right_wrench | 116,74 |
| badge_star | vfx_anchor | 104,34 |
| sleep_bubble | vfx_anchor | 99,64 |

如果正式美术重心有变化，只调整 manifest / skeletonNodes 中的 pivot，不要在 React 组件或 CSS 里散落修正值。

## 5. 替换后如何用 Debug Panel 验收

1. 运行开发模式：

```powershell
corepack pnpm dev
```

或运行 Tauri：

```powershell
corepack pnpm tauri dev
```

2. 打开 Pet 窗口。
3. 查看 `CoreCat Asset Panel`：
   - `loaded` 应等于 manifest asset 总数。
   - `missing` 应为 `0`。
   - 每个资产应显示 `formal`。
   - `tail_base`、`tail_mid`、`tail_tip` 的 anchor 应分别对应自身骨骼。
4. 在 `CoreCat Debug Panel` 逐个点击状态：
   - Idle：尾巴三段异步摆动。
   - Hover：头、眼睛、护目镜视差不破图。
   - Click：身体压缩，扳手转动，不错位。
   - Sleep：尾巴三段蜷缩到身体前侧。
   - Temperature / Memory / Repair / Data / Celebrate：资产不穿帮。

## 6. 替换后必须跑哪些命令

```powershell
corepack pnpm typecheck
corepack pnpm test:corecat
corepack pnpm build
```

如涉及 Tauri 窗口或透明置顶行为，再运行：

```powershell
corepack pnpm tauri dev
```

## 7. 手动视觉验收重点

- 80px 小尺寸下仍能识别为 CoreCat。
- 三段尾巴摆动时不能断裂。
- 眼睛所有表情必须对齐。
- 护目镜不能包含眼睛。
- `body_base` 不能包含尾巴、眼睛、护目镜、独立手臂。
- `pouch` 必须清晰，因为 Quick Panel 从这里展开和回收。
- 透明边缘不能有白边、黑边、脏边。
