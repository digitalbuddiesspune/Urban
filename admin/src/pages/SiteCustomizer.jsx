import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Palette,
  Layout,
  Image as ImageIcon,
  RotateCcw,
  Save,
  ExternalLink,
  PanelTop,
  Home,
  Layers,
  Smartphone,
  Monitor,
  Type,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import api from '../api/axios.js'
import { PageLoader } from '../components/ui/Loader.jsx'
import Spinner from '../components/ui/Loader.jsx'
import HeroEditor from '../components/siteCustomizer/HeroEditor.jsx'
import SectionOrderEditor from '../components/siteCustomizer/SectionOrderEditor.jsx'

const USER_SITE_URL = import.meta.env.VITE_USER_SITE_URL || 'http://localhost:5173'

const TABS = [
  { id: 'hero', label: 'Hero editor', icon: Home },
  { id: 'sections', label: 'Page layout', icon: Layers },
  { id: 'style', label: 'Colors & style', icon: Palette },
  { id: 'navbar', label: 'Navbar', icon: PanelTop },
  { id: 'typography', label: 'Typography', icon: Type },
  { id: 'images', label: 'Images', icon: ImageIcon },
]

const NAVBAR_STYLES = [
  { id: 'glass', label: 'Glass', desc: 'Frosted blur effect' },
  { id: 'solid', label: 'Solid', desc: 'Clean white bar' },
  { id: 'dark', label: 'Dark', desc: 'Black navbar' },
]

