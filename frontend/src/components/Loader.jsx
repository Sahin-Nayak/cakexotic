export default function Loader() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'var(--brown)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 20,
    }}>
      {/* Cake icon */}
      <div style={{ fontSize: 56, animation: 'loaderBounce 1s ease-in-out infinite' }}>🎂</div>

      {/* Animated dots bar */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: '50%',
            background: 'var(--gold)',
            animation: `loaderDot 1.2s ease-in-out ${i * 0.18}s infinite`,
          }} />
        ))}
      </div>

      {/* Text */}
      <p style={{
        fontFamily: 'var(--font-display)',
        color: 'var(--gold-light)',
        fontSize: 16, letterSpacing: 2,
        opacity: 0.7,
      }}>
        Baking something sweet...
      </p>

      <style>{`
        @keyframes loaderBounce {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-14px) scale(1.1); }
        }
        @keyframes loaderDot {
          0%,80%,100% { transform: scale(0.7); opacity: 0.4; }
          40%          { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}