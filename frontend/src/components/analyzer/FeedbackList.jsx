import { AlignLeft, Zap, Tag } from 'lucide-react'

const ICON_MAP = {
  Formatting: { Icon: AlignLeft, cls: 'feedback-item__icon--formatting' },
  Impact:     { Icon: Zap,       cls: 'feedback-item__icon--impact' },
  Keywords:   { Icon: Tag,       cls: 'feedback-item__icon--keywords' },
}

export default function FeedbackList({ suggestions = [] }) {
  return (
    <ul className="feedback-list" aria-label="Improvement suggestions">
      {suggestions.map((s, i) => {
        const { Icon, cls } = ICON_MAP[s.category] || ICON_MAP.Impact
        return (
          <li key={`${s.category}-${i}`} className="feedback-item">
            <div className={`feedback-item__icon ${cls}`} aria-hidden="true">
              <Icon size={14} strokeWidth={1.75} />
            </div>
            <div>
              <div className="feedback-item__category">{s.category}</div>
              <div className="feedback-item__text">{s.text}</div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
