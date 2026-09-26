import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import GalleryPage from './pages/GalleryPage'
import ProjectDetailsPage from './pages/ProjectDetailsPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import CustomerDashboard from './pages/CustomerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import CompanyPage from './pages/CompanyPage'

function ProtectedRoute({ children, requiredUserType }) {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  if (!token || !user) return <Navigate to="/login" replace />
  if (requiredUserType && user.userType !== requiredUserType) {
    return <Navigate to={user.userType === 'admin' ? '/admin' : '/dashboard'} replace />
  }

  return children
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/projects/:slug" element={<ProjectDetailsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<CompanyPage pageKey="about" />} />
        <Route path="/services" element={<CompanyPage pageKey="services" />} />
        <Route path="/industries" element={<CompanyPage pageKey="industries" />} />
        <Route path="/careers" element={<CompanyPage pageKey="careers" />} />
        <Route path="/blog" element={<CompanyPage pageKey="blog" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/dashboard" element={<ProtectedRoute requiredUserType="customer"><CustomerDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute requiredUserType="admin"><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </Router>
  )
}

export default App
