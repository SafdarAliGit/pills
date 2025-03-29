from pills.utils import update_hospital_beds_on_change

def update_hospital_beds_on_patient_change(doc, method):
	if doc.hospital:
		update_hospital_beds_on_change(doc.hospital)
