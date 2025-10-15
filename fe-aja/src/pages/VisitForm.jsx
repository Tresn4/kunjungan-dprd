import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import FormInput from "../components/FormInput";
import FileUpload from "../components/FileUpload";
import Notification from "../components/Notification";
import { submitVisitForm } from "../services/api";
import LogoImage from "../assets/logos.png";
import "../styles/form.css";

const VisitForm = () => {
  const [formData, setFormData] = useState({
    namaInstitusi: "",
    kebutuhan: "",
    jumlahPengunjung: "",
    jadwal: "",
    noTelp: "",
    email: "",
    file: null,
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const days = [
      "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu",
    ];
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", 
      "Agustus", "September", "Oktober", "November", "Desember",
    ];
    const day = days[date.getDay()];
    const dateNum = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}, ${dateNum} ${month} ${year}`;
  };

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'jumlahPengunjung' ? parseInt(value) : value,
    }));
  };

  const handleFileSelect = (file) => {
    console.log('Selected file:', file);
    setFormData((prev) => ({
      ...prev,
      file: file,
    }));
  };

  const validateForm = () => {
    // Validasi field string
    const stringFields = ["namaInstitusi", "kebutuhan", "jadwal", "noTelp", "email"];
    for (let field of stringFields) {
      if (typeof formData[field] !== 'string' || formData[field].trim() === "") {
        return false;
      }
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setNotification({
        message: "Format email tidak valid",
        type: "error",
      });
      return false;
    }

    // Validasi jumlahPengunjung (number)
    const jumlah = formData.jumlahPengunjung;
    if (typeof jumlah !== 'number' || isNaN(jumlah) || jumlah <= 0) {
      return false;
    }

    // Validasi file
    if (formData.file === null) {
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setNotification({
        message: "Harap lengkapi semua field yang wajib diisi dengan benar",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    setIsSubmitSuccess(false);

    // Menggunakan FormData untuk mengirimkan data formulir
    const data = new FormData();
    data.append("namaInstitusi", formData.namaInstitusi);
    data.append("kebutuhan", formData.kebutuhan);
    data.append("jumlahPengunjung", formData.jumlahPengunjung);
    data.append("jadwal", formData.jadwal);
    data.append("noTelp", formData.noTelp);
    data.append("email", formData.email);
    if (formData.file) {
      data.append("file_pengantar", formData.file);
    }

    try {
      const response = await submitVisitForm(data);
      if (response.success) {
        setIsSubmitSuccess(true);
        setNotification({
          message: "Berhasil Submit! Formulir kunjungan Anda telah dikirim. Cek email Anda untuk konfirmasi.",
          type: "success",
        });

        // Reset data formulir setelah sukses
        setFormData({
          namaInstitusi: "",
          kebutuhan: "",
          jumlahPengunjung: "",
          jadwal: "",
          noTelp: "",
          email: "",
          file: null,
        });
      }
    } catch (error) {
      setNotification({
        message: "Gagal mengirim formulir. Silakan coba lagi.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="visit-form-container">
      {/* Header */}
      <div className="bg-[#1e293b] shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center space-x-4 -ml-4">
              <div className="logo-box bg-white w-16 h-16 flex items-center justify-center p-3 shadow-md">
                <img
                  src={LogoImage}
                  alt="Logo"
                  className="logo-image h-full w-full object-contain"
                />
              </div>
              <span className="text-white">DPRD Provinsi Lampung</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white font-medium">
                {formatDate(currentDate)}
              </span>
              <Link
                to="/login"
                className="flex items-center justify-center text-white"
              >
                Masuk
              </Link>
            </div>
          </div>
        </div>
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="form-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">
              Formulir Kunjungan
            </h1>
            {isSubmitSuccess && (
              <div className="bg-green-400 text-white px-4 py-2 rounded-full text-sm">
                Berhasil Submit
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Nama Institusi :"
              value={formData.namaInstitusi}
              onChange={handleInputChange("namaInstitusi")}
              placeholder="Masukkan nama institusi"
              required
            />
            <FormInput
              label="Kebutuhan Kunjungan :"
              value={formData.kebutuhan}
              onChange={handleInputChange("kebutuhan")}
              placeholder="Jelaskan kebutuhan kunjungan"
              required
            />
            <FormInput
              label="Jumlah Pengunjung :"
              type="number"
              value={formData.jumlahPengunjung}
              onChange={handleInputChange("jumlahPengunjung")}
              placeholder="Masukkan jumlah pengunjung"
              required
            />
            <FormInput
              label="Jadwal Kunjungan :"
              type="date"
              value={formData.jadwal}
              onChange={handleInputChange("jadwal")}
              required
            />
            <FormInput
              label="Nomor yang dapat dihubungi :"
              type="tel"
              value={formData.noTelp}
              onChange={handleInputChange("noTelp")}
              placeholder="Masukkan nomor telepon"
              required
            />
            <FormInput
              label="Email :"
              type="email"
              value={formData.email}
              onChange={handleInputChange("email")}
              placeholder="Masukkan email untuk notifikasi"
              required
            />
            <p className="text-sm text-blue-600 -mt-2">
              *Status persetujuan akan dikirim melalui email.
            </p>

            <div>
              <label className="block text-sm text-white mb-2">
                Upload file pengajuan Kunjungan :
              </label>
              <FileUpload
                onFileSelect={handleFileSelect}
                selectedFile={formData.file}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="submit-button w-full py-2 px-4 rounded flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>Mengirim...</span>
                </>
              ) : (
                <span>Submit</span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#1e293b] mt-8">
        <div className="max-w-7xl mx-auto py-8 px-4 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-12">
              <div className="flex flex-col items-center">
                <div className="logo-box bg-white w-20 h-20 flex items-center justify-center p-4 shadow-md">
                  <img
                    src={LogoImage}
                    alt="Logo"
                    className="logo-image h-full w-full object-contain"
                  />
                </div>
                <p className="text-gray-300 mt-2 text-sm text-center">
                  © PKL IF ITERA 2025.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Dikelola Oleh</h3>
                <p className="text-gray-300">
                  Humas Sekretariat Dewan Perwakilan
                  <br />
                  Rakyat Daerah Provinsi Lampung
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Alamat</h3>
                <p className="text-gray-300">
                  Jalan Wolter Monginsidi No. 69
                  <br />
                  Teluk Betung Kota Bandar Lampung
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Hubungi Kami</h3>
              <div className="flex space-x-4">
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 320 512"
                  >
                    <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 448 512"
                  >
                    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                  </svg>
                </a>
                <a
                  href="https://www.dprd.lampungprov.go.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 512 512"
                  >
                    <path d="M352 256c0 22.2-1.2 43.6-3.3 64H163.3c-2.2-20.4-3.3-41.8-3.3-64s1.2-43.6 3.3-64H348.7c2.2 20.4 3.3 41.8 3.3 64zm28.8-64H503.9c5.3 20.5 8.1 41.9 8.1 64s-2.8 43.5-8.1 64H380.8c2.1-20.6 3.2-42 3.2-64s-1.1-43.4-3.2-64zm112.6-32H376.7c-10-63.9-29.8-117.4-55.3-151.6c78.3 20.7 142 77.5 171.9 151.6zm-149.1 0H167.7c6.1-36.4 15.5-68.6 27-94.7c10.5-23.6 22.2-40.7 33.5-51.5C239.4 3.2 248.7 0 256 0s16.6 3.2 27.8 13.8c11.3 10.8 23 27.9 33.5 51.5c11.6 26 20.9 58.2 27 94.7zm-209 0H18.6C48.6 85.9 112.2 29.1 190.6 8.4C165.1 42.6 145.3 96.1 135.3 160zM8.1 192H131.2c-2.1 20.6-3.2 42-3.2 64s1.1 43.4 3.2 64H8.1C2.8 299.5 0 278.1 0 256s2.8-43.5 8.1-64zM194.7 446.6c-11.6-26-20.9-58.2-27-94.6H344.3c-6.1 36.4-15.5 68.6-27 94.6c-10.5 23.6-22.2 40.7-33.5 51.5C272.6 508.8 263.3 512 256 512s-16.6-3.2-27.8-13.8c-11.3-10.8-23-27.9-33.5-51.5zM135.3 352c10 63.9 29.8 117.4 55.3 151.6C112.2 482.9 48.6 426.1 18.6 352H135.3zm358.1 0c-30 74.1-93.6 130.9-171.9 151.6c25.5-34.2 45.2-87.7 55.3-151.6H493.4z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitForm;