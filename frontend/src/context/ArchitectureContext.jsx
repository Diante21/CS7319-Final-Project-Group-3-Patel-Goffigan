import { createContext, useContext, useState } from 'react'

const ArchitectureContext = createContext(null)

/**
 * Read the current architecture mode from anywhere in the tree.
 * Returns { mode, setMode } — mode is 'monolith' | 'pipeline'
 */
export const useArchMode = () => {
  const ctx = useContext(ArchitectureContext)
  if (!ctx) throw new Error('useArchMode must be used inside ArchitectureProvider')
  return ctx
}

export function ArchitectureProvider({ children }) {
  const [mode, setMode] = useState('monolith') // 'monolith' | 'pipeline'
  return (
    <ArchitectureContext.Provider value={{ mode, setMode }}>
      {children}
    </ArchitectureContext.Provider>
  )
}
