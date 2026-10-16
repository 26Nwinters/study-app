import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowLeft, ArrowRight, BookOpen, Brain, Check, CheckCheck, ChevronDown, CircleHelp, Clock3, Copy, Download, FileText, Flame, Folder, Grid2X2, Layers3, Leaf, Library, ListChecks, Menu, MoreHorizontal, Plus, Search, Settings2, Sparkles, Target, X, Pencil, RotateCcw, Archive, Tag, Keyboard, Trophy, BarChart3, BookMarked, Shuffle, Save, AlertTriangle, CheckCircle2, Trash2, Upload } from 'lucide-react';

const STORAGE_KEY = 'study-space-data-v2';
const modes = [
  { name: 'Flashcards', detail: 'Flip through your set', Icon: Layers3, tint: 'green' },
  { name: 'Learn', detail: 'Adaptive recall practice', Icon: Brain, tint: 'purple' },
  { name: 'Match', detail: 'Pair terms and meanings', Icon: Grid2X2, tint: 'orange' },
  { name: 'Quiz', detail: 'Test what you know', Icon: ListChecks, tint: 'blue' },
  { name: 'Write', detail: 'Type answers from memory', Icon: Keyboard, tint: 'purple' },
  { name: 'Word Builder', detail: 'Explore word parts', Icon: BookMarked, tint: 'green' },
  { name: 'Challenge', detail: 'Practice in short rounds', Icon: Trophy, tint: 'orange' },
  { name: 'Progress', detail: 'Review your learning', Icon: BarChart3, tint: 'blue' },
];
const uid = () => globalThis.crypto?.randomUUID?.() || 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2);
const freshProgress = () => ({ correct: 0, incorrect: 0, mastery: 0, lastStudied: null, nextReview: null });
const card = (term = '', definition = '', type = 'term', extra = {}) => ({ id: uid(), term, definition, type, tags: [], parts: '', hint: '', ...extra, progress: extra.progress || freshProgress() });
const buildSet = (subject, title, description, rows, color = 'moss') => ({ id: uid(), subject, title, description, color, tags: [], archived: false, createdAt: new Date().toISOString(), cards: rows.map(([term, definition, type = 'term', parts = '']) => card(term, definition, type, { parts })) });
function initialData() {
  return {
    version: 2, settings: { quizCount: 10, spellingTolerance: 'lenient', dailyGoal: 10, showExamples: true },
    sets: [
      buildSet('Medical Terminology', 'Chapter 01 · Foundations', 'Word roots, prefixes, and suffixes', [
        ['cardi/o', 'Heart', 'word-part', 'cardi + o: heart, combining vowel'], ['hepat/o', 'Liver', 'word-part', 'hepat + o: liver, combining vowel'], ['nephr/o', 'Kidney', 'word-part', 'nephr + o: kidney, combining vowel'], ['-itis', 'Inflammation', 'word-part', 'suffix: inflammation'], ['bradycardia', 'An abnormally slow heart rate', 'term', 'brady = slow; cardi = heart; ia = condition'], ['tachycardia', 'An abnormally fast heart rate', 'term', 'tachy = fast; cardi = heart; ia = condition'], ['dermatology', 'The study of skin', 'term', 'dermat/o = skin; -logy = study of'], ['gastr/o', 'Stomach', 'word-part', 'gastr + o: stomach, combining vowel']
      ]),
      buildSet('English', 'Vocabulary & Grammar', 'Definitions, usage, and grammar', [
        ['Metaphor', 'A comparison that describes one thing as another'], ['Simile', 'A comparison using like or as'], ['Clause', 'A group of words containing a subject and a verb']
      ], 'blue'),
      buildSet('Mathematics', 'Algebra & Geometry', 'Useful formulas and concepts', [
        ['Slope', 'Change in y divided by change in x: (y₂ − y₁) / (x₂ − x₁)', 'equation'], ['Area of a triangle', 'A = ½bh', 'equation']
      ], 'amber')
    ],
    sessions: [], streak: { days: 0, lastDate: null }
  };
}
function readData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.sets)) return { ...initialData(), ...parsed, settings: { ...initialData().settings, ...(parsed.settings || {}) } };
    }
  } catch (error) { console.warn('Could not read saved study data', error); }
  return initialData();
}
const norm = value => String(value || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/\([^)]*\)/g, ' ').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
const due = c => !c.progress?.nextReview || new Date(c.progress.nextReview).getTime() <= Date.now();
const dateLabel = value => {
  if (!value) return 'Not studied yet';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Not studied yet';
  if (d.toDateString() === new Date().toDateString()) return 'Today';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};
const downloadText = (name, text, type = 'text/plain') => {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
};
const shuffle = items => [...items].sort(() => Math.random() - 0.5);

