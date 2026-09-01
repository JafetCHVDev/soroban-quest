import React, { useState, useMemo, ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Search, CheckCircle, Clock, Trophy, Filter } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import { useGameState } from '../systems/GameStateContext';
import { missions } from '../data/missions';
import type { Mission } from '../types/game';
import { theoryQuests, type TheoryQuest } from '../data/theoryQuests';
import './Quests.css';

interface QuestItem {
  id: string;
  type: string;
  campaign?: string | number;
  chapter?: number;
  difficulty?: string;
  completed?: boolean;
  xpReward?: number;
  title: string;
  description: string;
  path: string;
}

export default function Quests(): ReactElement {
  const { t, language } = useTranslation();
  const { progress } = useGameState();

  const allMissions: QuestItem[] = [...(missions || []), ...(theoryQuests || [])].map((item: Mission | TheoryQuest) => ({
    id: item.id,
    type: item.type || 'mission',
    campaign: 'campaign' in item ? item.campaign : undefined,
    chapter: item.chapter,
    difficulty: item.difficulty,
    completed: 'completed' in item ? item.completed : undefined,
    xpReward: item.xpReward,
    title: item.i18n?.[language]?.title || item.i18n?.en?.title || (item as unknown as Record<string, unknown>).title || item.id,
    description: item.i18n?.[language]?.story || item.i18n?.en?.story || (item as unknown as Record<string, unknown>).story || '',
    path: item.type === 'theory' ? `/theory/${item.id}` : `/mission/${item.id}`,
  }));

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [completionStatus, setCompletionStatus] = useState<string>('all');

  const getLocalizedMission = (mission: QuestItem): { title: string; description: string } => {
    return {
      title: mission.title,
      description: mission.description,
    };
  };

  const hasStandaloneMissions = useMemo(() => allMissions.some((m) => m.standalone), [allMissions]);

  const uniqueCampaigns = useMemo(() => {
    const campaignsSet = new Set(
      allMissions.filter((m) => !m.standalone).map((m) => m.campaign || m.chapter).filter(Boolean),
    );
    return Array.from(campaignsSet).map(String);
  }, [allMissions]);

  const filteredMissions = useMemo(() => {
    return allMissions.filter((mission) => {
      const { title, description } = getLocalizedMission(mission);
      const matchesSearch =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        description.toLowerCase().includes(searchQuery.toLowerCase());

      const campaignKey = mission.standalone ? 'standalone' : mission.campaign || String(mission.chapter);
      const matchesCampaign =
        selectedCampaign === 'all' || campaignKey === String(selectedCampaign);

      const matchesDifficulty =
        selectedDifficulty === 'all' || mission.difficulty === selectedDifficulty;

      const isCompleted = mission.completed || progress.completedMissions?.includes(mission.id);
      const matchesCompletion =
        completionStatus === 'all' ||
        (completionStatus === 'completed' && isCompleted) ||
        (completionStatus === 'incomplete' && !isCompleted);

      return matchesSearch && matchesCampaign && matchesDifficulty && matchesCompletion;
    });
  }, [
    allMissions,
    searchQuery,
    selectedCampaign,
    selectedDifficulty,
    completionStatus,
    progress,
    language,
  ]);

  return (
    <div id="main-content" className="quests-container">
      {/* Page Header */}
      <div className="quests-header">
        <h1>
          <Trophy className="quests-title-icon" size={28} /> {t('quests.title')}
        </h1>
        <p>{t('quests.subtitle')}</p>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="quests-filters">
        <div className="quests-search-wrapper">
          <Search className="quests-search-icon" size={18} />
          <input
            type="text"
            placeholder={t('quests.searchPlaceholder')}
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setSearchQuery(e.target.value)}
            className="quests-input"
          />
        </div>

        <select
          value={selectedCampaign}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => setSelectedCampaign(e.target.value)}
          className="quests-select"
        >
          <option value="all">{t('quests.allCampaigns')}</option>
          {uniqueCampaigns.map((campaign) => (
            <option key={campaign} value={campaign}>
              Chapter {campaign}
            </option>
          ))}
          {hasStandaloneMissions && <option value="standalone">{t('quests.standalone', 'Standalone')}</option>}
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => setSelectedDifficulty(e.target.value)}
          className="quests-select"
        >
          <option value="all">{t('quests.allDifficulties')}</option>
          <option value="beginner">{t('quests.beginner')}</option>
          <option value="intermediate">{t('quests.intermediate')}</option>
          <option value="advanced">{t('quests.advanced')}</option>
        </select>

        <select
          value={completionStatus}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => setCompletionStatus(e.target.value)}
          className="quests-select"
        >
          <option value="all">{t('quests.allStatus')}</option>
          <option value="completed">{t('quests.completed')}</option>
          <option value="incomplete">{t('quests.incomplete')}</option>
        </select>
      </div>

      <div className="quests-grid">
        {filteredMissions.map((mission) => {
          const { title } = getLocalizedMission(mission);
          const isCompleted = mission.completed || progress.completedMissions?.includes(mission.id);
          const campaignBadgeText = mission.standalone
            ? 'Standalone'
            : mission.campaign || `Chapter ${mission.chapter || 1}`;

          return (
            <Link key={mission.id} to={mission.path} className="quest-card">
              <div className="quest-card-top">
                <span
                  className="quest-campaign-badge"
                  style={
                    mission.standalone
                      ? {
                          background: 'rgba(6,214,160,0.15)',
                          border: '1px solid rgba(6,214,160,0.4)',
                          color: 'var(--cyan)',
                        }
                      : undefined
                  }
                >
                  {mission.type === 'theory' ? 'Theory' : campaignBadgeText}
                </span>
                {isCompleted && (
                  <span className="quest-completed-badge">
                    <CheckCircle size={14} /> {t('quests.done')}
                  </span>
                )}
              </div>

              <h3 className="quest-card-title">{title}</h3>

              <div className="quest-card-footer">
                <span className="quest-difficulty">
                  <Clock size={14} /> {mission.difficulty || 'Beginner'}
                </span>
                <span className="quest-xp">+{mission.xpReward || 100} XP</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredMissions.length === 0 && (
        <div className="quests-empty">
          <Filter className="quests-empty-icon" size={40} />
          <p>{t('quests.noResults')}</p>
        </div>
      )}
    </div>
  );
}
