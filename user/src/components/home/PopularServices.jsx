import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ServiceCard from '../ServiceCard.jsx'

const PopularServices = ({ services }) => (
  <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 sm:pb-12">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Popular services</h2>
      <Link to="/services" className="flex items-center gap-1 text-sm font-semibold text-violet-700">
        View all <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
    {!services?.length ? (
      <p className="mt-6 text-sm text-slate-500 sm:text-base">No services available yet. Check back soon!</p>
    ) : (
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {services.map((s) => (
          <ServiceCard key={s._id} service={s} />
        ))}
      </div>
    )}
  </section>
)

export default PopularServices
