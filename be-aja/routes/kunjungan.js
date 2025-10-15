// be-aja/routes/kunjungan.js
const express = require('express');
const router = express.Router();
const { 
    submitKunjungan,
    getAllKunjungan,
    getKunjunganById,
    updateStatusKunjungan,
    deleteKunjungan
} = require('../controllers/kunjunganController');
const uploadMiddleware = require('../middleware/upload'); 

// Public route - Submit form kunjungan
router.post('/', uploadMiddleware.upload.single('file_pengantar'), submitKunjungan);

// Admin routes - Get data kunjungan
router.get('/', getAllKunjungan);
router.get('/:id', getKunjunganById);
router.put('/:id/status', updateStatusKunjungan);
router.delete('/:id', deleteKunjungan);

module.exports = router;