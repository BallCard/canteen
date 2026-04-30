# -*- coding: utf-8 -*-
import sys, os
sys.path.insert(0, r'D:\tencent_pcg_canteen')
from task_router import _find_ga_root, classify_task

# 路径测试
ga = _find_ga_root()
print(f'GA Root: {ga}')
print(f'agentmain.py: {os.path.exists(os.path.join(ga, "agentmain.py")) if ga else "NOT FOUND"}')

# 分类测试 - 只用ASCII
tnames = {0: 'T3-DS(执行)', 1: 'T2-Sonnet(日常)', 2: 'T1-Opus(宏观)'}
tests = [
    ('定时脚本每日备份数据库', 0),
    ('系统性能瓶颈分析与优化方案', 1),
    ('技术债务评估和重构方案', 1),
    ('清洗Excel数据去重格式化', 0),
    ('设计千人千面推荐系统PRD', 2),
    ('修复线上BUG连接池溢出', 0),
    ('公司OKR拆解Q2季度规划', 2),
    ('改函数命名规范', 0),
]
all_ok = True
for t, exp in tests:
    r = classify_task(t)
    ok = r == exp
    if not ok: all_ok = False
    print(f'{"PASS" if ok else "FAIL"} {tnames[r]} <- {t}')

print(f'\n{"ALL PASS!" if all_ok else "SOME FAILED!"}')