"use client";

import { useEffect, useMemo, useState } from "react";
import { CONFERENCE, SESSIONS, SPEAKERS, TIME_ZONE_ABBR, dayLabel, formatTime, formatTimeRange, initials, isSessionLiveAt, speakerById, type Session, type Speaker, type SubSession } from "./conference-data";

type DayFilter = "all" | Session["day"] | "saved";
const STORAGE_KEY = "ghc-2026-saved-sessions";
const typeClass = (type: string) => type.toLowerCase().replace(/\s+/g, "-");

const participantRoles = (session: Session) => {
  const moderators = new Set([session.moderatorId, ...(session.additionalModeratorIds || [])].filter(Boolean) as string[]);
  const subSessionSpeakers = new Set((session.subSessions || []).flatMap((subSession) => subSession.speakerIds || []));
  const hasPanelists = /panelists?/i.test(session.peopleLabel || "");
  const hasSeparateSpeakers = /panelists?\s+and\s+speakers?/i.test(session.peopleLabel || "");
  const panelists = new Set(hasPanelists
    ? session.speakerIds.filter((id) => !hasSeparateSpeakers || !subSessionSpeakers.has(id))
    : []);
  const speakers = new Set(hasPanelists
    ? [...subSessionSpeakers]
    : [...session.speakerIds, ...subSessionSpeakers]);
  return { speakers, panelists, moderators };
};

function SpeakerAvatar({ speaker, size = "small", onClick }: { speaker: Speaker; size?: "small" | "large"; onClick?: () => void }) {
  const portrait = speaker.photo ? <img src={speaker.photo} alt="" /> : <span>{initials(speaker.name)}</span>;
  return onClick
    ? <button className={`avatar avatar-${size}`} onClick={(event) => { event.stopPropagation(); onClick(); }} aria-label={`View ${speaker.name}'s biography`} title={speaker.name}>{portrait}</button>
    : <span className={`avatar avatar-${size}`} aria-hidden="true">{portrait}</span>;
}

