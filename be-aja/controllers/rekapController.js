// be-aja/controllers/rekapController.js
const PDFDocument = require('pdfkit');
const pool = require('../config/database');
const path = require('path');
const fs = require('fs');

// Generate Rekap PDF
const generateRekapPDF = async (req, res) => {
    try {
        const { bulan, tahun } = req.query;

        // Validasi parameter
        if (!bulan || !tahun) {
            return res.status(400).json({
                success: false,
                message: 'Parameter bulan dan tahun wajib diisi'
            });
        }

        // Query data approved untuk bulan tertentu
        const query = `
            SELECT 
                id,
                nama_institusi,
                kebutuhan_kunjungan,
                jumlah_pengunjung,
                jadwal_kunjungan,
                nomor_telepon,
                email,
                created_at,
                updated_at
            FROM kunjungan
            WHERE status = 'approved'
            AND EXTRACT(MONTH FROM jadwal_kunjungan) = $1
            AND EXTRACT(YEAR FROM jadwal_kunjungan) = $2
            ORDER BY jadwal_kunjungan ASC
        `;

        const result = await pool.query(query, [bulan, tahun]);
        const data = result.rows;

        if (data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tidak ada data kunjungan yang disetujui pada bulan tersebut'
            });
        }

        // Create PDF
        const doc = new PDFDocument({
            size: 'A4',
            layout: 'landscape',
            margin: 50
        });

        // Set response headers
        const namaBulan = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ][parseInt(bulan) - 1];

        const filename = `Rekap_Kunjungan_${namaBulan}_${tahun}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        doc.pipe(res);

        // === HEADER ===
        doc.fontSize(18)
           .font('Helvetica-Bold')
           .text('SEKRETARIAT DEWAN PERWAKILAN RAKYAT DAERAH', { align: 'center' })
           .fontSize(16)
           .text('PROVINSI LAMPUNG', { align: 'center' })
           .moveDown(0.5);

        doc.fontSize(10)
           .font('Helvetica')
           .text('Jalan Wolter Monginsidi No. 69, Teluk Betung, Kota Bandar Lampung', { align: 'center' })
           .moveDown(1);

        // Line separator
        doc.moveTo(50, doc.y)
           .lineTo(792 - 50, doc.y)
           .lineWidth(2)
           .stroke();
        doc.moveDown(1);

        // === TITLE ===
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text(`REKAPITULASI SURAT KUNJUNGAN YANG DISETUJUI`, { align: 'center' })
           .fontSize(12)
           .text(`Bulan ${namaBulan} ${tahun}`, { align: 'center' })
           .moveDown(1.5);

        // === TABLE ===
        const tableTop = doc.y;
        const colWidths = {
            no: 30,
            institusi: 140,
            kebutuhan: 150,
            jumlah: 50,
            jadwal: 70,
            telepon: 80,
            tanggalSetuju: 80
        };

        const tableLeft = 50;

        // Table Header
        doc.fontSize(9)
           .font('Helvetica-Bold');

        let currentX = tableLeft;
        let currentY = tableTop;

        // Draw header background
        doc.rect(tableLeft, currentY, 792 - 100, 25)
           .fillAndStroke('#eaf63bff', '#000000');

        doc.fillColor('#ffffff');

        // Header text
        doc.text('NO', tableLeft + 5, currentY + 8, { width: colWidths.no, align: 'center' });
        currentX += colWidths.no;

        doc.text('NAMA INSTITUSI', currentX + 5, currentY + 8, { width: colWidths.institusi, align: 'left' });
        currentX += colWidths.institusi;

        doc.text('KEBUTUHAN', currentX + 5, currentY + 8, { width: colWidths.kebutuhan, align: 'left' });
        currentX += colWidths.kebutuhan;

        doc.text('JUMLAH', currentX + 5, currentY + 8, { width: colWidths.jumlah, align: 'center' });
        currentX += colWidths.jumlah;

        doc.text('JADWAL', currentX + 5, currentY + 8, { width: colWidths.jadwal, align: 'center' });
        currentX += colWidths.jadwal;

        doc.text('TELEPON', currentX + 5, currentY + 8, { width: colWidths.telepon, align: 'left' });
        currentX += colWidths.telepon;

        doc.text('DISETUJUI', currentX + 5, currentY + 8, { width: colWidths.tanggalSetuju, align: 'center' });

        currentY += 25;

        // Table Body
        doc.font('Helvetica')
           .fontSize(8)
           .fillColor('#000000');

        data.forEach((row, index) => {
            // Check if we need a new page
            if (currentY > 500) {
                doc.addPage();
                currentY = 50;
            }

            currentX = tableLeft;
            const rowHeight = 30;

            // Draw row background (alternate colors)
            if (index % 2 === 0) {
                doc.rect(tableLeft, currentY, 792 - 100, rowHeight)
                   .fill('#f3f4f6');
            }

            doc.fillColor('#000000');

            // No
            doc.text((index + 1).toString(), currentX + 5, currentY + 10, { 
                width: colWidths.no, 
                align: 'center' 
            });
            currentX += colWidths.no;

            // Nama Institusi
            doc.text(row.nama_institusi || '-', currentX + 5, currentY + 10, { 
                width: colWidths.institusi - 10,
                align: 'left',
                ellipsis: true
            });
            currentX += colWidths.institusi;

            // Kebutuhan
            doc.text(row.kebutuhan_kunjungan || '-', currentX + 5, currentY + 10, { 
                width: colWidths.kebutuhan - 10,
                align: 'left',
                ellipsis: true
            });
            currentX += colWidths.kebutuhan;

            // Jumlah
            doc.text(`${row.jumlah_pengunjung} org`, currentX + 5, currentY + 10, { 
                width: colWidths.jumlah, 
                align: 'center' 
            });
            currentX += colWidths.jumlah;

            // Jadwal
            const jadwal = new Date(row.jadwal_kunjungan).toLocaleDateString('id-ID');
            doc.text(jadwal, currentX + 5, currentY + 10, { 
                width: colWidths.jadwal, 
                align: 'center' 
            });
            currentX += colWidths.jadwal;

            // Telepon
            doc.text(row.nomor_telepon || '-', currentX + 5, currentY + 10, { 
                width: colWidths.telepon - 10,
                align: 'left'
            });
            currentX += colWidths.telepon;

            // Tanggal Disetujui
            const tanggalSetuju = new Date(row.updated_at).toLocaleDateString('id-ID');
            doc.text(tanggalSetuju, currentX + 5, currentY + 10, { 
                width: colWidths.tanggalSetuju, 
                align: 'center' 
            });

            // Draw row border
            doc.rect(tableLeft, currentY, 792 - 100, rowHeight)
               .stroke('#cbd5e1');

            currentY += rowHeight;
        });

        // === FOOTER ===
        doc.moveDown(2);
        currentY = doc.y;

        // Summary
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text(`Total Kunjungan Disetujui: ${data.length} kunjungan`, tableLeft, currentY);

        doc.moveDown(2);
        currentY = doc.y;

        // Signature section
        const today = new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        doc.fontSize(9)
           .font('Helvetica')
           .text(`Bandar Lampung, ${today}`, 550, currentY, { align: 'left' })
           .moveDown(0.5)
           .font('Helvetica-Bold')
           .text('Kepala Bagian Aspirasi, Humas, Dan Protokol', 550, doc.y, { align: 'left' })
           .moveDown(3)
           .text('_____________________', 550, doc.y, { align: 'left' });

        // Finalize PDF
        doc.end();

    } catch (error) {
        console.error('Generate PDF error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat generate PDF',
            error: error.message
        });
    }
};

// Get available months (bulan yang ada data approved)
const getAvailableMonths = async (req, res) => {
    try {
        const query = `
            SELECT DISTINCT
                EXTRACT(YEAR FROM jadwal_kunjungan) as tahun,
                EXTRACT(MONTH FROM jadwal_kunjungan) as bulan,
                COUNT(*) as jumlah
            FROM kunjungan
            WHERE status = 'approved'
            GROUP BY tahun, bulan
            ORDER BY tahun DESC, bulan DESC
        `;

        const result = await pool.query(query);

        const data = result.rows.map(row => ({
            tahun: parseInt(row.tahun),
            bulan: parseInt(row.bulan),
            jumlah: parseInt(row.jumlah),
            label: `${getNamaBulan(row.bulan)} ${row.tahun} (${row.jumlah} kunjungan)`
        }));

        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Get available months error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data bulan',
            error: error.message
        });
    }
};

// Helper function
const getNamaBulan = (bulan) => {
    const namaBulan = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return namaBulan[parseInt(bulan) - 1];
};

module.exports = {
    generateRekapPDF,
    getAvailableMonths
};