// ==============================================
// ConstructView — Application Data & State
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
      progress: 85,
      models: 24,
      status: 'active',
      team: ['AJ', 'SC', 'MR'],
      startDate: '2026-01-15',
      targetDate: '2026-09-30',
    },
    {
      id: 'proj-002',
      name: 'NH-48 Expressway Extension',
      type: 'infrastructure',
      icon: 'fa-road',
      gradient: 'linear-gradient(135deg, #5c3d2e, #8b5e3c)',
      client: 'NHAI',
      location: 'Jaipur to Delhi',
      progress: 62,
      models: 18,
      status: 'active',
      team: ['DR', 'PP', 'TW'],
      startDate: '2025-11-01',
      targetDate: '2027-03-15',
    },
    {
      id: 'proj-003',
      name: 'Central District Hospital',
      type: 'healthcare',
      icon: 'fa-hospital',
      gradient: 'linear-gradient(135deg, #1a3a2a, #2d6b4f)',
      client: 'State Health Dept',
      location: 'Pune, MH',
      progress: 41,
      models: 32,
      status: 'active',
      team: ['VR', 'NK', 'SC'],
      startDate: '2026-03-01',
      targetDate: '2027-06-30',
    },
    {
      id: 'proj-004',
      name: 'TechPark Commercial Tower',
      type: 'commercial',
      icon: 'fa-building',
      gradient: 'linear-gradient(135deg, #3d2d5c, #6b4f8b)',
      client: 'Infosys Ltd',
      location: 'Bangalore, KA',
      progress: 28,
      models: 15,
      status: 'active',
      team: ['AK', 'RS', 'AJ'],
      startDate: '2026-05-01',
      targetDate: '2027-12-31',
    },
    {
      id: 'proj-005',
      name: 'Green Valley Township',
      type: 'residential',
      icon: 'fa-city',
      gradient: 'linear-gradient(135deg, #2a5c3d, #4f8b6b)',
      client: 'Godrej Properties',
      location: 'Hyderabad, TG',
      progress: 15,
      models: 8,
      status: 'planning',
      team: ['AJ', 'PP', 'MR'],
      startDate: '2026-07-01',
      targetDate: '2028-06-30',
    },
    {
      id: 'proj-006',
      name: 'Industrial Park — Plot B',
      type: 'industrial',
      icon: 'fa-industry',
      gradient: 'linear-gradient(135deg, #5c5c5c, #8b8b8b)',
      client: 'Tata Steel',
      location: 'Jamshedpur, JH',
      progress: 50,
      models: 21,
      status: 'active',
      team: ['DR', 'NK', 'RS'],
      startDate: '2026-02-10',
      targetDate: '2027-01-15',
    },
  ],

  team: [
    { id: 'AJ', name: 'Alex Johnson',  role: 'Project Manager',    initials: 'AJ', color: '#0ea5e9', projects: 4, status: 'active' },
    { id: 'SC', name: 'Sarah Chen',     role: 'BIM Specialist',     initials: 'SC', color: '#10b981', projects: 3, status: 'active' },
    { id: 'MR', name: 'Mike Rivera',    role: 'Structural Engineer',initials: 'MR', color: '#f59e0b', projects: 5, status: 'active' },
    { id: 'PP', name: 'Priya Patel',    role: 'MEP Designer',       initials: 'PP', color: '#6366f1', projects: 3, status: 'active' },
    { id: 'DR', name: 'David Rodriguez',role: 'Site Supervisor',    initials: 'DR', color: '#ef4444', projects: 4, status: 'active' },
    { id: 'NK', name: 'Nina Kapoor',    role: 'Architect',          initials: 'NK', color: '#8b5cf6', projects: 2, status: 'active' },
    { id: 'TW', name: 'Tom Wilson',     role: 'Civil Engineer',     initials: 'TW', color: '#14b8a6', projects: 2, status: 'active' },
    { id: 'VR', name: 'Vikram Rao',     role: 'QA/QC Lead',         initials: 'VR', color: '#f97316', projects: 3, status: 'active' },
    { id: 'RS', name: 'Raj Singh',      role: 'Estimator',          initials: 'RS', color: '#e11d48', projects: 3, status: 'inactive' },
  ],

  tasks: [
    { id: 't-001', title: 'Resolve plumbing clash in Phase 3 tower A', project: 'Skyline Residences', assignee: 'PP', status: 'open', priority: 'high', due: '2026-08-10' },
    { id: 't-002', title: 'Update structural model for NH-48 bridge section', project: 'NH-48 Expressway', assignee: 'MR', status: 'in-progress', priority: 'high', due: '2026-08-07' },
    { id: 't-003', title: 'Add MEP annotations to hospital ground floor', project: 'Central District Hospital', assignee: 'SC', status: 'open', priority: 'medium', due: '2026-08-12' },
    { id: 't-004', title: 'Review fire evacuation route for TechPark', project: 'TechPark Commercial Tower', assignee: 'NK', status: 'open', priority: 'high', due: '2026-08-15' },
    { id: 't-005', title: 'Generate BOQ for Township Phase 1 buildings', project: 'Green Valley Township', assignee: 'RS', status: 'in-progress', priority: 'medium', due: '2026-08-20' },
    { id: 't-006', title: 'Verify steel tonnage estimates for industrial', project: 'Industrial Park — Plot B', assignee: 'MR', status: 'resolved', priority: 'low', due: '2026-07-30' },
    { id: 't-007', title: 'Update hospital HVAC routing per consultant feedback', project: 'Central District Hospital', assignee: 'PP', status: 'open', priority: 'medium', due: '2026-08-18' },
    { id: 't-008', title: 'Site photo integration for NH-48 milestone check', project: 'NH-48 Expressway', assignee: 'DR', status: 'in-progress', priority: 'medium', due: '2026-08-05' },
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

  // Update brand name display
  const el = document.getElementById('brandName');
  if (el) el.textContent = brand.name;
}

// Simple color adjuster
function adjustColor(hex, amount, alpha) {
  hex = hex.replace('#', '');
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  r = Math.min(255, Math.max(0, r + amount));
  g = Math.min(255, Math.max(0, g + amount));
  b = Math.min(255, Math.max(0, b + amount));
  if (alpha !== undefined) {
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

function hexToRgba(hex, alpha) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
