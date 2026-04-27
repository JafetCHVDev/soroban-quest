import React, { useState, useEffect } from 'react';
import { missions } from '../data/missions';
import { loadProgress } from '../systems/storage';
import './SkillTree.css';

const conceptCategories = {
  Core: {
    title: 'Core Concepts',
    description: 'Fundamental Soroban building blocks',
    concepts: ['contract', 'contractimpl', 'Env', 'Symbol']
  },
  Storage: {
    title: 'Storage & State',
    description: 'Managing persistent data',
    concepts: ['storage', 'instance', 'persistent storage', 'set', 'get', 'remove', 'unwrap_or']
  },
  Types: {
    title: 'Data Types',
    description: 'Working with different data types',
    concepts: ['Address', 'Vec', 'Map', 'String', 'i128', 'u32', 'bool']
  },
  Auth: {
    title: 'Authorization',
    description: 'Access control and security',
    concepts: ['require_auth', 'init pattern', 'admin patterns']
  },
  Advanced: {
    title: 'Advanced Patterns',
    description: 'Complex contract patterns',
    concepts: ['token', 'mint', 'transfer', 'ledger sequence', 'time-lock', 'multi-sig', 'governance pattern', 'conditional panic', 'complex state', 'multiple functions']
  }
};

export default function SkillTree() {
  const [completedMissions, setCompletedMissions] = useState([]);
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [hoveredConcept, setHoveredConcept] = useState(null);

  useEffect(() => {
    const progress = loadProgress();
    setCompletedMissions(progress.completedMissions || []);
  }, []);

  const getConceptStatus = (concept) => {
    const teachingMission = missions.find(mission => 
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

  const renderConceptNode = (concept, categoryIndex, conceptIndex) => {
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
            <div className="tooltip-chapter">Chapter {mission.chapter}</div>
          </div>
        )}
      </div>
    );
  };

  const renderCategory = (categoryKey, categoryData, index) => {
    const concepts = categoryData.concepts;
    const unlockedCount = concepts.filter(concept => 
      getConceptStatus(concept).status === 'unlocked'
    ).length;
    const progress = (unlockedCount / concepts.length) * 100;

    return (
      <div key={categoryKey} className="skill-category">
        <div className="category-header">
          <h3 className="category-title">{categoryData.title}</h3>
          <div className="category-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="progress-text">{unlockedCount}/{concepts.length}</span>
          </div>
        </div>
        <p className="category-description">{categoryData.description}</p>
        <div className="concept-grid">
          {concepts.map((concept, conceptIndex) => {
            return renderConceptNode(concept, index, conceptIndex);
          })}
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
        <h1 className="skill-tree-title">Soroban Skill Tree</h1>
        <p className="skill-tree-subtitle">
          Track your mastery of Soroban smart contract concepts
        </p>
        <div className="overall-progress">
          <div className="progress-bar large">
            <div 
              className="progress-fill" 
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <span className="progress-text large">
            {totalUnlocked}/{totalConcepts} Concepts Mastered
          </span>
        </div>
      </div>

      <div className="skill-categories">
        {Object.entries(conceptCategories).map(([key, data], index) => {
          return renderCategory(key, data, index);
        })}
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
                <h4>Taught in: {selectedConcept.mission.title}</h4>
                <p><strong>Chapter:</strong> {selectedConcept.mission.chapter}</p>
                <p><strong>Difficulty:</strong> {selectedConcept.mission.difficulty}</p>
                <p><strong>XP Reward:</strong> {selectedConcept.mission.xpReward}</p>
                <div className="mission-learning-goal">
                  <strong>Learning Goal:</strong>
                  <p>{selectedConcept.mission.learningGoal}</p>
                </div>
                <div className="mission-status">
                  {completedMissions.includes(selectedConcept.mission.id) ? (
                    <span className="status-completed">✅ Completed</span>
                  ) : (
                    <span className="status-locked">🔒 Not yet completed</span>
                  )}
                </div>
                {!completedMissions.includes(selectedConcept.mission.id) && (
                  <a 
                    href={`/mission/${selectedConcept.mission.id}`}
                    className="start-mission-btn"
                  >
                    Start Mission
                  </a>
                )}
              </div>
            ) : (
              <p>This concept is not yet covered in available missions.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
