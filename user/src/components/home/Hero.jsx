import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ShieldCheck, Clock, Star } from 'lucide-react'

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: 'Verified pros', short: 'Verified pros' },
  { icon: Clock, label: 'On-time service', short: 'On-time' },
  { icon: Star, label: 'Top rated', short: 'Top rated' },
]

const Hero = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const onSearch = (e) => {
    e.preventDefault()
    navigate(`/services?search=${encodeURIComponent(search)}`)
  }

  return (
    <section className="relative w-full">
      <img
        src="/mobileHeroBg.png"
        alt=""
        width={469}
        height={587}
        className="block h-auto w-full sm:hidden"
        fetchPriority="high"
      />
      <img
        src="/heroBg.png"
        alt=""
        width={1672}
        height={941}
        className="hidden h-auto w-full sm:block"
        fetchPriority="high"
      />

      {/* Mobile — clear center for faces; scrim at top + bottom only */}
      <div
        className="pointer-events-none absolute inset-0 sm:hidden"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 16%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.45) 72%, rgba(0,0,0,0.62) 100%)',
        }}
        aria-hidden
      />
      {/* Desktop */}
      <div
        className="pointer-events-none absolute inset-0 hidden sm:block"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.45) 100%)',
        }}
        aria-hidden
      />

      {/* ── Mobile: eyebrow under navbar · copy + actions at bottom ── */}
      <div className="absolute inset-0 z-10 flex flex-col sm:hidden">
        <div className="px-4 pt-[3.75rem] text-center">
          <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/95 backdrop-blur-md">
            Trusted home care
          </span>
        </div>

        <div className="mt-auto px-4 pb-5 text-center">
          <h1 className="mx-auto max-w-[20rem] text-2xl font-bold leading-[1.12] tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
            Home services at your doorstep
          </h1>
          <p className="mx-auto mt-2 max-w-[16rem] text-[11px] leading-relaxed text-white/90">
            Book verified pros for AC, cleaning, salon, plumbing & more.
          </p>

          <form
            onSubmit={onSearch}
            className="mx-auto mt-4 flex w-full max-w-md items-center gap-1 rounded-full bg-white p-1 shadow-[0_8px_32px_rgba(0,0,0,0.22)]"
          >
            <div className="flex min-w-0 flex-1 items-center pl-2">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search services..."
                className="w-full min-w-0 bg-transparent px-2.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
              />
            </div>
            <button
              type="submit"
              className="btn-primary shrink-0 rounded-full px-5 py-2.5 text-xs font-semibold"
            >
              Search
            </button>
          </form>

          <div className="mx-auto mt-3 flex max-w-md items-center justify-center gap-0">
            {TRUST_ITEMS.map((item, i) => (
              <span key={item.label} className="flex items-center">
                {i > 0 && <span className="mx-2 h-3 w-px bg-white/30" aria-hidden />}
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-white/90">
                  <item.icon className="h-3 w-3 shrink-0 text-white/80" strokeWidth={2.5} />
                  {item.short}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Desktop / tablet layout ── */}
      <div className="absolute inset-0 z-10 hidden flex-col items-center justify-center px-6 py-8 text-center sm:flex">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/75">
          Trusted home care
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl text-5xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)] md:text-[3.25rem]">
          Home services at your doorstep
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base font-medium leading-relaxed text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)] md:text-lg">
          Book verified professionals for AC repair, cleaning, salon, plumbing and more — in just a few taps.
        </p>
        <form
          onSubmit={onSearch}
          className="mx-auto mt-9 flex w-full max-w-xl flex-row items-center rounded-full border border-white/40 bg-white/95 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.18)] backdrop-blur-md"
        >
          <div className="flex min-w-0 flex-1 items-center pl-1">
            <Search className="ml-3 h-5 w-5 shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for a service..."
              className="w-full min-w-0 bg-transparent px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
            />
          </div>
          <button type="submit" className="btn-primary shrink-0 rounded-full px-8 py-2.5 text-sm font-semibold tracking-wide">
            Search
          </button>
        </form>
        <div className="mt-9 flex flex-row flex-wrap items-center justify-center gap-3">
          {TRUST_ITEMS.map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/35 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm"
            >
              <item.icon className="h-4 w-4 shrink-0" /> {item.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero
