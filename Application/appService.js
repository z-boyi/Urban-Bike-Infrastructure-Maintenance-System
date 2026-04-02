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
// INSERT Query: Insert Bike Station
async function insertStation(StreetAddress, PostalCode, StationName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `
            INSERT INTO BikeStation (StreetAddress, PostalCode, StationName)
            VALUES (:StreetAddress, :PostalCode, :StationName)
            `,
            { StreetAddress, PostalCode, StationName },
            { autoCommit: true }
        );

        return { success: result.rowsAffected && result.rowsAffected > 0 };

    }).catch((error) => {
        console.error("INSERT STATION ERROR:", error);

        if (error.errorNum === 1) {
            return { success: false, message: "Station already exists." };
        }

        if (error.errorNum === 1400) {
            return { success: false, message: "Missing required field." };
        }

        if (error.errorNum === 12899) {
            return { success: false, message: "Input value too long." };
        }

        return { success: false, message: "Insert station failed." };
    });
}

// fetch the BikeStation table
async function fetchStations() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `
            SELECT StreetAddress, PostalCode, StationName
            FROM BikeStation
            ORDER BY PostalCode, StreetAddress
            `
        );

        return {
            success: true,
            data: result.rows,
            columns: result.metaData.map(col => col.name)
        };
    }).catch((error) => {
        console.error("FETCH STATIONS ERROR");
        console.error("Message:", error.message);

        return {
            success: false,
            message: "Failed to fetch stations."
        };
    });
}

// Delete Station
async function deleteStation(StreetAddress, PostalCode) {
    return await withOracleDB(async (connection) => {

        const result = await connection.execute(
            `
            DELETE FROM BikeStation
            WHERE StreetAddress = :StreetAddress
              AND PostalCode = :PostalCode
            `,
            { StreetAddress, PostalCode },
            { autoCommit: true }
        );

        if (result.rowsAffected > 0) {
            return { success: true };
        } else {
            return { success: false, message: "Station not found." };
        }

    }).catch((err) => {
        console.error("DELETE STATION ERROR:", err);

        if (err.errorNum === 2292) {
            return {
                success: false,
                message: "Cannot delete station because bikes exist at this station."
            };
        }

        return {
            success: false,
            message: "Delete station failed."
        };
    });
}

// INSERT Query: Insert Bike
async function insertBike(BikeID, Brand, LastServiceDate, DeploymentDate, Status, StreetAddress, PostalCode) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `
            INSERT INTO Bike 
            (BikeID, Brand, LastServiceDate, DeploymentDate, Status, StreetAddress, PostalCode)
            VALUES (
                :BikeID,
                :Brand,
                TO_DATE(:LastServiceDate, 'YYYY-MM-DD'),
                TO_DATE(:DeploymentDate, 'YYYY-MM-DD'),
                :Status,
                :StreetAddress,
                :PostalCode
    )
            `,
            { BikeID, Brand, LastServiceDate, DeploymentDate, Status, StreetAddress, PostalCode },
            { autoCommit: true }
        );

        return {
            success: result.rowsAffected && result.rowsAffected > 0,
            rowsAffected: result.rowsAffected
        };

    }).catch((error) => {
        console.error("INSERT BIKE ERROR");
        console.error("Input:", {
            BikeID,
            Brand,
            LastServiceDate,
            DeploymentDate,
            Status,
            StreetAddress,
            PostalCode
        });
        console.error("Oracle error number:", error.errorNum);
        console.error("Oracle message:", error.message);

        if (error.errorNum === 1) {
            return {
                success: false,
                message: "BikeID already exists.",
                errorCode: error.errorNum,
                details: error.message
            };
        }

        if (error.errorNum === 2291) {
            return {
                success: false,
                message: "Station does not exist. Please use an existing StreetAddress and PostalCode.",
                errorCode: error.errorNum,
                details: error.message
            };
        }

        if (error.errorNum === 1400) {
            return {
                success: false,
                message: "A required field is missing.",
                errorCode: error.errorNum,
                details: error.message
            };
        }

        if (error.errorNum === 12899) {
            return {
                success: false,
                message: "One of the input values is too long.",
                errorCode: error.errorNum,
                details: error.message
            };
        }

        if (error.errorNum === 1840 || error.errorNum === 1861) {
            return {
                success: false,
                message: "Date format is invalid.",
                errorCode: error.errorNum,
                details: error.message
            };
        }

        return {
            success: false,
            message: "Insert failed due to a database error.",
            errorCode: error.errorNum || null,
            details: error.message
        };
    });
}

