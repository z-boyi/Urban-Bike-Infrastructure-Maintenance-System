// Insert Query
async function insertMaintenanceTask(TaskID, MaintenanceID, TechnicianID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO MaintenanceTask (TaskID, MaintenanceID, TechnicianID) VALUES(:TaskID, :MaintenanceID, :TechnicianID)`,
            { TaskID, MaintenanceID, TechnicianID },
            { autoCommit: true }
        );

        return {success: result.rowsAffected && result.rowsAffected > 0};
    }).catch((error) => {
        if (error.errorNum === 2291) {
            return { success: false, message: "MaintenanceID or TechnicianID does not exist." };
        }
        return { success: false, message: "Insert failed." };
    });
}