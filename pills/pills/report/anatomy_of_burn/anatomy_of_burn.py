import frappe
from frappe import _

def execute(filters=None):
    columns = get_columns()
    data = get_data()
    return columns, data

def get_columns():
    return [
        {"label": _("Anatomy Of Burn"), "fieldname": "anatomy_of_burn", "fieldtype": "Data", "width": 200},
        {"label": _("Count"), "fieldname": "count", "fieldtype": "Int", "width": 100}
    ]

def get_data():
    # Define the anatomy fields with exact field names from your Doctype
    anatomy_fields = [
        {"label": "Head and Neck", "fieldname": "head_and_neck"},
        {"label": "Trunk", "fieldname": "trunk"},
        {"label": "Arms", "fieldname": "arms"},
        {"label": "Hands and Waist", "fieldname": "hands_and_waist"},
        {"label": "Legs", "fieldname": "legs"},
        {"label": "None", "fieldname": "head_and_neck_none"}
    ]
    
    data = []
    
    # Loop through each anatomy field and count checked entries
    for field in anatomy_fields:
        # Count records where the checkbox field is checked (assumed to be stored as 1 for checked)
        count = frappe.db.count('Burn Admission Assessment', filters={field["fieldname"]: 1})
        
        # Append the result to the data list
        data.append({"anatomy_of_burn": field["label"], "count": count})

    return data
