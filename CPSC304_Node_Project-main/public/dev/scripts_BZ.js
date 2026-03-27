// Update bike status by BikeID
async function updateBikeStatus(event) {
    event.preventDefault();

    const bikeID = document.getElementById("updateBikeID").value;
    const newStatus = document.getElementById("updateStatus").value;

    const response = await fetch("/bike/update-status", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ bikeID, newStatus })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById("updateBikeMsg");

    if (responseData.success) {
        if (responseData.rowsAffected > 0) {
            messageElement.textContent = "Bike status updated successfully!";
        } else {
            messageElement.textContent = "No bike found with that BikeID.";
        }
    } else {
        messageElement.textContent = responseData.message || "Error updating bike status!";
    }
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
