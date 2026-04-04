import React, { useState, useRef } from 'react';

interface ResumeFormProps {
  onSubmit: (text: string | null, file: File | null) => void;
  loading: boolean;
}

const SAMPLE_RESUME = `John Smith
john.smith@email.com | (555) 123-4567 | linkedin.com/in/johnsmith | github.com/johnsmith

SUMMARY
Results-driven Software Engineer with 5+ years of experience developing scalable web applications and microservices. Proficient in Python, JavaScript, and cloud technologies. Passionate about delivering high-quality solutions.

EXPERIENCE
Senior Software Engineer | Tech Corp | 2021 – Present
• Architected and deployed RESTful APIs serving 500K+ daily active users
• Led migration from monolithic to microservices architecture, reducing latency by 40%
• Collaborated with cross-functional teams to deliver features on schedule

Software Engineer | StartupCo | 2019 – 2021
• Developed React frontend dashboards improving user engagement by 25%
• Implemented CI/CD pipelines with Docker and Jenkins
• Mentored 3 junior developers

EDUCATION
B.S. Computer Science | State University | 2019

SKILLS
Languages: Python, JavaScript, TypeScript, Java, SQL
Frameworks: React, Node.js, Django, Spring Boot
Tools: Docker, Kubernetes, AWS, Git, Jenkins`;

const ResumeForm: React.FC<ResumeFormProps> = ({ onSubmit, loading }) => {
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');
  const [resumeText, setResumeText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMode === 'text') {
      onSubmit(resumeText.trim() || null, null);
    } else {
      onSubmit(null, selectedFile);
    }
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'text/plain' || file.type === 'application/pdf')) {
      handleFileChange(file);
    }
  };

  const canSubmit = inputMode === 'text'
    ? resumeText.trim().length > 0
    : selectedFile !== null;

  return (
    <form onSubmit={handleSubmit} className="resume-form">
      <div className="input-mode-toggle">
        <button
          type="button"
          className={`mode-btn ${inputMode === 'text' ? 'active' : ''}`}
          onClick={() => setInputMode('text')}
        >
          ✏️ Paste Text
        </button>
        <button
          type="button"
          className={`mode-btn ${inputMode === 'file' ? 'active' : ''}`}
          onClick={() => setInputMode('file')}
        >
          📁 Upload File
        </button>
      </div>

      {inputMode === 'text' ? (
        <div className="form-group">
          <label className="form-label">Resume Text</label>
          <textarea
            className="resume-textarea"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder={SAMPLE_RESUME}
            rows={18}
          />
          <p className="field-hint">{resumeText.length} characters</p>
        </div>
      ) : (
        <div className="form-group">
          <label className="form-label">Upload Resume (.txt or .pdf)</label>
          <div
            className={`drop-zone ${dragOver ? 'drag-over' : ''} ${selectedFile ? 'has-file' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf"
              style={{ display: 'none' }}
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            />
            {selectedFile ? (
              <div className="file-selected">
                <span className="file-icon">📄</span>
                <span className="file-name">{selectedFile.name}</span>
                <span className="file-size">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                <button
                  type="button"
                  className="remove-file"
                  onClick={(e) => { e.stopPropagation(); handleFileChange(null); }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="drop-zone-inner">
                <span className="drop-icon">☁️</span>
                <p>Drag & drop or <strong>click to browse</strong></p>
                <p className="drop-hint">Supports .txt and .pdf files</p>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        type="submit"
        className={`submit-btn ${loading ? 'loading' : ''}`}
        disabled={loading || !canSubmit}
      >
        {loading ? (
          <>
            <span className="spinner" />
            Analyzing...
          </>
        ) : (
          '🔍 Analyze Resume'
        )}
      </button>
    </form>
  );
};

export default ResumeForm;
