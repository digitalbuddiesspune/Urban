export const defaultBlock = (overrides = {}) => ({
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
    heroText: '#ffffff',
    buttonText: '#ffffff',
  },
  navbar: {
    style: 'glass',
    shape: 'pill',
    logoText: 'UrbanEase',
  },
  cards: {
    radius: '1rem',
    shadow: 'medium',
    border: true,
  },
  buttons: {
    radius: '0.75rem',
    style: 'solid',
  },
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
  heroSettings: {
    overlayDarkness: 65,
    showTrustBadges: true,
    showSearch: true,
  },
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
  homeSections: ['hero', 'popular', 'categories', 'testimonials'],
}

export const HOME_SECTION_LABELS = {
  hero: 'Hero banner',
  categories: 'Browse by category',
  popular: 'Most booked services',
  testimonials: 'Testimonials',
}

export const mergeUserSiteTheme = (base, patch) => {
  if (!patch) return { ...base }
  const mergeSide = (sideBase = {}, sidePatch = {}) => {
    const out = { ...sideBase }
    Object.keys(sidePatch).forEach((key) => {
      out[key] = { ...sideBase[key], ...sidePatch[key] }
    })
    return out
  }
  return {
    ...base,
    ...patch,
    colors: { ...base.colors, ...(patch.colors || {}) },
    navbar: { ...base.navbar, ...(patch.navbar || {}) },
    cards: { ...base.cards, ...(patch.cards || {}) },
    buttons: { ...base.buttons, ...(patch.buttons || {}) },
    images: { ...base.images, ...(patch.images || {}) },
    content: { ...base.content, ...(patch.content || {}) },
    heroSettings: { ...base.heroSettings, ...(patch.heroSettings || {}) },
    heroLayout: {
      desktop: mergeSide(base.heroLayout?.desktop, patch.heroLayout?.desktop),
      mobile: mergeSide(base.heroLayout?.mobile, patch.heroLayout?.mobile),
    },
    homeSections: patch.homeSections || base.homeSections,
  }
}
