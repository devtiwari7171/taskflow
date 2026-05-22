import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardStats, getMyTasks } from '../api/tasks'
import { useAuth } from '../context/AuthContext'
import TaskCard from '../components/TaskCard'
import { ListTodo, Clock, AlertTriangle, FolderKanban, CheckCircle2 } from 'lucide-react'

const StatCard = ({ icon: Icon, label, value, iconCls, bgCls }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 ${bgCls} rounded-xl flex items-center justify-center flex-shrink-0`}>
      <Icon className={`w-6 h-6 ${iconCls}`} />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
)

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats,   setStats]   = useState(null)
  const [myTasks, setMyTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getDashboardStats(), getMyTasks()])
      .then(([s, t]) => { setStats(s.data); setMyTasks(t.data.slice(0, 6)) })
      .finally(() => setLoading(false))
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  const progress = stats?.total_tasks > 0 ? Math.round((stats.done / stats.total_tasks) * 100) : 0

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-64" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_,i) => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}</div>
    </div>
  )

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Good {greeting}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 mt-0.5">Here's your workspace overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ListTodo}      label="Total Tasks"      value={stats?.total_tasks    || 0} iconCls="text-indigo-600" bgCls="bg-indigo-50" />
        <StatCard icon={Clock}         label="In Progress"      value={stats?.in_progress    || 0} iconCls="text-blue-600"   bgCls="bg-blue-50" />
        <StatCard icon={AlertTriangle} label="Overdue"          value={stats?.overdue        || 0} iconCls="text-red-600"    bgCls="bg-red-50" />
        <StatCard icon={FolderKanban}  label="Active Projects"  value={stats?.active_projects|| 0} iconCls="text-green-600"  bgCls="bg-green-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress breakdown */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Task Breakdown</h2>
          <div className="space-y-3">
            {[
              { label:'To Do',       value:stats?.todo        || 0, color:'bg-gray-400' },
              { label:'In Progress', value:stats?.in_progress || 0, color:'bg-blue-500' },
              { label:'In Review',   value:stats?.in_review   || 0, color:'bg-yellow-500' },
              { label:'Done',        value:stats?.done        || 0, color:'bg-green-500' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium text-gray-800">{item.value}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all duration-500`}
                       style={{ width: stats?.total_tasks > 0 ? `${(item.value / stats.total_tasks)*100}%` : '0%' }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Completion rate</span>
              <span className="font-bold text-green-600">{progress}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-700"
                   style={{ width:`${progress}%` }} />
            </div>
          </div>
        </div>

        {/* My tasks */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">My Assigned Tasks</h2>
            <Link to="/my-tasks" className="text-sm text-indigo-600 hover:underline">View all →</Link>
          </div>
          {myTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No tasks assigned to you</p>
            </div>
          ) : (
            <div className="space-y-3">{myTasks.map(t => <TaskCard key={t.id} task={t} compact />)}</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/projects" className="card p-5 hover:shadow-md transition-all group flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-100">
            <FolderKanban className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Browse Projects</p>
            <p className="text-sm text-gray-500">{stats?.total_projects || 0} project{stats?.total_projects !== 1 ? 's' : ''}</p>
          </div>
        </Link>
        <Link to="/my-tasks" className="card p-5 hover:shadow-md transition-all group flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center group-hover:bg-orange-100">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Overdue Tasks</p>
            <p className="text-sm text-gray-500">{stats?.overdue || 0} need attention</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
