// Material-style line icons — 24px viewBox, stroke 1.8
// Kept simple; rounded line caps to match expressive style.
const _Icon = ({ children, size = 24, color = 'currentColor', stroke = 1.8, fill = 'none', style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={color}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    {children}
  </svg>
);

const Icons = {
  Search: (p) => <_Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></_Icon>,
  Map: (p) => <_Icon {...p}><path d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></_Icon>,
  Devices: (p) => <_Icon {...p}><rect x="3" y="5" width="13" height="11" rx="2"/><rect x="14" y="9" width="7" height="11" rx="1.5"/></_Icon>,
  People: (p) => <_Icon {...p}><circle cx="9" cy="9" r="3.4"/><path d="M3 19c1.2-3 3.6-4.5 6-4.5s4.8 1.5 6 4.5"/><circle cx="17" cy="8" r="2.6"/><path d="M16 14.5c1.4 0 3.2.6 4.2 1.9"/></_Icon>,
  Alerts: (p) => <_Icon {...p}><path d="M6 9a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 19a2 2 0 004 0"/></_Icon>,
  Add: (p) => <_Icon {...p}><path d="M12 5v14M5 12h14"/></_Icon>,
  Close: (p) => <_Icon {...p}><path d="M6 6l12 12M6 18L18 6"/></_Icon>,
  Back: (p) => <_Icon {...p}><path d="M14 6l-6 6 6 6"/></_Icon>,
  Chevron: (p) => <_Icon {...p}><path d="M9 6l6 6-6 6"/></_Icon>,
  More: (p) => <_Icon {...p} fill="currentColor" stroke="none"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></_Icon>,
  Phone: (p) => <_Icon {...p}><rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M10 18.5h4"/></_Icon>,
  Tablet: (p) => <_Icon {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="2.2"/><path d="M10 17.5h4"/></_Icon>,
  Watch: (p) => <_Icon {...p}><rect x="6" y="6" width="12" height="12" rx="3"/><path d="M9 6V3h6v3M9 18v3h6v-3"/></_Icon>,
  Earbuds: (p) => <_Icon {...p}><path d="M7 4a4 4 0 00-4 4v4c0 2 1.5 4 4 4 1.6 0 2.5-1 2.5-2.4V8C9.5 6 8.7 4 7 4z"/><path d="M17 4a4 4 0 014 4v4c0 2-1.5 4-4 4-1.6 0-2.5-1-2.5-2.4V8c0-2 .8-4 2.5-4z"/></_Icon>,
  Tag: (p) => <_Icon {...p}><path d="M12 3a4 4 0 014 4c0 3-4 7-4 7s-4-4-4-7a4 4 0 014-4z"/><circle cx="12" cy="7" r="1.4"/><path d="M9 17h6M9 20h6"/></_Icon>,
  Laptop: (p) => <_Icon {...p}><rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/></_Icon>,
  Bike: (p) => <_Icon {...p}><circle cx="6" cy="17" r="3.2"/><circle cx="18" cy="17" r="3.2"/><path d="M6 17l4-8h5l3 8M10 9l-1-3h-2"/></_Icon>,
  Ping: (p) => <_Icon {...p}><circle cx="12" cy="12" r="1.6" fill="currentColor"/><path d="M8.5 8.5a5 5 0 010 7M15.5 8.5a5 5 0 010 7M5.5 5.5a9 9 0 010 13M18.5 5.5a9 9 0 010 13"/></_Icon>,
  Sound: (p) => <_Icon {...p}><path d="M5 9.5v5h3.5l5 3.5v-12l-5 3.5H5z"/><path d="M16 9a4 4 0 010 6"/></_Icon>,
  Lock: (p) => <_Icon {...p}><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></_Icon>,
  Directions: (p) => <_Icon {...p}><path d="M12 2.5l9.5 9.5L12 21.5 2.5 12z"/><path d="M8 12h6v3l4-4-4-4v3H8v2z"/></_Icon>,
  Battery: (p) => <_Icon {...p}><rect x="3" y="7.5" width="16" height="9" rx="1.8"/><rect x="20" y="10" width="2" height="4" rx="0.5" fill="currentColor"/></_Icon>,
  Wifi: (p) => <_Icon {...p}><path d="M3.5 8.5a13 13 0 0117 0M6.5 12a9 9 0 0111 0M9.5 15.5a4 4 0 015 0"/><circle cx="12" cy="19" r="1.2" fill="currentColor"/></_Icon>,
  Bluetooth: (p) => <_Icon {...p}><path d="M7 7l10 10-5 4V3l5 4L7 17"/></_Icon>,
  Filter: (p) => <_Icon {...p}><path d="M4 5h16l-6 8v6l-4-2v-4z"/></_Icon>,
  Star: (p) => <_Icon {...p}><path d="M12 3l2.7 5.6L21 9.7l-4.5 4.4 1 6.2L12 17.6 6.5 20.3l1-6.2L3 9.7l6.3-1.1z"/></_Icon>,
  Home: (p) => <_Icon {...p}><path d="M4 11l8-7 8 7v9a1.5 1.5 0 01-1.5 1.5H5.5A1.5 1.5 0 014 20v-9z"/><path d="M10 21v-6h4v6"/></_Icon>,
  Briefcase: (p) => <_Icon {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2"/></_Icon>,
  Pin: (p) => <_Icon {...p}><path d="M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></_Icon>,
  Sliders: (p) => <_Icon {...p}><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></_Icon>,
  Share: (p) => <_Icon {...p}><circle cx="6" cy="12" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="18" cy="18" r="2.4"/><path d="M8.2 11l7.6-3.6M8.2 13l7.6 3.6"/></_Icon>,
  Check: (p) => <_Icon {...p}><path d="M5 12.5l4.5 4.5L19 7"/></_Icon>,
  Clock: (p) => <_Icon {...p}><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/></_Icon>,
  Eye: (p) => <_Icon {...p}><path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z"/><circle cx="12" cy="12" r="3"/></_Icon>,
  EyeOff: (p) => <_Icon {...p}><path d="M3 3l18 18"/><path d="M10.5 6.3A9.6 9.6 0 0112 6c6 0 9.5 7 9.5 7a16 16 0 01-3.6 4.3M6 7a16.6 16.6 0 00-3.5 5s3.5 7 9.5 7c1.5 0 2.8-.3 4-.8"/><path d="M14.1 14.1a3 3 0 01-4.2-4.2"/></_Icon>,
  Sparkle: (p) => <_Icon {...p}><path d="M12 4v4M12 16v4M4 12h4M16 12h4M6.3 6.3l2.5 2.5M15.2 15.2l2.5 2.5M6.3 17.7l2.5-2.5M15.2 8.8l2.5-2.5"/></_Icon>,
  Lightning: (p) => <_Icon {...p}><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></_Icon>,
  Settings: (p) => <_Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 01-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 01-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 012.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 012.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/></_Icon>,
  Trash: (p) => <_Icon {...p}><path d="M4 7h16M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2"/><path d="M6 7l1 13a2 2 0 002 2h6a2 2 0 002-2l1-13"/></_Icon>,
  Note: (p) => <_Icon {...p}><path d="M5 4h11l4 4v12a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z"/><path d="M8 12h8M8 16h6"/></_Icon>,
  Compass: (p) => <_Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5L14 14l-5.5 1.5L10 10z" fill="currentColor"/></_Icon>,
  Camera: (p) => <_Icon {...p}><path d="M4 8h3l2-2h6l2 2h3a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z"/><circle cx="12" cy="13" r="3.4"/></_Icon>,
  Qr: (p) => <_Icon {...p}><rect x="3.5" y="3.5" width="6" height="6" rx="1"/><rect x="14.5" y="3.5" width="6" height="6" rx="1"/><rect x="3.5" y="14.5" width="6" height="6" rx="1"/><path d="M14.5 14.5h3v3M20.5 14.5v6M14.5 20.5h3"/></_Icon>,
};

window.Icons = Icons;
