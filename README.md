# Sun-Panel 微应用开发

本仓库包含 Sun-Panel 微应用开发文档、示例微应用与 UI 协作调试工具。

## 目录结构

```txt
sundev/
├── 开发文档/                    # 微应用开发文档
│   ├── index.md                 # 文档总览
│   ├── quick_start.md           # 快速开始
│   ├── project_structure.md     # 项目结构
│   ├── config.md                # 配置说明
│   ├── data_node.md             # 数据节点
│   ├── permission.md            # 权限声明
│   ├── dev_guide.md             # 组件开发
│   ├── ui_guide.md              # UI 开发指南
│   ├── api.md                   # API 文档
│   ├── publish.md               # 打包发布
│   └── 敏感配置安全实践.md
├── hslr-hello-world-1.0.0/      # Hello World 示例
├── weather-app/                 # 天气微应用（和风天气）
├── holiday-countdown-app/       # 节假日倒计时微应用
├── qb-downloader-app/           # qBittorrent 下载器监控
├── pixel-pet-app/               # 像素宠物养成
└── ui-design-lab/               # AI 协作 UI 调试台
```

## 天气微应用（weather-app）

### 功能特性

- 实时天气、24 小时预报、7 天预报
- 空气质量指数展示
- 自动定位（需配置高德 API Key）
- 支持尺寸：`1x1`、`1x2`、`1xfull`、`2x1`、`2x2`、`2x4`

### 开发

```bash
cd weather-app
npm install
npm run dev
```

## 节假日倒计时微应用（holiday-countdown-app）

### 功能特性

- 自动获取下一个中国节假日
- 按真实节日日期计算倒计时
- 节日主题 SVG 插画
- 透明背景、深浅文字适配
- 支持尺寸：`1x1`、`1x2`、`2x1`、`2x2`、`2x4`

### 开发

```bash
cd holiday-countdown-app
npm install
npm run dev
```

## QB 下载器（qb-downloader-app）

### 功能特性

- qBittorrent WebUI 状态监控
- 实时上传/下载速度
- 种子统计（下载中、做种、暂停、总数）
- 累计流量、分享率、磁盘剩余
- 支持尺寸：`1x1`、`1x2`、`2x1`、`2x2`、`2x4`

### 开发

```bash
cd qb-downloader-app
npm install
npm run dev
```

## 像素宠物（pixel-pet-app）

### 功能特性

- 像素风格虚拟宠物养成
- 喂食、玩耍、抚摸、治疗互动
- 状态持久化存储
- 支持尺寸：`2x2`、`2x4`

### 开发

```bash
cd pixel-pet-app
npm install
npm run dev
```

## UI 协作调试台（ui-design-lab）

用于和 AI 协作调试微应用 UI，减少“描述不清导致反复改”的成本。

### 功能特性

- 自动扫描仓库中的微应用组件与尺寸
- 按固定网格标准预览（默认 `unit=76`、`gap=22`）
- `1xfull` 全宽尺寸独立一行预览
- 前端一键“刷新最新改动”，无需重跑命令生成清单
- 点击元素复制 JSON（结构、尺寸、关键样式）
- 支持网格线、元素框线、深浅背景、昼夜预览
- 支持单尺寸 / 全尺寸模式
- 每个预览卡右上角放大镜循环缩放（100/125/150/200）
- 放大自动切换单尺寸；切换全尺寸自动恢复正常预览
- 单尺寸/放大模式支持编辑：拖动元素、`+/-` 缩放、`Shift +/-` 调整字体
- “复制更改”输出 `before/after` 最终差异，便于和 AI 精确沟通

### 开发

```bash
cd ui-design-lab
npm install
npm run dev
```

## 开发文档

详细文档位于 `开发文档/`：

- `开发文档/index.md`：文档总览
- `开发文档/quick_start.md`：快速开始
- `开发文档/project_structure.md`：项目结构
- `开发文档/config.md`：配置说明
- `开发文档/data_node.md`：数据节点
- `开发文档/permission.md`：权限声明
- `开发文档/dev_guide.md`：组件开发
- `开发文档/ui_guide.md`：UI 开发指南（固定尺寸 + 调试台 + 最佳实践）
- `开发文档/api.md`：平台 API
- `开发文档/publish.md`：打包发布
- `开发文档/敏感配置安全实践.md`：敏感配置安全实践

## 技术栈

- [Lit](https://lit.dev/) - Web Components 框架
- [@sun-panel/micro-app](https://www.npmjs.com/package/@sun-panel/micro-app) - Sun-Panel 微应用 SDK

## 许可证

MIT
