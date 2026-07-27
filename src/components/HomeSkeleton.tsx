import React from "react";

export default function HomeSkeleton() {
  return (
    <div className="home-skeleton">
      {/* Hero Section Skeleton */}
      <section className="hero-skeleton">
        <div className="fade-in" style={{ animationDelay: "0s", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <div className="skeleton" style={{ width: "120px", height: "24px", borderRadius: "20px" }} />
          <div className="skeleton" style={{ width: "60%", height: "48px" }} />
          <div className="skeleton" style={{ width: "40%", height: "48px" }} />
          <div className="skeleton" style={{ width: "70%", height: "20px" }} />
        </div>

        {/* Buttons Skeleton */}
        <div className="fade-in" style={{ animationDelay: "0.2s", display: "flex", gap: "1rem", marginTop: "2rem" }}>
          <div className="skeleton" style={{ width: "160px", height: "44px", borderRadius: "8px" }} />
          <div className="skeleton" style={{ width: "160px", height: "44px", borderRadius: "8px" }} />
        </div>

        {/* Stats Skeleton */}
        <div className="fade-in" style={{ animationDelay: "0.4s", display: "flex", gap: "3rem", marginTop: "3rem" }}>
          <div className="skeleton" style={{ width: "60px", height: "40px" }} />
          <div className="skeleton" style={{ width: "60px", height: "40px" }} />
          <div className="skeleton" style={{ width: "60px", height: "40px" }} />
        </div>
      </section>

      {/* Features Section Skeleton */}
      <section className="features-section-skeleton">
        <div className="fade-in" style={{ animationDelay: "0.5s", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
          <div className="skeleton" style={{ width: "200px", height: "32px" }} />
          <div className="skeleton" style={{ width: "400px", height: "20px" }} />
        </div>

        {/* Feature Cards Grid Skeleton */}
        <div className="fade-in" style={{ animationDelay: "0.7s", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "16px" }}>
              <div className="skeleton" style={{ width: "48px", height: "48px", borderRadius: "10px" }} />
              <div className="skeleton" style={{ width: "80%", height: "24px" }} />
              <div className="skeleton" style={{ width: "100%", height: "16px" }} />
              <div className="skeleton" style={{ width: "90%", height: "16px" }} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
