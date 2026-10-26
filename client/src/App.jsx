import { useEffect, useMemo, useState } from "react";
import { BookOpen, Search, GraduationCap, LayoutDashboard, BookMarked, LogOut, UserRound, Clock3, Users, CheckCircle2, X, Menu } from "lucide-react";

const API = "http://localhost:5000/api";
const demoCourses = [
  { _id:"demo1", title:"Python Programming", description:"Learn Python fundamentals, functions, files and practical problem solving.", category:"Programming", availableSeats:30 },
  { _id:"demo2", title:"Full-Stack Web Development", description:"Build responsive websites with HTML, CSS, JavaScript and backend APIs.", category:"Web Development", availableSeats:25 },
  { _id:"demo3", title:"Java Fundamentals", description:"Explore object-oriented programming, classes, collections and exceptions.", category:"Programming", availableSeats:20 },
  { _id:"demo4", title:"Data Science Essentials", description:"Understand data preparation, analysis, visualisation and basic machine learning.", category:"Data Science", availableSeats:18 },
  { _id:"demo5", title:"Database Management", description:"Learn data modelling, queries, relationships and database design.", category:"Data Science", availableSeats:22 },
  { _id:"demo6", title:"React for Beginners", description:"Create component-based interfaces with props, state and reusable UI.", category:"Web Development", availableSeats:15 }
];

