import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ServiceCard from '../ServiceCard.jsx'

const PopularServices = ({ services }) => (
  <section className="mx-auto max-w-6xl px-4 pb-12">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-slate-900">Popular services</h2>
      <Link to="/services" className="flex items-center gap-1 text-sm font-semibold text-violet-700">
        View all <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
    {!services?.length ? (
      <p className="mt-6 text-slate-500">No services available yet. Check back soon!</p>
    ) : (
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s) => (
          <ServiceCard key={s._id} service={s} />
        ))}
      </div>
    )}
  </section>
)

export default PopularServices