export default function App() {
  const [data, setData] = useState(readData);
  const [nav, setNav] = useState('Overview');
  const [query, setQuery] = useState('');
  const [screen, setScreen] = useState('home');
  const [selectedId, setSelectedId] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notice, setNotice] = useState('');
  const [modal, setModal] = useState('');
  const [setDraft, setSetDraft] = useState({ id: null, title: '', subject: 'Medical Terminology', description: '', tags: '' });
  const [cardDraft, setCardDraft] = useState({ id: null, term: '', definition: '', type: 'term', parts: '', hint: '', tags: '' });
  const [importText, setImportText] = useState('');
  const [importSetId, setImportSetId] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [importFilter, setImportFilter] = useState('All');
  const [bulkText, setBulkText] = useState('');
  const [selectedCards, setSelectedCards] = useState([]);
  const [study, setStudy] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [choice, setChoice] = useState('');
  const [flipped, setFlipped] = useState(false);
  const [matched, setMatched] = useState([]);
  const [matchSelection, setMatchSelection] = useState(null);
  const [quizCount, setQuizCount] = useState(10);
  const [settingsDraft, setSettingsDraft] = useState(data.settings);
  const [subjectFilter, setSubjectFilter] = useState('All subjects');

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
    catch { setNotice('Browser storage is full. Export a backup and remove large attachments or old sets.'); }
  }, [data]);

  const sets = data.sets || [];
  const activeSets = sets.filter(s => !s.archived);
  const selectedSet = sets.find(s => s.id === selectedId) || null;
  const allCards = activeSets.flatMap(s => s.cards.map(c => ({ ...c, setId: s.id, setTitle: s.title, subject: s.subject })));
  const dueCards = allCards.filter(due);
  const studiedCards = allCards.filter(c => c.progress?.lastStudied);
  const averageMastery = allCards.length ? Math.round(allCards.reduce((n,c) => n + (c.progress?.mastery || 0), 0) / allCards.length) : 0;
  const filteredSets = useMemo(() => activeSets.filter(s => (subjectFilter === 'All subjects' || s.subject === subjectFilter) && (s.title + ' ' + s.subject + ' ' + s.description + ' ' + (s.tags || []).join(' ')).toLowerCase().includes(query.toLowerCase())), [activeSets, query, subjectFilter]);
  const subjects = [...new Set(activeSets.map(s => s.subject))];
  const deck = study?.deck || [];
  const current = deck[study?.index || 0];
  const sessionTitle = study?.setIds?.map(id => sets.find(s => s.id === id)?.title).filter(Boolean).join(' + ') || 'Study session';

  function notify(message) { setNotice(message); }
  function patchSet(id, fn) { setData(prev => ({ ...prev, sets: prev.sets.map(s => s.id === id ? fn(s) : s) })); }
  function patchCard(setId, cardId, fn) { patchSet(setId, s => ({ ...s, cards: s.cards.map(c => c.id === cardId ? fn(c) : c) })); }
  function navigate(name) { setNav(name); setScreen('home'); setMobileMenu(false); setNotice(''); if (name === 'Settings') setModal('settings'); }
  function openSetEditor(s = null) { setSetDraft(s ? { id: s.id, title: s.title, subject: s.subject, description: s.description || '', tags: (s.tags || []).join(', ') } : { id: null, title: '', subject: selectedSet?.subject || 'Medical Terminology', description: '', tags: '' }); setModal('set'); }
  function saveSet(e) {
    e.preventDefault(); if (!setDraft.title.trim()) return;
    const fields = { title: setDraft.title.trim(), subject: setDraft.subject.trim() || 'Unsorted', description: setDraft.description.trim(), tags: setDraft.tags.split(',').map(t => t.trim()).filter(Boolean) };
    if (setDraft.id) { setData(p => ({ ...p, sets: p.sets.map(s => s.id === setDraft.id ? { ...s, ...fields } : s) })); notify('Study set updated.'); }
    else { const s = { id: uid(), ...fields, color: 'moss', archived: false, createdAt: new Date().toISOString(), cards: [] }; setData(p => ({ ...p, sets: [s, ...p.sets] })); setSelectedId(s.id); setNav('Library'); notify('Set created. Add your cards next.'); }
    setModal('');
  }
  function openCardEditor(c = null) { setCardDraft(c ? { id: c.id, term: c.term, definition: c.definition, type: c.type || 'term', parts: c.parts || '', hint: c.hint || '', tags: (c.tags || []).join(', ') } : { id: null, term: '', definition: '', type: 'term', parts: '', hint: '', tags: '' }); setModal('card'); }
  function saveCard(e) {
    e.preventDefault(); if (!selectedSet || !cardDraft.term.trim() || !cardDraft.definition.trim()) return;
    const tags = cardDraft.tags.split(',').map(t => t.trim()).filter(Boolean);
    if (cardDraft.id) { patchCard(selectedSet.id, cardDraft.id, c => ({ ...c, term: cardDraft.term.trim(), definition: cardDraft.definition.trim(), type: cardDraft.type, parts: cardDraft.parts.trim(), hint: cardDraft.hint.trim(), tags })); notify('Card saved. Existing study history was preserved.'); }
    else { patchSet(selectedSet.id, s => ({ ...s, cards: [...s.cards, card(cardDraft.term.trim(), cardDraft.definition.trim(), cardDraft.type, { parts: cardDraft.parts.trim(), hint: cardDraft.hint.trim(), tags })] })); notify('Card added.'); }
    setModal('');
  }
  function removeCard(setId, cardId) { if (!window.confirm('Delete this card and its study history?')) return; patchSet(setId, s => ({ ...s, cards: s.cards.filter(c => c.id !== cardId) })); setSelectedCards(p => p.filter(id => id !== cardId)); notify('Card deleted.'); }
  function removeSet(id) { const s = sets.find(x => x.id === id); if (!s || !window.confirm('Permanently delete "' + s.title + '" and its cards? Export a backup first if you may need it.')) return; setData(p => ({ ...p, sets: p.sets.filter(x => x.id !== id) })); setSelectedId(null); notify('Study set deleted.'); }
  function archiveSet(id) { patchSet(id, s => ({ ...s, archived: true })); setSelectedId(null); notify('Set archived. Restore it in Settings.'); }
  function restoreSet(id) { patchSet(id, s => ({ ...s, archived: false })); notify('Set restored.'); }
  function markProgress(c, isCorrect) {
    const setId = c.setId || study?.setIds?.find(id => sets.find(s => s.id === id)?.cards.some(x => x.id === c.id));
    if (!setId) return;
    const now = new Date();
    patchCard(setId, c.id, old => {
      const p = old.progress || freshProgress();
      const mastery = Math.max(0, Math.min(100, (p.mastery || 0) + (isCorrect ? 12 : -8)));
      const days = isCorrect ? (mastery >= 80 ? 7 : mastery >= 50 ? 3 : 1) : 0;
      return { ...old, progress: { ...p, correct: (p.correct || 0) + (isCorrect ? 1 : 0), incorrect: (p.incorrect || 0) + (isCorrect ? 0 : 1), mastery, lastStudied: now.toISOString(), nextReview: new Date(now.getTime() + days * 86400000).toISOString() } };
    });
    setData(p => {
      const today = new Date().toDateString(), yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const last = p.streak?.lastDate;
      const days = last === today ? (p.streak?.days || 0) : last === yesterday.toDateString() ? (p.streak?.days || 0) + 1 : 1;
      return { ...p, streak: { days, lastDate: today } };
    });
  }
  function startMode(mode, ids = selectedId ? [selectedId] : activeSets[0] ? [activeSets[0].id] : []) {
    if (mode === 'Progress') { navigate('Progress'); return; }
    let cards = sets.filter(s => ids.includes(s.id) && !s.archived).flatMap(s => s.cards.map(c => ({ ...c, setId: s.id, setTitle: s.title, subject: s.subject })));
    if (!cards.length) { notify('Add cards before starting a study session.'); return; }
    if (mode === 'Learn' || mode === 'Challenge') { const fresh = cards.filter(due); cards = fresh.length ? fresh : cards; }
    if (mode === 'Match') cards = cards.slice(0, 8);
    cards = shuffle(cards);
    setStudy({ mode, setIds: ids, deck: cards, index: 0, score: 0, answered: false, correctIds: [], sessionStarted: Date.now(), quizCount: Math.min(Math.max(1, Number(quizCount) || 10), cards.length), matchTerms: shuffle(cards.slice(0, 8)), matchDefs: shuffle(cards.slice(0, 8)), matchFound: [] });
    setAnswer(''); setFeedback(''); setChoice(''); setFlipped(false); setMatched([]); setMatchSelection(null); setScreen('study'); setNotice('');
  }
  function record(isCorrect) {
    if (!current || study.answered) return;
    markProgress(current, isCorrect);
    setStudy(s => ({ ...s, answered: true, score: s.score + (isCorrect ? 1 : 0), correctIds: isCorrect ? [...s.correctIds, current.id] : s.correctIds }));
    setFeedback(isCorrect ? 'Correct. Nice work.' : 'Not quite. Take a moment to review the answer.');
  }
  function finishSession() {
    const session = { id: uid(), mode: study.mode, setIds: study.setIds, total: study.deck.length, correct: study.score, completedAt: new Date().toISOString(), durationSeconds: Math.round((Date.now() - study.sessionStarted) / 1000) };
    setData(p => ({ ...p, sessions: [session, ...(p.sessions || [])].slice(0, 500) }));
    setScreen('home'); setStudy(null); setNav('Progress'); notify('Session complete: ' + study.score + ' correct out of ' + study.deck.length + '.');
  }
  function next() {
    if (study.index + 1 >= study.deck.length) { finishSession(); return; }
    setStudy(s => ({ ...s, index: s.index + 1, answered: false }));
    setAnswer(''); setFeedback(''); setChoice(''); setFlipped(false);
  }
  function checkTyped(e) { e?.preventDefault(); if (!current) return; const a = norm(answer), expected = norm(current.definition); let ok = a === expected; if (!ok && data.settings.spellingTolerance !== 'strict' && a.length > 3 && expected.length > 3) { const aa = new Set(a.split(' ')), ee = new Set(expected.split(' ')); let overlap = 0; aa.forEach(w => { if (ee.has(w)) overlap++; }); ok = overlap / Math.max(ee.size, 1) >= (data.settings.spellingTolerance === 'lenient' ? 0.65 : 0.85); } record(ok); }
  function parseImport(text) {
    const lines = text.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
    return lines.map(line => {
      let term = '', definition = '';
      if (line.includes('\t')) [term, definition] = line.split('\t', 2);
      else if (line.includes('::')) [term, definition] = line.split('::', 2);
      else if (line.includes(' = ')) [term, definition] = line.split(' = ', 2);
      else { const m = line.match(/^(.+?)\s*[-–—]\s+(.+)$/); if (m) [, term, definition] = m; }
      return { term: (term || '').trim(), definition: (definition || '').trim() };
    }).filter(x => x.term && x.definition);
  }
  function prepareImport() {
    const target = sets.find(s => s.id === importSetId); if (!target) return;
    const parsed = parseImport(importText);
    if (!parsed.length) { notify('No cards were recognized. Use one term and definition per line, separated by a tab, ::, or =.'); return; }
    const existing = target.cards;
    setCandidates(parsed.map((item, i) => {
      const sameTerm = existing.find(c => norm(c.term) === norm(item.term));
      if (!sameTerm) return { ...item, key: uid() + i, status: 'New', action: 'add' };
      if (norm(sameTerm.definition) === norm(item.definition)) return { ...item, key: uid() + i, status: 'Duplicate', action: 'skip', existingId: sameTerm.id };
      return { ...item, key: uid() + i, status: 'Definition Changed', action: 'skip', existingId: sameTerm.id };
    }));
    setImportFilter('All'); setModal('review-import');
  }
  function setCandidateAction(key, action) { setCandidates(p => p.map(c => c.key === key ? { ...c, action } : c)); }
  function applyImport() {
    const target = sets.find(s => s.id === importSetId); if (!target) return;
    const actions = candidates.filter(c => c.action !== 'skip');
    const replacements = actions.filter(c => c.action === 'replace');
    const additions = actions.filter(c => c.action === 'add' || c.action === 'both');
    patchSet(target.id, s => {
      let nextCards = s.cards.map(old => {
        const replacement = replacements.find(c => c.existingId === old.id);
        return replacement ? { ...old, term: replacement.term, definition: replacement.definition } : old;
      });
      additions.forEach(c => nextCards.push(card(c.term, c.definition)));
      return { ...s, cards: nextCards };
    });
    setModal(''); setImportText(''); setCandidates([]); setSelectedId(target.id);
    notify('Import complete: ' + additions.length + ' added, ' + replacements.length + ' updated. Skipped cards were left unchanged.');
  }
  function openImport(id = selectedId) { if (!id) { notify('Open a set first, then import cards.'); return; } setImportSetId(id); setImportText(''); setCandidates([]); setModal('import'); }
  function exportSet(s) { downloadText(s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.txt', s.cards.map(c => c.term + '\t' + c.definition).join('\n')); notify('Set exported as tab-separated text.'); }
  function exportBackup() { downloadText('study-space-backup-' + new Date().toISOString().slice(0,10) + '.json', JSON.stringify(data, null, 2), 'application/json'); notify('Backup downloaded. Keep it somewhere safe.'); }
  function importBackup(e) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { try { const parsed = JSON.parse(String(reader.result)); if (!Array.isArray(parsed.sets)) throw new Error('Invalid'); if (window.confirm('Replace all current study data with this backup? Export your current data first if needed.')) { setData({ ...initialData(), ...parsed }); setSelectedId(null); notify('Backup restored.'); } } catch { notify('That file does not look like a valid Study Space backup.'); } e.target.value = ''; };
    reader.readAsText(file);
  }
  function bulkApply() {
    if (!selectedSet) return;
    const rows = parseImport(bulkText);
    if (!rows.length) { notify('No valid rows found. Use term, tab, definition.'); return; }
    const known = new Set(selectedSet.cards.map(c => norm(c.term)));
    const fresh = rows.filter(c => !known.has(norm(c.term)));
    if (!fresh.length) { notify('All pasted terms already exist in this set. Use Import to review duplicates.'); return; }
    patchSet(selectedSet.id, s => ({ ...s, cards: [...s.cards, ...fresh.map(c => card(c.term, c.definition))] }));
    setBulkText(''); setModal(''); notify(fresh.length + ' cards added. ' + (rows.length - fresh.length) + ' duplicate term(s) skipped.');
  }
  function copySet(id) {
    const original = sets.find(s => s.id === id); if (!original) return;
    const copy = { ...original, id: uid(), title: original.title + ' (copy)', createdAt: new Date().toISOString(), cards: original.cards.map(c => ({ ...c, id: uid(), progress: freshProgress(), tags: [...(c.tags || [])] })) };
    setData(p => ({ ...p, sets: [copy, ...p.sets] })); setSelectedId(copy.id); notify('A copy was created with fresh study progress.');
  }

  if (screen === 'study' && study && current) {
    const isTyped = ['Write', 'Learn', 'Challenge', 'Word Builder'].includes(study.mode);
    const isQuiz = study.mode === 'Quiz';
    const options = shuffle([current.definition, ...shuffle(allCards.filter(c => c.id !== current.id).map(c => c.definition)).slice(0, 3)]);
    return <div className="study-screen">
      <header className="study-top"><button className="icon-button" onClick={() => { if (window.confirm('Leave this session? Your answered cards are saved, but this session will not be recorded as complete.')) setScreen('home'); }} aria-label="Back"><ArrowLeft size={19}/></button><div className="study-breadcrumb"><span>{current.subject || 'Your library'}</span><span> / </span><strong>{study.mode}</strong></div><button className="icon-button" onClick={() => { if (window.confirm('End this session?')) finishSession(); }} aria-label="End session"><X size={19}/></button></header>
      <main className="study-main">
        <div className="study-kicker"><span className="live-dot"/>{study.mode.toUpperCase()} SESSION · {study.index + 1} OF {deck.length}</div>
        <h1>{study.mode === 'Quiz' ? 'Quick knowledge check' : study.mode === 'Learn' ? 'Make it stick.' : study.mode === 'Write' ? 'Recall it yourself.' : study.mode === 'Word Builder' ? 'Break down the word.' : study.mode === 'Challenge' ? 'One question at a time.' : 'Take it one card at a time.'}</h1>
        <p className="study-subtitle">{sessionTitle} <span>·</span> Understanding comes before speed.</p>
        {study.mode === 'Flashcards' ? <button className={'flashcard ' + (flipped ? 'is-flipped' : '')} onClick={() => setFlipped(v => !v)}><span className="card-topline"><span>{current.type || 'Term'}</span><span>{flipped ? 'DEFINITION' : 'TERM'}</span></span><span className="card-content">{flipped ? current.definition : current.term}</span>{flipped && current.parts && <span className="card-hint">{current.parts}</span>}<span className="card-hint">Tap to {flipped ? 'see term' : 'reveal answer'}</span></button>
        : study.mode === 'Match' ? <section className="quiz-card"><span className="eyebrow">MATCH THE PAIRS</span><h2>Choose a term, then its meaning.</h2><div className="match-grid">{study.matchTerms.map(c => <button key={c.id} disabled={matched.includes(c.id)} className={'answer-option match-option ' + (matchSelection === c.id ? 'chosen' : '') + (matched.includes(c.id) ? ' matched' : '')} onClick={() => { if (matchSelection === c.id) { setMatchSelection(null); return; } if (!matchSelection) { setMatchSelection(c.id); return; } const first = study.matchTerms.find(x => x.id === matchSelection); if (first?.id === c.id) setMatchSelection(null); else { setMatchSelection(null); setFeedback('Now choose a definition below.'); } }}>{c.term}</button>)}</div><div className="match-grid">{study.matchDefs.map(c => <button key={c.id + '-d'} disabled={matched.includes(c.id)} className={'answer-option match-option ' + (matched.includes(c.id) ? 'matched' : '')} onClick={() => { if (!matchSelection) { setFeedback('Choose a term first.'); return; } if (matchSelection === c.id) { setMatched(p => [...p, c.id]); markProgress(c, true); setStudy(s => ({ ...s, score: s.score + 1 })); setMatchSelection(null); setFeedback('Pair matched!'); } else { setMatchSelection(null); setFeedback('Not that pair. Try again.'); markProgress(c, false); } }}>{c.definition}</button>)}</div>{matched.length === study.matchTerms.length && <button className="primary-button" onClick={finishSession}>Finish matching <Check size={16}/></button>}<p className="feedback">{feedback}</p></section>
        : study.mode === 'Quiz' && !study.answered ? <section className="quiz-card"><span className="eyebrow">QUESTION {study.index + 1}</span><h2>What does <em>{current.term}</em> mean?</h2><div className="answer-list">{options.map((opt,i)=><button key={opt + i} className={'answer-option ' + (choice === opt ? 'chosen' : '')} onClick={() => setChoice(opt)}><span className="answer-letter">{String.fromCharCode(65+i)}</span>{opt}</button>)}</div><button className="primary-button answer-submit" disabled={!choice} onClick={() => record(norm(choice) === norm(current.definition))}>Check answer <Check size={16}/></button>{feedback && <p className="feedback">{feedback}</p>}</section>
        : study.mode === 'Progress' ? <section className="quiz-card"><h2>Progress is saved as you study.</h2><p>Return to the Progress page to see your history.</p></section>
        : study.mode === 'Word Builder' ? <section className="quiz-card"><span className="eyebrow">WORD PARTS</span><h2>{current.term}</h2><p>{current.parts || 'No word-part breakdown added yet.'}</p><p className="answer-reveal">Meaning: {current.definition}</p><button className="primary-button" onClick={() => record(true)}>I reviewed this <Check size={16}/></button><button className="secondary-button" onClick={() => record(false)}>Needs more practice</button></section>
        : isTyped && !study.answered ? <section className="quiz-card"><span className="eyebrow">{study.mode === 'Challenge' ? 'CHALLENGE ROUND' : 'TYPE YOUR ANSWER'}</span><h2>{current.term}</h2>{current.hint && <p className="muted-text">Hint: {current.hint}</p>}<form onSubmit={checkTyped}><label className="field-label">Definition<input autoFocus value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Type what this means..." /></label><button className="primary-button answer-submit" type="submit" disabled={!answer.trim()}>Check answer <Check size={16}/></button></form></section>
        : study.mode !== 'Match' && <section className="quiz-card"><span className="eyebrow">REVEALED ANSWER</span><h2>{current.term}</h2><p className="answer-reveal">{current.definition}</p>{current.parts && <p>{current.parts}</p>}{feedback && <p className="feedback">{feedback}</p>}{!study.answered && <div className="answer-list"><button className="answer-option" onClick={() => record(true)}><CheckCircle2 size={16}/> I knew this</button><button className="answer-option" onClick={() => record(false)}><RotateCcw size={16}/> I need to review it</button></div>}</section>}
        {study.mode !== 'Match' && <div className="study-controls"><button className="secondary-button" onClick={() => { setStudy(s => ({ ...s, index: Math.max(0, s.index - 1), answered: false })); setAnswer(''); setFeedback(''); setChoice(''); setFlipped(false); }} disabled={study.index === 0}><ArrowLeft size={16}/> Previous</button><div className="study-counter">{study.score} correct</div>{study.mode === 'Flashcards' ? (study.answered ? <button className="primary-button" onClick={next}>{study.index + 1 === deck.length ? 'Finish session' : 'Next card'} <ArrowRight size={16}/></button> : flipped ? <><button className="secondary-button" onClick={() => record(false)}>Need review</button><button className="primary-button" onClick={() => record(true)}>I knew it <Check size={16}/></button></> : <button className="primary-button" onClick={() => setFlipped(true)}>Reveal answer <ArrowRight size={16}/></button>) : study.answered ? <button className="primary-button" onClick={next}>{study.index + 1 === deck.length ? 'Finish session' : 'Next question'} <ArrowRight size={16}/></button> : <button className="secondary-button" onClick={() => { setFeedback('Answer: ' + current.definition); setStudy(s => ({ ...s, answered: true })); markProgress(current, false); }}>Show answer</button>}</div>}
        <div className="study-footnote"><Sparkles size={15}/> Small sessions add up. Progress is saved on this device.</div>
      </main>
    </div>;
  }

  return <div className="app-shell">
    <aside className={'sidebar ' + (mobileMenu ? 'sidebar-open' : '')}>
      <div className="brand"><div className="brand-mark"><Leaf size={19}/></div><div className="brand-copy"><strong>Study Space</strong><span>YOUR QUIET CORNER</span></div><button className="close-mobile icon-button" onClick={() => setMobileMenu(false)} aria-label="Close menu"><X size={18}/></button></div>
      <div className="profile-switch"><div className="avatar">Z</div><span><strong>Zero's learning</strong><small>Private local library</small></span><ChevronDown size={15}/></div>
      <div className="nav-label">WORKSPACE</div>
      <nav className="main-nav">{[['Overview',Activity],['Library',Library],['Review',Target],['Progress',BarChart3]].map(([label,Icon])=><button key={label} className={'nav-item '+(nav===label?'active':'')} onClick={() => navigate(label)}><Icon size={18}/><span>{label}</span>{label==='Review' && <span className="nav-count">{dueCards.length}</span>}</button>)}</nav>
      <div className="nav-label subject-label">YOUR SUBJECTS <button className="tiny-plus" onClick={() => openSetEditor()} aria-label="Add subject or set"><Plus size={14}/></button></div>
      <div className="subject-list">{subjects.map((s,i)=><button key={s} className="subject-item" onClick={() => { setSubjectFilter(s); setNav('Library'); }}><span className={'subject-dot '+(['green-dot','gold-dot','blue-dot'][i%3])}/><span>{s}</span><span className="subject-count">{activeSets.filter(x => x.subject === s).length}</span></button>)}<button className="subject-item muted-subject" onClick={() => openSetEditor()}><Plus size={14}/><span>Add a subject</span></button></div>
      <div className="sidebar-bottom"><div className="streak-card"><div className="streak-icon"><Flame size={18}/></div><div><strong>{data.streak?.days || 0} day streak</strong><p>Little and often works.</p></div></div><button className="nav-item settings-item" onClick={() => { setSettingsDraft(data.settings); setModal('settings'); }}><Settings2 size={18}/><span>Settings & backup</span></button><div className="sidebar-user"><div className="avatar avatar-small">Z</div><div><strong>Zero</strong><small>Private · this device</small></div><span className="online-dot"/></div></div>
    </aside>
    {mobileMenu && <button className="scrim" onClick={() => setMobileMenu(false)} aria-label="Close navigation"/>}
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="menu-button icon-button" onClick={() => setMobileMenu(true)} aria-label="Open menu"><Menu size={20}/></button><div className="breadcrumbs"><span>Workspace</span><span>/</span><strong>{nav}</strong></div></div><div className="topbar-actions"><label className="searchbox"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search your library..."/><kbd>⌘ K</kbd></label><button className="icon-button top-action" aria-label="Export backup" onClick={exportBackup}><Download size={18}/></button><div className="top-avatar">Z</div></div></header>
      <div className="page-content">
        {notice && <div className="notice"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss"><X size={15}/></button></div>}
        {nav === 'Overview' && <><section className="welcome-row"><div><div className="date-label"><span className="live-dot"/> YOUR LEARNING SPACE</div><h1>A quieter way to learn.</h1><p className="welcome-subtitle">Pick up where you left off, or start with something small.</p></div><button className="primary-button new-set-button" onClick={() => openSetEditor()}><Plus size={17}/> New study set</button></section>
          <section className="hero-card"><div className="hero-text"><div className="hero-eyebrow"><span className="hero-spark"><Sparkles size={14}/></span> YOUR NEXT SMALL WIN</div><h2>Progress happens<br/><em>one card at a time.</em></h2><p>Return to a set and build on what you already know.</p><button className="hero-button" onClick={() => { const first = activeSets.find(s => s.cards.length); if (first) { setSelectedId(first.id); startMode('Flashcards',[first.id]); } else openSetEditor(); }}>Continue learning <ArrowRight size={16}/></button><div className="hero-meta"><span><Layers3 size={14}/> {activeSets[0]?.title || 'Your library'}</span><span>·</span><span>{totalSafe(activeSets)} cards</span></div></div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="art-leaf leaf-one"><Leaf size={65}/></div><div className="art-leaf leaf-two"><Leaf size={44}/></div><div className="art-book"><BookOpen size={42}/></div><div className="art-star star-one">✳</div><div className="art-star star-two">✦</div><div className="art-dot dot-one"/><div className="art-dot dot-two"/></div><div className="hero-bottom-line"/></section>
          <section className="stats-grid"><div className="stat-card"><div className="stat-icon stat-green"><BookOpen size={17}/></div><div className="stat-label">STUDY SETS</div><div className="stat-value">{activeSets.length.toString().padStart(2,'0')}<span> in your library</span></div><div className="stat-foot"><span>Build at your pace</span></div></div><div className="stat-card"><div className="stat-icon stat-purple"><Target size={17}/></div><div className="stat-label">CARDS TO REVIEW</div><div className="stat-value">{dueCards.length}<span> due now</span></div><div className="stat-foot"><span>Spaced review queue</span></div></div><div className="stat-card"><div className="stat-icon stat-amber"><Flame size={17}/></div><div className="stat-label">STUDY STREAK</div><div className="stat-value">{data.streak?.days || 0}<span> days</span></div><div className="stat-foot"><span>Every session counts</span></div></div></section>
          <section className="section-block"><div className="section-heading"><div><div className="section-kicker">CHOOSE YOUR APPROACH</div><h2>Study your way</h2></div><button className="text-link" onClick={() => setNotice('Choose a set below, then start any study mode.')}>All modes <ArrowRight size={15}/></button></div><div className="mode-grid">{modes.map(({name,detail,Icon,tint})=><button className="mode-card" key={name} onClick={() => startMode(name)}><div className={'mode-icon '+tint}><Icon size={20}/></div><div className="mode-title">{name}</div><div className="mode-detail">{detail}</div><ArrowRight className="mode-arrow" size={16}/></button>)}</div></section></>}
        {nav === 'Library' && <section className="section-block library-section"><div className="section-heading"><div><div className="section-kicker">YOUR COLLECTION</div><h2>Study library</h2><p className="welcome-subtitle">Create, edit, combine, import, and organize your cards.</p></div><button className="primary-button" onClick={() => openSetEditor()}><Plus size={16}/> New set</button></div><div className="library-toolbar"><select value={subjectFilter} onChange={e=>setSubjectFilter(e.target.value)}><option>All subjects</option>{subjects.map(s=><option key={s}>{s}</option>)}</select><button className="secondary-button" onClick={() => { if (!selectedId) notify('Open a set first to import cards.'); else openImport(selectedId); }}><Upload size={15}/> Import cards</button><button className="secondary-button" onClick={() => { if (!selectedSet) notify('Select a set first to bulk edit.'); else setModal('bulk'); }}><Layers3 size={15}/> Bulk add</button></div><div className="set-list">{filteredSets.map(s=><article className="set-row" key={s.id}><button className={'set-cover '+s.color} onClick={() => { setSelectedId(s.id); setNav('Set'); }}><Folder size={22}/><span className="cover-lines"><i/><i/><i/></span></button><button className="set-details" onClick={() => { setSelectedId(s.id); setNav('Set'); }}><span className="set-subject">{s.subject}</span><strong>{s.title}</strong><span className="set-description">{s.description}</span></button><div className="set-card-count"><strong>{s.cards.length}</strong><span>cards</span></div><div className="set-progress"><div className="progress-label"><span>Familiarity</span><strong>{s.cards.length ? Math.round(s.cards.reduce((n,c)=>n+(c.progress?.mastery||0),0)/s.cards.length) : 0}%</strong></div><div className="progress-track"><i style={{width:(s.cards.length ? Math.round(s.cards.reduce((n,c)=>n+(c.progress?.mastery||0),0)/s.cards.length) : 0)+'%'}}/></div><span className="last-studied">{dateLabel(s.cards.map(c=>c.progress?.lastStudied).filter(Boolean).sort().at(-1))}</span></div><button className="row-more icon-button" onClick={() => { setSelectedId(s.id); setNav('Set'); }} aria-label={'Open '+s.title}><MoreHorizontal size={19}/></button></article>)}{filteredSets.length===0 && <div className="empty-state"><Search size={22}/><strong>No sets found</strong><span>Try another search or create a set.</span></div>}</div></section>}
        {nav === 'Set' && selectedSet && <section className="section-block"><div className="section-heading"><div><button className="text-link" onClick={() => setNav('Library')}><ArrowLeft size={15}/> Back to library</button><div className="section-kicker">{selectedSet.subject}</div><h2>{selectedSet.title}</h2><p className="welcome-subtitle">{selectedSet.description}</p></div><button className="primary-button" onClick={() => openCardEditor()}><Plus size={16}/> Add card</button></div><div className="set-action-bar"><button className="secondary-button" onClick={() => startMode('Flashcards',[selectedSet.id])}><Layers3 size={15}/> Study set</button><button className="secondary-button" onClick={() => openImport(selectedSet.id)}><Upload size={15}/> Import</button><button className="secondary-button" onClick={() => { setBulkText(''); setModal('bulk'); }}><Layers3 size={15}/> Bulk add</button><button className="secondary-button" onClick={() => openSetEditor(selectedSet)}><Pencil size={15}/> Edit set</button><button className="secondary-button" onClick={() => copySet(selectedSet.id)}><Copy size={15}/> Duplicate</button><button className="secondary-button" onClick={() => exportSet(selectedSet)}><Download size={15}/> Export</button><button className="secondary-button" onClick={() => archiveSet(selectedSet.id)}><Archive size={15}/> Archive</button><button className="secondary-button danger-button" onClick={() => removeSet(selectedSet.id)}><Trash2 size={15}/> Delete</button></div><div className="card-list-heading"><span>{selectedSet.cards.length} cards</span><div><button className="text-link" onClick={() => setSelectedCards(selectedCards.length===selectedSet.cards.length?[]:selectedSet.cards.map(c=>c.id))}>{selectedCards.length===selectedSet.cards.length?'Deselect all':'Select all'}</button><button className="text-link" onClick={() => { setBulkText(''); setModal('bulk'); }}>Bulk add</button></div></div>{selectedCards.length>0 && <div className="bulk-toolbar"><span>{selectedCards.length} selected</span><button className="secondary-button" onClick={() => { if (window.confirm('Delete '+selectedCards.length+' selected cards?')) { patchSet(selectedSet.id,s=>({...s,cards:s.cards.filter(c=>!selectedCards.includes(c.id))})); setSelectedCards([]); } }}><Trash2 size={15}/> Delete selected</button></div>}<div className="editable-card-list">{selectedSet.cards.map((c,i)=><article className="editable-card" key={c.id}><input type="checkbox" aria-label={'Select '+c.term} checked={selectedCards.includes(c.id)} onChange={e=>setSelectedCards(p=>e.target.checked?[...p,c.id]:p.filter(id=>id!==c.id))}/><span className="card-index">{String(i+1).padStart(2,'0')}</span><div className="editable-card-copy"><strong>{c.term}</strong><p>{c.definition}</p>{c.parts && <small>{c.parts}</small>}{c.tags?.length>0 && <div className="tag-row">{c.tags.map(t=><span key={t}><Tag size={11}/>{t}</span>)}</div>}</div><div className="editable-card-progress">{c.progress?.mastery || 0}%<small>mastery</small></div><button className="icon-button" onClick={() => openCardEditor(c)} aria-label="Edit card"><Pencil size={16}/></button><button className="icon-button" onClick={() => removeCard(selectedSet.id,c.id)} aria-label="Delete card"><Trash2 size={16}/></button></article>)}{!selectedSet.cards.length && <div className="empty-state"><BookOpen size={24}/><strong>This set is ready for its first card</strong><span>Add one card or paste a whole list to get started.</span><button className="primary-button" onClick={() => openCardEditor()}><Plus size={15}/> Add card</button></div>}</div></section>}
        {nav === 'Review' && <section className="section-block"><div className="section-heading"><div><div className="section-kicker">SPACED REVIEW</div><h2>Cards ready to revisit</h2><p className="welcome-subtitle">Cards are scheduled from your answers. New cards are due until you practice them.</p></div><button className="primary-button" disabled={!dueCards.length} onClick={() => startMode('Learn', [...new Set(dueCards.map(c=>c.setId))])}><Brain size={16}/> Start review</button></div><div className="editable-card-list">{dueCards.map(c=><article className="editable-card" key={c.id}><span className="card-index"><Clock3 size={15}/></span><div className="editable-card-copy"><strong>{c.term}</strong><p>{c.definition}</p><small>{c.setTitle} · {c.progress?.incorrect || 0} missed</small></div><span className="review-due">Due now</span><button className="secondary-button" onClick={() => { setSelectedId(c.setId); startMode('Flashcards',[c.setId]); }}>Study</button></article>)}{!dueCards.length && <div className="empty-state"><CheckCircle2 size={25}/><strong>You're all caught up</strong><span>There are no cards due right now. Keep going when you're ready.</span></div>}</div></section>}
        {nav === 'Progress' && <section className="section-block"><div className="section-heading"><div><div className="section-kicker">YOUR LEARNING HISTORY</div><h2>Progress, at your pace.</h2><p className="welcome-subtitle">Everything is stored locally in this browser.</p></div><button className="secondary-button" onClick={exportBackup}><Download size={15}/> Export backup</button></div><section className="stats-grid"><div className="stat-card"><div className="stat-label">TOTAL CARDS</div><div className="stat-value">{allCards.length}</div></div><div className="stat-card"><div className="stat-label">CARDS STUDIED</div><div className="stat-value">{studiedCards.length}</div></div><div className="stat-card"><div className="stat-label">AVERAGE MASTERY</div><div className="stat-value">{averageMastery}%</div></div></section><h3 className="subsection-title">Recent sessions</h3><div className="session-history">{(data.sessions || []).slice(0,20).map(s=><article className="session-row" key={s.id}><div className="mode-icon green"><Activity size={17}/></div><div><strong>{s.mode}</strong><small>{s.setIds.map(id=>sets.find(x=>x.id===id)?.title).filter(Boolean).join(', ') || 'Study session'} · {dateLabel(s.completedAt)}</small></div><span>{s.correct}/{s.total} correct</span><small>{Math.max(1,Math.round((s.durationSeconds||0)/60))} min</small></article>)}{!(data.sessions || []).length && <div className="empty-state"><BarChart3 size={23}/><strong>Your history starts with your first completed session</strong><span>Practice a few cards and your results will appear here.</span></div>}</div><h3 className="subsection-title">Archived sets</h3>{sets.filter(s=>s.archived).map(s=><article className="session-row" key={s.id}><div><strong>{s.title}</strong><small>{s.subject} · {s.cards.length} cards</small></div><button className="secondary-button" onClick={() => restoreSet(s.id)}>Restore</button></article>)}</section>}
        {nav !== 'Overview' && nav !== 'Library' && nav !== 'Set' && nav !== 'Review' && nav !== 'Progress' && <section className="section-block"><h2>{nav}</h2><p>Choose a section from the sidebar.</p></section>}
        {nav === 'Overview' && <section className="section-block library-section"><div className="section-heading"><div><div className="section-kicker">PICK UP WHERE YOU LEFT OFF</div><h2>Recently added sets</h2></div><button className="text-link" onClick={() => navigate('Library')}>View library <ArrowRight size={15}/></button></div><div className="set-list">{filteredSets.slice(0,5).map(s=><article className="set-row" key={s.id}><button className={'set-cover '+s.color} onClick={() => { setSelectedId(s.id); setNav('Set'); }}><Folder size={22}/><span className="cover-lines"><i/><i/><i/></span></button><button className="set-details" onClick={() => { setSelectedId(s.id); setNav('Set'); }}><span className="set-subject">{s.subject}</span><strong>{s.title}</strong><span className="set-description">{s.description}</span></button><div className="set-card-count"><strong>{s.cards.length}</strong><span>cards</span></div><button className="secondary-button" onClick={() => { setSelectedId(s.id); startMode('Flashcards',[s.id]); }}>Study</button></article>)}</div></section>}
        <footer className="page-footer"><span><Leaf size={14}/> A little progress is still progress.</span><span>PRIVATE BY DESIGN · NO ADS, EVER</span></footer>
      </div>
    </main>
    {modal && <div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setModal('');}}><div className="modal modal-wide" role="dialog" aria-modal="true">
      <div className="modal-heading"><div><div className="section-kicker">{modal==='set'?'BUILD YOUR LIBRARY':modal==='card'?'CARD EDITOR':modal==='import'?'IMPORT CARDS':modal==='review-import'?'REVIEW BEFORE IMPORT':modal==='bulk'?'BULK CARD EDITOR':'LOCAL SETTINGS'}</div><h2>{modal==='set'?(setDraft.id?'Edit study set':'Create a study set'):modal==='card'?(cardDraft.id?'Edit card':'Add a card'):modal==='import'?'Import a card list':modal==='review-import'?'Review imported cards':modal==='bulk'?'Add many cards':'Settings & backup'}</h2></div><button type="button" className="icon-button" onClick={()=>setModal('')} aria-label="Close"><X size={18}/></button></div>
      {modal==='set' && <form onSubmit={saveSet}><label className="field-label">Set name<input autoFocus value={setDraft.title} onChange={e=>setSetDraft(p=>({...p,title:e.target.value}))} placeholder="e.g. Chapter 04 · The nervous system" required/></label><label className="field-label">Subject<input value={setDraft.subject} onChange={e=>setSetDraft(p=>({...p,subject:e.target.value}))} placeholder="Medical Terminology" required list="subject-options"/><datalist id="subject-options">{subjects.map(s=><option key={s} value={s}/>)}</datalist></label><label className="field-label">Description<input value={setDraft.description} onChange={e=>setSetDraft(p=>({...p,description:e.target.value}))} placeholder="What is this set about?"/></label><label className="field-label">Tags, separated by commas<input value={setDraft.tags} onChange={e=>setSetDraft(p=>({...p,tags:e.target.value}))} placeholder="exam 1, anatomy, review"/></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={()=>setModal('')}>Cancel</button><button type="submit" className="primary-button"><Save size={15}/> Save set</button></div></form>}
      {modal==='card' && <form onSubmit={saveCard}><label className="field-label">Term / question<input autoFocus value={cardDraft.term} onChange={e=>setCardDraft(p=>({...p,term:e.target.value}))} required placeholder="Term, question, formula, or prompt"/></label><label className="field-label">Definition / answer<textarea value={cardDraft.definition} onChange={e=>setCardDraft(p=>({...p,definition:e.target.value}))} required rows={3} placeholder="Definition, solution, or full answer"/></label><label className="field-label">Card type<select value={cardDraft.type} onChange={e=>setCardDraft(p=>({...p,type:e.target.value}))}><option value="term">Term / definition</option><option value="question">Question / answer</option><option value="equation">Equation / solution</option><option value="fill">Fill in the blank</option><option value="word-part">Word part</option><option value="multi-step">Multi-step problem</option><option value="custom">Custom long answer</option></select></label><label className="field-label">Word parts / solution steps<textarea value={cardDraft.parts} onChange={e=>setCardDraft(p=>({...p,parts:e.target.value}))} rows={2} placeholder="Optional breakdown, steps, or pronunciation"/></label><label className="field-label">Hint<input value={cardDraft.hint} onChange={e=>setCardDraft(p=>({...p,hint:e.target.value}))} placeholder="Optional hint shown in typed modes"/></label><label className="field-label">Tags<input value={cardDraft.tags} onChange={e=>setCardDraft(p=>({...p,tags:e.target.value}))} placeholder="Comma-separated tags"/></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={()=>setModal('')}>Cancel</button><button type="submit" className="primary-button"><Save size={15}/> Save card</button></div></form>}
      {modal==='import' && <><p className="modal-copy">Paste a list you own. One card per line, with the term and definition separated by a tab, <code>::</code>, or <code> = </code>. Existing cards are checked before anything is changed.</p><label className="field-label">Destination set<select value={importSetId || ''} onChange={e=>setImportSetId(e.target.value)}>{sets.filter(s=>!s.archived).map(s=><option value={s.id} key={s.id}>{s.subject} · {s.title}</option>)}</select></label><label className="field-label">Paste cards<textarea rows={9} value={importText} onChange={e=>setImportText(e.target.value)} placeholder={'cardi/o\\tHeart\\n-itis\\tInflammation\\nWhat is a simile? :: A comparison using like or as'}/></label><div className="modal-actions"><button className="secondary-button" onClick={()=>setModal('')}>Cancel</button><button className="primary-button" onClick={prepareImport}><Search size={15}/> Review duplicates</button></div></>}
      {modal==='review-import' && <><p className="modal-copy">Nothing changes until you confirm below. Similar terms are flagged for your decision.</p><div className="import-summary"><span>{candidates.filter(c=>c.status==='New').length} new</span><span>{candidates.filter(c=>c.status==='Duplicate').length} duplicates</span><span>{candidates.filter(c=>c.status==='Definition Changed').length} changed definitions</span></div><div className="import-filters">{['All','New','Duplicate','Definition Changed'].map(f=><button key={f} className={importFilter===f?'filter-chip selected':'filter-chip'} onClick={()=>setImportFilter(f)}>{f}</button>)}</div><div className="import-review-list">{candidates.filter(c=>importFilter==='All'||c.status===importFilter).map(c=><div className="import-review-row" key={c.key}><div><span className={'status-pill '+(c.status==='New'?'status-new':c.status==='Duplicate'?'status-duplicate':'status-changed')}>{c.status}</span><strong>{c.term}</strong><p>{c.definition}</p>{c.existingId && <small>Existing: {sets.find(s=>s.id===importSetId)?.cards.find(x=>x.id===c.existingId)?.definition}</small>}</div><select value={c.action} onChange={e=>setCandidateAction(c.key,e.target.value)}><option value="add">Add as new</option><option value="skip">Skip</option>{c.existingId && <><option value="replace">Replace existing definition</option><option value="both">Keep both</option></>}</select></div>)}</div><div className="modal-actions"><button className="secondary-button" onClick={()=>setModal('import')}>Back</button><button className="primary-button" onClick={applyImport}><Check size={15}/> Apply selected changes</button></div></>}
      {modal==='bulk' && <><p className="modal-copy">Paste many cards at once. Format: term, tab, definition. Existing terms are skipped; use Import for a full duplicate review.</p><label className="field-label">Paste rows<textarea autoFocus rows={10} value={bulkText} onChange={e=>setBulkText(e.target.value)} placeholder={'cardi/o\\tHeart\\nhepat/o\\tLiver\\n-itis\\tInflammation'}/></label><div className="modal-actions"><button className="secondary-button" onClick={()=>setModal('')}>Cancel</button><button className="primary-button" onClick={bulkApply}><Plus size={15}/> Add new cards</button></div></>}
      {modal==='settings' && <><p className="modal-copy">This build stores data in this browser only. No account or cloud service is connected. Export backups regularly, especially before clearing browser data.</p><label className="field-label">Spelling tolerance<select value={settingsDraft.spellingTolerance} onChange={e=>setSettingsDraft(p=>({...p,spellingTolerance:e.target.value}))}><option value="strict">Strict</option><option value="balanced">Balanced</option><option value="lenient">Lenient</option></select></label><label className="field-label">Daily card goal<input type="number" min="1" max="500" value={settingsDraft.dailyGoal} onChange={e=>setSettingsDraft(p=>({...p,dailyGoal:Number(e.target.value)}))}/></label><div className="settings-actions"><button className="secondary-button" onClick={exportBackup}><Download size={15}/> Export full backup</button><label className="secondary-button file-button"><Upload size={15}/> Restore backup<input type="file" accept=".json,application/json" onChange={importBackup}/></label><button className="secondary-button" onClick={()=>downloadText('study-space-export.txt',activeSets.map(s=>'# '+s.subject+' / '+s.title+'\\n'+s.cards.map(c=>c.term+'\\t'+c.definition).join('\\n')).join('\\n\\n'))}><FileText size={15}/> Export all cards</button></div><h3 className="subsection-title">Archived sets</h3>{sets.filter(s=>s.archived).map(s=><div className="session-row" key={s.id}><div><strong>{s.title}</strong><small>{s.subject}</small></div><button className="secondary-button" onClick={()=>restoreSet(s.id)}>Restore</button></div>)}<div className="modal-actions"><button className="secondary-button danger-button" onClick={()=>{if(window.confirm('Delete all local study data? Export a backup first.')){const fresh=initialData();setData(fresh);setSelectedId(null);setNav('Overview');setModal('');notify('Local data reset to starter content.');}}}><Trash2 size={15}/> Reset all data</button><button className="primary-button" onClick={()=>{setData(p=>({...p,settings:settingsDraft}));setModal('');notify('Settings saved.');}}><Save size={15}/> Save settings</button></div></>}
    </div></div>}
  </div>;
}
function totalSafe(sets) { return sets.reduce((n,s)=>n+s.cards.length,0); }
