type BadgeVariant = 'yellow' | 'green' | 'blue' | 'red' | 'grey' | 'orange'

const colors: Record<BadgeVariant, string> = {
  yellow: 'bg-brand-yellow/20 text-brand-yellow border-brand-yellow/30',
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
  grey: 'bg-brand-steel/20 text-brand-steel border-brand-steel/30',
  orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'grey', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
        border uppercase tracking-wider
        ${colors[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}

// Order status → badge variant mapping
export function orderStatusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    PENDING_PAYMENT: 'grey',
    PAYMENT_FAILED: 'red',
    PAID: 'blue',
    PROCESSING: 'orange',
    FILE_GENERATED: 'orange',
    SUBMITTED_TO_PRINT: 'blue',
    IN_PRODUCTION: 'blue',
    SHIPPED: 'green',
    DELIVERED: 'green',
    CANCELLED: 'red',
    REFUNDED: 'red',
  }
  return map[status] ?? 'grey'
}
