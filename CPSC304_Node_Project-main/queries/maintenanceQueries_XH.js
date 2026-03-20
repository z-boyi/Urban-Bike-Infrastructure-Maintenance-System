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
            SELECT T.StaffID, S.Name, MT.TaskID, M.MaintenanceID, M.PriorityLevel, M.CompletionStatus, M.RepairQuotation
            FROM Technician T
            JOIN Staff S
                ON T.StaffID = S.StaffID
            JOIN MaintenanceTask MT 
                ON T.StaffID = MT.TechnicianID
            JOIN Maintenance M 
                ON MT.MaintenanceID = M.MaintenanceID
            WHERE T.StaffID = :TechnicianID
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

// Nested Aggregation Query (Hardcoded Query)
async function getTechnicianAboveAverageWorkload() {
    return await withOracleDB(async (connection) => {
    const result = await connection.execute(
        `
        SELECT S.StaffID, S.Name, COUNT(*) AS NumberOfTask
        FROM Staff S, Technician T, MaintenanceTask MT
        WHERE S.StaffID = T.StaffID AND MT.TechnicianID = T.StaffID
        GROUP BY S.StaffID, S.Name
        HAVING COUNT(MT.TaskID) > 
            (SELECT AVG(NumberOfTask)
            FROM 
                (SELECT COUNT(*) As NumberOfTask
                FROM MaintenanceTask
                GROUP BY TechnicianID
                )
            );
        `
    )
    
    return { success: true, data: result.rows, columns: result.metaData.map(col => col.name)};

    }).catch(() => {
        return { success: false, message: "Query failed." };
    });
}