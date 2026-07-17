import { useEffect, useRef } from 'react'
import { useNotifications } from '../context/NotificationContext.jsx'
import { PageLoader } from '../components/ui/Loader.jsx'
import NotificationsList from '../components/NotificationsList.jsx'

const Notifications = () => {
  const { notifications, loading, markAllRead } = useNotifications()
  const markedRef = useRef(false)

  useEffect(() => {
    if (loading || markedRef.current) return
    markedRef.current = true
    markAllRead()
  }, [loading, markAllRead])

  if (loading) return <PageLoader />

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
      <p className="text-sm text-slate-500">Activity from the last 3 days — opening this page marks them as read</p>

      <div className="mt-6">
        <NotificationsList notifications={notifications} />
      </div>
    </div>
  )
}

export default Notifications
