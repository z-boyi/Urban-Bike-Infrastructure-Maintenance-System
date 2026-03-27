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
