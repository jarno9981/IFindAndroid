// Shared primitives: Avatar, BatteryBar, KindBadge, IconButton, Sheet, AppBar, BottomNav

const { Icons } = window;

// ───── Avatar (Material You expressive squircle) ─────
const Avatar = ({ person, size = 40, ring }) => {
  if (!person) return null;
  return (
    <div style={{
      width: size, height: size,
      borderRadius: size * 0.35,
      background: person.color,
      color: '#0b1422',
      fontWeight: 700,
      fontSize: size * 0.36,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      letterSpacing: '-0.02em',
      boxShadow: ring ? `0 0 0 3px var(--surface-1), 0 0 0 5px ${person.color}` : 'none',
    }}>{person.initials}</div>
  );
};

// ───── Battery bar (segmented, accent flips at low%) ─────
const BatteryBar = ({ value, width = 36, color }) => {
  const pct = Math.max(0, Math.min(1, value));
  const low = pct < 0.25;
  const c = color || (low ? 'var(--error)' : 'var(--on-surface-variant)');
  return (
    <div style={{
      width, height: 10, borderRadius: 3,
      background: 'var(--surface-4)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        width: `${pct * 100}%`,
        background: c,
        borderRadius: 3,
      }}/>
    </div>
  );
};

// ───── Kind badge (icon + colored tonal bg) ─────
const KindBadge = ({ kind, color = 'var(--primary)', size = 44 }) => {
  const map = {
    phone: Icons.Phone, tablet: Icons.Tablet, watch: Icons.Watch,
    buds: Icons.Earbuds, tag: Icons.Tag, laptop: Icons.Laptop,
    bike: Icons.Bike,
  };
  const Icon = map[kind] || Icons.Tag;
  // tonal container = color with low alpha
  return (
    <div style={{
      width: size, height: size,
      borderRadius: size * 0.32,
      background: tonalize(color, 0.18),
      color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={size * 0.5} color={color}/>
    </div>
  );
};

// Convert an oklch-friendly hex to a translucent tonal bg
function tonalize(hex, alpha) {
  // hex #rrggbb -> rgba string
  const h = hex.replace('#','');
  const r = parseInt(h.substring(0,2),16);
  const g = parseInt(h.substring(2,4),16);
  const b = parseInt(h.substring(4,6),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ───── Icon button (Material You expressive round) ─────
const IconButton = ({ icon: Icon, label, onClick, variant = 'tonal', size = 44, color, active }) => {
  const styles = {
    tonal: { background: 'var(--surface-3)', color: 'var(--on-surface)' },
    surface: { background: 'var(--surface-2)', color: 'var(--on-surface)' },
    elevated: { background: 'var(--surface-4)', color: 'var(--on-surface)' },
    primary: { background: 'var(--primary)', color: 'var(--on-primary)' },
    danger: { background: 'var(--error)', color: 'var(--on-error)' },
    ghost: { background: 'transparent', color: 'var(--on-surface)' },
  };
  const v = styles[variant];
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        width: size, height: size,
        borderRadius: size * 0.32,
        border: 0, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...v,
        ...(color ? { color } : {}),
        ...(active ? { background: 'var(--primary-container)', color: 'var(--on-primary-container)' } : {}),
        transition: 'transform .12s ease, background .15s ease, filter .15s ease',
      }}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <Icon size={Math.round(size * 0.5)}/>
    </button>
  );
};

// ───── App-bar (large title, Material You) ─────
const TopBar = ({ title, action, lead, sub }) => (
  <div style={{
    padding: '20px 20px 12px',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {lead}
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{title}</div>
        {sub && <div style={{ fontSize: 14, color: 'var(--on-surface-variant)', marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
    <div style={{ display: 'flex', gap: 8 }}>{action}</div>
  </div>
);

// ───── Bottom sheet (drag handle, draggable height with snap points) ─────
const Sheet = ({ open = true, onClose, snap = ['min','mid','max'], initial = 'mid', children, peekHeight = 110, midHeight = 360, maxHeight = '78%', radius = 28, color = 'var(--surface-2)' }) => {
  const [pos, setPos] = React.useState(initial);
  // pos -> css height
  const heightFor = (p) => {
    if (p === 'min') return peekHeight;
    if (p === 'mid') return midHeight;
    return maxHeight;
  };

  const dragRef = React.useRef({ start: 0, h: 0, dragging: false });

  React.useEffect(() => { setPos(initial); }, [initial]);

  const onPointerDown = (e) => {
    dragRef.current.dragging = true;
    dragRef.current.start = e.clientY ?? e.touches?.[0]?.clientY;
    const el = e.currentTarget.parentElement;
    dragRef.current.h = el.getBoundingClientRect().height;
    el.style.transition = 'none';
  };
  const onPointerMove = (e) => {
    if (!dragRef.current.dragging) return;
    const y = e.clientY ?? e.touches?.[0]?.clientY;
    const dy = y - dragRef.current.start;
    const el = e.currentTarget.parentElement;
    const parentH = el.parentElement.getBoundingClientRect().height;
    const newH = Math.min(parentH * 0.88, Math.max(peekHeight, dragRef.current.h - dy));
    el.style.height = `${newH}px`;
  };
  const onPointerUp = (e) => {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;
    const el = e.currentTarget.parentElement;
    const parentH = el.parentElement.getBoundingClientRect().height;
    const h = el.getBoundingClientRect().height;
    // snap
    const minPx = peekHeight, midPx = midHeight, maxPx = parentH * 0.78;
    const distances = [['min', Math.abs(h - minPx)], ['mid', Math.abs(h - midPx)], ['max', Math.abs(h - maxPx)]];
    distances.sort((a, b) => a[1] - b[1]);
    const target = distances[0][0];
    el.style.transition = 'height .3s cubic-bezier(0.2,0.8,0.2,1)';
    el.style.height = '';
    setPos(target);
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      height: heightFor(pos),
      background: color,
      borderTopLeftRadius: radius,
      borderTopRightRadius: radius,
      boxShadow: '0 -8px 24px rgba(0,0,0,0.45)',
      transition: 'height .3s cubic-bezier(0.2,0.8,0.2,1)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      animation: 'slide-up .35s cubic-bezier(0.2,0.8,0.2,1) both',
    }}>
      <div
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
        style={{
          padding: '10px 0 4px',
          cursor: 'grab',
          display: 'flex', justifyContent: 'center', flexShrink: 0,
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--outline-strong)' }}/>
      </div>
      <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>
        {children}
      </div>
    </div>
  );
};

// ───── Helpers ─────
const fmtPct = (v) => `${Math.round(v * 100)}%`;

window.UI = {
  Avatar, BatteryBar, KindBadge, IconButton, TopBar, Sheet, tonalize, fmtPct,
};
