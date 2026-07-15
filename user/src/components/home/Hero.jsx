import { Link } from 'react-router-dom'
import { Grid3X3 } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext.jsx'

const TILES = [
  {
    key: 'instant',
    label: 'InstaHelp',
    categoryNames: ['Instant Help'],
    image: '/hero/instahelp.webp',
    href: '/services',
  },
  {
    key: 'women',
    label: "Women's Salon & Spa",
    categoryNames: ["Women's Salon"],
    image: '/hero/women-salon.webp',
  },
  {
    key: 'men',
    label: "Men's Salon & Massage",
    categoryNames: ["Men's Salon"],
    image: '/hero/men-salon.webp',
  },
  {
    key: 'cleaning',
    label: 'Cleaning & Pest Control',
    categoryNames: ['Cleaning Services', 'Pest Control'],
    image: '/hero/cleaning-pest.webp',
    badge: '30 mins',
  },
  {
    key: 'paint',
    label: 'Painting & Waterproofing',
    categoryNames: ['Home Improvement'],
    emoji: '🖌️',
  },
  {
    key: 'ac',
    label: 'AC & Appliance Repair',
    categoryNames: ['Appliance Repair'],
    emoji: '❄️',
    badge: '25 mins',
  },
  {
    key: 'home',
    label: 'Electrician, Plumber & Carpenter',
    categoryNames: ['Home Services'],
    emoji: '🔧',
    badge: '25 mins',
  },
  {
    key: 'all',
    label: 'All services',
    emoji: null,
    href: '/services',
  },
]

const PRODUCTS = [
  {
    label: 'Native Water Purifier',
    emoji: '🚰',
    badge: 'New',
    badgeTone: 'violet',
  },
  {
    label: 'Native Smart Locks',
    emoji: '🔐',
  },
]

const COLLAGE = {
  pro: {
    src: '/hero/pro.webp',
    alt: 'UrbanEase professional',
  },
  pest: {
    src: '/hero/pest.webp',
    alt: 'Pest control service',
  },
  cleaning: {
    src: '/hero/cleaning.webp',
    alt: 'Home cleaning service',
  },
  ac: {
    src: '/hero/ac.webp',
    alt: 'AC repair service',
  },
}

const resolveHref = (tile, categories = []) => {
  if (tile.href) return tile.href
  const match = categories.find((c) => tile.categoryNames?.includes(c.name))
  return match ? `/services?category=${match._id}` : '/services'
}

const ServiceTile = ({ tile, to }) => (
  <Link to={to} className="group flex flex-col items-center text-center">
    <div className="relative flex h-[72px] w-full items-center justify-center overflow-hidden rounded-xl bg-slate-100 transition group-hover:bg-slate-200/80 sm:h-[80px]">
      {tile.badge && (
        <span className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
          {tile.badge}
        </span>
      )}
      {tile.key === 'all' ? (
        <Grid3X3 className="h-8 w-8 text-slate-500" strokeWidth={1.75} />
      ) : tile.image ? (
        <img
          src={tile.image}
          alt=""
          className="h-full w-full object-contain object-center"
          loading="lazy"
        />
      ) : (
        <span className="text-3xl leading-none sm:text-[2rem]" role="img" aria-hidden>
          {tile.emoji}
        </span>
      )}
    </div>
    <span className="mt-2 line-clamp-2 text-[11px] font-medium leading-snug text-slate-800 sm:text-xs">
      {tile.label}
    </span>
  </Link>
)

const Hero = ({ categories = [] }) => {
  const { theme } = useTheme()
  const title = theme.content?.heroTitle || 'Home services at your doorstep'

  return (
    <section className="bg-white pt-4 sm:pt-6">
      <div className="mx-auto grid max-w-6xl items-start gap-8 px-4 pb-6 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:pb-10 lg:pt-2">
        {/* Left: headline + service picker */}
        <div className="min-w-0">
          <h1 className="whitespace-nowrap text-center text-[1.35rem] font-bold leading-tight tracking-tight text-slate-900 sm:text-left sm:text-3xl lg:text-[2.25rem]">
            {title}
          </h1>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:mt-6 sm:p-5">
            <div className="grid grid-cols-4 gap-x-2 gap-y-4 sm:gap-x-3 sm:gap-y-5">
              {TILES.map((tile) => (
                <ServiceTile key={tile.key} tile={tile} to={resolveHref(tile, categories)} />
              ))}
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4 sm:mt-6 sm:pt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Native Smart Products</p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4">
                {PRODUCTS.map((product) => (
                  <div key={product.label} className="relative flex flex-col items-center rounded-xl bg-slate-50 px-3 py-3 text-center">
                    {product.badge && (
                      <span className="absolute left-2 top-2 rounded bg-violet-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {product.badge}
                      </span>
                    )}
                    <span className="text-3xl" role="img" aria-hidden>
                      {product.emoji}
                    </span>
                    <span className="mt-2 text-[11px] font-medium leading-snug text-slate-800 sm:text-xs">
                      {product.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: photo collage (tall | short / short | tall) */}
        <div className="hidden h-[480px] grid-cols-2 gap-3 lg:grid xl:h-[520px] xl:gap-4">
          <div className="flex min-h-0 flex-col gap-3 xl:gap-4">
            <div className="min-h-0 flex-[1.35] overflow-hidden rounded-2xl bg-slate-100">
              <img src={COLLAGE.pro.src} alt={COLLAGE.pro.alt} className="h-full w-full object-cover" loading="eager" />
            </div>
            <div className="min-h-0 flex-1 overflow-hidden rounded-2xl bg-slate-100">
              <img src={COLLAGE.pest.src} alt={COLLAGE.pest.alt} className="h-full w-full object-cover" loading="lazy" />
            </div>
          </div>
          <div className="flex min-h-0 flex-col gap-3 xl:gap-4">
            <div className="min-h-0 flex-1 overflow-hidden rounded-2xl bg-slate-100">
              <img src={COLLAGE.cleaning.src} alt={COLLAGE.cleaning.alt} className="h-full w-full object-cover" loading="eager" />
            </div>
            <div className="min-h-0 flex-[1.35] overflow-hidden rounded-2xl bg-slate-100">
              <img src={COLLAGE.ac.src} alt={COLLAGE.ac.alt} className="h-full w-full object-cover object-center" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
