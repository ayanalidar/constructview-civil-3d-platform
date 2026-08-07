// ==============================================
// ConstructView — Core Application Logic
// ==============================================

document.addEventListener('DOMContentLoaded', () => {
  try {
    const start = performance.now();
    applyBrandColors();
    initSidebar();
    initPage();
    const elapsed = (performance.now() - start).toFixed(0);
    // Set status indicator
    const status = document.getElementById('topBarStatus');
    if (status) { status.textContent = 'Ready'; status.style.color = 'var(--color-accent)'; }
    console.log('%c[ConstructView] %cInit OK %c' + elapsed + 'ms', 'color:#0ea5e9;font-weight:bold', 'color:#10b981', 'color:#888');
  } catch (err) {
    const msg = 'Init Error: ' + err.message;
    console.error('[ConstructView]', err);
    const status = document.getElementById('topBarStatus');
    if (status) { status.textContent = msg; status.style.color = '#ef4444'; }
    // Also show in first stat card
    const sp = document.getElementById('statProjects');
    if (sp) sp.textContent = 'ERR';
  }
});

// ================ SIDEBAR ================
function initSidebar() {
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');

  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      // Store preference
      localStorage.setItem('sidebar-collapsed', sidebar.classList.contains('collapsed'));
    });

    // Restore state
    if (localStorage.getItem('sidebar-collapsed') === 'true') {
      sidebar.classList.add('collapsed');
    }
  }

  // Highlight current nav item based on current page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item').forEach(item => {
    const href = item.getAttribute('href');
    if (href === currentPage) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// ================ PAGE ROUTING ================
function initPage() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  console.log('[ConstructView] initPage: ' + currentPage);

  // Apply brand colors
  applyBrandColors();

  try {
    switch (currentPage) {
    case 'index.html':
    case '':
      initDashboard();
      break;
    case 'projects.html':
      initProjects();
      break;
    case 'viewer.html':
      initViewer();
      // 3D engine (loaded as module, small delay to let module script execute)
      setTimeout(() => { if (window.initViewer3D) window.initViewer3D(); }, 50);
      break;
    case 'tasks.html':
      initTasks();
      break;
    case 'team.html':
      initTeam();
      break;
    case 'settings.html':
      initSettings();
      break;
  }
  } catch (err) {
    console.error('[ConstructView] Page init failed:', err);
    const sp = document.getElementById('statProjects');
    if (sp) sp.textContent = '❗';
  }
}

// ================ DASHBOARD ================
function initDashboard() {
  // Compute stats from real data
  const activeProjects = APP_DATA.projects.filter(p => p.status === 'active').length;
  const totalModels = APP_DATA.projects.reduce((sum, p) => sum + p.models, 0);
  const totalBudget = APP_DATA.projects.reduce((sum, p) => sum + parseFloat(p.budget.replace(/[₹, Cr]/g, '')) || 0, 0);
  const openIssues = APP_DATA.tasks.filter(t => t.status === 'open').length;

  const sp = document.getElementById('statProjects');
  const sb = document.getElementById('statBudget');
  const sm = document.getElementById('statModels');
  const si = document.getElementById('statIssues');
  if (sp) sp.textContent = activeProjects;
  if (sb) sb.textContent = '₹ ' + Math.round(totalBudget) + 'Cr';
  if (sm) sm.textContent = totalModels;
  if (si) si.textContent = openIssues;

  // Recent projects list
  const container = document.getElementById('recentProjects');
  if (container) {
    const recentProjects = APP_DATA.projects.filter(p => p.status === 'active').slice(0, 4);
    container.innerHTML = recentProjects.map(p => `
      <div class="project-row" onclick="location.href='viewer.html?project=${p.id}'" style="cursor:pointer;">
        <div class="project-thumb" style="background: ${p.gradient}"><i class="fa-solid ${p.icon}"></i></div>
        <div class="project-info">
          <span class="project-name">${p.name}</span>
          <span class="project-meta">${capitalize(p.type)} · ${p.budget} · ${p.models} models</span>
        </div>
        <div class="project-progress">
          <div class="progress-bar"><div class="progress-fill" style="width:${p.progress}%"></div></div>
          <span>${p.progress}%</span>
        </div>
      </div>
    `).join('');
  }

  // Activity feed
  const feed = document.getElementById('activityFeed');
  if (feed) {
    const colors = { upload: 'accent', resolve: 'green', annotate: 'purple', flag: 'amber', update: 'accent', report: 'green', system: 'accent', clash: 'amber', estimate: 'purple', approve: 'green' };
    feed.innerHTML = APP_DATA.recentActivity.slice(0, 8).map(a => `
      <div class="activity-item">
        <div class="activity-dot ${colors[a.type] || 'accent'}"></div>
        <div class="activity-body">
          <span class="activity-text"><strong>${getTeamMember(a.user)?.name || a.user}</strong> ${a.action} — ${a.detail}</span>
          <span class="activity-time">${a.time}</span>
        </div>
      </div>
    `).join('');
  }

  // Type distribution from real data
  const distEl = document.getElementById('typeDistribution');
  if (distEl) {
    const typeColors = { residential: 'var(--color-accent)', infrastructure: '#f97316', healthcare: '#10b981', commercial: '#6366f1', industrial: '#8b5cf6' };
    const typeLabels = { residential: 'Residential', infrastructure: 'Infrastructure', healthcare: 'Healthcare', commercial: 'Commercial', industrial: 'Industrial' };
    const typeIcons = { residential: 'fa-house', infrastructure: 'fa-road', healthcare: 'fa-hospital', commercial: 'fa-building', industrial: 'fa-industry' };
    const counts = {};
    APP_DATA.projects.forEach(p => { counts[p.type] = (counts[p.type] || 0) + 1; });
    const max = Math.max(...Object.values(counts), 1);
    distEl.innerHTML = Object.entries(counts).map(([type, count]) => `
      <div class="type-bar-group">
        <div class="type-label"><i class="fa-solid ${typeIcons[type] || 'fa-folder'}"></i> ${typeLabels[type] || type}</div>
        <div class="type-bar-wrapper"><div class="type-bar" style="width:${(count/max*100)}%; --bar-color: ${typeColors[type] || 'var(--color-accent)'}"><span>${count}</span></div></div>
      </div>
    `).join('');
  }
}

