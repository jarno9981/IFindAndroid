// Top-level screens: Map, Devices, People, Alerts
const { Icons, UI, MapView, PINPOINT_DATA } = window;
const { Avatar, BatteryBar, KindBadge, IconButton, TopBar, Sheet, tonalize, fmtPct } = UI;
const { PEOPLE, DEVICES, ALERTS } = PINPOINT_DATA;

// ════════════════════════════════════════════════════════════════
// MAP SCREEN
// ════════════════════════════════════════════════════════════════
const MapScreen = ({ selectedId, setSelectedId, search, setSearch, onOpenAdd, onOpenAlerts, density }) => {
  const filter = search.trim().toLowerCase();
  const filteredPins = filter
    ? DEVICES.filter(d => d.name.toLowerCase().includes(filter) || d.loc.toLowerCase().includes(filter))
    : DEVICES;

  const selected = DEVICES.find(d => d.id === selectedId);

  // Sheet content varies based on selection
  const [filterTab, setFilterTab] = React.useState('all');
  const tabbed = filterTab === 'all'
    ? DEVICES
    : filterTab === 'people' ? DEVICES.filter(d => d.kind === 'phone' || d.kind === 'watch')
    : filterTab === 'tags' ? DEVICES.filter(d => d.kind === 'tag' || d.kind === 'bike')
    : DEVICES.filter(d => d.lowBattery);

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      <MapView
        pins={filteredPins}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onTap={() => setSelectedId(null)}
      />

      {/* Top floating search bar (Material You search bar) */}
      <div style={{
        position: 'absolute', top: 16, left: 16, right: 16,
        display: 'flex', gap: 10,
        zIndex: 4,
      }}>
        <div style={{
          flex: 1,
          background: 'var(--surface-2)',
          borderRadius: 'var(--r-pill)',
          padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: 'var(--shadow-2)',
          border: '1px solid var(--outline)',
        }}>
          <Icons.Search size={20} color="var(--on-surface-variant)"/>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search people, devices, tags"
            style={{
              flex: 1, background: 'transparent', border: 0, outline: 0,
              color: 'var(--on-surface)', fontFamily: 'inherit', fontSize: 15,
            }}
          />
          {search ? (
            <button onClick={() => setSearch('')} style={{ background: 'transparent', border: 0, color: 'var(--on-surface-variant)', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <Icons.Close size={18}/>
            </button>
          ) : (
            <Avatar person={PEOPLE[0]} size={26}/>
          )}
        </div>
      </div>

      {/* Map-side floating actions */}
      <div style={{
        position: 'absolute', right: 16, bottom: 200,
        display: 'flex', flexDirection: 'column', gap: 10,
        zIndex: 3,
      }}>
        <IconButton icon={Icons.Compass} variant="elevated" size={48} label="Re-center"/>
        <IconButton icon={Icons.Sliders} variant="elevated" size={48} label="Layers"/>
        <button onClick={onOpenAdd} style={{
          width: 64, height: 64, borderRadius: 22,
          border: 0, cursor: 'pointer',
          background: 'var(--primary-container)',
          color: 'var(--on-primary-container)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-pop)',
        }} aria-label="Add device">
          <Icons.Add size={28}/>
        </button>
      </div>

      {/* If search active and no selection, render search results panel; otherwise nearby sheet */}
      {filter && !selected ? (
        <SearchResultsPanel
          devices={filteredPins}
          onPick={id => { setSelectedId(id); setSearch(''); }}
        />
      ) : !selected && (
        <Sheet
          peekHeight={120}
          midHeight={density === 'compact' ? 320 : 380}
          maxHeight="80%"
          initial="mid"
        >
          <SheetNearby
            filterTab={filterTab}
            setFilterTab={setFilterTab}
            devices={tabbed}
            onPick={setSelectedId}
            density={density}
          />
        </Sheet>
      )}
    </div>
  );
};

// ───── Search results panel ─────
const SearchResultsPanel = ({ devices, onPick }) => (
  <div style={{
    position: 'absolute', top: 72, left: 16, right: 16, bottom: 16,
    background: 'var(--surface-2)',
    borderRadius: 28,
    border: '1px solid var(--outline)',
    boxShadow: 'var(--shadow-pop)',
    padding: 8, overflow: 'auto',
    zIndex: 3,
  }} className="no-scrollbar fade-in">
    <div style={{ padding: '12px 12px 6px', color: 'var(--on-surface-variant)', fontSize: 12, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase' }}>
      {devices.length} result{devices.length === 1 ? '' : 's'}
    </div>
    {devices.length === 0 && (
      <div style={{ padding: '24px 16px', color: 'var(--on-surface-variant)' }}>No matches. Try a person, device, or place.</div>
    )}
    {devices.map(d => <DeviceRow key={d.id} d={d} onPick={onPick}/>)}
  </div>
);

// ───── Nearby sheet ─────
const SheetNearby = ({ filterTab, setFilterTab, devices, onPick, density }) => {
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'people', label: 'People' },
    { id: 'tags', label: 'Tags' },
    { id: 'low', label: 'Low battery' },
  ];
  return (
    <div style={{ padding: '0 0 24px' }}>
      <div style={{ padding: '4px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Nearby</div>
          <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 2 }}>{devices.length} items \u00B7 updated just now</div>
        </div>
        <button style={{ background: 'transparent', border: 0, color: 'var(--primary)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Sort</button>
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '8px 20px 14px', overflowX: 'auto' }} className="no-scrollbar">
        {tabs.map(t => (
          <div key={t.id}
            onClick={() => setFilterTab(t.id)}
            className={`chip ${filterTab === t.id ? 'active' : ''}`}
            style={{ flexShrink: 0 }}
          >{t.label}</div>
        ))}
      </div>
      <div style={{ padding: density === 'compact' ? '0 8px' : '0 8px' }}>
        {devices.map(d => <DeviceRow key={d.id} d={d} onPick={onPick} compact={density === 'compact'}/>)}
      </div>
    </div>
  );
};

// ───── Device row (used on map sheet + lists) ─────
const DeviceRow = ({ d, onPick, compact }) => {
  const owner = PEOPLE.find(p => p.id === d.owner);
  const accent = d.color || (owner ? owner.color : '#7cc4ff');
  return (
    <div
      onClick={() => onPick && onPick(d.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: compact ? '10px 12px' : '12px',
        borderRadius: 20,
        cursor: 'pointer',
        transition: 'background .15s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <KindBadge kind={d.kind} color={accent} size={compact ? 40 : 46}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</div>
          {d.lowBattery && (
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--error)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Low</span>
          )}
          {d.offline && (
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Offline</span>
          )}
        </div>
        <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>{owner && owner.id !== 'me' ? `${owner.name} \u00B7 ` : ''}{d.loc}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        <div style={{ fontSize: 12, color: d.status === 'now' ? 'var(--primary)' : 'var(--on-surface-variant)', fontWeight: 600 }}>
          {d.status === 'now' ? '\u25CF Now' : d.status}
        </div>
        <BatteryBar value={d.battery}/>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// DEVICES SCREEN
// ════════════════════════════════════════════════════════════════
const DevicesScreen = ({ setSelectedId, setTab, search, setSearch, density }) => {
  const filter = search.trim().toLowerCase();
  const list = filter
    ? DEVICES.filter(d => d.name.toLowerCase().includes(filter) || d.loc.toLowerCase().includes(filter))
    : DEVICES;
  const mine = list.filter(d => d.owner === 'me');
  const others = list.filter(d => d.owner !== 'me');

  return (
    <div style={{ flex: 1, overflow: 'auto', background: 'var(--surface-1)' }} className="no-scrollbar">
      <TopBar title="Your devices" sub={`${DEVICES.length} signed in \u00B7 ${DEVICES.filter(d=>d.status==='now').length} live`} action={
        <>
          <IconButton icon={Icons.Filter} variant="tonal" label="Filter"/>
          <IconButton icon={Icons.More} variant="tonal" label="More"/>
        </>
      }/>
      {/* Inline search */}
      <div style={{ padding: '0 20px 8px' }}>
        <div style={{
          background: 'var(--surface-2)', borderRadius: 'var(--r-pill)',
          padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
          border: '1px solid var(--outline)',
        }}>
          <Icons.Search size={18} color="var(--on-surface-variant)"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search devices" style={{
            flex: 1, background: 'transparent', border: 0, outline: 0,
            color: 'var(--on-surface)', fontFamily: 'inherit', fontSize: 15,
          }}/>
        </div>
      </div>

      {/* Mine section */}
      <SectionHeader title="Mine" count={mine.length}/>
      <div style={{ padding: '0 12px 12px' }}>
        {mine.map(d => <DeviceRow key={d.id} d={d} compact={density==='compact'} onPick={id => { setSelectedId(id); setTab('map'); }}/>)}
      </div>

      {/* Family */}
      <SectionHeader title="Family & friends" count={others.length}/>
      <div style={{ padding: '0 12px 100px' }}>
        {others.map(d => <DeviceRow key={d.id} d={d} compact={density==='compact'} onPick={id => { setSelectedId(id); setTab('map'); }}/>)}
      </div>
    </div>
  );
};

const SectionHeader = ({ title, count }) => (
  <div style={{
    padding: '20px 20px 8px',
    display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
  }}>
    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)', letterSpacing: 1.4, textTransform: 'uppercase' }}>{title}</div>
    <div style={{ fontSize: 12, color: 'var(--on-surface-muted)' }}>{count}</div>
  </div>
);

// ════════════════════════════════════════════════════════════════
// PEOPLE SCREEN
// ════════════════════════════════════════════════════════════════
const PeopleScreen = ({ setSelectedId, setTab }) => {
  const others = PEOPLE.filter(p => p.id !== 'me');
  const devicesOf = (pid) => DEVICES.filter(d => d.owner === pid);

  return (
    <div style={{ flex: 1, overflow: 'auto', background: 'var(--surface-1)' }} className="no-scrollbar">
      <TopBar title="People" sub={`${others.length} sharing location`} action={
        <IconButton icon={Icons.Add} variant="primary" label="Invite"/>
      }/>

      {/* Hero: you */}
      <div style={{ padding: '4px 20px 12px' }}>
        <div style={{
          background: `linear-gradient(135deg, ${tonalize('#7cc4ff', 0.18)}, ${tonalize('#b8a4ff', 0.12)})`,
          borderRadius: 28,
          padding: 18,
          display: 'flex', alignItems: 'center', gap: 14,
          border: '1px solid var(--outline)',
        }}>
          <Avatar person={PEOPLE[0]} size={56}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 700 }}>You</div>
            <div style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>Sharing precise location with 4 people</div>
          </div>
          <button className="btn ghost" style={{ padding: '8px 12px' }}><Icons.Settings size={18}/></button>
        </div>
      </div>

      {/* Family list */}
      <SectionHeader title="Shared with you" count={others.length}/>
      <div style={{ padding: '0 12px 100px' }}>
        {others.map(p => {
          const devs = devicesOf(p.id);
          const primary = devs.find(d => d.kind === 'phone') || devs[0];
          return (
            <div key={p.id}
              onClick={() => { if (primary) { setSelectedId(primary.id); setTab('map'); }}}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: 12, borderRadius: 24,
                cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Avatar person={p} size={52}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{p.name}</div>
                  {p.short && <div style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'var(--surface-3)', color: 'var(--on-surface-variant)', fontWeight: 600 }}>{p.short}</div>}
                </div>
                <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icons.Pin size={14} color="var(--on-surface-variant)"/>
                  <span>{primary ? primary.loc : 'No devices'}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  {devs.slice(0, 4).map(d => {
                    const M = { phone: Icons.Phone, tablet: Icons.Tablet, watch: Icons.Watch, buds: Icons.Earbuds, tag: Icons.Tag, laptop: Icons.Laptop, bike: Icons.Bike }[d.kind] || Icons.Tag;
                    return (
                      <div key={d.id} style={{
                        width: 22, height: 22, borderRadius: 7,
                        background: 'var(--surface-3)', color: 'var(--on-surface-variant)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <M size={13} color="var(--on-surface-variant)"/>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <div style={{ fontSize: 12, color: primary && primary.status === 'now' ? 'var(--primary)' : 'var(--on-surface-variant)', fontWeight: 600 }}>
                  {primary && primary.status === 'now' ? '\u25CF Live' : primary?.status}
                </div>
                <Icons.Chevron size={16} color="var(--on-surface-muted)"/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// ALERTS SCREEN
// ════════════════════════════════════════════════════════════════
const AlertsScreen = ({ alertsState, setAlertsState }) => {
  const accentToColor = { primary: 'var(--primary)', secondary: 'var(--secondary)', tertiary: 'var(--tertiary)' };
  const iconFor = (kind) => {
    if (kind === 'left') return Icons.Lightning;
    if (kind === 'arrived') return Icons.Pin;
    if (kind === 'battery') return Icons.Battery;
    if (kind === 'found') return Icons.Sparkle;
    return Icons.Alerts;
  };
  const unread = alertsState.filter(a => !a.read).length;
  const markAll = () => setAlertsState(alertsState.map(a => ({ ...a, read: true })));

  return (
    <div style={{ flex: 1, overflow: 'auto', background: 'var(--surface-1)' }} className="no-scrollbar">
      <TopBar title="Alerts" sub={`${unread} unread`} action={
        <button onClick={markAll} className="btn tonal" style={{ padding: '10px 14px', fontSize: 13 }}>Mark all read</button>
      }/>

      {/* Unknown tag callout */}
      {alertsState.find(a => a.unknown && !a.read) && (
        <div style={{ padding: '4px 20px 12px' }}>
          <div style={{
            background: tonalize('#ffb787', 0.12),
            border: `1px solid ${tonalize('#ffb787', 0.35)}`,
            borderRadius: 24,
            padding: 16,
            display: 'flex', gap: 14, alignItems: 'flex-start',
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: tonalize('#ffb787', 0.22), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.Sparkle size={22} color="var(--tertiary)"/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: 'var(--on-surface)' }}>Unknown tag traveling with you</div>
              <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 4 }}>A tag has been moving with you for 1h 12m. Tap to inspect or stop tracking.</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn primary" style={{ padding: '10px 14px', fontSize: 13 }}>Identify</button>
                <button className="btn tonal" style={{ padding: '10px 14px', fontSize: 13 }}>Pause for an hour</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SectionHeader title="Today" count={alertsState.filter(a => a.when.includes('min') || a.when.includes('hr')).length}/>
      <div style={{ padding: '0 12px' }}>
        {alertsState.filter(a => !a.unknown && (a.when.includes('min') || a.when.includes('hr'))).map(a => (
          <AlertRow key={a.id} a={a} color={accentToColor[a.accent]} icon={iconFor(a.kind)} onToggle={() => setAlertsState(alertsState.map(x => x.id === a.id ? {...x, read: !x.read} : x))}/>
        ))}
      </div>
      <SectionHeader title="Earlier" count={alertsState.filter(a => a.when.includes('day') || a.when.includes('Yesterday')).length}/>
      <div style={{ padding: '0 12px 100px' }}>
        {alertsState.filter(a => !a.unknown && (a.when.includes('day') || a.when.includes('Yesterday'))).map(a => (
          <AlertRow key={a.id} a={a} color={accentToColor[a.accent]} icon={iconFor(a.kind)} onToggle={() => setAlertsState(alertsState.map(x => x.id === a.id ? {...x, read: !x.read} : x))}/>
        ))}
      </div>
    </div>
  );
};

const AlertRow = ({ a, color, icon: Icon, onToggle }) => (
  <div
    onClick={onToggle}
    style={{
      display: 'flex', gap: 14, alignItems: 'flex-start',
      padding: '14px 12px',
      borderRadius: 20, cursor: 'pointer',
      opacity: a.read ? 0.65 : 1,
    }}
    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
  >
    <div style={{
      width: 42, height: 42, borderRadius: 13,
      background: tonalize(color === 'var(--primary)' ? '#7cc4ff' : color === 'var(--secondary)' ? '#b8a4ff' : '#ffb787', 0.18),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={20} color={color}/>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {!a.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }}/>}
        <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--on-surface)' }}>{a.title}</div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 4, lineHeight: 1.4 }}>{a.body}</div>
      <div style={{ fontSize: 12, color: 'var(--on-surface-muted)', marginTop: 6 }}>{a.when}</div>
    </div>
  </div>
);

window.Screens = { MapScreen, DevicesScreen, PeopleScreen, AlertsScreen, DeviceRow };
