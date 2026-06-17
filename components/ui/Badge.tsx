import { cn } from '@/lib/utils'
import { type RiskLevel } from '@/types'

interface BadgeProps {
  level: RiskLevel
  className?: string
}

const levelConfig: Record<RiskLevel, { label: string; className: string; dot: string }> = {
  low: { label: '低リスク', className: 'bg-green-500/15 text-green-400 border-green-500/30', dot: 'bg-green-400' },
  medium: { label: '中リスク', className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400' },
  high: { label: '高リスク', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' },
  critical: { label: '重大リスク', className: 'bg-red-500/15 text-red-400 border-red-500/30', dot: 'bg-red-400' },
}

export function RiskBadge({ level, className }: BadgeProps) {
  const config = levelConfig[level]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}
