import { Check } from 'lucide-react'
import { useArchMode } from '../../context/ArchitectureContext.jsx'
import { PIPELINE_STAGES, STAGE_LABELS } from '../../utils/constants.jsx'

const STAGE_INDEX = Object.fromEntries(PIPELINE_STAGES.map((s, i) => [s, i]))

function getStepState(stepName, currentStage) {
  if (currentStage === 'idle') return 'upcoming'
  const stepIdx    = STAGE_INDEX[stepName]
  const currentIdx = STAGE_INDEX[currentStage] ?? (currentStage === 'done' ? 99 : -1)
  if (currentIdx > stepIdx)  return 'done'
  if (currentIdx === stepIdx) return 'active'
  return 'upcoming'
}

export default function PipelineTracker({ stage }) {
  const { mode } = useArchMode()
  if (mode !== 'pipeline') return null

  return (
    <div className="pipeline-tracker" role="status" aria-label="Pipeline progress">
      <div className="container">
        <div className="pipeline-tracker__inner">
          {PIPELINE_STAGES.map((stepName, idx) => {
            const state = getStepState(stepName, stage)
            const isLast = idx === PIPELINE_STAGES.length - 1

            return (
              <div key={stepName} style={{ display: 'flex', alignItems: 'center' }}>
                <div className={`pipeline-step pipeline-step--${state}`}>
                  <div className="pipeline-step__dot" aria-hidden="true">
                    {state === 'done' && <Check size={10} strokeWidth={3} />}
                  </div>
                  <span className="pipeline-step__label">{STAGE_LABELS[stepName]}</span>
                </div>

                {!isLast && (
                  <div
                    className={`pipeline-connector${
                      state === 'done' ? ' pipeline-connector--done'
                      : state === 'active' ? ' pipeline-connector--active'
                      : ''}`}
                    aria-hidden="true"
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
