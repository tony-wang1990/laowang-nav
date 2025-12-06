# LaoWang Nav

**一个漂亮、易用、功能强大的自托管导航页**

[![License](https://img.shields.io/badge/License-MIT-blue)](https://github.com/tony-wang1990/laowang-nav/blob/master/LICENSE)
[![Vue 2.7](https://img.shields.io/badge/Vue-2.7-4FC08D?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://hub.docker.com/)
[![GitHub stars](https://img.shields.io/github/stars/tony-wang1990/laowang-nav)](https://github.com/tony-wang1990/laowang-nav/stargazers)

[**在线演示**](https://demo-nav.zeabur.app/) | [**快速开始**](#-快速开始) | [**功能特性**](#-特性) | [**部署指南**](#-部署方式)

---

## 📸 截图预览

<div align="center">

### 🌐 在线演示

[![Demo Site](https://img.shields.io/badge/🔗_点击体验_Demo-demo--nav.zeabur.app-00d4aa?style=for-the-badge&logo=zeabur)](https://demo-nav.zeabur.app/)

> [!IMPORTANT]
> **⏳ 首次访问加载提示**
> 
> 由于项目包含丰富的功能和资源文件,**首次访问可能需要 30-60 秒**的加载时间,请耐心等待。
> 
> ✅ **后续访问会非常快速** - 浏览器会缓存静态资源,再次访问几乎秒开!
> 
> 💡 **建议**: 首次访问时保持页面打开,等待完全加载后再体验功能。

---

### 🖥️ 桌面端主页 - 多栏布局

[![Desktop Homepage](docs/screenshots/demo-desktop.png)](https://demo-nav.zeabur.app/)

*👆 点击图片体验在线 Demo | 支持多栏分类展示，一目了然查看所有导航卡片*

---

### 📱 响应式分类列表

![Category Layout](docs/screenshots/demo-categories.png)

*智能响应式布局，自动适配不同屏幕尺寸*

---

### 🎨 内置多彩主题切换

![Theme Panel](docs/screenshots/demo-themes.png)

*20+ 精美内置主题，支持自定义 CSS 样式*

---

### ✏️ 可视化编辑模式

![Edit Mode](docs/screenshots/demo-editor.png)

*无需代码，可视化拖拽编辑，实时预览保存*

</div>

---

## ✨ 特性

- 🚀 **极速加载**: 经过优化的代码，秒级响应
- 🎨 **多主题支持**: 内置 20+ 精美主题，支持自定义 CSS
- ☁️ **多云一键部署**: 支持 Zeabur、Vercel、Railway 等平台
- 🔍 **集成搜索引擎**: 
  - 桌面端：站内快速筛选
  - **移动端**：支持 Baidu/Bing/Google 全网搜索切换
- 🌦️ **实时天气**: 首页集成实时天气与日期显示
- 📱 **响应式设计**: 完美适配手机、平板和桌面端
- � **自动同步**: 定期从 [nav.eooce.com](https://nav.eooce.com) 自动同步导航数据
- �🔒 **隐私优先**: 所有数据掌握在自己手中

---

## � 自动同步功能

> [!IMPORTANT]
> **本项目内置自动同步功能**，每天自动从 [nav.eooce.com](https://nav.eooce.com) 获取最新导航数据。

### ✨ 功能特点

| 特性 | 说明 |
|------|------|
| ⏰ **定时同步** | 每天北京时间凌晨 3:00 自动运行 |
| 🔀 **智能合并** | 只添加新内容，**不会覆盖您的自定义分类** |
| 🌐 **全平台支持** | VPS、Docker、Vercel、Cloudflare 等全部支持 |
| 📦 **无需配置** | 部署即用，自动生效 |

### 🚫 如何禁用自动同步

如果您 Fork 了本项目，**不需要自动同步功能**，请按以下步骤操作：

#### 方法一：删除工作流文件（推荐）

```bash
# 删除自动同步工作流文件
rm -rf .github/workflows/auto-sync.yml

# 提交更改
git add .
git commit -m "禁用自动同步功能"
git push
```

#### 方法二：在 GitHub 页面禁用

1. 进入您的仓库页面
2. 点击 **Settings** → **Actions** → **General**
3. 选择 **Disable actions** 或删除特定工作流

> [!TIP]
> 禁用后，您仍可手动运行 `node sync_nav.js` 按需同步。

---

## �🚀 快速开始

### 方式一：一键部署到云平台

无需服务器，完全免费：

| 平台 | 部署链接 |
|------|----------|
| **Zeabur** (推荐) | [![Deploy on Zeabur](https://zeabur.com/button.svg)](https://zeabur.com/templates/2Q624P) |
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tony-wang1990/laowang-nav) |
| **Railway** | [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/tony-wang1990/laowang-nav) |
| **Render** | [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/tony-wang1990/laowang-nav) |

### 方式二：Docker 部署

```bash
docker run -d \
  -p 8080:80 \
  --name laowang-nav \
  --restart always \
  ghcr.io/tony-wang1990/laowang-nav:latest
```

访问 `http://localhost:8080`

### 方式三：本地开发

```bash
# 克隆仓库
git clone https://github.com/tony-wang1990/laowang-nav.git
cd laowang-nav

# 安装依赖
yarn install
# 或 npm install

# 开发模式
yarn dev
# 或 npm run dev
```

访问 `http://localhost:8080`

---

## ⚙️ 配置说明

配置文件位于 `user-data/conf.yml`：

```yaml
pageInfo:
  title: LaoWang Nav
  description: 个人导航站
  
appConfig:
  theme: colorful
  
sections:
  - name: 常用工具
    items:
      - title: GitHub
        description: 代码托管平台
        icon: https://github.com/favicon.ico
        url: https://github.com
```

---

## 🛠️ 技术栈

| 类型 | 技术 |
|------|------|
| 前端 | Vue.js 2.7, TypeScript |
| 构建 | Webpack, Vue CLI |
| 样式 | SCSS, CSS Variables |
| 部署 | Docker, Node.js |

---

## 📚 文档

- [快速开始](docs/quick-start.md)
- [配置指南](docs/configuring.md)
- [主题定制](docs/theming.md)
- [部署文档](docs/deployment.md)

---

## 🙏 致谢

> 💡 本项目基于 [Dashy](https://github.com/Lissy93/dashy) 二次开发，增加了中文本地化和功能增强。感谢原作者的开源贡献！

---

## 📄 许可证

<div align="center">

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](https://github.com/tony-wang1990/laowang-nav/blob/master/LICENSE)

**开源协议** · 自由使用 · 允许修改 · 允许商用

</div>

> 📜 本项目采用 **MIT 许可证**，意味着你可以自由地使用、修改和分发本项目，但需保留原始版权声明。

---

<div align="center">

**[⬆ 回到顶部](#laowang-nav)**

Made with ❤️ by [LaoWang](https://github.com/tony-wang1990)

⭐ 如果觉得不错，请给个 Star！

</div>
