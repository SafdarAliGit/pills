// File location: <your_custom_app>/public/js/pills_dashboard.js
frappe.ui.form.on("Dashboard", {
    refresh: function(frm) {
        // Step 1: Add a custom filter for selecting hospital
        if (!frm.hospital_selector) {
            frm.hospital_selector = frm.page.add_field({
                label: 'Select Hospital',
                fieldtype: 'Link',
                fieldname: 'hospital',
                options: 'Hospital',
                change: function() {
                    // Fetch and display data for selected hospital
                    const selected_hospital = frm.hospital_selector.get_value();
                    if (selected_hospital) {
                        update_dashboard_for_hospital(frm, selected_hospital);
                    }
                }
            });
        }

        // Load data for the default hospital (if any hospital is selected)
        const initial_hospital = frm.hospital_selector.get_value();
        if (initial_hospital) {
            update_dashboard_for_hospital(frm, initial_hospital);
        }
    }
});

// Step 2: Function to Fetch and Display Data for Selected Hospital
function update_dashboard_for_hospital(frm, hospital_name) {
    // Clear existing indicators if needed
    frm.dashboard.clear_indicators();
    console.log("working")
    // Fetch patient counts
    frappe.call({
        method: "pills.pills.utils.get_patient_counts",
        args: { hospital_name },
        callback: function(response) {
            if (response.message) {
                const patient_counts = response.message;
                frm.dashboard.add_indicator("Total Patients", patient_counts.total_patients, "blue");
                frm.dashboard.add_indicator("Patients Admitted", patient_counts.admitted_patients, "green");
                frm.dashboard.add_indicator("Patients Discharged", patient_counts.discharged_patients, "orange");
            }
        }
    });

    // Fetch bed counts
    frappe.call({
        method: "pills.pills.utils.get_bed_counts",
        args: { hospital_name },
        callback: function(response) {
            if (response.message) {
                const bed_counts = response.message;
                frm.dashboard.add_indicator("Total Beds", bed_counts.total_no_of_beds, "purple");
                frm.dashboard.add_indicator("Occupied Beds", bed_counts.occupied_beds, "red");
                frm.dashboard.add_indicator("Available Beds", bed_counts.available_beds, "green");
            }
        }
    });
}