export default function Home() {
  const [day, setDay] = useState<DayFilter>("all");
  const [query, setQuery] = useState("");
  const [speakerFilter, setSpeakerFilter] = useState("all");
  const [panelistFilter, setPanelistFilter] = useState("all");
  const [moderatorFilter, setModeratorFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [saved, setSaved] = useState<string[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedSubSession, setSelectedSubSession] = useState<{ session: Session; index: number } | null>(null);
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [speakerReturnHash, setSpeakerReturnHash] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const currentSessionIds = new Set(SESSIONS.map((session) => session.id));
      setSaved(Array.isArray(stored) ? stored.filter((id) => typeof id === "string" && currentSessionIds.has(id)) : []);
    } catch { setSaved([]); }
    setHydrated(true);
    const syncHash = () => {
      const parts = location.hash.slice(1).split("/");
      const session = SESSIONS.find((item) => item.id === parts[1]);
      setDirectoryOpen(parts[0] === "people");
      if (parts[0] === "session") { setSelectedSpeaker(null); setSelectedSubSession(null); setSelectedSession(session || null); }
      else if (parts[0] === "subsession" && session) {
        const index = Number(parts[2]);
        setSelectedSpeaker(null); setSelectedSession(null);
        setSelectedSubSession(Number.isInteger(index) && session.subSessions?.[index] ? { session, index } : null);
      }
      else if (parts[0] === "speaker") {
        const speakerId = parts[1] === "maria-della-raneses" ? "maria-della-c-raneses" : parts[1];
        setSelectedSession(null); setSelectedSubSession(null); setSelectedSpeaker(SPEAKERS.find((item) => item.id === speakerId) || null);
      }
      else { setSelectedSession(null); setSelectedSubSession(null); setSelectedSpeaker(null); }
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    setNowMs(Date.now());
    const liveClock = window.setInterval(() => setNowMs(Date.now()), 30000);
    return () => { window.removeEventListener("hashchange", syncHash); window.clearInterval(liveClock); };
  }, []);

  useEffect(() => { if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); }, [saved, hydrated]);
  const rooms = useMemo(() => [...new Set(SESSIONS.map((item) => item.room))].sort(), []);
  const types = useMemo(() => [...new Set(SESSIONS.map((item) => item.type))].sort(), []);
  const roleOptions = useMemo(() => {
    const speakerIds = new Set<string>();
    const panelistIds = new Set<string>();
    const moderatorIds = new Set<string>();
    SESSIONS.forEach((session) => {
      const roles = participantRoles(session);
      roles.speakers.forEach((id) => speakerIds.add(id));
      roles.panelists.forEach((id) => panelistIds.add(id));
      roles.moderators.forEach((id) => moderatorIds.add(id));
    });
    const matching = (ids: Set<string>) => SPEAKERS.filter((person) => ids.has(person.id));
    return { speakers: matching(speakerIds), panelists: matching(panelistIds), moderators: matching(moderatorIds) };
  }, []);

  const results = useMemo(() => {
    const search = query.trim().toLowerCase();
    return SESSIONS.filter((session) => {
      const people = [session.moderatorId, ...(session.additionalModeratorIds || []), ...session.speakerIds].map(speakerById).filter(Boolean) as Speaker[];
      const roles = participantRoles(session);
      const haystack = [session.title, session.summary, session.room, session.type, ...session.topics, ...people.map((person) => person.name), ...(session.subSessions?.map((sub) => sub.title) || [])].join(" ").toLowerCase();
      return (day === "all" || (day === "saved" ? saved.includes(session.id) : session.day === day))
        && (!search || haystack.includes(search))
        && (speakerFilter === "all" || roles.speakers.has(speakerFilter))
        && (panelistFilter === "all" || roles.panelists.has(panelistFilter))
        && (moderatorFilter === "all" || roles.moderators.has(moderatorFilter))
        && (roomFilter === "all" || session.room === roomFilter)
        && (typeFilter === "all" || session.type === typeFilter);
    }).sort((a, b) => `${a.day}${a.start}`.localeCompare(`${b.day}${b.start}`));
  }, [day, query, speakerFilter, panelistFilter, moderatorFilter, roomFilter, typeFilter, saved]);

  const grouped = results.reduce<Record<string, Session[]>>((acc, session) => { (acc[session.day] ||= []).push(session); return acc; }, {});
  const liveSessionIds = useMemo(() => new Set(nowMs === null ? [] : SESSIONS.filter((session) => isSessionLiveAt(session, nowMs)).map((session) => session.id)), [nowMs]);
  const activeFilterLabels = [
    day === "saved" ? "My Schedule" : day === "all" ? "" : `Day ${(["2026-09-28", "2026-09-29", "2026-09-30"] as string[]).indexOf(day) + 1}`,
    query.trim() ? `Search: ${query.trim()}` : "",
    speakerFilter === "all" ? "" : `Speaker: ${SPEAKERS.find((speaker) => speaker.id === speakerFilter)?.name || speakerFilter}`,
    panelistFilter === "all" ? "" : `Panelist: ${SPEAKERS.find((speaker) => speaker.id === panelistFilter)?.name || panelistFilter}`,
    moderatorFilter === "all" ? "" : `Moderator: ${SPEAKERS.find((speaker) => speaker.id === moderatorFilter)?.name || moderatorFilter}`,
    roomFilter === "all" ? "" : `Room: ${roomFilter}`,
    typeFilter === "all" ? "" : `Type: ${typeFilter}`,
  ].filter(Boolean);
  const activeFilterCount = activeFilterLabels.length;
  const openSession = (session: Session) => { location.hash = `session/${session.id}`; window.scrollTo({ top: 0, behavior: "smooth" }); };
  const openSubSession = (session: Session, index: number) => { location.hash = `subsession/${session.id}/${index}`; window.scrollTo({ top: 0, behavior: "smooth" }); };
  const openSpeaker = (speaker: Speaker) => { setSpeakerReturnHash(location.hash); location.hash = `speaker/${speaker.id}`; window.scrollTo({ top: 0, behavior: "smooth" }); };
  const openDirectory = () => { location.hash = "people"; window.scrollTo({ top: 0, behavior: "smooth" }); };
  const goHome = () => { history.pushState(null, "", location.pathname + location.search); setSelectedSession(null); setSelectedSubSession(null); setSelectedSpeaker(null); setDirectoryOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const returnFromSpeaker = () => { if (speakerReturnHash) location.hash = speakerReturnHash.slice(1); else goHome(); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const toggleSaved = (id: string) => setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const showSaved = () => {
    setDay("saved");
    if (window.matchMedia("(max-width: 760px)").matches) window.setTimeout(() => document.getElementById("program-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };
  const clearFilters = () => { setQuery(""); setSpeakerFilter("all"); setPanelistFilter("all"); setModeratorFilter("all"); setRoomFilter("all"); setTypeFilter("all"); setDay("all"); };
  const resetSaved = () => { if (saved.length && window.confirm("Remove all sessions from My Schedule?")) { setSaved([]); if (day === "saved") setDay("all"); } };

  if (selectedSession) return <SessionDetail session={selectedSession} saved={saved.includes(selectedSession.id)} isLive={liveSessionIds.has(selectedSession.id)} onBack={goHome} onPrevious={() => history.back()} onSave={() => toggleSaved(selectedSession.id)} onSpeaker={openSpeaker} onSubSession={(index) => openSubSession(selectedSession, index)} />;
  if (selectedSubSession) return <SubSessionDetail parent={selectedSubSession.session} subSession={selectedSubSession.session.subSessions![selectedSubSession.index]} index={selectedSubSession.index} onBack={goHome} onPrevious={() => history.back()} onParent={() => openSession(selectedSubSession.session)} onSpeaker={openSpeaker} />;
  if (selectedSpeaker) return <SpeakerDetail speaker={selectedSpeaker} onBack={returnFromSpeaker} onSchedule={goHome} onSession={openSession} />;
  if (directoryOpen) return <PeopleDirectory roleOptions={roleOptions} onBack={goHome} onSpeaker={openSpeaker} />;

  return <main>
    <header className="hero">
      <nav className="topbar" aria-label="Primary navigation">
        <button className="brand" onClick={goHome} aria-label="Conference program home"><img className="conference-logo" src={`${import.meta.env.BASE_URL}conference-logo.png`} alt="Global Health Conference, Majid Sadigh Global Health Academy" /></button>
        <div className="nav-actions">
          <a className="main-site-link" href={CONFERENCE.mainWebsiteUrl} target="_blank" rel="noopener noreferrer">Global Health Academy Website ↗</a>
          <button className="directory-link" onClick={openDirectory}>Speaker directory</button>
          <button className="saved-link" onClick={showSaved} aria-pressed={day === "saved"}>My Schedule <b>{saved.length}</b></button>
        </div>
      </nav>
      <div className="hero-content">
        <h1 className="conference-title">The Fifth Annual Global Health Conference <span>Program</span></h1>
        <p className="conference-theme"><small>CONFERENCE THEME</small><strong>From Partnership to Practice:<br />Global Collaborators Shaping the Future of Education in Global Health</strong></p>
        <div className="event-meta">
          <span><i>◷</i><b>September 28–30, 2026</b><small>All program times shown in {TIME_ZONE_ABBR}</small></span>
          <a href={CONFERENCE.venueUrl} target="_blank" rel="noopener noreferrer"><i>⌖</i><b>{CONFERENCE.venue} ↗</b><small>{CONFERENCE.location}</small></a>
        </div>
      </div>
    </header>

    <section className="schedule-shell">
      <div className="section-heading"><div><p className="eyebrow dark">PLAN YOUR CONFERENCE</p><h2>Explore sessions</h2></div><p>Browse every session or build a personal plan that stays saved on this device.</p></div>
      <div className="day-tabs" role="tablist" aria-label="Filter by conference day">
        <button className={day === "all" ? "active" : ""} onClick={() => setDay("all")}><b>All days</b><span>{SESSIONS.length} sessions</span></button>
        {(["2026-09-28", "2026-09-29", "2026-09-30"] as const).map((date, index) => <button key={date} className={day === date ? "active" : ""} onClick={() => setDay(date)}><b>Day {index + 1}</b><span>{["Mon, Sep 28", "Tue, Sep 29", "Wed, Sep 30"][index]}</span></button>)}
        <button className={day === "saved" ? "active saved-tab" : "saved-tab"} onClick={() => setDay("saved")}><b>My Schedule</b><span>{saved.length} sessions</span></button>
      </div>
      <label className="mobile-day-select"><span>View program</span><select value={day} onChange={(event) => setDay(event.target.value as DayFilter)} aria-label="Filter by conference day"><option value="all">All days · {SESSIONS.length} sessions</option><option value="2026-09-28">Day 1 · Mon, Sep 28</option><option value="2026-09-29">Day 2 · Tue, Sep 29</option><option value="2026-09-30">Day 3 · Wed, Sep 30</option><option value="saved">My Schedule · {saved.length} sessions</option></select></label>
      <div className={`filter-panel ${activeFilterCount ? "filters-active" : ""}`}>
        <label className={`search-box ${query.trim() ? "active" : ""}`}><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search sessions, speakers, or topics…" aria-label="Search sessions, speakers, or topics" /></label>
        <button className="mobile-filter-toggle" onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen}><span>Filters {activeFilterCount > 0 && <b>{activeFilterCount} active</b>}</span><i>{filtersOpen ? "−" : "+"}</i></button>
        <div className={`select-row ${filtersOpen ? "open" : ""}`}>
          <label className={speakerFilter !== "all" ? "active" : ""}><span>Speaker</span><select value={speakerFilter} onChange={(e) => setSpeakerFilter(e.target.value)}><option value="all">All speakers</option>{roleOptions.speakers.map((speaker) => <option key={speaker.id} value={speaker.id}>{speaker.name}</option>)}</select></label>
          <label className={panelistFilter !== "all" ? "active" : ""}><span>Panelist</span><select value={panelistFilter} onChange={(e) => setPanelistFilter(e.target.value)}><option value="all">All panelists</option>{roleOptions.panelists.map((speaker) => <option key={speaker.id} value={speaker.id}>{speaker.name}</option>)}</select></label>
          <label className={moderatorFilter !== "all" ? "active" : ""}><span>Moderator</span><select value={moderatorFilter} onChange={(e) => setModeratorFilter(e.target.value)}><option value="all">All moderators</option>{roleOptions.moderators.map((speaker) => <option key={speaker.id} value={speaker.id}>{speaker.name}</option>)}</select></label>
          <label className={roomFilter !== "all" ? "active" : ""}><span>Room</span><select value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)}><option value="all">All rooms</option>{rooms.map((room) => <option key={room}>{room}</option>)}</select></label>
          <label className={typeFilter !== "all" ? "active" : ""}><span>Session type</span><select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}><option value="all">All types</option>{types.map((type) => <option key={type}>{type}</option>)}</select></label>
          <button className="clear-button" onClick={clearFilters}>Clear filters</button>
        </div>
      </div>
      {activeFilterCount > 0 && <div className="active-filter-summary" role="status"><div><strong>Filters active</strong>{activeFilterLabels.map((label) => <span key={label}>{label}</span>)}</div><button onClick={clearFilters}>Clear all</button></div>}
      <div className="results-meta" id="program-results"><span><b>{results.length}</b> {results.length === 1 ? "session" : "sessions"}</span>{liveSessionIds.size > 0 && <span className="live-results"><i />{liveSessionIds.size} live now</span>}</div>
      {results.length === 0 ? <div className="empty-state"><span>◇</span><h3>{day === "saved" ? "My Schedule is ready to build" : "No sessions match"}</h3><p>{day === "saved" ? "Select Add to My Schedule on any session and it will appear here on this device." : "Try broadening your search or clearing the filters."}</p><button onClick={day === "saved" ? () => setDay("all") : clearFilters}>{day === "saved" ? "Browse all sessions" : "Clear filters"}</button></div>
        : Object.entries(grouped).map(([date, sessions]) => <section className="day-group" key={date}><div className="day-heading"><span>{new Date(`${date}T12:00:00`).getDate()}</span><div><small>DAY {(["2026-09-28", "2026-09-29", "2026-09-30"] as string[]).indexOf(date) + 1}</small><h3>{dayLabel(date as Session["day"])}</h3></div></div><ScheduleSessionList sessions={sessions} saved={saved} liveSessionIds={liveSessionIds} autoExpandBreakouts={Boolean(query.trim() || speakerFilter !== "all" || panelistFilter !== "all" || moderatorFilter !== "all" || roomFilter !== "all" || typeFilter !== "all" || day === "saved")} onOpen={openSession} onOpenSubSession={openSubSession} onSave={toggleSaved} onSpeaker={openSpeaker} /></section>)}
      {day === "saved" && saved.length > 0 && <div className="saved-schedule-actions"><button className="reset-schedule-button" onClick={resetSaved}>Reset My Schedule</button></div>}
    </section>
    <footer><div><p><b>{CONFERENCE.name}</b><br />{CONFERENCE.dates} · Southbury, Connecticut</p></div><p>Your saved program selections are stored only in this browser.</p></footer>
  </main>;
}

