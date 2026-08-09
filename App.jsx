import React, { useState, useMemo, useRef, useCallback } from "react";
import { Search, Sparkles, Play, Heart, Film } from "lucide-react";

/* ----------------------------------------------------------------
   MOCK DATA
------------------------------------------------------------------*/
const MOVIES = [
  { id: "tt6718170", title: "The Super Mario Bros. Movie", year: 2023, rating: 7.0, moods: ["fun", "adventurous", "family"], intensity: 3, plot: "Two Brooklyn plumbers get warped into the Mushroom Kingdom and team up to save it from a fire-breathing tyrant." },
  { id: "tt19853258", title: "Still: A Michael J. Fox Movie", year: 2023, rating: 7.7, moods: ["uplifting", "cozy"], intensity: 4, plot: "An intimate documentary weaving Michael J. Fox's own words into the story of his career and life with Parkinson's." },
  { id: "tt27145269", title: "Mr. Monk's Last Case", year: 2023, rating: 7.2, moods: ["cozy", "fun"], intensity: 3, plot: "Adrian Monk comes out of retirement to solve one final case tangled up with his late wife's unsolved death." },
  { id: "paddington2", title: "Paddington 2", year: 2017, rating: 8.2, moods: ["fun", "cozy", "family"], intensity: 2, plot: "A lovable bear is framed for theft and must clear his name from inside a London prison, charming everyone he meets." },
  { id: "chef2014", title: "Chef", year: 2014, rating: 7.3, moods: ["cozy", "uplifting"], intensity: 2, plot: "A chef who loses his restaurant job rediscovers his passion by launching a food truck with his son." },
  { id: "inception", title: "Inception", year: 2010, rating: 8.8, moods: ["mind-bending", "intense"], intensity: 8, plot: "A thief who steals secrets from people's dreams is offered one last job: planting an idea instead." },
  { id: "eeaao", title: "Everything Everywhere All at Once", year: 2022, rating: 7.8, moods: ["mind-bending", "fun", "uplifting"], intensity: 7, plot: "An overwhelmed laundromat owner discovers she must connect with parallel versions of herself to save existence." },
  { id: "prisoners", title: "Prisoners", year: 2013, rating: 8.1, moods: ["intense", "mind-bending"], intensity: 9, plot: "When two young girls go missing, a desperate father takes matters into his own hands as the case unravels." },
  { id: "lalaland", title: "La La Land", year: 2016, rating: 8.0, moods: ["romantic", "uplifting"], intensity: 4, plot: "A jazz pianist and an aspiring actress fall in love while chasing their dreams in Los Angeles." },
  { id: "raiders", title: "Raiders of the Lost Ark", year: 1981, rating: 8.4, moods: ["adventurous", "fun"], intensity: 6, plot: "Archaeologist Indiana Jones races Nazi agents to find the Ark of the Covenant before they do." },
  { id: "pursuit", title: "The Pursuit of Happyness", year: 2006, rating: 8.0, moods: ["uplifting", "intense"], intensity: 5, plot: "A struggling salesman fights through homelessness to secure a better future for himself and his son." },
  { id: "grandbudapest", title: "The Grand Budapest Hotel", year: 2014, rating: 8.1, moods: ["fun", "cozy", "adventurous"], intensity: 3, plot: "A legendary concierge and his loyal lobby boy get swept into a caper involving a stolen painting and a vast fortune." },
];

const CHIPS = [
  { id: "fun", label: "Fun" },
  { id: "cozy", label: "Cozy" },
  { id: "mind-bending", label: "Mind-bending" },
  { id: "intense", label: "Intense" },
  { id: "romantic", label: "Romantic" },
  { id: "adventurous", label: "Adventurous" },
];

const STEPS = 10; // knob notches
const SWEEP = 270; // degrees of travel
const START_ANGLE = -135; // degrees, knob zero position

/* ----------------------------------------------------------------
   NEUMORPHIC DESIGN TOKENS
------------------------------------------------------------------*/
const TOKENS = {
  bg: "#1c1c20",
  surface: "#1e1e22",
  surfaceInset: "#1a1a1e",
  shadowDark: "#151518",
  shadowLight: "#272730",
  textPrimary: "#ececee",
  textSecondary: "#8b8d93",
  textTertiary: "#5c5e64",
  gold: "#c9a24b",
  accentFrom: "#ff8a4c",
  accentTo: "#e6394f",
  neon: "#ff5e36",
};