export default function App() {
  const [token,setToken] = useState(localStorage.getItem("scp_token") || "");
  const [user,setUser] = useState(JSON.parse(localStorage.getItem("scp_user") || "null"));
  const [view,setView] = useState(token ? "catalogue" : "login");
  const [authMode,setAuthMode] = useState("login");
  const [courses,setCourses] = useState([]);
  const [myCourses,setMyCourses] = useState([]);
  const [search,setSearch] = useState("");
  const [category,setCategory] = useState("All");
  const [loading,setLoading] = useState(false);
  const [notice,setNotice] = useState("");
  const [error,setError] = useState("");
  const [menuOpen,setMenuOpen] = useState(false);
  const [form,setForm] = useState({name:"",email:"",password:""});
  const categories = useMemo(()=>["All",...new Set(courses.map(c=>c.category))],[courses]);
  const enrolledIds = new Set(myCourses.map(e=>e.course?._id || e.courseId));

  async function api(path, options={}) {
    const response = await fetch(`${API}${path}`, { ...options, headers: {
      "Content-Type":"application/json", ...(token ? {Authorization:`Bearer ${token}`} : {}), ...(options.headers || {})
    }});
    const data = await response.json().catch(()=>({message:"Unexpected server response."}));
    if (!response.ok) throw new Error(data.message || "Something went wrong.");
    return data;
  }
  async function loadCourses() {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams();
      if(search.trim()) params.set("search",search.trim());
      if(category!=="All") params.set("category",category);
      const data = await api(`/courses?${params}`);
      setCourses(data);
    } catch(e) {
      setCourses(demoCourses.filter(c => (!search || (c.title+" "+c.description).toLowerCase().includes(search.toLowerCase())) && (category==="All" || c.category===category)));
      setError("Backend not connected — showing sample courses. Start the Express server and MongoDB to save real enrolments.");
    } finally { setLoading(false); }
  }
  async function loadMine() {
    if(!token) return;
    try { setMyCourses(await api("/enrolments/me")); } catch(e) { setError(e.message); }
  }
  useEffect(()=>{ loadCourses(); },[search,category,token]);
  useEffect(()=>{ if(token) loadMine(); },[token]);
  function signedIn(data) {
    localStorage.setItem("scp_token",data.token); localStorage.setItem("scp_user",JSON.stringify(data.user));
    setToken(data.token); setUser(data.user); setView("catalogue"); setNotice("Welcome! You are signed in."); setError("");
  }
  async function submitAuth(e) {
    e.preventDefault(); setError(""); setNotice("");
    if(authMode==="register" && !form.name.trim()) return setError("Please enter your full name.");
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError("Please enter a valid email address.");
    if(form.password.length<6) return setError("Password must be at least 6 characters.");
    try { signedIn(await api(`/auth/${authMode}`,{method:"POST",body:JSON.stringify(form)})); }
    catch(e) { setError(e.message + (e.message.includes("fetch") ? " Check that the backend is running." : "")); }
  }
  async function enrol(course) {
    setError(""); setNotice("");
    if(!token) { setView("login"); setError("Please log in before enrolling."); return; }
    if(course.availableSeats<1) { setError("Sorry, no seats remain for this course."); return; }
    if(enrolledIds.has(course._id)) { setError("You are already enrolled in this course."); return; }
    try {
      await api("/enrolments",{method:"POST",body:JSON.stringify({courseId:course._id})});
      setNotice(`Successfully enrolled in ${course.title}.`); await loadCourses(); await loadMine();
    } catch(e) { setError(e.message); }
  }
  async function cancel(enrolment) {
    try { await api(`/enrolments/${enrolment._id}`,{method:"DELETE"}); setNotice("Enrolment cancelled successfully."); setError(""); await loadCourses(); await loadMine(); }
    catch(e) { setError(e.message); }
  }
  function logout() { localStorage.removeItem("scp_token"); localStorage.removeItem("scp_user"); setToken(""); setUser(null); setMyCourses([]); setView("login"); setNotice("You have signed out."); }
  const demoMode = !token;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-icon"><GraduationCap size={24} /></div><div><strong>Coursely</strong><small>STUDENT PORTAL</small></div></div>
        <div className="side-label">WORKSPACE</div>
        <button className="nav-item" onClick={() => setView("catalogue")}><LayoutDashboard size={18} /> Course catalogue</button>
        <button className="nav-item" onClick={() => { if (!token) { setView("login"); setError("Please sign in first."); } else { setView("mycourses"); loadMine(); } }}><BookMarked size={18} /> My courses ({myCourses.length})</button>
        {token && <button className="nav-item signout" onClick={logout}><LogOut size={18} /> Sign out</button>}
      </aside>
      <main className="main">
        <header className="topbar"><div className="breadcrumb">Student Portal / <b>{view === "mycourses" ? "My courses" : view === "register" ? "Create account" : view === "login" ? "Sign in" : "Course catalogue"}</b></div><div className="top-right">{user?.name || "Student"}</div></header>
        <div className="content">
          {(notice || error) && <div className={`notice ${error ? "error" : "success"}`}><span>{error || notice}</span><button onClick={() => { setNotice(""); setError(""); }}><X size={16} /></button></div>}
          {(view === "login" || view === "register") ? (
            <section className="auth-wrap">
              <div className="auth-art"><div className="art-symbol"><GraduationCap size={54} /></div><h2>Learn something new.</h2><p>Discover courses and build skills for your future.</p></div>
              <div className="auth-panel">
                <div className="auth-heading"><span className="eyebrow">STUDENT PORTAL</span><h1>{view === "login" ? "Sign in" : "Create account"}</h1><p>Enter your details to continue.</p></div>
                <form className="auth-form" onSubmit={submitAuth}>
                  {view === "register" && <label>Full name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Your full name" /></label>}
                  <label>Email address<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="you@example.com" /></label>
                  <label>Password<input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} minLength={6} required placeholder="At least 6 characters" /></label>
                  <button className="primary-btn full" type="submit">{view === "login" ? "Sign in" : "Create account"}</button>
                </form>
                <div className="auth-switch">{view === "login" ? "New student?" : "Already registered?"} <button onClick={() => { const next = view === "login" ? "register" : "login"; setView(next); setAuthMode(next); setError(""); setNotice(""); }}> {view === "login" ? "Create account" : "Sign in"}</button></div>
              </div>
            </section>
          ) : view === "mycourses" ? (
            <section className="catalogue-section"><div className="section-heading"><div><span className="eyebrow">YOUR LEARNING</span><h2>My courses</h2><p>View or cancel your enrolments.</p></div></div>
              {myCourses.length === 0 ? <div className="empty-state"><h3>No enrolled courses yet</h3><button className="primary-btn" onClick={() => setView("catalogue")}>Browse courses</button></div> : <div className="course-grid">{myCourses.map((en, i) => en.course && <CourseCard key={en._id} course={en.course} enrolled onAction={() => cancel(en)} actionText="Cancel enrolment" index={i} />)}</div>}
            </section>
          ) : (
            <section className="catalogue-section">
              <div className="section-heading"><div><span className="eyebrow">THE COURSE LIBRARY</span><h1>Course catalogue</h1><p>Search and enrol in available courses.</p></div><div className="course-total"><strong>{courses.length}</strong><span>courses available</span></div></div>
              <div className="filters"><div className="searchbox"><Search size={18} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..." /></div><select value={category} onChange={e => setCategory(e.target.value)}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              {loading ? <div className="loading">Loading courses...</div> : courses.length === 0 ? <div className="empty-state"><h3>No courses found</h3><p>Try another search.</p></div> : <div className="course-grid">{courses.map((course, i) => <CourseCard key={course._id} course={course} enrolled={enrolledIds.has(course._id)} onAction={() => enrol(course)} actionText={enrolledIds.has(course._id) ? "Enrolled" : "Enrol now"} index={i} />)}</div>}
            </section>
          )}
        </div>
        <footer className="footer"><span>© 2026 Coursely Student Portal</span><span>Learn. Grow. Achieve.</span></footer>
      </main>
    </div>
  );
}

function CourseCard({course,enrolled,onAction,actionText,index=0}) {
 const themes=["lavender","mint","peach","blue","yellow","pink"];
 const symbols=["</>","✳","{ }","▤","◈","⚡"];
 return <article className="course-card"><div className={`course-art ${themes[index%themes.length]}`}><span className="course-symbol">{symbols[index%symbols.length]}</span><span className="category-tag">{course.category}</span><span className="course-number">0{index+1}</span></div><div className="course-body"><div className="course-meta"><span><Clock3 size={13}/> Self-paced</span><span><Users size={13}/> {course.availableSeats} seats</span></div><h3>{course.title}</h3><p>{course.description}</p><div className="course-bottom"><span className={`seat-status ${course.availableSeats<1?"sold":""}`}><i></i>{course.availableSeats>0?`${course.availableSeats} seats left`:"Full"}</span><button disabled={enrolled||course.availableSeats<1} className={`enrol-btn ${enrolled?"enrolled":""}`} onClick={onAction}>{enrolled?"✓ Enrolled":actionText}</button></div></div></article>
}
