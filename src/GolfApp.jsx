import React, { useState, useEffect, useRef } from 'react';
import {
  Heart, Crown, TrendingDown, Repeat, Flag, Trophy,
  WavesHorizontal, Rocket, Goal, ListChecks
} from 'lucide-react';

// =====================================================================
// HAPPY GOLF — 2026 Season App
// The Grint color palette · Compact UX · Optimized for iPhone Max
// =====================================================================

export default function GolfApp() {
  const [view, setView] = useState('home');
  const [areaView, setAreaView] = useState(null);
  const [areaRatings, setAreaRatings] = useState({});
  const [showAreaRatingPrompt, setShowAreaRatingPrompt] = useState(null);
  const [practiceSessions, setPracticeSessions] = useState([]); // Completed sessions
  const [activeSession, setActiveSession] = useState(null); // Currently running session
  const [practiceView, setPracticeView] = useState(null);
  const [showWaldron, setShowWaldron] = useState(false);
  const [editingMantra, setEditingMantra] = useState(false);
  const [cmExpanded, setCmExpanded] = useState(null);
  const [fontScale, setFontScale] = useState(1);
  const [roundImageFullscreen, setRoundImageFullscreen] = useState(false);
  const [showRoundForm, setShowRoundForm] = useState(false);
  const [showHandicapForm, setShowHandicapForm] = useState(false);
  const [expandedRound, setExpandedRound] = useState(null); // for rounds history
  const [roundsSection, setRoundsSection] = useState('last'); // 'last' | 'handicap' | 'history'

  // Default round (the May 13 baseline that ships with the app)
  const defaultRound = {
    id: 'seed-2026-05-13',
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
    image: '/round-may13.png',
    notes: '',
    aiAnalysis: null
  };

  // Rounds: array, sorted newest first. Index 0 = most recent.
  const [rounds, setRounds] = useState([defaultRound]);
  // Handicap cards: array of { id, date, dateDisplay, handicapIndex, image, notes }
  const [handicapCards, setHandicapCards] = useState([]);

  // Convenience: latest round
  const lastRound = rounds[0] || defaultRound;

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

  // ============== STORAGE: localStorage + Vercel KV auto-sync ==============
  // localStorage is the primary (instant, offline-friendly).
  // Vercel KV mirrors it in the cloud, so the app survives clearing Safari data.

  const STORAGE_KEY = 'happy-golf-v2';
  const KV_KEY = 'happy-golf-main';
  const [kvSyncing, setKvSyncing] = useState(false);
  const [lastKvSync, setLastKvSync] = useState(null);

  // Debounced KV save (avoids hammering on every keystroke)
  const kvSaveTimeoutRef = useRef(null);

  // Migration: if old 'lastRound' exists in localStorage, convert to 'rounds' array
  const migrateState = (parsed) => {
    if (parsed && parsed.lastRound && !parsed.rounds) {
      parsed.rounds = [{ ...parsed.lastRound, id: parsed.lastRound.id || 'migrated-' + Date.now() }];
      delete parsed.lastRound;
    }
    if (parsed && !parsed.handicapCards) parsed.handicapCards = [];
    if (parsed && !parsed.rounds) parsed.rounds = [];

    // Ensure the seed round (May 13) is always at the bottom of history if missing
    if (parsed && Array.isArray(parsed.rounds)) {
      const hasSeed = parsed.rounds.some(r => r.id === 'seed-2026-05-13');
      if (!hasSeed) {
        parsed.rounds.push({
          id: 'seed-2026-05-13',
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
          image: '/round-may13.png',
          notes: '',
          aiAnalysis: null
        });
      }
    }
    return parsed;
  };

  // Try to restore from Vercel KV first, fall back to localStorage
  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      let restored = null;

      // First, try localStorage for instant load
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) restored = migrateState(JSON.parse(saved));
      } catch (e) {}

      if (restored) applyRestoredState(restored);
      else {
        // No local state - this is first install
        applyRestoredState({ firstInstall: true });
      }

      // Then, try Vercel KV (may have newer data from another device)
      try {
        const res = await fetch('/api/storage?key=' + KV_KEY);
        if (res.ok && !cancelled) {
          const json = await res.json();
          if (json && json.value) {
            const cloudState = migrateState(json.value);
            const cloudTs = cloudState.lastModified || 0;
            const localTs = restored?.lastModified || 0;
            // Only override if cloud is newer
            if (cloudTs > localTs) {
              applyRestoredState(cloudState);
              setLastKvSync(Date.now());
            }
          }
        }
      } catch (e) {
        // Silent fail - KV not available, work in offline mode
      }
    };

    restore();
    return () => { cancelled = true; };
  }, []);

  const applyRestoredState = (state) => {
    if (state.firstInstall) {
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
      return;
    }
    setMantraText(state.mantraText !== undefined ? state.mantraText : defaultMantra);
    setPracticeLog(state.practiceLog || []);
    if (state.fontScale) setFontScale(state.fontScale);
    if (state.rounds && state.rounds.length > 0) setRounds(state.rounds);
    if (state.handicapCards) setHandicapCards(state.handicapCards);
    if (state.areaRatings) setAreaRatings(state.areaRatings);
    if (state.practiceSessions) setPracticeSessions(state.practiceSessions);
  };

  const saveState = (updates = {}) => {
    const state = {
      mantraText: updates.mantraText ?? mantraText,
      practiceLog: updates.practiceLog ?? practiceLog,
      fontScale: updates.fontScale ?? fontScale,
      rounds: updates.rounds ?? rounds,
      handicapCards: updates.handicapCards ?? handicapCards,
      areaRatings: updates.areaRatings ?? areaRatings,
      practiceSessions: updates.practiceSessions ?? practiceSessions,
      lastModified: Date.now()
    };
    // 1. Save to localStorage immediately
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // Quota might be exceeded - warn but don't crash
      console.warn('localStorage save failed:', e);
    }
    // 2. Debounced save to Vercel KV (cloud backup)
    if (kvSaveTimeoutRef.current) clearTimeout(kvSaveTimeoutRef.current);
    kvSaveTimeoutRef.current = setTimeout(() => syncToKV(state), 2000);
  };

  // Compress image data URL to smaller size (used for old rounds before backup)
  const compressImage = async (dataUrl, maxDim = 900, quality = 0.65) => {
    return new Promise((resolve) => {
      if (!dataUrl || !dataUrl.startsWith('data:image')) {
        resolve(dataUrl);
        return;
      }
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round(height * (maxDim / width));
            width = maxDim;
          } else {
            width = Math.round(width * (maxDim / height));
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const syncToKV = async (state) => {
    try {
      setKvSyncing(true);
      // Compress images in rounds older than 30 days before backup
      const now = Date.now();
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
      const compressedRounds = await Promise.all((state.rounds || []).map(async (r) => {
        const roundDate = new Date(r.date + 'T12:00:00').getTime();
        if (now - roundDate > THIRTY_DAYS && r.image && r.image.startsWith('data:') && !r._compressed) {
          const smaller = await compressImage(r.image, 900, 0.65);
          return { ...r, image: smaller, _compressed: true };
        }
        return r;
      }));
      const stateToSync = { ...state, rounds: compressedRounds };

      const res = await fetch('/api/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: KV_KEY, value: stateToSync })
      });
      if (res.ok) {
        setLastKvSync(Date.now());
        // Also update local state with compressed versions
        if (compressedRounds.some(r => r._compressed)) {
          setRounds(compressedRounds);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSync));
        }
      }
    } catch (e) {
      // Silent fail - localStorage is the source of truth
    } finally {
      setKvSyncing(false);
    }
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
      notes: 'Visualize the shot from behind the ball. Choose ONE focal point for the round (a mark on the ball, a landing spot, a feel cue, or a rhythm word) and stick to it all day. Execute without tension or doubt.',
      steps: [
        {
          n: 1,
          title: 'Stand behind the ball',
          detail: 'Step back 2-3 paces directly behind the ball. See the target line clearly.'
        },
        {
          n: 2,
          title: 'Visualize the shot',
          detail: 'See the ball flight, trajectory, and where it lands. Picture the result first.'
        },
        {
          n: 3,
          title: 'Pick a focal point',
          detail: 'A specific intermediate target — a leaf, a patch of grass, a fairway divot. 2-3 feet in front of the ball.'
        },
        {
          n: 4,
          title: 'One practice swing',
          detail: 'Feel the rhythm and tempo you want. Match it to the shot you visualized.'
        },
        {
          n: 5,
          title: 'Set up to the ball',
          detail: 'Address the ball with your focal point in mind. Take your stance with intent.'
        },
        {
          n: 6,
          title: 'Trigger word & execute',
          detail: 'Say your focal word ("slow back, through" / "smooth" / etc). Commit fully. No second-guessing. Just swing.'
        }
      ]
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
  const goHome = () => { setView('home'); setAreaView(null); setPracticeView(null); setShowWaldron(false); setShowRoundForm(false); setShowHandicapForm(false); };
  const goBack = () => {
    if (showRoundForm) { setShowRoundForm(false); return; }
    if (showHandicapForm) { setShowHandicapForm(false); return; }
    if (showWaldron) { setShowWaldron(false); return; }
    if (areaView) {
      // Prompt for rating before leaving
      setShowAreaRatingPrompt(areaView);
      setAreaView(null);
      return;
    }
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
      padding: 'max(56px, calc(env(safe-area-inset-top) + 20px)) 16px 16px',
      position: 'relative',
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
              <HomeCard title="Rounds"               subtitle="Last · Handicap · History" iconType="round"      roundData={lastRound}      C={C} serif={serif} sans={sans} onClick={() => setView('round')} />
              <HomeCard title="My Progress"          subtitle="Stats · trends · streaks" iconType="progress"   C={C} serif={serif} sans={sans} onClick={() => setView('progress')} />
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

              {/* Steps (if area has them - e.g. Pre-shot Routine) */}
              {Array.isArray(area.steps) && area.steps.length > 0 && (
                <div style={{ marginBottom: '22px' }}>
                  <Label C={C} sans={sans} color={area.color}>The Routine — Step by Step</Label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
                    {area.steps.map((step) => (
                      <div key={step.n} style={{
                        background: 'rgba(0,0,0,0.22)',
                        border: `1px solid ${C.border}`,
                        borderRadius: '8px',
                        padding: '16px 18px',
                        display: 'flex',
                        gap: '16px'
                      }}>
                        <div style={{
                          minWidth: '36px', height: '36px',
                          borderRadius: '50%',
                          background: area.color + '22',
                          border: `1.5px solid ${area.color}`,
                          color: area.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: sans, fontWeight: 700, fontSize: '15px',
                          flexShrink: 0
                        }}>{step.n}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontFamily: serif, fontStyle: 'italic',
                            fontSize: `${s(17)}px`, color: C.text,
                            marginBottom: '5px', lineHeight: 1.3
                          }}>{step.title}</div>
                          <div style={{
                            fontFamily: sans, fontSize: `${s(13)}px`,
                            fontWeight: 300, lineHeight: 1.55, opacity: 0.85
                          }}>{step.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ratings history (if any) */}
              {areaRatings[area.id] && areaRatings[area.id].length > 0 && (
                <div style={{
                  background: 'rgba(163,217,85,0.04)',
                  border: `1px solid ${area.color}30`,
                  borderRadius: '8px', padding: '16px 18px',
                  marginBottom: '22px'
                }}>
                  <Label C={C} sans={sans} color={area.color}>Your Recent Check-Ins</Label>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                    {areaRatings[area.id].slice(0, 8).map((r, i) => (
                      <div key={i} style={{
                        background: 'rgba(0,0,0,0.22)',
                        border: `1px solid ${C.border}`,
                        borderRadius: '6px',
                        padding: '8px 12px',
                        textAlign: 'center'
                      }}>
                        <div style={{
                          fontSize: '20px', fontStyle: 'italic',
                          color: area.color, fontFamily: serif
                        }}>{r.rating}</div>
                        <div style={{
                          fontFamily: sans, fontSize: '9px',
                          opacity: 0.55, letterSpacing: '0.15em',
                          textTransform: 'uppercase', marginTop: '2px'
                        }}>{new Date(r.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
            <SessionPanel
              blocks={indoorBlocks} C={C} sans={sans} serif={serif}
              totalMin={120} sessionName="Indoor"
              playHoleDropSound={playHoleDropSound}
              onSessionEnd={(sessionData) => {
                const newSession = { ...sessionData, id: 'sess-' + Date.now(), date: new Date().toISOString().split('T')[0] };
                const updated = [newSession, ...practiceSessions];
                setPracticeSessions(updated);
                saveState({ practiceSessions: updated });
              }}
            />
          </SubSectionHeader>
        )}

        {view === 'practice' && practiceView === 'outdoor' && (
          <SubSectionHeader title="Outdoor Session" tag="4.3" badge="90 min · Short game focus" iconType="outdoor" C={C} serif={serif} sans={sans}>
            <SessionPanel
              blocks={outdoorBlocks} C={C} sans={sans} serif={serif}
              totalMin={90} sessionName="Outdoor"
              playHoleDropSound={playHoleDropSound}
              onSessionEnd={(sessionData) => {
                const newSession = { ...sessionData, id: 'sess-' + Date.now(), date: new Date().toISOString().split('T')[0] };
                const updated = [newSession, ...practiceSessions];
                setPracticeSessions(updated);
                saveState({ practiceSessions: updated });
              }}
            />
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

        {/* ========== MY PROGRESS ========== */}
        {view === 'progress' && (
          <SectionHeader title="My Progress" subtitle="Stats · trends · streaks" iconType="progress" C={C} serif={serif} sans={sans}>

            <div style={{
              fontStyle: 'italic', fontSize: '16px',
              textAlign: 'center', opacity: 0.75, marginBottom: '28px',
              padding: '0 8px'
            }}>"Improvement is measured, not assumed."</div>

            {/* ROUNDS STATS */}
            <div style={{
              background: 'rgba(0,0,0,0.22)',
              border: `1px solid ${C.border}`,
              borderRadius: '10px',
              padding: '20px',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '11px', letterSpacing: '0.3em',
                textTransform: 'uppercase', color: C.accent,
                fontFamily: sans, marginBottom: '16px', fontWeight: 500
              }}>Rounds</div>

              {(() => {
                const validRounds = rounds.filter(r => r.grossScore > 0);
                if (validRounds.length === 0) {
                  return <div style={{ fontFamily: sans, fontSize: '13px', opacity: 0.6, textAlign: 'center', padding: '10px 0' }}>
                    Once you log rounds with scores, stats will appear here.
                  </div>;
                }
                const scores = validRounds.map(r => r.grossScore);
                const avg = (scores.reduce((s,x) => s+x, 0) / scores.length).toFixed(1);
                const best = Math.min(...scores);
                const worst = Math.max(...scores);
                const last10 = validRounds.slice(0, 10);
                const avgLast10 = (last10.reduce((s,r) => s+r.grossScore, 0) / last10.length).toFixed(1);

                return (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Stat label="Total rounds" value={validRounds.length} C={C} sans={sans} serif={serif} />
                    <Stat label="Best score" value={best} C={C} sans={sans} serif={serif} accent />
                    <Stat label="Average" value={avg} C={C} sans={sans} serif={serif} />
                    <Stat label="Last 10 avg" value={avgLast10} C={C} sans={sans} serif={serif} />
                  </div>
                );
              })()}
            </div>

            {/* PRACTICE STATS */}
            <div style={{
              background: 'rgba(0,0,0,0.22)',
              border: `1px solid ${C.border}`,
              borderRadius: '10px',
              padding: '20px',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '11px', letterSpacing: '0.3em',
                textTransform: 'uppercase', color: C.accent,
                fontFamily: sans, marginBottom: '16px', fontWeight: 500
              }}>Practice Time</div>

              {(() => {
                if (!practiceSessions || practiceSessions.length === 0) {
                  return <div style={{ fontFamily: sans, fontSize: '13px', opacity: 0.6, textAlign: 'center', padding: '10px 0' }}>
                    Start a session in Practice → it will track real time spent.
                  </div>;
                }
                const now = Date.now();
                const WEEK = 7 * 24 * 60 * 60 * 1000;
                const MONTH = 30 * 24 * 60 * 60 * 1000;
                const totalMin = (sec) => Math.round(sec / 60);

                const weekTotal = practiceSessions
                  .filter(s => now - (s.endedAt || 0) < WEEK)
                  .reduce((sum, s) => sum + (s.totalActualSec || 0), 0);
                const monthTotal = practiceSessions
                  .filter(s => now - (s.endedAt || 0) < MONTH)
                  .reduce((sum, s) => sum + (s.totalActualSec || 0), 0);
                const allTotal = practiceSessions
                  .reduce((sum, s) => sum + (s.totalActualSec || 0), 0);

                return (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Stat label="This week" value={`${totalMin(weekTotal)}m`} C={C} sans={sans} serif={serif} accent />
                    <Stat label="This month" value={`${totalMin(monthTotal)}m`} C={C} sans={sans} serif={serif} />
                    <Stat label="Total ever" value={`${(totalMin(allTotal) / 60).toFixed(1)}h`} C={C} sans={sans} serif={serif} />
                    <Stat label="Sessions" value={practiceSessions.length} C={C} sans={sans} serif={serif} />
                  </div>
                );
              })()}
            </div>

            {/* AREA RATINGS TRENDS */}
            <div style={{
              background: 'rgba(0,0,0,0.22)',
              border: `1px solid ${C.border}`,
              borderRadius: '10px',
              padding: '20px',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '11px', letterSpacing: '0.3em',
                textTransform: 'uppercase', color: C.accent,
                fontFamily: sans, marginBottom: '16px', fontWeight: 500
              }}>Areas of Improvement</div>

              {(() => {
                const areasWithRatings = areas.filter(a => areaRatings[a.id] && areaRatings[a.id].length > 0);
                if (areasWithRatings.length === 0) {
                  return <div style={{ fontFamily: sans, fontSize: '13px', opacity: 0.6, textAlign: 'center', padding: '10px 0' }}>
                    Rate how each area feels when you visit it. Trends will appear here.
                  </div>;
                }
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {areasWithRatings.map(area => {
                      const ratings = areaRatings[area.id];
                      const latest = ratings[0].rating;
                      const avg = (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1);
                      return (
                        <div key={area.id} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '10px 14px',
                          background: 'rgba(255,255,255,0.03)',
                          borderRadius: '6px',
                          borderLeft: `3px solid ${area.color}`
                        }}>
                          <div>
                            <div style={{ fontSize: '13px', fontFamily: serif, fontStyle: 'italic' }}>{area.title}</div>
                            <div style={{ fontSize: '10px', fontFamily: sans, opacity: 0.55, marginTop: '2px' }}>
                              {ratings.length} check-in{ratings.length !== 1 ? 's' : ''} · avg {avg}
                            </div>
                          </div>
                          <div style={{
                            fontSize: '22px', fontStyle: 'italic',
                            color: area.color, fontFamily: serif
                          }}>{latest}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* HANDICAP TREND */}
            {handicapCards.length > 0 && (
              <div style={{
                background: 'rgba(0,0,0,0.22)',
                border: `1px solid ${C.border}`,
                borderRadius: '10px',
                padding: '20px'
              }}>
                <div style={{
                  fontSize: '11px', letterSpacing: '0.3em',
                  textTransform: 'uppercase', color: C.accent,
                  fontFamily: sans, marginBottom: '16px', fontWeight: 500
                }}>Handicap Index</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Stat label="Current" value={handicapCards[0].handicapIndex} C={C} sans={sans} serif={serif} accent />
                  <Stat label="Cards logged" value={handicapCards.length} C={C} sans={sans} serif={serif} />
                </div>
              </div>
            )}

          </SectionHeader>
        )}

        {/* ========== LATEST ROUND ========== */}

        {/* ========== ROUNDS (Last + Handicap Card + History) ========== */}
        {view === 'round' && !showRoundForm && !showHandicapForm && (
          <SectionHeader title="Rounds" subtitle="Last · Handicap card · History" iconType="round" roundData={lastRound} C={C} serif={serif} sans={sans}>

            {/* === LAST ROUND ACCORDION === */}
            <AccordionSection
              title="Last Round"
              subtitle={`${lastRound.dateDisplay} · ${lastRound.courseFull}${lastRound.grossScore > 0 ? ` · Score ${lastRound.grossScore}` : ''}`}
              defaultOpen={roundsSection === 'last'}
              C={C} sans={sans} serif={serif}
            >
              {/* + Log New Round button */}
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

              <RoundDetail
                round={lastRound}
                onImageClick={() => setRoundImageFullscreen(true)}
                onUpdateScore={(roundId, newScore) => {
                  const updatedRounds = rounds.map(r =>
                    r.id === roundId ? { ...r, grossScore: newScore } : r
                  );
                  setRounds(updatedRounds);
                  saveState({ rounds: updatedRounds });
                }}
                C={C} sans={sans} serif={serif} s={s}
              />
            </AccordionSection>

            {/* === HANDICAP CARD ACCORDION === */}
            <AccordionSection
              title="Handicap Card"
              subtitle={handicapCards.length > 0
                ? `Current: ${handicapCards[0].handicapIndex} · ${handicapCards[0].dateDisplay}`
                : 'Not added yet'}
              defaultOpen={roundsSection === 'handicap'}
              C={C} sans={sans} serif={serif}
            >
              <div style={{ marginBottom: '18px' }}>
                <button onClick={() => setShowHandicapForm(true)} style={{
                  width: '100%', background: 'transparent',
                  border: `1px dashed ${C.accent}70`,
                  color: C.accent, padding: '14px',
                  fontFamily: sans, fontSize: '12px',
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  cursor: 'pointer', borderRadius: '8px',
                  fontWeight: 500
                }}>+ Add Handicap Card</button>
              </div>

              {handicapCards.length === 0 ? (
                <div style={{
                  fontFamily: sans, fontSize: `${s(14)}px`,
                  opacity: 0.6, lineHeight: 1.6,
                  padding: '10px 0', textAlign: 'center'
                }}>
                  Upload your USGA handicap card (typically generated the day after a round) to track your handicap index over time.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {handicapCards.map((card, i) => (
                    <div key={card.id} style={{
                      background: 'rgba(0,0,0,0.22)',
                      border: `1px solid ${i === 0 ? C.accent + '40' : C.border}`,
                      borderRadius: '8px',
                      padding: '16px',
                      cursor: card.image ? 'pointer' : 'default'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontSize: `${s(22)}px`, fontStyle: 'italic', color: i === 0 ? C.accent : C.text }}>
                            {card.handicapIndex}
                          </div>
                          <div style={{
                            fontSize: '10px', letterSpacing: '0.25em',
                            textTransform: 'uppercase', opacity: 0.6,
                            fontFamily: sans, marginTop: '4px', fontWeight: 500
                          }}>{card.dateDisplay}</div>
                        </div>
                        {i === 0 && (
                          <div style={{
                            fontSize: '9px', letterSpacing: '0.2em',
                            textTransform: 'uppercase', color: C.accent,
                            fontFamily: sans, fontWeight: 600,
                            border: `1px solid ${C.accent}50`,
                            padding: '3px 8px', borderRadius: '3px'
                          }}>CURRENT</div>
                        )}
                      </div>
                      {card.image && (
                        <img src={card.image} alt="Handicap card"
                          style={{ width: '100%', borderRadius: '4px', marginTop: '10px', cursor: 'pointer' }} />
                      )}
                      {card.notes && (
                        <div style={{
                          fontFamily: sans, fontSize: `${s(12)}px`,
                          opacity: 0.8, marginTop: '10px', lineHeight: 1.5
                        }}>{card.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </AccordionSection>

            {/* === ROUNDS HISTORY ACCORDION === */}
            <AccordionSection
              title="Rounds History"
              subtitle={rounds.length > 1
                ? `${rounds.length - 1} previous round${rounds.length > 2 ? 's' : ''}`
                : 'No previous rounds yet'}
              defaultOpen={roundsSection === 'history'}
              C={C} sans={sans} serif={serif}
            >
              {rounds.length <= 1 ? (
                <div style={{
                  fontFamily: sans, fontSize: `${s(14)}px`,
                  opacity: 0.6, lineHeight: 1.6,
                  padding: '10px 0', textAlign: 'center'
                }}>
                  As you log new rounds, previous ones will appear here.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {rounds.slice(1).map((r, i) => (
                    <div key={r.id || i}
                      onClick={() => setExpandedRound(expandedRound === r.id ? null : r.id)}
                      style={{
                        background: 'rgba(0,0,0,0.22)',
                        border: `1px solid ${C.border}`,
                        borderRadius: '8px',
                        padding: '14px 16px',
                        cursor: 'pointer'
                      }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: `${s(17)}px`, fontStyle: 'italic', color: C.text }}>
                            {r.courseFull}
                          </div>
                          <div style={{
                            fontSize: '10px', letterSpacing: '0.22em',
                            textTransform: 'uppercase', opacity: 0.6,
                            fontFamily: sans, marginTop: '4px', fontWeight: 500
                          }}>{r.dateDisplay}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: `${s(24)}px`, fontStyle: 'italic', color: C.accent }}>
                            {r.grossScore > 0 ? r.grossScore : '—'}
                          </div>
                          <div style={{
                            fontSize: '9px', letterSpacing: '0.18em',
                            textTransform: 'uppercase', opacity: 0.55,
                            fontFamily: sans, marginTop: '2px'
                          }}>{r.grossScore > 0 ? 'GROSS' : 'NO SCORE'}</div>
                        </div>
                      </div>
                      {expandedRound === r.id && (
                        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: `1px solid ${C.border}` }}>
                          <RoundDetail
                            round={r}
                            onImageClick={null}
                            onUpdateScore={(roundId, newScore) => {
                              const updatedRounds = rounds.map(rd =>
                                rd.id === roundId ? { ...rd, grossScore: newScore } : rd
                              );
                              setRounds(updatedRounds);
                              saveState({ rounds: updatedRounds });
                            }}
                            C={C} sans={sans} serif={serif} s={s} compact={true}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </AccordionSection>

          </SectionHeader>
        )}



        {/* ========== NEW ROUND FORM ========== */}
        {view === 'round' && showRoundForm && (
          <NewRoundForm
            onCancel={() => setShowRoundForm(false)}
            onSave={async (newRound) => {
              const roundWithId = { ...newRound, id: 'round-' + Date.now() };
              // Compress previous rounds' images (they're going to history, no need for full res)
              const previousRoundsCompressed = await Promise.all(
                rounds.map(async (r) => {
                  // Skip seed round (its image is /round-may13.png path, not data URL)
                  if (r.id === 'seed-2026-05-13') return r;
                  if (!r.image || !r.image.startsWith('data:')) return r;
                  // Already compressed once? (check size proxy)
                  if (r.image.length < 200000) return r;
                  const compressedImage = await compressImage(r.image, 900, 0.65);
                  return { ...r, image: compressedImage };
                })
              );
              const updatedRounds = [roundWithId, ...previousRoundsCompressed];
              setRounds(updatedRounds);
              saveState({ rounds: updatedRounds });
              setShowRoundForm(false);
              setRoundsSection('last');
            }}
            C={C} serif={serif} sans={sans}
          />
        )}

        {/* ========== NEW HANDICAP CARD FORM ========== */}
        {view === 'round' && showHandicapForm && (
          <NewHandicapCardForm
            onCancel={() => setShowHandicapForm(false)}
            onSave={(card) => {
              const cardWithId = { ...card, id: 'hc-' + Date.now() };
              const updatedCards = [cardWithId, ...handicapCards];
              setHandicapCards(updatedCards);
              saveState({ handicapCards: updatedCards });
              setShowHandicapForm(false);
              setRoundsSection('handicap');
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
        @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.85); } }
        @keyframes recordPulse { 0%,100% { box-shadow: 0 0 0 4px rgba(239,68,68,0.3); } 50% { box-shadow: 0 0 0 8px rgba(239,68,68,0.15); } }

        /* Lock the page so iOS doesn't rubber-band when content fits */
        html, body {
          margin: 0;
          padding: 0;
          background: ${C.bg};
          overscroll-behavior: none;
          -webkit-overflow-scrolling: auto;
        }
        html {
          height: 100%;
        }
        body {
          min-height: 100%;
        }
        #root {
          background: ${C.bg};
        }

        textarea:focus, input:focus, select:focus { border-color: ${C.accent}80 !important; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.85); cursor: pointer; }
        /* Hide scrollbars but keep scrolling */
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Area Rating Modal - shows when leaving an area view */}
      {showAreaRatingPrompt && (() => {
        const area = areas.find(a => a.id === showAreaRatingPrompt);
        if (!area) return null;
        return (
          <AreaRatingModal
            areaId={area.id}
            areaName={area.title}
            areaColor={area.color}
            onSave={(rating) => {
              const newRatings = {
                ...areaRatings,
                [area.id]: [
                  { date: new Date().toISOString().split('T')[0], rating, timestamp: Date.now() },
                  ...(areaRatings[area.id] || [])
                ]
              };
              setAreaRatings(newRatings);
              saveState({ areaRatings: newRatings });
              setShowAreaRatingPrompt(null);
            }}
            onSkip={() => setShowAreaRatingPrompt(null)}
            C={C} sans={sans} serif={serif}
          />
        );
      })()}
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

function SessionPanel({ blocks, C, sans, serif, totalMin, sessionName, playHoleDropSound, onSessionEnd }) {
  const [currentBlock, setCurrentBlock] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(blocks[0].min * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  // Track real time spent per block (in seconds)
  const [blockRealTimes, setBlockRealTimes] = useState(() => blocks.map(() => 0));
  const [sessionStartTime, setSessionStartTime] = useState(null);

  const playBlockChime = () => {
    if (playHoleDropSound) playHoleDropSound();
    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
  };

  useEffect(() => {
    if (!isRunning) return;
    if (!sessionStartTime) setSessionStartTime(Date.now());
    const interval = setInterval(() => {
      // Increment real time for current block every second
      setBlockRealTimes(prev => {
        const next = [...prev];
        next[currentBlock] = (next[currentBlock] || 0) + 1;
        return next;
      });
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

  // When session completes naturally, fire onSessionEnd
  useEffect(() => {
    if (completed && onSessionEnd && blockRealTimes.some(t => t > 0)) {
      onSessionEnd({
        sessionName,
        totalPlannedMinutes: totalMin,
        blocks: blocks.map((b, i) => ({
          name: b.name,
          plannedMin: b.min,
          actualSec: blockRealTimes[i] || 0
        })),
        totalActualSec: blockRealTimes.reduce((s, x) => s + x, 0),
        startedAt: sessionStartTime,
        endedAt: Date.now(),
        ended: 'completed'
      });
    }
  }, [completed]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const reset = () => {
    setIsRunning(false); setCurrentBlock(0);
    setSecondsLeft(blocks[0].min * 60); setCompleted(false);
    setBlockRealTimes(blocks.map(() => 0));
    setSessionStartTime(null);
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
  const endSessionEarly = () => {
    setIsRunning(false);
    setCompleted(true);
    if (onSessionEnd) {
      onSessionEnd({
        sessionName,
        totalPlannedMinutes: totalMin,
        blocks: blocks.map((b, i) => ({
          name: b.name,
          plannedMin: b.min,
          actualSec: blockRealTimes[i] || 0
        })),
        totalActualSec: blockRealTimes.reduce((s, x) => s + x, 0),
        startedAt: sessionStartTime,
        endedAt: Date.now(),
        ended: 'manual'
      });
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

            {/* End session early button - shows after time has been tracked */}
            {blockRealTimes.some(t => t > 0) && (
              <button onClick={endSessionEarly} style={{
                width: '100%', marginTop: '12px',
                background: 'transparent',
                border: `1px solid ${C.accent}50`,
                color: C.accent, opacity: 0.85,
                padding: '11px', fontFamily: sans,
                fontSize: '11px', letterSpacing: '0.2em',
                textTransform: 'uppercase', cursor: 'pointer',
                borderRadius: '4px', fontWeight: 500
              }}>End Session & Save Progress</button>
            )}

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


// ============================================================
// NEW ROUND FORM - simplified: course name + scorecard image
// ============================================================
// ============================================================
// SECTION ICONS — using Lucide for home sections,
// custom SVG for sub-sections (calendar, indoor, outdoor, log)
// ============================================================
function SectionIcon({ type, color, size = 28, scoreNumber, roundData }) {
  const stroke = { stroke: color, strokeWidth: 1.1, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };

  // === Home section icons (Lucide) ===
  if (type === 'mantra') {
    return <Heart size={size} color={color} strokeWidth={1.8} />;
  }
  if (type === 'strategy') {
    return <Crown size={size} color={color} strokeWidth={1.8} />;
  }
  if (type === 'growth') {
    return <TrendingDown size={size} color={color} strokeWidth={1.8} />;
  }
  if (type === 'practice') {
    return <Repeat size={size} color={color} strokeWidth={1.8} />;
  }
  if (type === 'round') {
    // For round, we show the Flag icon at the standard size
    // The score number is displayed elsewhere (in the home card text)
    return <Flag size={size} color={color} strokeWidth={1.8} />;
  }
  if (type === 'progress') {
    return <Trophy size={size} color={color} strokeWidth={1.8} />;
  }

  // === Sub-section icons (custom SVG) ===
  const props = { width: size, height: size, viewBox: '-16 -16 32 32', fill: 'none' };

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
        <path d="M -8 3 Q -4 -4 0 -2 Q 4 0 8 -6" {...stroke} />
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
// NEW ROUND FORM - with optional AI analysis via Anthropic API
// ============================================================
// ============================================================
// VOICE INPUT BUTTON — uses Web Speech API (iOS Safari compatible)
// Tap once to start, tap again to stop. iOS works best with continuous=false.
// ============================================================
function VoiceButton({ onTranscript, C, sans }) {
  const [recording, setRecording] = useState(false);
  const [supported, setSupported] = useState(true);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef(null);
  const stopRequestedRef = useRef(false);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }

    const recognition = new SR();
    // iOS Safari is much more reliable with continuous=false + auto-restart
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = navigator.language || 'en-US';

    recognition.onresult = (event) => {
      let final = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }
      if (interim) setInterimText(interim);
      if (final.trim()) {
        onTranscript(final.trim());
        setInterimText('');
      }
    };

    recognition.onerror = (e) => {
      console.warn('Speech recognition error:', e.error);
      // Don't stop on no-speech; iOS triggers this when there's a pause
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        setRecording(false);
        setInterimText('');
        stopRequestedRef.current = true;
      }
    };

    recognition.onend = () => {
      // Auto-restart unless user explicitly stopped
      if (!stopRequestedRef.current) {
        try {
          recognition.start();
        } catch (e) {
          setRecording(false);
          setInterimText('');
        }
      } else {
        setRecording(false);
        setInterimText('');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      stopRequestedRef.current = true;
      try { recognition.stop(); } catch (e) {}
    };
  }, []);

  const toggle = () => {
    if (!supported || !recognitionRef.current) return;
    if (recording) {
      // User wants to stop
      stopRequestedRef.current = true;
      try { recognitionRef.current.stop(); } catch (e) {}
      setRecording(false);
      setInterimText('');
    } else {
      // User wants to start
      stopRequestedRef.current = false;
      try {
        recognitionRef.current.start();
        setRecording(true);
      } catch (e) {
        // Already started - reset and try again
        try { recognitionRef.current.stop(); } catch (e) {}
        setTimeout(() => {
          try {
            recognitionRef.current.start();
            setRecording(true);
          } catch (e) {}
        }, 100);
      }
    }
  };

  if (!supported) return null;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
      <button
        type="button"
        onClick={toggle}
        style={{
          background: recording ? '#ef4444' : 'transparent',
          border: `1px solid ${recording ? '#ef4444' : C.border}`,
          color: recording ? '#ffffff' : C.accent,
          padding: '8px 14px',
          fontFamily: sans, fontSize: '11px',
          letterSpacing: '0.18em', textTransform: 'uppercase',
          cursor: 'pointer', borderRadius: '6px',
          fontWeight: 500,
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          transition: 'all 0.2s',
          position: 'relative',
          boxShadow: recording ? '0 0 0 4px rgba(239,68,68,0.3)' : 'none',
          animation: recording ? 'recordPulse 1.5s infinite' : 'none'
        }}
        title={recording ? 'Tap to stop dictating' : 'Tap to dictate'}
      >
        <span style={{
          fontSize: '14px',
          animation: recording ? 'pulse 1.2s infinite' : 'none'
        }}>{recording ? '🔴' : '🎤'}</span>
        {recording ? 'Listening… tap to stop' : 'Dictate'}
      </button>
      {recording && interimText && (
        <div style={{
          fontFamily: sans, fontSize: '10px',
          opacity: 0.7, fontStyle: 'italic',
          maxWidth: '200px', textAlign: 'right',
          color: C.accent
        }}>"{interimText}"</div>
      )}
    </div>
  );
}

function NewRoundForm({ onCancel, onSave, C, serif, sans }) {
  const courseSuggestions = [
    'Miami Beach', 'Normandy', 'Crandon', 'Biltmore',
    'Shores', 'Lakes', 'Doral', 'International Links'
  ];

  const [courseName, setCourseName] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [imageMediaType, setImageMediaType] = useState('image/jpeg');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userObservations, setUserObservations] = useState('');
  const [manualScore, setManualScore] = useState('');

  // AI analysis state
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('Image too large. Max 8MB. Try compressing or taking a smaller photo.');
      return;
    }

    // Read file then convert to JPEG via canvas (handles HEIC, ensures consistent format)
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // For new rounds, keep high quality (1600px / 85%) so AI can read scorecards well.
        // Old rounds get aggressive compression at backup time.
        const maxDim = 1600;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round(height * (maxDim / width));
            width = maxDim;
          } else {
            width = Math.round(width * (maxDim / height));
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        // Quality 85% for fresh uploads - keep scorecard numbers crisp
        const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setImagePreview(jpegDataUrl);
        setImageDataUrl(jpegDataUrl);
        setImageMediaType('image/jpeg');
        // Reset analysis if image changes
        setAiAnalysis(null);
        setAnalysisError(null);
      };
      img.onerror = () => {
        alert('Could not read image. iOS HEIC photos sometimes fail. Try: in Photos, share → Save as JPEG, then upload that. Or take a screenshot of the scorecard.');
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      alert('Could not read file. Please try a different image.');
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imageDataUrl || !courseName.trim()) {
      alert('Please fill in course name and upload an image first.');
      return;
    }
    setShowConfirmDialog(true);
  };

  const confirmAnalyze = async () => {
    setShowConfirmDialog(false);
    setAnalyzing(true);
    setAnalysisError(null);

    try {
      // Extract base64 from data URL (iOS Safari-safe parsing without regex)
      if (!imageDataUrl || !imageDataUrl.startsWith('data:')) {
        throw new Error('Invalid image data — please re-upload the scorecard.');
      }
      const commaIdx = imageDataUrl.indexOf(',');
      const semicolonIdx = imageDataUrl.indexOf(';');
      if (commaIdx === -1 || semicolonIdx === -1) {
        throw new Error('Image format not recognized — please try a different image.');
      }
      // "data:image/jpeg;base64,..." → mediaType = "image/jpeg"
      const mediaType = imageDataUrl.substring(5, semicolonIdx);
      const base64Data = imageDataUrl.substring(commaIdx + 1);

      // Anthropic only accepts these media types
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(mediaType)) {
        throw new Error(`Image format "${mediaType}" not supported. Please use JPG or PNG. If you used a HEIC photo, try taking a screenshot of it first or convert it.`);
      }

      const response = await fetch('/api/analyze-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          imageMediaType: mediaType,
          courseName: courseName.trim(),
          userContext: userObservations.trim() || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server returned ${response.status}`);
      }

      setAiAnalysis(data.analysis);
    } catch (err) {
      console.error('Analysis error:', err);
      setAnalysisError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
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

    // Extract stats from AI analysis if available
    const stats = aiAnalysis?.stats || {};

    // Manual score takes priority if filled, otherwise use AI extracted, fallback to 0
    const finalGrossScore = manualScore.trim() ? parseInt(manualScore.trim(), 10) : (stats.grossScore || 0);

    const newRound = {
      courseShort: courseName.toUpperCase().trim(),
      courseFull: courseName.trim(),
      date: now.toISOString().split('T')[0],
      dateDisplay: dateDisplay,
      coursePar: stats.coursePar || 72,
      overPar: stats.overPar || 0,
      grossScore: finalGrossScore,
      netScore: stats.netScore || null,
      frontNine: stats.frontNine || null,
      backNine: stats.backNine || null,
      differential: stats.differential || null,
      teeColor: 'Blue',
      yards: null,
      slope: null,
      courseHandicap: 19,
      image: imageDataUrl,
      notes: userObservations.trim(),
      aiAnalysis: aiAnalysis
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
      }}>Course + scorecard + optional AI analysis</div>
      <div style={{ width: '40px', height: '2px', background: C.accent, marginTop: '18px', opacity: 0.7, marginBottom: '28px' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

        {/* Course Name with autocomplete */}
        <div>
          <label style={labelStyle}>Course Name</label>
          <div style={{ position: 'relative' }}>
            <input type="text" placeholder="Normandy"
              value={courseName}
              onChange={(e) => { setCourseName(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              style={inputBase} />

            {showSuggestions && filteredSuggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)',
                left: 0, right: 0, background: '#173d63',
                border: `1px solid ${C.accent}60`, borderRadius: '6px',
                overflow: 'hidden', zIndex: 10,
                boxShadow: '0 6px 24px rgba(0,0,0,0.5)'
              }}>
                {filteredSuggestions.map((s, i) => (
                  <div key={i}
                    onMouseDown={() => { setCourseName(s); setShowSuggestions(false); }}
                    style={{
                      padding: '11px 14px', fontFamily: sans, fontSize: '14px',
                      color: C.text, cursor: 'pointer',
                      borderBottom: i < filteredSuggestions.length - 1 ? `1px solid ${C.border}` : 'none'
                    }}>
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Image upload */}
        <div>
          <label style={labelStyle}>Scorecard Image</label>
          <div style={{
            border: `1px dashed ${C.accent}70`, borderRadius: '8px',
            padding: '24px', textAlign: 'center', cursor: 'pointer',
            position: 'relative',
            background: imagePreview ? 'transparent' : 'rgba(0,0,0,0.18)'
          }}>
            <input type="file" accept="image/*"
              onChange={handleImageUpload}
              style={{
                position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer'
              }} />
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Scorecard preview"
                  style={{ maxWidth: '100%', borderRadius: '4px', display: 'block', margin: '0 auto' }} />
                <div style={{
                  marginTop: '12px', fontSize: '11px', color: C.accent,
                  fontFamily: sans, letterSpacing: '0.2em',
                  textTransform: 'uppercase', fontWeight: 500
                }}>Tap to change image</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '32px', color: C.accent, opacity: 0.7, marginBottom: '8px' }}>📸</div>
                <div style={{ fontFamily: sans, fontSize: '14px', color: C.accent, fontWeight: 500 }}>
                  Tap to upload scorecard
                </div>
                <div style={{ fontFamily: sans, fontSize: '11px', opacity: 0.5, marginTop: '4px' }}>
                  PNG or JPG (max 5MB)
                </div>
              </>
            )}
          </div>
        </div>

        {/* Gross Score - manual entry (optional, AI can also extract) */}
        {imageDataUrl && (
          <div>
            <label style={labelStyle}>Gross Score (optional)</label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="e.g. 95"
              value={manualScore}
              onChange={(e) => setManualScore(e.target.value)}
              style={{
                ...inputBase,
                width: '120px'
              }}
            />
            <div style={{
              fontFamily: sans, fontSize: '11px',
              opacity: 0.55, marginTop: '6px', lineHeight: 1.5
            }}>
              Manual entry overrides AI extraction. Leave blank to let Claude detect it from the scorecard.
            </div>
          </div>
        )}

        {/* My Observations (optional) - shows after image is uploaded */}
        {imageDataUrl && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>My observations (optional)</label>
              <VoiceButton
                onTranscript={(text) => setUserObservations(prev => (prev ? prev + ' ' : '') + text)}
                C={C} sans={sans}
              />
            </div>
            <textarea
              placeholder="e.g. Hit too many fairways on the back. Need to sharpen short game. Felt tense on the back nine. Driver lost direction after hole 12..."
              value={userObservations}
              onChange={(e) => setUserObservations(e.target.value)}
              style={{
                ...inputBase,
                minHeight: '100px',
                resize: 'vertical',
                fontFamily: sans,
                lineHeight: 1.5
              }}
            />
            <div style={{
              fontFamily: sans, fontSize: '11px',
              opacity: 0.55, marginTop: '6px', lineHeight: 1.5
            }}>
              Sensations, weather, what felt off, what worked — anything the scorecard alone won't show. Tap 🎤 to dictate in Spanglish.
            </div>
          </div>
        )}

        {/* AI Analysis Button */}
        {imageDataUrl && courseName.trim() && !aiAnalysis && !analyzing && (
          <button onClick={handleAnalyze} style={{
            width: '100%',
            background: 'linear-gradient(135deg, #a3d955 0%, #7eb53d 100%)',
            border: 'none', color: C.bg, padding: '16px',
            fontFamily: sans, fontSize: '13px',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            fontWeight: 700, cursor: 'pointer', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
          }}>
            <span style={{ fontSize: '18px' }}>✨</span>
            Analyze with Claude
          </button>
        )}

        {/* Analyzing state */}
        {analyzing && (
          <div style={{
            background: 'rgba(163,217,85,0.08)',
            border: `1px solid ${C.accent}40`,
            borderRadius: '8px', padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🤖</div>
            <div style={{
              fontFamily: sans, fontSize: '14px',
              color: C.accent, fontWeight: 500, marginBottom: '4px'
            }}>Analyzing your round...</div>
            <div style={{
              fontFamily: sans, fontSize: '12px',
              opacity: 0.6, marginTop: '6px'
            }}>Claude is reading the scorecard (~10-15 sec)</div>
          </div>
        )}

        {/* Error state */}
        {analysisError && (
          <div style={{
            background: 'rgba(239,68,68,0.08)',
            border: `1px solid rgba(239,68,68,0.4)`,
            borderRadius: '8px', padding: '16px'
          }}>
            <div style={{
              fontSize: '11px', letterSpacing: '0.2em',
              textTransform: 'uppercase', color: '#ef4444',
              fontFamily: sans, fontWeight: 600, marginBottom: '6px'
            }}>Analysis failed</div>
            <div style={{
              fontFamily: sans, fontSize: '13px',
              fontWeight: 300, lineHeight: 1.5, opacity: 0.9
            }}>{analysisError}</div>
            <button onClick={() => { setAnalysisError(null); }} style={{
              marginTop: '12px', background: 'transparent',
              border: `1px solid ${C.border}`, color: C.text,
              padding: '8px 16px', fontFamily: sans, fontSize: '11px',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              cursor: 'pointer', borderRadius: '4px'
            }}>Dismiss</button>
          </div>
        )}

        {/* Analysis Result preview */}
        {aiAnalysis && (
          <div style={{
            background: 'rgba(163,217,85,0.06)',
            border: `1px solid ${C.accent}40`,
            borderRadius: '8px', padding: '20px'
          }}>
            <div style={{
              fontSize: '11px', letterSpacing: '0.3em',
              textTransform: 'uppercase', color: C.accent,
              fontFamily: sans, marginBottom: '14px', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              ✨ Analysis Complete
            </div>
            {aiAnalysis.reading && (
              <div style={{
                fontFamily: sans, fontSize: '13px',
                fontWeight: 300, lineHeight: 1.6, opacity: 0.92,
                marginBottom: '14px'
              }}>
                {aiAnalysis.reading}
              </div>
            )}
            {aiAnalysis.tigerFiveCount && (
              <div style={{
                fontFamily: sans, fontSize: '12px',
                fontWeight: 400, opacity: 0.8, marginBottom: '14px',
                fontStyle: 'italic'
              }}>
                {aiAnalysis.tigerFiveCount}
              </div>
            )}
            {Array.isArray(aiAnalysis.focusForNextRound) && aiAnalysis.focusForNextRound.length > 0 && (
              <>
                <div style={{
                  fontSize: '10px', letterSpacing: '0.25em',
                  textTransform: 'uppercase', color: C.accent,
                  fontFamily: sans, marginBottom: '8px', fontWeight: 500
                }}>Focus for next round</div>
                <ul style={{
                  fontFamily: sans, fontSize: '12px',
                  fontWeight: 300, lineHeight: 1.6, opacity: 0.9,
                  paddingLeft: '16px', margin: 0
                }}>
                  {aiAnalysis.focusForNextRound.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </>
            )}
            <div style={{
              fontFamily: sans, fontSize: '10px',
              opacity: 0.5, marginTop: '14px',
              fontStyle: 'italic'
            }}>
              Analysis saved with this round.
            </div>
          </div>
        )}

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
            background: 'transparent', border: `1px solid ${C.border}`,
            color: C.text, padding: '14px 22px',
            fontFamily: sans, fontSize: '12px',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            cursor: 'pointer', borderRadius: '6px', opacity: 0.7
          }}>Cancel</button>
        </div>
      </div>

      {/* Confirmation Dialog for AI Analysis */}
      {showConfirmDialog && (
        <div onClick={() => setShowConfirmDialog(false)} style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', zIndex: 1000
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: C.bg2, border: `1px solid ${C.accent}40`,
            borderRadius: '12px', padding: '28px',
            maxWidth: '380px', width: '100%'
          }}>
            <div style={{
              fontSize: '20px', fontStyle: 'italic',
              marginBottom: '12px', color: C.text
            }}>Analyze with Claude?</div>
            <div style={{
              fontFamily: sans, fontSize: '14px',
              fontWeight: 300, lineHeight: 1.6, opacity: 0.85,
              marginBottom: '20px'
            }}>
              Claude will read your scorecard and provide personalized analysis based on your improvement areas, DECADE framework, and Tiger Five.
              <br /><br />
              <strong style={{ color: C.accent }}>Cost: ~$0.01 of credits</strong>
              <br />
              <span style={{ fontSize: '11px', opacity: 0.6 }}>
                Daily limit: 5 analyses · 30s between requests
              </span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={confirmAnalyze} style={{
                flex: 1, background: C.accent, border: 'none',
                color: C.bg, padding: '12px',
                fontFamily: sans, fontSize: '12px',
                letterSpacing: '0.18em', textTransform: 'uppercase',
                fontWeight: 700, cursor: 'pointer', borderRadius: '6px'
              }}>Yes, Analyze</button>
              <button onClick={() => setShowConfirmDialog(false)} style={{
                background: 'transparent', border: `1px solid ${C.border}`,
                color: C.text, padding: '12px 20px',
                fontFamily: sans, fontSize: '12px',
                letterSpacing: '0.18em', textTransform: 'uppercase',
                cursor: 'pointer', borderRadius: '6px', opacity: 0.7
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ============================================================
// AREA ICONS — final selection (May 18, 2026)
// 4 Lucide + 2 custom SVG (for chip-arc + chip-run)
// ============================================================
function AreaIcon({ type, color, size = 30 }) {
  // Lucide: WavesHorizontal, Rocket, Goal, ListChecks
  if (type === 'tempo') {
    return <WavesHorizontal size={size} color={color} strokeWidth={1.8} />;
  }
  if (type === 'tee') {
    return <Rocket size={size} color={color} strokeWidth={1.8} />;
  }
  if (type === 'wedge') {
    return <Goal size={size} color={color} strokeWidth={1.8} />;
  }
  if (type === 'preshot') {
    return <ListChecks size={size} color={color} strokeWidth={1.8} />;
  }

  // Custom SVG: elevated chip (semicircle + arrow)
  if (type === 'elevated') {
    return (
      <svg width={size} height={size} viewBox="-16 -16 32 32" fill="none">
        <circle cx="-12" cy="6" r="1.5" stroke={color} strokeWidth="1.5" fill="none" />
        <path d="M -12 6 A 12 12 0 0 1 12 6" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <polyline points="9,3 12,6 15,3" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // Custom SVG: chip & run (solid dot start, dashed bounce, arrowhead end, ground line)
  if (type === 'chiprun') {
    return (
      <svg width={size} height={size} viewBox="-16 -16 32 32" fill="none">
        <circle cx="-11" cy="-3" r="1.8" fill={color} />
        <path d="M -9 -3 Q -5 -5 0 -3 Q 5 -1 8 -3" stroke={color} strokeWidth="1.5" fill="none" strokeDasharray="1.5 2" strokeLinecap="round" />
        <polyline points="6,-5.5 9,-3 6,-0.5" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="-13" y1="3" x2="13" y2="3" stroke={color} strokeWidth="0.8" opacity="0.5" />
      </svg>
    );
  }

  return null;
}

// ============================================================
// ACCORDION SECTION
// ============================================================
function AccordionSection({ title, subtitle, defaultOpen, children, C, sans, serif }) {
  const [open, setOpen] = useState(defaultOpen || false);
  return (
    <div style={{ marginBottom: '14px' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          background: open ? 'rgba(163,217,85,0.06)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${open ? C.accent + '40' : C.border}`,
          borderRadius: '10px',
          padding: '16px 18px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.2s'
        }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '20px', fontStyle: 'italic', color: C.text }}>{title}</div>
          {subtitle && (
            <div style={{
              fontSize: '11px', letterSpacing: '0.22em',
              textTransform: 'uppercase', opacity: 0.6,
              fontFamily: sans, marginTop: '4px', fontWeight: 500
            }}>{subtitle}</div>
          )}
        </div>
        <div style={{
          fontSize: '22px', color: C.accent,
          opacity: 0.7,
          transition: 'transform 0.2s',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>⌄</div>
      </div>
      {open && (
        <div style={{
          padding: '20px 4px 4px',
          animation: 'fadeIn 0.3s'
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================================
// ROUND DETAIL — used in Last Round and in expanded History items
// ============================================================
function RoundDetail({ round, onImageClick, C, sans, serif, s, compact, onUpdateScore }) {
  const [editingScore, setEditingScore] = useState(false);
  const [scoreValue, setScoreValue] = useState(round.grossScore || '');

  const saveScore = () => {
    const n = parseInt(scoreValue, 10);
    if (!isNaN(n) && n > 0 && onUpdateScore) {
      onUpdateScore(round.id, n);
    }
    setEditingScore(false);
  };

  return (
    <>
      {/* Score header (editable when onUpdateScore provided) */}
      {onUpdateScore && (
        <div style={{
          background: 'rgba(0,0,0,0.22)',
          border: `1px solid ${C.border}`,
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '10px', letterSpacing: '0.25em',
            textTransform: 'uppercase', opacity: 0.6,
            fontFamily: sans, fontWeight: 500
          }}>Gross Score</div>
          {editingScore ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                inputMode="numeric"
                value={scoreValue}
                onChange={(e) => setScoreValue(e.target.value)}
                onBlur={saveScore}
                onKeyDown={(e) => e.key === 'Enter' && saveScore()}
                autoFocus
                style={{
                  width: '80px',
                  background: 'rgba(0,0,0,0.3)',
                  border: `1px solid ${C.accent}`,
                  borderRadius: '4px',
                  padding: '6px 10px',
                  color: C.text,
                  fontFamily: sans, fontSize: '18px',
                  textAlign: 'right',
                  outline: 'none'
                }}
              />
            </div>
          ) : (
            <div onClick={() => setEditingScore(true)}
              style={{
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
              <span style={{
                fontSize: '22px', fontStyle: 'italic',
                color: round.grossScore > 0 ? C.accent : 'rgba(255,255,255,0.4)'
              }}>{round.grossScore > 0 ? round.grossScore : 'Tap to add'}</span>
              <span style={{ fontSize: '13px', opacity: 0.6 }}>✏️</span>
            </div>
          )}
        </div>
      )}

      {/* Scorecard image */}
      {round.image && (
        <div
          onClick={onImageClick}
          style={{
            borderRadius: '8px',
            overflow: 'hidden',
            border: `1px solid ${C.border}`,
            marginBottom: '20px',
            background: '#ffffff',
            cursor: onImageClick ? 'pointer' : 'default',
            position: 'relative'
          }}>
          <img src={round.image} alt={`${round.courseFull} scorecard - ${round.dateDisplay}`}
               style={{ width: '100%', display: 'block' }} />
          {onImageClick && (
            <div style={{
              position: 'absolute', bottom: '8px', right: '8px',
              background: 'rgba(14,42,71,0.9)', color: C.accent,
              padding: '5px 10px', borderRadius: '4px',
              fontFamily: sans, fontSize: '9px',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              fontWeight: 500
            }}>↻ Tap to enlarge</div>
          )}
        </div>
      )}

      {/* User observations (if any) */}
      {round.notes && (
        <div style={{
          background: 'rgba(0,0,0,0.18)',
          borderLeft: `3px solid ${C.accent}80`,
          borderRadius: '0 6px 6px 0',
          padding: '12px 16px',
          marginBottom: '18px'
        }}>
          <div style={{
            fontSize: '10px', letterSpacing: '0.25em',
            textTransform: 'uppercase', color: C.accent,
            fontFamily: sans, marginBottom: '8px', fontWeight: 500
          }}>My observations</div>
          <div style={{
            fontFamily: sans, fontSize: `${s(13)}px`,
            fontWeight: 300, lineHeight: 1.55, opacity: 0.92
          }}>{round.notes}</div>
        </div>
      )}

      {/* AI Analysis */}
      {round.aiAnalysis && (
        <>
          <div style={{
            background: 'rgba(163,217,85,0.06)',
            border: `1px solid ${C.accent}40`,
            borderRadius: '8px',
            padding: '18px 20px',
            marginBottom: '14px'
          }}>
            <div style={{
              fontSize: '11px', letterSpacing: '0.3em',
              textTransform: 'uppercase', color: C.accent,
              fontFamily: sans, marginBottom: '12px', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              ✨ Reading the Round
            </div>
            {round.aiAnalysis.reading && (
              <div style={{
                fontFamily: sans, fontSize: `${s(13)}px`,
                fontWeight: 300, lineHeight: 1.7, opacity: 0.92,
                whiteSpace: 'pre-wrap'
              }}>{round.aiAnalysis.reading}</div>
            )}

            {round.aiAnalysis.tigerFiveCount && (
              <div style={{
                fontFamily: sans, fontSize: `${s(12)}px`,
                fontStyle: 'italic', opacity: 0.8, marginTop: '12px',
                paddingTop: '12px', borderTop: `1px solid ${C.border}`
              }}>
                <strong style={{ color: C.text, fontStyle: 'normal' }}>Tiger Five count: </strong>
                {round.aiAnalysis.tigerFiveCount}
              </div>
            )}

            {Array.isArray(round.aiAnalysis.areaConnections) && round.aiAnalysis.areaConnections.length > 0 && (
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: `1px solid ${C.border}` }}>
                <div style={{
                  fontSize: '10px', letterSpacing: '0.25em',
                  textTransform: 'uppercase', color: C.accent,
                  marginBottom: '8px', fontWeight: 500, fontFamily: sans
                }}>Connection to Q2 Areas</div>
                <ul style={{ paddingLeft: '16px', margin: 0, fontFamily: sans, fontSize: `${s(12)}px`, lineHeight: 1.6, opacity: 0.9 }}>
                  {round.aiAnalysis.areaConnections.map((a, i) => <li key={i} style={{ marginBottom: '4px' }}>{a}</li>)}
                </ul>
              </div>
            )}
          </div>

          {Array.isArray(round.aiAnalysis.focusForNextRound) && round.aiAnalysis.focusForNextRound.length > 0 && (
            <div style={{
              background: 'rgba(0,0,0,0.22)',
              border: `1px solid ${C.accent}50`,
              borderRadius: '8px', padding: '18px 20px'
            }}>
              <div style={{
                fontSize: '11px', letterSpacing: '0.3em',
                textTransform: 'uppercase', color: C.accent,
                fontFamily: sans, marginBottom: '12px', fontWeight: 500
              }}>Focus for next round</div>
              <ul style={{
                fontFamily: sans, fontSize: `${s(13)}px`,
                fontWeight: 300, lineHeight: 1.7, opacity: 0.92,
                paddingLeft: '18px', margin: 0
              }}>
                {round.aiAnalysis.focusForNextRound.map((f, i) => <li key={i} style={{ marginBottom: '6px' }}>{f}</li>)}
              </ul>
            </div>
          )}
        </>
      )}

      {/* No AI analysis but has scorecard - show defaults for the seed round */}
      {!round.aiAnalysis && round.id === 'seed-2026-05-13' && !compact && (
        <div style={{
          background: 'rgba(0,0,0,0.25)',
          border: `1px solid ${C.border}`,
          borderRadius: '8px',
          padding: '16px 18px',
          fontFamily: sans, fontSize: `${s(12)}px`,
          fontWeight: 300, lineHeight: 1.6, opacity: 0.7
        }}>
          Front nine (49) much stronger than back (53). The back fell apart with three 6s and a 7 — compounding mistakes that DECADE would call avoidable. Driver dropped from 89% out → 33% in. 4 doubles + 1 triple killed the round.
        </div>
      )}
    </>
  );
}

// ============================================================
// NEW HANDICAP CARD FORM
// ============================================================
function NewHandicapCardForm({ onCancel, onSave, C, serif, sans }) {
  const [handicapIndex, setHandicapIndex] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [notes, setNotes] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('Image too large. Max 8MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1200;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round(height * (maxDim / width)); width = maxDim; }
          else { width = Math.round(width * (maxDim / height)); height = maxDim; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.75);
        setImagePreview(jpegDataUrl);
        setImageDataUrl(jpegDataUrl);
      };
      img.onerror = () => alert('Could not read image. Try a JPEG screenshot.');
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!handicapIndex.trim()) {
      alert('Please enter your handicap index.');
      return;
    }
    const d = new Date(date + 'T12:00:00');
    onSave({
      handicapIndex: handicapIndex.trim(),
      date,
      dateDisplay: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      image: imageDataUrl,
      notes: notes.trim()
    });
  };

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
      <div style={{ fontSize: 'clamp(28px, 6vw, 38px)', fontStyle: 'italic', lineHeight: 1.05, marginBottom: '6px' }}>
        Add Handicap Card
      </div>
      <div style={{
        fontSize: '11px', letterSpacing: '0.3em',
        textTransform: 'uppercase', opacity: 0.6,
        fontFamily: sans, fontWeight: 500
      }}>USGA Handicap Index</div>
      <div style={{ width: '40px', height: '2px', background: C.accent, marginTop: '18px', opacity: 0.7, marginBottom: '28px' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Index</label>
            <input type="text" placeholder="19.4"
              value={handicapIndex}
              onChange={(e) => setHandicapIndex(e.target.value)}
              style={inputBase} />
          </div>
          <div>
            <label style={labelStyle}>Date</label>
            <input type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={inputBase} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Handicap Card Image (optional)</label>
          <div style={{
            border: `1px dashed ${C.accent}70`, borderRadius: '8px',
            padding: '20px', textAlign: 'center', cursor: 'pointer',
            position: 'relative',
            background: imagePreview ? 'transparent' : 'rgba(0,0,0,0.18)'
          }}>
            <input type="file" accept="image/*" onChange={handleImageUpload}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
            {imagePreview ? (
              <img src={imagePreview} alt="Handicap card preview"
                style={{ maxWidth: '100%', borderRadius: '4px', display: 'block', margin: '0 auto' }} />
            ) : (
              <>
                <div style={{ fontSize: '28px', color: C.accent, opacity: 0.7, marginBottom: '6px' }}>📸</div>
                <div style={{ fontFamily: sans, fontSize: '13px', color: C.accent, fontWeight: 500 }}>
                  Tap to upload card screenshot
                </div>
              </>
            )}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Notes (optional)</label>
          <textarea placeholder="Any context about this index update..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ ...inputBase, minHeight: '70px', resize: 'vertical', fontFamily: sans }} />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleSave} style={{
            flex: 1, background: C.accent, border: 'none',
            color: C.bg, padding: '14px',
            fontFamily: sans, fontSize: '12px',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            fontWeight: 600, cursor: 'pointer', borderRadius: '6px'
          }}>Save Card</button>
          <button onClick={onCancel} style={{
            background: 'transparent', border: `1px solid ${C.border}`,
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

// ============================================================
// AREA RATING SLIDER MODAL
// Asks "how does this area feel?" 1-10 when leaving an area view
// ============================================================
function AreaRatingModal({ areaId, areaName, areaColor, onSave, onSkip, C, sans, serif }) {
  const [rating, setRating] = useState(5);

  return (
    <div onClick={onSkip} style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', zIndex: 2000,
      animation: 'fadeIn 0.25s'
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: C.bg2,
        border: `1px solid ${areaColor || C.accent}60`,
        borderRadius: '14px',
        padding: '28px 24px',
        maxWidth: '380px', width: '100%'
      }}>
        <div style={{
          fontSize: '11px', letterSpacing: '0.3em',
          textTransform: 'uppercase', color: areaColor || C.accent,
          fontFamily: sans, marginBottom: '10px', fontWeight: 500
        }}>Quick Check-In</div>
        <div style={{
          fontSize: '22px', fontStyle: 'italic',
          color: C.text, marginBottom: '6px', lineHeight: 1.2
        }}>How does {areaName} feel right now?</div>
        <div style={{
          fontFamily: sans, fontSize: '12px',
          opacity: 0.6, marginBottom: '24px'
        }}>1 = struggling · 10 = dialed in</div>

        {/* Big number display */}
        <div style={{
          textAlign: 'center', marginBottom: '20px'
        }}>
          <div style={{
            fontSize: '64px', fontStyle: 'italic', lineHeight: 1,
            color: areaColor || C.accent,
            fontFamily: serif
          }}>{rating}</div>
        </div>

        {/* Slider */}
        <input
          type="range"
          min="1" max="10" step="1"
          value={rating}
          onChange={(e) => setRating(parseInt(e.target.value, 10))}
          style={{
            width: '100%',
            accentColor: areaColor || C.accent,
            cursor: 'pointer',
            marginBottom: '8px'
          }}
        />
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontFamily: sans, fontSize: '10px', opacity: 0.5,
          marginBottom: '24px'
        }}>
          <span>1</span><span>5</span><span>10</span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => onSave(rating)} style={{
            flex: 1,
            background: areaColor || C.accent,
            border: 'none', color: C.bg, padding: '14px',
            fontFamily: sans, fontSize: '12px',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            fontWeight: 700, cursor: 'pointer', borderRadius: '6px'
          }}>Save</button>
          <button onClick={onSkip} style={{
            background: 'transparent', border: `1px solid ${C.border}`,
            color: C.text, padding: '14px 20px',
            fontFamily: sans, fontSize: '12px',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            cursor: 'pointer', borderRadius: '6px', opacity: 0.65
          }}>Skip</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STAT — small reusable stat block for My Progress
// ============================================================
function Stat({ label, value, C, sans, serif, accent }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${C.border}`,
      borderRadius: '6px',
      padding: '12px 14px',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '24px', fontStyle: 'italic',
        color: accent ? C.accent : C.text,
        fontFamily: serif,
        lineHeight: 1
      }}>{value}</div>
      <div style={{
        fontSize: '9px', letterSpacing: '0.22em',
        textTransform: 'uppercase', opacity: 0.55,
        fontFamily: sans, marginTop: '6px', fontWeight: 500
      }}>{label}</div>
    </div>
  );
}
