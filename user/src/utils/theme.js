const defaultBlock = (overrides = {}) => ({
  x: 50,
  y: 50,
  align: 'center',
  width: 90,
  fontSize: 16,
  color: '#ffffff',
  visible: true,
  ...overrides,
})

export const defaultUserSiteTheme = {
  colors: {
    primary: '#000000',
    primaryHover: '#1f1f1f',
    accent: '#000000',
    background: '#ffffff',
    text: '#0a0a0a',
    mutedText: '#64748b',
    cardBackground: '#ffffff',
    cardBorder: '#e8e8e8',
    footerBackground: '#000000',
    footerText: '#ffffff',
    buttonText: '#ffffff',
  },
  navbar: { style: 'glass', shape: 'pill', logoText: 'UrbanEase' },
  cards: { radius: '1rem', shadow: 'medium', border: true },
  buttons: { radius: '0.75rem', style: 'solid' },
  images: {
    heroDesktop: '/heroBg.png',
    heroMobile: '/mobileHeroBg.png',
    servicesBanner: '',
    loginBackground: '',
    registerBackground: '',
  },
  content: {
    heroEyebrow: 'Trusted home care',
    heroTitle: 'Home services at your doorstep',
    heroSubtitle:
      'Book verified professionals for AC repair, cleaning, salon, plumbing and more — in just a few taps.',
    heroSubtitleMobile: 'Book verified pros for AC, cleaning, salon, plumbing & more.',
    searchPlaceholder: 'Search for a service...',
    searchPlaceholderMobile: 'Search services...',
  },
  heroSettings: { overlayDarkness: 65, showTrustBadges: true, showSearch: true },
  heroLayout: {
    desktop: {
      eyebrow: defaultBlock({ x: 50, y: 18, fontSize: 13, width: 70 }),
      title: defaultBlock({ x: 50, y: 38, fontSize: 52, width: 92 }),
      subtitle: defaultBlock({ x: 50, y: 52, fontSize: 18, width: 75 }),
      search: defaultBlock({ x: 50, y: 66, fontSize: 14, width: 70 }),
      trust: defaultBlock({ x: 50, y: 82, fontSize: 12, width: 80 }),
    },
    mobile: {
      eyebrow: defaultBlock({ x: 50, y: 12, fontSize: 10, width: 85 }),
      title: defaultBlock({ x: 50, y: 68, fontSize: 24, width: 90 }),
      subtitle: defaultBlock({ x: 50, y: 76, fontSize: 11, width: 85 }),
      search: defaultBlock({ x: 50, y: 86, fontSize: 13, width: 92 }),
      trust: defaultBlock({ x: 50, y: 94, fontSize: 10, width: 90 }),
    },
  },
  homeSections: ['hero', 'categories', 'popular', 'testimonials'],
}

const CARD_SHADOWS = {
  none: 'none',
  soft: '0 1px 3px rgba(0, 0, 0, 0.06)',
  medium: '0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.05)',
  strong: '0 8px 30px rgba(0, 0, 0, 0.12)',
}

export const applyThemeToDocument = (theme) => {
  if (!theme) return
  const root = document.documentElement
  const { colors, cards, navbar, buttons } = theme

  root.style.setProperty('--theme-primary', colors.primary)
  root.style.setProperty('--theme-primary-hover', colors.primaryHover)
  root.style.setProperty('--theme-accent', colors.accent)
  root.style.setProperty('--theme-bg', colors.background)
  root.style.setProperty('--theme-text', colors.text)
  root.style.setProperty('--theme-muted', colors.mutedText)
  root.style.setProperty('--theme-card-bg', colors.cardBackground)
  root.style.setProperty('--theme-card-border', colors.cardBorder)
  root.style.setProperty('--theme-footer-bg', colors.footerBackground)
  root.style.setProperty('--theme-footer-text', colors.footerText)
  root.style.setProperty('--theme-btn-radius', buttons?.radius || '0.75rem')
  root.style.setProperty('--theme-btn-text', colors.buttonText || '#ffffff')
  root.style.setProperty('--theme-card-radius', cards.radius)
  root.style.setProperty('--theme-card-shadow', CARD_SHADOWS[cards.shadow] || CARD_SHADOWS.medium)
  root.style.setProperty('--theme-card-border-width', cards.border ? '1px' : '0px')
  root.style.setProperty('--brand', colors.primary)
  root.style.setProperty('--brand-2', colors.primaryHover)

  document.body.style.background = colors.background
  document.body.style.color = colors.text
  root.dataset.navbarStyle = navbar.style
  root.dataset.navbarShape = navbar.shape
}

export const getNavbarShellClass = (navbar) => {
  const shape =
    navbar.shape === 'pill'
      ? 'max-md:rounded-2xl md:rounded-full'
      : navbar.shape === 'rounded'
        ? 'rounded-2xl'
        : 'rounded-lg'

  if (navbar.style === 'dark') {
    return `border border-white/10 bg-black/90 text-white shadow-lg backdrop-blur-xl ${shape}`
  }
  if (navbar.style === 'solid') {
    return `border border-slate-200 bg-white shadow-sm ${shape}`
  }
  return `border border-white/40 bg-white/65 shadow-[0_4px_24px_rgba(0,0,0,0.1)] backdrop-blur-xl md:border-slate-200 md:bg-white md:shadow-[0_4px_24px_rgba(0,0,0,0.08)] md:backdrop-blur-none ${shape}`
}

export const getNavbarMobilePanelClass = (navbar) => {
  if (navbar.style === 'dark') return 'border-white/10 bg-black/90 text-white backdrop-blur-xl'
  if (navbar.style === 'solid') return 'border-slate-200 bg-white'
  return 'border-white/40 bg-white/65 backdrop-blur-xl md:border-slate-200 md:bg-white md:shadow-none md:backdrop-blur-none'
}
