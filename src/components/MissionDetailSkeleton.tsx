import React from "react";

export default function MissionDetailSkeleton() {
  return (
    <div className="mission-detail-skeleton">
      <div className="container">
        {/* Story Skeleton */}
        <div className="fade-in" style={{ animationDelay: "0s", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div className="skeleton" style={{ width: "60px", height: "16px" }} />
          <div className="skeleton" style={{ width: "40px", height: "16px", marginLeft: "0.5rem" }} />
          <div className="skeleton" style={{ width: "80%", height: "14px" }} />
          <div className="skeleton" style={{ width: "70%", height: "14px" }} />
          <div className="skeleton" style={{ width: "90%", height: "14px" }} />
        </div>

        {/* Editor Skeleton */}
        <div className="skeleton fade-in" style={{ animationDelay: "0.3s", height: "200px" }} />

        {/* Terminal Skeleton */}
        <div className="skeleton fade-in" style={{ animationDelay: "0.6s", height: "120px" }} />
      </div>
    </div>
  );
}