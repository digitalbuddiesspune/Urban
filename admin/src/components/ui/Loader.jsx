export const Spinner = ({ className = 'h-5 w-5' }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
  </svg>
)

export const PageLoader = () => (
  <div className="flex items-center justify-center py-24 text-black">
    <Spinner className="h-8 w-8" />
  </div>
)

export default Spinner
