import { Zap, AlertTriangle, CheckCircle } from 'lucide-react'

function getCategory(text) {
  const lower = text.toLowerCase()
  if (lower.includes('critical') || lower.includes('gap') || lower.includes('missing') || lower.includes('absent') || lower.includes('no mention'))
    return 'critical'
  if ((lower.includes('strong') || lower.includes('good') || lower.includes('solid') || lower.includes('excellent') || lower.includes('relevant')) && !lower.includes('remove') && !lower.includes('condense') && !lower.includes('reduce') && !lower.includes('lack') && !lower.includes('missing'))
    return 'strength'
  return 'improvement'
}

const STYLE_MAP = {
  critical:    { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA', label: 'Critical' },
  strength:    { bg: '#D1FAE5', color: '#065F46', border: '#6EE7B7', label: 'Strength' },
  improvement: { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A', label: 'Improve' },
}

export default function FeedbackList({ suggestions = [] }) {
  if (!suggestions.length) return null

  // Strip leading number like "1." or "1:" from text
  const clean = (text) => text.replace(/^\d+[\.\:]\s*/, '').trim()

  return (
    <ul className="feedback-list" aria-label="Improvement suggestions">
      {suggestions.map((s, i) => {
        const text = clean(s.text)
        const cat = getCategory(text)
        const { bg, color, border, label } = STYLE_MAP[cat]
        return (
          <li key={i} className="feedback-item" style={{ borderColor: border, background: bg }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: color, color: '#fff', fontSize: 12,
              fontWeight: 600, flexShrink: 0
            }}>
              {i + 1}
            </div>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color, marginBottom: 3 }}>
                {label}
              </div>
              <div className="feedback-item__text" style={{ color: '#111827' }}>{text}</div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