// ================ PROJECTS PAGE ================
function initProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  renderProjectCards(grid, APP_DATA.projects);

  // Filter chips
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.dataset.filter;
      const filtered = filter === 'all'
        ? APP_DATA.projects
        : APP_DATA.projects.filter(p => p.type === filter);
      renderProjectCards(grid, filtered);
    });
  });

  // Search
  const searchInput = document.querySelector('#projectSearch input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const term = searchInput.value.toLowerCase();
      const filtered = APP_DATA.projects.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.client.toLowerCase().includes(term) ||
        p.location.toLowerCase().includes(term)
      );
      renderProjectCards(grid, filtered);
    });
  }
}

function renderProjectCards(grid, projects) {
  grid.innerHTML = projects.map(p => `
    <div class="project-card" onclick="location.href='viewer.html?project=${p.id}'">
      <div class="project-card-header" style="background: ${p.gradient}">
        <i class="fa-solid ${p.icon} project-card-icon"></i>
        <span class="project-card-type">${capitalize(p.type)}</span>
      </div>
      <div class="project-card-body">
        <h4>${p.name}</h4>
        <p>${p.client} · ${p.location}</p>
        <p style="font-size:0.75rem;color:var(--color-text-muted);margin-top:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${p.description || ''}</p>
        <div class="project-card-meta">
          <span><i class="fa-solid fa-cubes"></i> ${p.models}</span>
          <span><i class="fa-solid fa-indian-rupee-sign"></i> ${p.budget}</span>
        </div>
        <div class="progress-bar" style="width:100%;margin-top:8px;">
          <div class="progress-fill" style="width:${p.progress}%"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.7rem;color:var(--color-text-muted);margin-top:4px;">
          <span>${p.progress}% complete</span>
          <span>${p.models_list ? p.models_list.length : 0} recent uploads</span>
        </div>
      </div>
    </div>
  `).join('');
}

