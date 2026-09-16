import { useEffect, useMemo, useState } from "react";
import { Bell, Brain, Check, ChevronLeft, CircleHelp, Coins, Crown, Flame, Gamepad2, Gift, Globe2, Home as HomeIcon, Lock, Moon, Pause, Play, RotateCcw, Settings, Share2, Sparkles, Store, Trophy, Volume2, VolumeX, Zap } from "lucide-react";
import { generateDailyChallenges, scoreForAnswer, xpForLevel, type Challenge, type GameType } from "./game/engine";
import { analytics, loadPlayer, monetizationConfig, savePlayer, todayKey, type PlayerState } from "./lib/storage";
import { t, type Language } from "./lib/localization";
import "./index.css";

const bg = "/manus-storage/mind-maze-neural-bg_51667e7d.png";
const mark = "/manus-storage/mind-maze-mark_1b8071dc.png";
const navItems = [{ id: "home", label: "Home", icon: HomeIcon }, { id: "profile", label: "Profile", icon: Trophy }, { id: "store", label: "Store", icon: Store }];
const typeMeta: Record<GameType, { label: string; color: string; icon: string }> = { Memory: { label: "Memory", color: "#ff735f", icon: "◒" }, Logic: { label: "Logic", color: "#8d84ff", icon: "⌁" }, Attention: { label: "Attention", color: "#5ed3ad", icon: "⊙" }, Speed: { label: "Speed", color: "#f5c86d", icon: "ϟ" }, Pattern: { label: "Pattern", color: "#e899ff", icon: "▦" } };

function App() {
  const [page, setPage] = useState("home");
  const [player, setPlayer] = useState<PlayerState>(() => {
    const saved = loadPlayer();
    try {
      if (!localStorage.getItem("mind-maze-player-v1") && navigator.language.toLowerCase().startsWith("ar")) {
        return { ...saved, language: "ar" };
      }
    } catch { /* keep the safe fallback */ }
    return saved;
  });
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
  const language = player.language;

  useEffect(() => { savePlayer(player); }, [player]);
  useEffect(() => { const params = new URLSearchParams(window.location.search); if (params.has("demo")) { setGame("playing"); setPage("play"); }
    if (params.get("lang") === "ar") setPlayer(prev => ({ ...prev, language: "ar" }));
    if (params.get("settings") === "1") setShowSettings(true); }, []);

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

  return <div dir={language === "ar" ? "rtl" : "ltr"} className="app-shell" style={{ backgroundImage: `linear-gradient(180deg, rgba(8,19,43,.13), rgba(8,19,43,1) 60%), url(${bg})` }}>
    <header className="topbar"><button className="brand" onClick={() => { setPage("home"); setGame("idle"); }}><img src={mark} alt="Mind Maze" /><span><strong>mind maze</strong><small>train your edge</small></span></button><div className="top-actions"><button className="language-switch" aria-label="Change language" onClick={() => setPlayer(prev => ({ ...prev, language: prev.language === "ar" ? "en" : "ar" }))}>{language === "ar" ? "EN" : "عربي"}</button><div className="coin-pill"><Coins size={15} /> {player.coins.toLocaleString()}</div><button className="icon-btn" aria-label="Settings" onClick={() => setShowSettings(true)}><Settings size={18} /></button></div></header>
    <main className="content">
      {page === "home" && <HomeView language={language} player={player} levelProgress={levelProgress} startGame={startGame} setPage={setPage} />}
      {page === "play" && <PlayView language={language} game={game} current={current} question={question} total={challenges.length} selected={selected} showHint={showHint} setShowHint={setShowHint} answer={answer} totalScore={totalScore} resetDaily={resetDaily} startGame={startGame} shareScore={shareScore} />}
      {page === "profile" && <ProfileView language={language} player={player} levelProgress={levelProgress} />}
      {page === "store" && <StoreView language={language} />}
    </main>
    <nav className="bottom-nav">{navItems.map(item => { const Icon = item.icon; return <button key={item.id} className={page === item.id ? "active" : ""} onClick={() => setPage(item.id)}><Icon size={19} /><span>{t(language, item.id as "home" | "profile" | "store")}</span></button>; })}</nav>
    {showSettings && <SettingsModal key={language} player={player} setPlayer={setPlayer} close={() => setShowSettings(false)} />}
  </div>;
}

