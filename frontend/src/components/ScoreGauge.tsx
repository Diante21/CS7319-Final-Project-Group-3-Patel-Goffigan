import React from 'react';

interface ScoreGaugeProps {
  score: number;
  grade: string;
}

const getColor = (score: number): string => {
  if (score >= 70) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
};

const getTrackColor = (score: number): string => {
  if (score >= 70) return '#dcfce7';
  if (score >= 50) return '#fef3c7';
  return '#fee2e2';
};

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, grade }) => {
  const radius = 70;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;
  const color = getColor(clampedScore);
  const trackColor = getTrackColor(clampedScore);
  const size = radius * 2;

  return (
    <div className="score-gauge-container">
      <svg height={size} width={size} className="score-gauge-svg">
        <circle
          stroke={trackColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text
          x="50%"
          y="44%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="28"
          fontWeight="700"
          fill={color}
        >
          {clampedScore}
        </text>
        <text
          x="50%"
          y="64%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="13"
          fill="#64748b"
        >
          Grade: {grade}
        </text>
      </svg>
      <p className="score-label" style={{ color }}>
        {clampedScore >= 70 ? 'Strong Resume' : clampedScore >= 50 ? 'Needs Improvement' : 'Needs Major Work'}
      </p>
    </div>
  );
};

export default ScoreGauge;
