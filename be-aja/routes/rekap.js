// be-aja/routes/rekap.js
const express = require('express');
const router = express.Router();
const { generateRekapPDF, getAvailableMonths } = require('../controllers/rekapController');

// Get available months untuk dropdown
router.get('/available-months', getAvailableMonths);

// Generate PDF rekap
router.get('/pdf', generateRekapPDF);

module.exports = router;