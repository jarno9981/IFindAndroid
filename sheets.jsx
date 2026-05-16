// Sheet overlays: DeviceDetail, AddDevice, PlaySound, MarkLost
const { Icons, UI, PINPOINT_DATA } = window;
const { Avatar, BatteryBar, KindBadge, IconButton, Sheet, tonalize, fmtPct } = UI;
const { PEOPLE, DEVICES } = PINPOINT_DATA;

// ════════════════════════════════════════════════════════════════
// DEVICE DETAIL SHEET — shown when a pin is tapped on the map
// ════════════════════════════════════════════════════════════════
const DeviceDetailSheet = ({ deviceId, onClose, onPlaySound, onMarkLost }) => {
  const d = DEVICES.find(x => x.id === deviceId);
  if (!d) return null;
  const owner = PEOPLE.find(p => p.id === d.owner);
  const accent = d.color || (owner ? owner.color : '#7cc4ff');
  const accentHex = accent.startsWith('#') ? accent : '#7cc4ff';

  return (
    <Sheet
      peekHeight={120}
      midHeight={460}
      maxHeight="86%"
      initial="mid"
      color="var(--surface-2)"
    >
      <div style={{ padding: '0 20px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 16 }}>
          <KindBadge kind={d.kind} color={accentHex} size={56}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
              {d.name}
              {d.status === 'now' && <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 8, background: tonalize(accentHex, 0.2), color: accentHex, fontWeight: 700 }}>LIVE</span>}
            </div>
            <div style={{ fontSize: 14, color: 'var(--on-surface-variant)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              {owner && owner.id !== 'me' && (
                <>
                  <Avatar person={owner} size={18}/>
                  <span>{owner.name}</span>
                  <span>\u00B7</span>
                </>
              )}
              <span>{d.loc}{d.room ? `, ${d.room}` : ''}</span>
            </div>
          </div>
          <IconButton icon={Icons.Close} variant="surface" label="Close" onClick={onClose}/>
        </div>

        {/* Distance / live status hero */}
        <div style={{
          background: `linear-gradient(135deg, ${tonalize(accentHex, 0.18)}, ${tonalize(accentHex, 0.06)})`,
          border: `1px solid ${tonalize(accentHex, 0.32)}`,
          borderRadius: 24,
          padding: 18,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{ position: 'relative', width: 56, height: 56 }}>
            <div style={{
              position: 'absolute', inset: 0,
              borderRadius: '50%', background: tonalize(accentHex, 0.18),
              animation: 'sonar 2.4s ease-out infinite',
            }}/>
            <div style={{
              position: 'absolute', inset: 12,
              borderRadius: '50%', background: accentHex,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icons.Ping size={20} color="#0b1422"/>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--on-surface)' }}>
              {d.status === 'now' ? '0.4 mi' : 'Last seen'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 2 }}>
              {d.status === 'now' ? `Updated ${d.status === 'now' ? 'just now' : d.status + ' ago'} \u00B7 \u00B112 ft` : `${d.status} ago`}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 16 }}>
          <ActionTile icon={Icons.Directions} label="Directions" color="var(--primary)"/>
          <ActionTile icon={Icons.Sound}      label="Play sound" color={accentHex} onClick={onPlaySound}/>
          <ActionTile icon={Icons.Lock}       label="Mark lost"  color="var(--tertiary)" onClick={onMarkLost}/>
          <ActionTile icon={Icons.Share}      label="Share"      color="var(--secondary)"/>
        </div>

        {/* Stats card */}
        <div style={{
          background: 'var(--surface-3)',
          borderRadius: 24,
          padding: 4,
          marginTop: 16,
        }}>
          <StatsRow label="Battery" value={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BatteryBar value={d.battery} width={60}/>
              <span style={{ fontWeight: 600, color: d.battery < 0.25 ? 'var(--error)' : 'var(--on-surface)' }}>{fmtPct(d.battery)}</span>
            </div>
          } icon={Icons.Battery}/>
          <Divider/>
          <StatsRow label="Connection" value={d.offline ? 'Offline' : 'Bluetooth + Wi-Fi'} icon={d.offline ? Icons.EyeOff : Icons.Bluetooth}/>
          <Divider/>
          <StatsRow label="Last seen" value={d.status === 'now' ? 'Now' : `${d.status} ago`} icon={Icons.Clock}/>
          <Divider/>
          <StatsRow label="Sharing" value={owner && owner.id === 'me' ? 'With family (4)' : `${owner.name}`} icon={Icons.People}/>
        </div>

        {/* Notify when */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)', letterSpacing: 1.4, textTransform: 'uppercase', padding: '4px 4px 10px' }}>Notify me</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <NotifyRow icon={Icons.Home} text="When it arrives at Home" enabled={true}/>
            <NotifyRow icon={Icons.Briefcase} text="When it leaves Office" enabled={false}/>
            <NotifyRow icon={Icons.Sparkle} text="When found by someone else" enabled={true} accent="tertiary"/>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ marginTop: 22, display: 'flex', gap: 10 }}>
          <button className="btn tonal block lg">View timeline</button>
          <button className="btn ghost lg" style={{ color: 'var(--error)' }}>Remove</button>
        </div>
      </div>
    </Sheet>
  );
};

