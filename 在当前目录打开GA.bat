@echo off
chcp 65001 >nul
title GenericAgent GUI - 当前工作区

set "GA_DIR=D:\Contests51\GenericAgent"
set "WORK_DIR=%cd%"

cd /d "%GA_DIR%"

if not exist ".venv\Scripts\activate.bat" (
    echo [错误] 没有找到 GA 虚拟环境：
    echo %GA_DIR%\.venv
    pause
    exit /b 1
)

call .venv\Scripts\activate.bat

echo ========================================
echo GenericAgent GUI 正在启动
echo.
echo 当前工作区：
echo %WORK_DIR%
echo ========================================
echo.
echo GUI 打开后，请先输入：
echo.
echo 当前工作区是 %WORK_DIR%。接下来所有文件读写都限制在这个目录下，不要读取或修改该目录以外的文件，除非我明确要求。
echo.

python launch.pyw

echo.
echo 如果 GUI 没有弹出，可能是 launch.pyw 报错但被隐藏。
echo 可以改用 python agentmain.py 查看报错。
echo.

pause