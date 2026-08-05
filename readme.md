# ConstructView — Civil 3D Construction Platform

White-label 3D visualization and project management platform for civil services companies. Supports residential, infrastructure, healthcare, commercial, and industrial project types.

## Quick Start

Open any `.html` file directly in your browser:

```bash
# Easiest — just double-click in Explorer:
index.html

# Or serve locally (optional, for CORS if needed):
npx serve .
```

No build step, no dependencies — all pages are self-contained HTML with shared CSS/JS.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Dashboard — stats, recent projects, activity feed |
| `projects.html` | Project catalog — filter/sort across all project types |
| `viewer.html` | 3D Viewer — file upload, layer control, section cuts, annotation |
| `tasks.html` | Task board — issue tracking per project with status flow |
| `team.html` | Team directory — members, roles, active projects |
| `settings.html` | White-label control — brand name, colors, roles, watermarking |

## File Structure

```
construction-3d-platform/
├── index.html          # Dashboard
├── projects.html       # Project catalog
├── viewer.html         # 3D Model Viewer
├── tasks.html          # Task/Issue Board
├── team.html           # Team Directory
├── settings.html       # White-Label Settings
├── css/
│   └── style.css       # Full design system (CSS variables, responsive, dark theme)
├── js/
│   ├── data.js         # Application state & brand config
│   └── app.js          # Core logic (routing, events, modal, toast, keyboard shortcuts)
└── README.md
```

## Customization Guide

### Replace Branding (per-client white-label)

1. Open `settings.html` in the browser
2. Use the White-Label Settings panel to change:
   - **Platform name** → sidebar brand text updates live
   - **Primary color** → all accent elements, buttons, highlights
   - **Accent color** → chart bars, active states
   - **Custom domain** → set for production deployment
3. Click "Save Changes" or use the 8 preset color swatches

### Programmatic Branding

Edit `js/data.js` → `APP_DATA.brand`:

```js
brand: {
  name: 'YourClientName',
  primaryColor: '#10b981',  // change this hex
  accentColor: '#10b981',
  domain: 'app.client.com',
}
```

### Add/Remove Projects

Edit `js/data.js` → `APP_DATA.projects` array. Each project requires:

```js
{
  id: 'proj-xxx',
  name: 'Project Name',
  type: 'residential',     // residential|infrastructure|healthcare|commercial|industrial
  icon: 'fa-house',        // FontAwesome icon class
  gradient: 'linear-gradient(...)',
  client: 'Client Name',
  location: 'City, State',
  progress: 45,            // 0-100
  models: 12,
  status: 'active',        // active|planning|completed
  team: ['AJ', 'SC'],      // team member IDs
  startDate: '2026-01-01',
  targetDate: '2027-01-01',
}
```

### Change Typography

Edit `css/style.css` → `:root` block:

```css
--font-display: 'YourFont', system-ui, sans-serif;
--font-mono: 'YourMonoFont', monospace;
```

### Theme Presets

8 built-in presets in `js/data.js` → `APP_DATA.themePresets`. Add more by following the `{ name, primary, accent }` pattern.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+K` or `/` | Focus search |
| `Esc` | Close modal |

## Quality Coverage

- ✅ Responsive: desktop (1024+), tablet (768-1024), mobile (<768)
- ✅ Dark theme with CSS variable design system
- ✅ Interactive states: hover, active, focus, disabled
- ✅ Empty states: no models, no files, no tasks
- ✅ Loading: fade-in animations on stat cards and project cards
- ✅ Error handling: file format validation on upload
- ✅ Keyboard: sidebar toggle, search focus, modal dismiss
- ✅ Toast notifications for save/reset actions
- ✅ Progress bars with animated width transitions
- ✅ Breadcrumb navigation on all pages
- ⚠️ 3D viewer is UI-complete — actual WebGL rendering requires Three.js/Babylon.js integration

## Production Integration

To make the 3D viewer fully functional, integrate one of:

- **Three.js** (`three.js` + `react-three-fiber` if React) — lightweight, flexible
- **Babylon.js** — stronger built-in BIM tooling
- **Autodesk Forge / Platform Services** — native Revit/DWG viewing in browser
- **That Open Company / IFC.js** — open-source IFC viewer

## Deployment

All files are static. Deploy to:

- **Vercel**: Drag folder or `vercel --prod`
- **Netlify**: Drag folder to deploy
- **Cloudflare Pages**: Connect repo
- **S3 / Static hosting**: Upload all files, set `index.html` as default

No build step, no server — just static HTML/CSS/JS.

## License

Internal use. Customize per client.