function ScheduleSessionList({ sessions, saved, liveSessionIds, autoExpandBreakouts, onOpen, onOpenSubSession, onSave, onSpeaker }: { sessions: Session[]; saved: string[]; liveSessionIds: Set<string>; autoExpandBreakouts: boolean; onOpen: (session: Session) => void; onOpenSubSession: (session: Session, index: number) => void; onSave: (id: string) => void; onSpeaker: (speaker: Speaker) => void }) {
  const renderedBreakoutBlocks = new Set<string>();
  return <div className="session-list">{sessions.map((session) => {
    if (session.type !== "Breakout") return <SessionCard key={session.id} session={session} saved={saved.includes(session.id)} isLive={liveSessionIds.has(session.id)} onOpen={() => onOpen(session)} onOpenSubSession={(index) => onOpenSubSession(session, index)} onSave={() => onSave(session.id)} onSpeaker={onSpeaker} />;
    const blockKey = `${session.day}-${session.start}-${session.end || ""}`;
    if (renderedBreakoutBlocks.has(blockKey)) return null;
    renderedBreakoutBlocks.add(blockKey);
    const concurrentSessions = sessions.filter((item) => item.type === "Breakout" && item.start === session.start && item.end === session.end);
    return <BreakoutTimeBlock key={blockKey} sessions={concurrentSessions} saved={saved} liveSessionIds={liveSessionIds} autoExpand={autoExpandBreakouts} onOpen={onOpen} onOpenSubSession={onOpenSubSession} onSave={onSave} onSpeaker={onSpeaker} />;
  })}</div>;
}

