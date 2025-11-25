#!/bin/bash
# 调试启动脚本

# 加载 nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 设置环境变量
export NODE_ENV=development
export APP_ENV=development
export DEBUG=true

# 切换到项目目录
cd "$(dirname "$0")/.."

# 启动调试
node --inspect-brk=0.0.0.0:9229 src/index.js

