import { useState, useRef, useCallback } from 'react'
import { Upload, File, X, Loader } from 'lucide-react'

const ACCEPTED = { 'application/pdf': '.pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx', 'text/plain': '.txt' }

async function extractText(file) {
  const name = file.name.toLowerCase()

  if (name.endsWith('.txt')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  if (name.endsWith('.pdf')) {
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let text = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      text += content.items.map((item) => item.str).join(' ') + '\n'
    }
    return text
  }

  if (name.endsWith('.docx')) {
    const mammoth = await import('mammoth')
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value
  }

  throw new Error('Unsupported file type')
}

export default function FileUploadZone({ onTextExtracted }) {
  const [file, setFile] = useState(null)
  const [dragover, setDragover] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const handleFile = useCallback(async (f) => {
    setError('')
    const ext = f.name.split('.').pop().toLowerCase()
    if (!['pdf', 'docx', 'txt'].includes(ext)) {
      setError('Only PDF, DOCX, or TXT files are supported.')
      return
    }
    setFile(f)
    setLoading(true)
    try {
      const text = await extractText(f)
      onTextExtracted?.(text, f.name)
    } catch {
      setError('Failed to extract text from file. Try pasting it manually.')
      setFile(null)
    } finally {
      setLoading(false)
    }
  }, [onTextExtracted])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragover(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }, [handleFile])

  const onInputChange = (e) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  const removeFile = (e) => {
    e.stopPropagation()
    setFile(null)
    setError('')
    onTextExtracted?.('', '')
    if (inputRef.current) inputRef.current.value = ''
  }

  const zoneCls = [
    'upload-zone',
    dragover ? 'upload-zone--dragover' : '',
    file ? 'upload-zone--filled' : '',
  ].filter(Boolean).join(' ')

  return (
    <div>
      <div
        className={zoneCls}
        onDragOver={(e) => { e.preventDefault(); setDragover(true) }}
        onDragLeave={() => setDragover(false)}
        onDrop={onDrop}
        onClick={() => !file && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="File upload zone"
        onKeyDown={(e) => e.key === 'Enter' && !file && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="upload-zone__input"
          onChange={onInputChange}
          aria-hidden="true"
          tabIndex={-1}
        />

        {loading ? (
          <>
            <Loader size={32} className="upload-zone__icon" style={{ animation: 'spin 0.8s linear infinite' }} />
            <div className="upload-zone__progress">Extracting text…</div>
          </>
        ) : file ? (
          <div className="upload-zone__file">
            <File size={16} aria-hidden="true" />
            {file.name}
            <button className="upload-zone__remove" onClick={removeFile} aria-label="Remove file" type="button">
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <Upload size={32} className="upload-zone__icon" aria-hidden="true" />
            <div className="upload-zone__title">Drop your resume here</div>
            <div className="upload-zone__sub">PDF, DOCX, or TXT — text extracted client-side</div>
          </>
        )}
      </div>
      {error && <p className="upload-zone__error" role="alert">{error}</p>}
    </div>
  )
}
