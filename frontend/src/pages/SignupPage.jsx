import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckSquare, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react'
import { signup } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function SignupPage() {
  const { loginUser } = useAuth()
  const navigate      = useNavigate()
  const [form,    setForm]    = useState({ name:'', email:'', password:'', role:'member' })
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await signup(form)
      loginUser(res.data.access_token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to server. Make sure the backend is running.')
      } else {
        const d = err.response?.data?.detail
        if (Array.isArray(d)) setError(d.map(x => x.msg).join(', '))
        else if (typeof d === 'string') setError(d)
        else setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl mb-4">
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1">Join TaskFlow today</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="flex-1">{error}</span>
              <button type="button" onClick={() => setError('')}
                className="text-red-400 hover:text-red-600 font-bold text-lg leading-none">×</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" className="input" placeholder="Jane Doe"
                value={form.name} onChange={e => setForm({...form, name:e.target.value})} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({...form, email:e.target.value})} required />
            </div>
            <div>
              <label className="label">Password <span className="text-gray-400 font-normal">(min 6 chars)</span></label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input pr-10"
                  placeholder="••••••••" value={form.password}
                  onChange={e => setForm({...form, password:e.target.value})} required minLength={6} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Account Role</label>
              <div className="grid grid-cols-2 gap-3">
                {['member','admin'].map(r => (
                  <label key={r} className={`flex items-center gap-2.5 p-3 rounded-lg border-2 cursor-pointer transition-all
                    ${form.role===r ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="role" value={r} checked={form.role===r}
                      onChange={() => setForm({...form, role:r})} className="hidden" />
                    {r==='admin' && <Shield className="w-4 h-4 text-indigo-500" />}
                    <span className="text-sm font-medium capitalize">{r}</span>
                  </label>
                ))}
              </div>
              {form.role==='admin' && (
                <p className="text-xs text-indigo-600 mt-1.5">Admins can manage all projects and users</p>
              )}
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-2.5 mt-2" disabled={loading}>
              {loading
                ? <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating account…
                  </span>
                : 'Create Account'
              }
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