// fetch the Bike table
async function fetchBikes() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `
            SELECT BikeID, Brand, 
            TO_CHAR(LastServiceDate, 'YYYY-MM-DD') AS LastServiceDate,
            TO_CHAR(DeploymentDate, 'YYYY-MM-DD') AS DeploymentDate, 
            Status, StreetAddress, PostalCode
            FROM Bike
            ORDER BY BikeID
            `
        );

        return {
            success: true,
            data: result.rows,
            columns: result.metaData.map(col => col.name)
        };
    }).catch((error) => {
        console.error("FETCH BIKES ERROR");
        console.error("Message:", error.message);

        return {
            success: false,
            message: "Failed to fetch bikes."
        };
    });
}

// Delete Bike
async function deleteBike(BikeID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `
            DELETE FROM Bike
            WHERE BikeID = :BikeID
            `,
            { BikeID },
            { autoCommit: true }
        );

        if (result.rowsAffected > 0) {
            return { success: true };
        } else {
            return { success: false, message: "Bike not found." };
        }
    }).catch((err) => {
        console.error("DELETE BIKE ERROR:", err);

        if (err.errorNum === 2292) {
            return {
                success: false,
                message: "Cannot delete bike because related records exist."
            };
        }

        return {
            success: false,
            message: "Delete bike failed."
        };
    });
}


async function updateBikeStatus(bikeID, newStatus) {
    return await withOracleDB(async (connection) => {
        // Step 1: check whether bike exists
        const checkResult = await connection.execute(
            `
            SELECT Status
            FROM Bike
            WHERE TRIM(UPPER(BikeID)) = TRIM(UPPER(:bikeID))
            `,
            { bikeID }
        );

        if (checkResult.rows.length === 0) {
            return {
                success: false,
                errorType: "NOT_FOUND",
                message: "No bike found with that BikeID."
            };
        }

        const currentStatus = checkResult.rows[0][0];

        // Step 2: optional check if status is unchanged
        if (currentStatus === newStatus) {
            return {
                success: false,
                errorType: "NO_CHANGE",
                message: "Bike already has this status."
            };
        }

        // Step 3: update
        const result = await connection.execute(
            `
            UPDATE Bike
            SET Status = :newStatus
            WHERE TRIM(UPPER(BikeID)) = TRIM(UPPER(:bikeID))
            `,
            { newStatus, bikeID },
            { autoCommit: true }
        );

        return {
            success: true,
            rowsAffected: result.rowsAffected,
            message: "Bike status updated successfully."
        };

    }).catch((err) => {
        console.error("UPDATE ERROR (Bike Status)");
        console.error("BikeID:", bikeID, "| NewStatus:", newStatus);
        console.error("Message:", err.message);

        if (err.errorNum === 2290) {
            return {
                success: false,
                errorType: "INVALID_STATUS",
                message: "This status is not allowed by the database.",
                details: err.message
            };
        }

        return {
            success: false,
            errorType: "DB_ERROR",
            message: "Failed to update bike status.",
            details: err.message
        };
    });
}

