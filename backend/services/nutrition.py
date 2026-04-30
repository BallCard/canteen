"""
营养计算服务
"""
from .. import data

DAILY_TARGET = {"calories": 2000, "protein": 60, "fat": 65, "carbs": 300}


def get_today_summary() -> dict:
    """计算今日营养汇总"""
    summary = {"calories": 0, "protein": 0.0, "fat": 0.0, "carbs": 0.0}
    for log in data.meal_logs:
        summary["calories"] += log.get("calories", 0)
        summary["protein"] += log.get("protein", 0)
        summary["fat"] += log.get("fat", 0)
        summary["carbs"] += log.get("carbs", 0)

    percentages = {}
    for k in summary:
        target = DAILY_TARGET.get(k, 1)
        percentages[k] = round(summary[k] / target * 100, 1)

    return {"summary": summary, "percentages": percentages, "target": DAILY_TARGET}


def get_weekly_report() -> dict:
    """周报统计"""
    total = {"calories": 0, "protein": 0.0, "fat": 0.0, "carbs": 0.0}
    for log in data.meal_logs:
        for k in total:
            total[k] += log.get(k, 0)
    days = max(len(data.meal_logs), 1)
    avg = {k: round(v / days, 1) for k, v in total.items()}
    return {"total": total, "average": avg, "days": days}
