import { useEffect, useMemo, useState } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { Activity, Bell, BookOpen, CalendarCheck, ChevronDown, GraduationCap, LayoutDashboard, LogOut, Menu, Moon, Search, Settings, ShieldCheck, Sun, Users, X, ClipboardList, ChartNoAxesCombined } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from './api';

const nav = [
  { label: 'Overview', to: '/', icon: LayoutDashboard },
  { label: 'Students', to: '/students', icon: GraduationCap },
  { label: 'Teachers', to: '/teachers', icon: Users },
  { label: 'Courses', to: '/courses', icon: BookOpen },
  { label: 'Attendance', to: '/attendance', icon: CalendarCheck },
  { label: 'Assignments', to: '/assignments', icon: ClipboardList },
  { label: 'Reports', to: '/reports', icon: ChartNoAxesCombined },
];
const chartData = [{ day: 'Mon', attendance: 72 }, { day: 'Tue', attendance: 84 }, { day: 'Wed', attendance: 78 }, { day: 'Thu', attendance: 91 }, { day: 'Fri', attendance: 86 }, { day: 'Sat', attendance: 95 }, { day: 'Sun', attendance: 89 }];

function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@muskan.edu');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try { const { data } = await api.post('/auth/login', { email, password }); onLogin(data); }
    catch (err) { setError(err.response?.data?.message || 'Unable to sign in. Check your details and server connection.'); }
    finally { setBusy(false); }
  }
  return <main className="login-wrap"><section className="login-card"><div className="brand-mark"><GraduationCap size={25}/></div><p className="eyebrow">WELCOME TO MUSKAN</p><h1>Learning starts<br/><span>together.</span></h1><p className="muted">Sign in to your education workspace.</p><form onSubmit={submit} className="login-form"><label>Email address<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@school.edu"/></label><label>Password<input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/></label>{error && <p className="error">{error}</p>}<button className="primary-btn" disabled={busy}>{busy ? 'Signing in…' : 'Sign in to MUSKAN'}</button></form><p className="login-foot">Learn Together. Grow Together.</p></section><aside className="login-art"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-copy"><span className="pill">ONE CAMPUS. ONE COMMUNITY.</span><h2>Make every<br/>learning moment<br/><em>count.</em></h2><p>One connected place for students, teachers, and the people who help them thrive.</p><div className="art-stat"><strong>01</strong><span>Purpose-built for better learning experiences</span></div></div></aside></main>;
}

