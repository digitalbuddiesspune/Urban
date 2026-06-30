import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ShieldCheck, Clock, Star } from 'lucide-react'

const Hero = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const onSearch = (e) => {
    e.preventDefault()
    navigate(`/services?search=${encodeURIComponent(search)}`)
  }

  return (
    <section className="brand-gradient">
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-white sm:py-24">
        <h1 className="mx-auto max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">
          Home services at your doorstep
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-violet-100">
          Book trusted professionals for AC repair, cleaning, salon, plumbing and more — in just a few taps.
        </p>
        <form onSubmit={onSearch} className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl bg-white p-2 shadow-lg">
          <Search className="ml-2 h-5 w-5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for a service..."
            className="flex-1 bg-transparent px-2 py-2 text-slate-800 outline-none"
          />
          <button type="submit" className="btn-primary px-5 py-2.5">
            Search
          </button>
        </form>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-violet-100">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Verified pros
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> On-time service
          </span>
          <span className="flex items-center gap-2">
            <Star className="h-4 w-4" /> Top rated
          </span>
        </div>
      </div>
    </section>
  )
}

export default Hero
