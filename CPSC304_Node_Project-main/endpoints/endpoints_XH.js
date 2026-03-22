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

module.exports = router;