import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Ban, CheckCircle2, Trash2, Users as UsersIcon } from 'lucide-react'
import api from '../api/axios.js'
import { PageLoader } from '../components/ui/Loader.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ConfirmModal from '../components/ui/ConfirmModal.jsx'
import { formatDate } from '../utils/helpers.js'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [delTarget, setDelTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    api
      .get('/admin/users')
      .then((r) => setUsers(r.data.users))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const toggleBlock = async (u) => {
    try {
      await api.put(`/admin/users/${u._id}/block`)
      toast.success(u.isBlocked ? 'User unblocked' : 'User blocked')
      load()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/admin/users/${delTarget}`)
      toast.success('User deleted')
      setDelTarget(null)
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">User management</h1>
      <p className="text-sm text-slate-500">View and manage registered customers</p>

      {users.length === 0 ? (
        <EmptyState title="No users yet" subtitle="Registered customers will appear here." icon={UsersIcon} />
      ) : (
        <div className="mt-6 card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="p-4 font-medium text-slate-800">{u.name}</td>
                  <td className="p-4 text-slate-600">{u.email}</td>
                  <td className="p-4 text-slate-500">{u.phone || '-'}</td>
                  <td className="p-4 text-slate-500">{formatDate(u.createdAt)}</td>
                  <td className="p-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {u.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => toggleBlock(u)} className="rounded-lg p-2 text-amber-600 hover:bg-amber-50" title={u.isBlocked ? 'Unblock' : 'Block'}>
                        {u.isBlocked ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      </button>
                      <button onClick={() => setDelTarget(u._id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!delTarget}
        title="Delete user?"
        message="This will permanently remove the user account."
        confirmText="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDelTarget(null)}
      />
    </div>
  )
}

export default Users
