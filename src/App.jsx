import React from 'react'

// ─── Training plan data ───────────────────────────────────────────────────────

const PHASES = [
  {
    id: 'p1',
    label: 'Phase 1',
    subtitle: 'Base Building',
    weeks: [1, 2, 3, 4, 5, 6],
    sessions: [
      { id: 's1', label: 'Wed Cardio', icon: '🏃' },
      { id: 's2', label: 'Fri Strength', icon: '💪' },
    ],
  },
  {
    id: 'p2',
    label: 'Phase 2',
    subtitle: 'Endurance Build',
    weeks: [7, 8, 9, 10, 11, 12],
    sessions: [
      { id: 's1', label: 'Wed Cardio', icon: '🏃' },
      { id: 's2', label: 'Fri Strength', icon: '💪' },
      { id: 's3', label: 'Sat Hike', icon: '⛰️' },
    ],
  },
  {
    id: 'p3',
    label: 'Phase 3',
    subtitle: 'Altitude Prep',
    weeks: [13, 14, 15, 16, 17, 18],
    sessions: [
      { id: 's1', label: 'Wed Cardio', icon: '🏃' },
      { id: 's2', label: 'Fri Strength', icon: '💪' },
      { id: 's3', label: 'Sat Long Hike', icon: '🏔️' },
      { id: 's4', label: 'Sun Recovery', icon: '🧘' },
    ],
  },
  {
    id: 'p4',
    label: 'Phase 4',
    subtitle: 'Peak + Taper',
    taperFrom: 22,
    weeks: [19, 20, 21, 22, 23, 24],
    sessions: [
      { id: 's1', label: 'Wed Cardio', icon: '🏃' },
      { id: 's2', label: 'Fri Strength', icon: '💪' },
      { id: 's3', label: 'Sat Long Hike', icon: '🏔️' },
      { id: 's4', label: 'Sun Recovery', icon: '🧘' },
    ],
  },
]

const TIPS = [
  { icon: '💧', title: 'Hydrate early', body: 'Start increasing water intake 2 weeks before departure.' },
  { icon: '🥾', title: 'Break in boots', body: 'Wear summit boots on every hike from week 8 onward.' },
  { icon: '😴', title: 'Sleep low', body: 'Acclimatise by sleeping at lower altitude than max daytime elevation.' },
  { icon: '🐢', title: 'Pole pole', body: '"Slowly slowly" — the Swahili mantra. Pace yourself on ascent day.' },
]

// ─── Colors & styles ──────────────────────────────────────────────────────────

const C = {
  bg: '#080808',
  surface: '#141414',
  surfaceHigh: '#1e1e1e',
  border: '#2a2a2a',
  accent: '#4ade80',
  accentDim: '#166534',
  textPrimary: '#f0f0f0',
  textSecondary: '#888',
  textMuted: '#555',
  yellow: '#facc15',
  radius: 14,
  radiusSm: 8,
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = 'kili-tracker-v1'

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { completions: {}, startWeek: null, notes: {} }
    return JSON.parse(raw)
  } catch {
    return { completions: {}, startWeek: null, notes: {} }
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// ─── Date / week helpers ──────────────────────────────────────────────────────

function getWeekStart(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}

function getCurrentProgramWeek(startWeek) {
  if (!startWeek) return null
  const start = new Date(startWeek)
  const now = new Date()
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const weekNum = Math.floor((now - start) / msPerWeek) + 1
  if (weekNum < 1 || weekNum > 24) return null
  return weekNum
}

function completionKey(phaseId, sessionId, weekNum) {
  return `${phaseId}-${sessionId}-${weekNum}`
}

function noteKey(phaseId, sessionId) {
  return `${phaseId}-${sessionId}`
}

function phaseProgress(phase, completions) {
  const total = phase.weeks.length * phase.sessions.length
  let completed = 0
  for (const w of phase.weeks) {
    for (const s of phase.sessions) {
      if (completions[completionKey(phase.id, s.id, w)]) completed++
    }
  }
  return { completed, total, pct: total === 0 ? 0 : Math.round((completed / total) * 100) }
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [data, setData] = React.useState(() => loadData())
  const [view, setView] = React.useState('dashboard')
  const [selectedPhase, setSelectedPhase] = React.useState(0)

  const currentWeek = getCurrentProgramWeek(data.startWeek)
  const currentPhaseIndex = currentWeek
    ? PHASES.findIndex(p => p.weeks.includes(currentWeek))
    : -1

  function updateData(updater) {
    setData(prev => {
      const next = updater(prev)
      saveData(next)
      return next
    })
  }

  function startProgram() {
    const monday = getWeekStart(new Date())
    updateData(prev => ({ ...prev, startWeek: monday }))
  }

  function toggleCompletion(phaseId, sessionId, weekNum) {
    const key = completionKey(phaseId, sessionId, weekNum)
    updateData(prev => {
      const completions = { ...prev.completions }
      if (completions[key]) {
        delete completions[key]
      } else {
        completions[key] = true
      }
      return { ...prev, completions }
    })
  }

  function setNote(phaseId, sessionId, text) {
    const key = noteKey(phaseId, sessionId)
    updateData(prev => ({
      ...prev,
      notes: { ...prev.notes, [key]: text },
    }))
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100dvh',
      background: C.bg,
      maxWidth: 480,
      margin: '0 auto',
      position: 'relative',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 72, overscrollBehavior: 'contain' }}>
        {view === 'dashboard' && (
          <Dashboard
            data={data}
            currentWeek={currentWeek}
            currentPhaseIndex={currentPhaseIndex}
            onStart={startProgram}
            onNavigate={setView}
            onSelectPhase={setSelectedPhase}
          />
        )}
        {view === 'plan' && (
          <Plan
            data={data}
            currentWeek={currentWeek}
            selectedPhase={selectedPhase}
            onSelectPhase={setSelectedPhase}
            onToggle={toggleCompletion}
            onSetNote={setNote}
          />
        )}
        {view === 'log' && (
          <Log data={data} />
        )}
      </div>
      <BottomNav view={view} onNavigate={setView} />
    </div>
  )
}

