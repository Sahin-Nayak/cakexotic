import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const THEMES = {
  gold:   { bg: '#1a0e05', bg2: '#3D2B1F', card: '#FBF7F0', accent: '#D4A853', accent2: '#F2D490', text: '#2C1810' },
  pink:   { bg: '#1a0510', bg2: '#4a1528', card: '#fff0f5', accent: '#e91e8c', accent2: '#f48fb1', text: '#4a1528' },
  blue:   { bg: '#020d1a', bg2: '#0d2137', card: '#f0f8ff', accent: '#2196F3', accent2: '#90CAF9', text: '#0d2137' },
  green:  { bg: '#02100a', bg2: '#0d2b1a', card: '#f0fff4', accent: '#4CAF50', accent2: '#A5D6A7', text: '#0d2b1a' },
  purple: { bg: '#0a0215', bg2: '#1a0a2e', card: '#f8f0ff', accent: '#9C27B0', accent2: '#CE93D8', text: '#1a0a2e' },
};
const FONTS = {
  playfair: "'Playfair Display', serif",
  dancing:  "'Dancing Script', cursive",
  dm:       "'DM Sans', sans-serif",
};

// ── HAPPY BIRTHDAY TUNE ───────────────────────────────
function playHappyBirthday(audioCtx) {
  const notes = { C4:261.63,D4:293.66,E4:329.63,F4:349.23,G4:392.00,A4:440.00,B4:493.88,C5:523.25,D5:587.33,E5:659.25,F5:698.46,G5:783.99 };
  const melody = [
    ['C4',0.3,0],['C4',0.15,0.35],['D4',0.45,0.52],['C4',0.45,1.05],['F4',0.45,1.55],['E4',0.9,2.05],
    ['C4',0.3,3.1],['C4',0.15,3.45],['D4',0.45,3.62],['C4',0.45,4.15],['G4',0.45,4.65],['F4',0.9,5.15],
    ['C4',0.3,6.2],['C4',0.15,6.55],['C5',0.45,6.72],['A4',0.45,7.25],['F4',0.45,7.75],['E4',0.35,8.25],['D4',0.55,8.65],
    ['A4',0.3,9.35],['A4',0.15,9.7],['G4',0.45,9.87],['F4',0.45,10.4],['G4',0.45,10.9],['F4',0.9,11.4],
  ];
  melody.forEach(([note, dur, delay]) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const reverb = audioCtx.createGain();
    osc.connect(gain); gain.connect(reverb); reverb.connect(audioCtx.destination);
    osc.type = 'triangle';
    osc.frequency.value = notes[note];
    const s = audioCtx.currentTime + delay;
    gain.gain.setValueAtTime(0, s);
    gain.gain.linearRampToValueAtTime(0.45, s + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, s + dur);
    reverb.gain.value = 0.85;
    osc.start(s); osc.stop(s + dur + 0.1);
  });
}

// ── CONFETTI ──────────────────────────────────────────
function Confetti({ active, accentColor }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const pieces    = useRef([]);

  useEffect(() => {
    if (!active) { pieces.current = []; return; }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = [accentColor,'#fff','#FFD700','#FF69B4','#00BFFF','#7CFC00','#FF4500','#DA70D6'];
    const shapes = ['rect','circle','star'];
    pieces.current = Array.from({ length: 160 }, () => ({
      x: Math.random() * canvas.width,
      y: -30 - Math.random() * 200,
      w: 5 + Math.random() * 10,
      h: 8 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      vx: (Math.random() - 0.5) * 5,
      vy: 1.5 + Math.random() * 4,
      rot: Math.random() * 360,
      vrot: (Math.random() - 0.5) * 8,
      opacity: 1,
      swing: Math.random() * 0.1,
      swingSpeed: 0.02 + Math.random() * 0.03,
      t: 0,
    }));

    const drawStar = (ctx, x, y, r) => {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        i === 0 ? ctx.moveTo(x + r * Math.cos(angle), y + r * Math.sin(angle))
                : ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
      }
      ctx.closePath(); ctx.fill();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.current.forEach(p => {
        p.t += p.swingSpeed;
        p.x += p.vx + Math.sin(p.t) * p.swing * 20;
        p.y += p.vy;
        p.rot += p.vrot;
        p.vy += 0.03; // gravity
        if (p.y > canvas.height * 0.75) p.opacity -= 0.018;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect')   { ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h); }
        if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(0, 0, p.w/2, 0, Math.PI*2); ctx.fill(); }
        if (p.shape === 'star')   { drawStar(ctx, 0, 0, p.w/2); }
        ctx.restore();
      });
      pieces.current = pieces.current.filter(p => p.opacity > 0);
      if (pieces.current.length > 0) animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [active, accentColor]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 500 }} />;
}

