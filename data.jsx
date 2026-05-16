// Mock data for Pinpoint
// People (you + 4 family/contacts) + their devices + standalone trackers

const PEOPLE = [
  { id: 'me',   name: 'You',         initials: 'YO', color: '#7cc4ff', here: true },
  { id: 'mia',  name: 'Mia Ardian',  initials: 'MA', color: '#b8a4ff', short: 'Mom',  here: false },
  { id: 'leo',  name: 'Leo Park',    initials: 'LP', color: '#ffb787', short: 'Dad',  here: false },
  { id: 'aria', name: 'Aria Park',   initials: 'AP', color: '#87e0a9', short: 'Sis',  here: false },
  { id: 'kai',  name: 'Kai Sato',    initials: 'KS', color: '#ff9ed1', short: 'Roommate', here: false },
];

// device kinds map to icons
const DEVICES = [
  // me
  { id: 'd1',  owner: 'me',   name: 'Pixel 9 Pro',        kind: 'phone',   battery: 0.78, status: 'now',     loc: 'Home',           coords: [320, 360], room: 'Living room' },
  { id: 'd2',  owner: 'me',   name: 'Pixel Watch 3',      kind: 'watch',   battery: 0.41, status: 'now',     loc: 'Home',           coords: [325, 365] },
  { id: 'd3',  owner: 'me',   name: 'Pixel Buds Pro 2',   kind: 'buds',    battery: 0.86, status: '14 min',  loc: 'Glasshouse Café',coords: [180, 220] },
  { id: 'd4',  owner: 'me',   name: 'Backpack Tag',       kind: 'tag',     battery: 0.66, status: 'now',     loc: 'Home',           coords: [318, 358], color: '#7cc4ff' },
  { id: 'd5',  owner: 'me',   name: 'House Keys',         kind: 'tag',     battery: 0.92, status: '2 hr',    loc: 'Office',         coords: [540, 180], color: '#b8a4ff' },

  // mia
  { id: 'd6',  owner: 'mia',  name: 'Pixel 9',            kind: 'phone',   battery: 0.62, status: 'now',     loc: 'Glasshouse Café',coords: [185, 215] },
  { id: 'd7',  owner: 'mia',  name: 'Galaxy Buds',        kind: 'buds',    battery: 0.55, status: 'now',     loc: 'Glasshouse Café',coords: [188, 218] },

  // leo
  { id: 'd8',  owner: 'leo',  name: 'Pixel 9 Pro Fold',   kind: 'phone',   battery: 0.34, status: 'now',     loc: 'Eastside Park',  coords: [490, 480], lowBattery: true },
  { id: 'd9',  owner: 'leo',  name: 'Garmin Forerunner',  kind: 'watch',   battery: 0.71, status: 'now',     loc: 'Eastside Park',  coords: [495, 485] },
  { id: 'd10', owner: 'leo',  name: 'Bike Tag',           kind: 'bike',    battery: 0.48, status: '5 min',   loc: 'Eastside Park',  coords: [500, 490], color: '#ffb787' },

  // aria
  { id: 'd11', owner: 'aria', name: 'Galaxy S25',         kind: 'phone',   battery: 0.93, status: 'now',     loc: 'Westbrook High', coords: [620, 320] },
  { id: 'd12', owner: 'aria', name: 'iPad Air',           kind: 'tablet',  battery: 0.20, status: '32 min',  loc: 'Westbrook High', coords: [625, 318], lowBattery: true },

  // kai
  { id: 'd13', owner: 'kai',  name: 'OnePlus 13',         kind: 'phone',   battery: 0.51, status: 'now',     loc: 'Riverline Apts', coords: [120, 480] },
  { id: 'd14', owner: 'kai',  name: 'MacBook Air',        kind: 'laptop',  battery: 0.04, status: '3 hr',    loc: 'Riverline Apts', coords: [115, 478], lowBattery: true, offline: true },
];

const ALERTS = [
  { id: 'a1', kind: 'left',     title: 'Backpack Tag left behind', body: 'You left Glasshouse Café without your Backpack Tag.', when: '8 min ago', accent: 'tertiary' },
  { id: 'a2', kind: 'arrived',  title: 'Aria arrived at school',   body: 'Westbrook High · Mon 8:42 AM',                       when: '2 hr ago',  accent: 'primary' },
  { id: 'a3', kind: 'battery',  title: 'iPad Air low battery',     body: 'Aria\u2019s iPad is at 20%. It may stop sharing soon.', when: '3 hr ago', accent: 'secondary' },
  { id: 'a4', kind: 'found',    title: 'Found near you',           body: 'An unknown tag has been moving with you for 1h 12m.',  when: 'Yesterday', accent: 'tertiary', unknown: true },
  { id: 'a5', kind: 'arrived',  title: 'Leo arrived at Home',      body: 'Mon 6:14 PM',                                          when: 'Yesterday', accent: 'primary', read: true },
  { id: 'a6', kind: 'left',     title: 'House Keys disconnected',  body: 'Last seen at Office, 14 min ago.',                     when: '2 days ago', accent: 'secondary', read: true },
];

window.PINPOINT_DATA = { PEOPLE, DEVICES, ALERTS };
