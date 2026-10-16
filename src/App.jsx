import { useMemo, useState } from 'react';
import { Activity, ArrowLeft, ArrowRight, BookOpen, Brain, Check, ChevronDown, Clock3, Flame, Folder, Grid2X2, Layers3, Leaf, Library, ListChecks, Menu, MoreHorizontal, Plus, Search, Settings2, Sparkles, Target, X } from 'lucide-react';

const starterSets = [
  { id: 1, subject: 'Medical Terminology', title: 'Chapter 01 · Foundations', cards: 42, progress: 68, color: 'moss', last: 'Today', description: 'Word roots, prefixes, and suffixes' },
  { id: 2, subject: 'Medical Terminology', title: 'Chapter 02 · Body Systems', cards: 36, progress: 34, color: 'sage', last: 'Yesterday', description: 'Anatomy and system vocabulary' },
  { id: 3, subject: 'Medical Terminology', title: 'Chapter 03 · Common Conditions', cards: 28, progress: 0, color: 'amber', last: 'Not started', description: 'Conditions, signs, and symptoms' },
  { id: 4, subject: 'English', title: 'Vocabulary & Grammar', cards: 54, progress: 22, color: 'blue', last: '3 days ago', description: 'Definitions, usage, and grammar' },
];
const cards = [
  { term: 'cardi/o', definition: 'Heart', kind: 'Word part' },
  { term: 'hepat/o', definition: 'Liver', kind: 'Word part' },
  { term: '−itis', definition: 'Inflammation', kind: 'Suffix' },
  { term: 'bradycardia', definition: 'An abnormally slow heart rate', kind: 'Term' },
  { term: 'nephr/o', definition: 'Kidney', kind: 'Word part' },
];
const modes = [
  { name: 'Flashcards', detail: 'Flip through your set', Icon: Layers3, tint: 'green' },
  { name: 'Learn', detail: 'Build lasting recall', Icon: Brain, tint: 'purple' },
  { name: 'Match', detail: 'Pair terms and meanings', Icon: Grid2X2, tint: 'orange' },
  { name: 'Quiz', detail: 'Check what you know', Icon: ListChecks, tint: 'blue' },
];

