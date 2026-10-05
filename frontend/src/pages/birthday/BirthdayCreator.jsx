import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Send, Eye, Cake } from 'lucide-react';

const THEMES = [
  { id: 'gold',   label: 'Golden',    bg: '#3D2B1F', card: '#FBF7F0', accent: '#D4A853', text: '#2C1810' },
  { id: 'pink',   label: 'Pink Love', bg: '#4a1528', card: '#fff0f5', accent: '#e91e8c', text: '#4a1528' },
  { id: 'blue',   label: 'Sky Blue',  bg: '#0d2137', card: '#f0f8ff', accent: '#2196F3', text: '#0d2137' },
  { id: 'green',  label: 'Mint',      bg: '#0d2b1a', card: '#f0fff4', accent: '#4CAF50', text: '#0d2b1a' },
  { id: 'purple', label: 'Royal',     bg: '#1a0a2e', card: '#f8f0ff', accent: '#9C27B0', text: '#1a0a2e' },
];

const FONTS = [
  { id: 'playfair', label: 'Elegant',   css: "'Playfair Display', serif" },
  { id: 'dancing',  label: 'Cursive',   css: "'Dancing Script', cursive" },
  { id: 'dm',       label: 'Clean',     css: "'DM Sans', sans-serif" },
];

export default function BirthdayCreator() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=create, 2=preview
  const [toName, setToName]     = useState('');
  const [fromName, setFromName] = useState('');
  const [pages, setPages]       = useState(['']);
  const [theme, setTheme]       = useState(THEMES[0]);
  const [font, setFont]         = useState(FONTS[0]);
  const [emojiTop, setEmojiTop] = useState('🎂');

  const addPage    = () => setPages(p => [...p, '']);
  const removePage = (i) => setPages(p => p.filter((_, idx) => idx !== i));
  const setPage    = (i, v) => setPages(p => p.map((x, idx) => idx === i ? v : x));

  const encoded = encodeURIComponent(JSON.stringify({
    to: toName, from: fromName, pages,
    themeId: theme.id, fontId: font.id, emoji: emojiTop,
  }));

  const shareUrl = `${window.location.origin}/birthday/view?d=${encoded}`;

  const handleShare = async () => {
        if (navigator.share) {
            try {
            await navigator.share({
                title: `🎂 Happy Birthday ${toName}!`,
                text: `🎂 Hey ${toName}! You have a special birthday message from ${fromName}! Open this link to see your surprise 🎉`,
                url: shareUrl,
            });
            } catch (e) {
            // user cancelled, do nothing
            }
        } else {
            await navigator.clipboard.writeText(shareUrl);
            toast.success('Link copied! Share it with ' + toName);
        }
    };

  const canProceed = toName.trim() && fromName.trim() && pages.some(p => p.trim());

  return (
    <div>
      <div className="page-header">
        <h1>🎂 Birthday Message Card</h1>
        <p>Create a beautiful birthday surprise for your loved one</p>
      </div>

      <div className="container" style={{ padding: '48px 24px', maxWidth: 780 }}>

        {step === 1 && (
          <div>
            {/* Names */}
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 20, fontSize: '1.1rem' }}>🎈 Who is this for?</h3>
              <div className="grid-2">
                <div className="form-group">
                  <label>Birthday Person's Name *</label>
                  <input placeholder="e.g. Priya" value={toName} onChange={e => setToName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Your Name *</label>
                  <input placeholder="e.g. Rahul" value={fromName} onChange={e => setFromName(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Theme */}
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontSize: '1.1rem' }}>🎨 Card Theme</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                {THEMES.map(t => (
                  <button key={t.id} onClick={() => setTheme(t)} style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${t.bg}, ${t.accent})`,
                    border: theme.id === t.id ? `3px solid ${t.accent}` : '3px solid transparent',
                    outline: theme.id === t.id ? `2px solid ${t.accent}` : 'none',
                    cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: theme.id === t.id ? `0 0 0 3px ${t.accent}40` : 'none',
                  }} title={t.label} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {FONTS.map(f => (
                  <button key={f.id} onClick={() => setFont(f)} className={`btn btn-sm ${font.id === f.id ? 'btn-primary' : 'btn-outline'}`} style={{ fontFamily: f.css }}>{f.label}</button>
                ))}
              </div>
            </div>

            {/* Emoji picker */}
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 14, fontSize: '1.1rem' }}>✨ Top Decoration</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {['🎂','🎈','🎁','🌸','💖','🌟','🥳','🎉','🦋','🌺'].map(e => (
                  <button key={e} onClick={() => setEmojiTop(e)} style={{
                    fontSize: 28, background: emojiTop === e ? 'rgba(212,168,83,0.15)' : 'transparent',
                    border: emojiTop === e ? '2px solid var(--gold)' : '2px solid var(--border)',
                    borderRadius: 10, padding: '6px 10px', cursor: 'pointer', transition: 'all 0.2s',
                  }}>{e}</button>
                ))}
              </div>
            </div>

            {/* Message Pages */}
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 6, fontSize: '1.1rem' }}>💌 Your Message</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Each page becomes a separate card page. Add as many as you want.</p>
              {pages.map((p, i) => (
                <div key={i} style={{ marginBottom: 16, position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Page {i + 1}</label>
                    {pages.length > 1 && (
                      <button onClick={() => removePage(i)} style={{ background: 'none', color: 'var(--error)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Trash2 size={13} /> Remove
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={5}
                    placeholder={i === 0 ? "Dear Priya,\n\nHappy Birthday! Wishing you a day filled with joy..." : "Continue your message..."}
                    value={p}
                    onChange={e => setPage(i, e.target.value)}
                    style={{ fontFamily: font.css, fontSize: 15, lineHeight: 1.8, resize: 'vertical' }}
                  />
                </div>
              ))}
              <button className="btn btn-outline btn-sm" onClick={addPage}>
                <Plus size={14} /> Add Another Page
              </button>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-outline" onClick={() => setStep(2)} disabled={!canProceed}>
                <Eye size={16} /> Preview Card
              </button>
              <button className="btn btn-primary" onClick={() => { setStep(2); }} disabled={!canProceed}>
                Continue to Share <Send size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <MiniPreview to={toName} from={fromName} pages={pages} theme={theme} font={font} emoji={emojiTop} />
            <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
              <button className="btn btn-outline" onClick={() => setStep(1)}>← Edit Message</button>
              <button className="btn btn-primary" style={{ fontSize: 16, padding: '13px 32px' }} onClick={handleShare}>
                <Send size={17} /> Send to {toName} 🎉
              </button>
            </div>
            <div style={{ marginTop: 16, padding: 14, background: 'rgba(212,168,83,0.08)', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <strong style={{ color: 'var(--text)' }}>Share link</strong>
                    <button
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                        navigator.clipboard.writeText(shareUrl);
                        toast.success('Link copied!');
                    }}
                    >
                    📋 Copy Link
                    </button>
                </div>
                <a
                    href={shareUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ wordBreak: 'break-all', color: 'var(--gold-dark)', fontSize: 12, lineHeight: 1.5 }}
                >
                    {shareUrl}
                </a>
                </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniPreview({ to, from, pages, theme, font, emoji }) {
  return (
    <div style={{
      background: theme.bg, borderRadius: 20, padding: 32, textAlign: 'center',
      boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
    }}>
      <div style={{ fontSize: 48, marginBottom: 8 }}>{emoji}</div>
      <h2 style={{ color: theme.accent, fontFamily: font.css, fontSize: '1.8rem', marginBottom: 4 }}>Happy Birthday, {to}!</h2>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 20 }}>A message from {from}</p>
      <div style={{
        background: theme.card, borderRadius: 14, padding: '20px 24px',
        fontFamily: font.css, color: theme.text, fontSize: 15, lineHeight: 1.8,
        textAlign: 'left', maxHeight: 160, overflow: 'hidden', position: 'relative',
      }}>
        {pages[0]}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: `linear-gradient(transparent, ${theme.card})` }} />
      </div>
      {pages.length > 1 && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 10 }}>+{pages.length - 1} more page{pages.length > 2 ? 's' : ''}</p>}
    </div>
  );
}
