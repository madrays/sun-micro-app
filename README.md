# Sun-Panel 微应用开发

本仓库包含 Sun-Panel 微应用开发文档和示例项目。

## 目录结构

```
sundev/
├── 开发文档/                    # Sun-Panel 微应用官方开发文档
│   ├── 01-介绍.md
│   ├── 02-快速开始.md
│   ├── 03-配置文件说明.md
│   ├── 04-数据节点.md
│   ├── 05-权限声明.md
│   ├── 06-生命周期.md
│   └── 07-API.md
├── hslr-hello-world-1.0.0/     # 官方 Hello World 示例
└── weather-app/                 # 天气微应用（基于和风天气 API）
```

## 天气微应用 (weather-app)

基于和风天气 API 的天气小部件，支持多种尺寸布局。

### 功能特性

- 实时天气显示
- 24小时预报
- 7天预报
- 空气质量指数
- 自动定位（需配置高德 API Key）
- 多种尺寸适配：1x1、1x2、1xfull、2x1、2x2、2x4

### 配置说明

1. 在 [和风天气开发平台](https://dev.qweather.com) 注册并获取 API Key
2. 添加微应用后，在配置页面填入 API Key
3. 设置城市位置（支持城市ID或经纬度定位）

### 开发

```bash
cd weather-app
npm install
npm run dev
```

## 开发文档

详细的微应用开发指南请参阅 `开发文档/` 目录：

- **介绍**: 微应用概念和架构
- **快速开始**: 创建第一个微应用
- **配置文件说明**: app.config.js 和 components.config.js 配置
- **数据节点**: 数据存储和权限管理
- **权限声明**: 网络、数据节点等权限
- **生命周期**: 组件生命周期钩子
- **API**: 完整的 API 参考文档

## 技术栈

- [Lit](https://lit.dev/) - Web Components 框架
- [@sun-panel/micro-app](https://www.npmjs.com/package/@sun-panel/micro-app) - Sun-Panel 微应用 SDK

## 许可证

MIT