function App() {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('muskan_user')); } catch { return null; } });
  const [stats, setStats] = useState(null);
  const [dark, setDark] = useState(localStorage.getItem('muskan_theme') === 'dark');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [section, setSection] = useState('Overview');
  const navigate = useNavigate();
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem('muskan_theme', dark ? 'dark' : 'light'); }, [dark]);
  useEffect(() => { if (!user) return; api.get('/dashboard/summary').then(r=>setStats(r.data)).catch(()=>setStats({ unavailable: true })); }, [user]);
  function login(data) { localStorage.setItem('muskan_token', data.token); localStorage.setItem('muskan_user', JSON.stringify(data.user)); setUser(data.user); }
  function logout() { localStorage.removeItem('muskan_token'); localStorage.removeItem('muskan_user'); setUser(null); setStats(null); navigate('/'); }
  const cards = useMemo(() => [
    { label: 'Total students', value: stats?.students ?? '—', icon: GraduationCap, tone: 'blue', note: 'Registered learners' },
    { label: 'Total teachers', value: stats?.teachers ?? '—', icon: Users, tone: 'violet', note: 'Teaching faculty' },
    { label: 'Active courses', value: stats?.courses ?? '—', icon: BookOpen, tone: 'mint', note: 'Available courses' },
    { label: 'Attendance today', value: stats?.attendanceToday == null ? '—' : `${stats.attendanceToday}%`, icon: CalendarCheck, tone: 'amber', note: 'Based on recorded attendance' },
  ], [stats]);
  if (!user) return <Login onLogin={login}/>;
  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}><div className="sidebar-brand"><div className="brand-mark"><GraduationCap size={23}/></div><div><b>MUSKAN</b><small>EDUCATION HUB</small></div><button className="mobile-close icon-btn" onClick={()=>setMobileOpen(false)}><X/></button></div><div className="workspace-label">WORKSPACE</div><nav>{nav.map(item=><NavLink key={item.to} to={item.to} end={item.to==='/'} onClick={()=>{setSection(item.label);setMobileOpen(false)}} className={({isActive})=>`nav-item ${isActive?'active':''}`}><item.icon size={18}/><span>{item.label}</span></NavLink>)}</nav><div className="sidebar-bottom"><div className="help-card"><ShieldCheck size={19}/><b>Your campus, connected.</b><p>Keep every learning journey moving forward.</p></div><button className="nav-item" onClick={()=>setDark(!dark)}>{dark?<Sun size={18}/>:<Moon size={18}/>}<span>{dark?'Light mode':'Dark mode'}</span></button><button className="nav-item" onClick={logout}><LogOut size={18}/><span>Sign out</span></button></div></aside>
    {mobileOpen && <button className="scrim" aria-label="Close menu" onClick={()=>setMobileOpen(false)}/>}
    <main className="main-area"><header className="topbar"><div className="top-left"><button className="icon-btn mobile-menu" onClick={()=>setMobileOpen(true)}><Menu/></button><div><span className="breadcrumb">Workspace /</span><b>{section}</b></div></div><div className="top-actions"><button className="search-box" onClick={()=>navigate('/students')}><Search size={16}/><span>Search records</span><kbd>⌘ K</kbd></button><button className="icon-btn notification"><Bell size={19}/><i/></button><div className="user-chip"><div className="avatar">{user.name?.slice(0,1)?.toUpperCase() || 'M'}</div><div><b>{user.name}</b><small>{user.role}</small></div><ChevronDown size={15}/></div></div></header>
      <div className="page-content"><Routes><Route path="/" element={<><div className="welcome-row"><div><p className="eyebrow">YOUR CAMPUS AT A GLANCE</p><h1>Good to see you, {user.name?.split(' ')[0] || 'there'} <span>✦</span></h1><p className="muted">Here’s what’s happening across your learning community.</p></div><div className="date-chip"><Activity size={16}/> Live workspace</div></div>{stats?.unavailable && <div className="notice">The API is not reachable yet. Start the server and connect PostgreSQL to load live figures.</div>}<section className="stats-grid">{cards.map(c=><article className="stat-card" key={c.label}><div className={`stat-icon ${c.tone}`}><c.icon size={20}/></div><p>{c.label}</p><strong>{c.value}</strong><small>{c.note}</small></article>)}</section><section className="content-grid"><article className="panel chart-panel"><div className="panel-heading"><div><h3>Learning activity</h3><p>Attendance trend · sample preview</p></div><span className="period-tag">Last 7 days</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="attendanceFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2998e8" stopOpacity={0.25}/><stop offset="100%" stopColor="#2998e8" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)"/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill:'var(--subtle)',fontSize:12}}/><YAxis domain={[0,100]} axisLine={false} tickLine={false} tick={{fill:'var(--subtle)',fontSize:12}}/><Tooltip/><Area type="monotone" dataKey="attendance" stroke="#2998e8" strokeWidth={3} fill="url(#attendanceFill)"/></AreaChart></ResponsiveContainer></div><p className="chart-note">Chart preview only. Live reporting will use recorded attendance once the database is connected.</p></article><article className="panel quick-panel"><div className="panel-heading"><div><h3>Quick actions</h3><p>Jump into your workspace</p></div></div>{[{icon:GraduationCap,title:'Student directory',desc:'Browse learner records',to:'/students'},{icon:Users,title:'Faculty directory',desc:'Explore teaching staff',to:'/teachers'},{icon:BookOpen,title:'Course catalogue',desc:'Manage learning paths',to:'/courses'}].map(x=><button className="quick-link" key={x.title} onClick={()=>{navigate(x.to);setSection(x.title)}}><span className="quick-icon"><x.icon size={18}/></span><span><b>{x.title}</b><small>{x.desc}</small></span><span className="quick-arrow">↗</span></button>)}</article></section><section className="panel getting-started"><div className="getting-icon"><ShieldCheck size={22}/></div><div><h3>Welcome to your MUSKAN workspace</h3><p>Core project foundation is in place. Student, teacher, course, attendance, and assessment management screens are being added in development.</p></div><span className="status-tag">Foundation</span></section></>} /><Route path="*" element={<section className="panel placeholder"><div className="stat-icon blue"><Settings/></div><h2>{section}</h2><p>This module is part of the development roadmap and is not active yet.</p><button className="secondary-btn" onClick={()=>navigate('/')}>Back to overview</button></section>}/></Routes></div>
      <footer className="footer"><span>© {new Date().getFullYear()} MUSKAN Education Hub</span><span>Learn Together. Grow Together.</span></footer></main>
  </div>;
}
export default App;