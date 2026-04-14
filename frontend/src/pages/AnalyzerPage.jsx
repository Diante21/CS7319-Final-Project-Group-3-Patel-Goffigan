import { useState, useCallback, useEffect, useRef } from 'react'
import { FileText, Loader } from 'lucide-react'
import { usePipeline } from '../hooks/usePipeline.jsx'
import { useArchMode } from '../context/ArchitectureContext.jsx'
import { TARGET_ROLES } from '../utils/constants.jsx'
import PipelineTracker from '../components/pipeline/PipelineTracker.jsx'
import FileUploadZone from '../components/analyzer/FileUploadZone.jsx'
import ScoreRing from '../components/analyzer/ScoreRing.jsx'
import CategoryPills from '../components/analyzer/CategoryPills.jsx'
import KeywordTags from '../components/analyzer/KeywordTags.jsx'
import FeedbackList from '../components/analyzer/FeedbackList.jsx'
import SkeletonSection from '../components/analyzer/SkeletonSection.jsx'
import SavedBadge from '../components/analyzer/SavedBadge.jsx'

function saveToHistory(result, fileName, role) {
  const entries = JSON.parse(localStorage.getItem('resumeai_history') || '[]')
  entries.unshift({
    id: Date.now().toString(),
    fileName: fileName || 'Pasted resume',
    role,
    date: new Date().toISOString(),
    score: result.score,
    grade: result.grade,
    present: result.present,
    missing: result.missing,
    suggestions: result.suggestions,
  })
  localStorage.setItem('resumeai_history', JSON.stringify(entries.slice(0, 50)))
}

export default function AnalyzerPage() {
  const { mode } = useArchMode()
  const { stage, result, persistStatus, timestamps, startPipeline, reset } = usePipeline()

  const [resumeText, setResumeText] = useState('')
  const [pastedText, setPastedText] = useState('')
  const [fileName, setFileName] = useState('')
  const [role, setRole] = useState(TARGET_ROLES[0])
  const [jobDescription, setJobDescription] = useState('')
  const [saveError, setSaveError] = useState(false)

  const handleFileText = useCallback((text, name) => {
    setResumeText(text)
    setFileName(name)
    setPastedText('')
  }, [])

  const handlePaste = (e) => {
    setPastedText(e.target.value)
    setResumeText(e.target.value)
    setFileName('')
  }

  const handleAnalyze = () => {
    const text = resumeText || pastedText
    if (!text.trim()) return
    savedRef.current = false
    startPipeline({ text, targetRole: role, jobDescription })
  }

  const handleReset = () => {
    reset()
    setResumeText('')
    setPastedText('')
    setFileName('')
    setJobDescription('')
    setSaveError(false)
  }

  const savedRef = useRef(false)
  useEffect(() => {
    if (stage === 'done' && result.score && !savedRef.current) {
      savedRef.current = true
      try {
        saveToHistory(result, fileName, role)
        setSaveError(false)
        localStorage.setItem('resumeai_timestamps', JSON.stringify(timestamps))
      } catch {
        setSaveError(true)
      }
    }
    if (stage === 'idle') savedRef.current = false
  }, [stage, result, fileName, role, timestamps])

  const isRunning = stage !== 'idle' && stage !== 'done'
  const hasResult = stage === 'done'
  const isEmpty = stage === 'idle'

  const isPipeline = mode === 'pipeline'
  const keywordUnlocked = !isEmpty && (result.present || !isPipeline)
  const scoringUnlocked = !isEmpty && (result.score || !isPipeline)
  const feedbackUnlocked = !isEmpty && (result.suggestions || !isPipeline)

  const text = resumeText || pastedText

  return (
    <div className="analyzer-page" id="main-content">
      <PipelineTracker stage={stage} />

      <div className="analyzer-layout">
        {/* Left Panel - Input */}
        <section className="analyzer-panel input-panel" aria-label="Resume input">
          <div>
            <div className="input-panel__title">Resume Analysis</div>
            <div className="input-panel__sub">Upload your file or paste your resume text below.</div>
          </div>

          <FileUploadZone onTextExtracted={handleFileText} />

          <div className="divider-text">or paste text</div>

          <div className="form-group">
            <label className="form-label" htmlFor="resume-textarea">Resume text</label>
            <textarea
              id="resume-textarea"
              className="input textarea"
              placeholder="Paste your resume content here..."
              value={pastedText}
              onChange={handlePaste}
              aria-label="Resume text input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="jd-textarea">Job Description (optional)</label>
            <textarea
              id="jd-textarea"
              className="input textarea"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              aria-label="Job description input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role-select">Target role</label>
            <select
              id="role-select"
              className="input select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {TARGET_ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            <button
              id="analyze-btn"
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={isRunning || !text.trim()}
              aria-busy={isRunning}
            >
              {isRunning
                ? <><Loader size={15} style={{ animation: 'spin 0.7s linear infinite' }} /> Analyzing...</>
                : <><FileText size={15} strokeWidth={1.75} /> Analyze resume</>
              }
            </button>

            {!isEmpty && (
              <button className="reset-btn" onClick={handleReset} type="button" id="reset-btn">
                Start over
              </button>
            )}
          </div>
        </section>

        {/* Right Panel - Results */}
        <section className="analyzer-panel results-panel" aria-label="Analysis results" aria-live="polite">
          {isEmpty ? (
            <div className="results-empty">
              <div className="results-empty__icon">
                <FileText size={22} strokeWidth={1.5} aria-hidden="true" />
              </div>
              <div className="results-empty__title">No analysis yet</div>
              <p className="results-empty__sub">Upload or paste your resume, then click Analyze.</p>
            </div>
          ) : (
            <>
              <div className="results-section">
                <div className="results-section__header">
                  <div className="results-section__title">Overall Score</div>
                  <SavedBadge persistStatus={persistStatus} />
                </div>
                {saveError && (
                  <p className="save-error-msg" role="alert">
                    Could not save to history - browser storage is full.
                  </p>
                )}
                {scoringUnlocked && result.score
                  ? <div className="fade-in">
                    <ScoreRing score={result.score} grade={result.grade} targetRole={role} />
                    {hasResult && (
                      <div style={{ marginTop: 16 }}>
                        <CategoryPills />
                      </div>
                    )}
                  </div>
                  : <SkeletonSection type="ring" />
                }
              </div>

              <div className="results-section">
                <div className="results-section__title">Keyword Analysis</div>
                {keywordUnlocked && result.present
                  ? <div className="fade-in">
                    <KeywordTags present={result.present} missing={result.missing} />
                  </div>
                  : <SkeletonSection type="tags" />
                }
              </div>

              <div className="results-section">
                <div className="results-section__title">Improvement Suggestions</div>
                {feedbackUnlocked && result.suggestions
                  ? <div className="fade-in">
                    <FeedbackList suggestions={result.suggestions} />
                  </div>
                  : <SkeletonSection type="lines" />
                }
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
