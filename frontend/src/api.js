const TIMEOUT_MS = 15000

function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  const signal = options.signal
    ? anySignal([options.signal, controller.signal])
    : controller.signal
  return fetch(url, { ...options, signal })
    .then((res) => { clearTimeout(timer); return res })
    .catch((err) => {
      clearTimeout(timer)
      if (err.name === 'AbortError') throw err
      throw err
    })
}

function anySignal(signals) {
  const controller = new AbortController()
  for (const signal of signals) {
    if (signal.aborted) { controller.abort(); break }
    signal.addEventListener('abort', () => controller.abort(), { once: true })
  }
  return controller.signal
}

const getBaseUrl = (mode) => {
  if (mode === 'pipeline') {
    return import.meta.env.VITE_EVENTBASED_URL || 'http://localhost:3002'
  }
  return import.meta.env.VITE_LAYERED_URL || 'http://localhost:3001'
}

export const analyzeText = async (text, mode, signal, jobDescription) => {
  const baseUrl = getBaseUrl(mode)
  const response = await fetchWithTimeout(`${baseUrl}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, jobDescription }),
    signal,
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || `Server error: ${response.status}`)
  }
  return response.json()
}

export const analyzeWithSpring = async (text, fileName, jobDescription, signal) => {
  const baseUrl = import.meta.env.VITE_SPRING_URL || 'http://localhost:8080'
  const response = await fetchWithTimeout(`${baseUrl}/api/resume/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: text,
      fileName: fileName || '',
      jobDescription: jobDescription || '',
    }),
    signal,
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || `Server error: ${response.status}`)
  }
  return response.json()
}

export const analyzeFile = async (file, mode, signal) => {
  const baseUrl = getBaseUrl(mode)
  const formData = new FormData()
  formData.append('resume', file)
  const response = await fetchWithTimeout(`${baseUrl}/api/analyze`, {
    method: 'POST',
    body: formData,
    signal,
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || `Server error: ${response.status}`)
  }
  return response.json()
}

export const getHistory = async (mode, signal) => {
  const baseUrl = getBaseUrl(mode)
  const response = await fetchWithTimeout(`${baseUrl}/api/results`, { signal })
  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`)
  }
  return response.json()
}
