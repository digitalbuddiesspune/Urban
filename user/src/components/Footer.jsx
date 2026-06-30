import { Sparkles } from 'lucide-react'

const Footer = () => (
  <footer className="mt-16 border-t border-slate-100 bg-white">
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg brand-gradient text-white">
          <Sparkles className="h-4 w-4" />
        </span>
        <span className="font-bold brand-text">UrbanEase</span>
      </div>
      <p className="text-sm text-slate-500">Home services, made easy. © {new Date().getFullYear()} UrbanEase.</p>
    </div>
  </footer>
)

export default Footer
