# CoreCat 动画与雪碧图压缩指南

本文档记录了 CoreCat 桌面宠物动画（WebP 格式雪碧图）及骨骼坐标文件（JSON 格式）的等比压缩与优化方法，以便在后续更新或重绘动画时作为操作参考。

---

## 1. 为什么需要进行动画压缩？

CoreCat 运行在 Tauri 桌面端环境中，其宠物动画通过 WebView2 渲染。
* **内存占用瓶颈**：如果在项目中直接使用高分辨率（例如 $5760 \times 5760$ 像素）的雪碧图（Sprite Sheet），WebView2 解码后的 RGBA 像素数据在内存中单张会占用高达 **126.56 MB**。而在预载 20 多张动画时，这会导致瞬间产生 **2 GB+** 的空前内存开销。
* **等比下调的收益**：将雪碧图的分辨率缩小至 **$1280 \times 1280$ 像素**（每帧从 $720 \times 720$ 降至 $160 \times 160$）后，解码后的单张内存占用将骤降至 **6.55 MB**（降低了约 **94.8%**）。
* **像素风保真**：通过在缩放时指定 **最近邻（Nearest-Neighbor）** 采样算法，以及在 CSS 渲染中设置 `image-rendering: pixelated`，可在无损画质的前提下完美保持像素边缘的锐利度，避免产生模糊。

---

## 2. 压缩比例与转换规则

压缩比例固定为 **$2 / 9$** （即 $160 / 720 \approx 0.2222$）：

| 属性 | 压缩前 (High-Res) | 压缩后 (Low-Res) | 转换公式 |
| :--- | :--- | :--- | :--- |
| **单帧宽度 (frame_size.w)** | 720 | **160** | $w_{\text{new}} = w_{\text{old}} \times \frac{2}{9}$ |
| **单帧高度 (frame_size.h)** | 720 | **160** | $h_{\text{new}} = h_{\text{old}} \times \frac{2}{9}$ |
| **雪碧图宽 (sheet_size.w)** | 5760 | **1280** | $W_{\text{new}} = W_{\text{old}} \times \frac{2}{9}$ |
| **雪碧图高 (sheet_size.h)** | 5760 | **1280** | $H_{\text{new}} = H_{\text{old}} \times \frac{2}{9}$ |
| **帧坐标 (x, y, w, h)** | 对应各帧坐标 | 缩放后整数坐标 | $\text{value}_{\text{new}} = \text{round}(\text{value}_{\text{old}} \times \frac{2}{9})$ |
| **帧时间 (t)** | 持续秒数 | 保持不变 | 不进行修改 |

---

## 3. 自动化压缩与处理脚本

以下是用于自动化执行 WebP 图片等比缩放以及同步重算 JSON 坐标文件的 Python 脚本。

### 脚本代码 (`scripts/compress_sprite_sheet.py`)

您可以在本地创建一个 python 脚本并执行它，或直接使用此脚本模版：

```python
import json
import os
import sys
from PIL import Image

def compress_animation(asset_name, base_dir):
    """
    等比压缩 CoreCat 动画图片与配置文件。
    :param asset_name: 资源名称（如 "Eating_Fish"）
    :param base_dir: 资源所在的绝对/相对路径
    """
    webp_path = os.path.join(base_dir, f"{asset_name}.webp")
    json_path = os.path.join(base_dir, f"{asset_name}.json")

    if not os.path.exists(webp_path) or not os.path.exists(json_path):
        print(f"错误: 找不到对应的资源文件 ({asset_name})")
        return False

    # 1. 压缩 WebP 图像
    print(f"正在处理 WebP 图像: {webp_path}")
    img = Image.open(webp_path)
    original_size = img.size
    
    # 比例校验，这里按 720px -> 160px 的 2/9 比例计算
    target_width = int(round(original_size[0] * 2 / 9))
    target_height = int(round(original_size[1] * 2 / 9))
    
    print(f"原始尺寸: {original_size} -> 目标尺寸: ({target_width}, {target_height})")

    # 使用 NEAREST filter 确保像素风图片无虚化
    resized_img = img.resize((target_width, target_height), Image.NEAREST)
    
    # 保存为无损 WebP，确保透明度通道和边缘干净
    resized_img.save(webp_path, format="WEBP", lossless=True)
    print(f"图像保存成功! 当前大小: {os.path.getsize(webp_path)} 字节")

    # 2. 转换 JSON 坐标
    print(f"正在处理 JSON 坐标: {json_path}")
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # 修改全局尺寸
    data["frame_size"]["w"] = 160
    data["frame_size"]["h"] = 160
    data["sheet_size"]["w"] = target_width
    data["sheet_size"]["h"] = target_height

    # 等比调整每帧的坐标参数
    for frame in data["frames"]:
        frame["x"] = int(round(frame["x"] * 2 / 9))
        frame["y"] = int(round(frame["y"] * 2 / 9))
        frame["w"] = int(round(frame["w"] * 2 / 9))
        frame["h"] = int(round(frame["h"] * 2 / 9))

    # 写回文件
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"JSON 坐标转换并保存成功!")
    return True

if __name__ == "__main__":
    # 使用示例：如果把脚本放在项目根目录下运行
    # python scripts/compress_sprite_sheet.py Eating_Fish src/assets/pets/animation
    if len(sys.argv) < 3:
        # 默认直接处理本项目内的 Eating_Fish 资源
        target_name = "Eating_Fish"
        target_dir = r"src/assets/pets/animation"
    else:
        target_name = sys.argv[1]
        target_dir = sys.argv[2]
        
    compress_animation(target_name, target_dir)
```

---

## 4. 验证与发布规范

当您在美术工具（例如 Spine / DragonBones）中重制动画并导出为高分辨率大图后，请依次执行以下步骤完成上线：

1. **资源导入**：将导出的高精 WebP 及带有关键帧坐标的 `.json` 文件复制到项目 `src/assets/pets/animation/` 目录下（覆盖旧文件）。
2. **运行脚本**：在项目根目录下，使用 Python 执行上述压缩脚本。
3. **跑自动化测试**：
   ```bash
   npm run test:corecat
   ```
   这会校验 JSON 的帧结构，以及 CoreCat 动画渲染物理边界和状态机是否在运行时报错。
4. **本地开发测试**：
   - 运行本地服务：`npm run dev`
   - 在浏览器中打开：`http://127.0.0.1:1420/pet`
   - 使用页面底部的 Debug 面板强制切换到新导入的动画状态，肉眼观察动作是否连贯、是否出现切图边缘穿帮或错位。
5. **打包应用**：
   确定画面无异常后，即可正常执行 `npm run build` 打包发布。
