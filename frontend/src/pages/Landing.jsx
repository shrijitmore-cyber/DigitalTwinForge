import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

/* ─── Kirloskar K-mark ─── */


const FEATURES = [
  { n:'01', icon:'sensors',       title:'Real-Time Data Streaming',    body:'Ultra-low latency telemetry pipeline processing live sensor readings with sub-second update cycles.' },
  { n:'02', icon:'view_in_ar',    title:'3D Compressor Model',         body:'Volumetric rendering of internal component states using real-world pressure and temperature gradients.' },
  { n:'03', icon:'psychology',    title:'ML Predictive Analytics',     body:'Advanced regression models trained on historical failure modes to forecast remaining useful life.' },
  { n:'04', icon:'report_problem',title:'Anomaly Detection',           body:'Continuous monitoring for thermal runaway and pressure deviation using unsupervised learning clusters.' },
  { n:'05', icon:'analytics',     title:'Health Scoring Engine',       body:'Unified asset vitality score calculated from mechanical, electrical, and thermal efficiency KPIs.' },
  { n:'06', icon:'model_training', title:'Simulation & What-If',       body:'Run hypothetical load scenarios to optimise operational parameters without risking physical equipment.' },
]

const STEPS = [
  { n:'01', title:'Sensor Acquisition',  body:'Edge-level hardware abstraction and high-frequency sampling.' },
  { n:'02', title:'Stream Processing',   body:'Real-time filtering, normalisation, and packet validation.' },
  { n:'03', title:'Digital Twin Sync',   body:'Mirroring state data to high-fidelity virtual twin objects.' },
  { n:'04', title:'ML Inference',        body:'Applying deep learning kernels to live sensor data streams.' },
  { n:'05', title:'Dashboard & Alerts',  body:'Human-readable visualisation and automated override actions.' },
]

