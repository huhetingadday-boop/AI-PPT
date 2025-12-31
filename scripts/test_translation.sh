#!/bin/bash
# 本地测试README翻译功能

set -e

echo "================================="
echo "README翻译测试工具"
echo "================================="
echo ""

# 检查是否在项目根目录
if [ ! -f "README.md" ]; then
    echo "错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 检查.env文件
if [ ! -f ".env" ]; then
    echo "错误: 未找到.env文件"
    echo "请确保.env文件包含必要的API密钥配置"
    exit 1
fi

# 加载环境变量
echo "加载环境变量..."
set -a
source .env
set +a

# 检查必要的环境变量
if [ -z "$GOOGLE_API_KEY" ]; then
    echo "警告: GOOGLE_API_KEY未设置"
    echo "请在.env文件中设置GOOGLE_API_KEY"
    exit 1
fi

# 备份现有的README_EN.md
if [ -f "README_EN.md" ]; then
    echo "备份现有的README_EN.md..."
    cp README_EN.md README_EN.md.backup
    echo "备份已保存至README_EN.md.backup"
fi

# 确保Python依赖已安装
echo ""
echo "检查Python依赖..."
if ! command -v uv &> /dev/null; then
    echo "错误: uv未安装"
    echo "请先安装uv: curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
fi

echo "安装/更新依赖..."
uv sync

# 运行翻译脚本
echo ""
echo "================================="
echo "开始翻译..."
echo "================================="
uv run python scripts/translate_readme.py

# 检查结果
if [ $? -eq 0 ]; then
    echo ""
    echo "================================="
    echo "✅ 翻译成功！"
    echo "================================="
    echo ""
    echo "新的README_EN.md已生成"
    
    if [ -f "README_EN.md.backup" ]; then
        echo ""
        echo "查看差异:"
        echo "  diff README_EN.md.backup README_EN.md"
        echo ""
        echo "如果满意，删除备份:"
        echo "  rm README_EN.md.backup"
        echo ""
        echo "如果不满意，恢复备份:"
        echo "  mv README_EN.md.backup README_EN.md"
    fi
else
    echo ""
    echo "================================="
    echo "❌ 翻译失败"
    echo "================================="
    
    if [ -f "README_EN.md.backup" ]; then
        echo "恢复备份..."
        mv README_EN.md.backup README_EN.md
        echo "已恢复原始README_EN.md"
    fi
    exit 1
fi

