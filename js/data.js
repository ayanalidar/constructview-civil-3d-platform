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

  // Case studies for marketing site
  caseStudies: [
    { id: 'cs1', title: 'How Patel Infra Cut Rework by 40%', subtitle: 'Hospital project saved \u20b91.2 Cr through early clash detection', problem: 'Patel Infra was building a 300-bed hospital in Pune. MEP coordination was being done with 2D drawings, and clashes were discovered on-site, causing expensive rework and 3-month delays.', solution: 'Migrated all hospital models to ConstructView. Ran automated clash detection across Architecture, Structure, and MEP disciplines. Found 47 clashes in the first scan.', results: [{ label: 'Rework Reduction', value: '40%' },{ label: 'Cost Saved', value: '\u20b91.2 Cr' },{ label: 'Schedule Saved', value: '11 weeks' },{ label: 'Clashes Found', value: '47' }], quote: 'ConstructView caught a plumbing riser running through a structural column that would have cost us \u20b928 lakhs to fix. Now we run clash detection before every pour.', author: 'Meera Patel, Chief Engineer' },
    { id: 'cs2', title: 'NHAI Accelerates Approvals by 3x', subtitle: 'Expressway stakeholders moved from 2D PDFs to interactive 3D', problem: 'NHAI project had 12 stakeholder agencies reviewing designs via PDF drawings. Each review cycle took 3-4 weeks. Miscommunication led to 23 change orders in the first year.', solution: 'Deployed ConstructView as the single source of truth. All stakeholders accessed the same 3D model with role-based permissions. Section cuts replaced PDF sections. Annotations replaced email chains.', results: [{ label: 'Faster Approvals', value: '3x' },{ label: 'Change Orders', value: '-65%' },{ label: 'Review Cycle', value: '8 days' },{ label: 'Stakeholders', value: '12' }], quote: 'What used to take 3 weeks of email threads now happens in a single viewing session. The client walks through the bridge model in 3D and approves on the spot.', author: 'Tom Wilson, Civil Engineer' },
    { id: 'cs3', title: 'BuildTech Wins 4 New Clients Through White-Label', subtitle: 'Consultancy monetised BIM expertise by offering branded 3D portals', problem: 'BuildTech was losing post-design clients because they had no way to present 3D models professionally. Clients would take the BIM model and go to cheaper vendors for construction.', solution: 'White-labeled ConstructView for 4 contractor clients. Each client got their own branded portal with custom domain, logo, and color theme. BuildTech charged \u20b945k/month per client for managed access.', results: [{ label: 'New Revenue', value: '\u20b921.6L/yr' },{ label: 'Client Retention', value: '+80%' },{ label: 'White-Label Clients', value: '4' },{ label: 'Setup Time', value: '2 days' }], quote: 'Our clients think we built them a custom platform worth \u20b915 lakhs. We set it up in 2 days.', author: 'Arun Sharma, CEO, BuildTech Solutions' }
  ],

  // Competitive comparison
  competitors: [
    { feature: '3D Viewer (no install)', cv: true, autodesk: true, trimble: true, dalux: true, bimCollab: false },
    { feature: 'White-Label Branding', cv: true, autodesk: false, trimble: false, dalux: false, bimCollab: false },
    { feature: 'Clash Detection', cv: true, autodesk: true, trimble: true, dalux: true, bimCollab: true },
    { feature: 'Section Clipping', cv: true, autodesk: true, trimble: true, dalux: false, bimCollab: true },
    { feature: 'On-Model Measurement', cv: true, autodesk: true, trimble: true, dalux: true, bimCollab: false },
    { feature: 'Multi-Discipline Support', cv: true, autodesk: true, trimble: true, dalux: true, bimCollab: true },
    { feature: 'Role-Based Access', cv: true, autodesk: true, trimble: true, dalux: true, bimCollab: true },
    { feature: 'Custom Domain', cv: true, autodesk: false, trimble: false, dalux: false, bimCollab: false },
    { feature: 'Mobile Responsive', cv: true, autodesk: true, trimble: true, dalux: true, bimCollab: false },
    { feature: 'IFC/GLB/DWG Support', cv: true, autodesk: true, trimble: true, dalux: true, bimCollab: true },
    { feature: 'API Access', cv: true, autodesk: true, trimble: true, dalux: false, bimCollab: true },
    { feature: 'Per-Project Pricing', cv: true, autodesk: false, trimble: false, dalux: true, bimCollab: false }
  ],

  // FAQ
  faqs: [
    { q: 'What file formats does ConstructView support?', a: 'We support IFC (BIM), Revit (RVT), AutoCAD (DWG), SketchUp (SKP), GLB/glTF, OBJ, FBX, and STEP. Upload any of these formats and view them instantly in 3D without any software installation.' },
    { q: 'Can I white-label the platform for my clients?', a: 'Absolutely. From the Settings panel you can change the platform name, upload your logo, set a custom domain, pick from 8 color presets, rename user roles, and configure watermarking.' },
    { q: 'Do my clients need to install any software?', a: 'No. ConstructView runs entirely in the browser using WebGL. Your clients just open a link. No plugins, no downloads, no training required.' },
    { q: 'How does clash detection work?', a: 'Our clash detection engine compares every 3D element across different disciplines using bounding-box intersection. Results are graded Critical, Warning, or Minor and displayed as pulsing markers on the model.' },
    { q: 'Is my project data secure?', a: 'Yes. All files are encrypted at rest and in transit. You control access through role-based permissions. Enterprise customers can opt for on-premise deployment.' },
    { q: 'Can I measure distances on the 3D model?', a: 'Yes. Click the Measure tool, then click any two points. You get a live preview line and a permanent distance label in meters.' },
    { q: 'How does multi-tenant white-label work?', a: 'The Enterprise plan supports multi-tenant white-label. Each client gets their own branded portal with custom domain, logo, and colors under your main account.' },
    { q: 'What is the difference between section cuts and X-ray mode?', a: 'Section cuts create a real clipping plane through your model. X-ray mode makes all materials semi-transparent so you can see through walls while keeping the full model visible.' },
    { q: 'Can I export screenshots or reports?', a: 'Yes. Export high-res screenshots (PNG), PDF reports with clash summaries, and the model as GLB. All exports can include your watermark.' },
    { q: 'Is there an API for integration?', a: 'Yes. Enterprise customers get full API access for programmatic model upload, project management, and data extraction.' }
  ],

  // Partners / Integrations
  partners: [
    { name: 'Autodesk' }, { name: 'Trimble' }, { name: 'SketchUp' }, { name: 'Rhino 3D' },
    { name: 'Revit' }, { name: 'Navisworks' }, { name: 'Tekla' }, { name: 'ArchiCAD' }
  ],

  // Blog / Resources preview
  blogPosts: [
    { title: 'Getting Started with BIM Clash Detection: A Practical Guide', date: '2026-07-28', readTime: '8 min', tag: 'Guide', excerpt: 'Learn how to set up your first clash detection run, interpret results, and build a coordination workflow that catches conflicts before they reach the site.' },
    { title: '5 Ways 3D Visualization Wins Client Approvals Faster', date: '2026-07-20', readTime: '6 min', tag: 'Business', excerpt: 'How civil firms are cutting approval cycles from weeks to days using browser-based 3D walkthroughs and annotated screenshots.' },
    { title: 'IFC vs DWG vs RVT: Which Format Should You Use?', date: '2026-07-12', readTime: '5 min', tag: 'Technical', excerpt: 'A comparison of the three most common BIM/CAD formats, when to use each, and how to avoid conversion headaches.' },
    { title: 'White-Label BIM Portals: A New Revenue Stream for Consultants', date: '2026-07-05', readTime: '7 min', tag: 'Business', excerpt: 'How engineering consultancies are turning BIM expertise into recurring revenue by offering branded 3D portals to contractor clients.' },
    { title: '4D Construction Scheduling: Linking Time to Your 3D Model', date: '2026-06-28', readTime: '9 min', tag: 'Technical', excerpt: 'Step-by-step guide to creating 4D animations that show construction sequence over time — from foundation to finish.' },
    { title: 'How to Reduce RFIs by 50% with Model-Based Collaboration', date: '2026-06-15', readTime: '6 min', tag: 'Guide', excerpt: 'Real strategies from firms that slashed Requests for Information by moving design reviews into the 3D model.' },
  ],

  // Marketing site features (richer than app features)
  siteFeatures: [
    { icon: 'fa-cube', color: 'var(--color-accent)', title: 'Real-Time 3D Viewer', desc: 'Upload IFC, RVT, DWG, SKP, GLB, OBJ, FBX, STEP — view instantly in WebGL. Walk from outside facade to interior rooms in one seamless motion. No plugins, no installs.', items: ['360-degree orbit, pan, zoom', 'First-person walkthrough mode', 'Wireframe & X-ray transparency', 'Real-time shadows & ambient occlusion'] },
    { icon: 'fa-scissors', color: '#10b981', title: 'Section Clipping', desc: 'Slice through any axis to inspect internal structure, MEP routing, and rebar placement. Live clipping planes update instantly as you drag the position slider.', items: ['X, Y, Z axis cuts with slider control', 'Visual cut plane indicators', 'One-click clear and restore', 'Export section views as PNG'] },
    { icon: 'fa-triangle-exclamation', color: '#f59e0b', title: 'Clash Detection Engine', desc: 'Automatically find conflicts between disciplines. MEP pipe through a beam? Electrical tray vs HVAC duct? Flagged instantly with severity grading. Export clash reports as PDF.', items: ['Cross-discipline bounding-box scan', 'Critical/Warning/Minor severity levels', 'Pulsing visual markers at clash points', 'Exportable clash report (PDF/CSV)'] },
    { icon: 'fa-ruler-combined', color: '#6366f1', title: 'On-Model Measurement', desc: 'Click any two points directly on the 3D surface. Real-time dashed preview line, then a permanent labeled measurement in meters. No separate tool needed.', items: ['Point-to-point distance (meters)', 'Live dashed preview while hovering', 'Floating labels persist in scene', 'Clear all or clear individual'] },
    { icon: 'fa-palette', color: '#ec4899', title: 'White-Label Branding', desc: 'Every client gets their own branded experience. Swap logo, colors, domain, and role names from a simple admin panel. The platform looks like it was built just for them.', items: ['8 preset color themes + custom hex', 'Custom domain & logo upload', 'Watermarked exports with client brand', 'Rename all user roles per tenant'] },
    { icon: 'fa-users-gear', color: '#14b8a6', title: 'Role-Based Access Control', desc: 'Project Manager, Designer, Site Supervisor, Client — each sees exactly what they need. Set permissions per role: view-only, annotate, edit, or full admin.', items: ['5 predefined roles + custom', 'Per-project access control', 'Client download restrictions', 'Audit log of all access events'] },
    { icon: 'fa-comment-dots', color: '#f97316', title: 'BIM Annotation & Issue Tracking', desc: 'Pin comments directly on the 3D model surface. Assign issues to team members. Track every item from open to resolved with full history.', items: ['Click-to-place annotation markers', 'Assign tasks to team members', 'Status flow: open → in-progress → resolved', 'Linked to exact model coordinates'] },
    { icon: 'fa-mobile-screen', color: '#8b5cf6', title: 'Mobile & Tablet Ready', desc: 'Full responsive design. Site workers view models on their phone at the construction site. Tablets for client presentations. Same experience everywhere.', items: ['Responsive at all screen sizes', 'Touch-optimized orbit controls', 'Offline cache for remote sites', 'Camera integration for site photos'] },
    { icon: 'fa-file-export', color: '#ef4444', title: 'Export & Reporting', desc: 'Export screenshots, PDF clash reports, model files, and BIM data. All exports can include your client logo as watermark for professional delivery.', items: ['High-res PNG screenshots', 'PDF clash & measurement reports', 'GLB/glTF model downloads', 'CSV BIM data extraction'] },
  ],

  // More competitor rows
  competitorRows: [
    { feature: '3D Viewer (no software install)', cv: true, autodesk: true, trimble: true, dalux: true, bimCollab: false },
    { feature: 'White-Label Branding', cv: true, autodesk: false, trimble: false, dalux: false, bimCollab: false },
    { feature: 'Clash Detection', cv: true, autodesk: true, trimble: true, dalux: true, bimCollab: true },
    { feature: 'Section Clipping', cv: true, autodesk: true, trimble: true, dalux: false, bimCollab: true },
    { feature: 'On-Model Measurement', cv: true, autodesk: true, trimble: true, dalux: true, bimCollab: false },
    { feature: 'BIM Annotation & Issue Tracking', cv: true, autodesk: true, trimble: false, dalux: true, bimCollab: true },
    { feature: 'Multi-Discipline Support', cv: true, autodesk: true, trimble: true, dalux: true, bimCollab: true },
    { feature: 'Role-Based Access', cv: true, autodesk: true, trimble: true, dalux: true, bimCollab: true },
    { feature: 'Custom Domain', cv: true, autodesk: false, trimble: false, dalux: false, bimCollab: false },
    { feature: 'Mobile Responsive', cv: true, autodesk: true, trimble: true, dalux: true, bimCollab: false },
    { feature: '8+ File Formats (IFC/RVT/DWG/GLB)', cv: true, autodesk: true, trimble: true, dalux: true, bimCollab: true },
    { feature: 'Full REST API Access', cv: true, autodesk: true, trimble: true, dalux: false, bimCollab: true },
    { feature: 'Per-Project Pricing Model', cv: true, autodesk: false, trimble: false, dalux: true, bimCollab: false },
    { feature: 'Multi-Tenant White-Label', cv: true, autodesk: false, trimble: false, dalux: false, bimCollab: false },
    { feature: 'On-Premise Deployment Option', cv: true, autodesk: true, trimble: false, dalux: false, bimCollab: true },
    { feature: 'Watermarked Client Exports', cv: true, autodesk: false, trimble: false, dalux: false, bimCollab: false },
  ],

  // More partners with descriptions
  partnerDetails: [
    { name: 'Autodesk Revit', desc: 'Native RVT import', icon: 'fa-building' },
    { name: 'Trimble Connect', desc: 'BIM data sync', icon: 'fa-link' },
    { name: 'SketchUp', desc: 'SKP direct import', icon: 'fa-cube' },
    { name: 'Rhino 3D', desc: 'Complex geometry', icon: 'fa-draw-polygon' },
    { name: 'AutoCAD', desc: 'DWG/DXF support', icon: 'fa-pen-ruler' },
    { name: 'Navisworks', desc: 'Clash data import', icon: 'fa-clipboard-check' },
    { name: 'Tekla Structures', desc: 'Steel detailing', icon: 'fa-grip-lines' },
    { name: 'ArchiCAD', desc: 'BIM collaboration', icon: 'fa-compass-drafting' },
    { name: 'Procore', desc: 'Project mgmt sync', icon: 'fa-hard-hat' },
    { name: 'Bluebeam', desc: 'PDF markups', icon: 'fa-file-pdf' },
    { name: 'Microsoft Teams', desc: 'Notifications', icon: 'fa-comment' },
    { name: 'Slack', desc: 'Alerts & updates', icon: 'fa-slack' },
  ],

  // More testimonials
  moreTestimonials: [
    { quote: 'We used to send PDF markups back and forth for weeks. Now clients walk through the 3D model on their phone and approve changes same-day. Game changer.', author: 'Rajesh Kumar', role: 'Director, Kumar Constructions', initials: 'RK', color: '#0ea5e9' },
    { quote: 'Clash detection alone saved us ₹12 lakh in rework on our hospital project. Finding a plumbing riser intersecting a column before pouring concrete is priceless.', author: 'Meera Patel', role: 'Chief Engineer, Patel Infra', initials: 'MP', color: '#10b981' },
    { quote: 'We white-labeled ConstructView for 4 contractor clients. Each one thinks we built them a custom platform. Our brand value shot up overnight.', author: 'Arun Sharma', role: 'CEO, BuildTech Solutions', initials: 'AS', color: '#6366f1' },
    { quote: 'The measurement tool alone replaced two separate apps we used. Click-click on the model and you have your distance. My site supervisors love how simple it is.', author: 'David Rodriguez', role: 'Site Supervisor, Tata Projects', initials: 'DR', color: '#ef4444' },
    { quote: 'We run clash detection before every concrete pour now. Caught 6 critical MEP-Structure conflicts on the TechPark project that would have cost ₹45 lakhs to fix on-site.', author: 'Nina Kapoor', role: 'Lead Architect, DesignWorks', initials: 'NK', color: '#8b5cf6' },
    { quote: 'The white-label feature is brilliant. We set up a branded portal for Godrej in 2 hours. They think we have a 20-person dev team. It is just me and ConstructView.', author: 'Lisa Sung', role: 'Client Relations, BuildVision', initials: 'LS', color: '#ec4899' },
  ],

  // Security & Compliance
  securityFeatures: [
    { title: 'Encryption at Rest & Transit', desc: 'All model files and project data encrypted using AES-256 at rest and TLS 1.3 in transit.', icon: 'fa-shield-halved' },
    { title: 'Role-Based Access Control', desc: 'Granular permissions: Super Admin, Project Manager, Designer, Site Worker, Client, Read-Only. Every action is logged.', icon: 'fa-user-lock' },
    { title: 'Audit Logging', desc: 'Complete audit trail of who accessed which model, when, and what actions they performed. Exportable for compliance.', icon: 'fa-clipboard-list' },
    { title: 'On-Premise Deployment', desc: 'Enterprise customers can deploy ConstructView on their own infrastructure. Data never leaves your network.', icon: 'fa-server' },
    { title: 'SSO / SAML Integration', desc: 'Enterprise SSO via SAML 2.0, OpenID Connect, or LDAP. Integrate with your existing identity provider.', icon: 'fa-key' },
    { title: 'GDPR & ISO 27001 Ready', desc: 'Built with GDPR compliance in mind. Data residency options. ISO 27001-aligned security practices.', icon: 'fa-file-shield' },
  ],

  // Getting Started steps
  gettingStarted: [
    { step: '1', title: 'Upload Your First Model', desc: 'Drag and drop any BIM/CAD file — IFC, RVT, DWG, SKP, GLB. The 3D viewer renders it instantly in your browser. No software to install. No training needed.', icon: 'fa-cloud-arrow-up' },
    { step: '2', title: 'Explore with Interactive Tools', desc: 'Orbit around the model. Walk through rooms. Slice sections to see inside. Measure distances. The entire toolset is point-and-click intuitive.', icon: 'fa-magnifying-glass' },
    { step: '3', title: 'Invite Your Team & Clients', desc: 'Add team members with specific roles. Share a link with clients — they can view the 3D model without creating an account. Set permissions per project.', icon: 'fa-user-plus' },
    { step: '4', title: 'Brand It as Your Own', desc: 'Go to Settings. Upload your logo. Pick your colors. Set your custom domain. In 5 minutes the platform looks like you built it from scratch.', icon: 'fa-palette' },
  ],

  // Awards & recognition
  awards: [
    { title: 'Best Construction Tech', org: 'NAREDCO', year: '2026' },
    { title: 'Top BIM Platform', org: 'CIO Review India', year: '2026' },
    { title: 'Innovation in Infrastructure', org: 'FICCI', year: '2025' },
    { title: 'Engineering Excellence', org: 'IEI', year: '2025' },
  ],

  // Roadmap items
  roadmap: [
    { title: '4D Construction Sequencing', status: 'In Development', eta: 'Q4 2026', desc: 'Link your 3D model to a construction schedule. See the building rise floor-by-floor over time.' },
    { title: 'AI Quantity Takeoff', status: 'In Development', eta: 'Q4 2026', desc: 'Upload your BIM model and get automatic concrete, steel, and material quantity estimates.' },
    { title: 'Drone Point Cloud Overlay', status: 'Planned', eta: 'Q1 2027', desc: 'Overlay drone survey point clouds on your 3D model for real-time progress verification.' },
    { title: 'VR Headset Support (WebXR)', status: 'Planned', eta: 'Q2 2027', desc: 'Put on a Meta Quest or Apple Vision Pro and walk through your project at 1:1 scale.' },
    { title: 'Generative Design Integration', status: 'Research', eta: 'TBD', desc: 'AI-powered design alternatives based on your constraints — explore 100 options in minutes.' },
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
