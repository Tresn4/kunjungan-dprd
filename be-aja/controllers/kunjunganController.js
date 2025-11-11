// be-aja/controllers/kunjunganController.js
const path = require("path");
const fs = require("fs");
const pool = require("../config/database");
const { 
  sendApprovalEmail, 
  sendRejectionEmail, 
  sendSubmissionConfirmation 
} = require("../services/emailService");

// Submit kunjungan baru
const submitKunjungan = async (req, res) => {
    console.log("Isi dari req.body:", req.body);
    console.log("Isi dari req.file:", req.file);
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const { namaInstitusi, kebutuhan, jumlahPengunjung, jadwal, noTelp, email } = req.body;

        let filePath = null;
        if (req.file) {
            filePath = req.file.filename;
        }

        // Validasi field wajib
        if (!namaInstitusi || namaInstitusi.trim() === "" ||
            !kebutuhan || kebutuhan.trim() === "" ||
            !jumlahPengunjung ||
            !jadwal || jadwal.trim() === "" ||
            !noTelp || noTelp.trim() === "" ||
            !email || email.trim() === ""
        ) {
            return res.status(400).json({ success: false, message: "Semua field wajib diisi" });
        }

        // Validasi email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: "Format email tidak valid" 
            });
        }

        const parsedJumlahPengunjung = parseInt(jumlahPengunjung, 10);
        if (isNaN(parsedJumlahPengunjung) || parsedJumlahPengunjung <= 0) {
            return res.status(400).json({
                success: false,
                message: "Jumlah pengunjung harus berupa angka dan lebih dari 0.",
            });
        }

        // Insert data dengan field email
        const result = await client.query(
            `INSERT INTO kunjungan 
            (nama_institusi, kebutuhan_kunjungan, jumlah_pengunjung, jadwal_kunjungan, nomor_telepon, email, file_pengantar, status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *`,
            [namaInstitusi, kebutuhan, parsedJumlahPengunjung, jadwal, noTelp, email, filePath, "pending"]
        );

        await client.query("COMMIT");

        // Kirim email konfirmasi submission (async, tidak menunggu)
        const visitData = result.rows[0];
        sendSubmissionConfirmation({
            email: visitData.email,
            nama_institusi: visitData.nama_institusi,
            jadwal_kunjungan: visitData.jadwal_kunjungan,
        }).catch(err => console.error('Email confirmation error:', err));

        res.status(201).json({ 
            success: true, 
            message: "Formulir kunjungan berhasil dikirim. Email konfirmasi telah dikirim.", 
            data: result.rows[0] 
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Submit kunjungan error:", error);
        if (req.file) {
            fs.unlinkSync(path.join("./uploads", req.file.filename));
        }
        res.status(500).json({ 
            success: false, 
            message: "Terjadi kesalahan saat menyimpan data", 
            error: error.message 
        });
    } finally {
        client.release();
    }
};

// Get semua data kunjungan (untuk admin)
const getAllKunjungan = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                id, 
                nama_institusi, 
                kebutuhan_kunjungan, 
                jumlah_pengunjung, 
                jadwal_kunjungan, 
                nomor_telepon, 
                email,
                file_pengantar, 
                status,
                rejection_reason,
                created_at,
                updated_at
            FROM kunjungan 
            ORDER BY created_at DESC`
        );

        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        console.error("Get all kunjungan error:", error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan saat mengambil data",
            error: error.message
        });
    }
};

// Get kunjungan by ID
const getKunjunganById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT * FROM kunjungan WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Data kunjungan tidak ditemukan"
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Get kunjungan by ID error:", error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan saat mengambil data",
            error: error.message
        });
    }
};

// Update status kunjungan WITH EMAIL NOTIFICATION
const updateStatusKunjungan = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        
        const { id } = req.params;
        const { status, rejection_reason } = req.body;

        // Validasi status
        const validStatus = ['pending', 'approved', 'rejected'];
        if (!validStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status tidak valid. Gunakan: pending, approved, atau rejected"
            });
        }

        // Validasi rejection reason jika status rejected
        if (status === 'rejected' && (!rejection_reason || rejection_reason.trim() === '')) {
            return res.status(400).json({
                success: false,
                message: "Alasan penolakan harus diisi"
            });
        }

        // Get data kunjungan sebelum update (untuk kirim email)
        const visitResult = await client.query(
            `SELECT * FROM kunjungan WHERE id = $1`,
            [id]
        );

        if (visitResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Data kunjungan tidak ditemukan"
            });
        }

        const visitData = visitResult.rows[0];
        const oldStatus = visitData.status;

        // Update status dan rejection_reason (jika ada)
        const result = await client.query(
            `UPDATE kunjungan 
            SET status = $1, 
                rejection_reason = $2, 
                updated_at = CURRENT_TIMESTAMP 
            WHERE id = $3 
            RETURNING *`,
            [status, status === 'rejected' ? rejection_reason : null, id]
        );

        await client.query("COMMIT");

        // Kirim email notifikasi jika status berubah
        if (oldStatus !== status && visitData.email) {
            if (status === 'approved') {
                // Kirim email approval
                sendApprovalEmail(visitData)
                    .then(result => {
                        if (result.success) {
                            console.log(`✅ Approval email sent to ${visitData.email}`);
                        }
                    })
                    .catch(err => console.error('Error sending approval email:', err));
            } else if (status === 'rejected') {
                // Kirim email rejection dengan alasan
                const visitDataWithReason = {
                    ...visitData,
                    rejection_reason: rejection_reason
                };
                sendRejectionEmail(visitDataWithReason)
                    .then(result => {
                        if (result.success) {
                            console.log(`✅ Rejection email sent to ${visitData.email}`);
                        }
                    })
                    .catch(err => console.error('Error sending rejection email:', err));
            }
        }

        res.status(200).json({
            success: true,
            message: `Status berhasil diupdate menjadi ${status === 'approved' ? 'Disetujui' : 'Ditolak'}. Email notifikasi telah dikirim.`,
            data: result.rows[0]
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Update status error:", error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan saat mengupdate status",
            error: error.message
        });
    } finally {
        client.release();
    }
};

// Delete kunjungan
const deleteKunjungan = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        
        const { id } = req.params;

        // Get file info first
        const fileResult = await client.query(
            `SELECT file_pengantar FROM kunjungan WHERE id = $1`,
            [id]
        );

        if (fileResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Data kunjungan tidak ditemukan"
            });
        }

        // Delete from database
        await client.query(`DELETE FROM kunjungan WHERE id = $1`, [id]);

        // Delete file if exists
        const fileName = fileResult.rows[0].file_pengantar;
        if (fileName) {
            const filePath = path.join("./uploads", fileName);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await client.query("COMMIT");
        res.status(200).json({
            success: true,
            message: "Data kunjungan berhasil dihapus"
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Delete kunjungan error:", error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan saat menghapus data",
            error: error.message
        });
    } finally {
        client.release();
    }
};

module.exports = { 
    submitKunjungan,
    getAllKunjungan,
    getKunjunganById,
    updateStatusKunjungan,
    deleteKunjungan
};