import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateMe } from '../api/auth'
import Avatar from '../components/Avatar'
import { Shield, User, Mail, Calendar, Palette } from 'lucide-react'
import { format } from 'date-fns'

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6','#f97316','#06b6d4','#84cc16','#a855f7']

export default function ProfilePage() {
  const { user, setUser, isAdmin } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState({ name: user?.name||'', avatar_color: user?.avatar_color||'#6366f1' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await updateMe(form)
      setUser(r.data)
      setEditing(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) { alert(err.response?.data?.detail || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

      {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3">✅ Profile updated successfully!</div>}

      <div className="card p-6">
        <div className="flex items-center gap-5 mb-6">
          <Avatar name={user?.name} color={user?.avatar_color} size="lg" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              {isAdmin && <Shield className="w-4 h-4 text-indigo-500" />}
              <span className={`badge capitalize ${isAdmin?'bg-indigo-100 text-indigo-700':'bg-gray-100 text-gray-600'}`}>{user?.role}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { icon:User,    label:'Full Name',    value:user?.name },
            { icon:Mail,    label:'Email',        value:user?.email },
            { icon:Calendar,label:'Member Since', value:user?.created_at ? format(new Date(user.created_at),'MMM yyyy') : '—' },
          ].map(({ icon:Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Palette className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Avatar Color</p>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor:user?.avatar_color }} />
                <span className="text-sm font-mono text-gray-900">{user?.avatar_color}</span>
              </div>
            </div>
          </div>
        </div>

        {!editing ? (
          <button className="btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 border-t border-gray-100 pt-5">
            <div>
              <label className="label">Full Name</label>
              <input className="input" value={form.name} onChange={e => setForm({...form, name:e.target.value})} required />
            </div>
            <div>
              <label className="label">Avatar Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm({...form, avatar_color:c})}
                          className={`w-9 h-9 rounded-full transition-all ${form.avatar_color===c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'}`}
                          style={{ backgroundColor:c }} />
                ))}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Avatar name={form.name||user?.name} color={form.avatar_color} size="md" />
                <span className="text-sm text-gray-500">Preview</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save Changes'}</button>
              <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      {isAdmin && (
        <div className="card p-5 border-indigo-200 bg-indigo-50">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-indigo-800">Admin Privileges</h3>
          </div>
          <ul className="text-sm text-indigo-700 space-y-1 ml-7">
            <li>• View and manage all projects</li>
            <li>• Manage all users and their roles</li>
            <li>• Delete any task or comment</li>
            <li>• Access all project members</li>
          </ul>
        </div>
      )}
    </div>
  )
}
