from __future__ import annotations
from datetime import date

HUNTR_Q2_2026_BANDS=[
    (11,20,8.12),(21,50,6.48),(51,100,4.83),(101,10**9,2.86)
]

def market_interview_benchmark(applications:int):
    for lo,hi,rate in HUNTR_Q2_2026_BANDS:
        if lo<=applications<=hi: return rate
    return None

def dashboard_metrics(*,search_start:str,applications:int,rejections:int,interviews:int,plan_per_week:int|None=None,today=None):
    today=today or date.today()
    start=date.fromisoformat(search_start)
    days=(today-start).days+1
    weeks=max(days/7,1)
    pace=applications/weeks
    observed=(interviews/applications*100) if applications else 0
    benchmark=market_interview_benchmark(applications)
    efficiency=(observed/benchmark) if benchmark else None
    return {
      "search_days":days,
      "applications":applications,
      "rejections":rejections,
      "interviews":interviews,
      "weekly_pace":round(pace,1),
      "plan_per_week":plan_per_week,
      "plan_attainment_pct":round(pace/plan_per_week*100,1) if plan_per_week else None,
      "market_interview_benchmark_pct":benchmark,
      "observed_interview_rate_pct":round(observed,2),
      "efficiency_coefficient":round(efficiency,2) if efficiency is not None else None,
      "definition":"efficiency = observed interview conversion / Huntr Q2 2026 benchmark for the same application-volume band"
    }
