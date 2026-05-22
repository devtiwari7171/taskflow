import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProjects, createProject } from '../api/projects'
import Modal from '../components/Modal'
import { Plus, FolderKanban, Users } from 'lucide-react'

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6']

function ProjectCard({ project }) {
  const progress = project.task_count > 0 ? Math.round((project.completed_task_count / project.task_count) * 100) : 0
  return (
    <Link to={`/projects/${project.id}`} className="card p-5 hover:shadow-md transition-all group block">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
             style={{ backgroundColor: project.color + '22' }}>
          <FolderKanban className="w-5 h-5" style={{ color: project.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{project.name}</h3>
          {project.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{project.description}</p>}
        </div>
        <span className={`badge flex-shrink-0 ${project.status==='active'?'bg-green-100 text-green-700':project.status==='completed'?'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-600'}`}>
          {project.status}
        </span>
      </div>
      <div className="space-y-1.5 mb-4">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{project.completed_task_count}/{project.task_count} tasks</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width:`${progress}%`, backgroundColor:project.color }} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {project.members?.slice(0,4).map(m => (
            <div key={m.id} className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                 style={{ backgroundColor:m.user.avatar_color }} title={m.user.name}>
              {m.user.name[0]}
            </div>
          ))}
          {project.members?.length > 4 && (
            <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs text-gray-600">
              +{project.members.length - 4}
            </div>
          )}
        </div>
        <span className="text-xs text-gray-400 flex items-center gap-1"><Users className="w-3 h-3" />{project.members?.length || 0}</span>
      </div>
    </Link>
  )
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]         = useState({ name:'', description:'', color:'#6366f1' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState('')

  const fetchProjects = () => {
    setLoading(true)
    getProjects().then(r => setProjects(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchProjects() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true); setError('')
    try {
      await createProject(form)
      setShowModal(false)
      setForm({ name:'', description:'', color:'#6366f1' })
      fetchProjects()
    } catch (err) { setError(err.response?.data?.detail || 'Failed to create project') }
    finally { setSubmitting(false) }
  }

  const active = projects.filter(p => p.status === 'active')
  const other  = projects.filter(p => p.status !== 'active')

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> New Project</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_,i) => <div key={i} className="h-52 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <FolderKanban className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h3 className="font-medium text-gray-600 mb-1">No projects yet</h3>
          <p className="text-sm text-gray-400 mb-4">Create your first project to get started</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> Create Project</button>
        </div>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Active</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {active.map(p => <ProjectCard key={p.id} project={p} />)}
              </div>
            </div>
          )}
          {other.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Other</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {other.map(p => <ProjectCard key={p.id} project={p} />)}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Project">
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Project Name *</label>
            <input className="input" placeholder="My awesome project" value={form.name}
                   onChange={e => setForm({...form, name:e.target.value})} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="What is this project about?"
                      value={form.description} onChange={e => setForm({...form, description:e.target.value})} />
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm({...form, color:c})}
                        className={`w-8 h-8 rounded-full transition-transform ${form.color===c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'}`}
                        style={{ backgroundColor:c }} />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Creating…' : 'Create Project'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
