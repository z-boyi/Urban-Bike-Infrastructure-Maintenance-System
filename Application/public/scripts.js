/*
 * These functions below are for various webpage functionalities. 
 * Each function serves to process data on the frontend:
 *      - Before sending requests to the backend.
 *      - After receiving responses from the backend.
 * 
 * To tailor them to your specific needs,
 * adjust or expand these functions to match both your 
 *   backend endpoints 
 * and 
 *   HTML structure.
 * 
 */


// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    const response = await fetch('/check-db-connection', {
        method: "GET"
    });

    // Hide the loading GIF once the response is received.
    loadingGifElem.style.display = 'none';
    // Display the statusElem's text in the placeholder.
    statusElem.style.display = 'inline';

    response.text()
    .then((text) => {
        statusElem.textContent = text;
    })
    .catch((error) => {
        statusElem.textContent = 'connection timed out';  // Adjust error handling if required.
    });
}

// ==================== Bike-Related Frontend Functions ====================
// Insert a new station
async function insertStation(event) {
    event.preventDefault();

    const StreetAddress = document.getElementById('stationStreet').value;
    const PostalCode = document.getElementById('stationPostal').value;
    const StationName = document.getElementById('stationName').value;

    const response = await fetch('/station/insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            StreetAddress,
            PostalCode,
            StationName
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertStationMsg');

    if (responseData.success) {
        messageElement.textContent = "✅ Station inserted successfully!";
    } else {
        let msg = "❌ " + (responseData.message || "Insert failed.");
    
        if (responseData.errorCode === 1) {
            msg += " This station already exists.";
        } else if (responseData.errorCode === 1400) {
            msg += " Some required fields are missing.";
        } else if (responseData.errorCode === 12899) {
            msg += " One of the inputs is too long.";
        }
    
        messageElement.textContent = msg;
    }
}

// Fetch stations and display them
async function fetchStations() {
    const tableElement = document.getElementById('StationTable');
    const tableHead = tableElement.querySelector('thead');
    const tableBody = tableElement.querySelector('tbody');
    const messageElement = document.getElementById('stationMsg');

    const response = await fetch('/station/fetch');
    const responseData = await response.json();

    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    if (responseData.success) {
        messageElement.textContent = "Showing all stations.";

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
        messageElement.textContent = responseData.message || "Failed to load stations.";
    }
}

// Insert a new bike
async function insertBike(event) {
    event.preventDefault();

    const BikeID = document.getElementById('bikeID').value;
    const Brand = document.getElementById('brand').value;
    const LastServiceDate = document.getElementById('lastServiceDate').value;
    const DeploymentDate = document.getElementById('deploymentDate').value;
    const Status = document.getElementById('status').value;
    const StreetAddress = document.getElementById('streetAddress').value;
    const PostalCode = document.getElementById('postalCode').value;

    const response = await fetch('/bike/insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            BikeID,
            Brand,
            LastServiceDate,
            DeploymentDate,
            Status,
            StreetAddress,
            PostalCode
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertBikeMsg');

    if (responseData.success) {
        messageElement.textContent = "Bike inserted successfully!";
    } else {
        messageElement.textContent =
            responseData.message +
            (responseData.errorCode ? ` (Code: ${responseData.errorCode})` : "");
        console.log("Insert bike error details:", responseData.details);
    }
}

// Fetch bikes and display them
async function fetchBikes() {
    const tableElement = document.getElementById('BikeTable');
    const tableHead = tableElement.querySelector('thead');
    const tableBody = tableElement.querySelector('tbody');
    const messageElement = document.getElementById('bikeMsg');

    const response = await fetch('/bike/fetch');
    const responseData = await response.json();

    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    if (responseData.success) {
        messageElement.textContent = "Showing all bikes.";

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
        messageElement.textContent = responseData.message || "Failed to load bikes.";
    }
}


// Update bike status by BikeID
async function updateBikeStatus(event) {
    event.preventDefault();

    const bikeID = document.getElementById("updateBikeID").value.trim();
    const newStatus = document.getElementById("updateStatus").value;
    const messageElement = document.getElementById("updateBikeMsg");

    const response = await fetch("/bike/update-status", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ bikeID, newStatus })
    });

    const responseData = await response.json();
    messageElement.textContent = responseData.message || "Request completed.";
}

// Search bikes by Status Brand and Postal Code
async function searchBikes(event) {
    event.preventDefault();

    const status = document.getElementById("searchStatus").value;
    const brand = document.getElementById("searchBrand").value;
    const postalCode = document.getElementById("searchPostalCode").value;

    const response = await fetch("/bike/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status, brand, postalCode })
    });

    const responseData = await response.json();
    const tableBody = document.querySelector("#searchBikeTable tbody");

    tableBody.innerHTML = "";

    if (responseData.success) {
        const rows = responseData.data;

        if (!rows || rows.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7">No matching bikes found</td></tr>`;
            return;
        }

        rows.forEach(row => {
            const tr = document.createElement("tr");

            row.forEach(value => {
                const td = document.createElement("td");
                td.textContent = value;
                tr.appendChild(td);
            });

            tableBody.appendChild(tr);
        });
    } else {
        tableBody.innerHTML = `<tr><td colspan="7">Error searching bikes</td></tr>`;
    }
}

