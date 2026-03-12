import calendar
from datetime import datetime

def print_months_since(label, target_date):
    now = datetime.now()
    months = (now.year - target_date.year) * 12 + now.month - target_date.month
    
    if now.day < target_date.day:
        months -= 1
        prev_month = now.month - 1 or 12
        prev_year = now.year if now.month > 1 else now.year - 1
        _, days_in_prev_month = calendar.monthrange(prev_year, prev_month)
        
        start_day = min(target_date.day, days_in_prev_month)
        days = days_in_prev_month - start_day + now.day
    else:
        days = now.day - target_date.day
        
    print(f"It has been {months} months and {days} days since you started {label} ({target_date.strftime('%Y-%m-%d')})")

# HRT
print_months_since("HRT", datetime(2023, 11, 16))

# Progesterone
print_months_since("Progesterone", datetime(2025, 4, 2))