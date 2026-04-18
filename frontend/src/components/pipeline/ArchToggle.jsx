import { useArchMode } from '../../context/ArchitectureContext.jsx'

export default function ArchToggle() {
  const { mode, setMode } = useArchMode()

  return (
    <div className="arch-toggle" role="group" aria-label="Architecture mode">
      <button
        id="arch-toggle-monolith"
        className={`arch-toggle__btn${mode === 'monolith' ? ' arch-toggle__btn--active' : ''}`}
        onClick={() => setMode('monolith')}
        aria-pressed={mode === 'monolith'}
      >
        Layered Monolithic
      </button>
      <button
        id="arch-toggle-pipeline"
        className={`arch-toggle__btn${mode === 'pipeline' ? ' arch-toggle__btn--active' : ''}`}
        onClick={() => setMode('pipeline')}
        aria-pressed={mode === 'pipeline'}
      >
        Pipe &amp; Filter
      </button>
    </div>
  )
}
