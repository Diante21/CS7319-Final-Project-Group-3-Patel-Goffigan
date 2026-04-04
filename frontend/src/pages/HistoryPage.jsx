import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, ArrowRight } from 'lucide-react'
import HistoryTable from '../components/history/HistoryTable.jsx'

export default function HistoryPage() {
  const [entries, setEntries] = useState([])

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('resumeai_history') || '[]')
      setEntries(stored)
    } catch {
      setEntries([])
    }
  }, [])

  return (
    <main className="history-page page" id="main-content">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Submission History</h1>
          <p className="page-subtitle">
            {entries.length
              ? `${entries.length} resume${entries.length !== 1 ? 's' : ''} analyzed. Click any row to expand results.`
              : 'Your past analyses will appear here.'}
          </p>
        </div>

        {entries.length === 0 ? (
          <div className="history-empty card">
            <Clock size={36} className="history-empty__icon" strokeWidth={1.25} aria-hidden="true" />
            <div className="history-empty__title">No submissions yet</div>
            <p className="history-empty__sub">Run your first analysis to see results here.</p>
            <div style={{ marginTop: 20 }}>
              <Link to="/analyze" className="btn btn-primary" id="history-analyze-cta">
                Analyze a resume
                <ArrowRight size={14} strokeWidth={1.75} aria-hidden="true" />
              </Link>
            </div>
          </div>
        ) : (
          <HistoryTable entries={entries} />
        )}
      </div>
    </main>
  )
}
