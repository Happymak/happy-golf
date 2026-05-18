import React, { useState, useEffect, useRef } from 'react';

// =====================================================================
// HAPPY GOLF — 2026 Season App
// The Grint color palette · Compact UX · Optimized for iPhone Max
// =====================================================================

export default function GolfApp() {
  const [view, setView] = useState('home');
  const [areaView, setAreaView] = useState(null);
  const [practiceView, setPracticeView] = useState(null);
  const [showWaldron, setShowWaldron] = useState(false);
  const [editingMantra, setEditingMantra] = useState(false);
  const [cmExpanded, setCmExpanded] = useState(null);
  const [fontScale, setFontScale] = useState(1);
  const [roundImageFullscreen, setRoundImageFullscreen] = useState(false);
  const [showRoundForm, setShowRoundForm] = useState(false);

  // Latest round - full object instead of just score
  const defaultRound = {
    courseShort: 'NORMANDY',
    courseFull: 'Miami Beach Golf Club',
    date: '2026-05-13',
    dateDisplay: 'May 13, 2026',
    coursePar: 72,
    overPar: 30,
    grossScore: 102,
    netScore: 83,
    differential: 23.6,
    teeColor: 'Blue',
    yards: 6430,
    slope: 138,
    courseHandicap: 19,
    image: '/round-may13.png', // path or data URL
    notes: ''
  };
  const [lastRound, setLastRound] = useState(defaultRound);

  const [mantraText, setMantraText] = useState('');
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [practiceLog, setPracticeLog] = useState([]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'outdoor', duration: '', areas: '', sensations: '', nextFocus: ''
  });

  const hasPlayedOpeningRef = useRef(false);

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

  // ============== STORAGE ==============
  useEffect(() => {
    try {
      const saved = localStorage.getItem('happy-golf-v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        setMantraText(parsed.mantraText !== undefined ? parsed.mantraText : defaultMantra);
        setPracticeLog(parsed.practiceLog || []);
        if (parsed.fontScale) setFontScale(parsed.fontScale);
        if (parsed.lastRound) setLastRound(parsed.lastRound);
      } else {
        setMantraText(defaultMantra);
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
        practiceLog: updates.practiceLog ?? practiceLog,
        fontScale: updates.fontScale ?? fontScale,
        lastRound: updates.lastRound ?? lastRound
      };
      localStorage.setItem('happy-golf-v2', JSON.stringify(state));
    } catch (e) {}
  };

  // ============== SOUND: Golf ball dropping in hole ==============
  const playHoleDropSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      // Wood "tock" — the ball hitting cup
      const tock = ctx.createOscillator();
      const tockGain = ctx.createGain();
      tock.connect(tockGain);
      tockGain.connect(ctx.destination);
      tock.type = 'sine';
      tock.frequency.setValueAtTime(420, ctx.currentTime);
      tock.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.08);
      tockGain.gain.setValueAtTime(0.35, ctx.currentTime);
      tockGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      tock.start(ctx.currentTime);
      tock.stop(ctx.currentTime + 0.15);

      // Second softer tock — ball settling
      const tock2 = ctx.createOscillator();
      const tock2Gain = ctx.createGain();
      tock2.connect(tock2Gain);
      tock2Gain.connect(ctx.destination);
      tock2.type = 'sine';
      tock2.frequency.setValueAtTime(320, ctx.currentTime + 0.18);
      tock2.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.26);
      tock2Gain.gain.setValueAtTime(0.2, ctx.currentTime + 0.18);
      tock2Gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
      tock2.start(ctx.currentTime + 0.18);
      tock2.stop(ctx.currentTime + 0.32);
    } catch (e) {}
  };

  // Play opening sound once when user first interacts (iOS requires user gesture)
  const armedOpeningSound = useRef(false);
  useEffect(() => {
    const tryPlay = () => {
      if (!hasPlayedOpeningRef.current) {
        playHoleDropSound();
        hasPlayedOpeningRef.current = true;
      }
      document.removeEventListener('touchstart', tryPlay);
      document.removeEventListener('click', tryPlay);
    };
    document.addEventListener('touchstart', tryPlay, { once: true });
    document.addEventListener('click', tryPlay, { once: true });
    return () => {
      document.removeEventListener('touchstart', tryPlay);
      document.removeEventListener('click', tryPlay);
    };
  }, []);

  // ============== DATA ==============
  const mantraQuotes = [
    { text: "Golf is a game of confidence.", author: null },
    { text: "Play the shot in front of you.", author: null },
    { text: "Tempo is the soul of the swing.", author: "Ben Hogan" },
    { text: "The most important shot in golf is the next one.", author: "Ben Hogan" },
    { text: "Golf is 90% mental and 10% mental.", author: "Jim McLean" },
    { text: "Trust your swing.", author: null },
    { text: "The most important distance in golf is the six inches between your ears.", author: "Arnold Palmer" }
  ];

  const areas = [
    {
      id: 'tempo', num: '01', icon: 'tempo',
      title: 'Tempo & Rhythm', subtitle: 'Foundation of every swing',
      color: '#8bc34a',
      insight: 'A balanced swing is the foundation of everything else',
      current: 'Backswing too fast + overly aggressive downswing.',
      objective: 'Slower backswing with a more defined pause/transition before the downswing — building rhythm instead of rushing into impact.',
      notes: 'Reference (without going extreme): Cameron Young\'s tempo, softened. Focal word recommended: "Slow back, through". Expected benefit: more control and consistency across irons and woods.'
    },
    {
      id: 'elevated', num: '02', icon: 'elevated',
      title: 'Elevated Chip and Pitch Shots', subtitle: 'Over slopes and breaks',
      color: '#a78bfa',
      insight: 'Backswing length controls distance, not force',
      current: 'Inconsistent contact and distance.',
      objective: 'Improve impact quality and swing length to produce more precise, repeatable shots.',
      notes: 'Need more consistency in swing length so the ball doesn\'t fly shorter or longer than intended. Always evaluate the safe shot — the elevated chip is the right choice only when chip & run won\'t work because of slopes or breaks between you and the hole. Choose between 54° and 58° based on situation.'
    },
    {
      id: 'chiprun', num: '03', icon: 'chiprun',
      title: 'Chip & Runs', subtitle: 'Around the green',
      color: '#60a5fa',
      insight: 'Approach wedge + putt-style stroke = repeatability',
      current: 'Distance inconsistency from switching clubs too often on these shots.',
      objective: 'Commit to the approach wedge as the default — vary only if the lie demands a different loft.',
      notes: 'Precision on the line and predicting the roll is critical here. Always evaluate the safe shot — pick the right landing spot before committing. 9-iron tends to come out too hot — stick to approach wedge for consistency. Calibrate backswing length: shorter vs longer based on distance.'
    },
    {
      id: 'tee', num: '04', icon: 'tee',
      title: 'Tee Shots', subtitle: 'Driver & 3-wood',
      color: '#f97316',
      insight: 'A well-executed driver is the biggest strokes-gained opportunity',
      current: 'Inconsistent swing length and instability in the stance.',
      objective: 'Build consistency in swing length and accuracy off the tee.',
      notes: 'Better tempo, pre-shot routine, proper wrist hinge, solid posture. Dedicated driver sessions — don\'t give away strokes from the tee. 3-wood as the reliable second option.'
    },
    {
      id: 'wedges', num: '05', icon: 'wedge',
      title: 'Wedge Shots 30–90 yds', subtitle: '54° and 58°',
      color: '#84cc16',
      insight: 'Ball position is the spin dial',
      current: 'Contact is improving — now need to dial in distances.',
      objective: 'Define distances based on swing length — using the three standard wedge swings: 1/4, 2/4, 3/4 (full rarely used).',
      notes: 'Ball position back (closer to left foot, being lefty) = more compression, more spin. Ball forward = less spin. Modulate ball position by the spin you need. Work both 54° and 58°.'
    },
    {
      id: 'preshot', num: '06', icon: 'preshot',
      title: 'Pre-Shot Routine', subtitle: 'Full shots & putting',
      color: '#ef4444',
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

  const decadePrinciples = [
    { num: '1', title: 'Aim at the fat part of the green',
      body: 'Outside 140 yds, your dispersion is bigger than the green itself. Aiming at the pin is sniper-rifle thinking — you only have a shotgun. Aim at the center, take the 30-foot putt, walk away with par.' },
    { num: '2', title: 'Manage your shot dispersion off the tee',
      body: 'Even Jason Day, #1 strokes-gained off the tee in 2014, had a 74-yard dispersion with driver. You WILL hit it left AND right. Pick a target so BOTH misses are still in play.' },
    { num: '3', title: 'Take trouble completely out of play',
      body: 'Water, OB, deep bunkers, trees — these are the bogey-makers. If you can\'t take them out of play with your normal shot, club down. Rough is fine. Trees and water are not.' },
    { num: '4', title: 'Club up and swing smooth',
      body: 'Take one more club and swing controlled. A smooth 7-iron from 150 yds beats a flushed 8-iron. Short misses bring front bunkers, water, and short-side trouble into play.' },
    { num: '5', title: 'Play one shot shape',
      body: '99% of amateurs benefit from picking one shape (draw or fade) and using it everywhere. Two-way misses kill rounds. Commit to one shape all day, eliminate one side of the course.' },
    { num: '6', title: 'When in trouble, take your medicine',
      body: 'Hero shots through trees almost never pay. Your first goal is to get back in play. Bogey beats triple every time.' },
    { num: '7', title: 'Inside 140 yards, attack — selectively',
      body: 'Short irons and wedges are when DECADE allows flag-hunting — but only when the pin is NOT short-sided. Tucked pin behind bunker = still aim at the fat side.' }
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

  // ============== HANDLERS ==============
  const updateMantra = (value) => {
    setMantraText(value);
    saveState({ mantraText: value });
  };

  const cycleFontScale = () => {
    const scales = [1, 1.15, 1.3];
    const idx = scales.indexOf(fontScale);
    const next = scales[(idx + 1) % scales.length];
    setFontScale(next);
    saveState({ fontScale: next });
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

  // ============== THE GRINT COLOR PALETTE ==============
  const C = {
    bg: '#0e2a47',        // Navy primary
    bg2: '#173d63',       // Navy lighter (gradient top)
    text: '#ffffff',      // White
    textDim: '#cdd9e3',   // Soft white
    accent: '#a3d955',    // Grint lime green
    accentDim: '#7eb53d',
    gold: '#a3d955',      // Alias accent everywhere
    border: 'rgba(255,255,255,0.14)',
    panel: 'rgba(255,255,255,0.04)',
    panelHover: 'rgba(255,255,255,0.07)'
  };
  const serif = "'Cormorant Garamond', Georgia, serif";
  const sans = "'Inter', 'Helvetica Neue', sans-serif";

  // ============== ROUTING HELPERS ==============
  const goHome = () => { setView('home'); setAreaView(null); setPracticeView(null); setShowWaldron(false); setShowRoundForm(false); };
  const goBack = () => {
    if (showRoundForm) { setShowRoundForm(false); return; }
    if (showWaldron) { setShowWaldron(false); return; }
    if (areaView) { setAreaView(null); return; }
    if (practiceView) { setPracticeView(null); return; }
    goHome();
  };

  // ====== Swipe-right-to-go-back gesture ======
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const handleTouchStart = (e) => {
    if (view === 'home') return; // No swipe on home (nothing to go back to)
    if (roundImageFullscreen) return; // Don't interfere with fullscreen modal
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
  };
  const handleTouchEnd = (e) => {
    if (view === 'home') return;
    if (roundImageFullscreen) return;
    const t = e.changedTouches[0];
    const start = touchStartRef.current;
    if (!start.time) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    const dt = Date.now() - start.time;
    // Conditions: swipe right >80px, mostly horizontal (|dx| > 2*|dy|), under 500ms
    // And must start near the left edge (within first 40px) to avoid hijacking scrolls
    if (dx > 80 && Math.abs(dx) > Math.abs(dy) * 2 && dt < 500 && start.x < 40) {
      goBack();
    }
    touchStartRef.current = { x: 0, y: 0, time: 0 };
  };

  // ============== RENDER ==============
  // fontScale is applied as a multiplier to specific text elements
  const s = (px) => Math.round(px * fontScale);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
      background: `linear-gradient(180deg, ${C.bg2} 0%, ${C.bg} 60%)`,
      fontFamily: serif,
      color: C.text,
      padding: '16px 16px 24px',
      position: 'relative',
      minHeight: '100vh',
      boxSizing: 'border-box'
    }}>
      {/* Subtle grain texture */}
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
        opacity: 0.03, pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{ maxWidth: '780px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Back button */}
        {view !== 'home' && (
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '20px'
          }}>
            <button onClick={goBack} style={{
              background: 'transparent', border: `1px solid ${C.border}`,
              color: C.text, padding: '8px 14px',
              fontFamily: sans, fontSize: '11px',
              letterSpacing: '0.2em', textTransform: 'uppercase',
              cursor: 'pointer', borderRadius: '4px',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              opacity: 0.85
            }}>
              ← Back
            </button>

            {/* Font size toggle - visible on every non-home view */}
            <button onClick={cycleFontScale} style={{
              background: 'transparent', border: `1px solid ${C.border}`,
              color: C.accent, padding: '8px 14px',
              fontFamily: serif, cursor: 'pointer',
              borderRadius: '4px',
              display: 'inline-flex', alignItems: 'baseline', gap: '2px'
            }} title="Change text size">
              <span style={{ fontSize: '12px', opacity: 0.7 }}>a</span>
              <span style={{ fontSize: '16px', fontWeight: 500 }}>A</span>
            </button>
          </div>
        )}

        {/* ========== HOME ========== */}
        {view === 'home' && (
          <>
            <header style={{ textAlign: 'center', marginBottom: '24px', marginTop: '8px' }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '12px', marginBottom: '14px'
              }}>
                <DecoLine C={C} />
                <div style={{
                  fontSize: '10px', letterSpacing: '0.4em',
                  color: C.accent, fontFamily: sans,
                  textTransform: 'uppercase', whiteSpace: 'nowrap',
                  fontWeight: 500
                }}>
                  2026 Golf Season
                </div>
                <DecoLine C={C} />
              </div>
              <h1 style={{
                fontSize: 'clamp(32px, 8vw, 48px)', fontWeight: 400,
                margin: 0, fontStyle: 'italic',
                letterSpacing: '-0.02em', lineHeight: 1.05
              }}>
                Happymak's <span style={{ color: C.accent }}>Golf App</span>
              </h1>
            </header>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <HomeCard title="My Mantra"            subtitle="Why I play"              iconType="mantra"     C={C} serif={serif} sans={sans} onClick={() => setView('mantra')} />
              <HomeCard title="Course Management"    subtitle="DECADE · Tiger Five"     iconType="strategy"   C={C} serif={serif} sans={sans} onClick={() => setView('cm')} />
              <HomeCard title="Areas of Improvement" subtitle="Q2 2026"                 iconType="growth"     C={C} serif={serif} sans={sans} onClick={() => setView('areas')} />
              <HomeCard title="Practice Sessions"    subtitle="The Power of Six"        iconType="practice"   C={C} serif={serif} sans={sans} onClick={() => setView('practice')} />
              <HomeCard title="Latest Golf Round"    subtitle="Score, feel, notes"      iconType="round"      roundData={lastRound}      C={C} serif={serif} sans={sans} onClick={() => setView('round')} />
            </div>
          </>
        )}

        {/* ========== MANTRA ========== */}
        {view === 'mantra' && (
          <SectionHeader title="My Mantra" subtitle="Why I play" iconType="mantra" C={C} serif={serif} sans={sans}>

            <div style={{ marginBottom: '28px' }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: '12px'
              }}>
                <Label C={C} sans={sans}>My Reflection</Label>
                <button
                  onClick={() => setEditingMantra(!editingMantra)}
                  style={{
                    background: 'transparent', border: 'none',
                    color: C.accent, fontFamily: sans,
                    fontSize: '11px', letterSpacing: '0.2em',
                    textTransform: 'uppercase', cursor: 'pointer',
                    padding: '4px 8px', fontWeight: 500
                  }}
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
                    border: `1px solid ${C.accent}50`, borderRadius: '8px',
                    padding: '20px 22px', color: C.text,
                    fontFamily: serif, fontSize: `${s(19)}px`,
                    fontStyle: 'italic', lineHeight: 1.7,
                    resize: 'vertical', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              ) : (
                <div style={{
                  fontFamily: serif, fontSize: `${s(19)}px`,
                  fontStyle: 'italic', lineHeight: 1.75,
                  color: C.text, opacity: 0.95,
                  whiteSpace: 'pre-wrap'
                }}>
                  {mantraText || 'No reflection yet. Tap Edit to write one.'}
                </div>
              )}
            </div>

            {/* Quote */}
            <div style={{
              background: 'rgba(0,0,0,0.25)',
              borderLeft: `3px solid ${C.accent}`,
              padding: '24px 28px', borderRadius: '4px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute', top: '-8px', right: '20px',
                fontSize: '64px', color: C.accent, opacity: 0.18,
                fontFamily: serif, lineHeight: 1
              }}>"</div>
              <div style={{
                fontSize: '10px', letterSpacing: '0.3em',
                color: C.accent, fontFamily: sans,
                marginBottom: '12px', textTransform: 'uppercase',
                fontWeight: 500
              }}>
                Quote {quoteIdx + 1} of {mantraQuotes.length}
              </div>
              <div style={{
                fontSize: `${s(23)}px`, fontStyle: 'italic',
                lineHeight: 1.4,
                marginBottom: currentQuote.author ? '10px' : '14px'
              }}>
                "{currentQuote.text}"
              </div>
              {currentQuote.author && (
                <div style={{ fontFamily: sans, fontSize: '12px', opacity: 0.7, letterSpacing: '0.1em' }}>
                  — {currentQuote.author}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', marginTop: '18px' }}>
                <NavButton onClick={() => setQuoteIdx((quoteIdx - 1 + mantraQuotes.length) % mantraQuotes.length)} C={C} sans={sans}>← Prev</NavButton>
                <NavButton onClick={() => setQuoteIdx((quoteIdx + 1) % mantraQuotes.length)} C={C} sans={sans}>Next →</NavButton>
              </div>
            </div>

            {/* Spotify button → Bob Marley Essentials playlist */}
            <a
              href="spotify:playlist:37i9dQZF1DZ06evO0F8DZJ"
              onClick={(e) => {
                setTimeout(() => {
                  window.location.href = 'https://open.spotify.com/playlist/37i9dQZF1DZ06evO0F8DZJ';
                }, 500);
              }}
              style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '12px',
                marginTop: '24px',
                background: 'linear-gradient(135deg, #1db954 0%, #1aa34a 100%)',
                color: '#ffffff', padding: '17px 20px',
                borderRadius: '40px', textDecoration: 'none',
                fontFamily: sans, fontSize: '14px',
                letterSpacing: '0.05em', fontWeight: 600,
                boxShadow: '0 4px 18px rgba(29, 185, 84, 0.3)'
              }}
            >
              <SpotifyIcon size={22} />
              <span>Open Bob Marley · Essentials</span>
            </a>
            <div style={{
              textAlign: 'center', marginTop: '10px',
              fontSize: '10px', fontFamily: sans,
              opacity: 0.5, letterSpacing: '0.2em',
              textTransform: 'uppercase'
            }}>
              Time to play 🌴
            </div>
          </SectionHeader>
        )}

        {/* ========== AREAS LIST ========== */}
        {view === 'areas' && !areaView && (
          <SectionHeader title="Areas of Improvement" subtitle="Q2 2026" iconType="growth" C={C} serif={serif} sans={sans}>
            <div style={{
              fontStyle: 'italic', fontSize: '16px',
              textAlign: 'center', opacity: 0.75,
              marginBottom: '24px', padding: '0 12px'
            }}>
              "Lower scores live in the details."
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {areas.map((area) => (
                <div key={area.id} onClick={() => setAreaView(area.id)}
                  style={{
                    background: C.panel,
                    border: `1px solid ${C.border}`,
                    borderRadius: '8px', padding: '16px 18px',
                    cursor: 'pointer', display: 'flex',
                    alignItems: 'center', gap: '14px',
                    transition: 'all 0.2s',
                    position: 'relative', overflow: 'hidden'
                  }}
                >
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: '3px', background: area.color
                  }} />
                  <div style={{
                    fontFamily: sans, fontSize: '11px',
                    color: area.color, width: '24px',
                    textAlign: 'center', fontWeight: 600,
                    marginLeft: '6px'
                  }}>
                    {area.num}
                  </div>
                  <AreaIcon type={area.icon} color={area.color} size={30} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: `${s(19)}px`, fontStyle: 'italic', lineHeight: 1.2 }}>
                      {area.title}
                    </div>
                    <div style={{
                      fontSize: `${s(11)}px`, letterSpacing: '0.18em',
                      textTransform: 'uppercase', opacity: 0.6,
                      fontFamily: sans, marginTop: '4px'
                    }}>
                      {area.subtitle}
                    </div>
                  </div>
                  <div style={{ fontSize: '18px', opacity: 0.4, color: area.color }}>→</div>
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
                <div style={{ fontFamily: sans, fontSize: '13px', color: area.color, fontWeight: 600 }}>{area.num}</div>
                <AreaIcon type={area.icon} color={area.color} size={40} />
                <div style={{
                  fontSize: 'clamp(28px, 5.5vw, 36px)', fontStyle: 'italic',
                  lineHeight: 1.1, letterSpacing: '-0.01em', flex: 1
                }}>{area.title}</div>
              </div>
              <div style={{
                fontSize: '11px', letterSpacing: '0.3em',
                textTransform: 'uppercase', opacity: 0.6,
                fontFamily: sans, marginLeft: '76px', marginBottom: '28px'
              }}>{area.subtitle}</div>

              <div style={{
                borderLeft: `3px solid ${area.color}`,
                paddingLeft: '18px', marginBottom: '32px',
                fontSize: `${s(18)}px`, fontStyle: 'italic',
                opacity: 0.9, lineHeight: 1.5
              }}>"{area.insight}"</div>

              <div style={{ marginBottom: '22px' }}>
                <Label C={C} sans={sans} color={area.color}>Current Situation</Label>
                <div style={{ fontFamily: sans, fontSize: `${s(16)}px`, fontWeight: 300, lineHeight: 1.6 }}>
                  {area.current}
                </div>
              </div>

              <div style={{ marginBottom: '22px' }}>
                <Label C={C} sans={sans} color={area.color}>Objective</Label>
                <div style={{ fontFamily: sans, fontSize: `${s(16)}px`, fontWeight: 300, lineHeight: 1.6 }}>
                  {area.objective}
                </div>
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.22)',
                border: `1px solid ${C.border}`,
                borderRadius: '6px', padding: '18px 20px',
                marginTop: '28px'
              }}>
                <Label C={C} sans={sans}>Notes</Label>
                <div style={{ fontFamily: sans, fontSize: `${s(14)}px`, fontWeight: 300, lineHeight: 1.7, opacity: 0.85 }}>
                  {area.notes}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ========== COURSE MANAGEMENT ========== */}
        {view === 'cm' && (
          <SectionHeader title="Course Management" subtitle="DECADE · Tiger Five" iconType="strategy" C={C} serif={serif} sans={sans}>

            <div style={{
              borderLeft: `3px solid ${C.accent}`,
              paddingLeft: '18px', marginBottom: '24px',
              fontSize: '18px', fontStyle: 'italic',
              opacity: 0.9, lineHeight: 1.5
            }}>
              "Eliminate the bogeys and birdies will take care of themselves."
              <div style={{
                fontFamily: sans, fontSize: '11px', opacity: 0.6,
                letterSpacing: '0.1em', marginTop: '8px', fontStyle: 'normal'
              }}>— Scott Fawcett</div>
            </div>

            {/* Core insight banner */}
            <div style={{
              background: `linear-gradient(135deg, rgba(163,217,85,0.16) 0%, rgba(163,217,85,0.04) 100%)`,
              border: `1px solid ${C.accent}70`,
              borderRadius: '8px', padding: '20px 22px',
              marginBottom: '20px', textAlign: 'center'
            }}>
              <div style={{
                fontSize: '10px', letterSpacing: '0.3em',
                textTransform: 'uppercase', color: C.accent,
                fontFamily: sans, marginBottom: '10px', fontWeight: 500
              }}>
                Core Insight
              </div>
              <div style={{
                fontFamily: serif, fontStyle: 'italic',
                fontSize: '18px', lineHeight: 1.5
              }}>
                70–80% of improvement in scoring comes from <span style={{ color: C.accent, fontWeight: 500 }}>avoiding bogeys and worse</span> — not from making more birdies.
              </div>
            </div>

            {/* TWO COLLAPSIBLE CARDS: DECADE + Tiger Five */}
            <ExpandableCard
              title="DECADE"
              subtitle="The system · Scott Fawcett"
              description="A statistical course-management framework built on PGA Tour data. Manage shot dispersion, pick smart targets, and stop losing strokes."
              isOpen={cmExpanded === 'decade'}
              onToggle={() => setCmExpanded(cmExpanded === 'decade' ? null : 'decade')}
              C={C} serif={serif} sans={sans}
              iconColor={C.accent}
            >
              <div style={{
                fontFamily: sans, fontSize: '14px', fontWeight: 300,
                lineHeight: 1.7, opacity: 0.88, marginBottom: '20px'
              }}>
                <p style={{ marginTop: 0 }}>
                  Built on PGA Tour data and Mark Broadie's strokes-gained research. Its mission: turn every shot into a statistical decision instead of a feeling.
                </p>
                <p>
                  Fawcett's key framing: <strong style={{ color: C.text }}>your shot dispersion is a shotgun pattern, not a sniper rifle</strong>. The job is to manage that pattern.
                </p>
                <p style={{ marginBottom: 0, fontStyle: 'italic', color: C.accent }}>
                  "You gain shots by not losing shots on purpose."
                </p>
              </div>

              <div style={{
                fontSize: '11px', letterSpacing: '0.3em',
                textTransform: 'uppercase', color: C.accent,
                fontFamily: sans, marginBottom: '12px', fontWeight: 500
              }}>
                The Playbook — How to play under DECADE
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {decadePrinciples.map(p => (
                  <PrincipleRow key={p.num} num={p.num} title={p.title} body={p.body} C={C} serif={serif} sans={sans} scale={fontScale} />
                ))}
              </div>
            </ExpandableCard>

            <ExpandableCard
              title="Tiger Five"
              subtitle="5 round-killing mistakes"
              description="The five mistakes Tiger tracked in his 1999 season — when he won 8 of his last 9 events. Eliminate them and scores drop."
              isOpen={cmExpanded === 'tiger'}
              onToggle={() => setCmExpanded(cmExpanded === 'tiger' ? null : 'tiger')}
              C={C} serif={serif} sans={sans}
              iconColor={C.accent}
            >
              <div style={{
                fontFamily: sans, fontSize: '14px', fontWeight: 300,
                lineHeight: 1.7, opacity: 0.85, marginBottom: '20px'
              }}>
                Five mistakes Tiger Woods tracked during his 1999 season — when he won 8 of his last 9 events. DECADE adapted them for amateur play. Track them per round; eliminate them; scores drop.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tigerFive.map(t => (
                  <PrincipleRow key={t.num} num={t.num} title={t.title} body={t.detail} C={C} serif={serif} sans={sans} scale={fontScale} />
                ))}
              </div>
            </ExpandableCard>

          </SectionHeader>
        )}

        {/* ========== PRACTICE OVERVIEW ========== */}
        {view === 'practice' && !practiceView && !showWaldron && (
          <SectionHeader title="Practice Sessions" subtitle="The Power of Six framework" iconType="practice" C={C} serif={serif} sans={sans}>
            <div style={{
              fontStyle: 'italic', fontSize: '16px',
              textAlign: 'center', opacity: 0.75, marginBottom: '12px'
            }}>"Practice makes consistent."</div>

            <div style={{
              fontSize: '13px', fontFamily: sans,
              fontWeight: 300, opacity: 0.65,
              textAlign: 'center', marginBottom: '28px',
              padding: '0 8px', lineHeight: 1.6
            }}>
              Practice ≠ hitting balls. Clear objective, feedback, intentional repetition.
              <br />
              <span style={{ opacity: 0.8 }}>— Jim Waldron, Power of Six</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <PracticeCard tag="4.1" title="Weekly Calendar"  badge="2 sessions / week"   iconType="calendar" C={C} serif={serif} sans={sans} onClick={() => setPracticeView('calendar')} />
              <PracticeCard tag="4.2" title="Indoor Session"   badge="120 min · Trackman"  iconType="indoor"   C={C} serif={serif} sans={sans} onClick={() => setPracticeView('indoor')} />
              <PracticeCard tag="4.3" title="Outdoor Session"  badge="90 min · Short game" iconType="outdoor"  C={C} serif={serif} sans={sans} onClick={() => setPracticeView('outdoor')} />
              <PracticeCard tag="4.4" title="Practice Log"     badge={`${practiceLog.length} ${practiceLog.length === 1 ? 'entry' : 'entries'}`} iconType="log" C={C} serif={serif} sans={sans} onClick={() => setPracticeView('log')} />
            </div>

            <div onClick={() => setShowWaldron(true)} style={{
              marginTop: '20px',
              background: `linear-gradient(135deg, rgba(163,217,85,0.08) 0%, rgba(0,0,0,0.25) 100%)`,
              border: `1px solid ${C.accent}40`,
              borderRadius: '8px', padding: '18px 22px',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: '14px'
            }}>
              <BookIcon C={C} size={26} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '10px', letterSpacing: '0.3em',
                  textTransform: 'uppercase', color: C.accent,
                  fontFamily: sans, marginBottom: '4px', fontWeight: 500
                }}>Method</div>
                <div style={{ fontSize: '18px', fontFamily: serif, fontStyle: 'italic' }}>
                  Waldron Practice Concepts
                </div>
              </div>
              <div style={{ fontSize: '18px', color: C.accent }}>→</div>
            </div>
          </SectionHeader>
        )}

        {/* ========== WALDRON DETAIL ========== */}
        {view === 'practice' && showWaldron && (
          <div style={{ animation: 'fadeIn 0.4s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '6px' }}>
              <BookIcon C={C} size={38} />
              <div style={{
                fontSize: 'clamp(28px, 5.5vw, 36px)', fontStyle: 'italic',
                lineHeight: 1.1, flex: 1
              }}>Waldron Concepts</div>
            </div>
            <div style={{
              fontSize: '11px', letterSpacing: '0.3em',
              textTransform: 'uppercase', opacity: 0.6,
              fontFamily: sans, marginLeft: '54px', marginBottom: '34px'
            }}>Three pillars of intentional practice</div>

            <ConceptBlock C={C} serif={serif} sans={sans}
              title="BRTT" subtitle="Balance · Rhythm · Tempo · Timing" tag="Concept 01">
              <p>The four physical fundamentals of a repeatable swing. Not "technique" (not wrist angle, not swing plane) — they are <strong>how the movement feels</strong>.</p>
              <ul style={ulStyle}>
                <li><strong>Balance</strong> — finish the swing standing still, no falling forward or back.</li>
                <li><strong>Rhythm</strong> — fluidity of the full motion, no abrupt sections. Like a pendulum.</li>
                <li><strong>Tempo</strong> — relative speed between backswing and downswing. Tour average is <strong>3:1</strong> (backswing 3× slower than downswing).</li>
                <li><strong>Timing</strong> — synchronization of the wrist release. Not early (casting) and not late (flipping).</li>
              </ul>
              <p style={{ marginTop: '12px' }}><strong style={{ color: C.accent }}>How to apply it:</strong> through the entire session, on every ball, do a mental check: balanced at finish, fluid, slow back, releasing on time.</p>
            </ConceptBlock>

            <ConceptBlock C={C} serif={serif} sans={sans}
              title="Overkill Practice" subtitle="Fixing the fatal flaw" tag="Concept 02">
              <p>The method to fix a <em>recurring</em> error — what Waldron calls a "fatal flaw".</p>
              <p><strong>Why normal practice doesn't work:</strong> hitting 20 balls mixed with other clubs won't break a pattern. The brain reverts to the old groove every time.</p>
              <ol style={olStyle}>
                <li>Identify ONE specific error</li>
                <li>Pick ONE club (the one that most exhibits the error)</li>
                <li>Hit <strong>50–100 balls in a row</strong>, no mixing</li>
                <li>Repeat across sessions until the new pattern is automatic</li>
              </ol>
              <p><strong style={{ color: C.accent }}>When to use it:</strong> only for big errors that cost real strokes.</p>
            </ConceptBlock>

            <ConceptBlock C={C} serif={serif} sans={sans}
              title="Creative Tinkering" subtitle="Play, don't think" tag="Concept 03">
              <p>The <strong>opposite</strong> of Overkill. Here you <strong>don't think about technique</strong>.</p>
              <ul style={ulStyle}>
                <li>Pick one club (e.g. 7-iron)</li>
                <li>Hit balls trying different shots: one high, one low, a fade, a draw, a low push-cut</li>
                <li>What matters is exploring control, not technical result</li>
              </ul>
              <p><strong style={{ color: C.accent }}>When to use it:</strong> after a heavy technical block, or when you feel too mechanical.</p>
            </ConceptBlock>
          </div>
        )}

        {/* ========== CALENDAR ========== */}
        {view === 'practice' && practiceView === 'calendar' && (
          <SubSectionHeader title="Weekly Calendar" tag="4.1" iconType="calendar" C={C} serif={serif} sans={sans}>
            <div style={{
              fontSize: '14px', fontFamily: sans,
              fontWeight: 300, opacity: 0.8,
              marginBottom: '20px', lineHeight: 1.6
            }}>
              Two sessions per week: one Indoor + one Outdoor. The day for each is flexible — adjust to your schedule.
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px', marginBottom: '20px'
            }}>
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day) => (
                <div key={day} style={{
                  padding: '14px 4px', textAlign: 'center',
                  background: 'rgba(0,0,0,0.22)',
                  border: `1px solid ${C.border}`,
                  borderRadius: '4px', fontFamily: sans
                }}>
                  <div style={{ fontSize: '10px', opacity: 0.65, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{day}</div>
                  <div style={{ fontSize: '14px', marginTop: '8px', color: C.accent, opacity: 0.45 }}>—</div>
                </div>
              ))}
            </div>
            <div style={{
              display: 'flex', gap: '14px', justifyContent: 'center',
              fontSize: '13px', fontFamily: sans, opacity: 0.8
            }}>
              <span>🏠 Indoor · 120 min</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>⛳ Outdoor · 90 min</span>
            </div>
          </SubSectionHeader>
        )}

        {view === 'practice' && practiceView === 'indoor' && (
          <SubSectionHeader title="Indoor Session" tag="4.2" badge="120 min · Trackman" iconType="indoor" C={C} serif={serif} sans={sans}>
            <SessionPanel blocks={indoorBlocks} C={C} sans={sans} serif={serif} totalMin={120} sessionName="Indoor" playHoleDropSound={playHoleDropSound} />
          </SubSectionHeader>
        )}

        {view === 'practice' && practiceView === 'outdoor' && (
          <SubSectionHeader title="Outdoor Session" tag="4.3" badge="90 min · Short game focus" iconType="outdoor" C={C} serif={serif} sans={sans}>
            <SessionPanel blocks={outdoorBlocks} C={C} sans={sans} serif={serif} totalMin={90} sessionName="Outdoor" playHoleDropSound={playHoleDropSound} />
          </SubSectionHeader>
        )}

        {view === 'practice' && practiceView === 'log' && (
          <SubSectionHeader title="Practice Log" tag="4.4" badge={`${practiceLog.length} ${practiceLog.length === 1 ? 'entry' : 'entries'}`} iconType="log" C={C} serif={serif} sans={sans}>
            {!showLogForm ? (
              <button onClick={() => setShowLogForm(true)} style={{
                width: '100%', background: 'transparent',
                border: `1px dashed ${C.accent}70`,
                color: C.accent, padding: '14px',
                fontFamily: sans, fontSize: '12px',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                cursor: 'pointer', borderRadius: '6px',
                marginBottom: '20px', fontWeight: 500
              }}>+ Log a session</button>
            ) : (
              <div style={{
                background: 'rgba(0,0,0,0.25)',
                border: `1px solid ${C.accent}60`,
                borderRadius: '6px', padding: '18px',
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
                    style={{...inputStyle(C, sans), minHeight: '80px', resize: 'vertical'}} />
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
                    flex: 1, background: C.accent, border: 'none',
                    color: C.bg, padding: '12px',
                    fontFamily: sans, fontSize: '12px',
                    letterSpacing: '0.2em', textTransform: 'uppercase',
                    fontWeight: 600, cursor: 'pointer', borderRadius: '4px'
                  }}>Save</button>
                  <button onClick={() => setShowLogForm(false)} style={{
                    background: 'transparent',
                    border: `1px solid ${C.border}`,
                    color: C.text, padding: '12px 18px',
                    fontFamily: sans, fontSize: '12px',
                    letterSpacing: '0.2em', textTransform: 'uppercase',
                    cursor: 'pointer', borderRadius: '4px', opacity: 0.7
                  }}>Cancel</button>
                </div>
              </div>
            )}

            {practiceLog.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '32px',
                fontSize: '14px', fontFamily: sans,
                opacity: 0.5, fontStyle: 'italic'
              }}>No sessions logged yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {practiceLog.map(entry => (
                  <div key={entry.id} style={{
                    background: 'rgba(0,0,0,0.22)',
                    border: `1px solid ${C.border}`,
                    borderRadius: '6px', padding: '14px 16px',
                    position: 'relative'
                  }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'baseline', marginBottom: '8px'
                    }}>
                      <div style={{
                        fontFamily: sans, fontSize: '11px',
                        letterSpacing: '0.2em', textTransform: 'uppercase',
                        color: C.accent, fontWeight: 500
                      }}>
                        {entry.type === 'outdoor' ? '⛳ Outdoor' : entry.type === 'indoor' ? '🏠 Indoor' : '🏌️ Round'}
                        {entry.duration && ` · ${entry.duration} min`}
                      </div>
                      <div style={{ fontFamily: sans, fontSize: '12px', opacity: 0.6 }}>
                        {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    {entry.areas && <div style={{ fontFamily: sans, fontSize: '14px', marginBottom: '6px' }}>{entry.areas}</div>}
                    {entry.sensations && (
                      <div style={{ fontFamily: sans, fontSize: '13px', opacity: 0.8, fontWeight: 300, lineHeight: 1.5, marginBottom: '6px', whiteSpace: 'pre-wrap' }}>
                        {entry.sensations}
                      </div>
                    )}
                    {entry.nextFocus && (
                      <div style={{
                        fontFamily: sans, fontSize: '12px',
                        opacity: 0.65, fontStyle: 'italic',
                        borderTop: `1px solid ${C.border}`,
                        paddingTop: '6px', marginTop: '8px'
                      }}>→ {entry.nextFocus}</div>
                    )}
                    <button onClick={() => deleteLogEntry(entry.id)} style={{
                      position: 'absolute', top: '10px', right: '10px',
                      background: 'transparent', border: 'none',
                      color: C.text, opacity: 0.3,
                      cursor: 'pointer', fontSize: '16px', padding: '2px 6px'
                    }} title="Delete">×</button>
                  </div>
                ))}
              </div>
            )}
          </SubSectionHeader>
        )}

        {/* ========== LATEST ROUND ========== */}
        {view === 'round' && !showRoundForm && (
          <SectionHeader title="Latest Golf Round" subtitle={`${lastRound.dateDisplay} · ${lastRound.courseFull}`} iconType="round" roundData={lastRound} C={C} serif={serif} sans={sans}>

            {/* Action bar — New Round button */}
            <div style={{ marginBottom: '18px' }}>
              <button onClick={() => setShowRoundForm(true)} style={{
                width: '100%', background: 'transparent',
                border: `1px dashed ${C.accent}70`,
                color: C.accent, padding: '14px',
                fontFamily: sans, fontSize: '12px',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                cursor: 'pointer', borderRadius: '8px',
                fontWeight: 500
              }}>+ Log New Round</button>
            </div>

            <div
              onClick={() => setRoundImageFullscreen(true)}
              style={{
                borderRadius: '8px',
                overflow: 'hidden',
                border: `1px solid ${C.border}`,
                marginBottom: '20px',
                background: '#ffffff',
                cursor: 'pointer',
                position: 'relative'
              }}>
              <img src={lastRound.image} alt={`${lastRound.courseFull} scorecard - ${lastRound.dateDisplay}`}
                   style={{ width: '100%', display: 'block' }} />
              <div style={{
                position: 'absolute', top: '8px', right: '8px',
                background: 'rgba(14,42,71,0.85)',
                color: '#ffffff',
                padding: '6px 10px',
                borderRadius: '4px',
                fontFamily: sans, fontSize: '10px',
                letterSpacing: '0.15em', textTransform: 'uppercase',
                fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 2 L5 2 M2 2 L2 5 M10 2 L7 2 M10 2 L10 5 M2 10 L5 10 M2 10 L2 7 M10 10 L7 10 M10 10 L10 7"
                        stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                Tap to expand
              </div>
            </div>

            {/* Takeaways */}
            <div style={{
              background: `linear-gradient(135deg, rgba(163,217,85,0.06) 0%, rgba(0,0,0,0.25) 100%)`,
              border: `1px solid ${C.accent}40`,
              borderRadius: '8px',
              padding: '22px 24px',
              marginBottom: '18px'
            }}>
              <div style={{
                fontSize: '11px', letterSpacing: '0.3em',
                textTransform: 'uppercase', color: C.accent,
                fontFamily: sans, marginBottom: '14px', fontWeight: 500
              }}>
                Reading the Round
              </div>
              <div style={{
                fontFamily: sans, fontSize: `${s(14)}px`,
                fontWeight: 300, lineHeight: 1.7, opacity: 0.9
              }}>
                <p style={{ marginTop: 0 }}>
                  Front nine (49) much stronger than the back (53). The back fell apart with three 6s and a 7 in five holes — a stretch of compounding mistakes that DECADE would call avoidable.
                </p>
                <p>
                  Tee accuracy dropped from <strong style={{ color: C.text }}>89% out → 33% in</strong>. The driver was the leak. This matches the Q2 area of improvement — recover driver consistency.
                </p>
                <p>
                  <strong style={{ color: C.text }}>The Tiger Five count:</strong> 4 double bogeys, a triple, plus penalties on 7 holes. Eliminating the doubles alone would have put the round in the mid-90s.
                </p>
                <p style={{ marginBottom: 0 }}>
                  <strong style={{ color: C.accent }}>Best moment:</strong> hole 6 — par 3, scrambled for par from green-side trouble. Proof the short game holds up when the driver doesn't.
                </p>
              </div>
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.25)',
              border: `1px solid ${C.accent}50`,
              borderRadius: '8px',
              padding: '20px 22px'
            }}>
              <div style={{
                fontSize: '11px', letterSpacing: '0.3em',
                textTransform: 'uppercase', color: C.accent,
                fontFamily: sans, marginBottom: '12px', fontWeight: 500
              }}>
                Focus for next round
              </div>
              <ul style={{
                fontFamily: sans, fontSize: `${s(14)}px`,
                fontWeight: 300, lineHeight: 1.8, opacity: 0.9,
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

        {/* ========== NEW ROUND FORM ========== */}
        {view === 'round' && showRoundForm && (
          <NewRoundForm
            onCancel={() => setShowRoundForm(false)}
            onSave={(newRound) => {
              setLastRound(newRound);
              saveState({ lastRound: newRound });
              setShowRoundForm(false);
            }}
            C={C} serif={serif} sans={sans}
          />
        )}

        {/* Bottom Back button - shows on every non-home view */}
        {view !== 'home' && (
          <div style={{
            marginTop: '36px',
            paddingTop: '20px',
            borderTop: `1px solid ${C.border}`,
            display: 'flex',
            justifyContent: 'center'
          }}>
            <button onClick={goBack} style={{
              background: 'transparent', border: `1px solid ${C.border}`,
              color: C.text, padding: '12px 28px',
              fontFamily: sans, fontSize: '11px',
              letterSpacing: '0.25em', textTransform: 'uppercase',
              cursor: 'pointer', borderRadius: '6px',
              opacity: 0.85, fontWeight: 500,
              display: 'inline-flex', alignItems: 'center', gap: '10px'
            }}>
              ← Back
            </button>
          </div>
        )}

      </div>

      {/* ========== FULLSCREEN ROUND IMAGE MODAL (landscape) ========== */}
      {roundImageFullscreen && (
        <div
          onClick={() => setRoundImageFullscreen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: '#000000',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0'
          }}>
          {/* Close button */}
          <button
            onClick={(e) => { e.stopPropagation(); setRoundImageFullscreen(false); }}
            style={{
              position: 'fixed',
              top: '20px',
              left: '20px',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: `1px solid rgba(255,255,255,0.25)`,
              color: '#ffffff',
              padding: '10px 16px',
              fontFamily: sans,
              fontSize: '12px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              borderRadius: '6px',
              fontWeight: 500,
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
            ← Back
          </button>

          {/* Rotation hint banner */}
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'rgba(163,217,85,0.15)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${C.accent}50`,
            color: C.accent,
            padding: '10px 14px',
            fontFamily: sans,
            fontSize: '11px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            borderRadius: '6px',
            fontWeight: 500,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            maxWidth: '70vw'
          }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="5" width="12" height="7" rx="1" stroke={C.accent} strokeWidth="1.3"/>
              <path d="M6 2 Q8 1 10 2" stroke={C.accent} strokeWidth="1.3" fill="none" strokeLinecap="round"/>
              <path d="M8 0.5 L10 2 L8 3" stroke={C.accent} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Rotate phone for landscape
          </div>

          {/* The image - shown rotated 90° on portrait phones to look "landscape" */}
          <img
            src={lastRound.image}
            alt={`${lastRound.courseFull} scorecard`}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '95vw',
              maxHeight: '95vh',
              objectFit: 'contain',
              cursor: 'default'
            }}
          />
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        body { margin: 0; background: ${C.bg}; }
        textarea:focus, input:focus, select:focus { border-color: ${C.accent}80 !important; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.85); cursor: pointer; }
        /* Hide scrollbars but keep scrolling */
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// ============================================================
// COMPONENTS
// ============================================================

const ulStyle = { fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 300, lineHeight: 1.7, opacity: 0.9, paddingLeft: '18px', margin: '8px 0' };
const olStyle = { fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 300, lineHeight: 1.7, opacity: 0.9, paddingLeft: '18px', margin: '8px 0' };

function HomeCard({ title, subtitle, iconType, scoreNumber, roundData, C, serif, sans, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${C.border}`,
      borderRadius: '12px',
      padding: '18px 20px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center', gap: '18px',
      transition: 'all 0.2s'
    }}>
      <SectionIcon type={iconType} color={C.accent} size={iconType === 'round' ? 50 : 38} scoreNumber={scoreNumber} roundData={roundData} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '24px', fontStyle: 'italic', letterSpacing: '-0.01em', lineHeight: 1.1 }}>{title}</div>
        <div style={{
          fontSize: '11px', letterSpacing: '0.28em',
          textTransform: 'uppercase', opacity: 0.6,
          fontFamily: sans, marginTop: '5px', fontWeight: 500
        }}>{subtitle}</div>
      </div>
      <div style={{ fontSize: '22px', color: C.accent, opacity: 0.7 }}>→</div>
    </div>
  );
}

function SectionHeader({ title, subtitle, iconType, scoreNumber, roundData, children, C, serif, sans }) {
  return (
    <div style={{ animation: 'fadeIn 0.4s' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '6px' }}>
          {iconType && <SectionIcon type={iconType} color={C.accent} size={iconType === 'round' ? 50 : 34} scoreNumber={scoreNumber} roundData={roundData} />}
          <div style={{
            fontSize: 'clamp(32px, 6.5vw, 44px)',
            fontStyle: 'italic', lineHeight: 1.05,
            letterSpacing: '-0.02em', flex: 1
          }}>{title}</div>
        </div>
        <div style={{
          fontSize: '11px', letterSpacing: '0.3em',
          textTransform: 'uppercase', opacity: 0.6,
          fontFamily: sans, marginLeft: '48px', fontWeight: 500
        }}>{subtitle}</div>
        <div style={{ width: '40px', height: '2px', background: C.accent, marginTop: '18px', opacity: 0.7 }} />
      </div>
      {children}
    </div>
  );
}

function SubSectionHeader({ title, tag, badge, iconType, children, C, serif, sans }) {
  return (
    <div style={{ animation: 'fadeIn 0.4s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
        <div style={{ fontFamily: sans, fontSize: '12px', color: C.accent, fontWeight: 500 }}>{tag}</div>
        {iconType && <SectionIcon type={iconType} color={C.accent} size={26} />}
        <div style={{ fontSize: '28px', fontStyle: 'italic', lineHeight: 1.05 }}>{title}</div>
      </div>
      {badge && (
        <div style={{
          fontSize: '11px', letterSpacing: '0.25em',
          textTransform: 'uppercase', opacity: 0.6,
          fontFamily: sans, marginLeft: '36px', fontWeight: 500
        }}>{badge}</div>
      )}
      <div style={{ width: '32px', height: '2px', background: C.accent, marginTop: '18px', opacity: 0.6, marginBottom: '24px' }} />
      {children}
    </div>
  );
}

function PracticeCard({ tag, title, badge, iconType, C, serif, sans, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'rgba(0,0,0,0.18)',
      border: `1px solid ${C.border}`,
      borderRadius: '8px', padding: '16px 18px',
      cursor: 'pointer', display: 'flex',
      alignItems: 'center', gap: '14px'
    }}>
      <div style={{ fontFamily: sans, fontSize: '11px', color: C.accent, width: '32px', fontWeight: 500 }}>{tag}</div>
      {iconType && <SectionIcon type={iconType} color={C.accent} size={24} />}
      <div style={{ flex: 1, fontSize: '18px', fontStyle: 'italic', fontFamily: serif }}>{title}</div>
      {badge && (
        <div style={{ fontFamily: sans, fontSize: '11px', opacity: 0.7, fontWeight: 400 }}>{badge}</div>
      )}
      <div style={{ fontSize: '17px', color: C.accent, opacity: 0.6 }}>→</div>
    </div>
  );
}

function NavButton({ onClick, children, C, sans }) {
  return (
    <button onClick={onClick} style={{
      background: 'transparent', border: `1px solid ${C.border}`,
      color: C.text, opacity: 0.85,
      padding: '7px 14px', fontFamily: sans,
      fontSize: '11px', letterSpacing: '0.15em',
      textTransform: 'uppercase', cursor: 'pointer',
      borderRadius: '4px', fontWeight: 500
    }}>{children}</button>
  );
}

function Label({ children, C, sans, color }) {
  return (
    <div style={{
      fontSize: '10px', letterSpacing: '0.3em',
      textTransform: 'uppercase',
      color: color || C.accent, opacity: color ? 0.95 : 0.75,
      fontFamily: sans, marginBottom: '8px',
      fontWeight: 500
    }}>{children}</div>
  );
}

function inputStyle(C, sans) {
  return {
    width: '100%', background: 'rgba(0,0,0,0.3)',
    border: `1px solid ${C.border}`, borderRadius: '4px',
    padding: '10px 12px', color: C.text,
    fontFamily: sans, fontSize: '14px',
    fontWeight: 300, outline: 'none', boxSizing: 'border-box'
  };
}

function ExpandableCard({ title, subtitle, description, isOpen, onToggle, children, C, serif, sans, iconColor }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, rgba(163,217,85,0.05) 0%, rgba(0,0,0,0.22) 100%)`,
      border: `1px solid ${isOpen ? C.accent + '70' : C.border}`,
      borderRadius: '10px',
      marginBottom: '12px',
      overflow: 'hidden',
      transition: 'all 0.25s'
    }}>
      <div onClick={onToggle} style={{
        padding: '20px 22px', cursor: 'pointer'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
          <div style={{
            fontSize: '24px', fontFamily: serif,
            fontStyle: 'italic', color: C.accent, fontWeight: 500,
            flex: 1
          }}>{title}</div>
          <div style={{
            fontSize: '20px', color: C.accent,
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0)',
            transition: 'transform 0.25s'
          }}>+</div>
        </div>
        <div style={{
          fontSize: '11px', letterSpacing: '0.25em',
          textTransform: 'uppercase', opacity: 0.7,
          fontFamily: sans, marginBottom: '10px', fontWeight: 500
        }}>{subtitle}</div>
        <div style={{
          fontFamily: sans, fontSize: '13px',
          fontWeight: 300, lineHeight: 1.6, opacity: 0.85
        }}>{description}</div>
      </div>
      {isOpen && (
        <div style={{
          padding: '4px 22px 24px',
          borderTop: `1px solid ${C.border}`,
          animation: 'fadeIn 0.3s'
        }}>
          <div style={{ paddingTop: '20px' }}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function PrincipleRow({ num, title, body, C, serif, sans, scale = 1 }) {
  const s = (px) => Math.round(px * scale);
  return (
    <div style={{
      background: 'rgba(0,0,0,0.25)',
      border: `1px solid ${C.border}`,
      borderRadius: '6px',
      padding: '14px 16px',
      display: 'flex', gap: '14px',
      alignItems: 'flex-start'
    }}>
      <div style={{
        fontFamily: serif, fontSize: '28px',
        fontStyle: 'italic', color: C.accent,
        opacity: 0.7, lineHeight: 1,
        width: '28px', textAlign: 'center', flexShrink: 0
      }}>{num}</div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: `${s(15)}px`, fontFamily: serif,
          fontStyle: 'italic', marginBottom: '6px',
          lineHeight: 1.3
        }}>{title}</div>
        <div style={{
          fontFamily: sans, fontSize: `${s(13)}px`,
          fontWeight: 300, lineHeight: 1.6, opacity: 0.8
        }}>{body}</div>
      </div>
    </div>
  );
}

function ConceptBlock({ title, subtitle, tag, children, C, serif, sans }) {
  return (
    <div style={{
      background: 'rgba(0,0,0,0.22)',
      border: `1px solid ${C.border}`,
      borderRadius: '8px', padding: '24px 26px', marginBottom: '14px'
    }}>
      <div style={{
        fontSize: '10px', letterSpacing: '0.3em',
        textTransform: 'uppercase', color: C.accent,
        fontFamily: sans, marginBottom: '8px', fontWeight: 500
      }}>{tag}</div>
      <div style={{ fontSize: '28px', fontStyle: 'italic', fontFamily: serif, lineHeight: 1.1, marginBottom: '4px' }}>{title}</div>
      <div style={{
        fontSize: '11px', letterSpacing: '0.25em',
        textTransform: 'uppercase', opacity: 0.6,
        fontFamily: sans, marginBottom: '18px', fontWeight: 500
      }}>{subtitle}</div>
      <div style={{ fontFamily: sans, fontSize: '14px', fontWeight: 300, lineHeight: 1.7, opacity: 0.88 }}>
        {children}
      </div>
    </div>
  );
}

function SessionPanel({ blocks, C, sans, serif, totalMin, sessionName, playHoleDropSound }) {
  const [currentBlock, setCurrentBlock] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(blocks[0].min * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  const playBlockChime = () => {
    if (playHoleDropSound) playHoleDropSound();
    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
  };

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          playBlockChime();
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
    setIsRunning(false); setCurrentBlock(0);
    setSecondsLeft(blocks[0].min * 60); setCompleted(false);
  };
  const skip = () => {
    playBlockChime();
    if (currentBlock < blocks.length - 1) {
      setCurrentBlock(currentBlock + 1);
      setSecondsLeft(blocks[currentBlock + 1].min * 60);
    } else {
      setIsRunning(false); setCompleted(true); setSecondsLeft(0);
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
      <div style={{
        background: `linear-gradient(135deg, rgba(163,217,85,0.08) 0%, rgba(0,0,0,0.35) 100%)`,
        border: `1px solid ${C.accent}50`,
        borderRadius: '10px',
        padding: '22px 22px 20px',
        marginBottom: '20px'
      }}>
        <div style={{
          fontSize: '10px', letterSpacing: '0.3em',
          textTransform: 'uppercase', color: C.accent,
          fontFamily: sans, marginBottom: '12px', fontWeight: 500
        }}>
          Session Timer · {sessionName}
        </div>

        {completed ? (
          <div style={{ textAlign: 'center', padding: '18px 0' }}>
            <div style={{
              fontSize: '26px', fontStyle: 'italic',
              fontFamily: serif, marginBottom: '8px', color: C.accent
            }}>Session complete</div>
            <div style={{ fontFamily: sans, fontSize: '13px', opacity: 0.7, marginBottom: '16px' }}>
              Good work — log it in Practice Log
            </div>
            <button onClick={reset} style={{
              background: 'transparent', border: `1px solid ${C.border}`,
              color: C.text, padding: '8px 16px',
              fontFamily: sans, fontSize: '11px',
              letterSpacing: '0.2em', textTransform: 'uppercase',
              cursor: 'pointer', borderRadius: '4px'
            }}>Reset</button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '12px', fontFamily: sans, color: C.accent, fontWeight: 500, marginBottom: '4px' }}>
              Block {currentBlock + 1} of {blocks.length}
            </div>
            <div style={{ fontSize: '19px', fontFamily: serif, fontStyle: 'italic', marginBottom: '14px' }}>
              {blocks[currentBlock].name}
            </div>

            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '10px',
              padding: '8px 0', marginBottom: '6px'
            }}>
              <button onClick={() => adjustSeconds(-30)} style={{
                background: 'transparent', border: `1px solid ${C.border}`,
                color: C.text, opacity: 0.75,
                width: '46px', height: '46px',
                fontFamily: sans, fontSize: '12px',
                cursor: 'pointer', borderRadius: '50%'
              }}>–30s</button>
              <div style={{
                fontSize: '64px', fontFamily: sans,
                fontWeight: 200, color: isRunning ? C.accent : C.text,
                letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
                minWidth: '190px', textAlign: 'center'
              }}>
                {formatTime(secondsLeft)}
              </div>
              <button onClick={() => adjustSeconds(30)} style={{
                background: 'transparent', border: `1px solid ${C.border}`,
                color: C.text, opacity: 0.75,
                width: '46px', height: '46px',
                fontFamily: sans, fontSize: '12px',
                cursor: 'pointer', borderRadius: '50%'
              }}>+30s</button>
            </div>

            <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '8px', marginBottom: '6px', overflow: 'hidden' }}>
              <div style={{
                width: `${overallPct}%`, height: '100%',
                background: C.accent, transition: 'width 1s linear'
              }} />
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontFamily: sans, fontSize: '11px', opacity: 0.55,
              marginBottom: '16px'
            }}>
              <span>{Math.floor(totalDoneSeconds / 60)} min done</span>
              <span>{Math.floor(totalSeconds / 60)} min total</span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setIsRunning(!isRunning)} style={{
                flex: 1, background: isRunning ? 'transparent' : C.accent,
                border: isRunning ? `1px solid ${C.accent}` : 'none',
                color: isRunning ? C.accent : C.bg,
                padding: '13px', fontFamily: sans,
                fontSize: '12px', letterSpacing: '0.2em',
                textTransform: 'uppercase', fontWeight: 600,
                cursor: 'pointer', borderRadius: '4px'
              }}>
                {isRunning ? '❚❚ Pause' : '▶ Start'}
              </button>
              <button onClick={skip} style={{
                background: 'transparent', border: `1px solid ${C.border}`,
                color: C.text, opacity: 0.85,
                padding: '13px 16px', fontFamily: sans,
                fontSize: '12px', letterSpacing: '0.2em',
                textTransform: 'uppercase', cursor: 'pointer',
                borderRadius: '4px'
              }}>Skip ▸</button>
              <button onClick={reset} style={{
                background: 'transparent', border: `1px solid ${C.border}`,
                color: C.text, opacity: 0.65,
                padding: '13px 16px', fontFamily: sans,
                fontSize: '13px', cursor: 'pointer',
                borderRadius: '4px'
              }}>↺</button>
            </div>

            <div style={{
              marginTop: '12px', fontSize: '11px',
              fontFamily: sans, opacity: 0.5,
              textAlign: 'center', lineHeight: 1.5
            }}>
              Keep screen on. Tap any block below to jump to it.
            </div>
          </>
        )}
      </div>

      <div>
        <div style={{
          fontSize: '10px', letterSpacing: '0.3em',
          textTransform: 'uppercase', opacity: 0.65,
          fontFamily: sans, marginBottom: '14px', fontWeight: 500
        }}>Session Blocks</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
          {blocks.map((block, i) => {
            const isCurrent = i === currentBlock && !completed;
            const isDone = i < currentBlock || (completed && i <= currentBlock);
            return (
              <div key={i} onClick={() => jumpToBlock(i)} style={{
                background: isCurrent ? `rgba(163,217,85,0.12)` : 'rgba(0,0,0,0.22)',
                border: `1px solid ${isCurrent ? C.accent + '70' : C.border}`,
                borderRadius: '6px',
                padding: '14px 16px',
                display: 'flex', gap: '14px',
                alignItems: 'flex-start',
                cursor: 'pointer',
                opacity: isDone ? 0.55 : 1
              }}>
                <div style={{
                  fontFamily: sans, fontSize: '11px',
                  color: C.accent, fontWeight: 500,
                  width: '22px', textAlign: 'center', marginTop: '2px'
                }}>
                  {isDone && !isCurrent ? '✓' : String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'baseline', marginBottom: '5px', gap: '10px'
                  }}>
                    <div style={{ fontSize: '16px', fontFamily: serif, fontStyle: 'italic' }}>{block.name}</div>
                    <div style={{ fontFamily: sans, fontSize: '11px', color: C.accent, fontWeight: 500, whiteSpace: 'nowrap' }}>{block.min} min</div>
                  </div>
                  <div style={{ fontFamily: sans, fontSize: '13px', fontWeight: 300, opacity: 0.75, lineHeight: 1.5 }}>{block.detail}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{
          textAlign: 'right', fontFamily: sans,
          fontSize: '12px', opacity: 0.8, paddingTop: '8px',
          borderTop: `1px solid ${C.border}`, fontWeight: 500
        }}>
          Total: <span style={{ color: C.accent }}>{totalMin} min</span>
        </div>
      </div>
    </>
  );
}