export default function App() {
  const [sets, setSets] = useState(starterSets);
  const [activeNav, setActiveNav] = useState('Overview');
  const [query, setQuery] = useState('');
  const [selectedSet, setSelectedSet] = useState(starterSets[0]);
  const [screen, setScreen] = useState('home');
  const [mode, setMode] = useState('Flashcards');
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  const [showNewSet, setShowNewSet] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Medical Terminology');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notice, setNotice] = useState('');
  const filteredSets = useMemo(() => sets.filter(s => (s.title + ' ' + s.subject + ' ' + s.description).toLowerCase().includes(query.toLowerCase())), [sets, query]);
  const currentCard = cards[cardIndex % cards.length];

  function startMode(nextMode, set = selectedSet) {
    setSelectedSet(set); setMode(nextMode); setCardIndex(0); setFlipped(false); setScreen('study'); setNotice('');
  }
  function addSet(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const item = { id: Date.now(), subject: newSubject.trim() || 'Unsorted', title: newTitle.trim(), cards: 0, progress: 0, color: 'moss', last: 'Not started', description: 'Your new study set' };
    setSets(prev => [item, ...prev]); setSelectedSet(item); setNewTitle(''); setShowNewSet(false); setActiveNav('Library'); setNotice('Your new set is ready. Add cards when you open it.');
  }
  function navTo(name) { setActiveNav(name); setScreen('home'); setMobileMenu(false); setNotice(name === 'Review' ? 'Your review queue will appear here once study progress is connected.' : ''); }
  function nextCard(markKnown = false) {
    if (markKnown) setKnown(prev => prev.includes(cardIndex) ? prev : [...prev, cardIndex]);
    setCardIndex(i => (i + 1) % cards.length); setFlipped(false);
  }

  if (screen === 'study') return <div className="study-screen">
    <header className="study-top"><button className="icon-button" onClick={() => setScreen('home')} aria-label="Back"><ArrowLeft size={19}/></button><div className="study-breadcrumb"><span>{selectedSet.subject}</span><span> / </span><strong>{selectedSet.title}</strong></div><button className="icon-button" onClick={() => setScreen('home')} aria-label="Close study"><X size={19}/></button></header>
    <main className="study-main">
      <div className="study-kicker"><span className="live-dot"/> {mode.toUpperCase()} SESSION · {cardIndex + 1} OF {selectedSet.cards || cards.length}</div>
      <h1>{mode === 'Quiz' ? 'Quick knowledge check' : mode === 'Learn' ? 'Make it stick.' : 'Take it one card at a time.'}</h1>
      <p className="study-subtitle">{selectedSet.title} <span>·</span> Take your time. The goal is understanding, not speed.</p>
      {mode === 'Flashcards' || mode === 'Learn' ? <button className={'flashcard ' + (flipped ? 'is-flipped' : '')} onClick={() => setFlipped(v => !v)}>
        <span className="card-topline"><span>{currentCard.kind}</span><span>{flipped ? 'DEFINITION' : 'TERM'}</span></span>
        <span className="card-content">{flipped ? currentCard.definition : currentCard.term}</span>
        <span className="card-hint">Tap card to {flipped ? 'see term' : 'reveal answer'}</span>
      </button> : <section className="quiz-card"><span className="eyebrow">QUESTION {cardIndex + 1}</span><h2>What does <em>{currentCard.term}</em> mean?</h2><div className="answer-list">{[currentCard.definition, 'Muscle tissue', 'A blood vessel', 'Inflammation of the skin'].map((a,i)=><button key={a} className="answer-option" onClick={() => setNotice(a === currentCard.definition ? 'Correct. Nice work.' : 'Not quite. Review the definition, then try again.')}><span className="answer-letter">{String.fromCharCode(65+i)}</span>{a}</button>)}</div>{notice && <p className="feedback">{notice}</p>}</section>}
      <div className="study-controls"><button className="secondary-button" onClick={() => {setCardIndex(i => (i + cards.length - 1) % cards.length);setFlipped(false)}}><ArrowLeft size={16}/> Previous</button><div className="progress-pips">{cards.map((c,i)=><button key={c.term} aria-label={'Go to card '+(i+1)} className={i === cardIndex ? 'pip active' : known.includes(i) ? 'pip done' : 'pip'} onClick={() => {setCardIndex(i);setFlipped(false)}}/>)}</div><button className="primary-button" onClick={() => nextCard(true)}>Got it <Check size={16}/></button></div>
      <div className="study-footnote"><Sparkles size={15}/> Small sessions add up. You're doing better than you think.</div>
    </main>
  </div>;

  return <div className="app-shell">
    <aside className={'sidebar ' + (mobileMenu ? 'sidebar-open' : '')}>
      <div className="brand"><div className="brand-mark"><Leaf size={19}/></div><div className="brand-copy"><strong>Study Space</strong><span>YOUR QUIET CORNER</span></div><button className="close-mobile icon-button" onClick={() => setMobileMenu(false)} aria-label="Close menu"><X size={18}/></button></div>
      <button className="profile-switch"><div className="avatar">Z</div><span><strong>My learning</strong><small>Personal library</small></span><ChevronDown size={15}/></button>
      <div className="nav-label">WORKSPACE</div>
      <nav className="main-nav">{[['Overview',Activity],['Library',Library],['Review',Target]].map(([label,Icon])=><button key={label} className={'nav-item '+(activeNav===label?'active':'')} onClick={() => navTo(label)}><Icon size={18}/><span>{label}</span>{label==='Review' && <span className="nav-count">4</span>}</button>)}</nav>
      <div className="nav-label subject-label">YOUR SUBJECTS <button className="tiny-plus" onClick={() => setShowNewSet(true)} aria-label="Add subject or set"><Plus size={14}/></button></div>
      <div className="subject-list"><button className="subject-item selected"><span className="subject-dot green-dot"/><span>Medical Terminology</span><span className="subject-count">3</span></button><button className="subject-item"><span className="subject-dot gold-dot"/><span>English</span><span className="subject-count">1</span></button><button className="subject-item muted-subject" onClick={() => setShowNewSet(true)}><Plus size={14}/><span>Add a subject</span></button></div>
      <div className="sidebar-bottom"><div className="streak-card"><div className="streak-icon"><Flame size={18}/></div><div><strong>Keep your rhythm</strong><p>A little practice goes a long way.</p></div></div><button className="nav-item settings-item" onClick={() => setNotice('Settings will be added with account setup.')}><Settings2 size={18}/><span>Settings</span></button><div className="sidebar-user"><div className="avatar avatar-small">Z</div><div><strong>Zero</strong><small>Private account</small></div><span className="online-dot"/></div></div>
    </aside>
    {mobileMenu && <button className="scrim" onClick={() => setMobileMenu(false)} aria-label="Close navigation"/>}
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="menu-button icon-button" onClick={() => setMobileMenu(true)} aria-label="Open menu"><Menu size={20}/></button><div className="breadcrumbs"><span>Workspace</span><span>/</span><strong>{activeNav}</strong></div></div><div className="topbar-actions"><label className="searchbox"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search your library..."/><kbd>⌘ K</kbd></label><button className="icon-button top-action" aria-label="Notifications" onClick={() => setNotice('You’re all caught up.')}><Clock3 size={18}/></button><div className="top-avatar">Z</div></div></header>
      <div className="page-content">
        {notice && <div className="notice"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss"><X size={15}/></button></div>}
        <section className="welcome-row"><div><div className="date-label"><span className="live-dot"/> YOUR LEARNING SPACE</div><h1>{activeNav==='Overview'?'A quieter way to learn.':activeNav==='Library'?'Your library.':'Time for a quick review.'}</h1><p className="welcome-subtitle">{activeNav==='Overview'?'Pick up where you left off, or start with something small.':activeNav==='Library'?'Everything you’re learning, gathered in one place.':'Bring the tricky cards back into focus.'}</p></div><button className="primary-button new-set-button" onClick={() => setShowNewSet(true)}><Plus size={17}/> New study set</button></section>
        <section className="hero-card"><div className="hero-text"><div className="hero-eyebrow"><span className="hero-spark"><Sparkles size={14}/></span> YOUR NEXT SMALL WIN</div><h2>Progress happens<br/><em>one card at a time.</em></h2><p>Return to your last session and build on what you already know.</p><button className="hero-button" onClick={() => startMode('Flashcards', sets[0])}>Continue learning <ArrowRight size={16}/></button><div className="hero-meta"><span><Layers3 size={14}/> Chapter 01 · Foundations</span><span>·</span><span>42 cards</span></div></div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="art-leaf leaf-one"><Leaf size={65}/></div><div className="art-leaf leaf-two"><Leaf size={44}/></div><div className="art-book"><BookOpen size={42}/></div><div className="art-star star-one">✳</div><div className="art-star star-two">✦</div><div className="art-dot dot-one"/><div className="art-dot dot-two"/></div><div className="hero-bottom-line"/></section>
        <section className="stats-grid"><div className="stat-card"><div className="stat-icon stat-green"><BookOpen size={17}/></div><div className="stat-label">STUDY SETS</div><div className="stat-value">{sets.length.toString().padStart(2,'0')}<span> sets in your library</span></div><div className="stat-foot"><span className="tiny-bar"><i style={{width:'70%'}}/></span><span>Growing at your pace</span></div></div><div className="stat-card"><div className="stat-icon stat-purple"><Target size={17}/></div><div className="stat-label">CARDS TO REVIEW</div><div className="stat-value">12<span> cards waiting</span></div><div className="stat-foot"><span>A good place to start</span></div></div><div className="stat-card"><div className="stat-icon stat-amber"><Flame size={17}/></div><div className="stat-label">STUDY STREAK</div><div className="stat-value">0<span> days in a row</span></div><div className="stat-foot"><span>Today can be day one</span></div></div></section>
        <section className="section-block"><div className="section-heading"><div><div className="section-kicker">CHOOSE YOUR APPROACH</div><h2>Study your way</h2></div><button className="text-link" onClick={() => setNotice('More study modes will arrive as the core library takes shape.')}>Explore modes <ArrowRight size={15}/></button></div><div className="mode-grid">{modes.map(({name,detail,Icon,tint})=><button className="mode-card" key={name} onClick={() => startMode(name)}><div className={'mode-icon '+tint}><Icon size={20}/></div><div className="mode-title">{name}</div><div className="mode-detail">{detail}</div><ArrowRight className="mode-arrow" size={16}/></button>)}</div></section>
        <section className="section-block library-section"><div className="section-heading"><div><div className="section-kicker">PICK UP WHERE YOU LEFT OFF</div><h2>{activeNav==='Review'?'Your study sets':'Recently studied'}</h2></div><div className="heading-actions"><button className="filter-button" onClick={() => setNotice('Filters will be available with tags and set management.')}>Filter</button><button className="text-link" onClick={() => navTo('Library')}>View library <ArrowRight size={15}/></button></div></div><div className="set-list">{filteredSets.map(set=><article className="set-row" key={set.id}><button className={'set-cover '+set.color} onClick={() => {setSelectedSet(set);setNotice(set.title+' selected. Choose a study mode to begin.')}}><Folder size={22}/><span className="cover-lines"><i/><i/><i/></span></button><button className="set-details" onClick={() => {setSelectedSet(set);setNotice(set.title+' selected. Choose a study mode to begin.')}}><span className="set-subject">{set.subject}</span><strong>{set.title}</strong><span className="set-description">{set.description}</span></button><div className="set-card-count"><strong>{set.cards}</strong><span>cards</span></div><div className="set-progress"><div className="progress-label"><span>Familiarity</span><strong>{set.progress}%</strong></div><div className="progress-track"><i style={{width:set.progress+'%'}}/></div><span className="last-studied">{set.last}</span></div><button className="row-more icon-button" onClick={() => {setSelectedSet(set);setNotice('Selected '+set.title+'. Choose a study mode above to begin.')}} aria-label={'More options for '+set.title}><MoreHorizontal size={19}/></button></article>)}{filteredSets.length===0 && <div className="empty-state"><Search size={22}/><strong>No sets found</strong><span>Try another search, or create a new study set.</span><button className="secondary-button" onClick={() => {setQuery('');setShowNewSet(true)}}><Plus size={15}/> New study set</button></div>}</div></section>
        <footer className="page-footer"><span><Leaf size={14}/> A little progress is still progress.</span><span>PRIVATE BY DESIGN · NO ADS, EVER</span></footer>
      </div>
    </main>
    {showNewSet && <div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setShowNewSet(false)}}><form className="modal" onSubmit={addSet}><div className="modal-heading"><div><div className="section-kicker">BUILD YOUR LIBRARY</div><h2>Create a study set</h2></div><button type="button" className="icon-button" onClick={() => setShowNewSet(false)} aria-label="Close"><X size={18}/></button></div><p className="modal-copy">Give this set a home. You can add cards after creating it.</p><label className="field-label">Set name<input autoFocus value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="e.g. Chapter 04 · The nervous system" required/></label><label className="field-label">Subject<select value={newSubject} onChange={e=>setNewSubject(e.target.value)}><option>Medical Terminology</option><option>English</option><option>Mathematics</option><option>Biology</option><option>Languages</option><option>Other</option></select></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowNewSet(false)}>Cancel</button><button type="submit" className="primary-button"><Plus size={16}/> Create set</button></div></form></div>}
  </div>;
}
