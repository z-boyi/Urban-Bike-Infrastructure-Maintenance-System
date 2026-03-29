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

//这几个statement要加到scripts的window.onload = function()里面去
window.onload = function() {
    //............
    //
    document.getElementById("BidWIssues").addEventListener("click", BidWIssues);
    //
    document.getElementById("deleteIssueForm").addEventListener("submit", deleteIssue);
    //
    document.getElementById("projectionForm").addEventListener("submit", runProjection);
};