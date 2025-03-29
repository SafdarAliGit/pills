frappe.ui.form.on('Hospital Discharge Detail', {
    on_submit: function(frm) {
        if (frm.doc.patient_name) {
            frappe.db.get_value('Burn Admission Assessment', {patient_name: frm.doc.patient_name}, 'name')
                .then(r => {
                    if (r.message) {
                        const burn_assessment_name = r.message.name;
                        frappe.db.set_value('Burn Admission Assessment', burn_assessment_name, 'discharge_status', 'Discharged')
                            .then(() => {
                                frappe.msgprint(__('Patient has been successfully marked as discharged.'));
                            });
                    } else {
                        frappe.msgprint(__('No matching Burn Admission Assessment found for this patient.'));
                    }
                });
        }
    }
});
