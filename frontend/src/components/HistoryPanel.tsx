import React, { useState } from 'react';
import { AnalysisResult } from '../types';

interface HistoryPanelProps {
  history: AnalysisResult[];
  onSelect: (result: AnalysisResult) => void;
  onRefresh: () => void;
  loading: boolean;
}

const getScoreColor = (score: number): string => {
  if (score >= 70) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
};

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect, onRefresh, loading }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`history-panel ${collapsed ? 'collapsed' : ''}`}>
      <div className="history-header" onClick={() => setCollapsed(!collapsed)}>
        <h3 className="history-title">
          📋 History
          {history.length > 0 && <span className="history-count">{history.length}</span>}
        </h3>
        <div className="history-header-actions">
          <button
            className="refresh-btn"
            onClick={(e) => { e.stopPropagation(); onRefresh(); }}
            disabled={loading}
            title="Refresh history"
          >
            {loading ? '⏳' : '🔄'}
          </button>
          <span className="collapse-icon">{collapsed ? '▶' : '▼'}</span>
        </div>
      </div>

      {!collapsed && (
        <div className="history-list">
          {history.length === 0 ? (
            <p className="history-empty">No past analyses yet. Submit a resume to get started.</p>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="history-item"
                onClick={() => onSelect(item)}
              >
                <div className="history-item-left">
                  <span className="history-filename">
                    {item.filename || 'Text Input'}
                  </span>
                  <span className="history-timestamp">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="history-item-right">
                  <span
                    className="history-score"
                    style={{ color: getScoreColor(item.overallScore) }}
                  >
                    {item.overallScore}
                  </span>
                  <span
                    className="history-grade"
                    style={{ borderColor: getScoreColor(item.overallScore), color: getScoreColor(item.overallScore) }}
                  >
                    {item.grade}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;
