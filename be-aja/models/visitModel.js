const pool = require('../config/db');

// Fungsi untuk membuat kunjungan baru
async function createVisit(data) {
  const { namaInstitusi, kebutuhan, jumlahPengunjung, jadwal, noTelp, fileName } = data;
  
  const query = `
    INSERT INTO kunjungan (nama_institusi, kebutuhan, jumlah_pengunjung, jadwal, no_telp, file_name)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  
  const values = [namaInstitusi, kebutuhan, jumlahPengunjung, jadwal, noTelp, fileName];
  
  const result = await pool.query(query, values);
  return result.rows[0];
}

module.exports = { createVisit };
