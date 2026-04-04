import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__inner">
          <span className="footer__brand">ResumeAI</span>
          <nav className="footer__links" aria-label="Footer navigation">
            <Link to="/"             className="footer__link">Home</Link>
            <Link to="/analyze"      className="footer__link">Analyzer</Link>
            <Link to="/history"      className="footer__link">History</Link>
            <Link to="/architecture" className="footer__link">Architecture</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