const ActionTile = ({ icon: Icon, label, color, onClick }) => {
  const hex = color.startsWith('#') ? color : ({
    'var(--primary)': '#7cc4ff', 'var(--secondary)': '#b8a4ff', 'var(--tertiary)': '#ffb787',
  }[color] || '#7cc4ff');
  return (
    <button
      onClick={onClick}
      style={{
        background: tonalize(hex, 0.14),
        border: 0, cursor: 'pointer',
        borderRadius: 20,
        padding: '14px 6px',
        color: hex,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        transition: 'background .15s ease, transform .15s ease',
      }}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <Icon size={22} color={hex}/>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--on-surface)' }}>{label}</span>
    </button>
  );
};

const StatsRow = ({ icon: Icon, label, value }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '14px 16px',
  }}>
    <div style={{
      width: 34, height: 34, borderRadius: 11,
      background: 'var(--surface-4)',
      color: 'var(--on-surface-variant)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={17} color="var(--on-surface-variant)"/>
    </div>
    <div style={{ flex: 1, fontSize: 14, color: 'var(--on-surface-variant)' }}>{label}</div>
    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--on-surface)' }}>{value}</div>
  </div>
);

const Divider = () => <div style={{ height: 1, background: 'var(--surface-4)', margin: '0 16px' }}/>;

const NotifyRow = ({ icon: Icon, text, enabled, accent = 'primary' }) => {
  const [on, setOn] = React.useState(enabled);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'var(--surface-3)', borderRadius: 16, padding: '12px 14px',
      cursor: 'pointer',
    }}
      onClick={() => setOn(!on)}
    >
      <Icon size={18} color="var(--on-surface-variant)"/>
      <div style={{ flex: 1, fontSize: 14 }}>{text}</div>
      <Switch on={on}/>
    </div>
  );
};

const Switch = ({ on }) => (
  <div style={{
    width: 46, height: 26, borderRadius: 13,
    background: on ? 'var(--primary)' : 'var(--surface-5)',
    position: 'relative',
    transition: 'background .2s ease',
  }}>
    <div style={{
      position: 'absolute', top: 3, left: on ? 23 : 3,
      width: 20, height: 20, borderRadius: '50%',
      background: on ? '#0b1422' : 'var(--on-surface-variant)',
      transition: 'left .25s cubic-bezier(0.2,0.8,0.2,1)',
    }}/>
  </div>
);