function BreakoutTimeBlock({ sessions, saved, liveSessionIds, autoExpand, onOpen, onOpenSubSession, onSave, onSpeaker }: { sessions: Session[]; saved: string[]; liveSessionIds: Set<string>; autoExpand: boolean; onOpen: (session: Session) => void; onOpenSubSession: (session: Session, index: number) => void; onSave: (id: string) => void; onSpeaker: (speaker: Speaker) => void }) {
  const [expanded, setExpanded] = useState<boolean | null>(null);
  const hasLiveSession = sessions.some((session) => liveSessionIds.has(session.id));
  const isOpen = expanded ?? (autoExpand || hasLiveSession);
  const first = sessions[0];
  return <section className={`breakout-block ${isOpen ? "open" : ""} ${hasLiveSession ? "live" : ""}`}>
    <button className="breakout-block-toggle" onClick={() => setExpanded(!isOpen)} aria-expanded={isOpen}>
      <span className="breakout-block-time"><b>{formatTime(first.start)} <em>{TIME_ZONE_ABBR}</em></b>{first.end && <small>{formatTime(first.end)} <em>{TIME_ZONE_ABBR}</em></small>}</span>
      <span className="breakout-block-heading"><small>{hasLiveSession ? <><i className="live-dot" /> LIVE NOW</> : "CONCURRENT PROGRAM"}</small><b>Breakout Sessions</b><em>{sessions.length} {sessions.length === 1 ? "session" : "sessions"} in this time block · Multiple rooms</em></span>
      <span className="breakout-block-action">{isOpen ? "Hide sessions" : "View sessions"} <i>{isOpen ? "−" : "+"}</i></span>
    </button>
    {isOpen && <div className="breakout-block-list">{sessions.map((session) => <SessionCard key={session.id} session={session} saved={saved.includes(session.id)} isLive={liveSessionIds.has(session.id)} onOpen={() => onOpen(session)} onOpenSubSession={(index) => onOpenSubSession(session, index)} onSave={() => onSave(session.id)} onSpeaker={onSpeaker} />)}</div>}
  </section>;
}

