import React, { useState, useEffect } from 'react'
import { getUsers } from '../api/tasks'

export default function TaskForm({ onSubmit, initialData = {}, loading }) {
  const [form, setForm] = useState({
    title:       initialData.title       || '',
    description: initialData.description || '',
    priority:    initialData.priority    || 'medium',
    status:      initialData.status      || 'todo',
    due_date:    initialData.due_date    ? new Date(initialData.due_date).toISOString().slice(0,16) : '',
    assignee_id: initialData.assignee?.id || initialData.assignee_id || '',
  })
  const [users, setUsers] = useState([])

  useEffect(() => { getUsers().then(r => setUsers(r.data)).catch(() => {}) }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = { ...form }
    if (!payload.due_date)    delete payload.due_date
    else payload.due_date = new Date(payload.due_date).toISOString()
    if (!payload.assignee_id) delete payload.assignee_id
    else payload.assignee_id = parseInt(payload.assignee_id)
    if (!initialData.id)      delete payload.status
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Title *</label>
        <input name="title" value={form.title} onChange={e => setForm({...form, title:e.target.value})}
               className="input" placeholder="Task title" required />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea name="description" value={form.description} onChange={e => setForm({...form, description:e.target.value})}
                  className="input resize-none" rows={3} placeholder="Optional description..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Priority</label>
          <select value={form.priority} onChange={e => setForm({...form, priority:e.target.value})} className="input">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        {initialData.id && (
          <div>
            <label className="label">Status</label>
            <select value={form.status} onChange={e => setForm({...form, status:e.target.value})} className="input">
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="done">Done</option>
            </select>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Due Date</label>
          <input type="datetime-local" value={form.due_date} onChange={e => setForm({...form, due_date:e.target.value})} className="input" />
        </div>
        <div>
          <label className="label">Assignee</label>
          <select value={form.assignee_id} onChange={e => setForm({...form, assignee_id:e.target.value})} className="input">
            <option value="">Unassigned</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : initialData.id ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  )
}
