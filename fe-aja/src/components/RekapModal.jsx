// fe-aja/src/components/RekapModal.jsx
import { useState, useEffect } from 'react';

const RekapModal = ({ isOpen, onClose }) => {
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableMonths();
    }
  }, [isOpen]);

  const fetchAvailableMonths = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/rekap/available-months');
      const data = await response.json();
      
      if (data.success) {
        setAvailableMonths(data.data);
        
        // Set default to latest month
        if (data.data.length > 0) {
          setSelectedMonth(data.data[0].bulan.toString());
          setSelectedYear(data.data[0].tahun.toString());
        }
      }
    } catch (err) {
      console.error('Error fetching months:', err);
      setError('Gagal memuat data bulan');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedMonth || !selectedYear) {
      setError('Pilih bulan dan tahun terlebih dahulu');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const url = `http://localhost:5000/api/rekap/pdf?bulan=${selectedMonth}&tahun=${selectedYear}`;
      
      // Open PDF in new tab
      window.open(url, '_blank');
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 500);
      
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Gagal men-download PDF');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const namaBulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
          <h3 className="text-lg font-bold">📄 Cetak Rekapitulasi PDF</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && availableMonths.length === 0 ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Memuat data...</p>
            </div>
          ) : availableMonths.length === 0 ? (
            <div className="text-center py-4">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-600">Belum ada kunjungan yang disetujui</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Periode Rekapitulasi:
                </label>
                <select
                  value={`${selectedMonth}-${selectedYear}`}
                  onChange={(e) => {
                    const [month, year] = e.target.value.split('-');
                    setSelectedMonth(month);
                    setSelectedYear(year);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {availableMonths.map((item) => (
                    <option
                      key={`${item.bulan}-${item.tahun}`}
                      value={`${item.bulan}-${item.tahun}`}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Informasi:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• PDF akan berisi kunjungan yang <strong>disetujui</strong></li>
                  <li>• Format: Landscape A4</li>
                  <li>• Include: Nama, Kebutuhan, Jadwal, dll</li>
                  <li>• Otomatis ter-download</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {availableMonths.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              Batal
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={loading || !selectedMonth || !selectedYear}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RekapModal;