// ================ 3D VIEWER PAGE ================
function initViewer() {
  // File upload zone
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const filesList = document.getElementById('uploadedFiles');
  const canvas = document.getElementById('viewerCanvas');
  let uploadedFiles = [];

  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--color-accent)';
      dropZone.style.background = 'rgba(14, 165, 233, 0.08)';
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.style.borderColor = 'var(--color-border-light)';
      dropZone.style.background = 'var(--color-bg-input)';
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--color-border-light)';
      dropZone.style.background = 'var(--color-bg-input)';
      handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', () => handleFiles(fileInput.files));
  }

  function handleFiles(files) {
    for (const file of files) {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      const supported = APP_DATA.supportedFormats.find(f => f.ext === ext);
      if (supported) {
        uploadedFiles.push({ name: file.name, format: supported.label });
      }
    }
    renderUploadedFiles();
    updateViewerState();
  }

  function renderUploadedFiles() {
    if (!filesList) return;
    filesList.innerHTML = uploadedFiles.map(f => `
      <div class="uploaded-file">
        <span><i class="fa-solid fa-file-lines"></i> ${f.name}</span>
        <span style="font-size:0.7rem;color:var(--color-text-muted)">${f.format}</span>
      </div>
    `).join('');
  }

  function updateViewerState() {
    if (!canvas) return;
    if (uploadedFiles.length > 0) {
      const placeholder = canvas.querySelector('.viewer-placeholder');
      if (placeholder) {
        placeholder.innerHTML = `
          <i class="fa-solid fa-cube" style="color:var(--color-accent)"></i>
          <h3>${uploadedFiles.length} file(s) loaded</h3>
          <p>Model rendered in WebGL viewport. Use tools below to navigate, measure, and annotate.</p>
          <div style="margin-top:1rem;display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;">
            <button class="btn btn-outline btn-sm" onclick="showModal('section-cut-modal')">
              <i class="fa-solid fa-scissors"></i> Section Cut
            </button>
            <button class="btn btn-outline btn-sm">
              <i class="fa-solid fa-ruler"></i> Measure
            </button>
            <button class="btn btn-accent btn-sm">
              <i class="fa-solid fa-person-walking"></i> Walkthrough
            </button>
          </div>
        `;
      }
    }
  }

  // Toolbar buttons
  document.querySelectorAll('.viewer-toolbar .btn-icon').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.viewer-toolbar .btn-icon').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Load project context from URL
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('project');
  if (projectId) {
    const project = getProject(projectId);
    if (project) {
      const infoEl = document.getElementById('viewerProjectInfo');
      if (infoEl) {
        infoEl.innerHTML = `<strong>${project.name}</strong> · ${project.client} · ${project.models} models loaded`;
      }
    }
  }
}

// ================ TASKS PAGE ================
function initTasks() {
  const tbody = document.getElementById('tasksTableBody');
  if (!tbody) return;

  renderTasksTable(tbody, APP_DATA.tasks);

  // Filter chips
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.dataset.filter;
      const filtered = filter === 'all'
        ? APP_DATA.tasks
        : APP_DATA.tasks.filter(t => t.status === filter);
      renderTasksTable(tbody, filtered);
    });
  });
}