// ============================================================
// ICONS
// ============================================================

function DecoLine({ C }) {
  return (
    <svg width="48" height="6" viewBox="0 0 48 6" style={{ flexShrink: 0 }}>
      <line x1="0" y1="3" x2="20" y2="3" stroke={C.accent} strokeWidth="0.8" opacity="0.5" />
      <circle cx="24" cy="3" r="1.4" fill={C.accent} opacity="0.8" />
      <line x1="28" y1="3" x2="48" y2="3" stroke={C.accent} strokeWidth="0.8" opacity="0.5" />
    </svg>
  );
}

function SpotifyIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#ffffff">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.78-.179-.9-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  );
}

function BookIcon({ C, size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M5 7 L5 25 Q11 23 16 24 Q21 23 27 25 L27 7 Q21 5 16 7 Q11 5 5 7 Z" stroke={C.accent} strokeWidth="1.2" opacity="0.9" fill="none" />
      <line x1="16" y1="7" x2="16" y2="24" stroke={C.accent} strokeWidth="0.8" opacity="0.55" />
      <line x1="8" y1="12" x2="13" y2="12" stroke={C.accent} strokeWidth="0.7" opacity="0.55" />
      <line x1="8" y1="16" x2="13" y2="16" stroke={C.accent} strokeWidth="0.7" opacity="0.55" />
      <line x1="19" y1="12" x2="24" y2="12" stroke={C.accent} strokeWidth="0.7" opacity="0.55" />
      <line x1="19" y1="16" x2="24" y2="16" stroke={C.accent} strokeWidth="0.7" opacity="0.55" />
    </svg>
  );
}

