import io
import json

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill


def safe_excel_value(value):
    if isinstance(value, str) and value.startswith(("=", "+", "-", "@")):
        return "'" + value
    return value


def build_excel(run):
    workbook = Workbook()
    summary_sheet = workbook.active
    summary_sheet.title = "Summary"
    prediction_sheet = workbook.create_sheet("Predictions")

    customers = list(run.get("customers") or [])
    if not customers and run.get("prediction_data"):
        prediction = run["prediction_data"]
        if isinstance(prediction, str):
            prediction = json.loads(prediction)
        customers = [prediction]

    high = sum(row.get("risk_level") == "High" for row in customers)
    medium = sum(row.get("risk_level") == "Medium" for row in customers)
    low = sum(row.get("risk_level") == "Low" for row in customers)
    summary_rows = [
        ("Run date", run.get("created_at")),
        ("Run type", "CSV upload" if run.get("source") == "upload" else "Single prediction"),
        ("File name", run.get("file_name") or ""),
        ("Total customers", len(customers)),
        ("High risk", high),
        ("Medium risk", medium),
        ("Low risk", low),
        ("Threshold used", run.get("threshold_used")),
        ("Model name", run.get("model_name") or "Logistic Regression"),
    ]
    summary_sheet.append(["Field", "Value"])
    for row in summary_rows:
        summary_sheet.append([safe_excel_value(value) for value in row])

    fields = [
        ("Customer ID", "customer_id"),
        ("Recency", "recency_days"),
        ("Frequency", "frequency"),
        ("Monetary", "monetary"),
        ("Tenure", "tenure_days"),
        ("Total items", "total_items"),
        ("Average order value", "avg_order_value"),
        ("Churn probability (%)", "churn_probability"),
        ("Risk band", "risk_level"),
    ]
    prediction_sheet.append([label for label, _ in fields])
    for row in sorted(customers, key=lambda item: item.get("churn_probability") or 0, reverse=True):
        values = []
        for _, key in fields:
            value = row.get(key, "")
            if key == "churn_probability" and value != "":
                value = round(float(value) * 100, 1)
            values.append(safe_excel_value(value))
        prediction_sheet.append(values)

    for sheet in (summary_sheet, prediction_sheet):
        sheet.freeze_panes = "A2"
        for cell in sheet[1]:
            cell.font = Font(bold=True)
        for column in sheet.columns:
            width = max(len(str(cell.value or "")) for cell in column) + 2
            sheet.column_dimensions[column[0].column_letter].width = min(width, 45)

    risk_fills = {
        "High": PatternFill("solid", fgColor="FECACA"),
        "Medium": PatternFill("solid", fgColor="FEF3C7"),
        "Low": PatternFill("solid", fgColor="DCFCE7"),
    }
    risk_column = next(index for index, (_, key) in enumerate(fields, start=1) if key == "risk_level")
    for row in prediction_sheet.iter_rows(min_row=2):
        risk = row[risk_column - 1].value
        if risk in risk_fills:
            row[risk_column - 1].fill = risk_fills[risk]

    output = io.BytesIO()
    workbook.save(output)
    output.seek(0)
    return output
