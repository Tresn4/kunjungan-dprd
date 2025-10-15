import { logout } from '../utils/auth'
import { useNavigate } from 'react-router-dom'
import '../styles/admin.css'

const HeaderAdmin = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="admin-header">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1>Admin Panel - Humas DPRD Provinsi Lampung</h1>
          <p>Kelola Data Kunjungan</p>
        </div>
        <button onClick={handleLogout}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </header>
  )
}

export default HeaderAdmin