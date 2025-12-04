#!/usr/bin/env bash

set -euo pipefail

########################################
# 内容管理服务 打包 & 部署脚本
# 使用方式：
#   ./scripts/deploy.sh "<ssh目标>:<远程目录>"
#
# 示例：
#   ./scripts/deploy.sh "user@1.2.3.4:/opt/content-management-service"
#
# 说明：
# - 本脚本会在本地打包必要文件，通过 scp 上传到服务器，
#   然后在远程解压到指定目录并安装依赖。
# - 环境配置文件不会被打包上传，需要在远程服务器单独配置。
# - 可通过 .deployignore 文件配置需要忽略的文件和目录（格式与 .gitignore 相同）。
# - 部署完成后会自动使用 pm2 启动生产环境服务（如果 pm2 未安装会自动安装）。
########################################

if [[ "${1-}" == "-h" || "${1-}" == "--help" ]]; then
  echo "用法: $0 \"<ssh目标>:<远程目录>\""
  exit 0
fi

if [[ $# -lt 1 ]]; then
  echo "错误: 参数不足。"
  echo "用法: $0 \"<ssh目标>:<远程目录>\""
  exit 1
fi

# 解析参数： "<ssh目标>:<远程目录>"
INPUT="$1"
IFS=':' read -r SSH_TARGET REMOTE_DIR <<< "${INPUT}"

if [[ -z "${SSH_TARGET:-}" || -z "${REMOTE_DIR:-}" ]]; then
  echo "错误: 参数格式不正确。"
  echo "示例: $0 \"user@1.2.3.4:/opt/content-management-service\""
  exit 1
fi

# 切换到项目根目录（脚本位于 ./scripts/ 下）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

echo "项目根目录: ${PROJECT_ROOT}"
echo "SSH 目标: ${SSH_TARGET}"
echo "远程目录: ${REMOTE_DIR}"
echo "注意: 环境配置文件不会被打包上传，请在远程服务器单独配置。"

# 检查 SDK 包是否存在
SDKS_DIR="../sdks/sdk"
HEARTBEAT_SDK="${SDKS_DIR}/smk-heartbeat-sdk/smk-heartbeat-sdk-1.0.0.tgz"
ENCRYPTION_SDK="${SDKS_DIR}/smk-encryption-sdk/smk-encryption-sdk.tgz"

if [[ ! -f "${HEARTBEAT_SDK}" ]]; then
  echo "警告: 未找到心跳 SDK 包: ${HEARTBEAT_SDK}"
  echo "请确保 SDK 包已构建，或将在远程服务器单独配置。"
fi

if [[ ! -f "${ENCRYPTION_SDK}" ]]; then
  echo "警告: 未找到加密 SDK 包: ${ENCRYPTION_SDK}"
  echo "请确保 SDK 包已构建，或将在远程服务器单独配置。"
fi

# 构建临时打包文件名
TIMESTAMP="$(date +%Y%m%d%H%M%S)"
ARCHIVE_NAME="cms_package_${TIMESTAMP}.tar.gz"
LOCAL_ARCHIVE_PATH="/tmp/${ARCHIVE_NAME}"
REMOTE_ARCHIVE_PATH="/tmp/${ARCHIVE_NAME}"

echo "开始打包必要文件..."

# 检查是否存在 .deployignore 文件
DEPLOY_IGNORE_FILE="${PROJECT_ROOT}/.deployignore"
EXCLUDE_ARGS=()
IGNORE_RULE_COUNT=0

# 总是排除 .deployignore 文件本身（不部署到远程）
EXCLUDE_ARGS+=(--exclude=".deployignore")

if [[ -f "${DEPLOY_IGNORE_FILE}" ]]; then
  echo "使用 .deployignore 文件来排除文件..."
  
  # 读取 .deployignore 文件，过滤注释和空行，构建排除参数
  while IFS= read -r line || [[ -n "${line}" ]]; do
    # 去掉首尾空格
    line=$(echo "${line}" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    
    # 跳过空行和注释行
    if [[ -z "${line}" ]] || [[ "${line}" =~ ^# ]]; then
      continue
    fi
    
    # 添加到排除列表
    EXCLUDE_ARGS+=(--exclude="${line}")
    ((IGNORE_RULE_COUNT++))
  done < "${DEPLOY_IGNORE_FILE}"
  
  echo "从 .deployignore 读取了 ${IGNORE_RULE_COUNT} 个排除规则"
else
  echo "警告: 未找到 .deployignore 文件，使用默认排除规则"
  # 默认排除规则
  EXCLUDE_ARGS+=(
    --exclude=".git"
    --exclude="node_modules"
    --exclude="*.log"
    --exclude="env"
    --exclude="data"
    --exclude="package-lock.json"
  )
fi

# 创建临时目录用于打包
TEMP_PACKAGE_DIR=$(mktemp -d)
trap "rm -rf ${TEMP_PACKAGE_DIR}" EXIT

# 在临时目录中创建项目文件结构
cd "${TEMP_PACKAGE_DIR}"
mkdir -p content-management-service

# 复制项目文件（使用 .deployignore 规则）
cd "${PROJECT_ROOT}"
tar "${EXCLUDE_ARGS[@]}" -c . | tar -x -C "${TEMP_PACKAGE_DIR}/content-management-service"

# 如果 SDK 包存在，也复制到临时目录
if [[ -f "${HEARTBEAT_SDK}" ]] || [[ -f "${ENCRYPTION_SDK}" ]]; then
  echo "打包 SDK 依赖包..."
  
  # 在临时目录中创建 SDK 目录结构（相对于项目父目录）
  cd "$(dirname "${PROJECT_ROOT}")"
  
  if [[ -f "${HEARTBEAT_SDK}" ]]; then
    mkdir -p "${TEMP_PACKAGE_DIR}/sdks/sdk/smk-heartbeat-sdk"
    cp "${HEARTBEAT_SDK}" "${TEMP_PACKAGE_DIR}/sdks/sdk/smk-heartbeat-sdk/"
    echo "已包含心跳 SDK 包"
  fi
  
  if [[ -f "${ENCRYPTION_SDK}" ]]; then
    mkdir -p "${TEMP_PACKAGE_DIR}/sdks/sdk/smk-encryption-sdk"
    cp "${ENCRYPTION_SDK}" "${TEMP_PACKAGE_DIR}/sdks/sdk/smk-encryption-sdk/"
    echo "已包含加密 SDK 包"
  fi
fi

# 打包所有内容
cd "${TEMP_PACKAGE_DIR}"
if [[ -d "sdks" ]]; then
  tar -czf "${LOCAL_ARCHIVE_PATH}" content-management-service sdks
else
  tar -czf "${LOCAL_ARCHIVE_PATH}" content-management-service
fi

cd "${PROJECT_ROOT}"

echo "本地打包完成: ${LOCAL_ARCHIVE_PATH}"

echo "上传打包文件到远程服务器..."
scp "${LOCAL_ARCHIVE_PATH}" "${SSH_TARGET}:${REMOTE_ARCHIVE_PATH}"

echo "在远程服务器解压并部署..."
ssh "${SSH_TARGET}" bash -s <<EOF
set -euo pipefail

echo "创建/更新远程目录: '${REMOTE_DIR}'..."
mkdir -p "${REMOTE_DIR}"

echo "解压包到临时位置..."
TEMP_EXTRACT_DIR=\$(mktemp -d)
tar -xzf "${REMOTE_ARCHIVE_PATH}" -C "\${TEMP_EXTRACT_DIR}"
rm -f "${REMOTE_ARCHIVE_PATH}"

# 移动项目文件到目标目录
if [[ -d "\${TEMP_EXTRACT_DIR}/content-management-service" ]]; then
  cp -r "\${TEMP_EXTRACT_DIR}/content-management-service"/* "${REMOTE_DIR}/"
  cp -r "\${TEMP_EXTRACT_DIR}/content-management-service"/.[^.]* "${REMOTE_DIR}/" 2>/dev/null || true
fi

# 如果打包文件中包含 SDK，部署到正确位置
if [[ -d "\${TEMP_EXTRACT_DIR}/sdks" ]]; then
  echo "检测到 SDK 包，部署到正确位置..."
  REMOTE_PARENT_DIR="$(dirname "${REMOTE_DIR}")"
  mkdir -p "\${REMOTE_PARENT_DIR}/sdks/sdk"
  
  if [[ -d "\${TEMP_EXTRACT_DIR}/sdks/sdk/smk-heartbeat-sdk" ]]; then
    cp -r "\${TEMP_EXTRACT_DIR}/sdks/sdk/smk-heartbeat-sdk" "\${REMOTE_PARENT_DIR}/sdks/sdk/"
    echo "已部署心跳 SDK 包到 \${REMOTE_PARENT_DIR}/sdks/sdk/smk-heartbeat-sdk/"
  fi
  
  if [[ -d "\${TEMP_EXTRACT_DIR}/sdks/sdk/smk-encryption-sdk" ]]; then
    cp -r "\${TEMP_EXTRACT_DIR}/sdks/sdk/smk-encryption-sdk" "\${REMOTE_PARENT_DIR}/sdks/sdk/"
    echo "已部署加密 SDK 包到 \${REMOTE_PARENT_DIR}/sdks/sdk/smk-encryption-sdk/"
  fi
  
  echo "SDK 包已部署到正确位置。"
fi

# 清理临时目录
rm -rf "\${TEMP_EXTRACT_DIR}"

cd "${REMOTE_DIR}"

echo "当前远程目录内容:"
ls -la

echo "安装依赖..."
if command -v npm >/dev/null 2>&1; then
  npm install
else
  echo "警告: 远程未找到 npm 命令，请在服务器上手动安装 Node.js 和依赖。"
  exit 1
fi

# 检查 pm2 是否已安装
if ! command -v pm2 >/dev/null 2>&1; then
  echo "pm2 未安装，正在全局安装 pm2..."
  npm install -g pm2
  if ! command -v pm2 >/dev/null 2>&1; then
    echo "错误: pm2 安装失败，请手动安装 pm2：npm install -g pm2"
    exit 1
  fi
fi

echo "使用 pm2 启动生产环境服务..."

# 定义应用名称
APP_NAME="content-management-service"

# 创建日志目录
mkdir -p logs

# 检查是否存在 pm2 配置文件
PM2_CONFIG_FILE="ecosystem.config.cjs"
if [[ -f "\${PM2_CONFIG_FILE}" ]]; then
  echo "使用 pm2 配置文件: \${PM2_CONFIG_FILE}"
  
  # 检查服务是否已在运行
  if pm2 list | grep -q "\${APP_NAME}"; then
    echo "检测到服务已在运行，正在重启..."
    pm2 restart "\${APP_NAME}" --update-env
  else
    echo "启动新的 pm2 进程..."
    pm2 start "\${PM2_CONFIG_FILE}"
  fi
else
  echo "未找到 pm2 配置文件，使用默认配置启动..."
  
  # 检查服务是否已在运行
  if pm2 list | grep -q "\${APP_NAME}"; then
    echo "检测到服务已在运行，正在重启..."
    pm2 restart "\${APP_NAME}" --update-env
  else
    echo "启动新的 pm2 进程..."
    pm2 start src/index.js --name "\${APP_NAME}" \
      --env NODE_ENV=production \
      --env APP_ENV=production \
      --log logs/pm2-out.log \
      --error logs/pm2-error.log \
      --merge-logs \
      --log-date-format="YYYY-MM-DD HH:mm:ss Z" \
      --autorestart \
      --max-restarts 10 \
      --min-uptime 10s \
      --max-memory-restart 1G
  fi
fi

# 保存 pm2 进程列表，以便开机自启
pm2 save

echo "部署步骤完成。"
echo ""
echo "服务状态："
pm2 status "\${APP_NAME}"
echo ""
echo "常用 pm2 命令："
echo "  pm2 status                    # 查看所有服务状态"
echo "  pm2 logs \${APP_NAME}          # 查看服务日志"
echo "  pm2 restart \${APP_NAME}       # 重启服务"
echo "  pm2 stop \${APP_NAME}          # 停止服务"
echo "  pm2 delete \${APP_NAME}        # 删除服务"
EOF

echo "清理本地临时文件..."
rm -f "${LOCAL_ARCHIVE_PATH}"

echo "部署完成。"
echo "如需查看帮助，可运行： ./scripts/deploy.sh --help"


