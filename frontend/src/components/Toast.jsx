import React, { useState, createContext, useContext, useCallback } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(p => [...p, { id, message, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000)
  }, [])

  const icons = { success: <CheckCircle className="w-5 h-5 text-green-500" />, error: <XCircle className="w-5 h-5 text-red-500" />, warning: <AlertCircle className="w-5 h-5 text-yellow-500" /> }
  const bg    = { success: 'bg-green-50 border-green-200', error: 'bg-red-50 border-red-200', warning: 'bg-yellow-50 border-yellow-200' }

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-slideIn min-w-[280px] max-w-sm ${bg[t.type]}`}>
            {icons[t.type]}
            <p className="text-sm text-gray-800 flex-1">{t.message}</p>
            <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
