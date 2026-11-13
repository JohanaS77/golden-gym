const express = require('express');
const router = express.Router();

// GET /api/festivos/2026 -> lista de fechas festivas (YYYY-MM-DD)
router.get('/:anio', async (req, res) => {
    const { getHolidaysByYear } = await import('colombian-holidays/getHolidaysByYear');
    res.json(getHolidaysByYear(Number(req.params.anio)).map(f => f.celebrationDate));
});

module.exports = router;