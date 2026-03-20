// INSERT Query
async function insertMaintenanceTask(TaskID, MaintenanceID, TechnicianID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `
            INSERT INTO MaintenanceTask (TaskID, MaintenanceID, TechnicianID) 
            VALUES(:TaskID, :MaintenanceID, :TechnicianID)
            `,
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

// JOIN Query
async function getTasksByTechnicianID(TechnicianID) {
    return await withOracleDB(async (connection) => {

        // Check if the TechnicianID exists
        const checkExistence = await connection.execute(
            `
            SELECT *
            FROM Technician T
            WHERE T.StaffID = TechnicianID
            `,
            { TechnicianID } 
        );
        if (checkExistence.rows.length === 0) {
            return { success: false, message: "TechnicianID does not exist."};
        } 

        // Find tasks with information associate with this technician
        const result = await connection.execute(
            `
            SELECT T.StaffID, MT.TaskID, M.MaintenanceID, M.PriorityLevel, M.CompletionStatus, M.RepairQuotation
            FROM Technician T
            JOIN MaintenanceTask MT 
                ON T.StaffID = MT.TechnicianID
            JOIN Maintenance M 
                ON MT.TaskID = M.TaskID
            WHERE StaffID = :TechnicianID
            `,
            { TechnicianID },
        );
        if (result.rows.length === 0) {
            return { success: true, message: "Technician exists but has no tasks."}
        }
        return {success: true, data: result.rows};
    }).catch(() => {
        if (error.errorNum === 2291) {
            return { success: false, message: "Query failed" };
        }
    });
}