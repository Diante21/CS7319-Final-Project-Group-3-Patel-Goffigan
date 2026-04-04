import { NavLink } from 'react-router-dom'
import { FileText, Clock, Layers, BarChart2 } from 'lucide-react'
import ArchToggle from '../pipeline/ArchToggle.jsx'

export default function Navbar() {
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="container">
        <div className="navbar__inner">
          <NavLink to="/" className="navbar__logo">
            <span className="navbar__logo-mark" aria-hidden="true">
              <FileText size={15} strokeWidth={2} />
            </span>
            ResumeAI
          </NavLink>

          <div className="navbar__nav">
            <NavLink to="/" end className={({ isActive }) => 'navbar__link' + (isActive ? ' active' : '')}>
              <BarChart2 size={14} strokeWidth={1.75} />
              Home
            </NavLink>
            <NavLink to="/analyze" className={({ isActive }) => 'navbar__link' + (isActive ? ' active' : '')}>
              <FileText size={14} strokeWidth={1.75} />
              Analyzer
            </NavLink>
            <NavLink to="/history" className={({ isActive }) => 'navbar__link' + (isActive ? ' active' : '')}>
              <Clock size={14} strokeWidth={1.75} />
              History
            </NavLink>
            <NavLink to="/architecture" className={({ isActive }) => 'navbar__link' + (isActive ? ' active' : '')}>
              <Layers size={14} strokeWidth={1.75} />
              Architecture
            </NavLink>
          </div>

          <div className="navbar__right">
            <ArchToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}
