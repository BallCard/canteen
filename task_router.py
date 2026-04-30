#!/usr/bin/env python3
"""
task_router.py — 三层自动路由引擎
┌─────────────────────────────────────────────────────────┐
│ Tier  | 模型          | llm_no | 用途                    │
│ 🔴 T1 | claude-opus-4-7  | 2      | 最复杂/最重要/最宏观  │
│ 🟡 T2 | claude-sonnet-4-6| 1      | 日常决策/规划        │
│ 🟢 T3 | deepseek-v4-flash | 0     | 执行/写代码/测试     │
└─────────────────────────────────────────────────────────┘

用法:
  python task_router.py --task "你的任务描述"               # 自动分类
  python task_router.py --task "xxx" --tier 1             # 手动指定层级
  python task_router.py --task "xxx" --no-launch          # 只看分类结果
"""
import os, sys, re, json, subprocess, argparse
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'Contests51', 'GenericAgent'))  # GA root
from memory.ga_banner import print_switch_banner, print_status_bar, TIER_NAMES

# ── 层级关键词词典 ──────────────────────────────────────────
TIER_KEYWORDS = {
    2: [  # T1 - Opus: 最复杂/最重要/最宏观
        '架构设计', '系统架构', '技术选型', '战略', '宏观', '商业模式',
        '风险评估', '重大决策', '顶层设计', '总体方案', 'roadmap',
        '愿景', '方向性', '本质', '根本', '全局', '长期', '复盘',
        'PRD评审', '架构评审', '方案评审',
        # 新增
        'prd', '评审', 'okr', '拆解', '季度规划', '年度规划',
        '推荐系统', '核心架构', '中台', '业务模式', '技术债务',
        '演进路线', '体系', '组织架构', '技术栈', '选型',
        '风险评估', '根本原因', '长期战略', '宏观分析',
    ],
    1: [  # T2 - Sonnet: 日常决策/规划
        '方案设计', '需求分析', '产品设计', '功能规划', '迭代计划',
        '代码审查', '调试', '问题排查', '故障分析', '性能优化',
        '数据建模', '接口设计', '文档撰写', '技术方案', '流程图',
        '时序图', '设计文档', '规划', '计划', '分析', '评估',
        '迁移方案', '重构方案', '测试方案', '部署方案',
        # 新增
        '瓶颈', '优化方案', '改进', '重构', '迁移', '技术方案',
        '设计', '模块', '组件', '对接', '联调', '代码规范', '设计规范', '开发规范',
        '数据流', '状态管理', '缓存', '数据库', '索引',
        'api', 'rest', 'grpc', '协议', '安全', '权限',
        '监控', '告警', '日志', '降级', '限流', '熔断',
        '容量', '压测', '高可用', '容灾',
    ],
    0: [  # T3 - DeepSeek: 执行/写代码/测试
        '写代码', '编码', '实现', '开发', '编程', '脚本',
        '测试', '单元测试', '集成测试', 'e2e', '调试代码',
        '批量', '批处理', '数据提取', '爬虫', '文件转换',
        '数据清洗', '格式转换', '自动化', '部署', '发布',
        'commit', 'git', 'ci/cd', '定时任务', '巡检',
        '执行', '跑一下', '运行', '算一下',
        # 新增
        '修复', 'bug', 'bugfix', 'hotfix', '修改', '更新',
        '删除', '添加', '重命名', '移动', '复制', '备份',
        '导出', '导入', '生成', '构建', '打包', '编译',
        '格式化', '去重', '清洗', '过滤', '排序', '聚合',
        'sql', '查询', '写入', '读取', '下载', '上传',
        '监控脚本', '告警脚本', '数据同步', '迁移数据',
        '增删改查', 'crud', 'patch', '回滚',
        '线上', '环境', '配置', 'docker', 'k8s',
    ],
}


def classify_task(task_text: str) -> int:
    """自动分类任务到三层之一，返回 llm_no (0/1/2)"""
    text = task_text.lower()

    # 1) 显式指定
    if re.search(r'\bt[1t][：:]\s*\d|tier\s*[：:]\s*\d|层级[：:]\s*\d', text):
        m = re.search(r't[1t][：:]?\s*(\d)|tier[：:]?\s*(\d)|层级[：:]?\s*(\d)', text)
        if m:
            tier = int(m.group(1) or m.group(2) or m.group(3))
            if tier == 1: return 2
            elif tier == 2: return 1
            elif tier == 3: return 0

    # 2) 关键词评分
    scores = {0: 0, 1: 0, 2: 0}
    for tier, keywords in TIER_KEYWORDS.items():
        for kw in keywords:
            if kw in text:
                scores[tier] += 1

    # 3) 长度/复杂度启发
    word_count = len(text)
    has_code = bool(re.search(r'(```|def |class |import |function|var |let |const )', text))
    has_structure = bool(re.search(r'(架构|战略|宏观|体系|顶层|全局|长期|本质)', text))
    has_plan = bool(re.search(r'(方案|规划|评估|分析|设计|评审)', text))
    has_execution = bool(re.search(r'(写|实现|编码|测试|部署|脚本|修复|改|修|删|建)', text))

    # 如果包含代码块 → 偏向执行
    if has_code and scores[0] == 0:
        scores[0] += 1

    # 长文本 + 结构关键词 → 偏向复杂
    if word_count > 50 and has_structure:
        scores[2] += 1

    # 执行关键词超过结构关键词 → 偏向执行
    if has_execution and not has_plan:
        scores[0] += 1

    # 计划/分析倾向最高层
    if has_structure and not has_execution:
        scores[2] += 0.5
    if has_plan and not has_execution:
        scores[1] += 0.5

    # 取最高分
    max_score = max(scores.values())
    if max_score == 0:
        # 无匹配 → 探测意图
        if has_execution:
            return 0
        if has_structure or has_plan:
            return 2 if has_structure else 1
        # 短文本 → 执行
        if word_count < 15:
            return 0
        return 1  # 默认 Sonnet

    # 取最高分层级（同分取更高复杂度）
    top_tiers = [t for t, s in scores.items() if s == max_score]
    return max(top_tiers)


