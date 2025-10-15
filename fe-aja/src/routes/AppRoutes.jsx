// src/routes/AppRoutes.jsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth'
import VisitForm from '../pages/VisitForm'
import Login from '../pages/Login'
import AdminDashboard from '../pages/AdminDashboard'

// Route hanya bisa digunakan jika tidak dibungkus BrowserRouter ulang

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />
}

const PublicRoute = ({ children }) => {
  return !isAuthenticated() ? children : <Navigate to="/admin" />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<VisitForm />} />
      <Route path="/kunjungan" element={<VisitForm />} />

      {/* Auth routes */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />

      {/* Protected admin dashboard */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default AppRoutes
