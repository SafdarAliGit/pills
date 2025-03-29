frappe.ui.form.on('Burn Admission Assessment', {
    refresh: function (frm) {
        // Only trigger `date_of_birth` if it has changed and not on every refresh
        if (frm.doc.date_of_birth && !frm.__is_date_of_birth_handled) {
            frm.trigger('date_of_birth');
            frm.__is_date_of_birth_handled = true; // Prevent recalculating unnecessarily
        } else {
            frm.fields_dict.age_html.$wrapper.html('');
            toggle_fields_based_on_age(frm);
        }

        if (frm.doc.docstatus === 1) {
            if (frm.doc.patient_name && frm.doc.medical_record_number) {
                frappe.call({
                    method: 'frappe.client.get_list',
                    args: {
                        doctype: 'Hospital Discharge Detail',
                        filters: {
                            patient_name: frm.doc.patient_name,
                            medical_record_number: frm.doc.medical_record_number, // Ensure both match
                        },
                        fields: ['name'],
                        limit_page_length: 1,
                    },
                    callback: function (response) {
                        const dischargeForm = response.message && response.message[0];

                        if (dischargeForm) {
                            frm.add_custom_button(__('Show Discharge Form'), function () {
                                frappe.set_route('Form', 'Hospital Discharge Detail', dischargeForm.name);
                            });
                        } else {
                            frm.add_custom_button(__('Discharge Patient'), function () {
                                frappe.new_doc('Hospital Discharge Detail', {
                                    'patient_name': frm.doc.patient_name,
                                    'medical_record_number': frm.doc.medical_record_number, // Pass this to the new record
                                    'hospital': frm.doc.hospital,
                                });

                                frappe.msgprint(__('Please complete the discharge details and save to finalize discharge.'));
                            });
                        }
                    },
                });
            } else {
                frm.add_custom_button(__('Discharge Patient'), function () {
                    frappe.msgprint(__('Please ensure both the patient name and medical record number are entered before discharging.'));
                });
            }
        }
    },

    onload: function (frm) {
        // Default discharge status
        if (!frm.doc.discharge_status) {
            frm.set_value('discharge_status', 'Admitted');
        }
    },

    date_of_birth: function (frm) {
        if (frm.doc.date_of_birth) {
            const dob = new Date(frm.doc.date_of_birth);
            const today = new Date();

            let years = today.getFullYear() - dob.getFullYear();
            let months = today.getMonth() - dob.getMonth();
            let days = today.getDate() - dob.getDate();

            if (months < 0) {
                years--;
                months += 12;
            }

            if (days < 0) {
                months--;
                const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                days += prevMonth.getDate();
            }

            // Set the calculated age field
            const calculatedAge = `${years} years, ${months} months, ${days} days`;
            frm.set_value('calculated_age', calculatedAge);

            // Display age in the age_html field
            frm.fields_dict.age_html.$wrapper.html(`<b>Age: ${calculatedAge}</b>`);

            toggle_fields_based_on_age(frm);
        } else {
            frm.fields_dict.age_html.$wrapper.html('');
            frm.set_value('calculated_age', null); // Clear calculated_age if DOB is empty
            toggle_fields_based_on_age(frm);
        }
    },
});

function toggle_fields_based_on_age(frm) {
    if (!frm.doc.date_of_birth) {
        frm.set_df_property('less_than_fifteen_education_status', 'hidden', 1);
        frm.set_df_property('less_than_fifteen_father_education_status', 'hidden', 1);
        frm.set_df_property('less_than_fifteen_mother_education_status', 'hidden', 1);
        frm.set_df_property('under_five_patient_with', 'hidden', 1);

        frm.set_df_property('less_than_fifteen_education_status', 'reqd', 0);
        frm.set_df_property('less_than_fifteen_father_education_status', 'reqd', 0);
        frm.set_df_property('less_than_fifteen_mother_education_status', 'reqd', 0);
        return;
    }

    const today = new Date();
    const dob = new Date(frm.doc.date_of_birth);
    const ageInYears = today.getFullYear() - dob.getFullYear() - (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);

    if (ageInYears < 15) {
        frm.set_df_property('less_than_fifteen_education_status', 'hidden', 0);
        frm.set_df_property('less_than_fifteen_father_education_status', 'hidden', 0);
        frm.set_df_property('less_than_fifteen_mother_education_status', 'hidden', 0);

        frm.set_df_property('less_than_fifteen_education_status', 'reqd', 1);
        frm.set_df_property('less_than_fifteen_father_education_status', 'reqd', 1);
        frm.set_df_property('less_than_fifteen_mother_education_status', 'reqd', 1);
    } else {
        frm.set_df_property('less_than_fifteen_education_status', 'hidden', 1);
        frm.set_df_property('less_than_fifteen_father_education_status', 'hidden', 1);
        frm.set_df_property('less_than_fifteen_mother_education_status', 'hidden', 1);

        frm.set_df_property('less_than_fifteen_education_status', 'reqd', 0);
        frm.set_df_property('less_than_fifteen_father_education_status', 'reqd', 0);
        frm.set_df_property('less_than_fifteen_mother_education_status', 'reqd', 0);
    }

    if (ageInYears < 5) {
        frm.set_df_property('under_five_patient_with', 'hidden', 0);
    } else {
        frm.set_df_property('under_five_patient_with', 'hidden', 1);
    }
}
