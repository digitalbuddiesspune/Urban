import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ShieldCheck, Clock, Star } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext.jsx'

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: 'Verified pros', short: 'Verified pros' },
  { icon: Clock, label: 'On-time service', short: 'On-time' },
  { icon: Star, label: 'Top rated', short: 'Top rated' },
]

const blockStyle = (pos) => {
  const align = pos?.align || 'center'
  const transform =
    align === 'left' ? 'translate(0, -50%)' : align === 'right' ? 'translate(-100%, -50%)' : 'translate(-50%, -50%)'
  return {
    left: `${pos?.x ?? 50}%`,
    top: `${pos?.y ?? 50}%`,
    transform,
    textAlign: align,
    width: `${pos?.width ?? 90}%`,
    maxWidth: `${pos?.width ?? 90}%`,
    color: pos?.color || '#ffffff',
    fontSize: pos?.fontSize ? `${pos.fontSize}px` : undefined,
  }
}

const HeroBlock = ({ pos, className = '', children }) => {
  if (pos?.visible === false) return null
  return (
    <div className={`absolute z-10 ${className}`} style={blockStyle(pos)}>
      {children}
    </div>
  )
}

const Hero = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [search, setSearch] = useState('')
  const { content, images, heroLayout, heroSettings } = theme
  const desktop = heroLayout?.desktop || {}
  const mobile = heroLayout?.mobile || {}
  const overlay = (heroSettings?.overlayDarkness ?? 65) / 100

  const onSearch = (e) => {
    e.preventDefault()
    navigate(`/services?search=${encodeURIComponent(search)}`)
  }

  const searchForm = (size = 'desktop') => {
    if (size === 'mobile' && heroSettings?.showSearch === false) return null
    if (size === 'desktop' && heroSettings?.showSearch === false) return null
    const placeholder = size === 'mobile' ? content.searchPlaceholderMobile : content.searchPlaceholder
    return (
      <form
        onSubmit={onSearch}
        className={`flex w-full items-center gap-1 rounded-full bg-white shadow-lg ${
          size === 'mobile' ? 'p-1' : 'border border-white/40 bg-white/95 p-1.5 backdrop-blur-md'
        }`}
        style={{ borderRadius: theme.buttons?.radius || '9999px' }}
      >
        <div className="flex min-w-0 flex-1 items-center pl-2">
          <Search className={`shrink-0 text-slate-400 ${size === 'mobile' ? 'h-4 w-4' : 'ml-1 h-5 w-5'}`} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder || 'Search...'}
            className={`w-full min-w-0 bg-transparent text-slate-900 outline-none placeholder:text-slate-400 ${
              size === 'mobile' ? 'px-2.5 py-2.5 text-sm' : 'px-3 py-2.5 text-sm'
            }`}
          />
        </div>
        <button
          type="submit"
          className="btn-primary shrink-0 rounded-full px-5 py-2.5 text-xs font-semibold sm:text-sm"
          style={{ borderRadius: theme.buttons?.radius || '9999px', color: theme.colors?.buttonText || '#fff' }}
        >
          Search
        </button>
      </form>
    )
  }

  const trustRow = (size = 'desktop') => {
    if (heroSettings?.showTrustBadges === false) return null
    return (
      <div className={`flex items-center justify-center gap-0 ${size === 'mobile' ? '' : 'flex-wrap gap-3'}`}>
        {TRUST_ITEMS.map((item, i) => (
          <span key={item.label} className="flex items-center">
            {i > 0 && size === 'mobile' && <span className="mx-2 h-3 w-px bg-white/30" aria-hidden />}
            <span
              className={`inline-flex items-center gap-1 font-medium ${
                size === 'mobile'
                  ? 'text-[10px] text-white/90'
                  : 'rounded-full border border-white/25 bg-black/35 px-4 py-2 text-xs text-white backdrop-blur-sm'
              }`}
              style={{ color: mobile.trust?.color || desktop.trust?.color || undefined }}
            >
              <item.icon className={`shrink-0 ${size === 'mobile' ? 'h-3 w-3' : 'h-4 w-4'}`} strokeWidth={2.5} />
              {size === 'mobile' ? item.short : item.label}
            </span>
          </span>
        ))}
      </div>
    )
  }

  return (
    <section className="relative -mt-[3.75rem] w-full sm:-mt-20">
      <img src={images.heroMobile || '/mobileHeroBg.png'} alt="" className="block h-auto w-full sm:hidden" fetchPriority="high" />
      <img src={images.heroDesktop || '/heroBg.png'} alt="" className="hidden h-auto w-full sm:block" fetchPriority="high" />

      <div
        className="pointer-events-none absolute inset-0 sm:hidden"
        style={{
          background: `linear-gradient(to bottom, rgba(0,0,0,${overlay}) 0%, transparent 22%, transparent 45%, rgba(0,0,0,${overlay * 0.9}) 72%, rgba(0,0,0,${overlay * 1.1}) 100%)`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 hidden sm:block"
        style={{ background: `linear-gradient(135deg, rgba(0,0,0,${overlay + 0.1}) 0%, rgba(0,0,0,${overlay * 0.6}) 100%)` }}
        aria-hidden
      />

      <div className="absolute inset-0 sm:hidden">
        <HeroBlock pos={mobile.eyebrow}>
          <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3.5 py-1 font-semibold uppercase tracking-[0.18em] backdrop-blur-md">
            {content.heroEyebrow}
          </span>
        </HeroBlock>
        <HeroBlock pos={mobile.title}>
          <h1 className="font-bold leading-[1.12] tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">{content.heroTitle}</h1>
        </HeroBlock>
        <HeroBlock pos={mobile.subtitle}>
          <p className="leading-relaxed opacity-90">{content.heroSubtitleMobile}</p>
        </HeroBlock>
        <HeroBlock pos={mobile.search}>{searchForm('mobile')}</HeroBlock>
        <HeroBlock pos={mobile.trust}>{trustRow('mobile')}</HeroBlock>
      </div>

      <div className="absolute inset-0 hidden sm:block">
        <HeroBlock pos={desktop.eyebrow}>
          <p className="font-semibold uppercase tracking-[0.25em] opacity-75">{content.heroEyebrow}</p>
        </HeroBlock>
        <HeroBlock pos={desktop.title}>
          <h1 className="font-extrabold leading-[1.1] tracking-tight drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)]">{content.heroTitle}</h1>
        </HeroBlock>
        <HeroBlock pos={desktop.subtitle}>
          <p className="font-medium leading-relaxed opacity-90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">{content.heroSubtitle}</p>
        </HeroBlock>
        <HeroBlock pos={desktop.search}>{searchForm('desktop')}</HeroBlock>
        <HeroBlock pos={desktop.trust}>{trustRow('desktop')}</HeroBlock>
      </div>
    </section>
  )
}

export default Hero
