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
    } else {
        messageElement.textContent = "Error inserting data!";
    }
}

// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function() {
    checkDbConnection();
    fetchTableData();
    document.getElementById("resetDemotable").addEventListener("click", resetDemotable);
    document.getElementById("insertDemotable").addEventListener("submit", insertDemotable);
    document.getElementById("updataNameDemotable").addEventListener("submit", updateNameDemotable);
    document.getElementById("countDemotable").addEventListener("click", countDemotable);
};

// General function to refresh the displayed table data. 
// You can invoke this after any table-modifying operation to keep consistency.
function fetchTableData() {
    fetchAndDisplayUsers();
}
