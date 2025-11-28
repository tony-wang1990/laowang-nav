# Nav-Item - 个人导航站

> 一个现代化的个人导航网站项目，基于 Dashy 设计理念重构。提供简洁美观的界面、强大的个性化配置和纯前端的极致体验。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg)

## 🛠️ 技术栈

**React + TypeScript + Vite + Tailwind CSS** (纯前端架构)

## ✨ 主要功能

### 🎨 前端体验
- **🏠 首页导航**：美观的卡片式布局，支持多层级分类
- **🔍 聚合搜索**：集成 Google、百度、Bing、GitHub 等多引擎搜索
- **📱 响应式设计**：完美适配桌面、平板和移动端设备
- **🎨 个性化主题**：内置 9 款精美主题（流光、星空、赛博等），支持动态背景切换
- **⛅ 实用组件**：集成实时天气、日期时间显示
- **🌍 多语言支持**：支持简体中文和 English 切换

### ⚙️ 管理与配置
- **🔒 安全认证**：支持修改管理员账号密码（本地持久化存储）
- **📝 即时编辑**：支持直接在页面上添加、编辑、删除分类和卡片
- **🖼️ 图标自动获取**：添加链接时自动抓取网站 Favicon
- **💾 配置管理**：支持配置文件的导出与导入（JSON/YAML），数据完全掌握在自己手中
- **☁️ 纯前端运行**：无需后端数据库，数据存储于本地浏览器或通过配置文件分发

## 🏗️ 项目结构

```
nav-item/
├── public/               # 静态资源目录
├── src/                  # 源代码目录
│   ├── components/       # UI 组件
│   │   ├── Dashboard/    # 核心卡片网格视图
│   │   ├── Layout/       # 布局组件 (Header, Footer, Sidebar)
│   │   ├── Modals/       # 功能弹窗 (登录, 设置, 编辑)
│   │   └── Widgets/      # 实用小组件
│   ├── store/            # 状态管理 (Zustand)
│   ├── types/            # TypeScript 类型定义
│   ├── locales/          # i18n 国际化文件
│   ├── App.tsx           # 应用入口组件
│   └── main.tsx          # 渲染入口
├── Dockerfile            # Docker 构建配置
├── docker-compose.yml    # Docker Compose 配置
├── index.html            # HTML 入口
└── vite.config.ts        # Vite 配置文件
```

## 🚀 部署指南

### 📦 Docker 部署 (推荐)

#### 1. 快速启动
```bash
docker run -d -p 3000:80 --name nav-item ghcr.io/tony-wang1990/nav-item:latest
```

#### 2. Docker Compose
```yaml
version: '3.8'
services:
  app:
    image: nav-item:latest
    build: .
    ports:
      - "3000:80"
    restart: always
```
运行命令：
```bash
docker-compose up -d
```

### ☁️ 一键部署 (Serverless)

无需服务器，免费托管：

| 平台 | 说明 | 链接 |
|------|------|------|
| **Vercel** | 推荐，速度快 | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tony-wang1990/laowang-nav) |
| **Netlify** | 稳定，免费额度高 | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/tony-wang1990/laowang-nav) |
| **Zeabur** | 容器化部署 | [![Deploy on Zeabur](https://zeabur.com/button.svg)](https://zeabur.com/templates/Rb400W) |

### 💻 源代码部署

#### 1. 克隆项目
```bash
git clone https://github.com/tony-wang1990/laowang-nav.git
cd laowang-nav
```

#### 2. 安装依赖
```bash
npm install
```

#### 3. 开发模式运行
```bash
npm run dev
# 访问 http://localhost:5173
```

#### 4. 生产环境构建
```bash
npm run build
# 构建产物位于 dist/ 目录，可部署至任何静态服务器 (Nginx, Apache 等)
```

## ⚙️ 配置说明

由于是纯前端项目，大部分配置通过界面右上角的 **设置 (Settings)** 面板进行：

1.  **默认账号**：`admin` / `admin` (请在"设置 -> 账户安全"中修改)
2.  **数据备份**：在"设置 -> 配置管理"中导出 `config.json` 进行备份
3.  **背景切换**：在"设置 -> 动态背景"中选择喜欢的主题

## 🤝 贡献指南

1.  Fork 本仓库
2.  创建特性分支 (`git checkout -b feature/AmazingFeature`)
3.  提交更改 (`git commit -m 'Add some AmazingFeature'`)
4.  推送到分支 (`git push origin feature/AmazingFeature`)
5.  打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👨‍💻 作者

**老王 (Tony Wang)** - [GitHub](https://github.com/tony-wang1990)

## 🙏 致谢

*   感谢 [Dashy](https://github.com/Lissy93/dashy) 提供设计灵感
*   感谢所有为这个项目做出贡献的开发者！

---

⭐ **如果这个项目对你有帮助，请给它一个星标！**
