import React, { useState, useEffect, useMemo } from 'react';
import { missions, localizeMissions } from '../data/missions';
import { loadProgress } from '../systems/storage';
import { useTranslation } from '../i18n/useTranslation';
import './SkillTree.css';
import useDocumentTitle from '../systems/useDocumentTitle';

const conceptCategories: Record<string, { concepts: string[] }> = {
  Core: {
    concepts: ['contract', 'contractimpl', 'Env', 'Symbol']
  },
  Storage: {
    concepts: ['storage', 'instance', 'persistent storage', 'Map<Address, i128>', 'set', 'get', 'remove', 'unwrap_or', 'compound storage keys', 'pool management']
  },
  Types: {
    concepts: ['Address', 'Vec', 'Map', 'String', 'i128', 'u32', 'bool', 'allowance pattern']
  },
  Auth: {
    concepts: ['require_auth', 'init pattern', 'admin pattern', 'multi-party init', 'RBAC', 'role membership']
  },
  Events: {
    concepts: ['events', 'publish', 'event-driven design', 'Vec tracking']
  },
  Protocols: {
    concepts: ['token', 'mint', 'transfer', 'ledger sequence', 'time-lock', 'multi-sig', 'crowdfunding', 'deadline pattern', 'goal tracking', 'escrow pattern', 'dispute resolution', 'state machine', 'recurring billing', 'subscription state', 'cancel pattern']
  },
  DeFi: {
    concepts: ['flash loan', 'loan lifecycle', 'fee mechanism', 'oracle pattern', 'price feed', 'asset tracking', 'off-chain bridge', 'governance', 'proposal lifecycle', 'vote tallying', 'quorum logic']
  }
};

export default function SkillTree() {
  const { t, language } = useTranslation();
  useDocumentTitle('Skill Tree');
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [hoveredConcept, setHoveredConcept] = useState<string | null>(null);

  const localizedMissions = useMemo(
    () => localizeMissions(missions, language),
    [language],
  );

  useEffect(() => {
    const progress = loadProgress();
    setCompletedMissions(progress.completedMissions || []);
  }, []);

  const getConceptStatus = (concept: string) => {
    const teachingMission = localizedMissions.find(mission =>
      mission.conceptsIntroduced?.includes(concept)
    );

    if (!teachingMission) return { status: 'locked', mission: null };

    const isCompleted = completedMissions.includes(teachingMission.id);
    return {
      status: isCompleted ? 'mastered' : 'available',
      mission: teachingMission
    };
  };

  const getCategoryProgress = (categoryConcepts: string[]) => {
    const mastered = categoryConcepts.filter(
      c => getConceptStatus(c).status === 'mastered'
    ).length;
    return {
      mastered,
      total: categoryConcepts.length,
      percentage: Math.round((mastered / categoryConcepts.length) * 100)
    };
  };

  const allConcepts = Object.values(conceptCategories).flatMap(cat => cat.concepts);
  const overallMastered = allConcepts.filter(
    c => getConceptStatus(c).status === 'mastered'
  ).length;

  return (
    <div id="main-content" className="skill-tree-container">
      {/* Header */}
      <header className="skill-tree-header">
        <h1 className="skill-tree-title">{t("skillTree.title")}</h1>
        <p className="skill-tree-subtitle">
          {t("skillTree.subtitle")}
        </p>

        {/* Global Progress Bar */}
        <div className="overall-progress-card">
          <div className="overall-progress-header">
            <span>{t("skillTree.overallProgress")}</span>
            <span className="overall-progress-stats">
              {overallMastered} / {allConcepts.length} {t("skillTree.masteredCount")} ({Math.round((overallMastered / allConcepts.length) * 100)}%)
            </span>
          </div>
          <div className="overall-progress-bar">
            <div
              className="overall-progress-fill"
              style={{ width: `${(overallMastered / allConcepts.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Legend */}
      <div className="skill-tree-legend">
        <div className="legend-item">
          <span className="legend-dot mastered" />
          <span>{t("skillTree.legend.mastered")}</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot available" />
          <span>{t("skillTree.legend.available")}</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot locked" />
          <span>{t("skillTree.legend.locked")}</span>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="categories-grid">
        {Object.entries(conceptCategories).map(([category, { concepts }]) => {
          const catProgress = getCategoryProgress(concepts);

          return (
            <div key={category} className="category-card">
              <div className="category-header">
                <h3>{t(`skillTree.categories.${category}.title`, { fallback: category })}</h3>
                <span className="category-badge">
                  {catProgress.mastered}/{catProgress.total}
                </span>
              </div>

              <p className="category-description">
                {t(`skillTree.categories.${category}.description`)}
              </p>

              {/* Progress Bar for Category */}
              <div className="category-progress-bar">
                <div
                  className="category-progress-fill"
                  style={{ width: `${catProgress.percentage}%` }}
                />
              </div>

              {/* Concept Nodes Grid */}
              <div className="concept-nodes-grid">
                {concepts.map(concept => {
                  const { status, mission } = getConceptStatus(concept);
                  const isSelected = selectedConcept === concept;
                  const isHovered = hoveredConcept === concept;

                  return (
                    <div
                      key={concept}
                      className={`concept-node ${status} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
                      onClick={() => setSelectedConcept(isSelected ? null : concept)}
                      onMouseEnter={() => setHoveredConcept(concept)}
                      onMouseLeave={() => setHoveredConcept(null)}
                    >
                      <div className="node-icon">
                        {status === 'mastered' && '✓'}
                        {status === 'available' && '●'}
                        {status === 'locked' && '🔒'}
                      </div>
                      <span className="node-label">{concept}</span>

                      {/* Tooltip on Hover */}
                      {isHovered && mission && (
                        <div className="concept-tooltip">
                          <div className="tooltip-title">{concept}</div>
                          <div className="tooltip-mission">
                            {t("skillTree.taughtIn")}: <strong>{mission.title}</strong>
                          </div>
                          <div className="tooltip-status">
                            Status: <span className={`status-text ${status}`}>{t(`skillTree.status.${status}`)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Concept Detail Sidebar/Modal */}
      {selectedConcept && (() => {
        const { status, mission } = getConceptStatus(selectedConcept);
        return (
          <div className="concept-detail-overlay" onClick={() => setSelectedConcept(null)}>
            <div className="concept-detail-card" onClick={e => e.stopPropagation()}>
              <button
                className="close-btn"
                onClick={() => setSelectedConcept(null)}
              >
                ×
              </button>

              <h2>{selectedConcept}</h2>
              <div className={`detail-status-badge ${status}`}>
                {t(`skillTree.status.${status}`)}
              </div>

              {mission ? (
                <div className="detail-content">
                  <h3>{t("skillTree.detailModal.heading")}</h3>
                  <p><strong>{mission.title}</strong></p>
                  <p className="mission-goal">{mission.learningGoal}</p>

                  <div className="detail-actions">
                    <a
                      href={`/#/mission/${mission.id}`}
                      className="btn btn-primary"
                    >
                      {status === 'mastered' ? t("skillTree.reviewMission") : t("skillTree.startMission")}
                    </a>
                  </div>
                </div>
              ) : (
                <p>{t("skillTree.noMissionDetail")}</p>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
