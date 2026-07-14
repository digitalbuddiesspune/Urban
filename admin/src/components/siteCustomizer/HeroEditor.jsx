import { useEffect, useRef, useState } from 'react'
import { Move, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react'
import HeroInspector from './HeroInspector.jsx'

const HERO_BLOCKS = [
  { id: 'eyebrow', label: 'Eyebrow' },
  { id: 'title', label: 'Headline' },
  { id: 'subtitle', label: 'Subtitle' },
  { id: 'search', label: 'Search bar' },
  { id: 'trust', label: 'Trust badges' },
]

const snap = (val, grid) => (grid ? Math.round(val / 5) * 5 : val)

const HeroEditor = ({
  theme,
  viewport,
  selected,
  onSelect,
  onLayoutChange,
  onContentChange,
  onHeroSettingsChange,
  onImageChange,
  fullscreen = false,
  onToggleFullscreen,
}) => {
  const canvasRef = useRef(null)
  const [dragging, setDragging] = useState(null)
  const [zoom, setZoom] = useState(100)
  const [snapGrid, setSnapGrid] = useState(true)
  const layout = theme.heroLayout?.[viewport] || {}
  const image = viewport === 'mobile' ? theme.images.heroMobile : theme.images.heroDesktop
  const content = theme.content
  const settings = theme.heroSettings || {}
  const overlay = (settings.overlayDarkness ?? 65) / 100

  const blockText = (id) => {
    if (id === 'eyebrow') return content.heroEyebrow
    if (id === 'title') return content.heroTitle
    if (id === 'subtitle') return viewport === 'mobile' ? content.heroSubtitleMobile : content.heroSubtitle
    if (id === 'search') return viewport === 'mobile' ? content.searchPlaceholderMobile : content.searchPlaceholder
    return 'Verified · On-time · Top rated'
  }

  const isBlockVisible = (id) => {
    if (id === 'search' && settings.showSearch === false) return false
    if (id === 'trust' && settings.showTrustBadges === false) return false
    const pos = layout[id]
    return pos?.visible !== false
  }

  const startDrag = (id, e) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    onSelect(id)
    setDragging(id)
    const rect = canvasRef.current.getBoundingClientRect()
    const pos = layout[id] || { x: 50, y: 50, align: 'center' }

    const onMove = (ev) => {
      let x = ((ev.clientX - rect.left) / rect.width) * 100
      let y = ((ev.clientY - rect.top) / rect.height) * 100
      x = snap(Math.min(99, Math.max(1, x)), snapGrid)
      y = snap(Math.min(99, Math.max(1, y)), snapGrid)
      onLayoutChange(viewport, id, { ...pos, x: Math.round(x), y: Math.round(y) })
    }

    const onUp = () => {
      setDragging(null)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  // Keyboard nudge
  useEffect(() => {
    if (!selected) return
    const pos = layout[selected]
    if (!pos) return

    const onKey = (e) => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return
      e.preventDefault()
      const step = e.shiftKey ? 5 : 1
      let { x = 50, y = 50 } = pos
      if (e.key === 'ArrowLeft') x -= step
      if (e.key === 'ArrowRight') x += step
      if (e.key === 'ArrowUp') y -= step
      if (e.key === 'ArrowDown') y += step
      x = Math.min(99, Math.max(1, x))
      y = Math.min(99, Math.max(1, y))
      onLayoutChange(viewport, selected, { ...pos, x, y })
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, layout, viewport, onLayoutChange])

  const canvasW = fullscreen ? (viewport === 'mobile' ? 440 : 1500) : viewport === 'mobile' ? 390 : 1200
  const canvasH = fullscreen ? (viewport === 'mobile' ? 860 : 860) : viewport === 'mobile' ? 780 : 680

  return (
    <div className="flex h-full min-h-0">
      {/* Canvas workspace */}
      <div className="flex min-w-0 flex-1 flex-col bg-slate-100">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2">
          <p className="text-sm text-slate-600">
            <strong>Drag</strong> elements · <strong>Click</strong> to select · <strong>Arrow keys</strong> to nudge
          </p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setZoom((z) => Math.max(50, z - 10))} className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50" title="Zoom out">
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="min-w-[3rem] text-center text-xs font-medium text-slate-600">{zoom}%</span>
            <button type="button" onClick={() => setZoom((z) => Math.min(150, z + 10))} className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50" title="Zoom in">
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onToggleFullscreen}
              className={`rounded-lg border px-2 py-1.5 text-xs hover:bg-slate-50 ${
                fullscreen ? 'border-black bg-black text-white' : 'border-slate-200'
              }`}
              title={fullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen editor'}
            >
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="flex min-h-full items-center justify-center">
            <div
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
              className="transition-transform"
            >
              <div
                ref={canvasRef}
                className="relative overflow-hidden rounded-xl border-2 border-slate-300 bg-slate-900 shadow-2xl"
                style={{ width: canvasW, height: canvasH }}
                onClick={() => onSelect(null)}
              >
                <img src={image || '/heroBg.png'} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      viewport === 'mobile'
                        ? `linear-gradient(to bottom, rgba(0,0,0,${overlay}) 0%, transparent 22%, transparent 45%, rgba(0,0,0,${overlay * 0.9}) 72%, rgba(0,0,0,${overlay * 1.1}) 100%)`
                        : `linear-gradient(135deg, rgba(0,0,0,${overlay + 0.1}) 0%, rgba(0,0,0,${overlay * 0.6}) 100%)`,
                  }}
                />

                {/* 10% grid */}
                <div className="pointer-events-none absolute inset-0">
                  {Array.from({ length: 9 }, (_, i) => (i + 1) * 10).map((p) => (
                    <div key={`g${p}`}>
                      <div className="absolute top-0 bottom-0 w-px bg-white/15" style={{ left: `${p}%` }} />
                      <div className="absolute left-0 right-0 h-px bg-white/15" style={{ top: `${p}%` }} />
                    </div>
                  ))}
                </div>

                {HERO_BLOCKS.map((block) => {
                  if (!isBlockVisible(block.id)) return null
                  const pos = layout[block.id] || { x: 50, y: 50, align: 'center', width: 90, fontSize: 16, color: '#fff' }
                  const isSelected = selected === block.id
                  const transform =
                    pos.align === 'left'
                      ? 'translate(0, -50%)'
                      : pos.align === 'right'
                        ? 'translate(-100%, -50%)'
                        : 'translate(-50%, -50%)'

                  return (
                    <div
                      key={block.id}
                      onPointerDown={(e) => startDrag(block.id, e)}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelect(block.id)
                      }}
                      className={`absolute cursor-grab select-none rounded-lg border-2 px-3 py-2 shadow-xl active:cursor-grabbing ${
                        isSelected || dragging === block.id
                          ? 'border-yellow-400 bg-black/75 ring-2 ring-yellow-400/60'
                          : 'border-white/50 bg-black/55 hover:border-white/80'
                      }`}
                      style={{
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
                        transform,
                        width: `${pos.width ?? 90}%`,
                        maxWidth: `${pos.width ?? 90}%`,
                        textAlign: pos.align || 'center',
                        color: pos.color || '#ffffff',
                        fontSize: pos.fontSize ? `${pos.fontSize}px` : undefined,
                      }}
                    >
                      <div className="mb-0.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-yellow-300">
                        <Move className="h-3 w-3" /> {block.label}
                      </div>
                      <p className={`leading-snug ${block.id === 'title' ? 'font-bold' : block.id === 'eyebrow' ? 'uppercase' : ''}`}>
                        {blockText(block.id)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inspector sidebar */}
      <div className={`shrink-0 ${fullscreen ? 'w-96' : 'w-80'}`}>
        <HeroInspector
          theme={theme}
          viewport={viewport}
          selected={selected}
          onSelect={onSelect}
          onLayoutChange={onLayoutChange}
          onContentChange={onContentChange}
          onHeroSettingsChange={onHeroSettingsChange}
          onImageChange={onImageChange}
          snapGrid={snapGrid}
          onSnapChange={setSnapGrid}
        />
      </div>
    </div>
  )
}

export default HeroEditor
