import React from "react";

export default function CollaborationAvatar({ user, active = false }) {
  const initial = user?.name?.trim()?.[0]?.toUpperCase() || "?";
  const style = {
    "--avatar-color": user?.color || "#06d6a0",
    alignItems: "center",
    background: "color-mix(in srgb, var(--avatar-color) 18%, transparent)",
    border: "1px solid var(--avatar-color)",
    borderRadius: "999px",
    boxShadow: active ? "0 0 16px color-mix(in srgb, var(--avatar-color) 42%, transparent)" : "none",
    color: "var(--text-primary, #f8fafc)",
    display: "inline-flex",
    fontSize: "0.72rem",
    fontWeight: 800,
    height: "28px",
    justifyContent: "center",
    width: "28px",
  };

  return (
    <span
      className={`collaboration-avatar ${active ? "active" : ""}`}
      title={user?.name || "Collaborator"}
      aria-label={`${user?.name || "Collaborator"} ${active ? "is editing" : "is connected"}`}
      style={style}
    >
      {initial}
    </span>
  );
}