// Selection Query: Search bikes by optional filters: status, brand, postal code
async function searchBikes(status, brand, postalCode) {
    return await withOracleDB(async (connection) => {
        let query = `
            SELECT BikeID, Brand, TO_CHAR(LastServiceDate, 'YYYY-MM-DD') AS LastServiceDate, TO_CHAR(DeploymentDate, 'YYYY-MM-DD') AS DeploymentDate, Status, StreetAddress, PostalCode
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

        return {
            success: true,
            data: result.rows,
            columns: result.metaData.map(col => col.name)
        };
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

        
        return { success: true, data: result.rows};

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
        return {success: true, data: result.rows};

    }).catch((err) => {
        console.error(err);
        return {success: true, data: []};
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
            HAVING COUNT(*) >= 1
            `
        );

        return {success: true, data: result.rows};
    }).catch((err) => {
        console.error(err);
        return {success: false, data: []};
    });
}

// additional queries for issue
// fetch issue table
async function fetchIssue() {
    return await withOracleDB(async (connection) => {
    const result = await connection.execute(
            `
            SELECT 
                IssueID, 
                TO_CHAR(ReportTime, 'YYYY-MM-DD HH24:MI:SS') AS ReportTime, 
                ConditionScore, 
                BikeID, 
                InspectorID
            FROM IssueRecord
            ORDER BY IssueID
            `
    )

    return { success: true, data: result.rows, columns: result.metaData.map(col => col.name) };

    }).catch(() => {
        return { success: false, message: "Query failed." };
    })
}

// insert issue
async function insertIssue(IssueID, BikeID, Description, InspectorID) {
    return await withOracleDB(async (connection) => {
        const bikeCheck = await connection.execute(
            `SELECT 1 FROM Bike WHERE BikeID = :BikeID`,
            { BikeID }
        );
        if (bikeCheck.rows.length === 0) {
            return { success: false, message: "BikeID does not exist." };
        }

        const ruleResult = await connection.execute(
            `SELECT ConditionScore 
             FROM IssueRule 
             WHERE Description = :Description`,
            { Description }
        );

        if (ruleResult.rows.length === 0) {
            return {
                success: false,
                message: "Invalid issue type (Description not found)."
            };
        }

        const ConditionScore = ruleResult.rows[0][0];

        const inspectorCheck = await connection.execute(
            `SELECT 1 FROM Inspector WHERE StaffID = :InspectorID`,
            { InspectorID }
        );
        if (inspectorCheck.rows.length === 0) {
            return { success: false, message: "InspectorID does not exist." };
        }

        const result = await connection.execute(
            `
            INSERT INTO IssueRecord 
            (IssueID, ReportTime, ConditionScore, Description, BikeID, InspectorID)
            VALUES 
            (:IssueID, CURRENT_TIMESTAMP, :ConditionScore, :Description, :BikeID, :InspectorID)
            `,
            { IssueID, ConditionScore, Description, BikeID, InspectorID },
            { autoCommit: true }
        );

        return {
            success: result.rowsAffected > 0,
            message: "Issue inserted successfully."
        };

    }).catch((err) => {

        console.error("Insert Issue Error:", err.message);

        if (err.errorNum === 1) {
            return { success: false, message: "IssueID already exists." };
        }

        if (err.errorNum === 2291) {
            return { 
                success: false, 
                message: "Foreign key violation (BikeID or InspectorID invalid)." 
            };
        }

        return { success: false, message: "Insert failed." };
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

    }).catch((err) => {
        if (err.errorNum === 1) {
            return { success: false, message: "TaskID already exists." };
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
            SELECT T.StaffID, S.Name, MT.TaskID, M.MaintenanceID
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
            return { success: true, data: [], message: "Technician exists but has no tasks."}
        }
        
        return {success: true, data: result.rows, columns: result.metaData.map(col => col.name), message: "Here are the tasks assgined to this technician:"};

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
    if (result.rows.length === 0) {
        return { success: true, data: result.rows, columns: result.metaData.map(col => col.name), message: "No technicians work above average workload."}
    }
    
    return { success: true, data: result.rows, columns: result.metaData.map(col => col.name), message: "Technicians work above average workload:"};

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
    if (result.rows.length === 0) {
        return { success: true, data: result.rows, columns: result.metaData.map(col => col.name), message: "No technicians work on all tasks."}
    }
    
    return { success: true, data: result.rows, columns: result.metaData.map(col => col.name), message: "Technician who works on all tasks:"};

    }).catch(() => {
        return { success: false, message: "Query failed." };
    });
}

