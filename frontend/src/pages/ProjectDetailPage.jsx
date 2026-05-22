import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProject, updateProject, deleteProject, addMember, removeMember } from '../api/projects'
import { getProjectTasks, createTask } from '../api/tasks'
import { useAuth } from '../context/AuthContext'
import TaskCard from '../components/TaskCard'
import Modal from '../components/Modal'
import TaskForm from '../components/TaskForm'
import Avatar from '../components/Avatar'
import {
  ArrowLeft, Plus, Settings, Trash2, UserPlus,
  CheckCircle2, AlertTriangle, Users, Filter
} from 'lucide-react'

const COLUMNS = [
  { key:'todo',        label:'To Do',       dot:'bg-gray-400' },
  { key:'in_progress', label:'In Progress', dot:'bg-blue-500' },
  { key:'in_review',   label:'In Review',   dot:'bg-yellow-500' },
  { key:'done',        label:'Done',        dot:'bg-green-500' },
]

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()

  const [project, setProject] = useState(null)
  const [tasks,   setTasks]   = useState([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('board')
  const [filterAssignee, setFilterAssignee] = useState('')

  const [showTaskModal,     setShowTaskModal]     = useState(false)
  const [showMemberModal,   setShowMemberModal]   = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [taskLoading, setTaskLoading] = useState(false)

  const [memberEmail, setMemberEmail] = useState('')
  const [memberRole,  setMemberRole]  = useState('member')
  const [memberError, setMemberError] = useState('')
  const [settingsForm, setSettingsForm] = useState({})

  const fetchData = useCallback(async () => {
    try {
      const [pr, tr] = await Promise.all([getProject(id), getProjectTasks(id)])
      setProject(pr.data)
      setTasks(tr.data)
      setSettingsForm({ name:pr.data.name, description:pr.data.description||'', status:pr.data.status })
    } catch { navigate('/projects') }
    finally { setLoading(false) }
  }, [id, navigate])

  useEffect(() => { fetchData() }, [fetchData])

  const isProjectAdmin = isAdmin || project?.owner_id === user?.id ||
    project?.members?.find(m => m.user.id === user?.id && m.role === 'admin')

  const handleCreateTask = async (data) => {
    setTaskLoading(true)
    try { await createTask(id, data); setShowTaskModal(false); fetchData() }
    catch (err) { alert(err.response?.data?.detail || 'Failed to create task') }
    finally { setTaskLoading(false) }
  }

  const handleAddMember = async (e) => {
    e.preventDefault(); setMemberError('')
    try { await addMember(id, { email:memberEmail, role:memberRole }); setMemberEmail(''); setShowMemberModal(false); fetchData() }
    catch (err) { setMemberError(err.response?.data?.detail || 'Failed to add member') }
  }

  const handleRemoveMember = async (uid) => {
    if (!confirm('Remove this member?')) return
    try { await removeMember(id, uid); fetchData() }
    catch (err) { alert(err.response?.data?.detail || 'Failed') }
  }

  const handleDeleteProject = async () => {
    if (!confirm(`Delete "${project?.name}"? This cannot be undone.`)) return
    try { await deleteProject(id); navigate('/projects') }
    catch (err) { alert(err.response?.data?.detail || 'Failed') }
  }

  const handleUpdateProject = async (e) => {
    e.preventDefault()
    try { await updateProject(id, settingsForm); setShowSettingsModal(false); fetchData() }
    catch (err) { alert(err.response?.data?.detail || 'Failed') }
  }

  const filteredTasks = filterAssignee
    ? tasks.filter(t => String(t.assignee?.id) === filterAssignee)
    : tasks

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!project) return null

  const progress = tasks.length > 0 ? Math.round((tasks.filter(t => t.status==='done').length / tasks.length)*100) : 0

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start gap-3 flex-wrap">
        <button onClick={() => navigate('/projects')} className="btn-ghost p-2 mt-1"><ArrowLeft className="w-4 h-4" /></button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ backgroundColor:project.color }} />
            <h1 className="text-2xl font-bold text-gray-900 truncate">{project.name}</h1>
            <span className={`badge ${project.status==='active'?'bg-green-100 text-green-700':project.status==='completed'?'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-600'}`}>{project.status}</span>
          </div>
          {project.description && <p className="text-gray-500 mt-1 text-sm ml-11">{project.description}</p>}
        </div>
        <div className="flex gap-2 flex-wrap">
          {isProjectAdmin && (
            <>
              <button className="btn-secondary" onClick={() => setShowMemberModal(true)}><UserPlus className="w-4 h-4" /> Add Member</button>
              <button className="btn-ghost p-2" onClick={() => setShowSettingsModal(true)}><Settings className="w-4 h-4" /></button>
            </>
          )}
          <button className="btn-primary" onClick={() => setShowTaskModal(true)}><Plus className="w-4 h-4" /> Task</button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="card p-4 flex items-center gap-6 flex-wrap text-sm">
        <span className="text-gray-600">{tasks.length} tasks</span>
        <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="w-4 h-4" />{tasks.filter(t=>t.status==='done').length} done</span>
        <span className="flex items-center gap-1 text-red-500"><AlertTriangle className="w-4 h-4" />{tasks.filter(t=>t.is_overdue).length} overdue</span>
        <span className="flex items-center gap-1 text-gray-500"><Users className="w-4 h-4" />{project.members?.length||0} members</span>
        <div className="flex-1 min-w-32">
          <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Progress</span><span>{progress}%</span></div>
          <div className="h-2 bg-gray-100 rounded-full"><div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width:`${progress}%` }} /></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {['board','list','members'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${tab===t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t==='board'?'📋 Board':t==='list'?'📝 List':'👥 Members'}
          </button>
        ))}
        {tab !== 'members' && (
          <div className="ml-auto flex items-center gap-2 pb-1 pr-1">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select className="text-sm text-gray-600 focus:outline-none bg-transparent border-0"
                    value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)}>
              <option value="">All members</option>
              {project.members?.map(m => <option key={m.user.id} value={String(m.user.id)}>{m.user.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Board */}
      {tab === 'board' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-h-48">
          {COLUMNS.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.key)
            return (
              <div key={col.key} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                  <h3 className="text-sm font-medium text-gray-700">{col.label}</h3>
                  <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{colTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {colTasks.map(t => <TaskCard key={t.id} task={t} compact />)}
                  {colTasks.length === 0 && (
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-xs text-gray-400">No tasks</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* List */}
      {tab === 'list' && (
        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No tasks yet. Create one!</p>
            </div>
          ) : filteredTasks.map(t => <TaskCard key={t.id} task={t} />)}
        </div>
      )}

      {/* Members */}
      {tab === 'members' && (
        <div className="space-y-3">
          {project.members?.map(m => (
            <div key={m.id} className="card p-4 flex items-center gap-3">
              <Avatar name={m.user.name} color={m.user.avatar_color} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{m.user.name}</p>
                <p className="text-sm text-gray-500">{m.user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${m.role==='admin'?'bg-indigo-100 text-indigo-700':'bg-gray-100 text-gray-600'}`}>{m.role}</span>
                {m.user.id === project.owner_id && <span className="badge bg-amber-100 text-amber-700">Owner</span>}
                {isProjectAdmin && m.user.id !== project.owner_id && m.user.id !== user?.id && (
                  <button onClick={() => handleRemoveMember(m.user.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create Task">
        <TaskForm onSubmit={handleCreateTask} loading={taskLoading} />
      </Modal>

      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Add Member">
        {memberError && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4">{memberError}</div>}
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="label">Email Address</label>
            <input type="email" className="input" placeholder="member@example.com"
                   value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={memberRole} onChange={e => setMemberRole(e.target.value)}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Add Member</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} title="Project Settings">
        <form onSubmit={handleUpdateProject} className="space-y-4">
          <div>
            <label className="label">Project Name</label>
            <input className="input" value={settingsForm.name||''} onChange={e => setSettingsForm({...settingsForm, name:e.target.value})} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} value={settingsForm.description||''} onChange={e => setSettingsForm({...settingsForm, description:e.target.value})} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={settingsForm.status||'active'} onChange={e => setSettingsForm({...settingsForm, status:e.target.value})}>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex justify-between pt-2">
            {(isAdmin || project.owner_id === user?.id) && (
              <button type="button" className="btn-danger" onClick={handleDeleteProject}><Trash2 className="w-4 h-4" /> Delete Project</button>
            )}
            <div className="flex gap-3 ml-auto">
              <button type="button" className="btn-secondary" onClick={() => setShowSettingsModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Save Changes</button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}