function SessionCard({ session, saved, isLive, onOpen, onOpenSubSession, onSave, onSpeaker }: { session: Session; saved: boolean; isLive: boolean; onOpen: () => void; onOpenSubSession: (index: number) => void; onSave: () => void; onSpeaker: (speaker: Speaker) => void }) {
  const [expanded, setExpanded] = useState(false);
  const moderators = [session.moderatorId, ...(session.additionalModeratorIds || [])].map(speakerById).filter(Boolean) as Speaker[];
  const presenters = session.speakerIds.map(speakerById).filter(Boolean) as Speaker[];
  return <article className={`session-card ${expanded ? "expanded" : ""} ${isLive ? "live" : ""}`} onClick={onOpen} tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" && e.currentTarget === e.target) onOpen(); }}>
    <div className="time-column"><b>{formatTime(session.start)} <small>{TIME_ZONE_ABBR}</small></b>{session.end && <span>{formatTime(session.end)} <small>{TIME_ZONE_ABBR}</small></span>}</div><div className={`type-line type-${typeClass(session.type)}`} />
    <div className="session-content"><div className="card-labels">{isLive && <span className="live-tag"><i />LIVE</span>}<span className={`type-pill type-${typeClass(session.type)}`}>{session.type}</span><span>⌖ {session.room}</span></div><h4>{session.title}</h4>{session.summary && <p>{session.summary}</p>}
      {session.subSessions && <div className="subsession-area">
        <button className="subsession-toggle" onClick={(event) => { event.stopPropagation(); setExpanded((current) => !current); }} aria-expanded={expanded}><span><b>{session.subSessions.length} program items</b> · {expanded ? "Hide items" : "View items"}</span><i>{expanded ? "−" : "+"}</i></button>
        {expanded && <div className="card-subsession-list">{session.subSessions.map((sub, index) => <button key={`${sub.title}-${index}`} onClick={(event) => { event.stopPropagation(); onOpenSubSession(index); }}><span>{String(index + 1).padStart(2, "0")}</span><div>{sub.time && <small>{sub.time}</small>}<b>{sub.title}</b><SubSessionSpeakerSummary speakerIds={sub.speakerIds} /><em>View details →</em></div></button>)}</div>}
      </div>}
      <div className="session-people-summary">
        {moderators.length > 0 && <CardPeopleRow label={moderators.length > 1 ? "Moderators" : "Moderator"} people={moderators} onSpeaker={onSpeaker} />}
        {presenters.length > 0 && <CardPeopleRow label={session.peopleLabel || (presenters.length > 1 ? "Presenters" : "Presenter")} people={presenters} onSpeaker={onSpeaker} />}
      </div>
      {session.recordingUrl && <a className="card-recording-link" href={session.recordingUrl} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()} aria-label={`Watch video for ${session.title} (opens in a new tab)`}>Watch Video ↗</a>}
      {session.recordingUnavailable && <span className="card-recording-unavailable">Recording Not Available</span>}
    </div>
    <button className={`save-button ${saved ? "saved" : ""}`} onClick={(e) => { e.stopPropagation(); onSave(); }} aria-label={saved ? `Remove ${session.title} from My Schedule` : `Add ${session.title} to My Schedule`}>{saved ? "Added to My Schedule" : "Add to My Schedule"}</button>
  </article>;
}

