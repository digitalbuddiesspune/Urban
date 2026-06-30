import { Star, Quote } from 'lucide-react'
import StarRating from '../ui/StarRating.jsx'

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Pune',
    service: 'Home Cleaning',
    rating: 5,
    text: 'The cleaner arrived on time and did an amazing deep clean. My apartment has never looked this good. Booking was effortless.',
  },
  {
    id: 2,
    name: 'Rahul Mehta',
    location: 'Mumbai',
    service: 'AC Repair',
    rating: 5,
    text: 'AC was fixed within an hour. The technician was professional, explained everything clearly, and the pricing was transparent.',
  },
  {
    id: 3,
    name: 'Ananya Desai',
    location: 'Pune',
    service: 'Salon at Home',
    rating: 5,
    text: 'Salon experience at home was fantastic. Great hygiene, skilled stylist, and I saved so much travel time. Highly recommend.',
  },
  {
    id: 4,
    name: 'Vikram Singh',
    location: 'Mumbai',
    service: 'Electrician',
    rating: 4,
    text: 'Quick response for a wiring issue. UrbanEase connected me with a verified electrician who solved the problem the same day.',
  },
  {
    id: 5,
    name: 'Sneha Kulkarni',
    location: 'Pune',
    service: 'Plumbing',
    rating: 5,
    text: 'Had a leakage emergency at night. Booked through the app and got help quickly. Very reliable service platform.',
  },
  {
    id: 6,
    name: 'Arjun Patel',
    location: 'Mumbai',
    service: 'Appliance Repair',
    rating: 5,
    text: 'My washing machine was repaired professionally. Fair price, genuine parts, and excellent follow-up. Will use again.',
  },
]

const TestimonialCard = ({ item }) => (
  <article className="testimonial-card mx-3 w-[min(100%,340px)] shrink-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <Quote className="h-8 w-8 text-slate-200" aria-hidden />
    <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-slate-600">"{item.text}"</p>
    <div className="mt-5 flex items-center gap-1">
      <StarRating value={item.rating} size={14} />
      <span className="ml-1 text-xs font-medium text-slate-500">{item.rating}.0</span>
    </div>
    <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
        {item.name.charAt(0)}
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold text-slate-900">{item.name}</p>
        <p className="truncate text-xs text-slate-500">
          {item.service} · {item.location}
        </p>
      </div>
    </div>
  </article>
)

const Testimonials = () => {
  const track = [...TESTIMONIALS, ...TESTIMONIALS]

  return (
    <section className="overflow-hidden bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Client stories</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">What our customers say</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
            Thousands trust UrbanEase for reliable home services across the city.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
            <Star className="h-4 w-4 fill-black text-black" />
            <span>4.9 average rating</span>
            <span className="text-slate-300">|</span>
            <span>2,500+ reviews</span>
          </div>
        </div>
      </div>

      <div className="testimonial-marquee relative mt-10">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-slate-50 to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-slate-50 to-transparent sm:w-24" />

        <div className="testimonial-track flex w-max">
          {track.map((item, i) => (
            <TestimonialCard key={`${item.id}-${i}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