// ════════════════════════════════════════════════════════════════
// PLAY SOUND OVERLAY — full screen sonar
// ════════════════════════════════════════════════════════════════
const PlaySoundOverlay = ({ deviceId, onClose }) => {
  const d = DEVICES.find(x => x.id === deviceId);
  const owner = d ? PEOPLE.find(p => p.id === d.owner) : null;
  const accent = d?.color || (owner?.color) || '#7cc4ff';
  const [stage, setStage] = React.useState('playing'); // playing | stopping
  const [seconds, setSeconds] = React.useState(0);

  React.useEffect(() => {
    if (stage !== 'playing') return;
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [stage]);

  if (!d) return null;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at center top, rgba(7,9,13,0.92), rgba(7,9,13,0.98))',
      backdropFilter: 'blur(20px)',
      zIndex: 10,
      display: 'flex', flexDirection: 'column',
      animation: 'fade-in .25s ease both',
    }}>
      <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between' }}>
        <IconButton icon={Icons.Back} variant="surface" onClick={onClose} label="Back"/>
        <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', alignSelf: 'center', fontWeight: 600, letterSpacing: 1.4, textTransform: 'uppercase' }}>Playing sound</div>
        <IconButton icon={Icons.More} variant="surface" label="More"/>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {/* Sonar rings */}
        <div style={{ position: 'relative', width: 220, height: 220 }}>
          {[0, 0.7, 1.4].map((delay, i) => (
            <div key={i} style={{
              position: 'absolute', left: '50%', top: '50%',
              width: 40, height: 40, borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              background: tonalize(accent, 0.5),
              animation: `sonar 2.4s ease-out infinite`,
              animationDelay: `${delay}s`,
              opacity: 0.6,
            }}/>
          ))}
          <div style={{
            position: 'absolute', left: '50%', top: '50%',
            width: 96, height: 96,
            transform: 'translate(-50%, -50%)',
            borderRadius: 28,
            background: accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'bob 1.4s ease-in-out infinite',
            boxShadow: `0 12px 32px ${tonalize(accent, 0.5)}`,
          }}>
            <Icons.Sound size={42} color="#0b1422"/>
          </div>
        </div>

        <div style={{ marginTop: 36, textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: 'var(--on-surface-variant)', fontWeight: 600, letterSpacing: 1.4, textTransform: 'uppercase' }}>Searching</div>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 8 }}>{d.name}</div>
          <div style={{ fontSize: 15, color: 'var(--on-surface-variant)', marginTop: 4 }}>
            {d.loc}{d.room ? ` \u00B7 ${d.room}` : ''}
          </div>
          <div className="mono" style={{ fontSize: 13, color: 'var(--on-surface-muted)', marginTop: 18 }}>
            {String(Math.floor(seconds / 60)).padStart(2,'0')}:{String(seconds % 60).padStart(2,'0')}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px 28px' }}>
        <button
          onClick={onClose}
          className="btn xl block"
          style={{ background: 'var(--surface-3)', color: 'var(--on-surface)' }}
        >Stop sound</button>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14 }}>
          <button className="btn ghost" style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>Vibrate only</button>
          <span style={{ color: 'var(--outline-strong)' }}>\u00B7</span>
          <button className="btn ghost" style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>Find with camera</button>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// MARK AS LOST FLOW — step sheet
