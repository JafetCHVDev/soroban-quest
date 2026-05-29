import React, { useState, useEffect, useMemo } from 'react';
import { missions, localizeMissions } from '../data/missions';
import { loadProgress } from '../systems/storage';
import { useTranslation } from '../i18n/useTranslation';
import './SkillTree.css';

// Concept identifiers are kept untranslated — they're code-level tokens
// (e.g. `contract`, `Env`, `require_auth`) that appear verbatim in Rust.
// Only the category titles/descriptions and surrounding chrome are localized.
const conceptCategories = {
  Core: {
    concepts: ['contract', 'contractimpl', 'Env', 'Symbol']
  },
  Storage: {
    concepts: ['storage', 'instance', 'persistent storage', 'set', 'get', 'remove', 'unwrap_or']
  },
  Types: {
    concepts: ['Address', 'Vec', 'Map', 'String', 'i128', 'u32', 'bool']
  },
  Auth: {
    concepts: ['require_auth', 'init pattern', 'admin patterns']
  },
  Advanced: {
    concepts: ['token', 'mint', 'transfer', 'ledger sequence', 'time-lock', 'multi-sig', 'governance pattern', 'conditional panic', 'complex state', 'multiple functions']
  }
};

export default function SkillTree() {
  const { t, language } = useTranslation();
  const [completedMissions, setCompletedMissions] = useState([]);
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [hoveredConcept, setHoveredConcept] = useState(null);

  const localizedMissions = useMemo(
    () => localizeMissions(missions, language),
    [language],
  );

  useEffect(() => {
    const progress = loadProgress();
    setCompletedMissions(progress.completedMissions || []);
  }, []);

  const getConceptStatus = (concept) => {
    const teachingMission = localizedMissions.find(mission =>
      mission.conceptsIntroduced?.includes(concept)
    );

    if (!teachingMission) return { status: 'locked', mission: null };

    const isCompleted = completedMissions.includes(teachingMission.id);
    return {
      status: isCompleted ? 'unlocked' : 'locked',
      mission: teachingMission
    };
  };

  const handleConceptClick = (concept) => {
    const { mission } = getConceptStatus(concept);
    setSelectedConcept({ concept, mission });
  };

  const renderConceptNode = (concept) => {
    const { status, mission } = getConceptStatus(concept);
    const isHovered = hoveredConcept === concept;
    const isSelected = selectedConcept?.concept === concept;

    const nodeClass = `concept-node ${status} ${isHovered ? 'hovered' : ''} ${isSelected ? 'selected' : ''}`;

    return (
      <div
        key={concept}
        className={nodeClass}
        onClick={() => handleConceptClick(concept)}
        onMouseEnter={() => setHoveredConcept(concept)}
        onMouseLeave={() => setHoveredConcept(null)}
      >
        <div className="concept-icon">
          {status === 'locked' ? '🔒' : '✨'}
        </div>
        <div className="concept-name">{concept}</div>
        {isHovered && mission && (
          <div className="concept-tooltip">
            <div className="tooltip-mission">{mission.title}</div>
            <div className="tooltip-chapter">
              {t('skillTree.tooltip.chapter', { chapter: mission.chapter })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCategory = (categoryKey, categoryData) => {
    const concepts = categoryData.concepts;
    const unlockedCount = concepts.filter(concept =>
      getConceptStatus(concept).status === 'unlocked'
    ).length;
    const progressPct = (unlockedCount / concepts.length) * 100;

    return (
      <div key={categoryKey} className="skill-category">
        <div className="category-header">
          <h3 className="category-title">
            {t(`skillTree.categories.${categoryKey}.title`)}
          </h3>
          <div className="category-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="progress-text">
              {t('skillTree.categoryProgress', {
                unlocked: unlockedCount,
                total: concepts.length,
              })}
            </span>
          </div>
        </div>
        <p className="category-description">
          {t(`skillTree.categories.${categoryKey}.description`)}
        </p>
        <div className="concept-grid">
          {concepts.map(concept => renderConceptNode(concept))}
        </div>
      </div>
    );
  };

  const totalConcepts = Object.values(conceptCategories).reduce((sum, cat) => sum + cat.concepts.length, 0);
  const totalUnlocked = Object.values(conceptCategories).reduce((sum, cat) =>
    sum + cat.concepts.filter(concept => getConceptStatus(concept).status === 'unlocked').length, 0
  );
  const overallProgress = (totalUnlocked / totalConcepts) * 100;

  return (
    <div className="skill-tree">
      <div className="skill-tree-header">
        <h1 className="skill-tree-title">{t('skillTree.title')}</h1>
        <p className="skill-tree-subtitle">{t('skillTree.subtitle')}</p>
        <div className="overall-progress">
          <div className="progress-bar large">
            <div
              className="progress-fill"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <span className="progress-text large">
            {t('skillTree.overall', { unlocked: totalUnlocked, total: totalConcepts })}
          </span>
        </div>
      </div>

      <div className="skill-categories">
        {Object.entries(conceptCategories).map(([key, data]) =>
          renderCategory(key, data)
        )}
      </div>

      {selectedConcept && (
        <div className="concept-detail-modal" onClick={() => setSelectedConcept(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedConcept(null)}
            >
              ×
            </button>
            <h3 className="modal-title">{selectedConcept.concept}</h3>
            {selectedConcept.mission ? (
              <div className="mission-info">
                <h4>{t('skillTree.modal.taughtIn', { title: selectedConcept.mission.title })}</h4>
                <p><strong>{t('skillTree.modal.chapterLabel')}</strong> {selectedConcept.mission.chapter}</p>
                <p>
                  <strong>{t('skillTree.modal.difficultyLabel')}</strong>{' '}
                  {t(`difficulty.${selectedConcept.mission.difficulty}`)}
                </p>
                <p><strong>{t('skillTree.modal.xpLabel')}</strong> {selectedConcept.mission.xpReward}</p>
                <div className="mission-learning-goal">
                  <strong>{t('skillTree.modal.learningGoal')}</strong>
                  <p>{selectedConcept.mission.learningGoal}</p>
                </div>
                <div className="mission-status">
                  {completedMissions.includes(selectedConcept.mission.id) ? (
                    <span className="status-completed">{t('skillTree.modal.completed')}</span>
                  ) : (
                    <span className="status-locked">{t('skillTree.modal.notCompleted')}</span>
                  )}
                </div>
                {!completedMissions.includes(selectedConcept.mission.id) && (
                  <a
                    href={`/mission/${selectedConcept.mission.id}`}
                    className="start-mission-btn"
                  >
                    {t('skillTree.modal.startMission')}
                  </a>
                )}
              </div>
            ) : (
              <p>{t('skillTree.modal.notCovered')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
