import React, { useEffect, useState } from 'react'
import { getMyTasks } from '../api/tasks'
import TaskCard from '../components/TaskCard'
import { CheckCircle2 } from 'lucide-react'

const GROUPS = [
  { key:'overdue',     label:'🔴 Overdue',     filter: t => t.is_overdue },
  { key:'in_progress', label:'🔵 In Progress', filter: t => t.status==='in_progress' && !t.is_overdue },
  { key:'in_review',   label:'🟡 In Review',   filter: t => t.status==='in_review'   && !t.is_overdue },
  { key:'todo',        label:'⚪ To Do',        filter: t => t.status==='todo'        && !t.is_overdue },
  { key:'done',        label:'🟢 Done',         filter: t => t.status==='done' },
]

export default function MyTasksPage() {
  const [tasks,   setTasks]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { getMyTasks().then(r => setTasks(r.data)).finally(() => setLoading(false)) }, [])

  if (loading) return (
    <div className="space-y-4 animate-pulse">{[...Array(4)].map((_,i) => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}</div>
  )

  const overdue = tasks.filter(t => t.is_overdue).length
  const done    = tasks.filter(t => t.status==='done').length
  const active  = tasks.filter(t => t.status!=='done' && !t.is_overdue).length

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-500 mt-0.5">{tasks.length} task{tasks.length!==1?'s':''} assigned to you</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center"><p className="text-2xl font-bold text-red-500">{overdue}</p><p className="text-xs text-gray-500 mt-1">Overdue</p></div>
        <div className="card p-4 text-center"><p className="text-2xl font-bold text-blue-500">{active}</p><p className="text-xs text-gray-500 mt-1">Active</p></div>
        <div className="card p-4 text-center"><p className="text-2xl font-bold text-green-500">{done}</p><p className="text-xs text-gray-500 mt-1">Completed</p></div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle2 className="w-12 h-12 mx-auto text-green-400 mb-3" />
          <h3 className="font-medium text-gray-600 mb-1">All clear!</h3>
          <p className="text-sm text-gray-400">No tasks assigned to you right now.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {GROUPS.map(g => {
            const gt = tasks.filter(g.filter)
            if (!gt.length) return null
            return (
              <div key={g.key}>
                <h2 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                  {g.label}
                  <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">{gt.length}</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {gt.map(t => <TaskCard key={t.id} task={t} />)}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