// ════════════════════════════════════════════════════════════════
const MarkLostSheet = ({ deviceId, onClose, onConfirm }) => {
  const d = DEVICES.find(x => x.id === deviceId);
  const [step, setStep] = React.useState(0); // 0 = info, 1 = contact, 2 = confirm
  const [contact, setContact] = React.useState('+1 (555) 014-2208');
  const [message, setMessage] = React.useState('This device is lost. Please call the number below.');

  if (!d) return null;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(7,9,13,0.7)',
      backdropFilter: 'blur(8px)',
      zIndex: 9,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      animation: 'fade-in .2s ease both',
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--surface-2)',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '14px 20px 24px',
        animation: 'slide-up .35s cubic-bezier(0.2,0.8,0.2,1) both',
        maxHeight: '90%', overflow: 'auto',
      }} className="no-scrollbar">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--outline-strong)' }}/>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i <= step ? 'var(--primary)' : 'var(--surface-4)',
              transition: 'background .25s ease',
            }}/>
          ))}
        </div>

        {step === 0 && (
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <div style={{ width: 52, height: 52, borderRadius: 17, background: tonalize('#ffb787', 0.18), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icons.Lock size={26} color="var(--tertiary)"/>
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Mark as lost</div>
                <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 2 }}>{d.name}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <FactRow icon={Icons.Lock}     title="Lock the device"          body="Requires your PIN to unlock and disables payments."/>
              <FactRow icon={Icons.Note}     title="Show a custom message"   body="A note appears on the lock screen with your contact info."/>
              <FactRow icon={Icons.Sparkle}  title="Get found notifications" body="We\u2019ll alert you when it\u2019s seen on the Find network."/>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={onClose} className="btn tonal block lg">Cancel</button>
              <button onClick={() => setStep(1)} className="btn primary block lg">Continue</button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="fade-in">
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Contact info</div>
            <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 18 }}>Shown on the lock screen for whoever finds it.</div>

            <FieldLabel>Phone number</FieldLabel>
            <TextField value={contact} onChange={setContact}/>

            <div style={{ height: 14 }}/>
            <FieldLabel>Message</FieldLabel>
            <TextArea value={message} onChange={setMessage}/>

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={() => setStep(0)} className="btn tonal block lg">Back</button>
              <button onClick={() => setStep(2)} className="btn primary block lg">Review</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fade-in">
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 14 }}>Looks good?</div>
            {/* Lock-screen preview */}
            <div style={{
              background: 'linear-gradient(160deg, #0a1828 0%, #1a1230 100%)',
              borderRadius: 24,
              padding: 22,
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid var(--outline)',
            }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', letterSpacing: 1.4, textTransform: 'uppercase', fontWeight: 600 }}>Lost device</div>
              <div style={{ fontSize: 64, fontWeight: 300, color: 'rgba(255,255,255,0.95)', lineHeight: 1, marginTop: 6, letterSpacing: '-0.04em' }}>9:30</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Mon, Sep 23</div>
              <div style={{ marginTop: 22, padding: 14, background: 'rgba(255,255,255,0.08)', borderRadius: 16, backdropFilter: 'blur(4px)' }}>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.95)', lineHeight: 1.45 }}>{message}</div>
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icons.Phone size={14} color="rgba(255,255,255,0.85)"/>
                  <span style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 600, fontSize: 14 }}>{contact}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={() => setStep(1)} className="btn tonal block lg">Edit</button>
              <button onClick={onConfirm} className="btn block lg" style={{ background: 'var(--tertiary)', color: 'var(--on-tertiary)' }}>Activate Lost mode</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FactRow = ({ icon: Icon, title, body }) => (
  <div style={{ display: 'flex', gap: 12, padding: '12px 14px', background: 'var(--surface-3)', borderRadius: 16 }}>
    <div style={{ width: 36, height: 36, borderRadius: 11, background: 'var(--surface-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={18} color="var(--on-surface-variant)"/>
    </div>
    <div>
      <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: 'var(--on-surface-variant)', marginTop: 2, lineHeight: 1.4 }}>{body}</div>
    </div>
  </div>
);

const FieldLabel = ({ children }) => (
  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>{children}</div>
);

const TextField = ({ value, onChange }) => (
  <div style={{
    background: 'var(--surface-3)', borderRadius: 16,
    padding: '14px 16px', border: '1px solid var(--outline)',
  }}>
    <input value={value} onChange={e => onChange(e.target.value)} style={{
      width: '100%', background: 'transparent', border: 0, outline: 0,
      color: 'var(--on-surface)', fontFamily: 'inherit', fontSize: 15,
    }}/>
  </div>
);

const TextArea = ({ value, onChange }) => (
  <div style={{
    background: 'var(--surface-3)', borderRadius: 16,
    padding: '14px 16px', border: '1px solid var(--outline)',
  }}>
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} style={{
      width: '100%', background: 'transparent', border: 0, outline: 0, resize: 'none',
      color: 'var(--on-surface)', fontFamily: 'inherit', fontSize: 15, lineHeight: 1.45,
    }}/>
  </div>
);

