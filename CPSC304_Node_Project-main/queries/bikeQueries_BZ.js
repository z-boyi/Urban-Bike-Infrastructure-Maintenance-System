// UPDATE QUERY
// Update a bike's status by BikeID 
async function updateBikeStatus(bikeID, newStatus) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `
            UPDATE Bike 
            SET Status = :newStatus 
            WHERE BikeID = :bikeID
            `,
            [newStatus, bikeID],
            { autoCommit: true }
        );

        return result.rowsAffected;
    }).catch((err) => {
        console.error("Error in updateBikeStatus:", err);
        return -1;
    });
}

// SELECTION QUERY
// Search bikes by optional filters: status, brand, postal code
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
        console.error("Error in searchBikes:", err);
        return [];
    });
}

// GROUP BY QUERY
// Count number of bikes at each station
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
        console.error("Error in countBikesPerStation:", err);
        return [];
    });
}