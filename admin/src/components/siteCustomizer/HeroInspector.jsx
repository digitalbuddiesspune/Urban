import { AlignLeft, AlignCenter, AlignRight, Eye, EyeOff, Move } from 'lucide-react'

const BLOCK_LABELS = {
  eyebrow: 'Eyebrow',
  title: 'Headline',
  subtitle: 'Subtitle',
  search: 'Search bar',
  trust: 'Trust badges',
}

const alignIcon = (align) => {
  if (align === 'left') return AlignLeft
  if (align === 'right') return AlignRight
  return AlignCenter
}

const Slider = ({ label, value, min, max, step = 1, unit = '', onChange }) => (
  <div>
    <div className="mb-1 flex justify-between text-xs">
      <span className="font-medium text-slate-600">{label}</span>
      <span className="text-slate-400">
        {value}
        {unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-black"
    />
  </div>
)

const HeroInspector = ({
  theme,
  viewport,
  selected,
  onSelect,
  onLayoutChange,
  onContentChange,
  onHeroSettingsChange,
  onImageChange,
  snapGrid,
  onSnapChange,
}) => {
  const layout = theme.heroLayout?.[viewport] || {}
  const content = theme.content
  const settings = theme.heroSettings || {}
  const pos = selected ? layout[selected] : null

  const updateBlock = (patch) => {
    if (!selected) return
    onLayoutChange(viewport, selected, { ...pos, ...patch })
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto border-l border-slate-200 bg-slate-50">
      <div className="border-b border-slate-200 bg-white p-4">
        <h3 className="font-semibold text-slate-900">Inspector</h3>
        <p className="mt-0.5 text-xs text-slate-500">Fine-tune position, size & style</p>
      </div>

      {/* Global hero settings */}
      <div className="space-y-4 border-b border-slate-200 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Hero settings</p>
        <Slider
          label="Overlay darkness"
          value={settings.overlayDarkness ?? 65}
          min={0}
          max={90}
          unit="%"
          onChange={(v) => onHeroSettingsChange({ overlayDarkness: v })}
        />
        <label className="flex items-center justify-between text-sm text-slate-700">
          <span>Show search bar</span>
          <input
            type="checkbox"
            checked={settings.showSearch !== false}
            onChange={(e) => onHeroSettingsChange({ showSearch: e.target.checked })}
            className="h-4 w-4"
          />
        </label>
        <label className="flex items-center justify-between text-sm text-slate-700">
          <span>Show trust badges</span>
          <input
            type="checkbox"
            checked={settings.showTrustBadges !== false}
            onChange={(e) => onHeroSettingsChange({ showTrustBadges: e.target.checked })}
            className="h-4 w-4"
          />
        </label>
        <label className="flex items-center justify-between text-sm text-slate-700">
          <span>Snap to grid (5%)</span>
          <input type="checkbox" checked={snapGrid} onChange={(e) => onSnapChange(e.target.checked)} className="h-4 w-4" />
        </label>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Hero image URL</label>
          <input
            className="input text-xs"
            value={viewport === 'mobile' ? theme.images.heroMobile : theme.images.heroDesktop}
            onChange={(e) => onImageChange(viewport, e.target.value)}
          />
        </div>
      </div>

      {/* Block list */}
      <div className="space-y-2 border-b border-slate-200 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Elements</p>
        {Object.keys(BLOCK_LABELS).map((id) => {
          const block = layout[id] || {}
          const isActive = selected === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                isActive ? 'border-black bg-black text-white' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <Move className="h-3.5 w-3.5" />
                {BLOCK_LABELS[id]}
              </span>
              {block.visible === false ? <EyeOff className="h-3.5 w-3.5 opacity-60" /> : <Eye className="h-3.5 w-3.5 opacity-40" />}
            </button>
          )
        })}
      </div>

      {/* Selected block controls */}
      {selected && pos && (
        <div className="space-y-4 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{BLOCK_LABELS[selected]}</p>

          <label className="flex items-center justify-between text-sm">
            <span>Visible on site</span>
            <input
              type="checkbox"
              checked={pos.visible !== false}
              onChange={(e) => updateBlock({ visible: e.target.checked })}
              className="h-4 w-4"
            />
          </label>

          {selected !== 'search' && selected !== 'trust' && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Text</label>
              <textarea
                className="input min-h-[72px] text-sm"
                value={
                  selected === 'eyebrow'
                    ? content.heroEyebrow
                    : selected === 'title'
                      ? content.heroTitle
                      : viewport === 'mobile'
                        ? content.heroSubtitleMobile
                        : content.heroSubtitle
                }
                onChange={(e) => {
                  const key =
                    selected === 'eyebrow'
                      ? 'heroEyebrow'
                      : selected === 'title'
                        ? 'heroTitle'
                        : viewport === 'mobile'
                          ? 'heroSubtitleMobile'
                          : 'heroSubtitle'
                  onContentChange({ [key]: e.target.value })
                }}
              />
            </div>
          )}

          {selected === 'search' && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Placeholder</label>
              <input
                className="input text-sm"
                value={viewport === 'mobile' ? content.searchPlaceholderMobile : content.searchPlaceholder}
                onChange={(e) =>
                  onContentChange(
                    viewport === 'mobile'
                      ? { searchPlaceholderMobile: e.target.value }
                      : { searchPlaceholder: e.target.value },
                  )
                }
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Alignment</label>
            <div className="flex gap-1">
              {['left', 'center', 'right'].map((align) => {
                const Icon = alignIcon(align)
                return (
                  <button
                    key={align}
                    type="button"
                    onClick={() => updateBlock({ align })}
                    className={`flex h-9 flex-1 items-center justify-center rounded-lg border ${
                      pos.align === align ? 'border-black bg-black text-white' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                )
              })}
            </div>
          </div>

          <Slider label="Horizontal (X)" value={pos.x ?? 50} min={0} max={100} unit="%" onChange={(v) => updateBlock({ x: v })} />
          <Slider label="Vertical (Y)" value={pos.y ?? 50} min={0} max={100} unit="%" onChange={(v) => updateBlock({ y: v })} />
          <Slider label="Width" value={pos.width ?? 90} min={30} max={100} unit="%" onChange={(v) => updateBlock({ width: v })} />
          <Slider label="Font size" value={pos.fontSize ?? 16} min={8} max={72} unit="px" onChange={(v) => updateBlock({ fontSize: v })} />

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Text color</label>
            <div className="flex gap-2">
              <input type="color" value={pos.color || '#ffffff'} onChange={(e) => updateBlock({ color: e.target.value })} className="h-9 w-10 rounded border" />
              <input type="text" value={pos.color || '#ffffff'} onChange={(e) => updateBlock({ color: e.target.value })} className="input font-mono text-xs" />
            </div>
          </div>

          <p className="rounded-lg bg-white p-2 text-xs text-slate-500">
            Tip: use arrow keys on the canvas for 1% nudges. Hold Shift for 5% jumps.
          </p>
        </div>
      )}

      {!selected && (
        <p className="p-4 text-sm text-slate-500">Select an element on the canvas or from the list above.</p>
      )}
    </div>
  )
}

export default HeroInspector
