import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getTask, updateTask, deleteTask, addComment, deleteComment } from '../api/tasks'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import TaskForm from '../components/TaskForm'
import Avatar from '../components/Avatar'
import { format } from 'date-fns'
import { ArrowLeft, Edit3, Trash2, Send, Calendar, Flag, AlertCircle, MessageSquare, User, Clock } from 'lucide-react'

const PRI = { low:{label:'Low',cls:'bg-gray-100 text-gray-600'}, medium:{label:'Medium',cls:'bg-blue-100 text-blue-700'}, high:{label:'High',cls:'bg-orange-100 text-orange-700'}, urgent:{label:'Urgent',cls:'bg-red-100 text-red-700'} }
const STA = { todo:{label:'To Do',cls:'bg-gray-100 text-gray-600'}, in_progress:{label:'In Progress',cls:'bg-blue-100 text-blue-700'}, in_review:{label:'In Review',cls:'bg-yellow-100 text-yellow-700'}, done:{label:'Done',cls:'bg-green-100 text-green-700'} }
const STATUS_OPTIONS = ['todo','in_progress','in_review','done']

export default function TaskDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [task,    setTask]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [comment, setComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)

  const fetchTask = useCallback(async () => {
    try { const r = await getTask(id); setTask(r.data) }
    catch { navigate(-1) }
    finally { setLoading(false) }
  }, [id, navigate])

  useEffect(() => { fetchTask() }, [fetchTask])

  const handleStatusChange = async (s) => {
    try { await updateTask(id, { status:s }); fetchTask() }
    catch (err) { alert(err.response?.data?.detail || 'Failed') }
  }

  const handleUpdate = async (data) => {
    setEditLoading(true)
    try { await updateTask(id, data); setShowEdit(false); fetchTask() }
    finally { setEditLoading(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return
    try { await deleteTask(id); navigate(-1) }
    catch (err) { alert(err.response?.data?.detail || 'Failed') }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setCommentLoading(true)
    try { await addComment(id, { content:comment }); setComment(''); fetchTask() }
    finally { setCommentLoading(false) }
  }

  const handleDeleteComment = async (cid) => {
    try { await deleteComment(cid); fetchTask() }
    catch (err) { alert(err.response?.data?.detail || 'Failed') }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!task) return null

  const p = PRI[task.priority] || PRI.medium
  const s = STA[task.status]   || STA.todo

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start gap-3 flex-wrap">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2 mt-1"><ArrowLeft className="w-4 h-4" /></button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <h1 className={`text-2xl font-bold flex-1 ${task.status==='done'?'line-through text-gray-400':'text-gray-900'}`}>{task.title}</h1>
            {task.is_overdue && <div className="flex items-center gap-1 text-red-500 text-sm mt-1 flex-shrink-0"><AlertCircle className="w-4 h-4" />Overdue</div>}
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`badge ${p.cls}`}><Flag className="w-3 h-3 mr-1" />{p.label}</span>
            <span className={`badge ${s.cls}`}>{s.label}</span>
            <Link to={`/projects/${task.project_id}`} className="badge bg-indigo-50 text-indigo-600 hover:bg-indigo-100">📁 Project</Link>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button className="btn-secondary" onClick={() => setShowEdit(true)}><Edit3 className="w-4 h-4" /> Edit</button>
          <button className="btn-danger p-2" onClick={handleDelete}><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Description</h2>
            {task.description
              ? <p className="text-gray-600 text-sm whitespace-pre-wrap">{task.description}</p>
              : <p className="text-gray-400 text-sm italic">No description provided</p>}
          </div>

          {/* Status change */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Update Status</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STATUS_OPTIONS.map(st => (
                <button key={st} onClick={() => handleStatusChange(st)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${task.status===st ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  {STA[st].label}
                </button>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Comments ({task.comments?.length || 0})
            </h2>
            <div className="space-y-4 mb-4">
              {!task.comments?.length
                ? <p className="text-sm text-gray-400 text-center py-4">No comments yet. Be first!</p>
                : task.comments.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <Avatar name={c.author.name} color={c.author.avatar_color} size="sm" />
                    <div className="flex-1 bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{c.author.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{format(new Date(c.created_at), 'MMM d, h:mm a')}</span>
                          {(c.author.id === user?.id || isAdmin) && (
                            <button onClick={() => handleDeleteComment(c.id)} className="text-gray-300 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{c.content}</p>
                    </div>
                  </div>
                ))}
            </div>
            <form onSubmit={handleComment} className="flex gap-3">
              <Avatar name={user?.name} color={user?.avatar_color} size="sm" />
              <div className="flex-1 flex gap-2">
                <input className="input flex-1" placeholder="Add a comment…" value={comment} onChange={e => setComment(e.target.value)} />
                <button type="submit" className="btn-primary" disabled={commentLoading || !comment.trim()}><Send className="w-4 h-4" /></button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="card p-5 space-y-4 self-start">
          <h2 className="font-semibold text-gray-900">Details</h2>

          <div>
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Assignee</p>
            {task.assignee
              ? <div className="flex items-center gap-2"><Avatar name={task.assignee.name} color={task.assignee.avatar_color} size="sm" /><span className="text-sm text-gray-900">{task.assignee.name}</span></div>
              : <span className="text-sm text-gray-400">Unassigned</span>}
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Created by</p>
            {task.creator
              ? <div className="flex items-center gap-2"><Avatar name={task.creator.name} color={task.creator.avatar_color} size="sm" /><span className="text-sm text-gray-900">{task.creator.name}</span></div>
              : <span className="text-sm text-gray-400">Unknown</span>}
          </div>

          {task.due_date && (
            <div>
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Due Date</p>
              <p className={`text-sm font-medium ${task.is_overdue ? 'text-red-600' : 'text-gray-900'}`}>
                {format(new Date(task.due_date), 'MMM d, yyyy h:mm a')}{task.is_overdue && ' ⚠️'}
              </p>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Created</p>
            <p className="text-sm text-gray-700">{format(new Date(task.created_at), 'MMM d, yyyy')}</p>
          </div>
        </div>
      </div>

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Task">
        <TaskForm initialData={task} onSubmit={handleUpdate} loading={editLoading} />
      </Modal>
    </div>
  )
}
