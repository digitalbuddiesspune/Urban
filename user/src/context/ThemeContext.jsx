import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios.js'
import { applyThemeToDocument, defaultUserSiteTheme } from '../utils/theme.js'

const ThemeContext = createContext({
  siteName: 'UrbanEase',
  theme: defaultUserSiteTheme,
  loading: true,
})

export const ThemeProvider = ({ children }) => {
  const [siteName, setSiteName] = useState('UrbanEase')
  const [theme, setTheme] = useState(defaultUserSiteTheme)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/user/site-theme')
      .then((r) => {
        setSiteName(r.data.siteName || 'UrbanEase')
        setTheme(r.data.theme || defaultUserSiteTheme)
      })
      .catch(() => setTheme(defaultUserSiteTheme))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!loading) applyThemeToDocument(theme)
  }, [theme, loading])

  return <ThemeContext.Provider value={{ siteName, theme, loading }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
