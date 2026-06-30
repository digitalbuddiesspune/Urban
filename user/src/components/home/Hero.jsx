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
      <div className="mx-auto max-w-6xl px-4 py-12 text-center text-white sm:px-6 sm:py-20 md:py-24">
        <h1 className="mx-auto max-w-3xl text-2xl font-bold leading-tight xs:text-3xl sm:text-4xl md:text-5xl">
          Home services at your doorstep
        </h1>
        <p className="mx-auto mt-3 max-w-xl px-2 text-sm text-violet-100 sm:mt-4 sm:text-base">
          Book trusted professionals for AC repair, cleaning, salon, plumbing and more — in just a few taps.
        </p>
        <form
          onSubmit={onSearch}
          className="mx-auto mt-6 flex max-w-xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-lg sm:mt-8 sm:flex-row sm:items-center"
        >
          <div className="flex min-w-0 flex-1 items-center">
            <Search className="ml-2 h-5 w-5 shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for a service..."
              className="w-full min-w-0 bg-transparent px-2 py-2.5 text-base text-slate-800 outline-none sm:py-2"
            />
          </div>
          <button type="submit" className="btn-primary w-full shrink-0 px-5 py-2.5 sm:w-auto">
            Search
          </button>
        </form>
        <div className="mt-6 flex flex-col items-center gap-3 text-sm text-violet-100 sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6">
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
