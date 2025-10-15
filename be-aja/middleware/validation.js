const { body, validationResult } = require('express-validator');

const validateKunjungan = [
  body('nama_institusi')
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Nama institusi must be between 2-255 characters'),
  
  body('kebutuhan_kunjungan')
    .notEmpty()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Kebutuhan kunjungan must be at least 10 characters'),

  body('jumlah_pengunjung')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Jumlah pengunjung must be between 1-1000'),

  body('jadwal_kunjungan')
    .isISO8601()
    .toDate()
    .custom((value) => {
      const now = new Date();
      const date = new Date(value);
      if (date <= now) throw new Error('Jadwal kunjungan must be in the future');
      const day = date.getDay();
      if (day === 0 || day === 6) throw new Error('Harus hari kerja (Senin - Jumat)');
      return true;
    }),

  body('nomor_telepon')
    .matches(/^(\+62|62|0)8[1-9][0-9]{6,9}$/)
    .withMessage('Nomor telepon tidak valid')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  validateKunjungan,
  handleValidationErrors
};
