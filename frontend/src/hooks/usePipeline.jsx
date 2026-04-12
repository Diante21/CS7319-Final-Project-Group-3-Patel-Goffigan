import { useState, useCallback, useRef } from 'react'
import { useArchMode } from '../context/ArchitectureContext.jsx'
import { PIPELINE_EVENTS, PERSIST_STATUS } from '../utils/constants.jsx'
import { analyzeText } from '../api.js'
import { mapResponse } from '../utils/mapResponse.js'

const INITIAL_STATE = {
  stage: 'idle',
  result: {},
  errorStage: null,
  persistStatus: PERSIST_STATUS.IDLE,
  timestamps: {},
}

export function usePipeline() {
  const { mode } = useArchMode()
  const [state, setState] = useState(INITIAL_STATE)
  const cleanupRef = useRef(null)
  const abortRef = useRef(null)

  const reset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = null
    if (cleanupRef.current) cleanupRef.current()
    cleanupRef.current = null
    setState(INITIAL_STATE)
  }, [])

  const startPipeline = useCallback(({ text, targetRole }) => {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    if (cleanupRef.current) cleanupRef.current()
    setState({ ...INITIAL_STATE, stage: 'intake' })

    const timers = []
    const signal = abortRef.current.signal

    if (mode === 'monolith') {
      const startedAt = Date.now()
      analyzeText(text, mode, signal)
        .then((raw) => {
          const result = mapResponse(raw)
          const durationMs = Date.now() - startedAt
          setState({
            stage: 'done',
            result,
            errorStage: null,
            persistStatus: PERSIST_STATUS.CONFIRMED,
            timestamps: {
              monolith: { completedAt: Date.now(), durationMs },
            },
          })
        })
        .catch((err) => {
          if (err.name === 'AbortError') return
          setState((prev) => ({
            ...prev,
            stage: 'error',
            errorStage: 'intake',
            persistStatus: PERSIST_STATUS.FAILED,
          }))
          console.error('[monolith] analysis failed:', err.message)
        })
    } else {
      analyzeText(text, mode, signal)
        .then((raw) => {
          const apiReturnedAt = Date.now()
          const result = mapResponse(raw)

          const fire = (delay, payload) => {
            timers.push(setTimeout(() => {
              setState((prev) => {
                const { type, data, durationMs, completedAt, success } = payload
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
            }, delay))
          }

          fire(200,  { type: PIPELINE_EVENTS.INTAKE,   durationMs: 185, completedAt: apiReturnedAt + 200 })
          fire(600,  { type: PIPELINE_EVENTS.KEYWORD,  durationMs: 390, completedAt: apiReturnedAt + 600,
            data: { present: result.present, missing: result.missing, matchScore: result.matchScore } })
          fire(900,  { type: PIPELINE_EVENTS.SCORING,  durationMs: 295, completedAt: apiReturnedAt + 900,
            data: { score: result.score, grade: result.grade } })
          fire(1200, { type: PIPELINE_EVENTS.FEEDBACK, durationMs: 285, completedAt: apiReturnedAt + 1200,
            data: { suggestions: result.suggestions } })
          fire(1500, { type: PIPELINE_EVENTS.PERSIST,  durationMs: 275, completedAt: apiReturnedAt + 1500 })
          fire(1800, { type: PIPELINE_EVENTS.PERSIST_ACK, success: true, durationMs: 290, completedAt: apiReturnedAt + 1800 })
        })
        .catch((err) => {
          if (err.name === 'AbortError') return
          setState((prev) => ({
            ...prev,
            stage: 'error',
            errorStage: 'intake',
            persistStatus: PERSIST_STATUS.FAILED,
          }))
          console.error('[pipeline] analysis failed:', err.message)
        })
    }

    cleanupRef.current = () => timers.forEach(clearTimeout)
  }, [mode])

  return { ...state, startPipeline, reset }
}
