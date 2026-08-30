import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, CheckCircle, Clock, Trophy, Filter } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import { useGameState } from '../systems/GameStateContext';
import { missions } from '../data/missions';
import { theoryQuests } from '../data/theoryQuests';
import './Quests.css';

export default function Quests() {
  const { t, language } = useTranslation();
  const { progress } = useGameState();

  const allMissions = [...(missions || []), ...(theoryQuests || [])].map((item) => ({
    ...item,
    type: item.type || 'mission',
    title: item.i18n?.[language]?.title || item.i18n?.en?.title || item.title || item.id,
    description: item.i18n?.[language]?.story || item.i18n?.en?.story || item.story || '',
    path: item.type === 'theory' ? `/theory/${item.id}` : `/mission/${item.id}`,
  }));

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [completionStatus, setCompletionStatus] = useState('all');

  const getLocalizedMission = (mission) => {
    const langData = mission.i18n?.[language] || mission.i18n?.en || {};
    return {
      title: langData.title || mission.id,
      description: langData.story || langData.description || '',
    };
  };

  const uniqueCampaigns = useMemo(() => {
    const campaignsSet = new Set(allMissions.map((m) => m.campaign || m.chapter).filter(Boolean));
    return Array.from(campaignsSet);
  }, [allMissions]);

  const filteredMissions = useMemo(() => {
    return allMissions.filter((mission) => {
      const { title, description } = getLocalizedMission(mission);
      const matchesSearch =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        description.toLowerCase().includes(searchQuery.toLowerCase());

      const campaignKey = mission.campaign || String(mission.chapter);
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
          <Trophy className="quests-title-icon" size={28} /> {t('quests.title', 'Quest Catalog')}
        </h1>
        <p>{t('quests.subtitle', 'Browse, search, and filter all available missions.')}</p>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="quests-filters">
        <div className="quests-search-wrapper">
          <Search className="quests-search-icon" size={18} />
          <input
            type="text"
            placeholder={t('quests.searchPlaceholder', 'Search missions...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="quests-input"
          />
        </div>

        <select
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          className="quests-select"
        >
          <option value="all">{t('quests.allCampaigns', 'All Campaigns')}</option>
          {uniqueCampaigns.map((campaign) => (
            <option key={campaign} value={campaign}>
              Chapter {campaign}
            </option>
          ))}
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="quests-select"
        >
          <option value="all">{t('quests.allDifficulties', 'All Difficulties')}</option>
          <option value="beginner">{t('quests.beginner', 'Beginner')}</option>
          <option value="intermediate">{t('quests.intermediate', 'Intermediate')}</option>
          <option value="advanced">{t('quests.advanced', 'Advanced')}</option>
        </select>

        <select
          value={completionStatus}
          onChange={(e) => setCompletionStatus(e.target.value)}
          className="quests-select"
        >
          <option value="all">{t('quests.allStatus', 'All Status')}</option>
          <option value="completed">{t('quests.completed', 'Completed')}</option>
          <option value="incomplete">{t('quests.incomplete', 'Incomplete')}</option>
        </select>
      </div>

      <div className="quests-grid">
        {filteredMissions.map((mission) => {
          const { title } = getLocalizedMission(mission);
          const isCompleted = mission.completed || progress.completedMissions?.includes(mission.id);
          const campaignBadgeText = mission.campaign || `Chapter ${mission.chapter || 1}`;

          return (
            <Link key={mission.id} to={mission.path} className="quest-card">
              <div className="quest-card-top">
                <span className="quest-campaign-badge">{mission.type === 'theory' ? 'Theory' : campaignBadgeText}</span>
                {isCompleted && (
                  <span className="quest-completed-badge">
                    <CheckCircle size={14} /> {t('quests.done', 'Completed')}
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
          <p>{t('quests.noResults', 'No missions found matching your criteria.')}</p>
        </div>
      )}
    </div>
  );
}