// ── FLOATING PARTICLES BACKGROUND ─────────────────────
function FloatingParticles({ accentColor }) {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {Array.from({ length: 18 }, (_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: 4 + Math.random() * 8,
          height: 4 + Math.random() * 8,
          borderRadius: '50%',
          background: accentColor,
          opacity: 0.12 + Math.random() * 0.15,
          animation: `floatParticle ${4 + Math.random() * 6}s ease-in-out ${Math.random() * 4}s infinite alternate`,
        }} />
      ))}
      <style>{`
        @keyframes floatParticle {
          0%   { transform: translateY(0) scale(1); }
          100% { transform: translateY(-40px) scale(1.3); }
        }
      `}</style>
    </div>
  );
}

// ── ANIMATED CAKE ─────────────────────────────────────
function BirthdayCake({ candlesBlow, onCut, cakeCut, accentColor, accent2 }) {
  const [candlesOut, setCandlesOut] = useState([false, false, false, false, false]);
  const [cutting, setCutting]       = useState(false);
  const [showSmoke, setShowSmoke]   = useState([false, false, false, false, false]);

  useEffect(() => {
    if (!candlesBlow) return;
    [0,1,2,3,4].forEach(i => {
      setTimeout(() => {
        setCandlesOut(prev => { const n=[...prev]; n[i]=true; return n; });
        setShowSmoke(prev => { const n=[...prev]; n[i]=true; return n; });
        setTimeout(() => setShowSmoke(prev => { const n=[...prev]; n[i]=false; return n; }), 1200);
      }, i * 300);
    });
  }, [candlesBlow]);

  const allOut = candlesOut.every(Boolean);

  const handleCut = () => {
    if (!allOut || cakeCut || cutting) return;
    setCutting(true);
    setTimeout(() => { setCutting(false); onCut(); }, 700);
  };

  const candleColors = [accentColor, '#FF6B6B', '#4ECDC4', '#FFE66D', accent2];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Candles */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 0, position: 'relative', zIndex: 2 }}>
        {candlesOut.map((out, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Smoke */}
            {showSmoke[i] && (
              <div style={{
                width: 6, height: 24, marginBottom: -4,
                background: 'linear-gradient(to top, rgba(200,200,200,0.8), transparent)',
                borderRadius: 3, animation: 'smokeRise 1s ease-out forwards',
              }} />
            )}
            {/* Flame or snuffed */}
            {!out ? (
              <div style={{ position: 'relative', width: 14, height: 22 }}>
                <div style={{
                  width: 14, height: 22,
                  background: `radial-gradient(ellipse at 50% 85%, #fff 0%, #FFD700 25%, #FF8C00 60%, transparent 100%)`,
                  borderRadius: '50% 50% 35% 35%',
                  animation: 'flicker 0.35s ease-in-out infinite alternate',
                  filter: `drop-shadow(0 0 8px #FF8C00) drop-shadow(0 0 16px ${accentColor}88)`,
                }} />
                {/* Inner flame */}
                <div style={{
                  position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
                  width: 5, height: 10,
                  background: 'radial-gradient(ellipse, #fff 0%, #87CEEB 60%, transparent 100%)',
                  borderRadius: '50% 50% 40% 40%',
                  animation: 'flicker 0.25s ease-in-out infinite alternate',
                }} />
              </div>
            ) : (
              <div style={{ width: 14, height: 22, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <div style={{ width: 2, height: 8, background: '#666', borderRadius: 1 }} />
              </div>
            )}
            {/* Candle */}
            <div style={{
              width: 14, height: 52,
              background: `linear-gradient(to right, ${candleColors[i]}dd, ${candleColors[i]}, ${candleColors[i]}aa)`,
              borderRadius: '4px 4px 2px 2px',
              boxShadow: !out ? `0 0 12px ${candleColors[i]}88, 0 0 24px ${candleColors[i]}44` : 'none',
              transition: 'box-shadow 0.5s',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Drip marks */}
              {[0.2,0.5,0.75].map((pos,j) => (
                <div key={j} style={{ position: 'absolute', left: `${pos*100}%`, top: '15%', width: 3, height: 8, background: `${candleColors[i]}66`, borderRadius: '0 0 3px 3px' }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Cake */}
      <div
        onClick={handleCut}
        style={{
          cursor: allOut && !cakeCut ? 'pointer' : 'default',
          transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
          transform: cutting ? 'scale(0.93) rotate(-1deg)' : 'scale(1)',
          position: 'relative',
          filter: allOut && !cakeCut ? `drop-shadow(0 0 20px ${accentColor}44)` : 'none',
        }}
      >
        {/* Top tier */}
        <div style={{
          width: 130, height: 45, margin: '0 auto',
          background: `linear-gradient(135deg, #fff9f0 0%, #fde8c8 50%, #fbd298 100%)`,
          borderRadius: '10px 10px 0 0',
          border: `2.5px solid ${accentColor}`,
          borderBottom: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, position: 'relative', overflow: 'hidden',
          boxShadow: `inset 0 2px 8px rgba(255,255,255,0.6)`,
        }}>
          {/* Decorative dots */}
          {[15,35,55,75,90].map((l,i) => (
            <div key={i} style={{ position: 'absolute', left: `${l}%`, top: '30%', width: 6, height: 6, borderRadius: '50%', background: accentColor, opacity: 0.6 }} />
          ))}
          🎂
        </div>

        {/* Middle tier */}
        <div style={{
          width: 170, height: 55, margin: '0 auto',
          background: `linear-gradient(135deg, #fff5e6 0%, #fdd9a0 50%, #fbc975 100%)`,
          border: `2.5px solid ${accentColor}`,
          borderTop: 'none', borderBottom: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
          boxShadow: `inset 0 2px 8px rgba(255,255,255,0.5)`,
        }}>
          {/* Frosting top drip */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 14, background: 'rgba(255,255,255,0.9)', borderRadius: '0 0 60% 60% / 0 0 100% 100%' }} />
          {/* Stripe decorations */}
          {[0.2,0.45,0.7].map((pos,i) => (
            <div key={i} style={{ position: 'absolute', left: `${pos*100}%`, top: 0, bottom: 0, width: 12, background: `${accentColor}20`, transform: 'skewX(-10deg)' }} />
          ))}
          <span style={{ fontSize: 26, zIndex: 1 }}>🍰</span>
          {cakeCut && (
            <div style={{
              position: 'absolute', top: 0, bottom: 0, left: '50%',
              width: 3, background: `linear-gradient(to bottom, ${accentColor}, ${accentColor}88)`,
              animation: 'cutSlice 0.5s cubic-bezier(0.34,1.56,0.64,1)',
              boxShadow: `0 0 8px ${accentColor}`,
            }} />
          )}
        </div>

        {/* Bottom tier */}
        <div style={{
          width: 200, height: 65,
          background: `linear-gradient(135deg, #fff0d4 0%, #fdd9a0 40%, #fbc975 100%)`,
          borderRadius: '0 0 16px 16px',
          border: `2.5px solid ${accentColor}`,
          borderTop: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
          boxShadow: `inset 0 2px 8px rgba(255,255,255,0.4), 0 8px 24px rgba(0,0,0,0.2)`,
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 16, background: 'rgba(255,255,255,0.85)', borderRadius: '0 0 70% 70% / 0 0 100% 100%' }} />
          {[0.15,0.35,0.55,0.75,0.9].map((pos,i) => (
            <div key={i} style={{ position: 'absolute', left: `${pos*100}%`, top: 0, bottom: 0, width: 14, background: `${accentColor}18`, transform: 'skewX(-8deg)' }} />
          ))}
          <span style={{ fontSize: 28, zIndex: 1 }}>✨</span>
        </div>

        {/* Plate */}
        <div style={{
          width: 230, height: 16, margin: '0 auto',
          background: 'linear-gradient(135deg, #e8e0d0, #d4c8b0, #c8b898)',
          borderRadius: '0 0 60px 60px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
        }} />

        {/* Tap hint */}
        {allOut && !cakeCut && (
          <div style={{
            position: 'absolute', bottom: -44, left: '50%', transform: 'translateX(-50%)',
            background: `linear-gradient(135deg, ${accentColor}, ${accent2})`,
            color: '#fff', padding: '6px 18px', borderRadius: 20,
            fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
            animation: 'pulseHint 1s ease-in-out infinite',
            boxShadow: `0 4px 16px ${accentColor}66`,
          }}>🔪 Cut the cake!</div>
        )}
      </div>

      <style>{`
        @keyframes flicker {
          from { transform: scaleX(1) scaleY(1) rotate(-3deg); opacity: 1; }
          to   { transform: scaleX(0.85) scaleY(1.1) rotate(3deg); opacity: 0.92; }
        }
        @keyframes cutSlice {
          from { transform: scaleY(0); transform-origin: top; }
          to   { transform: scaleY(1); }
        }
        @keyframes pulseHint {
          0%,100% { transform: translateX(-50%) scale(1); box-shadow: 0 4px 16px ${accentColor}66; }
          50%      { transform: translateX(-50%) scale(1.07); box-shadow: 0 6px 24px ${accentColor}99; }
        }
        @keyframes smokeRise {
          0%   { opacity: 0.8; transform: translateY(0) scaleX(1); }
          50%  { opacity: 0.4; transform: translateY(-12px) scaleX(1.5); }
          100% { opacity: 0;   transform: translateY(-24px) scaleX(2); }
        }
      `}</style>
    </div>
  );
}

// ── BLOW DETECTOR ─────────────────────────────────────
function useBlowDetector(onBlow) {
  const refs = useRef({ audioCtx: null, stream: null, frame: null, blown: false });

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      refs.current.stream = stream;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      refs.current.audioCtx = ctx;
      const source   = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const check = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        if (avg > 26 && !refs.current.blown) {
          refs.current.blown = true;
          onBlow(); stop(); return;
        }
        refs.current.frame = requestAnimationFrame(check);
      };
      refs.current.frame = requestAnimationFrame(check);
    } catch { onBlow(); }
  }, [onBlow]);

  const stop = useCallback(() => {
    cancelAnimationFrame(refs.current.frame);
    refs.current.stream?.getTracks().forEach(t => t.stop());
    refs.current.audioCtx?.close();
  }, []);

  useEffect(() => () => stop(), [stop]);
  return { start };
}

// ── STARS BACKGROUND ──────────────────────────────────
function Stars({ accentColor }) {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {Array.from({ length: 30 }, (_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${Math.random() * 100}%`,
          top:  `${Math.random() * 100}%`,
          width: 2 + Math.random() * 3,
          height: 2 + Math.random() * 3,
          borderRadius: '50%',
          background: '#fff',
          opacity: 0.2 + Math.random() * 0.4,
          animation: `twinkle ${1.5 + Math.random() * 3}s ease-in-out ${Math.random() * 3}s infinite alternate`,
        }} />
      ))}
      <style>{`
        @keyframes twinkle {
          from { opacity: 0.1; transform: scale(0.8); }
          to   { opacity: 0.7; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────
export default function BirthdayView() {
  const [params]  = useSearchParams();
  const [data, setData]           = useState(null);
  const [page, setPage]           = useState(0);
  const [phase, setPhase]         = useState('envelope'); // envelope | card | cake | celebration
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [blown, setBlown]         = useState(false);
  const [cakeCut, setCakeCut]     = useState(false);
  const [confetti, setConfetti]   = useState(false);
  const [pageFlip, setPageFlip]   = useState(false);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    try {
      const raw = params.get('d');
      if (raw) setData(JSON.parse(decodeURIComponent(raw)));
    } catch { setData(null); }
  }, [params]);

  const theme = data ? (THEMES[data.themeId] || THEMES.gold) : THEMES.gold;
  const font  = data ? (FONTS[data.fontId]   || FONTS.playfair) : FONTS.playfair;

  const handleBlow = useCallback(() => { setBlown(true); setListening(false); }, []);
  const { start: startMic } = useBlowDetector(handleBlow);

  const openEnvelope = () => {
    setEnvelopeOpen(true);
    setTimeout(() => setPhase('card'), 1000);
  };

  const changePage = (dir) => {
    setPageFlip(true);
    setTimeout(() => {
      setPage(p => dir === 'next' ? Math.min(data.pages.length - 1, p + 1) : Math.max(0, p - 1));
      setPageFlip(false);
    }, 200);
  };

  const handleCakeCut = () => {
    setCakeCut(true);
    setConfetti(true);
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      playHappyBirthday(audioCtxRef.current);
    } catch {}
    setTimeout(() => setPhase('celebration'), 900);
    setTimeout(() => setConfetti(false), 7000);
  };

  if (!data) return (
    <div style={{ minHeight: '100vh', background: '#1a0e05', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 64 }}>🎂</div>
      <h2 style={{ color: '#D4A853' }}>Invalid birthday link</h2>
      <p style={{ color: 'rgba(255,255,255,0.4)' }}>Ask your friend to resend the link!</p>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: `radial-gradient(ellipse at 20% 20%, ${theme.accent}18 0%, transparent 50%),
                   radial-gradient(ellipse at 80% 80%, ${theme.accent2}12 0%, transparent 50%),
                   linear-gradient(160deg, ${theme.bg} 0%, ${theme.bg2} 60%, ${theme.bg} 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '32px 16px', position: 'relative', overflow: 'hidden',
    }}>
      <Stars accentColor={theme.accent} />
      <FloatingParticles accentColor={theme.accent} />
      <Confetti active={confetti} accentColor={theme.accent} />

      {/* ── ENVELOPE PHASE ── */}
      {phase === 'envelope' && (
        <div style={{ textAlign: 'center', animation: 'fadeSlideUp 0.8s ease', position: 'relative', zIndex: 10 }}>
          <div style={{ fontSize: 20, color: `${theme.accent}88`, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 20, fontFamily: font }}>
            You have a special message
          </div>
          <div style={{ fontSize: 28, color: theme.accent, fontFamily: font, marginBottom: 8 }}>
            For {data.to} 🎂
          </div>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 48 }}>from {data.from} with love</p>

          {/* Envelope */}
          <div
            onClick={openEnvelope}
            style={{
              width: 280, height: 200, margin: '0 auto 40px',
              position: 'relative', cursor: 'pointer',
              animation: envelopeOpen ? 'envelopeShake 0.3s ease' : 'floatEnvelope 3s ease-in-out infinite',
              transition: 'transform 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {/* Envelope body */}
            <div style={{
              width: '100%', height: '100%', borderRadius: 12,
              background: `linear-gradient(145deg, ${theme.accent}22, ${theme.accent}0a)`,
              border: `2px solid ${theme.accent}44`,
              backdropFilter: 'blur(10px)',
              boxShadow: `0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px ${theme.accent}22, inset 0 1px 0 rgba(255,255,255,0.08)`,
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Envelope lines */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: `${theme.accent}08` }} />
              <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '50%', borderRight: `1px solid ${theme.accent}22`, borderBottom: `1px solid ${theme.accent}22` }} />
              <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '50%', borderLeft: `1px solid ${theme.accent}22`, borderBottom: `1px solid ${theme.accent}22` }} />
              {/* Flap */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: '50%',
                background: `linear-gradient(135deg, ${theme.accent}18, ${theme.accent}08)`,
                clipPath: 'polygon(0 0, 50% 55%, 100% 0)',
                transformOrigin: 'top',
                transform: envelopeOpen ? 'rotateX(180deg)' : 'rotateX(0)',
                transition: 'transform 0.6s ease',
                borderBottom: `1px solid ${theme.accent}22`,
              }} />
              {/* Center seal */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: 48, height: 48, borderRadius: '50%',
                background: `radial-gradient(circle, ${theme.accent}, ${theme.accent2})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, boxShadow: `0 4px 16px ${theme.accent}66`,
                animation: 'sealPulse 2s ease-in-out infinite',
              }}>
                {data.emoji}
              </div>
            </div>
          </div>

          <p style={{ color: `${theme.accent}88`, fontSize: 13, marginBottom: 20 }}>✨ Tap the envelope to open ✨</p>
          <button onClick={openEnvelope} style={{
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
            color: theme.bg, border: 'none', borderRadius: 50,
            padding: '14px 40px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
            boxShadow: `0 8px 28px ${theme.accent}55`, fontFamily: font,
            animation: 'glowPulse 2s ease-in-out infinite',
          }}>Open My Message 💌</button>
        </div>
      )}

      {/* ── CARD PHASE ── */}
      {phase === 'card' && (
        <div style={{ width: '100%', maxWidth: 540, animation: 'fadeSlideUp 0.7s ease', position: 'relative', zIndex: 10 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 64, marginBottom: 10, animation: 'bounceEmoji 1.5s ease-in-out infinite' }}>{data.emoji}</div>
            <h1 style={{
              color: theme.accent, fontFamily: font,
              fontSize: 'clamp(1.8rem, 6vw, 2.6rem)', marginBottom: 6,
              textShadow: `0 0 30px ${theme.accent}44`,
              animation: 'shimmerText 3s ease-in-out infinite',
            }}>
              Happy Birthday, {data.to}!
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>A heartfelt message from {data.from}</p>
          </div>

          {/* Card */}
          <div style={{
            background: theme.card,
            borderRadius: 24, padding: '36px 40px',
            boxShadow: `0 24px 70px rgba(0,0,0,0.35), 0 0 0 1px ${theme.accent}20, inset 0 1px 0 rgba(255,255,255,0.9)`,
            minHeight: 260, position: 'relative',
            transform: pageFlip ? 'rotateY(8deg) scale(0.97)' : 'rotateY(0) scale(1)',
            transition: 'transform 0.2s ease',
            transformStyle: 'preserve-3d',
          }}>
            {/* Decorative corner */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: 50, height: 50, background: `linear-gradient(135deg, ${theme.accent}18, transparent)`, borderRadius: '24px 0 0 0' }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 50, height: 50, background: `linear-gradient(315deg, ${theme.accent}12, transparent)`, borderRadius: '0 0 24px 0' }} />

            {/* Page dots */}
            {data.pages.length > 1 && (
              <div style={{ position: 'absolute', top: 16, right: 20, display: 'flex', gap: 6 }}>
                {data.pages.map((_, i) => (
                  <div key={i} onClick={() => { setPageFlip(true); setTimeout(() => { setPage(i); setPageFlip(false); }, 200); }} style={{
                    width: i === page ? 20 : 8, height: 8, borderRadius: 4,
                    background: i === page ? theme.accent : `${theme.accent}33`,
                    cursor: 'pointer', transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                  }} />
                ))}
              </div>
            )}

            <p style={{
              fontFamily: font, fontSize: 16, lineHeight: 2,
              color: theme.text, whiteSpace: 'pre-wrap', minHeight: 180,
            }}>
              {data.pages[page]}
            </p>

            {data.pages.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 16, borderTop: `1px solid ${theme.accent}15` }}>
                <button onClick={() => changePage('prev')} disabled={page === 0} style={{
                  background: page === 0 ? 'transparent' : `${theme.accent}15`,
                  color: theme.accent, border: `1px solid ${theme.accent}30`,
                  borderRadius: 10, padding: '7px 16px', cursor: page === 0 ? 'default' : 'pointer',
                  opacity: page === 0 ? 0.25 : 1, display: 'flex', alignItems: 'center', gap: 4, fontSize: 13,
                  transition: 'all 0.2s',
                }}>
                  <ChevronLeft size={14} /> Prev
                </button>
                <span style={{ fontSize: 12, color: `${theme.text}66` }}>{page + 1} / {data.pages.length}</span>
                <button onClick={() => changePage('next')} disabled={page === data.pages.length - 1} style={{
                  background: page === data.pages.length - 1 ? 'transparent' : `${theme.accent}15`,
                  color: theme.accent, border: `1px solid ${theme.accent}30`,
                  borderRadius: 10, padding: '7px 16px', cursor: page === data.pages.length - 1 ? 'default' : 'pointer',
                  opacity: page === data.pages.length - 1 ? 0.25 : 1, display: 'flex', alignItems: 'center', gap: 4, fontSize: 13,
                  transition: 'all 0.2s',
                }}>
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${theme.accent}18`, textAlign: 'right' }}>
              <span style={{ fontFamily: font, fontSize: 15, color: theme.accent, fontStyle: 'italic' }}>
                — With love, {data.from} 💛
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <button onClick={() => setPhase('cake')} style={{
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
              color: theme.bg, border: 'none', borderRadius: 50,
              padding: '15px 40px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
              boxShadow: `0 8px 28px ${theme.accent}55`, fontFamily: font,
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              animation: 'glowPulse 2.5s ease-in-out infinite',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)'; e.currentTarget.style.boxShadow = `0 14px 36px ${theme.accent}77`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 8px 28px ${theme.accent}55`; }}
            >
              🎂 Let's celebrate! →
            </button>
          </div>
        </div>
      )}

      {/* ── CAKE PHASE ── */}
      {phase === 'cake' && (
        <div style={{ textAlign: 'center', animation: 'fadeSlideUp 0.6s ease', position: 'relative', zIndex: 10 }}>
          <h2 style={{ color: theme.accent, fontFamily: font, fontSize: 'clamp(1.5rem,4vw,2rem)', marginBottom: 6, textShadow: `0 0 24px ${theme.accent}44` }}>
            Time to celebrate, {data.to}! 🥳
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 52, fontSize: 14 }}>
            {!blown ? '🎤 Blow out the candles first!' : '🔪 Now cut the cake!'}
          </p>

          <BirthdayCake candlesBlow={blown} onCut={handleCakeCut} cakeCut={cakeCut} accentColor={theme.accent} accent2={theme.accent2} />

          {!blown && !listening && (
            <div style={{ marginTop: 64 }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 18 }}>Use your mic or just click to blow the candles</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={async () => { setListening(true); await startMic(); }} style={{
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
                  color: theme.bg, border: 'none', borderRadius: 50,
                  padding: '13px 30px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  boxShadow: `0 6px 22px ${theme.accent}55`,
                }}>🎤 Blow via Mic</button>
                <button onClick={handleBlow} style={{
                  background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: 50,
                  padding: '13px 30px', fontSize: 14, cursor: 'pointer',
                }}>Skip →</button>
              </div>
            </div>
          )}

          {listening && !blown && (
            <div style={{ marginTop: 52 }}>
              <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginBottom: 16, alignItems: 'flex-end', height: 40 }}>
                {[1,2,3,4,5,4,3,2,1].map((h, i) => (
                  <div key={i} style={{
                    width: 6, borderRadius: 3,
                    background: `linear-gradient(to top, ${theme.accent}, ${theme.accent2})`,
                    animation: `soundBar 0.5s ease-in-out ${i * 0.07}s infinite alternate`,
                    height: h * 6,
                  }} />
                ))}
              </div>
              <p style={{ color: theme.accent, fontSize: 16, fontWeight: 600 }}>🎤 Listening... blow now! 💨</p>
            </div>
          )}
        </div>
      )}

      {/* ── CELEBRATION PHASE ── */}
      {phase === 'celebration' && (
        <div style={{ textAlign: 'center', animation: 'fadeSlideUp 0.7s ease', position: 'relative', zIndex: 10, maxWidth: 500 }}>
          <div style={{ fontSize: 80, marginBottom: 16, animation: 'bounceEmoji 0.7s ease-in-out infinite' }}>🎉</div>
          <h1 style={{
            color: theme.accent, fontFamily: font,
            fontSize: 'clamp(2rem,7vw,3.2rem)', marginBottom: 12, lineHeight: 1.2,
            textShadow: `0 0 40px ${theme.accent}55, 0 0 80px ${theme.accent}22`,
            animation: 'shimmerText 2s ease-in-out infinite',
          }}>
            Happy Birthday<br />{data.to}! 🥳
          </h1>
          <p style={{ color: `${theme.accent}99`, fontSize: 16, marginBottom: 8 }}>🎵 Happy Birthday to you! 🎵</p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 40 }}>All the love from {data.from} 💛</p>

          {/* Celebration emojis */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 36, fontSize: 32 }}>
            {['🎂','🎈','🎁','🥳','🎊','✨','🌟','💖'].map((e,i) => (
              <span key={i} style={{ animation: `bounceEmoji ${0.8 + i * 0.1}s ease-in-out ${i * 0.12}s infinite` }}>{e}</span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setPhase('card')} style={{
              background: 'rgba(255,255,255,0.07)', color: theme.accent,
              border: `1.5px solid ${theme.accent}44`, borderRadius: 50,
              padding: '12px 26px', fontSize: 14, cursor: 'pointer', backdropFilter: 'blur(8px)',
            }}>📖 Read Again</button>
            <button onClick={() => {
              setConfetti(true);
              setTimeout(() => setConfetti(false), 6000);
              try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                playHappyBirthday(ctx);
              } catch {}
            }} style={{
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
              color: theme.bg, border: 'none', borderRadius: 50,
              padding: '12px 26px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              boxShadow: `0 6px 20px ${theme.accent}55`,
            }}>🎊 Celebrate Again!</button>
          </div>
        </div>
      )}

      {/* Global keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;600;700&display=swap');
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bounceEmoji {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-12px) scale(1.08); }
        }
        @keyframes shimmerText {
          0%,100% { filter: brightness(1); }
          50%      { filter: brightness(1.2) drop-shadow(0 0 12px currentColor); }
        }
        @keyframes glowPulse {
          0%,100% { box-shadow: 0 8px 28px ${theme.accent}55; }
          50%      { box-shadow: 0 8px 40px ${theme.accent}88, 0 0 60px ${theme.accent}22; }
        }
        @keyframes sealPulse {
          0%,100% { transform: translate(-50%,-50%) scale(1); }
          50%      { transform: translate(-50%,-50%) scale(1.12); }
        }
        @keyframes floatEnvelope {
          0%,100% { transform: translateY(0) rotate(-1deg); }
          50%      { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes envelopeShake {
          0%,100% { transform: rotate(0); }
          25%      { transform: rotate(-3deg) scale(1.02); }
          75%      { transform: rotate(3deg) scale(1.02); }
        }
        @keyframes soundBar {
          from { transform: scaleY(0.4); opacity: 0.7; }
          to   { transform: scaleY(1.6); opacity: 1; }
        }
      `}</style>
    </div>
  );
}