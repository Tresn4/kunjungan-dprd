import { useState, useEffect } from "react";
import HeaderAdmin from "../components/HeaderAdmin";
import { getVisitData, updateVisitStatus, deleteVisit } from "../services/api";
import Notification from "../components/Notification";
import RekapModal from "../components/RekapModal";
import "../styles/admin.css";

const AdminDashboard = () => {
  // States
  const [visits, setVisits] = useState([]);
  const [filteredVisits, setFilteredVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [isRekapModalOpen, setIsRekapModalOpen] = useState(false);
  
  // Search & Filter states (HANYA SEKALI!)
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("terbaru");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // useEffect untuk fetch data
  useEffect(() => {
    fetchVisitData();
  }, []);

  // useEffect untuk apply filters
  useEffect(() => {
    applyFilters();
  }, [visits, searchTerm, filterStatus, sortBy]);

  const fetchVisitData = async () => {
    try {
      setLoading(true);
      const response = await getVisitData();
      
      if (response.success && response.data) {
        setVisits(response.data);
        setFilteredVisits(response.data);
      } else {
        setVisits([]);
        setFilteredVisits([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setNotification({
        message: "Gagal memuat data kunjungan",
        type: "error"
      });
      setVisits([]);
      setFilteredVisits([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...visits];

    // Filter by search term (nama institusi, kebutuhan, telepon, email)
    if (searchTerm) {
      filtered = filtered.filter(visit => 
        (visit.nama_institusi?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (visit.kebutuhan_kunjungan?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (visit.nomor_telepon?.includes(searchTerm)) ||
        (visit.email?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(visit => visit.status === filterStatus);
    }

    // Sort by created_at
    if (sortBy === "terbaru") {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === "terlama") {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    setFilteredVisits(filtered);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setSortBy("terbaru");
    setFilteredVisits(visits);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await updateVisitStatus(id, newStatus);
      
      // Refresh data setelah update
      await fetchVisitData();
      
      // Tampilkan notifikasi sukses dengan info email
      setNotification({
        message: response.message || `Status berhasil diupdate menjadi ${newStatus === 'approved' ? 'Disetujui' : 'Ditolak'}. Email notifikasi telah dikirim.`,
        type: "success"
      });
    } catch (err) {
      console.error("Error updating status:", err);
      setNotification({
        message: err.message || "Gagal mengupdate status",
        type: "error"
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        await deleteVisit(id);
        fetchVisitData();
        setNotification({
          message: "Data berhasil dihapus!",
          type: "success"
        });
      } catch (err) {
        console.error("Error deleting data:", err);
        setNotification({
          message: "Gagal menghapus data",
          type: "error"
        });
      }
    }
  };

  const handleDownloadFile = (filename) => {
    if (filename) {
      window.open(`http://localhost:5000/uploads/${filename}`, '_blank');
      setNotification({
        message: `Membuka file: ${filename}`,
        type: "success"
      });
    } else {
      setNotification({
        message: "File tidak tersedia",
        type: "error"
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-500 text-white";
      case "rejected":
        return "bg-red-500 text-white";
      case "pending":
      default:
        return "bg-yellow-500 text-white";
    }
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVisits.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVisits.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="min-h-screen">
        <HeaderAdmin />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderAdmin />
      
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Rekap Modal */}
      <RekapModal 
        isOpen={isRekapModalOpen} 
        onClose={() => setIsRekapModalOpen(false)} 
      />

      <div className="container mx-auto px-4 py-8">
        {/* Stats Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Data Kunjungan</h2>
              <p className="text-blue-100">
                Total: {visits.length} pengajuan | 
                Ditampilkan: {filteredVisits.length} data
                {totalPages > 0 && ` | Halaman ${currentPage} dari ${totalPages}`}
              </p>
            </div>
            {/* Button Cetak Rekap */}
            <button
              onClick={() => setIsRekapModalOpen(true)}
              className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md transition-colors flex items-center space-x-2 font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Cetak Rekap PDF</span>
            </button>
          </div>

          {/* Search & Filter Section */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Box */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cari
                </label>
                <input
                  type="text"
                  placeholder="Ketik untuk mencari..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Semua Status</option>
                  <option value="pending">Menunggu</option>
                  <option value="approved">Disetujui</option>
                  <option value="rejected">Ditolak</option>
                </select>
              </div>

              {/* Sort by */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Urutkan
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="terbaru">Terbaru</option>
                  <option value="terlama">Terlama</option>
                </select>
              </div>
            </div>

            {/* Reset Button */}
            <div className="mt-4">
              <button
                onClick={handleResetFilters}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center space-x-2"
              >
                <span>Reset Semua Filter</span>
              </button>
            </div>
          </div>

          {/* Table Section */}
          {filteredVisits.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
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
              <p className="text-gray-500 text-lg">
                {searchTerm || filterStatus !== "all"
                  ? "Tidak ada data yang sesuai dengan filter"
                  : "Belum ada data kunjungan"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        NO
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        INSTITUSI
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        EMAIL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        KEBUTUHAN
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        JUMLAH
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        JADWAL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        TELEPON
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        PENGAJUAN
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        STATUS
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        AKSI
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((visit, index) => (
                      <tr key={visit.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {visit.nama_institusi || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600" title={visit.email}>
                            {visit.email || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate" title={visit.kebutuhan_kunjungan}>
                            {visit.kebutuhan_kunjungan || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {visit.jumlah_pengunjung || 0} orang
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(visit.jadwal_kunjungan)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {visit.nomor_telepon || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(visit.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                              visit.status
                            )}`}
                          >
                            {visit.status === "pending"
                              ? "Menunggu"
                              : visit.status === "approved"
                              ? "Disetujui"
                              : "Ditolak"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {visit.status !== "approved" && (
                              <button
                                onClick={() => handleStatusChange(visit.id, "approved")}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition-colors flex items-center space-x-1"
                                title="Setujui dan kirim email notifikasi"
                              >
                                <span>✓</span>
                                <span>Setuju</span>
                              </button>
                            )}

                            {visit.status !== "rejected" && (
                              <button
                                onClick={() => handleStatusChange(visit.id, "rejected")}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors flex items-center space-x-1"
                                title="Tolak dan kirim email notifikasi"
                              >
                                <span>✗</span>
                                <span>Tolak</span>
                              </button>
                            )}

                            {visit.file_pengantar && (
                              <button
                                onClick={() => handleDownloadFile(visit.file_pengantar)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors"
                                title="Lihat File PDF"
                              >
                                PDF
                              </button>
                            )}

                            <button
                              onClick={() => handleDelete(visit.id)}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs transition-colors"
                              title="Hapus Data"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Menampilkan <span className="font-medium">{indexOfFirstItem + 1}</span> sampai{' '}
                        <span className="font-medium">
                          {Math.min(indexOfLastItem, filteredVisits.length)}
                        </span>{' '}
                        dari <span className="font-medium">{filteredVisits.length}</span> data
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                            currentPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          ‹
                        </button>
                        
                        {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => paginate(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === pageNum
                                  ? 'z-10 bg-blue-600 border-blue-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                            currentPage === totalPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          ›
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;