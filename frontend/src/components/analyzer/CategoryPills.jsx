import { Check, AlertTriangle, Info } from 'lucide-react'

const PILLS = [
  { label: 'Keywords',   icon: Check,         variant: 'success', key: 'keywords' },
  { label: 'Formatting', icon: AlertTriangle,  variant: 'warning', key: 'formatting' },
  { label: 'Impact',     icon: Info,           variant: 'info',    key: 'impact' },
]

export default function CategoryPills() {
  return (
    <div className="category-pills" role="list" aria-label="Category summary">
      {PILLS.map(({ label, icon: Icon, variant }) => (
        <span
          key={label}
          className={`category-pill category-pill--${variant}`}
          role="listitem"
        >
          <Icon size={12} strokeWidth={2.5} aria-hidden="true" />
          {label}
        </span>
      ))}
    </div>
  )
}
