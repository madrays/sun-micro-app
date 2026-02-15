# UI Design Lab

用于微应用 UI 联调的辅助工具，目标是让「看图说话」变成「元素级可复制信息协作」。

## 能力

- 自动扫描仓库内微应用（基于 `config/components.config.js`）
- 自动提取 Widget 尺寸、`baseStyle`、`sizeStyle`（若存在）
- 按统一网格标准计算尺寸（默认 `unit=76`、`gap=22`）
- 支持 `1xfull` 全宽独占一行预览
- 预览支持深浅背景、文字颜色、昼夜模式
- 支持网格线与元素框线开关
- 点击任意元素复制 JSON（路径、尺寸、关键样式）
- 每个预览卡右上角放大镜循环缩放（100%/125%/150%/200%）
- 放大后自动切换单尺寸模式；切换全尺寸自动恢复标准预览

## 启动

```bash
cd ui-design-lab
npm install
npm run dev
```

默认端口：`5176`

## 构建

```bash
npm run build
```

## manifest 生成机制

`npm run generate` 会生成：

- `public/manifest.json`

该文件包含扫描出的微应用与组件设计信息，供预览端读取。

## 使用建议

1. 先用单尺寸定位问题尺寸（如 `2x2`）。
2. 开启网格线检查对齐与边距。
3. 点击异常元素复制 JSON，直接发给 AI。
4. 修复后切换全尺寸做回归验证。

## 说明

如果某组件采用 `render1x1()/render2x2()` 这类函数内联 `<style>`，可能不会提取到独立 `sizeStyle` 对象；此时以真实组件渲染结果为准。
