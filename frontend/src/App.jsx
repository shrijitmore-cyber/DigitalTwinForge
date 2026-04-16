import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Landing        from './pages/Landing'
import Login          from './pages/Login'
import FacilityMap    from './pages/FacilityMap'
import CompressorBed  from './pages/CompressorBed'
import Dashboard      from './pages/Dashboard'
import StabilityAnalytics from './pages/StabilityAnalytics'
import { SimulationProvider } from './context/SimulationContext'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <SimulationProvider>
      <Routes>
        <Route path="/"                element={<Landing />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/map"             element={<ProtectedRoute><FacilityMap /></ProtectedRoute>} />
        <Route path="/compressor-bed"  element={<ProtectedRoute><CompressorBed /></ProtectedRoute>} />
        <Route path="/dashboard"       element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/analytics"       element={<ProtectedRoute><StabilityAnalytics /></ProtectedRoute>} />
        <Route path="*"                element={<Navigate to="/" replace />} />
      </Routes>
    </SimulationProvider>
  )
}