function HomeView({ language, player, levelProgress, startGame, setPage }: { language: Language; player: PlayerState; levelProgress: number; startGame: () => void; setPage: (page: string) => void }) {
  return <div className="home-view"><section className="hero"><div className="eyebrow"><span className="live-dot" /> {t(language, "dailyPractice")}</div><h1>{t(language, "titleA")}<br /><em>{t(language, "titleB")}</em></h1><p>{t(language, "subtitle")}</p><button className="primary-cta" onClick={startGame}><span>{t(language, "playToday")}</span><Zap size={18} fill="currentColor" /></button><div className="microcopy"><Lock size={12} /> {t(language, "freePlay")}</div></section>
    <section className="stats-row"><div className="stat-card level-card"><div className="stat-icon coral"><Brain size={18} /></div><div><span className="label">{t(language, "level")} {player.level}</span><strong>{player.xp} <small>/ {xpForLevel(player.level)} XP</small></strong><div className="progress"><i style={{ width: `${levelProgress}%` }} /></div></div></div><div className="stat-card streak-card"><div className="stat-icon mint"><Flame size={18} /></div><div><span className="label">{t(language, "streak")}</span><strong>{player.streak} <small>{t(language, "days")}</small></strong><div className="streak-dots">{[1, 2, 3, 4, 5, 6, 7].map(d => <span key={d} className={d <= player.streak ? "filled" : ""}>{d === 7 ? "✦" : "·"}</span>)}</div></div></div></section>
    <section className="section-block"><div className="section-head"><div><span className="overline">{t(language, "todaysRoute")}</span><h2>{t(language, "routeTitle")}</h2></div><button className="text-btn" onClick={() => setPage("profile")}>{t(language, "yourStats")} <ChevronLeft size={15} /></button></div><div className="challenge-grid">{(["Memory", "Logic", "Attention", "Speed", "Pattern"] as GameType[]).map((type, index) => <div className="challenge-card" key={type} style={{ "--accent": typeMeta[type].color } as React.CSSProperties}><div className="challenge-number">0{index + 1}</div><div className="type-mark">{typeMeta[type].icon}</div><div><strong>{type}</strong><span>{index === 0 ? "Sequence recall" : index === 1 ? "Find the rule" : index === 2 ? "Spot the signal" : index === 3 ? "Trust your instinct" : "See what’s next"}</span></div><span className="check-circle">{player.dailyCompleted ? <Check size={14} /> : ""}</span></div>)}</div></section>
    <section className="return-card"><div><span className="overline">{t(language, "comeBack")}</span><h3>{t(language, "smallReps")}</h3><p>{t(language, "nextMilestone")} <b>Day 7</b>.</p></div><div className="calendar-mark"><span>DAY</span><strong>{String(player.streak + 1).padStart(2, "0")}</strong></div></section>
  </div>;
}

