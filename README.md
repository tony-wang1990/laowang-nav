# LaoWang Nav

**一个漂亮、易用、功能强大的自托管导航页**

[![License](https://img.shields.io/badge/License-MIT-blue)](https://github.com/tony-wang1990/laowang-nav/blob/master/LICENSE)
[![Vue 2.7](https://img.shields.io/badge/Vue-2.7-4FC08D?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://hub.docker.com/)
[![GitHub stars](https://img.shields.io/github/stars/tony-wang1990/laowang-nav)](https://github.com/tony-wang1990/laowang-nav/stargazers)

[**在线演示**](https://demo-nav.zeabur.app/) | [**快速开始**](#-快速开始) | [**功能特性**](#-功能特性) | [**部署指南**](#-部署方式) | [**配置说明**](#️-配置说明)

---

通过单一页面访问所有自托管服务和常用网站，让您的数字生活井井有条

Demo 演示站

https://demo-nav.zeabur.app/

---

## ✨ 特性

- 🚀 **极速加载**: 经过优化的代码，秒级响应。
- 🎨 **多主题支持**: 内置多种精美主题，支持自定义 CSS。
- ☁️ **多云一键部署**: 支持 Zeabur、Render 等平台一键部署。
- 🔍 **集成搜索引擎**: 内置 Google, Baidu, Bing, GitHub 等常用搜索。
- 🌦️ **实时天气**: 首页集成实时天气显示。
- 📱 **响应式设计**: 完美适配手机、平板和桌面端。
- 🔒 **隐私优先**: 所有数据掌握在自己手中。

<div align="center">

| 主页预览 | 搜索功能 |
| :---: | :---: |
| ![Home](docs/screenshots/screenshot-1.png) | ![Search](docs/screenshots/screenshot-2.png) |

| 移动端适配 | 设置面板 |
| :---: | :---: |
| ![Mobile](docs/screenshots/screenshot-3.png) | ![Settings](docs/screenshots/screenshot-4.png) |

| 多彩主题 |
| :---: |
| ![Themes](docs/screenshots/screenshot-5.png) |

</div>

---

## 🚀 快速开始

### 方式一：一键部署到云平台

无需服务器，完全免费，一键即可部署：

| 平台 | 类型 | 部署链接 |
|------|------|----------|
| **Zeabur** | Container (推荐) | [![Deploy on Zeabur](https://zeabur.com/button.svg)](https://zeabur.com/templates/2Q624P) |
| **Vercel** | Serverless | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tony-wang1990/laowang-nav) |
| **Netlify** | Serverless | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/tony-wang1990/laowang-nav) |
| **Cloudflare Pages** | Edge Computing | [![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?repository=https://github.com/tony-wang1990/laowang-nav) |
| **Railway** | Container | [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/tony-wang1990/laowang-nav) |
| **Render** | Container | [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/tony-wang1990/laowang-nav) |

### 方式二：Docker 部署

```bash
docker run -d \
  -p 8080:80 \
  --name laowang-nav \
  --restart always \
  ghcr.io/tony-wang1990/laowang-nav:latest
```

---

### 🌐 部署到云服务器

#### Oracle Cloud (甲骨文云)

1. **创建实例**
   - 选择 Always Free Tier
   - Ubuntu 22.04 LTS
   - ARM 架构（推荐）

2. **安装 Docker**
   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER
   ```

3. **部署应用**
   ```bash
   docker run -d \
     --name laowang-nav \
     --restart unless-stopped \
     -p 3000:8080 \
     ghcr.io/tony-wang1990/laowang-nav:latest
   ```

4. **配置防火墙**（重要）
   ```bash
   # 开放端口
   sudo iptables -I INPUT -p tcp --dport 3000 -j ACCEPT
   sudo netfilter-persistent save
   
   # 还需要在 Oracle Cloud 控制台添加入站规则：
   # 端口：3000，协议：TCP，CIDR：0.0.0.0/0
   ```

访问：`http://您的服务器IP:3000`

#### Google Cloud Platform (GCP)

1. **创建虚拟机实例**
   - Compute Engine → VM instances → CREATE INSTANCE
   - 机器类型：e2-micro（免费层）
   - 启动磁盘：Ubuntu 22.04 LTS

2. **SSH 连接并安装**
   ```bash
   # 安装 Docker
   curl -fsSL https://get.docker.com | sh
   
   # 部署应用
   docker run -d \
     --name laowang-nav \
     --restart unless-stopped \
     -p 3000:8080 \
     ghcr.io/tony-wang1990/laowang-nav:latest
   ```

3. **配置防火墙规则**
   - VPC network → Firewall → CREATE FIREWALL RULE
   - 目标：网络中的所有实例
   - 源 IP：0.0.0.0/0
   - 协议和端口：tcp:3000

#### Railway

1. **从 GitHub 部署**
   - 登录 [Railway](https://railway.app/)
   - New Project → Deploy from GitHub repo
   - 选择 `tony-wang1990/laowang-nav`

2. **添加服务**
   - Add Service → Docker
   - 自动识别 Dockerfile

3. **配置端口**
   - Settings → Networking
   - 暴露端口：8080

Railway 会自动分配域名，无需额外配置！

---

### 💻 本地开发

```bash
# 克隆仓库
git clone https://github.com/tony-wang1990/laowang-nav.git
cd laowang-nav

# 安装依赖
yarn install
# 或
npm install

# 开发模式
yarn dev
# 或  
npm run dev

# 构建生产版本
yarn build
# 或
npm run build
```

访问 `http://localhost:8080`

---

## ⚙️ 配置说明

### 基本配置

配置文件位于 `user-data/conf.yml`：

```yaml
# 页面信息
pageInfo:
  title: LaoWang Nav      # 网站标题
  description: 个人导航站 # 网站描述
  
# 应用配置
appConfig:
  theme: colorful         # 默认主题
  
# 导航项目
sections:
  - name: 常用工具
    items:
      - title: GitHub
        description: 代码托管平台
        icon: https://github.com/favicon.ico
        url: https://github.com
```

### 高级功能

**云端备份** - 配置同步到云端
**状态监控** - 实时监控服务状态
**自定义 CSS** - 完全自定义界面
**快捷键** - 键盘快速导航

详细配置请参考 [配置文档](https://github.com/tony-wang1990/laowang-nav/blob/master/docs/configuring.md)

---

## 🛠️ 技术栈

- **前端**: Vue.js 2.7, TypeScript
- **构建**: Vite, Webpack
- **样式**: SCSS, CSS Variables
- **图标**: Font Awesome, Material Icons
- **部署**: Docker, Node.js

---

## 📚 文档

- [快速开始](docs/quick-start.md)
- [配置指南](docs/configuring.md)
- [主题定制](docs/theming.md)
- [部署文档](docs/deployment.md)
- [常见问题](docs/troubleshooting.md)

---

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request 或创建 Issue。

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

---

## 📄 许可证

本项目采用 [MIT](https://github.com/tony-wang1990/laowang-nav/blob/master/LICENSE) 许可证

---

## 🙏 致谢

感谢 [Alicia Sykes][Dashy] 创建了如此优秀的开源项目。

---

## 💝 支持项目

如果这个项目对您有帮助，请考虑：

- ⭐ 给项目一个 Star
- 🐛 报告 Bug 或提出建议
- 📖 完善文档
- 💻 贡献代码

---

<div align="center">

**[⬆ 回到顶部](#laowang-nav)**

Made with ❤️ by [LaoWang](https://github.com/tony-wang1990)

如果觉得不错，别忘了 ⭐ Star！

</div>
