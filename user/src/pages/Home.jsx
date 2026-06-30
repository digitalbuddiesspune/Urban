import { useEffect, useState } from 'react'
import api from '../api/axios.js'
import { PageLoader } from '../components/ui/Loader.jsx'
import Hero from '../components/home/Hero.jsx'
import CategoryCarousel from '../components/home/CategoryCarousel.jsx'
import PopularServices from '../components/home/PopularServices.jsx'
import Testimonials from '../components/home/Testimonials.jsx'

const Home = () => {
  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/user/categories'), api.get('/user/services?limit=8')])
      .then(([c, s]) => {
        setCategories(c.data.categories)
        setServices(s.data.services)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  return (
    <div>
      <Hero />
      <CategoryCarousel categories={categories} />
      <PopularServices services={services} />
      <Testimonials />
    </div>
  )
}

export default Home