export default function Landing() {
  const { user } = useAuth()
  const navigate  = useNavigate()

  return (
    <>
      <style>{CSS}</style>
      <div className="l-root">

        {/* ── Top Nav ── */}
        <header className="l-nav">
          <div className="l-nav-left">
            <Link to="/" className="l-brand">
               <img src={logo} alt="INDI4 Logo" style={{ height: '36px', objectFit: 'contain' }} />
            </Link>
            <nav className="l-nav-links">
              <a className="l-navlink l-navlink--active" href="#">OVERVIEW</a>
              <a className="l-navlink" href="#">MONITOR</a>
              <a className="l-navlink" href="#">ANALYTICS</a>
              <a className="l-navlink" href="#">ML ENGINE</a>
              <a className="l-navlink" href="#">DOCS</a>
            </nav>
          </div>
          <div className="l-nav-right">
            <div className="l-status-pill">
              <span className="l-status-dot" />
              <span className="l-status-txt">System Online</span>
            </div>
            {user
              ? <button className="l-nav-btn l-nav-btn--primary" onClick={() => navigate('/map')}>Dashboard →</button>
              : <Link to="/login" className="l-nav-btn l-nav-btn--primary">Sign In →</Link>
            }
          </div>
        </header>

        <main className="l-main">

          {/* ── Hero ── */}
          <section className="l-hero">
            {/* Left */}
            <div className="l-hero-left">
              <div className="l-badge">
                <span className="l-badge-dot" />
                <span className="l-badge-txt">KES 22-8.5 Air Compressor · Digital Twin Platform</span>
              </div>
              <h1 className="l-h1">
                <span className="l-h1-light">Real-Time</span>
                <span className="l-h1-accent">Digital Mirror</span>
                <span className="l-h1-thin">of Your Machine</span>
              </h1>
              <p className="l-sub">
                High-fidelity synchronisation of industrial assets using physics-grounded models.
                Augmented by ML-inference for real-time streaming and mission-critical predictive health diagnostics.
              </p>
              <div className="l-cta-row">
                {user
                  ? <button className="l-btn-primary" onClick={() => navigate('/map')}>Launch Dashboard</button>
                  : <Link to="/login" className="l-btn-primary">Launch Dashboard</Link>
                }
                <button className="l-btn-outline">ML Features</button>
              </div>
              <div className="l-stats">
                <div>
                  <div className="l-stat-val">12ms</div>
                  <div className="l-stat-lbl">Data Latency</div>
                </div>
                <div>
                  <div className="l-stat-val">98.4%</div>
                  <div className="l-stat-lbl">Prediction Accuracy</div>
                </div>
                <div>
                  <div className="l-stat-val">64+</div>
                  <div className="l-stat-lbl">Sensor Channels</div>
                </div>
              </div>
            </div>

            {/* Right – schematic panel */}
            <div className="l-hero-right">
              <div className="l-schematic-header">
                <span className="l-schematic-label">Live Compressor Model — Unit SCR-04</span>
                <span className="l-schematic-status">STATUS: NOMINAL</span>
              </div>

              <div className="l-schematic-wrap">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDNbxFE4CeU9e45OMKh0gj2X5aboQnCnF0KZF74Li1UKzKGFXhlL7UYAh90aps2FFRxLybVWwOO7TfA_AP3VT0AEoDbZSv0jwJUDR7xm5aAgRfIe2uMk2kpJqEoxaBRxR3B8LH_S9m9hAQleGSMAr6158SbKLOvM2mTYjqpHWl75Bf3Z-39hyPqCCuTgllsGziH0F36TKHNl_9t5cQFwVo3Ow_rnTZGZmhvuY-m0-w_K8LzRvqIWe-LYbLGoAmTTrNVHaAXsJF0fic"
                  alt="KES 22-8.5 screw compressor schematic"
                  className="l-schematic-img"
                />
                {/* Sensor overlays */}
                <div className="l-sensor l-sensor--t1">
                  <div className="l-sensor-badge l-sensor-badge--alert">T1</div>
                  <div className="l-sensor-tip">DISCHARGE TEMP: 84.2°C</div>
                </div>
                <div className="l-sensor l-sensor--p2">
                  <div className="l-sensor-badge l-sensor-badge--ok">P2</div>
                </div>
                <div className="l-sensor l-sensor--v3">
                  <div className="l-sensor-badge l-sensor-badge--sec">V3</div>
                </div>
              </div>

              {/* Asset health bar */}
              <div className="l-health">
                <div className="l-health-row">
                  <span className="l-health-lbl">Asset Health Index</span>
                  <span className="l-health-val">92%</span>
                </div>
                <div className="l-health-track">
                  <div className="l-health-fill" style={{ width: '92%' }} />
                </div>
              </div>

              {/* Data cards */}
              <div className="l-data-cards">
                <div className="l-data-card l-data-card--green">
                  <div className="l-dc-lbl">Discharge Temp</div>
                  <div className="l-dc-val">84.2°C</div>
                  <div className="l-dc-delta l-dc-delta--up">+0.4 ▲</div>
                </div>
                <div className="l-data-card l-data-card--sec">
                  <div className="l-dc-lbl">Pressure</div>
                  <div className="l-dc-val">8.0 kg/cm²</div>
                  <div className="l-dc-delta l-dc-delta--stable">STABLE</div>
                </div>
                <div className="l-data-card l-data-card--green">
                  <div className="l-dc-lbl">FAD</div>
                  <div className="l-dc-val">127 CFM</div>
                  <div className="l-dc-delta l-dc-delta--stable">SYNC</div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Feature Grid ── */}
          <section className="l-features">
            <div className="l-section-inner">
              <span className="l-section-eyebrow">Platform Capabilities</span>
              <h2 className="l-section-h2">
                Everything your machine <strong className="l-section-h2-accent">needs you to know</strong>
              </h2>
              <div className="l-feature-grid">
                {FEATURES.map(f => (
                  <div key={f.n} className="l-feature-card">
                    <div className="l-feature-top">
                      <div className="l-feature-icon">
                        <span className="material-symbols-outlined">{f.icon}</span>
                      </div>
                      <span className="l-feature-num">{f.n}</span>
                    </div>
                    <h3 className="l-feature-title">{f.title}</h3>
                    <p className="l-feature-body">{f.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Pipeline ── */}
          <section className="l-pipeline">
            <div className="l-section-inner">
              <span className="l-section-eyebrow l-section-eyebrow--sec">Data Architecture</span>
              <h2 className="l-section-h2">
                From <strong>sensor</strong> to <strong className="l-section-h2-accent">insight</strong>
              </h2>
              <div className="l-steps">
                {STEPS.map((s, i) => (
                  <div key={s.n} className={`l-step ${i % 2 === 1 ? 'l-step--alt' : ''}`}>
                    <div className="l-step-n">STEP {s.n}</div>
                    <h4 className="l-step-title">{s.title}</h4>
                    <p className="l-step-body">{s.body}</p>
                    {i < STEPS.length - 1 && (
                      <span className="l-step-arrow material-symbols-outlined">chevron_right</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

        </main>

        {/* ── Footer ── */}
        <footer className="l-footer">
          <div className="l-footer-left">
            <img src={logo} alt="INDI4 Logo" style={{ height: '24px', objectFit: 'contain' }} />
            <span className="l-footer-copy">© 2025 Indi4 Pneumatic Co. Ltd · Digital Twin Platform</span>
          </div>
          <div className="l-footer-right">
            <span className="l-footer-meta">KES 22-8.5</span>
            <span className="l-footer-meta">v1.0.0</span>
            <span className="l-footer-meta">Build #0001</span>
          </div>
        </footer>

      </div>
    </>
  )
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;800&family=Space+Grotesk:wght@400;500;600;700&family=Intel+One+Mono:wght@400;500&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@400,0&display=swap');

/* ── Reset for landing ── */
.l-root * { box-sizing: border-box; margin: 0; padding: 0; }
.l-root { font-family: 'Heebo', sans-serif; background: #FFFFFF; color: #1A202C; min-height: 100vh; }

/* ── Nav ── */
.l-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  height: 64px; display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px; background: #FFFFFF; border-bottom: 1px solid #E2E8F0;
}
.l-nav-left  { display: flex; align-items: center; gap: 32px; }
.l-nav-right { display: flex; align-items: center; gap: 16px; }

.l-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.l-brand-name { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 800; letter-spacing: 0.05em; color: #2563EB; }

.l-nav-links { display: flex; gap: 24px; align-items: center; }
.l-navlink {
  font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase; text-decoration: none;
  color: #4A5568; transition: color 0.2s;
}
.l-navlink:hover { color: #00A651; }
.l-navlink--active { color: #00A651; border-bottom: 2px solid #00A651; padding-bottom: 2px; }

.l-status-pill {
  display: flex; align-items: center; gap: 8px;
  padding: 4px 12px; background: #F0FBF5; border: 1px solid rgba(0,166,81,0.25);
}
.l-status-dot {
  width: 8px; height: 8px; border-radius: 50%; background: #00A651;
  animation: l-pulse 1.5s ease-in-out infinite;
}
.l-status-txt { font-family: 'Intel One Mono', monospace; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #00A651; letter-spacing: 0.1em; }

.l-nav-btn {
  font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700;
  letter-spacing: 0.14em; text-transform: uppercase; text-decoration: none;
  padding: 8px 18px; cursor: pointer; border: none; transition: all 0.2s;
}
.l-nav-btn--primary { background: #00A651; color: #FFFFFF; }
.l-nav-btn--primary:hover { background: #008C44; }

/* ── Main ── */
.l-main { padding-top: 64px; padding-bottom: 64px; }

/* ── Hero ── */
.l-hero {
  display: grid; grid-template-columns: 1fr 1fr;
  min-height: calc(100vh - 64px); border-bottom: 1px solid #E2E8F0;
}
.l-hero-left {
  display: flex; flex-direction: column; justify-content: center;
  padding: 64px; border-right: 1px solid #E2E8F0; position: relative; z-index: 1;
}
.l-hero-right {
  display: flex; flex-direction: column; padding: 32px; background: #FFFFFF;
  position: relative; overflow: hidden;
}
.l-hero-right::before {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(circle at 50% 40%, rgba(0,166,81,0.04) 0%, transparent 70%);
  pointer-events: none;
}

.l-badge {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 5px 12px; background: #F0FBF5; border: 1px solid rgba(0,166,81,0.2);
  margin-bottom: 32px; width: fit-content;
}
.l-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #00A651; animation: l-ping 1s ease-in-out infinite; }
.l-badge-txt { font-family: 'Intel One Mono', monospace; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: #00A651; }

.l-h1 { display: flex; flex-direction: column; font-size: 64px; line-height: 1.05; margin-bottom: 24px; }
.l-h1-light  { font-weight: 300; color: #4A5568; }
.l-h1-accent {
  font-weight: 800; letter-spacing: -0.02em;
  background: linear-gradient(135deg, #00A651 0%, #34D17A 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.l-h1-thin   { font-weight: 200; color: #718096; }

.l-sub { font-size: 17px; font-weight: 300; line-height: 1.7; color: #4A5568; max-width: 480px; margin-bottom: 48px; }

.l-cta-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 64px; }
.l-btn-primary {
  display: inline-block; text-decoration: none;
  padding: 14px 32px; background: #00A651; color: #FFFFFF;
  font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700;
  letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer;
  border: none; transition: all 0.2s;
}
.l-btn-primary:hover { background: #008C44; }
.l-btn-outline {
  padding: 14px 32px; background: transparent; color: #00A651;
  font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700;
  letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer;
  border: 1px solid #00A651; transition: all 0.2s;
}
.l-btn-outline:hover { background: rgba(0,166,81,0.04); }

.l-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; padding-top: 32px; border-top: 1px solid #E2E8F0; }
.l-stat-val { font-family: 'Intel One Mono', monospace; font-size: 26px; font-weight: 700; color: #1A202C; }
.l-stat-lbl { font-family: 'Intel One Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #718096; margin-top: 4px; }

/* ── Schematic panel ── */
.l-schematic-header {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 16px; border-bottom: 1px solid #E2E8F0;
  margin-bottom: 24px; position: relative; z-index: 1;
}
.l-schematic-label { font-family: 'Intel One Mono', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #4A5568; font-weight: 500; }
.l-schematic-status { font-family: 'Intel One Mono', monospace; font-size: 11px; font-weight: 700; color: #00A651; }

.l-schematic-wrap {
  flex: 1; position: relative; display: flex; align-items: center; justify-content: center;
  min-height: 0;
}
.l-schematic-img { width: 100%; max-width: 480px; height: auto; object-fit: contain; max-height: 340px; filter: drop-shadow(0 8px 24px rgba(0,0,0,0.12)); position: relative; z-index: 1; }

.l-sensor { position: absolute; z-index: 3; }
.l-sensor--t1 { top: 25%; left: 35%; }
.l-sensor--p2 { bottom: 35%; left: 55%; }
.l-sensor--v3 { top: 45%; right: 20%; }

.l-sensor-badge {
  width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;
  font-family: 'Intel One Mono', monospace; font-size: 9px; font-weight: 700; color: #FFFFFF;
  animation: l-pulse 1.5s ease-in-out infinite; cursor: help;
}
.l-sensor-badge--alert { background: #E2725B; }
.l-sensor-badge--ok    { background: #00A651; }
.l-sensor-badge--sec   { background: #4A5568; }

.l-sensor-tip {
  position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
  background: #1A202C; color: #FFFFFF; font-family: 'Intel One Mono', monospace;
  font-size: 8px; padding: 4px 8px; white-space: nowrap;
  opacity: 0; transition: opacity 0.2s; pointer-events: none;
}
.l-sensor:hover .l-sensor-tip { opacity: 1; }

/* ── Health bar ── */
.l-health { margin-top: 24px; position: relative; z-index: 1; }
.l-health-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
.l-health-lbl { font-family: 'Intel One Mono', monospace; font-size: 10px; text-transform: uppercase; color: #718096; font-weight: 500; }
.l-health-val { font-family: 'Intel One Mono', monospace; font-size: 10px; font-weight: 700; color: #00A651; }
.l-health-track { height: 6px; width: 100%; background: #E2E8F0; border: 1px solid rgba(0,0,0,0.06); }
.l-health-fill  { height: 100%; background: #00A651; position: relative; overflow: hidden; }
.l-health-fill::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); animation: l-shimmer 2s infinite; }

/* ── Data cards ── */
.l-data-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 16px; position: relative; z-index: 1; }
.l-data-card { padding: 14px; background: #FFFFFF; border: 1px solid #E2E8F0; border-left-width: 3px; }
.l-data-card--green { border-left-color: #00A651; }
.l-data-card--sec   { border-left-color: #4A5568; }
.l-dc-lbl   { font-family: 'Intel One Mono', monospace; font-size: 9px; text-transform: uppercase; color: #718096; margin-bottom: 4px; }
.l-dc-val   { font-family: 'Intel One Mono', monospace; font-size: 18px; font-weight: 700; color: #1A202C; }
.l-dc-delta { font-family: 'Intel One Mono', monospace; font-size: 9px; font-weight: 700; margin-top: 4px; }
.l-dc-delta--up     { color: #00A651; }
.l-dc-delta--stable { color: #4A5568; }

/* ── Features ── */
.l-features { padding: 96px 24px; background: #FFFFFF; }
.l-section-inner { max-width: 1280px; margin: 0 auto; }
.l-section-eyebrow { font-family: 'Intel One Mono', monospace; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3em; color: #00A651; display: block; margin-bottom: 16px; }
.l-section-eyebrow--sec { color: #4A5568; }
.l-section-h2 { font-size: 44px; font-weight: 300; letter-spacing: -0.02em; margin-bottom: 64px; }
.l-section-h2-accent { font-weight: 700; color: #00A651; }

.l-feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid #E2E8F0; }
.l-feature-card {
  padding: 32px; border: 1px solid #E2E8F0; transition: background 0.2s;
  cursor: default;
}
.l-feature-card:hover { background: #F8FAFB; }

.l-feature-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
.l-feature-icon {
  width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(0,166,81,0.2); background: rgba(0,166,81,0.05); color: #00A651;
}
.l-feature-icon .material-symbols-outlined { font-size: 22px; }
.l-feature-num { font-family: 'Intel One Mono', monospace; font-size: 11px; font-weight: 700; color: rgba(26,32,44,0.2); }
.l-feature-title { font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #1A202C; }
.l-feature-body  { font-size: 13px; font-weight: 300; line-height: 1.6; color: #4A5568; }

/* ── Pipeline ── */
.l-pipeline { padding: 96px 24px; background: #FFFFFF; border-top: 1px solid #E2E8F0; }
.l-steps { display: flex; border: 1px solid #E2E8F0; }
.l-step { flex: 1; padding: 32px; background: #FFFFFF; position: relative; }
.l-step--alt { background: #F8FAFB; border-left: 1px solid #E2E8F0; }
.l-step:not(.l-step--alt) + .l-step--alt { border-left: 1px solid #E2E8F0; }
.l-step--alt + .l-step:not(.l-step--alt) { border-left: 1px solid #E2E8F0; }
.l-step-n { font-family: 'Intel One Mono', monospace; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: #00A651; margin-bottom: 24px; }
.l-step-title { font-size: 16px; font-weight: 700; color: #1A202C; margin-bottom: 10px; }
.l-step-body  { font-size: 11px; font-weight: 300; line-height: 1.6; color: #4A5568; }
.l-step-arrow {
  position: absolute; top: 50%; right: -14px; transform: translateY(-50%);
  z-index: 2; color: #CBD5E0; font-size: 20px;
}

/* ── Footer ── */
.l-footer {
  position: sticky; bottom: 0;
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 24px; background: #FFFFFF; border-top: 1px solid #E2E8F0;
}
.l-footer-left  { display: flex; align-items: center; gap: 12px; }
.l-footer-brand { font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 800; color: #2563EB; }
.l-footer-copy  { font-family: 'Intel One Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #4A5568; }
.l-footer-right { display: flex; gap: 16px; }
.l-footer-meta  { font-family: 'Intel One Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #4A5568; }

/* ── Keyframes ── */
@keyframes l-pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
@keyframes l-ping   { 0%{transform:scale(1);opacity:1} 75%{transform:scale(1.8);opacity:0} 100%{opacity:0} }
@keyframes l-shimmer{ 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
`