// ════════════════════════════════════════════════════════════════
// ADD DEVICE FLOW
// ════════════════════════════════════════════════════════════════
const AddDeviceSheet = ({ onClose, onAdded }) => {
  const [step, setStep] = React.useState(0); // 0 = pick type, 1 = scanning, 2 = name
  const [kind, setKind] = React.useState(null);
  const [name, setName] = React.useState('');

  // auto-progress when scanning
  React.useEffect(() => {
    if (step === 1) {
      const t = setTimeout(() => {
        setName(suggestedName(kind));
        setStep(2);
      }, 2400);
      return () => clearTimeout(t);
    }
  }, [step, kind]);

  const types = [
    { id: 'phone',  label: 'Phone',     color: '#7cc4ff', icon: Icons.Phone },
    { id: 'watch',  label: 'Watch',     color: '#b8a4ff', icon: Icons.Watch },
    { id: 'buds',   label: 'Earbuds',   color: '#ffb787', icon: Icons.Earbuds },
    { id: 'tablet', label: 'Tablet',    color: '#87e0a9', icon: Icons.Tablet },
    { id: 'tag',    label: 'Tag',       color: '#ff9ed1', icon: Icons.Tag },
    { id: 'laptop', label: 'Laptop',    color: '#7cc4ff', icon: Icons.Laptop },
  ];

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(7,9,13,0.7)',
      backdropFilter: 'blur(8px)',
      zIndex: 9,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      animation: 'fade-in .2s ease both',
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--surface-2)',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '14px 20px 24px',
        animation: 'slide-up .35s cubic-bezier(0.2,0.8,0.2,1) both',
        maxHeight: '92%', overflow: 'auto',
      }} className="no-scrollbar">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--outline-strong)' }}/>
        </div>

        {step === 0 && (
          <div className="fade-in">
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>Add a device</div>
            <div style={{ fontSize: 14, color: 'var(--on-surface-variant)', marginTop: 4, marginBottom: 18 }}>What are you setting up?</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {types.map(t => (
                <button key={t.id}
                  onClick={() => { setKind(t.id); setStep(1); }}
                  style={{
                    background: tonalize(t.color, 0.12),
                    border: `1px solid ${tonalize(t.color, 0.25)}`,
                    borderRadius: 22,
                    padding: '18px 8px 14px',
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                    color: t.color,
                    transition: 'transform .15s ease, background .15s ease',
                  }}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <t.icon size={28} color={t.color}/>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface)' }}>{t.label}</div>
                </button>
              ))}
            </div>
            <div style={{
              marginTop: 16, padding: 14,
              background: 'var(--surface-3)', borderRadius: 18,
              display: 'flex', alignItems: 'center', gap: 12,
              cursor: 'pointer',
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 13, background: 'var(--surface-4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icons.Qr size={20} color="var(--on-surface-variant)"/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>Scan a QR code</div>
                <div style={{ fontSize: 12.5, color: 'var(--on-surface-variant)' }}>Found on packaging or device screen</div>
              </div>
              <Icons.Chevron size={18} color="var(--on-surface-muted)"/>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 20px 8px' }}>
            <div style={{ position: 'relative', width: 200, height: 200 }}>
              {[0, 0.6, 1.2].map((d, i) => (
                <div key={i} style={{
                  position: 'absolute', left: '50%', top: '50%',
                  width: 60, height: 60, borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: tonalize('#7cc4ff', 0.35),
                  animation: 'sonar 2.4s ease-out infinite', animationDelay: `${d}s`,
                }}/>
              ))}
              <div style={{
                position: 'absolute', left: '50%', top: '50%',
                width: 88, height: 88, borderRadius: 24,
                transform: 'translate(-50%, -50%)',
                background: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 12px 32px ${tonalize('#7cc4ff', 0.4)}`,
              }}>
                <Icons.Bluetooth size={38} color="#0b1422"/>
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 28 }}>Looking nearby\u2026</div>
            <div style={{ fontSize: 14, color: 'var(--on-surface-variant)', marginTop: 6, textAlign: 'center', maxWidth: 280 }}>
              Hold your device close. Press and hold its button until the light blinks.
            </div>
            <button onClick={onClose} className="btn ghost lg" style={{ marginTop: 24, color: 'var(--on-surface-variant)' }}>Cancel</button>
          </div>
        )}

        {step === 2 && (
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <KindBadge kind={kind} color="#7cc4ff" size={56}/>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Found it</div>
                <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 2 }}>Give it a name to recognize it.</div>
              </div>
            </div>
            <FieldLabel>Name</FieldLabel>
            <TextField value={name} onChange={setName}/>
            <div style={{ height: 16 }}/>
            <FieldLabel>Use case</FieldLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['Keys','Backpack','Wallet','Bike','Pet','Luggage','Custom'].map(t => (
                <div key={t} className="chip" style={{ cursor: 'pointer' }}>{t}</div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={onClose} className="btn tonal block lg">Cancel</button>
              <button onClick={() => onAdded({ kind, name })} className="btn primary block lg">Add</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const suggestedName = (kind) => ({
  phone: 'My phone', watch: 'My watch', buds: 'My earbuds',
  tablet: 'My tablet', tag: 'New Tag', laptop: 'My laptop'
})[kind] || 'New device';

window.Sheets = { DeviceDetailSheet, PlaySoundOverlay, MarkLostSheet, AddDeviceSheet };
