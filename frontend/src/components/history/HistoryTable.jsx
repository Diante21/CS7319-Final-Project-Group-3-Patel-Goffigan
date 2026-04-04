import React, { useState } from 'react'
import { FileText, ChevronDown, ChevronUp } from 'lucide-react'
import KeywordTags from '../analyzer/KeywordTags.jsx'
import FeedbackList from '../analyzer/FeedbackList.jsx'
import ScoreRing from '../analyzer/ScoreRing.jsx'

function getStatus(score) {
  if (score >= 75) return { label: 'Good',       cls: 'status-badge--good' }
  if (score >= 50) return { label: 'Fair',        cls: 'status-badge--fair' }
  return            { label: 'Needs Work',  cls: 'status-badge--needs-work' }
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function HistoryTable({ entries }) {
  const [expanded, setExpanded] = useState(null)

  if (!entries.length) return null

  return (
    <div className="history-table-wrap">
      <table className="history-table" aria-label="Resume history">
        <thead>
          <tr>
            <th>File</th>
            <th>Role</th>
            <th>Date</th>
            <th>Score</th>
            <th>Status</th>
            <th aria-label="Expand" />
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const { label, cls } = getStatus(entry.score)
            const isOpen = expanded === entry.id

            return (
              <React.Fragment key={entry.id}>
                <tr
                  onClick={() => setExpanded(isOpen ? null : entry.id)}
                  aria-expanded={isOpen}
                  style={isOpen ? { background: 'var(--color-primary-light)' } : {}}
                >
                  <td>
                    <div className="history-row__name">
                      <FileText size={14} strokeWidth={1.75} color="var(--color-text-muted)" aria-hidden="true" />
                      {entry.fileName}
                    </div>
                  </td>
                  <td><span className="history-row__role">{entry.role}</span></td>
                  <td><span style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>{formatDate(entry.date)}</span></td>
                  <td><span className="history-score">{entry.score}</span></td>
                  <td><span className={`status-badge ${cls}`}>{label}</span></td>
                  <td style={{ width: 32, textAlign: 'center' }}>
                    {isOpen
                      ? <ChevronUp size={14} color="var(--color-text-muted)" />
                      : <ChevronDown size={14} color="var(--color-text-muted)" />}
                  </td>
                </tr>

                {isOpen && (
                  <tr key={`${entry.id}-detail`} className="history-detail">
                    <td colSpan={6}>
                      <div className="history-detail__inner">
                        <div>
                          <div className="history-detail__section-title">Score</div>
                          <ScoreRing score={entry.score} grade={label} targetRole={entry.role} />
                        </div>
                        <div>
                          <div className="history-detail__section-title">Keywords</div>
                          <KeywordTags present={entry.present || []} missing={entry.missing || []} />
                        </div>
                        {entry.suggestions?.length > 0 && (
                          <div style={{ gridColumn: '1 / -1' }}>
                            <div className="history-detail__section-title">Suggestions</div>
                            <FeedbackList suggestions={entry.suggestions} />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
