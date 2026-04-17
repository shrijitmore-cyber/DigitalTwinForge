import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'



export default function Login() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [form,    setForm]    = useState({ username: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/map', { replace: true })
    } catch (err) {
      setError(err?.response?.data?.detail || 'Login failed. Check credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="lg-root">

        {/* Left panel — branding */}
        <div className="lg-left">
          <div className="lg-left-aura" />
          <Link to="/" className="lg-logo">

            <div>
              <img src={logo} alt="INDI4 Logo" style={{ height: '40px', objectFit: 'contain' }} />
              <span className="lg-logo-sub">KES 22-8.5 · Digital Twin Platform</span>
            </div>
          </Link>

          <div className="lg-left-body">
            <div className="lg-badge">
              <span className="lg-badge-dot" />
              <span className="lg-badge-txt">System Online</span>
            </div>
            <h2 className="lg-tagline">
              Your machine's<br/>
              <span className="lg-tagline-accent">digital intelligence</span>
            </h2>
            <p className="lg-tagline-sub">
              Real-time monitoring, predictive analytics, and health diagnostics for industrial air compressors.
            </p>
          </div>

          <div className="lg-left-stats">
            <div className="lg-stat"><span className="lg-stat-v">721</span><span className="lg-stat-l">Test Records</span></div>
            <div className="lg-stat"><span className="lg-stat-v">6</span><span className="lg-stat-l">KPI Charts</span></div>
            <div className="lg-stat"><span className="lg-stat-v">64+</span><span className="lg-stat-l">Sensors</span></div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="lg-right">
          <div className="lg-form-wrap">
            <div className="lg-form-header">
              <h1 className="lg-form-title">Sign in</h1>
              <p className="lg-form-sub">Access your digital twin dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="lg-form">
              <div className="lg-field">
                <label className="lg-label">Username</label>
                <input
                  type="text"
                  autoComplete="username"
                  required
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  className="lg-input"
                  placeholder="admin"
                />
              </div>

              <div className="lg-field">
                <label className="lg-label">Password</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="lg-input"
                  placeholder="••••••••"
                />
              </div>

              {error && <div className="lg-error">{error}</div>}

              <button type="submit" disabled={loading} className="lg-btn">
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>
            </form>

            <div className="lg-hint">
              Default — <span className="lg-hint-mono">admin</span> / <span className="lg-hint-mono">admin123</span>
            </div>

            <Link to="/" className="lg-back">← Back to Home</Link>
          </div>
        </div>

      </div>
    </>
  )
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;800&family=Space+Grotesk:wght@400;500;600;700&family=Intel+One+Mono:wght@400;500&display=swap');

.lg-root * { box-sizing: border-box; margin: 0; padding: 0; }
.lg-root {
  font-family: 'Heebo', sans-serif;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #FFFFFF;
  color: #1A202C;
}

/* ── Left ── */
.lg-left {
  background: #FFFFFF;
  border-right: 1px solid #E2E8F0;
  display: flex; flex-direction: column;
  padding: 48px;
  position: relative; overflow: hidden;
}
.lg-left-aura {
  position: absolute; inset: 0;
  background: radial-gradient(circle at 30% 50%, rgba(0,166,81,0.05) 0%, transparent 65%);
  pointer-events: none;
}

.lg-logo {
  display: flex; align-items: center; gap: 14px;
  text-decoration: none; position: relative; z-index: 1;
}
.lg-logo-name {
  display: block; font-family: 'Space Grotesk', sans-serif;
  font-size: 20px; font-weight: 800; letter-spacing: 0.05em; color: #2563EB;
}
.lg-logo-sub {
  display: block; font-family: 'Intel One Mono', monospace;
  font-size: 10px; color: #718096; letter-spacing: 0.12em; margin-top: 2px;
}

.lg-left-body {
  flex: 1; display: flex; flex-direction: column; justify-content: center;
  position: relative; z-index: 1;
}

.lg-badge {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 4px 12px; background: #F0FBF5; border: 1px solid rgba(0,166,81,0.25);
  width: fit-content; margin-bottom: 32px;
}
.lg-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: #00A651; animation: lgpulse 1.5s ease-in-out infinite; }
.lg-badge-txt { font-family: 'Intel One Mono', monospace; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #00A651; }

.lg-tagline { font-size: 42px; font-weight: 300; line-height: 1.15; margin-bottom: 20px; color: #1A202C; }
.lg-tagline-accent {
  font-weight: 700;
  background: linear-gradient(135deg, #00A651 0%, #34D17A 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.lg-tagline-sub { font-size: 15px; font-weight: 300; line-height: 1.7; color: #4A5568; max-width: 340px; }

.lg-left-stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
  padding-top: 32px; border-top: 1px solid #E2E8F0;
  position: relative; z-index: 1;
}
.lg-stat { display: flex; flex-direction: column; gap: 4px; }
.lg-stat-v { font-family: 'Intel One Mono', monospace; font-size: 22px; font-weight: 700; color: #1A202C; }
.lg-stat-l { font-family: 'Intel One Mono', monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #718096; }

/* ── Right ── */
.lg-right {
  display: flex; align-items: center; justify-content: center;
  padding: 48px;
}
.lg-form-wrap { width: 100%; max-width: 380px; }

.lg-form-header { margin-bottom: 36px; }
.lg-form-title { font-size: 28px; font-weight: 700; color: #1A202C; margin-bottom: 6px; }
.lg-form-sub   { font-size: 14px; font-weight: 300; color: #4A5568; }

.lg-form { display: flex; flex-direction: column; gap: 20px; }
.lg-field { display: flex; flex-direction: column; gap: 8px; }
.lg-label {
  font-family: 'Intel One Mono', monospace;
  font-size: 9px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
  color: #4A5568;
}
.lg-input {
  width: 100%;
  background: #FFFFFF; border: 1px solid #CBD5E0;
  padding: 12px 14px; color: #1A202C;
  font-family: 'Intel One Mono', monospace; font-size: 13px;
  outline: none; transition: border-color 0.2s, box-shadow 0.2s;
}
.lg-input::placeholder { color: #A0AEC0; }
.lg-input:focus {
  border-color: #00A651;
  box-shadow: 0 0 0 3px rgba(0,166,81,0.1);
}

.lg-error {
  padding: 10px 14px; border: 1px solid rgba(226,114,91,0.4);
  background: rgba(226,114,91,0.07); color: #C53030;
  font-size: 12px; font-family: 'Intel One Mono', monospace;
}

.lg-btn {
  margin-top: 4px; width: 100%; padding: 14px;
  border: none; background: #00A651; color: #FFFFFF;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
  cursor: pointer; transition: all 0.2s;
}
.lg-btn:hover:not(:disabled) { background: #008C44; }
.lg-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.lg-hint {
  margin-top: 20px; padding: 10px 14px;
  border: 1px solid #E2E8F0; background: #F8FAFB;
  text-align: center; font-size: 12px; color: #4A5568;
}
.lg-hint-mono { font-family: 'Intel One Mono', monospace; color: #1A202C; font-weight: 500; }

.lg-back {
  display: block; margin-top: 24px; text-align: center;
  font-family: 'Intel One Mono', monospace; font-size: 10px;
  letter-spacing: 0.15em; text-transform: uppercase;
  color: #A0AEC0; text-decoration: none; transition: color 0.2s;
}
.lg-back:hover { color: #00A651; }

@keyframes lgpulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
`
