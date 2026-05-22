import React from 'react'

const sizes = { xs:'w-6 h-6 text-xs', sm:'w-8 h-8 text-sm', md:'w-10 h-10 text-base', lg:'w-12 h-12 text-lg' }

export default function Avatar({ name = '?', color = '#6366f1', size = 'md' }) {
  const initials = name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}
         style={{ backgroundColor: color }}>
      {initials}
    </div>
  )
}
