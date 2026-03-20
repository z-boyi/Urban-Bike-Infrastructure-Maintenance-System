// Update Query
// Update a bike's status by BikeID 
async function updateBikeStatus(bikeID, newStatus) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE Bike SET Status = :newStatus WHERE BikeID = :bikeID`,
            [newStatus, bikeID],
            { autoCommit: true }
        );

        return result.rowsAffected;
    }).catch((err) => {
        console.error("Error in updateBikeStatus:", err);
        return -1;
    });
}