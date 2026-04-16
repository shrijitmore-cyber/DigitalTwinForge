// Isometric digital twin schematic — Indi4 KES 22-8.5
// Dynamic elements driven by the `frame` prop from Socket.IO.

const f1 = v => (v == null || isNaN(v)) ? '--.-' : Number(v).toFixed(1)
const f2 = v => (v == null || isNaN(v)) ? '-.-'  : Number(v).toFixed(2)
const f0 = v => (v == null || isNaN(v)) ? '---'  : Math.round(Number(v)).toString()

const MONO = "'IBM Plex Mono', monospace"
const SANS = "'IBM Plex Sans', sans-serif"

export default function SchematicSVG({ frame }) {
  const row = frame?.row ?? {}
  const d   = frame?.display ?? {}

  const at   = row.airend_discharge_temp_c
  const ait  = row.air_inlet_temp_c
  const aos  = row.aos_tank_inlet_pressure_kg_cm2g
  const oci  = row.oil_cooler_inlet_temp_c
  const oco  = row.oil_cooler_outlet_temp_c
  const aci  = row.aftercooler_inlet_temp_c
  const aco  = row.aftercooler_outlet_temp_c
  const fad  = row.fad_cfm
  const pres = row.delivery_pressure_kg_cm2g
  const mpw  = row.motor_output_power_kw
  const ppw  = row.package_input_power_kw
  const volt = row.input_voltage_v
  const curr = row.current_package_input_a
  const pf   = row.power_factor

  // Airend heat fill
  const ratio    = d.airend_fill_ratio ?? 0
  const faceH    = 80
  const fillH    = ratio * faceH
  const tlY      = 248 - fillH
  const trY      = 282 - fillH
  const fillPts  = `358,${tlY} 424,${trY} 424,282 358,248`

  const fanCls  = { RUNNING: 'fan-running', WARMING: 'fan-warming', STANDBY: 'fan-stopped' }[d.fan_status ?? 'STANDBY']
  const fanTxt  = d.fan_status ?? 'STANDBY'
  const fanFill = { RUNNING: '#00A651', WARMING: '#f6a820', STANDBY: 'rgba(255,255,255,0.2)' }[d.fan_status ?? 'STANDBY']

  return (
    <svg
      viewBox="60 10 820 460"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', maxHeight: '100%', display: 'block', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.7))' }}
    >
      <defs>
        {/* Cabinet */}
        <linearGradient id="g-cab-top" x1="0" y1="0" x2=".3" y2="1">
          <stop offset="0%"   stopColor="#2a3444"/><stop offset="100%" stopColor="#141c28"/>
        </linearGradient>
        <linearGradient id="g-cab-l" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#080e16"/><stop offset="100%" stopColor="#0e1620"/>
        </linearGradient>
        <linearGradient id="g-cab-r" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#1a2838"/><stop offset="100%" stopColor="#121e2e"/>
        </linearGradient>
        {/* Motor */}
        <linearGradient id="g-mot-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#2a3848"/><stop offset="100%" stopColor="#101c28"/>
        </linearGradient>
        <linearGradient id="g-mot-l" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#060c14"/><stop offset="100%" stopColor="#0c1620"/>
        </linearGradient>
        <linearGradient id="g-mot-r" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#162030"/><stop offset="100%" stopColor="#0e1824"/>
        </linearGradient>
        {/* Airend */}
        <linearGradient id="g-air-top" x1="0" y1="0" x2=".2" y2="1">
          <stop offset="0%"   stopColor="#1a4030"/><stop offset="100%" stopColor="#081a14"/>
        </linearGradient>
        <linearGradient id="g-air-l" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#040e0a"/><stop offset="100%" stopColor="#0a1e18"/>
        </linearGradient>
        <linearGradient id="g-air-r" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#143828"/><stop offset="100%" stopColor="#0e2820"/>
        </linearGradient>
        {/* AOS Tank */}
        <linearGradient id="g-aos-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1e2c2c"/><stop offset="100%" stopColor="#0e1818"/>
        </linearGradient>
        <linearGradient id="g-aos-l" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#070e0e"/><stop offset="100%" stopColor="#0f1818"/>
        </linearGradient>
        <linearGradient id="g-aos-r" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#162424"/><stop offset="100%" stopColor="#0e1c1c"/>
        </linearGradient>
        {/* Oil Cooler */}
        <linearGradient id="g-oc-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#3a2808"/><stop offset="100%" stopColor="#1a1008"/>
        </linearGradient>
        <linearGradient id="g-oc-l" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#0a0804"/><stop offset="100%" stopColor="#181008"/>
        </linearGradient>
        <linearGradient id="g-oc-r" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#281c08"/><stop offset="100%" stopColor="#1c1408"/>
        </linearGradient>
        {/* After Cooler */}
        <linearGradient id="g-ac-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1c2e3c"/><stop offset="100%" stopColor="#08121c"/>
        </linearGradient>
        <linearGradient id="g-ac-l" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#040810"/><stop offset="100%" stopColor="#0a1220"/>
        </linearGradient>
        <linearGradient id="g-ac-r" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#142030"/><stop offset="100%" stopColor="#0c1828"/>
        </linearGradient>
        {/* Suction Filter */}
        <linearGradient id="g-flt-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#182e20"/><stop offset="100%" stopColor="#081410"/>
        </linearGradient>
        <linearGradient id="g-flt-l" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#030a07"/><stop offset="100%" stopColor="#091612"/>
        </linearGradient>
        {/* Skid */}
        <linearGradient id="g-skid-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#141c18"/><stop offset="100%" stopColor="#080e0a"/>
        </linearGradient>
        {/* Heat glow */}
        <linearGradient id="g-heat" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%"   stopColor="#ff5522" stopOpacity=".85"/>
          <stop offset="60%"  stopColor="#ff8833" stopOpacity=".4"/>
          <stop offset="100%" stopColor="#ffaa44" stopOpacity="0"/>
        </linearGradient>
        {/* Specular highlight */}
        <linearGradient id="g-spec" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity=".1"/>
          <stop offset="40%"  stopColor="#ffffff" stopOpacity=".02"/>
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
        </linearGradient>

        <filter id="fshadow" x="-30%" y="-30%" width="180%" height="180%">
          <feDropShadow dx="12" dy="22" stdDeviation="10" floodColor="#000" floodOpacity=".75"/>
        </filter>
        <filter id="fshadow-sm" x="-20%" y="-20%" width="150%" height="160%">
          <feDropShadow dx="5" dy="10" stdDeviation="6" floodColor="#000" floodOpacity=".65"/>
        </filter>
        <filter id="fglow-green">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>

        <marker id="m-air"  markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#00C896"/></marker>
        <marker id="m-hot"  markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#ff6b35"/></marker>
        <marker id="m-oil"  markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#f6a820"/></marker>
        <marker id="m-cool" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#34D17A"/></marker>

        <clipPath id="clip-ae"><polygon points="358,168 434,128 434,268 358,242"/></clipPath>
      </defs>

      {/* Background diamond grid */}
      <polygon points="120,380 440,200 760,380 440,560" fill="rgba(0,166,81,0.8)" opacity="0.03"/>
      <g opacity="0.07" stroke="rgba(0,166,81,0.9)" strokeWidth="1">
        <polygon points="120,380 440,200 760,380 440,560" fill="none" strokeWidth="1.5"/>
        <line x1="280" y1="290" x2="600" y2="470" strokeWidth="0.6"/>
        <line x1="600" y1="290" x2="280" y2="470" strokeWidth="0.6"/>
        <line x1="200" y1="335" x2="520" y2="515" strokeWidth="0.4"/>
        <line x1="680" y1="335" x2="360" y2="515" strokeWidth="0.4"/>
        <line x1="520" y1="245" x2="200" y2="425" strokeWidth="0.4"/>
        <line x1="360" y1="245" x2="680" y2="425" strokeWidth="0.4"/>
      </g>

      <g transform="translate(0,15)">

        {/* ── Skid ── */}
        <g filter="url(#fshadow)">
          <polygon points="178,372 510,190 698,302 366,484" fill="url(#g-skid-top)" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2"/>
          <polygon points="178,372 510,190 698,302 366,484" fill="url(#g-spec)"/>
          <polygon points="178,372 366,484 366,500 178,388" fill="#080e0a" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
          <polygon points="510,190 698,302 698,318 510,206" fill="#0c140e" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
        </g>
        <text x="436" y="450" fontFamily={MONO} fontSize="8" fill="rgba(255,255,255,0.12)" textAnchor="middle" letterSpacing="3">BASE FRAME / SKID · KES 22-8.5</text>

        {/* ── Cabinet / Enclosure ── */}
        <g filter="url(#fshadow)">
          <polygon points="196,188 506,18 686,118 376,288" fill="url(#g-cab-top)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
          <polygon points="196,188 506,18 686,118 376,288" fill="url(#g-spec)"/>
          <polygon points="196,188 376,288 376,370 196,270" fill="url(#g-cab-l)" stroke="rgba(255,255,255,0.07)" strokeWidth="1.2"/>
          <polygon points="376,288 686,118 686,200 376,370" fill="url(#g-cab-r)" stroke="rgba(255,255,255,0.07)" strokeWidth="1.2"/>
        </g>
        <line x1="196" y1="188" x2="506" y2="18"  stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
        <line x1="506" y1="18"  x2="686" y2="118" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5"/>
        <line x1="196" y1="188" x2="196" y2="270" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5"/>
        <line x1="686" y1="118" x2="686" y2="200" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5"/>

        {/* ── Motor ── */}
        <g filter="url(#fshadow-sm)">
          <ellipse cx="292" cy="204" rx="48" ry="22" fill="url(#g-mot-top)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.8"/>
          <ellipse cx="292" cy="204" rx="48" ry="22" fill="url(#g-spec)"/>
          <polygon points="246,204 246,278 292,284 292,224" fill="url(#g-mot-l)" stroke="rgba(255,255,255,0.07)" strokeWidth="1.3"/>
          <polygon points="292,224 292,284 340,278 340,204" fill="url(#g-mot-r)" stroke="rgba(255,255,255,0.1)"  strokeWidth="1.5"/>
          {/* Winding rings */}
          <ellipse cx="292" cy="228" rx="47" ry="21" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2"/>
          <ellipse cx="292" cy="243" rx="47" ry="21" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
          <ellipse cx="292" cy="258" rx="47" ry="21" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2"/>
        </g>
        {/* Coupling block */}
        <rect x="337" y="234" width="20" height="9" rx="3" fill="#141e28" stroke="rgba(0,166,81,0.4)" strokeWidth="1" opacity=".8"/>

        {/* ── Airend (Screw Element) ── */}
        <g filter="url(#fshadow-sm)">
          <polygon points="358,168 434,128 500,162 424,202" fill="url(#g-air-top)" stroke="#00A651"          strokeWidth="2"/>
          <polygon points="358,168 434,128 500,162 424,202" fill="url(#g-spec)"/>
          <polygon points="358,168 424,202 424,282 358,248" fill="url(#g-air-l)" stroke="#006633"           strokeWidth="1.5"/>
          <polygon points={fillPts}                          fill="url(#g-heat)"  clipPath="url(#clip-ae)"  opacity=".9"/>
          <polygon points="424,202 500,162 500,244 424,282" fill="url(#g-air-r)" stroke="#00A651"          strokeWidth="1.5"/>
          {/* Compression wave lines */}
          <path d="M366,212 Q372,207 378,212 Q384,217 390,212 Q396,207 402,212 Q408,217 414,212 Q420,207 424,210" fill="none" stroke="rgba(0,166,81,0.55)" strokeWidth="1.5"/>
          <path d="M366,222 Q372,217 378,222 Q384,227 390,222 Q396,217 402,222 Q408,227 414,222 Q420,217 424,220" fill="none" stroke="rgba(0,166,81,0.55)" strokeWidth="1.5"/>
          <path d="M366,232 Q372,227 378,232 Q384,237 390,232 Q396,227 402,232 Q408,237 414,232 Q420,227 424,230" fill="none" stroke="rgba(0,166,81,0.35)" strokeWidth="1.2"/>
          <path d="M366,242 Q372,237 378,242 Q384,247 390,242 Q396,237 402,242 Q408,247 414,242 Q420,237 424,240" fill="none" stroke="rgba(0,166,81,0.25)" strokeWidth="1.2"/>
          <polygon points="358,168 434,128 500,162 424,202" fill="none" stroke="rgba(52,209,122,0.25)" strokeWidth=".8"/>
        </g>

        {/* ── AOS Tank (Air-Oil Separator) ── */}
        <g filter="url(#fshadow-sm)">
          <ellipse cx="548" cy="172" rx="42" ry="20" fill="url(#g-aos-top)" stroke="rgba(0,166,81,0.55)" strokeWidth="2"/>
          <ellipse cx="548" cy="172" rx="42" ry="20" fill="url(#g-spec)"/>
          <polygon points="508,172 508,300 548,312 548,184" fill="url(#g-aos-l)" stroke="rgba(0,166,81,0.18)" strokeWidth="1.2"/>
          <polygon points="548,184 548,312 590,300 590,172" fill="url(#g-aos-r)" stroke="rgba(0,166,81,0.25)" strokeWidth="1.4"/>
          <ellipse cx="548" cy="172" rx="42" ry="20" fill="none" stroke="rgba(0,166,81,0.25)" strokeWidth="1"/>
        </g>

        {/* ── Oil Cooler ── */}
        <g filter="url(#fshadow-sm)">
          <polygon points="596,148 660,112 702,134 638,170" fill="url(#g-oc-top)" stroke="rgba(246,168,32,0.55)" strokeWidth="2"/>
          <polygon points="596,148 660,112 702,134 638,170" fill="url(#g-spec)"/>
          <polygon points="596,148 638,170 638,256 596,234" fill="url(#g-oc-l)" stroke="rgba(246,168,32,0.12)" strokeWidth="1.2"/>
          {[602,608,614,620,626,632].map((x,i) => (
            <line key={x} x1={x} y1={158-i} x2={x} y2={244-i} stroke="rgba(246,168,32,0.3)" strokeWidth="1.4"/>
          ))}
          <polygon points="638,170 702,134 702,220 638,256" fill="url(#g-oc-r)" stroke="rgba(246,168,32,0.18)" strokeWidth="1.4"/>
          <polygon points="596,148 660,112 702,134 638,170" fill="none" stroke="rgba(246,168,32,0.3)" strokeWidth=".8"/>
        </g>

        {/* ── After Cooler ── */}
        <g filter="url(#fshadow-sm)">
          <polygon points="596,234 660,198 702,220 638,256" fill="url(#g-ac-top)" stroke="rgba(52,209,122,0.5)"  strokeWidth="2"/>
          <polygon points="596,234 660,198 702,220 638,256" fill="url(#g-spec)"/>
          <polygon points="596,234 638,256 638,344 596,322" fill="url(#g-ac-l)" stroke="rgba(52,209,122,0.12)" strokeWidth="1.2"/>
          {[602,608,614,620,626,632].map((x,i) => (
            <line key={x} x1={x} y1={244-i} x2={x} y2={332-i} stroke="rgba(52,209,122,0.25)" strokeWidth="1.4"/>
          ))}
          <polygon points="638,256 702,220 702,308 638,344" fill="url(#g-ac-r)" stroke="rgba(52,209,122,0.18)" strokeWidth="1.4"/>
          <polygon points="596,234 660,198 702,220 638,256" fill="none" stroke="rgba(52,209,122,0.25)" strokeWidth=".8"/>
        </g>

        {/* ── Suction Filter ── */}
        <g filter="url(#fshadow-sm)">
          <polygon points="218,276 268,250 298,265 248,291" fill="url(#g-flt-top)" stroke="rgba(0,166,81,0.4)"  strokeWidth="1.8"/>
          <polygon points="218,276 268,250 298,265 248,291" fill="url(#g-spec)"/>
          <polygon points="218,276 248,291 248,338 218,323" fill="url(#g-flt-l)" stroke="rgba(0,166,81,0.1)"  strokeWidth="1.2"/>
          {[224,230,236].map(x => <line key={x} x1={x} y1="284" x2={x} y2="331" stroke="rgba(0,166,81,0.2)" strokeWidth="1.3"/>)}
          <polygon points="248,291 298,265 298,312 248,338" fill="#0a1610"         stroke="rgba(0,166,81,0.18)" strokeWidth="1.4"/>
          <polygon points="218,276 268,250 298,265 248,291" fill="none"             stroke="rgba(0,166,81,0.3)"  strokeWidth=".8"/>
        </g>

        {/* ── Control Panel ── */}
        <g filter="url(#fshadow-sm)">
          <polygon points="540,44 626,84 626,178 540,138"   fill="#0e1828"  stroke="rgba(255,255,255,0.14)" strokeWidth="1.8"/>
          <polygon points="550,58 592,77 592,112 550,93"    fill="#060e1a"  stroke="rgba(0,166,81,0.4)"     strokeWidth="1.3"/>
          <polygon points="550,58 592,77 592,112 550,93"    fill="#001428"  opacity=".45"/>
          <circle cx="616" cy="98" r="9" fill="#3a0808"     stroke="#dd3344" strokeWidth="2"/>
          <circle cx="616" cy="98" r="5" fill="#8a0010"     stroke="#ff5566" strokeWidth="1"/>
          <polygon points="540,138 626,178 626,186 540,146" fill="#0c1420"  stroke="rgba(255,255,255,0.05)" strokeWidth=".8"/>
        </g>

        {/* ── Cooling Fan ── */}
        <ellipse cx="418" cy="110" rx="50" ry="24" fill="#080f0e" stroke="rgba(0,166,81,0.6)"  strokeWidth="2"/>
        <ellipse cx="418" cy="110" rx="42" ry="18" fill="#0b1a18" stroke="rgba(0,166,81,0.18)" strokeWidth="1.2"/>
        <line x1="376" y1="110" x2="460" y2="110" stroke="rgba(0,166,81,0.15)" strokeWidth="1"/>
        <line x1="381" y1="100" x2="455" y2="120" stroke="rgba(0,166,81,0.12)" strokeWidth="1"/>
        <line x1="381" y1="120" x2="455" y2="100" stroke="rgba(0,166,81,0.12)" strokeWidth="1"/>
        <g className={fanCls}>
          <ellipse cx="418" cy="110" rx="5" ry="17" fill="#00A651" opacity=".9"/>
          <ellipse cx="418" cy="110" rx="5" ry="17" fill="#00A651" opacity=".9" transform="rotate(72,418,110)"/>
          <ellipse cx="418" cy="110" rx="5" ry="17" fill="#00A651" opacity=".9" transform="rotate(144,418,110)"/>
          <ellipse cx="418" cy="110" rx="5" ry="17" fill="#00A651" opacity=".9" transform="rotate(216,418,110)"/>
          <ellipse cx="418" cy="110" rx="5" ry="17" fill="#00A651" opacity=".9" transform="rotate(288,418,110)"/>
        </g>
        <circle cx="418" cy="110" r="4" fill="#00A651"/>
        <ellipse cx="418" cy="110" rx="50" ry="24" fill="none" stroke="rgba(52,209,122,0.35)" strokeWidth="1.5"/>

        {/* ── Delivery fitting ── */}
        <rect x="700" y="192" width="42" height="16" rx="4" fill="#0f1a24" stroke="rgba(0,166,81,0.5)" strokeWidth="2"/>
        <circle cx="742" cy="200" r="7" fill="none" stroke="rgba(0,166,81,0.5)" strokeWidth="1.5"/>
        <line x1="742" y1="193" x2="742" y2="207" stroke="rgba(0,166,81,0.5)" strokeWidth="1.2"/>
        <line x1="735" y1="200" x2="749" y2="200" stroke="rgba(0,166,81,0.5)" strokeWidth="1.2"/>

        {/* ── Atmosphere inlet ── */}
        <circle cx="138" cy="310" r="28" fill="#080d14" stroke="rgba(0,166,81,0.2)"     strokeWidth="2"/>
        <circle cx="138" cy="310" r="22" fill="none"    stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 2"/>

        {/* ────────────────── Animated flow pipes ────────────────── */}
        {/* Inlet air: atmosphere → filter → airend */}
        <path className="pipe-air" d="M166,310 Q192,296 218,284" fill="none" stroke="#00C896" strokeWidth="5"   strokeLinecap="round" strokeDasharray="9 6" markerEnd="url(#m-air)"/>
        <path                      d="M166,310 Q192,296 218,284" fill="none" stroke="rgba(0,200,150,0.35)" strokeWidth="1.5" strokeLinecap="round"/>
        <path className="pipe-air" d="M298,278 Q328,262 358,236" fill="none" stroke="#00C896" strokeWidth="5"   strokeLinecap="round" strokeDasharray="9 6" markerEnd="url(#m-air)"/>
        <path                      d="M298,278 Q328,262 358,236" fill="none" stroke="rgba(0,200,150,0.35)" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Hot mix: airend → AOS */}
        <path className="pipe-hot" d="M500,200 L500,190 L510,184" fill="none" stroke="#ff6b35" strokeWidth="5.5" strokeLinecap="round" strokeDasharray="9 6" markerEnd="url(#m-hot)"/>
        <path                      d="M500,200 L500,190 L510,184" fill="none" stroke="rgba(255,107,53,0.4)"  strokeWidth="1.5" strokeLinecap="round"/>
        {/* Hot air: AOS → oil cooler */}
        <path className="pipe-hot" d="M588,186 L596,182 L596,162" fill="none" stroke="#ff8844" strokeWidth="4"   strokeLinecap="round" strokeDasharray="8 5" markerEnd="url(#m-hot)"/>
        <path                      d="M588,186 L596,182 L596,162" fill="none" stroke="rgba(255,136,68,0.35)" strokeWidth="1.2" strokeLinecap="round"/>
        {/* Hot air: AOS → after cooler */}
        <path className="pipe-hot" d="M588,226 L596,222 L596,248" fill="none" stroke="#ff8844" strokeWidth="4"   strokeLinecap="round" strokeDasharray="8 5" markerEnd="url(#m-hot)"/>
        <path                      d="M588,226 L596,222 L596,248" fill="none" stroke="rgba(255,136,68,0.35)" strokeWidth="1.2" strokeLinecap="round"/>
        {/* Cool air out: after cooler → delivery */}
        <path className="pipe-cool" d="M702,262 L702,208" fill="none" stroke="#34D17A" strokeWidth="5.5" strokeLinecap="round" strokeDasharray="9 6" markerEnd="url(#m-cool)"/>
        <path                       d="M702,262 L702,208" fill="none" stroke="rgba(52,209,122,0.35)" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Hot oil: AOS → oil cooler */}
        <path className="pipe-oil" d="M548,312 L548,330 L590,330 L596,256" fill="none" stroke="#f6a820" strokeWidth="5"   strokeLinecap="round" strokeLinejoin="round" strokeDasharray="9 6" markerEnd="url(#m-oil)"/>
        <path                      d="M548,312 L548,330 L590,330 L596,256" fill="none" stroke="rgba(246,168,32,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Oil return: oil cooler → airend */}
        <path className="pipe-cool-rev" d="M596,195 Q566,184 500,196" fill="none" stroke="#34D17A" strokeWidth="4"   strokeLinecap="round" strokeDasharray="9 6" markerEnd="url(#m-cool)"/>
        <path                           d="M596,195 Q566,184 500,196" fill="none" stroke="rgba(52,209,122,0.35)" strokeWidth="1.2" strokeLinecap="round"/>
        {/* Fan discharge downward */}
        <line x1="418" y1="135" x2="418" y2="148" stroke="#00A651" strokeWidth="2.5" strokeDasharray="5 3" markerEnd="url(#m-cool)"/>

        {/* ────────────────── Component labels ────────────────── */}
        <text x="292" y="192" fontFamily={SANS} fontSize="11" fill="#FFFFFF"               textAnchor="middle" fontWeight="600" letterSpacing="1.5">MOTOR</text>
        <text x="292" y="203" fontFamily={MONO} fontSize="8"  fill="rgba(255,255,255,0.4)" textAnchor="middle">22 kW · 2930 RPM</text>

        <text x="434" y="117" fontFamily={SANS} fontSize="12" fill="#00A651"               textAnchor="middle" fontWeight="700" letterSpacing="2">AIREND</text>
        <text x="434" y="128" fontFamily={MONO} fontSize="8"  fill="rgba(0,166,81,0.55)"   textAnchor="middle">Screw Element</text>

        <text x="548" y="161" fontFamily={SANS} fontSize="10" fill="#FFFFFF"               textAnchor="middle" fontWeight="600" letterSpacing="1">AOS TANK</text>
        <text x="548" y="171" fontFamily={MONO} fontSize="7.5" fill="rgba(255,255,255,0.4)" textAnchor="middle">Air-Oil Separator</text>

        <text x="649" y="101" fontFamily={SANS} fontSize="10" fill="rgba(246,168,32,0.9)"  textAnchor="middle" fontWeight="600" letterSpacing="1">OIL COOLER</text>
        <text x="649" y="187" fontFamily={SANS} fontSize="10" fill="rgba(52,209,122,0.9)"  textAnchor="middle" fontWeight="600" letterSpacing="1">AFTER COOLER</text>

        <text x="252" y="242" fontFamily={SANS} fontSize="9"  fill="rgba(255,255,255,0.55)" textAnchor="middle" fontWeight="600" letterSpacing="1">SUCTION FILTER</text>
        <text x="580" y="37"  fontFamily={MONO} fontSize="8"  fill="rgba(255,255,255,0.4)"  textAnchor="middle" letterSpacing="1.5">CONTROL PANEL</text>

        {/* Flow direction hints */}
        <text x="192" y="295" fontFamily={MONO} fontSize="8"  fill="rgba(0,200,150,0.65)"  textAnchor="middle" letterSpacing="1">INLET AIR</text>
        <text x="524" y="185" fontFamily={MONO} fontSize="8"  fill="rgba(255,107,53,0.75)" textAnchor="middle" letterSpacing="1">HOT MIX</text>
        <text x="714" y="236" fontFamily={MONO} fontSize="8"  fill="rgba(52,209,122,0.65)" letterSpacing="1">COOL AIR</text>
        <text x="560" y="340" fontFamily={MONO} fontSize="8"  fill="rgba(246,168,32,0.65)" textAnchor="middle" letterSpacing="1">HOT OIL</text>
        <text x="548" y="178" fontFamily={MONO} fontSize="7.5" fill="rgba(52,209,122,0.55)" textAnchor="middle" letterSpacing="1">OIL RETURN</text>

        {/* Fan label */}
        <text x="418" y="87"  fontFamily={MONO} fontSize="8"  fill="rgba(0,166,81,0.75)" textAnchor="middle" fontWeight="600" letterSpacing="1.5">COOLING FAN · 1.1kW · 2870RPM</text>
        <rect x="392" y="132" width="52" height="13" rx="2" fill="#061410" stroke="rgba(0,166,81,0.35)" strokeWidth="1"/>
        <text x="418" y="139" fontFamily={MONO} fontSize="8" fill={fanFill} textAnchor="middle" dominantBaseline="central" letterSpacing="1.5">{fanTxt}</text>

        {/* ────────────────── Data label cards ────────────────── */}

        {/* Discharge temp */}
        <line x1="500" y1="222" x2="525" y2="215" stroke="rgba(0,166,81,0.45)" strokeWidth="1"/>
        <circle cx="500" cy="222" r="3" fill="#00A651"/>
        <rect x="526" y="197" width="110" height="36" rx="3" fill="#0f0f0f" stroke="rgba(0,166,81,0.5)" strokeWidth="1.5" filter="url(#fglow-green)"/>
        <text x="538" y="209" fontFamily={MONO} fontSize="8"  fill="rgba(0,166,81,0.8)"   letterSpacing="1.5">DISCHARGE TEMP</text>
        <text x="538" y="226" fontFamily={MONO} fontSize="14" fill="#FFFFFF" fontWeight="500">{f1(at)} °C</text>

        {/* Motor power */}
        <line x1="292" y1="284" x2="292" y2="296" stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
        <circle cx="292" cy="284" r="3" fill="rgba(255,255,255,0.55)"/>
        <rect x="250" y="298" width="84" height="30" rx="3" fill="#0f0f0f" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2"/>
        <text x="260" y="310" fontFamily={MONO} fontSize="8"  fill="rgba(0,166,81,0.7)"   letterSpacing="1">OUTPUT</text>
        <text x="260" y="323" fontFamily={MONO} fontSize="11" fill="#FFFFFF" fontWeight="500">{f1(mpw)} kW</text>

        {/* AOS pressure */}
        <line x1="548" y1="312" x2="548" y2="322" stroke="rgba(0,166,81,0.45)" strokeWidth="1"/>
        <circle cx="548" cy="312" r="3" fill="rgba(0,166,81,0.75)"/>
        <rect x="506" y="324" width="84" height="30" rx="3" fill="#0f0f0f" stroke="rgba(0,166,81,0.4)" strokeWidth="1.2"/>
        <text x="516" y="336" fontFamily={MONO} fontSize="8"  fill="rgba(0,166,81,0.7)"   letterSpacing="1">AOS PRES.</text>
        <text x="516" y="349" fontFamily={MONO} fontSize="11" fill="#FFFFFF" fontWeight="500">{f2(aos)} kg/cm²</text>

        {/* Oil Cooler IN/OUT */}
        <line x1="596" y1="213" x2="660" y2="213" stroke="rgba(246,168,32,0.45)" strokeWidth="1"/>
        <circle cx="596" cy="213" r="2.5" fill="rgba(246,168,32,0.75)"/>
        <rect x="660" y="199" width="104" height="38" rx="3" fill="#0f0f0f" stroke="rgba(246,168,32,0.35)" strokeWidth="1.2"/>
        <text x="671" y="211" fontFamily={MONO} fontSize="8"  fill="rgba(246,168,32,0.75)" letterSpacing="1">OIL COOLER</text>
        <rect x="661" y="215" width="46" height="14" rx="2" fill="rgba(246,168,32,0.05)" stroke="rgba(246,168,32,0.25)" strokeWidth=".8"/>
        <text x="684" y="223" fontFamily={MONO} fontSize="9"  fill="#f6a820" textAnchor="middle" dominantBaseline="central">{f1(oci)}°C</text>
        <rect x="712" y="215" width="46" height="14" rx="2" fill="rgba(246,168,32,0.05)" stroke="rgba(246,168,32,0.25)" strokeWidth=".8"/>
        <text x="735" y="223" fontFamily={MONO} fontSize="9"  fill="#f6a820" textAnchor="middle" dominantBaseline="central">{f1(oco)}°C</text>
        <text x="684" y="233" fontFamily={SANS} fontSize="7.5" fill="rgba(255,255,255,0.3)" textAnchor="middle">IN</text>
        <text x="735" y="233" fontFamily={SANS} fontSize="7.5" fill="rgba(255,255,255,0.3)" textAnchor="middle">OUT</text>

        {/* After Cooler IN/OUT */}
        <line x1="596" y1="300" x2="660" y2="300" stroke="rgba(52,209,122,0.45)" strokeWidth="1"/>
        <circle cx="596" cy="300" r="2.5" fill="rgba(52,209,122,0.75)"/>
        <rect x="660" y="286" width="104" height="38" rx="3" fill="#0f0f0f" stroke="rgba(52,209,122,0.3)" strokeWidth="1.2"/>
        <text x="671" y="298" fontFamily={MONO} fontSize="8"  fill="rgba(52,209,122,0.75)" letterSpacing="1">AFTER COOLER</text>
        <rect x="661" y="302" width="46" height="14" rx="2" fill="rgba(52,209,122,0.05)" stroke="rgba(52,209,122,0.2)" strokeWidth=".8"/>
        <text x="684" y="310" fontFamily={MONO} fontSize="9"  fill="rgba(255,255,255,0.8)" textAnchor="middle" dominantBaseline="central">{f1(aci)}°C</text>
        <rect x="712" y="302" width="46" height="14" rx="2" fill="rgba(52,209,122,0.05)" stroke="rgba(52,209,122,0.2)" strokeWidth=".8"/>
        <text x="735" y="310" fontFamily={MONO} fontSize="9"  fill="#34D17A" textAnchor="middle" dominantBaseline="central">{f1(aco)}°C</text>
        <text x="684" y="320" fontFamily={SANS} fontSize="7.5" fill="rgba(255,255,255,0.3)" textAnchor="middle">IN</text>
        <text x="735" y="320" fontFamily={SANS} fontSize="7.5" fill="rgba(255,255,255,0.3)" textAnchor="middle">OUT</text>

        {/* Air Inlet temp */}
        <line x1="248" y1="338" x2="210" y2="355" stroke="rgba(0,166,81,0.4)" strokeWidth="1"/>
        <circle cx="248" cy="338" r="3" fill="rgba(0,166,81,0.75)"/>
        <rect x="166" y="356" width="88" height="30" rx="3" fill="#0f0f0f" stroke="rgba(0,166,81,0.35)" strokeWidth="1.2"/>
        <text x="176" y="368" fontFamily={MONO} fontSize="8"  fill="rgba(0,166,81,0.7)"   letterSpacing="1">AIR INLET</text>
        <text x="176" y="381" fontFamily={MONO} fontSize="11" fill="#FFFFFF" fontWeight="500">{f1(ait)} °C</text>

        {/* Control panel readings */}
        <text x="558" y="68" fontFamily={MONO} fontSize="7" fill="rgba(255,255,255,0.3)" textAnchor="start">KRMS V30</text>
        <rect x="550" y="73" width="38" height="12" rx="1" fill="#06101c" stroke="rgba(0,166,81,0.3)"     strokeWidth="1"/>
        <text x="569" y="79" fontFamily={MONO} fontSize="7.5" fill="#FFFFFF" textAnchor="middle" dominantBaseline="central">{f1(ppw)} kW</text>
        <rect x="550" y="87" width="38" height="12" rx="1" fill="#06101c" stroke="rgba(0,166,81,0.3)"     strokeWidth="1"/>
        <text x="569" y="93" fontFamily={MONO} fontSize="7.5" fill="#FFFFFF" textAnchor="middle" dominantBaseline="central">{f0(volt)} V</text>
        <rect x="550" y="140" width="36" height="11" rx="1" fill="#06101c" stroke="rgba(0,166,81,0.3)"    strokeWidth="1"/>
        <text x="568" y="146" fontFamily={MONO} fontSize="7" fill="#FFFFFF" textAnchor="middle" dominantBaseline="central">{f1(curr)} A</text>
        <rect x="590" y="140" width="34" height="11" rx="1" fill="#06101c" stroke="rgba(0,166,81,0.3)"    strokeWidth="1"/>
        <text x="607" y="146" fontFamily={MONO} fontSize="7" fill="#FFFFFF" textAnchor="middle" dominantBaseline="central">PF {pf != null ? pf.toFixed(2) : '--'}</text>

        {/* Delivery / FAD */}
        <line x1="742" y1="200" x2="762" y2="200" stroke="rgba(0,166,81,0.45)" strokeWidth="1"/>
        <circle cx="742" cy="200" r="3" fill="#00A651"/>
        <rect x="762" y="182" width="92" height="40" rx="3" fill="#0f0f0f" stroke="rgba(0,166,81,0.5)" strokeWidth="1.5" filter="url(#fglow-green)"/>
        <text x="773" y="193" fontFamily={MONO} fontSize="8"  fill="rgba(0,166,81,0.75)"   letterSpacing="1">DELIVERY · 33mm</text>
        <text x="773" y="207" fontFamily={MONO} fontSize="11" fill="#FFFFFF" fontWeight="500">{f1(fad)} CFM</text>
        <text x="773" y="219" fontFamily={MONO} fontSize="9"  fill="rgba(255,255,255,0.55)">{f2(pres)} kg/cm²</text>

        {/* Ambient atmosphere */}
        <text x="138" y="305" fontFamily={MONO} fontSize="8.5" fill="#FFFFFF"               textAnchor="middle" fontWeight="600">ATMOS</text>
        <text x="138" y="317" fontFamily={SANS} fontSize="7.5" fill="rgba(255,255,255,0.38)" textAnchor="middle">Ambient Air</text>
        <rect x="114" y="322" width="48" height="13" rx="2" fill="#060e18" stroke="rgba(0,166,81,0.25)" strokeWidth="1"/>
        <text x="138" y="329" fontFamily={MONO} fontSize="8" fill="#FFFFFF" textAnchor="middle" dominantBaseline="central">{f1(ait)} °C</text>

        {/* ── Flow legend (inside viewBox) ── */}
        <g transform="translate(70,388)">
          <rect width="292" height="44" rx="3" fill="#0a0a0a" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
          <text x="8"   y="13"  fontFamily={MONO} fontSize="7.5" fill="rgba(255,255,255,0.28)" letterSpacing="2">FLOW LEGEND</text>
          <line x1="8"   y1="23" x2="30"  y2="23" stroke="#00C896" strokeWidth="3.5"/>
          <text x="36"  y="26"  fontFamily={SANS} fontSize="8.5" fill="rgba(255,255,255,0.55)">Inlet Air</text>
          <line x1="8"   y1="36" x2="30"  y2="36" stroke="#ff6b35" strokeWidth="3.5"/>
          <text x="36"  y="39"  fontFamily={SANS} fontSize="8.5" fill="rgba(255,255,255,0.55)">Hot Air + Oil Mix</text>
          <line x1="100" y1="23" x2="122" y2="23" stroke="#f6a820" strokeWidth="3.5"/>
          <text x="128" y="26"  fontFamily={SANS} fontSize="8.5" fill="rgba(255,255,255,0.55)">Hot Oil</text>
          <line x1="100" y1="36" x2="122" y2="36" stroke="#34D17A" strokeWidth="3.5"/>
          <text x="128" y="39"  fontFamily={SANS} fontSize="8.5" fill="rgba(255,255,255,0.55)">Cooled Air / Oil Return</text>
        </g>

      </g>
    </svg>
  )
}
