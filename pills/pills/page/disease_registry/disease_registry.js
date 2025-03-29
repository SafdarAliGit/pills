frappe.pages['disease-registry'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Select Registry',
        single_column: true
    });

    $(wrapper).find('.layout-main-section').empty().append(`
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80vh;">
            <h2>Select the registry</h2>
            <div id="registry-buttons" style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;"></div>
            <div id="registry-next-btn-container" style="margin-top: 30px;"></div>
        </div>
    `);

    let selected_registry = null;

    frappe.call({
        method: 'frappe.client.get_list',
        args: {
            doctype: 'Registry',
            fields: ['name']
        },
        callback: function(r) {
            if (r.message) {
                r.message.forEach(function(registry) {
                    let button = $('<button/>', {
                        text: registry.name,
                        style: `
                            background-color: white;
                            color: black;
                            padding: 15px 30px;
                            font-size: 16px;
                            border: 2px solid black;
                            border-radius: 5px;
                            cursor: pointer;
                            width: 300px;
                            transition: background-color 0.3s, color 0.3s;
                        `,
                        click: function() {
                            $('#registry-buttons button').css({
                                'background-color': 'white',
                                'color': 'black'
                            });
                            $(this).css({
                                'background-color': 'black',
                                'color': 'white'
                            });
                            selected_registry = registry.name;
                            registry_next_button.prop('disabled', false);
                        }
                    }).appendTo('#registry-buttons');
                });
            } else {
                frappe.msgprint(__('No registry types found.'));
            }
        },
        error: function() {
            frappe.msgprint(__('Failed to retrieve registry types.'));
        }
    });

    let registry_next_button = $('<button/>', {
        text: 'Next',
        style: `
            background-color: grey;
            color: white;
            padding: 15px 30px;
            font-size: 16px;
            border: none;
            border-radius: 5px;
            width: 300px;
            transition: background-color 0.3s, cursor 0.3s;
        `,
        disabled: false
    }).appendTo('#registry-next-btn-container');

    registry_next_button.on('click', function() {
        if (selected_registry) {
            frappe.call({
                method: 'frappe.client.set_value',
                args: {
                    'doctype': 'User',
                    'name': frappe.session.user,
                    'fieldname': 'registry',
                    'value': selected_registry
                },
                callback: function(r) {
                    frappe.set_route('hospital-selection');
                }
            });
        }
    });
};
