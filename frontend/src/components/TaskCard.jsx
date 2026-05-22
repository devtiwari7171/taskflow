import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MessageSquare, AlertCircle, Flag } from 'lucide-react'
import { format } from 'date-fns'
import Avatar from './Avatar'

const priorityConfig = {
  low:    { label:'Low',    cls:'bg-gray-100 text-gray-600' },
  medium: { label:'Medium', cls:'bg-blue-100 text-blue-600' },
  high:   { label:'High',   cls:'bg-orange-100 text-orange-600' },
  urgent: { label:'Urgent', cls:'bg-red-100 text-red-600' },
}
const statusConfig = {
  todo:        { label:'To Do',       cls:'bg-gray-100 text-gray-600' },
  in_progress: { label:'In Progress', cls:'bg-blue-100 text-blue-600' },
  in_review:   { label:'In Review',   cls:'bg-yellow-100 text-yellow-700' },
  done:        { label:'Done',        cls:'bg-green-100 text-green-600' },
}

export default function TaskCard({ task, compact = false }) {
  const navigate = useNavigate()
  const p = priorityConfig[task.priority] || priorityConfig.medium
  const s = statusConfig[task.status]     || statusConfig.todo

  return (
    <div
      onClick={() => navigate(`/tasks/${task.id}`)}
      className={`card p-4 hover:shadow-md transition-all cursor-pointer ${task.is_overdue ? 'border-red-200' : ''}`}
    >
      <div className="flex items-start gap-2 mb-2">
        <h3 className={`text-sm font-medium flex-1 line-clamp-2 ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
          {task.title}
        </h3>
        {task.is_overdue && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />}
      </div>

      {!compact && task.description && (
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>
      )}

      <div className="flex gap-2 flex-wrap mb-3">
        <span className={`badge ${p.cls}`}><Flag className="w-3 h-3 mr-1" />{p.label}</span>
        <span className={`badge ${s.cls}`}>{s.label}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {task.due_date && (
            <span className={`flex items-center gap-1 ${task.is_overdue ? 'text-red-500 font-medium' : ''}`}>
              <Calendar className="w-3 h-3" />{format(new Date(task.due_date), 'MMM d')}
            </span>
          )}
          {task.comments?.length > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />{task.comments.length}
            </span>
          )}
        </div>
        {task.assignee && <Avatar name={task.assignee.name} color={task.assignee.avatar_color} size="xs" />}
      </div>
    </div>
  )
}