// SECTION ICONS

// ============================================================
// SECTION ICONS — line-art style, lime accent
// Based on user reference image (May 18, 2026)
// ============================================================
function SectionIcon({ type, color, size = 28, scoreNumber, roundData }) {
  const props = { width: size, height: size, viewBox: '-16 -16 32 32', fill: 'none' };
  const stroke = { stroke: color, strokeWidth: 1.1, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };

  // === MANTRA: meditation figure with lotus petals + aura rays ===
  if (type === 'mantra') {
    return (
      <svg {...props}>
        {/* Aura rays (top) */}
        <line x1="0" y1="-15" x2="0" y2="-13" {...stroke} />
        <line x1="-5" y1="-13" x2="-4" y2="-11.5" {...stroke} />
        <line x1="5" y1="-13" x2="4" y2="-11.5" {...stroke} />
        <line x1="-8" y1="-10" x2="-6.5" y2="-9" {...stroke} />
        <line x1="8" y1="-10" x2="6.5" y2="-9" {...stroke} />
        {/* Head */}
        <circle cx="0" cy="-7.5" r="2.4" {...stroke} />
        {/* Torso/body with hands in prayer */}
        <path d="M -3.5 -2
                 Q -4 -5 -2 -5
                 L -0.5 -3
                 L 0 -1
                 L 0.5 -3
                 L 2 -5
                 Q 4 -5 3.5 -2
                 Q 3.5 1 2 2.5
                 L -2 2.5
                 Q -3.5 1 -3.5 -2 Z"
              {...stroke} />
        {/* Lotus base - crossed legs */}
        <path d="M -3 2.5
                 Q -6 4 -7 6
                 Q -5 9 -2 8
                 Q 0 7 2 8
                 Q 5 9 7 6
                 Q 6 4 3 2.5
                 Z" {...stroke} />
        {/* Lotus petals - left */}
        <path d="M -7 5
                 Q -11 5 -12 8
                 Q -10 10 -8 8 Z" {...stroke} />
        {/* Lotus petals - right */}
        <path d="M 7 5
                 Q 11 5 12 8
                 Q 10 10 8 8 Z" {...stroke} />
        {/* Lotus petals - outer left */}
        <path d="M -10 7
                 Q -13 9 -12 11
                 Q -10 11 -8 9 Z" {...stroke} />
        {/* Lotus petals - outer right */}
        <path d="M 10 7
                 Q 13 9 12 11
                 Q 10 11 8 9 Z" {...stroke} />
      </svg>
    );
  }

  // === STRATEGY: chess KING with cross on top ===
  if (type === 'strategy') {
    return (
      <svg {...props}>
        {/* Cross on top */}
        <line x1="0" y1="-15" x2="0" y2="-11" {...stroke} strokeWidth="1.3" />
        <line x1="-1.5" y1="-13" x2="1.5" y2="-13" {...stroke} strokeWidth="1.3" />
        {/* Crown - upper portion (a small dome with band) */}
        <ellipse cx="0" cy="-9" rx="3.5" ry="1.5" {...stroke} />
        <path d="M -3.5 -9 L -3.5 -7" {...stroke} />
        <path d="M 3.5 -9 L 3.5 -7" {...stroke} />
        <ellipse cx="0" cy="-7" rx="3.5" ry="1.2" {...stroke} />
        {/* Neck/collar band */}
        <ellipse cx="0" cy="-5.5" rx="4.5" ry="1.3" {...stroke} />
        <path d="M -4.5 -5.5 L -4.5 -4" {...stroke} />
        <path d="M 4.5 -5.5 L 4.5 -4" {...stroke} />
        <ellipse cx="0" cy="-4" rx="4.5" ry="1.2" {...stroke} />
        {/* Body - tapering inward */}
        <path d="M -4 -3
                 Q -4 -1 -2.5 0
                 Q -2 2 -2.5 4
                 L 2.5 4
                 Q 2 2 2.5 0
                 Q 4 -1 4 -3 Z" {...stroke} />
        {/* Base - wide platform */}
        <ellipse cx="0" cy="5" rx="5.5" ry="1.4" {...stroke} />
        <path d="M -5.5 5 L -5.5 7" {...stroke} />
        <path d="M 5.5 5 L 5.5 7" {...stroke} />
        <ellipse cx="0" cy="7" rx="5.5" ry="1.3" {...stroke} />
        {/* Bottom */}
        <ellipse cx="0" cy="8.5" rx="6.5" ry="1.5" {...stroke} />
      </svg>
    );
  }

  // === GROWTH: descending bars + downward arrow + golf ball ===
  // (per reference image: bars going down with arrow, ball top-right)
  if (type === 'growth') {
    return (
      <svg {...props}>
        {/* Golf ball top-right */}
        <circle cx="8" cy="-8" r="5" {...stroke} />
        {/* Ball dimples */}
        <circle cx="6.5" cy="-9.5" r="0.4" fill={color} opacity="0.7"/>
        <circle cx="8" cy="-10" r="0.4" fill={color} opacity="0.7"/>
        <circle cx="9.5" cy="-9.5" r="0.4" fill={color} opacity="0.7"/>
        <circle cx="6" cy="-8" r="0.4" fill={color} opacity="0.7"/>
        <circle cx="8" cy="-8" r="0.4" fill={color} opacity="0.7"/>
        <circle cx="10" cy="-8" r="0.4" fill={color} opacity="0.7"/>
        <circle cx="6.5" cy="-6.5" r="0.4" fill={color} opacity="0.7"/>
        <circle cx="8" cy="-6" r="0.4" fill={color} opacity="0.7"/>
        <circle cx="9.5" cy="-6.5" r="0.4" fill={color} opacity="0.7"/>

        {/* Descending bars - 4 bars, each smaller */}
        <rect x="-12" y="-2" width="3" height="11" {...stroke} />
        <rect x="-7.5" y="0" width="3" height="9" {...stroke} />
        <rect x="-3" y="3" width="3" height="6" {...stroke} />
        <rect x="1.5" y="5" width="3" height="4" {...stroke} />

        {/* Baseline */}
        <line x1="-13" y1="9" x2="9" y2="9" {...stroke} />

        {/* Descending arrow line going through bars */}
        <polyline points="-11,-4 -7,-2 -3,1 3,4 7,6"
                  {...stroke} strokeWidth="1.3" />
        {/* Arrowhead */}
        <polyline points="5.5,7 7.5,6.3 6.8,4.3" {...stroke} strokeWidth="1.3" />
      </svg>
    );
  }

  // === PRACTICE: golfer in swing finish (cleaner silhouette) ===
  if (type === 'practice') {
    return (
      <svg {...props}>
        {/* Cap */}
        <path d="M -2 -9 L 2.5 -9 L 3 -8 L -2.5 -8 Z" {...stroke} />
        <path d="M 0 -10 L 2.5 -9 L 3 -10" {...stroke} />
        {/* Head */}
        <circle cx="0" cy="-7" r="2" {...stroke} />
        {/* Body - swing finish (twisted) */}
        <path d="M -1 -5
                 Q -2 -3 -1 0
                 Q 0.5 2 0 4
                 L 1.5 4
                 Q 2.5 2 3 0
                 Q 3.5 -3 2 -5 Z" {...stroke} />
        {/* Front arm raised holding club */}
        <path d="M 2 -5
                 Q 5 -7 7 -10
                 L 8 -9.5
                 Q 6 -6 3 -4 Z" {...stroke} />
        {/* Club shaft */}
        <line x1="7.5" y1="-10" x2="3" y2="-13" {...stroke} strokeWidth="1.2" />
        {/* Club head */}
        <ellipse cx="2.5" cy="-13" rx="1.4" ry="0.8" {...stroke}
                 transform="rotate(-35 2.5 -13)" />
        {/* Back arm folded across */}
        <path d="M -1 -5
                 Q -3 -3 -3.5 -1
                 L -2 -0.5
                 Q -1 -2 0 -4 Z" {...stroke} />
        {/* Hips */}
        <rect x="-1.5" y="4" width="4" height="2" {...stroke} />
        {/* Front leg straight */}
        <path d="M -1 6 L 1 6 L 0.5 12 L -2 12 Z" {...stroke} />
        {/* Back leg - knee bent inward (swing finish) */}
        <path d="M 1 6 L 3 6 L 4 12 L 2 12 Z" {...stroke} />
        {/* Ground line */}
        <line x1="-5" y1="12" x2="6" y2="12" {...stroke} strokeWidth="0.8" />
      </svg>
    );
  }

  // === ROUND: rectangle with course name + par/over par + total score ===
  if (type === 'round') {
    const r = roundData || {};
    const courseShort = r.courseShort || 'COURSE';
    const par = r.coursePar !== undefined ? r.coursePar : 72;
    const overPar = r.overPar !== undefined ? r.overPar : 30;
    const overParStr = overPar > 0 ? `+${overPar}` : `${overPar}`;
    const grossScore = r.grossScore !== undefined ? r.grossScore : 102;
    const scoreStr = String(grossScore);
    const scoreFontSize = scoreStr.length === 2 ? 11 : scoreStr.length === 3 ? 9 : 7;

    // Adapt course name font-size to length
    const nameLen = courseShort.length;
    const nameFontSize = nameLen <= 5 ? 3.8 : nameLen <= 7 ? 3.2 : nameLen <= 9 ? 2.7 : 2.3;
    const nameSpacing = nameLen <= 5 ? '0.2em' : nameLen <= 7 ? '0.15em' : '0.05em';

    return (
      <svg {...props}>
        {/* Outer rectangle */}
        <rect x="-12" y="-12" width="24" height="22" rx="1.5" {...stroke} />

        {/* Course name - top center */}
        <text x="0" y="-7.5" textAnchor="middle"
              fill={color}
              fontFamily="'Inter', sans-serif"
              fontSize={nameFontSize}
              fontWeight="600"
              letterSpacing={nameSpacing}>
          {courseShort}
        </text>

        {/* Horizontal divider */}
        <line x1="-12" y1="-5.5" x2="12" y2="-5.5" {...stroke} strokeWidth="0.8" />

        {/* Vertical divider (top portion only) */}
        <line x1="0" y1="-5.5" x2="0" y2="-1.5" {...stroke} strokeWidth="0.8" />

        {/* PAR (top-left) */}
        <text x="-6" y="-2.5" textAnchor="middle"
              fill={color}
              fontFamily="Georgia, serif"
              fontStyle="italic"
              fontSize="4.5"
              fontWeight="500">
          {par}
        </text>

        {/* OVER PAR (top-right) */}
        <text x="6" y="-2.5" textAnchor="middle"
              fill={color}
              fontFamily="Georgia, serif"
              fontStyle="italic"
              fontSize="4.5"
              fontWeight="500">
          {overParStr}
        </text>

        {/* Horizontal divider below top row */}
        <line x1="-12" y1="-1.5" x2="12" y2="-1.5" {...stroke} strokeWidth="0.8" />

        {/* TOTAL SCORE - big, centered */}
        <text x="0" y="7"
              textAnchor="middle"
              fill={color}
              fontFamily="Georgia, serif"
              fontStyle="italic"
              fontSize={scoreFontSize}
              fontWeight="600">
          {scoreStr}
        </text>
      </svg>
    );
  }

  // === Practice sub-icons (calendar, indoor, outdoor, log) ===
  // These remain from earlier - kept for sub-section views
  if (type === 'calendar') {
    return (
      <svg {...props}>
        <rect x="-11" y="-7" width="22" height="20" rx="1.5" {...stroke} />
        <line x1="-11" y1="-2" x2="11" y2="-2" {...stroke} />
        <line x1="-6" y1="-10" x2="-6" y2="-5" {...stroke} strokeWidth="1.4" />
        <line x1="6" y1="-10" x2="6" y2="-5" {...stroke} strokeWidth="1.4" />
        <circle cx="-5" cy="4" r="1.4" fill={color} opacity="0.7" />
        <circle cx="5" cy="8" r="1.4" fill={color} opacity="0.7" />
      </svg>
    );
  }

  if (type === 'indoor') {
    return (
      <svg {...props}>
        <rect x="-12" y="-9" width="24" height="16" rx="1.5" {...stroke} />
        <line x1="-4" y1="7" x2="-4" y2="11" {...stroke} />
        <line x1="4" y1="7" x2="4" y2="11" {...stroke} />
        <line x1="-8" y1="11" x2="8" y2="11" {...stroke} />
        <path d="M -8 3 Q -4 -4 0 -2 Q 4 0 8 -6" {...stroke} strokeWidth="1" />
      </svg>
    );
  }

  if (type === 'outdoor') {
    return (
      <svg {...props}>
        <circle cx="0" cy="-3" r="4.5" {...stroke} />
        <line x1="0" y1="-12" x2="0" y2="-9.5" {...stroke} />
        <line x1="0" y1="3.5" x2="0" y2="6" {...stroke} />
        <line x1="-9" y1="-3" x2="-6.5" y2="-3" {...stroke} />
        <line x1="6.5" y1="-3" x2="9" y2="-3" {...stroke} />
        <path d="M -12 12 Q -8 8 -4 12 Q 0 8 4 12 Q 8 8 12 12" {...stroke} />
      </svg>
    );
  }

  if (type === 'log') {
    return (
      <svg {...props}>
        <rect x="-10" y="-12" width="20" height="23" rx="1.5" {...stroke} />
        <line x1="-6" y1="-6" x2="6" y2="-6" {...stroke} strokeWidth="0.9" opacity="0.7" />
        <line x1="-6" y1="-2" x2="6" y2="-2" {...stroke} strokeWidth="0.9" opacity="0.7" />
        <line x1="-6" y1="2" x2="2" y2="2" {...stroke} strokeWidth="0.9" opacity="0.7" />
        <line x1="-6" y1="6" x2="4" y2="6" {...stroke} strokeWidth="0.9" opacity="0.7" />
      </svg>
    );
  }

  return null;
}



