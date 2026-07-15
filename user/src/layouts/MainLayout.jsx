import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import MobileBottomNav from '../components/MobileBottomNav.jsx'

const MainLayout = () => (
  <div className="flex min-h-screen flex-col pb-16 md:pb-0">
    <Navbar />
    <main className="flex-1 overflow-x-clip">
      <Outlet />
    </main>
    <Footer />
    <MobileBottomNav />
  </div>
)

export default MainLayout
