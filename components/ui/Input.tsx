'use client'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-brand-steel-light tracking-wider uppercase">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full rounded bg-brand-charcoal border px-4 py-2.5 text-white
            placeholder:text-brand-steel focus:outline-none focus:ring-2
            transition-colors
            ${error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-brand-steel-dark focus:ring-brand-yellow focus:border-brand-yellow'
            }
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {helper && !error && <p className="text-brand-steel text-sm">{helper}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