const shadow = {
  raisedLg: `8px 8px 16px ${TOKENS.shadowDark}, -8px -8px 16px ${TOKENS.shadowLight}`,
  raised: `6px 6px 12px ${TOKENS.shadowDark}, -6px -6px 12px ${TOKENS.shadowLight}`,
  raisedSm: `4px 4px 9px ${TOKENS.shadowDark}, -4px -4px 9px ${TOKENS.shadowLight}`,
  inset: `inset 4px 4px 8px ${TOKENS.shadowDark}, inset -4px -4px 8px ${TOKENS.shadowLight}`,
  insetSm: `inset 3px 3px 6px ${TOKENS.shadowDark}, inset -3px -3px 6px ${TOKENS.shadowLight}`,
  accentGlow: `6px 6px 12px ${TOKENS.shadowDark}, -6px -6px 12px ${TOKENS.shadowLight}, 0 0 18px 2px rgba(230,57,79,0.45)`,
  badgeGlow: `4px 4px 10px ${TOKENS.shadowDark}, 0 0 20px 4px rgba(230,57,79,0.5)`,
  knobRaised: `10px 10px 20px ${TOKENS.shadowDark}, -10px -10px 20px ${TOKENS.shadowLight}`,
  dotGlow: `0 0 12px #ff5e36, 0 0 4px #ff5e36`,
};

const accentGradient = `linear-gradient(145deg, ${TOKENS.accentFrom}, ${TOKENS.accentTo})`;

function scoreMovie(movie, query, chip, mood) {
  let score = 62;
  const q = query.trim().toLowerCase();
  if (q) {
    const hay = (movie.title + " " + movie.moods.join(" ") + " " + movie.plot).toLowerCase();
    q.split(/\s+/).forEach((word) => {
      if (word.length > 2 && hay.includes(word)) score += 9;
    });
  }
  if (chip && movie.moods.includes(chip)) score += 22;
  const diff = Math.abs(movie.intensity - mood);
  score -= diff * 3;
  score += movie.rating >= 8 ? 4 : 0;
  return Math.max(35, Math.min(99, Math.round(score)));
}

