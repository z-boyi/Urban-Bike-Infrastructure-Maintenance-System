const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

async function fetchBikes() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM Bike');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

// ==================== Bike Queries ====================

// UPDATE QUERY: Update a bike's status by BikeID 
async function updateBikeStatus(bikeID, newStatus) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `
            UPDATE Bike 
            SET Status = :newStatus 
            WHERE BikeID = :bikeID
            `,
            { newStatus, bikeID },
            { autoCommit: true }
        );

        return {success: true, rowsAffected: result.rowsAffected};
    }).catch((err) => {
        console.error("UPDATE ERROR (Bike Status)");
        console.error("BikeID:", bikeID, "| NewStatus:", newStatus);
        console.error("Message:", err.message);

        return {
            success: false,
            error: "Failed to update bike status",
            details: err.message
        };
    });
}

// Selection Query: Search bikes by optional filters: status, brand, postal code
async function searchBikes(status, brand, postalCode) {
    return await withOracleDB(async (connection) => {
        let query = `
            SELECT BikeID, Brand, LastServiceDate, DeploymentDate, Status, StreetAddress, PostalCode
            FROM Bike
            WHERE 1=1
        `;

        const binds = {};

        if (status) {
            query += ` AND Status = :status`;
            binds.status = status;
        }

        if (brand) {
            query += ` AND Brand = :brand`;
            binds.brand = brand;
        }

        if (postalCode) {
            query += ` AND PostalCode = :postalCode`;
            binds.postalCode = postalCode;
        }

        query += ` ORDER BY BikeID`;

        const result = await connection.execute(query, binds);
        return result.rows;
    }).catch((err) => {
        console.error("SELECTION ERROR (Search Bikes)");
        console.error("Filters:", { status, brand, postalCode });
        console.error("Message:", err.message);

        return {
            success: false,
            error: "Failed to search bikes",
            details: err.message
        };
    });
}

// Group By Query: Count number of bikes at each station
async function countBikesPerStation() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `
            SELECT StreetAddress, PostalCode, COUNT(*) AS BikeCount
            FROM Bike
            GROUP BY StreetAddress, PostalCode
            ORDER BY PostalCode, StreetAddress
            `
        );

        return result.rows;
    }).catch((err) => {
        console.error("GROUP BY ERROR (Bikes Per Station)");
        console.error("Query: COUNT bikes grouped by station");
        console.error("Message:", err.message);

        return {
            success: false,
            error: "Failed to count bikes per station",
            details: err.message
        };
    });
}

// ==================== Issue Queries ====================

// Delete Query: Delete issue record
async function deleteIssueRecord(issueId) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM IssueRecord WHERE IssueID = :issueId`,
            [issueId],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((err) => {
        console.error(err);
        return false;
    });
}

// Projection Query: Select IssueRecord's attributes
async function getSelectedIssueAttributes(attributes) {
    return await withOracleDB(async (connection) => {

        // const validColumns = {
        //     IssueRecord: [
        //         "IssueID",
        //         "ReportTime",
        //         "ConditionScore",
        //         "Description",
        //         "BikeID",
        //         "MaintenanceID",
        //         "InspectorID"
        //     ],
        //     IssueRule: [
        //         "Result"
        //     ]
        // };

        const columnMap = {
            IssueID: "IR.IssueID",
            ReportTime: "IR.ReportTime",
            ConditionScore: "IR.ConditionScore",
            Description: "IR.Description",
            BikeID: "IR.BikeID",
            MaintenanceID: "IR.MaintenanceID",
            InspectorID: "IR.InspectorID",
            Result: "IRL.Result"
        };

        const selectedCols = attributes
            .filter(attr => columnMap[attr])
            .map(attr => columnMap[attr]);

        if (selectedCols.length === 0) {
            throw new Error("No valid attributes selected");
        }

        const query = `
            SELECT ${selectedCols.join(", ")}
            FROM IssueRecord IR
            JOIN IssueRule IRL
            ON IR.ConditionScore = IRL.ConditionScore
            AND IR.Description = IRL.Description
        `;

        const result = await connection.execute(query);
        return result.rows;

    }).catch((err) => {
        console.error(err);
        return [];
    });
}

// Having Query:  Bikes with many issues
async function getBikesWithManyIssues() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `
            SELECT BikeID, COUNT(*) AS IssueCount
            FROM IssueRecord
            GROUP BY BikeID
            HAVING COUNT(*) > 1
            `
        );

        return result.rows;
    }).catch((err) => {
        console.error(err);
        return [];
    });
}

// ==================== Maintenance Queries ====================

// INSERT Query: Insert maintenance task
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

// JOIN Query: Find tasks by Technician
async function getTasksByTechnicianID(TechnicianID) {
    return await withOracleDB(async (connection) => {

        // Check if the TechnicianID exists
        const checkExistence = await connection.execute(
            `
            SELECT *
            FROM Technician T
            WHERE T.StaffID = :TechnicianID
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
        return { success: false, message: "Query failed" };
    });
}

// Nested Aggregation Query: Technicians above average workload
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
            )
        `
    )
    
    return { success: true, data: result.rows, columns: result.metaData.map(col => col.name)};

    }).catch(() => {
        return { success: false, message: "Query failed." };
    });
}

// Division Query: Technicians working on all maintenance jobs
async function getTechnicianWorkOnAllTasks() {
    return await withOracleDB(async (connection) => {
    const result = await connection.execute(
        `
        SELECT S.StaffID, S.name
        FROM Staff S, Technician T
        WHERE S.StaffID = T.StaffID 
            AND NOT EXISTS (
                (SELECT MT.TaskID
                FROM MaintenanceTask MT)
                MINUS
                (SELECT MT2.TaskID
                FROM MaintenanceTask MT2
                WHERE MT2.TechnicianID = T.StaffID)
            )
        `
    )
    
    return { success: true, data: result.rows, columns: result.metaData.map(col => col.name)};

    }).catch(() => {
        return { success: false, message: "Query failed." };
    });
}


module.exports = {
    fetchBikes,
    testOracleConnection,
    updateBikeStatus,
    searchBikes,
    countBikesPerStation,
    deleteIssueRecord,
    getSelectedIssueAttributes,
    getBikesWithManyIssues,
    insertMaintenanceTask,
    getTasksByTechnicianID,
    getTechnicianAboveAverageWorkload,
    getTechnicianWorkOnAllTasks
};
