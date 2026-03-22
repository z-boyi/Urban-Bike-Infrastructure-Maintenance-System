// Note that this file serves as a draft for individual work, containing the endpoints for maintenance related queries

const express = require('express');
const appService = require('../appService');

const router = express.Router();

// endpoint for Insert Query
router.post('/insert-maintenance-task', async (req, res) => {
    const { TaskID, MaintenanceID, TechnicianID } = req.body;
    const insertResult = await appService.insertMaintenanceTask(TaskID, MaintenanceID, TechnicianID);
    if (insertResult) {
        res.json({ success: true});
    } else {
        res.status(500).json({ success: false})
    }
});

// endpoint for Join Query
router.get('/get-tasks-by-technician', async(req, res) => {
    const { TechnicianID } = req.query;
    const queryResult = await appService.getTasksByTechnicianID( TechnicianID);
    if (queryResult.success) {
        res.json({ 
            success: true,
            data: queryResult.data,
            message: queryResult.message
        });
    } else {
        res.status(400).json({
            success: false,
            message: queryResult.message
        });
    }
})

// endpoint for nested aggregation query
router.get('/get-technician-above-average-workload', async(req, res) => {
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
        })
    }
})

module.exports = router;