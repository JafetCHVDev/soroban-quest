import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-astronaut">🧑‍🚀</div>
      <h1 className="not-found-code">404</h1>
      <p className="not-found-title">Quest Not Found</p>
      <p className="not-found-sub">
        This sector of space is uncharted. The Quest you seek does not exist.
      </p>
      <Link to="/" className="btn btn-primary">
        ⬅ Return to Base
      </Link>
    </div>
  );
}
