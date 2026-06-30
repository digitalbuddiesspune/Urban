import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Vendors from './pages/Vendors.jsx'
import Users from './pages/Users.jsx'
import Categories from './pages/Categories.jsx'
import Services from './pages/Services.jsx'
import Bookings from './pages/Bookings.jsx'
import Reviews from './pages/Reviews.jsx'
import Settings from './pages/Settings.jsx'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/users" element={<Users />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/services" element={<Services />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
