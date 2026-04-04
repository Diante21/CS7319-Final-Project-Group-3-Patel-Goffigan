import { useEffect, useRef, useState } from 'react'

const CIRCUMFERENCE = 2 * Math.PI * 48 // r=48

function getColor(score) {
  if (score >= 75) return 'var(--color-success)'
  if (score >= 50) return 'var(--color-warning)'
  return 'var(--color-error)'
}

export default function ScoreRing({ score = 0, grade = '', targetRole = '' }) {
  const [displayed, setDisplayed] = useState(0)
  const [animated, setAnimated]   = useState(false)
  const prevScore = useRef(0)

  useEffect(() => {
    if (score === prevScore.current) return
    prevScore.current = score
    setAnimated(false)
    const t = setTimeout(() => {
      setDisplayed(score)
      setAnimated(true)
    }, 60)
    return () => clearTimeout(t)
  }, [score])

  const offset = animated
    ? CIRCUMFERENCE - (displayed / 100) * CIRCUMFERENCE
    : CIRCUMFERENCE

  const color = getColor(score)

  return (
    <div className="score-section">
      <div className="score-ring-wrap">
        <svg
          className="score-ring-svg"
          width="120" height="120"
          viewBox="0 0 120 120"
          aria-label={`Score: ${score} out of 100`}
          role="img"
        >
          <circle className="score-ring__track"    cx="60" cy="60" r="48" />
          <circle
            className="score-ring__progress"
            cx="60" cy="60" r="48"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            stroke={color}
            style={{ transition: animated ? 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' : 'none' }}
          />
        </svg>
        <div className="score-ring__center">
          <span className="score-ring__number">{displayed}</span>
          <span className="score-ring__sub">/ 100</span>
        </div>
      </div>

      <div className="score-section__meta">
        <div className="score-section__grade">{grade}</div>
        {targetRole && (
          <div className="score-section__role">for {targetRole}</div>
        )}
      </div>
    </div>
  )
}
