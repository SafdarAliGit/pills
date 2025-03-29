frappe.pages['hospital-selection'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Select Hospital',
        single_column: true
    });

    $(wrapper).find('.layout-main-section').empty().append(`
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80vh;">
            <h2>Select the hospital</h2>
            <div id="hospital-field" style="width: 400px; margin-top: 20px;"></div>

            <div id="bed-info" style="margin-top: 20px; display: flex; gap: 20px; text-align: center;">
                <div id="total-beds-div"></div>
                <div id="total-patients-div"></div>
            </div>

            <div id="patient-info" style="margin-top: 20px; display: flex; gap: 20px; text-align: center;">
                <div id="admitted-patients-div"></div>
                <div id="discharged-patients-div"></div>
            </div>

            <div id="next-btn" style="margin-top: 30px;"></div>
        </div>
    `);

    let hospital_field = frappe.ui.form.make_control({
        parent: $('#hospital-field'),
        df: {
            label: 'Hospital',
            fieldname: 'hospital',
            fieldtype: 'Link',
            options: 'Hospital',
            reqd: 1,
        },
        render_input: true
    });

    $('#hospital-field input').css({
        'height': '40px',
        'font-size': '16px',
        'padding': '10px'
    });

    let total_beds_div = $('#total-beds-div');

    let total_patients_div = $('#total-patients-div');
    let admitted_patients_div = $('#admitted-patients-div');
    let discharged_patients_div = $('#discharged-patients-div');

    hospital_field.$input.on('blur', function() {
        let selected_hospital = hospital_field.get_value();

        if (selected_hospital) {
            frappe.call({
                method: 'pills.utils.get_bed_counts',
                args: {
                    hospital_name: selected_hospital
                },
                callback: function(r) {
                    if (r.message) {
                        let total_beds = r.message.total_no_of_beds || 0;

                        total_beds_div.html(`<p><strong>Total Beds:</strong> ${total_beds}</p>`);
                    } else {
                        total_beds_div.html('<p>No data available</p>');
                    }
                },
                error: function() {
                    frappe.msgprint(__('Failed to retrieve bed counts. Please try again.'));
                }
            });

            frappe.call({
                method: 'pills.utils.get_patient_counts',
                args: {
                    hospital_name: selected_hospital
                },
                callback: function(r) {
                    if (r.message) {
                        let total_patients = r.message.total_patients || 0;
                        let admitted_patients = r.message.admitted_patients || 0;
                        let discharged_patients = r.message.discharged_patients || 0;

                        total_patients_div.html(`<p><strong>Total Patients Registered:</strong> ${total_patients}</p>`);
                        admitted_patients_div.html(`<p style="color: blue;"><strong>Currently Admitted:</strong> ${admitted_patients}</p>`);
                        discharged_patients_div.html(`<p style="color: purple;"><strong>Discharged Patients:</strong> ${discharged_patients}</p>`);
                    } else {
                        total_patients_div.html('<p>No data available</p>');
                        admitted_patients_div.html('');
                        discharged_patients_div.html('');
                    }
                },
                error: function() {
                    frappe.msgprint(__('Failed to retrieve patient counts. Please try again.'));
                }
            });
        } else {
            total_beds_div.html('');
            total_patients_div.html('');
            admitted_patients_div.html('');
            discharged_patients_div.html('');
        }
    });

    let next_button = $('<button/>', {
        text: 'Next',
        style: `
            background-color: black;
            color: white;
            padding: 15px 30px;
            font-size: 16px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        `
    }).appendTo('#next-btn');

    next_button.on('click', function() {
        let selected_hospital = hospital_field.get_value();

        if (selected_hospital) {
            frappe.call({
                method: 'frappe.client.set_value',
                args: {
                    'doctype': 'User',
                    'name': frappe.session.user,
                    'fieldname': 'hospital',
                    'value': selected_hospital
                },
                callback: function(r) {
                    frappe.set_route('List', 'Burn Admission Assessment', {
                        'hospital': selected_hospital
                    });
                },
                error: function() {
                    frappe.msgprint(__('Failed to set the hospital. Please try again.'));
                }
            });
        } else {
            frappe.msgprint(__('Please select a Hospital'));
        }
    });
};
