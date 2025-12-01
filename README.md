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

</div>

---

## 📸 效果展示

<div align="center">

<img src="docs/screenshots/demo-1-dark-theme.png" alt="深色主题 - 多分类布局" width="800"/>

*深色主题 - 清爽简洁的卡片式布局*

<img src="docs/screenshots/demo-2-purple-theme.png" alt="紫色主题 - 优雅渐变" width="800"/>

*紫色主题 - 优雅的渐变色彩*

<img src="docs/screenshots/demo-3-edit-mode.png" alt="编辑模式 - 快速配置" width="800"/>

*编辑模式 - 可视化配置界面*

<img src="docs/screenshots/demo-4-theme-selector.png" alt="主题选择器 - 15+ 精美主题" width="800"/>

*主题选择器 - 15+ 款精美主题任意切换*

</div>

---

## ✨ 功能特性

### 🎨 界面与主题
- **🌈 15+ 内置主题** - 深色、浅色、流光、赛博朋克、樱花等精美主题
- **🎞️ 动态背景** - 支持视频、图片、渐变背景
- **📱 响应式设计** - 完美适配桌面、平板、移动端
- **🎭 多种视图模式** - 默认、工作区、极简等多种布局

### 🔧 功能特性
- **🔄 即时配置** - 可视化编辑器，实时预览更改
- **🧩 拖拽排序** - 随意调整应用和分类顺序
- **🔍 智能搜索** - 快速查找应用，支持快捷键
- **📦 云端同步** - 配置备份到云端，多设备同步
- **🌍 多语言支持** - 中文、英文等多种语言
- **⚡ PWA 支持** - 可安装为桌面应用

### 🚦 状态与监控
- **💡 状态指示器** - 实时显示服务运行状态
- **📊 内置小组件** - 天气、时间、系统资源等
- **🔔 智能通知** - 服务异常实时提醒

### 🔐 安全与管理
- **🔒 访问控制** - 支持密码保护
- **👥 多用户管理** - 不同用户不同权限
- **📝 配置版本控制** - 支持配置导入导出

---

## 🚀 快速开始

### ☁️ 一键部署到云平台

```

启动：
```bash
docker-compose up -d
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

- [快速开始](https://github.com/tony-wang1990/laowang-nav)
- [配置指南](https://github.com/tony-wang1990/laowang-nav)
- [主题定制](https://github.com/tony-wang1990/laowang-nav)
- [部署文档](https://github.com/tony-wang1990/laowang-nav)
- [常见问题](https://github.com/tony-wang1990/laowang-nav)

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
