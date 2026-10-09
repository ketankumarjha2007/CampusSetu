import { useEffect, useState } from 'react';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import './Adminlogin .css';

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

const Icon = ({ name, size = 18 }) => {
  const paths = {
    mail: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" /></>,
    lock: <><rect x="4" y="11" width="16" height="10" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
    eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    eyeOff: <><path d="M3 3l18 18" /><path d="M10.6 5.1A9.7 9.7 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.6C3.7 8.5 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 4-.9" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />,
    shield: <><path d="M12 3 4 6v6c0 4.5 3.2 8.2 8 9 4.8-.8 8-4.5 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    chart: <><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-5 5" /></>,
    bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    alert: <><path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const readStorage = (key, fallback = '') => {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* storage unavailable */
  }
};

const friendlyError = (err) => {
  switch (err?.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/invalid-email':
      return 'That email address doesn’t look right.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact your administrator.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return err?.message || 'Login failed. Please try again.';
  }
};

const FEATURES = [
  { icon: 'bolt', title: 'Assign in one click', text: 'Route any complaint to the right teacher instantly.' },
  { icon: 'users', title: 'Balanced workloads', text: 'See who is free so no teacher gets overloaded.' },
  { icon: 'chart', title: 'Live insights', text: 'Track resolution, urgency and hotspots as they happen.' },
];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState(() => readStorage('campussetu-admin-email'));
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(() => Boolean(readStorage('campussetu-admin-email')));
  const [showPassword, setShowPassword] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [theme, setTheme] = useState(() => readStorage('campussetu-theme', 'dark'));

  useEffect(() => {
    writeStorage('campussetu-theme', theme);
  }, [theme]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);

      writeStorage('campussetu-admin-email', remember ? email.trim() : null);
      setSuccess(true);

      if (onLogin) {
        onLogin(result.user);
      }
    } catch (err) {
      setError(friendlyError(err));
      setShakeKey((key) => key + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setError('');
    setNotice('');

    if (!email.trim()) {
      setError('Enter your email above first, then choose “Forgot password”.');
      setShakeKey((key) => key + 1);
      return;
    }

    setResetting(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setNotice(`If an account exists for ${email.trim()}, a reset link is on its way.`);
    } catch (err) {
      if (err?.code === 'auth/user-not-found') {
        setNotice(`If an account exists for ${email.trim()}, a reset link is on its way.`);
      } else {
        setError(friendlyError(err));
        setShakeKey((key) => key + 1);
      }
    } finally {
      setResetting(false);
    }
  };

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`);
  };

  const handleKey = (event) => {
    if (event.getModifierState) setCapsOn(event.getModifierState('CapsLock'));
  };

  return (
    <div className="al-page" data-theme={theme}>
      <div className="al-aurora" aria-hidden="true"><i /><i /><i /></div>
      <div className="al-grid" aria-hidden="true" />

      <button
        className="al-theme"
        type="button"
        onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
        aria-label="Toggle theme"
        title="Toggle theme"
      >
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} />
      </button>

      <div className="al-shell">
        {/* ---------------- Brand showcase ---------------- */}
        <section className="al-showcase" aria-hidden="false">
          <div className="al-brand">
            <div className="al-mark">C<span>.</span></div>
            <div>
              <b>CampusSetu</b>
              <small>CAMPUS OPERATIONS</small>
            </div>
          </div>

          <div className="al-pitch">
            <div className="al-eyebrow"><i /> ADMIN WORKSPACE</div>
            <h1>
              Make every issue<br />
              <span className="al-grad">move forward.</span>
            </h1>
            <p>
              One command center to track complaints, coordinate your teachers
              and turn campus problems into progress.
            </p>

            <ul className="al-features">
              {FEATURES.map((feature) => (
                <li key={feature.title}>
                  <span className="al-feature-icon"><Icon name={feature.icon} size={18} /></span>
                  <div>
                    <b>{feature.title}</b>
                    <small>{feature.text}</small>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Decorative product preview */}
          <div className="al-preview" aria-hidden="true">
            <div className="al-pv-card al-pv-main">
              <div className="al-pv-head">
                <span className="al-pv-dot" /> Live complaint queue
              </div>
              <div className="al-pv-row"><i className="r" /><span /><em /></div>
              <div className="al-pv-row"><i className="a" /><span /><em /></div>
              <div className="al-pv-row"><i className="g" /><span /><em /></div>
              <div className="al-pv-bars">
                {[38, 62, 46, 78, 54, 90, 70].map((height, index) => (
                  <b key={index} style={{ height: `${height}%`, animationDelay: `${index * 0.12}s` }} />
                ))}
              </div>
            </div>
            <div className="al-pv-card al-pv-chip al-pv-chip-1">
              <span className="al-pv-check"><Icon name="check" size={13} /></span>
              Complaint assigned
            </div>
            <div className="al-pv-card al-pv-chip al-pv-chip-2">
              <span className="al-pv-pulse" /> Needs attention
            </div>
          </div>
        </section>

        {/* ---------------- Sign-in card ---------------- */}
        <section className="al-panel">
          <div
            className={`al-card ${success ? 'is-success' : ''}`}
            onMouseMove={handleMouseMove}
          >
            <div className="al-card-glow" aria-hidden="true" />

            <div className="al-mobile-brand">
              <div className="al-mark sm">C<span>.</span></div>
              <b>CampusSetu</b>
            </div>

            <div className="al-badge"><Icon name="shield" size={14} /> College Administration Portal</div>
            <h2>Welcome back</h2>
            <p className="al-sub">Sign in to manage complaints, teachers and campus operations.</p>

            <form onSubmit={handleLogin} noValidate={false}>
              <div className="al-field">
                <label htmlFor="al-email">Email address</label>
                <div className="al-input">
                  <Icon name="mail" />
                  <input
                    id="al-email"
                    type="email"
                    autoComplete="username"
                    placeholder="admin@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus={!email}
                  />
                </div>
              </div>

              <div className="al-field">
                <label htmlFor="al-password">Password</label>
                <div className="al-input">
                  <Icon name="lock" />
                  <input
                    id="al-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={handleKey}
                    onKeyDown={handleKey}
                    required
                    autoFocus={Boolean(email)}
                  />
                  <button
                    type="button"
                    className="al-eye"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    <Icon name={showPassword ? 'eyeOff' : 'eye'} size={17} />
                  </button>
                </div>
                {capsOn && (
                  <div className="al-caps"><Icon name="alert" size={13} /> Caps Lock is on</div>
                )}
              </div>

              <div className="al-options">
                <label className="al-check">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span className="al-box"><Icon name="check" size={11} /></span>
                  Remember my email
                </label>
                <button type="button" className="al-link" onClick={handleReset} disabled={resetting}>
                  {resetting ? 'Sending…' : 'Forgot password?'}
                </button>
              </div>

              {error && (
                <div className="al-alert error" role="alert" key={shakeKey}>
                  <Icon name="alert" size={16} /> <span>{error}</span>
                </div>
              )}
              {notice && (
                <div className="al-alert ok" role="status">
                  <Icon name="check" size={16} /> <span>{notice}</span>
                </div>
              )}

              <button className="al-submit" type="submit" disabled={loading || success}>
                {success ? (
                  <><Icon name="check" size={18} /> Signed in</>
                ) : loading ? (
                  <><span className="al-spinner" /> Signing in…</>
                ) : (
                  <>Sign in <Icon name="arrow" size={18} /></>
                )}
              </button>
            </form>

            <div className="al-divider"><span>Secure access</span></div>
            <p className="al-foot">
              <Icon name="shield" size={14} />
              Reserved for authorized college administrators. Activity may be monitored.
            </p>
          </div>

          <p className="al-copy">© {new Date().getFullYear()} CampusSetu · Built for better campuses.</p>
        </section>
      </div>
    </div>
  );
}