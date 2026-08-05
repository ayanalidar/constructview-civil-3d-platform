// ==============================================
// ConstructView — Application Data & State
// Rich dummy data for a complete demo experience
// ==============================================

const APP_DATA = {
  brand: {
    name: 'ConstructView',
    logo: null,
    primaryColor: '#0ea5e9',
    accentColor: '#0ea5e9',
    domain: 'app.constructview.com',
    theme: 'dark',
  },

  user: {
    name: 'Alex Johnson',
    initials: 'AJ',
    role: 'Project Manager',
    email: 'alex@constructview.com',
    permissions: ['admin', 'viewer', 'editor'],
  },

  projects: [
    {
      id: 'proj-001',
      name: 'Skyline Residences — Phase 3',
      type: 'residential',
      icon: 'fa-house',
      gradient: 'linear-gradient(135deg, #1e3a5f, #2d5a87)',
      client: 'Prestige Group',
      location: 'Mumbai, MH',
      description: 'Luxury 28-story residential tower with 156 units, podium parking, and rooftop amenities.',
      progress: 85,
      models: 24,
      status: 'active',
      budget: '₹ 78 Cr',
      spent: '₹ 64 Cr',
      team: ['AJ', 'SC', 'MR', 'PP'],
      startDate: '2026-01-15',
      targetDate: '2026-09-30',
      models_list: [
        { name: 'Tower A — Structural Frame', format: 'RVT', uploaded: '2026-07-20', uploadedBy: 'SC', size: '142 MB' },
        { name: 'Tower A — MEP Coordination', format: 'IFC', uploaded: '2026-07-28', uploadedBy: 'PP', size: '89 MB' },
        { name: 'Podium — Architecture', format: 'SKP', uploaded: '2026-08-01', uploadedBy: 'NK', size: '67 MB' },
      ],
    },
    {
      id: 'proj-002',
      name: 'NH-48 Expressway Extension',
      type: 'infrastructure',
      icon: 'fa-road',
      gradient: 'linear-gradient(135deg, #5c3d2e, #8b5e3c)',
      client: 'NHAI',
      location: 'Jaipur to Delhi',
      description: '42km 6-lane expressway extension with 3 major bridges, 2 flyovers, and 14 culverts.',
      progress: 62,
      models: 18,
      status: 'active',
      budget: '₹ 2,140 Cr',
      spent: '₹ 1,280 Cr',
      team: ['DR', 'PP', 'TW', 'MR'],
      startDate: '2025-11-01',
      targetDate: '2027-03-15',
      models_list: [
        { name: 'Bridge Section B — Full Model', format: 'DWG', uploaded: '2026-06-15', uploadedBy: 'TW', size: '210 MB' },
        { name: 'Alignment & Profile', format: 'DWG', uploaded: '2026-05-20', uploadedBy: 'TW', size: '45 MB' },
      ],
    },
    {
      id: 'proj-003',
      name: 'Central District Hospital',
      type: 'healthcare',
      icon: 'fa-hospital',
      gradient: 'linear-gradient(135deg, #1a3a2a, #2d6b4f)',
      client: 'State Health Dept',
      location: 'Pune, MH',
      description: '450-bed multi-specialty hospital with 12 OTs, emergency wing, and separate infectious disease block.',
      progress: 41,
      models: 32,
      status: 'active',
      budget: '₹ 320 Cr',
      spent: '₹ 128 Cr',
      team: ['VR', 'NK', 'SC', 'PP'],
      startDate: '2026-03-01',
      targetDate: '2027-06-30',
      models_list: [
        { name: 'Ground Floor — MEP Layout', format: 'IFC', uploaded: '2026-07-12', uploadedBy: 'PP', size: '156 MB' },
        { name: 'OT Wing — HVAC', format: 'RVT', uploaded: '2026-07-25', uploadedBy: 'SC', size: '98 MB' },
        { name: 'ID Block — Isolation Rooms', format: 'IFC', uploaded: '2026-08-02', uploadedBy: 'SC', size: '72 MB' },
      ],
    },
    {
      id: 'proj-004',
      name: 'TechPark Commercial Tower',
      type: 'commercial',
      icon: 'fa-building',
      gradient: 'linear-gradient(135deg, #3d2d5c, #6b4f8b)',
      client: 'Infosys Ltd',
      location: 'Bangalore, KA',
      description: '22-story Grade A office tower with 1.2M sq ft leasable area, 3-level basement parking.',
      progress: 28,
      models: 15,
      status: 'active',
      budget: '₹ 540 Cr',
      spent: '₹ 152 Cr',
      team: ['NK', 'RS', 'AJ', 'SC'],
      startDate: '2026-05-01',
      targetDate: '2027-12-31',
      models_list: [
        { name: 'Basement Levels — Structural', format: 'RVT', uploaded: '2026-07-10', uploadedBy: 'SC', size: '185 MB' },
        { name: 'Facade Design Study', format: 'SKP', uploaded: '2026-07-30', uploadedBy: 'NK', size: '55 MB' },
      ],
    },
    {
      id: 'proj-005',
      name: 'Green Valley Township',
      type: 'residential',
      icon: 'fa-city',
      gradient: 'linear-gradient(135deg, #2a5c3d, #4f8b6b)',
      client: 'Godrej Properties',
      location: 'Hyderabad, TG',
      description: 'Integrated township with 48 buildings, 2,400 apartments, clubhouse, school, and retail plaza over 85 acres.',
      progress: 15,
      models: 8,
      status: 'planning',
      budget: '₹ 1,850 Cr',
      spent: '₹ 95 Cr',
      team: ['AJ', 'PP', 'MR', 'NK'],
      startDate: '2026-07-01',
      targetDate: '2028-06-30',
      models_list: [
        { name: 'Master Plan Layout', format: 'DWG', uploaded: '2026-07-05', uploadedBy: 'NK', size: '320 MB' },
      ],
    },
    {
      id: 'proj-006',
      name: 'Industrial Park — Plot B',
      type: 'industrial',
      icon: 'fa-industry',
      gradient: 'linear-gradient(135deg, #5c5c5c, #8b8b8b)',
      client: 'Tata Steel',
      location: 'Jamshedpur, JH',
      description: 'Heavy industrial facility with 3 production sheds, raw material yard, and integrated conveyor system.',
      progress: 50,
      models: 21,
      status: 'active',
      budget: '₹ 425 Cr',
      spent: '₹ 210 Cr',
      team: ['DR', 'NK', 'RS', 'TW'],
      startDate: '2026-02-10',
      targetDate: '2027-01-15',
      models_list: [
        { name: 'Production Shed A — Full BIM', format: 'IFC', uploaded: '2026-06-18', uploadedBy: 'NK', size: '245 MB' },
        { name: 'Conveyor System Integration', format: 'STEP', uploaded: '2026-07-08', uploadedBy: 'RS', size: '92 MB' },
        { name: 'Material Yard — Civil', format: 'DWG', uploaded: '2026-07-22', uploadedBy: 'TW', size: '78 MB' },
      ],
    },
    {
      id: 'proj-007',
      name: 'Metro Line 3 — Underground Section',
      type: 'infrastructure',
      icon: 'fa-train-subway',
      gradient: 'linear-gradient(135deg, #3d1e1e, #7a3d3d)',
      client: 'Mumbai Metro Rail Corp',
      location: 'Colaba to Bandra, Mumbai',
      description: '18.5km underground metro corridor with 14 stations, twin tunnels, and ventilation shafts.',
      progress: 35,
      models: 42,
      status: 'active',
      budget: '₹ 8,500 Cr',
      spent: '₹ 3,100 Cr',
      team: ['TW', 'DR', 'SC', 'VR'],
      startDate: '2025-08-01',
      targetDate: '2028-12-31',
      models_list: [
        { name: 'Tunnel Boring Machine Alignment', format: 'STEP', uploaded: '2026-07-15', uploadedBy: 'TW', size: '410 MB' },
        { name: 'Station 7 — Architecture & MEP', format: 'IFC', uploaded: '2026-07-30', uploadedBy: 'SC', size: '280 MB' },
      ],
    },
    {
      id: 'proj-008',
      name: 'Riverside Convention Centre',
      type: 'commercial',
      icon: 'fa-building-columns',
      gradient: 'linear-gradient(135deg, #1e3a5f, #4a7ab5)',
      client: 'L&T Construction',
      location: 'Kochi, KL',
      description: '5,000-seat convention centre with exhibition halls, waterfront promenade, and 5-star hotel annex.',
      progress: 72,
      models: 29,
      status: 'active',
      budget: '₹ 680 Cr',
      spent: '₹ 482 Cr',
      team: ['NK', 'AJ', 'RS', 'PP'],
      startDate: '2025-12-01',
      targetDate: '2027-02-28',
      models_list: [
        { name: 'Main Auditorium — Structural Steel', format: 'STEP', uploaded: '2026-06-20', uploadedBy: 'NK', size: '195 MB' },
        { name: 'Hotel Block — Full BIM', format: 'IFC', uploaded: '2026-07-18', uploadedBy: 'SC', size: '165 MB' },
      ],
    },
  ],

  recentActivity: [
    { id: 'a1', user: 'SC', action: 'uploaded new model', detail: 'OT Wing — HVAC for Central District Hospital', time: '10 min ago', type: 'upload' },
    { id: 'a2', user: 'MR', action: 'resolved clash issue', detail: 'Pipe vs beam clash in NH-48 Bridge Section B', time: '28 min ago', type: 'resolve' },
    { id: 'a3', user: 'AJ', action: 'added annotation', detail: 'on Skyline Phase 3 structural frame at Grid C5', time: '1 hour ago', type: 'annotate' },
    { id: 'a4', user: 'PP', action: 'flagged interference', detail: 'HVAC duct intersecting plumbing riser in Hospital G+1', time: '2 hours ago', type: 'flag' },
    { id: 'a5', user: 'NK', action: 'updated design', detail: 'Riverside Convention Centre — roof truss revised per client', time: '3 hours ago', type: 'update' },
    { id: 'a6', user: 'DR', action: 'submitted site report', detail: 'NH-48 — milestone photos uploaded, 3 issues flagged', time: '5 hours ago', type: 'report' },
    { id: 'a7', user: 'SYSTEM', action: 'auto-synced', detail: '3 project repositories — 142 files updated', time: '6 hours ago', type: 'system' },
    { id: 'a8', user: 'TW', action: 'completed clash detection', detail: 'Metro Line 3 — 18 clashes found, 3 critical', time: '8 hours ago', type: 'clash' },
    { id: 'a9', user: 'RS', action: 'generated BOQ estimate', detail: 'Industrial Park Plot B — steel tonnage report ready', time: '12 hours ago', type: 'estimate' },
    { id: 'a10', user: 'VR', action: 'approved QA checklist', detail: 'TechPark basement levels passed QC inspection', time: 'Yesterday', type: 'approve' },
  ],

  team: [
    { id: 'AJ', name: 'Alex Johnson',  role: 'Project Manager',    initials: 'AJ', color: '#0ea5e9', email: 'alex@cv.com',  projects: 4, status: 'active', phone: '+91 98100 12345' },
    { id: 'SC', name: 'Sarah Chen',     role: 'BIM Specialist',     initials: 'SC', color: '#10b981', email: 'sarah@cv.com',  projects: 5, status: 'active', phone: '+91 98100 12346' },
    { id: 'MR', name: 'Mike Rivera',    role: 'Structural Engineer',initials: 'MR', color: '#f59e0b', email: 'mike@cv.com',   projects: 4, status: 'active', phone: '+91 98100 12347' },
    { id: 'PP', name: 'Priya Patel',    role: 'MEP Designer',       initials: 'PP', color: '#6366f1', email: 'priya@cv.com',  projects: 5, status: 'active', phone: '+91 98100 12348' },
    { id: 'DR', name: 'David Rodriguez',role: 'Site Supervisor',    initials: 'DR', color: '#ef4444', email: 'david@cv.com',  projects: 3, status: 'active', phone: '+91 98100 12349' },
    { id: 'NK', name: 'Nina Kapoor',    role: 'Architect',          initials: 'NK', color: '#8b5cf6', email: 'nina@cv.com',   projects: 4, status: 'active', phone: '+91 98100 12350' },
    { id: 'TW', name: 'Tom Wilson',     role: 'Civil Engineer',     initials: 'TW', color: '#14b8a6', email: 'tom@cv.com',    projects: 3, status: 'active', phone: '+91 98100 12351' },
    { id: 'VR', name: 'Vikram Rao',     role: 'QA/QC Lead',         initials: 'VR', color: '#f97316', email: 'vikram@cv.com', projects: 3, status: 'active', phone: '+91 98100 12352' },
    { id: 'RS', name: 'Raj Singh',      role: 'Estimator',          initials: 'RS', color: '#e11d48', email: 'raj@cv.com',    projects: 4, status: 'active', phone: '+91 98100 12353' },
    { id: 'AM', name: 'Anita Mehta',    role: 'Junior Architect',   initials: 'AM', color: '#8b5cf6', email: 'anita@cv.com',  projects: 2, status: 'active', phone: '+91 98100 12354' },
    { id: 'KP', name: 'Karan Patel',    role: 'Safety Officer',     initials: 'KP', color: '#10b981', email: 'karan@cv.com',  projects: 2, status: 'active', phone: '+91 98100 12355' },
    { id: 'LS', name: 'Lisa Sung',      role: 'Client Relations',   initials: 'LS', color: '#ec4899', email: 'lisa@cv.com',   projects: 6, status: 'active', phone: '+91 98100 12356' },
  ],

  tasks: [
    { id: 't-001', title: 'Resolve plumbing clash in Phase 3 tower A', project: 'Skyline Residences — Phase 3', assignee: 'PP', status: 'open', priority: 'high', due: '2026-08-10', description: 'Plumbing riser in Tower A is colliding with structural shear wall at Grid D4. Need to reroute or get structural clearance.' },
    { id: 't-002', title: 'Update structural model for NH-48 bridge section', project: 'NH-48 Expressway Extension', assignee: 'MR', status: 'in-progress', priority: 'high', due: '2026-08-07', description: 'Bridge pier foundation design changed after soil test report. Update full structural model for Section B (pile caps + pier caps).' },
    { id: 't-003', title: 'Add MEP annotations to hospital ground floor', project: 'Central District Hospital', assignee: 'SC', status: 'open', priority: 'medium', due: '2026-08-12', description: 'Ground floor MEP layout needs annotations for OTs, ICU, and emergency wing. Tag all AHUs, ducts, and medical gas lines.' },
    { id: 't-004', title: 'Review fire evacuation route for TechPark', project: 'TechPark Commercial Tower', assignee: 'NK', status: 'open', priority: 'high', due: '2026-08-15', description: 'Fire marshal requested revised evacuation plan for floors 15-22. Verify stairwell capacity, refuge areas, and smoke exhaust.' },
    { id: 't-005', title: 'Generate BOQ for Township Phase 1 buildings', project: 'Green Valley Township', assignee: 'RS', status: 'in-progress', priority: 'medium', due: '2026-08-20', description: 'Extract quantity take-off from Phase 1 BIM models (12 buildings). Output: concrete, steel, bricks, flooring, doors/windows.' },
    { id: 't-006', title: 'Verify steel tonnage estimates for industrial shed', project: 'Industrial Park — Plot B', assignee: 'MR', status: 'resolved', priority: 'low', due: '2026-07-30', description: 'Contractor claims 15% higher steel tonnage than model estimate. Verify against BIM model and site measurements.' },
    { id: 't-007', title: 'Update hospital HVAC routing per consultant feedback', project: 'Central District Hospital', assignee: 'PP', status: 'open', priority: 'medium', due: '2026-08-18', description: 'HVAC consultant flagged 6 routing issues in the OT wing. Redesign duct paths to maintain negative pressure zones.' },
    { id: 't-008', title: 'Site photo integration for NH-48 milestone check', project: 'NH-48 Expressway Extension', assignee: 'DR', status: 'in-progress', priority: 'medium', due: '2026-08-05', description: 'Upload drone survey photos from KM 12-18 and overlay on 3D model for progress verification.' },
    { id: 't-009', title: 'Clash resolution — Metro Line 3 Station 7', project: 'Metro Line 3 — Underground Section', assignee: 'SC', status: 'open', priority: 'high', due: '2026-08-08', description: '18 clashes detected in Station 7 BIM. 3 critical — MEP vs structural, escalator void vs beam. Needs coordination meeting.' },
    { id: 't-010', title: 'Facade material sample approval — TechPark', project: 'TechPark Commercial Tower', assignee: 'NK', status: 'open', priority: 'low', due: '2026-08-22', description: 'Three glass/aluminum panel samples received from vendor. Review in model context and submit recommendation to client.' },
    { id: 't-011', title: 'Prepare weekly progress dashboard for Prestige Group', project: 'Skyline Residences — Phase 3', assignee: 'AJ', status: 'in-progress', priority: 'medium', due: '2026-08-06', description: 'Compile model progress, site photo overlay, budget tracking, and schedule variance for monthly client review.' },
    { id: 't-012', title: 'Convention Centre roof truss load test coordination', project: 'Riverside Convention Centre', assignee: 'VR', status: 'open', priority: 'high', due: '2026-08-14', description: 'Coordinate with testing agency for full-scale load test on main auditorium roof truss. Verify against structural model.' },
    { id: 't-013', title: 'Update Township master plan with phasing changes', project: 'Green Valley Township', assignee: 'NK', status: 'open', priority: 'medium', due: '2026-08-25', description: 'Client requested Phase 2 and Phase 3 buildings be swapped. Update master plan, road network, and utility layout.' },
    { id: 't-014', title: 'Prepare QS report for Riverside hotel ancillary', project: 'Riverside Convention Centre', assignee: 'RS', status: 'in-progress', priority: 'medium', due: '2026-08-11', description: 'Hotel ancillary block (kitchen, laundry, staff quarters) quantity survey from BIM model.' },
    { id: 't-015', title: 'Industrial shed — foundation inspection sign-off', project: 'Industrial Park — Plot B', assignee: 'DR', status: 'resolved', priority: 'high', due: '2026-07-28', description: 'Site inspection for Production Shed A foundation. Formwork, rebar, and embedment checked against model. Ready for pour.' },
  ],

  // White-label theme presets
  themePresets: [
    { name: 'Sky Blue',   primary: '#0ea5e9', accent: '#0ea5e9' },
    { name: 'Forest',     primary: '#10b981', accent: '#10b981' },
    { name: 'Amber',      primary: '#f59e0b', accent: '#f97316' },
    { name: 'Violet',     primary: '#8b5cf6', accent: '#6366f1' },
    { name: 'Crimson',    primary: '#ef4444', accent: '#dc2626' },
    { name: 'Teal',       primary: '#14b8a6', accent: '#0d9488' },
    { name: 'Rose',       primary: '#f43f5e', accent: '#e11d48' },
    { name: 'Slate',      primary: '#64748b', accent: '#475569' },
  ],

  // Supported 3D file formats
  supportedFormats: [
    { ext: '.ifc', label: 'IFC (BIM)' },
    { ext: '.rvt', label: 'Revit' },
    { ext: '.dwg', label: 'AutoCAD' },
    { ext: '.skp', label: 'SketchUp' },
    { ext: '.glb', label: 'GLB/glTF' },
    { ext: '.obj', label: 'OBJ' },
    { ext: '.fbx', label: 'FBX' },
    { ext: '.step', label: 'STEP' },
  ],

  // Notification data
  notifications: [
    { id: 'n1', text: 'Sarah uploaded a new hospital MEP model', time: '10 min ago', unread: true },
    { id: 'n2', text: 'Clash detection found 18 issues in Metro Line 3', time: '1 hour ago', unread: true },
    { id: 'n3', text: 'Client Godrej Properties viewed Township model', time: '3 hours ago', unread: true },
    { id: 'n4', text: 'Monthly report for Skyline Residences is ready', time: 'Yesterday', unread: false },
  ],
};

