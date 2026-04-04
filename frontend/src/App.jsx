import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ArchitectureProvider } from './context/ArchitectureContext.jsx'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'

const LandingPage      = lazy(() => import('./pages/LandingPage.jsx'))
const AnalyzerPage     = lazy(() => import('./pages/AnalyzerPage.jsx'))
const HistoryPage      = lazy(() => import('./pages/HistoryPage.jsx'))
const ArchitecturePage = lazy(() => import('./pages/ArchitecturePage.jsx'))

function PageLoader() {
  return (
    <div className="page-loader">
      <div className="loader-spinner" />
    </div>
  )
}

export default function App() {
  return (
    <ArchitectureProvider>
      <BrowserRouter>
        <Navbar />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"             element={<LandingPage />} />
            <Route path="/analyze"      element={<AnalyzerPage />} />
            <Route path="/history"      element={<HistoryPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
          </Routes>
        </Suspense>
        <Footer />
      </BrowserRouter>
    </ArchitectureProvider>
  )
}
