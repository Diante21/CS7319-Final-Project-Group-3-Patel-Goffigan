import { useState, useCallback, useRef } from 'react'
import { useArchMode } from '../context/ArchitectureContext.jsx'
import { PIPELINE_EVENTS, PERSIST_STATUS, MOCK_CONFIG } from '../utils/constants.jsx'
import { runMockPipeline, runMockMonolith } from '../utils/mockPipeline.jsx'

const INITIAL_STATE = {
  stage: 'idle',       // 'idle'|'intake'|'keyword'|'scoring'|'feedback'|'persist'|'done'|'error'
  result: {},          // Partial<FeedbackResult> — fills incrementally in pipeline mode
  errorStage: null,    // which filter broke, null if clean
  persistStatus: PERSIST_STATUS.IDLE,  // drives SavedBadge optimistic revert
  timestamps: {},      // { [stage]: { completedAt: number, durationMs: number } }
}

/**
 * usePipeline — encapsulates ALL SSE / monolith fetch logic.
 * Display components are pure read-only consumers.
 * Reads mode from useArchMode() — never passed as a prop.
 */
export function usePipeline() {
  const { mode } = useArchMode()
  const [state, setState] = useState(INITIAL_STATE)
  const cleanupRef = useRef(null)
  const payloadRef = useRef(null)  // Bug 7: store text/targetRole for real API call when mock is replaced

  const reset = useCallback(() => {
    if (cleanupRef.current) cleanupRef.current()
    cleanupRef.current = null
    setState(INITIAL_STATE)
  }, [])

  const startPipeline = useCallback(({ text, targetRole }) => {
    payloadRef.current = { text, targetRole }  // ready for: fetch('/api/pipeline/start', { body: JSON.stringify(payloadRef.current) })
    if (cleanupRef.current) cleanupRef.current()
    setState({ ...INITIAL_STATE, stage: 'intake' })

    if (mode === 'monolith') {
      const cleanup = runMockMonolith((fullResult) => {
        setState({
          stage: 'done',
          result: fullResult,
          errorStage: null,
          persistStatus: PERSIST_STATUS.CONFIRMED,
          timestamps: {
            monolith: { completedAt: fullResult.completedAt, durationMs: fullResult.durationMs },
          },
        })
      })
      cleanupRef.current = cleanup
    } else {
      // Pipeline mode — SSE-driven, sections unlock progressively
      const handleEvent = (event) => {
        setState((prev) => {
          const { type, data, durationMs, completedAt, success } = event
          switch (type) {
            case PIPELINE_EVENTS.INTAKE:
              return { ...prev, stage: 'keyword',
                timestamps: { ...prev.timestamps, intake: { completedAt, durationMs } } }
            case PIPELINE_EVENTS.KEYWORD:
              return { ...prev, stage: 'scoring',
                result: { ...prev.result, ...data },
                timestamps: { ...prev.timestamps, keyword: { completedAt, durationMs } } }
            case PIPELINE_EVENTS.SCORING:
              return { ...prev, stage: 'feedback',
                result: { ...prev.result, ...data },
                timestamps: { ...prev.timestamps, scoring: { completedAt, durationMs } } }
            case PIPELINE_EVENTS.FEEDBACK:
              return { ...prev, stage: 'persist',
                result: { ...prev.result, ...data },
                timestamps: { ...prev.timestamps, feedback: { completedAt, durationMs } } }
            case PIPELINE_EVENTS.PERSIST:
              return { ...prev, stage: 'done',
                persistStatus: PERSIST_STATUS.PENDING,
                timestamps: { ...prev.timestamps, persist: { completedAt, durationMs } } }
            case PIPELINE_EVENTS.PERSIST_ACK:
              return { ...prev,
                persistStatus: success ? PERSIST_STATUS.CONFIRMED : PERSIST_STATUS.FAILED }
            default:
              return prev
          }
        })
      }
      cleanupRef.current = runMockPipeline(handleEvent, !MOCK_CONFIG.SIMULATE_PERSIST_FAILURE)
    }
  }, [mode])

  return { ...state, startPipeline, reset }
}
