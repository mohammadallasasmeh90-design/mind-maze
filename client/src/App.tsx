import { useEffect, useMemo, useState } from "react";
import { Bell, Brain, Check, ChevronLeft, CircleHelp, Coins, Crown, Flame, Gamepad2, Gift, Globe2, Home as HomeIcon, Lock, Moon, Pause, Play, RotateCcw, Settings, Share2, Sparkles, Store, Trophy, Volume2, VolumeX, Zap } from "lucide-react";
import { generateDailyChallenges, scoreForAnswer, xpForLevel, type Challenge, type GameType } from "./game/engine";
import { analytics, loadPlayer, monetizationConfig, savePlayer, todayKey, type PlayerState } from "./lib/storage";
import "./index.css";

const bg = "/manus-storage/mind-maze-neural-bg_51667e7d.png";
const mark = "/manus-storage/mind-maze-mark_1b8071dc.png";
const navItems = [{ id: "home", label: "Home", icon: HomeIcon }, { id: "profile", label: "Profile", icon: Trophy }, { id: "store", label: "Store", icon: Store }];
const typeMeta: Record<GameType, { label: string; color: string; icon: string }> = { Memory: { label: "Memory", color: "#ff735f", icon: "◒" }, Logic: { label: "Logic", color: "#8d84ff", icon: "⌁" }, Attention: { label: "Attention", color: "#5ed3ad", icon: "⊙" }, Speed: { label: "Speed", color: "#f5c86d", icon: "ϟ" }, Pattern: { label: "Pattern", color: "#e899ff", icon: "▦" } };

function App() {
  const [page, setPage] = useState("home");
  const [player, setPlayer] = useState<PlayerState>(() => loadPlayer());
  const [game, setGame] = useState<"idle" | "playing" | "done">("idle");
  const [question, setQuestion] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const challenges = useMemo(() => generateDailyChallenges(), []);
  const current = challenges[question];
  const totalScore = answers.reduce((sum, value, index) => sum + scoreForAnswer(value, index), 0);
  const levelProgress = Math.min(100, Math.round((player.xp / xpForLevel(player.level)) * 100));

  useEffect(() => { savePlayer(player); }, [player]);
  useEffect(() => { if (new URLSearchParams(window.location.search).has("demo")) { setGame("playing"); setPage("play"); } }, []);

  function startGame() { analytics.track("game_started"); setGame("playing"); setQuestion(0); setAnswers([]); setSelected(null); setShowHint(false); setPage("play"); }
  function answer(option: string) {
    if (selected) return;
    const isCorrect = option === current.answer;
    analytics.track(isCorrect ? "correct_answer" : "wrong_answer", { type: current.type });
    setSelected(option);
    const next = [...answers, isCorrect]; setAnswers(next);
    window.setTimeout(() => { if (question < challenges.length - 1) { setQuestion(question + 1); setSelected(null); setShowHint(false); } else { finishGame(next); } }, 650);
  }
  function finishGame(results: boolean[]) {
    const correct = results.filter(Boolean).length; const score = results.reduce((sum, value, index) => sum + scoreForAnswer(value, index), 0);
    setPlayer(prev => ({ ...prev, xp: prev.xp + 150, coins: prev.coins + 75, bestScore: Math.max(prev.bestScore, score), gamesPlayed: prev.gamesPlayed + 1, accuracy: Math.round((prev.accuracy * prev.gamesPlayed + correct * 20) / (prev.gamesPlayed + 1)), dailyCompleted: true, dailyDate: todayKey(), bestStreak: Math.max(prev.bestStreak, prev.streak + 1), streak: prev.streak + 1, achievements: prev.achievements.includes("first-game") ? prev.achievements : [...prev.achievements, "first-game"] }));
    analytics.track("challenge_completed", { score }); setGame("done");
  }
  function resetDaily() { setPlayer(prev => ({ ...prev, dailyCompleted: false })); setGame("idle"); setPage("home"); }
  function shareScore() { analytics.track("share_clicked"); const text = `I scored ${totalScore.toLocaleString()} in Mind Maze. Can you beat me?`; if (navigator.share) navigator.share({ title: "Mind Maze", text }); else navigator.clipboard?.writeText(text); }

  return <div className="app-shell" style={{ backgroundImage: `linear-gradient(180deg, rgba(8,19,43,.13), rgba(8,19,43,1) 60%), url(${bg})` }}>
    <header className="topbar"><button className="brand" onClick={() => { setPage("home"); setGame("idle"); }}><img src={mark} alt="Mind Maze" /><span><strong>mind maze</strong><small>train your edge</small></span></button><div className="top-actions"><div className="coin-pill"><Coins size={15} /> {player.coins.toLocaleString()}</div><button className="icon-btn" aria-label="Settings" onClick={() => setShowSettings(true)}><Settings size={18} /></button></div></header>
    <main className="content">
      {page === "home" && <HomeView player={player} levelProgress={levelProgress} startGame={startGame} setPage={setPage} />}
      {page === "play" && <PlayView game={game} current={current} question={question} total={challenges.length} selected={selected} showHint={showHint} setShowHint={setShowHint} answer={answer} totalScore={totalScore} resetDaily={resetDaily} startGame={startGame} shareScore={shareScore} />}
      {page === "profile" && <ProfileView player={player} levelProgress={levelProgress} />}
      {page === "store" && <StoreView />}
    </main>
    <nav className="bottom-nav">{navItems.map(item => { const Icon = item.icon; return <button key={item.id} className={page === item.id ? "active" : ""} onClick={() => setPage(item.id)}><Icon size={19} /><span>{item.label}</span></button>; })}</nav>
    {showSettings && <SettingsModal player={player} setPlayer={setPlayer} close={() => setShowSettings(false)} />}
  </div>;
}

