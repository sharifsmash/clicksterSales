import React from 'react'
import { cn } from '../../lib/utils'  // Updated import path

interface ShinyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
}

const ShinyButton: React.FC<ShinyButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      className={cn(
        'group relative inline-flex items-center justify-center overflow-hidden rounded-md bg-indigo-600 px-8 py-3 font-medium text-white transition duration-300 ease-out hover:bg-indigo-700',
        className
      )}
      {...props}
    >
      <span className="absolute inset-0 flex h-full w-full">
        <span className="absolute inset-0 flex h-full w-full animate-[shine_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-500"></span>
      </span>
      <span className="relative z-10">{children}</span>
    </button>
  )
}

export default ShinyButton