function renderTasksTable(tbody, tasks) {
  const statusLabels = {
    'open': 'Open',
    'in-progress': 'In Progress',
    'resolved': 'Resolved',
    'closed': 'Closed',
  };

  tbody.innerHTML = tasks.map(t => {
    const assignee = getTeamMember(t.assignee);
    return `
      <tr>
        <td>
          <span class="priority-dot ${t.priority}"></span>
          <strong>${t.title}</strong>
        </td>
        <td><span class="status-badge ${t.status}">${statusLabels[t.status]}</span></td>
        <td>${t.project}</td>
        <td>${assignee ? assignee.name : t.assignee}</td>
        <td>${formatDate(t.due)}</td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="viewTask('${t.id}')">
            <i class="fa-solid fa-arrow-right"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function viewTask(taskId) {
  const task = APP_DATA.tasks.find(t => t.id === taskId);
  if (task) {
    alert(`Task: ${task.title}\nProject: ${task.project}\nStatus: ${task.status}\nDue: ${formatDate(task.due)}`);
  }
}

// ================ TEAM PAGE ================
function initTeam() {
  const grid = document.getElementById('teamGrid');
  if (!grid) return;

  grid.innerHTML = APP_DATA.team.map(m => `
    <div class="member-card">
      <div class="member-avatar" style="background:${m.color}">${m.initials}</div>
      <div class="member-detail">
        <h4>${m.name}</h4>
        <div class="member-role">${m.role}</div>
        <div class="member-projects">${m.projects} active projects · ${m.email}</div>
      </div>
      <span class="status-badge ${m.status === 'active' ? 'resolved' : 'closed'}" style="font-size:0.7rem;">
        ${m.status}
      </span>
    </div>
  `).join('');
}

// ================ SETTINGS PAGE ================
function initSettings() {
  const brand = APP_DATA.brand;

  // Fill brand inputs
  const brandNameInput = document.getElementById('brandNameInput');
  const primaryColorInput = document.getElementById('primaryColorInput');
  const accentColorInput = document.getElementById('accentColorInput');
  const domainInput = document.getElementById('domainInput');

  if (brandNameInput) brandNameInput.value = brand.name;
  if (primaryColorInput) primaryColorInput.value = brand.primaryColor;
  if (accentColorInput) accentColorInput.value = brand.accentColor;
  if (domainInput) domainInput.value = brand.domain;

  // Live preview as user edits
  if (brandNameInput) {
    brandNameInput.addEventListener('input', () => {
      APP_DATA.brand.name = brandNameInput.value;
      applyBrandColors();
    });
  }

  if (primaryColorInput) {
    primaryColorInput.addEventListener('input', () => {
      APP_DATA.brand.primaryColor = primaryColorInput.value;
      applyBrandColors();
    });
  }

  if (accentColorInput) {
    accentColorInput.addEventListener('input', () => {
      APP_DATA.brand.accentColor = accentColorInput.value;
      applyBrandColors();
    });
  }

  // Color presets
  const presetsEl = document.getElementById('colorPresets');
  if (presetsEl) {
    APP_DATA.themePresets.forEach(preset => {
      const dot = document.createElement('button');
      dot.className = 'color-preset';
      dot.style.background = preset.primary;
      dot.title = preset.name;
      dot.addEventListener('click', () => {
        APP_DATA.brand.primaryColor = preset.primary;
        APP_DATA.brand.accentColor = preset.accent;
        if (primaryColorInput) primaryColorInput.value = preset.primary;
        if (accentColorInput) accentColorInput.value = preset.accent;
        applyBrandColors();
        // Update selected state
        document.querySelectorAll('.color-preset').forEach(p => p.classList.remove('selected'));
        dot.classList.add('selected');
      });
      presetsEl.appendChild(dot);
    });
  }

  // Save settings
  const saveBtn = document.getElementById('saveSettings');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      APP_DATA.brand.primaryColor = primaryColorInput?.value || APP_DATA.brand.primaryColor;
      APP_DATA.brand.accentColor = accentColorInput?.value || APP_DATA.brand.accentColor;
      applyBrandColors();
      showToast('Settings saved', 'Branding and theme updated successfully.');
    });
  }

  // Reset button
  const resetBtn = document.getElementById('resetSettings');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      APP_DATA.brand.name = 'ConstructView';
      APP_DATA.brand.primaryColor = '#0ea5e9';
      APP_DATA.brand.accentColor = '#0ea5e9';
      if (brandNameInput) brandNameInput.value = 'ConstructView';
      if (primaryColorInput) primaryColorInput.value = '#0ea5e9';
      if (accentColorInput) accentColorInput.value = '#0ea5e9';
      applyBrandColors();
      document.querySelectorAll('.color-preset').forEach(p => p.classList.remove('selected'));
      showToast('Reset', 'Restored default brand settings.');
    });
  }
}

// ================ MODALS ================
function showModal(modalId) {
  const existing = document.querySelector('.modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal" id="${modalId}"></div>`;
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.body.appendChild(overlay);

  const modal = document.getElementById(modalId);

  // Section cut modal
  if (modalId === 'section-cut-modal') {
    modal.innerHTML = `
      <h3>Section Cut Tool</h3>
      <div class="form-group">
        <label>Cut Axis</label>
        <select>
          <option>X-Axis (front/back)</option>
          <option>Y-Axis (left/right)</option>
          <option>Z-Axis (top/bottom)</option>
        </select>
      </div>
      <div class="form-group">
        <label>Position</label>
        <input type="range" min="0" max="100" value="50" style="width:100%">
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" checked> Show cut plane
        </label>
      </div>
      <p style="font-size:0.8rem;color:var(--color-text-muted);margin-top:0.5rem;">
        This will create a real-time cross-section view of the loaded 3D model.
      </p>
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-accent" onclick="closeModal()">Apply Cut</button>
      </div>
    `;
  }
}

function closeModal() {
  const overlay = document.querySelector('.modal-overlay');
  if (overlay) overlay.remove();
}

// ================ TOAST ================
function showToast(title, message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-md) var(--space-lg);
    box-shadow: var(--shadow-lg);
    z-index: 2000;
    min-width: 280px;
    animation: fadeInUp 0.3s ease;
  `;
  toast.innerHTML = `
    <div style="font-weight:600;font-size:0.9rem;margin-bottom:2px;color:var(--color-text)">${title}</div>
    <div style="font-size:0.8rem;color:var(--color-text-secondary)">${message}</div>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ================ KEYBOARD SHORTCUTS ================
document.addEventListener('keydown', (e) => {
  // Escape to close modal
  if (e.key === 'Escape') {
    closeModal();
  }

  // Ctrl+K or / for search
  if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !e.target.closest('input, textarea'))) {
    e.preventDefault();
    const searchInput = document.querySelector('#projectSearch input');
    if (searchInput) searchInput.focus();
  }

  // Ctrl+B toggle sidebar
  if (e.ctrlKey && e.key === 'b') {
    e.preventDefault();
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('collapsed');
  }
});

// Utility
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Export for inline handlers
window.showModal = showModal;
window.closeModal = closeModal;
window.viewTask = viewTask;