function HomeView({ player, levelProgress, startGame, setPage }: { player: PlayerState; levelProgress: number; startGame: () => void; setPage: (page: string) => void }) {
  return <div className="home-view"><section className="hero"><div className="eyebrow"><span className="live-dot" /> DAILY PRACTICE · 5 MINUTES</div><h1>Make your mind<br /><em>move faster.</em></h1><p>Five sharp challenges. One clearer you.</p><button className="primary-cta" onClick={startGame}><span>Play today’s challenge</span><Zap size={18} fill="currentColor" /></button><div className="microcopy"><Lock size={12} /> Free to play · No forced ads</div></section>
    <section className="stats-row"><div className="stat-card level-card"><div className="stat-icon coral"><Brain size={18} /></div><div><span className="label">LEVEL {player.level}</span><strong>{player.xp} <small>/ {xpForLevel(player.level)} XP</small></strong><div className="progress"><i style={{ width: `${levelProgress}%` }} /></div></div></div><div className="stat-card streak-card"><div className="stat-icon mint"><Flame size={18} /></div><div><span className="label">STREAK</span><strong>{player.streak} <small>days</small></strong><div className="streak-dots">{[1, 2, 3, 4, 5, 6, 7].map(d => <span key={d} className={d <= player.streak ? "filled" : ""}>{d === 7 ? "✦" : "·"}</span>)}</div></div></div></section>
    <section className="section-block"><div className="section-head"><div><span className="overline">TODAY’S ROUTE</span><h2>Five ways to wake up.</h2></div><button className="text-btn" onClick={() => setPage("profile")}>Your stats <ChevronLeft size={15} /></button></div><div className="challenge-grid">{(["Memory", "Logic", "Attention", "Speed", "Pattern"] as GameType[]).map((type, index) => <div className="challenge-card" key={type} style={{ "--accent": typeMeta[type].color } as React.CSSProperties}><div className="challenge-number">0{index + 1}</div><div className="type-mark">{typeMeta[type].icon}</div><div><strong>{type}</strong><span>{index === 0 ? "Sequence recall" : index === 1 ? "Find the rule" : index === 2 ? "Spot the signal" : index === 3 ? "Trust your instinct" : "See what’s next"}</span></div><span className="check-circle">{player.dailyCompleted ? <Check size={14} /> : ""}</span></div>)}</div></section>
    <section className="return-card"><div><span className="overline">COME BACK TOMORROW</span><h3>Small reps. Big shifts.</h3><p>Your next streak milestone is <b>Day 7</b>.</p></div><div className="calendar-mark"><span>DAY</span><strong>{String(player.streak + 1).padStart(2, "0")}</strong></div></section>
  </div>;
}

