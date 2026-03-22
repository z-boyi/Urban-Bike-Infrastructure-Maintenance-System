//Delete selected Issue
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


//PROJECTION: Select IssueRecord's attributes
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


//HAVING: Bikes with many issues
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


module.exports = {
    deleteIssueRecord,
    getSelectedIssueAttributes,
    getBikesWithManyIssues
};