// Helper: format date
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Helper: get project by ID
function getProject(id) {
  return APP_DATA.projects.find(p => p.id === id);
}

// Helper: get team member by ID
function getTeamMember(id) {
  return APP_DATA.team.find(t => t.id === id);
}

// Helper: apply brand colors
function applyBrandColors() {
  const root = document.documentElement;
  const brand = APP_DATA.brand;
  root.style.setProperty('--color-accent', brand.primaryColor);
  root.style.setProperty('--color-accent-hover', adjustColor(brand.primaryColor, -15));
  root.style.setProperty('--color-accent-light', adjustColor(brand.primaryColor, 30, 0.15));
  root.style.setProperty('--color-accent-dark', adjustColor(brand.primaryColor, -25));
  root.style.setProperty('--shadow-glow', `0 0 20px ${hexToRgba(brand.primaryColor, 0.15)}`);

  const el = document.getElementById('brandName');
  if (el) el.textContent = brand.name;
}

function adjustColor(hex, amount, alpha) {
  hex = hex.replace('#', '');
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  r = Math.min(255, Math.max(0, r + amount));
  g = Math.min(255, Math.max(0, g + amount));
  b = Math.min(255, Math.max(0, b + amount));
  if (alpha !== undefined) return `rgba(${r},${g},${b},${alpha})`;
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

function hexToRgba(hex, alpha) {
  hex = hex.replace('#', '');
  return `rgba(${parseInt(hex.substring(0,2),16)},${parseInt(hex.substring(2,4),16)},${parseInt(hex.substring(4,6),16)},${alpha})`;
}
