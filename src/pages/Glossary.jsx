import React, { useState, useMemo, useEffect } from "react";
import { glossaryTerms, categories } from "../data/glossary";

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function Glossary() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const debouncedSearch = useDebounce(search);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return glossaryTerms.filter((term) => {
      const matchesCategory =
        activeCategory === "All" || term.category === activeCategory;
      const matchesSearch =
        term.name.toLowerCase().includes(q) ||
        term.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [debouncedSearch, activeCategory]);

  return (
    <div className="glossary-page">
      <div className="glossary-header">
        <h1 className="section-title">
          📖 <span className="glossary-title-gradient">Soroban Glossary</span>
        </h1>
        <p className="section-subtitle">
          A central reference for all Soroban SDK concepts introduced across
          missions.
        </p>

        <input
          className="glossary-search"
          type="text"
          placeholder="Search concepts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="glossary-filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`glossary-filter-chip ${
                activeCategory === cat ? "active" : ""
              }`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="glossary-empty">No concepts match your search.</p>
      ) : (
        <div className="glossary-grid">
          {filtered.map((term) => (
            <div key={term.name} className="glossary-card">
              <div className="glossary-card-header">
                <span className="glossary-card-name">{term.name}</span>
                <span
                  className={`glossary-category-tag glossary-category-${term.category.toLowerCase()}`}
                >
                  {term.category}
                </span>
              </div>
              <p className="glossary-card-desc">{term.description}</p>
              <pre className="glossary-code">
                <code>{term.code}</code>
              </pre>
              <div className="glossary-card-missions">
                {term.missions.map((m) => (
                  <span key={m} className="concept-tag">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
