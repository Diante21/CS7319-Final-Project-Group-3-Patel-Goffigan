import { Link } from 'react-router-dom'
import { BarChart2, Tag, Lightbulb, ArrowRight } from 'lucide-react'

const FEATURES = [
  {
    icon: BarChart2,
    color: 'var(--color-primary)',
    bg: 'var(--color-primary-light)',
    title: 'Score Generation',
    desc: 'Get an objective 0–100 score based on keyword match, formatting quality, and impact strength — recalculated in real time.',
  },
  {
    icon: Tag,
    color: 'var(--color-success)',
    bg: 'var(--color-success-light)',
    title: 'Keyword Analysis',
    desc: 'See exactly which skills are present and which are missing for your target role, pulled from thousands of live job postings.',
  },
  {
    icon: Lightbulb,
    color: 'var(--color-warning)',
    bg: 'var(--color-warning-light)',
    title: 'Actionable Feedback',
    desc: 'Receive specific, categorized suggestions — Formatting, Impact, Keywords — that you can act on before submitting.',
  },
]

function AppPreview() {
  return (
    <div className="app-preview" aria-hidden="true" role="img" aria-label="App interface preview">
      {/* Mock navbar */}
      <div className="preview-navbar">
        <div className="preview-dot" style={{ background: '#EF4444' }} />
        <div className="preview-dot" style={{ background: '#F59E0B' }} />
        <div className="preview-dot" style={{ background: '#22A06B' }} />
        <div style={{ marginLeft: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="preview-block" style={{ width: 64, height: 10 }} />
          <div className="preview-block" style={{ width: 48, height: 10 }} />
          <div className="preview-block" style={{ width: 56, height: 10 }} />
        </div>
      </div>
      {/* Mock two-panel layout */}
      <div className="preview-layout">
        <div className="preview-left">
          <div className="preview-block" style={{ width: '60%', height: 12 }} />
          <div className="preview-upload">
            <div style={{ textAlign: 'center' }}>
              <div className="preview-block" style={{ width: 28, height: 28, borderRadius: '50%', margin: '0 auto 6px' }} />
              <div className="preview-block" style={{ width: 80, height: 8 }} />
            </div>
          </div>
          <div className="preview-block" style={{ width: '40%', height: 9, opacity: 0.5 }} />
          <div className="preview-block" style={{ height: 36, borderRadius: 6 }} />
          <div className="preview-block" style={{ height: 28, borderRadius: 6, background: 'var(--color-primary)', opacity: 0.8 }} />
        </div>
        <div className="preview-right">
          <div className="preview-ring-area">
            <div className="preview-ring">78</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              <div className="preview-block" style={{ width: '70%', height: 10 }} />
              <div className="preview-block" style={{ width: '50%', height: 9, opacity: 0.5 }} />
            </div>
          </div>
          <div className="preview-block" style={{ height: 10, width: '30%', opacity: 0.4 }} />
          <div className="preview-tags">
            {[1,2,3,4,5].map(i => <div key={i} className="preview-tag" />)}
            {[1,2,3].map(i => <div key={i} className="preview-tag preview-tag--miss" />)}
          </div>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: 36, background: 'var(--color-border)', borderRadius: 8, opacity: 0.5 }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <main className="landing-page" id="main-content">
      <section className="hero">
        <div className="container">
          <div className="hero__badge">
            <BarChart2 size={12} strokeWidth={2} aria-hidden="true" />
            AI-powered resume intelligence
          </div>
          <h1>Your resume, scored.<br />Your career, advanced.</h1>
          <p className="hero__sub">
            ResumeAI analyzes your resume against your target role, scores it in real time,
            and tells you exactly what to fix — before you submit.
          </p>
          <div className="hero__actions">
            <Link to="/analyze" className="btn btn-primary btn-lg" id="hero-cta">
              Analyze my resume
              <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
            </Link>
            <Link to="/architecture" className="btn btn-secondary btn-lg">
              How it works
            </Link>
          </div>
        </div>
      </section>

      <section className="features" aria-labelledby="features-title">
        <div className="container">
          <h2 className="features__title" id="features-title">Everything you need before you apply</h2>
          <div className="features__grid">
            {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="feature-card">
                <div className="feature-card__icon" style={{ background: bg, color }}>
                  <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                </div>
                <div className="feature-card__title">{title}</div>
                <p className="feature-card__desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="preview-section" aria-labelledby="preview-title">
        <div className="container">
          <p className="preview-section__label" id="preview-title">Interface Preview</p>
          <AppPreview />
        </div>
      </section>
    </main>
  )
}
