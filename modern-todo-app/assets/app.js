const STORAGE_KEY = 'focusflow.tasks.v1';
const THEME_KEY = 'focusflow.theme';
const createId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const form = document.querySelector('#task-form');
const titleInput = document.querySelector('#task-title');
const notesInput = document.querySelector('#task-notes');
const dueInput = document.querySelector('#task-due');
const priorityInput = document.querySelector('#task-priority');
const titleError = document.querySelector('#title-error');
const resetBtn = document.querySelector('#reset-btn');
const taskList = document.querySelector('#task-list');
const taskTemplate = document.querySelector('#task-template');
const taskCount = document.querySelector('#task-count');
const emptyState = document.querySelector('#empty-state');
const filterButtons = document.querySelectorAll('.filter-btn');
const searchInput = document.querySelector('#search-input');
const clearCompletedBtn = document.querySelector('#clear-completed');
const exportBtn = document.querySelector('#export-tasks');
const importBtn = document.querySelector('#import-tasks');
const importInput = document.querySelector('#import-file');
const themeToggle = document.querySelector('#theme-toggle');
const completionScore = document.querySelector('#completion-score');
const summaryMeta = document.querySelector('#summary-meta');
const editDialog = document.querySelector('#edit-dialog');
const editForm = document.querySelector('#edit-form');
const editTitle = document.querySelector('#edit-title');
const editNotes = document.querySelector('#edit-notes');
const editDue = document.querySelector('#edit-due');
const editPriority = document.querySelector('#edit-priority');

let tasks = loadTasks();
let activeFilter = 'all';
let searchTerm = '';
let editingTaskId = null;
let statusTimeoutId = null;
let theme = loadTheme();

summaryMeta.dataset.custom = 'false';

applyTheme(theme);
updateThemeToggleLabel();

render();

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) {
    titleError.textContent = 'Give your task a clear, action-oriented name.';
    titleInput.focus();
    return;
  }

  const task = {
    id: createId(),
    title,
    notes: notesInput.value.trim(),
    due: dueInput.value,
    priority: priorityInput.value,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  tasks = [task, ...tasks];
  saveTasks();
  form.reset();
  titleInput.focus();
  render();
});

resetBtn.addEventListener('click', () => {
  titleError.textContent = '';
});

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    render();
  });
});

searchInput.addEventListener('input', (event) => {
  searchTerm = event.target.value.trim().toLowerCase();
  render();
});

clearCompletedBtn.addEventListener('click', () => {
  if (!tasks.some((task) => task.completed)) return;
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  render();
  setStatusMessage('Cleared completed tasks.');
});

