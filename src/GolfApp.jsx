import React, { useState, useEffect } from 'react';

export default function GolfApp() {
  const [view, setView] = useState('home');
  const [areaView, setAreaView] = useState(null);
  const [practiceView, setPracticeView] = useState(null);
  const [showWaldron, setShowWaldron] = useState(false);
  const [editingMantra, setEditingMantra] = useState(false);

  const [mantraText, setMantraText] = useState('');
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [practiceLog, setPracticeLog] = useState([]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'outdoor', duration: '', areas: '', sensations: '', nextFocus: ''
  });

  const defaultMantra = `I play golf because I love it.

Out here on the course, surrounded by nature, I get to compete with myself — peacefully, but with intent. I play to enjoy, to share rounds with my friends, and to keep getting better. I also play to win. Both can be true.

Every shot matters. And the most important one is always the next one.

I deserve to improve and to have fun, because of the dedication I put into this game. I know golf has its ups and downs — that's the discipline. The job is to rise above each shot, keep good energy flowing, and find my golf flow.

Golf teaches me to be disciplined and assertive with my decisions. I am my own best ally on the course. I don't talk down to myself — I lift myself up, especially when things aren't going my way. My best round ever started with an 8.

My focus for every round:
– Precision over distance.
– Play with flow, with better tempo.
– Don't be anxious. Stay focused.
– Remember the Tiger Five and the DECADE framework.
– Breathe. Play calm.
– Take care of the details.

I'm lucky to be playing this game.`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem('happy-golf-v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        setMantraText(parsed.mantraText !== undefined ? parsed.mantraText : defaultMantra);
        setPracticeLog(parsed.practiceLog || []);
      } else {
        setMantraText(defaultMantra);
        // Seed the practice log with today's session
        const todaySession = {
          id: Date.now(),
          date: new Date().toISOString().split('T')[0],
          type: 'indoor',
          duration: '120',
          areas: 'Wedges 30–110 yds, Short & Mid Irons, Long Game (Driver + 3w + 5w + 4h), Pre-Shot Routine',
          sensations: `Wedge distance system (Trackman): 30–65 yds → 58° | 65–85 yds → 54° | 85–110 yds → A wedge.

Irons: Need to compress more — stop hitting up at the ball, focus on compressing forward. Drop the ball flight. More weight on the front foot, improve the weight shift.

Driver: A slightly shorter backswing produces cleaner contact. Best result: a controlled draw of 290+ yds.

Woods: Still inconsistent — swing feels unstable. Need to identify the cause in a future session.`,
          nextFocus: 'Iron compression — lower ball flight, hit through and forward. Driver — keep backswing controlled, replicate the draw. Diagnose what\'s breaking the wood swings.'
        };
        setPracticeLog([todaySession]);
      }
    } catch (e) {}
  }, []);

  const saveState = (updates = {}) => {
    try {
      const state = {
        mantraText: updates.mantraText ?? mantraText,
        practiceLog: updates.practiceLog ?? practiceLog
      };
      localStorage.setItem('happy-golf-v1', JSON.stringify(state));
    } catch (e) {}
  };

  const mantraQuotes = [
    { text: "Golf is a game of confidence.", author: null },
    { text: "Play the shot in front of you.", author: null },
    { text: "Tempo is the soul of the swing.", author: "Ben Hogan" },
    { text: "The most important shot in golf is the next one.", author: "Ben Hogan" },
    { text: "Golf is 90% mental and 10% mental.", author: "Jim McLean" },
    { text: "Trust your swing.", author: null },
    { text: "The most important distance in golf is the six inches between your ears.", author: "Arnold Palmer" }
  ];

  // Course Management removed from areas, now standalone section
  const areas = [
    {
      id: 'tempo', num: '01', icon: 'tempo',
      title: 'Tempo & Rhythm', subtitle: 'Foundation of every swing',
      color: '#d4af37',
      insight: 'A balanced swing is the foundation of everything else',
      current: 'Backswing too fast + overly aggressive downswing.',
      objective: 'Slower backswing with a more defined pause/transition before the downswing — building rhythm instead of rushing into impact.',
      notes: 'Reference (without going extreme): Cameron Young\'s tempo, softened. Focal word recommended: "Slow back, through". Expected benefit: more control and consistency across irons and woods.'
    },
    {
      id: 'elevated', num: '02', icon: 'elevated',
      title: 'Elevated Chip Shot', subtitle: 'Over slopes and breaks',
      color: '#8b6db5',
      insight: 'Backswing length controls distance, not force',
      current: 'Inconsistent contact and distance.',
      objective: 'Improve impact quality and swing length to produce more precise, repeatable shots.',
      notes: 'Need more consistency in swing length so the ball doesn\'t fly shorter or longer than intended. Always evaluate the safe shot — the elevated chip is the right choice only when chip & run won\'t work because of slopes or breaks between you and the hole. Choose between 54° and 58° based on situation.'
    },
    {
      id: 'chiprun', num: '03', icon: 'chiprun',
      title: 'Chip & Runs', subtitle: 'Around the green',
      color: '#4a7c8c',
      insight: 'Approach wedge + putt-style stroke = repeatability',
      current: 'Distance inconsistency from switching clubs too often on these shots.',
      objective: 'Commit to the approach wedge as the default — vary only if the lie demands a different loft.',
      notes: 'Precision on the line and predicting the roll is critical here. Always evaluate the safe shot — pick the right landing spot before committing. 9-iron tends to come out too hot — stick to approach wedge for consistency. Calibrate backswing length: shorter vs longer based on distance.'
    },
    {
      id: 'tee', num: '04', icon: 'tee',
      title: 'Tee Shots', subtitle: 'Driver & 3-wood',
      color: '#e07856',
      insight: 'A well-executed driver is the biggest strokes-gained opportunity',
      current: 'Inconsistent swing length and instability in the stance.',
      objective: 'Build consistency in swing length and accuracy off the tee.',
      notes: 'Better tempo, pre-shot routine, proper wrist hinge, solid posture. Dedicated driver sessions — don\'t give away strokes from the tee. 3-wood as the reliable second option.'
    },
    {
      id: 'wedges', num: '05', icon: 'wedge',
      title: 'Wedge Shots 30–90 yds', subtitle: '54° and 58°',
      color: '#6a9955',
      insight: 'Ball position is the spin dial',
      current: 'Contact is improving — now need to dial in distances.',
      objective: 'Define distances based on swing length — using the three standard wedge swings: 1/4, 2/4, 3/4 (full rarely used).',
      notes: 'Ball position back (closer to left foot, being lefty) = more compression, more spin. Ball forward = less spin. Modulate ball position by the spin you need. Work both 54° and 58°.'
    },
    {
      id: 'preshot', num: '06', icon: 'preshot',
      title: 'Pre-Shot Routine', subtitle: 'Full shots & putting',
      color: '#c97064',
      insight: 'Consistency in routine = consistency in result',
      current: 'No systematic routine before full shots and putts.',
      objective: 'Same sequence before every full shot and every putt — including a clear focal point.',
      notes: 'Visualize the shot from behind the ball. Choose ONE focal point for the round (a mark on the ball, a landing spot, a feel cue, or a rhythm word) and stick to it all day. Execute without tension or doubt.'
    }
  ];

  const tigerFive = [
    {
      num: '1',
      title: 'Double Bogeys (or worse)',
      detail: 'A double bogey is not just twice as bad as a bogey — it costs roughly 1.2 strokes vs expectation, while a bogey costs only 0.2. That makes a double ~6× more costly. Never compound mistakes: if in trouble, take your medicine and punch out.'
    },
    {
      num: '2',
      title: 'Bogeys on Par 5s',
      detail: 'Par 5s are scoring holes. Even at recreational level, you usually have a scoring club into the green. You don\'t need to make birdie — but bogey here gives away strokes to the field. Play the par 5 conservatively to guarantee par.'
    },
    {
      num: '3',
      title: 'Three-Putts',
      detail: 'On long putts, the priority is not making it — it\'s leaving a tap-in. Even on tour, an 18-foot putt is made only ~20% of the time. Focus on speed/distance control from 20–40 feet over reading break perfectly.'
    },
    {
      num: '4',
      title: 'Bogeys with 9i or less in hand',
      detail: 'When you have a scoring club (9-iron or shorter), you simply cannot make bogey. The trap is flag-hunting. Aim at the fat part of the green, take your two-putt, and walk away with par. Birdies will come on their own when you stop trying.'
    },
    {
      num: '5',
      title: 'Two-Chips around the green',
      detail: 'The first priority of any chip is leaving yourself a makeable putt, not holing the chip. That sometimes means aiming away from the flag to a safer area of the green. Two-chip-and-three-putt is a double; one-chip-and-two-putt is a bogey at worst.'
    }
  ];

  const indoorBlocks = [
    { name: 'Warm-up — short wedges', min: 10, detail: 'Short swings, feel, BRTT.' },
    { name: 'Wedge Shots 30–90 yds', min: 30, detail: 'Target distance on every ball. Vary ball position to modulate spin. Block technical + random.' },
    { name: 'Short & Mid Irons 7i–AW', min: 25, detail: 'Maintenance work. Use Trackman feedback for distance and dispersion.' },
    { name: 'Long Game +200 yds', min: 35, detail: '4h → 5w → 3w → Driver. Overkill practice if there\'s a fatal flaw. Creative tinkering: high/low, fade/draw.' },
    { name: 'Pre-Shot Routine + Simulation', min: 20, detail: 'Simulate full holes: driver → iron → wedge. Full pre-shot routine on every ball.' }
  ];

  const outdoorBlocks = [
    { name: 'Warm-up with wedge', min: 5, detail: 'Short swings, feel the tempo, BRTT.' },
    { name: 'Chip & Runs', min: 25, detail: 'Approach wedge as default. Calibrate force with putt-style stroke.' },
    { name: 'Elevated Chip Shot', min: 25, detail: '54° and 58° — calibrate backswing length. Landing-spot drills.' },
    { name: 'Putting — short + long', min: 25, detail: 'Short (3–6 ft) for pressure. Long for distance control.' },
    { name: 'Pre-Shot Routine + Simulation', min: 10, detail: 'Simulate holes. Full pre-shot routine on every putt and chip.' }
  ];

  const updateMantra = (value) => {
    setMantraText(value);
    saveState({ mantraText: value });
  };

  const addLogEntry = () => {
    if (!logForm.areas.trim()) return;
    const newLog = [{ ...logForm, id: Date.now() }, ...practiceLog];
    setPracticeLog(newLog);
    saveState({ practiceLog: newLog });
    setLogForm({
      date: new Date().toISOString().split('T')[0],
      type: 'outdoor', duration: '', areas: '', sensations: '', nextFocus: ''
    });
    setShowLogForm(false);
  };

  const deleteLogEntry = (id) => {
    const newLog = practiceLog.filter(e => e.id !== id);
    setPracticeLog(newLog);
    saveState({ practiceLog: newLog });
  };

  const currentQuote = mantraQuotes[quoteIdx];

  const C = {
    bg: '#0a1612', bg2: '#14241e',
    text: '#e8e3d3', gold: '#d4af37', goldDim: '#9c7e26',
    border: 'rgba(255,255,255,0.08)', panel: 'rgba(255,255,255,0.03)'
  };
  const serif = "'Cormorant Garamond', Georgia, serif";
  const sans = "'Inter', 'Helvetica Neue', sans-serif";

  const goHome = () => { setView('home'); setAreaView(null); setPracticeView(null); setShowWaldron(false); };
  const goBack = () => {
    if (showWaldron) { setShowWaldron(false); return; }
    if (areaView) { setAreaView(null); return; }
    if (practiceView) { setPracticeView(null); return; }
    goHome();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `radial-gradient(ellipse at top, ${C.bg2} 0%, ${C.bg} 65%)`,
      fontFamily: serif, color: C.text,
      padding: '24px 16px 80px', position: 'relative'
    }}>
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
        opacity: 0.04, pointerEvents: 'none', zIndex: 0
      }} />
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: `radial-gradient(circle at 50% 50%, ${C.gold} 0.5px, transparent 0.5px)`,
        backgroundSize: '24px 24px', opacity: 0.025,
        pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{ maxWidth: '780px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {view !== 'home' && (
          <button onClick={goBack} style={{
            background: 'transparent', border: `1px solid ${C.border}`,
            color: C.text, opacity: 0.7,
            padding: '8px 14px', fontFamily: sans,
            fontSize: '11px', letterSpacing: '0.2em',
            textTransform: 'uppercase', cursor: 'pointer',
            borderRadius: '3px', marginBottom: '32px',
            transition: 'all 0.2s'
          }}
            onMouseOver={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.borderColor = C.gold + '60'; }}
            onMouseOut={(e) => { e.currentTarget.style.opacity = 0.7; e.currentTarget.style.borderColor = C.border; }}
          >
            ← Back
          </button>
        )}

        {/* ========== HOME ========== */}
        {view === 'home' && (
          <>
            <header style={{ textAlign: 'center', marginBottom: '52px', marginTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '22px' }}>
                <DecoLine C={C} />
                <div style={{
                  fontSize: '10px', letterSpacing: '0.45em',
                  color: C.gold, fontFamily: sans,
                  textTransform: 'uppercase', whiteSpace: 'nowrap'
                }}>
                  2026 Golf Season
                </div>
                <DecoLine C={C} />
              </div>
              <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'center' }}>
                <FlagIcon C={C} size={42} />
              </div>
              <h1 style={{
                fontSize: 'clamp(38px, 7vw, 56px)', fontWeight: 400,
                margin: 0, fontStyle: 'italic',
                letterSpacing: '-0.025em', lineHeight: 1.05
              }}>
                Happymak's <span style={{ color: C.gold }}>Golf App</span>
              </h1>
              <div style={{
                width: '40px', height: '1px',
                background: C.gold, margin: '28px auto 0'
              }} />
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <HomeCard num="I"   title="My Mantra"            subtitle="Why I play"               iconType="mantra"     C={C} serif={serif} sans={sans} onClick={() => setView('mantra')} />
              <HomeCard num="II"  title="Course Management"    subtitle="DECADE · Tiger Five"      iconType="strategy"   C={C} serif={serif} sans={sans} onClick={() => setView('cm')} />
              <HomeCard num="III" title="Areas of Improvement" subtitle="Q2 2026"                  iconType="growth"     C={C} serif={serif} sans={sans} onClick={() => setView('areas')} />
              <HomeCard num="IV"  title="Practice Sessions"    subtitle="The Power of Six"         iconType="practice"   C={C} serif={serif} sans={sans} onClick={() => setView('practice')} />
              <HomeCard num="V"   title="Latest Golf Round"    subtitle="Score, feel, notes"       iconType="round"      C={C} serif={serif} sans={sans} onClick={() => setView('round')} />
            </div>

            <div style={{
              marginTop: '60px', textAlign: 'center',
              fontFamily: sans, fontSize: '9px',
              letterSpacing: '0.3em', opacity: 0.3,
              textTransform: 'uppercase'
            }}>
              Auto-saved · Happymak's 2026 Golf Season
            </div>
          </>
        )}

        {/* ========== MANTRA ========== */}
        {view === 'mantra' && (
          <SectionHeader num="I" title="My Mantra" subtitle="Why I play" iconType="mantra" C={C} serif={serif} sans={sans}>
            <div style={{ marginBottom: '32px' }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: '12px'
              }}>
                <Label C={C} sans={sans}>My Reflection</Label>
                <button
                  onClick={() => setEditingMantra(!editingMantra)}
                  style={{
                    background: 'transparent', border: 'none',
                    color: C.gold, opacity: 0.6,
                    fontFamily: sans, fontSize: '10px',
                    letterSpacing: '0.2em', textTransform: 'uppercase',
                    cursor: 'pointer', padding: '4px 8px'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.opacity = 1; }}
                  onMouseOut={(e) => { e.currentTarget.style.opacity = 0.6; }}
                >
                  {editingMantra ? '✓ Done' : '✎ Edit'}
                </button>
              </div>
              {editingMantra ? (
                <textarea
                  value={mantraText}
                  onChange={(e) => updateMantra(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%', minHeight: '400px',
                    background: 'rgba(0,0,0,0.25)',
                    border: `1px solid ${C.gold}40`, borderRadius: '4px',
                    padding: '18px 20px', color: C.text,
                    fontFamily: serif, fontSize: '17px',
                    fontStyle: 'italic', lineHeight: 1.7,
                    resize: 'vertical', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              ) : (
                <div style={{
                  fontFamily: serif, fontSize: '17px',
                  fontStyle: 'italic', lineHeight: 1.7,
                  color: C.text, opacity: 0.92,
                  whiteSpace: 'pre-wrap'
                }}>
                  {mantraText || 'No reflection yet. Tap Edit to write one.'}
                </div>
              )}
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.25)',
              borderLeft: `2px solid ${C.gold}`,
              padding: '24px 28px', borderRadius: '2px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute', top: '-8px', right: '20px',
                fontSize: '60px', color: C.gold, opacity: 0.15,
                fontFamily: serif, lineHeight: 1
              }}>"</div>
              <div style={{
                fontSize: '9px', letterSpacing: '0.3em',
                color: C.gold, fontFamily: sans,
                marginBottom: '12px', textTransform: 'uppercase', opacity: 0.7
              }}>
                Quote {quoteIdx + 1} of {mantraQuotes.length}
              </div>
              <div style={{
                fontSize: '22px', fontStyle: 'italic',
                lineHeight: 1.4,
                marginBottom: currentQuote.author ? '10px' : '14px'
              }}>
                "{currentQuote.text}"
              </div>
              {currentQuote.author && (
                <div style={{ fontFamily: sans, fontSize: '11px', opacity: 0.6, letterSpacing: '0.1em' }}>
                  — {currentQuote.author}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', marginTop: '18px' }}>
                <NavButton onClick={() => setQuoteIdx((quoteIdx - 1 + mantraQuotes.length) % mantraQuotes.length)} C={C} sans={sans}>← Prev</NavButton>
                <NavButton onClick={() => setQuoteIdx((quoteIdx + 1) % mantraQuotes.length)} C={C} sans={sans}>Next →</NavButton>
              </div>
            </div>

            {/* Spotify button — straight to Liked Songs */}
            <a
              href="spotify:user:1258984421:collection"
              onClick={(e) => {
                // Fallback to web if app not installed
                setTimeout(() => {
                  window.location.href = 'https://open.spotify.com/collection/tracks';
                }, 500);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginTop: '24px',
                background: 'linear-gradient(135deg, #1db954 0%, #1aa34a 100%)',
                color: '#ffffff',
                padding: '16px 20px',
                borderRadius: '40px',
                textDecoration: 'none',
                fontFamily: sans,
                fontSize: '14px',
                letterSpacing: '0.1em',
                fontWeight: 600,
                boxShadow: '0 4px 18px rgba(29, 185, 84, 0.25)',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 22px rgba(29, 185, 84, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 18px rgba(29, 185, 84, 0.25)';
              }}
            >
              <SpotifyIcon size={22} />
              <span>Open My Spotify · Liked Songs</span>
            </a>
            <div style={{
              textAlign: 'center', marginTop: '10px',
              fontSize: '10px', fontFamily: sans,
              opacity: 0.4, letterSpacing: '0.2em',
              textTransform: 'uppercase'
            }}>
              Time to play
            </div>
          </SectionHeader>
        )}

        {/* ========== AREAS LIST ========== */}
        {view === 'areas' && !areaView && (
          <SectionHeader num="III" title="Areas of Improvement" subtitle="Q2 2026" iconType="growth" C={C} serif={serif} sans={sans}>
            <div style={{
              fontStyle: 'italic', fontSize: '15px',
              textAlign: 'center', opacity: 0.7,
              marginBottom: '28px', padding: '0 12px'
            }}>
              "Lower scores live in the details."
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {areas.map((area) => (
                <div key={area.id} onClick={() => setAreaView(area.id)}
                  style={{
                    background: C.panel,
                    border: `1px solid ${C.border}`,
                    borderRadius: '4px', padding: '16px 18px',
                    cursor: 'pointer', display: 'flex',
                    alignItems: 'center', gap: '14px',
                    transition: 'all 0.25s ease',
                    position: 'relative', overflow: 'hidden'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = area.color + '70';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.transform = 'translateX(2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.background = C.panel;
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: '3px', background: area.color, opacity: 0.7
                  }} />
                  <div style={{
                    fontFamily: sans, fontSize: '10px',
                    color: area.color, width: '24px',
                    textAlign: 'center', opacity: 0.8,
                    letterSpacing: '0.05em', marginLeft: '6px'
                  }}>{area.num}</div>
                  <AreaIcon type={area.icon} color={area.color} size={30} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '18px', fontStyle: 'italic', lineHeight: 1.2 }}>{area.title}</div>
                    <div style={{
                      fontSize: '10px', letterSpacing: '0.2em',
                      textTransform: 'uppercase', opacity: 0.5,
                      fontFamily: sans, marginTop: '4px'
                    }}>{area.subtitle}</div>
                  </div>
                  <div style={{ fontSize: '18px', opacity: 0.3, color: area.color }}>→</div>
                </div>
              ))}
            </div>
          </SectionHeader>
        )}

        {/* ========== AREA DETAIL ========== */}
        {view === 'areas' && areaView && (() => {
          const area = areas.find(a => a.id === areaView);
          return (
            <div style={{ animation: 'fadeIn 0.4s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '6px' }}>
                <div style={{ fontFamily: sans, fontSize: '12px', color: area.color, letterSpacing: '0.15em' }}>{area.num}</div>
                <AreaIcon type={area.icon} color={area.color} size={38} />
                <div style={{
                  fontSize: 'clamp(28px, 5vw, 36px)', fontStyle: 'italic',
                  lineHeight: 1.1, letterSpacing: '-0.01em', flex: 1
                }}>{area.title}</div>
              </div>
              <div style={{
                fontSize: '10px', letterSpacing: '0.3em',
                textTransform: 'uppercase', opacity: 0.5,
                fontFamily: sans, marginLeft: '72px', marginBottom: '28px'
              }}>{area.subtitle}</div>

              <div style={{
                borderLeft: `2px solid ${area.color}`,
                paddingLeft: '18px', marginBottom: '32px',
                fontSize: '17px', fontStyle: 'italic',
                opacity: 0.85, lineHeight: 1.5
              }}>"{area.insight}"</div>

              <div style={{ marginBottom: '24px' }}>
                <Label C={C} sans={sans} color={area.color}>Current Situation</Label>
                <div style={{ fontFamily: sans, fontSize: '15px', fontWeight: 300, lineHeight: 1.6, opacity: 0.92 }}>
                  {area.current}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <Label C={C} sans={sans} color={area.color}>Objective</Label>
                <div style={{ fontFamily: sans, fontSize: '15px', fontWeight: 300, lineHeight: 1.6, opacity: 0.92 }}>
                  {area.objective}
                </div>
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.2)',
                border: `1px solid ${C.border}`,
                borderRadius: '4px', padding: '16px 18px',
                marginTop: '32px'
              }}>
                <Label C={C} sans={sans}>Notes</Label>
                <div style={{ fontFamily: sans, fontSize: '12px', fontWeight: 300, lineHeight: 1.7, opacity: 0.7 }}>
                  {area.notes}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ========== COURSE MANAGEMENT (standalone section) ========== */}
        {view === 'cm' && (
          <SectionHeader num="II" title="Course Management" subtitle="DECADE · Tiger Five" iconType="strategy" C={C} serif={serif} sans={sans}>
            <div style={{
              borderLeft: `2px solid ${C.gold}`,
              paddingLeft: '18px', marginBottom: '32px',
              fontSize: '17px', fontStyle: 'italic',
              opacity: 0.85, lineHeight: 1.5
            }}>
              "Eliminate the bogeys and birdies will take care of themselves."
              <div style={{
                fontFamily: sans, fontSize: '10px', opacity: 0.55,
                letterSpacing: '0.1em', marginTop: '8px', fontStyle: 'normal'
              }}>— Scott Fawcett</div>
            </div>

            {/* Core insight banner — most important */}
            <div style={{
              background: `linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.04) 100%)`,
              border: `1px solid ${C.gold}60`,
              borderRadius: '6px',
              padding: '20px 22px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '9px', letterSpacing: '0.3em',
                textTransform: 'uppercase', color: C.gold,
                fontFamily: sans, marginBottom: '10px', opacity: 0.85
              }}>
                Core Insight
              </div>
              <div style={{
                fontFamily: serif, fontStyle: 'italic',
                fontSize: '17px', lineHeight: 1.5, color: C.text
              }}>
                70–80% of improvement in scoring comes from <span style={{ color: C.gold, fontWeight: 500 }}>avoiding bogeys and worse</span> — not from making more birdies.
              </div>
            </div>

            {/* DECADE expanded explanation */}
            <div style={{
              background: `linear-gradient(135deg, rgba(212,175,55,0.05) 0%, rgba(0,0,0,0.25) 100%)`,
              border: `1px solid ${C.gold}30`,
              borderRadius: '6px', padding: '22px 24px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: '24px', color: C.gold }}>
                  DECADE
                </div>
                <div style={{ height: '1px', flex: 1, background: C.border }} />
                <div style={{
                  fontSize: '9px', letterSpacing: '0.25em',
                  textTransform: 'uppercase', opacity: 0.5,
                  fontFamily: sans
                }}>Scott Fawcett</div>
              </div>
              <div style={{
                fontFamily: sans, fontSize: '13px', fontWeight: 300,
                lineHeight: 1.7, opacity: 0.82
              }}>
                <p style={{ marginTop: 0 }}>
                  Built on PGA Tour data and Mark Broadie's strokes-gained research. Its mission: turn every shot into a statistical decision instead of a feeling.
                </p>
                <p>
                  Fawcett's key framing: <strong style={{ color: C.text }}>your shot dispersion is a shotgun pattern, not a sniper rifle</strong>. The job is to manage that pattern — pick targets that keep the worst possible outcomes safe.
                </p>
                <p style={{ marginBottom: 0 }}>
                  <em>"You gain shots by not losing shots on purpose."</em>
                </p>
              </div>
            </div>

            {/* HOW TO PLAY UNDER DECADE — the practical playbook */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{
                fontSize: '11px', letterSpacing: '0.3em',
                textTransform: 'uppercase', color: C.gold,
                fontFamily: sans, marginBottom: '6px', opacity: 0.85
              }}>
                The Playbook
              </div>
              <div style={{
                fontSize: '24px', fontStyle: 'italic',
                lineHeight: 1.1, marginBottom: '6px'
              }}>
                How to play under DECADE
              </div>
              <div style={{
                fontSize: '10px', letterSpacing: '0.3em',
                textTransform: 'uppercase', opacity: 0.5,
                fontFamily: sans, marginBottom: '22px'
              }}>
                Seven principles · Every shot, every round
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                <DecadePrinciple num="1" title="Aim at the fat part of the green"
                  body="Outside 140 yds, your dispersion is bigger than the green itself. Aiming at the pin is sniper-rifle thinking — you only have a shotgun. Aim at the center, take the 30-foot putt, walk away with par. Birdies will come when you stop chasing them."
                  C={C} serif={serif} sans={sans}
                />
                <DecadePrinciple num="2" title="Manage your shot dispersion off the tee"
                  body="Even Jason Day, #1 strokes-gained off the tee in 2014, had a 74-yard dispersion with driver. You will hit the ball left AND right. Pick a target so that BOTH misses are still in play. Find the widest part of the fairway — aim away from trouble, not at the flag line."
                  C={C} serif={serif} sans={sans}
                />
                <DecadePrinciple num="3" title="Take trouble completely out of play"
                  body="Water, OB, deep bunkers, trees — these are the bogey-makers. Before pulling a club, identify the 'death' spots. If you can't take them out of play with your normal shot, club down or change targets. Rough is fine. Trees and water are not."
                  C={C} serif={serif} sans={sans}
                />
                <DecadePrinciple num="4" title="Club up and swing smooth"
                  body="Don't take just enough club. Take one more and swing controlled. A smooth 7-iron from 150 yds beats a flushed 8-iron — short misses bring front bunkers, water, and short-side trouble into play. Long misses are usually safer than short ones."
                  C={C} serif={serif} sans={sans}
                />
                <DecadePrinciple num="5" title="Play one shot shape"
                  body="99% of amateurs benefit from picking one shape (draw or fade) and using it everywhere. Trying to shape both ways with driver leads to two-way misses and uncommitted swings. Pick yours, commit to it all round, eliminate one side of the course."
                  C={C} serif={serif} sans={sans}
                />
                <DecadePrinciple num="6" title="When in trouble, take your medicine"
                  body="The hero shot through the trees almost never pays. From a bad lie or bad position, your first goal is to get back into play. A simple punch-out sideways into the fairway costs you one stroke — the hero shot costs three. Bogey beats triple every time."
                  C={C} serif={serif} sans={sans}
                />
                <DecadePrinciple num="7" title="Inside 140 yards, attack — selectively"
                  body="Short irons and wedges are the only time DECADE allows flag-hunting — and only when the pin is NOT short-sided. If the pin is tucked behind a bunker or near the edge, still aim at the fat side. With a scoring club in hand, missing in the wrong spot is unforgivable."
                  C={C} serif={serif} sans={sans}
                />

              </div>
            </div>

            {/* Tiger Five */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                marginBottom: '8px'
              }}>
                <TigerIcon C={C} size={28} />
                <div style={{
                  fontSize: '26px', fontStyle: 'italic',
                  letterSpacing: '-0.01em'
                }}>The Tiger Five</div>
              </div>
              <div style={{
                fontSize: '10px', letterSpacing: '0.3em',
                textTransform: 'uppercase', opacity: 0.5,
                fontFamily: sans, marginLeft: '42px', marginBottom: '22px'
              }}>5 round-killing mistakes to avoid</div>
              <div style={{
                fontFamily: sans, fontSize: '13px', fontWeight: 300,
                lineHeight: 1.7, opacity: 0.7, marginBottom: '22px'
              }}>
                Five mistakes Tiger Woods tracked during his 1999 season — when he won 8 of his last 9 events. DECADE adapted them for amateur play. Track them per round; eliminate them; scores drop.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tigerFive.map((t) => (
                  <div key={t.num} style={{
                    background: 'rgba(0,0,0,0.25)',
                    border: `1px solid ${C.border}`,
                    borderRadius: '4px',
                    padding: '16px 18px',
                    display: 'flex', gap: '16px',
                    alignItems: 'flex-start',
                    transition: 'all 0.2s'
                  }}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = C.gold + '40'; }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = C.border; }}
                  >
                    <div style={{
                      fontFamily: serif, fontSize: '36px',
                      fontStyle: 'italic', color: C.gold,
                      opacity: 0.55, lineHeight: 1,
                      width: '36px', textAlign: 'center', flexShrink: 0
                    }}>{t.num}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '16px', fontFamily: serif,
                        fontStyle: 'italic', marginBottom: '6px'
                      }}>{t.title}</div>
                      <div style={{
                        fontFamily: sans, fontSize: '12px',
                        fontWeight: 300, lineHeight: 1.6, opacity: 0.75
                      }}>{t.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionHeader>
        )}

        {/* ========== PRACTICE OVERVIEW ========== */}
        {view === 'practice' && !practiceView && !showWaldron && (
          <SectionHeader num="IV" title="Practice Sessions" subtitle="The Power of Six framework" iconType="practice" C={C} serif={serif} sans={sans}>
            <div style={{
              fontStyle: 'italic', fontSize: '15px',
              textAlign: 'center', opacity: 0.7, marginBottom: '14px'
            }}>"Practice makes consistent."</div>

            <div style={{
              fontSize: '12px', fontFamily: sans,
              fontWeight: 300, opacity: 0.55,
              textAlign: 'center', marginBottom: '32px',
              padding: '0 8px', lineHeight: 1.6
            }}>
              Practice ≠ hitting balls. Clear objective, feedback, intentional repetition.
              <br />
              <span style={{ opacity: 0.7 }}>— Jim Waldron, Power of Six</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <PracticeCard tag="4.1" title="Weekly Calendar"  badge="2 sessions / week"   iconType="calendar" C={C} serif={serif} sans={sans} onClick={() => setPracticeView('calendar')} />
              <PracticeCard tag="4.2" title="Indoor Session"   badge="120 min · Trackman"  iconType="indoor"   C={C} serif={serif} sans={sans} onClick={() => setPracticeView('indoor')} />
              <PracticeCard tag="4.3" title="Outdoor Session"  badge="90 min · Short game" iconType="outdoor"  C={C} serif={serif} sans={sans} onClick={() => setPracticeView('outdoor')} />
              <PracticeCard tag="4.4" title="Practice Log"     badge={`${practiceLog.length} ${practiceLog.length === 1 ? 'entry' : 'entries'}`} iconType="log" C={C} serif={serif} sans={sans} onClick={() => setPracticeView('log')} />
            </div>

            <div
              onClick={() => setShowWaldron(true)}
              style={{
                marginTop: '24px',
                background: `linear-gradient(135deg, rgba(212,175,55,0.05) 0%, rgba(0,0,0,0.25) 100%)`,
                border: `1px solid ${C.gold}30`,
                borderRadius: '6px', padding: '20px 22px',
                cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: '14px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = C.gold + '60';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = C.gold + '30';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <BookIcon C={C} size={24} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '9px', letterSpacing: '0.3em',
                  textTransform: 'uppercase', color: C.gold,
                  fontFamily: sans, opacity: 0.7, marginBottom: '4px'
                }}>Method</div>
                <div style={{ fontSize: '17px', fontFamily: serif, fontStyle: 'italic' }}>
                  Waldron Practice Concepts
                </div>
              </div>
              <div style={{ fontSize: '16px', opacity: 0.4, color: C.gold }}>→</div>
            </div>
          </SectionHeader>
        )}

        {/* ========== WALDRON DETAIL ========== */}
        {view === 'practice' && showWaldron && (
          <div style={{ animation: 'fadeIn 0.4s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '6px' }}>
              <BookIcon C={C} size={36} />
              <div style={{
                fontSize: 'clamp(28px, 5vw, 36px)', fontStyle: 'italic',
                lineHeight: 1.1, letterSpacing: '-0.01em', flex: 1
              }}>Waldron Concepts</div>
            </div>
            <div style={{
              fontSize: '10px', letterSpacing: '0.3em',
              textTransform: 'uppercase', opacity: 0.5,
              fontFamily: sans, marginLeft: '52px', marginBottom: '36px'
            }}>Three pillars of intentional practice</div>

            <ConceptBlock C={C} serif={serif} sans={sans}
              title="BRTT" subtitle="Balance · Rhythm · Tempo · Timing"
              tag="Concept 01"
            >
              <p>The four physical fundamentals of a repeatable swing. Not "technique" (not wrist angle, not swing plane) — they are <strong>how the movement feels</strong>.</p>
              <ul style={ulStyle}>
                <li><strong>Balance</strong> — finish the swing standing still, no falling forward or back. If you can't hold the finish, something in the motion was aggressive or unbalanced.</li>
                <li><strong>Rhythm</strong> — fluidity of the full motion, with no abrupt "sections". Like a pendulum: one continuous piece.</li>
                <li><strong>Tempo</strong> — the <em>relative speed</em> between backswing and downswing. Tour average is <strong>3:1</strong> (backswing 3× slower than downswing). Most amateurs are 2:1 or even 1.5:1 — far too quick on the way back.</li>
                <li><strong>Timing</strong> — synchronization of the <em>wrist release</em>. Wrists unhinge at the right moment in the downswing — not early (casting = loss of power) and not late (flipping = loss of control).</li>
              </ul>
              <p style={{ marginTop: '12px' }}><strong style={{ color: C.gold }}>How to apply it:</strong> through the entire session, on every ball, ask yourself: Am I balanced at finish? Was it fluid? Was the backswing slow enough? Did I release on time? It's not a drill — it's a constant mental check.</p>
            </ConceptBlock>

            <ConceptBlock C={C} serif={serif} sans={sans}
              title="Overkill Practice" subtitle="Fixing the fatal flaw"
              tag="Concept 02"
            >
              <p>The method to fix a <em>recurring</em> error — what Waldron calls a "fatal flaw".</p>
              <p><strong>Why normal practice doesn't work:</strong> if you have an error encoded in your motor system (e.g. always opening the face at impact), hitting 20 balls mixed with other clubs won't break the pattern. The brain reverts to the old groove every time.</p>
              <p><strong>How Overkill works:</strong></p>
              <ol style={olStyle}>
                <li>Identify ONE specific error (one only, not several)</li>
                <li>Pick ONE club (the one that most exhibits the error)</li>
                <li>Hit <strong>50–100 balls in a row</strong>, no mixing, focusing only on correcting that error</li>
                <li>Repeat across sessions until the new pattern becomes automatic</li>
              </ol>
              <p><strong>Why so many balls:</strong> the brain builds <em>neural pathways</em>. To erase an old one and build a new one you need <strong>massive concentrated repetition</strong>, not scattered practice.</p>
              <p><strong style={{ color: C.gold }}>When to use it:</strong> only for big errors that cost real strokes. Don't use it for "fine-tuning" — that's the job of normal block practice.</p>
            </ConceptBlock>

            <ConceptBlock C={C} serif={serif} sans={sans}
              title="Creative Tinkering" subtitle="Play, don't think"
              tag="Concept 03"
            >
              <p>The <strong>opposite</strong> of Overkill. Here you <strong>don't think about technique</strong> — you play with the ball.</p>
              <p><strong>How it works:</strong></p>
              <ul style={ulStyle}>
                <li>Pick one club (say, 7-iron)</li>
                <li>Hit balls trying to do different things: one high, one low, a fade, a draw, a low push-cut, a high straight short one...</li>
                <li>The technical result doesn't matter — what matters is <strong>exploring control</strong></li>
              </ul>
              <p><strong>Why it works:</strong></p>
              <ul style={ulStyle}>
                <li>Develops feel (sensitivity to the clubhead, the face, the speed)</li>
                <li>Teaches you that you have more control than you think</li>
                <li>Builds confidence for the strange shots you'll need on course (low under trees, high over bunkers)</li>
              </ul>
              <p><strong style={{ color: C.gold }}>When to use it:</strong> after a heavy technical block to "loosen" the mind. Or when you feel too mechanical and need to reconnect with feel.</p>
            </ConceptBlock>
          </div>
        )}

        {/* ========== CALENDAR ========== */}
        {view === 'practice' && practiceView === 'calendar' && (
          <SubSectionHeader title="Weekly Calendar" tag="4.1" iconType="calendar" C={C} serif={serif} sans={sans}>
            <div style={{
              fontSize: '13px', fontFamily: sans,
              fontWeight: 300, opacity: 0.7,
              marginBottom: '20px', lineHeight: 1.6
            }}>
              Two sessions per week: one Indoor + one Outdoor. The day for each is flexible — adjust to your schedule.
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px', marginBottom: '24px'
            }}>
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day) => (
                <div key={day} style={{
                  padding: '14px 4px', textAlign: 'center',
                  background: 'rgba(0,0,0,0.2)',
                  border: `1px solid ${C.border}`,
                  borderRadius: '3px', fontFamily: sans
                }}>
                  <div style={{ fontSize: '10px', opacity: 0.5, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{day}</div>
                  <div style={{ fontSize: '14px', marginTop: '8px', color: C.gold, opacity: 0.4 }}>—</div>
                </div>
              ))}
            </div>
            <div style={{
              display: 'flex', gap: '14px', justifyContent: 'center',
              fontSize: '12px', fontFamily: sans, opacity: 0.7
            }}>
              <span>🏠 Indoor · 120 min</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>⛳ Outdoor · 90 min</span>
            </div>
          </SubSectionHeader>
        )}

        {view === 'practice' && practiceView === 'indoor' && (
          <SubSectionHeader title="Indoor Session" tag="4.2" badge="120 min · Trackman" iconType="indoor" C={C} serif={serif} sans={sans}>
            <SessionPanel blocks={indoorBlocks} C={C} sans={sans} serif={serif} totalMin={120} sessionName="Indoor" />
          </SubSectionHeader>
        )}

        {view === 'practice' && practiceView === 'outdoor' && (
          <SubSectionHeader title="Outdoor Session" tag="4.3" badge="90 min · Short game focus" iconType="outdoor" C={C} serif={serif} sans={sans}>
            <SessionPanel blocks={outdoorBlocks} C={C} sans={sans} serif={serif} totalMin={90} sessionName="Outdoor" />
          </SubSectionHeader>
        )}

        {view === 'practice' && practiceView === 'log' && (
          <SubSectionHeader title="Practice Log" tag="4.4" badge={`${practiceLog.length} ${practiceLog.length === 1 ? 'entry' : 'entries'}`} iconType="log" C={C} serif={serif} sans={sans}>
            {!showLogForm ? (
              <button onClick={() => setShowLogForm(true)} style={{
                width: '100%', background: 'transparent',
                border: `1px dashed ${C.gold}50`,
                color: C.gold, padding: '14px',
                fontFamily: sans, fontSize: '12px',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                cursor: 'pointer', borderRadius: '4px',
                marginBottom: '20px', transition: 'all 0.2s'
              }}
                onMouseOver={(e) => { e.currentTarget.style.background = C.gold + '10'; e.currentTarget.style.borderColor = C.gold; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = C.gold + '50'; }}
              >+ Log a session</button>
            ) : (
              <div style={{
                background: 'rgba(0,0,0,0.25)',
                border: `1px solid ${C.gold}40`,
                borderRadius: '4px', padding: '18px',
                marginBottom: '20px',
                display: 'flex', flexDirection: 'column', gap: '12px'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <Label C={C} sans={sans}>Date</Label>
                    <input type="date" value={logForm.date}
                      onChange={(e) => setLogForm({...logForm, date: e.target.value})}
                      style={inputStyle(C, sans)} />
                  </div>
                  <div>
                    <Label C={C} sans={sans}>Type</Label>
                    <select value={logForm.type}
                      onChange={(e) => setLogForm({...logForm, type: e.target.value})}
                      style={inputStyle(C, sans)}>
                      <option value="outdoor">⛳ Outdoor</option>
                      <option value="indoor">🏠 Indoor</option>
                      <option value="round">🏌️ Round</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label C={C} sans={sans}>Duration (min)</Label>
                  <input type="number" value={logForm.duration}
                    onChange={(e) => setLogForm({...logForm, duration: e.target.value})}
                    placeholder="90" style={inputStyle(C, sans)} />
                </div>
                <div>
                  <Label C={C} sans={sans}>Areas worked</Label>
                  <input type="text" value={logForm.areas}
                    onChange={(e) => setLogForm({...logForm, areas: e.target.value})}
                    placeholder="Chip & runs, putting, pre-shot routine..."
                    style={inputStyle(C, sans)} />
                </div>
                <div>
                  <Label C={C} sans={sans}>Sensations / observations</Label>
                  <textarea value={logForm.sensations}
                    onChange={(e) => setLogForm({...logForm, sensations: e.target.value})}
                    placeholder="How did it feel? What worked? What didn't?"
                    style={{...inputStyle(C, sans), minHeight: '70px', resize: 'vertical'}} />
                </div>
                <div>
                  <Label C={C} sans={sans}>Next focus</Label>
                  <input type="text" value={logForm.nextFocus}
                    onChange={(e) => setLogForm({...logForm, nextFocus: e.target.value})}
                    placeholder="What to work on next session?"
                    style={inputStyle(C, sans)} />
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button onClick={addLogEntry} style={{
                    flex: 1, background: C.gold, border: 'none',
                    color: C.bg, padding: '11px',
                    fontFamily: sans, fontSize: '11px',
                    letterSpacing: '0.2em', textTransform: 'uppercase',
                    fontWeight: 600, cursor: 'pointer', borderRadius: '3px'
                  }}>Save</button>
                  <button onClick={() => setShowLogForm(false)} style={{
                    background: 'transparent',
                    border: `1px solid ${C.border}`,
                    color: C.text, padding: '11px 18px',
                    fontFamily: sans, fontSize: '11px',
                    letterSpacing: '0.2em', textTransform: 'uppercase',
                    cursor: 'pointer', borderRadius: '3px', opacity: 0.6
                  }}>Cancel</button>
                </div>
              </div>
            )}

            {practiceLog.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '32px',
                fontSize: '13px', fontFamily: sans,
                opacity: 0.4, fontStyle: 'italic'
              }}>No sessions logged yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {practiceLog.map(entry => (
                  <div key={entry.id} style={{
                    background: 'rgba(0,0,0,0.2)',
                    border: `1px solid ${C.border}`,
                    borderRadius: '4px', padding: '14px 16px',
                    position: 'relative'
                  }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'baseline', marginBottom: '8px'
                    }}>
                      <div style={{
                        fontFamily: sans, fontSize: '10px',
                        letterSpacing: '0.2em', textTransform: 'uppercase',
                        color: C.gold, opacity: 0.8
                      }}>
                        {entry.type === 'outdoor' ? '⛳ Outdoor' : entry.type === 'indoor' ? '🏠 Indoor' : '🏌️ Round'}
                        {entry.duration && ` · ${entry.duration} min`}
                      </div>
                      <div style={{ fontFamily: sans, fontSize: '11px', opacity: 0.5 }}>
                        {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    {entry.areas && <div style={{ fontFamily: sans, fontSize: '13px', marginBottom: '6px', fontWeight: 400 }}>{entry.areas}</div>}
                    {entry.sensations && (
                      <div style={{ fontFamily: sans, fontSize: '12px', opacity: 0.7, fontWeight: 300, lineHeight: 1.5, marginBottom: '6px' }}>
                        {entry.sensations}
                      </div>
                    )}
                    {entry.nextFocus && (
                      <div style={{
                        fontFamily: sans, fontSize: '11px', opacity: 0.55,
                        fontStyle: 'italic', borderTop: `1px solid ${C.border}`,
                        paddingTop: '6px', marginTop: '8px'
                      }}>→ {entry.nextFocus}</div>
                    )}
                    <button onClick={() => deleteLogEntry(entry.id)} style={{
                      position: 'absolute', top: '10px', right: '10px',
                      background: 'transparent', border: 'none',
                      color: C.text, opacity: 0.25,
                      cursor: 'pointer', fontSize: '14px', padding: '2px 6px'
                    }} title="Delete">×</button>
                  </div>
                ))}
              </div>
            )}
          </SubSectionHeader>
        )}

        {/* ========== ROUND ========== */}
        {view === 'round' && (
          <SectionHeader num="V" title="Latest Golf Round" subtitle="Score, feel, notes" iconType="round" C={C} serif={serif} sans={sans}>

            {/* Header card with course, date, scores */}
            <div style={{
              background: `linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(0,0,0,0.35) 100%)`,
              border: `1px solid ${C.gold}40`,
              borderRadius: '6px',
              padding: '22px 24px',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: '10px', letterSpacing: '0.3em',
                color: C.gold, fontFamily: sans,
                textTransform: 'uppercase', opacity: 0.8, marginBottom: '8px'
              }}>
                May 13, 2026
              </div>
              <div style={{
                fontSize: '22px', fontStyle: 'italic',
                fontFamily: serif, lineHeight: 1.2, marginBottom: '4px'
              }}>
                Miami Beach Golf Club
              </div>
              <div style={{
                fontFamily: sans, fontSize: '11px',
                opacity: 0.55, letterSpacing: '0.05em', marginBottom: '20px'
              }}>
                Blue tees · 6,430 yds · Rating 138 / Par 72 · Course handicap 19
              </div>

              {/* Scores grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                paddingTop: '6px',
                borderTop: `1px solid ${C.border}`
              }}>
                <div>
                  <div style={{
                    fontSize: '9px', letterSpacing: '0.25em',
                    textTransform: 'uppercase', opacity: 0.5,
                    fontFamily: sans, marginBottom: '4px'
                  }}>Gross</div>
                  <div style={{
                    fontSize: '32px', fontFamily: serif,
                    fontStyle: 'italic', color: C.text, lineHeight: 1
                  }}>102</div>
                </div>
                <div>
                  <div style={{
                    fontSize: '9px', letterSpacing: '0.25em',
                    textTransform: 'uppercase', opacity: 0.5,
                    fontFamily: sans, marginBottom: '4px'
                  }}>Net</div>
                  <div style={{
                    fontSize: '32px', fontFamily: serif,
                    fontStyle: 'italic', color: C.gold, lineHeight: 1
                  }}>83</div>
                </div>
                <div>
                  <div style={{
                    fontSize: '9px', letterSpacing: '0.25em',
                    textTransform: 'uppercase', opacity: 0.5,
                    fontFamily: sans, marginBottom: '4px'
                  }}>Diff.</div>
                  <div style={{
                    fontSize: '32px', fontFamily: serif,
                    fontStyle: 'italic', opacity: 0.65, lineHeight: 1
                  }}>23.6</div>
                </div>
              </div>
            </div>

            {/* Hole-by-hole scorecard */}
            <div style={{
              background: 'rgba(0,0,0,0.25)',
              border: `1px solid ${C.border}`,
              borderRadius: '6px',
              padding: '18px 16px',
              marginBottom: '20px',
              overflowX: 'auto'
            }}>
              <div style={{
                fontSize: '9px', letterSpacing: '0.3em',
                textTransform: 'uppercase', color: C.gold,
                fontFamily: sans, marginBottom: '14px', opacity: 0.75
              }}>
                Scorecard
              </div>
              <Scorecard
                holes={[1,2,3,4,5,6,7,8,9]}
                pars={[5,4,3,4,5,3,4,4,3]}
                scores={[8,5,5,7,4,3,8,5,4]}
                label="OUT"
                total={49}
                totalPar={35}
                C={C} sans={sans} serif={serif}
              />
              <div style={{ height: '12px' }} />
              <Scorecard
                holes={[10,11,12,13,14,15,16,17,18]}
                pars={[5,4,5,4,3,5,4,3,4]}
                scores={[8,6,7,6,6,7,4,4,5]}
                label="IN"
                total={53}
                totalPar={37}
                C={C} sans={sans} serif={serif}
              />
            </div>

            {/* Performance stats */}
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              border: `1px solid ${C.border}`,
              borderRadius: '6px',
              padding: '18px 20px',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: '9px', letterSpacing: '0.3em',
                textTransform: 'uppercase', color: C.gold,
                fontFamily: sans, marginBottom: '14px', opacity: 0.75
              }}>
                Performance
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px 24px',
                fontFamily: sans, fontSize: '12px'
              }}>
                <StatRow label="Tee accuracy" value="61%" sub="89% out · 33% in" C={C} sans={sans} />
                <StatRow label="Greens in regulation" value="22%" sub="4 of 18" C={C} sans={sans} />
                <StatRow label="Putts" value="34" sub="16 out · 18 in" C={C} sans={sans} />
                <StatRow label="Grints (scrambling)" value="17%" sub="3 of 18" C={C} sans={sans} />
                <StatRow label="Par saves" value="33%" sub="1 of 3" C={C} sans={sans} />
                <StatRow label="Penalties" value="8.5" sub="5W + 3W + 0.5D" C={C} sans={sans} />
              </div>
            </div>

            {/* Takeaways */}
            <div style={{
              background: `linear-gradient(135deg, rgba(212,175,55,0.05) 0%, rgba(0,0,0,0.25) 100%)`,
              border: `1px solid ${C.gold}30`,
              borderRadius: '6px',
              padding: '22px 24px',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: '9px', letterSpacing: '0.3em',
                textTransform: 'uppercase', color: C.gold,
                fontFamily: sans, marginBottom: '14px', opacity: 0.75
              }}>
                Reading the Round
              </div>
              <div style={{
                fontFamily: sans, fontSize: '13px',
                fontWeight: 300, lineHeight: 1.7, opacity: 0.85
              }}>
                <p style={{ marginTop: 0 }}>
                  Front nine (49) much stronger than the back (53). The back fell apart with three 6s and a 7 in five holes — a stretch of compounding mistakes that DECADE would call avoidable.
                </p>
                <p>
                  Tee accuracy dropped from <strong style={{ color: C.text }}>89% out → 33% in</strong>. The driver was the leak: 8 misses on the back including the closing tee shot. This matches the Q2 area of improvement — recover driver consistency.
                </p>
                <p>
                  <strong style={{ color: C.text }}>The Tiger Five count:</strong> 4 double bogeys (holes 1, 7, 10, 12+15+16 territory), a triple on hole 12, plus penalties on 7 holes. Eliminating the doubles alone would have put the round in the mid-90s.
                </p>
                <p style={{ marginBottom: 0 }}>
                  <strong style={{ color: C.gold }}>Best moment:</strong> hole 6 — par 3, scrambled for par from green-side trouble. Proof the short game holds up when the driver doesn't.
                </p>
              </div>
            </div>

            {/* Focus for next round */}
            <div style={{
              background: 'rgba(0,0,0,0.25)',
              border: `1px solid ${C.gold}40`,
              borderRadius: '6px',
              padding: '20px 22px'
            }}>
              <div style={{
                fontSize: '9px', letterSpacing: '0.3em',
                textTransform: 'uppercase', color: C.gold,
                fontFamily: sans, marginBottom: '12px', opacity: 0.85
              }}>
                Focus for next round
              </div>
              <ul style={{
                fontFamily: sans, fontSize: '13px',
                fontWeight: 300, lineHeight: 1.8, opacity: 0.88,
                paddingLeft: '18px', margin: 0
              }}>
                <li>Driver: shorter backswing, aim for the fat part of the fairway — penalty shots are killing rounds.</li>
                <li>Trouble management: take medicine when off the fairway. No hero shots on the back nine.</li>
                <li>Pre-shot routine on every tee — the inconsistency back nine looks like tempo collapsing under pressure.</li>
                <li>Wedges from new distance system (30–65 → 58° / 65–85 → 54° / 85–110 → A) should turn doubles into bogeys.</li>
              </ul>
            </div>

          </SectionHeader>
        )}

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        body { margin: 0; background: ${C.bg}; }
        textarea:focus, input:focus, select:focus { border-color: ${C.gold}50 !important; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.7); cursor: pointer; }
      `}</style>
    </div>
  );
}

// ============ SUBCOMPONENTS ============

const ulStyle = { fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 300, lineHeight: 1.7, opacity: 0.85, paddingLeft: '18px', margin: '8px 0' };
const olStyle = { fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 300, lineHeight: 1.7, opacity: 0.85, paddingLeft: '18px', margin: '8px 0' };

function Scorecard({ holes, pars, scores, label, total, totalPar, C, sans, serif }) {
  const scoreColor = (score, par) => {
    const diff = score - par;
    if (diff <= -2) return '#d4af37'; // eagle+
    if (diff === -1) return '#e07856'; // birdie
    if (diff === 0) return '#6a9955';  // par
    if (diff === 1) return '#4a7c8c';  // bogey
    if (diff === 2) return '#8b6db5';  // double
    return '#c97064';                  // triple+
  };

  return (
    <div style={{ minWidth: '480px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `60px repeat(${holes.length}, 1fr) 60px`,
        gap: '4px',
        alignItems: 'center'
      }}>
        <div style={{
          fontFamily: sans, fontSize: '9px',
          letterSpacing: '0.15em', opacity: 0.5,
          textTransform: 'uppercase'
        }}>Hole</div>
        {holes.map(h => (
          <div key={h} style={{
            fontFamily: sans, fontSize: '11px',
            textAlign: 'center', opacity: 0.6
          }}>{h}</div>
        ))}
        <div style={{
          fontFamily: sans, fontSize: '9px',
          letterSpacing: '0.15em', opacity: 0.55,
          textAlign: 'right', textTransform: 'uppercase'
        }}>{label}</div>

        <div style={{
          fontFamily: sans, fontSize: '9px',
          letterSpacing: '0.15em', opacity: 0.5,
          textTransform: 'uppercase'
        }}>Par</div>
        {pars.map((p, i) => (
          <div key={i} style={{
            fontFamily: sans, fontSize: '12px',
            textAlign: 'center', opacity: 0.75
          }}>{p}</div>
        ))}
        <div style={{
          fontFamily: sans, fontSize: '12px',
          opacity: 0.75, textAlign: 'right'
        }}>{totalPar}</div>

        <div style={{
          fontFamily: sans, fontSize: '9px',
          letterSpacing: '0.15em', color: C.gold,
          textTransform: 'uppercase', opacity: 0.8
        }}>Score</div>
        {scores.map((s, i) => (
          <div key={i} style={{
            fontFamily: serif, fontSize: '15px',
            fontWeight: 500, fontStyle: 'italic',
            textAlign: 'center', color: scoreColor(s, pars[i]),
            padding: '2px 0'
          }}>{s}</div>
        ))}
        <div style={{
          fontFamily: serif, fontSize: '17px',
          fontWeight: 500, fontStyle: 'italic',
          color: C.gold, textAlign: 'right'
        }}>{total}</div>
      </div>
    </div>
  );
}

function StatRow({ label, value, sub, C, sans }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      gap: '2px', padding: '8px 0'
    }}>
      <div style={{
        fontSize: '10px', letterSpacing: '0.15em',
        textTransform: 'uppercase', opacity: 0.55,
        fontFamily: sans
      }}>{label}</div>
      <div style={{
        fontFamily: sans, fontSize: '20px',
        fontWeight: 300, color: C.gold,
        letterSpacing: '-0.01em'
      }}>{value}</div>
      {sub && (
        <div style={{
          fontFamily: sans, fontSize: '10px',
          opacity: 0.45, letterSpacing: '0.05em'
        }}>{sub}</div>
      )}
    </div>
  );
}

function DecadePrinciple({ num, title, body, C, serif, sans }) {
  return (
    <div style={{
      background: 'rgba(0,0,0,0.22)',
      border: `1px solid ${C.border}`,
      borderRadius: '4px',
      padding: '16px 18px',
      display: 'flex',
      gap: '16px',
      alignItems: 'flex-start',
      transition: 'all 0.2s'
    }}
      onMouseOver={(e) => { e.currentTarget.style.borderColor = C.gold + '40'; }}
      onMouseOut={(e) => { e.currentTarget.style.borderColor = C.border; }}
    >
      <div style={{
        fontFamily: serif, fontSize: '32px',
        fontStyle: 'italic', color: C.gold,
        opacity: 0.6, lineHeight: 1,
        width: '32px', textAlign: 'center', flexShrink: 0
      }}>{num}</div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '15px', fontFamily: serif,
          fontStyle: 'italic', marginBottom: '6px',
          lineHeight: 1.3
        }}>{title}</div>
        <div style={{
          fontFamily: sans, fontSize: '12px',
          fontWeight: 300, lineHeight: 1.6, opacity: 0.75
        }}>{body}</div>
      </div>
    </div>
  );
}

function ConceptBlock({ title, subtitle, tag, children, C, serif, sans }) {
  return (
    <div style={{
      background: 'rgba(0,0,0,0.2)',
      border: `1px solid ${C.border}`,
      borderRadius: '6px', padding: '24px 26px', marginBottom: '14px'
    }}>
      <div style={{
        fontSize: '9px', letterSpacing: '0.3em',
        textTransform: 'uppercase', color: C.gold,
        fontFamily: sans, marginBottom: '8px', opacity: 0.7
      }}>{tag}</div>
      <div style={{ fontSize: '26px', fontStyle: 'italic', fontFamily: serif, lineHeight: 1.1, marginBottom: '4px' }}>{title}</div>
      <div style={{
        fontSize: '10px', letterSpacing: '0.25em',
        textTransform: 'uppercase', opacity: 0.5,
        fontFamily: sans, marginBottom: '18px'
      }}>{subtitle}</div>
      <div style={{ fontFamily: sans, fontSize: '13px', fontWeight: 300, lineHeight: 1.7, opacity: 0.82 }}>
        {children}
      </div>
    </div>
  );
}

function HomeCard({ num, title, subtitle, iconType, C, serif, sans, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'rgba(255,255,255,0.025)',
      border: `1px solid ${C.border}`,
      borderRadius: '6px', padding: '24px 26px',
      cursor: 'pointer', display: 'flex',
      alignItems: 'center', gap: '20px',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(8px)',
      position: 'relative', overflow: 'hidden'
    }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = C.gold + '50';
        e.currentTarget.style.background = 'rgba(255,255,255,0.045)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.background = 'rgba(255,255,255,0.025)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{
        fontFamily: serif, fontSize: '24px',
        fontStyle: 'italic', color: C.gold,
        opacity: 0.75, width: '36px', textAlign: 'center'
      }}>{num}</div>
      <SectionIcon type={iconType} color={C.gold} size={30} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '24px', fontStyle: 'italic', letterSpacing: '-0.01em', lineHeight: 1.1 }}>{title}</div>
        <div style={{
          fontSize: '10px', letterSpacing: '0.3em',
          textTransform: 'uppercase', opacity: 0.5,
          fontFamily: sans, marginTop: '6px'
        }}>{subtitle}</div>
      </div>
      <div style={{ fontSize: '20px', opacity: 0.35, color: C.gold }}>→</div>
    </div>
  );
}

function SectionHeader({ num, title, subtitle, iconType, children, C, serif, sans }) {
  return (
    <div style={{ animation: 'fadeIn 0.4s' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '6px' }}>
          <div style={{ fontFamily: serif, fontSize: '20px', fontStyle: 'italic', color: C.gold, opacity: 0.7 }}>{num}</div>
          {iconType && <SectionIcon type={iconType} color={C.gold} size={34} />}
          <div style={{
            fontSize: 'clamp(32px, 6vw, 44px)',
            fontStyle: 'italic', lineHeight: 1.05,
            letterSpacing: '-0.02em', flex: 1
          }}>{title}</div>
        </div>
        <div style={{
          fontSize: '10px', letterSpacing: '0.3em',
          textTransform: 'uppercase', opacity: 0.5,
          fontFamily: sans, marginLeft: '34px'
        }}>{subtitle}</div>
        <div style={{ width: '40px', height: '1px', background: C.gold, marginTop: '20px', opacity: 0.5 }} />
      </div>
      {children}
    </div>
  );
}

function SubSectionHeader({ title, tag, badge, iconType, children, C, serif, sans }) {
  return (
    <div style={{ animation: 'fadeIn 0.4s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
        <div style={{ fontFamily: sans, fontSize: '11px', color: C.gold, opacity: 0.7, letterSpacing: '0.05em' }}>{tag}</div>
        {iconType && <SectionIcon type={iconType} color={C.gold} size={24} />}
        <div style={{ fontSize: '28px', fontStyle: 'italic', lineHeight: 1.05 }}>{title}</div>
      </div>
      {badge && (
        <div style={{
          fontSize: '10px', letterSpacing: '0.25em',
          textTransform: 'uppercase', opacity: 0.5,
          fontFamily: sans, marginLeft: '32px'
        }}>{badge}</div>
      )}
      <div style={{ width: '32px', height: '1px', background: C.gold, marginTop: '20px', opacity: 0.4, marginBottom: '24px' }} />
      {children}
    </div>
  );
}

function PracticeCard({ tag, title, badge, iconType, C, serif, sans, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'rgba(0,0,0,0.15)',
      border: `1px solid ${C.border}`,
      borderRadius: '4px', padding: '16px 18px',
      cursor: 'pointer', display: 'flex',
      alignItems: 'center', gap: '12px',
      transition: 'all 0.2s'
    }}
      onMouseOver={(e) => { e.currentTarget.style.borderColor = C.gold + '40'; e.currentTarget.style.background = 'rgba(0,0,0,0.25)'; }}
      onMouseOut={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = 'rgba(0,0,0,0.15)'; }}
    >
      <div style={{ fontFamily: sans, fontSize: '10px', color: C.gold, opacity: 0.6, width: '28px', letterSpacing: '0.05em' }}>{tag}</div>
      {iconType && <SectionIcon type={iconType} color={C.gold} size={22} />}
      <div style={{ flex: 1, fontSize: '17px', fontStyle: 'italic', fontFamily: serif }}>{title}</div>
      {badge && <div style={{ fontFamily: sans, fontSize: '10px', opacity: 0.55, letterSpacing: '0.05em' }}>{badge}</div>}
      <div style={{ fontSize: '16px', opacity: 0.3 }}>→</div>
    </div>
  );
}

function SessionPanel({ blocks, C, sans, serif, totalMin, sessionName }) {
  const [currentBlock, setCurrentBlock] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(blocks[0].min * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      [0, 0.18, 0.36].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + delay + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.5);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.5);
      });
    } catch (e) {}
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    }
  };

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          playBeep();
          if (currentBlock < blocks.length - 1) {
            setCurrentBlock(currentBlock + 1);
            return blocks[currentBlock + 1].min * 60;
          } else {
            setIsRunning(false);
            setCompleted(true);
            return 0;
          }
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, currentBlock, blocks]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const reset = () => {
    setIsRunning(false);
    setCurrentBlock(0);
    setSecondsLeft(blocks[0].min * 60);
    setCompleted(false);
  };

  const skip = () => {
    playBeep();
    if (currentBlock < blocks.length - 1) {
      setCurrentBlock(currentBlock + 1);
      setSecondsLeft(blocks[currentBlock + 1].min * 60);
    } else {
      setIsRunning(false);
      setCompleted(true);
      setSecondsLeft(0);
    }
  };

  const jumpToBlock = (idx) => {
    setCurrentBlock(idx);
    setSecondsLeft(blocks[idx].min * 60);
    setCompleted(false);
  };

  const adjustSeconds = (delta) => {
    setSecondsLeft((s) => Math.max(0, Math.min(blocks[currentBlock].min * 60, s + delta)));
  };

  const totalDoneSeconds = blocks.slice(0, currentBlock).reduce((sum, b) => sum + b.min * 60, 0)
    + (blocks[currentBlock].min * 60 - secondsLeft);
  const totalSeconds = totalMin * 60;
  const overallPct = (totalDoneSeconds / totalSeconds) * 100;

  return (
    <>
      {/* ===== TIMER ===== */}
      <div style={{
        background: `linear-gradient(135deg, rgba(212,175,55,0.06) 0%, rgba(0,0,0,0.35) 100%)`,
        border: `1px solid ${C.gold}40`,
        borderRadius: '6px',
        padding: '22px 22px 20px',
        marginBottom: '20px'
      }}>
        <div style={{
          fontSize: '9px', letterSpacing: '0.3em',
          textTransform: 'uppercase', color: C.gold,
          fontFamily: sans, marginBottom: '12px', opacity: 0.75
        }}>
          Session Timer · {sessionName}
        </div>

        {completed ? (
          <div style={{ textAlign: 'center', padding: '18px 0' }}>
            <div style={{
              fontSize: '24px', fontStyle: 'italic',
              fontFamily: serif, marginBottom: '8px', color: C.gold
            }}>
              Session complete
            </div>
            <div style={{
              fontFamily: sans, fontSize: '12px',
              opacity: 0.6, marginBottom: '16px'
            }}>
              Good work — log it in Practice Log
            </div>
            <button onClick={reset} style={{
              background: 'transparent', border: `1px solid ${C.border}`,
              color: C.text, opacity: 0.7,
              padding: '8px 16px', fontFamily: sans,
              fontSize: '10px', letterSpacing: '0.2em',
              textTransform: 'uppercase', cursor: 'pointer',
              borderRadius: '3px'
            }}>Reset</button>
          </div>
        ) : (
          <>
            <div style={{
              fontSize: '11px', fontFamily: sans,
              color: C.gold, opacity: 0.7,
              letterSpacing: '0.1em', marginBottom: '4px'
            }}>
              Block {currentBlock + 1} of {blocks.length}
            </div>
            <div style={{
              fontSize: '18px', fontFamily: serif,
              fontStyle: 'italic', marginBottom: '14px'
            }}>
              {blocks[currentBlock].name}
            </div>

            {/* Big timer with -/+ buttons */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '8px',
              padding: '8px 0', marginBottom: '6px'
            }}>
              <button onClick={() => adjustSeconds(-30)} style={{
                background: 'transparent', border: `1px solid ${C.border}`,
                color: C.text, opacity: 0.6,
                width: '40px', height: '40px',
                fontFamily: sans, fontSize: '14px',
                cursor: 'pointer', borderRadius: '50%',
                fontWeight: 400
              }}
                title="–30 sec"
              >–30s</button>
              <div style={{
                fontSize: '60px', fontFamily: sans,
                fontWeight: 200, color: isRunning ? C.gold : C.text,
                letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
                transition: 'color 0.3s',
                minWidth: '180px', textAlign: 'center'
              }}>
                {formatTime(secondsLeft)}
              </div>
              <button onClick={() => adjustSeconds(30)} style={{
                background: 'transparent', border: `1px solid ${C.border}`,
                color: C.text, opacity: 0.6,
                width: '40px', height: '40px',
                fontFamily: sans, fontSize: '14px',
                cursor: 'pointer', borderRadius: '50%',
                fontWeight: 400
              }}
                title="+30 sec"
              >+30s</button>
            </div>

            <div style={{
              height: '2px', background: 'rgba(255,255,255,0.08)',
              borderRadius: '2px', marginTop: '8px', marginBottom: '6px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${overallPct}%`, height: '100%',
                background: C.gold, transition: 'width 1s linear'
              }} />
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontFamily: sans, fontSize: '10px', opacity: 0.45,
              marginBottom: '16px', letterSpacing: '0.05em'
            }}>
              <span>{Math.floor(totalDoneSeconds / 60)} min done</span>
              <span>{Math.floor(totalSeconds / 60)} min total</span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setIsRunning(!isRunning)} style={{
                flex: 1, background: isRunning ? 'transparent' : C.gold,
                border: isRunning ? `1px solid ${C.gold}` : 'none',
                color: isRunning ? C.gold : C.bg,
                padding: '12px', fontFamily: sans,
                fontSize: '11px', letterSpacing: '0.2em',
                textTransform: 'uppercase', fontWeight: 600,
                cursor: 'pointer', borderRadius: '3px',
                transition: 'all 0.2s'
              }}>
                {isRunning ? '❚❚ Pause' : '▶ Start'}
              </button>
              <button onClick={skip} style={{
                background: 'transparent', border: `1px solid ${C.border}`,
                color: C.text, opacity: 0.7,
                padding: '12px 16px', fontFamily: sans,
                fontSize: '11px', letterSpacing: '0.2em',
                textTransform: 'uppercase', cursor: 'pointer',
                borderRadius: '3px'
              }}>Skip ▸</button>
              <button onClick={reset} style={{
                background: 'transparent', border: `1px solid ${C.border}`,
                color: C.text, opacity: 0.5,
                padding: '12px 16px', fontFamily: sans,
                fontSize: '11px', letterSpacing: '0.2em',
                textTransform: 'uppercase', cursor: 'pointer',
                borderRadius: '3px'
              }}>↺</button>
            </div>

            <div style={{
              marginTop: '12px', fontSize: '10px',
              fontFamily: sans, opacity: 0.4,
              textAlign: 'center', lineHeight: 1.5
            }}>
              Keep the screen on. Sound + vibration will alert each block change. Tap any block below to jump.
            </div>
          </>
        )}
      </div>

      {/* ===== BLOCKS (clickable) ===== */}
      <div>
        <div style={{
          fontSize: '10px', letterSpacing: '0.3em',
          textTransform: 'uppercase', opacity: 0.5,
          fontFamily: sans, marginBottom: '14px'
        }}>
          Session Blocks
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
          {blocks.map((block, i) => {
            const isCurrent = i === currentBlock && !completed;
            const isDone = i < currentBlock || (completed && i <= currentBlock);
            return (
              <div key={i}
                onClick={() => jumpToBlock(i)}
                style={{
                  background: isCurrent ? `${C.gold}12` : 'rgba(0,0,0,0.25)',
                  border: `1px solid ${isCurrent ? C.gold + '60' : C.border}`,
                  borderRadius: '3px',
                  padding: '14px 16px',
                  display: 'flex', gap: '14px',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  opacity: isDone ? 0.55 : 1
                }}
                onMouseOver={(e) => {
                  if (!isCurrent) e.currentTarget.style.borderColor = C.gold + '40';
                }}
                onMouseOut={(e) => {
                  if (!isCurrent) e.currentTarget.style.borderColor = C.border;
                }}
              >
                <div style={{
                  fontFamily: sans, fontSize: '10px',
                  color: isCurrent ? C.gold : C.gold,
                  opacity: isCurrent ? 1 : 0.7,
                  width: '20px', textAlign: 'center', marginTop: '2px'
                }}>
                  {isDone && !isCurrent ? '✓' : String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'baseline', marginBottom: '5px', gap: '10px'
                  }}>
                    <div style={{ fontSize: '15px', fontFamily: serif, fontStyle: 'italic' }}>
                      {block.name}
                    </div>
                    <div style={{
                      fontFamily: sans, fontSize: '10px',
                      color: C.gold, opacity: 0.75,
                      whiteSpace: 'nowrap', letterSpacing: '0.05em'
                    }}>
                      {block.min} min
                    </div>
                  </div>
                  <div style={{
                    fontFamily: sans, fontSize: '12px',
                    fontWeight: 300, opacity: 0.65, lineHeight: 1.5
                  }}>
                    {block.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{
          textAlign: 'right', fontFamily: sans,
          fontSize: '11px', opacity: 0.7,
          letterSpacing: '0.05em', paddingTop: '8px',
          borderTop: `1px solid ${C.border}`
        }}>
          Total: <span style={{ color: C.gold }}>{totalMin} min</span>
        </div>
      </div>
    </>
  );
}

function SessionTimer({ blocks, C, sans, serif, totalMin, sessionName }) {
  const [currentBlock, setCurrentBlock] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(blocks[0].min * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Beep sound when block ends
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      // Triple chime
      [0, 0.18, 0.36].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + delay + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.5);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.5);
      });
    } catch (e) {}
    // Vibration if available
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    }
  };

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          playBeep();
          if (currentBlock < blocks.length - 1) {
            setCurrentBlock(currentBlock + 1);
            return blocks[currentBlock + 1].min * 60;
          } else {
            setIsRunning(false);
            setCompleted(true);
            return 0;
          }
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, currentBlock, blocks]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const reset = () => {
    setIsRunning(false);
    setCurrentBlock(0);
    setSecondsLeft(blocks[0].min * 60);
    setCompleted(false);
  };

  const skip = () => {
    playBeep();
    if (currentBlock < blocks.length - 1) {
      setCurrentBlock(currentBlock + 1);
      setSecondsLeft(blocks[currentBlock + 1].min * 60);
    } else {
      setIsRunning(false);
      setCompleted(true);
      setSecondsLeft(0);
    }
  };

  const totalDoneSeconds = blocks.slice(0, currentBlock).reduce((sum, b) => sum + b.min * 60, 0)
    + (blocks[currentBlock].min * 60 - secondsLeft);
  const totalSeconds = totalMin * 60;
  const overallPct = (totalDoneSeconds / totalSeconds) * 100;

  return (
    <div style={{
      background: `linear-gradient(135deg, rgba(212,175,55,0.06) 0%, rgba(0,0,0,0.35) 100%)`,
      border: `1px solid ${C.gold}40`,
      borderRadius: '6px',
      padding: '22px 22px 20px',
      marginBottom: '20px'
    }}>
      <div style={{
        fontSize: '9px', letterSpacing: '0.3em',
        textTransform: 'uppercase', color: C.gold,
        fontFamily: sans, marginBottom: '12px', opacity: 0.75
      }}>
        Session Timer · {sessionName}
      </div>

      {completed ? (
        <div style={{ textAlign: 'center', padding: '18px 0' }}>
          <div style={{
            fontSize: '24px', fontStyle: 'italic',
            fontFamily: serif, marginBottom: '8px', color: C.gold
          }}>
            Session complete
          </div>
          <div style={{
            fontFamily: sans, fontSize: '12px',
            opacity: 0.6, marginBottom: '16px'
          }}>
            Good work — log it in Practice Log
          </div>
          <button onClick={reset} style={{
            background: 'transparent', border: `1px solid ${C.border}`,
            color: C.text, opacity: 0.7,
            padding: '8px 16px', fontFamily: sans,
            fontSize: '10px', letterSpacing: '0.2em',
            textTransform: 'uppercase', cursor: 'pointer',
            borderRadius: '3px'
          }}>Reset</button>
        </div>
      ) : (
        <>
          {/* Current block info */}
          <div style={{
            fontSize: '11px', fontFamily: sans,
            color: C.gold, opacity: 0.7,
            letterSpacing: '0.1em', marginBottom: '4px'
          }}>
            Block {currentBlock + 1} of {blocks.length}
          </div>
          <div style={{
            fontSize: '18px', fontFamily: serif,
            fontStyle: 'italic', marginBottom: '14px'
          }}>
            {blocks[currentBlock].name}
          </div>

          {/* Big timer */}
          <div style={{
            textAlign: 'center', padding: '12px 0',
            fontSize: '64px', fontFamily: sans,
            fontWeight: 200, color: isRunning ? C.gold : C.text,
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
            transition: 'color 0.3s'
          }}>
            {formatTime(secondsLeft)}
          </div>

          {/* Overall progress */}
          <div style={{
            height: '2px', background: 'rgba(255,255,255,0.08)',
            borderRadius: '2px', marginBottom: '6px', overflow: 'hidden'
          }}>
            <div style={{
              width: `${overallPct}%`, height: '100%',
              background: C.gold, transition: 'width 1s linear'
            }} />
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontFamily: sans, fontSize: '10px', opacity: 0.45,
            marginBottom: '16px', letterSpacing: '0.05em'
          }}>
            <span>{Math.floor(totalDoneSeconds / 60)} min done</span>
            <span>{Math.floor(totalSeconds / 60)} min total</span>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setIsRunning(!isRunning)} style={{
              flex: 1, background: isRunning ? 'transparent' : C.gold,
              border: isRunning ? `1px solid ${C.gold}` : 'none',
              color: isRunning ? C.gold : C.bg,
              padding: '12px', fontFamily: sans,
              fontSize: '11px', letterSpacing: '0.2em',
              textTransform: 'uppercase', fontWeight: 600,
              cursor: 'pointer', borderRadius: '3px',
              transition: 'all 0.2s'
            }}>
              {isRunning ? '❚❚ Pause' : '▶ Start'}
            </button>
            <button onClick={skip} style={{
              background: 'transparent', border: `1px solid ${C.border}`,
              color: C.text, opacity: 0.7,
              padding: '12px 16px', fontFamily: sans,
              fontSize: '11px', letterSpacing: '0.2em',
              textTransform: 'uppercase', cursor: 'pointer',
              borderRadius: '3px'
            }}>Skip</button>
            <button onClick={reset} style={{
              background: 'transparent', border: `1px solid ${C.border}`,
              color: C.text, opacity: 0.5,
              padding: '12px 16px', fontFamily: sans,
              fontSize: '11px', letterSpacing: '0.2em',
              textTransform: 'uppercase', cursor: 'pointer',
              borderRadius: '3px'
            }}>↺</button>
          </div>

          {/* Hint */}
          <div style={{
            marginTop: '12px', fontSize: '10px',
            fontFamily: sans, opacity: 0.4,
            textAlign: 'center', lineHeight: 1.5
          }}>
            Keep the screen on. Sound + vibration will alert each block change.
          </div>

          {/* Up next preview */}
          {currentBlock < blocks.length - 1 && (
            <div style={{
              marginTop: '14px', paddingTop: '14px',
              borderTop: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'baseline',
              justifyContent: 'space-between'
            }}>
              <div style={{
                fontFamily: sans, fontSize: '10px',
                opacity: 0.5, letterSpacing: '0.2em',
                textTransform: 'uppercase'
              }}>Up next</div>
              <div style={{
                fontFamily: serif, fontStyle: 'italic',
                fontSize: '13px', opacity: 0.75
              }}>{blocks[currentBlock + 1].name}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SessionBlocks({ blocks, C, sans, serif, totalMin }) {
  return (
    <div>
      <div style={{ fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.5, fontFamily: sans, marginBottom: '14px' }}>Session Blocks</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
        {blocks.map((block, i) => (
          <div key={i} style={{
            background: 'rgba(0,0,0,0.25)',
            border: `1px solid ${C.border}`,
            borderRadius: '3px', padding: '14px 16px',
            display: 'flex', gap: '14px', alignItems: 'flex-start'
          }}>
            <div style={{ fontFamily: sans, fontSize: '10px', color: C.gold, opacity: 0.7, width: '20px', textAlign: 'center', marginTop: '2px' }}>{String(i + 1).padStart(2, '0')}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px', gap: '10px' }}>
                <div style={{ fontSize: '15px', fontFamily: serif, fontStyle: 'italic' }}>{block.name}</div>
                <div style={{ fontFamily: sans, fontSize: '10px', color: C.gold, opacity: 0.75, whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>{block.min} min</div>
              </div>
              <div style={{ fontFamily: sans, fontSize: '12px', fontWeight: 300, opacity: 0.65, lineHeight: 1.5 }}>{block.detail}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'right', fontFamily: sans, fontSize: '11px', opacity: 0.7, letterSpacing: '0.05em', paddingTop: '8px', borderTop: `1px solid ${C.border}` }}>
        Total: <span style={{ color: C.gold }}>{totalMin} min</span>
      </div>
    </div>
  );
}

function NavButton({ onClick, children, C, sans }) {
  return (
    <button onClick={onClick} style={{
      background: 'transparent', border: `1px solid ${C.border}`,
      color: C.text, opacity: 0.7,
      padding: '6px 12px', fontFamily: sans,
      fontSize: '10px', letterSpacing: '0.15em',
      textTransform: 'uppercase', cursor: 'pointer',
      borderRadius: '2px', transition: 'all 0.2s'
    }}
      onMouseOver={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.borderColor = C.gold + '60'; }}
      onMouseOut={(e) => { e.currentTarget.style.opacity = 0.7; e.currentTarget.style.borderColor = C.border; }}
    >{children}</button>
  );
}

function Label({ children, C, sans, color }) {
  return (
    <div style={{
      fontSize: '9px', letterSpacing: '0.3em',
      textTransform: 'uppercase',
      color: color || undefined,
      opacity: color ? 0.9 : 0.5,
      fontFamily: sans, marginBottom: '8px'
    }}>{children}</div>
  );
}

function inputStyle(C, sans) {
  return {
    width: '100%', background: 'rgba(0,0,0,0.3)',
    border: `1px solid ${C.border}`, borderRadius: '3px',
    padding: '9px 11px', color: C.text,
    fontFamily: sans, fontSize: '13px',
    fontWeight: 300, outline: 'none', boxSizing: 'border-box'
  };
}

// ============ ICONS (NEW SET) ============

function DecoLine({ C }) {
  return (
    <svg width="44" height="6" viewBox="0 0 44 6" style={{ flexShrink: 0 }}>
      <line x1="0" y1="3" x2="18" y2="3" stroke={C.gold} strokeWidth="0.6" opacity="0.5" />
      <circle cx="22" cy="3" r="1.3" fill={C.gold} opacity="0.7" />
      <line x1="26" y1="3" x2="44" y2="3" stroke={C.gold} strokeWidth="0.6" opacity="0.5" />
    </svg>
  );
}

function FlagIcon({ C, size = 32, muted = false }) {
  const opacity = muted ? 0.35 : 0.85;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <line x1="9" y1="3" x2="9" y2="29" stroke={C.gold} strokeWidth="1" opacity={opacity} />
      <path d="M9 5 L22 9 L9 13 Z" fill={C.gold} opacity={opacity * 0.7} stroke={C.gold} strokeWidth="0.6" />
      <circle cx="9" cy="28" r="1.5" fill={C.gold} opacity={opacity} />
      <ellipse cx="9" cy="29" rx="6" ry="0.8" fill={C.gold} opacity={opacity * 0.25} />
    </svg>
  );
}

function TigerIcon({ C, size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M8 6 L16 4 L24 6 L25 14 Q25 22 16 28 Q7 22 7 14 Z" stroke={C.gold} strokeWidth="1" opacity="0.9" fill="none" />
      <path d="M13 14 L13 18 M19 14 L19 18" stroke={C.gold} strokeWidth="1" opacity="0.7" strokeLinecap="round" />
      <path d="M13 22 Q16 24 19 22" stroke={C.gold} strokeWidth="1" opacity="0.7" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function BookIcon({ C, size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M5 7 L5 25 Q11 23 16 24 Q21 23 27 25 L27 7 Q21 5 16 7 Q11 5 5 7 Z" stroke={C.gold} strokeWidth="0.9" opacity="0.85" fill="none" />
      <line x1="16" y1="7" x2="16" y2="24" stroke={C.gold} strokeWidth="0.7" opacity="0.5" />
      <line x1="8" y1="12" x2="13" y2="12" stroke={C.gold} strokeWidth="0.5" opacity="0.5" />
      <line x1="8" y1="16" x2="13" y2="16" stroke={C.gold} strokeWidth="0.5" opacity="0.5" />
      <line x1="19" y1="12" x2="24" y2="12" stroke={C.gold} strokeWidth="0.5" opacity="0.5" />
      <line x1="19" y1="16" x2="24" y2="16" stroke={C.gold} strokeWidth="0.5" opacity="0.5" />
    </svg>
  );
}

function SpotifyIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.78-.179-.9-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  );
}

// MAIN SECTION ICONS — new set
function SectionIcon({ type, color, size = 28 }) {
  const props = { width: size, height: size, viewBox: '-16 -16 32 32', fill: 'none' };
  const opacity = 0.9;

  if (type === 'mantra') {
    // Meditation silhouette + golf ball at heart
    return (
      <svg {...props}>
        <circle cx="0" cy="-10" r="3.2" fill="none" stroke={color} strokeWidth="1.1" opacity={opacity} />
        <path d="M -6 7 Q -6 -2 -3 -6 Q 0 -8 3 -6 Q 6 -2 6 7 Z" stroke={color} strokeWidth="1.1" opacity={opacity} fill="none" strokeLinejoin="round" />
        <path d="M -6 5 Q -11 2 -13 7 Q -12 11 -8 10 L -6 9 Z" stroke={color} strokeWidth="1.1" opacity={opacity} fill="none" strokeLinejoin="round" />
        <path d="M 6 5 Q 11 2 13 7 Q 12 11 8 10 L 6 9 Z" stroke={color} strokeWidth="1.1" opacity={opacity} fill="none" strokeLinejoin="round" />
        <circle cx="0" cy="0" r="3" fill="#0a1612" />
        <circle cx="0" cy="0" r="3" fill="none" stroke={color} strokeWidth="1" opacity={opacity} />
        <circle cx="-1.2" cy="-1.2" r="0.35" fill={color} opacity={opacity * 0.85} />
        <circle cx="1.2" cy="-1.2" r="0.35" fill={color} opacity={opacity * 0.85} />
        <circle cx="-1.2" cy="1.2" r="0.35" fill={color} opacity={opacity * 0.85} />
        <circle cx="1.2" cy="1.2" r="0.35" fill={color} opacity={opacity * 0.85} />
        <circle cx="0" cy="0" r="0.35" fill={color} opacity={opacity * 0.85} />
      </svg>
    );
  }

  if (type === 'growth') {
    // Ascending bar chart + trend arrow
    return (
      <svg {...props}>
        <line x1="-11" y1="7" x2="11" y2="7" stroke={color} strokeWidth="0.9" opacity={opacity * 0.75} />
        <rect x="-9" y="3" width="3" height="4" fill={color} opacity={opacity * 0.55} />
        <rect x="-4.5" y="-1" width="3" height="8" fill={color} opacity={opacity * 0.7} />
        <rect x="0" y="-5" width="3" height="12" fill={color} opacity={opacity * 0.85} />
        <rect x="4.5" y="-9" width="3" height="16" fill={color} opacity={opacity} />
        <path d="M -11 -4 L 11 -11" stroke={color} strokeWidth="0.7" opacity={opacity * 0.55} strokeDasharray="1.5 1.5" />
        <path d="M 8 -12 L 11 -11 L 9.5 -8.5" stroke={color} strokeWidth="0.8" opacity={opacity * 0.75} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'strategy') {
    // Chess knight on board
    return (
      <svg {...props}>
        <rect x="-11" y="-11" width="5.5" height="5.5" fill={color} opacity={opacity * 0.22} />
        <rect x="0" y="-11" width="5.5" height="5.5" fill={color} opacity={opacity * 0.22} />
        <rect x="-5.5" y="-5.5" width="5.5" height="5.5" fill={color} opacity={opacity * 0.22} />
        <rect x="5.5" y="-5.5" width="5.5" height="5.5" fill={color} opacity={opacity * 0.22} />
        <rect x="-11" y="0" width="5.5" height="5.5" fill={color} opacity={opacity * 0.22} />
        <rect x="0" y="0" width="5.5" height="5.5" fill={color} opacity={opacity * 0.22} />
        <rect x="-5.5" y="5.5" width="5.5" height="5.5" fill={color} opacity={opacity * 0.22} />
        <rect x="5.5" y="5.5" width="5.5" height="5.5" fill={color} opacity={opacity * 0.22} />
        <rect x="-11" y="-11" width="22" height="22" fill="none" stroke={color} strokeWidth="0.7" opacity={opacity * 0.8} />
        <path d="M -2 8 Q -4 4 -2 0 Q 0 -4 3 -6 Q 5 -7 4 -9 L 2 -9 L 0 -7 Q -1 -7 -2 -8 Q -4 -7 -5 -5 Q -6 -1 -5 3 Q -4 5 -4 8 Z" fill={color} opacity={opacity} />
        <rect x="-5" y="7" width="7" height="2" fill={color} opacity={opacity} />
      </svg>
    );
  }

  if (type === 'practice') {
    // Ball + trajectory arrow + target
    return (
      <svg {...props}>
        <circle cx="-9" cy="2" r="3" fill="none" stroke={color} strokeWidth="1" opacity={opacity} />
        <circle cx="-10" cy="1" r="0.3" fill={color} opacity={opacity * 0.65} />
        <circle cx="-8" cy="1" r="0.3" fill={color} opacity={opacity * 0.65} />
        <circle cx="-9" cy="2.5" r="0.3" fill={color} opacity={opacity * 0.65} />
        <path d="M -5 0 Q 0 -7 5 -2" stroke={color} strokeWidth="1" opacity={opacity * 0.85} fill="none" strokeDasharray="1.5 1.5" strokeLinecap="round" />
        <path d="M 3 -3 L 6 -2 L 4 0" stroke={color} strokeWidth="0.9" opacity={opacity * 0.9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="3" r="4.5" fill="none" stroke={color} strokeWidth="0.7" opacity={opacity * 0.45} />
        <circle cx="9" cy="3" r="2.5" fill="none" stroke={color} strokeWidth="0.7" opacity={opacity * 0.65} />
        <circle cx="9" cy="3" r="1" fill={color} opacity={opacity} />
      </svg>
    );
  }

  if (type === 'round') {
    // Flag + ball on green
    return (
      <svg {...props}>
        <line x1="-4" y1="-13" x2="-4" y2="11" stroke={color} strokeWidth="0.9" opacity={opacity} />
        <path d="M -4 -11 L 7 -8 L -4 -5 Z" fill={color} opacity={opacity * 0.75} stroke={color} strokeWidth="0.5" />
        <circle cx="-4" cy="11" r="1.2" fill={color} opacity={opacity} />
        <ellipse cx="-4" cy="12" rx="7" ry="0.8" fill={color} opacity={opacity * 0.25} />
        <circle cx="7" cy="9" r="2.6" fill="none" stroke={color} strokeWidth="0.9" opacity={opacity} />
        <circle cx="6" cy="8.5" r="0.3" fill={color} opacity={opacity * 0.55} />
        <circle cx="8" cy="8.5" r="0.3" fill={color} opacity={opacity * 0.55} />
        <circle cx="7" cy="9.5" r="0.3" fill={color} opacity={opacity * 0.55} />
      </svg>
    );
  }

  if (type === 'calendar') {
    return (
      <svg {...props}>
        <rect x="-11" y="-7" width="22" height="20" rx="1.5" stroke={color} strokeWidth="0.9" opacity={opacity} fill="none" />
        <line x1="-11" y1="-2" x2="11" y2="-2" stroke={color} strokeWidth="0.9" opacity={opacity} />
        <line x1="-6" y1="-10" x2="-6" y2="-5" stroke={color} strokeWidth="1.2" opacity={opacity} strokeLinecap="round" />
        <line x1="6" y1="-10" x2="6" y2="-5" stroke={color} strokeWidth="1.2" opacity={opacity} strokeLinecap="round" />
        <circle cx="-5" cy="4" r="1.3" fill={color} opacity={opacity * 0.6} />
        <circle cx="5" cy="8" r="1.3" fill={color} opacity={opacity * 0.6} />
      </svg>
    );
  }

  if (type === 'indoor') {
    // Trackman-style monitor
    return (
      <svg {...props}>
        <rect x="-12" y="-9" width="24" height="16" rx="1.5" stroke={color} strokeWidth="0.9" opacity={opacity} fill="none" />
        <line x1="-4" y1="7" x2="-4" y2="11" stroke={color} strokeWidth="0.9" opacity={opacity} />
        <line x1="4" y1="7" x2="4" y2="11" stroke={color} strokeWidth="0.9" opacity={opacity} />
        <line x1="-8" y1="11" x2="8" y2="11" stroke={color} strokeWidth="0.9" opacity={opacity} strokeLinecap="round" />
        <path d="M -8 3 Q -4 -4 0 -2 Q 4 0 8 -6" stroke={color} strokeWidth="0.8" opacity={opacity * 0.75} fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'outdoor') {
    return (
      <svg {...props}>
        <circle cx="0" cy="-3" r="4.5" stroke={color} strokeWidth="0.9" opacity={opacity} fill="none" />
        <line x1="0" y1="-12" x2="0" y2="-9.5" stroke={color} strokeWidth="0.9" opacity={opacity} strokeLinecap="round" />
        <line x1="0" y1="3.5" x2="0" y2="6" stroke={color} strokeWidth="0.9" opacity={opacity} strokeLinecap="round" />
        <line x1="-9" y1="-3" x2="-6.5" y2="-3" stroke={color} strokeWidth="0.9" opacity={opacity} strokeLinecap="round" />
        <line x1="6.5" y1="-3" x2="9" y2="-3" stroke={color} strokeWidth="0.9" opacity={opacity} strokeLinecap="round" />
        <path d="M -12 12 Q -8 8 -4 12 Q 0 8 4 12 Q 8 8 12 12" stroke={color} strokeWidth="0.9" opacity={opacity} fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'log') {
    return (
      <svg {...props}>
        <rect x="-10" y="-12" width="20" height="23" rx="1.5" stroke={color} strokeWidth="0.9" opacity={opacity} fill="none" />
        <line x1="-6" y1="-6" x2="6" y2="-6" stroke={color} strokeWidth="0.7" opacity={opacity * 0.6} />
        <line x1="-6" y1="-2" x2="6" y2="-2" stroke={color} strokeWidth="0.7" opacity={opacity * 0.6} />
        <line x1="-6" y1="2" x2="2" y2="2" stroke={color} strokeWidth="0.7" opacity={opacity * 0.6} />
        <line x1="-6" y1="6" x2="4" y2="6" stroke={color} strokeWidth="0.7" opacity={opacity * 0.6} />
      </svg>
    );
  }
  return null;
}

// AREA-SPECIFIC ICONS — new set
function AreaIcon({ type, color, size = 30 }) {
  const props = { width: size, height: size, viewBox: '-16 -16 32 32', fill: 'none' };
  const opacity = 0.9;

  if (type === 'tempo') {
    // Metronome
    return (
      <svg {...props}>
        <path d="M -7 11 L -4 -9 L 4 -9 L 7 11 Z" stroke={color} strokeWidth="1.1" opacity={opacity} fill="none" strokeLinejoin="round" />
        <line x1="-7" y1="11" x2="7" y2="11" stroke={color} strokeWidth="0.8" opacity={opacity * 0.6} />
        <line x1="0" y1="9" x2="3" y2="-10" stroke={color} strokeWidth="1.1" opacity={opacity} strokeLinecap="round" />
        <circle cx="3" cy="-10" r="1.2" fill={color} opacity={opacity} />
        <circle cx="0" cy="9" r="0.6" fill={color} opacity={opacity * 0.6} />
        <rect x="-2" y="0" width="4" height="1.4" fill={color} opacity={opacity * 0.45} />
      </svg>
    );
  }

  if (type === 'elevated') {
    // High arc
    return (
      <svg {...props}>
        <path d="M -11 9 Q 0 -13 11 9" stroke={color} strokeWidth="1.2" opacity={opacity} fill="none" strokeDasharray="2 2" strokeLinecap="round" />
        <circle cx="-11" cy="9" r="1.5" fill={color} opacity={opacity} />
        <circle cx="11" cy="9" r="1.5" fill="none" stroke={color} strokeWidth="0.9" opacity={opacity * 0.6} />
        <line x1="-13" y1="11" x2="13" y2="11" stroke={color} strokeWidth="0.6" opacity={opacity * 0.55} />
      </svg>
    );
  }

  if (type === 'chiprun') {
    // Low arc + roll
    return (
      <svg {...props}>
        <path d="M -11 6 Q -7 -4 -2 6" stroke={color} strokeWidth="1.2" opacity={opacity} fill="none" strokeDasharray="2 2" strokeLinecap="round" />
        <path d="M -2 6 Q 2 6 11 6" stroke={color} strokeWidth="1.2" opacity={opacity * 0.55} fill="none" strokeLinecap="round" />
        <circle cx="-11" cy="6" r="1.4" fill={color} opacity={opacity} />
        <circle cx="11" cy="6" r="1.4" fill="none" stroke={color} strokeWidth="0.9" opacity={opacity * 0.55} />
        <line x1="-13" y1="8.5" x2="13" y2="8.5" stroke={color} strokeWidth="0.6" opacity={opacity * 0.55} />
      </svg>
    );
  }

  if (type === 'tee') {
    // Ball on tee
    return (
      <svg {...props}>
        <circle cx="0" cy="-6" r="5.5" fill="none" stroke={color} strokeWidth="1" opacity={opacity} />
        <circle cx="-2.2" cy="-8" r="0.45" fill={color} opacity={opacity * 0.65} />
        <circle cx="2.2" cy="-8" r="0.45" fill={color} opacity={opacity * 0.65} />
        <circle cx="0" cy="-6" r="0.45" fill={color} opacity={opacity * 0.65} />
        <circle cx="-2.2" cy="-4" r="0.45" fill={color} opacity={opacity * 0.65} />
        <circle cx="2.2" cy="-4" r="0.45" fill={color} opacity={opacity * 0.65} />
        <path d="M -2.5 0 L 2.5 0 L 1.2 10 L -1.2 10 Z" fill={color} opacity={opacity * 0.85} />
        <line x1="-13" y1="13" x2="13" y2="13" stroke={color} strokeWidth="0.6" opacity={opacity * 0.55} />
      </svg>
    );
  }

  if (type === 'wedge') {
    // Target rings with flag (the favorite)
    return (
      <svg {...props}>
        <circle cx="0" cy="0" r="11" fill="none" stroke={color} strokeWidth="0.8" opacity={opacity * 0.32} />
        <circle cx="0" cy="0" r="7.5" fill="none" stroke={color} strokeWidth="0.8" opacity={opacity * 0.5} />
        <circle cx="0" cy="0" r="4" fill="none" stroke={color} strokeWidth="0.8" opacity={opacity * 0.75} />
        <line x1="0" y1="0" x2="0" y2="-10" stroke={color} strokeWidth="1.1" opacity={opacity} />
        <path d="M 0 -9 L 6 -7 L 0 -5 Z" fill={color} opacity={opacity * 0.85} />
        <circle cx="0" cy="0" r="1.3" fill={color} opacity={opacity} />
      </svg>
    );
  }

  if (type === 'preshot') {
    // Sequence 1 → 2 → 3, last filled
    return (
      <svg {...props}>
        <circle cx="-9" cy="0" r="4" fill="none" stroke={color} strokeWidth="1" opacity={opacity * 0.95} />
        <text x="-9" y="2.2" textAnchor="middle" fill={color} fontSize="5.5" fontWeight="500" fontFamily="serif" fontStyle="italic">1</text>
        <line x1="-5" y1="0" x2="-3" y2="0" stroke={color} strokeWidth="0.7" opacity={opacity * 0.55} strokeDasharray="1 1" />
        <circle cx="0" cy="0" r="4" fill="none" stroke={color} strokeWidth="1" opacity={opacity * 0.95} />
        <text x="0" y="2.2" textAnchor="middle" fill={color} fontSize="5.5" fontWeight="500" fontFamily="serif" fontStyle="italic">2</text>
        <line x1="4" y1="0" x2="6" y2="0" stroke={color} strokeWidth="0.7" opacity={opacity * 0.55} strokeDasharray="1 1" />
        <circle cx="9" cy="0" r="4" fill={color} opacity={opacity * 0.9} />
        <text x="9" y="2.2" textAnchor="middle" fill="#0a1612" fontSize="5.5" fontWeight="600" fontFamily="serif" fontStyle="italic">3</text>
      </svg>
    );
  }
  return null;
}
