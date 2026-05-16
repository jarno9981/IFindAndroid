// App.jsx — main App with tab routing, search, sheets, tweaks

const { Icons, UI, Screens, Sheets, PINPOINT_DATA } = window;
const { Avatar, IconButton, tonalize } = UI;
const { MapScreen, DevicesScreen, PeopleScreen, AlertsScreen } = Screens;
const { DeviceDetailSheet, PlaySoundOverlay, MarkLostSheet, AddDeviceSheet } = Sheets;
const { ALERTS } = PINPOINT_DATA;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#7cc4ff",
  "density": "comfy"
}/*EDITMODE-END*/;

const accentPresets = {
  '#7cc4ff': { onPrimary: '#00324f', container: '#1a4870', onContainer: '#d3e8ff' },
  '#b8a4ff': { onPrimary: '#2a1668', container: '#3a2f6b', onContainer: '#e6dcff' },
  '#ffb787': { onPrimary: '#4a2300', container: '#5e3a1f', onContainer: '#ffe0c8' },
  '#87e0a9': { onPrimary: '#06351b', container: '#1b4a30', onContainer: '#c8f4d9' },
};

const App = () => {
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  const [tab, setTab] = React.useState('map');
  const [selectedId, setSelectedId] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [showAdd, setShowAdd] = React.useState(false);
  const [playSound, setPlaySound] = React.useState(null);
  const [markLost, setMarkLost] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  const [alertsState, setAlertsState] = React.useState(ALERTS);

  // Apply accent CSS vars at runtime
  React.useLayoutEffect(() => {
    const preset = accentPresets[tweaks.accent] || accentPresets['#7cc4ff'];
    const r = document.documentElement;
    r.style.setProperty('--primary', tweaks.accent || '#7cc4ff');
    r.style.setProperty('--on-primary', preset.onPrimary);
    r.style.setProperty('--primary-container', preset.container);
    r.style.setProperty('--on-primary-container', preset.onContainer);
  }, [tweaks.accent]);

  const dropToast = (text, icon) => {
    setToast({ text, icon });
    setTimeout(() => setToast(null), 2400);
  };

  // Tab content
  let content;
  if (tab === 'map') {
    content = (
      <MapScreen
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        search={search}
        setSearch={setSearch}
        onOpenAdd={() => setShowAdd(true)}
        density={tweaks.density}
      />
    );
  } else if (tab === 'devices') {
    content = <DevicesScreen setSelectedId={setSelectedId} setTab={setTab} search={search} setSearch={setSearch} density={tweaks.density}/>;
  } else if (tab === 'people') {
    content = <PeopleScreen setSelectedId={setSelectedId} setTab={setTab}/>;
  } else if (tab === 'alerts') {
    content = <AlertsScreen alertsState={alertsState} setAlertsState={setAlertsState}/>;
  }

  const unread = alertsState.filter(a => !a.read).length;

  const appInner = (
    <div className="app">
      {/* Tab content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        {content}

        {/* Device detail (only over the map) */}
        {tab === 'map' && selectedId && (
          <DeviceDetailSheet
            deviceId={selectedId}
            onClose={() => setSelectedId(null)}
            onPlaySound={() => setPlaySound(selectedId)}
            onMarkLost={() => setMarkLost(selectedId)}
          />
        )}
      </div>

      {/* Bottom nav */}
      <BottomNav tab={tab} setTab={(t) => { setTab(t); setSelectedId(null); }} unread={unread}/>

      {/* Overlays */}
      {showAdd && <AddDeviceSheet onClose={() => setShowAdd(false)} onAdded={({ name }) => { setShowAdd(false); dropToast(`${name} added`, Icons.Check); }}/>}
      {playSound && <PlaySoundOverlay deviceId={playSound} onClose={() => setPlaySound(null)}/>}
      {markLost && <MarkLostSheet deviceId={markLost} onClose={() => setMarkLost(null)} onConfirm={() => { setMarkLost(null); dropToast('Lost mode activated', Icons.Lock); }}/>}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'absolute', left: 20, right: 20, bottom: 120,
          background: 'var(--surface-5)',
          color: 'var(--on-surface)',
          borderRadius: 18, padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: 'var(--shadow-pop)',
          animation: 'fade-in .2s ease both',
          zIndex: 20,
        }}>
          {toast.icon && <toast.icon size={20} color="var(--primary)"/>}
          <span style={{ fontWeight: 500 }}>{toast.text}</span>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="stage">
        <window.AndroidDevice dark={true}>
          {appInner}
        </window.AndroidDevice>
      </div>

      <PinpointTweaks tweaks={tweaks} setTweak={setTweak}/>
    </>
  );
};

// ───── Bottom navigation (Material You expressive) ─────
const BottomNav = ({ tab, setTab, unread }) => {
  const items = [
    { id: 'map',     label: 'Map',     icon: Icons.Map },
    { id: 'devices', label: 'Devices', icon: Icons.Devices },
    { id: 'people',  label: 'People',  icon: Icons.People },
    { id: 'alerts',  label: 'Alerts',  icon: Icons.Alerts, badge: unread > 0 ? unread : null },
  ];
  return (
    <div style={{
      background: 'var(--surface-2)',
      borderTop: '1px solid var(--outline)',
      display: 'flex',
      padding: '8px 8px 4px',
      gap: 4,
      flexShrink: 0,
    }}>
      {items.map(it => {
        const active = tab === it.id;
        return (
          <button key={it.id} onClick={() => setTab(it.id)} style={{
            flex: 1, background: 'transparent', border: 0, cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '6px 0 8px',
            color: active ? 'var(--on-primary-container)' : 'var(--on-surface-variant)',
          }}>
            <div style={{
              padding: '6px 18px',
              borderRadius: 14,
              background: active ? 'var(--primary-container)' : 'transparent',
              transition: 'background .25s cubic-bezier(0.2,0.8,0.2,1)',
              position: 'relative',
            }}>
              <it.icon size={22} stroke={active ? 2.2 : 1.8}/>
              {it.badge && (
                <div style={{
                  position: 'absolute', top: 2, right: 6,
                  minWidth: 16, height: 16, padding: '0 4px',
                  borderRadius: 8,
                  background: 'var(--error)', color: 'var(--on-error)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800,
                  border: '2px solid var(--surface-2)',
                }}>{it.badge}</div>
              )}
            </div>
            <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, letterSpacing: 0.1 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// ───── Tweaks Panel ─────
const PinpointTweaks = ({ tweaks, setTweak }) => {
  const { TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakToggle } = window;
  if (!TweaksPanel) return null;
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Theme">
        <TweakColor
          label="Accent"
          value={tweaks.accent}
          onChange={(v) => setTweak('accent', v)}
          options={['#7cc4ff', '#b8a4ff', '#ffb787', '#87e0a9']}
        />
      </TweakSection>
      <TweakSection label="Layout">
        <TweakRadio
          label="Density"
          value={tweaks.density}
          onChange={(v) => setTweak('density', v)}
          options={[
            { value: 'comfy',   label: 'Comfy' },
            { value: 'compact', label: 'Compact' },
          ]}
        />
      </TweakSection>
    </TweaksPanel>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
