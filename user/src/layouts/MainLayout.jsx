import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

const MainLayout = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <main className="flex-1 overflow-x-clip">
      <Outlet />
    </main>
    <Footer />
  </div>
)

export default MainLayout