// Count bikes per station
async function countBikesPerStation() {
    const response = await fetch("/bike/count-per-station", {
        method: "GET"
    });

    const responseData = await response.json();
    const tableBody = document.querySelector("#groupByBikeTable tbody");

    tableBody.innerHTML = "";

    if (responseData.success) {
        const rows = responseData.data;

        if (!rows || rows.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="3">No data</td></tr>`;
            return;
        }

        rows.forEach(row => {
            const tr = document.createElement("tr");

            row.forEach(value => {
                const td = document.createElement("td");
                td.textContent = value;
                tr.appendChild(td);
            });

            tableBody.appendChild(tr);
        });
    } else {
        tableBody.innerHTML = `<tr><td colspan="3">Error loading grouped bike counts</td></tr>`;
    }
}

// ==================== Issue-Related Frontend Functions ====================
//Delete Issue by ID
async function deleteIssue(event) {
    event.preventDefault();

    const issueId = document.getElementById("deleteIssueId").value;

    const response = await fetch("/issue/delete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ issueId })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById("deleteIssueMsg");

    if (responseData.success) {
        messageElement.textContent = "Issue deleted successfully!";
    } else {
        messageElement.textContent = "Error deleting issue!";
    }
}

//Project Issues by Atrributes
async function runProjection(event) {
    event.preventDefault();

    const checkboxes = document.querySelectorAll("#projectionForm input:checked");

    const attributes = Array.from(checkboxes).map(cb => cb.value);

    if (attributes.length === 0) {
        alert("Please select at least one attribute");
        return;
    }


    const response = await fetch("/issue/projection", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ attributes })
    });

    const responseData = await response.json();
    const tableBody = document.querySelector("#projectionTable tbody");
    const headerRow = document.getElementById("projectionHeader");


    tableBody.innerHTML = "";
    headerRow.innerHTML = "";


    attributes.forEach(attr => {
        const th = document.createElement("th");
        th.textContent = attr;
        headerRow.appendChild(th);
    });


    const rows = responseData.data;

    if (!rows || rows.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="${attributes.length}">No data</td></tr>`;
        return;
    }

    rows.forEach(row => {
        const tr = document.createElement("tr");

        row.forEach(value => {
            const td = document.createElement("td");
            td.textContent = value;
            tr.appendChild(td);
        });

        tableBody.appendChild(tr);
    });
}

//Return bikeID With many issues
async function BidWIssues() {
    console.log("clicked");

    const response = await fetch(`/issue/bike-many-issues?t=${Date.now()}`);
    const responseData = await response.json();

    console.log("DATA:", responseData);

    const tableBody = document.querySelector("#bikesTable tbody");

    if (!tableBody) {
        console.error("tableBody NOT FOUND");
        return;
    }

    tableBody.innerHTML = "";

    if (responseData.success) {
        const tuples = responseData.data;

        if (!tuples || tuples.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='2'>No data</td></tr>";
            return;
        }

        tuples.forEach(row => {
            const tr = document.createElement("tr");

            const td1 = document.createElement("td");
            td1.textContent = row[0];

            const td2 = document.createElement("td");
            td2.textContent = row[1];

            tr.appendChild(td1);
            tr.appendChild(td2);

            tableBody.appendChild(tr);
        });
    }
}

// ==================== Task/Technician-related Frontend Functions ====================
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
        messageElement.textContent = responseData.message || "Insert failed.";
    }
}

// Get tasks by technician id
async function getTasksByTechnicianID(event) {
    event.preventDefault();
    
    const TechnicianID = document.getElementById('queryTechnicianID').value;

    const response = await fetch(`/technician/tasks?TechnicianID=${TechnicianID}`, {
        method: 'GET'
    });

    const responseData = await response.json();

    const messageElement = document.getElementById('queryResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Here are the tasks assigned to this technician";
        
        const tableElement = document.getElementById('queryTable');
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
    const tableElement = document.getElementById('aboveAvgWorkloadTable');

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

    const tableElement = document.getElementById('workOnAllTable');
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

// fetch technician
async function fetchTechnician() {
    const tableElement = document.getElementById('Technician');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/technician/fetch');
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

// delete maintenance task
async function deleteMaintenanceTask(event) {
    event.preventDefault();
    const TaskID = document.getElementById('deleteTaskID').value;
    const messageElement = document.getElementById("deleteTaskMsg");
    
    const response = await fetch("/maintenance-task/delete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ TaskID })
    });

    const data = await response.json();

    if (data.success) {
        messageElement.textContent = "Task deleted successfully!";
        fetchMaintenanceTask();
    } else {
        messageElement.textContent = data.message;
    }
}


// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function() {
    checkDbConnection();

    document.getElementById("insertStationForm").addEventListener("submit", insertStation);
    document.getElementById("showStationsBtn").addEventListener("click", fetchStations);
    document.getElementById("insertBikeForm").addEventListener("submit", insertBike);
    document.getElementById("showBikesBtn").addEventListener("click", fetchBikes);
    document.getElementById("updateBikeForm").addEventListener("submit", updateBikeStatus);
    document.getElementById("searchBikeForm").addEventListener("submit", searchBikes);
    document.getElementById("countBikesBtn").addEventListener("click", countBikesPerStation);

    document.getElementById("BidWIssues").addEventListener("click", BidWIssues);
    document.getElementById("deleteIssueForm").addEventListener("submit", deleteIssue);
    document.getElementById("projectionForm").addEventListener("submit", runProjection);

    fetchMaintenanceTask();
    fetchTechnician();
    document.getElementById("insertMaintenanceTask").addEventListener("submit", insertMaintenanceTask);
    document.getElementById("getTasksByTechnicianID").addEventListener("submit", getTasksByTechnicianID);
    document.getElementById("getTechnicianAboveAverageWorkload").addEventListener("click", getTechnicianAboveAverageWorkload);
    document.getElementById("getTechnicianWorkOnAllTasks").addEventListener("click", getTechnicianWorkOnAllTasks);
    document.getElementById("deleteMaintenanceTask").addEventListener('submit', deleteMaintenanceTask);

};