/* ----------------------------------------------------------------
   Animated Engine Core logo
------------------------------------------------------------------*/
function EngineCore({ size = 44 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        borderRadius: "50%",
        flexShrink: 0,
        background: TOKENS.surface,
        boxShadow: shadow.raised,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <style>{`
        @keyframes enginePulse {
          0%   { box-shadow: 0 0 6px 1px rgba(255,94,54,0.45), 0 0 0px 0px rgba(255,94,54,0.0); transform: scale(0.92); }
          50%  { box-shadow: 0 0 16px 4px rgba(255,94,54,0.85), 0 0 26px 8px rgba(255,94,54,0.35); transform: scale(1); }
          100% { box-shadow: 0 0 6px 1px rgba(255,94,54,0.45), 0 0 0px 0px rgba(255,94,54,0.0); transform: scale(0.92); }
        }
        @keyframes ringSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
      <div
        style={{
          position: "absolute",
          inset: 3,
          borderRadius: "50%",
          border: `1px dashed rgba(255,138,76,0.35)`,
          animation: "ringSpin 12s linear infinite",
        }}
      />
      <div
        style={{
          width: size * 0.42,
          height: size * 0.42,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 30%, #ffb27a, #ff5e36 55%, #c62b3a 100%)",
          animation: "enginePulse 2.6s ease-in-out infinite",
        }}
      />
    </div>
  );
}

/* ----------------------------------------------------------------
   Rotary Neumorphic Knob (drag or click a notch to set intensity)
------------------------------------------------------------------*/
function RotaryKnob({ value, onChange }) {
  const containerRef = useRef(null);
  const draggingRef = useRef(false);
  const audioCtxRef = useRef(null);

  const playClick = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new Ctx();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(720, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(340, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      /* audio unsupported, fail silently */
    }
  }, []);

  const angleForIndex = (i) => START_ANGLE + (SWEEP / (STEPS - 1)) * i;

  const setFromAngle = useCallback(
    (angleDeg) => {
      let a = Math.max(START_ANGLE, Math.min(START_ANGLE + SWEEP, angleDeg));
      const idx = Math.round(((a - START_ANGLE) / SWEEP) * (STEPS - 1));
      const clamped = Math.max(0, Math.min(STEPS - 1, idx));
      const newVal = clamped + 1;
      if (newVal !== value) {
        onChange(newVal);
        playClick();
      }
    },
    [value, onChange, playClick]
  );

  const angleFromEvent = (clientX, clientY) => {
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90; // 0deg = up
    if (deg > 180) deg -= 360;
    if (deg < -180) deg += 360;
    return deg;
  };

  const handlePointerDown = (e) => {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setFromAngle(angleFromEvent(e.clientX, e.clientY));
  };
  const handlePointerMove = (e) => {
    if (!draggingRef.current) return;
    setFromAngle(angleFromEvent(e.clientX, e.clientY));
  };
  const handlePointerUp = () => {
    draggingRef.current = false;
  };

  const size = 176;
  const radius = size / 2;
  const dotRadius = radius - 10;
  const knobRotation = angleForIndex(value - 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, userSelect: "none" }}>
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ position: "relative", width: size, height: size, touchAction: "none", cursor: "grab" }}
      >
        {/* notch dots */}
        {Array.from({ length: STEPS }).map((_, i) => {
          const deg = angleForIndex(i);
          const rad = (deg * Math.PI) / 180;
          const x = radius + dotRadius * Math.sin(rad);
          const y = radius - dotRadius * Math.cos(rad);
          const active = i === value - 1;
          return (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setFromAngle(deg);
              }}
              style={{
                position: "absolute",
                left: x - 5,
                top: y - 5,
                width: 10,
                height: 10,
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                background: active ? TOKENS.neon : "#2c2d32",
                boxShadow: active ? shadow.dotGlow : shadow.raisedSm,
                transition: "background 0.15s ease, box-shadow 0.15s ease",
              }}
            />
          );
        })}

        {/* knob body */}
        <div
          style={{
            position: "absolute",
            left: radius - radius * 0.62,
            top: radius - radius * 0.62,
            width: radius * 1.24,
            height: radius * 1.24,
            borderRadius: "50%",
            background: TOKENS.surface,
            boxShadow: shadow.knobRaised,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "16%",
              borderRadius: "50%",
              background: TOKENS.surfaceInset,
              boxShadow: shadow.inset,
            }}
          />
          {/* rotation indicator */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: `rotate(${knobRotation}deg)`,
              transition: "transform 0.18s cubic-bezier(0.2,0.8,0.2,1)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "12%",
                left: "50%",
                width: 5,
                height: 14,
                borderRadius: 4,
                transform: "translateX(-50%)",
                background: accentGradient,
                boxShadow: "0 0 8px 1px rgba(255,94,54,0.7)",
              }}
            />
          </div>
          {/* center core glow */}
          <div
            style={{
              position: "absolute",
              inset: "38%",
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 30%, #ffb27a, #ff5e36 55%, #c62b3a 100%)",
              boxShadow: "0 0 14px 2px rgba(255,94,54,0.55)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState(null);
  const [mood, setMood] = useState(5);
  const [showResults, setShowResults] = useState(false);
  const [liked, setLiked] = useState({});
  const [pressed, setPressed] = useState(null);

  const results = useMemo(() => {
    return MOVIES.filter((m) => m.rating >= 7.0)
      .map((m) => ({ ...m, score: scoreMovie(m, query, chip, mood) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [query, chip, mood]);

  const moodLabel =
    mood <= 2 ? "Chill" : mood <= 4 ? "Relaxed" : mood <= 6 ? "Balanced" : mood <= 8 ? "Gripping" : "Intense";

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "40px 16px",
        background: TOKENS.bg,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Header card */}
        <div
          style={{
            borderRadius: 28,
            padding: 24,
            marginBottom: 24,
            background: TOKENS.surface,
            boxShadow: shadow.raisedLg,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <EngineCore size={46} />
            <div>
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  color: TOKENS.textPrimary,
                  fontFamily: "'Poppins', sans-serif",
                  margin: 0,
                }}
              >
                Movie Concierge
              </h1>
              <p style={{ fontSize: 12, marginTop: 3, color: TOKENS.textSecondary }}>
                Engine core active — tell it the mood.
              </p>
            </div>
          </div>

          {/* Search - inset */}
          <div
            style={{
              marginTop: 22,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              background: TOKENS.surfaceInset,
              boxShadow: shadow.inset,
            }}
          >
            <Search size={18} color="#6b6d73" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe a mood — rainy day, mind-bending…"
              style={{
                background: "transparent",
                outline: "none",
                border: "none",
                width: "100%",
                fontSize: 14,
                color: TOKENS.textPrimary,
              }}
            />
          </div>

          {/* Chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
            {CHIPS.map((c) => {
              const active = chip === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setChip(active ? null : c.id)}
                  style={{
                    padding: "9px 14px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 500,
                    border: "none",
                    cursor: "pointer",
                    background: active ? TOKENS.surfaceInset : TOKENS.surface,
                    color: active ? "#ff9457" : "#a3a5ab",
                    boxShadow: active ? shadow.insetSm : shadow.raisedSm,
                    transition: "box-shadow 0.15s ease, color 0.15s ease",
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* Rotary knob */}
          <div style={{ marginTop: 26, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <RotaryKnob value={mood} onChange={setMood} />
            <div
              style={{
                marginTop: 10,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.03em",
                background: accentGradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {moodLabel.toUpperCase()}
            </div>
            <div style={{ fontSize: 10, color: TOKENS.textTertiary, marginTop: 2 }}>Drag or tap a notch</div>
          </div>

          {/* CTA */}
          <button
            onClick={() => setShowResults(true)}
            onMouseDown={() => setPressed("cta")}
            onMouseUp={() => setPressed(null)}
            onMouseLeave={() => setPressed(null)}
            style={{
              marginTop: 24,
              width: "100%",
              padding: "14px 0",
              borderRadius: 16,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: "#fff",
              background: accentGradient,
              boxShadow: pressed === "cta" ? shadow.insetSm : shadow.accentGlow,
            }}
          >
            <Sparkles size={16} />
            Find My Movies
          </button>
        </div>

        {/* Results */}
        {showResults && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2
              style={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                padding: "0 8px",
                color: TOKENS.textTertiary,
                margin: 0,
              }}
            >
              Top Matches
            </h2>
            {results.map((m, idx) => (
              <div
                key={m.id}
                style={{
                  borderRadius: 24,
                  padding: "18px 18px 16px",
                  position: "relative",
                  background: TOKENS.surface,
                  boxShadow: shadow.raised,
                }}
              >
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 30,
                      flexShrink: 0,
                      textAlign: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: "'Poppins', sans-serif",
                      color: TOKENS.textTertiary,
                      paddingTop: 2,
                    }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.3, color: TOKENS.textPrimary, margin: 0 }}>
                        {m.title}
                        <span style={{ fontWeight: 400, color: TOKENS.textTertiary }}> · {m.year}</span>
                      </h3>
                      <button
                        onClick={() => setLiked((l) => ({ ...l, [m.id]: !l[m.id] }))}
                        style={{
                          width: 32,
                          height: 32,
                          flexShrink: 0,
                          borderRadius: "50%",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: TOKENS.surface,
                          boxShadow: shadow.raisedSm,
                        }}
                      >
                        <Heart size={14} color={liked[m.id] ? "#e6394f" : "#6b6d73"} fill={liked[m.id] ? "#e6394f" : "none"} />
                      </button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                      <span
                        style={{
                          fontSize: 11,
                          padding: "4px 9px",
                          borderRadius: 8,
                          fontWeight: 600,
                          letterSpacing: "0.02em",
                          background: TOKENS.surfaceInset,
                          color: TOKENS.gold,
                          boxShadow: shadow.insetSm,
                        }}
                      >
                        IMDb {m.rating.toFixed(1)}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          padding: "4px 9px",
                          borderRadius: 8,
                          fontWeight: 700,
                          letterSpacing: "0.02em",
                          background: accentGradient,
                          color: "#fff",
                          boxShadow: shadow.badgeGlow,
                        }}
                      >
                        {m.score}% MATCH
                      </span>
                    </div>

                    <p style={{ fontSize: 12.5, marginTop: 10, lineHeight: 1.55, color: "#9496a0" }}>{m.plot}</p>
                  </div>
                </div>

                <button
                  style={{
                    marginTop: 14,
                    width: "100%",
                    padding: "9px 0",
                    borderRadius: 12,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    background: TOKENS.surfaceInset,
                    color: "#a3a5ab",
                    boxShadow: shadow.raisedSm,
                  }}
                >
                  <Play size={12} fill="#a3a5ab" /> View details
                </button>
              </div>
            ))}
          </div>
        )}

        {!showResults && (
          <div style={{ textAlign: "center", padding: "40px 24px", color: TOKENS.textTertiary }}>
            <Film size={26} style={{ margin: "0 auto 12px", display: "block" }} strokeWidth={1.5} />
            <p style={{ fontSize: 12, lineHeight: 1.6 }}>
              Pick a mood chip, dial the knob, or type how you're feeling — then tap Find My Movies.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
