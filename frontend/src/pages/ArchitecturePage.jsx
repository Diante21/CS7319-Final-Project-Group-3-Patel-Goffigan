import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import { PIPE_CONTRACTS } from '../types/pipeline.types.jsx'
import { STAGE_LABELS } from '../utils/constants.jsx'

const MONOLITH_NODES = ['Controller', 'Service', 'Scoring Engine', 'Repository']

const PIPE_NODES = [
  { id: 'intake',   label: 'Intake' },
  { id: 'keyword',  label: 'Keyword Filter' },
  { id: 'scoring',  label: 'Scoring Filter' },
  { id: 'feedback', label: 'Feedback Filter' },
  { id: 'persist',  label: 'Persistence' },
]

const PIPE_KEYS = ['intake\u2192keyword','keyword\u2192scoring','scoring\u2192feedback','feedback\u2192persist']

function MonolithDiagram() {
  return (
    <div className="monolith-stack">
      {MONOLITH_NODES.map((node, i) => (
        <div key={node}>
          <div className="monolith-node">{node}</div>
          {i < MONOLITH_NODES.length - 1 && (
            <div className="monolith-arrow" aria-hidden="true">
              <div style={{ width:1, height:16, background:'var(--color-border)' }} />
              <ArrowRight size={12} color="var(--color-text-muted)" style={{ transform:'rotate(90deg)', marginTop:-4 }} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function PipeFilterDiagram() {
  const [openPipe, setOpenPipe] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const arrowRefs = useRef({})

  const handleArrowClick = (pipeKey) => {
    if (openPipe === pipeKey) {
      setOpenPipe(null)
      return
    }
    const el = arrowRefs.current[pipeKey]
    if (el) {
      const rect = el.getBoundingClientRect()
      setTooltipPos({
        x: rect.left + rect.width / 2,
        y: rect.top - 8,
      })
    }
    setOpenPipe(pipeKey)
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <div className="pipeline-diagram">
        {PIPE_NODES.map((node, idx) => {
          const pipeKey = PIPE_KEYS[idx - 1]
          return (
            <div key={node.id} style={{ display: 'flex', alignItems: 'center' }}>
              {/* Arrow / pipe between nodes */}
              {idx > 0 && (
                <div
                  ref={(el) => { arrowRefs.current[pipeKey] = el }}
                  className="pipe-arrow"
                  title={`Click to see data contract: ${PIPE_KEYS[idx-1]}`}
                  style={{ position:'relative', cursor:'pointer', padding:'0 2px' }}
                  onClick={() => handleArrowClick(pipeKey)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={openPipe === pipeKey}
                  aria-label={`View data contract: ${pipeKey}`}
                  onKeyDown={(e) => e.key === 'Enter' && handleArrowClick(pipeKey)}
                >
                  <div style={{ display:'flex', alignItems:'center', gap:2, background:'var(--color-primary-light)', borderRadius:4, padding:'3px 6px', border:'1px solid #BFDBFE' }}>
                    <div style={{ width:20, height:2, background:'var(--color-primary)', borderRadius:1 }} />
                    <ArrowRight size={12} color="var(--color-primary)" strokeWidth={2} />
                    {openPipe === pipeKey ? <ChevronUp size={10} color="var(--color-primary)" /> : <ChevronDown size={10} color="var(--color-primary)" />}
                  </div>
                </div>
              )}

              {/* Tooltip rendered via portal to escape overflow-x:auto clipping */}
              {openPipe === pipeKey && createPortal(
                <div
                  className="pipe-tooltip"
                  style={{
                    position: 'fixed',
                    top: tooltipPos.y,
                    left: tooltipPos.x,
                    transform: 'translate(-50%, -100%)',
                    bottom: 'auto',
                  }}
                  role="tooltip"
                >
                  {`// Pipe: ${pipeKey}\n`}{PIPE_CONTRACTS[pipeKey]}
                </div>,
                document.body
              )}

              <div className="pipe-node">
                {node.label}
              </div>
            </div>
          )
        })}
      </div>
      <p className="arch-caption">
        Click any arrow to inspect the TypeScript interface passed through that pipe.
        Filters are fully decoupled — a filter only knows the data shape coming in, not who sent it.
      </p>
    </div>
  )
}

function WaterfallChart({ timestamps }) {
  const entries = Object.entries(timestamps)
  if (!entries.length) return null

  const maxMs = Math.max(...entries.map(([, v]) => v.durationMs), 1)
  const isMonolith = 'monolith' in timestamps

  return (
    <div className="waterfall-chart">
      <div className="waterfall-chart__title">
        {isMonolith ? 'Monolith \u2014 Single Response Time' : 'Pipeline \u2014 Per-Filter Latency'}
      </div>
      {entries.map(([stage, { durationMs }]) => {
        const pct = Math.round((durationMs / maxMs) * 100)
        const label = STAGE_LABELS[stage] || stage
        return (
          <div key={stage} className="waterfall-bar-row">
            <div className="waterfall-bar-label">{label}</div>
            <div className="waterfall-bar-track">
              <div
                className={`waterfall-bar-fill ${isMonolith ? 'waterfall-bar-fill--monolith' : 'waterfall-bar-fill--pipeline'}`}
                style={{ width: `${pct}%` }}
                role="meter"
                aria-valuenow={durationMs}
                aria-valuemin={0}
                aria-valuemax={maxMs}
              >
                {durationMs}ms
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function ArchitecturePage() {
  // Bug 3 fix: read timestamps from localStorage (AnalyzerPage writes them there on completion)
  // Each usePipeline() call creates isolated state — sharing via localStorage is the correct bridge.
  const [timestamps, setTimestamps] = useState({})
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('resumeai_timestamps') || '{}')
      setTimestamps(stored)
    } catch { setTimestamps({}) }
  }, [])
  const hasTimestamps = Object.keys(timestamps).length > 0

  return (
    <main className="arch-page page" id="main-content">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Architecture Explainer</h1>
          <p className="page-subtitle">Two approaches to the same pipeline — compared side by side.</p>
        </div>

        <div className="arch-diagrams" aria-label="Architecture comparison">
          {/* Monolith */}
          <div className="arch-diagram-card">
            <div className="arch-diagram-card__header">
              <div className="arch-diagram-card__title">Layered Monolith</div>
              <div className="arch-diagram-card__sub">Top-down synchronous call flow</div>
            </div>
            <div className="arch-diagram-card__body">
              <MonolithDiagram />
              <p className="arch-caption">
                Each layer explicitly calls the one below it — control flow is top-down and synchronous.
                The Controller must wait for the Repository to return before responding.
              </p>
            </div>
          </div>

          {/* Pipe & Filter */}
          <div className="arch-diagram-card">
            <div className="arch-diagram-card__header">
              <div className="arch-diagram-card__title">Pipe &amp; Filter</div>
              <div className="arch-diagram-card__sub">Decoupled filters connected by data contracts</div>
            </div>
            <div className="arch-diagram-card__body">
              <PipeFilterDiagram />
            </div>
          </div>
        </div>

        {/* Callout */}
        <div className="arch-callout" role="note">
          <p className="arch-callout__text">
            Swapping a filter (e.g., replacing RuleBasedScoringFilter with AIScoringFilter) requires
            zero changes to adjacent filters — only the TypeScript interface must be preserved.
            Demo: comment out ScoringFilter entirely — KeywordFilter still completes and the keyword
            section in the UI still unlocks.
          </p>
        </div>

        {/* NFR Comparison Table */}
        <div className="card" style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 16, color: 'var(--color-text-primary)' }}>NFR Evidence Summary</h2>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr>
                {['NFR','Test','What to Measure'].map(h => (
                  <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:11, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--color-text-muted)', borderBottom:'1px solid var(--color-border)', background:'var(--color-bg)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['NFR-1 Performance', 'Submit identical resumes to both architectures', 'Per-filter durationMs vs. total monolith response time \u2014 waterfall chart below'],
                ['NFR-2 Scalability', 'Gradually increase concurrent pipeline jobs', 'Throughput degradation \u2014 contention across jobs, not parallelism within one job'],
                ['NFR-6 Modifiability', 'Swap RuleBasedScoringFilter with AIScoringFilter', 'Lines changed; verify KeywordFilter output is completely unaffected'],
              ].map(([nfr, test, measure]) => (
                <tr key={nfr}>
                  <td style={{ padding:'10px 12px', borderBottom:'1px solid var(--color-border)', fontWeight:500 }}>{nfr}</td>
                  <td style={{ padding:'10px 12px', borderBottom:'1px solid var(--color-border)', color:'var(--color-text-secondary)' }}>{test}</td>
                  <td style={{ padding:'10px 12px', borderBottom:'1px solid var(--color-border)', color:'var(--color-text-secondary)' }}>{measure}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Waterfall */}
        <div className="waterfall-section">
          <h2 style={{ fontSize:14, fontWeight:500, marginBottom:12, color:'var(--color-text-primary)' }}>Latency Waterfall</h2>
          {hasTimestamps
            ? <WaterfallChart timestamps={timestamps} />
            : <div className="waterfall-empty">
                Run an analysis from the Analyzer page first — waterfall data appears here using server-side
                <code style={{ fontSize:12, background:'var(--color-bg)', padding:'1px 5px', borderRadius:4, margin:'0 4px' }}>durationMs</code>
                per SSE event, not <code style={{ fontSize:12, background:'var(--color-bg)', padding:'1px 5px', borderRadius:4 }}>performance.now()</code>.
              </div>
          }
        </div>
      </div>
    </main>
  )
}
