import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import {
  getAllComplaints,
  getActiveTeachers,
  assignComplaint,
} from './services/api';
import AdminLogin from './pages/AdminLogin';
import './App.css';

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const VIEWS = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'complaints', label: 'Complaints', icon: 'file' },
  { id: 'team', label: 'Team', icon: 'users' },
  { id: 'analytics', label: 'Analytics', icon: 'chart' },
];

const STATUSES = ['pending', 'assigned', 'in_progress', 'resolved', 'rejected'];
const PRIORITIES = ['critical', 'high', 'medium', 'low'];
const PRIORITY_RANK = { critical: 0, high: 1, medium: 2, low: 3 };
const STATUS_COLOR = {
  pending: 'var(--amber)',
  assigned: 'var(--violet)',
  in_progress: 'var(--blue)',
  resolved: 'var(--green)',
  rejected: 'var(--rose)',
};
const PRIORITY_COLOR = {
  critical: 'var(--rose)',
  high: 'var(--amber)',
  medium: 'var(--blue)',
  low: 'var(--green)',
};
const PAGE_SIZE = 20;

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

const Icon = ({ name, size = 20 }) => {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    chart: <><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-5 5" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.6 9A7 7 0 0 1 17 5l3 2M4 12l3 2a7 7 0 0 0 11.4 2" /></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></>,
    arrow: <path d="M7 17 17 7M7 7h10v10" />,
    check: <path d="m5 12 4 4L19 6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    alert: <><path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></>,
    close: <path d="m18 6-12 12M6 6l12 12" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />,
    command: <path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3Z" />,
    download: <><path d="M12 3v12m0 0-4-4m4 4 4-4" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></>,
    board: <><rect x="3" y="3" width="5" height="18" rx="1.5" /><rect x="10" y="3" width="5" height="12" rx="1.5" /><rect x="17" y="3" width="4" height="8" rx="1.5" /></>,
    list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
    spark: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />,
    pin: <><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" /><circle cx="12" cy="10" r="2.5" /></>,
    photo: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-9 9" /></>,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.grid}
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const pretty = (value = '') =>
  String(value).replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

const initials = (name = 'Admin') =>
  String(name).split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'A';

const formatDate = (date) => {
  if (!date) return 'Recently';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? 'Recently'
    : parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const timeAgo = (date) => {
  if (!date) return 'recently';
  const parsed = new Date(date).getTime();
  if (Number.isNaN(parsed)) return 'recently';
  const minutes = Math.max(1, Math.floor((Date.now() - parsed) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
};

const ageInDays = (date) => {
  const parsed = new Date(date).getTime();
  if (!date || Number.isNaN(parsed)) return 0;
  return Math.floor((Date.now() - parsed) / 86400000);
};

const isOpen = (item) => !['resolved', 'rejected'].includes(item.status);

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const csvCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;

/* ------------------------------------------------------------------ */
/* Small presentational components                                     */
/* ------------------------------------------------------------------ */

function Counter({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame;
    const start = performance.now();
    const from = 0;
    const duration = 700;

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{display}{suffix}</>;
}

function Donut({ segments, total, centerLabel }) {
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="donut">
      <svg viewBox="0 0 160 160" role="img" aria-label="Status distribution">
        <circle className="donut-track" cx="80" cy="80" r={radius} />
        {total > 0 && segments.filter((s) => s.value > 0).map((segment) => {
          const length = (segment.value / total) * circumference;
          const node = (
            <circle
              key={segment.label}
              className="donut-seg"
              cx="80"
              cy="80"
              r={radius}
              stroke={segment.color}
              strokeDasharray={`${Math.max(0, length - 3)} ${circumference - Math.max(0, length - 3)}`}
              strokeDashoffset={-offset}
            />
          );
          offset += length;
          return node;
        })}
      </svg>
      <div className="donut-center">
        <strong><Counter value={total} /></strong>
        <span>{centerLabel}</span>
      </div>
    </div>
  );
}

function Badge({ kind, value, children }) {
  return (
    <span className={`badge ${kind}-${value}`}>
      <i />{children || pretty(value)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */

function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const [view, setView] = useState('overview');
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('campussetu-theme') || 'dark';
    } catch {
      return 'dark';
    }
  });
  const [layout, setLayout] = useState('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedTeachers, setSelectedTeachers] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [assigningId, setAssigningId] = useState('');

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');
  const [paletteIndex, setPaletteIndex] = useState(0);

  const searchRef = useRef(null);
  const paletteRef = useRef(null);

  /* ----- auth ----- */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  /* ----- data ----- */
  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError('');

    try {
      const result = await getAllComplaints();
      setComplaints(result.issues || []);
    } catch (err) {
      setError(err.message || 'Could not load complaints.');
    }

    try {
      const result = await getActiveTeachers();
      setTeachers(result.teachers || []);
    } catch (err) {
      setTeachers([]);
      setError((previous) => previous || `Could not load teachers: ${err.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  /* ----- theme ----- */
  useEffect(() => {
    try {
      localStorage.setItem('campussetu-theme', theme);
    } catch {
      /* storage unavailable */
    }
  }, [theme]);

  /* ----- toast ----- */
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(timer);
  }, [toast]);

  /* ----- derived data ----- */
  const selectedComplaint = useMemo(
    () => complaints.find((item) => item._id === selectedId) || null,
    [complaints, selectedId]
  );

  const stats = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((i) => i.status === 'pending').length;
    const progress = complaints.filter((i) => ['assigned', 'in_progress'].includes(i.status)).length;
    const resolved = complaints.filter((i) => i.status === 'resolved').length;
    const rejected = complaints.filter((i) => i.status === 'rejected').length;
    const critical = complaints.filter((i) => i.priority === 'critical' && isOpen(i)).length;
    const pendingItems = complaints.filter((i) => i.status === 'pending');
    const avgPendingAge = pendingItems.length
      ? Math.round(pendingItems.reduce((sum, i) => sum + ageInDays(i.createdAt), 0) / pendingItems.length)
      : 0;
    const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;
    return { total, pending, progress, resolved, rejected, critical, avgPendingAge, resolutionRate };
  }, [complaints]);

  const statusCounts = useMemo(() => {
    const counts = { all: complaints.length };
    STATUSES.forEach((status) => {
      counts[status] = complaints.filter((i) => i.status === status).length;
    });
    return counts;
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    const term = search.trim().toLowerCase();

    const list = complaints.filter((item) => {
      const searchable = [
        item.complaintId, item.title, item.description, item.category,
        item.location, item.building, item.roomNumber,
        item.reportedBy?.name, item.reportedBy?.email, item.assignedTo?.name,
      ].filter(Boolean).join(' ').toLowerCase();

      return (
        (!term || searchable.includes(term)) &&
        (statusFilter === 'all' || item.status === statusFilter) &&
        (priorityFilter === 'all' || item.priority === priorityFilter)
      );
    });

    const byDate = (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    if (sortBy === 'oldest') list.sort((a, b) => -byDate(a, b));
    else if (sortBy === 'priority') {
      list.sort(
        (a, b) =>
          (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9) || byDate(a, b)
      );
    } else list.sort(byDate);

    return list;
  }, [complaints, search, statusFilter, priorityFilter, sortBy]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, statusFilter, priorityFilter, sortBy]);

  const teacherLoad = useMemo(() => {
    const map = new Map();
    teachers.forEach((teacher) => {
      map.set(teacher._id, { teacher, active: 0, resolved: 0 });
    });
    complaints.forEach((item) => {
      const id = item.assignedTo?._id;
      if (!id || !map.has(id)) return;
      const entry = map.get(id);
      if (['assigned', 'in_progress'].includes(item.status)) entry.active += 1;
      if (item.status === 'resolved') entry.resolved += 1;
    });
    return [...map.values()].sort((a, b) => a.active - b.active);
  }, [teachers, complaints]);

  const maxLoad = useMemo(
    () => Math.max(1, ...teacherLoad.map((entry) => entry.active)),
    [teacherLoad]
  );

  const trend = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i -= 1) {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - i);
      days.push({
        key: day.toDateString(),
        label: day.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        count: 0,
        resolved: 0,
      });
    }
    complaints.forEach((item) => {
      const created = new Date(item.createdAt);
      if (Number.isNaN(created.getTime())) return;
      const slot = days.find((d) => d.key === created.toDateString());
      if (slot) slot.count += 1;
      if (item.status === 'resolved') {
        const resolvedDate = new Date(item.resolvedAt || item.updatedAt || item.createdAt);
        const rslot = days.find((d) => d.key === resolvedDate.toDateString());
        if (rslot) rslot.resolved += 1;
      }
    });
    return days;
  }, [complaints]);

  const breakdown = useMemo(() => {
    const tally = (getter) => {
      const map = {};
      complaints.forEach((item) => {
        const key = getter(item);
        if (key) map[key] = (map[key] || 0) + 1;
      });
      return Object.entries(map).sort((a, b) => b[1] - a[1]);
    };
    return {
      categories: tally((i) => i.category).slice(0, 6),
      buildings: tally((i) => i.building).slice(0, 6),
    };
  }, [complaints]);

  const criticalList = useMemo(
    () => complaints.filter((i) => i.priority === 'critical' && isOpen(i)).slice(0, 4),
    [complaints]
  );

  const recent = useMemo(
    () => [...complaints].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 6),
    [complaints]
  );

  /* ----- actions ----- */
  const handleAssign = async (complaint) => {
    const id = complaint._id;
    const teacherId = selectedTeachers[id] || complaint.assignedTo?._id;

    if (!teacherId) {
      showToast('Select a teacher before assigning.', 'warn');
      return;
    }

    setAssigningId(id);
    try {
      await assignComplaint(id, teacherId);
      showToast('Complaint successfully assigned.');
      await loadData(false);
    } catch (err) {
      showToast(err.message || 'Assignment failed.', 'error');
    } finally {
      setAssigningId('');
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(false);
  }, [loadData]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      setError(err.message || 'Unable to sign out.');
    }
  };

  const goTo = useCallback((nextView, options = {}) => {
    setView(nextView);
    if (options.status) setStatusFilter(options.status);
    if (options.priority) setPriorityFilter(options.priority);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  const exportCsv = () => {
    const header = ['ID', 'Title', 'Category', 'Priority', 'Status', 'Reported by', 'Email', 'Assigned to', 'Building', 'Location', 'Room', 'Created'];
    const rows = filteredComplaints.map((i) => [
      i.complaintId || i._id, i.title, i.category, i.priority, i.status,
      i.reportedBy?.name, i.reportedBy?.email, i.assignedTo?.name,
      i.building, i.location, i.roomNumber, i.createdAt,
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `campussetu-complaints-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${rows.length} complaints.`);
  };

  /* ----- command palette ----- */
  const paletteItems = useMemo(() => {
    const term = paletteQuery.trim().toLowerCase();
    const commands = [
      { id: 'c-overview', group: 'Navigate', label: 'Go to Overview', icon: 'grid', run: () => goTo('overview') },
      { id: 'c-complaints', group: 'Navigate', label: 'Go to Complaints', icon: 'file', run: () => goTo('complaints') },
      { id: 'c-team', group: 'Navigate', label: 'Go to Team', icon: 'users', run: () => goTo('team') },
      { id: 'c-analytics', group: 'Navigate', label: 'Go to Analytics', icon: 'chart', run: () => goTo('analytics') },
      { id: 'c-pending', group: 'Quick filters', label: 'Show pending complaints', icon: 'clock', run: () => { resetFilters(); goTo('complaints', { status: 'pending' }); } },
      { id: 'c-critical', group: 'Quick filters', label: 'Show critical complaints', icon: 'alert', run: () => { resetFilters(); goTo('complaints', { priority: 'critical' }); } },
      { id: 'c-refresh', group: 'Actions', label: 'Refresh data', icon: 'refresh', run: handleRefresh },
      { id: 'c-theme', group: 'Actions', label: `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`, icon: theme === 'dark' ? 'sun' : 'moon', run: toggleTheme },
      { id: 'c-logout', group: 'Actions', label: 'Sign out', icon: 'logout', run: handleLogout },
    ].filter((command) => !term || command.label.toLowerCase().includes(term));

    const matches = term.length >= 2
      ? complaints
          .filter((item) =>
            [item.title, item.complaintId, item.reportedBy?.name, item.category]
              .filter(Boolean).join(' ').toLowerCase().includes(term)
          )
          .slice(0, 6)
          .map((item) => ({
            id: `m-${item._id}`,
            group: 'Complaints',
            label: item.title || 'Untitled complaint',
            hint: item.complaintId || item._id,
            icon: 'file',
            run: () => setSelectedId(item._id),
          }))
      : [];

    return [...matches, ...commands];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paletteQuery, complaints, theme, goTo, handleRefresh, toggleTheme]);

  const closePalette = () => {
    setPaletteOpen(false);
    setPaletteQuery('');
    setPaletteIndex(0);
  };

  const runPaletteItem = (item) => {
    if (!item) return;
    closePalette();
    item.run();
  };

  useEffect(() => {
    if (paletteOpen) setTimeout(() => paletteRef.current?.focus(), 30);
  }, [paletteOpen]);

  useEffect(() => {
    setPaletteIndex(0);
  }, [paletteQuery]);

  /* ----- global shortcuts ----- */
  useEffect(() => {
    if (!user) return undefined;

    const onKey = (event) => {
      const typing = ['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName);

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((open) => !open);
        return;
      }
      if (event.key === 'Escape') {
        if (paletteOpen) closePalette();
        else if (selectedId) setSelectedId(null);
        return;
      }
      if (event.key === '/' && !typing && !paletteOpen) {
        event.preventDefault();
        setView('complaints');
        setTimeout(() => searchRef.current?.focus(), 60);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, paletteOpen, selectedId]);

  /* ----- cursor spotlight on glow cards ----- */
  const handleMouseMove = (event) => {
    const card = event.target.closest?.('.glow');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    card.style.setProperty('--my', `${event.clientY - rect.top}px`);
  };

  /* ----- early returns ----- */
  if (!authReady) {
    return (
      <div className="boot-screen" data-theme={theme}>
        <div className="boot-mark">C<span>.</span></div>
        <div className="boot-bar"><span /></div>
        <small>Preparing your workspace…</small>
      </div>
    );
  }

  if (!user) return <AdminLogin />;

  const displayName = user.displayName || user.email?.split('@')[0] || 'Admin';
  const firstName = pretty(displayName.split(/[\s._-]/)[0]);

  /* ----- render helpers ----- */
  const renderAssign = (complaint, stretch = false) => {
    const teacherId = selectedTeachers[complaint._id] || complaint.assignedTo?._id || '';
    const busy = assigningId === complaint._id;

    if (!isOpen(complaint)) {
      return (
        <span className="closed-label">
          <Icon name="check" size={14} /> {complaint.status === 'resolved' ? 'Resolved' : 'Closed'}
          {complaint.assignedTo?.name ? ` · ${complaint.assignedTo.name}` : ''}
        </span>
      );
    }

    return (
      <div className={`assign-box ${stretch ? 'stretch' : ''}`}>
        <select
          value={teacherId}
          onChange={(event) =>
            setSelectedTeachers((previous) => ({ ...previous, [complaint._id]: event.target.value }))
          }
          aria-label={`Choose teacher for ${complaint.complaintId || complaint.title}`}
          disabled={!teachers.length}
        >
          <option value="">Select teacher</option>
          {teachers.map((teacher) => (
            <option key={teacher._id} value={teacher._id}>
              {teacher.name}{teacher.department ? ` · ${teacher.department}` : ''}
            </option>
          ))}
        </select>
        <button
          className="btn-assign"
          onClick={() => handleAssign(complaint)}
          disabled={!teachers.length || busy || !teacherId}
        >
          {busy ? <span className="spinner" /> : <Icon name="arrow" size={14} />}
          {busy ? 'Saving' : complaint.assignedTo ? 'Reassign' : 'Assign'}
        </button>
      </div>
    );
  };

  const renderRow = (complaint) => (
    <div className={`row prio-${complaint.priority || 'medium'}`} key={complaint._id}>
      <div className="cell cell-main">
        <div className="symbol">{initials(complaint.category || 'C')}</div>
        <div className="main-text">
          <button className="title-link" onClick={() => setSelectedId(complaint._id)}>
            {complaint.title || 'Untitled complaint'}
          </button>
          <span className="mono">{complaint.complaintId || complaint._id}</span>
          <small>
            {[complaint.building, complaint.location, complaint.roomNumber].filter(Boolean).join(' · ') ||
              complaint.category || 'Campus report'}
          </small>
        </div>
      </div>
      <div className="cell cell-person" data-label="Reported by">
        <strong>{complaint.reportedBy?.name || 'Unknown student'}</strong>
        <span>{complaint.reportedBy?.email || 'No email available'}</span>
      </div>
      <div className="cell cell-prio" data-label="Priority">
        <Badge kind="priority" value={complaint.priority || 'medium'} />
      </div>
      <div className="cell cell-status" data-label="Status">
        <Badge kind="status" value={complaint.status || 'pending'} />
      </div>
      <div className="cell cell-assign" data-label="Assignee">{renderAssign(complaint)}</div>
      <div className="cell cell-date" data-label="Reported">
        <span>{formatDate(complaint.createdAt)}</span>
        <small>{timeAgo(complaint.createdAt)}</small>
      </div>
    </div>
  );

  const renderCard = (complaint) => (
    <article className={`kcard prio-${complaint.priority || 'medium'}`} key={complaint._id}>
      <div className="kcard-top">
        <Badge kind="priority" value={complaint.priority || 'medium'} />
        <span className="mono">{complaint.complaintId || complaint._id.slice(-6)}</span>
      </div>
      <button className="title-link kcard-title" onClick={() => setSelectedId(complaint._id)}>
        {complaint.title || 'Untitled complaint'}
      </button>
      <small className="kcard-loc">
        <Icon name="pin" size={12} />
        {[complaint.building, complaint.location].filter(Boolean).join(' · ') || complaint.category || 'Campus'}
      </small>
      <div className="kcard-foot">
        <div className="mini-person">
          <div className="avatar xs">{initials(complaint.reportedBy?.name || 'S')}</div>
          <span>{complaint.reportedBy?.name || 'Unknown'}</span>
        </div>
        <span className="muted-xs">{timeAgo(complaint.createdAt)}</span>
      </div>
      {complaint.assignedTo?.name && (
        <div className="kcard-assignee"><Icon name="users" size={12} /> {complaint.assignedTo.name}</div>
      )}
    </article>
  );

  const statSegments = [
    { label: 'Pending', value: stats.pending, color: STATUS_COLOR.pending },
    { label: 'In progress', value: stats.progress, color: STATUS_COLOR.in_progress },
    { label: 'Resolved', value: stats.resolved, color: STATUS_COLOR.resolved },
    { label: 'Rejected', value: stats.rejected, color: STATUS_COLOR.rejected },
  ];

  const maxTrend = Math.max(1, ...trend.map((d) => d.count));
  const visibleComplaints = filteredComplaints.slice(0, visibleCount);

  /* ----- views ----- */
  const overview = (
    <>
      <section className="hero glow">
        <div className="hero-copy">
          <div className="eyebrow"><i /> CAMPUS OPERATIONS CENTER</div>
          <h1>
            {greeting()}, <span className="grad-text">{firstName}.</span>
          </h1>
          <p>
            {loading
              ? 'Syncing the latest reports from campus…'
              : stats.total === 0
                ? 'No complaints have come in yet. Your campus is quiet.'
                : `${stats.pending} ${stats.pending === 1 ? 'complaint needs' : 'complaints need'} assignment and ${stats.critical} ${stats.critical === 1 ? 'issue is' : 'issues are'} critical. ${stats.resolutionRate}% of all reports are resolved.`}
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => goTo('complaints', { status: 'pending' })}>
              Review pending <Icon name="arrow" size={15} />
            </button>
            <button className="btn-ghost" onClick={() => setPaletteOpen(true)}>
              <Icon name="command" size={15} /> Command menu <kbd>Ctrl K</kbd>
            </button>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="orbit o1"><i /></div>
          <div className="orbit o2"><i /></div>
          <div className="orbit o3"><i /></div>
          <div className="core">
            <svg viewBox="0 0 120 120">
              <circle className="core-track" cx="60" cy="60" r="52" />
              <circle
                className="core-fill"
                cx="60" cy="60" r="52"
                strokeDasharray={`${(stats.resolutionRate / 100) * 326.7} 326.7`}
              />
            </svg>
            <div className="core-text">
              <strong><Counter value={stats.resolutionRate} suffix="%" /></strong>
              <span>resolved</span>
            </div>
          </div>
          <div className="float-chip fc1"><b>{stats.pending}</b><small>Need attention</small></div>
          <div className="float-chip fc2"><b>{teachers.length}</b><small>Teachers online</small></div>
        </div>
      </section>

      <section className="stats-grid">
        {[
          { label: 'Total complaints', value: stats.total, icon: 'file', tone: 'violet', foot: 'All reports received', pct: 100 },
          { label: 'Awaiting action', value: stats.pending, icon: 'clock', tone: 'amber', foot: 'Pending assignment', pct: stats.total ? (stats.pending / stats.total) * 100 : 0, go: 'pending' },
          { label: 'In progress', value: stats.progress, icon: 'chart', tone: 'blue', foot: 'Assigned to teachers', pct: stats.total ? (stats.progress / stats.total) * 100 : 0, go: 'in_progress' },
          { label: 'Resolved', value: stats.resolved, icon: 'check', tone: 'green', foot: 'Closed successfully', pct: stats.total ? (stats.resolved / stats.total) * 100 : 0, go: 'resolved' },
        ].map((card) => (
          <article
            className={`stat glow tone-${card.tone} ${card.go ? 'clickable' : ''}`}
            key={card.label}
            onClick={card.go ? () => { resetFilters(); goTo('complaints', { status: card.go }); } : undefined}
          >
            <div className="stat-top">
              <span>{card.label}</span>
              <div className="stat-icon"><Icon name={card.icon} size={18} /></div>
            </div>
            <div className="stat-num">{loading ? '—' : <Counter value={card.value} />}</div>
            <div className="stat-foot">{card.foot}</div>
            <div className="meter"><span style={{ width: `${Math.min(100, card.pct)}%` }} /></div>
          </article>
        ))}
      </section>

      <section className="grid-3">
        <article className="panel glow">
          <header className="panel-head">
            <div><div className="kicker">DISTRIBUTION</div><h3>Status breakdown</h3></div>
          </header>
          <div className="donut-wrap">
            <Donut segments={statSegments} total={stats.total} centerLabel="complaints" />
            <ul className="legend">
              {statSegments.map((segment) => (
                <li key={segment.label}>
                  <i style={{ background: segment.color }} />
                  <span>{segment.label}</span>
                  <b>{segment.value}</b>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <article className={`panel glow watch ${stats.critical ? 'is-hot' : 'is-clear'}`}>
          <header className="panel-head">
            <div><div className="kicker">PRIORITY WATCH</div><h3>{stats.critical ? 'Critical queue' : 'All clear'}</h3></div>
            <div className="watch-count">{String(stats.critical).padStart(2, '0')}</div>
          </header>
          {criticalList.length ? (
            <ul className="mini-list">
              {criticalList.map((item) => (
                <li key={item._id}>
                  <button onClick={() => setSelectedId(item._id)}>
                    <i className="pulse" />
                    <span>
                      <b>{item.title || 'Untitled complaint'}</b>
                      <small>{[item.building, item.location].filter(Boolean).join(' · ') || pretty(item.category || 'Campus')} · {timeAgo(item.createdAt)}</small>
                    </span>
                    <Icon name="arrow" size={14} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="calm">
              <div className="calm-icon"><Icon name="check" size={26} /></div>
              <p>No unresolved critical complaints. Nice work.</p>
            </div>
          )}
        </article>

        <article className="panel glow">
          <header className="panel-head">
            <div><div className="kicker">LIVE FEED</div><h3>Latest reports</h3></div>
            <button className="link-btn" onClick={() => goTo('complaints')}>View all</button>
          </header>
          <ul className="mini-list">
            {recent.length === 0 && <li className="muted-xs pad">Nothing reported yet.</li>}
            {recent.map((item) => (
              <li key={item._id}>
                <button onClick={() => setSelectedId(item._id)}>
                  <i className="dot" style={{ background: STATUS_COLOR[item.status] || STATUS_COLOR.pending }} />
                  <span>
                    <b>{item.title || 'Untitled complaint'}</b>
                    <small>{item.reportedBy?.name || 'Unknown'} · {timeAgo(item.createdAt)}</small>
                  </span>
                  <Icon name="arrow" size={14} />
                </button>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </>
  );

  const complaintsView = (
    <section className="panel flat">
      <header className="section-head">
        <div>
          <div className="kicker">THE WORK QUEUE</div>
          <h2>Complaint desk <span className="count-pill">{filteredComplaints.length}</span></h2>
          <p>Search, filter and assign. Open any complaint for the full history.</p>
        </div>
        <div className="head-actions">
          <div className="segmented" role="tablist" aria-label="Layout">
            <button className={layout === 'list' ? 'on' : ''} onClick={() => setLayout('list')} aria-label="List layout"><Icon name="list" size={16} /></button>
            <button className={layout === 'board' ? 'on' : ''} onClick={() => setLayout('board')} aria-label="Board layout"><Icon name="board" size={16} /></button>
          </div>
          <button className="btn-ghost" onClick={exportCsv} disabled={!filteredComplaints.length}>
            <Icon name="download" size={15} /> Export
          </button>
        </div>
      </header>

      <div className="toolbar">
        <div className="search">
          <Icon name="search" size={18} />
          <input
            ref={searchRef}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search ID, title, student, building…"
            aria-label="Search complaints"
          />
          {search ? <button onClick={() => setSearch('')} aria-label="Clear search">×</button> : <kbd>/</kbd>}
        </div>
        <div className="selects">
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} aria-label="Filter by priority">
            <option value="all">All priorities</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{pretty(p)}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort complaints">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="priority">By priority</option>
          </select>
        </div>
      </div>

      <div className="chips" role="tablist" aria-label="Filter by status">
        {['all', ...STATUSES].map((status) => (
          <button
            key={status}
            className={`chip ${statusFilter === status ? 'on' : ''}`}
            onClick={() => setStatusFilter(status)}
          >
            {status !== 'all' && <i style={{ background: STATUS_COLOR[status] }} />}
            {status === 'all' ? 'All' : pretty(status)}
            <b>{statusCounts[status] ?? 0}</b>
          </button>
        ))}
      </div>

      {loading && !complaints.length ? (
        <div className="skeletons">
          {[0, 1, 2, 3, 4].map((n) => <div className="skeleton" key={n} />)}
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="empty">
          <div className="empty-icon"><Icon name="search" size={26} /></div>
          <strong>No complaints found</strong>
          <span>Try changing your search or filters.</span>
          <button className="btn-ghost" onClick={resetFilters}>Reset filters</button>
        </div>
      ) : layout === 'list' ? (
        <div className="list">
          <div className="list-head">
            <span>Complaint</span><span>Reported by</span><span>Priority</span>
            <span>Status</span><span>Assignee</span><span>Reported</span>
          </div>
          {visibleComplaints.map(renderRow)}
        </div>
      ) : (
        <div className="board">
          {STATUSES.map((status) => {
            const items = visibleComplaints.filter((i) => (i.status || 'pending') === status);
            return (
              <div className="column" key={status}>
                <div className="column-head">
                  <i style={{ background: STATUS_COLOR[status] }} />
                  <span>{pretty(status)}</span>
                  <b>{items.length}</b>
                </div>
                <div className="column-body">
                  {items.length ? items.map(renderCard) : <div className="column-empty">Nothing here</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <footer className="list-foot">
        <span>
          Showing <b>{Math.min(visibleCount, filteredComplaints.length)}</b> of <b>{filteredComplaints.length}</b>
          {filteredComplaints.length !== complaints.length && <> (filtered from {complaints.length})</>}
        </span>
        {visibleCount < filteredComplaints.length && (
          <button className="btn-ghost" onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}>Load more</button>
        )}
        <span className="secure"><i /> Connected to CampusSetu API</span>
      </footer>
    </section>
  );

  const teamView = (
    <section>
      <header className="section-head">
        <div>
          <div className="kicker">YOUR PEOPLE</div>
          <h2>Response team <span className="count-pill">{teachers.length}</span></h2>
          <p>Workload is sorted lightest first, so the best-fit teacher is always on top.</p>
        </div>
      </header>

      {teacherLoad.length === 0 ? (
        <div className="empty panel">
          <div className="empty-icon"><Icon name="users" size={26} /></div>
          <strong>No active teachers found</strong>
          <span>Complaints can be assigned once teachers are active.</span>
        </div>
      ) : (
        <div className="team-grid">
          {teacherLoad.map(({ teacher, active, resolved }, index) => (
            <article className="teacher glow" key={teacher._id}>
              {index === 0 && teacherLoad.length > 1 && <span className="best">Best fit</span>}
              <div className={`avatar lg tc-${index % 5}`}>{initials(teacher.name)}</div>
              <h3>{teacher.name}</h3>
              <p>{teacher.department || teacher.email || 'Faculty'}</p>
              <div className="teacher-stats">
                <div><b>{active}</b><span>Active</span></div>
                <div><b>{resolved}</b><span>Resolved</span></div>
              </div>
              <div className="meter"><span style={{ width: `${(active / maxLoad) * 100}%` }} /></div>
              <small>{active === 0 ? 'Fully available' : `${active} open ${active === 1 ? 'task' : 'tasks'}`}</small>
            </article>
          ))}
        </div>
      )}
    </section>
  );

  const analyticsView = (
    <section>
      <header className="section-head">
        <div>
          <div className="kicker">INSIGHTS</div>
          <h2>Analytics</h2>
          <p>How complaints are flowing through campus operations.</p>
        </div>
      </header>

      <div className="insights">
        {[
          { label: 'Resolution rate', value: stats.resolutionRate, suffix: '%', tone: 'green' },
          { label: 'Avg. pending age', value: stats.avgPendingAge, suffix: 'd', tone: 'amber' },
          { label: 'Open critical', value: stats.critical, suffix: '', tone: 'rose' },
          { label: 'Active teachers', value: teachers.length, suffix: '', tone: 'violet' },
        ].map((item) => (
          <div className={`insight glow tone-${item.tone}`} key={item.label}>
            <span>{item.label}</span>
            <b><Counter value={item.value} suffix={item.suffix} /></b>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <article className="panel glow">
          <header className="panel-head">
            <div><div className="kicker">LAST 14 DAYS</div><h3>Incoming complaints</h3></div>
            <div className="legend inline"><li><i style={{ background: 'var(--violet)' }} /> Reported</li></div>
          </header>
          <div className="bars" role="img" aria-label="Complaints per day">
            {trend.map((day) => (
              <div className="bar-col" key={day.key} title={`${day.label}: ${day.count} reported`}>
                <span className="bar-val">{day.count || ''}</span>
                <div className="bar-track">
                  <div className="bar" style={{ height: `${(day.count / maxTrend) * 100}%` }} />
                </div>
                <span className="bar-label">{day.label.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel glow">
          <header className="panel-head">
            <div><div className="kicker">URGENCY</div><h3>Priority mix</h3></div>
          </header>
          <div className="hbars">
            {PRIORITIES.map((priority) => {
              const count = complaints.filter((i) => i.priority === priority).length;
              return (
                <div className="hbar" key={priority}>
                  <div className="hbar-top"><span>{pretty(priority)}</span><b>{count}</b></div>
                  <div className="meter"><span style={{ width: `${stats.total ? (count / stats.total) * 100 : 0}%`, background: PRIORITY_COLOR[priority] }} /></div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="panel glow">
          <header className="panel-head">
            <div><div className="kicker">HOTSPOTS</div><h3>Top categories</h3></div>
          </header>
          <div className="hbars">
            {breakdown.categories.length === 0 && <p className="muted-xs">No data yet.</p>}
            {breakdown.categories.map(([name, count]) => (
              <div className="hbar" key={name}>
                <div className="hbar-top"><span>{pretty(name)}</span><b>{count}</b></div>
                <div className="meter"><span style={{ width: `${(count / breakdown.categories[0][1]) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel glow">
          <header className="panel-head">
            <div><div className="kicker">LOCATIONS</div><h3>Busiest buildings</h3></div>
          </header>
          <div className="hbars">
            {breakdown.buildings.length === 0 && <p className="muted-xs">No data yet.</p>}
            {breakdown.buildings.map(([name, count]) => (
              <div className="hbar" key={name}>
                <div className="hbar-top"><span>{name}</span><b>{count}</b></div>
                <div className="meter"><span className="alt" style={{ width: `${(count / breakdown.buildings[0][1]) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );

  /* ----- layout ----- */
  return (
    <div className="app" data-theme={theme} onMouseMove={handleMouseMove}>
      <div className="aurora" aria-hidden="true"><i /><i /><i /></div>
      <div className="grain" aria-hidden="true" />

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">C<span>.</span></div>
          <div className="brand-text">
            <b>CampusSetu</b>
            <small>CAMPUS OPERATIONS</small>
          </div>
        </div>

        <button className="palette-trigger" onClick={() => setPaletteOpen(true)}>
          <Icon name="search" size={16} />
          <span>Quick search…</span>
          <kbd>Ctrl K</kbd>
        </button>

        <div className="side-label">WORKSPACE</div>
        <nav className="side-nav">
          {VIEWS.map((item) => (
            <button
              key={item.id}
              className={`nav-link ${view === item.id ? 'active' : ''}`}
              onClick={() => goTo(item.id)}
              title={item.label}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.id === 'complaints' && <em>{stats.total}</em>}
              {item.id === 'overview' && stats.critical > 0 && <i className="nav-alert" />}
            </button>
          ))}
        </nav>

        <div className="spacer" />

        <div className="side-card">
          <div className="side-card-glow" />
          <b>{stats.resolutionRate}% resolved</b>
          <p>Every complaint closed makes the campus a little better.</p>
          <div className="meter"><span style={{ width: `${stats.resolutionRate}%` }} /></div>
        </div>

        <div className="side-user">
          <div className="avatar">{initials(displayName)}</div>
          <div className="side-user-info">
            <strong>{displayName}</strong>
            <span>College administrator</span>
          </div>
          <button className="icon-btn" onClick={handleLogout} title="Sign out" aria-label="Sign out">
            <Icon name="logout" size={17} />
          </button>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="crumbs">
            <span>Workspace</span><span className="slash">/</span>
            <strong>{VIEWS.find((v) => v.id === view)?.label}</strong>
          </div>
          <div className="top-right">
            <div className="live"><i /> Live</div>
            <button className="icon-btn bordered" onClick={handleRefresh} disabled={refreshing} title="Refresh data" aria-label="Refresh data">
              <span className={refreshing ? 'spin' : ''}><Icon name="refresh" size={16} /></span>
            </button>
            <button className="icon-btn bordered" onClick={() => setPaletteOpen(true)} title="Command menu" aria-label="Open command menu">
              <Icon name="command" size={16} />
            </button>
            <button className="icon-btn bordered" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
            </button>
            <div className="top-date">
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <div className="avatar sm">{initials(displayName)}</div>
          </div>
        </header>

        <div className="content" key={view}>
          {error && (
            <div className="banner error">
              <Icon name="alert" size={18} />
              <span>{error}</span>
              <button onClick={() => loadData()}>Try again</button>
            </div>
          )}

          {view === 'overview' && overview}
          {view === 'complaints' && complaintsView}
          {view === 'team' && teamView}
          {view === 'analytics' && analyticsView}

          <footer className="app-footer">
            <span>© {new Date().getFullYear()} CampusSetu · Built for better campuses.</span>
            <span>ADMIN WORKSPACE · v2.0</span>
          </footer>
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="bottom-nav" aria-label="Primary">
        {VIEWS.map((item) => (
          <button
            key={item.id}
            className={view === item.id ? 'active' : ''}
            onClick={() => goTo(item.id)}
          >
            <Icon name={item.icon} size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`} role="status" key={toast.id}>
          <Icon name={toast.type === 'error' ? 'alert' : toast.type === 'warn' ? 'clock' : 'check'} size={17} />
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} aria-label="Dismiss">×</button>
        </div>
      )}

      {/* Command palette */}
      {paletteOpen && (
        <div className="overlay center" onClick={closePalette}>
          <div className="palette" role="dialog" aria-modal="true" aria-label="Command menu" onClick={(e) => e.stopPropagation()}>
            <div className="palette-input">
              <Icon name="search" size={18} />
              <input
                ref={paletteRef}
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                placeholder="Type a command or search complaints…"
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setPaletteIndex((i) => Math.min(paletteItems.length - 1, i + 1));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setPaletteIndex((i) => Math.max(0, i - 1));
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    runPaletteItem(paletteItems[paletteIndex]);
                  }
                }}
              />
              <kbd>Esc</kbd>
            </div>
            <div className="palette-list">
              {paletteItems.length === 0 && <div className="palette-empty">No results for “{paletteQuery}”</div>}
              {paletteItems.map((item, index) => (
                <div key={item.id}>
                  {(index === 0 || paletteItems[index - 1].group !== item.group) && (
                    <div className="palette-group">{item.group}</div>
                  )}
                  <button
                    className={`palette-item ${index === paletteIndex ? 'on' : ''}`}
                    onMouseEnter={() => setPaletteIndex(index)}
                    onClick={() => runPaletteItem(item)}
                  >
                    <Icon name={item.icon} size={17} />
                    <span>{item.label}</span>
                    {item.hint && <small className="mono">{item.hint}</small>}
                  </button>
                </div>
              ))}
            </div>
            <div className="palette-foot">
              <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
              <span><kbd>↵</kbd> select</span>
              <span><kbd>/</kbd> search desk</span>
            </div>
          </div>
        </div>
      )}

      {/* Complaint details drawer */}
      {selectedComplaint && (
        <div className="overlay end" onClick={() => setSelectedId(null)}>
          <section
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="details-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="drawer-head">
              <div>
                <div className="kicker">COMPLAINT OVERVIEW</div>
                <h2 id="details-title">Complaint details</h2>
                <span className="mono accent">{selectedComplaint.complaintId || selectedComplaint._id}</span>
              </div>
              <button className="icon-btn bordered" onClick={() => setSelectedId(null)} aria-label="Close complaint details">
                <Icon name="close" size={18} />
              </button>
            </header>

            <div className="drawer-body">
              <div className="badge-row">
                <Badge kind="priority" value={selectedComplaint.priority || 'medium'}>
                  {pretty(selectedComplaint.priority || 'medium')} priority
                </Badge>
                <Badge kind="status" value={selectedComplaint.status || 'pending'} />
                {selectedComplaint.status === 'pending' && ageInDays(selectedComplaint.createdAt) >= 3 && (
                  <span className="badge overdue"><i />Waiting {ageInDays(selectedComplaint.createdAt)} days</span>
                )}
              </div>

              <h3 className="drawer-title">{selectedComplaint.title || 'Untitled complaint'}</h3>

              {isOpen(selectedComplaint) && (
                <div className="drawer-section assign-section">
                  <h4>Assign to a teacher</h4>
                  {renderAssign(selectedComplaint, true)}
                </div>
              )}

              <div className="drawer-section">
                <h4>Description</h4>
                <p className="desc">{selectedComplaint.description || 'No description was provided.'}</p>
              </div>

              {selectedComplaint.photoUrl && (
                <div className="drawer-section">
                  <h4>Attached photo</h4>
                  <a href={selectedComplaint.photoUrl} target="_blank" rel="noreferrer" className="photo-link">
                    <Icon name="photo" size={16} /> View uploaded photo <Icon name="arrow" size={13} />
                  </a>
                </div>
              )}

              <div className="drawer-section">
                <h4>Report information</h4>
                <div className="info-grid">
                  {[
                    ['Category', pretty(selectedComplaint.category || 'Not specified')],
                    ['Reported on', formatDate(selectedComplaint.createdAt)],
                    ['Building', selectedComplaint.building || 'Not specified'],
                    ['Floor / Room', [selectedComplaint.floor, selectedComplaint.roomNumber].filter(Boolean).join(' / ') || 'Not specified'],
                    ['Location', selectedComplaint.location || 'Not specified'],
                    ['Assigned teacher', selectedComplaint.assignedTo?.name || 'Not assigned'],
                  ].map(([label, value]) => (
                    <div className="info" key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="drawer-section">
                <h4>Reported by</h4>
                <div className="person-card">
                  <div className="avatar">{initials(selectedComplaint.reportedBy?.name || 'Student')}</div>
                  <div>
                    <strong>{selectedComplaint.reportedBy?.name || 'Unknown student'}</strong>
                    <span>{selectedComplaint.reportedBy?.email || 'Email unavailable'}</span>
                    {selectedComplaint.reportedBy?.usn && <span>USN: {selectedComplaint.reportedBy.usn}</span>}
                    {selectedComplaint.reportedBy?.department && <span>{selectedComplaint.reportedBy.department}</span>}
                  </div>
                </div>
              </div>

              <div className="drawer-section">
                <h4>Complaint history</h4>
                {selectedComplaint.history?.length ? (
                  <div className="timeline">
                    {[...selectedComplaint.history]
                      .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt))
                      .map((entry, index) => (
                        <div className="tl-item" key={`${entry._id || entry.changedAt}-${index}`}>
                          <div className="tl-marker"><i style={{ background: STATUS_COLOR[entry.status] || 'var(--violet)' }} /></div>
                          <div className="tl-content">
                            <strong>{pretty(entry.status || 'Updated')}</strong>
                            <p>{entry.note || 'Complaint status updated.'}</p>
                            <span>
                              {formatDate(entry.changedAt)}
                              {entry.changedBy?.name ? ` · ${entry.changedBy.name}` : ''}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="muted-xs">No complaint history has been recorded yet.</p>
                )}
              </div>
            </div>

            <footer className="drawer-foot">
              <button className="btn-primary wide" onClick={() => setSelectedId(null)}>Close details</button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;