// Additional queries for better functionality

// fetch the maintence task table
async function fetchMaintenanceTask() {
    return await withOracleDB(async (connection) => {
    const result = await connection.execute(
            `
            SELECT 
                TaskID,
                MaintenanceID,
                SUBSTR(TO_CHAR(Duration), 5, 8) AS Duration,
                TO_CHAR(StartTime, 'YYYY-MM-DD HH24:MI:SS') AS StartTime,
                TO_CHAR(EndTime, 'YYYY-MM-DD HH24:MI:SS') AS EndTime,
                TechnicianID
            FROM MaintenanceTask
            ORDER BY TaskID
            `
    )

    return {success: true, data: result.rows, columns: result.metaData.map(col => col.name)};

    }).catch(() => {
        return { success: false, message: "Query failed." };
    })
}

// fetch the technician table
async function fetchTechnician() {
    return await withOracleDB(async (connection) => {
    const result = await connection.execute(
            `
            SELECT StaffID, Name, Contact, DBMS_LOB.SUBSTR(AssignedArea, 100, 1) AS AssignedArea
            FROM Staff
            WHERE StaffID IN (SELECT StaffID FROM Technician)
            `
    )

    return { success: true, data: result.rows, columns: result.metaData.map(col => col.name) };

    }).catch(() => {
        return { success: false, message: "Query failed." };
    })
}

// delete maintenace task
async function deleteMaintenanceTask(TaskID) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM MaintenanceTask WHERE TaskID = :TaskID`,
            [ TaskID ],
            { autoCommit: true }
        );

        if (result.rowsAffected > 0) {
            return { success: true };
        } else {
            return { success: false, message: "TaskID does not exist." };
        }

    }).catch(() => {
        return { success: false, message: "Delete failed." };
    });
}

// update task status (i.e., task complete)
async function updateTaskStatus(TaskID) {
    return await withOracleDB(async (connection) => {
        // check existence of the given task id
        const checkExistence = await connection.execute(
            `
            SELECT 1
            FROM MaintenanceTask MT
            WHERE MT.TaskID = :TaskID
            `,
            { TaskID },
        );
        if (checkExistence.rows.length === 0) {
            return { success: false, message: "TaskID does not exist."};
        } 

        // update status
        const result = await connection.execute(
            `
            UPDATE MaintenanceTask
            SET EndTime = CURRENT_TIMESTAMP,
            Duration = CURRENT_TIMESTAMP - StartTime
            WHERE TaskID = :TaskID AND EndTime IS NULL
            `,
            { TaskID },
            { autoCommit: true }
        );
        return { success: true, message: "Task is updated successfully"};
    }).catch(() => {
        return { success: false, message: "Update failed." };
    });
}

module.exports = {
    fetchBikes,
    testOracleConnection,
    insertStation,
    fetchStations,
    deleteStation,
    insertBike,
    fetchBikes,
    deleteBike,
    updateBikeStatus,
    searchBikes,
    countBikesPerStation,

    deleteIssueRecord,
    getSelectedIssueAttributes,
    getBikesWithManyIssues,
    fetchIssue,
    insertIssue,

    insertMaintenanceTask,
    getTasksByTechnicianID,
    getTechnicianAboveAverageWorkload,
    getTechnicianWorkOnAllTasks,
    fetchMaintenanceTask,
    fetchTechnician,
    deleteMaintenanceTask,
    updateTaskStatus
};
