import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import ScoreGauge from './ScoreGauge';

interface ResultsDisplayProps {
  result: AnalysisResult;
}

const KeywordGroup: React.FC<{ title: string; found: string[]; missing: string[]; density: number }> = ({
  title, found, missing, density,
}) => (
  <div className="keyword-group">
    <div className="keyword-group-header">
      <h4>{title}</h4>
      <span className="density-badge">Density: {density.toFixed(1)}%</span>
    </div>
    {found.length > 0 && (
      <div className="keyword-row">
        <span className="keyword-row-label found-label">✓ Found</span>
        <div className="keyword-chips">
          {found.map((kw) => (
            <span key={kw} className="chip chip-found">{kw}</span>
          ))}
        </div>
      </div>
    )}
    {missing.length > 0 && (
      <div className="keyword-row">
        <span className="keyword-row-label missing-label">✗ Missing</span>
        <div className="keyword-chips">
          {missing.map((kw) => (
            <span key={kw} className="chip chip-missing">{kw}</span>
          ))}
        </div>
      </div>
    )}
  </div>
);

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'keywords' | 'feedback'>('overview');

  const formattedDate = new Date(result.timestamp).toLocaleString();

  return (
    <div className="results-display">
      <div className="results-header">
        <div className="results-title-row">
          <h2 className="results-title">Analysis Results</h2>
          <span className="results-meta">
            {result.filename ? `📄 ${result.filename}` : '📝 Text Input'} &nbsp;·&nbsp; {formattedDate}
          </span>
        </div>
      </div>

      <div className="score-section">
        <ScoreGauge score={result.overallScore} grade={result.grade} />
        <div className="score-summary">
          <div className="summary-stat">
            <span className="stat-value">{result.rawTextLength}</span>
            <span className="stat-label">Characters</span>
          </div>
          <div className="summary-stat">
            <span className="stat-value">{result.sections.length}</span>
            <span className="stat-label">Sections</span>
          </div>
          <div className="summary-stat">
            <span className="stat-value">{result.feedback.strengths.length}</span>
            <span className="stat-label">Strengths</span>
          </div>
          <div className="summary-stat">
            <span className="stat-value">{result.feedback.critical.length}</span>
            <span className="stat-label">Issues</span>
          </div>
        </div>
      </div>

      <div className="results-tabs">
        {(['overview', 'keywords', 'feedback'] as const).map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' && '📊 Sections'}
            {tab === 'keywords' && '🏷️ Keywords'}
            {tab === 'feedback' && '💬 Feedback'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="tab-content">
          {result.sections.map((section) => {
            const pct = section.maxScore > 0 ? (section.score / section.maxScore) * 100 : 0;
            const barColor = pct >= 70 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';
            return (
              <div key={section.name} className="section-score-row">
                <div className="section-score-header">
                  <span className="section-name">{section.name}</span>
                  <span className="section-score-text">
                    {section.score}/{section.maxScore}
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${pct}%`, backgroundColor: barColor }}
                  />
                </div>
                {section.feedback.length > 0 && (
                  <ul className="section-feedback-list">
                    {section.feedback.map((fb, i) => (
                      <li key={i} className="section-feedback-item">{fb}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'keywords' && (
        <div className="tab-content">
          <KeywordGroup
            title="💻 Technical Skills"
            found={result.keywords.technical.found}
            missing={result.keywords.technical.missing}
            density={result.keywords.technical.density}
          />
          <KeywordGroup
            title="🤝 Soft Skills"
            found={result.keywords.softSkills.found}
            missing={result.keywords.softSkills.missing}
            density={result.keywords.softSkills.density}
          />
          <KeywordGroup
            title="⚡ Action Verbs"
            found={result.keywords.actionVerbs.found}
            missing={result.keywords.actionVerbs.missing}
            density={result.keywords.actionVerbs.density}
          />
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="tab-content">
          {result.feedback.critical.length > 0 && (
            <div className="feedback-card critical">
              <h4 className="feedback-card-title">🚨 Critical Issues</h4>
              <ul className="feedback-list">
                {result.feedback.critical.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {result.feedback.improvements.length > 0 && (
            <div className="feedback-card improvements">
              <h4 className="feedback-card-title">💡 Improvements</h4>
              <ul className="feedback-list">
                {result.feedback.improvements.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {result.feedback.strengths.length > 0 && (
            <div className="feedback-card strengths">
              <h4 className="feedback-card-title">✅ Strengths</h4>
              <ul className="feedback-list">
                {result.feedback.strengths.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
