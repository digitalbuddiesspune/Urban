import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { LocationProvider } from './context/LocationContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import MainLayout from './layouts/MainLayout.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Services from './pages/Services.jsx'
import ServiceDetails from './pages/ServiceDetails.jsx'
import Booking from './pages/Booking.jsx'
import MyBookings from './pages/MyBookings.jsx'
import Profile from './pages/Profile.jsx'
import Cart from './pages/Cart.jsx'

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LocationProvider>
          <CartProvider>
            <BrowserRouter>
              <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
              <Routes>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/services/:id" element={<ServiceDetails />} />
                  <Route
                    path="/cart"
                    element={
                      <ProtectedRoute>
                        <Cart />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/book/:id"
                    element={
                      <ProtectedRoute>
                        <Booking />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/bookings"
                    element={
                      <ProtectedRoute>
                        <MyBookings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                </Route>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </LocationProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
