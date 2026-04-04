import React, { useState, useCallback } from 'react';
import './App.css';
import { Architecture, AnalysisResult } from './types';
import { analyzeText, analyzeFile, getHistory } from './api';
import ResumeForm from './components/ResumeForm';
import ResultsDisplay from './components/ResultsDisplay';
import HistoryPanel from './components/HistoryPanel';

function App() {
  const [arch, setArch] = useState<Architecture>('layered');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const handleAnalyze = useCallback(async (text: string | null, file: File | null) => {
    setLoading(true);
    setError(null);
    try {
      let res: AnalysisResult;
      if (file) {
        res = await analyzeFile(file, arch);
      } else if (text) {
        res = await analyzeText(text, arch);
      } else {
        setError('Please provide resume text or upload a file.');
        return;
      }
      setResult(res);
    } catch (err: any) {
      const msg = err?.response?.data?.error
        || err?.response?.data?.message
        || err?.message
        || 'Analysis failed. Please check that the backend is running.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [arch]);

  const handleRefreshHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await getHistory(arch);
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [arch]);

  const handleArchChange = (newArch: Architecture) => {
    setArch(newArch);
    setResult(null);
    setError(null);
    setHistory([]);
  };

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <span className="header-icon">📄</span>
            <h1 className="header-title">AI Resume Analyzer</h1>
          </div>
          <div className="arch-toggle">
            <span className="arch-label">Backend:</span>
            <button
              className={`arch-btn ${arch === 'layered' ? 'active' : ''}`}
              onClick={() => handleArchChange('layered')}
            >
              🏗️ Layered
              <span className="arch-port">:3001</span>
            </button>
            <button
              className={`arch-btn ${arch === 'eventbased' ? 'active' : ''}`}
              onClick={() => handleArchChange('eventbased')}
            >
              ⚡ Event-Based
              <span className="arch-port">:3002</span>
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="layout-grid">
          <aside className="left-panel">
            <div className="panel-card">
              <h2 className="panel-heading">Submit Resume</h2>
              <ResumeForm onSubmit={handleAnalyze} loading={loading} />
            </div>
            <HistoryPanel
              history={history}
              onSelect={setResult}
              onRefresh={handleRefreshHistory}
              loading={historyLoading}
            />
          </aside>

          <section className="right-panel">
            {error && (
              <div className="error-banner" role="alert">
                <span className="error-icon">⚠️</span>
                <div>
                  <strong>Error</strong>
                  <p>{error}</p>
                </div>
                <button className="error-dismiss" onClick={() => setError(null)}>✕</button>
              </div>
            )}
            {loading && (
              <div className="loading-state">
                <div className="loading-spinner" />
                <p className="loading-text">Analyzing your resume...</p>
                <p className="loading-sub">This may take a few seconds</p>
              </div>
            )}
            {!loading && !result && !error && (
              <div className="empty-state">
                <span className="empty-icon">🎯</span>
                <h3>Ready to Analyze</h3>
                <p>Paste your resume text or upload a file, then click <strong>Analyze Resume</strong> to get detailed feedback and scoring.</p>
                <ul className="empty-features">
                  <li>📊 Overall score with letter grade</li>
                  <li>📝 Section-by-section breakdown</li>
                  <li>🏷️ Keyword gap analysis</li>
                  <li>💬 Actionable feedback</li>
                </ul>
              </div>
            )}
            {!loading && result && <ResultsDisplay result={result} />}
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <p>AI Resume Analyzer &mdash; {arch === 'layered' ? 'Layered Architecture' : 'Event-Based Architecture'}</p>
      </footer>
    </div>
  );
}

export default App;
