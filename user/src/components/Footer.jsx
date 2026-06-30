import { Link } from 'react-router-dom'
import { Sparkles, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react'

const Footer = () => {
  const year = new Date().getFullYear()

  const explore = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'All services' },
    { to: '/services', label: 'Browse categories' },
  ]

  const account = [
    { to: '/login', label: 'Login' },
    { to: '/register', label: 'Sign up' },
    { to: '/bookings', label: 'My bookings' },
    { to: '/profile', label: 'Profile' },
  ]

  const services = [
    'AC Repair',
    'Electrician',
    'Plumbing',
    'Home Cleaning',
    'Salon at Home',
    'Appliance Repair',
  ]

  return (
    <footer className="mt-12 border-t border-slate-200 bg-black text-white sm:mt-20">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="text-xl font-bold tracking-tight">UrbanEase</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Premium home services at your doorstep. Book trusted professionals for repairs, cleaning, salon, and more.
            </p>
            <div className="mt-6 space-y-2.5 text-sm text-slate-400">
              <a href="mailto:support@urbanease.com" className="flex items-center gap-2 transition hover:text-white">
                <Mail className="h-4 w-4 shrink-0" /> support@urbanease.com
              </a>
              <span className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" /> +91 98765 43210
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" /> Pune & Mumbai
              </span>
            </div>
          </div>

          {/* Explore */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Explore</h3>
            <ul className="mt-4 space-y-3">
              {explore.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-slate-300 transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Account</h3>
            <ul className="mt-4 space-y-3">
              {account.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-slate-300 transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular services */}
          <div className="lg:col-span-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Popular services</h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
              {services.map((name) => (
                <li key={name}>
                  <Link
                    to="/services"
                    className="group flex items-center gap-1 text-sm text-slate-300 transition hover:text-white"
                  >
                    {name}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA strip */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 px-6 py-6 sm:flex-row">
          <div>
            <p className="font-semibold text-white">Need help booking a service?</p>
            <p className="mt-0.5 text-sm text-slate-400">Our team is available 7 days a week.</p>
          </div>
          <Link
            to="/services"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-slate-200"
          >
            Book a service
          </Link>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-slate-500">© {year} UrbanEase. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
            <span className="cursor-default transition hover:text-slate-300">Privacy Policy</span>
            <span className="text-slate-700">·</span>
            <span className="cursor-default transition hover:text-slate-300">Terms of Service</span>
            <span className="text-slate-700">·</span>
            <span className="cursor-default transition hover:text-slate-300">Refund Policy</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
