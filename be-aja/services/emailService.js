// be-aja/services/emailService.js
const transporter = require('../config/email');

// Format date to Indonesian format
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Email template for approved visit
const getApprovedEmailTemplate = (visitData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
        .status-box { background: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .status-box h3 { color: #16a34a; margin: 0 0 10px 0; }
        .details { background: #f9fafb; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .details-row { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .details-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #1e3a8a; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #6b7280; font-size: 14px; }
        .button { display: inline-block; background: #1e3a8a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Sekretariat DPRD Provinsi Lampung</h1>
          <p>Bagian Aspirasi, Humas, dan Protokol</p>
        </div>
        
        <div class="content">
          <div class="status-box">
            <h3>✅ Pengajuan Kunjungan DISETUJUI</h3>
            <p>Pengajuan kunjungan dari <strong>${visitData.nama_institusi}</strong> telah disetujui oleh Bagian Aspirasi, Humas, dan Protokol Sekretariat DPRD Provinsi Lampung.</p>
          </div>
          
          <p>Kepada Yth. <strong>${visitData.nama_institusi}</strong>,</p>
          
          <p>Dengan hormat, kami informasikan bahwa pengajuan kunjungan Anda telah <strong>DISETUJUI</strong>.</p>
          
          <div class="details">
            <h3 style="margin-top: 0; color: #1e3a8a;">Detail Kunjungan:</h3>
            <div class="details-row">
              <span class="label">Nama Institusi:</span><br>
              ${visitData.nama_institusi}
            </div>
            <div class="details-row">
              <span class="label">Kebutuhan Kunjungan:</span><br>
              ${visitData.kebutuhan_kunjungan}
            </div>
            <div class="details-row">
              <span class="label">Jumlah Pengunjung:</span><br>
              ${visitData.jumlah_pengunjung} orang
            </div>
            <div class="details-row">
              <span class="label">Jadwal Kunjungan:</span><br>
              ${formatDate(visitData.jadwal_kunjungan)}
            </div>
            <div class="details-row">
              <span class="label">Nomor yang Dapat Dihubungi:</span><br>
              ${visitData.nomor_telepon}
            </div>
          </div>
          
          <p><strong>Catatan Penting:</strong></p>
          <ul>
            <li>Silakan datang sesuai dengan jadwal yang telah ditentukan</li>
            <li>Bawa surat pengantar resmi dari institusi</li>
            <li>Patuhi protokol dan tata tertib yang berlaku</li>
          </ul>
          
          <p>Jika ada pertanyaan atau perubahan jadwal, silakan hubungi kami.</p>
          
          <p>Terima kasih atas perhatiannya.</p>
        </div>
        
        <div class="footer">
          <p><strong>Bagian Aspirasi, Humas, dan Protokol Sekretariat DPRD Provinsi Lampung</strong></p>
          <p>Jalan Wolter Monginsidi No. 69, Teluk Betung</p>
          <p>Kota Bandar Lampung</p>
          <p style="margin-top: 15px; font-size: 12px;">
            Email ini dikirim secara otomatis, mohon tidak membalas email ini.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for rejected visit
const getRejectedEmailTemplate = (visitData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
        .status-box { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .status-box h3 { color: #dc2626; margin: 0 0 10px 0; }
        .reason-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .reason-box h4 { color: #92400e; margin: 0 0 10px 0; font-size: 16px; }
        .reason-box p { color: #78350f; margin: 0; line-height: 1.6; }
        .details { background: #f9fafb; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .details-row { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .details-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #1e3a8a; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #6b7280; font-size: 14px; }
        .contact-box { background: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Sekretariat DPRD Provinsi Lampung</h1>
          <p>Bagian Aspirasi, Humas, dan Protokol</p>
        </div>
        
        <div class="content">
          <div class="status-box">
            <h3>❌ Pengajuan Kunjungan DITOLAK</h3>
            <p>Pengajuan kunjungan dari <strong>${visitData.nama_institusi}</strong> tidak dapat kami proses saat ini.</p>
          </div>
          
          <p>Kepada Yth. <strong>${visitData.nama_institusi}</strong>,</p>
          
          <p>Dengan hormat, kami informasikan bahwa pengajuan kunjungan Anda <strong>TIDAK DAPAT DIPROSES</strong> saat ini.</p>
          
          ${visitData.rejection_reason ? `
          <div class="reason-box">
            <h4>Alasan Penolakan:</h4>
            <p>${visitData.rejection_reason}</p>
          </div>
          ` : ''}
          
          <div class="details">
            <h3 style="margin-top: 0; color: #1e3a8a;">Detail Pengajuan:</h3>
            <div class="details-row">
              <span class="label">Institusi:</span><br>
              ${visitData.nama_institusi}
            </div>
            <div class="details-row">
              <span class="label">Jadwal yang Diajukan:</span><br>
              ${formatDate(visitData.jadwal_kunjungan)}
            </div>
            <div class="details-row">
              <span class="label">Jumlah Pengunjung:</span><br>
              ${visitData.jumlah_pengunjung} orang
            </div>
          </div>
          
          <div class="contact-box">
            <p style="margin: 0;"><strong>💡 Anda dapat mengajukan kembali dengan:</strong></p>
            <ul style="margin: 10px 0 0 0;">
              <li>Memilih jadwal alternatif</li>
              <li>Melengkapi informasi yang diperlukan</li>
              <li>Menghubungi kami untuk konfirmasi lebih lanjut</li>
            </ul>
          </div>
          
          <p>Untuk informasi lebih lanjut, silakan hubungi:</p>
          <p>
            <strong>Bagian Aspirasi, Humas, dan Protokol DPRD Provinsi Lampung</strong><br>
            Jalan Wolter Monginsidi No. 69, Teluk Betung
          </p>
          
          <p>Terima kasih atas pengertiannya.</p>
        </div>
        
        <div class="footer">
          <p><strong>Sub Bagian Humas Sekretariat DPRD Provinsi Lampung</strong></p>
          <p>Jalan Wolter Monginsidi No. 69, Teluk Betung</p>
          <p>Kota Bandar Lampung</p>
          <p style="margin-top: 15px; font-size: 12px;">
            Email ini dikirim secara otomatis, mohon tidak membalas email ini.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send approval email
const sendApprovalEmail = async (visitData) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: visitData.email,
      subject: '✅ Pengajuan Kunjungan Disetujui - Sekretariat DPRD Provinsi Lampung',
      html: getApprovedEmailTemplate(visitData),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Approval email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending approval email:', error);
    return { success: false, error: error.message };
  }
};

// Send rejection email
const sendRejectionEmail = async (visitData) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: visitData.email,
      subject: '❌ Pengajuan Kunjungan Ditolak - Sekretariat DPRD Provinsi Lampung',
      html: getRejectedEmailTemplate(visitData),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Rejection email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending rejection email:', error);
    return { success: false, error: error.message };
  }
};

// Send confirmation email after submission
const sendSubmissionConfirmation = async (visitData) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: visitData.email,
      subject: 'Konfirmasi Pengajuan Kunjungan - Sekretariat DPRD Provinsi Lampung',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .status-box { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Sekretariat DPRD Provinsi Lampung</h1>
            </div>
            <div class="content">
              <div class="status-box">
                <h3>Pengajuan Kunjungan Berhasil Dikirim</h3>
              </div>
              <p>Kepada Yth. <strong>${visitData.nama_institusi}</strong>,</p>
              <p>Terima kasih telah mengajukan kunjungan ke DPRD Provinsi Lampung.</p>
              <p>Pengajuan Anda sedang dalam proses oleh Sub Bagian Humas. Anda akan menerima email notifikasi mengenai status persetujuan dalam 1-3 hari kerja.</p>
              <p><strong>Jadwal yang Diajukan:</strong> ${formatDate(visitData.jadwal_kunjungan)}</p>
            </div>
            <div class="footer">
              <p><strong>Sekretariat DPRD Provinsi Lampung</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Submission confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending submission confirmation:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendApprovalEmail,
  sendRejectionEmail,
  sendSubmissionConfirmation,
};