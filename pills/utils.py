import frappe

def boot_session(bootinfo):
	frappe.logger().debug("boot_session triggered")
	
	frappe.local.response["redirect_location"] = "/app/disease-registry"
	return bootinfo

def after_login(login_manager):
	frappe.logger().debug("after_login triggered")
	
	frappe.local.response["redirect_location"] = "/app/disease-registry"

def update_hospital_beds_on_change(doc, method):
	if doc.hospital:
		hospital = frappe.get_doc('Hospital', doc.hospital)

		occupied_beds_count = frappe.db.count('Burn Admission Assessment', filters={'hospital': doc.hospital})

		available_beds = max(0, hospital.total_no_of_beds - occupied_beds_count)
		
		hospital.available_beds = available_beds
		hospital.save(ignore_permissions=True)
		frappe.db.commit()

@frappe.whitelist()
def get_bed_counts(hospital_name):
	total_no_of_beds = frappe.db.get_value('Hospital', hospital_name, 'total_no_of_beds') or 0

	occupied_beds = frappe.db.count(
		'Burn Admission Assessment',
		filters={
			'hospital': hospital_name,
			'discharge_status': 'Admitted'
		}
	)

	available_beds = total_no_of_beds - occupied_beds

	return {
		'total_no_of_beds': total_no_of_beds,
		'occupied_beds': occupied_beds,
		'available_beds': available_beds
	}

@frappe.whitelist()
def get_patient_counts(hospital_name):
	total_patients = frappe.db.count('Burn Admission Assessment', filters={'hospital': hospital_name})
	
	admitted_patients = frappe.db.count(
		'Burn Admission Assessment', 
		filters={'hospital': hospital_name, 'discharge_status': 'Admitted'}
	)
	
	discharged_patients = frappe.db.count(
		'Burn Admission Assessment', 
		filters={'hospital': hospital_name, 'discharge_status': 'Discharged'}
	)
	
	return {
		'total_patients': total_patients,
		'admitted_patients': admitted_patients,
		'discharged_patients': discharged_patients
	}

@frappe.whitelist()
def get_patient_admission_metrics():
	hospital_name = frappe.defaults.get_user_default("hospital")

	if not hospital_name:
		return {
			"error": "No hospital selected. Please select a hospital."
		}

	total_patients = frappe.db.count('Burn Admission Assessment', filters={'hospital': hospital_name})
	discharged_patients = frappe.db.count(
		'Burn Admission Assessment',
		filters={'hospital': hospital_name, 'discharge_status': 'Discharged'}
	)
	bed_counts = get_bed_counts(hospital_name)

	return {
		'total_patients': total_patients,
		'discharged_patients': discharged_patients,
		'total_no_of_beds': bed_counts.get('total_no_of_beds', 0),
		'available_beds': bed_counts.get('available_beds', 0)
	}