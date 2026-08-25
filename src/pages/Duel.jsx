import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Copy, Link2, Swords, UserRound, Wifi, X } from "lucide-react";
import { getAllMissions } from "../systems/missionLoader";
import { useGameState } from "../systems/GameStateContext";
import { createDuelInvite, createDuelState, DUEL_PHASES, DuelSession, readDuelRoom, transitionDuel } from "../systems/duelSession";
import { useTranslation } from "../i18n/useTranslation";
import useDocumentTitle from "../systems/useDocumentTitle";
import "./Duel.css";

export default function Duel() {
  useDocumentTitle("Speed Duel");
  const { profile, activeProfileId, progress, updateProgress } = useGameState();
  const { language } = useTranslation();
  const missions = getAllMissions(language);
  const [roomId, setRoomId] = useState(() => readDuelRoom() || "");
  const [missionId, setMissionId] = useState(missions[0]?.id || "");
  const [phase, setPhase] = useState(createDuelState());
  const [session, setSession] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [invite, setInvite] = useState("");
  const [copied, setCopied] = useState(false);
  const resultRecorded = useRef(false);

  useEffect(() => () => session?.destroy(), [session]);

  useEffect(() => {
    if (!session) return undefined;
    const unsubscribePeers = session.on("peers", (peers) => {
      const nextOpponent = peers[0] || null;
      setOpponent(nextOpponent);
      if (nextOpponent) setPhase((current) => transitionDuel(current, { type: "OPPONENT_JOINED" }));
      if (!nextOpponent && opponent && (phase.phase === DUEL_PHASES.IN_PROGRESS || phase.phase === DUEL_PHASES.COUNTDOWN)) {
        setPhase((current) => transitionDuel(current, { type: "FORFEIT", winnerId: activeProfileId }));
      }
    });
    const unsubscribeProgress = session.on("progress", (peer) => {
      setOpponent(peer);
      if (peer.phase === DUEL_PHASES.FINISHED && !resultRecorded.current) finishDuel(false);
    });
    return () => {
      unsubscribePeers();
      unsubscribeProgress();
    };
  }, [session, opponent, phase.phase, activeProfileId]);

  useEffect(() => {
    session?.publishPhase(phase.phase);
  }, [session, phase.phase]);

  useEffect(() => {
    if (phase.phase !== DUEL_PHASES.COUNTDOWN) return undefined;
    const timer = window.setInterval(() => setPhase((current) => transitionDuel(current, { type: "COUNTDOWN_TICK" })), 1000);
    return () => window.clearInterval(timer);
  }, [phase.phase]);

  useEffect(() => {
    if (!session || phase.phase !== DUEL_PHASES.IN_PROGRESS) return;
    session.publishProgress({ passed: progress.completedMissions.includes(missionId) ? 1 : 0 }, 1);
  }, [session, phase.phase, progress.completedMissions, missionId]);

  const startDuel = () => {
    const nextRoom = roomId.trim() || `duel-${Math.random().toString(36).slice(2, 8)}`;
    const nextSession = new DuelSession({
      roomId: nextRoom,
      missionId,
      user: { id: activeProfileId, name: profile.name, avatar: profile.avatar },
    });
    nextSession.connect();
    setRoomId(nextSession.roomId);
    setInvite(createDuelInvite(nextSession.roomId));
    setSession(nextSession);
    resultRecorded.current = false;
  };

  const finishDuel = (won) => {
    if (!session || resultRecorded.current) return;
    resultRecorded.current = true;
    setPhase(transitionDuel({ ...phase, phase: DUEL_PHASES.IN_PROGRESS }, { type: won ? "WIN" : "FORFEIT", playerId: activeProfileId, winnerId: won ? activeProfileId : null }));
    updateProgress({ ...progress, duelWins: (progress.duelWins || 0) + (won ? 1 : 0), duelLosses: (progress.duelLosses || 0) + (won ? 0 : 1) });
  };

  const copyInvite = async () => {
    await navigator.clipboard?.writeText(invite);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  if (session) {
    const isFinished = phase.phase === DUEL_PHASES.FINISHED || phase.phase === DUEL_PHASES.FORFEIT;
    const opponentPassed = opponent?.progress?.passed || 0;
    return (
      <main id="main-content" className="duel-page">
        <header className="duel-header"><p className="duel-kicker"><Swords size={16} /> Real-time competition</p><h1>Speed Duel</h1><p>Complete the same mission first. Your code stays private; only validation progress is shared.</p></header>
        <section className="duel-arena" aria-live="polite">
          <div className="duel-room"><span>Room <strong>{roomId}</strong></span><button type="button" className="icon-button" onClick={copyInvite} title="Copy invite link" aria-label="Copy invite link">{copied ? <Link2 size={18} /> : <Copy size={18} />}</button></div>
          {phase.phase === DUEL_PHASES.COUNTDOWN && <div className="duel-countdown"><span>Race begins in</span><strong>{phase.countdown}</strong></div>}
          {phase.phase === DUEL_PHASES.WAITING && <div className="duel-waiting"><Wifi size={28} /><h2>Waiting for an opponent</h2><p>Send the invite link to another player.</p><button type="button" className="btn btn-secondary" onClick={copyInvite}><Copy size={16} /> {copied ? "Copied" : "Copy invite"}</button></div>}
          {phase.phase === DUEL_PHASES.IN_PROGRESS && <div className="duel-race"><div className="duel-player"><span className="duel-avatar">{profile.avatar}</span><h2>{profile.name}</h2><div className="duel-progress"><span>Your progress</span><strong>{progress.completedMissions.includes(missionId) ? "1" : "0"}/1 checks</strong><div><i style={{ width: progress.completedMissions.includes(missionId) ? "100%" : "0%" }} /></div></div><Link className="btn btn-primary" to={`/mission/${missionId}?duel=${roomId}`}>Open mission workspace</Link><button type="button" className="btn btn-secondary" onClick={() => finishDuel(true)}>I completed the mission</button></div><div className="duel-vs">VS</div><div className="duel-player opponent"><span className="duel-avatar">{opponent?.avatar || "?"}</span><h2>{opponent?.name || "Opponent"}</h2><div className="duel-progress"><span>Opponent progress</span><strong>{opponentPassed}/{opponent?.progress?.total || 1} checks passing</strong><div><i style={{ width: `${opponentPassed ? 100 : 0}%` }} /></div></div></div></div>}
          {isFinished && <div className="duel-result"><span className="duel-result-icon">{phase.winnerId === activeProfileId ? "🏆" : "⚔️"}</span><h2>{phase.winnerId === activeProfileId ? "Victory" : phase.reason === "forfeit" ? "Duel forfeited" : "Defeat"}</h2><p>{phase.winnerId === activeProfileId ? "Your contract reached the finish line first." : "The race has ended."}</p><button type="button" className="btn btn-primary" onClick={() => { session.destroy(); setSession(null); setPhase(createDuelState()); }}>Return to lobby</button></div>}
          {!isFinished && phase.phase === DUEL_PHASES.IN_PROGRESS && <button type="button" className="duel-forfeit" onClick={() => finishDuel(false)}><X size={16} /> Forfeit duel</button>}
        </section>
      </main>
    );
  }

  return <main id="main-content" className="duel-page"><header className="duel-header"><p className="duel-kicker"><Swords size={16} /> Real-time competition</p><h1>Speed Duel</h1><p>Race another builder through the same Soroban mission. No shared editor, no code leaks.</p></header><section className="duel-lobby"><div className="duel-lobby-icon"><Swords size={28} /></div><h2>Start a duel</h2><label htmlFor="duel-mission">Mission</label><select id="duel-mission" value={missionId} onChange={(event) => setMissionId(event.target.value)}>{missions.map((mission) => <option key={mission.id} value={mission.id}>{mission.title}</option>)}</select><label htmlFor="duel-room">Room code <span>(optional)</span></label><input id="duel-room" value={roomId} onChange={(event) => setRoomId(event.target.value)} placeholder="Paste a room code to join" /><button type="button" className="btn btn-primary duel-start" onClick={startDuel}><UserRound size={17} /> Create or join room</button><p className="duel-lobby-note">Your profile: {profile.avatar} {profile.name} · {progress.duelWins || 0} wins · {progress.duelLosses || 0} losses</p></section></main>;
}