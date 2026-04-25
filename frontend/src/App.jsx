import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Header from './components/common/Header'
import Footer from './components/common/Footer'
import Landing from './pages/Landing'
import Booking from './pages/Booking'
import Confirmation from './pages/Confirmation'
import Admin from './pages/Admin'
import MyBookings from './pages/MyBookings'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { fontFamily: 'Poppins, sans-serif', fontSize: '14px' },
          success: { iconTheme: { primary: '#2d6e9e', secondary: 'white' } },
        }}
      />
      <Routes>
        {/* Admin: no public header/footer */}
        <Route path="/admin/*" element={<Admin />} />

        {/* Public routes with Header + Footer */}
        <Route path="*" element={<PublicLayout />} />
      </Routes>
    </BrowserRouter>
  )
}

function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/confirmation/:bookingId" element={<Confirmation />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}
