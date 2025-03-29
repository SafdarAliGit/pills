# Copyright (c) 2024, Ebbad and contributors
# For license information, please see license.txt

# import frappe


# burn_report.py

import frappe
from frappe import _

def execute(filters=None):
    columns = get_columns()
    data = get_data()
    return columns, data

def get_columns():
    return [
        {"label": _("Burn Cause"), "fieldname": "burn_cause", "fieldtype": "Data", "width": 150},
        {"label": _("Count"), "fieldname": "count", "fieldtype": "Int", "width": 100}
    ]

def get_data():
    burn_types = ["Flame", "Electrical", "Friction", "Hot Surface", "Chemical", "Cooling", "Others", "Radiation"]
    data = []

    for burn_type in burn_types:
        count = frappe.db.count('Burn Admission Assessment', filters={f"{burn_type.lower().replace(' ', '_')}": 1})
        data.append({"burn_cause": burn_type, "count": count})

    return data
