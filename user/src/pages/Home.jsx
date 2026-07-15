import { useEffect, useState } from 'react'
import api from '../api/axios.js'
import { PageLoader } from '../components/ui/Loader.jsx'
import Hero from '../components/home/Hero.jsx'
import CategoryCarousel from '../components/home/CategoryCarousel.jsx'
import PopularServices from '../components/home/PopularServices.jsx'
import CategoryServiceRails from '../components/home/CategoryServiceRails.jsx'
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

  const sectionOrder = (() => {
    const keys = [...(theme.homeSections || [])]
    const popularIdx = keys.indexOf('popular')
    const categoriesIdx = keys.indexOf('categories')
    if (popularIdx !== -1 && categoriesIdx !== -1 && popularIdx > categoriesIdx) {
      keys.splice(popularIdx, 1)
      keys.splice(categoriesIdx, 0, 'popular')
    }
    return keys
  })()

  return (
    <div>
      {sectionOrder.map((key) => {
        const Section = SECTIONS[key]
        if (!Section) return null
        if (key === 'hero') return <Section key={key} />
        if (key === 'popular') return <Section key={key} />
        if (key === 'categories') {
          return (
            <div key={key}>
              <Section categories={categories} />
              <CategoryServiceRails categories={categories} />
            </div>
          )
        }
        return <Section key={key} />
      })}
    </div>
  )
}

export default Home
