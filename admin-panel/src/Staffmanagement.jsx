import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getStaff,
  inviteStaff,
  resendStaffInvite,
  removeStaff,
} from './services/Staffapi';

/* ------------------------------------------------------------------ */
/* Role configuration                                                  */
/* ------------------------------------------------------------------ */

const ROLE_ORDER = ['teacher', 'cluster_head', 'principal'];

const ROLES = {
  teacher: {
    label: 'Teacher',
    plural: 'Teachers',
    icon: 'book',
    tone: 'var(--blue)',
    tagline: 'Fixes what students report',
    blurb:
      'Receives assigned complaints on the mobile app, posts progress updates and closes work with a proof photo.',
    perks: ['Assigned complaints', 'Progress updates', 'Proof-photo resolution'],
    deptLabel: 'Department',
    deptPlaceholder: 'e.g. Computer Science',
  },
  cluster_head: {
    label: 'Cluster Head',
    plural: 'Cluster Heads',
    icon: 'layers',
    tone: 'var(--violet)',
    tagline: 'Oversees a group of departments',
    blurb:
      'Monitors every complaint across their cluster, assigns work to teachers and escalates anything that is overdue.',
    perks: ['Campus-wide queue', 'Assign & reassign', 'Escalate overdue issues'],
    deptLabel: 'Cluster / region',
    deptPlaceholder: 'e.g. Engineering Cluster',
  },
  principal: {
    label: 'Principal',
    plural: 'Principals',
    icon: 'crown',
    tone: 'var(--amber)',
    tagline: 'Full institutional oversight',
    blurb:
      'Complete visibility across the institution with assignment, escalation, reopening and the audit trail.',
    perks: ['Institution-wide view', 'Audit trail access', 'Reopen & escalate'],
    deptLabel: 'Institution',
    deptPlaceholder: 'e.g. Main Campus',
  },
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const initialsOf = (name = '') =>
  String(name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || '?';

const fmtDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
};

const validate = (form) => {
  const errors = {};
  if (form.name.trim().length < 2) errors.name = 'Enter the full name.';
  if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Enter a valid email address.';
  if (form.phone.trim() && form.phone.replace(/\D/g, '').length < 10) {
    errors.phone = 'Phone number looks too short.';
  }
  return errors;
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

const Ico = ({ name, size = 18 }) => {
  const paths = {
    book: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      </>
    ),
    layers: (
      <>
        <path d="m12 2 10 5-10 5L2 7l10-5Z" />
        <path d="m2 17 10 5 10-5M2 12l10 5 10-5" />
      </>
    ),
    crown: <path d="m3 8 4 4 5-7 5 7 4-4-2 11H5L3 8Z" />,
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    send: <path d="m22 2-11 11M22 2l-7 20-4-9-9-4 20-7Z" />,
    trash: (
      <>
        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <path d="M10 11v6M14 11v6" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m18 6-12 12M6 6l12 12" />,
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    alert: (
      <>
        <path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4M12 17h.01" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    back: <path d="M19 12H5m6-6-6 6 6 6" />,
    phone: (
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
    ),
    pin: (
      <>
        <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
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
      {paths[name] || paths.users}
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* Email preview (right side of the wizard)                            */
/* ------------------------------------------------------------------ */

function EmailPreview({ role, name, email }) {
  const cfg = ROLES[role];

  return (
    <div className="pp-mail" aria-label="Invitation email preview">
      <div className="pp-mail-bar">
        <i /><i /><i />
        <span>Inbox · Invitation</span>
      </div>

      <div className="pp-mail-meta">
        <div className="pp-mail-from">
          <div className="pp-mail-logo">C<span>.</span></div>
          <div>
            <b>CampusSetu</b>
            <small>to {email.trim() || 'new.member@college.edu'}</small>
          </div>
        </div>
        <span className="pp-mail-time">Just now</span>
      </div>

      <div className="pp-mail-card">
        <div className="pp-mail-hero" style={{ '--t': cfg.tone }}>
          <div className="pp-mail-icon"><Ico name={cfg.icon} size={22} /></div>
          <span>YOU'VE BEEN INVITED</span>
          <h4>Welcome aboard, {name.trim().split(' ')[0] || 'there'}.</h4>
        </div>

        <div className="pp-mail-body">
          <p>
            You have been added to <b>CampusSetu</b> as a{' '}
            <b style={{ color: cfg.tone }}>{cfg.label}</b>. Set a password to
            activate your account, then sign in on the CampusSetu mobile app
            with this email address.
          </p>

          <ul>
            {cfg.perks.map((perk) => (
              <li key={perk}><Ico name="check" size={13} /> {perk}</li>
            ))}
          </ul>

          <div className="pp-mail-btn">Set your password</div>
          <small>This secure link expires automatically. If you did not expect this email, you can ignore it.</small>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Invite wizard                                                       */
/* ------------------------------------------------------------------ */

function InviteWizard({ initialRole, onClose, onDone }) {
  const [step, setStep] = useState(initialRole ? 1 : 0);
  const [role, setRole] = useState(initialRole || 'teacher');
  const [form, setForm] = useState({ name: '', email: '', department: '', phone: '' });
  const [touched, setTouched] = useState({});
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState('');
  const [result, setResult] = useState(null);

  const cfg = ROLES[role];
  const errors = useMemo(() => validate(form), [form]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (event) => {
      if (event.key === 'Escape' && !sending) onClose();
    };

    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, sending]);

  const setField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setServerError('');
  };

  const blur = (key) => () => setTouched((current) => ({ ...current, [key]: true }));

  const submit = async (event) => {
    event.preventDefault();

    setTouched({ name: true, email: true, phone: true });

    if (Object.keys(errors).length) return;

    setSending(true);
    setServerError('');

    try {
      const response = await inviteStaff({
        role,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        department: form.department.trim(),
        phone: form.phone.trim(),
      });

      setResult({
        emailSent: response.emailSent !== false,
        message: response.message,
        email: form.email.trim().toLowerCase(),
        name: form.name.trim(),
      });

      setStep(2);
      onDone();
    } catch (err) {
      setServerError(err.message || 'Could not send the invitation.');
    } finally {
      setSending(false);
    }
  };

  const again = () => {
    setForm({ name: '', email: '', department: '', phone: '' });
    setTouched({});
    setResult(null);
    setServerError('');
    setStep(0);
  };

  const field = (key, label, props = {}) => (
    <label className={`pp-field ${touched[key] && errors[key] ? 'bad' : ''}`}>
      <span>{label}{props.required && <em>*</em>}</span>
      <div className="pp-input">
        {props.icon && <Ico name={props.icon} size={16} />}
        <input
          value={form[key]}
          onChange={setField(key)}
          onBlur={blur(key)}
          disabled={sending}
          {...props.input}
        />
      </div>
      {touched[key] && errors[key] && <small className="pp-err">{errors[key]}</small>}
    </label>
  );

  return (
    <div
      className="pp-overlay"
      onClick={() => !sending && onClose()}
      role="presentation"
    >
      <section
        className={`pp-modal step-${step}`}
        role="dialog"
        aria-modal="true"
        aria-label="Invite staff member"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="pp-modal-head">
          <div>
            <div className="kicker">ONBOARDING</div>
            <h3>{step === 2 ? 'Invitation sent' : 'Invite a team member'}</h3>
          </div>

          <ol className="pp-steps" aria-label="Progress">
            {['Role', 'Details', 'Sent'].map((label, index) => (
              <li key={label} className={index === step ? 'on' : index < step ? 'done' : ''}>
                <b>{index < step ? <Ico name="check" size={12} /> : index + 1}</b>
                <span>{label}</span>
              </li>
            ))}
          </ol>

          <button className="pp-x" onClick={onClose} disabled={sending} aria-label="Close">
            <Ico name="close" size={18} />
          </button>
        </header>

        {/* STEP 0: role */}
        {step === 0 && (
          <div className="pp-modal-body">
            <p className="pp-lead">
              Choose what this person will be able to do on the mobile app.
            </p>

            <div className="pp-role-grid" role="radiogroup" aria-label="Role">
              {ROLE_ORDER.map((key) => {
                const item = ROLES[key];
                const on = role === key;

                return (
                  <button
                    type="button"
                    key={key}
                    role="radio"
                    aria-checked={on}
                    className={`pp-role-card ${on ? 'on' : ''}`}
                    style={{ '--t': item.tone }}
                    onClick={() => setRole(key)}
                  >
                    <span className="pp-role-check"><Ico name="check" size={13} /></span>
                    <span className="pp-role-icon"><Ico name={item.icon} size={24} /></span>
                    <strong>{item.label}</strong>
                    <em>{item.tagline}</em>
                    <p>{item.blurb}</p>
                    <ul>
                      {item.perks.map((perk) => (
                        <li key={perk}><Ico name="check" size={12} /> {perk}</li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            <footer className="pp-modal-foot">
              <button className="btn-ghost" onClick={onClose}>Cancel</button>
              <button className="btn-primary" onClick={() => setStep(1)}>
                Continue as {cfg.label} <Ico name="arrow" size={15} />
              </button>
            </footer>
          </div>
        )}

        {/* STEP 1: details */}
        {step === 1 && (
          <form className="pp-modal-body pp-split" onSubmit={submit} noValidate>
            <div className="pp-form">
              <button type="button" className="pp-role-pill" style={{ '--t': cfg.tone }} onClick={() => setStep(0)}>
                <Ico name={cfg.icon} size={15} />
                Inviting a <b>{cfg.label}</b>
                <span>Change</span>
              </button>

              {field('name', 'Full name', {
                required: true,
                icon: 'users',
                input: { placeholder: 'e.g. Dr. Ramesh Kumar', autoComplete: 'off', autoFocus: true },
              })}

              {field('email', 'College email', {
                required: true,
                icon: 'mail',
                input: { type: 'email', placeholder: 'name@college.edu', autoComplete: 'off', inputMode: 'email' },
              })}

              <div className="pp-row">
                {field('department', cfg.deptLabel, {
                  icon: 'pin',
                  input: { placeholder: cfg.deptPlaceholder, autoComplete: 'off' },
                })}

                {field('phone', 'Phone number', {
                  icon: 'phone',
                  input: { type: 'tel', placeholder: '+91 98765 43210', autoComplete: 'off', inputMode: 'tel' },
                })}
              </div>

              <div className="pp-note">
                <Ico name="shield" size={16} />
                <p>
                  No password is shared by you. We email a one-time secure link
                  so they can set their own, then sign in on the mobile app.
                </p>
              </div>

              {serverError && (
                <div className="pp-alert" role="alert">
                  <Ico name="alert" size={16} />
                  <span>{serverError}</span>
                </div>
              )}

              <footer className="pp-modal-foot">
                <button type="button" className="btn-ghost" onClick={() => setStep(0)} disabled={sending}>
                  <Ico name="back" size={15} /> Back
                </button>

                <button type="submit" className="btn-primary" disabled={sending}>
                  {sending ? (<><span className="spinner" /> Sending invite…</>) : (<><Ico name="send" size={15} /> Send invitation</>)}
                </button>
              </footer>
            </div>

            <aside className="pp-preview">
              <div className="pp-preview-label">LIVE EMAIL PREVIEW</div>
              <EmailPreview role={role} name={form.name} email={form.email} />
            </aside>
          </form>
        )}

        {/* STEP 2: success */}
        {step === 2 && result && (
          <div className="pp-modal-body pp-success">
            <div className={`pp-success-ring ${result.emailSent ? '' : 'warn'}`}>
              <Ico name={result.emailSent ? 'check' : 'alert'} size={34} />
            </div>

            <h4>
              {result.emailSent
                ? `${result.name.split(' ')[0]} is on the way in.`
                : 'Account created — email not delivered'}
            </h4>

            <p>
              {result.emailSent ? (
                <>
                  We emailed a secure set-password link to <b>{result.email}</b>.
                  Once they set a password they can sign in on the CampusSetu
                  mobile app as a <b>{ROLES[role].label}</b>.
                </>
              ) : (
                <>
                  The account for <b>{result.email}</b> exists, but the invitation
                  email could not be sent. Use <b>Resend invite</b> on their card
                  once the mail service is available.
                </>
              )}
            </p>

            <div className="pp-timeline">
              <div className="done"><i><Ico name="check" size={12} /></i><span>Account created</span></div>
              <div className={result.emailSent ? 'done' : 'fail'}><i><Ico name={result.emailSent ? 'check' : 'alert'} size={12} /></i><span>Invitation email</span></div>
              <div><i /><span>Password set by member</span></div>
              <div><i /><span>First sign-in on mobile</span></div>
            </div>

            <footer className="pp-modal-foot center">
              <button className="btn-ghost" onClick={again}><Ico name="plus" size={15} /> Invite another</button>
              <button className="btn-primary" onClick={onClose}>Done</button>
            </footer>
          </div>
        )}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main screen                                                         */
/* ------------------------------------------------------------------ */

export default function StaffManagement({ complaints = [], showToast, onChanged }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [roleFilter, setRoleFilter] = useState('all');
  const [query, setQuery] = useState('');

  const [wizard, setWizard] = useState({ open: false, role: null });
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [resendingId, setResendingId] = useState('');

  const notify = useCallback(
    (message, type = 'success') => showToast?.(message, type),
    [showToast]
  );

  const load = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError('');

    try {
      const result = await getStaff();
      setStaff(result.staff || []);
    } catch (err) {
      setError(err.message || 'Could not load team members.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* workload per teacher, from the complaints already in memory */
  const workload = useMemo(() => {
    const map = {};

    complaints.forEach((item) => {
      const id = item.assignedTo?._id;
      if (!id) return;

      map[id] = map[id] || { active: 0, resolved: 0 };

      if (['assigned', 'in_progress'].includes(item.status)) map[id].active += 1;
      if (item.status === 'resolved') map[id].resolved += 1;
    });

    return map;
  }, [complaints]);

  const maxActive = useMemo(
    () => Math.max(1, ...Object.values(workload).map((entry) => entry.active)),
    [workload]
  );

  const counts = useMemo(() => {
    const base = { all: staff.length, pending: 0, teacher: 0, cluster_head: 0, principal: 0 };

    staff.forEach((person) => {
      if (base[person.role] !== undefined) base[person.role] += 1;
      if (person.inviteStatus === 'invited') base.pending += 1;
    });

    return base;
  }, [staff]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();

    return staff
      .filter((person) => {
        const matchesRole =
          roleFilter === 'all' ||
          (roleFilter === 'pending'
            ? person.inviteStatus === 'invited'
            : person.role === roleFilter);

        const matchesText =
          !term ||
          [person.name, person.email, person.department, ROLES[person.role]?.label]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(term);

        return matchesRole && matchesText;
      })
      .sort((a, b) => {
        if (a.inviteStatus !== b.inviteStatus) return a.inviteStatus === 'invited' ? -1 : 1;
        return (
          ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role) ||
          String(a.name).localeCompare(String(b.name))
        );
      });
  }, [staff, roleFilter, query]);

  const handleResend = async (person) => {
    setResendingId(person._id);

    try {
      const result = await resendStaffInvite(person._id);
      notify(result.message || `Invitation re-sent to ${person.email}.`);
      load(false);
    } catch (err) {
      notify(err.message || 'Could not resend the invitation.', 'error');
    } finally {
      setResendingId('');
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;

    setRemoving(true);

    try {
      const result = await removeStaff(removeTarget._id);
      notify(result.message || `${removeTarget.name} was removed.`);
      setRemoveTarget(null);
      await load(false);
      onChanged?.();
    } catch (err) {
      notify(err.message || 'Could not remove this member.', 'error');
    } finally {
      setRemoving(false);
    }
  };

  const openWizard = (role = null) => setWizard({ open: true, role });

  const tiles = [
    { key: 'teacher', label: 'Teachers', value: counts.teacher, icon: 'book', tone: 'var(--blue)', foot: 'Resolve complaints' },
    { key: 'cluster_head', label: 'Cluster Heads', value: counts.cluster_head, icon: 'layers', tone: 'var(--violet)', foot: 'Oversee clusters' },
    { key: 'principal', label: 'Principals', value: counts.principal, icon: 'crown', tone: 'var(--amber)', foot: 'Institution leaders' },
    { key: 'pending', label: 'Invites pending', value: counts.pending, icon: 'clock', tone: 'var(--rose)', foot: 'Awaiting first sign-in' },
  ];

  const filters = [
    { key: 'all', label: 'Everyone' },
    ...ROLE_ORDER.map((key) => ({ key, label: ROLES[key].plural })),
    { key: 'pending', label: 'Pending invites' },
  ];

  return (
    <section className="pp">
      <header className="section-head">
        <div>
          <div className="kicker">PEOPLE & ACCESS</div>
          <h2>
            Team directory <span className="count-pill">{staff.length}</span>
          </h2>
          <p>
            Invite teachers, cluster heads and principals. Each person gets an
            email, sets their own password and signs in on the mobile app.
          </p>
        </div>

        <button className="btn-primary pp-add" onClick={() => openWizard()}>
          <Ico name="plus" size={16} /> Invite member
        </button>
      </header>

      {/* Summary tiles (click to filter) */}
      <div className="pp-tiles">
        {tiles.map((tile) => (
          <button
            key={tile.key}
            className={`pp-tile glow ${roleFilter === tile.key ? 'on' : ''}`}
            style={{ '--t': tile.tone }}
            onClick={() => setRoleFilter((current) => (current === tile.key ? 'all' : tile.key))}
          >
            <span className="pp-tile-icon"><Ico name={tile.icon} size={18} /></span>
            <span className="pp-tile-num">{loading ? '—' : tile.value}</span>
            <span className="pp-tile-label">{tile.label}</span>
            <small>{tile.foot}</small>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="pp-toolbar">
        <div className="search">
          <Ico name="search" size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email, department…"
            aria-label="Search team"
          />
          {query && <button onClick={() => setQuery('')} aria-label="Clear search">×</button>}
        </div>

        <div className="chips" role="tablist" aria-label="Filter by role">
          {filters.map((item) => (
            <button
              key={item.key}
              className={`chip ${roleFilter === item.key ? 'on' : ''}`}
              onClick={() => setRoleFilter(item.key)}
            >
              {item.label}
              <b>{counts[item.key] ?? 0}</b>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="banner error">
          <Ico name="alert" size={18} />
          <span>{error}</span>
          <button onClick={() => load()}>Try again</button>
        </div>
      )}

      {loading ? (
        <div className="pp-grid">
          {[0, 1, 2, 3].map((n) => <div className="pp-skel" key={n} />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="empty panel">
          <div className="empty-icon"><Ico name="users" size={26} /></div>
          <strong>
            {staff.length === 0 ? 'No team members yet' : 'No one matches these filters'}
          </strong>
          <span>
            {staff.length === 0
              ? 'Invite your first teacher, cluster head or principal to get started.'
              : 'Try a different search or role filter.'}
          </span>
          <button
            className="btn-primary"
            onClick={() => (staff.length === 0 ? openWizard() : (setQuery(''), setRoleFilter('all')))}
          >
            {staff.length === 0 ? 'Invite member' : 'Reset filters'}
          </button>
        </div>
      ) : (
        <div className="pp-grid">
          {visible.map((person) => {
            const cfg = ROLES[person.role] || ROLES.teacher;
            const invited = person.inviteStatus === 'invited';
            const load_ = workload[person._id] || { active: 0, resolved: 0 };

            return (
              <article
                key={person._id}
                className={`pp-card glow ${invited ? 'invited' : ''}`}
                style={{ '--t': cfg.tone }}
              >
                <div className="pp-card-top">
                  <div className="pp-avatar">{initialsOf(person.name)}</div>

                  <div className="pp-who">
                    <h3 title={person.name}>{person.name}</h3>
                    <a href={`mailto:${person.email}`} title={person.email}>{person.email}</a>
                  </div>

                  <button
                    className="pp-trash"
                    onClick={() => setRemoveTarget(person)}
                    aria-label={`Remove ${person.name}`}
                    title="Remove from team"
                  >
                    <Ico name="trash" size={15} />
                  </button>
                </div>

                <div className="pp-chips">
                  <span className="pp-role-chip"><Ico name={cfg.icon} size={13} /> {cfg.label}</span>

                  <span className={`pp-state ${invited ? 'wait' : 'ok'}`}>
                    <i /> {invited ? 'Invite pending' : 'Active'}
                  </span>
                </div>

                <dl className="pp-facts">
                  {person.department && (
                    <div><dt><Ico name="pin" size={13} /></dt><dd>{person.department}</dd></div>
                  )}
                  {person.phone && (
                    <div><dt><Ico name="phone" size={13} /></dt><dd>{person.phone}</dd></div>
                  )}
                  <div><dt><Ico name="clock" size={13} /></dt><dd>Added {fmtDate(person.createdAt)}</dd></div>
                </dl>

                {person.role === 'teacher' && !invited && (
                  <div className="pp-load">
                    <div className="pp-load-nums">
                      <div><b>{load_.active}</b><span>Active</span></div>
                      <div><b>{load_.resolved}</b><span>Resolved</span></div>
                    </div>
                    <div className="meter"><span style={{ width: `${(load_.active / maxActive) * 100}%` }} /></div>
                    <small>
                      {load_.active === 0 ? 'Fully available' : `${load_.active} open ${load_.active === 1 ? 'task' : 'tasks'}`}
                    </small>
                  </div>
                )}

                {invited && (
                  <button
                    className="pp-resend"
                    onClick={() => handleResend(person)}
                    disabled={resendingId === person._id}
                  >
                    {resendingId === person._id
                      ? (<><span className="spinner" /> Sending…</>)
                      : (<><Ico name="send" size={14} /> Resend invitation</>)}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}

      {wizard.open && (
        <InviteWizard
          initialRole={wizard.role}
          onClose={() => setWizard({ open: false, role: null })}
          onDone={() => { load(false); onChanged?.(); }}
        />
      )}

      {removeTarget && (
        <div className="pp-overlay" onClick={() => !removing && setRemoveTarget(null)} role="presentation">
          <section
            className="pp-confirm"
            role="alertdialog"
            aria-modal="true"
            aria-label="Remove team member"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pp-confirm-icon"><Ico name="trash" size={24} /></div>

            <h4>Remove {removeTarget.name}?</h4>

            <p>
              They will lose access to CampusSetu immediately and can no longer
              sign in on the mobile app.
              {removeTarget.role === 'teacher' &&
                ' Any complaints currently assigned to them return to the pending queue.'}
            </p>

            <footer className="pp-modal-foot center">
              <button className="btn-ghost" onClick={() => setRemoveTarget(null)} disabled={removing}>Keep member</button>
              <button className="pp-danger" onClick={handleRemove} disabled={removing}>
                {removing ? (<><span className="spinner" /> Removing…</>) : 'Yes, remove'}
              </button>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}