function PlayView({ game, current, question, total, selected, showHint, setShowHint, answer, totalScore, resetDaily, startGame, shareScore }: any) {
  if (game === "done") return <section className="result-screen"><div className="result-orb"><Sparkles size={28} /></div><span className="eyebrow">ROUTE COMPLETE</span><h1>Nice work, <em>brain.</em></h1><p>You showed up. That’s the habit.</p><div className="result-score"><span>YOUR SCORE</span><strong>{totalScore.toLocaleString()}</strong><small>+150 XP · +75 coins</small></div><div className="result-grid"><div><b>{answersLabel(totalScore)}</b><span>momentum</span></div><div><b>80%</b><span>accuracy</span></div><div><b>04:32</b><span>time</span></div></div><div className="result-actions"><button className="primary-cta" onClick={shareScore}><Share2 size={17} /> Share result</button><button className="secondary-cta" onClick={startGame}><RotateCcw size={16} /> Play again</button><button className="ghost-btn" onClick={resetDaily}>Back to home</button></div></section>;
  return <section className="play-screen"><div className="play-head"><button className="back-btn" onClick={resetDaily}><ChevronLeft size={19} /> Exit</button><div className="play-progress">{[0,1,2,3,4].map(i => <span key={i} className={i < question ? "done" : i === question ? "current" : ""} />)}</div><span className="question-count">0{question + 1}/0{total}</span></div><div className="challenge-label" style={{ color: typeMeta[current.type as GameType].color }}><span>{typeMeta[current.type as GameType].icon}</span> {current.type.toUpperCase()}</div><h1 className="question-title">{current.prompt.split("\n").map((line: string) => <span key={line}>{line}</span>)}</h1><div className="answer-list">{current.options.map((option: string) => <button key={option} className={`answer-btn ${selected ? option === current.answer ? "correct" : option === selected ? "wrong" : "muted" : ""}`} onClick={() => answer(option)} disabled={!!selected}><span>{option}</span>{selected && option === current.answer && <Check size={17} />}</button>)}</div><button className="hint-btn" onClick={() => { setShowHint(!showHint); analytics.track("hint_used"); }}><CircleHelp size={16} /> Need a nudge? <b>Hint</b> <span>−25 coins</span></button>{showHint && <div className="hint-box">{current.hint}</div>}<div className="play-footer"><span><Pause size={14} /> Take your time</span><span><Zap size={14} /> +100 pts base</span></div></section>;
}
function answersLabel(score: number) { return score > 450 ? "Sharp form" : score > 250 ? "Good rhythm" : "Warm start"; }
function ProfileView({ player, levelProgress }: { player: PlayerState; levelProgress: number }) { return <section className="profile-view"><div className="profile-header"><div className="avatar"><img src={mark} alt="" /></div><div><span className="overline">PLAYER PROFILE</span><h1>Alex’s brain map</h1><p>Level {player.level} · Learning in public</p></div><button className="icon-btn"><Settings size={18} /></button></div><div className="profile-level"><div className="level-line"><span>LEVEL {player.level}</span><b>{xpForLevel(player.level) - player.xp} XP to level up</b></div><div className="big-progress"><i style={{ width: `${levelProgress}%` }} /></div></div><div className="metric-grid"><Metric icon={<Trophy size={19} />} value={player.bestScore.toLocaleString()} label="Best score" /><Metric icon={<Flame size={19} />} value={player.bestStreak} label="Best streak" /><Metric icon={<TargetIcon />} value={`${player.accuracy}%`} label="Accuracy" /><Metric icon={<Gamepad2 size={19} />} value={player.gamesPlayed} label="Games played" /></div><div className="section-head compact"><div><span className="overline">ACHIEVEMENTS</span><h2>Proof of progress.</h2></div><span className="badge-count">2 / 14</span></div><div className="achievement-list"><Achievement icon="✦" title="First spark" copy="Complete your first game" done /><Achievement icon="◒" title="Week one" copy="Keep a 7 day streak" done /><Achievement icon="ϟ" title="Quick thinker" copy="Finish a speed round under 30 sec" /></div></section>; }
function Metric({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) { return <div className="metric"><span>{icon}</span><b>{value}</b><small>{label}</small></div>; }
function TargetIcon() { return <span style={{ fontSize: 20 }}>◎</span>; }
function Achievement({ icon, title, copy, done }: { icon: string; title: string; copy: string; done?: boolean }) { return <div className={`achievement ${done ? "done" : ""}`}><div className="achievement-icon">{done ? <Check size={17} /> : <Lock size={15} />}</div><div><b>{icon} {title}</b><span>{copy}</span></div>{done && <span className="earned">EARNED</span>}</div>; }
function StoreView() { return <section className="store-view"><div className="store-hero"><span className="overline">THE MIND MAZE SHOP</span><h1>Invest in your<br /><em>focus.</em></h1><p>Optional extras. The full game stays free.</p></div><div className="store-tabs"><span className="active">Featured</span><span>Mind Coins</span><span>Themes</span></div><div className="product-grid"><Product icon="✦" title="Starter pack" copy="500 Mind Coins" price="Configuration ready" featured /><Product icon="◉" title="Quiet mode" copy="Remove forced ads" price="Configuration ready" /><Product icon="◒" title="Premium path" copy="Advanced stats + themes" price="Configuration ready" /></div><div className="store-note"><Crown size={17} /> Payments and ad SDKs are not connected in this MVP. The interface is ready for platform configuration.</div></section>; }
function Product({ icon, title, copy, price, featured }: { icon: string; title: string; copy: string; price: string; featured?: boolean }) { return <div className={`product ${featured ? "featured" : ""}`}><div className="product-icon">{icon}</div><div><b>{title}</b><span>{copy}</span></div><button>{price}</button></div>; }
function SettingsModal({ player, setPlayer, close }: { player: PlayerState; setPlayer: React.Dispatch<React.SetStateAction<PlayerState>>; close: () => void }) { return <div className="modal-backdrop" onClick={close}><div className="settings-modal" onClick={e => e.stopPropagation()}><div className="modal-head"><div><span className="overline">PREFERENCES</span><h2>Make it yours.</h2></div><button className="icon-btn" onClick={close}>×</button></div><SettingRow icon={<Globe2 size={18} />} title="Language" value={player.language === "en" ? "English" : "العربية"} action={() => setPlayer(p => ({ ...p, language: p.language === "en" ? "ar" : "en" }))} /><SettingRow icon={player.sound ? <Volume2 size={18} /> : <VolumeX size={18} />} title="Sound effects" value={player.sound ? "On" : "Off"} action={() => setPlayer(p => ({ ...p, sound: !p.sound }))} /><SettingRow icon={<Moon size={18} />} title="Reduced motion" value={player.reducedMotion ? "On" : "Off"} action={() => setPlayer(p => ({ ...p, reducedMotion: !p.reducedMotion }))} /><div className="consent-row"><div><b>Privacy & analytics</b><span>Anonymous events help improve the game.</span></div><button className={`toggle ${player.consent ? "on" : ""}`} onClick={() => setPlayer(p => ({ ...p, consent: !p.consent }))}><i /></button></div><p className="modal-foot">No contacts, precise location, or sensitive data collected.</p></div></div>; }
function SettingRow({ icon, title, value, action }: { icon: React.ReactNode; title: string; value: string; action: () => void }) { return <button className="setting-row" onClick={action}><span className="setting-icon">{icon}</span><span><b>{title}</b><small>{value}</small></span><ChevronLeft size={17} /></button>; }

export default App;