const mergeTheme = (base, patch) => {
  const mergeSide = (sideBase = {}, sidePatch = {}) => {
    const out = { ...sideBase }
    Object.keys(sidePatch || {}).forEach((key) => {
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

const ColorField = ({ label, value, onChange }) => (
  <div>
    <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
    <div className="flex items-center gap-2">
      <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} className="h-9 w-10 cursor-pointer rounded border border-slate-200" />
      <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} className="input font-mono text-xs" />
    </div>
  </div>
)

const SiteCustomizer = () => {
  const [siteName, setSiteName] = useState('UrbanEase')
  const [theme, setTheme] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('hero')
  const [heroViewport, setHeroViewport] = useState('desktop')
  const [selectedHeroBlock, setSelectedHeroBlock] = useState('title')
  const [dragIdx, setDragIdx] = useState(null)
  const [previewKey, setPreviewKey] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const rootRef = useRef(null)

  const load = useCallback(() => {
    setLoading(true)
    api
      .get('/admin/site-theme')
      .then((r) => {
        setSiteName(r.data.siteName)
        setTheme(r.data.theme)
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const toggleFullscreen = useCallback(async () => {
    if (fullscreen) {
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen()
        } catch {
          /* ignore */
        }
      }
      setFullscreen(false)
      return
    }
    setFullscreen(true)
    try {
      await rootRef.current?.requestFullscreen?.()
    } catch {
      /* CSS fixed overlay still applies */
    }
  }, [fullscreen])

  useEffect(() => {
    const onFullscreenChange = () => {
      setFullscreen(document.fullscreenElement === rootRef.current)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  useEffect(() => {
    if (!fullscreen) return
    const onKey = (e) => {
      if (e.key === 'Escape' && !document.fullscreenElement) setFullscreen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fullscreen])

  const patchTheme = (patch) => setTheme((t) => mergeTheme(t, patch))

  const updateHeroLayout = (viewport, blockId, pos) => {
    setTheme((t) => mergeTheme(t, { heroLayout: { [viewport]: { [blockId]: pos } } }))
  }

  const save = async () => {
    setSaving(true)
    try {
      const { data } = await api.put('/admin/site-theme', { siteName, theme })
      setSiteName(data.siteName)
      setTheme(data.theme)
      setPreviewKey((k) => k + 1)
      toast.success('Published to user site!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const reset = async () => {
    if (!window.confirm('Reset all customizations to defaults?')) return
    setSaving(true)
    try {
      const { data } = await api.put('/admin/site-theme', { reset: true })
      setTheme(data.theme)
      setPreviewKey((k) => k + 1)
      toast.success('Reset to defaults')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !theme) return <PageLoader />

  const isHeroTab = tab === 'hero'

  return (
    <div
      ref={rootRef}
      className={`flex flex-col bg-white ${
        fullscreen
          ? 'fixed inset-0 z-[9999] h-screen w-screen'
          : `-m-4 lg:-m-8 ${isHeroTab ? 'h-[calc(100vh-3.5rem)]' : 'min-h-[calc(100vh-5rem)]'}`
      }`}
    >
      {/* Toolbar */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:px-8">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Site customizer</h1>
          <p className="text-xs text-slate-500">Visual editor — drag, sliders & publish</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isHeroTab && (
            <div className="mr-2 flex rounded-lg border border-slate-200 p-0.5">
              <button
                type="button"
                onClick={() => setHeroViewport('desktop')}
                className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium ${heroViewport === 'desktop' ? 'bg-black text-white' : 'text-slate-600'}`}
              >
                <Monitor className="h-3.5 w-3.5" /> Desktop
              </button>
              <button
                type="button"
                onClick={() => setHeroViewport('mobile')}
                className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium ${heroViewport === 'mobile' ? 'bg-black text-white' : 'text-slate-600'}`}
              >
                <Smartphone className="h-3.5 w-3.5" /> Mobile
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50"
            title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button type="button" onClick={reset} disabled={saving} className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50" title="Reset">
            <RotateCcw className="h-4 w-4" />
          </button>
          <a href={USER_SITE_URL} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
            <ExternalLink className="h-4 w-4" /> Live site
          </a>
          <button type="button" onClick={save} disabled={saving} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
            {saving ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            Publish
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-200 bg-white px-4 lg:px-8">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition ${
              tab === t.id ? 'border-black text-black' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex min-h-0 flex-1 flex-col">
        {isHeroTab ? (
          <div className="min-h-0 flex-1">
            <HeroEditor
              theme={theme}
              viewport={heroViewport}
              selected={selectedHeroBlock}
              onSelect={setSelectedHeroBlock}
              onLayoutChange={updateHeroLayout}
              onContentChange={(patch) => patchTheme({ content: patch })}
              onHeroSettingsChange={(patch) => patchTheme({ heroSettings: patch })}
              onImageChange={(vp, url) =>
                patchTheme({ images: vp === 'mobile' ? { heroMobile: url } : { heroDesktop: url } })
              }
              fullscreen={fullscreen}
              onToggleFullscreen={toggleFullscreen}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="mx-auto max-w-4xl">
              {tab === 'sections' && (
                <SectionOrderEditor
                  sections={theme.homeSections}
                  onReorder={(homeSections) => patchTheme({ homeSections })}
                  dragIdx={dragIdx}
                  setDragIdx={setDragIdx}
                />
              )}

              {tab === 'style' && (
                <div className="space-y-8">
                  <section className="card p-6">
                    <h3 className="font-semibold text-slate-800">Brand colors</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <ColorField label="Primary" value={theme.colors.primary} onChange={(v) => patchTheme({ colors: { primary: v } })} />
                      <ColorField label="Primary hover" value={theme.colors.primaryHover} onChange={(v) => patchTheme({ colors: { primaryHover: v } })} />
                      <ColorField label="Accent" value={theme.colors.accent} onChange={(v) => patchTheme({ colors: { accent: v } })} />
                      <ColorField label="Page background" value={theme.colors.background} onChange={(v) => patchTheme({ colors: { background: v } })} />
                      <ColorField label="Body text" value={theme.colors.text} onChange={(v) => patchTheme({ colors: { text: v } })} />
                      <ColorField label="Muted text" value={theme.colors.mutedText} onChange={(v) => patchTheme({ colors: { mutedText: v } })} />
                      <ColorField label="Button text" value={theme.colors.buttonText} onChange={(v) => patchTheme({ colors: { buttonText: v } })} />
                      <ColorField label="Card background" value={theme.colors.cardBackground} onChange={(v) => patchTheme({ colors: { cardBackground: v } })} />
                      <ColorField label="Card border" value={theme.colors.cardBorder} onChange={(v) => patchTheme({ colors: { cardBorder: v } })} />
                      <ColorField label="Footer background" value={theme.colors.footerBackground} onChange={(v) => patchTheme({ colors: { footerBackground: v } })} />
                      <ColorField label="Footer text" value={theme.colors.footerText} onChange={(v) => patchTheme({ colors: { footerText: v } })} />
                    </div>
                  </section>

                  <section className="card p-6">
                    <h3 className="flex items-center gap-2 font-semibold text-slate-800">
                      <Layout className="h-4 w-4" /> Cards
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <p className="mb-2 text-xs font-medium text-slate-600">Corner radius</p>
                        <div className="flex flex-wrap gap-2">
                          {['0.5rem', '1rem', '1.5rem', '2rem'].map((r) => (
                            <button key={r} type="button" onClick={() => patchTheme({ cards: { ...theme.cards, radius: r } })} className={`rounded-lg px-3 py-1.5 text-sm ${theme.cards.radius === r ? 'bg-black text-white' : 'bg-slate-100'}`}>
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-medium text-slate-600">Shadow</p>
                        <div className="flex flex-wrap gap-2">
                          {['none', 'soft', 'medium', 'strong'].map((s) => (
                            <button key={s} type="button" onClick={() => patchTheme({ cards: { ...theme.cards, shadow: s } })} className={`rounded-lg px-3 py-1.5 text-sm capitalize ${theme.cards.shadow === s ? 'bg-black text-white' : 'bg-slate-100'}`}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={theme.cards.border !== false} onChange={(e) => patchTheme({ cards: { ...theme.cards, border: e.target.checked } })} />
                        Show card borders
                      </label>
                    </div>
                  </section>

                  <section className="card p-6">
                    <h3 className="font-semibold text-slate-800">Buttons</h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {['0.5rem', '0.75rem', '9999px'].map((r) => (
                        <button key={r} type="button" onClick={() => patchTheme({ buttons: { ...theme.buttons, radius: r } })} className={`rounded-lg px-3 py-1.5 text-sm ${theme.buttons?.radius === r ? 'bg-black text-white' : 'bg-slate-100'}`}>
                          {r === '9999px' ? 'Pill' : r}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="card p-6">
                    <h3 className="font-semibold text-slate-800">Brand</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-medium text-slate-600">Site name</label>
                        <input className="input mt-1" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600">Navbar logo text</label>
                        <input className="input mt-1" value={theme.navbar.logoText} onChange={(e) => patchTheme({ navbar: { ...theme.navbar, logoText: e.target.value } })} />
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {tab === 'navbar' && (
                <div className="space-y-6">
                  <section className="card p-6">
                    <h3 className="font-semibold text-slate-800">Navbar style</h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {NAVBAR_STYLES.map((opt) => (
                        <button key={opt.id} type="button" onClick={() => patchTheme({ navbar: { ...theme.navbar, style: opt.id } })} className={`rounded-xl border p-4 text-left ${theme.navbar.style === opt.id ? 'border-black ring-1 ring-black' : 'border-slate-200'}`}>
                          <p className="font-medium">{opt.label}</p>
                          <p className="mt-1 text-xs text-slate-500">{opt.desc}</p>
                          <div className={`mt-3 h-8 rounded-full ${opt.id === 'dark' ? 'bg-black' : opt.id === 'solid' ? 'border border-slate-200 bg-white' : 'bg-white/60'}`} />
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                      {['pill', 'rounded', 'square'].map((shape) => (
                        <button key={shape} type="button" onClick={() => patchTheme({ navbar: { ...theme.navbar, shape } })} className={`rounded-lg px-4 py-2 text-sm capitalize ${theme.navbar.shape === shape ? 'bg-black text-white' : 'bg-slate-100'}`}>
                          {shape}
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {tab === 'typography' && (
                <section className="card p-6">
                  <h3 className="font-semibold text-slate-800">Hero text content</h3>
                  <p className="mt-1 text-sm text-slate-500">Edit all hero copy in one place. Position each block in the Hero editor tab.</p>
                  <div className="mt-4 space-y-3">
                    {[
                      ['heroEyebrow', 'Eyebrow'],
                      ['heroTitle', 'Headline'],
                      ['heroSubtitle', 'Subtitle (desktop)'],
                      ['heroSubtitleMobile', 'Subtitle (mobile)'],
                      ['searchPlaceholder', 'Search placeholder (desktop)'],
                      ['searchPlaceholderMobile', 'Search placeholder (mobile)'],
                    ].map(([key, label]) => (
                      <div key={key}>
                        <label className="text-xs font-medium text-slate-600">{label}</label>
                        <input className="input mt-1 text-sm" value={theme.content[key] || ''} onChange={(e) => patchTheme({ content: { [key]: e.target.value } })} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {tab === 'images' && (
                <section className="card p-6">
                  <h3 className="font-semibold text-slate-800">Page images</h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {[
                      ['heroDesktop', 'Hero desktop'],
                      ['heroMobile', 'Hero mobile'],
                      ['servicesBanner', 'Services banner'],
                      ['loginBackground', 'Login background'],
                      ['registerBackground', 'Register background'],
                    ].map(([key, label]) => (
                      <div key={key}>
                        <label className="text-xs font-medium text-slate-600">{label}</label>
                        <input className="input mt-1 text-sm" value={theme.images[key] || ''} onChange={(e) => patchTheme({ images: { [key]: e.target.value } })} placeholder="/image.png or https://..." />
                        {theme.images[key] && <img src={theme.images[key]} alt="" className="mt-2 h-28 w-full rounded-lg object-cover" />}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SiteCustomizer
