// UPDATE ENDPOINT
router.post("/update-bike-status", async (req, res) => {
    const { bikeID, newStatus } = req.body;

    const result = await updateBikeStatus(bikeID, newStatus);

    if (result.success && result.rowsAffected > 0) {
        res.json({
            success: true,
            message: "Bike status updated successfully."
        });
    } else if (result.success && result.rowsAffected === 0) {
        res.json({
            success: false,
            message: "No bike found with that BikeID."
        });
    } else {
        res.status(500).json({
            success: false,
            message: result.error,
            details: result.details
        });
    }
});

// SELECTION ENDPOINT
router.get("/search-bikes", async (req, res) => {
    const { status, brand, postalCode } = req.query;

    const result = await searchBikes(status, brand, postalCode);

    if (result.success) {
        res.json({
            success: true,
            data: result.data
        });
    } else {
        res.status(500).json({
            success: false,
            message: result.error,
            details: result.details
        });
    }
});