function SubSessionSpeakerSummary({ speakerIds }: { speakerIds?: string[] }) {
  const speakers = (speakerIds || []).map(speakerById).filter(Boolean) as Speaker[];
  if (speakers.length === 0) return null;
  return <span className="subsession-speakers">
    <span className="avatar-stack">{speakers.slice(0, 4).map((speaker) => <SpeakerAvatar key={speaker.id} speaker={speaker} />)}{speakers.length > 4 && <span className="avatar extra">+{speakers.length - 4}</span>}</span>
    <span><strong>{speakers.length > 1 ? "Speakers" : "Speaker"}</strong>{speakers.slice(0, 2).map((speaker) => speaker.name).join(" · ")}{speakers.length > 2 ? ` +${speakers.length - 2}` : ""}</span>
  </span>;
}

function DetailHeader({ onBack }: { onBack: () => void }) { return <header className="detail-header"><button className="brand" onClick={onBack} aria-label="Conference program home"><img className="conference-logo" src={`${import.meta.env.BASE_URL}conference-logo.png`} alt="Global Health Conference, Majid Sadigh Global Health Academy" /></button><button className="back-button" onClick={onBack}>← Back to program</button></header>; }
function SessionRecording({ session }: { session: Session }) {
  if (!session.recordingUrl && !session.recordingUnavailable) return null;
  return <div className={`recording-panel ${session.recordingUnavailable ? "unavailable" : ""}`}><span aria-hidden="true">{session.recordingUnavailable ? "−" : "▶"}</span><div><small>SESSION RECORDING</small>{session.recordingUrl
    ? <a href={session.recordingUrl} target="_blank" rel="noopener noreferrer">Watch Video ↗</a>
    : <b>Recording Not Available</b>}</div></div>;
}
function SessionDetail({ session, saved, isLive, onBack, onPrevious, onSave, onSpeaker, onSubSession }: { session: Session; saved: boolean; isLive: boolean; onBack: () => void; onPrevious: () => void; onSave: () => void; onSpeaker: (speaker: Speaker) => void; onSubSession: (index: number) => void }) {
  const moderators = [session.moderatorId, ...(session.additionalModeratorIds || [])].map(speakerById).filter(Boolean) as Speaker[]; const speakers = session.speakerIds.map(speakerById).filter(Boolean) as Speaker[];
  return <main className="detail-page"><DetailHeader onBack={onBack} /><div className="detail-hero"><div className="detail-hero-inner"><p className="breadcrumb">PROGRAM / DAY {(["2026-09-28", "2026-09-29", "2026-09-30"] as string[]).indexOf(session.day) + 1}</p><div className="detail-labels">{isLive && <span className="live-tag"><i />LIVE</span>}<span className={`type-pill type-${typeClass(session.type)}`}>{session.type}</span></div><h1>{session.title}</h1><div className="detail-meta"><span>◷ <b>{formatTimeRange(session.start,session.end)}</b></span><span>▣ <b>{dayLabel(session.day)}</b></span><span>⌖ <b>{session.room}</b></span></div><button className={`primary-save ${saved ? "saved" : ""}`} onClick={onSave}>{saved ? "Added to My Schedule" : "Add to My Schedule"}</button></div></div>
    <div className="detail-grid"><article><button className="content-back-button" onClick={onPrevious}>← Back to previous page</button><p className="eyebrow dark">ABOUT THIS SESSION</p>{session.summary ? <p className="lead">{session.summary}</p> : <div className="description-placeholder" role="note">A detailed session description will be added as program information becomes available.</div>}<SessionRecording session={session} />{session.learningObjectives && session.learningObjectives.length > 0 && <section className="learning-objectives"><p className="eyebrow dark">LEARNING OBJECTIVES</p><h2>What participants will learn</h2><ol>{session.learningObjectives.map((objective) => <li key={objective}>{objective}</li>)}</ol></section>}<div className="topic-list">{session.topics.map((topic) => <span key={topic}>{topic}</span>)}</div>{session.subSessions && <section className="subsession-list"><p className="eyebrow dark">WITHIN THIS SESSION</p><h2>Program details</h2>{session.subSessions.map((sub, index) => <button className="subsession detail-subsession" key={`${sub.title}-${index}`} onClick={() => onSubSession(index)}><b>{String(index + 1).padStart(2, "0")}</b><div>{sub.time && <span>{sub.time}</span>}<h3>{sub.title}</h3><SubSessionSpeakerSummary speakerIds={sub.speakerIds} /><em>View sub-session details →</em></div></button>)}</section>}</article>
      <SessionPeoplePanel moderators={moderators} presenters={speakers} presenterLabel={session.peopleLabel} onSpeaker={onSpeaker} /></div>
  </main>;
}
function SubSessionDetail({ parent, subSession, index, onBack, onPrevious, onParent, onSpeaker }: { parent: Session; subSession: SubSession; index: number; onBack: () => void; onPrevious: () => void; onParent: () => void; onSpeaker: (speaker: Speaker) => void }) {
  const moderators = [parent.moderatorId, ...(parent.additionalModeratorIds || [])].map(speakerById).filter(Boolean) as Speaker[];
  const speakers = (subSession.speakerIds || []).map(speakerById).filter(Boolean) as Speaker[];
  return <main className="detail-page"><DetailHeader onBack={onBack} /><div className="detail-hero"><div className="detail-hero-inner"><p className="breadcrumb">PROGRAM / DAY {(["2026-09-28", "2026-09-29", "2026-09-30"] as string[]).indexOf(parent.day) + 1} / ITEM {index + 1}</p><span className={`type-pill type-${typeClass(parent.type)}`}>Sub-session</span><h1>{subSession.title}</h1><div className="detail-meta"><span>◷ <b>{subSession.time || formatTimeRange(parent.start,parent.end)}</b></span><span>▣ <b>{dayLabel(parent.day)}</b></span><span>⌖ <b>{parent.room}</b></span></div></div></div>
    <div className="detail-grid"><article><button className="content-back-button" onClick={onPrevious}>← Back to previous page</button><p className="eyebrow dark">ABOUT THIS SUB-SESSION</p>{subSession.summary && <p className="lead">{subSession.summary}</p>}<SessionRecording session={parent} /><div className="parent-session-card"><small>PART OF</small><b>{parent.title}</b><button onClick={onParent}>View main session →</button></div></article>
      <SessionPeoplePanel moderators={moderators} presenters={speakers} presenterLabel={parent.peopleLabel} onSpeaker={onSpeaker} /></div>
  </main>;
}
function CardPeopleRow({ label, people, onSpeaker }: { label: string; people: Speaker[]; onSpeaker: (speaker: Speaker) => void }) {
  return <div className="card-people-row"><strong>{label}</strong><div className="card-people-value"><div className="avatar-stack">{people.slice(0, 4).map((person) => <SpeakerAvatar key={person.id} speaker={person} onClick={() => onSpeaker(person)} />)}{people.length > 4 && <span className="avatar extra">+{people.length - 4}</span>}</div><span>{people.slice(0, 2).map((person) => person.name).join(" · ")}{people.length > 2 ? ` +${people.length - 2}` : ""}</span></div></div>;
}
function SessionPeoplePanel({ moderators, presenters, presenterLabel, onSpeaker }: { moderators: Speaker[]; presenters: Speaker[]; presenterLabel?: string; onSpeaker: (speaker: Speaker) => void }) {
  return <aside className="session-people-panel">
    {moderators.length > 0 && <section className="detail-people-group"><p className="eyebrow dark">{moderators.length > 1 ? "MODERATORS" : "MODERATOR"}</p>{moderators.map((moderator) => <SpeakerBioCard key={moderator.id} speaker={moderator} label="Moderator" onOpen={() => onSpeaker(moderator)} />)}</section>}
    {presenters.length > 0 && <section className="detail-people-group"><p className="eyebrow dark">{(presenterLabel || (presenters.length > 1 ? "PRESENTERS" : "PRESENTER")).toUpperCase()}</p>{presenters.map((presenter) => <SpeakerBioCard key={presenter.id} speaker={presenter} label={presenterLabel || "Presenter"} onOpen={() => onSpeaker(presenter)} />)}</section>}
  </aside>;
}
function SpeakerBioCard({ speaker, label, onOpen }: { speaker: Speaker; label: string; onOpen: () => void }) { return <button className="person-card" onClick={onOpen}><SpeakerAvatar speaker={speaker} size="large" /><span className="person-info"><small>{label}{speaker.attendance ? ` · ${speaker.attendance}` : ""}</small><b>{speaker.name}</b><em>{speaker.role}</em></span><i>→</i></button>; }
function PeopleDirectory({ roleOptions, onBack, onSpeaker }: { roleOptions: { speakers: Speaker[]; panelists: Speaker[]; moderators: Speaker[] }; onBack: () => void; onSpeaker: (speaker: Speaker) => void }) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All");
  const people = useMemo(() => {
    const speakerIds = new Set(roleOptions.speakers.map((person) => person.id));
    const panelistIds = new Set(roleOptions.panelists.map((person) => person.id));
    const moderatorIds = new Set(roleOptions.moderators.map((person) => person.id));
    const groupIds = new Set(["all-session-participants", "representatives-of-international-partner-sites"]);
    return SPEAKERS.filter((person) => !groupIds.has(person.id) && (speakerIds.has(person.id) || panelistIds.has(person.id) || moderatorIds.has(person.id)))
      .map((speaker) => ({ speaker, roles: [speakerIds.has(speaker.id) && "Speaker", panelistIds.has(speaker.id) && "Panelist", moderatorIds.has(speaker.id) && "Moderator"].filter(Boolean) as string[] }));
  }, [roleOptions]);
  const visiblePeople = people.filter(({ speaker, roles }) => (role === "All" || roles.includes(role)) && speaker.name.toLowerCase().includes(search.trim().toLowerCase()));
  return <main className="detail-page directory-page">
    <DetailHeader onBack={onBack} />
    <div className="directory-hero"><div><p className="eyebrow">CONFERENCE DIRECTORY</p><h1>Speakers, panelists &amp; moderators</h1><p>Find a participant and open their biography and session appearances.</p></div></div>
    <section className="directory-shell" aria-label="Conference participants">
      <div className="directory-controls">
        <label className="directory-search"><span aria-hidden="true">⌕</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name" aria-label="Search people by name" /></label>
        <div className="directory-filters" aria-label="Filter participants by role">{["All", "Speaker", "Panelist", "Moderator"].map((option) => <button key={option} className={role === option ? "active" : ""} aria-pressed={role === option} onClick={() => setRole(option)}>{option === "All" ? "All people" : `${option}s`}</button>)}</div>
      </div>
      <p className="directory-count" role="status">{visiblePeople.length} {visiblePeople.length === 1 ? "person" : "people"}</p>
      {visiblePeople.length ? <div className="directory-grid">{visiblePeople.map(({ speaker, roles }) => <button className="directory-card" key={speaker.id} onClick={() => onSpeaker(speaker)} aria-label={`View ${speaker.name}'s biography`}>
        <SpeakerAvatar speaker={speaker} size="large" />
        <span className="directory-card-name">{speaker.name}</span>
        <span className="directory-card-roles">{roles.join(" · ")}{speaker.attendance ? ` · ${speaker.attendance}` : ""}</span>
        <span className="directory-card-action">View biography <span aria-hidden="true">→</span></span>
      </button>)}</div> : <div className="directory-empty"><p>No people match this search.</p><button onClick={() => { setSearch(""); setRole("All"); }}>Show all people</button></div>}
    </section>
  </main>;
}
function SpeakerDetail({ speaker, onBack, onSchedule, onSession }: { speaker: Speaker; onBack: () => void; onSchedule: () => void; onSession: (session: Session) => void }) {
  const appearances = SESSIONS.filter((session) => session.speakerIds.includes(speaker.id) || session.moderatorId === speaker.id || session.additionalModeratorIds?.includes(speaker.id));
  return <main className="detail-page"><DetailHeader onBack={onSchedule} /><div className="speaker-hero"><SpeakerAvatar speaker={speaker} size="large" /><div><p className="eyebrow">SPEAKER PROFILE</p><h1>{speaker.name}</h1><p>{speaker.role}{speaker.organization ? ` · ${speaker.organization}` : ""}{speaker.attendance ? ` · ${speaker.attendance} participation` : ""}</p></div></div><div className="speaker-body"><article><button className="content-back-button" onClick={onBack}>← Back to previous page</button><p className="eyebrow dark">BIOGRAPHY</p><h2>About {speaker.name}</h2><div className="bio-copy">{speaker.bio.split(/\n\n+/).map((paragraph,index)=><p className="lead" key={index}>{paragraph}</p>)}</div></article><aside><p className="eyebrow dark">AT THIS CONFERENCE</p>{appearances.map((session) => <button className="appearance-card" key={session.id} onClick={() => onSession(session)}><span>{dayLabel(session.day)} · {formatTime(session.start)} {TIME_ZONE_ABBR}</span><b>{session.title}</b><em>{session.moderatorId === speaker.id || session.additionalModeratorIds?.includes(speaker.id) ? "Moderator" : "Speaker"} →</em></button>)}</aside></div></main>;
}
