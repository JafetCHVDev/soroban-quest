import React, { useEffect, useMemo, useState } from "react";
import { Copy, Link2, RefreshCcw, Users } from "lucide-react";
import CollaborationAvatar from "./CollaborationAvatar";
import {
  createCollaborationInvite,
  createCollaborationManager,
  readCollaborationRoom,
} from "../systems/collaboration";

const COLORS = ["#06d6a0", "#8b5cf6", "#f59e0b", "#3b82f6", "#ef4444"];
const styles = {
  bar: {
    alignItems: "center",
    background: "rgba(17, 24, 39, 0.82)",
    border: "1px solid rgba(6, 214, 160, 0.24)",
    borderRadius: "12px",
    display: "grid",
    gap: "0.8rem",
    gridTemplateColumns: "minmax(220px, 1fr) auto minmax(260px, auto)",
    padding: "0.85rem",
  },
  main: {
    alignItems: "center",
    display: "flex",
    gap: "0.7rem",
  },
  label: {
    color: "var(--text-muted, #94a3b8)",
    fontSize: "0.82rem",
    margin: 0,
  },
  peers: {
    alignItems: "center",
    display: "flex",
    gap: "0.35rem",
  },
  actions: {
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    gap: "0.45rem",
    justifyContent: "flex-end",
  },
  input: {
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.14)",
    borderRadius: "8px",
    color: "var(--text-primary, #f8fafc)",
    minHeight: "36px",
    padding: "0 0.65rem",
    width: "120px",
  },
  warning: {
    color: "var(--gold, #f59e0b)",
    fontSize: "0.8rem",
    fontWeight: 700,
  },
};

function createLocalUser() {
  const savedName =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("soroban_quest_collab_name")
      : "";
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return {
    id,
    name: savedName || `Player ${id.slice(0, 4)}`,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
}

export default function CollaborationBar({
  missionId,
  code,
  onCodeChange,
  managerFactory = createCollaborationManager,
}) {
  const [roomInput, setRoomInput] = useState(() => readCollaborationRoom());
  const [manager, setManager] = useState(null);
  const [status, setStatus] = useState({ connected: false, peerCount: 0 });
  const [peers, setPeers] = useState([]);
  const [copied, setCopied] = useState(false);
  const [conflict, setConflict] = useState(false);
  const user = useMemo(() => createLocalUser(), []);

  useEffect(() => {
    return () => manager?.destroy();
  }, [manager]);

  useEffect(() => {
    if (!manager || code === undefined || code === manager.getCode()) return;
    manager.setCode(code);
  }, [code, manager]);

  function startCollaboration(roomId = roomInput) {
    const nextManager = managerFactory({
      roomId,
      missionId,
      user,
      initialCode: code,
    });

    nextManager.on("status", setStatus);
    nextManager.on("peers", setPeers);
    nextManager.on("code", (nextCode) => {
      if (nextCode !== code) onCodeChange?.(nextCode);
    });
    nextManager.on("conflict", () => setConflict(true));
    nextManager.connect();

    manager?.destroy();
    setManager(nextManager);
    setStatus(nextManager.getStatus());
    setPeers(nextManager.getPeers());
    setRoomInput(nextManager.roomId);
  }

  async function copyInvite() {
    const roomId = manager?.roomId || roomInput || undefined;
    const invite = createCollaborationInvite(roomId);
    await navigator.clipboard?.writeText(invite);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="collaboration-bar" aria-label="Mission collaboration" style={styles.bar}>
      <div className="collaboration-bar-main" style={styles.main}>
        <Users size={18} aria-hidden="true" />
        <div>
          <strong>Co-op mission</strong>
          <p style={styles.label}>
            {status.connected
              ? `${status.peerCount} collaborator${status.peerCount === 1 ? "" : "s"} connected`
              : "Invite another player to sync this editor in real time"}
          </p>
        </div>
      </div>

      <div className="collaboration-peers" aria-label="Connected collaborators" style={styles.peers}>
        <CollaborationAvatar user={user} active />
        {peers.map((peer) => (
          <CollaborationAvatar key={peer.id || peer.name} user={peer} active={peer.editing} />
        ))}
      </div>

      {conflict && (
        <span className="collaboration-warning" role="status" style={styles.warning}>
          Remote edits merged. Review before running tests.
        </span>
      )}

      <div className="collaboration-actions" style={styles.actions}>
        <input
          value={roomInput}
          onChange={(event) => setRoomInput(event.target.value)}
          placeholder="Room code"
          aria-label="Collaboration room code"
          style={styles.input}
        />
        <button type="button" className="btn-secondary" onClick={() => startCollaboration()}>
          <Link2 size={16} aria-hidden="true" />
          {status.connected ? "Reconnect" : "Join"}
        </button>
        <button type="button" className="btn-secondary" onClick={copyInvite}>
          <Copy size={16} aria-hidden="true" />
          {copied ? "Copied" : "Invite"}
        </button>
        <button type="button" className="btn-ghost" onClick={() => manager?.reconnect()}>
          <RefreshCcw size={16} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
