# LaoWang Nav

[English](README_EN.md) | [简体中文](README.md)

**一个面向个人服务器、云服务和常用工具的自托管导航控制台。**

它基于 Dashy 二次开发，保留了灵活的 YAML 配置、主题、组件和小组件能力，并针对中文用户、Docker 部署、图标加载和链接巡检做了增强。适合拿来做个人导航页、家庭服务器入口、云资源面板、AI 工具收藏夹或轻量级个人运维首页。

[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)
[![Version](https://img.shields.io/github/package-json/v/tony-wang1990/laowang-nav?label=version)](package.json)
[![Vue 2.7](https://img.shields.io/badge/Vue-2.7-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Docker](https://img.shields.io/badge/GHCR-ready-2496ED?logo=docker)](https://github.com/tony-wang1990/laowang-nav/pkgs/container/laowang-nav)
[![Stars](https://img.shields.io/github/stars/tony-wang1990/laowang-nav)](https://github.com/tony-wang1990/laowang-nav/stargazers)

[在线演示](https://demo-nav.zeabur.app/) | [快速开始](#快速开始) | [功能特性](#功能特性) | [最近更新](#最近更新) | [部署方式](#部署方式)

> **一句话：Dashy 的中文增强版——开箱即用的中文导航站，带链接健康巡检。**

## 与 Dashy 对照

|  | 上游 Dashy | 本项目（LaoWang Nav） |
| --- | --- | --- |
| 定位 | 通用自托管导航页 | 面向中文用户与家庭服务器的导航控制台 |
| 界面语言 | 英文为主 | 中文本地化、中文默认配置与中文文档 |
| 部署 | Docker / 源码 | 同上，另有一键安装脚本、GHCR 镜像、Watchtower 示例 |
| 图标 | 基础 favicon 兜底 | 多级 favicon fallback + 图标健康检查（一键修复可疑图标） |
| 链接巡检 | 无 | 链接健康面板：批量测 HTTP 状态、耗时、重定向、证书剩余天数 |
| 状态检查 | 基础 ping | 保留，另有私网目标校验（见下文安全说明） |
| CORS 代理 | 内置、无限制 | 默认关闭，需显式开启 + allowlist |
| 写接口鉴权 | 仅保护 `*.yml` | 六组服务端接口统一鉴权（未配鉴权时仅本机可调用） |
| 构建 | Vue 2 / Vue CLI | 同上（Vue 2.7，见下方 Roadmap） |
| 适合谁 | 想要原版 Dashy 的用户 | 中文用户、 homelab 玩家、想直接用“链接巡检 + 中文配置”的用户；追求原版更新速度或要 Vue 3 的用户建议用上游 Dashy |

## 安全说明

> [!WARNING]
> 请勿把未配置鉴权的实例直接暴露到公网。
>
> - **六组服务端接口已鉴权**：`/status-check`、`/link-health-check`、`/config-manager/save`、`/config-manager/rebuild`、`/system-info`、`/cors-proxy`。本机（loopback）访问不受限；非本机访问时，若已配置 HTTP 鉴权（`ENABLE_HTTP_AUTH` + `appConfig.auth.users`，或 `BASIC_AUTH_USERNAME` / `BASIC_AUTH_PASSWORD`），按该鉴权校验，浏览器会弹出一次原生登录框；若未配置任何鉴权，非本机访问一律返回 403。**公网部署前请先配置鉴权。**
> - **CORS 代理默认关闭**：`/cors-proxy` 只有在 `CORS_PROXY_ENABLED=1` 时才开启，且目标 host 必须在 `CORS_PROXY_ALLOWLIST`（逗号分隔，如 `api.example.com,stats.example.com`）中，未配置 allowlist 时开启也一律拒绝；仅允许 http/https；私网 / 回环 / 链路本地目标默认拒绝，需另设 `CORS_PROXY_ALLOW_PRIVATE=1` 才放行已列入 allowlist 的私网目标。
> - **状态检查与链接健康检查默认拒绝私网目标**：`/status-check` 与 `/link-health-check` 会校验目标 host，字面私网 IP 与解析到私网地址的域名都会被拒（每一次重定向跳转都会重新校验）。家庭服务器需要检测内网服务时，可设置 `NAV_ALLOW_PRIVATE_TARGETS=1` 显式放行（同时放开这两处）。
> - 已知待后续处理：`src/utils/defaults.js` 里仍有一枚硬编码的第三方 API key（Font-Awesome），尚未移入环境变量 / 配置项，生产使用请注意。

## Roadmap

- **Vue 2 → Vue 3**：计划迁移到 Vue 3 + 组合式 API，保留现有 YAML 配置与主题体系；迁移前先补齐关键链路的自动化测试。
- **Vue CLI → Vite**：构建链路从 Vue CLI / Webpack 5 迁移到 Vite，目标是更快的本地开发启动与构建；先以分支验证，不直接替换主构建链。
- **接口鉴权前端化**：让前端六组接口调用附带应用自身的登录凭证（`makeBasicAuthHeaders()`），替代浏览器原生登录框。
- **配置密钥治理**：把 `src/utils/defaults.js` 的硬编码第三方 API key 移入环境变量 / 配置项。
- 固定语义化 Release（替代日期流水号），完善英文 README 与 Changelog。

---

## 截图预览

<div align="center">

### 在线演示

[![Demo Site](https://img.shields.io/badge/Demo-demo--nav.zeabur.app-00d4aa?style=for-the-badge&logo=zeabur)](https://demo-nav.zeabur.app/)

> [!IMPORTANT]
> 演示站首次访问可能需要 30-60 秒加载资源。页面完全打开后，浏览器会缓存静态文件，后续访问会明显更快。

---

### 桌面端主页 - 单栏布局

[![Desktop Homepage](docs/screenshots/demo-desktop.png)](https://demo-nav.zeabur.app/)

*集成搜索、天气、日期、主题和布局控制，适合作为浏览器主页或个人入口页。*

---

### 多栏分类布局

![Category Layout](docs/screenshots/demo-categories.png)

*支持多页面、多分区、多栏分类展示，常用工具、AI 服务、云厂商和容器服务可以按场景整理。*

---

### 丰富的设置选项

![Settings Panel](docs/screenshots/demo-themes.png)

*支持配置下载、语言切换、自定义 CSS、云端同步、重建应用，以及新增的图标健康检查和链接健康面板。*

---

### 可视化编辑模式

![Edit Mode](docs/screenshots/demo-editor.png)

*一键进入编辑模式，直接调整页面信息、应用配置、分区、链接和图标，适合不想手写 YAML 的用户。*

</div>

---

## 功能特性

- **个人导航首页**：用 YAML 管理页面、分区、链接、子链接和打开方式，配置文件可持久化到 `user-data/conf.yml`。
- **可视化编辑器**：在页面内编辑配置、导出配置、保存到本地或写回磁盘，降低维护导航站的门槛。
- **图标自动兜底**：支持显式图片、站点 favicon、Simple Icons、本地图标和多级 favicon API fallback；显式图标失效后会继续尝试目标站 favicon。
- **图标健康检查**：在配置面板里扫描可疑图标 URL，例如 `http://` 混合内容、拼错的 `?xxx/favicon.ico`、`.html/favicon.ico`、多语言路径 favicon 等，并支持一键改为自动 favicon 或站点根目录 favicon。
- **链接健康面板**：批量检测导航链接的 HTTP 状态、响应时间、重定向最终地址和 HTTPS 证书剩余天数。默认最多检测 300 个链接，8 并发，8 秒超时，跟随 5 次重定向。
- **搜索和移动端体验**：桌面端支持站内快速筛选，移动端可切换 Baidu、Bing、Google 等搜索引擎。
- **主题和自定义样式**：内置多套主题，支持自定义 CSS，适配桌面、平板和手机。
- **常用小组件**：保留 Dashy 生态里的天气、RSS、GitHub、系统状态、Uptime Kuma、Pi-hole、Proxmox、价格行情等丰富组件。
- **Docker 友好部署**：提供 GHCR 镜像、一键安装脚本、Docker Compose、健康检查和 Watchtower 自动更新示例。
- **依赖和构建优化**：升级核心依赖并加入安全 overrides，生产依赖 audit 已消除 high/critical；构建侧拆分 framework、vendor、editor、charts 等 chunk，降低单个包压力。

---

## 最近更新

### 2026-11-24

- 安全加固：`/status-check`、`/link-health-check`、`/config-manager/save`、`/config-manager/rebuild`、`/system-info`、`/cors-proxy` 六组服务端接口统一鉴权（已配鉴权按现有方式校验，未配鉴权时仅本机可调用，非本机返回 403）。
- CORS 代理默认关闭（`CORS_PROXY_ENABLED=1` 才开启），开启时需配置 allowlist、仅允许 http/https，私网目标默认拒绝。
- 状态检查与链接健康检查增加私网目标校验（含 DNS 解析后逐 IP 校验、每次重定向重新校验）；内网服务检测可设置 `NAV_ALLOW_PRIVATE_TARGETS=1` 显式放行。
- CI 的 `actions/checkout` 与 `actions/setup-node` 从 v3 升到 v4；删除 `user-data/conf.yml.bak`。

### 2026-07-09

- 新增 **图标健康检查**：可扫描失效风险图标，并一键切换到自动 favicon 或根目录 favicon。
- 新增 **链接健康面板**：可批量检测链接可访问性、响应耗时、跳转结果和 HTTPS 证书状态。
- 优化 **图标 fallback 链路**：默认 favicon API 改为更适合国内访问的链路，并加入 local、AllesEDV、DuckDuckGo、IconHorse、Unavatar、Google、Clearbit 等多级兜底。
- 清理默认配置里的明显异常图标字段，让自动 favicon 接管更稳定。
- 优化 Webpack 分包策略，把框架、编辑器、图表和通用依赖拆开，减少首屏 vendor 压力。
- 治理依赖风险：从高危 audit 结果降到 `0 high / 0 critical`，生产依赖仅剩低级别遗留项。
- 修复 GitHub Actions / Docker 构建兼容：保留 Node 18 构建镜像，并固定 `copy-webpack-plugin@13.0.1`、`sass@1.69.7`，避免 Node 20 专属 API 导致 CI 失败。
- 为 Vue CLI 构建加入 `crypto` polyfill，解决旧构建链在 Node 18 下 `crypto is not defined` 的问题。

---

## 快速开始

### 一键安装脚本

Linux / macOS:

```bash
curl -fsSL https://raw.githubusercontent.com/tony-wang1990/laowang-nav/master/scripts/install.sh | bash
```

Windows PowerShell:

```powershell
irm https://raw.githubusercontent.com/tony-wang1990/laowang-nav/master/scripts/install.ps1 | iex
```

脚本会检查 Docker、创建配置目录、拉取最新镜像、挂载 `user-data` 和 `public/item-icons`，并启动 Watchtower 自动更新。

### 云平台部署

| 平台 | 部署入口 |
| --- | --- |
| Zeabur | [![Deploy on Zeabur](https://zeabur.com/button.svg)](https://zeabur.com/templates/2Q624P) |
| Vercel | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tony-wang1990/laowang-nav) |
| Railway | [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/tony-wang1990/laowang-nav) |
| Render | [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/tony-wang1990/laowang-nav) |

> 链接健康面板依赖后端 `/link-health-check` 接口。Docker、Railway、Render 等 Node/Express 运行方式体验最完整；纯静态部署平台可能只能使用前端导航和基础配置能力。

---

## 部署方式

### Docker 手动部署

镜像支持 AMD64 和 ARM64，适合普通 VPS、家用服务器、NAS、树莓派和 Oracle ARM 等环境。

```bash
mkdir -p ~/laowang-nav/user-data ~/laowang-nav/public/item-icons
cd ~/laowang-nav

curl -o ./user-data/conf.yml \
  https://raw.githubusercontent.com/tony-wang1990/laowang-nav/master/user-data/conf.yml

docker pull ghcr.io/tony-wang1990/laowang-nav:latest

docker run -d \
  --name laowang-nav \
  -p 8080:8080 \
  -v $(pwd)/user-data:/app/user-data \
  -v $(pwd)/public/item-icons:/app/public/item-icons \
  -e NODE_ENV=production \
  --restart unless-stopped \
  ghcr.io/tony-wang1990/laowang-nav:latest
```

访问 `http://localhost:8080`。

### Docker Compose

```bash
curl -O https://raw.githubusercontent.com/tony-wang1990/laowang-nav/master/docker-compose.yml
docker compose up -d
```

默认 Compose 文件会同时启动 `watchtower`，用于自动更新 `laowang-nav` 容器。

### 更新镜像

```bash
docker pull ghcr.io/tony-wang1990/laowang-nav:latest
docker stop laowang-nav
docker rm laowang-nav

cd ~/laowang-nav
docker run -d \
  --name laowang-nav \
  -p 8080:8080 \
  -v $(pwd)/user-data:/app/user-data \
  -v $(pwd)/public/item-icons:/app/public/item-icons \
  -e NODE_ENV=production \
  --restart unless-stopped \
  ghcr.io/tony-wang1990/laowang-nav:latest
```

也可以使用更新脚本：

```bash
curl -fsSL https://raw.githubusercontent.com/tony-wang1990/laowang-nav/master/scripts/update.sh | bash
```

---

## 本地开发

```bash
git clone https://github.com/tony-wang1990/laowang-nav.git
cd laowang-nav

npm install
npm run dev
```

开发服务默认访问 `http://localhost:8080` 或终端输出的本地地址。

常用命令：

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Vue CLI 开发服务 |
| `npm run build -- --mode production` | 生产构建 |
| `npm run start` | 启动 Node/Express 服务 |
| `npm run lint` | 运行 ESLint |
| `npm run validate-config` | 校验 `user-data/conf.yml` |
| `npm run health-check` | 检查本地服务是否可访问 |
| `npm run dependency-audit` | 检查生产依赖风险 |

项目当前要求 Node.js `>=18.12.0 <21.6.2`。Docker 构建阶段使用 Node 18，生产运行阶段使用 Node 20。

---

## 配置说明

主配置文件位于 `user-data/conf.yml`。Docker 部署时请务必挂载 `user-data`，否则容器更新后配置会丢失。

```yaml
pageInfo:
  title: LaoWang Nav
  description: 个人导航站

appConfig:
  theme: colorful
  faviconApi: iowen
  defaultIcon: favicon

sections:
  - name: 常用工具
    items:
      - title: GitHub
        description: 代码托管平台
        url: https://github.com
        icon: favicon
      - title: 自定义健康检查
        description: 打开官网，但用健康接口检测状态页
        url: https://example.com
        statusCheckUrl: https://status.example.com
```

### 图标配置建议

- 不写 `icon` 或写 `icon: favicon`：自动按站点 URL 获取 favicon，并走多级 fallback。
- 写完整图片 URL：优先使用该图片，加载失败后继续尝试目标站 favicon。
- 使用本地图标：放入 `public/item-icons`，再在配置里引用文件名。
- 如果图标经常失效，进入设置里的 **图标健康检查**，批量切换到自动 favicon。

### 链接健康检查建议

- 普通链接会检测 `url`。
- 如果打开地址和检测地址不同，可以为条目添加 `statusCheckUrl`。
- 内网地址、自签证书或需要登录的页面可能会返回失败，建议用公开状态页或健康端点作为 `statusCheckUrl`。

---

## 常见问题

### 出现 Configuration Load Error / 404

通常是 `user-data/conf.yml` 不存在或没有挂载成功。可以重新下载默认配置：

```bash
mkdir -p ~/laowang-nav/user-data
curl -o ~/laowang-nav/user-data/conf.yml \
  https://raw.githubusercontent.com/tony-wang1990/laowang-nav/master/user-data/conf.yml
docker restart laowang-nav
```

### 更新后配置不见了

确认启动容器时使用了下面的卷挂载：

```bash
-v $(pwd)/user-data:/app/user-data
-v $(pwd)/public/item-icons:/app/public/item-icons
```

### 图标加载失败或显示不稳定

优先使用 `icon: favicon` 或不写 `icon`，让自动 favicon 和 fallback 链接管。对于已经写死的异常图标 URL，可以在设置面板里打开 **图标健康检查** 批量修复。

### 链接健康面板检测失败

链接健康面板由服务端发起请求。请确认当前部署方式包含 Node/Express 后端，并且目标站点允许访问。内网、登录态、反爬或证书异常的站点可能需要单独设置 `statusCheckUrl`。注意：私网 / 内网目标默认会被服务端拒绝，如需检测内网链接，请设置 `NAV_ALLOW_PRIVATE_TARGETS=1`（见“安全说明”）。

---

## 技术栈

| 类型 | 技术 |
| --- | --- |
| 前端 | Vue 2.7, Vue Router, Vuex, Vue I18n |
| UI 与样式 | SCSS, CSS Variables, vue-material-tabs, vue-js-modal |
| 配置 | YAML, AJV Schema 校验 |
| 服务端 | Node.js, Express |
| 构建 | Vue CLI 5, Webpack 5, Babel |
| 部署 | Docker, Docker Compose, GHCR, GitHub Actions |

---

## 项目结构

```text
.
├── user-data/                 # 默认配置文件
├── public/item-icons/          # 自定义图标挂载目录
├── src/components/             # 页面、配置面板、小组件
├── services/                   # 配置校验、健康检查、链接检测等服务端逻辑
├── scripts/                    # 安装、更新和运维脚本
├── docs/screenshots/           # README 截图
├── Dockerfile
└── docker-compose.yml
```

---

## 致谢

本项目基于 [Dashy](https://github.com/Lissy93/dashy) 二次开发，增加了中文本地化、默认配置、部署脚本、图标和链接健康检查等增强能力。感谢原作者和开源社区的工作。

---

## 许可证

本项目采用 [MIT License](LICENSE)，仅供学习研究和个人使用。软件按“原样”提供，不提供任何形式的明示或暗示保证；使用本项目造成的任何风险和损失需由使用者自行承担。

---

<div align="center">

**[回到顶部](#laowang-nav)**

Made with love by [LaoWang](https://github.com/tony-wang1990)

如果这个项目帮到了你，欢迎点一个 Star。

</div>
