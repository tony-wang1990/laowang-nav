#!/bin/bash

# LaoWang Nav 一键安装脚本
# 使用方法：curl -fsSL https://raw.githubusercontent.com/tony-wang1990/laowang-nav/master/scripts/install.sh | bash

set -e

echo "================================"
echo "  LaoWang Nav 一键安装向导"
echo "================================"
echo ""

# 配置变量
CONTAINER_NAME="laowang-nav"
WATCHTOWER_NAME="watchtower"
IMAGE_NAME="ghcr.io/tony-wang1990/laowang-nav:latest"
DEFAULT_PORT="8080"
INSTALL_DIR="${HOME}/laowang-nav"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# 检查 Docker
echo -e "${YELLOW}[1/6] 检查 Docker 环境...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安装${NC}"
    echo "请先安装 Docker: https://docs.docker.com/engine/install/"
    exit 1
fi
echo -e "${GREEN}✓ Docker 已安装${NC}"
echo ""

# 询问端口
echo -e "${BLUE}请输入要使用的端口 (默认 8080):${NC}"
if [ -t 0 ]; then
    read -t 10 -p "> " PORT || PORT=""
else
    # 管道模式下直接使用默认端口
    echo "非交互模式，使用默认端口..."
    PORT=""
fi

# 去除可能的空白字符
PORT=$(echo "$PORT" | tr -d '[:space:]')
PORT=${PORT:-$DEFAULT_PORT}
echo -e "使用端口: ${GREEN}${PORT}${NC}"
echo ""

# 停止旧容器
echo -e "${YELLOW}[2/6] 清理旧容器...${NC}"
docker stop ${CONTAINER_NAME} 2>/dev/null && echo "已停止旧容器" || true
docker rm ${CONTAINER_NAME} 2>/dev/null && echo "已删除旧容器" || true
docker stop ${WATCHTOWER_NAME} 2>/dev/null || true
docker rm ${WATCHTOWER_NAME} 2>/dev/null || true
echo -e "${GREEN}✓ 清理完成${NC}"
echo ""

# 创建目录
echo -e "${YELLOW}[3/6] 创建数据目录...${NC}"
mkdir -p "${INSTALL_DIR}/user-data"
mkdir -p "${INSTALL_DIR}/public/item-icons"
echo -e "${GREEN}✓ 目录已创建: ${INSTALL_DIR}${NC}"
echo ""

# 拉取镜像
echo -e "${YELLOW}[4/6] 拉取最新镜像...${NC}"
docker pull ${IMAGE_NAME}
echo -e "${GREEN}✓ 镜像拉取成功${NC}"
echo ""

# 初始化配置
echo -e "${YELLOW}[5/6] 初始化配置文件...${NC}"
if [ ! -f "${INSTALL_DIR}/user-data/conf.yml" ]; then
    curl -fsSL -o "${INSTALL_DIR}/user-data/conf.yml" \
      https://raw.githubusercontent.com/tony-wang1990/laowang-nav/master/user-data/conf.yml
    echo -e "${GREEN}✓ 配置文件已下载${NC}"
else
    echo "配置文件已存在，保留现有配置"
fi
echo ""

# 启动容器
echo -e "${YELLOW}[6/6] 启动服务...${NC}"
cd "${INSTALL_DIR}"

docker run -d \
  --name ${CONTAINER_NAME} \
  -p ${PORT}:8080 \
  -v "${INSTALL_DIR}/user-data:/app/user-data" \
  -v "${INSTALL_DIR}/public/item-icons:/app/public/item-icons" \
  -e NODE_ENV=production \
  --restart unless-stopped \
  ${IMAGE_NAME}

echo -e "${GREEN}✓ 主容器已启动${NC}"

# 启动 Watchtower
docker run -d \
  --name ${WATCHTOWER_NAME} \
  --restart unless-stopped \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  --interval 300 ${CONTAINER_NAME} > /dev/null 2>&1

echo -e "${GREEN}✓ 自动更新服务已启动${NC}"
echo ""

# 完成信息
echo "================================"
echo -e "${GREEN}🎉 安装完成！${NC}"
echo "================================"
echo ""
echo -e "📂 安装目录: ${BLUE}${INSTALL_DIR}${NC}"
echo -e "🌐 访问地址: ${BLUE}http://localhost:${PORT}${NC}"

# 获取 IP
if command -v hostname &> /dev/null; then
    IP=$(hostname -I 2>/dev/null | awk '{print $1}')
    [ -n "$IP" ] && echo -e "🌐 局域网访问: ${BLUE}http://${IP}:${PORT}${NC}"
fi

echo ""
echo "💡 常用命令:"
echo "  查看日志: docker logs -f ${CONTAINER_NAME}"
echo "  重启服务: docker restart ${CONTAINER_NAME}"
echo "  停止服务: docker stop ${CONTAINER_NAME}"
echo "  配置文件: ${INSTALL_DIR}/user-data/conf.yml"
echo ""
echo "================================"
