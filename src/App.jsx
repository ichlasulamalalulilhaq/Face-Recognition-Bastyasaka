import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout/Layout'
import Dashboard from './components/Dashboard/Dashboard'
import Attendance from './components/Attendance/Attendance'
import History from './components/History/History'
import AuthPage from './pages/AuthPage'
import FaceRegistrationPage from './pages/FaceRegistrationPage'
import StudentSettingsPage from './pages/StudentSettingsPage'

// Protected Route - requires login (no loading screen)
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  // Redirect after auth check, but don't block with loading screen
  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Show children immediately
  return children
}

// Face Required Route - requires login + face registered (no loading screen)
function FaceRequiredRoute({ children }) {
  const { isAuthenticated, hasFaceRegistered, loading } = useAuth()

  // Wait for auth check to complete before redirecting
  if (!loading) {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />
    }
    if (!hasFaceRegistered) {
      return <Navigate to="/register-face" replace />
    }
  }

  // Show children immediately
  return children
}

// Auth Route - show immediately, redirect if logged in after check
function AuthRoute({ children }) {
  const { isAuthenticated, hasFaceRegistered, loading } = useAuth()

  // Show login page immediately, don't wait for loading
  // If user is authenticated after check, redirect will happen automatically
  if (!loading && isAuthenticated) {
    if (!hasFaceRegistered) {
      return <Navigate to="/register-face" replace />
    }
    return <Navigate to="/dashboard" replace />
  }

  // Show children (login page) immediately - no loading screen
  return children
}

function App() {
  return (
    <Routes>
      {/* Auth Routes - single page for login & register */}
      <Route path="/login" element={
        <AuthRoute>
          <AuthPage />
        </AuthRoute>
      } />
      <Route path="/register" element={
        <AuthRoute>
          <AuthPage />
        </AuthRoute>
      } />

      {/* Face Registration - protected but doesn't require face */}
      <Route path="/register-face" element={
        <ProtectedRoute>
          <FaceRegistrationPage />
        </ProtectedRoute>
      } />

      {/* Protected Routes - require login + face */}
      <Route path="/" element={
        <FaceRequiredRoute>
          <Layout />
        </FaceRequiredRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="history" element={<History />} />
        <Route path="settings" element={<StudentSettingsPage />} />
      </Route>

      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