exportBtn.addEventListener('click', () => {
  if (tasks.length === 0) {
    setStatusMessage('No tasks to export yet.');
    return;
  }
  const payload = {
    exportedAt: new Date().toISOString(),
    theme,
    tasks,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const stamp = new Date().toISOString().replace(/[.:]/g, '-');
  link.href = url;
  link.download = `focusflow-tasks-${stamp}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  setStatusMessage('Export ready — JSON download started.');
});

importBtn.addEventListener('click', () => {
  importInput.click();
});

importInput.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const importedTasks = normalizeImportedTasks(parsed);
    if (importedTasks.length === 0) {
      setStatusMessage('No valid tasks found in the file.');
      return;
    }
    tasks = importedTasks;
    saveTasks();
    render();
    if (parsed && typeof parsed === 'object' && (parsed.theme === 'light' || parsed.theme === 'dark')) {
      theme = parsed.theme;
      applyTheme(theme);
      saveTheme(theme);
      updateThemeToggleLabel();
    }
    setStatusMessage(`Imported ${importedTasks.length} task${importedTasks.length === 1 ? '' : 's'}.`);
  } catch (error) {
    console.warn('Import failed', error);
    setStatusMessage('Import failed — ensure the file is a FocusFlow export.');
  } finally {
    importInput.value = '';
  }
});

themeToggle.addEventListener('click', () => {
  theme = theme === 'dark' ? 'light' : 'dark';
  applyTheme(theme);
  saveTheme(theme);
  updateThemeToggleLabel();
  setStatusMessage(`Switched to ${theme} theme.`);
});

const themeMediaQuery = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)');
if (themeMediaQuery) {
  const handleThemePreference = (event) => {
    if (localStorage.getItem(THEME_KEY)) return;
    theme = event.matches ? 'light' : 'dark';
    applyTheme(theme);
    updateThemeToggleLabel();
  };
  if (typeof themeMediaQuery.addEventListener === 'function') {
    themeMediaQuery.addEventListener('change', handleThemePreference);
  } else if (typeof themeMediaQuery.addListener === 'function') {
    themeMediaQuery.addListener(handleThemePreference);
  }
}

window.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    searchInput.focus();
    setStatusMessage('Search focused — type to filter tasks.');
  }
});

taskList.addEventListener('click', (event) => {
  const listItem = event.target.closest('.task-item');
  if (!listItem) return;
  const taskId = listItem.dataset.id;
  if (event.target.matches('input[type="checkbox"], input[type="checkbox"] + span')) {
    toggleTask(taskId);
  }
  if (event.target.closest('.delete')) {
    deleteTask(taskId);
  }
  if (event.target.closest('.edit')) {
    openEditDialog(taskId);
  }
});

editForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!editingTaskId) return;
  const task = tasks.find((item) => item.id === editingTaskId);
  if (!task) return;

  task.title = editTitle.value.trim();
  task.notes = editNotes.value.trim();
  task.due = editDue.value;
  task.priority = editPriority.value;
  task.updatedAt = new Date().toISOString();

  saveTasks();
  editingTaskId = null;
  editDialog.close();
  render();
});

editDialog.addEventListener('close', () => {
  editingTaskId = null;
});

function loadTasks() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to parse stored tasks', error);
    }
  }
  // Seed with inspiration examples for recruiters to explore.
  return [
    {
      id: createId(),
      title: 'Audit empty, loading, and error UI states',
      notes: 'Capture screenshots for the case study doc and ensure ARIA labels are present.',
      due: new Date().toISOString().slice(0, 10),
      priority: 'high',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: createId(),
      title: 'Record todo-app demo GIF',
      notes: 'Capture workflow for the README and share with recruiters.',
      due: '',
      priority: 'medium',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function toggleTask(taskId) {
  tasks = tasks.map((task) =>
    task.id === taskId
      ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
      : task
  );
  saveTasks();
  render();
}

function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks();
  render();
}

function openEditDialog(taskId) {
  const task = tasks.find((item) => item.id === taskId);
  if (!task) return;
  editingTaskId = taskId;
  editTitle.value = task.title;
  editNotes.value = task.notes;
  editDue.value = task.due || '';
  editPriority.value = task.priority;
  if (typeof editDialog.showModal === 'function') {
    editDialog.showModal();
  } else {
    alert('Edit dialog not supported in this browser.');
  }
}

function render() {
  const filtered = applyFilters(tasks);
  taskList.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
  }

  const fragment = document.createDocumentFragment();
  filtered.forEach((task) => {
    const clone = taskTemplate.content.firstElementChild.cloneNode(true);
    clone.dataset.id = task.id;
    const checkbox = clone.querySelector('input[type="checkbox"]');
    checkbox.checked = task.completed;
    clone.classList.toggle('completed', task.completed);

    clone.querySelector('.task-title').textContent = task.title;
    const notesEl = clone.querySelector('.task-notes');
    notesEl.textContent = task.notes;
    notesEl.hidden = !task.notes;

    const dueEl = clone.querySelector('.due');
    if (task.due) {
      dueEl.textContent = `Due ${formatDate(task.due)}`;
      const isPastDue = new Date(task.due) < new Date() && !task.completed;
      dueEl.dataset.status = isPastDue ? 'overdue' : 'upcoming';
      dueEl.style.color = isPastDue ? 'var(--danger)' : 'var(--text-muted)';
    } else {
      dueEl.textContent = 'No due date';
      dueEl.dataset.status = '';
      dueEl.style.color = 'var(--text-muted)';
    }

    const priorityEl = clone.querySelector('.priority');
    priorityEl.textContent = `${capitalize(task.priority)} priority`;
    priorityEl.dataset.priority = task.priority;

    const createdEl = clone.querySelector('.created');
    createdEl.textContent = `Updated ${timeAgo(task.updatedAt)}`;

    fragment.appendChild(clone);
  });

  taskList.appendChild(fragment);
  updateStats();
}

function applyFilters(list) {
  return list
    .filter((task) => {
      if (activeFilter === 'active') return !task.completed;
      if (activeFilter === 'completed') return task.completed;
      return true;
    })
    .filter((task) => {
      if (!searchTerm) return true;
      return (
        task.title.toLowerCase().includes(searchTerm) ||
        task.notes.toLowerCase().includes(searchTerm)
      );
    })
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.due && b.due) return a.due.localeCompare(b.due);
      if (a.due) return -1;
      if (b.due) return 1;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const active = total - completed;

  taskCount.textContent = `${total} ${total === 1 ? 'task' : 'tasks'} · ${completed} completed · ${active} active`;

  if (total === 0) {
    completionScore.textContent = '0%';
    if (summaryMeta.dataset.custom !== 'true') {
      summaryMeta.textContent = 'No tasks yet – add your first below.';
    }
    return;
  }
  const percent = Math.round((completed / total) * 100);
  completionScore.textContent = `${percent}%`;

  if (summaryMeta.dataset.custom === 'true') {
    return;
  }
  if (completed === total) {
    summaryMeta.textContent = 'All done! Capture your retrospective notes.';
  } else if (active === total) {
    summaryMeta.textContent = 'Focus time! Prioritize high-impact tasks to get momentum going.';
  } else {
    summaryMeta.textContent = `Keep going — ${active} task${active === 1 ? '' : 's'} left.`;
  }
}

function timeAgo(isoString) {
  const now = new Date();
  const then = new Date(isoString);
  const seconds = Math.floor((now - then) / 1000);
  if (Number.isNaN(seconds)) return '';
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  return 'Just now';
}

function formatDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY) {
    tasks = loadTasks();
    render();
  }
});

function setStatusMessage(message) {
  clearTimeout(statusTimeoutId);
  summaryMeta.dataset.custom = 'true';
  summaryMeta.textContent = message;
  statusTimeoutId = setTimeout(() => {
    summaryMeta.dataset.custom = 'false';
    updateStats();
  }, 4000);
}

function loadTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

function saveTheme(value) {
  localStorage.setItem(THEME_KEY, value);
}

function applyTheme(value) {
  document.body.dataset.theme = value;
}

function updateThemeToggleLabel() {
  if (!themeToggle) return;
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  const icon = theme === 'dark' ? '🌙' : '🌞';
  themeToggle.innerHTML = `<span class="theme-icon" aria-hidden="true">${icon}</span>Switch to ${nextTheme} theme`;
  themeToggle.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
}

function normalizeImportedTasks(data) {
  let items = [];
  if (Array.isArray(data)) {
    items = data;
  } else if (Array.isArray(data?.tasks)) {
    items = data.tasks;
  }

  return items
    .map((entry) => {
      if (typeof entry !== 'object' || entry === null) return null;
      const title = typeof entry.title === 'string' ? entry.title.trim() : '';
      if (!title) return null;
      return {
        id: entry.id && typeof entry.id === 'string' ? entry.id : createId(),
        title,
        notes: typeof entry.notes === 'string' ? entry.notes : '',
        due: typeof entry.due === 'string' ? entry.due : '',
        priority: ['high', 'medium', 'low'].includes(entry.priority) ? entry.priority : 'medium',
        completed: Boolean(entry.completed),
        createdAt:
          typeof entry.createdAt === 'string' && !Number.isNaN(Date.parse(entry.createdAt))
            ? entry.createdAt
            : new Date().toISOString(),
        updatedAt:
          typeof entry.updatedAt === 'string' && !Number.isNaN(Date.parse(entry.updatedAt))
            ? entry.updatedAt
            : new Date().toISOString(),
      };
    })
    .filter(Boolean);
}
