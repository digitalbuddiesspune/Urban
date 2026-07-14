import { useEffect, useState } from 'react'
import api from '../api/axios.js'
import { PageLoader } from '../components/ui/Loader.jsx'
import Hero from '../components/home/Hero.jsx'
import CategoryCarousel from '../components/home/CategoryCarousel.jsx'
import PopularServices from '../components/home/PopularServices.jsx'
import Testimonials from '../components/home/Testimonials.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

const SECTIONS = {
  hero: Hero,
  categories: CategoryCarousel,
  popular: PopularServices,
  testimonials: Testimonials,
}

const Home = () => {
  const { theme } = useTheme()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/user/categories')
      .then((r) => setCategories(r.data.categories))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  return (
    <div>
      {theme.homeSections.map((key) => {
        const Section = SECTIONS[key]
        if (!Section) return null
        if (key === 'hero') return <Section key={key} />
        if (key === 'categories' || key === 'popular') return <Section key={key} categories={categories} />
        return <Section key={key} />
      })}
    </div>
  )
}

export default Home
