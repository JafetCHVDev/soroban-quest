import React, { CSSProperties, ReactElement } from "react";

/**
 * User representation for collaboration
 */
interface CollaborationUser {
  id: string;
  name: string;
  color?: string;
}

/**
 * CollaborationAvatar component props
 */
interface CollaborationAvatarProps {
  /** User information to display */
  user: CollaborationUser;
  /** Whether the user is currently active/editing */
  active?: boolean;
}

/**
 * CollaborationAvatar component
 * Displays a user avatar for collaboration features with optional active state
 *
 * @param {CollaborationAvatarProps} props - Component props
 * @returns {ReactElement} Avatar badge for collaborator
 */
export default function CollaborationAvatar({ user, active = false }: CollaborationAvatarProps): ReactElement {
  const initial = user?.name?.trim()?.[0]?.toUpperCase() || "?";
  const style: CSSProperties = {
    // @ts-expect-error - CSS custom properties
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