// ============================================================
// NEW ROUND FORM
// ============================================================

// ============================================================
// AREA ICONS — based on user reference (May 18, 2026)
// Line-art style, each in its own color for distinction
// ============================================================
// ============================================================
// NEW ROUND FORM - simplified: just course name + image
// AI analysis will be added in next iteration (Anthropic API)
// ============================================================
function NewRoundForm({ onCancel, onSave, C, serif, sans }) {
  // Common Miami-area courses for quick suggestions
  const courseSuggestions = [
    'Miami Beach',
    'Normandy',
    'Crandon',
    'Biltmore',
    'Shores',
    'Lakes',
    'Doral',
    'International Links'
  ];

  const [courseName, setCourseName] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setImagePreview(dataUrl);
      setImageDataUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!courseName.trim() || !imageDataUrl) {
      alert('Please enter the course name and upload the scorecard image.');
      return;
    }

    const now = new Date();
    const dateDisplay = now.toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    });

    const newRound = {
      courseShort: courseName.toUpperCase().trim(),
      courseFull: courseName.trim(),
      date: now.toISOString().split('T')[0],
      dateDisplay: dateDisplay,
      coursePar: 72,
      overPar: 0, // Will be set when AI analysis runs (or manually edited later)
      grossScore: 0,
      netScore: null,
      differential: null,
      teeColor: 'Blue',
      yards: null,
      slope: null,
      courseHandicap: 19,
      image: imageDataUrl,
      notes: '',
      aiAnalysis: null // Reserved for future API integration
    };
    onSave(newRound);
  };

  const filteredSuggestions = courseSuggestions.filter(s =>
    s.toLowerCase().includes(courseName.toLowerCase()) && s.toLowerCase() !== courseName.toLowerCase()
  );

  const inputBase = {
    width: '100%', background: 'rgba(0,0,0,0.3)',
    border: `1px solid ${C.border}`, borderRadius: '4px',
    padding: '12px 14px', color: C.text,
    fontFamily: sans, fontSize: '15px',
    fontWeight: 300, outline: 'none', boxSizing: 'border-box'
  };
  const labelStyle = {
    fontSize: '10px', letterSpacing: '0.3em',
    textTransform: 'uppercase', color: C.accent,
    fontFamily: sans, marginBottom: '8px',
    fontWeight: 500, display: 'block'
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '6px' }}>
        <div style={{
          fontSize: 'clamp(28px, 6vw, 38px)', fontStyle: 'italic',
          lineHeight: 1.05, flex: 1
        }}>Log New Round</div>
      </div>
      <div style={{
        fontSize: '11px', letterSpacing: '0.3em',
        textTransform: 'uppercase', opacity: 0.6,
        fontFamily: sans, fontWeight: 500
      }}>Course + scorecard. AI analysis coming next.</div>
      <div style={{ width: '40px', height: '2px', background: C.accent, marginTop: '18px', opacity: 0.7, marginBottom: '28px' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

        {/* Course Name with autocomplete */}
        <div>
          <label style={labelStyle}>Course Name</label>
          <div style={{ position: 'relative' }}>
            <input type="text"
              placeholder="Normandy"
              value={courseName}
              onChange={(e) => { setCourseName(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              style={inputBase} />

            {/* Suggestion dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0, right: 0,
                background: '#173d63',
                border: `1px solid ${C.accent}60`,
                borderRadius: '6px',
                overflow: 'hidden',
                zIndex: 10,
                boxShadow: '0 6px 24px rgba(0,0,0,0.5)'
              }}>
                {filteredSuggestions.map((s, i) => (
                  <div key={i}
                    onMouseDown={() => { setCourseName(s); setShowSuggestions(false); }}
                    style={{
                      padding: '11px 14px',
                      fontFamily: sans, fontSize: '14px',
                      color: C.text, cursor: 'pointer',
                      borderBottom: i < filteredSuggestions.length - 1 ? `1px solid ${C.border}` : 'none',
                      transition: 'background 0.15s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(163,217,85,0.1)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ fontFamily: sans, fontSize: '11px', opacity: 0.5, marginTop: '6px' }}>
            Will show in uppercase on the round card (e.g. NORMANDY)
          </div>
        </div>

        {/* Image upload */}
        <div>
          <label style={labelStyle}>Scorecard Image</label>
          <div style={{
            border: `1px dashed ${C.accent}70`,
            borderRadius: '8px',
            padding: '24px',
            textAlign: 'center',
            cursor: 'pointer',
            position: 'relative',
            background: imagePreview ? 'transparent' : 'rgba(0,0,0,0.18)',
            transition: 'all 0.2s'
          }}>
            <input type="file" accept="image/*"
              onChange={handleImageUpload}
              style={{
                position: 'absolute', inset: 0,
                opacity: 0, cursor: 'pointer'
              }} />
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Scorecard preview"
                  style={{ maxWidth: '100%', borderRadius: '4px', display: 'block', margin: '0 auto' }} />
                <div style={{
                  marginTop: '12px', fontSize: '11px',
                  color: C.accent, fontFamily: sans,
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  fontWeight: 500
                }}>
                  Tap to change image
                </div>
              </>
            ) : (
              <>
                <div style={{
                  fontSize: '32px', color: C.accent,
                  opacity: 0.7, marginBottom: '8px'
                }}>📸</div>
                <div style={{
                  fontFamily: sans, fontSize: '14px',
                  color: C.accent, fontWeight: 500
                }}>
                  Tap to upload scorecard
                </div>
                <div style={{
                  fontFamily: sans, fontSize: '11px',
                  opacity: 0.5, marginTop: '4px'
                }}>
                  PNG or JPG from your camera roll
                </div>
              </>
            )}
          </div>
        </div>

        {/* Notice about AI analysis */}
        <div style={{
          background: 'rgba(163,217,85,0.06)',
          border: `1px solid ${C.accent}30`,
          borderRadius: '8px',
          padding: '14px 16px',
          display: 'flex', alignItems: 'flex-start', gap: '12px'
        }}>
          <div style={{ fontSize: '20px' }}>✨</div>
          <div style={{
            fontFamily: sans, fontSize: '12px',
            fontWeight: 300, lineHeight: 1.6, opacity: 0.85
          }}>
            AI Analysis will be added in the next update. For now, the round will be saved with the image and you'll see it on the home card.
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          <button onClick={handleSave} style={{
            flex: 1, background: C.accent, border: 'none',
            color: C.bg, padding: '14px',
            fontFamily: sans, fontSize: '12px',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            fontWeight: 600, cursor: 'pointer', borderRadius: '6px'
          }}>Save Round</button>
          <button onClick={onCancel} style={{
            background: 'transparent',
            border: `1px solid ${C.border}`,
            color: C.text, padding: '14px 22px',
            fontFamily: sans, fontSize: '12px',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            cursor: 'pointer', borderRadius: '6px', opacity: 0.7
          }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function AreaIcon({ type, color, size = 30 }) {
  const props = { width: size, height: size, viewBox: '-16 -16 32 32', fill: 'none' };
  const stroke = { stroke: color, strokeWidth: 1.2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };

  // 1. TEMPO: Metronome
  if (type === 'tempo') {
    return (
      <svg {...props}>
        {/* Triangular body */}
        <path d="M -10 12 L -5 -12 L 5 -12 L 10 12 Z" {...stroke} />
        {/* Base line */}
        <line x1="-12" y1="13" x2="12" y2="13" {...stroke} />
        {/* Feet */}
        <line x1="-10" y1="13" x2="-10" y2="14.5" {...stroke} />
        <line x1="10" y1="13" x2="10" y2="14.5" {...stroke} />
        {/* Vertical reference line with ticks (dashed) */}
        <line x1="0" y1="-8" x2="0" y2="9"
              stroke={color} strokeWidth="0.8" fill="none"
              strokeDasharray="1.5 1.2" strokeLinecap="round" />
        {/* Pendulum rod */}
        <line x1="0" y1="9" x2="6" y2="-9" {...stroke} />
        {/* Pendulum weight */}
        <circle cx="6" cy="-9" r="1.6" {...stroke} />
        {/* Pivot point */}
        <circle cx="0" cy="9" r="1.2" stroke={color} strokeWidth="1.1" fill="none" />
      </svg>
    );
  }

  // 2. ELEVATED CHIP AND PITCH: high arc to flag in hole
  if (type === 'elevated') {
    return (
      <svg {...props}>
        {/* Ball start */}
        <circle cx="-10" cy="6" r="1.4" {...stroke} />
        {/* High arc trajectory (dashed) */}
        <path d="M -10 6 Q -2 -12 6 6"
              stroke={color} strokeWidth="1.3" fill="none"
              strokeDasharray="1.8 1.5" strokeLinecap="round" />
        {/* Hole ellipse */}
        <ellipse cx="6" cy="7" rx="3" ry="0.8" {...stroke} strokeWidth="1.1" />
        {/* Flag pole */}
        <line x1="6" y1="6" x2="6" y2="-6" {...stroke} />
        {/* Flag */}
        <path d="M 6 -6 L 12 -4.5 L 6 -3 Z" {...stroke} />
      </svg>
    );
  }

  // 3. CHIP & RUN: ball with dimples + low arc + roll to flag
  if (type === 'chiprun') {
    return (
      <svg {...props}>
        {/* Ball */}
        <circle cx="-11" cy="3" r="2" {...stroke} />
        {/* Dimples */}
        <circle cx="-11.7" cy="2.3" r="0.25" fill={color} />
        <circle cx="-11" cy="2.3" r="0.25" fill={color} />
        <circle cx="-10.3" cy="2.3" r="0.25" fill={color} />
        <circle cx="-11.7" cy="3" r="0.25" fill={color} />
        <circle cx="-11" cy="3" r="0.25" fill={color} />
        <circle cx="-10.3" cy="3" r="0.25" fill={color} />
        <circle cx="-11.7" cy="3.7" r="0.25" fill={color} />
        <circle cx="-11" cy="3.7" r="0.25" fill={color} />
        <circle cx="-10.3" cy="3.7" r="0.25" fill={color} />
        {/* Low arc + run trajectory */}
        <path d="M -9 3 Q -5 -1 -1 2 Q 2 4 5 4 L 7 4"
              stroke={color} strokeWidth="1.3" fill="none"
              strokeDasharray="1.5 1.5" strokeLinecap="round" />
        {/* Hole */}
        <ellipse cx="7" cy="5" rx="2.5" ry="0.7" {...stroke} strokeWidth="1.1" />
        {/* Flag pole */}
        <line x1="7" y1="4" x2="7" y2="-8" {...stroke} />
        {/* Flag */}
        <path d="M 7 -8 L 13 -6.5 L 7 -5 Z" {...stroke} />
      </svg>
    );
  }

  // 4. TEE SHOT: ball with dimples on tee
  if (type === 'tee') {
    return (
      <svg {...props}>
        {/* Ball */}
        <circle cx="0" cy="-5" r="4.5" {...stroke} />
        {/* Dimples grid */}
        <circle cx="-1.8" cy="-6.5" r="0.3" fill={color} />
        <circle cx="0" cy="-7" r="0.3" fill={color} />
        <circle cx="1.8" cy="-6.5" r="0.3" fill={color} />
        <circle cx="-2.5" cy="-5" r="0.3" fill={color} />
        <circle cx="-0.8" cy="-5" r="0.3" fill={color} />
        <circle cx="0.8" cy="-5" r="0.3" fill={color} />
        <circle cx="2.5" cy="-5" r="0.3" fill={color} />
        <circle cx="-1.8" cy="-3.5" r="0.3" fill={color} />
        <circle cx="0" cy="-3" r="0.3" fill={color} />
        <circle cx="1.8" cy="-3.5" r="0.3" fill={color} />
        {/* Tee cup */}
        <path d="M -2 -0.5 L 2 -0.5 L 1.3 1 L -1.3 1 Z" {...stroke} />
        {/* Tee stem */}
        <line x1="0" y1="1" x2="0" y2="10" {...stroke} />
        {/* Ground */}
        <line x1="-7" y1="10" x2="7" y2="10" stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  // 5. WEDGE: target rings with flag in center
  if (type === 'wedge') {
    return (
      <svg {...props}>
        {/* Outer target ring (ellipse - perspective) */}
        <ellipse cx="0" cy="4" rx="11" ry="3.5" {...stroke} />
        {/* Middle ring */}
        <ellipse cx="0" cy="4" rx="7" ry="2.3" {...stroke} />
        {/* Inner ring */}
        <ellipse cx="0" cy="4" rx="3.5" ry="1.2" {...stroke} />
        {/* Center dot */}
        <circle cx="0" cy="4" r="0.9" fill={color} />
        {/* Flag pole rising from center */}
        <line x1="0" y1="4" x2="0" y2="-8" {...stroke} strokeWidth="1.3" />
        {/* Flag (filled) */}
        <path d="M 0 -8 L 6 -6.5 L 0 -5 Z" fill={color} stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    );
  }

  // 6. PRE-SHOT ROUTINE: numbered circles 1, 2, 3 with arrows
  if (type === 'preshot') {
    return (
      <svg {...props}>
        {/* Step 1 */}
        <circle cx="-8" cy="-7" r="2.5" {...stroke} />
        <text x="-8" y="-5.7" textAnchor="middle" fill={color}
              fontFamily="'Inter', sans-serif" fontSize="3" fontWeight="700">1</text>
        <line x1="-4.5" y1="-7" x2="3" y2="-7" {...stroke} strokeWidth="1.3" />
        <polyline points="2,-8.5 3.5,-7 2,-5.5" {...stroke} strokeWidth="1.3" />

        {/* Step 2 */}
        <circle cx="-8" cy="0" r="2.5" {...stroke} />
        <text x="-8" y="1.3" textAnchor="middle" fill={color}
              fontFamily="'Inter', sans-serif" fontSize="3" fontWeight="700">2</text>
        <line x1="-4.5" y1="0" x2="5" y2="0" {...stroke} strokeWidth="1.3" />
        <polyline points="4,-1.5 5.5,0 4,1.5" {...stroke} strokeWidth="1.3" />

        {/* Step 3 */}
        <circle cx="-8" cy="7" r="2.5" {...stroke} />
        <text x="-8" y="8.3" textAnchor="middle" fill={color}
              fontFamily="'Inter', sans-serif" fontSize="3" fontWeight="700">3</text>
        <line x1="-4.5" y1="7" x2="7" y2="7" {...stroke} strokeWidth="1.3" />
        <polyline points="6,5.5 7.5,7 6,8.5" {...stroke} strokeWidth="1.3" />
      </svg>
    );
  }
  return null;
}
