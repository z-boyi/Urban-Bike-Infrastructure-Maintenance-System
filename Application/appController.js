const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

router.post('/station/insert', async (req, res) => {
    const { StreetAddress, PostalCode, StationName } = req.body;

    const result = await appService.insertStation(
        StreetAddress,
        PostalCode,
        StationName
    );

    if (result.success) {
        res.json({
            success: true,
            message: "Station inserted successfully."
        });
    } else {
        res.status(500).json({
            success: false,
            message: result.message
        });
    }
});

router.get('/station/fetch', async (req, res) => {
    const queryResult = await appService.fetchStations();

    if (queryResult.success) {
        res.json({
            success: true,
            data: queryResult.data,
            columns: queryResult.columns
        });
    } else {
        res.status(500).json({
            success: false,
            message: queryResult.message
        });
    }
});

router.post('/bike/insert', async (req, res) => {
    const { BikeID, Brand, LastServiceDate, DeploymentDate, Status, StreetAddress, PostalCode } = req.body;

    const insertResult = await appService.insertBike(
        BikeID, Brand, LastServiceDate, DeploymentDate, Status, StreetAddress, PostalCode
    );

    if (insertResult.success) {
        res.json({
            success: true,
            message: "Bike inserted successfully."
        });
    } else {
        res.status(500).json({
            success: false,
            message: insertResult.message,
            errorCode: insertResult.errorCode,
            details: insertResult.details
        });
    }
});

router.get('/bike/fetch', async (req, res) => {
    const queryResult = await appService.fetchBikes();

    if (queryResult.success) {
        res.json({
            success: true,
            data: queryResult.data,
            columns: queryResult.columns
        });
    } else {
        res.status(500).json({
            success: false,
            message: queryResult.message
        });
    }
});

router.post("/bike/update-status", async (req, res) => {
    const { bikeID, newStatus } = req.body;
    const result = await appService.updateBikeStatus(bikeID, newStatus);

    if (result.success) {
        res.json({
            success: true,
            message: result.message,
            rowsAffected: result.rowsAffected
        });
    } else {
        res.json({
            success: false,
            message: result.message,
            errorType: result.errorType || null,
            details: result.details || null
        });
    }
});

router.get("/bike/search", async (req, res) => {
    const { status, brand, postalCode } = req.query;
    const result = await appService.searchBikes(status, brand, postalCode);
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

router.get("/bike/count-per-station", async (req, res) => {
    const result = await appService.countBikesPerStation();
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

router.post("/issue/delete", async (req, res) => {
    const { issueId } = req.body;
    const deleteResult = await appService.deleteIssueRecord(issueId);
    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/issue/projection", async (req, res) => {
    const { attributes } = req.body;
    const tableContent = await appService.getSelectedIssueAttributes(attributes);
    res.json({ 
        data: tableContent 
    });
});

router.get("/issue/bike-many-issues", async (req, res) => {
    const tableContent = await appService.getBikesWithManyIssues();
    if (tableContent) {
        res.json({
            success: true,
            data: tableContent
        });
    } else {
        res.status(500).json({
            success: false,
            data: []
        });
    }
});

router.post('/maintenance-task/insert', async (req, res) => {
    const { TaskID, MaintenanceID, TechnicianID } = req.body;
    const insertResult = await appService.insertMaintenanceTask(TaskID, MaintenanceID, TechnicianID);
    res.json(insertResult);
});

router.get('/technician/tasks', async(req, res) => {
    const { TechnicianID } = req.query;
    const queryResult = await appService.getTasksByTechnicianID(TechnicianID);
    if (queryResult.success) {
        res.json({ 
            success: true,
            data: queryResult.data,
            columns: queryResult.columns,
            message: queryResult.message
        });
    } else {
        res.status(400).json({
            success: false,
            message: queryResult.message
        });
    }
});

router.get('/technician/above-average-workload', async(req, res) => {
    const queryResult = await appService.getTechnicianAboveAverageWorkload();
    if (queryResult.success) {
        res.json({
            success: true,
            data: queryResult.data,
            columns: queryResult.columns
        });
    } else {
        res.json({
            success: false,
            message: queryResult.message
        });
    }
});

router.get('/technician/working-on-all-tasks', async(req, res) => {
    const queryResult = await appService.getTechnicianWorkOnAllTasks();
    if (queryResult.success) {
        res.json({
            success: true,
            data: queryResult.data,
            columns: queryResult.columns
        });
    } else {
        res.json({
            success: false,
            message: queryResult.message
        });
    }
});

router.get('/maintenance-task/fetch', async(req, res) => {
    const queryResult = await appService.fetchMaintenanceTask();
    if (queryResult.success) {
        res.json({
            success: true,
            data: queryResult.data,
            columns: queryResult.columns
        });
    } else {
        res.json({
            success: false,
            message: queryResult.message
        });
    }
})

router.get('/technician/fetch', async(req, res) => {
    const queryResult = await appService.fetchTechnician();
    if (queryResult.success) {
        res.json({
            success: true,
            data: queryResult.data,
            columns: queryResult.columns
        });
    } else {
        res.json({
            success: false,
            message: queryResult.message
        });
    }
})

router.post("/maintenance-task/delete", async (req, res) => {
    const { TaskID } = req.body;
    const deleteResult = await appService.deleteMaintenanceTask(TaskID);
    res.json(deleteResult);
});


module.exports = router;