function PlayView({ language, game, current, question, total, selected, showHint, setShowHint, answer, totalScore, resetDaily, startGame, shareScore }: any) {
  if (game === "done") return <section className="result-screen"><div className="result-orb"><Sparkles size={28} /></div><span className="eyebrow">{t(language, "routeComplete")}</span><h1>{t(language, "niceWork")} <em>{t(language, "brain")}</em></h1><p>{t(language, "showedUp")}</p><div className="result-score"><span>YOUR SCORE</span><strong>{totalScore.toLocaleString()}</strong><small>+150 XP · +75 coins</small></div><div className="result-grid"><div><b>{answersLabel(totalScore)}</b><span>momentum</span></div><div><b>80%</b><span>accuracy</span></div><div><b>04:32</b><span>time</span></div></div><div className="result-actions"><button className="primary-cta" onClick={shareScore}><Share2 size={17} /> {t(language, "share")}</button><button className="secondary-cta" onClick={startGame}><RotateCcw size={16} /> {t(language, "playAgain")}</button><button className="ghost-btn" onClick={resetDaily}>{t(language, "backHome")}</button></div></section>;
  return <section className="play-screen"><div className="play-head"><button className="back-btn" onClick={resetDaily}><ChevronLeft size={19} /> {t(language, "exit")}</button><div className="play-progress">{[0,1,2,3,4].map(i => <span key={i} className={i < question ? "done" : i === question ? "current" : ""} />)}</div><span className="question-count">0{question + 1}/0{total}</span></div><div className="challenge-label" style={{ color: typeMeta[current.type as GameType].color }}><span>{typeMeta[current.type as GameType].icon}</span> {current.type.toUpperCase()}</div><h1 className="question-title">{current.prompt.split("\n").map((line: string) => <span key={line}>{line}</span>)}</h1><div className="answer-list">{current.options.map((option: string) => <button key={option} className={`answer-btn ${selected ? option === current.answer ? "correct" : option === selected ? "wrong" : "muted" : ""}`} onClick={() => answer(option)} disabled={!!selected}><span>{option}</span>{selected && option === current.answer && <Check size={17} />}</button>)}</div><button className="hint-btn" onClick={() => { setShowHint(!showHint); analytics.track("hint_used"); }}><CircleHelp size={16} /> {t(language, "hint")}? <b>{t(language, "hintLabel")}</b> <span>−25 coins</span></button>{showHint && <div className="hint-box">{current.hint}</div>}<div className="play-footer"><span><Pause size={14} /> {t(language, "takeTime")}</span><span><Zap size={14} /> {t(language, "basePoints")}</span></div></section>;
}
function answersLabel(score: number) { return score > 450 ? "Sharp form" : score > 250 ? "Good rhythm" : "Warm start"; }
function ProfileView({ language, player, levelProgress }: { language: Language; player: PlayerState; levelProgress: number }) { return <section className="profile-view"><div className="profile-header"><div className="avatar"><img src={mark} alt="" /></div><div><span className="overline">{t(language, "playerProfile")}</span><h1>{t(language, "profileTitle")}</h1><p>Level {player.level} · Learning in public</p></div><button className="icon-btn"><Settings size={18} /></button></div><div className="profile-level"><div className="level-line"><span>LEVEL {player.level}</span><b>{xpForLevel(player.level) - player.xp} XP to level up</b></div><div className="big-progress"><i style={{ width: `${levelProgress}%` }} /></div></div><div className="metric-grid"><Metric icon={<Trophy size={19} />} value={player.bestScore.toLocaleString()} label="Best score" /><Metric icon={<Flame size={19} />} value={player.bestStreak} label="Best streak" /><Metric icon={<TargetIcon />} value={`${player.accuracy}%`} label="Accuracy" /><Metric icon={<Gamepad2 size={19} />} value={player.gamesPlayed} label="Games played" /></div><div className="section-head compact"><div><span className="overline">{t(language, "achievements")}</span><h2>{t(language, "proof")}</h2></div><span className="badge-count">2 / 14</span></div><div className="achievement-list"><Achievement language={language} icon="✦" title="First spark" copy="Complete your first game" done /><Achievement language={language} icon="◒" title="Week one" copy="Keep a 7 day streak" done /><Achievement language={language} icon="ϟ" title="Quick thinker" copy="Finish a speed round under 30 sec" /></div></section>; }
function Metric({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) { return <div className="metric"><span>{icon}</span><b>{value}</b><small>{label}</small></div>; }
function TargetIcon() { return <span style={{ fontSize: 20 }}>◎</span>; }
function Achievement({ language, icon, title, copy, done }: { language: Language; icon: string; title: string; copy: string; done?: boolean }) { return <div className={`achievement ${done ? "done" : ""}`}><div className="achievement-icon">{done ? <Check size={17} /> : <Lock size={15} />}</div><div><b>{icon} {title}</b><span>{copy}</span></div>{done && <span className="earned">{t(language, "earned")}</span>}</div>; }
function StoreView({ language }: { language: Language }) { return <section className="store-view"><div className="store-hero"><span className="overline">{t(language, "shop")}</span><h1>{t(language, "invest")}<br /><em>{t(language, "focus")}</em></h1><p>{t(language, "optional")}</p></div><div className="store-tabs"><span className="active">{t(language, "featured")}</span><span>{t(language, "coins")}</span><span>{t(language, "themes")}</span></div><div className="product-grid"><Product icon="✦" title="Starter pack" copy="500 Mind Coins" price={t(language, "configReady")} featured /><Product icon="◉" title="Quiet mode" copy="Remove forced ads" price={t(language, "configReady")} /><Product icon="◒" title="Premium path" copy="Advanced stats + themes" price={t(language, "configReady")} /></div><div className="store-note"><Crown size={17} /> {t(language, "storeNote")}</div></section>; }
function Product({ icon, title, copy, price, featured }: { icon: string; title: string; copy: string; price: string; featured?: boolean }) { return <div className={`product ${featured ? "featured" : ""}`}><div className="product-icon">{icon}</div><div><b>{title}</b><span>{copy}</span></div><button>{price}</button></div>; }
function SettingsModal({ player, setPlayer, close }: { player: PlayerState; setPlayer: React.Dispatch<React.SetStateAction<PlayerState>>; close: () => void }) { return <div className="modal-backdrop" onClick={close}><div className="settings-modal" onClick={e => e.stopPropagation()}><div className="modal-head"><div><span className="overline">{t(player.language, "preferences")}</span><h2>{t(player.language, "makeYours")}</h2></div><button className="icon-btn" onClick={close}>×</button></div><SettingRow icon={<Globe2 size={18} />} title={t(player.language, "language")} value={player.language === "en" ? "English" : "العربية"} action={() => setPlayer(p => ({ ...p, language: p.language === "en" ? "ar" : "en" }))} /><SettingRow icon={player.sound ? <Volume2 size={18} /> : <VolumeX size={18} />} title={t(player.language, "sound")} value={player.sound ? t(player.language, "on") : t(player.language, "off")} action={() => setPlayer(p => ({ ...p, sound: !p.sound }))} /><SettingRow icon={<Moon size={18} />} title={t(player.language, "reducedMotion")} value={player.reducedMotion ? t(player.language, "on") : t(player.language, "off")} action={() => setPlayer(p => ({ ...p, reducedMotion: !p.reducedMotion }))} /><div className="consent-row"><div><b>{t(player.language, "privacy")}</b><span>{t(player.language, "privacyCopy")}</span></div><button className={`toggle ${player.consent ? "on" : ""}`} onClick={() => setPlayer(p => ({ ...p, consent: !p.consent }))}><i /></button></div><p className="modal-foot">{t(player.language, "privacyFoot")}</p></div></div>; }
function SettingRow({ icon, title, value, action }: { icon: React.ReactNode; title: string; value: string; action: () => void }) { return <button className="setting-row" onClick={action}><span className="setting-icon">{icon}</span><span><b>{title}</b><small>{value}</small></span><ChevronLeft size={17} /></button>; }

export default App;
