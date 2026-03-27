//add endpoint -RT
router.post("/delete-issue", async (req, res) => {
    const { issueId } = req.body;

    const deleteResult = await appService.deleteIssueRecord(issueId);

    if (deleteResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});
router.post("/issue-projection", async (req, res) => {
    const { attributes } = req.body;

    const tableContent = await appService.getSelectedIssueAttributes(attributes);

    res.json({ data: tableContent });
});
router.get("/bikes-many-issues", async (req, res) => {
    const tableContent = await appService.getBikesWithManyIssues();

    if (tableContent) {
        res.json({
            success: true,
            data: tableContent
        });
    } else {
        res.status(500).json({
            success: false,
            data: []
        });
    }
});


module.exports = router;