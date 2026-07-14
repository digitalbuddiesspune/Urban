import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import CategoryCard from '../CategoryCard.jsx'

const PopularServices = ({ categories }) => (
  <section id="services" className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 sm:pb-12">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">What we offer</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">Our services</h2>
      </div>
      <Link to="/services" className="flex items-center gap-1 text-sm font-semibold text-violet-700">
        View all <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
    {!categories?.length ? (
      <p className="mt-6 text-sm text-slate-500 sm:text-base">No services available yet. Check back soon!</p>
    ) : (
      <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat) => (
          <CategoryCard key={cat._id} category={cat} />
        ))}
      </div>
    )}
  </section>
)

export default PopularServices
