// Map.jsx — stylized abstract city map (custom SVG)
// Coordinates are in a 720x720 viewBox; device coords match.
// Renders water, parks, road grid, labels, then pins.

const MapView = ({ pins = [], selectedId, onSelect, focusCoords, onTap, dim = false }) => {
  const { Icons } = window;
  // device kind -> icon component
  const kindIcon = {
    phone: Icons.Phone, tablet: Icons.Tablet, watch: Icons.Watch,
    buds: Icons.Earbuds, tag: Icons.Tag, laptop: Icons.Laptop,
    bike: Icons.Bike,
  };

  // Group pins by approximate cluster (round to nearest 30px)
  const clusters = React.useMemo(() => {
    const map = new Map();
    pins.forEach(p => {
      const cx = Math.round(p.coords[0] / 30) * 30;
      const cy = Math.round(p.coords[1] / 30) * 30;
      const k = `${cx}:${cy}`;
      if (!map.has(k)) map.set(k, { x: cx, y: cy, items: [] });
      map.get(k).items.push(p);
    });
    return [...map.values()];
  }, [pins]);

  return (
    <div
      onClick={onTap}
      style={{
        position: 'absolute', inset: 0,
        background: 'var(--map-bg)',
        overflow: 'hidden',
      }}
    >
      <svg viewBox="0 0 720 720" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {/* Subtle grid */}
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="var(--map-grid)" strokeWidth="1"/>
          </pattern>
          <linearGradient id="water" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#0a1828"/>
            <stop offset="100%" stopColor="#0a1220"/>
          </linearGradient>
          <radialGradient id="vignette" cx="50%" cy="50%" r="65%">
            <stop offset="60%" stopColor="rgba(0,0,0,0)"/>
            <stop offset="100%" stopColor="rgba(0,0,0,0.55)"/>
          </radialGradient>
        </defs>

        {/* Land base */}
        <rect width="720" height="720" fill="var(--map-land)"/>
        <rect width="720" height="720" fill="url(#grid)"/>

        {/* Water: river running diagonally */}
        <path d="M -40 540 C 160 480, 360 600, 560 520 S 760 480, 800 500 L 800 720 L -40 720 Z"
              fill="url(#water)"/>
        <path d="M -40 540 C 160 480, 360 600, 560 520 S 760 480, 800 500"
              fill="none" stroke="rgba(124,196,255,0.08)" strokeWidth="1.5"/>

        {/* Parks */}
        <g fill="var(--map-park)">
          <path d="M 440 430 C 440 400, 510 395, 540 410 S 600 450, 580 490 540 530, 490 510 440 470, 440 430 Z"/>
          <circle cx="180" cy="120" r="48"/>
          <rect x="60" y="600" width="120" height="80" rx="22"/>
        </g>

        {/* Road grid — major roads */}
        <g stroke="var(--map-road-major)" strokeWidth="9" strokeLinecap="round" fill="none">
          <path d="M 0 200 H 720"/>
          <path d="M 0 360 H 720"/>
          <path d="M 240 0 V 720"/>
          <path d="M 460 0 V 540"/>
        </g>
        {/* Minor roads */}
        <g stroke="var(--map-road)" strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M 0 90 H 720"/>
          <path d="M 0 280 H 720"/>
          <path d="M 0 440 H 460"/>
          <path d="M 120 0 V 540"/>
          <path d="M 360 0 V 720"/>
          <path d="M 580 0 V 540"/>
          <path d="M 660 0 V 540"/>
          <path d="M 60 130 L 220 200"/>
          <path d="M 510 380 L 640 470"/>
        </g>
        {/* Road centerlines */}
        <g stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="8 10" fill="none">
          <path d="M 0 200 H 720"/>
          <path d="M 0 360 H 720"/>
          <path d="M 240 0 V 720"/>
          <path d="M 460 0 V 540"/>
        </g>

        {/* Building blocks (very subtle) */}
        <g fill="rgba(255,255,255,0.02)">
          <rect x="270" y="220" width="80" height="50" rx="6"/>
          <rect x="370" y="220" width="80" height="50" rx="6"/>
          <rect x="270" y="290" width="80" height="60" rx="6"/>
          <rect x="370" y="290" width="80" height="60" rx="6"/>
          <rect x="500" y="220" width="60" height="50" rx="6"/>
          <rect x="500" y="290" width="60" height="60" rx="6"/>
          <rect x="600" y="220" width="50" height="50" rx="6"/>
          <rect x="40" y="240" width="60" height="40" rx="6"/>
          <rect x="40" y="300" width="60" height="40" rx="6"/>
        </g>

        {/* Area labels */}
        <g fill="rgba(255,255,255,0.22)" fontFamily="var(--font-sans)" fontSize="13" fontWeight="500" letterSpacing="2.5">
          <text x="60" y="80" style={{ textTransform: 'uppercase' }}>NORTH HARBOR</text>
          <text x="300" y="140" style={{ textTransform: 'uppercase' }}>MIDTOWN</text>
          <text x="525" y="140" style={{ textTransform: 'uppercase' }}>WESTBROOK</text>
          <text x="60" y="500" style={{ textTransform: 'uppercase' }}>RIVERLINE</text>
          <text x="465" y="595" style={{ textTransform: 'uppercase' }}>EASTSIDE</text>
        </g>
        <g fill="rgba(135,224,169,0.55)" fontFamily="var(--font-sans)" fontSize="11" fontWeight="500" letterSpacing="1.5">
          <text x="448" y="470" style={{ textTransform: 'uppercase' }}>EASTSIDE PARK</text>
        </g>

        {/* Vignette */}
        <rect width="720" height="720" fill="url(#vignette)" pointerEvents="none"/>
      </svg>

      {/* Pins layer — HTML for crisp icons & interaction */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {clusters.map(cluster => {
          // Position pin by % of 720 since SVG is preserveAspectRatio="slice"
          const lead = cluster.items[0];
          // For clusters with multiple items, render the first big and stack chips below
          return (
            <div key={`${cluster.x}-${cluster.y}`} style={{
              position: 'absolute',
              left: `${(cluster.x / 720) * 100}%`,
              top: `${(cluster.y / 720) * 100}%`,
              transform: 'translate(-50%, -100%)',
              pointerEvents: 'auto',
            }}>
              <MapPin
                pin={lead}
                count={cluster.items.length}
                selected={selectedId === lead.id || cluster.items.some(i => i.id === selectedId)}
                onClick={(e) => { e.stopPropagation(); onSelect && onSelect(lead.id); }}
                kindIcon={kindIcon}
              />
            </div>
          );
        })}
      </div>

      {dim && <div style={{ position: 'absolute', inset: 0, background: 'rgba(7,9,13,0.55)', pointerEvents: 'none' }}/>}
    </div>
  );
};

const MapPin = ({ pin, count = 1, selected, onClick, kindIcon }) => {
  const { PINPOINT_DATA } = window;
  const owner = PINPOINT_DATA.PEOPLE.find(p => p.id === pin.owner);
  const isPerson = pin.kind === 'phone' && owner && owner.id !== 'me';
  const isMe = owner && owner.id === 'me' && pin.kind === 'phone';
  const Icon = kindIcon[pin.kind] || kindIcon.tag;

  // Color scheme: person pins use owner color; tag pins use their own color
  const accent = pin.color || (owner ? owner.color : '#7cc4ff');

  // Style: rounded squircle holder w/ stem
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        cursor: 'pointer',
        animation: 'fade-in .4s ease both',
        filter: selected ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.55))' : 'drop-shadow(0 6px 12px rgba(0,0,0,0.45))',
        transform: selected ? 'scale(1.08)' : 'scale(1)',
        transition: 'transform .18s ease',
      }}
    >
      {/* sonar ring for live / "now" pins */}
      {pin.status === 'now' && (
        <div style={{
          position: 'absolute', left: '50%', top: 18,
          width: 20, height: 20, borderRadius: '50%',
          background: accent, opacity: 0.45,
          transform: 'translate(-50%, -50%)',
          animation: 'sonar 2.4s ease-out infinite',
          pointerEvents: 'none',
        }}/>
      )}

      {/* head */}
      <div style={{
        width: 44, height: 44,
        borderRadius: 14,
        background: isPerson ? accent : 'var(--surface-2)',
        border: selected ? `2px solid ${accent}` : `2px solid ${accent === '#7cc4ff' ? '#7cc4ff' : accent}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: isPerson ? '#0b1422' : accent,
        position: 'relative',
        boxShadow: '0 2px 0 rgba(0,0,0,0.4)',
      }}>
        {isPerson ? (
          <span style={{ fontWeight: 700, fontSize: 14, color: '#0b1422' }}>{owner.initials}</span>
        ) : (
          <Icon size={22} color={accent}/>
        )}
        {pin.lowBattery && (
          <div style={{
            position: 'absolute', top: -4, right: -4,
            width: 14, height: 14, borderRadius: '50%',
            background: 'var(--error)', border: '2px solid var(--map-bg)',
          }}/>
        )}
        {pin.offline && (
          <div style={{
            position: 'absolute', top: -4, right: -4,
            width: 14, height: 14, borderRadius: '50%',
            background: 'var(--surface-5)', border: '2px solid var(--map-bg)',
          }}/>
        )}
        {count > 1 && (
          <div style={{
            position: 'absolute', bottom: -6, right: -6,
            minWidth: 18, height: 18, padding: '0 5px',
            borderRadius: 9,
            background: 'var(--surface-1)',
            border: '2px solid var(--map-bg)',
            color: 'var(--on-surface)',
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>+{count - 1}</div>
        )}
      </div>
      {/* stem */}
      <div style={{
        width: 0, height: 0,
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
        borderTop: `8px solid ${isPerson ? accent : accent}`,
        marginTop: -1,
      }}/>
    </div>
  );
};

window.MapView = MapView;