// ─── BottomNav ────────────────────────────────────────────────────────────────

function BottomNav({ view, onNavigate }) {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: '🏠' },
    { id: 'plan', label: 'Plan', icon: '📋' },
    { id: 'log', label: 'Log', icon: '📝' },
  ]
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 480,
      background: C.surface,
      borderTop: `1px solid ${C.border}`,
      display: 'flex',
      alignItems: 'stretch',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 100,
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onNavigate(t.id)}
          style={{
            flex: 1,
            height: 64,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            color: view === t.id ? C.accent : C.textSecondary,
            fontSize: 11,
            fontWeight: view === t.id ? 600 : 400,
            transition: 'color 0.15s',
          }}
        >
          <span style={{ fontSize: 22 }}>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </nav>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ data, currentWeek, currentPhaseIndex, onStart, onNavigate, onSelectPhase }) {
  const started = !!data.startWeek

  return (
    <div style={{ padding: '24px 16px 0' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>
          🏔️ Kili Tracker
        </div>
        <div style={{ color: C.textSecondary, fontSize: 14, marginTop: 4 }}>
          Kilimanjaro 24-week training program
        </div>
      </div>

      {!started ? (
        <div style={{
          background: C.surface,
          borderRadius: C.radius,
          border: `1px solid ${C.border}`,
          padding: 20,
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Ready to summit?</div>
          <div style={{ color: C.textSecondary, fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
            Start your 24-week training journey to the roof of Africa.
          </div>
          <button
            onClick={onStart}
            style={{
              width: '100%',
              height: 48,
              background: C.accent,
              color: '#000',
              border: 'none',
              borderRadius: C.radiusSm,
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            Start Program
          </button>
        </div>
      ) : (
        <div style={{
          background: C.surface,
          borderRadius: C.radius,
          border: `1px solid ${C.border}`,
          padding: '14px 16px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ color: C.textSecondary, fontSize: 12 }}>Current week</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>
              Week {currentWeek ?? '—'}
              {currentPhaseIndex >= 0 && (
                <span style={{ color: C.textSecondary, fontWeight: 400, fontSize: 14 }}>
                  {' '}· {PHASES[currentPhaseIndex].label}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              if (currentPhaseIndex >= 0) onSelectPhase(currentPhaseIndex)
              onNavigate('plan')
            }}
            style={{
              background: C.surfaceHigh,
              border: `1px solid ${C.border}`,
              borderRadius: C.radiusSm,
              color: C.textPrimary,
              padding: '8px 14px',
              fontSize: 13,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Go to plan →
          </button>
        </div>
      )}

      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Progress</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
        {PHASES.map((phase, i) => {
          const { completed, total, pct } = phaseProgress(phase, data.completions)
          const isNow = i === currentPhaseIndex
          return (
            <div
              key={phase.id}
              onClick={() => { onSelectPhase(i); onNavigate('plan') }}
              style={{
                background: C.surface,
                borderRadius: C.radius,
                padding: 14,
                border: `1px solid ${isNow ? C.accent : C.border}`,
                position: 'relative',
                cursor: 'pointer',
              }}
            >
              {isNow && (
                <span style={{
                  position: 'absolute', top: 8, right: 8,
                  background: C.accent, color: '#000',
                  fontSize: 9, fontWeight: 800,
                  borderRadius: 4, padding: '2px 5px',
                  letterSpacing: 0.5,
                }}>NOW</span>
              )}
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{phase.label}</div>
              <div style={{ color: C.textSecondary, fontSize: 11, marginBottom: 10 }}>
                Wks {phase.weeks[0]}–{phase.weeks[phase.weeks.length - 1]}
              </div>
              <div style={{ height: 3, background: C.border, borderRadius: 2, marginBottom: 6 }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: pct === 100 ? C.accent : '#3b82f6',
                  borderRadius: 2,
                  transition: 'width 0.3s',
                }} />
              </div>
              <div style={{ color: C.textMuted, fontSize: 11 }}>
                {completed}/{total} · {pct}%
              </div>
            </div>
          )
        })}
      </div>

      <SummitTips />
    </div>
  )
}

// ─── SummitTips ───────────────────────────────────────────────────────────────

function SummitTips() {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Summit Tips</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {TIPS.map(tip => (
          <div key={tip.title} style={{
            background: C.surface,
            borderRadius: C.radiusSm,
            padding: '12px 14px',
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
            border: `1px solid ${C.border}`,
          }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{tip.icon}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{tip.title}</div>
              <div style={{ color: C.textSecondary, fontSize: 12, lineHeight: 1.5 }}>{tip.body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Plan ─────────────────────────────────────────────────────────────────────

function Plan({ data, currentWeek, selectedPhase, onSelectPhase, onToggle, onSetNote }) {
  const phase = PHASES[selectedPhase]

  const defaultWeek = currentWeek && phase.weeks.includes(currentWeek)
    ? currentWeek
    : phase.weeks[0]
  const [selectedWeek, setSelectedWeek] = React.useState(defaultWeek)

  React.useEffect(() => {
    const p = PHASES[selectedPhase]
    setSelectedWeek(
      currentWeek && p.weeks.includes(currentWeek) ? currentWeek : p.weeks[0]
    )
  }, [selectedPhase, currentWeek])

  const isCurrentWeek = selectedWeek === currentWeek
  const isTaperWeek = phase.taperFrom && selectedWeek >= phase.taperFrom

  return (
    <div>
      <div style={{ padding: '24px 16px 0', marginBottom: 16 }}>
        <div style={{ fontSize: 24, fontWeight: 800 }}>Training Plan</div>
      </div>

      {/* Phase tabs */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        padding: '0 16px',
        gap: 8,
        marginBottom: 16,
        scrollbarWidth: 'none',
      }}>
        {PHASES.map((p, i) => (
          <button
            key={p.id}
            onClick={() => onSelectPhase(i)}
            style={{
              flexShrink: 0,
              padding: '8px 16px',
              borderRadius: 20,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
              background: selectedPhase === i ? C.accent : C.surfaceHigh,
              color: selectedPhase === i ? '#000' : C.textSecondary,
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Week bubbles */}
      <div style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        padding: '0 16px 8px',
        scrollbarWidth: 'none',
      }}>
        {phase.weeks.map(wk => {
          const allDone = phase.sessions.every(
            s => data.completions[completionKey(phase.id, s.id, wk)]
          )
          const isSelected = wk === selectedWeek
          const isCurrent = wk === currentWeek
          const isTaper = phase.taperFrom && wk >= phase.taperFrom
          return (
            <button
              key={wk}
              onClick={() => setSelectedWeek(wk)}
              style={{
                flexShrink: 0,
                width: 44,
                height: 52,
                borderRadius: 10,
                border: `2px solid ${isCurrent ? C.accent : C.border}`,
                cursor: 'pointer',
                background: isSelected ? C.accent : allDone ? C.accentDim : C.surfaceHigh,
                color: isSelected ? '#000' : C.textPrimary,
                fontWeight: 700,
                fontSize: 13,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                transition: 'background 0.15s',
              }}
            >
              <span>{wk}</span>
              {isTaper && (
                <span style={{ fontSize: 7, color: isSelected ? '#000' : C.yellow, lineHeight: 1, fontWeight: 600 }}>
                  taper
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Week label */}
      <div style={{ padding: '6px 16px 14px', color: C.textSecondary, fontSize: 13 }}>
        Week {selectedWeek} · {phase.subtitle}
        {isCurrentWeek && <span style={{ color: C.accent, fontWeight: 600 }}> · Current</span>}
        {isTaperWeek && <span style={{ color: C.yellow }}> · Taper</span>}
      </div>

      {/* Session cards */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {phase.sessions.map(session => {
          const key = completionKey(phase.id, session.id, selectedWeek)
          const isDone = !!data.completions[key]
          const nKey = noteKey(phase.id, session.id)
          const note = data.notes[nKey] || ''
          return (
            <SessionCard
              key={session.id}
              session={session}
              isDone={isDone}
              isCurrentWeek={isCurrentWeek}
              note={note}
              onToggle={() => isCurrentWeek && onToggle(phase.id, session.id, selectedWeek)}
              onSetNote={text => onSetNote(phase.id, session.id, text)}
            />
          )
        })}
      </div>

      {!isCurrentWeek && currentWeek && (
        <div style={{
          margin: '16px 16px 0',
          padding: '10px 14px',
          background: C.surfaceHigh,
          borderRadius: C.radiusSm,
          color: C.textSecondary,
          fontSize: 13,
        }}>
          Viewing week {selectedWeek}. Check-off only available on the current week (week {currentWeek}).
        </div>
      )}
    </div>
  )
}

// ─── SessionCard ──────────────────────────────────────────────────────────────

function SessionCard({ session, isDone, isCurrentWeek, note, onToggle, onSetNote }) {
  const [expanded, setExpanded] = React.useState(false)

  return (
    <div style={{
      background: C.surface,
      borderRadius: C.radius,
      border: `1px solid ${isDone ? C.accentDim : C.border}`,
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 14px',
        gap: 12,
      }}>
        {/* Check circle */}
        <button
          onClick={onToggle}
          style={{
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: '50%',
            border: `2px solid ${isDone ? C.accent : C.border}`,
            background: isDone ? C.accent : 'transparent',
            cursor: isCurrentWeek ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isCurrentWeek ? 1 : 0.45,
            transition: 'background 0.15s, border-color 0.15s',
          }}
          aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
        >
          {isDone && (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3.5 9l4 4 7-8" stroke="#000" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Label */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 600,
            fontSize: 15,
            color: isDone ? C.textSecondary : C.textPrimary,
            textDecoration: isDone ? 'line-through' : 'none',
          }}>
            {session.icon} {session.label}
          </div>
          {note && !expanded && (
            <div style={{
              color: C.textMuted,
              fontSize: 12,
              marginTop: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {note}
            </div>
          )}
        </div>

        {/* Notes toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: note ? C.accent : C.textMuted,
            fontSize: 18,
            padding: '4px 0 4px 8px',
            flexShrink: 0,
          }}
          aria-label="Toggle notes"
        >
          ✏️
        </button>
      </div>

      {expanded && (
        <div style={{ padding: '0 14px 14px' }}>
          <textarea
            value={note}
            onChange={e => onSetNote(e.target.value)}
            placeholder="Add a note for this session type…"
            rows={3}
            style={{
              width: '100%',
              background: C.surfaceHigh,
              border: `1px solid ${C.border}`,
              borderRadius: C.radiusSm,
              color: C.textPrimary,
              padding: '10px 12px',
              resize: 'none',
              outline: 'none',
              fontSize: 14,
              lineHeight: 1.5,
            }}
          />
          <div style={{ color: C.textMuted, fontSize: 11, marginTop: 4 }}>
            Note applies to this session type across all weeks
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Log ──────────────────────────────────────────────────────────────────────

function Log({ data }) {
  const entries = []
  for (const phase of PHASES) {
    for (const wk of phase.weeks) {
      for (const session of phase.sessions) {
        const key = completionKey(phase.id, session.id, wk)
        if (data.completions[key]) {
          entries.push({
            phase,
            session,
            weekNum: wk,
            key,
            note: data.notes[noteKey(phase.id, session.id)] || '',
          })
        }
      }
    }
  }
  entries.sort((a, b) => b.weekNum - a.weekNum)

  return (
    <div style={{ padding: '24px 16px 0' }}>
      <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Completed</div>
      <div style={{ color: C.textSecondary, fontSize: 13, marginBottom: 20 }}>
        {entries.length} session{entries.length !== 1 ? 's' : ''} logged
      </div>
      {entries.length === 0 ? (
        <div style={{
          textAlign: 'center',
          color: C.textMuted,
          marginTop: 60,
          fontSize: 15,
          lineHeight: 1.8,
        }}>
          No sessions logged yet.<br />
          Complete your first session in the Plan tab!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {entries.map(e => (
            <div key={e.key} style={{
              background: C.surface,
              borderRadius: C.radiusSm,
              padding: '12px 14px',
              border: `1px solid ${C.border}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {e.session.icon} {e.session.label}
                </div>
                <div style={{
                  fontSize: 11,
                  color: C.textSecondary,
                  background: C.surfaceHigh,
                  padding: '3px 8px',
                  borderRadius: 10,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  Wk {e.weekNum} · {e.phase.label}
                </div>
              </div>
              {e.note && (
                <div style={{ color: C.textMuted, fontSize: 12, marginTop: 5, lineHeight: 1.4 }}>
                  {e.note}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
