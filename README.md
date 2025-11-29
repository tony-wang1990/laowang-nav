# LaoWang Nav - 个人导航站

> 一个现代化的个人导航网站项目，基于 Dashy 设计理念重构。提供简洁美观的界面、强大的个性化配置和纯前端的极致体验。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg)
<<<<<<< HEAD

## 🚀 在线演示 (Live Demo)

🎉 点击下方链接，立即体验通过 Zeabur 部署的演示站点：

[**👉 访问 Nav-Item Demo 网站**](https://demo-nav.zeabur.app)

## 🛠️ 技术栈

**React + TypeScript + Vite + Tailwind CSS** (纯前端架构)
=======
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)
>>>>>>> 6b4b2e7 (feat: redesign header, fix ui issues, update docs for release)

## ✨ 主要功能

### 🎨 前端体验
- **🏠 首页导航**：美观的卡片式布局，支持多层级分类
- **🔍 聚合搜索**：集成 Google、百度、Bing、GitHub 等多引擎搜索
- **📱 响应式设计**：完美适配桌面、平板和移动端设备
- **🎨 个性化主题**：内置 15+ 款精美主题（流光、星空、赛博等），支持动态背景切换
- **⛅ 实用组件**：集成实时天气、日期时间显示
- **🌍 多语言支持**：支持简体中文和 English 切换

### ⚙️ 管理与配置
- **🔒 安全认证**：支持修改管理员账号密码（本地持久化存储）
- **📝 即时编辑**：支持直接在页面上添加、编辑、删除分类和卡片
- **🖼️ 图标自动获取**：添加链接时自动抓取网站 Favicon
- **💾 配置管理**：支持配置文件的导出与导入（JSON/YAML），数据完全掌握在自己手中
- **☁️ 纯前端运行**：无需后端数据库，数据存储于本地浏览器或通过配置文件分发

## 🚀 快速部署

### ☁️ 一键部署 (推荐)

无需服务器，免费托管，点击下方按钮即可快速部署：

| 平台 | 说明 | 部署链接 |
|------|------|----------|
| **Vercel** | **推荐**，速度快，全球CDN | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tony-wang1990/laowang-nav) |
| **Netlify** | 稳定，免费额度高 | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/tony-wang1990/laowang-nav) |
| **Zeabur** | 容器化部署，支持国内访问 | [![Deploy on Zeabur](https://zeabur.com/button.svg)](https://zeabur.com/templates/XXXXX) |
| **Render** | 免费容器托管 | [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy) |

### 📦 Docker 部署

如果你有自己的服务器 (VPS) 或 NAS (群晖, 威联通等)，可以使用 Docker 部署。

#### 1. 使用 Docker CLI
```bash
docker run -d \
  --name laowang-nav \
  --restart always \
  -p 3000:80 \
  ghcr.io/tony-wang1990/laowang-nav:latest
```

#### 2. 使用 Docker Compose
创建 `docker-compose.yml` 文件：
```yaml
version: '3.8'
services:
  app:
    image: ghcr.io/tony-wang1990/laowang-nav:latest
    container_name: laowang-nav
    restart: always
    ports:
      - "3000:80"
```
运行命令：
```bash
docker-compose up -d
```

### 💻 本地开发

1. **克隆项目**
   ```bash
   git clone https://github.com/tony-wang1990/laowang-nav.git
   cd laowang-nav
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```
   访问 http://localhost:5173

4. **构建生产版本**
   ```bash
   npm run build
   ```

## ⚙️ 配置说明

由于是纯前端项目，大部分配置通过界面右上角的 **设置 (Settings)** 面板进行：

1.  **默认账号**：`admin` / `admin` (请在"设置 -> 账户安全"中修改)
2.  **数据备份**：在"设置 -> 配置管理"中导出 `config.json` 进行备份
3.  **背景切换**：在"设置 -> 动态背景"中选择喜欢的主题

<<<<<<< HEAD

=======
## 🛠️ 技术栈

- **React 18**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Zustand** (状态管理)
- **i18next** (国际化)

## 🤝 贡献指南

欢迎提交 Pull Request 或 Issue！

1.  Fork 本仓库
2.  创建特性分支 (`git checkout -b feature/AmazingFeature`)
3.  提交更改 (`git commit -m 'Add some AmazingFeature'`)
4.  推送到分支 (`git push origin feature/AmazingFeature`)
5.  打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情
>>>>>>> 6b4b2e7 (feat: redesign header, fix ui issues, update docs for release)

## 👨‍💻 作者

**老王 (Tony Wang)** - [GitHub](https://github.com/tony-wang1990)

<<<<<<< HEAD
## 🙏 致谢

*   感谢我自己-老王 (Tony Wang) 


=======
>>>>>>> 6b4b2e7 (feat: redesign header, fix ui issues, update docs for release)
---

⭐ **如果这个项目对你有帮助，请给它一个星标！**
