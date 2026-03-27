// Fetches data from MaintenanceTask and displays it.
async function fetchMaintenanceTask() {
    const tableElement = document.getElementById('MaintenanceTask');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/maintenance-task/fetch');
    const responseData = await response.json();

    tableBody.innerHTML = '';

    responseData.data.forEach(rowData => {
        const row = tableBody.insertRow();

        rowData.forEach(field => {
            const cell = row.insertCell();
            cell.textContent = field;
        });
    });
}

// Insert a given maintenance task
async function insertMaintenanceTask(event) {
    event.preventDefault();

    const TaskID = document.getElementById('insertTaskID').value;
    const MaintenanceID = document.getElementById('insertMaintenanceID').value;
    const TechnicianID = document.getElementById('insertTechnicianID').value;

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

// Get tasks by technician id
async function getTasksByTechnicianID() {
    const TechnicianID = document.getElementById('queryTechnicianID').value;

    const response = await fetch(`/technician/tasks?TechnicianID=${TechnicianID}`, {
        method: 'GET'
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('queryResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Here are the tasks assigned to this technician";
        
        const tableElement = document.getElementById('maintenanceTask');
        const tableHead = tableElement.querySelector('thead');
        const tableBody = tableElement.querySelector('tbody');

        tableHead.innerHTML = '';
        tableBody.innerHTML = '';

        const headerRow = tableHead.insertRow();
        responseData.columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            headerRow.appendChild(th);
        });

        responseData.data.forEach(rowData => {
            const row = tableBody.insertRow();
            rowData.forEach(field => {
                const cell = row.insertCell();
                cell.textContent = field;
            });
        });

    } else {
        messageElement.textContent = "Error querying data!";
    }
}

// Get technicians above average workload
async function getTechnicianAboveAverageWorkload() {
    const response = await fetch('/technician/above-average-workload', {
        method: 'GET'
    });

    const responseData = await response.json();

    const messageElement = document.getElementById('aboveAvgWorkloadMsg');
    const tableElement = document.getElementById('MaintenanceTask');

    const tableHead = tableElement.querySelector('thead');
    const tableBody = tableElement.querySelector('tbody');

    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    if (responseData.success) {
        messageElement.textContent = "Technicians with above-average workload";

        const headerRow = tableHead.insertRow();
        responseData.columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            headerRow.appendChild(th);
        });

        responseData.data.forEach(rowData => {
            const row = tableBody.insertRow();
            rowData.forEach(field => {
                const cell = row.insertCell();
                cell.textContent = field;
            });
        });

    } else {
        messageElement.textContent = "Error querying data!";
    }
}

// Get technicians work on all tasks
async function getTechnicianWorkOnAllTasks() {
    const response = await fetch('/technician/working-on-all-tasks', {
        method: 'GET'
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('workOnAllMsg');

    const tableElement = document.getElementById('MaintenanceTask');
    const tableHead = tableElement.querySelector('thead');
    const tableBody = tableElement.querySelector('tbody');

    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    if (responseData.success) {
        messageElement.textContent = "Technicians who worked on all tasks";

        const headerRow = tableHead.insertRow();
        responseData.columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            headerRow.appendChild(th);
        });

        responseData.data.forEach(rowData => {
            const row = tableBody.insertRow();
            rowData.forEach(field => {
                const cell = row.insertCell();
                cell.textContent = field;
            });
        });

    } else {
        messageElement.textContent = "Error querying data!";
    }
}

window.onload = function() {
    fetchMaintenanceTask();
    document.getElementById("insertMaintenanceTask").addEventListener("submit", insertMaintenanceTask);
    document.getElementById("getTasksByTechnicianID").addEventListener("submit", getTasksByTechnicianID);
    document.getElementById("getTechnicianAboveAverageWorkload").addEventListener("click", getTechnicianAboveAverageWorkload);
    document.getElementById("getTechnicianWorkOnAllTasks").addEventListener("click", getTechnicianWorkOnAllTasks);
};