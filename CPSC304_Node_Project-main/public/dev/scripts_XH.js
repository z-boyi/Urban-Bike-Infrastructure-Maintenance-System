// Fetches data from the demotable and displays it.
async function fetchMaintenanceTask() {
    const tableElement = document.getElementById('maintenanceTask');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/maintenance-task/fetch', {
        method: 'GET'
    });

    const responseData = await response.json();
    const demotableContent = responseData.data;

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    demotableContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

// Insert a given maintenance task
async function insertMaintenanceTask(event) {
    event.preventDefault();

    const TaskID = document.getElementById('TaskID').value;
    const MaintenanceID = document.getElementById('MaintenanceID').value;
    const TechnicianID = document.getElementById('TechnicianID').value;

    const response = await fetch('/maintenance-task/insert', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            TaskID: TaskID,
            MaintenanceID: MaintenanceID,
            TechnicianID: TechnicianID
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Data inserted successfully!";
        fetchMaintenanceTask();
    } else {
        messageElement.textContent = "Error inserting data!";
    }
}