def _find_ga_root() -> str:
    """找到 GA CodeRoot（含 agentmain.py 的目录）"""
    # 1) 环境变量
    ga_root = os.environ.get('GA_CODEROOT')
    if ga_root and os.path.exists(os.path.join(ga_root, 'agentmain.py')):
        return ga_root
    # 2) 已知候选路径
    candidates = [
        r'D:\Contests51\GenericAgent',
        os.path.abspath(os.path.join(os.path.dirname(__file__), '..')),
        os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')),
    ]
    for p in candidates:
        if os.path.exists(os.path.join(p, 'agentmain.py')):
            return os.path.abspath(p)
    return None

def launch_subagent(task: str, llm_no: int, bg: bool = True) -> dict:
    """启动子代理执行任务"""
    ga_root = _find_ga_root()

    agentmain = os.path.join(ga_root, 'agentmain.py')
    if not os.path.exists(agentmain):
        return {'status': 'error', 'msg': f'agentmain.py not found (searched from {ga_root})'}

    # 生成唯一任务名
    task_name = f'router_{llm_no}_{int(time.time())}'

    cmd = [sys.executable, agentmain, '--task', task_name, '--input', task]
    if bg:
        cmd.append('--bg')
    cmd.extend(['--llm_no', str(llm_no)])

    try:
        proc = subprocess.Popen(cmd, cwd=ga_root)
        return {
            'status': 'launched',
            'llm_no': llm_no,
            'model': {0: 'DeepSeek', 1: 'Sonnet', 2: 'Opus'}.get(llm_no, '?'),
            'task_name': task_name,
            'pid': proc.pid,
            'task': task[:100],
        }
    except Exception as e:
        return {'status': 'error', 'msg': str(e)}


def _compute_reason(task_text: str, llm_no: int) -> str:
    """为模型切换提供原因说明"""
    text = task_text.lower()

    # 检查显式指定
    if re.search(r'\bt[1t][：:]\s*\d|tier\s*[：:]\s*\d|层级[：:]\s*\d', text):
        m = re.search(r't[1t][：:]?\s*(\d)|tier[：:]?\s*(\d)|层级[：:]?\s*(\d)', text)
        if m:
            return f'显式指定 Tier {m.group(1) or m.group(2) or m.group(3)}'

    # 关键词匹配
    matched_kws = []
    for tier, kws in TIER_KEYWORDS.items():
        for kw in kws:
            if kw in text:
                matched_kws.append(kw)
    matched_kws = list(dict.fromkeys(matched_kws))  # 去重保序

    parts = []
    if matched_kws:
        parts.append(f'关键词词: {",".join(matched_kws[:4])}')

    # 启发式
    has_code = bool(re.search(r'(```|def |class |import |function|var |let |const )', text))
    has_structure = bool(re.search(r'(架构|战略|宏观|体系|顶层|全局|长期|本质)', text))
    has_plan = bool(re.search(r'(方案|规划|评估|分析|设计|评审)', text))
    has_execution = bool(re.search(r'(写|实现|编码|测试|部署|脚本|修复|改|修|删|建)', text))

    hints = []
    if has_code:
        hints.append('含代码')
    if has_structure:
        hints.append('宏观')
    if has_plan:
        hints.append('规划')
    if has_execution:
        hints.append('执行')

    if len(text) < 15 and not matched_kws:
        hints.append('短文本默认')
    if not matched_kws and not hints:
        hints.append('默认路由')

    if hints:
        parts.append(f'启发式: {",".join(hints)}')

    return ' | '.join(parts) if parts else '默认路由'


def main():
    parser = argparse.ArgumentParser(description='三层自动路由引擎')
    parser.add_argument('--task', required=True, help='任务描述')
    parser.add_argument('--tier', type=int, choices=[1, 2, 3],
                        help='手动指定层级: 1=Opus(宏观) 2=Sonnet(日常) 3=DS(执行)')
    parser.add_argument('--no-launch', action='store_true', help='仅显示分类结果，不执行')
    parser.add_argument('--bg', action='store_true', default=True, help='后台运行 (默认)')
    args = parser.parse_args()

    # 手动指定
    if args.tier:
        llm_no = {1: 2, 2: 1, 3: 0}[args.tier]
        tier_name = TIER_NAMES[llm_no]
        reason = f'手动指定 Tier {args.tier}'
    else:
        llm_no = classify_task(args.task)
        tier_name = TIER_NAMES[llm_no]
        reason = _compute_reason(args.task, llm_no)

    # 模型切换横幅
    print_switch_banner(args.task, llm_no, reason)

    result = {
        'task': args.task[:200],
        'llm_no': llm_no,
        'tier': tier_name,
    }

    launched = False
    if not args.no_launch:
        launch_result = launch_subagent(args.task, llm_no, bg=args.bg)
        result['launch'] = launch_result
        launched = launch_result.get('status') == 'launched'

    # 状态栏
    print_status_bar(result, launched)

    # JSON 输出（供程序消费）
    print('--- JSON ---')
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return result


if __name__ == '__main__':
    import time
    main()